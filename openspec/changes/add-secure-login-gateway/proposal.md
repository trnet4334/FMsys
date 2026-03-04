## Why

The dashboard currently lacks a dedicated authentication gate, which leaves financial data access insufficiently protected for MVP launch. We need a secure, low-maintenance login flow now so users can access the product safely while keeping a clear migration path to stronger phishing-resistant authentication.

## What Changes

- Add a pre-dashboard authentication gateway that blocks all dashboard routes until a valid session exists.
- Introduce OAuth 2.0 social login as the primary sign-in method for MVP (Google/Apple provider-ready architecture).
- Enforce MFA for signed-in users before granting dashboard access.
- Add a fallback local credential flow only as account recovery / backup access, not the primary login path.
- Add security controls for authentication endpoints: rate limiting, lockout window, secure session handling, and audit logging.
- Reserve an extension point for Passkey (WebAuthn) enrollment and sign-in in a later phase without breaking current auth flows.

## Capabilities

### New Capabilities
- `secure-login-gateway`: Route-level access control, session validation, and dashboard entry gating.
- `oauth-mfa-authentication`: OAuth-first sign-in with mandatory MFA verification before access is granted.
- `auth-security-controls`: Login endpoint protection, lockout/rate-limit behavior, and auth audit trails.
- `passkey-readiness`: Data model and API extension points that allow future WebAuthn integration.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `apps/web` login UI, route guards, and session-aware layout behavior.
  - `apps/api` auth/session endpoints, OAuth callback handlers, MFA verification endpoints, and security middleware.
  - `packages/shared` auth contracts/types.
- Data/storage:
  - Add user auth profile, MFA status/secret metadata, session records, and audit log entities.
- External dependencies:
  - OAuth provider configuration (Google/Apple-ready), OTP/TOTP library for MFA, and optional email service for recovery flows.
- Operations:
  - New environment variables for OAuth secrets, session signing keys, and MFA configuration.
