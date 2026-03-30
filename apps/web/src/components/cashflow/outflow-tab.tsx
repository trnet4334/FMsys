'use client';

import { Car, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { fmtCurrency } from '../../lib/format';
import { AllOutflowModal } from './all-outflow-modal';

// ── Static data ────────────────────────────────────────────────────────────────

const CHART_DATA = [
  { h: 40, val: 2100 },
  { h: 60, val: 3200 },
  { h: 45, val: 2400 },
  { h: 70, val: 3750 },
  { h: 90, val: 4820 },
  { h: 100, val: 5350 },
  { h: 20, val: 1070 },
];
const fmtK = (v: number) => `${(v / 1000).toFixed(1)}K`;

const CATEGORIES = [
  { label: 'Housing',       amount: 2400,   pct: 49, color: 'bg-brand'      },
  { label: 'Food & Dining', amount:  850.20, pct: 17, color: 'bg-amber-500' },
  { label: 'Transport',     amount:  420,    pct:  8, color: 'bg-rose-500'  },
];

// Circumference-based donut (r=15.915 → circumference≈100, percentage-friendly)
const DONUT_SEGMENTS = [
  { pct: 60, offset:   0, color: '#0066ff' },
  { pct: 21, offset: -60, color: '#f59e0b' },
  { pct: 11, offset: -81, color: '#ef4444' },
  { pct:  8, offset: -92, color: '#a855f7' },
];

const ACCOUNT_SEGS = [
  { pct: 55, color: '#0066ff' },
  { pct: 30, color: '#f59e0b' },
  { pct: 15, color: '#ef4444' },
];

const ACCOUNTS = [
  { dot: 'bg-brand',     label: 'Credit Card',      amount: 2690.82 },
  { dot: 'bg-amber-500', label: 'Checking Account', amount: 1467.72 },
  { dot: 'bg-rose-500',  label: 'Savings Account',  amount:  733.86 },
];

const RECENT = [
  { Icon: ShoppingCart, label: 'Whole Foods Market', sub: 'Today, 2:45 PM · Groceries', amount: 124.50 },
  { Icon: Car,          label: 'Shell Gasoline',      sub: 'Yesterday · Transport',       amount:  65.00 },
];

const RANKING = [
  { rank: '01', label: 'Monthly Rent Payment', sub: 'Housing · Oct 01',  amount: 2100    },
  { rank: '02', label: 'Apple Store',           sub: 'Tech · Oct 12',     amount:  899    },
  { rank: '03', label: 'Delta Airlines',        sub: 'Travel · Oct 05',   amount:  425.20 },
  { rank: '04', label: 'Peloton Digital',       sub: 'Health · Oct 15',   amount:  144    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DonutSVG({ segments, size = 192, label }: {
  segments: typeof DONUT_SEGMENTS;
  size?: number;
  label?: { top: string; bottom: string };
}) {
  const r = 15.915;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#1e293b" strokeWidth="4" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="21" cy="21" r={r}
            fill="transparent"
            stroke={s.color}
            strokeWidth="4"
            strokeDasharray={`${s.pct} ${100 - s.pct}`}
            strokeDashoffset={s.offset}
          />
        ))}
      </svg>
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-ink-disabled font-bold uppercase tracking-widest">{label.top}</span>
          <span className="text-xl font-black text-ink-0">{label.bottom}</span>
        </div>
      )}
    </div>
  );
}

