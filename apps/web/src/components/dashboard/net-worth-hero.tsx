import { CreditCard, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { fmt } from '../../lib/format';

type NetWorthHeroProps = {
  snapshot: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    deltaPct: number;
    currency: string;
  };
};

function fmtAmount(value: number, currency: string) {
  return `${currency} ${fmt.format(value)}`;
}

export function NetWorthHero({ snapshot }: NetWorthHeroProps) {
  const isPositive = snapshot.deltaPct >= 0;
  const deltaLabel = `${isPositive ? '+' : ''}${(snapshot.deltaPct * 100).toFixed(2)}%`;
  const DeltaIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <section className="relative overflow-hidden bg-card rounded-2xl border border-line mb-8">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 size-80 bg-brand/15 blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute -top-16 -right-16 size-64 bg-emerald-500/10 blur-[80px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 size-48 bg-violet-500/[0.08] blur-[80px] rounded-full" />

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--ink-0) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content */}
      <div className="relative px-10 py-10">
        {/* Live badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-5">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Live
          </span>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left — headline figure */}
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest mb-3">
              Total Net Worth
            </p>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tight text-ink-0 leading-none mb-4">
              {fmtAmount(snapshot.netWorth, snapshot.currency)}
            </h1>

            {/* Delta badge */}
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              }`}
            >
              <DeltaIcon size={14} />
              {deltaLabel}
            </span>

            <p className="text-xs text-ink-disabled mt-4">
              Live data from connected accounts
            </p>
          </div>

          {/* Right — metric blocks */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Assets */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-bg-1/80 border border-line backdrop-blur-sm">
              <div className="size-10 rounded-xl bg-brand-weak border border-brand/20 flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider mb-0.5">
                  Total Assets
                </p>
                <p className="text-xl font-black text-ink-0">
                  {fmtAmount(snapshot.totalAssets, snapshot.currency)}
                </p>
              </div>
            </div>

            {/* Liabilities */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-bg-1/80 border border-line backdrop-blur-sm">
              <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider mb-0.5">
                  Total Liabilities
                </p>
                <p className="text-xl font-black text-ink-0">
                  {fmtAmount(snapshot.totalLiabilities, snapshot.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
    </section>
  );
}
