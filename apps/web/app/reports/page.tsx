'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Lightbulb,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { AppShell }                  from '../../src/components/layout/app-shell';
import { ExportDataModal }            from '../../src/components/reports/export-data-modal';
import { InsightsSection }            from '../../src/components/reports/insights-section';
import { InvestmentReportSection }    from '../../src/components/reports/investment-report-section';
import { fmtCurrency }               from '../../src/lib/format';

// ── Static data ───────────────────────────────────────────────────────────────

const EXPENSE_SEGMENTS = [
  { label: 'Housing',     pct: 45, color: 'var(--brand)', amount: 2160 },
  { label: 'Food & Drink', pct: 25, color: '#10b981',     amount: 1200 },
  { label: 'Transport',   pct: 15, color: '#f59e0b',      amount:  720 },
  { label: 'Other',       pct: 15, color: '#8b5cf6',      amount:  720 },
];

type Period = '3M' | '6M' | '1Y' | 'ALL';
const PERIODS: Period[] = ['3M', '6M', '1Y', 'ALL'];

type CFPoint = { label: string; income: number; expense: number };
const CF_DATA: Record<Period, CFPoint[]> = {
  '3M': [
    { label: 'Jan', income: 38200, expense: 21500 },
    { label: 'Feb', income: 41800, expense: 18200 },
    { label: 'Mar', income: 35600, expense: 31200 },
  ],
  '6M': [
    { label: 'Jan', income: 38200, expense: 21500 },
    { label: 'Feb', income: 41800, expense: 18200 },
    { label: 'Mar', income: 35600, expense: 31200 },
    { label: 'Apr', income: 48900, expense: 22800 },
    { label: 'May', income: 45200, expense: 24500 },
    { label: 'Jun', income: 52800, expense: 15600 },
  ],
  '1Y': [
    { label: 'Jul', income: 32100, expense: 24300 },
    { label: 'Aug', income: 39800, expense: 28600 },
    { label: 'Sep', income: 35400, expense: 21100 },
    { label: 'Oct', income: 44200, expense: 25800 },
    { label: 'Nov', income: 37600, expense: 30200 },
    { label: 'Dec', income: 42100, expense: 22900 },
    { label: 'Jan', income: 38200, expense: 21500 },
    { label: 'Feb', income: 41800, expense: 18200 },
    { label: 'Mar', income: 35600, expense: 31200 },
    { label: 'Apr', income: 48900, expense: 22800 },
    { label: 'May', income: 45200, expense: 24500 },
    { label: 'Jun', income: 52800, expense: 15600 },
  ],
  'ALL': [
    { label: '2021', income: 285000, expense: 198000 },
    { label: '2022', income: 412000, expense: 298000 },
    { label: '2023', income: 498000, expense: 342000 },
    { label: '2024', income: 635000, expense: 187000 },
  ],
};

const MONTHLY_BREAKDOWN = [
  { month: 'Jan', income: 38200, expense: 21500, net:  16700 },
  { month: 'Feb', income: 41800, expense: 18200, net:  23600 },
  { month: 'Mar', income: 35600, expense: 31200, net:   4400 },
  { month: 'Apr', income: 48900, expense: 22800, net:  26100 },
  { month: 'May', income: 45200, expense: 24500, net:  20700 },
  { month: 'Jun', income: 52800, expense: 15600, net:  37200 },
];

