# Investment Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Investment Records section to the Allocation page (`/allocation`) that shows monthly P&L entries per investment, split into 已結束 (Closed) and 未結束 (Ongoing) sections with tab filtering and month navigation.

**Architecture:** Pure client-side feature — seed data is loaded once in the page component and passed as a prop to a new `InvestmentRecords` component. All filtering (by month and type) happens in-component via derived values. No API changes.

**Tech Stack:** Next.js App Router, TypeScript strict, Tailwind CSS (design tokens), Lucide React icons.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `apps/web/src/lib/mock-data/investment-records.ts` | `InvestmentRecord` type + `seedInvestmentRecords()` seed function |
| Create | `apps/web/src/components/allocation/investment-records.tsx` | Full Investment Records UI component |
| Modify | `apps/web/app/allocation/page.tsx` | Import seed + render `<InvestmentRecords>` below the grid |

---

## Task 1: Seed data and type

**Files:**
- Create: `apps/web/src/lib/mock-data/investment-records.ts`

- [x] **Step 1: Create the file with type and seed data**

```typescript
// apps/web/src/lib/mock-data/investment-records.ts

export type InvestmentRecord = {
  id: string;
  date: string;       // ISO date string e.g. "2025-03-18"
  name: string;       // Ticker / instrument e.g. "NVDA", "BTC", "USD/JPY"
  subName?: string;   // Optional description e.g. "NVIDIA Corp."
  type: 'Stock' | 'Crypto' | 'Forex' | 'Options';
  return?: number;    // Absolute P&L (TWD) — omit when status is 'ongoing'
  returnPct?: number; // e.g. 0.082 = 8.2% — omit when status is 'ongoing'
  status: 'closed' | 'ongoing';
};

export function seedInvestmentRecords(): InvestmentRecord[] {
  return [
    // ── March 2025 ────────────────────────────────────────────────
    { id: 'inv-1', date: '2025-03-25', name: 'AAPL 200C', subName: 'Call Option · Mar expiry', type: 'Options', return: 320,  returnPct:  0.125, status: 'closed'  },
    { id: 'inv-2', date: '2025-03-10', name: 'TSLA',      subName: 'Tesla Inc.',                type: 'Stock',   return: 680,  returnPct:  0.057, status: 'closed'  },
    { id: 'inv-3', date: '2025-03-03', name: 'USD/JPY',   subName: 'Forex',                     type: 'Forex',   return: -95,  returnPct: -0.011, status: 'closed'  },
    { id: 'inv-4', date: '2025-03-18', name: 'NVDA',      subName: 'NVIDIA Corp.',              type: 'Stock',                                    status: 'ongoing' },
    { id: 'inv-5', date: '2025-03-12', name: 'BTC',       subName: 'Bitcoin',                   type: 'Crypto',                                   status: 'ongoing' },
    // ── February 2025 ─────────────────────────────────────────────
    { id: 'inv-6', date: '2025-02-22', name: 'ETH',       subName: 'Ethereum',                  type: 'Crypto',  return: -156, returnPct: -0.032, status: 'closed'  },
    { id: 'inv-7', date: '2025-02-14', name: 'MSFT',      subName: 'Microsoft Corp.',           type: 'Stock',   return: 910,  returnPct:  0.063, status: 'closed'  },
    { id: 'inv-8', date: '2025-02-05', name: 'EUR/USD',   subName: 'Forex',                     type: 'Forex',                                    status: 'ongoing' },
  ];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Note: `npx tsc --noEmit` is currently blocked by pre-existing repo-wide TypeScript issues outside this feature, including missing declaration files for existing JS modules and existing implicit `any` errors on other pages.

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Note: not committed in this pass because the worktree already contains many unrelated local changes.

```bash
git add apps/web/src/lib/mock-data/investment-records.ts
git commit -m "feat: add investment records seed data and type"
```

---

## Task 2: InvestmentRecords component

**Files:**
- Create: `apps/web/src/components/allocation/investment-records.tsx`

- [x] **Step 1: Create the component skeleton**

```tsx
// apps/web/src/components/allocation/investment-records.tsx
'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { InvestmentRecord } from '../../lib/mock-data/investment-records';

