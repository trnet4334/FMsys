# Login System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-memory auth system with a production-grade PostgreSQL-backed login system supporting email+password+MFA, Passkey, session management, and email notifications.

**Architecture:** Stateful sessions stored in PostgreSQL with UUID session IDs in HttpOnly cookies. Backend is plain Node.js (no frameworks) with parameterized SQL. Frontend is Next.js 15 with middleware route guards validated via API calls.

**Tech Stack:** Node.js 24, PostgreSQL (`pg`), Resend (email), `@simplewebauthn/server` (Passkey), `otpauth` (TOTP), `node:test` (testing)

**Spec:** `docs/superpowers/specs/2026-03-29-login-system-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `db/migrations/003_auth_production_schema.sql` | Schema extensions (tokens, recovery codes, known devices, etc.) |
| `apps/api/src/db.js` | PostgreSQL connection pool (`pg.Pool`) |
| `apps/api/src/userRepository.js` | User CRUD (parameterized SQL) |
| `apps/api/src/sessionRepository.js` | Session CRUD + cleanup + multi-device listing |
| `apps/api/src/tokenRepository.js` | Auth token CRUD (verification, reset, setup) |
| `apps/api/src/emailService.js` | Resend integration (verification, reset, anomaly alerts) |
| `apps/api/src/passkeyService.js` | WebAuthn registration + assertion |
| `apps/api/src/recoveryCodeService.js` | Generate, hash, verify recovery codes |
| `apps/api/src/csrfGuard.js` | Origin header validation for state-changing requests |
| `apps/web/app/register/page.tsx` | Registration page |
| `apps/web/app/verify-email/page.tsx` | Email verification callback |
| `apps/web/app/setup-password/page.tsx` | Password setup (token-gated) |
| `apps/web/app/mfa/setup/page.tsx` | First-time TOTP + recovery codes |
| `apps/web/app/forgot-password/page.tsx` | Request password reset |
| `apps/web/app/reset-password/page.tsx` | Reset password form |
| `apps/web/app/settings/security/page.tsx` | Session management, Passkey, change password |
| `tests/db-pool.test.js` | DB connection pool tests |
| `tests/user-repository.test.js` | User repository tests |
| `tests/session-repository.test.js` | Session repository tests |
| `tests/token-repository.test.js` | Token repository tests |
| `tests/registration-flow.test.js` | End-to-end registration flow tests |
| `tests/login-flow.test.js` | End-to-end login flow tests |
| `tests/passkey-flow.test.js` | Passkey registration + assertion tests |
| `tests/password-reset-flow.test.js` | Password reset flow tests |
| `tests/session-management.test.js` | Multi-device session management tests |
| `tests/csrf-guard.test.js` | CSRF Origin validation tests |
| `tests/rate-limiting.test.js` | Rate limiting + lockout tests |

### Modified Files

| File | Changes |
|------|---------|
| `apps/api/package.json` | Add `pg`, `resend`, `@simplewebauthn/server`, `otpauth` dependencies |
| `apps/api/src/security.js` | Add Argon2id hashing, password validation, remove unused JWT |
| `apps/api/src/authService.js` | Replace in-memory Maps with repository calls, add registration flow |
| `apps/api/src/authRoutes.js` | Add new routes, remove old passkey stubs, add CSRF guard |
| `apps/api/src/authConfig.js` | Add new config keys (DB, Resend, WebAuthn, MFA encryption) |
| `apps/api/src/server.js` | Add CSRF guard to request pipeline |
| `apps/web/src/lib/auth-client.js` | New endpoints, replace dual cookie with `fm_sid` |
| `apps/web/middleware.ts` | Validate via API call instead of cookie state |
| `apps/web/app/login/page.tsx` | Add Passkey button, update to use new auth-client |
| `apps/web/app/mfa/page.tsx` | Add recovery code option |

---

## Task 1: Database Connection Pool + Migration

**Files:**
- Create: `apps/api/src/db.js`
- Create: `db/migrations/003_auth_production_schema.sql`
- Modify: `apps/api/package.json`
- Test: `tests/db-pool.test.js`

- [ ] **Step 1: Add `pg` dependency**

```bash
cd apps/api && npm install pg
```

- [ ] **Step 2: Write failing test for db pool**

```javascript
// tests/db-pool.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

test('createPool returns a pool with query method', async () => {
  const { createPool } = await import('../apps/api/src/db.js');
  const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
  assert.equal(typeof pool.query, 'function');
  assert.equal(typeof pool.end, 'function');
  await pool.end();
});

