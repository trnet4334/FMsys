# Login System Design — Production Grade

**Date:** 2026-03-29
**Status:** Draft
**Scope:** Authentication, registration, session management, Passkey, email verification

---

## 1. Overview

FMsys requires a production-grade login system for a financial management platform. The system must support email+password authentication with mandatory MFA, Passkey as a password replacement, and robust session management with multi-device control.

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth methods (launch) | Email+Password+MFA, Passkey | Core flows first; OAuth (Google/Apple) deferred |
| Session strategy | Stateful (PostgreSQL) | Financial system needs instant session revocation |
| Password hashing | Argon2id (Node 24 built-in) | Zero dependencies, `crypto.hash` native support |
| Email service | Resend | Cleanest API, React Email integration, good free tier |
| Passkey role | Replaces password + MFA | Passkey is inherently two-factor (possession + biometric) |

### Deployment Assumptions

- Single API server instance (no load balancer). In-memory rate limiting is acceptable.
- When horizontal scaling is needed, rate limiting should move to Redis or PostgreSQL.

### Out of Scope

- OAuth (Google/Apple) — deferred to membership system phase
- SMS-based MFA — TOTP only
- Admin panel / user management dashboard
- Account deletion / GDPR flows

---

## 2. Architecture

```
┌─────────────┐     cookie      ┌──────────────┐    SQL     ┌────────────┐
│   Next.js   │ ──────────────→ │   API Server │ ────────→ │ PostgreSQL │
│  Middleware  │  fm_sid         │   (Node.js)  │           │            │
│  (route     │ ←────────────── │              │           │  sessions  │
│   guard)    │   session state │  authService │           │  users     │
└─────────────┘                 │  passkeyServ │           │  audit     │
                                │  emailServ   │           │  webauthn  │
       ↑                        └──────┬───────┘           └────────────┘
       │                               │
  ┌────┴──────┐                  ┌─────┴──────┐
  │  Frontend │                  │   Resend   │
  │  Auth UI  │                  │  (email)   │
  └───────────┘                  └────────────┘
```

### Backend Modules

| Module | Responsibility | Location |
|--------|---------------|----------|
| `authService.js` | Registration, login, MFA, session CRUD (DB-backed) | `apps/api/src/` |
| `passkeyService.js` | WebAuthn registration + assertion | `apps/api/src/` |
| `emailService.js` | Verification, password reset, anomaly alerts (Resend) | `apps/api/src/` |
| `security.js` | Argon2id hash, TOTP, rate limiting, CSRF validation | `apps/api/src/` |
| `sessionRepository.js` | Session DB access (CRUD + cleanup) | `apps/api/src/` |
| `userRepository.js` | User DB access | `apps/api/src/` |

### Frontend Modules

| Module | Responsibility | Location |
|--------|---------------|----------|
| `auth-client.js` | Fetch wrapper for all auth endpoints | `apps/web/src/lib/` |
| `middleware.ts` | Route protection + session validation via API | `apps/web/` |

---

## 3. Two State Machines

Registration progress and session authentication are tracked separately.

### Account Status (on `user_auth_profiles`)

Tracks registration progress. Persists across sessions.

```
pending_verification → active
                       active → suspended (admin action)
```

| Status | Meaning | Allowed Actions |
|--------|---------|----------------|
| `pending_verification` | Email not yet verified | Verify email, resend verification |
| `active` | Fully set up, can log in | All auth operations |
| `suspended` | Admin-suspended | None (login rejected) |

A user reaches `active` only after: email verified + password set + MFA configured.

### Session State (on `auth_sessions`)

Tracks authentication progress within a single login attempt. Ephemeral.

```
pre_mfa → authenticated
mfa_setup → authenticated
```

| State | Meaning | Allowed Actions |
|-------|---------|----------------|
| `pre_mfa` | Password verified, awaiting MFA | MFA verify only |
| `mfa_setup` | First-time MFA setup (registration) | MFA setup + verify only |
| `authenticated` | Fully authenticated | All protected endpoints |

Sessions are only created after a successful password verification or Passkey assertion. The registration steps before password setup (email verification) are token-gated, not session-gated.

---

## 4. Registration Flow

