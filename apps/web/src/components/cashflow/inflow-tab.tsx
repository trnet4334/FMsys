'use client';

import { Banknote, ChevronLeft, ChevronRight, Landmark, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { fmtCurrency } from '../../lib/format';
import { AllInflowModal } from './all-inflow-modal';

const CHART_DATA_RAW = [
  { val: 28500, label: 'Jan' },
  { val: 38200, label: 'Feb' },
  { val: 31400, label: 'Mar' },
  { val: 41800, label: 'Apr' },
  { val: 29600, label: 'May' },
  { val: 52800, label: 'Jun' },
];
const _maxVal    = Math.max(...CHART_DATA_RAW.map((d) => d.val));
const CHART_DATA = CHART_DATA_RAW.map((d) => ({ ...d, h: Math.round((d.val / _maxVal) * 100) }));
const fmtK = (v: number) => `${(v / 1000).toFixed(0)}K`;

const SOURCES = [
  { label: 'Salary',    pct: 65, color: 'bg-brand'         },
  { label: 'Dividends', pct: 20, color: 'bg-emerald-500'   },
  { label: 'Gift',      pct: 10, color: 'bg-amber-500'     },
  { label: 'Others',    pct:  5, color: 'bg-ink-disabled'  },
];

const RECENT_INFLOWS = [
  {
    Icon: Banknote,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    label: 'Monthly Salary – TechCorp',
    sub: 'Jun 28, 2024 · 09:15 AM',
    amount: 8450,
    status: 'Cleared',
    statusColor: 'text-emerald-500',
  },
  {
    Icon: Landmark,
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    label: 'Quarterly Dividend – AAPL',
    sub: 'Jun 24, 2024 · 02:30 PM',
    amount: 1240.50,
    status: 'Cleared',
    statusColor: 'text-emerald-500',
  },
  {
    Icon: TrendingUp,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    label: 'Gift Transfer – Family',
    sub: 'Jun 20, 2024 · 11:00 AM',
    amount: 500,
    status: 'Cleared',
    statusColor: 'text-emerald-500',
  },
  {
    Icon: Banknote,
    iconBg: 'bg-ink-1/10',
    iconColor: 'text-ink-disabled',
    label: 'Contract Bonus – Project X',
    sub: 'Jun 15, 2024 · 04:45 PM',
    amount: 2100,
    status: 'Pending',
    statusColor: 'text-warn',
  },
];

function fmtDate(d: Date) {
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function InflowTab() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [allInflowOpen, setAllInflowOpen] = useState(false);

  const now      = new Date();
  const month    = now.getMonth() + monthOffset;
  const firstDay = new Date(now.getFullYear(), month, 1);
  const lastDay  = new Date(now.getFullYear(), month + 1, 0);

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

      {/* Bento top row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Monthly Revenue — 8/12 */}
        <section className="md:col-span-8 relative overflow-hidden bg-card rounded-2xl border border-line p-8">
          <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full -mr-24 -mt-24" />
          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest mb-2">Monthly Revenue</p>
                <h2 className="text-[3rem] font-black tracking-tight text-ink-0 leading-none">
                  TWD {fmtCurrency.format(42580)}
                </h2>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <TrendingUp size={13} />
                +12.4%
              </span>
            </div>

            {/* Bar chart */}
            <div className="h-48 w-full flex items-end gap-2 mt-8 pt-5">
              {CHART_DATA.map(({ h, val, label }, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0 h-full">
                  <div
                    className={`flex-1 relative w-full rounded-t-lg transition-all ${
                      i === CHART_DATA.length - 1
                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_-4px_20px_rgba(16,185,129,0.35)]'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/40'
                    }`}
                    style={{ height: `${h}%` }}
                  >
                    <span className={`absolute -top-4 w-full text-center text-[8px] font-bold tabular-nums ${i === CHART_DATA.length - 1 ? 'text-emerald-500' : 'text-emerald-500/50'}`}>
                      {fmtK(val)}
                    </span>
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-ink-disabled uppercase tracking-tighter">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Source Distribution — 4/12 */}
        <section className="md:col-span-4 bg-card rounded-2xl border border-line p-8 flex flex-col">
          <h3 className="text-base font-bold text-ink-0 mb-8">Source Distribution</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {SOURCES.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-ink-0">{label}</span>
                  <span className="text-ink-disabled">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-1 rounded-full overflow-hidden border border-line">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Inflow */}
      <section className="bg-card rounded-2xl border border-line overflow-hidden">
        <div className="px-8 py-5 border-b border-line flex items-center">
          <h3 className="text-base font-bold text-ink-0">Recent Inflow</h3>
        </div>
        <div className="divide-y divide-line">
          {RECENT_INFLOWS.map(({ Icon, iconBg, iconColor, label, sub, amount, status, statusColor }) => (
            <div key={label} className="px-8 py-4 flex items-center justify-between hover:bg-bg-1/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl ${iconBg} border border-line flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-0">{label}</p>
                  <p className="text-[10px] text-ink-disabled font-semibold uppercase tracking-wider mt-0.5">{sub}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500">+TWD {fmtCurrency.format(amount)}</p>
                <p className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${statusColor}`}>{status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-8 py-3 bg-bg-1/50 border-t border-line flex justify-center">
          <button
            type="button"
            onClick={() => setAllInflowOpen(true)}
            className="text-[10px] font-extrabold uppercase tracking-widest text-ink-disabled hover:text-ink-0 transition-colors"
          >
            View All Inflow Transactions
          </button>
        </div>
      </section>

    </div>

    {allInflowOpen && <AllInflowModal onClose={() => setAllInflowOpen(false)} />}
    </>
  );
}
