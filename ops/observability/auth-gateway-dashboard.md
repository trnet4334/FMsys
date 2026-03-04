# Auth Gateway Metrics and Alerts

## Primary Metrics
- `auth.oauth.success_rate` (target: >= 98%)
- `auth.mfa.completion_rate` (target: >= 95%)
- `auth.throttled.count` (watch for sudden spikes)
- `auth.lockout.count` (watch trend and per-account concentration)

## Log Queries
- OAuth failures: `event_type = "auth.oauth_callback_failed"`
- MFA failures: `event_type = "auth.mfa_failed"`
- Throttle triggers: `event_type = "auth.throttled"`
- Lockout activation: `event_type IN ("auth.lockout_active")`

## Alert Suggestions
- High: OAuth success rate < 95% for 5m.
- High: MFA completion rate < 90% for 10m.
- Medium: throttled events > baseline + 3 sigma.
- Medium: lockouts > 20 in 15m.

## On-Call Verification Checklist
1. Confirm provider health and OAuth callback responses.
2. Confirm session state transitions (`pre_mfa` -> `authenticated`).
3. Inspect top offending source IPs/accounts.
4. Validate lockout expiry and user recovery behavior.
