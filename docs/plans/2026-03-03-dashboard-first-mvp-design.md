# Dashboard-First MVP Design (Newsroom + Premium Fintech)

## Scope
- Build a dashboard-first frontend MVP in `apps/web`.
- Use mock-first data with backend-compatible adapters.
- Prioritize desktop polish while remaining responsive.

## Product Direction
- Visual blend: Data newsroom clarity + premium fintech atmosphere.
- Initial route: `/dashboard`.
- Future-ready for app version via reusable section components.

## Architecture
- Route layer: `app/dashboard/page.tsx`.
- UI sections: `components/dashboard/*`.
- Mock data + mapping: `lib/mock-data/*`.
- Design tokens/theme: `styles/*`.

## UI Sections
- Net worth hero: assets/liabilities/net worth + delta.
- Trend panel: time range toggles with line chart.
- Allocation panel: category distribution + top holdings.
- Alert panel: anomaly feed by severity.
- Cashflow mini panel: income vs expense preview.

## Visual System
- Typography: expressive display + readable body pairing.
- Color system: neutral base with teal/amber accents.
- Surfaces: soft glass cards and subtle gradients.
- Motion: card stagger-in, KPI count transitions, chart reveal.

## Responsive Strategy
- Desktop-first optimization at large breakpoints.
- Tablet/mobile use stacked card layout and reduced density.

## Data Strategy (Mock-First)
- Stable contracts:
  - `DashboardSnapshot`
  - `TrendPoint`
  - `AllocationSlice`
  - `AlertItem`
  - `CashflowSummary`
- Adapter maps raw mock data to UI contracts to reduce later API wiring cost.

## Constraints
- Keep implementation YAGNI for MVP.
- Keep components composable for future app surface reuse.
- Keep charts and motion purposeful, avoid visual noise.
