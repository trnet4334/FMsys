'use client';

import {
  BarChart2,
  Building2,
  Calendar,
  Check,
  Download,
  FileText,
  List,
  PieChart,
  Table2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ExportDataModalProps = {
  onClose: () => void;
};

type Format = 'pdf' | 'csv';
type Range  = '30d' | '3m' | 'ytd' | 'custom';

const DATE_RANGES: { key: Range; label: string }[] = [
  { key: '30d',    label: 'Last 30 Days'   },
  { key: '3m',     label: 'Last 3 Months'  },
  { key: 'ytd',    label: 'Year-to-Date'   },
  { key: 'custom', label: 'Custom'         },
];

const SECTIONS = [
  { key: 'summary',     Icon: PieChart,   label: 'Summary',              defaultOn: true  },
  { key: 'transactions',Icon: List,        label: 'Transaction History',  defaultOn: true  },
  { key: 'allocation',  Icon: Building2,   label: 'Asset Allocation',     defaultOn: true  },
  { key: 'cashflow',    Icon: BarChart2,   label: 'Cashflow Analysis',    defaultOn: false },
] as const;

const FILE_SIZE: Record<Format, string> = { pdf: '2.4 MB', csv: '0.3 MB' };

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i);

export function ExportDataModal({ onClose }: ExportDataModalProps) {
  const [format, setFormat]     = useState<Format>('pdf');
  const [range, setRange]       = useState<Range>('3m');
  const [ytdYear, setYtdYear]   = useState(String(CURRENT_YEAR));
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultOn]))
  );

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function toggleSection(key: string) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-card border-t md:border border-line md:rounded-xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-bottom-2 duration-300">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-brand-weak flex items-center justify-center">
              <FileText size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-0 leading-none">Export Report</h2>
              <p className="text-xs text-ink-disabled mt-0.5">Configure your document parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 space-y-8">

          {/* Format */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Select Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* PDF */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`relative p-5 rounded-xl text-left transition-all ${
                  format === 'pdf'
                    ? 'bg-bg-1 border-2 border-brand shadow-[0_0_15px_rgba(0,102,255,0.15)]'
                    : 'bg-bg-1 border-2 border-transparent hover:border-line'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <FileText size={28} className={format === 'pdf' ? 'text-brand' : 'text-ink-disabled'} />
                  {format === 'pdf' && (
                    <div className="size-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-ink-0 text-sm">PDF (Detailed)</h4>
                <p className="text-xs text-ink-1 mt-1 leading-relaxed">Print-ready document with visual charts</p>
              </button>

              {/* CSV */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`relative p-5 rounded-xl text-left transition-all ${
                  format === 'csv'
                    ? 'bg-bg-1 border-2 border-brand shadow-[0_0_15px_rgba(0,102,255,0.15)]'
                    : 'bg-bg-1 border-2 border-transparent hover:border-line'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <Table2 size={28} className={format === 'csv' ? 'text-brand' : 'text-ink-disabled'} />
                  {format === 'csv' && (
                    <div className="size-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-ink-0 text-sm">CSV (Data Only)</h4>
                <p className="text-xs text-ink-1 mt-1 leading-relaxed">Raw data for custom external analysis</p>
              </button>
            </div>
          </section>

          {/* Date range */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Date Range</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DATE_RANGES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    range === key
                      ? 'bg-brand text-white shadow-soft'
                      : 'bg-bg-1 text-ink-1 border border-line hover:border-brand/30 hover:text-ink-0'
                  }`}
                >
                  {key === 'custom' && <Calendar size={12} />}
                  {label}
                </button>
              ))}
            </div>

            {/* Year-to-Date: year selector */}
            {range === 'ytd' && (
              <div className="flex items-center gap-3 p-4 bg-bg-1 border border-brand/30 rounded-xl">
                <Calendar size={16} className="text-brand shrink-0" />
                <label className="text-xs font-bold text-ink-disabled uppercase tracking-wider shrink-0">Year</label>
                <select
                  value={ytdYear}
                  onChange={(e) => setYtdYear(e.target.value)}
                  className="flex-1 bg-card border border-line rounded-lg px-3 py-2 text-sm font-semibold text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="text-xs text-ink-disabled shrink-0">Jan 1 – today</span>
              </div>
            )}

            {/* Custom: from / to date inputs */}
            {range === 'custom' && (
              <div className="p-4 bg-bg-1 border border-brand/30 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-wider">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      max={customTo || undefined}
                      className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-wider">To</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      min={customFrom || undefined}
                      className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink-0 outline-none focus:border-brand/50 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
                {customFrom && customTo && (
                  <p className="text-[11px] text-brand font-medium">
                    {new Date(customFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' → '}
                    {new Date(customTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Report sections */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Report Sections</h3>
            <div className="space-y-2">
              {SECTIONS.map(({ key, Icon, label }) => {
                const checked = sections[key] ?? false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-1 border border-line hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={checked ? 'text-brand' : 'text-ink-disabled'} />
                      <span className={`text-sm font-medium ${checked ? 'text-ink-0' : 'text-ink-1'}`}>{label}</span>
                    </div>
                    <div className={`size-5 rounded flex items-center justify-center border transition-colors ${
                      checked
                        ? 'bg-brand border-brand'
                        : 'bg-card border-line'
                    }`}>
                      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-6 border-t border-line bg-bg-1/50 shrink-0 space-y-3">
          <button
            type="button"
            className="w-full py-4 bg-brand text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-soft hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Download size={18} />
            Generate &amp; Export Report
          </button>
          <p className="text-center text-[10px] text-ink-disabled uppercase tracking-widest">
            Estimated file size: {FILE_SIZE[format]}
          </p>
        </div>
      </div>
    </div>
  );
}
