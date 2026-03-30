'use client';

import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Bitcoin,
  Building2,
  CreditCard,
  Flag,
  Home,
  Landmark,
  LayoutDashboard,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppShell } from '../../src/components/layout/app-shell';
import { AddSubscriptionModal }    from '../../src/components/cashflow/add-subscription-modal';
import { EditSubscriptionModal }   from '../../src/components/cashflow/edit-subscription-modal';
import { EditTargetModal }         from '../../src/components/cashflow/edit-target-modal';
import { InflowTab }               from '../../src/components/cashflow/inflow-tab';
import { ManageAccountsModal }     from '../../src/components/cashflow/manage-accounts-modal';
import type { AccountEntry }       from '../../src/components/cashflow/manage-accounts-modal';
import { NewTargetModal }          from '../../src/components/cashflow/new-target-modal';
import { OutflowTab }              from '../../src/components/cashflow/outflow-tab';
import { SubscriptionTab, SUB_ITEMS } from '../../src/components/cashflow/subscription-tab';
import type { SubItem }              from '../../src/components/cashflow/subscription-tab';
import { TargetTab }               from '../../src/components/cashflow/target-tab';
import type { TargetItem }         from '../../src/components/cashflow/target-tab';
import { TransactionTab }          from '../../src/components/cashflow/transaction-tab';
import { fmtCurrency }             from '../../src/lib/format';
import { adaptDashboardData }      from '../../src/lib/mock-data/adapters';
import { seedDashboardData }       from '../../src/lib/mock-data/seed';
import { GOALS }                   from '../../src/lib/mock-data/goals';

// ── Static data ───────────────────────────────────────────────────────────────

const MONTHLY_BARS: Record<string, { label: string; inflow: number; outflow: number; inflowVal: number; outflowVal: number; active?: true }[]> = {
  '6M': [
    { label: 'JAN', inflow: 60, outflow: 40, inflowVal: 38200, outflowVal: 21500 },
    { label: 'FEB', inflow: 75, outflow: 35, inflowVal: 41800, outflowVal: 18200 },
    { label: 'MAR', inflow: 55, outflow: 65, inflowVal: 35600, outflowVal: 31200 },
    { label: 'APR', inflow: 90, outflow: 45, inflowVal: 48900, outflowVal: 22800 },
    { label: 'MAY', inflow: 85, outflow: 50, inflowVal: 45200, outflowVal: 24500 },
    { label: 'JUN', inflow: 100, outflow: 30, inflowVal: 52800, outflowVal: 15600, active: true },
  ],
  '1Y': [
    { label: 'Jul', inflow: 50, outflow: 45, inflowVal: 32100, outflowVal: 24300 },
    { label: 'Aug', inflow: 70, outflow: 55, inflowVal: 39800, outflowVal: 28600 },
    { label: 'Sep', inflow: 60, outflow: 40, inflowVal: 35400, outflowVal: 21100 },
    { label: 'Oct', inflow: 80, outflow: 50, inflowVal: 44200, outflowVal: 25800 },
    { label: 'Nov', inflow: 65, outflow: 60, inflowVal: 37600, outflowVal: 30200 },
    { label: 'Dec', inflow: 75, outflow: 45, inflowVal: 42100, outflowVal: 22900 },
    { label: 'Jan', inflow: 60, outflow: 40, inflowVal: 38200, outflowVal: 21500 },
    { label: 'Feb', inflow: 75, outflow: 35, inflowVal: 41800, outflowVal: 18200 },
    { label: 'Mar', inflow: 55, outflow: 65, inflowVal: 35600, outflowVal: 31200 },
    { label: 'Apr', inflow: 90, outflow: 45, inflowVal: 48900, outflowVal: 22800 },
    { label: 'May', inflow: 85, outflow: 50, inflowVal: 45200, outflowVal: 24500 },
    { label: 'Jun', inflow: 100, outflow: 30, inflowVal: 52800, outflowVal: 15600, active: true },
  ],
  'ALL': [
    { label: '21', inflow: 40, outflow: 50, inflowVal: 285000, outflowVal: 198000 },
    { label: '22', inflow: 60, outflow: 55, inflowVal: 412000, outflowVal: 298000 },
    { label: '23', inflow: 75, outflow: 60, inflowVal: 498000, outflowVal: 342000 },
    { label: '24', inflow: 100, outflow: 30, inflowVal: 635000, outflowVal: 187000, active: true },
  ],
};