type Tab = 'all' | 'Stock' | 'Crypto' | 'Forex' | 'Options';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'Stock',   label: 'Stock'   },
  { key: 'Crypto',  label: 'Crypto'  },
  { key: 'Forex',   label: 'Forex'   },
  { key: 'Options', label: 'Options' },
];

const TYPE_STYLE: Record<Exclude<Tab, 'all'>, string> = {
  Stock:   'bg-brand/10 text-brand',
  Crypto:  'bg-violet-500/10 text-violet-400',
  Forex:   'bg-sky-500/10 text-sky-400',
  Options: 'bg-warn/10 text-warn',
};

type Props = { records: InvestmentRecord[] };

export function InvestmentRecords({ records }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());     // 0-indexed
  const [year,  setYear]  = useState(now.getFullYear());
  const [tab,   setTab]   = useState<Tab>('all');

  // ── Derived ──────────────────────────────────────────────────────
  const monthRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const filtered = tab === 'all'
    ? monthRecords
    : monthRecords.filter((r) => r.type === tab);

  const closed  = filtered.filter((r) => r.status === 'closed');
  const ongoing = filtered.filter((r) => r.status === 'ongoing');

  const realizedPnL = closed.reduce((s, r) => s + (r.return ?? 0), 0);

  // Tab badge counts — always scoped to current month regardless of active tab
  function countForTab(t: Tab) {
    return t === 'all'
      ? monthRecords.length
      : monthRecords.filter((r) => r.type === t).length;
  }

  // ── Month navigation ─────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else { setMonth((m) => m - 1); }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else { setMonth((m) => m + 1); }
  }

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Helpers ──────────────────────────────────────────────────────
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtPnL(val: number) {
    const sign = val >= 0 ? '+' : '−';
    return `${sign}$${Math.abs(val).toLocaleString()}`;
  }
  function fmtPct(val: number) {
    const sign = val >= 0 ? '+' : '−';
    return `${sign}${(Math.abs(val) * 100).toFixed(1)}%`;
  }
  function pnlColor(val: number) {
    return val >= 0 ? 'text-success' : 'text-danger';
  }

  return (
    <div className="bg-card rounded-xl border border-line shadow-soft overflow-hidden mt-8">

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-0 border-b border-line">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-ink-0 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand" />
            Investment Records
          </h3>
          <div className="flex items-center gap-3">
            {/* Month navigator */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-bg-1 border border-line rounded-lg">
              <button
                type="button"
                onClick={prevMonth}
                className="w-5 h-5 flex items-center justify-center text-ink-1 hover:text-ink-0 transition-colors text-sm"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-ink-0 min-w-[110px] text-center">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-5 h-5 flex items-center justify-center text-ink-1 hover:text-ink-0 transition-colors text-sm"
              >
                ›
              </button>
            </div>
            {/* Add button — non-functional in this iteration */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-soft"
            >
              + Add Record
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(({ key, label }) => {
            const count = countForTab(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`relative px-4 py-2.5 text-sm font-semibold rounded-t transition-colors
                  ${tab === key ? 'text-brand' : 'text-ink-1 hover:text-ink-0'}`}
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full">
                    {count}
                  </span>
                )}
                {tab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-ink-1 text-sm">
          No records for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-bg-0/30">
                {['Date', 'Name', 'Type', 'Return', 'Return %', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-bold text-ink-1 uppercase tracking-wider ${i >= 3 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">

              {/* ── 已結束 section ── */}
              {closed.length > 0 && (
                <>
                  <tr>
                    <td colSpan={6} className="px-5 py-2 bg-bg-1/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-ink-disabled" />
                        <span className="text-[11px] font-bold text-ink-1 uppercase tracking-wider">
                          已結束 · Closed
                        </span>
                        <span className="text-[11px] text-ink-disabled ml-auto">
                          {closed.length} {closed.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {closed.map((r) => (
                    <tr key={r.id} className="hover:bg-bg-1 transition-colors">
                      <td className="px-5 py-4 text-ink-1 text-xs">{fmtDate(r.date)}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink-0">{r.name}</p>
                        {r.subName && <p className="text-xs text-ink-1 mt-0.5">{r.subName}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${TYPE_STYLE[r.type]}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-bold ${pnlColor(r.return ?? 0)}`}>
                        {r.return !== undefined ? fmtPnL(r.return) : '—'}
                      </td>
                      <td className={`px-5 py-4 text-right font-bold ${pnlColor(r.returnPct ?? 0)}`}>
                        {r.returnPct !== undefined ? fmtPct(r.returnPct) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-bg-1 text-ink-1 text-[11px] font-bold">
                          已結束
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* ── 未結束 section ── */}
              {ongoing.length > 0 && (
                <>
                  <tr>
                    <td colSpan={6} className="px-5 py-2 bg-success/5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                          未結束 · Ongoing
                        </span>
                        <span className="text-[11px] text-ink-disabled ml-auto">
                          {ongoing.length} {ongoing.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {ongoing.map((r) => (
                    <tr key={r.id} className="bg-success/5 hover:bg-success/10 transition-colors">
                      <td className="px-5 py-4 text-ink-1 text-xs">{fmtDate(r.date)}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink-0">{r.name}</p>
                        {r.subName && <p className="text-xs text-ink-1 mt-0.5">{r.subName}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${TYPE_STYLE[r.type]}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-ink-disabled">—</td>
                      <td className="px-5 py-4 text-right text-ink-disabled">—</td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          未結束
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}

            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-line flex items-center justify-between">
        <span className="text-sm font-bold text-ink-disabled cursor-not-allowed">
          View All Months →
        </span>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-1 uppercase tracking-wider">Ongoing</p>
            <p className="text-sm font-bold text-ink-0 mt-0.5">
              {ongoing.length} {ongoing.length === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-1 uppercase tracking-wider">Realized P&L</p>
            <p className={`text-sm font-bold mt-0.5 ${realizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
              {fmtPnL(realizedPnL)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Note: blocked by the same pre-existing repo-wide TypeScript issues noted above.

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Note: not committed in this pass because the worktree already contains many unrelated local changes.

```bash
git add apps/web/src/components/allocation/investment-records.tsx
git commit -m "feat: add InvestmentRecords component"
```

---

## Task 3: Wire into Allocation page

**Files:**
- Modify: `apps/web/app/allocation/page.tsx`

- [x] **Step 1: Add imports at the top of the file**

In `apps/web/app/allocation/page.tsx`, add to the existing import block:

```tsx
import { InvestmentRecords } from '../../src/components/allocation/investment-records';
import { seedInvestmentRecords } from '../../src/lib/mock-data/investment-records';
```

- [x] **Step 2: Load seed data inside the page component**

Inside `AllocationPage()`, after the existing `const { allocation } = ...` line, add:

```tsx
const investmentRecords = seedInvestmentRecords();
```

- [x] **Step 3: Render the component**

In the JSX, between the closing `</div>` of the content grid and the `{/* ── Strategy banner */}` comment, add:

```tsx
{/* ── Investment Records ─────────────────────────────── */}
<InvestmentRecords records={investmentRecords} />
```

- [ ] **Step 4: Verify TypeScript compiles**

Note: blocked by the same pre-existing repo-wide TypeScript issues noted above.

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify visually**

Note: `npm run dev` starts successfully, but `/allocation` currently redirects to `/login?next=%2Fallocation`, so browserless visual verification is blocked without an authenticated session.

```bash
# From repo root
npm run dev
```

Open http://localhost:4010/allocation. Verify:
- Investment Records section appears below the two-column grid
- Tabs (All, Stock, Crypto, Forex, Options) render with correct badge counts
- 已結束 rows appear on top with Return / Return % values
- 未結束 rows appear below with `—` in Return columns and green tint + pulsing dot
- Month navigator left arrow → switches to February 2025 (shows 3 records)
- Month navigator on an empty month → shows "No records for this period."
- Strategy banner still visible below

- [ ] **Step 6: Commit**

Note: not committed in this pass because the worktree already contains many unrelated local changes.

```bash
git add apps/web/app/allocation/page.tsx
git commit -m "feat: wire InvestmentRecords into allocation page"
```
