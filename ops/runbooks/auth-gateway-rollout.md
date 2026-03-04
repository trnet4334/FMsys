# Auth Gateway Rollout Runbook

## Goal
Enable OAuth + mandatory MFA login gateway for dashboard access with safe rollback.

## Prerequisites
- OAuth client IDs/secrets configured for enabled providers.
- `SESSION_SIGNING_KEY`, MFA settings, and rate-limit thresholds set.
- `FEATURE_AUTH_GATEWAY=true` in target environment.
- API and web deployed with `002_auth_gateway_schema.sql` applied.

## Rollout Steps
1. Deploy API and web to staging with feature flag enabled.
2. Validate sign-in flow: `/login` -> OAuth/recovery -> `/mfa` -> `/dashboard`.
3. Validate security behavior: throttling and lockout responses for repeated invalid attempts.
4. Verify audit feed from `/api/v1/auth/audit` includes success/failure events.
5. Deploy to production with feature flag on for internal users first.
6. Expand rollout to all users after auth success and MFA completion metrics are stable.

## Rollback
1. Set `FEATURE_AUTH_GATEWAY=false` and redeploy web+api.
2. Confirm dashboard access reverts to previous behavior.
3. Keep auth tables intact (additive migration; no destructive rollback required).
4. Review audit events around incident window.
