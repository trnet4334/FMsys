## ADDED Requirements

### Requirement: Dashboard SHALL present net worth summary with period deltas
The dashboard SHALL display total assets, total liabilities, net worth, and the change amount/percentage versus previous comparable snapshot.

#### Scenario: Dashboard loads latest snapshot
- **WHEN** the latest snapshot and its diff are available
- **THEN** summary cards show current values and prior-period deltas

### Requirement: Dashboard SHALL include trend and anomaly surfaces
The dashboard SHALL provide selectable period trend charts and visibly surface high/medium anomaly flags generated from snapshot analysis.

#### Scenario: Anomaly exists in latest snapshot
- **WHEN** snapshot diff includes anomaly items above configured thresholds
- **THEN** the dashboard highlights anomaly status and links to details