const maxBreakdown = Math.max(...MONTHLY_BREAKDOWN.map((r) => r.income));

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod]       = useState<Period>('1Y');
  const [exportOpen, setExportOpen] = useState(false);

  const cfPoints = CF_DATA[period];
  const cfMax    = Math.max(...cfPoints.flatMap((p) => [p.income, p.expense]));
  const svgW     = 800;
  const svgH     = 300;
  const padX     = 20;
  const padY     = 20;
  const plotW    = svgW - padX * 2;
  const plotH    = svgH - padY * 2;

  const toX = (i: number) =>
    padX + (cfPoints.length === 1 ? plotW / 2 : (i / (cfPoints.length - 1)) * plotW);
  const toY = (v: number) => padY + plotH - (v / cfMax) * plotH;

  const incomePolyline = cfPoints.map((p, i) => `${toX(i)},${toY(p.income)}`).join(' ');
  const expensePolyline = cfPoints.map((p, i) => `${toX(i)},${toY(p.expense)}`).join(' ');

  return (
    <AppShell>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-line bg-card">
        <div className="pointer-events-none absolute -top-16 -left-16 size-64 bg-brand/15 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-56 bg-violet-500/10 blur-[70px] rounded-full" />
        <div className="pointer-events-none absolute top-0 right-1/3 size-40 bg-emerald-500/8 blur-[60px] rounded-full" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">
                <Sparkles size={10} />
                AI-Powered Analysis
              </span>
              <h1 className="text-4xl font-black tracking-tight text-ink-0 leading-none">Report &amp; Insights</h1>
              <p className="text-ink-1 mt-2 text-sm max-w-sm">Comprehensive analysis of your personal assets and spending performance.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-brand/8 border border-brand/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-brand/70 uppercase tracking-widest mb-1">Net Worth</p>
                <p className="text-xl font-black text-brand tabular-nums">+{fmtCurrency.format(244902)}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">YTD Return</p>
                <p className="text-xl font-black text-emerald-400 tabular-nums">+18.4%</p>
              </div>
              <div className="flex flex-col items-center justify-center px-5 py-4 bg-bg-1 border border-line rounded-2xl">
                <button
                  type="button"
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-ink-1 hover:text-ink-0 transition-colors"
                >
                  <Download size={15} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Savings rate bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Annual savings rate</span>
              <span className="text-[10px] font-bold text-emerald-500">42.5% · Top 5% for your age group</span>
            </div>
            <div className="h-2 w-full bg-bg-1 rounded-full overflow-hidden border border-line">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-brand rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-700"
                style={{ width: '42.5%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Highest Income */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-emerald-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-emerald-500/10 blur-2xl rounded-full" />
          <div className="relative flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Highest Monthly Income</p>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500">
              <ArrowUpRight size={10} /> +8.2%
            </span>
          </div>
          <div className="relative">
            <p className="text-2xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(12450)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-emerald-500 text-[10px] font-bold">↑ vs last month</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
            {[40, 60, 45, 80, 65, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Avg Expenses */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-amber-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-amber-500/10 blur-2xl rounded-full" />
          <div className="relative flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <ShoppingCart size={14} className="text-amber-500" />
              </div>
              <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Avg. Monthly Expenses</p>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-500">
              <ArrowDownRight size={10} /> −2.4%
            </span>
          </div>
          <div className="relative">
            <p className="text-2xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(4820)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold">↓ trending down</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
            {[70, 85, 60, 90, 75, 50, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-500 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Net Savings Rate */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-brand/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-brand/10 blur-2xl rounded-full" />
          <div className="relative flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-brand-weak border border-brand/20 flex items-center justify-center shadow-[0_0_12px_rgba(0,102,255,0.15)]">
                <PiggyBank size={14} className="text-brand" />
              </div>
              <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Net Savings Rate</p>
            </div>
            <span className="px-2.5 py-1 bg-brand-weak border border-brand/20 rounded-full text-[10px] font-bold text-brand">Top 5%</span>
          </div>
          <div className="relative">
            <p className="text-2xl font-black tracking-tight text-ink-0">42.5%</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              <p className="text-brand text-[10px] font-bold">Excellent savings discipline</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
            {[30, 45, 40, 55, 50, 65, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-brand rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Cashflow Summary dual-line chart */}
        <div className="lg:col-span-2 relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="px-8 pt-7 pb-4 flex justify-between items-center border-b border-line">
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink-0">Income vs Expense Trend</h2>
              <p className="text-ink-disabled text-xs mt-0.5">Monthly cashflow comparison</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Income
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="size-2 rounded-full bg-rose-500" />
                  Expense
                </span>
              </div>
              <div className="flex bg-bg-0 rounded-lg p-1 border border-line gap-0.5">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      period === p ? 'bg-brand text-white shadow-soft' : 'text-ink-disabled hover:text-ink-1'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-8 pt-6 pb-5">
            <div className="relative h-56 w-full">
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <filter id="cfGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {[75, 150, 225].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="var(--line)" strokeDasharray="4" strokeOpacity="0.5" />
                ))}
                <polyline
                  points={incomePolyline}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#cfGlow)"
                />
                <polyline
                  points={incomePolyline}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={expensePolyline}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#cfGlow)"
                />
                <polyline
                  points={expensePolyline}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex justify-between mt-3">
              {cfPoints.map((p, i) => (
                <span key={`${p.label}-${i}`} className="text-[10px] font-bold text-ink-disabled uppercase tracking-tighter">{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Expense breakdown donut */}
        <div className="bg-card rounded-2xl border border-line shadow-soft flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-line bg-bg-1/40">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Expense Breakdown</h2>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
            <div className="relative size-40 mb-6">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--line)" strokeWidth="3" />
                {EXPENSE_SEGMENTS.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="18" cy="18" r="15.9"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="3"
                    strokeDasharray={`${seg.pct} 100`}
                    strokeDashoffset={-EXPENSE_SEGMENTS.slice(0, EXPENSE_SEGMENTS.indexOf(seg)).reduce((s, x) => s + x.pct, 0)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-ink-0">TWD</span>
                <span className="text-lg font-black text-ink-0 leading-none">{fmtCurrency.format(4800)}</span>
                <span className="text-[9px] uppercase font-bold text-ink-disabled tracking-wider mt-1">Monthly Avg</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {EXPENSE_SEGMENTS.map((seg) => (
                <div key={seg.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ background: seg.color }} />
                      <span className="text-ink-1 font-medium">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-disabled text-[10px]">TWD {fmtCurrency.format(seg.amount)}</span>
                      <span className="font-bold text-ink-0 tabular-nums w-8 text-right">{seg.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-bg-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${seg.pct}%`, background: seg.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Monthly breakdown table ──────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-line shadow-soft overflow-hidden mb-6">
        <div className="px-8 py-5 border-b border-line bg-bg-1/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(0,102,255,0.6)]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Monthly Breakdown</h3>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-ink-disabled">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-500/60" />Income</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-500/60" />Expense</span>
          </div>
        </div>
        <div className="divide-y divide-line">
          {MONTHLY_BREAKDOWN.map(({ month, income, expense, net }) => {
            const incomeW  = Math.round((income  / maxBreakdown) * 100);
            const expenseW = Math.round((expense / maxBreakdown) * 100);
            return (
              <div key={month} className="px-8 py-4 flex items-center gap-6 hover:bg-bg-1/60 transition-colors">
                <span className="text-[11px] font-black text-ink-disabled uppercase w-8 shrink-0">{month}</span>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-1 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${incomeW}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-500 tabular-nums">+{fmtCurrency.format(income)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-1 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500/70 rounded-full" style={{ width: `${expenseW}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-rose-500 tabular-nums">−{fmtCurrency.format(expense)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black tabular-nums ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {net >= 0 ? '+' : '−'}{fmtCurrency.format(Math.abs(net))}
                  </p>
                  <p className="text-[10px] text-ink-disabled font-bold uppercase tracking-tight mt-0.5">Net</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Investment section ───────────────────────────────────────── */}
      <div className="mb-8">
        <InvestmentReportSection />
      </div>

      {/* ── Insights section ─────────────────────────────────────────── */}
      <InsightsSection />

      {/* ── Smart recommendation banner ──────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-blue-600 to-violet-600" />
        <div className="pointer-events-none absolute -top-10 -left-10 size-48 bg-white/10 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 size-48 bg-violet-400/20 blur-3xl rounded-full" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative px-8 py-8 flex flex-col md:flex-row items-center gap-6">
          <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(255,255,255,0.15)]">
            <Lightbulb size={28} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">
              <Zap size={10} />
              Smart Recommendation
            </div>
            <h4 className="text-lg font-black text-white mb-1">Optimise Your Surplus Cashflow</h4>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              Based on your surplus cashflow over the last 6 months, you could earn an additional{' '}
              <strong className="text-white">TWD {fmtCurrency.format(1240)} annually</strong> by moving TWD {fmtCurrency.format(25000)} to a High-Yield Savings Account.
            </p>
          </div>
          <button
            type="button"
            className="px-6 py-3 bg-white text-brand font-bold rounded-xl hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0 text-sm"
          >
            Explore Options
          </button>
        </div>
      </div>

      {exportOpen && <ExportDataModal onClose={() => setExportOpen(false)} />}
    </AppShell>
  );
}
