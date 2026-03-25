# Investment Records — Design Spec

**Date:** 2026-03-25
**Page:** Allocation (`/allocation`)
**Status:** Approved

---

## Overview

Add an **Investment Records** section to the Allocation page, positioned below the existing Distribution Overview and Asset Details grid. The section lets users track monthly investment returns per position, separated by completion status.

---

## Layout

The section is a full-width card (`lg:col-span-12`), placed after the two-column grid and before the Strategy banner. It matches the existing card style: `bg-card`, `border border-line`, `rounded-xl`, `shadow-soft`.

---

## Header

- **Title:** "Investment Records" with an icon (e.g. `TrendingUp`)
- **Month navigator:** Left/right arrow buttons with the current month label (e.g. "March 2025"). Defaults to the current calendar month on page load.
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

Each tab shows a count badge for the currently selected month.

---

## Table

Columns: **Date · Name · Type · Return · Return % · Status**

Records for the selected month are split into two sections:

### 已結束 · Closed (top section)
- Displays all six columns including Return and Return %
- Rows rendered at reduced opacity / grey tone

### 未結束 · Ongoing (bottom section)
- Return and Return % columns show `—` (em-dash placeholder)
- Rows have a subtle green tint to signal active status
- Status badge: green pill with animated dot

---

## Footer

| Left | Right |
|------|-------|
| "View All Months →" link (text-brand) | Ongoing: position count · Realized P&L: summed closed return |

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

If no records exist for the selected month + tab combination, show a centred placeholder: "No records for this period."

---

## Seed / Mock Data

Initial implementation uses static mock records (same pattern as existing `seedDashboardData`). Records span at least two months so month navigation is testable.

---

## Out of Scope

- Add/Edit/Delete record forms (the Add Record button is present but non-functional in this iteration)
- Persistence to the API or database
- "View All Months" pagination view
