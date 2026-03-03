## ADDED Requirements

### Requirement: Asset holdings SHALL follow normalized category schema
The system SHALL store holdings under normalized asset categories (`cash`, `stock`, `crypto`, `forex`) with category-specific extensions while preserving common valuation fields.

#### Scenario: Stock holding is ingested
- **WHEN** a stock position is imported during snapshot processing
- **THEN** the system stores quantity, cost basis, current price, currency, account, and computed market values

### Requirement: Multi-account aggregation SHALL preserve account boundaries
The system SHALL support per-account balances and roll-up views without losing account-level attribution, and internal transfers between accounts MUST NOT change total net worth.

#### Scenario: Internal transfer is recorded
- **WHEN** funds move from account A to account B within the same user scope
- **THEN** account balances change but aggregate net worth remains unchanged
