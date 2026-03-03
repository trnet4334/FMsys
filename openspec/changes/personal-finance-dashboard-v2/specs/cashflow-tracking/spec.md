## ADDED Requirements

### Requirement: Cashflow entries SHALL support categorized inflow and outflow tracking
The system SHALL allow cashflow records with date, amount, direction, category, and account context, and SHALL aggregate them by month.

#### Scenario: User records an expense entry
- **WHEN** a user submits a valid outflow record with category `living`
- **THEN** the entry is stored and included in monthly expense aggregates

### Requirement: Budget monitoring SHALL surface overspend alerts
The system SHALL support per-category monthly budget limits and MUST flag categories whose realized outflow exceeds configured limits.

#### Scenario: Category budget exceeded
- **WHEN** monthly outflow for a category exceeds its budget threshold
- **THEN** the system marks the category as overspent and emits an alert item
