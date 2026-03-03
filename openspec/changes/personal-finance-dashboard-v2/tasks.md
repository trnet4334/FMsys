## 1. Foundation and data model

- [x] 1.1 Initialize project modules for web app, API service, worker, and shared types.
- [x] 1.2 Implement PostgreSQL schema and migrations for `accounts`, `snapshots`, `snapshot_holdings`, and `snapshot_diffs`.
- [x] 1.3 Add repository/query layer for snapshot reads by period, account, category, and currency.
- [x] 1.4 Add Redis + queue infrastructure for async snapshot/report jobs with retry and dead-letter handling.

## 2. Snapshot lifecycle and integrations

- [x] 2.1 Implement `POST /api/snapshot/trigger` to enqueue manual or scheduled snapshot jobs.
- [x] 2.2 Implement transaction-system adapter clients for positions, realized PnL, and cashflow summary endpoints.
- [x] 2.3 Implement webhook endpoint `POST /webhook/snapshot-ready` with idempotency and signature verification.
- [x] 2.4 Implement snapshot processor to collect source data, persist immutable snapshot records, and compute diffs.
- [x] 2.5 Implement anomaly detection rules and persist anomaly outputs in snapshot diffs.

## 3. Multi-currency valuation and account aggregation

- [x] 3.1 Implement exchange-rate provider abstraction with cache and fallback sources.
- [x] 3.2 Persist per-snapshot exchange-rate maps and compute base/local market values.
- [x] 3.3 Implement TWD/USD display currency switching without mutating stored snapshot values.
- [x] 3.4 Implement aggregation logic that preserves account boundaries and neutralizes internal transfers in net worth.

## 4. Dashboard and analytics APIs

- [x] 4.1 Implement net worth summary API (assets, liabilities, net worth, period deltas).
- [x] 4.2 Implement trend-series API with period filters (week/month/quarter/year).
- [x] 4.3 Implement allocation analysis API by category, account, and currency distribution.
- [x] 4.4 Implement performance API supporting TWR/MWR selection and benchmark comparison contract.
- [x] 4.5 Implement cashflow and budget APIs for categorized inflow/outflow and overspend alerts.

## 5. Web UI delivery

- [x] 5.1 Build dashboard summary cards, trend chart, asset snapshot panel, and anomaly indicators.
- [x] 5.2 Build currency switcher and account/category filters with consistent query state handling.
- [x] 5.3 Build cashflow views (monthly bar chart, category pie chart, budget status).
- [x] 5.4 Build allocation/performance views with method toggles (TWR/MWR) and drill-down interactions.

## 6. Reporting and export automation

- [x] 6.1 Implement scheduled weekly/monthly report generation jobs and report metadata storage.
- [x] 6.2 Implement report rendering pipeline for PDF output with fixed template sections.
- [x] 6.3 Implement Excel/CSV export endpoints with consistent totals for identical report scopes.
- [x] 6.4 Implement report archive retrieval APIs and optional email delivery workflow.

## 7. Security, audit, and operations

- [x] 7.1 Implement JWT + OAuth2 authentication flow and RBAC authorization middleware.
- [x] 7.2 Implement MFA enrollment/challenge support for privileged operations.
- [x] 7.3 Implement audit logging for login events and financial data mutations.
- [x] 7.4 Implement encryption-at-rest/in-transit controls for sensitive fields and API secrets.
- [x] 7.5 Implement backup/restore runbook, observability dashboards, and alerting for critical jobs.

## 8. Validation and rollout

- [x] 8.1 Add contract tests for transaction adapter endpoints and webhook compatibility.
- [x] 8.2 Add integration tests for snapshot lifecycle, diff generation, and anomaly detection.
- [x] 8.3 Add end-to-end tests for dashboard loading, currency switching, and export flows.
- [x] 8.4 Execute staged rollout (manual snapshots -> scheduled snapshots -> notifications) with rollback checks.
