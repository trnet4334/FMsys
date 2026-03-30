import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Bitcoin,
  Brain,
  Crosshair,
  Globe,
  Minus,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { AppShell } from '../../src/components/layout/app-shell';
import { fmt } from '../../src/lib/format';
import { adaptDashboardData } from '../../src/lib/mock-data/adapters';
import { seedDashboardData } from '../../src/lib/mock-data/seed';
import { InvestmentRecords } from '../../src/components/allocation/investment-records';
import { seedInvestmentRecords } from '../../src/lib/mock-data/investment-records';

// ── Types ────────────────────────────────────────────────────────────────────

type Trend = { pct: number; dir: 'up' | 'down' | 'flat' };

type TargetRow = { category: string; target: number };

const TARGET_ALLOCATIONS: TargetRow[] = [
  { category: 'Stock',  target: 60 },
  { category: 'Cash',   target: 20 },
  { category: 'Crypto', target: 10 },
  { category: 'Forex',  target: 10 },
];

function driftColorClass(diff: number): string {
  const abs = Math.abs(diff);
  if (abs <= 2) return 'text-emerald-500 bg-emerald-500/10';
  if (abs <= 5) return 'text-amber-500 bg-amber-500/10';
  return 'text-rose-500 bg-rose-500/10';
}

const CIRC = 2 * Math.PI * 40; // r=40

