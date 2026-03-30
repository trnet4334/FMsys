// apps/web/src/components/allocation/investment-records.tsx
'use client';

import { useState } from 'react';
import { TrendingUp, Upload } from 'lucide-react';
import type { InvestmentRecord } from '../../lib/mock-data/investment-records';
import { fmtDate, fmtMonthYear } from '../../lib/format';
import { AddRecordModal } from './add-record-modal';
import { ImportRecordsModal } from './import-records-modal';

type Tab = 'all' | 'Stock' | 'Crypto' | 'Forex' | 'Options';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'Stock',   label: 'Stock'   },
  { key: 'Crypto',  label: 'Crypto'  },
  { key: 'Forex',   label: 'Forex'   },
  { key: 'Options', label: 'Options' },
];

const TYPE_STYLE: Record<Exclude<Tab, 'all'>, string> = {
  Stock:   'bg-brand/10 text-brand',
  Crypto:  'bg-violet-500/10 text-violet-400',
  Forex:   'bg-sky-500/10 text-sky-400',
  Options: 'bg-warn/10 text-warn',
};

type Props = { records: InvestmentRecord[] };

function getInitialPeriod(records: InvestmentRecord[]) {
  if (records.length === 0) {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }

  const latestRecord = records.reduce((latest, record) =>
    new Date(record.date) > new Date(latest.date) ? record : latest
  );
  const latestDate = new Date(latestRecord.date);
  return { month: latestDate.getMonth(), year: latestDate.getFullYear() };
}

export function InvestmentRecords({ records }: Props) {
  const initialPeriod = getInitialPeriod(records);
  const [month,    setMonth]    = useState(initialPeriod.month);     // 0-indexed
  const [year,     setYear]     = useState(initialPeriod.year);
  const [tab,      setTab]      = useState<Tab>('all');
  const [showModal,   setShowModal]   = useState(false);
  const [importOpen,  setImportOpen]  = useState(false);

  // ── Derived ──────────────────────────────────────────────────────
  const monthRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const filtered = tab === 'all'
    ? monthRecords
    : monthRecords.filter((r) => r.type === tab);

  const closed  = filtered.filter((r) => r.status === 'closed');
  const ongoing = filtered.filter((r) => r.status === 'ongoing');

  const realizedPnL = closed.reduce((s, r) => s + (r.return ?? 0), 0);

  // Tab badge counts — always scoped to current month regardless of active tab
  function countForTab(t: Tab) {
    return t === 'all'
      ? monthRecords.length
      : monthRecords.filter((r) => r.type === t).length;
  }

  // ── Month navigation ─────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else { setMonth((m) => m - 1); }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else { setMonth((m) => m + 1); }
  }

  const monthLabel = fmtMonthYear(year, month);

  function fmtPnL(val: number) {
    const sign = val >= 0 ? '+' : '−';
    return `${sign}$${Math.abs(val).toLocaleString()}`;
  }
  function fmtPct(val: number) {
    const sign = val >= 0 ? '+' : '−';
    return `${sign}${(Math.abs(val) * 100).toFixed(1)}%`;
  }
  function pnlColor(val: number) {
    return val >= 0 ? 'text-success' : 'text-danger';
  }

  return (
    <>
    <div className="bg-card rounded-xl border border-line shadow-soft overflow-hidden mt-8">

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-0 border-b border-line">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-ink-0 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand" />
            Investment Records
          </h3>
          <div className="flex items-center gap-3">
            {/* Month navigator */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-bg-1 border border-line rounded-lg">
              <button
                type="button"
                onClick={prevMonth}
                className="w-5 h-5 flex items-center justify-center text-ink-1 hover:text-ink-0 transition-colors text-sm"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-ink-0 min-w-[110px] text-center">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-5 h-5 flex items-center justify-center text-ink-1 hover:text-ink-0 transition-colors text-sm"
              >
                ›
              </button>
            </div>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:bg-card rounded-lg text-sm font-semibold transition-all"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-soft"
            >
              + Add Record
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(({ key, label }) => {
            const count = countForTab(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`relative px-4 py-2.5 text-sm font-semibold rounded-t transition-colors
                  ${tab === key ? 'text-brand' : 'text-ink-1 hover:text-ink-0'}`}
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full">
                    {count}
                  </span>
                )}
                {tab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-ink-1 text-sm">
          No records for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-bg-0/30">
                {['Date', 'Name', 'Type', 'Return', 'Return %', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-bold text-ink-1 uppercase tracking-wider ${i >= 3 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">

              {/* ── 已結束 section ── */}
              {closed.length > 0 && (
                <>
                  <tr>
                    <td colSpan={6} className="px-5 py-2 bg-bg-1/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-ink-disabled" />
                        <span className="text-[11px] font-bold text-ink-1 uppercase tracking-wider">
                          已結束 · Closed
                        </span>
                        <span className="text-[11px] text-ink-disabled ml-auto">
                          {closed.length} {closed.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {closed.map((r) => (
                    <tr key={r.id} className="hover:bg-bg-1 transition-colors">
                      <td className="px-5 py-4 text-ink-1 text-xs">{fmtDate(r.date)}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink-0">{r.name}</p>
                        {r.subName && <p className="text-xs text-ink-1 mt-0.5">{r.subName}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${TYPE_STYLE[r.type]}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-bold ${pnlColor(r.return ?? 0)}`}>
                        {r.return !== undefined ? fmtPnL(r.return) : '—'}
                      </td>
                      <td className={`px-5 py-4 text-right font-bold ${pnlColor(r.returnPct ?? 0)}`}>
                        {r.returnPct !== undefined ? fmtPct(r.returnPct) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-bg-1 text-ink-1 text-[11px] font-bold">
                          已結束
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* ── 未結束 section ── */}
              {ongoing.length > 0 && (
                <>
                  <tr>
                    <td colSpan={6} className="px-5 py-2 bg-success/5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                          未結束 · Ongoing
                        </span>
                        <span className="text-[11px] text-ink-disabled ml-auto">
                          {ongoing.length} {ongoing.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {ongoing.map((r) => (
                    <tr key={r.id} className="bg-success/5 hover:bg-success/10 transition-colors">
                      <td className="px-5 py-4 text-ink-1 text-xs">{fmtDate(r.date)}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink-0">{r.name}</p>
                        {r.subName && <p className="text-xs text-ink-1 mt-0.5">{r.subName}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${TYPE_STYLE[r.type]}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-ink-disabled">—</td>
                      <td className="px-5 py-4 text-right text-ink-disabled">—</td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          未結束
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}

            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-line flex items-center justify-between">
        <span className="text-sm font-bold text-ink-disabled cursor-not-allowed">
          View All Months →
        </span>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-1 uppercase tracking-wider">Ongoing</p>
            <p className="text-sm font-bold text-ink-0 mt-0.5">
              {ongoing.length} {ongoing.length === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-1 uppercase tracking-wider">Realized P&L</p>
            <p className={`text-sm font-bold mt-0.5 ${realizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
              {fmtPnL(realizedPnL)}
            </p>
          </div>
        </div>
      </div>

    </div>

    {showModal   && <AddRecordModal      onClose={() => setShowModal(false)}  />}
    {importOpen  && <ImportRecordsModal  onClose={() => setImportOpen(false)} />}
    </>
  );
}
