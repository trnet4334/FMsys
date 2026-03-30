'use client';

import {
  Baby,
  Banknote,
  Briefcase,
  Calendar,
  Car,
  Dumbbell,
  Film,
  Gift,
  Home,
  Landmark,
  Plus,
  ShoppingBag,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';

import type { LucideIcon } from 'lucide-react';

import { fmtCurrency } from '../../lib/format';
import { AddTransactionModal } from './add-transaction-modal';
import type { NewTransaction } from './add-transaction-modal';
import { ImportTransactionModal } from './import-transaction-modal';
import type { AccountEntry } from './manage-accounts-modal';
import { useScrollFade } from './use-scroll-fade';

type TxItem = {
  id: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  sub: string;
  date: string;
  amount: number;
  method: string;
};

const INITIAL_TX: TxItem[] = [
  { id: 'tx1', Icon: ShoppingBag,    iconBg: 'bg-bg-1',            iconColor: 'text-brand',       label: 'Apple Store',         sub: 'Electronics · 2:45 PM',       date: 'Jun 28, 2024', amount:  -1299.00, method: 'Debit Card'       },
  { id: 'tx2', Icon: Banknote,       iconBg: 'bg-emerald-500/10',  iconColor: 'text-emerald-500', label: 'Freelance Payment',   sub: 'Project Phoenix · 11:20 AM',  date: 'Jun 28, 2024', amount:   4500.00, method: 'Bank Transfer'    },
  { id: 'tx3', Icon: UtensilsCrossed,iconBg: 'bg-bg-1',            iconColor: 'text-brand',       label: 'The Obsidian Grill',  sub: 'Dining Out · 8:15 PM',        date: 'Jun 27, 2024', amount:   -184.50, method: 'Credit Card'      },
  { id: 'tx4', Icon: Car,            iconBg: 'bg-bg-1',            iconColor: 'text-brand',       label: 'Uber Technologies',   sub: 'Transport · 5:30 PM',         date: 'Jun 27, 2024', amount:    -32.20, method: 'Debit Card'       },
  { id: 'tx5', Icon: TrendingDown,   iconBg: 'bg-bg-1',            iconColor: 'text-brand',       label: 'Coinbase Inc.',       sub: 'Investment · 10:00 AM',       date: 'Jun 27, 2024', amount:  -5000.00, method: 'Wire Transfer'    },
  { id: 'tx6', Icon: Landmark,       iconBg: 'bg-emerald-500/10',  iconColor: 'text-emerald-500', label: 'Dividend Payout',     sub: 'S&P 500 Index · 9:00 AM',     date: 'Jun 24, 2024', amount:    450.75, method: 'Investment Acct'  },
];

const CATEGORY_ICON_MAP: Record<string, { Icon: LucideIcon; iconBg: string; iconColor: string }> = {
  food:          { Icon: UtensilsCrossed, iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  traffic:       { Icon: Car,             iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  entertainment: { Icon: Film,            iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  shopping:      { Icon: ShoppingBag,     iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  personal:      { Icon: Dumbbell,        iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  medical:       { Icon: Stethoscope,     iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  home:          { Icon: Home,            iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  family:        { Icon: Users,           iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  life:          { Icon: Baby,            iconBg: 'bg-bg-1',           iconColor: 'text-brand'       },
  salary:        { Icon: Briefcase,       iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  dividend:      { Icon: Landmark,        iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  freelance:     { Icon: Banknote,        iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  gift:          { Icon: Gift,            iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  investment:    { Icon: TrendingUp,      iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
};

const TIME_RANGES = ['Last Month', 'Last 3 Months', 'Year-to-Date', 'Custom'];
const CATEGORIES = ['All Categories', 'Food', 'Traffic', 'Entertainment', 'Shopping', 'Personal', 'Medical', 'Home', 'Family', 'Life'];
const DISPLAY_COUNTS = [10, 25, 50, 100];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - i));

export function TransactionTab({ accounts }: { accounts: AccountEntry[] }) {
  const [txItems, setTxItems] = useState<TxItem[]>(INITIAL_TX);
  const [search,     setSearch]     = useState('');
  const [timeRange,  setTimeRange]  = useState('Last Month');
  const [category,   setCategory]   = useState('All Categories');
  const [ytdYear,    setYtdYear]    = useState(String(CURRENT_YEAR));
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  const [addOpen,      setAddOpen]      = useState(false);
  const [importOpen,   setImportOpen]   = useState(false);
  const { listRef, atBottom, handleScroll } = useScrollFade();

  function handleAdd(tx: NewTransaction) {
    const cfg = CATEGORY_ICON_MAP[tx.category] ?? { Icon: ShoppingBag, iconBg: 'bg-bg-1', iconColor: 'text-brand' };
    const d = new Date(tx.date);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const categoryLabel = tx.category.charAt(0).toUpperCase() + tx.category.slice(1);
    const newItem: TxItem = {
      id: `tx-${Date.now()}`,
      Icon: cfg.Icon,
      iconBg: cfg.iconBg,
      iconColor: cfg.iconColor,
      label: tx.name,
      sub: `${categoryLabel} · ${timeLabel}`,
      date: dateLabel,
      amount: tx.type === 'Inflow' ? tx.amount : -tx.amount,
      method: tx.method,
    };
    setTxItems((prev) => [newItem, ...prev]);
  }

  const searchLower = search.toLowerCase();
  const filtered = txItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchLower) ||
      item.sub.toLowerCase().includes(searchLower),
  );
  const displayed = filtered.slice(0, displayCount);

  return (
    <div className="space-y-6">

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink-0 tracking-tight">Transactions</h2>
          <p className="text-ink-1 text-sm">All your inflows and outflows in one place.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:bg-card rounded-xl text-sm font-bold transition-all"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-bold shadow-soft hover:opacity-90 transition-all"
          >
            <Plus size={14} />
            Add New
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-disabled" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-bg-1 border border-line rounded-xl py-3.5 pl-11 pr-4 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-bg-1 border border-line rounded-xl py-2.5 px-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none"
            >
              {TIME_RANGES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-bg-1 border border-line rounded-xl py-2.5 px-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Show</label>
            <select
              value={displayCount}
              onChange={(e) => setDisplayCount(Number(e.target.value))}
              className="w-full bg-bg-1 border border-line rounded-xl py-2.5 px-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none"
            >
              {DISPLAY_COUNTS.map((n) => <option key={n} value={n}>{n} records</option>)}
            </select>
          </div>
        </div>

        {timeRange === 'Year-to-Date' && (
          <div className="flex items-center gap-3 p-4 bg-bg-1 border border-brand/30 rounded-xl">
            <Calendar size={16} className="text-brand shrink-0" />
            <label className="text-xs font-bold text-ink-disabled uppercase tracking-wider shrink-0">Year</label>
            <select
              value={ytdYear}
              onChange={(e) => setYtdYear(e.target.value)}
              className="flex-1 bg-card border border-line rounded-lg px-3 py-2 text-sm font-semibold text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-xs text-ink-disabled shrink-0">Jan 1 – today</span>
          </div>
        )}

        {timeRange === 'Custom' && (
          <div className="p-4 bg-bg-1 border border-brand/30 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-wider">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  max={customTo || undefined}
                  className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-wider">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  min={customFrom || undefined}
                  className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
            {customFrom && customTo && (
              <p className="text-[11px] text-brand font-medium">
                {new Date(customFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → {new Date(customTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {/* Count indicator */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-ink-disabled font-medium">
            Showing <span className="text-ink-1 font-bold">{displayed.length}</span> of <span className="text-ink-1 font-bold">{filtered.length}</span> transactions
          </p>
          {filtered.length > displayCount && (
            <p className="text-[11px] text-brand font-bold">Scroll to view all</p>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="relative">
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="bg-card rounded-2xl border border-line divide-y divide-line max-h-[520px] overflow-y-auto overscroll-contain"
            >
              {displayed.map(({ id, Icon, iconBg, iconColor, label, sub, date, amount, method }) => (
                <div
                  key={id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-bg-1/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl ${iconBg} border border-line flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={iconColor} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-0">{label}</p>
                      <p className="text-[11px] text-ink-disabled">{sub}</p>
                      <p className="text-[10px] text-ink-disabled/60 mt-0.5">{date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {amount >= 0 ? '+' : '−'}TWD {fmtCurrency.format(Math.abs(amount))}
                    </p>
                    <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-tight mt-0.5">{method}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent rounded-b-2xl transition-opacity duration-300 ${atBottom || displayed.length <= 3 ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-disabled">No transactions match your search.</p>
          </div>
        )}
      </div>

      {addOpen    && <AddTransactionModal onClose={() => setAddOpen(false)} accounts={accounts} onAdd={handleAdd} />}
      {importOpen && <ImportTransactionModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
