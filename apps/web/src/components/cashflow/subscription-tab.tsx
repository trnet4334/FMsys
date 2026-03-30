'use client';

import { Bell, Cloud, Dumbbell, Film, Music, Pencil, Plus, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { fmtCurrency } from '../../lib/format';
import { Toggle } from '../ui/toggle';

export type SubItem = {
  id: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  category: string;
  billing: 'Monthly' | 'Yearly';
  nextPayment: string;
  amount: number;
};

type SubscriptionTabProps = {
  items: SubItem[];
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  onAdd: () => void;
  onEdit: (item: SubItem) => void;
};

export const SUB_ITEMS: SubItem[] = [
  { id: 'aws',     Icon: Cloud,    iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500',  label: 'AWS Cloud Services',  category: 'Infrastructure',  billing: 'Monthly', nextPayment: 'Oct 24, 2023', amount: 285.50 },
  { id: 'netflix', Icon: Film,     iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500',   label: 'Netflix Premium',     category: 'Entertainment',   billing: 'Monthly', nextPayment: 'Oct 28, 2023', amount: 19.99  },
  { id: 'spotify', Icon: Music,    iconBg: 'bg-emerald-500/10',iconColor: 'text-emerald-500',label: 'Spotify Family',      category: 'Entertainment',   billing: 'Monthly', nextPayment: 'Nov 02, 2023', amount: 15.99  },
  { id: 'equinox', Icon: Dumbbell, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500', label: 'Equinox Membership',  category: 'Health & Fitness',billing: 'Monthly', nextPayment: 'Oct 30, 2023', amount: 185.00 },
];

const SUB_CATEGORIES = [
  { label: 'Entertainment',  color: 'bg-blue-500',    amount: 35.98  },
  { label: 'Cloud / SaaS',   color: 'bg-violet-500',  amount: 285.50 },
  { label: 'Health & Fitness',color: 'bg-emerald-500', amount: 185.00 },
];

export function SubscriptionTab({ items, remindersEnabled, onToggleReminders, onAdd, onEdit }: SubscriptionTabProps) {
  const monthlyTotal = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">

      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-ink-0">Subscriptions</h2>
          <p className="text-ink-1 text-sm">Manage your recurring payments and digital services.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Reminders toggle */}
          <div className="flex items-center bg-bg-1 rounded-xl px-4 py-2.5 border border-line gap-3">
            <Bell size={13} className={remindersEnabled ? 'text-brand' : 'text-ink-disabled'} />
            <span className={`text-xs font-bold ${remindersEnabled ? 'text-ink-0' : 'text-ink-disabled'}`}>Reminders</span>
            <Toggle enabled={remindersEnabled} onToggle={onToggleReminders} size="sm" />
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-bold rounded-xl text-sm shadow-soft hover:opacity-90 transition-all"
          >
            <Plus size={15} />
            Add New
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Monthly Burn — 2/3 */}
        <div className="md:col-span-2 relative overflow-hidden bg-card rounded-2xl border border-line p-8 flex flex-col justify-between min-h-[420px]">
          {/* Decorative sparkline bars */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 flex items-end px-8 gap-1 opacity-25">
            {[50, 65, 75, 40, 100, 80, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-brand rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Total Monthly Burn</p>
            <h2 className="text-4xl font-black text-ink-0 tracking-tight mb-4">
              TWD {fmtCurrency.format(monthlyTotal)}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full">
              ↓ 4.2% vs last month
            </span>
          </div>
        </div>

        {/* Category breakdown — 1/3 */}
        <div className="bg-card rounded-2xl border border-line p-6">
          <h3 className="text-sm font-bold text-ink-0 mb-5">By Category</h3>
          <div className="space-y-4">
            {SUB_CATEGORIES.map(({ label, color, amount }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`size-2 rounded-full ${color}`} />
                  <span className="text-sm font-medium text-ink-1">{label}</span>
                </div>
                <span className="text-sm font-bold text-ink-0">TWD {fmtCurrency.format(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Subscriptions table — full width */}
        <div className="md:col-span-3">
          <h3 className="text-base font-bold text-ink-0 mb-4">Active Subscriptions</h3>
          <div className="bg-card rounded-2xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Billing</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-disabled uppercase tracking-wider">Next Payment</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-disabled uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-disabled uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-bg-1/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-4">
                          <div className={`size-10 rounded-xl ${item.iconBg} border border-line flex items-center justify-center`}>
                            <item.Icon size={18} className={item.iconColor} />
                          </div>
                          <div>
                            <p className="font-semibold text-ink-0 text-sm">{item.label}</p>
                            <p className="text-[11px] text-ink-disabled">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-medium text-ink-1">{item.billing}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink-0">{item.nextPayment}</span>
                          {remindersEnabled && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand/10 text-brand rounded-full text-[9px] font-bold">
                              <Bell size={8} />
                              Reminder
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-ink-0">TWD {fmtCurrency.format(item.amount)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="size-8 flex items-center justify-center rounded-lg text-ink-disabled hover:text-ink-0 hover:bg-bg-1 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="size-8 flex items-center justify-center rounded-lg text-ink-disabled hover:text-danger hover:bg-danger/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
