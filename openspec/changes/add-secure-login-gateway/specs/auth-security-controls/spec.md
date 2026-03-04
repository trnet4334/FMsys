## ADDED Requirements

### Requirement: Authentication endpoints enforce rate limits
The system MUST apply rate limiting to login, OAuth callback, and MFA verification endpoints to reduce brute-force and abuse risk.

#### Scenario: Rate limit exceeded
- **WHEN** requests from the same identity or source exceed configured threshold within the control window
- **THEN** the system rejects additional requests with a throttling response and audit event

### Requirement: Repeated auth failures trigger temporary lockout
The system MUST temporarily lock authentication attempts for an account after repeated failed login or MFA verification attempts.

#### Scenario: Lockout threshold reached
- **WHEN** failed attempts exceed configured lockout threshold
- **THEN** the system blocks further attempts for the lockout duration and records a lockout event

### Requirement: Authentication events are audited
The system SHALL record structured audit entries for sign-in success/failure, MFA challenge outcomes, lockouts, and session termination.

#### Scenario: Authentication event occurs
- **WHEN** any tracked authentication action completes
- **THEN** the system persists an audit record with actor identifier, timestamp, event type, and outcome
