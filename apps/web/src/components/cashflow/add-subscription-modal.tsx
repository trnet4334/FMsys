'use client';

import { Bell, CheckCircle, Cloud, Film, Music, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { SubItem } from './subscription-tab';
import { Toggle } from '../ui/toggle';
import { fmtDate } from '../../lib/format';
import { useEscapeKey } from '../../lib/use-escape-key';

type AddSubscriptionModalProps = {
  onClose: () => void;
  onSubmit: (item: SubItem) => void;
};

const SERVICE_PRESETS = [
  { id: 'netflix', Icon: Film,  iconColor: 'text-rose-500',   label: 'Netflix', dashed: false },
  { id: 'aws',     Icon: Cloud, iconColor: 'text-amber-500',  label: 'AWS',     dashed: false },
  { id: 'spotify', Icon: Music, iconColor: 'text-emerald-500',label: 'Spotify', dashed: false },
  { id: 'other',   Icon: Plus,  iconColor: 'text-ink-disabled',label: 'Other',  dashed: true  },
];

const PRESET_META: Record<string, Pick<SubItem, 'Icon' | 'iconBg' | 'iconColor'>> = {
  netflix: { Icon: Film,  iconBg: 'bg-rose-500/10',    iconColor: 'text-rose-500'    },
  aws:     { Icon: Cloud, iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500'   },
  spotify: { Icon: Music, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  other:   { Icon: Plus,  iconBg: 'bg-ink-1/10',       iconColor: 'text-ink-1'       },
};

const CATEGORIES = ['Entertainment', 'Cloud/SaaS', 'Health', 'Education', 'Productivity'];

export function AddSubscriptionModal({ onClose, onSubmit }: AddSubscriptionModalProps) {
  const [preset, setPreset]     = useState<string | null>(null);
  const [name, setName]         = useState('');
  const [billing, setBilling]   = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState('Entertainment');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState('');
  const [reminder, setReminder] = useState(true);

  useEscapeKey(onClose);

  function handleSubmit() {
    if (!name.trim() || !amount || isNaN(parseFloat(amount))) return;
    const meta = PRESET_META[preset ?? 'other'] ?? PRESET_META['other']!;
    const nextPayment = date ? fmtDate(date) : '—';
    const newItem: SubItem = {
      id: `sub-${Date.now()}`,
      Icon: meta.Icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      label: name.trim(),
      category,
      billing,
      nextPayment,
      amount: parseFloat(amount),
    };
    onSubmit(newItem);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={16} />
          </button>
          <h2 className="text-base font-bold text-ink-0">Add Subscription</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Service presets */}
          <div className="grid grid-cols-4 gap-3">
            {SERVICE_PRESETS.map(({ id, Icon, iconColor, label, dashed }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 border transition-all ${
                  preset === id
                    ? 'bg-brand-weak border-brand shadow-[0_0_12px_rgba(0,102,255,0.15)]'
                    : dashed
                    ? 'bg-transparent border-dashed border-line hover:bg-bg-1'
                    : 'bg-bg-1 border-line hover:border-brand/40'
                }`}
              >
                <Icon size={20} className={preset === id ? 'text-brand' : iconColor} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-disabled">{label}</span>
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-4">

            {/* Service name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter provider name..."
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>

            {/* Billing + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Billing Cycle</label>
                <div className="flex p-1 bg-bg-1 border border-line rounded-xl">
                  {(['Monthly', 'Yearly'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBilling(b)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        billing === b ? 'bg-brand text-white shadow-soft' : 'text-ink-disabled hover:text-ink-1'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bg-1 border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Amount — highlighted */}
            <div className="bg-bg-1 border border-line rounded-xl p-5 space-y-2">
              <label className="block text-[10px] font-bold text-brand uppercase tracking-widest">Payment Amount</label>
              <div className="flex items-end gap-2">
                <span className="text-xl font-black text-ink-0 pb-1">TWD</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent border-none p-0 text-4xl font-black text-ink-0 placeholder:text-ink-disabled focus:outline-none leading-none"
                />
              </div>
            </div>

            {/* Next Payment Date */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Next Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Reminder toggle */}
            <div className="flex items-center justify-between p-4 bg-bg-1 border border-line rounded-xl">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Bell size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink-0">Payment Reminder</p>
                  <p className="text-[10px] text-ink-disabled">Notify 2 days before</p>
                </div>
              </div>
              <Toggle enabled={reminder} onToggle={() => setReminder((v) => !v)} size="sm" />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-line bg-bg-1/50 shrink-0 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || !amount}
            className="w-full py-4 bg-brand text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-soft hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={18} />
            Add Subscription
          </button>
          <p className="text-center text-[10px] text-ink-disabled uppercase tracking-widest">Sovereign Vault Encryption Active</p>
        </div>

      </div>
    </div>
  );
}
