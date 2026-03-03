## ADDED Requirements

### Requirement: Scheduled reports SHALL generate and archive periodic outputs
The system SHALL support automated weekly and monthly report generation, store generated artifacts, and allow users to retrieve historical reports.

#### Scenario: Monthly schedule executes
- **WHEN** monthly report schedule runs successfully
- **THEN** the system creates a report artifact, stores metadata, and marks it retrievable in history

### Requirement: Export pipeline SHALL support PDF, Excel, and CSV outputs
The system SHALL support exporting report data in PDF, Excel, and CSV formats with consistent numeric totals for the same report scope.

#### Scenario: User requests export in multiple formats
- **WHEN** a user exports the same report range as PDF and CSV
- **THEN** the rendered totals are numerically consistent across formats
