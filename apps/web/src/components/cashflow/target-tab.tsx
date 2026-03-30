'use client';

import { Car, Pencil, Plane, Plus, Shield, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { fmtCurrency } from '../../lib/format';
import { DepositModal } from './deposit-modal';

export type TargetItem = {
  id: string;
  Icon: LucideIcon;
  iconKey: string;
  label: string;
  date: string;
  pct: number;
  current: number;
  goal: number;
};

type TargetTabProps = {
  onNewTarget: () => void;
  onEdit: (item: TargetItem) => void;
};

const FULL_TARGETS: TargetItem[] = [
  { id: 't1', Icon: Plane,  iconKey: 'plane',   label: 'Summer Retreat', date: 'July 15, 2024', pct: 70, current: 8400,  goal: 12000  },
  { id: 't2', Icon: Car,    iconKey: 'car',      label: 'New Car',         date: 'Mar 10, 2025',  pct: 26, current: 14450, goal: 55000  },
  { id: 't3', Icon: Shield, iconKey: 'shield',   label: 'Emergency Fund',  date: 'Ongoing',       pct: 80, current: 20000, goal: 25000  },
];

const totalSavings = FULL_TARGETS.reduce((s, t) => s + t.current, 0);
const totalGoal    = FULL_TARGETS.reduce((s, t) => s + t.goal, 0);
const overallPct   = Math.round((totalSavings / totalGoal) * 100);

export function TargetTab({ onNewTarget, onEdit }: TargetTabProps) {
  const [depositTarget, setDepositTarget] = useState<TargetItem | null>(null);

  return (
    <div className="space-y-8">

      {/* Summary bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Total Savings Progress — 2/3 */}
        <div className="md:col-span-2 relative overflow-hidden bg-card rounded-2xl border border-line p-8">
          <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full -mr-24 -mt-24" />
          <div className="relative">
            <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest mb-2">Total Savings Progress</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black tracking-tight text-ink-0">TWD {fmtCurrency.format(totalSavings)}</span>
              <span className="text-ink-1 text-sm font-medium">of TWD {fmtCurrency.format(totalGoal)}</span>
            </div>
            <div className="w-full h-3 bg-bg-1 rounded-full overflow-hidden mb-3 border border-line">
              <div
                className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full shadow-[0_0_12px_rgba(0,102,255,0.4)]"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand font-bold text-sm">{overallPct}% Achieved</span>
              <span className="text-ink-disabled text-xs">Estimated: Dec 2025</span>
            </div>
          </div>
        </div>

        {/* Monthly Contribution — 1/3 */}
        <div className="bg-bg-1 rounded-2xl border border-line p-6 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-brand-weak border border-brand/20 flex items-center justify-center mb-4">
              <TrendingUp size={18} className="text-brand" />
            </div>
            <h3 className="text-ink-0 font-bold text-base leading-tight">Monthly Contribution</h3>
            <p className="text-ink-1 text-xs mt-1">Consistency is key to reaching goals faster.</p>
          </div>
          <div className="mt-6">
            <span className="text-2xl font-black text-ink-0">+TWD 2,450.00</span>
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold mt-1">
              <TrendingUp size={11} />
              12% from last month
            </div>
          </div>
        </div>
      </section>

      {/* Active Goals */}
      <section className="space-y-5">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-ink-0 tracking-tight">Active Goals</h2>
            <p className="text-ink-1 text-sm">Managing {FULL_TARGETS.length} active wealth targets</p>
          </div>
          <button
            type="button"
            onClick={onNewTarget}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold shadow-soft hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            New Target
          </button>
        </div>

        <div className="space-y-4">
          {FULL_TARGETS.map((target) => {
          const { id, Icon, label, date, pct, current, goal } = target;
          return (
            <div
              key={id}
              className="group bg-card rounded-2xl border border-line hover:border-brand/30 transition-all duration-300 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                {/* Identity */}
                <div className="flex items-center gap-5">
                  <div className="size-14 bg-brand-weak border border-brand/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={26} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="text-ink-0 font-bold text-base">{label}</h4>
                    <p className="text-ink-1 text-sm">Target Date: {date}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex-1 max-w-md space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-ink-0 font-bold text-sm">TWD {fmtCurrency.format(current)}</span>
                      <span className="text-ink-disabled text-xs">/ {fmtCurrency.format(goal)}</span>
                    </div>
                    <span className="text-brand font-bold text-sm">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-bg-1 rounded-full overflow-hidden border border-line">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full shadow-[0_0_8px_rgba(0,102,255,0.3)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(target)}
                    className="size-9 flex items-center justify-center rounded-lg text-ink-disabled hover:text-ink-0 hover:bg-bg-1 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositTarget(target)}
                    className="px-4 py-2 bg-brand-weak text-brand font-bold rounded-lg text-sm hover:bg-brand hover:text-white transition-all"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {depositTarget && (
        <DepositModal target={depositTarget} onClose={() => setDepositTarget(null)} />
      )}
    </div>
  );
}
