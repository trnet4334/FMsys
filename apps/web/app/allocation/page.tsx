import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Bitcoin,
  Brain,
  Download,
  Globe,
  Minus,
  PieChart,
  Plus,
  TrendingUp,
} from 'lucide-react';

import { AppShell } from '../../src/components/layout/app-shell';
import { fmt } from '../../src/lib/format';
import { adaptDashboardData } from '../../src/lib/mock-data/adapters';
import { seedDashboardData } from '../../src/lib/mock-data/seed';
import { InvestmentRecords } from '../../src/components/allocation/investment-records';
import { seedInvestmentRecords } from '../../src/lib/mock-data/investment-records';

// ── Types ────────────────────────────────────────────────────────────────────

type Trend = { pct: number; dir: 'up' | 'down' | 'flat' };

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

  return (
    <AppShell>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink-0">Asset Allocation</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-bg-1 rounded-lg font-medium hover:text-ink-0 transition-all text-sm text-ink-1"
          >
            <Download size={15} />
            Export Report
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition-all text-sm shadow-soft"
          >
            <Plus size={15} />
            Add Asset
          </button>
        </div>
      </div>

      {/* ── Content grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Donut chart card — 5 cols */}
        <div className="lg:col-span-5 bg-card rounded-xl p-8 border border-line shadow-soft">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-ink-0">
            <PieChart size={18} className="text-brand" />
            Distribution Overview
          </h3>

          {/* Donut */}
          <div className="relative flex items-center justify-center aspect-square max-w-[280px] mx-auto mb-8">
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
              <span className="text-2xl font-bold text-ink-0">
                {totalValue >= 1_000_000
                  ? `$${(totalValue / 1_000_000).toFixed(2)}M`
                  : `$${(totalValue / 1_000).toFixed(0)}K`}
              </span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-1">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--brand)' }} />
                <span className="text-sm font-medium text-ink-0">Largest Sector</span>
              </div>
              <span className="text-sm font-bold text-brand">
                {largestSlice.category} ({(largestSlice.pct * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-1">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-ink-0">Monthly Change</span>
              </div>
              <span className="text-sm font-bold text-emerald-500">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Asset details table — 7 cols */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-line shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-line flex justify-between items-center bg-bg-0/50">
            <h3 className="text-lg font-bold text-ink-0">Asset Details</h3>
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
                  const { Icon, iconClass, bgClass, desc, trend } = cfg;
                  const { pct: tPct, dir } = trend;

                  return (
                    <tr key={slice.category} className="hover:bg-bg-1 transition-colors">
                      {/* Category */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}>
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
                          <div className="flex-1 w-24 h-1.5 bg-bg-1 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${slice.pct * 100}%`, background: cfg.chartColor }}
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
                          const colorClass = dir === 'flat' ? 'text-ink-1' : dir === 'up' ? 'text-emerald-500' : 'text-rose-500';
                          return (
                            <span className={`text-xs font-bold ${colorClass} flex items-center justify-end gap-1`}>
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
            <button type="button" className="text-sm font-bold text-brand hover:underline">
              View All Asset Sub-Categories
            </button>
          </div>
        </div>
      </div>

      {/* ── Investment Records ─────────────────────────────────── */}
      <InvestmentRecords records={investmentRecords} />

      {/* ── Strategy banner ─────────────────────────────────────── */}
      <div className="mt-10">
        <div className="bg-brand-weak border border-brand/20 rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="size-16 rounded-full bg-brand flex items-center justify-center text-white shrink-0">
            <Brain size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-bold mb-1 text-ink-0">
              Portfolio Strategy: Aggressive Growth
            </h4>
            <p className="text-ink-1 text-sm leading-relaxed">
              Your current allocation aligns with a high-risk, high-reward strategy.
              Crypto is currently 2% overweight compared to your target allocation.
            </p>
          </div>
          <button
            type="button"
            className="px-6 py-3 bg-brand text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-soft shrink-0"
          >
            Rebalance Portfolio
          </button>
        </div>
      </div>
    </AppShell>
  );
}
