## ADDED Requirements

### Requirement: Auth model supports future passkey credentials
The system MUST define extensible auth data structures that can store WebAuthn credential metadata without breaking existing OAuth+MFA users.

#### Scenario: Passkey fields added for future use
- **WHEN** passkey metadata columns/entities are introduced in schema migration
- **THEN** existing users and sessions continue to function without data migration failures

### Requirement: API surface reserves passkey extension points
The system SHALL expose versioned auth API contracts that can add passkey registration and assertion endpoints in a backward-compatible manner.

#### Scenario: Future passkey endpoint introduction
- **WHEN** new passkey endpoints are added in a later release
- **THEN** existing OAuth and MFA clients remain compatible with unchanged required request/response fields