const INITIAL_ACCOUNTS: AccountEntry[] = [
  { id: '1', type: 'checking', label: 'Citadel Platinum',   sub: 'Checking •••• 8824', amount:  244902.12 },
  { id: '2', type: 'credit',   label: 'Black Reserve Card', sub: 'Credit •••• 4402',   amount: -12450.00  },
];

const ACCOUNT_ICON_MAP: Record<string, { Icon: typeof Landmark; iconClass: string }> = {
  checking:   { Icon: Landmark,   iconClass: 'text-ink-0'       },
  savings:    { Icon: Building2,  iconClass: 'text-emerald-500' },
  credit:     { Icon: CreditCard, iconClass: 'text-brand'       },
  investment: { Icon: Wallet,     iconClass: 'text-violet-500'  },
  crypto:     { Icon: Bitcoin,    iconClass: 'text-amber-500'   },
  cash:       { Icon: Banknote,   iconClass: 'text-emerald-500' },
};

const INFLOWS = [
  { Icon: Banknote,   label: 'Global Tech Solutions', sub: 'Payroll · Monthly Salary',   amount: 12500.00, date: 'Jun 15, 2024' },
  { Icon: TrendingUp, label: 'Vanguard Dividend',      sub: 'Investment · Quarterly Pay', amount:  2410.50, date: 'Jun 12, 2024' },
];

const OUTFLOWS = [
  { Icon: Home,         label: 'Metropolitan Properties', sub: 'Housing · Mortgage',    amount: 4200.00, date: 'Jun 01, 2024' },
  { Icon: ShoppingCart, label: 'Whole Foods Market',      sub: 'Groceries · Essential', amount:  842.20, date: 'Jun 18, 2024' },
];