test('pool can execute a simple query', async () => {
  const { createPool } = await import('../apps/api/src/db.js');
  const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
  const result = await pool.query('SELECT 1 AS val');
  assert.equal(result.rows[0].val, 1);
  await pool.end();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/db-pool.test.js`
Expected: FAIL — module not found

- [ ] **Step 4: Implement db.js**

```javascript
// apps/api/src/db.js
import pg from 'pg';

export function createPool(connectionString) {
  const pool = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on('error', (err) => {
    console.error('[db] Unexpected pool error:', err.message);
  });

  return pool;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/db-pool.test.js`
Expected: PASS (requires running PostgreSQL with `fmsys_test` database)

- [ ] **Step 6: Write migration 003**

Copy the SQL from spec Section 10 into `db/migrations/003_auth_production_schema.sql`. This extends tables from migration 002 with:
- `user_auth_profiles`: password_hash, email_verified, account_status, failed_attempts
- `auth_sessions`: ip_address, user_agent, device_label, last_active_at, idle_timeout_at + updated CHECK constraint
- New tables: `auth_tokens`, `recovery_codes`, `known_devices`, `webauthn_challenges`
- `webauthn_credentials`: device_name, last_used_at

- [ ] **Step 7: Run migration against test DB**

```bash
psql $DATABASE_URL -f db/migrations/001_init_snapshot_schema.sql
psql $DATABASE_URL -f db/migrations/002_auth_gateway_schema.sql
psql $DATABASE_URL -f db/migrations/003_auth_production_schema.sql
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/package.json apps/api/src/db.js db/migrations/003_auth_production_schema.sql tests/db-pool.test.js package-lock.json
git commit -m "feat: add PostgreSQL connection pool and auth production migration"
```

---

## Task 2: User Repository

**Files:**
- Create: `apps/api/src/userRepository.js`
- Test: `tests/user-repository.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
// tests/user-repository.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createUserRepository } from '../apps/api/src/userRepository.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');

test.after(() => pool.end());

test('createUser inserts a pending_verification user', async () => {
  const repo = createUserRepository(pool);
  const user = await repo.create({ email: `test-${Date.now()}@example.com` });
  assert.ok(user.user_id);
  assert.equal(user.account_status, 'pending_verification');
  assert.equal(user.email_verified, false);
});

test('findByEmail returns null for non-existent email', async () => {
  const repo = createUserRepository(pool);
  const user = await repo.findByEmail('nonexistent@example.com');
  assert.equal(user, null);
});

test('findByEmail returns user for existing email', async () => {
  const repo = createUserRepository(pool);
  const email = `find-${Date.now()}@example.com`;
  await repo.create({ email });
  const found = await repo.findByEmail(email);
  assert.equal(found.primary_email, email);
});

test('setPassword stores hash and activates account', async () => {
  const repo = createUserRepository(pool);
  const email = `pwd-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.setPassword(user.user_id, 'hashed-value');
  const updated = await repo.findById(user.user_id);
  assert.equal(updated.password_hash, 'hashed-value');
  assert.equal(updated.account_status, 'active');
});

test('verifyEmail sets email_verified to true', async () => {
  const repo = createUserRepository(pool);
  const email = `verify-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.verifyEmail(user.user_id);
  const updated = await repo.findById(user.user_id);
  assert.equal(updated.email_verified, true);
});

test('incrementFailedAttempts and resetFailedAttempts', async () => {
  const repo = createUserRepository(pool);
  const email = `lock-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.incrementFailedAttempts(user.user_id);
  const after = await repo.findById(user.user_id);
  assert.equal(after.failed_attempts, 1);
  await repo.resetFailedAttempts(user.user_id);
  const reset = await repo.findById(user.user_id);
  assert.equal(reset.failed_attempts, 0);
});

test('lockAccount sets lockout_until', async () => {
  const repo = createUserRepository(pool);
  const email = `lockout-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  const until = new Date(Date.now() + 900_000);
  await repo.lockAccount(user.user_id, until);
  const locked = await repo.findById(user.user_id);
  assert.ok(locked.locked_until);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/user-repository.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement userRepository.js**

```javascript
// apps/api/src/userRepository.js
export function createUserRepository(pool) {
  return {
    async create({ email }) {
      const { rows } = await pool.query(
        `INSERT INTO user_auth_profiles (user_id, primary_email, auth_provider, account_status)
         VALUES (gen_random_uuid(), $1, 'email', 'pending_verification')
         RETURNING *`,
        [email]
      );
      return rows[0];
    },

    async findByEmail(email) {
      const { rows } = await pool.query(
        'SELECT * FROM user_auth_profiles WHERE primary_email = $1',
        [email]
      );
      return rows[0] ?? null;
    },

    async findById(userId) {
      const { rows } = await pool.query(
        'SELECT * FROM user_auth_profiles WHERE user_id = $1',
        [userId]
      );
      return rows[0] ?? null;
    },

    async verifyEmail(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET email_verified = TRUE, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    async setPassword(userId, passwordHash) {
      await pool.query(
        `UPDATE user_auth_profiles SET password_hash = $1, account_status = 'active', updated_at = NOW() WHERE user_id = $2`,
        [passwordHash, userId]
      );
    },

    async activateAccount(userId) {
      await pool.query(
        `UPDATE user_auth_profiles SET account_status = 'active', updated_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    },

    async setMfaSecret(userId, encryptedSecret) {
      await pool.query(
        'UPDATE user_auth_profiles SET mfa_secret = $1, mfa_enabled = TRUE, updated_at = NOW() WHERE user_id = $2',
        [encryptedSecret, userId]
      );
    },

    async incrementFailedAttempts(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET failed_attempts = failed_attempts + 1, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    async resetFailedAttempts(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    async lockAccount(userId, until) {
      await pool.query(
        'UPDATE user_auth_profiles SET locked_until = $1, updated_at = NOW() WHERE user_id = $2',
        [until, userId]
      );
    },

    async updatePassword(userId, passwordHash) {
      await pool.query(
        'UPDATE user_auth_profiles SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [passwordHash, userId]
      );
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/user-repository.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/userRepository.js tests/user-repository.test.js
git commit -m "feat: add user repository with parameterized SQL"
```

---

## Task 3: Session Repository

**Files:**
- Create: `apps/api/src/sessionRepository.js`
- Test: `tests/session-repository.test.js`

- [ ] **Step 1: Write failing tests**

Tests should cover: `create`, `findValid` (with expiry checks), `touch` (update last_active_at + reset idle), `delete`, `findAllByUser`, `revokeAllExcept`, `deleteExpired`.

Key test: `findValid` must return `null` for sessions where `expires_at < NOW()` or `idle_timeout_at < NOW()` — this is the primary expiry defense.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/session-repository.test.js`
Expected: FAIL

- [ ] **Step 3: Implement sessionRepository.js**

Factory function `createSessionRepository(pool, config)` returning:
- `create({ userId, state, ip, userAgent, deviceLabel })` — INSERT with TTLs from config
- `findValid(sessionId)` — SELECT with `expires_at > NOW() AND idle_timeout_at > NOW()`
- `updateState(sessionId, newState)` — UPDATE session_state
- `touch(sessionId, idleMs)` — UPDATE last_active_at = NOW(), idle_timeout_at = NOW() + interval
- `delete(sessionId)` — DELETE by ID
- `findAllByUser(userId)` — SELECT all valid sessions for a user (for multi-device management)
- `revokeAllExcept(userId, keepSessionId)` — DELETE all user sessions except one
- `revokeAll(userId)` — DELETE all user sessions
- `deleteExpired()` — DELETE WHERE expires_at < NOW() OR idle_timeout_at < NOW()

Follow the parameterized SQL pattern from `packages/shared/src/snapshotRepository.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/session-repository.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/sessionRepository.js tests/session-repository.test.js
git commit -m "feat: add session repository with expiry-checked queries"
```

---

## Task 4: Token Repository

**Files:**
- Create: `apps/api/src/tokenRepository.js`
- Test: `tests/token-repository.test.js`

- [ ] **Step 1: Write failing tests**

Tests should cover: `create` (with type + TTL), `findValid` (by token_value, not expired, not consumed), `consume` (set consumed_at), expired tokens return null, consumed tokens return null.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement tokenRepository.js**

Factory function `createTokenRepository(pool)` returning:
- `create({ userId, type, ttlMs })` — Generate `crypto.randomBytes(32)` as base64url, INSERT, return token_value
- `findValid(tokenValue)` — SELECT WHERE token_value = $1 AND consumed_at IS NULL AND expires_at > NOW()
- `consume(tokenId)` — UPDATE SET consumed_at = NOW()
- `deleteExpired()` — DELETE WHERE expires_at < NOW()

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/tokenRepository.js tests/token-repository.test.js
git commit -m "feat: add auth token repository"
```

---

## Task 5: Security Module Updates (Argon2id + CSRF Guard)

**Files:**
- Modify: `apps/api/src/security.js`
- Create: `apps/api/src/csrfGuard.js`
- Test: `tests/csrf-guard.test.js`

- [ ] **Step 1: Write failing test for CSRF guard**

```javascript
// tests/csrf-guard.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrigin } from '../apps/api/src/csrfGuard.js';

const allowed = ['http://localhost:4010', 'http://127.0.0.1:4010'];

test('GET requests always pass', () => {
  assert.equal(validateOrigin('GET', null, allowed), true);
});

test('POST with valid origin passes', () => {
  assert.equal(validateOrigin('POST', 'http://localhost:4010', allowed), true);
});

test('POST with invalid origin fails', () => {
  assert.equal(validateOrigin('POST', 'http://evil.com', allowed), false);
});

test('POST with missing origin fails', () => {
  assert.equal(validateOrigin('POST', null, allowed), false);
});

test('DELETE with valid origin passes', () => {
  assert.equal(validateOrigin('DELETE', 'http://127.0.0.1:4010', allowed), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement csrfGuard.js**

```javascript
// apps/api/src/csrfGuard.js
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function validateOrigin(method, origin, allowedOrigins) {
  if (SAFE_METHODS.has(method)) return true;
  return origin != null && allowedOrigins.includes(origin);
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add Argon2id functions to security.js**

Add to `apps/api/src/security.js`:

```javascript
import crypto from 'node:crypto';
const { hash, verify } = crypto;

export async function hashPassword(password) {
  return await hash('argon2id', password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(password, storedHash) {
  // Node 24 crypto.hash embeds salt+params in the output string.
  // Use crypto.verify to compare — it extracts the salt from storedHash
  // and re-hashes the candidate, then does a constant-time comparison.
  return await verify('argon2id', password, storedHash);
}

export function validatePasswordPolicy(password) {
  if (password.length < 12) return { ok: false, error: 'Password must be at least 12 characters' };
  if (!/[a-z]/.test(password)) return { ok: false, error: 'Password must contain a lowercase letter' };
  if (!/[A-Z]/.test(password)) return { ok: false, error: 'Password must contain an uppercase letter' };
  if (!/[0-9]/.test(password)) return { ok: false, error: 'Password must contain a digit' };
  return { ok: true };
}
```

Note: `crypto.hash` in Node 24 returns a string that embeds the salt and parameters. `crypto.verify('argon2id', password, storedHash)` extracts the salt/params from `storedHash` and does constant-time comparison. If `crypto.verify` is not yet available in your Node version, fall back to re-hashing with extracted params and `timingSafeEqual`.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/security.js apps/api/src/csrfGuard.js tests/csrf-guard.test.js
git commit -m "feat: add Argon2id password hashing and CSRF origin guard"
```

---

## Task 6: Email Service (Resend)

**Files:**
- Create: `apps/api/src/emailService.js`
- Modify: `apps/api/package.json` (add `resend`)

- [ ] **Step 1: Install resend**

```bash
cd apps/api && npm install resend
```

- [ ] **Step 2: Implement emailService.js**

```javascript
// apps/api/src/emailService.js
import { Resend } from 'resend';

export function createEmailService(config) {
  const resend = new Resend(config.resendApiKey);
  const from = config.emailFrom;
  const appUrl = config.appUrl; // e.g. https://fmsys.app or http://localhost:4010

  return {
    async sendVerificationEmail(email, tokenValue) {
      const url = `${appUrl}/verify-email?token=${tokenValue}`;
      await resend.emails.send({
        from,
        to: email,
        subject: 'Verify your FMsys account',
        html: `<p>Click the link below to verify your email:</p><p><a href="${url}">Verify Email</a></p><p>This link expires in 15 minutes.</p>`,
      });
    },

    async sendPasswordResetEmail(email, tokenValue) {
      const url = `${appUrl}/reset-password?token=${tokenValue}`;
      await resend.emails.send({
        from,
        to: email,
        subject: 'Reset your FMsys password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${url}">Reset Password</a></p><p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
      });
    },

    async sendNewDeviceAlert(email, { device, ip, time }) {
      await resend.emails.send({
        from,
        to: email,
        subject: 'New device sign-in to FMsys',
        html: `<p>A new device signed in to your FMsys account:</p><ul><li>Device: ${device}</li><li>IP: ${ip}</li><li>Time: ${time.toISOString()}</li></ul><p>If this wasn't you, change your password immediately.</p>`,
      });
    },
  };
}
```

- [ ] **Step 3: Write tests with mock Resend client**

```javascript
// tests/email-service.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

test('sendVerificationEmail calls resend with correct params', async () => {
  const sentEmails = [];
  // Mock Resend by monkey-patching the import or using dependency injection
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  // createEmailService accepts an optional resendClient for testing
  const mockClient = { emails: { send: async (params) => { sentEmails.push(params); return { id: 'test' }; } } };
  const svc = createEmailService({ resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' }, mockClient);
  await svc.sendVerificationEmail('user@test.com', 'abc123');
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'user@test.com');
  assert.match(sentEmails[0].html, /abc123/);
  assert.match(sentEmails[0].subject, /verify/i);
});

test('sendNewDeviceAlert includes device details', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = { emails: { send: async (params) => { sentEmails.push(params); return { id: 'test' }; } } };
  const svc = createEmailService({ resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' }, mockClient);
  await svc.sendNewDeviceAlert('user@test.com', { device: 'Chrome/Mac', ip: '1.2.3.4', time: new Date() });
  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].html, /Chrome/);
  assert.match(sentEmails[0].html, /1\.2\.3\.4/);
});
```

Update `createEmailService` to accept optional `resendClient` parameter for test injection:

```javascript
export function createEmailService(config, resendClient) {
  const resend = resendClient ?? new Resend(config.resendApiKey);
  // ... rest unchanged
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/email-service.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/package.json apps/api/src/emailService.js tests/email-service.test.js package-lock.json
git commit -m "feat: add email service with Resend integration"
```

---

## Task 7: Recovery Code Service

**Files:**
- Create: `apps/api/src/recoveryCodeService.js`
- Test: `tests/recovery-code-service.test.js`

- [ ] **Step 1: Write failing tests**

Tests should cover: `generate()` returns 8 codes in `XXXX-XXXX` format, `storeHashes(userId, codes)` inserts 8 rows, `verify(userId, code)` returns true for valid unused code and marks it consumed, `verify` returns false for already-consumed code.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement recoveryCodeService.js**

- `generate()` — Generate 8 random alphanumeric codes using `crypto.randomBytes`, format as `XXXX-XXXX`
- `storeHashes(pool, userId, codes)` — Hash each code with Argon2id, INSERT into `recovery_codes`
- `verify(pool, userId, candidateCode)` — Fetch all unconsumed codes for user, compare each hash, consume the match
- `deleteAll(pool, userId)` — DELETE all codes for user (used when regenerating)

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/recoveryCodeService.js tests/recovery-code-service.test.js
git commit -m "feat: add MFA recovery code generation and verification"
```

---

## Task 8: Auth Config Updates

**Files:**
- Modify: `apps/api/src/authConfig.js`

- [ ] **Step 1: Add new config keys**

Extend `loadAuthConfig(env)` to read:

```javascript
database: {
  url: env.DATABASE_URL || 'postgresql://localhost:5432/fmsys',
},
resend: {
  apiKey: env.RESEND_API_KEY || '',
  emailFrom: env.EMAIL_FROM || 'noreply@fmsys.app',
},
webauthn: {
  rpId: env.WEBAUTHN_RP_ID || 'localhost',
  rpName: env.WEBAUTHN_RP_NAME || 'FMsys',
  origin: env.WEBAUTHN_ORIGIN || 'http://localhost:4010',
  challengeTtlMs: parseInt(env.WEBAUTHN_CHALLENGE_TTL_MS || '60000', 10),
},
mfa: {
  ...existing,
  encryptionKey: env.MFA_ENCRYPTION_KEY || '',
},
session: {
  ...existing,
  idleMs: parseInt(env.AUTH_SESSION_IDLE_MS || '1800000', 10),
},
app: {
  url: env.APP_URL || 'http://localhost:4010',
  allowedOrigins: [
    'http://localhost:4010',
    'http://127.0.0.1:4010',
    env.WEBAUTHN_ORIGIN,
  ].filter(Boolean),
},
```

- [ ] **Step 2: Write config tests**

```javascript
// tests/auth-config.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAuthConfig } from '../apps/api/src/authConfig.js';

test('defaults are sensible when no env vars set', () => {
  const config = loadAuthConfig({});
  assert.equal(config.database.url, 'postgresql://localhost:5432/fmsys');
  assert.equal(config.webauthn.rpId, 'localhost');
  assert.equal(config.session.idleMs, 1800000);
  assert.ok(config.app.allowedOrigins.includes('http://localhost:4010'));
});

test('env vars override defaults', () => {
  const config = loadAuthConfig({ DATABASE_URL: 'postgresql://prod:5432/fmsys', WEBAUTHN_RP_ID: 'fmsys.app' });
  assert.equal(config.database.url, 'postgresql://prod:5432/fmsys');
  assert.equal(config.webauthn.rpId, 'fmsys.app');
});
```

- [ ] **Step 3: Run tests**

Run: `node --test tests/auth-config.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/authConfig.js tests/auth-config.test.js
git commit -m "feat: extend auth config with DB, Resend, WebAuthn, and CSRF settings"
```

---

## Task 9a: Rewrite authService.js — Registration Flow

**Files:**
- Modify: `apps/api/src/authService.js`
- Test: `tests/registration-flow.test.js`

- [ ] **Step 1: Write failing test for registration flow**

```javascript
// tests/registration-flow.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');

// Mock email service — spy on calls
const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert() {},
};

test.after(() => pool.end());
test.beforeEach(() => emailCalls.length = 0);

test('register creates pending_verification user and sends email', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `reg-${Date.now()}@test.com`;
  const result = await auth.register({ email });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 1);
  assert.equal(emailCalls[0].method, 'verify');
  assert.equal(emailCalls[0].email, email);
});

test('register rejects duplicate email', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `dup-${Date.now()}@test.com`;
  await auth.register({ email });
  const result = await auth.register({ email });
  assert.equal(result.ok, false);
});

test('verifyEmail activates token and sets email_verified', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `ve-${Date.now()}@test.com`;
  await auth.register({ email });
  const tokenValue = emailCalls[0].token;
  const result = await auth.verifyEmail({ token: tokenValue });
  assert.equal(result.ok, true);
  assert.ok(result.setupToken); // returns a password-setup token
});

test('setupPassword sets hash and activates account', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `sp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  const result = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  assert.equal(result.ok, true);
  assert.ok(result.sessionId); // session created in mfa_setup state
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/registration-flow.test.js`
Expected: FAIL — new methods not yet implemented

- [ ] **Step 3: Rewrite authService.js — registration methods**

Replace `createAuthService(config)` internals:
- Remove all `Map` stores (`sessions`, `usersByEmail`, `usersById`, `rateLimits`, `lockouts`)
- Accept `{ config, pool, emailService }` as dependencies
- Use `createUserRepository(pool)`, `createSessionRepository(pool, config)`, `createTokenRepository(pool)`
- Implement: `register({ email })`, `verifyEmail({ token })`, `setupPassword({ token, password })`
- Rate limiting stays in-memory (per deployment assumptions)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/registration-flow.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/authService.js tests/registration-flow.test.js
git commit -m "feat: rewrite authService registration flow with PostgreSQL"
```

---

## Task 9b: authService — Login + MFA Verification

**Files:**
- Modify: `apps/api/src/authService.js`
- Test: `tests/login-flow.test.js`

- [ ] **Step 1: Write failing test for login flow**

```javascript
// tests/login-flow.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert() {},
};

test.after(() => pool.end());
test.beforeEach(() => emailCalls.length = 0);

// Helper to create an active user with MFA
async function createActiveUser(auth) {
  const email = `login-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  // MFA setup would happen here in production — for login tests, assume MFA enabled
  return email;
}

test('login with correct password returns pre_mfa session', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, true);
  assert.equal(result.sessionState, 'pre_mfa');
  assert.ok(result.sessionId);
});

test('login with wrong password returns error', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const result = await auth.login({ email, password: 'WrongPass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
});

test('5 failed logins lock account for 15 minutes', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  for (let i = 0; i < 5; i++) {
    await auth.login({ email, password: 'Wrong!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  }
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
  assert.match(result.error, /locked/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/login-flow.test.js`
Expected: FAIL

- [ ] **Step 3: Implement login + verifyMfa in authService.js**

- `login({ email, password, sourceIp, userAgent })` — check lockout, verify password, create `pre_mfa` session
- `verifyMfa({ sessionId, code, sourceIp, userAgent })` — validate TOTP or recovery code, transition to `authenticated`
- `getSession(sessionId)` — returns current session state (for middleware)
- `logout(sessionId)` — deletes session

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/login-flow.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/authService.js tests/login-flow.test.js
git commit -m "feat: add login and MFA verification to authService"
```

---

## Task 9c: authService — MFA Setup + Session Management

**Files:**
- Modify: `apps/api/src/authService.js`
- Modify: `apps/api/package.json` (add `otpauth`)

- [ ] **Step 1: Install otpauth**

```bash
cd apps/api && npm install otpauth
```

- [ ] **Step 2: Write failing test for MFA setup**

```javascript
// Add to tests/login-flow.test.js or create tests/mfa-setup.test.js
test('setupMfa returns QR data and recovery codes', async () => {
  const auth = createAuthService({ config: { mfa: { encryptionKey: 'test-key-32-chars-long-for-aes!!' } }, pool, emailService: mockEmailService });
  const email = `mfa-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const { sessionId } = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  const result = await auth.setupMfa({ sessionId });
  assert.equal(result.ok, true);
  assert.ok(result.qrDataUrl);
  assert.equal(result.recoveryCodes.length, 8);
  assert.match(result.recoveryCodes[0], /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});
```

- [ ] **Step 3: Run test to verify it fails**

- [ ] **Step 4: Implement MFA setup + session management**

- `setupMfa({ sessionId })` — generate TOTP secret via `otpauth`, return QR + recovery codes, store encrypted secret
- `verifyMfaSetup({ sessionId, code })` — validate TOTP code, transition session to `authenticated`
- `forgotPassword({ email })` — create reset token, send email (always returns ok to prevent enumeration)
- `resetPassword({ token, password })` — consume token, update password hash, revoke ALL user sessions
- `changePassword({ sessionId, currentPassword, newPassword })` — verify current, update hash

- [ ] **Step 5: Run test to verify it passes**

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/authService.js apps/api/package.json package-lock.json tests/mfa-setup.test.js
git commit -m "feat: add MFA setup, password reset, and session management to authService"
```

---

## Task 10: Update authRoutes.js

**Files:**
- Modify: `apps/api/src/authRoutes.js`
- Test: `tests/rate-limiting.test.js`

- [ ] **Step 1: Add new routes**

Add handlers for all routes from spec Section 11:
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/verify-email`
- `POST /api/v1/auth/setup-password`
- `POST /api/v1/auth/mfa/setup`
- `POST /api/v1/auth/mfa/setup/verify`
- `POST /api/v1/auth/login` (replaces `/recovery/login`)
- `POST /api/v1/auth/logout` — deletes current session, clears `fm_sid` cookie
- `GET /api/v1/auth/session` (singular) — returns current session state for middleware validation
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/sessions` (plural) — lists all user sessions for multi-device management
- `DELETE /api/v1/auth/sessions/:id`
- `POST /api/v1/auth/sessions/revoke-all`

Remove old stubs: `/api/v1/passkeys/register/options`, `/api/v1/passkeys/assert/options`

- [ ] **Step 2: Update session extraction**

Session ID now comes from `fm_sid` cookie only (not query param or Bearer header).
Parse cookie header: `req.headers.cookie` → find `fm_sid=<uuid>`.

- [ ] **Step 3: Integrate CSRF guard**

Import `validateOrigin` from `csrfGuard.js`. Check at the top of `handle()` before routing. Return 403 for invalid origin.

- [ ] **Step 4: Write rate limiting tests**

```javascript
// tests/rate-limiting.test.js
// Test: 5 failed logins → lockout response
// Test: locked account cannot login
// Test: email endpoints respect email-specific rate limits
```

- [ ] **Step 5: Run tests**

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/authRoutes.js tests/rate-limiting.test.js
git commit -m "feat: add production auth routes with CSRF guard and rate limiting"
```

---

## Task 11: Update server.js

**Files:**
- Modify: `apps/api/src/server.js`

- [ ] **Step 1: Wire DB pool and services**

At server startup:
1. `createPool(config.database.url)`
2. `createEmailService(config.resend)` (or mock in dev)
3. `createAuthService({ config, pool, emailService })`
4. Pass `authService` to `createAuthRoutes()`
5. Export `sessionRepo` and `tokenRepo` so Task 21 can wire cleanup

- [ ] **Step 2: Add CSRF guard to pipeline**

Before routing, check `validateOrigin()`. This is now handled inside `authRoutes.handle()` (Task 10), so just ensure the allowed origins from config are passed through.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/server.js
git commit -m "feat: wire PostgreSQL pool and services into API server"
```

---

## Task 12: Passkey Service

**Files:**
- Create: `apps/api/src/passkeyService.js`
- Modify: `apps/api/package.json` (add `@simplewebauthn/server`)
- Modify: `apps/api/src/authRoutes.js` (add passkey routes)
- Test: `tests/passkey-flow.test.js`

- [ ] **Step 1: Install dependency**

```bash
cd apps/api && npm install @simplewebauthn/server
```

- [ ] **Step 2: Write failing tests**

```javascript
// tests/passkey-flow.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createPasskeyService } from '../apps/api/src/passkeyService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
test.after(() => pool.end());

const config = { webauthn: { rpId: 'localhost', rpName: 'FMsys', origin: 'http://localhost:4010', challengeTtlMs: 60000 } };

test('generateRegistrationOptions returns challenge and rpId', async () => {
  const svc = createPasskeyService({ pool, config });
  const opts = await svc.generateRegistrationOptions('test-user-id', 'test@example.com');
  assert.ok(opts.challenge);
  assert.equal(opts.rp.id, 'localhost');
  assert.equal(opts.rp.name, 'FMsys');
});

test('generateAssertionOptions returns allowCredentials', async () => {
  const svc = createPasskeyService({ pool, config });
  const opts = await svc.generateAssertionOptions('test-user-id');
  assert.ok(Array.isArray(opts.allowCredentials));
});

test('challenge expires after TTL', async () => {
  const shortConfig = { ...config, webauthn: { ...config.webauthn, challengeTtlMs: 1 } };
  const svc = createPasskeyService({ pool, config: shortConfig });
  const opts = await svc.generateRegistrationOptions('ttl-user', 'ttl@example.com');
  // Wait for expiry
  await new Promise(r => setTimeout(r, 50));
  // Attempt to verify with expired challenge should fail
  const result = await svc.verifyRegistration('ttl-user', { challenge: opts.challenge, response: {} }).catch(() => null);
  assert.equal(result, null);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/passkey-flow.test.js`
Expected: FAIL — module not found

- [ ] **Step 4: Implement passkeyService.js**

Factory function `createPasskeyService({ pool, config })` returning:
- `generateRegistrationOptions(userId, userEmail)` — Uses `@simplewebauthn/server` `generateRegistrationOptions`, stores challenge in `webauthn_challenges` with 60s TTL
- `verifyRegistration(userId, credential)` — Verify attestation, store in `webauthn_credentials`
- `generateAssertionOptions(userId)` — Generate challenge + allowCredentials from stored credentials
- `verifyAssertion(credential)` — Verify signature + counter, update sign_count + last_used_at

- [ ] **Step 5: Add passkey routes to authRoutes.js**

- `POST /api/v1/auth/passkey/register/options`
- `POST /api/v1/auth/passkey/register/verify`
- `POST /api/v1/auth/passkey/assert/options`
- `POST /api/v1/auth/passkey/assert/verify`

Assertion verify creates an `authenticated` session directly (skipping MFA).

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/passkey-flow.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/api/package.json apps/api/src/passkeyService.js apps/api/src/authRoutes.js tests/passkey-flow.test.js package-lock.json
git commit -m "feat: add Passkey WebAuthn service and routes"
```

---

## Task 13: Update Frontend auth-client.js

**Files:**
- Modify: `apps/web/src/lib/auth-client.js`

- [ ] **Step 1: Replace dual cookie with fm_sid**

Remove `fm_session_id` and `fm_session_state` cookies. Session is now managed entirely by HttpOnly `fm_sid` cookie set by the API. The frontend cannot read it directly.

- [ ] **Step 2: Add new endpoint wrappers**

```javascript
export async function register(email) { /* POST /api/v1/auth/register */ }
export async function setupPassword(token, password) { /* POST /api/v1/auth/setup-password */ }
export async function setupMfa() { /* POST /api/v1/auth/mfa/setup — returns QR data + recovery codes */ }
export async function verifyMfaSetup(code) { /* POST /api/v1/auth/mfa/setup/verify */ }
export async function login(email, password) { /* POST /api/v1/auth/login */ }
export async function logout() { /* POST /api/v1/auth/logout — deletes session, clears cookie */ }
export async function getSession() { /* GET /api/v1/auth/session — returns current session state */ }
export async function forgotPassword(email) { /* POST /api/v1/auth/forgot-password */ }
export async function resetPassword(token, newPassword) { /* POST /api/v1/auth/reset-password */ }
export async function changePassword(currentPassword, newPassword) { /* POST /api/v1/auth/change-password */ }
export async function listSessions() { /* GET /api/v1/auth/sessions */ }
export async function revokeSession(sessionId) { /* DELETE /api/v1/auth/sessions/:id */ }
export async function revokeAllSessions() { /* POST /api/v1/auth/sessions/revoke-all */ }
```

All requests include `credentials: 'include'` so the `fm_sid` cookie is sent automatically.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/auth-client.js
git commit -m "feat: update auth-client with new endpoints and single cookie"
```

---

## Task 14: Update Middleware

**Files:**
- Modify: `apps/web/middleware.ts`

- [ ] **Step 1: Replace cookie check with API validation**

Instead of reading `fm_session_state` cookie, call `GET /api/v1/auth/session` with the `fm_sid` cookie forwarded. The API returns the session state.

```typescript
// Extract fm_sid from request cookies
// Fetch /api/v1/auth/session with Cookie header forwarded
// If no session or expired → redirect /login
// If session_state === 'pre_mfa' → redirect /mfa
// If session_state === 'mfa_setup' → redirect /mfa/setup
// If session_state === 'authenticated' → allow
```

Add new protected routes: `/settings/security`

- [ ] **Step 2: Commit**

```bash
git add apps/web/middleware.ts
git commit -m "feat: validate session via API call in middleware"
```

---

## Task 15: Frontend Auth Pages (Registration + Verification)

**Files:**
- Create: `apps/web/app/register/page.tsx`
- Create: `apps/web/app/verify-email/page.tsx`
- Create: `apps/web/app/setup-password/page.tsx`

- [ ] **Step 1: Build register page**

Simple form: email input + submit button. Calls `register(email)`. Shows "Check your inbox" message on success. Follows existing design tokens (bg-card, border-line, rounded-2xl, etc.).

- [ ] **Step 2: Build verify-email page**

Reads `?token=` from URL. Calls `GET /api/v1/auth/verify-email?token=xxx` on mount. Shows success/error state. On success, redirects to `/setup-password?token=<setup-token>`.

- [ ] **Step 3: Build setup-password page**

Reads `?token=` from URL. Form: password + confirm password. Validates password policy client-side. Calls `setupPassword(token, password)`. On success, cookie is set by API, redirect to `/mfa/setup`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/register/ apps/web/app/verify-email/ apps/web/app/setup-password/
git commit -m "feat: add registration, email verification, and password setup pages"
```

---

## Task 16: Frontend MFA Setup Page

**Files:**
- Create: `apps/web/app/mfa/setup/page.tsx`
- Modify: `apps/web/app/mfa/page.tsx`

- [ ] **Step 1: Build MFA setup page**

1. On mount, call `setupMfa()` → returns `{ qrDataUrl, recoveryCodes }`
2. Display QR code via `<img src={qrDataUrl} />`
3. Display 8 recovery codes in a grid with a "Copy All" button
4. User enters 6-digit TOTP code to confirm
5. Call `verifyMfaSetup(code)` → on success, redirect to `/dashboard`

- [ ] **Step 2: Update existing MFA page**

Add a "Use recovery code" link below the TOTP input. When clicked, show a recovery code input field instead.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/mfa/
git commit -m "feat: add MFA setup page with QR code and recovery codes"
```

---

## Task 17: Frontend Password Reset Pages

**Files:**
- Create: `apps/web/app/forgot-password/page.tsx`
- Create: `apps/web/app/reset-password/page.tsx`

- [ ] **Step 1: Build forgot-password page**

Email input form. Calls `forgotPassword(email)`. Always shows "If an account exists, we sent a reset link" — regardless of result.

- [ ] **Step 2: Build reset-password page**

Reads `?token=` from URL. Form: new password + confirm. Validates policy. Calls `resetPassword(token, password)`. On success, redirect to `/login` with success message.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/forgot-password/ apps/web/app/reset-password/
git commit -m "feat: add forgot-password and reset-password pages"
```

---

## Task 18: Frontend Login Page Update

**Files:**
- Modify: `apps/web/app/login/page.tsx` (or the component that renders the login form)

- [ ] **Step 1: Update login form**

- Replace recovery login with email + password login calling `login(email, password)`
- Add "Sign in with Passkey" button (calls WebAuthn browser API via auth-client)
- Add "Forgot password?" link → `/forgot-password`
- Add "Create account" link → `/register`

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/login/
git commit -m "feat: update login page with password login and Passkey"
```

---

## Task 19: Settings Security Page

**Files:**
- Create: `apps/web/app/settings/security/page.tsx`

- [ ] **Step 1: Build security settings page**

Three sections:
1. **Active Sessions** — Call `listSessions()`, display table (device, IP, last active, current badge). "Revoke" button per session. "Revoke All" button.
2. **Passkeys** — List registered passkeys (from a new API endpoint or embedded in session data). "Add Passkey" button triggers WebAuthn registration flow.
3. **Change Password** — Form: current password + new password + confirm. Calls `changePassword()`.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/settings/
git commit -m "feat: add security settings page with session management and Passkey"
```

---

## Task 20: Known Devices + Anomaly Detection

**Files:**
- Modify: `apps/api/src/authService.js`
- Test: `tests/session-management.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
// tests/session-management.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
const alertCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) {},
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert(email, details) { alertCalls.push({ email, details }); },
};
test.after(() => pool.end());
test.beforeEach(() => alertCalls.length = 0);

test('first login from device triggers new device alert', async () => {
  // Setup: create active user with MFA, complete login
  // Assert: alertCalls.length === 1
  // Assert: known_devices has 1 row for this user
});

test('second login from same device does not trigger alert', async () => {
  // Same IP subnet + UA family
  // Assert: alertCalls.length === 0
});

test('login from new IP subnet triggers alert', async () => {
  // Different IP, same UA
  // Assert: alertCalls.length === 1
});

test('password reset revokes ALL user sessions', async () => {
  // Create user, login twice, reset password
  // Assert: no valid sessions remain
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/session-management.test.js`
Expected: FAIL

- [ ] **Step 3: Implement device tracking**

After successful authentication (MFA verify or Passkey assert):
1. Parse user agent into family + OS (simple regex, no library needed)
2. Extract IP subnet (/24 for IPv4)
3. Check `known_devices` for match on `(user_id, ip_subnet, ua_family)`
4. If new → INSERT into `known_devices`, call `emailService.sendNewDeviceAlert()`
5. If known → UPDATE `last_seen_at`

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/authService.js tests/session-management.test.js
git commit -m "feat: add known device tracking and anomaly detection alerts"
```

---

## Task 21: Session Cleanup Job

**Files:**
- Modify: `apps/api/src/server.js`

- [ ] **Step 1: Add cleanup interval**

In server startup, after creating the session repository:

```javascript
setInterval(async () => {
  try {
    const deleted = await sessionRepo.deleteExpired();
    if (deleted > 0) console.log(`[cleanup] Removed ${deleted} expired sessions`);
  } catch (err) {
    console.error('[cleanup] Session cleanup failed:', err.message);
  }
}, 10 * 60 * 1000); // every 10 minutes
```

Also clean expired auth tokens:
```javascript
await tokenRepo.deleteExpired();
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/server.js
git commit -m "feat: add periodic session and token cleanup job"
```

---

## Task 22: End-to-End Integration Test

**Files:**
- Create: `tests/e2e-auth-flow.test.js`

- [ ] **Step 1: Write full flow test**

Test the complete happy path against the running API server with a real DB:

1. Register → check token created in DB
2. Verify email → check email_verified = true
3. Setup password → check password_hash exists, session created
4. Setup MFA → check mfa_secret stored, recovery codes created
5. Logout → check session deleted
6. Login → check pre_mfa session
7. Verify MFA → check authenticated session
8. List sessions → check 1 session
9. Change password → check hash updated
10. Forgot password → check reset token created
11. Reset password → check all sessions revoked

- [ ] **Step 2: Run test**

Run: `node --test tests/e2e-auth-flow.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e-auth-flow.test.js
git commit -m "test: add end-to-end auth flow integration test"
```

---

## Summary

| Task | Component | Dependencies |
|------|-----------|-------------|
| 1 | DB Pool + Migration | — |
| 2 | User Repository | Task 1 |
| 3 | Session Repository | Task 1 |
| 4 | Token Repository | Task 1 |
| 5 | Security (Argon2id + CSRF) | — |
| 6 | Email Service (Resend) | — |
| 7 | Recovery Code Service | Task 1, 5 |
| 8 | Auth Config Updates | — |
| 9a | authService — Registration Flow | Tasks 2–8 |
| 9b | authService — Login + MFA Verify | Task 9a |
| 9c | authService — MFA Setup + Session Mgmt | Task 9b |
| 10 | Update authRoutes.js | Task 9c |
| 11 | Update server.js | Tasks 9c, 10 |
| 12 | Passkey Service | Task 1, 9c, 10 |
| 13 | Frontend auth-client.js | Task 10 |
| 14 | Update Middleware | Task 13 |
| 15 | Registration Pages | Task 13 |
| 16 | MFA Setup Page | Task 13 |
| 17 | Password Reset Pages | Task 13 |
| 18 | Login Page Update | Task 13 |
| 19 | Settings Security Page | Task 13 |
| 20 | Known Devices + Anomaly | Task 9c |
| 21 | Session Cleanup Job | Task 3 |
| 22 | E2E Integration Test | All |

**Note:** Migration 003 should include an index on `auth_sessions.user_id` for the `findAllByUser` and `revokeAllExcept` queries.
