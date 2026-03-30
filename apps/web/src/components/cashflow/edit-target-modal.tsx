'use client';

import { Car, Diamond, GraduationCap, Home, Plane, PiggyBank, Shield, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { TargetItem } from './target-tab';

type EditTargetModalProps = {
  item: TargetItem;
  onClose: () => void;
};

const ICONS = [
  { key: 'plane',     Icon: Plane,         label: 'Travel'    },
  { key: 'home',      Icon: Home,          label: 'Home'      },
  { key: 'car',       Icon: Car,           label: 'Car'       },
  { key: 'savings',   Icon: PiggyBank,     label: 'Savings'   },
  { key: 'education', Icon: GraduationCap, label: 'Education' },
  { key: 'luxury',    Icon: Diamond,       label: 'Luxury'    },
  { key: 'shield',    Icon: Shield,        label: 'Security'  },
];

export function EditTargetModal({ item, onClose }: EditTargetModalProps) {
  const [selectedIcon, setSelectedIcon] = useState(item.iconKey);
  const [name, setName]       = useState(item.label);
  const [goal, setGoal]       = useState(String(item.goal));
  const [current, setCurrent] = useState(String(item.current));
  const [date, setDate]       = useState(item.date === 'Ongoing' ? '' : item.date);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const SelectedIcon = ICONS.find((i) => i.key === selectedIcon)?.Icon ?? item.Icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-8 h-20 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="font-bold text-ink-0 text-xl">Targets</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">

          {/* Identity header */}
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-xl bg-brand-weak border border-brand/20 flex items-center justify-center shrink-0">
              <SelectedIcon size={36} className="text-brand" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Editing Target</p>
              <h3 className="text-3xl font-black tracking-tight text-ink-0">{item.label}</h3>
            </div>
          </div>

          {/* Icon selector */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Icon</label>
            <div className="grid grid-cols-7 gap-2">
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
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Form — bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Target name — full width */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Target Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-bold text-sm">TWD</span>
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-4 text-ink-0 text-lg font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
                />
              </div>
            </div>

            {/* Current Saved */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Current Saved</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">TWD</span>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-4 text-ink-0 text-lg font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
                />
              </div>
            </div>

            {/* Target Date — full width */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors [color-scheme:dark]"
              />
            </div>

          </div>

          {/* Danger zone */}
          <div className="pt-2 border-t border-line">
            <div className="flex items-center justify-between p-5 bg-danger/5 border border-danger/15 rounded-xl">
              <div>
                <p className="text-ink-0 font-bold text-sm">Remove Target</p>
                <p className="text-ink-1 text-xs mt-0.5">This will permanently delete the goal and its progress.</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-danger border border-danger/30 rounded-xl text-xs font-bold hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-line bg-bg-1/50 flex flex-col-reverse md:flex-row gap-3 justify-end items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-7 py-3.5 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all text-sm"
          >
            Discard Changes
          </button>
          <button
            type="button"
            className="w-full md:w-auto px-9 py-3.5 bg-brand text-white font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm"
          >
            Update Target
          </button>
        </div>

      </div>
    </div>
  );
}
