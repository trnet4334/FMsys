import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react';

import { fmt } from '../../lib/format';

type CashflowMiniPanelProps = {
  inflow: number;
  outflow: number;
};

export function CashflowMiniPanel({ inflow, outflow }: CashflowMiniPanelProps) {
  const net = inflow - outflow;
  const isPositive = net >= 0;

  return (
    <section className="rounded-xl p-6 bg-card border border-line shadow-soft">
      <div className="mb-5">
        <h3 className="text-ink-0 text-lg font-bold">Cashflow</h3>
        <p className="text-ink-1 text-sm">This month</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Inflow */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-ink-1 text-xs font-semibold uppercase tracking-wide">Inflow</p>
            <p className="text-ink-0 text-base font-bold">TWD {fmt.format(inflow)}</p>
          </div>
        </div>

        {/* Outflow */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={18} className="text-rose-500" />
          </div>
          <div className="flex-1">
            <p className="text-ink-1 text-xs font-semibold uppercase tracking-wide">Outflow</p>
            <p className="text-ink-0 text-base font-bold">TWD {fmt.format(outflow)}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-line" />

        {/* Net */}
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
              isPositive ? 'bg-brand-weak' : 'bg-rose-500/10'
            }`}
          >
            <Minus
              size={18}
              className={isPositive ? 'text-brand' : 'text-rose-500'}
            />
          </div>
          <div className="flex-1">
            <p className="text-ink-1 text-xs font-semibold uppercase tracking-wide">Net</p>
            <p
              className={`text-base font-bold ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {isPositive ? '+' : ''}TWD {fmt.format(net)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
