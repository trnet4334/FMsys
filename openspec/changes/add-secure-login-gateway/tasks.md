## 1. Auth Data and Config Foundations

- [x] 1.1 Add database schema changes for auth profiles, session state (`pre_mfa`/`authenticated`), MFA metadata, lockout counters, and auth audit events.
- [x] 1.2 Define shared auth contract types in `packages/shared` for session payloads, MFA challenge status, and provider-agnostic OAuth profile mapping.
- [x] 1.3 Add environment configuration plumbing for OAuth client secrets, session signing keys, MFA issuer/settings, and security thresholds.

## 2. API Authentication Flow

- [x] 2.1 Implement OAuth start and callback endpoints with provider abstraction and secure state validation.
- [x] 2.2 Implement two-stage session issuance: create short-lived `pre_mfa` session after primary auth and elevate to `authenticated` only after MFA success.
- [x] 2.3 Implement fallback local recovery login endpoint with explicit secondary-path semantics.
- [x] 2.4 Implement MFA challenge and verification endpoints (TOTP-based MVP) that transition session state on success.

## 3. API Security Controls and Observability

- [x] 3.1 Add auth endpoint rate limiting middleware (per-IP plus per-account dimensions) for login, callback, and MFA routes.
- [x] 3.2 Add temporary lockout policy for repeated failed login/MFA attempts, including unlock expiry handling.
- [x] 3.3 Add structured audit logging for auth events (success/failure, lockout, logout, session elevation).
- [x] 3.4 Add API authorization middleware that denies protected resource access unless session state is `authenticated`.

## 4. Web Login Gateway and UX

- [x] 4.1 Add route guard middleware in `apps/web` to redirect unauthenticated users from dashboard routes to `/login` with return URL.
- [x] 4.2 Build login page with OAuth primary actions and clearly marked fallback recovery login option.
- [x] 4.3 Build MFA verification page that handles pending challenge state and blocks dashboard navigation until completion.
- [x] 4.4 Update app shell/session handling to redirect authenticated users away from `/login` to `/dashboard`.

## 5. Passkey Readiness and Compatibility

- [x] 5.1 Add additive schema/API placeholders for future WebAuthn credential registration and assertion metadata.
- [x] 5.2 Reserve versioned API namespace/contracts for future passkey endpoints without changing existing required fields.
- [x] 5.3 Add compatibility checks/tests to ensure OAuth+MFA flows remain unaffected by passkey-readiness additions.

## 6. Validation and Rollout Readiness

- [x] 6.1 Add automated tests for route gating, OAuth callback handling, MFA gating, lockout behavior, and rate limiting.
- [x] 6.2 Add integration tests covering full sign-in journey: unauthenticated -> OAuth -> MFA -> dashboard access.
- [x] 6.3 Add operational runbook for auth rollout, feature flag activation, and rollback procedure.
- [x] 6.4 Verify metrics/log dashboards for auth success rate, MFA completion rate, throttling events, and lockout counts.
