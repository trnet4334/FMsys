## ADDED Requirements

### Requirement: OAuth is primary authentication method
The system MUST provide OAuth 2.0 login as the primary sign-in path and SHALL support provider abstraction for at least Google in MVP with Apple-ready configuration.

#### Scenario: User selects OAuth sign-in
- **WHEN** the user clicks a configured OAuth provider button
- **THEN** the system starts OAuth authorization flow and creates a local session only after successful callback validation

### Requirement: MFA is mandatory before dashboard access
The system MUST require MFA verification for authenticated users before granting access to protected dashboard routes.

#### Scenario: OAuth success but MFA pending
- **WHEN** OAuth callback succeeds for a user without completed current MFA challenge
- **THEN** the system routes the user to MFA verification and denies dashboard route access until verification succeeds

### Requirement: Fallback local login is recovery-only
The system SHALL provide local credential login only as a fallback recovery path and MUST mark this path as secondary in UX and configuration.

#### Scenario: Recovery login used
- **WHEN** a user explicitly chooses fallback login and submits valid credentials
- **THEN** the system authenticates the user and still requires MFA before dashboard access
