'use client';

import {
  Baby,
  Banknote,
  Briefcase,
  Car,
  CreditCard,
  Dumbbell,
  Film,
  Gift,
  Home,
  Landmark,
  ShoppingBag,
  Stethoscope,
  TrendingUp,
  UtensilsCrossed,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { AccountEntry } from './manage-accounts-modal';

const OUTFLOW_CATEGORIES = [
  { key: 'food',          Icon: UtensilsCrossed, label: 'Food'          },
  { key: 'traffic',       Icon: Car,             label: 'Traffic'       },
  { key: 'entertainment', Icon: Film,            label: 'Entertainment' },
  { key: 'shopping',      Icon: ShoppingBag,     label: 'Shopping'      },
  { key: 'personal',      Icon: Dumbbell,        label: 'Personal'      },
  { key: 'medical',       Icon: Stethoscope,     label: 'Medical'       },
  { key: 'home',          Icon: Home,            label: 'Home'          },
  { key: 'family',        Icon: Users,           label: 'Family'        },
  { key: 'life',          Icon: Baby,            label: 'Life'          },
];

const INFLOW_CATEGORIES = [
  { key: 'salary',     Icon: Briefcase,  label: 'Salary'     },
  { key: 'dividend',   Icon: Landmark,   label: 'Dividend'   },
  { key: 'freelance',  Icon: Banknote,   label: 'Freelance'  },
  { key: 'gift',       Icon: Gift,       label: 'Gift'       },
  { key: 'investment', Icon: TrendingUp, label: 'Investment' },
];

export type NewTransaction = {
  type: 'Inflow' | 'Outflow';
  category: string;
  name: string;
  amount: number;
  date: string;
  method: string;
  note: string;
};

type Props = { onClose: () => void; accounts: AccountEntry[]; onAdd: (tx: NewTransaction) => void };

export function AddTransactionModal({ onClose, accounts, onAdd }: Props) {
  const methods = ['Cash', ...accounts.map((a) => a.label)];
  const [type,     setType]     = useState<'Outflow' | 'Inflow'>('Outflow');
  const [category, setCategory] = useState('food');

  const categories = type === 'Inflow' ? INFLOW_CATEGORIES : OUTFLOW_CATEGORIES;
  const [name,     setName]     = useState('');
  const [amount,   setAmount]   = useState('');
  const [date,     setDate]     = useState(() => new Date().toISOString().slice(0, 10));
  const [method,   setMethod]   = useState(() => accounts[0]?.label ?? 'Cash');
  const [status,   setStatus]   = useState<'Cleared' | 'Pending'>('Cleared');
  const [note,     setNote]     = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isInflow  = type === 'Inflow';
  const accent    = isInflow ? 'emerald' : 'rose';
  const activeCls = isInflow
    ? 'bg-emerald-500 text-white shadow-sm'
    : 'bg-rose-500   text-white shadow-sm';

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-16 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="size-9 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors">
              <X size={17} />
            </button>
            <h2 className="font-bold text-ink-0 text-lg">New Transaction</h2>
          </div>
          {/* Inflow / Outflow toggle */}
          <div className="flex bg-bg-1 border border-line rounded-xl p-1 gap-1">
            {(['Outflow', 'Inflow'] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(t === 'Inflow' ? 'salary' : 'food'); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === t ? activeCls : 'text-ink-disabled hover:text-ink-1'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Category grid */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Category</label>
            <div className={`grid gap-2 ${type === 'Inflow' ? 'grid-cols-5' : 'grid-cols-3'}`}>
              {categories.map(({ key, Icon, label }) => (
                <button key={key} type="button" onClick={() => setCategory(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-[10px] font-bold ${
                    category === key
                      ? `bg-${accent}-500/10 border-${accent}-500 text-${accent}-500 shadow-[0_0_12px_rgba(0,0,0,0.1)]`
                      : 'bg-bg-1 border-transparent hover:border-line text-ink-disabled'
                  }`}>
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Description</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Whole Foods Market"
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Amount</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-${accent}-500`}>TWD</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-3.5 text-ink-0 text-base font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors [color-scheme:dark]" />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Payment Method</label>
            <div className="relative">
              <CreditCard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none" />
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl pl-10 pr-4 py-3.5 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none">
                {methods.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Status — inflow only */}
          {isInflow && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Status</label>
              <div className="flex bg-bg-1 border border-line rounded-xl p-1 gap-1">
                {(['Cleared', 'Pending'] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      status === s
                        ? s === 'Cleared'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-warn text-white shadow-sm'
                        : 'text-ink-disabled hover:text-ink-1'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">
              Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Add a note..."
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors resize-none" />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line bg-bg-1/50 flex flex-col-reverse md:flex-row gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim() || !amount}
            onClick={() => {
              onAdd({ type, category, name: name.trim(), amount: parseFloat(amount), date, method, note });
              onClose();
            }}
            className={`w-full md:w-auto px-8 py-3 font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed ${
              isInflow ? 'bg-emerald-500' : 'bg-brand'
            }`}>
            Add Transaction
          </button>
        </div>

      </div>
    </div>
  );
}
