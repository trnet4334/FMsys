'use client';

import {
  ArrowUpRight,
  Banknote,
  Bitcoin,
  Briefcase,
  Globe,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { fmtCurrency } from '../../lib/format';

// ── Data ──────────────────────────────────────────────────────────────────────

const ASSET_CLASSES = [
  {
    Icon: TrendingUp,
    iconBg: 'bg-brand-weak',
    iconColor: 'text-brand',
    label: 'Stock',
    sublabel: 'Equity & ETFs',
    value: 163261,
    pct: 66.7,
    change: +8.2,
    barColor: 'bg-brand',
    glowColor: 'rgba(0,102,255,0.3)',
  },
  {
    Icon: Bitcoin,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    label: 'Crypto',
    sublabel: 'Digital Assets',
    value: 40003,
    pct: 16.3,
    change: -4.3,
    barColor: 'bg-violet-500',
    glowColor: 'rgba(139,92,246,0.3)',
  },
  {
    Icon: Globe,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    label: 'Forex',
    sublabel: 'FX & International',
    value: 22048,
    pct: 9.0,
    change: +1.2,
    barColor: 'bg-sky-500',
    glowColor: 'rgba(14,165,233,0.3)',
  },
  {
    Icon: Banknote,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    label: 'Cash',
    sublabel: 'Savings & TWD',
    value: 19590,
    pct: 8.0,
    change: 0,
    barColor: 'bg-emerald-500',
    glowColor: 'rgba(16,185,129,0.3)',
  },
];

const TOTAL_PORTFOLIO = ASSET_CLASSES.reduce((s, a) => s + a.value, 0);

const CATEGORY_PERF = [...ASSET_CLASSES]
  .sort((a, b) => b.change - a.change)
  .map(({ label, sublabel, change, barColor }) => ({ label, sublabel, change, barColor }));

// ── Component ─────────────────────────────────────────────────────────────────

export function InvestmentReportSection() {
  return (
    <section className="space-y-6">

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Briefcase size={16} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-ink-0 tracking-tight">Investment</h2>
      </div>

      {/* ── Top KPI row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total portfolio */}
        <div className="sm:col-span-1 relative overflow-hidden bg-card rounded-2xl border border-line px-6 py-5">
          <div className="pointer-events-none absolute -top-6 -right-6 size-24 bg-brand/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-3">Total Portfolio</p>
          <p className="text-2xl font-black text-ink-0 tabular-nums">TWD {fmtCurrency.format(TOTAL_PORTFOLIO)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <ArrowUpRight size={12} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-500">+18.4% YTD</span>
          </div>
        </div>

        {/* Unrealized gain */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-line px-6 py-5">
          <div className="pointer-events-none absolute -top-6 -right-6 size-24 bg-emerald-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-3">Unrealized Gain</p>
          <p className="text-2xl font-black text-emerald-500 tabular-nums">+TWD {fmtCurrency.format(38420)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-ink-disabled">Across all positions</span>
          </div>
        </div>

        {/* Best performer */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-line px-6 py-5">
          <div className="pointer-events-none absolute -top-6 -right-6 size-24 bg-violet-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-3">Best Performer</p>
          <p className="text-2xl font-black text-ink-0">NVDA</p>
          <div className="flex items-center gap-1.5 mt-2">
            <ArrowUpRight size={12} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-500">+12.3% this month</span>
          </div>
        </div>
      </div>

      {/* ── Allocation + Category Performance ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Asset allocation — 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-5 border-b border-line bg-bg-1/40">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Asset Allocation</h3>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            {ASSET_CLASSES.map(({ Icon, iconBg, iconColor, label, sublabel, value, pct, change, barColor }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-8 rounded-lg ${iconBg} border border-line flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-ink-0 truncate">{label}</span>
                        <span className="text-[10px] text-ink-disabled ml-1.5">{sublabel}</span>
                      </div>
                      <span className="text-xs font-black text-ink-0 tabular-nums ml-2 shrink-0">{pct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ink-disabled tabular-nums">TWD {fmtCurrency.format(value)}</span>
                      <span className={`text-[10px] font-bold tabular-nums ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : 'text-ink-disabled'}`}>
                        {change > 0 ? '+' : ''}{change === 0 ? '—' : `${change}%`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-bg-1 rounded-full overflow-hidden border border-line/50">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance — 1 col */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-line overflow-hidden">
          <div className="px-6 py-5 border-b border-line bg-bg-1/40">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Category Performance</h3>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            {CATEGORY_PERF.map(({ label, sublabel, change, barColor }, rank) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-ink-disabled w-4 shrink-0 tabular-nums">#{rank + 1}</span>
                <div className={`size-2 rounded-full shrink-0 ${barColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink-0 truncate">{label}</p>
                  <p className="text-[10px] text-ink-disabled truncate">{sublabel}</p>
                </div>
                <span className={`text-xs font-black tabular-nums shrink-0 ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : 'text-ink-disabled'}`}>
                  {change > 0 ? '+' : ''}{change === 0 ? '—' : `${change}%`}
                </span>
                {change > 0 && <ArrowUpRight size={12} className="text-emerald-500 shrink-0" />}
                {change < 0 && <TrendingDown size={12} className="text-rose-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
