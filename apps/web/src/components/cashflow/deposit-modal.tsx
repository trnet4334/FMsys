'use client';

import { PiggyBank, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fmtCurrency } from '../../lib/format';
import type { TargetItem } from './target-tab';

type Props = {
  target: TargetItem;
  onClose: () => void;
};

export function DepositModal({ target, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');
  const [date,   setDate]   = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const remaining  = target.goal - target.current;
  const amountNum  = parseFloat(amount) || 0;
  const newCurrent = Math.min(target.current + amountNum, target.goal);
  const newPct     = Math.round((newCurrent / target.goal) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-16 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="size-9 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors">
              <X size={17} />
            </button>
            <h2 className="font-bold text-ink-0 text-lg">Deposit</h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Target summary */}
          <div className="flex items-center gap-4 p-4 bg-bg-1 rounded-xl border border-line">
            <div className="size-11 bg-brand-weak border border-brand/20 rounded-xl flex items-center justify-center shrink-0">
              <target.Icon size={22} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-0 truncate">{target.label}</p>
              <p className="text-[11px] text-ink-disabled mt-0.5">
                TWD {fmtCurrency.format(target.current)} / {fmtCurrency.format(target.goal)}
              </p>
              <div className="w-full h-1.5 bg-bg-0 rounded-full overflow-hidden mt-2 border border-line">
                <div
                  className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${target.pct}%` }}
                />
              </div>
            </div>
            <span className="text-brand font-black text-sm shrink-0">{target.pct}%</span>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-brand">TWD</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={remaining}
                className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-3.5 text-ink-0 text-base font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>
            <p className="text-[11px] text-ink-disabled">
              Remaining to goal: <span className="text-ink-1 font-bold">TWD {fmtCurrency.format(remaining)}</span>
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Preview — only when amount is filled */}
          {amountNum > 0 && (
            <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl space-y-3">
              <p className="text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-1.5">
                <PiggyBank size={12} />
                After Deposit
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-ink-1">New balance</span>
                <span className="font-black text-ink-0">TWD {fmtCurrency.format(newCurrent)}</span>
              </div>
              <div className="w-full h-2 bg-bg-1 rounded-full overflow-hidden border border-line">
                <div
                  className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full shadow-[0_0_8px_rgba(0,102,255,0.3)] transition-all duration-500"
                  style={{ width: `${newPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-ink-disabled">{newPct}% of goal</span>
                {newCurrent >= target.goal && (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Goal reached!</span>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">
              Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add a note..."
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors resize-none"
            />
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
            disabled={amountNum <= 0}
            className="w-full md:w-auto px-8 py-3 bg-brand text-white font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Confirm Deposit
          </button>
        </div>

      </div>
    </div>
  );
}