```
User → Fill email
     → POST /register
     → API checks email uniqueness (always returns { ok: true })
     → Creates pending user (account_status: pending_verification)
     → Creates verification token (email_verification, 15min TTL)
     → Sends verification email via Resend

User → Clicks email link
     → GET /verify-email?token=xxx
     → API validates token, marks email_verified = true
     → Generates new token (password_setup, 15min TTL) — verification token consumed
     → Redirect → /setup-password?token=yyy

User → Sets password
     → POST /setup-password { token, password }
     → API: validate token → Argon2id hash → store password_hash
     → Consume setup token → set account_status = active
     → Create session (mfa_setup state) → Set-Cookie
     → Redirect → /mfa/setup

User → Scans QR code, enters TOTP code
     → POST /mfa/setup/verify { code }
     → API: validate TOTP → store encrypted mfa_secret → mfa_enabled = true
     → Session → authenticated
     → Generate 8 recovery codes, display once, store as Argon2id hashes
     → Redirect → /dashboard
```

### Token Lifecycle

Tokens are **generated** in one step and **consumed** in the next. A token is consumed only when the action it gates completes successfully:

- `email_verification` token: generated at registration, consumed when email is verified
- `password_setup` token: generated at email verification, consumed when password is set
- `password_reset` token: generated at forgot-password, consumed when password is reset

If a user's browser crashes mid-flow, the unconsumed token remains valid until TTL expires. The user can click the email link again or request a new one.

### Recovery Codes

During MFA setup, the system generates 8 single-use recovery codes:

- Each code: 8 alphanumeric characters, grouped as `XXXX-XXXX`
- Stored as Argon2id hashes in a `recovery_codes` table
- Displayed once during setup — user must save them
- Each code can be used once to bypass TOTP (then marked consumed)
- If all codes are used, user must contact support or use Passkey

### Security Notes

- Email exists? Always return `{ ok: true }` — prevents email enumeration.
- Verification token: `crypto.randomBytes(32)`, base64url encoded, 15-minute TTL.
- Password setup page does not expose the email; only the token.

---

## 5. Login Flows

### Path A — Email + Password + MFA

```
1. POST /auth/login { email, password }
   → Validate Argon2id hash
   ├── Fail → increment rate limit counter, return "Invalid credentials"
   └── Pass → create session (pre_mfa), Set-Cookie, redirect → /mfa

2. POST /auth/mfa/verify { code }
   → Validate TOTP (or recovery code)
   ├── Fail → increment rate limit (shared 5-attempt limit with login)
   └── Pass → session → authenticated, redirect → /dashboard

3. Anomaly detection
   → Compare IP + User-Agent against known_devices (past 90 days)
   → New device/location → send alert email via Resend
```

### Path B — Passkey

```
1. Click "Sign in with Passkey"
   POST /auth/passkey/assert/options
   → Return challenge (60s TTL, stored in webauthn_challenges table) + allowCredentials

2. Browser triggers navigator.credentials.get()
   → User completes biometric/PIN

3. POST /auth/passkey/assert/verify
   → Verify signature + challenge + counter
   → Create session (authenticated) — skips MFA entirely
   → Set-Cookie, redirect → /dashboard
   → Anomaly detection (same as Path A)
```

### Passkey Registration (Settings Page)

```
1. POST /auth/passkey/register/options → challenge (60s TTL) + user info
2. Browser triggers navigator.credentials.create() → biometric/PIN
3. POST /auth/passkey/register/verify → validate attestation, store credential
```

### Password Reset

```
1. POST /auth/forgot-password { email }
   → Always return { ok: true }
   → If email exists: generate reset token (15min TTL), send email

2. Click email link → /reset-password?token=xxx
   POST /auth/reset-password { token, newPassword }
   → Validate token → Argon2id hash → update password
   → Revoke ALL sessions for this user (force re-login)
   → Redirect → /login
```

### Password Change (Settings Page, Authenticated)

```
POST /auth/change-password { currentPassword, newPassword }
→ Verify currentPassword against stored hash
→ Argon2id hash newPassword → update password_hash
→ Revoke all OTHER sessions (keep current)
→ Return { ok: true }
```

---

## 6. Session Management

### Session Data Model