// Account donut with percentage labels on each arc segment.
// Uses viewBox 60×60, ring r=21. Text is counter-rotated (+90°) to
// cancel the CSS -rotate-90 applied to the SVG element.
function AccountDonut() {
  const cx = 30, cy = 30, r = 21;
  const circ = 2 * Math.PI * r; // ≈ 131.95

  let cumPct = 0;
  const segs = ACCOUNT_SEGS.map((s) => {
    const dashLen    = (s.pct / 100) * circ;
    const dashOffset = -(cumPct / 100) * circ;
    const midDeg     = (cumPct + s.pct / 2) * 3.6; // degrees from top, clockwise
    const rad        = (midDeg * Math.PI) / 180;
    const lx         = cx + r * Math.sin(rad);
    const ly         = cy - r * Math.cos(rad);
    cumPct += s.pct;
    return { ...s, dashLen, dashOffset, lx, ly };
  });

  return (
    <div className="flex justify-center py-2">
      <svg className="-rotate-90" width="160" height="160" viewBox="0 0 60 60">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="#1e293b" strokeWidth="5" />
        {/* Segments */}
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="transparent"
            stroke={s.color}
            strokeWidth="5"
            strokeDasharray={`${s.dashLen} ${circ - s.dashLen}`}
            strokeDashoffset={s.dashOffset}
          />
        ))}
        {/* Percentage labels — counter-rotated so they appear upright */}
        {segs.map((s, i) => (
          <text
            key={i}
            x={s.lx}
            y={s.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="2.8"
            fontWeight="700"
            transform={`rotate(90, ${s.lx}, ${s.ly})`}
          >
            {s.pct}%
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function OutflowTab() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [allOutflowOpen, setAllOutflowOpen] = useState(false);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + monthOffset;

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const rangeLabel = `${fmtDate(firstDay)} – ${fmtDate(lastDay)}`;

  return (
    <>
    <div className="space-y-6">

      {/* Month navigator */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          className="size-8 flex items-center justify-center rounded-lg bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:bg-card transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold text-ink-0">{monthLabel}</p>
          <p className="text-[11px] text-ink-disabled font-medium">{rangeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o + 1)}
          className="size-8 flex items-center justify-center rounded-lg bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:bg-card transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Top row — 2/3 summary + 1/3 budget ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Monthly Outflow — 2/3 */}
        <div className="md:col-span-2 relative overflow-hidden bg-card rounded-2xl border border-line p-8 flex flex-col justify-between">
          <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full -mr-24 -mt-24" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Monthly Outflow</p>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold text-rose-500">
                <TrendingUp size={12} />
                12.5%
              </span>
            </div>
            <div className="text-[3rem] font-black tracking-tight text-ink-0 leading-none">
              TWD {fmtCurrency.format(4892.40)}
            </div>
            <p className="text-ink-1 text-sm mt-2">Spent across 42 transactions this month</p>
          </div>
          <div className="h-32 w-full flex items-end gap-1 mt-8 pt-5">
            {CHART_DATA.map(({ h, val }, i) => (
              <div
                key={i}
                className={`flex-1 relative rounded-t-md transition-colors ${
                  i === 5
                    ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-[0_-4px_16px_rgba(239,68,68,0.35)]'
                    : 'bg-rose-500/20 hover:bg-rose-500/40'
                }`}
                style={{ height: `${h}%` }}
              >
                <span className={`absolute -top-4 w-full text-center text-[8px] font-bold tabular-nums ${i === 5 ? 'text-rose-500' : 'text-rose-500/50'}`}>
                  {fmtK(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget ring — 1/3 */}
        <div className="bg-card rounded-2xl border border-line p-8 flex flex-col items-center justify-center text-center">
          <div className="relative size-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" fill="transparent" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="64" cy="64" r="58"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray="364.4"
                strokeDashoffset="100"
                className="drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-ink-0">72%</span>
              <span className="text-[10px] text-ink-disabled font-bold uppercase tracking-widest">Budget</span>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-bold text-ink-0 text-lg">Safe to Spend</h3>
            <p className="text-ink-1 text-sm mt-1">TWD {fmtCurrency.format(1200)} remaining</p>
          </div>
          <button
            type="button"
            className="mt-6 w-full py-3 bg-bg-1 border border-line rounded-xl text-ink-0 font-bold text-sm hover:bg-card transition-colors"
          >
            Adjust Limits
          </button>
        </div>
      </div>

      {/* Middle row — category breakdown + recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Category Breakdown — 1/3 */}
        <div className="bg-card rounded-2xl border border-line p-8 space-y-6">
          <h3 className="text-base font-bold text-ink-0 tracking-tight">Category Breakdown</h3>
          <div className="flex justify-center py-2">
            <DonutSVG segments={DONUT_SEGMENTS} label={{ top: 'Total', bottom: `TWD ${fmtCurrency.format(3980)}` }} />
          </div>
          <div className="space-y-5">
            {CATEGORIES.map(({ label, amount, pct, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-ink-disabled">{label}</span>
                  <span className="text-ink-0">TWD {fmtCurrency.format(amount)}</span>
                </div>
                <div className="w-full h-1.5 bg-bg-1 rounded-full border border-line overflow-hidden">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity — 2/3 */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-5 border-b border-line flex justify-between items-center">
            <h3 className="text-base font-bold text-ink-0 tracking-tight">Recent Activity</h3>
            <button
              type="button"
              onClick={() => setAllOutflowOpen(true)}
              className="text-brand text-xs font-bold uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-line">
            {RECENT.map(({ Icon, label, sub, amount }) => (
              <div key={label} className="p-5 flex items-center justify-between hover:bg-bg-1/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-bg-1 border border-line flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-ink-1" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-0">{label}</p>
                    <p className="text-ink-disabled text-xs">{sub}</p>
                  </div>
                </div>
                <span className="text-rose-500 font-black text-sm">−TWD {fmtCurrency.format(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — expense by account + monthly ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Expense by Account */}
        <div className="bg-card rounded-2xl border border-line p-8 space-y-6">
          <h3 className="text-base font-bold text-ink-0 tracking-tight">Expense by Account</h3>
          <AccountDonut />
          <div className="space-y-4">
            {ACCOUNTS.map(({ dot, label, amount }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`size-3 rounded-full ${dot}`} />
                  <span className="text-sm font-medium text-ink-1">{label}</span>
                </div>
                <span className="text-sm font-bold text-ink-0">TWD {fmtCurrency.format(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Transaction Ranking */}
        <div className="bg-card rounded-2xl border border-line overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-line">
            <h3 className="text-base font-bold text-ink-0 tracking-tight">Monthly Transaction Ranking</h3>
          </div>
          <div className="divide-y divide-line flex-1">
            {RANKING.map(({ rank, label, sub, amount }) => (
              <div key={rank} className="p-5 flex items-center justify-between hover:bg-bg-1/60 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-line w-6 shrink-0">{rank}</span>
                  <div>
                    <p className="text-sm font-bold text-ink-0">{label}</p>
                    <p className="text-ink-disabled text-xs">{sub}</p>
                  </div>
                </div>
                <span className="text-rose-500 font-black text-sm shrink-0">−TWD {fmtCurrency.format(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>

    {allOutflowOpen && <AllOutflowModal onClose={() => setAllOutflowOpen(false)} />}
    </>
  );
}
