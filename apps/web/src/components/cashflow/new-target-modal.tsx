'use client';

import { Car, Diamond, GraduationCap, Home, Plane, PiggyBank, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type NewTargetModalProps = {
  onClose: () => void;
};

const ICONS = [
  { key: 'plane',     Icon: Plane,          label: 'Travel'    },
  { key: 'home',      Icon: Home,           label: 'Home'      },
  { key: 'car',       Icon: Car,            label: 'Car'       },
  { key: 'savings',   Icon: PiggyBank,      label: 'Savings'   },
  { key: 'education', Icon: GraduationCap,  label: 'Education' },
  { key: 'luxury',    Icon: Diamond,        label: 'Luxury'    },
];

export function NewTargetModal({ onClose }: NewTargetModalProps) {
  const [selectedIcon, setSelectedIcon] = useState('plane');
  const [name, setName]       = useState('');
  const [amount, setAmount]   = useState('');
  const [date, setDate]       = useState('');
  const [deposit, setDeposit] = useState('');

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
            >
              <X size={16} />
            </button>
            <h2 className="text-lg font-bold text-ink-0">New Target</h2>
          </div>
          <button type="button" className="text-brand text-sm font-bold hover:opacity-80 transition-opacity px-3 py-1 rounded-lg hover:bg-brand-weak">
            Save
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">

          {/* Target Name */}
          <section className="space-y-2">
            <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Target Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., European Summer Tour"
              className="w-full bg-bg-1 border-0 border-b-2 border-line focus:border-brand rounded-t-xl px-4 py-4 text-ink-0 text-base font-medium placeholder:text-ink-disabled outline-none transition-colors"
            />
          </section>

          {/* Icon grid */}
          <section className="space-y-3">
            <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Identify With Icon</label>
            <div className="grid grid-cols-6 gap-3">
              {ICONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIcon(key)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === key
                      ? 'bg-brand-weak border-2 border-brand text-brand shadow-[0_0_12px_rgba(0,102,255,0.2)]'
                      : 'bg-bg-1 border-2 border-transparent hover:border-line text-ink-disabled'
                  }`}
                >
                  <Icon size={24} />
                </button>
              ))}
            </div>
          </section>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-2">
              <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Target Amount</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-brand font-bold text-sm">TWD</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full bg-bg-1 border-0 border-b-2 border-line focus:border-brand rounded-t-xl pl-16 pr-4 py-4 text-ink-0 text-xl font-bold placeholder:text-ink-disabled outline-none transition-colors"
                />
              </div>
            </section>
            <section className="space-y-2">
              <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-1 border-0 border-b-2 border-line focus:border-brand rounded-t-xl px-4 py-4 text-ink-0 text-base font-medium outline-none transition-colors [color-scheme:dark]"
              />
            </section>
          </div>

          {/* Initial Deposit */}
          <section className="p-6 bg-bg-1 border border-line rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Initial Deposit (Optional)</label>
              <span className="text-[10px] text-brand bg-brand-weak px-2 py-0.5 rounded font-bold uppercase tracking-tight border border-brand/20">Boost Start</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-ink-disabled font-medium text-sm">TWD</span>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="0.00"
                className="w-full bg-card border-0 border-b-2 border-line focus:border-brand rounded-t-lg pl-16 pr-4 py-3 text-ink-0 text-base font-medium placeholder:text-ink-disabled outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-ink-disabled italic">Fund this target immediately from your main Vault.</p>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-line bg-bg-1/50 shrink-0 space-y-3">
          <button
            type="button"
            className="w-full py-4 bg-brand text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-soft hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Target size={18} />
            Create Target
          </button>
          <p className="text-center text-[10px] text-ink-disabled uppercase tracking-widest">Secure End-to-End Encryption</p>
        </div>

      </div>
    </div>
  );
}
