import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ReturnPeriod {
  label: string;
  amount: string;
  pct: string;
  positive: boolean;
  sparkline: number[];
}

const periods: ReturnPeriod[] = [
  { label: 'Today',      amount: '+TWD 1,240',  pct: '+0.51%', positive: true,  sparkline: [50,60,70,65,80] },
  { label: 'This Week',  amount: '−TWD 3,820',  pct: '−1.55%', positive: false, sparkline: [80,70,60,50,45] },
  { label: 'This Month', amount: '+TWD 8,450',  pct: '+3.57%', positive: true,  sparkline: [40,55,65,70,80] },
  { label: 'YTD',        amount: '+TWD 38,420', pct: '+18.4%', positive: true,  sparkline: [30,45,55,70,85] },
];

export function PortfolioReturnPanel() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {periods.map((period) => {
        const Arrow = period.positive ? ArrowUpRight : ArrowDownRight;
        const maxH = Math.max(...period.sparkline);
        return (
          <div
            key={period.label}
            className="relative overflow-hidden bg-card rounded-2xl border border-line p-6 shadow-soft group hover:border-brand/30 transition-all"
          >
            {/* Ambient glow blob */}
            <span
              className={[
                'pointer-events-none absolute -bottom-6 -right-6 size-24 blur-3xl rounded-full opacity-60',
                period.positive ? 'bg-emerald-500/30' : 'bg-rose-500/30',
              ].join(' ')}
              aria-hidden="true"
            />

            {/* Top accent line */}
            <span
              className={[
                'pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent',
                period.positive
                  ? 'via-emerald-500/60'
                  : 'via-rose-500/60',
              ].join(' ')}
              aria-hidden="true"
            />

            {/* Period label */}
            <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-3">
              {period.label}
            </p>

            {/* Amount */}
            <p
              className={[
                'text-xl font-black tabular-nums leading-none',
                period.positive ? 'text-emerald-500' : 'text-rose-500',
              ].join(' ')}
            >
              {period.amount}
            </p>

            {/* Mini sparkline */}
            <div className="flex items-end gap-0.5 mt-3 mb-2" aria-hidden="true">
              {period.sparkline.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${period.positive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ height: `${Math.round((h / maxH) * 24)}px` }}
                />
              ))}
            </div>

            {/* Percentage badge */}
            <span
              className={[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                period.positive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500',
              ].join(' ')}
            >
              <Arrow size={10} />
              {period.pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}
