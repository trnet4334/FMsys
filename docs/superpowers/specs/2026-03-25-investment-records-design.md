# Investment Records — Design Spec

**Date:** 2026-03-25
**Page:** Allocation (`/allocation`)
**Status:** Approved

---

## Overview

Add an **Investment Records** section to the Allocation page, positioned below the existing Distribution Overview and Asset Details grid. The section lets users track monthly investment returns per position, separated by completion status.

---

## Layout

The section is a **separate full-width block**, placed after the existing `grid grid-cols-1 lg:grid-cols-12` wrapper and before the Strategy banner — not inside the grid. It matches the existing card style: `bg-card`, `border border-line`, `rounded-xl`, `shadow-soft`, with `mt-8` top margin.

---

## Header

- **Title:** "Investment Records" with an icon (e.g. `TrendingUp`)
- **Month navigator:** Left/right arrow buttons with the current month label (e.g. "March 2025"). Defaults to the current calendar month on page load. All filtering is **client-side** — the full seed dataset is loaded once and filtered by `{ year, month }` derived from `selectedMonth` state. No API calls on navigation.
- **Add Record button:** `bg-brand` primary button, top-right

---

## Tabs

A tab row below the header filters records by asset type:

| Tab | Filter |
|-----|--------|
| All | No filter |
| Stock | `type === 'Stock'` |
| Crypto | `type === 'Crypto'` |
| Forex | `type === 'Forex'` |
| Options | `type === 'Options'` |

Each tab shows a count badge: the number of records matching **that tab's type filter AND the selected month** (e.g. the Stock tab badge = count of Stock records in the current month, regardless of the active tab).

---

## Table

Columns: **Date · Name · Type · Return · Return % · Status**

Records for the selected month are split into two sections:

Section headers display Chinese + English labels as UI text (e.g. "已結束 · Closed"). The data `status` field uses lowercase English values (`'closed' | 'ongoing'`).

### 已結束 · Closed (top section)
- Displays all six columns including Return and Return %
- Return % formatted to one decimal place with sign, e.g. `+12.5%` or `−1.1%`
- Date rendered as `"Mar 18, 2025"` (use existing `fmt` helpers or `toLocaleDateString`)
- Rows use `text-ink-1` / `text-ink-0` (standard dimmed palette)

### 未結束 · Ongoing (bottom section)
- Return and Return % columns show `—` in `text-ink-disabled`
- Rows have a subtle green tint: `bg-success/5` on the `<tr>` (hover: `bg-success/10`)
- Status badge: green pill (`bg-success/10 text-success`) with a leading dot using Tailwind `animate-pulse` (standard 2s pulse)

---

## Footer

| Left | Right |
|------|-------|
| "View All Months →" — rendered as `text-ink-disabled` with `cursor-not-allowed`, non-interactive (out of scope) | Ongoing: count of ongoing records for the selected month + active tab · Realized P&L: sum of `return` values for closed records in the selected month + active tab |

---

## Data Shape

Each investment record:

```ts
type InvestmentRecord = {
  id: string;
  date: string;          // ISO date, e.g. "2025-03-18"
  name: string;          // Ticker or instrument name, e.g. "NVDA", "BTC", "USD/JPY"
  subName?: string;      // Optional description, e.g. "NVIDIA Corp."
  type: 'Stock' | 'Crypto' | 'Forex' | 'Options';
  return?: number;       // Absolute P&L in TWD/USD — undefined if status is ongoing
  returnPct?: number;    // Percentage return — undefined if status is ongoing
  status: 'closed' | 'ongoing';
};
```

---

## State

- `selectedMonth`: `{ month: number; year: number }` — defaults to current calendar month
- `activeTab`: `'all' | 'stock' | 'crypto' | 'forex' | 'options'` — defaults to `'all'`
- Records are filtered client-side by both month and tab

---

## Empty State

If no records exist for the selected month + tab combination, the entire table body (both sections) is replaced by a centred placeholder row: "No records for this period." The table header and section structure are hidden.

---

## Seed / Mock Data

Initial implementation uses static mock records (same pattern as existing `seedDashboardData`). Records span at least two months so month navigation is testable.

---

## Out of Scope

- Add/Edit/Delete record forms (the Add Record button is present but non-functional in this iteration)
- Persistence to the API or database
- "View All Months" pagination view
