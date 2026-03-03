## ADDED Requirements

### Requirement: Allocation analysis SHALL provide category and account breakdowns
The system SHALL compute allocation percentages by asset category, currency, and account using snapshot market values.

#### Scenario: User opens allocation analysis
- **WHEN** a snapshot is selected for analysis
- **THEN** the system returns percentage breakdowns that sum to 100% within configured rounding tolerance

### Requirement: Performance analytics SHALL support TWR and MWR views
The system SHALL provide portfolio performance outputs for both time-weighted return (TWR) and money-weighted return (MWR) over user-selected periods.

#### Scenario: User changes return methodology
- **WHEN** a user switches from TWR to MWR
- **THEN** the system recalculates and displays period return using the selected method definition