const SUBSCRIPTIONS_MINI = [
  { label: 'Adobe Creative',     amount:  52.99, iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500'   },
  { label: 'GitHub Pro',         amount:   7.00, iconBg: 'bg-ink-1/10',      iconColor: 'text-ink-0'      },
  { label: 'Equinox All Access', amount: 265.00, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
];

const TABS = [
  { key: 'Overview',      Icon: LayoutDashboard },
  { key: 'Inflow',        Icon: TrendingUp      },
  { key: 'Outflow',       Icon: TrendingDown    },
  { key: 'Transaction',   Icon: ArrowLeftRight  },
  { key: 'Subscription',  Icon: RefreshCw       },
  { key: 'Target',        Icon: Flag            },
] as const;
type Tab = typeof TABS[number]['key'];

const CHART_PERIODS = ['6M', '1Y', 'ALL'] as const;
type ChartPeriod = typeof CHART_PERIODS[number];

const fmtK = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CashflowPage() {
  const { cashflow } = adaptDashboardData(seedDashboardData());
  const net = cashflow.inflow - cashflow.outflow;

  const [tab, setTab]                           = useState<Tab>('Overview');
  const [chartPeriod, setChartPeriod]           = useState<ChartPeriod>('6M');
  const [newTargetOpen, setNewTargetOpen]       = useState(false);
  const [editTarget, setEditTarget]             = useState<TargetItem | null>(null);
  const [addSubOpen, setAddSubOpen]             = useState(false);
  const [editSub, setEditSub]                   = useState<SubItem | null>(null);
  const [subs, setSubs]                         = useState<SubItem[]>(SUB_ITEMS);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [accounts, setAccounts]                 = useState<AccountEntry[]>(INITIAL_ACCOUNTS);
  const [manageAccountsOpen, setManageAccountsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t && TABS.some((tab) => tab.key === t)) {
      setTab(t as Tab);
    }
  }, []);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url.toString());
  }

  const bars     = MONTHLY_BARS[chartPeriod]!;
  const subTotal = SUBSCRIPTIONS_MINI.reduce((s, x) => s + x.amount, 0);

  const cumulativeNet = bars.reduce<number[]>((acc, b, i) => {
    const prev = i > 0 ? acc[i - 1]! : 0;
    return [...acc, prev + b.inflowVal - b.outflowVal];
  }, []);

  return (
    <AppShell>

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-line bg-card">
        {/* Layered glow blobs */}
        <div className="pointer-events-none absolute -top-16 -left-16 size-64 bg-brand/15 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-56 bg-emerald-500/10 blur-[70px] rounded-full" />
        <div className="pointer-events-none absolute top-0 right-1/3 size-40 bg-violet-500/8 blur-[60px] rounded-full" />

        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Left — title */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-weak border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand mb-4">
                <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                Live Tracking
              </span>
              <h1 className="text-4xl font-black tracking-tight text-ink-0 leading-none">Cashflow Analysis</h1>
              <p className="text-ink-1 mt-2 text-sm max-w-sm">Full visibility over every dollar in and out. Real-time, clear, in control.</p>
            </div>

            {/* Right — KPI strip */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Inflow</p>
                <p className="text-xl font-black text-emerald-400 tabular-nums">+{fmtCurrency.format(cashflow.inflow)}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-rose-500/8 border border-rose-500/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest mb-1">Outflow</p>
                <p className="text-xl font-black text-rose-400 tabular-nums">−{fmtCurrency.format(cashflow.outflow)}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-brand/8 border border-brand/20 rounded-2xl min-w-[130px]">
                <p className="text-[10px] font-bold text-brand/70 uppercase tracking-widest mb-1">Net</p>
                <p className="text-xl font-black text-brand tabular-nums">+{fmtCurrency.format(net)}</p>
              </div>
            </div>
          </div>

          {/* Net position bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Inflow vs Outflow ratio</span>
              <span className="text-[10px] font-bold text-brand">
                {Math.round((cashflow.inflow / (cashflow.inflow + cashflow.outflow)) * 100)}% surplus
              </span>
            </div>
            <div className="h-2 w-full bg-rose-500/20 rounded-full overflow-hidden border border-rose-500/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-brand rounded-full shadow-[0_0_12px_rgba(0,102,255,0.35)] transition-all duration-700"
                style={{ width: `${Math.round((cashflow.inflow / (cashflow.inflow + cashflow.outflow)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-8 overflow-x-auto no-scrollbar bg-bg-1 border border-line rounded-xl p-1">
        {TABS.map(({ key, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              tab === key
                ? 'bg-brand text-white shadow-[0_0_16px_rgba(0,102,255,0.35)]'
                : 'text-ink-disabled hover:text-ink-1 hover:bg-card'
            }`}
          >
            <Icon size={13} />
            {key}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────── */}
      {tab === 'Overview' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            {/* Inflow */}
            <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-emerald-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent" />
              <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-emerald-500/10 blur-2xl rounded-full" />
              <div className="relative flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Total Inflow</p>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500">
                  <ArrowUpRight size={10} /> +12.4%
                </span>
              </div>
              <div className="relative">
                <p className="text-2xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(cashflow.inflow)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-emerald-500 text-[10px] font-bold">↑ vs last month</p>
                </div>
              </div>
              {/* Mini sparkline decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
                {[30, 55, 40, 70, 60, 90, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Outflow */}
            <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-rose-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/8 via-transparent to-transparent" />
              <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-rose-500/10 blur-2xl rounded-full" />
              <div className="relative flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                    <TrendingDown size={14} className="text-rose-500" />
                  </div>
                  <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Total Outflow</p>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-bold text-rose-500">
                  <ArrowDownRight size={10} /> +2.1%
                </span>
              </div>
              <div className="relative">
                <p className="text-2xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(cashflow.outflow)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  <p className="text-rose-400 text-[10px] font-bold">↑ slightly higher</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
                {[60, 40, 70, 45, 80, 55, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-rose-500 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Net */}
            <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft px-6 pt-6 pb-16 group hover:border-brand/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-transparent" />
              <div className="pointer-events-none absolute -top-8 -right-8 size-32 bg-brand/10 blur-2xl rounded-full" />
              <div className="relative flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-brand-weak border border-brand/20 flex items-center justify-center shadow-[0_0_12px_rgba(0,102,255,0.15)]">
                    <Wallet size={14} className="text-brand" />
                  </div>
                  <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Net Cashflow</p>
                </div>
                <span className="px-2.5 py-1 bg-brand-weak border border-brand/20 rounded-full text-[10px] font-bold text-brand">Healthy</span>
              </div>
              <div className="relative">
                <p className="text-2xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(net)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                  <p className="text-brand text-[10px] font-bold">Strong liquidity ratio</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-0.5 px-6 opacity-20">
                {[40, 60, 55, 80, 70, 90, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="relative overflow-hidden bg-card rounded-2xl border border-line shadow-soft mb-6">
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand/5 blur-3xl rounded-full" />
            <div className="px-8 pt-7 pb-4 flex justify-between items-center border-b border-line">
              <div>
                <h2 className="text-base font-bold tracking-tight text-ink-0">Summary</h2>
                <p className="text-ink-disabled text-xs mt-0.5">January 2024 – June 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-ink-disabled">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-gradient-to-r from-emerald-500 to-emerald-400" />Inflow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-gradient-to-r from-rose-500 to-rose-400" />Outflow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 rounded-full bg-brand shadow-[0_0_4px_rgba(0,102,255,0.6)]" />Cumulative Net
                  </span>
                </div>
                <div className="flex bg-bg-0 rounded-lg p-1 border border-line gap-0.5">
                  {CHART_PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setChartPeriod(p)}
                      className={`px-3.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                        chartPeriod === p ? 'bg-brand text-white shadow-soft' : 'text-ink-disabled hover:text-ink-1'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-8 pt-6 pb-7">
              {/* relative wrapper so the SVG overlay can be positioned absolutely */}
              <div className="relative h-56 flex items-end justify-between gap-2">
                {bars.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-2 group h-full">
                    <div className="flex-1 w-full flex gap-1 items-end">
                      <div
                        className={`flex-1 relative rounded-t-md transition-all duration-300 ${
                          m.active
                            ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_-6px_20px_rgba(16,185,129,0.4)]'
                            : 'bg-emerald-500/20 group-hover:bg-emerald-500/40'
                        }`}
                        style={{ height: `${m.inflow}%` }}
                      >
                        <span className={`absolute bottom-1 w-full text-center text-[8px] font-black tabular-nums ${m.active ? 'text-white' : 'text-emerald-500/70'}`}>
                          {fmtK(m.inflowVal)}
                        </span>
                      </div>
                      <div
                        className={`flex-1 relative rounded-t-md transition-all duration-300 ${
                          m.active
                            ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-[0_-6px_20px_rgba(239,68,68,0.3)]'
                            : 'bg-rose-500/20 group-hover:bg-rose-500/40'
                        }`}
                        style={{ height: `${m.outflow}%` }}
                      >
                        <span className={`absolute bottom-1 w-full text-center text-[8px] font-black tabular-nums ${m.active ? 'text-white' : 'text-rose-500/70'}`}>
                          {fmtK(m.outflowVal)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold transition-colors ${m.active ? 'text-brand' : 'text-ink-disabled group-hover:text-ink-1'}`}>
                      {m.label}
                    </span>
                  </div>
                ))}

                {/* ── Cumulative net cash flow overlay ───────────── */}
                {(() => {
                  const n    = cumulativeNet.length;
                  const minV = Math.min(0, ...cumulativeNet);
                  const maxV = Math.max(...cumulativeNet, 1);
                  const range = maxV - minV || 1;
                  // Y: 0=top, 100=bottom of the container (h-56).
                  // pt-5 (20px) ≈ 9% from top is reserved for existing bar labels.
                  // Bottom ~9% reserved for month labels.
                  // We draw the line in the 12–82% band, leaving headroom for value labels.
                  const yTop = 10, yBot = 82;
                  // x: centre of each evenly-spaced column
                  const toX = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
                  const toY = (v: number) => yBot - ((v - minV) / range) * (yBot - yTop);
                  const linePts = cumulativeNet.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
                  return (
                    <>
                      {/* Line — uses vectorEffect so stroke-width is pixel-stable */}
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <polyline
                          points={linePts}
                          fill="none"
                          stroke="var(--brand)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      {/* Value labels — absolutely positioned HTML so text isn't distorted */}
                      {cumulativeNet.map((v, i) => (
                        <span
                          key={i}
                          className="absolute text-[8px] font-black text-brand tabular-nums pointer-events-none -translate-x-1/2"
                          style={{
                            left: `${toX(i)}%`,
                            top:  `${toY(v) - 6}%`,
                          }}
                        >
                          {fmtK(v)}
                        </span>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Two-column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Account Summary */}
              <section className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-bg-1/40">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(0,102,255,0.6)]" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Account Summary</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManageAccountsOpen(true)}
                    className="text-brand text-[10px] font-bold hover:underline"
                  >
                    Manage Accounts
                  </button>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {accounts.map((acc) => {
                    const { Icon, iconClass } = ACCOUNT_ICON_MAP[acc.type] ?? ACCOUNT_ICON_MAP['checking']!;
                    const positive = acc.amount >= 0;
                    return (
                      <div key={acc.id} className="relative overflow-hidden bg-bg-1 p-5 rounded-xl border border-line hover:border-brand/30 transition-all duration-300 group cursor-pointer">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-card flex items-center justify-center border border-line shadow-soft shrink-0">
                              <Icon size={18} className={iconClass} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink-0">{acc.label}</p>
                              <p className="text-[10px] text-ink-disabled">{acc.sub}</p>
                            </div>
                          </div>
                          <p className={`text-xl font-black shrink-0 ${positive ? 'text-ink-0' : 'text-rose-500'}`}>
                            {positive ? '' : '−'}TWD {fmtCurrency.format(Math.abs(acc.amount))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Detailed Inflow */}
              <section className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-bg-1/40">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Detailed Inflow</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">Active</span>
                </div>
                <div className="divide-y divide-line">
                  {INFLOWS.map(({ Icon, label, sub, amount, date }) => (
                    <div key={label} className="px-6 py-4 flex items-center justify-between hover:bg-bg-1/60 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-shadow">
                          <Icon size={18} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-0">{label}</p>
                          <p className="text-[11px] text-ink-disabled">{sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">+TWD {fmtCurrency.format(amount)}</p>
                        <p className="text-[10px] text-ink-disabled">{date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Detailed Outflow */}
              <section className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-bg-1/40">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Detailed Outflow</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full border border-rose-500/20">Reviewing</span>
                </div>
                <div className="divide-y divide-line">
                  {OUTFLOWS.map(({ Icon, label, sub, amount, date }) => (
                    <div key={label} className="px-6 py-4 flex items-center justify-between hover:bg-bg-1/60 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-shadow">
                          <Icon size={18} className="text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-0">{label}</p>
                          <p className="text-[11px] text-ink-disabled">{sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-500">−TWD {fmtCurrency.format(amount)}</p>
                        <p className="text-[10px] text-ink-disabled">{date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Financial Targets */}
              <section className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="px-6 py-4 border-b border-line bg-bg-1/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(0,102,255,0.6)]" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Financial Targets</h3>
                  </div>
                  <span className="text-[10px] font-bold text-brand">{GOALS.length} active</span>
                </div>
                <div className="p-6 space-y-7">
                  {GOALS.map(({ id, label, pct, current, goal, status, barClass, statusClass }) => (
                    <div key={id}>
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-xs font-bold text-ink-0">{label}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusClass}`}>{status}</span>
                      </div>
                      <div className="w-full bg-bg-1 h-2 rounded-full overflow-hidden border border-line">
                        <div
                          className={`bg-gradient-to-r ${barClass} h-full rounded-full shadow-[0_0_8px_rgba(0,102,255,0.35)]`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-ink-disabled">TWD {fmtCurrency.format(current)}</span>
                        <span className="text-[10px] font-bold text-ink-1">{pct}% of TWD {fmtCurrency.format(goal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Subscriptions (mini) */}
              <section className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="px-6 py-4 border-b border-line bg-bg-1/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">Subscriptions</h3>
                  </div>
                  <span className="text-[10px] font-bold text-violet-400">{SUBSCRIPTIONS_MINI.length} services</span>
                </div>
                <div className="divide-y divide-line">
                  {SUBSCRIPTIONS_MINI.map(({ label, amount, iconBg, iconColor }) => (
                    <div key={label} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-1/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-xl ${iconBg} border border-line flex items-center justify-center`}>
                          <span className={`text-xs font-black ${iconColor}`}>{label[0]}</span>
                        </div>
                        <span className="text-xs font-semibold text-ink-0">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-ink-0">
                        TWD {fmtCurrency.format(amount)}<span className="text-ink-disabled font-normal">/mo</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 bg-gradient-to-r from-violet-500/5 to-transparent border-t border-line flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-disabled">Monthly Total</span>
                  <span className="text-sm font-black text-ink-0">TWD {fmtCurrency.format(subTotal)}</span>
                </div>
              </section>

            </div>
          </div>
        </>
      )}

      {/* ── Tab content ───────────────────────────────────────────── */}
      {tab === 'Transaction'  && <TransactionTab accounts={accounts} />}
      {tab === 'Target'       && <TargetTab onNewTarget={() => setNewTargetOpen(true)} onEdit={(item) => setEditTarget(item)} />}
      {tab === 'Subscription' && (
        <SubscriptionTab
          items={subs}
          remindersEnabled={remindersEnabled}
          onToggleReminders={() => setRemindersEnabled((v) => !v)}
          onAdd={() => setAddSubOpen(true)}
          onEdit={(item) => setEditSub(item)}
        />
      )}
      {tab === 'Inflow'       && <InflowTab />}
      {tab === 'Outflow'      && <OutflowTab />}

      {/* ── Modals ───────────────────────────────────────────────── */}
      {newTargetOpen && <NewTargetModal onClose={() => setNewTargetOpen(false)} />}
      {editTarget    && <EditTargetModal item={editTarget} onClose={() => setEditTarget(null)} />}
      {addSubOpen    && (
        <AddSubscriptionModal
          onClose={() => setAddSubOpen(false)}
          onSubmit={(item) => { setSubs((prev) => [...prev, item]); }}
        />
      )}
      {editSub       && <EditSubscriptionModal item={editSub} onClose={() => setEditSub(null)} />}
      {manageAccountsOpen && (
        <ManageAccountsModal
          accounts={accounts}
          onAdd={(acc) => setAccounts((prev) => [...prev, acc])}
          onRemove={(id) => setAccounts((prev) => prev.filter((a) => a.id !== id))}
          onClose={() => setManageAccountsOpen(false)}
        />
      )}

    </AppShell>
  );
}
