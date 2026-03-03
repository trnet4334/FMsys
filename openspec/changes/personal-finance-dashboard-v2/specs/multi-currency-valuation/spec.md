## ADDED Requirements

### Requirement: Snapshot valuation SHALL persist exchange rate context
Each snapshot SHALL persist the exchange-rate map used for valuation, and all converted values MUST be reproducible using the stored rate context.

#### Scenario: Historical snapshot is revisited
- **WHEN** a user opens a snapshot from a prior month
- **THEN** the displayed base-currency values match the exchange rates stored with that snapshot

### Requirement: Display currency switching SHALL not mutate stored values
The system SHALL allow users to switch display currency (at least TWD and USD) while leaving persisted snapshot values unchanged.

#### Scenario: User toggles display currency
- **WHEN** a user switches dashboard display from TWD to USD
- **THEN** UI totals are re-rendered using snapshot rate context without rewriting snapshot records