// ── Per-category display config ───────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { Icon: React.ComponentType<{ size?: number; className?: string }>; iconClass: string; bgClass: string; desc: string; chartColor: string; trend: Trend }
> = {
  Stock:  { Icon: TrendingUp, iconClass: 'text-brand',       bgClass: 'bg-brand-weak',        desc: 'Equity & ETFs',         chartColor: 'var(--brand)',  trend: { pct: 8.2,  dir: 'up'   } },
  Cash:   { Icon: Banknote,   iconClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10',    desc: 'Savings & TWD',         chartColor: '#10b981',       trend: { pct: 0.0,  dir: 'flat' } },
  Crypto: { Icon: Bitcoin,    iconClass: 'text-violet-500',  bgClass: 'bg-violet-500/10',     desc: 'Digital Assets',        chartColor: '#8b5cf6',       trend: { pct: 4.3,  dir: 'down' } },
  Forex:  { Icon: Globe,      iconClass: 'text-sky-500',     bgClass: 'bg-sky-500/10',        desc: 'FX & International',    chartColor: '#0ea5e9',       trend: { pct: 1.2,  dir: 'up'   } },
};

function fallbackConfig(color: string): typeof CATEGORY_CONFIG[string] {
  return { Icon: TrendingUp, iconClass: 'text-ink-1', bgClass: 'bg-bg-1', desc: '', chartColor: color, trend: { pct: 0, dir: 'flat' } };
}

// ── Donut chart helpers ───────────────────────────────────────────────────────

type Segment = { dasharray: string; dashoffset: number; color: string };

function buildDonut(slices: { pct: number; chartColor: string }[]): Segment[] {
  let offset = 0;
  return slices.map(({ pct, chartColor }) => {
    const dash = pct * CIRC;
    const seg: Segment = { dasharray: `${dash.toFixed(2)} ${CIRC.toFixed(2)}`, dashoffset: -offset, color: chartColor };
    offset += dash;
    return seg;
  });
}


// ── Page ─────────────────────────────────────────────────────────────────────

export default function AllocationPage() {
  const { allocation } = adaptDashboardData(seedDashboardData());
  const investmentRecords = seedInvestmentRecords();

  const totalValue = allocation.reduce((s, a) => s + a.amount, 0);
  const largestSlice = allocation.reduce((a, b) => (a.pct > b.pct ? a : b));

  const donutSlices = allocation.map((s) => ({
    pct: s.pct,
    chartColor: (CATEGORY_CONFIG[s.category] ?? fallbackConfig('#888')).chartColor,
  }));
  const segments = buildDonut(donutSlices);

  const totalValueDisplay = totalValue >= 1_000_000
    ? `TWD ${(totalValue / 1_000_000).toFixed(2)}M`
    : `TWD ${(totalValue / 1_000).toFixed(0)}K`;

  return (
    <AppShell>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-line bg-card">
        <div className="pointer-events-none absolute -top-16 -left-16 size-64 bg-brand/15 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-56 bg-violet-500/10 blur-[70px] rounded-full" />
        <div className="pointer-events-none absolute top-0 right-1/3 size-40 bg-emerald-500/8 blur-[60px] rounded-full" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, var(--ink-0) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-weak border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand mb-4">
                <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                Portfolio Management
              </span>
              <h1 className="text-4xl font-black tracking-tight text-ink-0 leading-none">Asset Allocation</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-brand/8 border border-brand/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-brand/70 uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-xl font-black text-brand tabular-nums">{totalValueDisplay}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Monthly Change</p>
                <p className="text-xl font-black text-emerald-400 tabular-nums">+12.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Donut chart card — 5 cols */}
        <div className="lg:col-span-5 relative bg-card rounded-2xl overflow-hidden border border-line shadow-soft">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-40 bg-brand/10 blur-3xl rounded-full" />

          {/* Card header */}
          <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(0,102,255,0.6)]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Distribution Overview</h3>
          </div>

          <div className="px-8 py-8">
            {/* Donut */}
            <div className="relative flex items-center justify-center aspect-square max-w-[280px] mx-auto mb-8">
              {/* Radial glow behind chart */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-48 bg-brand/5 blur-2xl rounded-full" />
              </div>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.dasharray}
                    strokeDashoffset={seg.dashoffset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-ink-1 text-xs font-medium uppercase tracking-wider">Total Value</span>
                <span className="text-3xl font-black text-ink-0">
                  {totalValue >= 1_000_000
                    ? `$${(totalValue / 1_000_000).toFixed(2)}M`
                    : `$${(totalValue / 1_000).toFixed(0)}K`}
                </span>
              </div>
            </div>

            {/* Category legend */}
            <div className="space-y-3">
              {(['Stock', 'Cash', 'Crypto', 'Forex'] as const).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const slice = allocation.find((a) => a.category === cat);
                const pctDisplay = slice ? (slice.pct * 100).toFixed(0) : '0';
                const isLargest = largestSlice.category === cat;
                return (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-bg-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ background: cfg.chartColor, boxShadow: `0 0 8px ${cfg.chartColor}80` }}
                      />
                      <span className="text-sm font-medium text-ink-0">{cat}</span>
                      {isLargest && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-weak text-brand border border-brand/20">
                          Largest
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-ink-0 tabular-nums">{pctDisplay}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asset details table — 7 cols */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-line shadow-soft overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Asset Details</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-1 font-medium">SORT BY</span>
              <select className="bg-transparent border-none text-xs font-bold text-brand focus:ring-0 cursor-pointer outline-none">
                <option>VALUE (HIGH-LOW)</option>
                <option>ALLOCATION %</option>
                <option>ALPHABETICAL</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-0/30">
                  {['Category', 'Current Value', 'Allocation', 'Trend'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-bold text-ink-1 uppercase tracking-wider ${i === 3 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {allocation.map((slice) => {
                  const cfg = CATEGORY_CONFIG[slice.category] ?? fallbackConfig('#888');
                  const { Icon, iconClass, bgClass, desc, trend, chartColor } = cfg;
                  const { pct: tPct, dir } = trend;

                  return (
                    <tr key={slice.category} className="hover:bg-bg-1 transition-colors">
                      {/* Category */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}
                            style={{ boxShadow: `0 0 12px ${chartColor}33` }}
                          >
                            <Icon size={18} className={iconClass} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-ink-0">{slice.category}</p>
                            <p className="text-xs text-ink-1">{desc}</p>
                          </div>
                        </div>
                      </td>
                      {/* Value */}
                      <td className="px-6 py-5 font-bold text-sm text-ink-0">
                        TWD {fmt.format(slice.amount)}
                      </td>
                      {/* Allocation bar */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-24 h-2 bg-bg-1 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${slice.pct * 100}%`,
                                background: chartColor,
                                boxShadow: `0 0 8px ${chartColor}60`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-ink-0">
                            {(slice.pct * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      {/* Trend */}
                      <td className="px-6 py-5 text-right">
                        {(() => {
                          const TrendIcon = dir === 'flat' ? Minus : dir === 'up' ? ArrowUp : ArrowDown;
                          const pillClass = dir === 'flat'
                            ? 'text-ink-1 bg-bg-1'
                            : dir === 'up'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : 'text-rose-500 bg-rose-500/10';
                          return (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${pillClass}`}>
                              <TrendIcon size={12} /> {tPct.toFixed(1)}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-line text-center">
            <Link href="#investment-records" className="text-sm font-bold text-brand hover:underline">
              View All Asset Sub-Categories
            </Link>
          </div>
        </div>
      </div>

      {/* ── Target vs Actual Allocation ─────────────────────────── */}
      {(() => {
        const rows = TARGET_ALLOCATIONS.map((t) => {
          const slice = allocation.find((a) => a.category === t.category);
          const actualPct = slice ? parseFloat((slice.pct * 100).toFixed(1)) : 0;
          const diff = parseFloat((actualPct - t.target).toFixed(1));
          const cfg = CATEGORY_CONFIG[t.category] ?? fallbackConfig('#888');
          return { ...t, actualPct, diff, cfg };
        });
        const outsideCount = rows.filter((r) => Math.abs(r.diff) > 2).length;

        return (
          <div className="bg-card rounded-2xl overflow-hidden border border-line shadow-soft mt-8">
            <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex items-center gap-2">
              <Crosshair size={15} className="text-brand" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Target vs Actual</h3>
            </div>

            <div className="px-6 py-6 space-y-6">
              {rows.map(({ category, target, actualPct, diff, cfg }) => {
                const badgeClass = driftColorClass(diff);
                const sign = diff > 0 ? '+' : '';
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${cfg.bgClass}`}>
                          <cfg.Icon size={14} className={cfg.iconClass} />
                        </div>
                        <span className="text-sm font-bold text-ink-0">{category}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {sign}{diff}%
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Target bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-ink-disabled uppercase w-14 shrink-0">Target</span>
                        <div className="flex-1 h-2.5 bg-bg-1 rounded-full overflow-hidden border border-dashed border-line">
                          <div
                            className="h-full rounded-full bg-ink-disabled/30"
                            style={{ width: `${target}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-ink-disabled w-10 text-right shrink-0">{target}%</span>
                      </div>
                      {/* Actual bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-ink-1 uppercase w-14 shrink-0">Actual</span>
                        <div className="flex-1 h-2.5 bg-bg-1 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${actualPct}%`,
                              background: cfg.chartColor,
                              boxShadow: `0 0 8px ${cfg.chartColor}60`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-ink-0 w-10 text-right shrink-0">{actualPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-line flex items-center justify-between">
              <p className="text-xs text-ink-disabled">
                Portfolio drift: {outsideCount} {outsideCount === 1 ? 'category' : 'categories'} outside target range
              </p>
              <Link href="/cashflow?tab=Target" className="text-xs font-bold text-brand hover:underline">
                Rebalance →
              </Link>
            </div>
          </div>
        );
      })()}

      {/* ── Investment Records ─────────────────────────────────── */}
      <div id="investment-records"><InvestmentRecords records={investmentRecords} /></div>

      {/* ── Strategy banner ─────────────────────────────────────── */}
      <div className="mt-10">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-blue-600 to-violet-600" />
          <div className="pointer-events-none absolute -top-10 -left-10 size-48 bg-white/10 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-48 bg-violet-400/20 blur-3xl rounded-full" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }}
          />

          <div className="relative px-8 py-8 flex flex-col md:flex-row items-center gap-6">
            <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(255,255,255,0.15)]">
              <Brain size={28} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">
                <Zap size={10} />
                Smart Strategy
              </div>
              <h4 className="text-xl font-black text-white mb-1">
                Portfolio Strategy: Aggressive Growth
              </h4>
              <p className="text-blue-100/90 text-sm leading-relaxed">
                Your current allocation aligns with a high-risk, high-reward strategy.
                Crypto is currently 2% overweight compared to your target allocation.
              </p>
            </div>
            <Link
              href="/cashflow?tab=Target"
              className="px-6 py-3 bg-white text-brand font-bold rounded-xl hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0 text-sm"
            >
              Rebalance Portfolio
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
