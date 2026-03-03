## ADDED Requirements

### Requirement: Access control SHALL enforce authenticated and authorized operations
The system SHALL require authenticated sessions for financial data access and MUST enforce role-based authorization for read/write/export operations.

#### Scenario: Viewer role attempts write action
- **WHEN** a viewer-role user calls a write endpoint
- **THEN** the system rejects the request with an authorization error and no data mutation occurs

### Requirement: Audit and protection controls SHALL cover sensitive operations
The system SHALL record audit logs for authentication and financial data mutations, and sensitive secrets/fields MUST be encrypted at rest and in transit.

#### Scenario: User updates holding data
- **WHEN** a holding record is created, updated, or deleted
- **THEN** an audit event is persisted with actor, timestamp, action, and target identifiers