```sql
auth_sessions
├── session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid()  -- matches existing schema
├── user_id         UUID NOT NULL           -- FK → user_auth_profiles
├── session_state   VARCHAR(32) NOT NULL    -- 'pre_mfa' | 'mfa_setup' | 'authenticated'
├── ip_address      INET
├── user_agent      TEXT
├── device_label    TEXT                    -- parsed from user_agent
├── created_at      TIMESTAMPTZ NOT NULL
├── last_active_at  TIMESTAMPTZ NOT NULL    -- updated on every request
├── expires_at      TIMESTAMPTZ NOT NULL    -- hard expiry: 24h
├── idle_timeout_at TIMESTAMPTZ NOT NULL    -- soft expiry: 30min idle
```

### Session Validation Query

All session lookups must include expiry checks as the **primary defense**, not rely on cleanup:

```sql
SELECT * FROM auth_sessions
WHERE session_id = $1
  AND session_state = 'authenticated'
  AND expires_at > NOW()
  AND idle_timeout_at > NOW()
```

### Lifecycle

```
Create → Active → Expired (auto-cleanup)
  │        │
  │        ├── idle 30min → expired (rejected at query time)
  │        ├── hard limit 24h → expired (rejected at query time)
  │        └── every request → update last_active_at + reset idle_timeout_at
  │
  ├── User logout → delete session
  ├── Remote logout → delete specific session
  └── Revoke all → delete all user sessions (except current)
```

### Multi-Device Management API

```
GET    /api/v1/auth/sessions              → list active sessions (mark current)
DELETE /api/v1/auth/sessions/:id          → remote logout specific device
POST   /api/v1/auth/sessions/revoke-all   → revoke all except current
```

### Anomaly Detection

Matching uses IP subnet + UA family (not exact string) to reduce false positives from browser updates:

```javascript
import { parseUA } from './ua-parser.js'; // extract browser family + OS

const knownDevices = await getRecentDevices(userId, 90);
const currentUA = parseUA(userAgent); // { browser: 'Chrome', os: 'macOS' }
const currentSubnet = ipToSubnet(ip);  // /24 for IPv4, /48 for IPv6

const isNewDevice = !knownDevices.some(d =>
  d.ip_subnet === currentSubnet && d.ua_family === currentUA.browser
);

if (isNewDevice) {
  await emailService.sendNewDeviceAlert(user.email, {
    device: `${currentUA.browser} · ${currentUA.os}`,
    ip,
    time: new Date(),
  });
}
```

### Cookie Specification

| Cookie | Value | HttpOnly | Secure | SameSite | Max-Age | Path |
|--------|-------|----------|--------|----------|---------|------|
| `fm_sid` | session_id (UUID) | Yes | Yes (prod) | Lax | 86400 (24h) | `/` |

Max-Age matches the session hard TTL so cookie and DB session expire together. Replaces both `fm_session_id` and `fm_session_state`. Middleware validates session state by calling the API with `fm_sid` — no client-side state cookie to forge.

### Session Cleanup Job

Secondary measure to reclaim disk space (primary defense is query-time expiry checks):

```
Every 10 minutes (setInterval in API server):
DELETE FROM auth_sessions
WHERE expires_at < NOW() OR idle_timeout_at < NOW()
```

---

## 7. CSRF Protection

SameSite=Lax alone does not protect all POST requests. The API server validates the `Origin` header on all state-changing requests:

```javascript
// In server.js request dispatch, before routing
function validateOrigin(req) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return true;
  const origin = req.headers['origin'];
  const allowed = new Set([
    'http://localhost:4010',
    'http://127.0.0.1:4010',
    process.env.WEBAUTHN_ORIGIN, // production origin
  ].filter(Boolean));
  return origin && allowed.has(origin);
}
```

Requests without a valid `Origin` header are rejected with `403 Forbidden`.

---

## 8. Rate Limiting

| Layer | Limit | Lockout | Storage |
|-------|-------|---------|---------|
| IP (global) | 20 req/min | Block 1 minute | In-memory Map |
| IP (email-sending) | 3 emails/hour per IP | Soft reject | In-memory Map |
| Per-address (email) | 1 email/5min per target | Dedup, no error | In-memory Map |
| Account (login) | 5 failed attempts | Lock 15 minutes | DB `lockout_until` column |

Email-specific rate limits prevent abuse of registration and password reset endpoints.

---

## 9. Password Policy

| Rule | Value |
|------|-------|
| Minimum length | 12 characters |
| Complexity | At least uppercase + lowercase + digit (no special char required) |
| Hashing | Argon2id via `crypto.hash` (Node 24) |
| Argon2id params | memoryCost: 65536 (64 MiB), timeCost: 3, parallelism: 1 |

