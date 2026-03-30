'use client';

import { useState } from 'react';
import { TrendingUp, X } from 'lucide-react';
import type { InvestmentRecord } from '../../lib/mock-data/investment-records';
import { useEscapeKey } from '../../lib/use-escape-key';

type RecordType   = InvestmentRecord['type'];
type RecordStatus = InvestmentRecord['status'];

const TYPES: { key: RecordType; label: string }[] = [
  { key: 'Stock',   label: 'Stock'   },
  { key: 'Crypto',  label: 'Crypto'  },
  { key: 'Forex',   label: 'Forex'   },
  { key: 'Options', label: 'Options' },
];

const TYPE_ACCENT: Record<RecordType, string> = {
  Stock:   'bg-brand/10 text-brand border-brand',
  Crypto:  'bg-violet-500/10 text-violet-400 border-violet-500',
  Forex:   'bg-sky-500/10 text-sky-400 border-sky-500',
  Options: 'bg-warn/10 text-warn border-warn',
};

type Props = { onClose: () => void };

export function AddRecordModal({ onClose }: Props) {
  const [name,      setName]      = useState('');
  const [subName,   setSubName]   = useState('');
  const [type,      setType]      = useState<RecordType>('Stock');
  const [date,      setDate]      = useState(() => new Date().toISOString().slice(0, 10));
  const [status,    setStatus]    = useState<RecordStatus>('ongoing');
  const [returnAmt, setReturnAmt] = useState('');
  const [returnPct, setReturnPct] = useState('');

  useEscapeKey(onClose);

  const isClosed = status === 'closed';

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        <div className="px-6 h-16 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="size-9 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors">
              <X size={17} />
            </button>
            <h2 className="font-bold text-ink-0 text-lg flex items-center gap-2">
              <TrendingUp size={17} className="text-brand" />
              New Investment Record
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setType(key)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    type === key
                      ? TYPE_ACCENT[key]
                      : 'bg-bg-1 border-transparent text-ink-disabled hover:border-line'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Ticker / Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NVDA, BTC, USD/JPY"
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">
              Description <span className="normal-case font-normal">(optional)</span>
            </label>
            <input type="text" value={subName} onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. NVIDIA Corp."
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Status</label>
              <div className="flex bg-bg-1 border border-line rounded-xl p-1 gap-1 h-[52px]">
                {(['ongoing', 'closed'] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`flex-1 text-xs font-bold rounded-lg capitalize transition-all ${
                      status === s
                        ? s === 'ongoing'
                          ? 'bg-success text-white shadow-sm'
                          : 'bg-bg-0 text-ink-0 shadow-sm border border-line'
                        : 'text-ink-disabled hover:text-ink-1'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isClosed && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Return (TWD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand">TWD</span>
                  <input type="number" value={returnAmt} onChange={(e) => setReturnAmt(e.target.value)}
                    placeholder="0"
                    className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-3.5 text-ink-0 text-sm font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Return %</label>
                <div className="relative">
                  <input type="number" value={returnPct} onChange={(e) => setReturnPct(e.target.value)}
                    placeholder="0.0"
                    step="0.1"
                    className="w-full bg-bg-1 border border-line rounded-xl pl-4 pr-10 py-3.5 text-ink-0 text-sm font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-disabled">%</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-4 border-t border-line bg-bg-1/50 flex flex-col-reverse md:flex-row gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all text-sm">
            Cancel
          </button>
          <button type="button"
            className="w-full md:w-auto px-8 py-3 bg-brand text-white font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm">
            Add Record
          </button>
        </div>

      </div>
    </div>
  );
}
