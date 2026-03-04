## Context

The product now has a dashboard-first MVP, but authentication controls are incomplete for financial data sensitivity. We need a secure gateway before dashboard access with low operational overhead. The current stack already includes web (`apps/web`) and API (`apps/api`) services plus shared contracts (`packages/shared`), so this change should align with that architecture and avoid major rewrites.

Key constraints:
- MVP timeline requires fast implementation and stable developer ergonomics.
- Security posture must exceed simple password-only login.
- Existing frontend and API code should be incrementally extended, not replaced.
- Future App client and passkey support should be possible without API contract breakage.

## Goals / Non-Goals

**Goals:**
- Enforce a login gate before all dashboard routes.
- Use OAuth as primary sign-in path with mandatory MFA before protected access.
- Provide backup local credentials only for recovery.
- Add baseline auth hardening: rate limiting, temporary lockout, audit logging.
- Prepare schema and API contracts for future WebAuthn/passkey support.

**Non-Goals:**
- Full passkey registration/assertion implementation in this change.
- Enterprise SSO (SAML/OIDC multi-tenant enterprise flows).
- Advanced adaptive risk scoring and device fingerprinting.
- Native app authentication implementation (only contract-ready support).

## Decisions

1. OAuth-first with mandatory MFA challenge
- Decision: Use OAuth 2.0 provider flow as the default login entry; require MFA verification state before issuing fully privileged dashboard session.
- Rationale: Reduces password handling risk and improves onboarding speed while preserving strong second factor.
- Alternatives considered:
  - Password-first + optional MFA: rejected due to weaker default security.
  - Passkey-first immediately: rejected for MVP due to higher implementation/testing scope.

2. Two-stage session model (`pre_mfa` and `authenticated`)
- Decision: Create short-lived `pre_mfa` session after successful primary auth, then elevate to `authenticated` only after MFA success.
- Rationale: Cleanly enforces policy and simplifies route guard logic across web and API.
- Alternatives considered:
  - Single session with inline MFA flags only: possible but more error-prone in route checks.

3. Edge + API route protection
- Decision: Enforce route guarding in web middleware (redirect unauthenticated users) and replicate authorization checks in API middleware.
- Rationale: Defense in depth; prevents direct API bypass even if frontend guard is bypassed.
- Alternatives considered:
  - Frontend-only checks: rejected because it is not sufficient for security-sensitive data.

4. Security control baseline at auth boundaries
- Decision: Add per-IP/per-account rate limiting, temporary lockout policy, and immutable auth audit logging.
- Rationale: Necessary controls for brute-force reduction and incident investigation.
- Alternatives considered:
  - Rate limit only: rejected due to insufficient account-level protection.
  - Lockout only: rejected because abusive distributed traffic still needs throttling.

5. Passkey readiness via additive schema/API versioning
- Decision: Add optional credential tables/fields and keep current auth contracts backward-compatible; reserve endpoint namespace for future WebAuthn operations.
- Rationale: Avoid breaking clients while enabling staged rollout.
- Alternatives considered:
  - Deferring all passkey preparation: rejected because later migration cost/risk increases.

## Risks / Trade-offs

- [OAuth provider outage or misconfiguration] -> Mitigation: keep fallback recovery login path with strict monitoring and alerting.
- [MFA friction increases login drop-off] -> Mitigation: provide clear UX, trusted-device window policy (time-limited), and recovery options.
- [Lockout false positives on shared IPs] -> Mitigation: combine account and IP keys, tune thresholds, and expose admin unlock tooling.
- [Audit logs grow rapidly] -> Mitigation: define retention window and archive policy.
- [Future passkey model mismatch] -> Mitigation: use additive schema with nullable passkey fields and versioned endpoints.

## Migration Plan

1. Add auth schema migrations (session state, MFA metadata, audit events, optional passkey metadata).
2. Implement API endpoints and middleware: OAuth callbacks, MFA verification, session validation, rate limiting, lockout checks, audit writes.
3. Implement web login gateway pages and middleware route guards.
4. Roll out behind feature flag for staged validation in non-production.
5. Enable in production with monitoring on auth success rate, MFA completion rate, throttling, and lockout events.
6. Rollback strategy: disable feature flag to revert to prior login behavior, keep additive schema intact (no destructive rollback needed).

## Open Questions

- Which OAuth providers must be enabled on day one (Google only or Google+Apple)?
- MFA method priority for MVP (TOTP only vs TOTP + email OTP backup)?
- Trusted-device policy window and risk tolerance for bypass re-prompt frequency.
- Exact lockout and rate-limit thresholds for production traffic profile.
- Audit log retention duration and storage cost ceiling.
