## ADDED Requirements

### Requirement: Snapshot jobs SHALL produce immutable period records
The system SHALL support manual and scheduled snapshot triggers, and each successful run MUST create an immutable snapshot record with snapshot date, type, valuation timestamp, and source metadata.

#### Scenario: Manual snapshot trigger succeeds
- **WHEN** a user triggers snapshot generation for a valid account scope
- **THEN** the system creates one new snapshot record with status `completed` and persists valuation context

### Requirement: Snapshot diff SHALL be calculated against prior baseline
For each completed snapshot, the system SHALL calculate differences against the immediately previous snapshot for the same user scope, including net worth delta, category deltas, and holding additions/removals.

#### Scenario: Snapshot has previous baseline
- **WHEN** a new monthly snapshot is completed and a previous monthly snapshot exists
- **THEN** the system stores diff results linked to both snapshot IDs