---

## 10. Database Schema Changes

New migration: `003_auth_production_schema.sql`

All types align with existing migration 002 (UUID for IDs, TIMESTAMPTZ for timestamps).

```sql
-- Extend user_auth_profiles (002 already has: user_id UUID PK, primary_email, auth_provider,
-- provider_user_id, mfa_enabled, mfa_secret, lockout_count, locked_until, created_at, updated_at)
ALTER TABLE user_auth_profiles
  ADD COLUMN password_hash     TEXT,
  ADD COLUMN email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN account_status    TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (account_status IN ('pending_verification', 'active', 'suspended')),
  ADD COLUMN failed_attempts   INTEGER NOT NULL DEFAULT 0;

-- Rename 002's lockout_count → keep as-is (use failed_attempts for login flow,
-- lockout_count remains for backwards compat; can be dropped in a future migration)

-- Update session_state CHECK to include mfa_setup
ALTER TABLE auth_sessions DROP CONSTRAINT IF EXISTS auth_sessions_session_state_check;
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_session_state_check
  CHECK (session_state IN ('pre_mfa', 'mfa_setup', 'authenticated'));

-- Add session columns
ALTER TABLE auth_sessions
  ADD COLUMN ip_address      INET,
  ADD COLUMN user_agent      TEXT,
  ADD COLUMN device_label    TEXT,
  ADD COLUMN last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN idle_timeout_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes';

-- Auth tokens (verification, password reset, password setup)
CREATE TABLE auth_tokens (
  token_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_value     TEXT NOT NULL UNIQUE,           -- crypto.randomBytes(32), base64url
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  token_type      TEXT NOT NULL
    CHECK (token_type IN ('email_verification', 'password_setup', 'password_reset')),
  expires_at      TIMESTAMPTZ NOT NULL,
  consumed_at     TIMESTAMPTZ,                    -- null = unused
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auth_tokens_value ON auth_tokens(token_value);
CREATE INDEX idx_auth_tokens_user ON auth_tokens(user_id);

-- Recovery codes (MFA backup)
CREATE TABLE recovery_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  code_hash       TEXT NOT NULL,                  -- Argon2id hash of the code
  consumed_at     TIMESTAMPTZ,                    -- null = unused
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recovery_codes_user ON recovery_codes(user_id);

-- Extend webauthn_credentials (002 already has: sign_count, transports, attestation_format)
ALTER TABLE webauthn_credentials
  ADD COLUMN device_name     TEXT,
  ADD COLUMN last_used_at    TIMESTAMPTZ;

-- Known devices (anomaly detection)
CREATE TABLE known_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  ip_subnet       TEXT NOT NULL,                  -- /24 for IPv4, /48 for IPv6
  ua_family       TEXT NOT NULL,                  -- browser family e.g. 'Chrome'
  device_label    TEXT,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_known_devices_user ON known_devices(user_id);

-- WebAuthn challenges (short-lived, but DB-backed for consistency)
CREATE TABLE webauthn_challenges (
  challenge_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_auth_profiles(user_id), -- null for assertion without email
  challenge       TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('registration', 'assertion')),
  expires_at      TIMESTAMPTZ NOT NULL,           -- NOW() + 60 seconds
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### token_type Values

| Type | Used For | TTL |
|------|----------|-----|
| `email_verification` | Registration email verification | 15 min |
| `password_setup` | Set password after email verification | 15 min |
| `password_reset` | Forgot password flow | 15 min |

---

## 11. API Routes

```
# Registration
POST   /api/v1/auth/register              Register (send verification email)
GET    /api/v1/auth/verify-email           Verify email token
POST   /api/v1/auth/setup-password         Set password (registration flow)
POST   /api/v1/auth/mfa/setup             First-time TOTP setup (return QR data + recovery codes)
POST   /api/v1/auth/mfa/setup/verify      Verify first-time TOTP setup

# Login
POST   /api/v1/auth/login                 Email + Password login
POST   /api/v1/auth/mfa/verify            MFA verification (TOTP or recovery code)

# Passkey
POST   /api/v1/auth/passkey/register/options   Registration challenge
POST   /api/v1/auth/passkey/register/verify    Registration verification
POST   /api/v1/auth/passkey/assert/options     Login challenge
POST   /api/v1/auth/passkey/assert/verify      Login verification

# Password
POST   /api/v1/auth/forgot-password       Request password reset
POST   /api/v1/auth/reset-password         Reset password
POST   /api/v1/auth/change-password        Change password (authenticated)

# Session Management
GET    /api/v1/auth/sessions              List active sessions
DELETE /api/v1/auth/sessions/:id          Remote logout
POST   /api/v1/auth/sessions/revoke-all   Revoke all sessions (except current)
POST   /api/v1/auth/logout                Logout current session
```

Note: Existing stub routes `/api/v1/passkeys/*` (returning 501) will be removed and replaced with the `/api/v1/auth/passkey/*` routes above.

---

## 12. Frontend Pages

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/login` | Email+Password or Passkey login | No |
| `/register` | Enter email to register | No |
| `/verify-email` | Email verification callback | No |
| `/setup-password` | Set password after verification | No (token-gated) |
| `/mfa/setup` | First-time TOTP QR code + recovery codes | Session (mfa_setup) |
| `/mfa` | MFA verification during login | Session (pre_mfa) |
| `/forgot-password` | Request password reset | No |
| `/reset-password` | Reset password form | No (token-gated) |
| `/settings/security` | Sessions, Passkey, change password | Authenticated |

---

## 13. External Dependencies

### New npm Packages

| Package | Purpose | Install Location |
|---------|---------|-----------------|
| `resend` | Email sending | `apps/api` |
| `@simplewebauthn/server` | WebAuthn server-side verification | `apps/api` |
| `otpauth` | TOTP URI generation + verification | `apps/api` |
| `pg` | PostgreSQL client | `apps/api` |

### No Additional Frontend Dependencies

QR code rendered via `<img>` loading a server-generated data URL.

### Environment Variables

```env
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/fmsys

# Resend
RESEND_API_KEY=re_xxxx
EMAIL_FROM=noreply@fmsys.app

# WebAuthn
WEBAUTHN_RP_ID=fmsys.app
WEBAUTHN_RP_NAME=FMsys
WEBAUTHN_ORIGIN=https://fmsys.app
WEBAUTHN_CHALLENGE_TTL_MS=60000

# Auth
AUTH_SESSION_TTL_MS=86400000
AUTH_SESSION_IDLE_MS=1800000
AUTH_TOKEN_TTL_MS=900000
MFA_ENCRYPTION_KEY=<32-byte-hex-key>
```

---

## 14. Security Checklist

| Item | Implementation |
|------|---------------|
| Password storage | Argon2id (memoryCost: 65536, timeCost: 3, parallelism: 1) |
| Session ID | UUID v4 via `gen_random_uuid()` |
| Auth tokens | `crypto.randomBytes(32)`, base64url, one-time use, TTL-bound |
| Cookie | HttpOnly + Secure (prod) + SameSite=Lax + Max-Age=86400 |
| CSRF | SameSite=Lax + Origin header validation on all state-changing requests |
| Email enumeration | All responses return `{ ok: true }` regardless |
| TOTP secret | AES-256 encrypted at rest via `MFA_ENCRYPTION_KEY` |
| MFA recovery | 8 single-use Argon2id-hashed recovery codes |
| Rate limiting | IP + Account dual-layer + email-specific limits |
| SQL injection | All queries parameterized |
| Passkey replay | Challenge 60s TTL + signature counter verification |
| Password reset | Revokes all sessions, forces re-login |
| Password change | Requires current password, revokes other sessions |
| Audit trail | All auth events written to `auth_audit_events` |

---

## 15. Migration Path from Current System

The existing in-memory auth system will be replaced incrementally:

1. **Add `pg` dependency** and database connection pooling
2. **Run migration `003`** to extend schema
3. **Replace in-memory Maps** in `authService.js` with `userRepository.js` + `sessionRepository.js`
4. **Update `security.js`** — add Argon2id hashing, CSRF Origin validation, keep TOTP + AES
5. **Add new modules** — `passkeyService.js`, `emailService.js`
6. **Update `authRoutes.js`** — add new routes, modify existing ones, remove old passkey stubs
7. **Update frontend `auth-client.js`** — new endpoints, remove `fm_session_state` cookie usage
8. **Update `middleware.ts`** — validate via API using `fm_sid` only
9. **Add frontend pages** — register, verify-email, setup-password, mfa/setup, forgot/reset-password, settings/security
