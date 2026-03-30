'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Flame,
  Info,
  Lock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ── Free analysis data ────────────────────────────────────────────────────────

const HEALTH_SCORE = 78;

const INSIGHTS = [
  {
    Icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    type: 'positive' as const,
    title: 'Strong savings rate',
    body: 'Your net savings rate of 42.5% is well above the recommended 20%. You are building wealth faster than most people in your income bracket.',
  },
  {
    Icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    type: 'warning' as const,
    title: 'Housing cost is high',
    body: 'Housing takes up 45% of your total expenses. Financial advisors generally recommend keeping it below 30% of take-home pay.',
  },
  {
    Icon: Flame,
    iconBg: 'bg-brand-weak',
    iconColor: 'text-brand',
    type: 'neutral' as const,
    title: 'Income trending up',
    body: 'Your monthly income has grown 8.2% compared to last month. Freelance and investment income are the main drivers of this increase.',
  },
  {
    Icon: TrendingDown,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    type: 'positive' as const,
    title: 'Expenses under control',
    body: 'Average monthly expenses decreased 2.4% vs last month. Dining and transport spending both dropped, which contributed to a higher net savings.',
  },
];

const INSIGHT_BADGE: Record<'positive' | 'warning' | 'neutral', string> = {
  positive: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  warning:  'text-amber-500 bg-amber-500/10 border-amber-500/20',
  neutral:  'text-brand bg-brand-weak border-brand/20',
};

const INSIGHT_BADGE_LABEL: Record<'positive' | 'warning' | 'neutral', string> = {
  positive: 'Good',
  warning:  'Watch',
  neutral:  'Info',
};

// ── Premium features list ─────────────────────────────────────────────────────

const PREMIUM_FEATURES = [
  'AI-powered 12-month cash flow projection',
  'Personalised investment rebalancing advice',
  'Tax optimisation opportunities',
  'Peer benchmark vs your income & age group',
  'Automated monthly PDF report delivery',
  'Spending anomaly & fraud risk alerts',
];

// ── Score ring helper ─────────────────────────────────────────────────────────

const CIRC = 2 * Math.PI * 28; // r=28

function ScoreRing({ score }: { score: number }) {
  const filled   = (score / 100) * CIRC;
  const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative size-24 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={scoreColor} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRC}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink-0 leading-none">{score}</span>
        <span className="text-[9px] font-bold text-ink-disabled uppercase tracking-wider mt-0.5">Score</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InsightsSection() {
  return (
    <section className="space-y-6">

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-brand-weak flex items-center justify-center">
          <Sparkles size={16} className="text-brand" />
        </div>
        <div>
          <h2 className="text-xl font-black text-ink-0 tracking-tight">Insights</h2>
          <p className="text-xs text-ink-disabled">Personalised analysis based on your financial data</p>
        </div>
      </div>

      {/* ── Free analysis card ─────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-line overflow-hidden">

        {/* Card header with health score */}
        <div className="px-8 py-6 border-b border-line flex items-center gap-6">
          <ScoreRing score={HEALTH_SCORE} />
          <div>
            <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Financial Health Score</p>
            <h3 className="text-2xl font-black text-ink-0 leading-tight">You&apos;re doing well</h3>
            <p className="text-sm text-ink-1 mt-1 leading-relaxed">
              Your overall financial profile is <strong className="text-ink-0">healthy</strong>. Income is rising, expenses are stable, and your savings rate is excellent. One area to watch: housing cost ratio.
            </p>
          </div>
        </div>

        {/* Insight items */}
        <div className="divide-y divide-line">
          {INSIGHTS.map(({ Icon, iconBg, iconColor, type, title, body }) => (
            <div key={title} className="px-8 py-5 flex items-start gap-5 hover:bg-bg-1/50 transition-colors">
              <div className={`size-10 rounded-xl ${iconBg} border border-line flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon size={18} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-ink-0">{title}</p>
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${INSIGHT_BADGE[type]}`}>
                    {INSIGHT_BADGE_LABEL[type]}
                  </span>
                </div>
                <p className="text-xs text-ink-1 leading-relaxed">{body}</p>
              </div>
              <Info size={14} className="text-ink-disabled shrink-0 mt-1" />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-8 py-4 bg-bg-1/50 border-t border-line">
          <p className="text-[11px] text-ink-disabled text-center">
            Analysis based on the last 3 months of data · Updated daily
          </p>
        </div>
      </div>

      {/* ── Premium upsell card ────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-line overflow-hidden">

        {/* Blurred preview layer */}
        <div className="px-8 py-6 space-y-4 select-none pointer-events-none blur-[3px] opacity-40 bg-card" aria-hidden>
          <div className="h-4 w-48 bg-ink-disabled/30 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {[80, 120, 96, 112].map((w, i) => (
              <div key={i} className="h-20 bg-bg-1 rounded-xl border border-line" style={{ opacity: 1 - i * 0.1 }} />
            ))}
          </div>
          <div className="space-y-2">
            {[100, 80, 90, 70].map((w, i) => (
              <div key={i} className="h-3 bg-ink-disabled/20 rounded-full" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm px-8 py-10">
          <div className="w-full max-w-md text-center space-y-6">

            {/* Icon + headline */}
            <div className="flex flex-col items-center gap-3">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-ink-0">Unlock Full Financial Analysis</h3>
                <p className="text-xs text-ink-disabled mt-1">Upgrade to Pro for deeper insights and personalised recommendations</p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {PREMIUM_FEATURES.map((feat) => (
                <div key={feat} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-ink-1 leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Zap size={15} />
                Upgrade to Pro
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-ink-1 bg-bg-1 border border-line hover:text-ink-0 hover:bg-card transition-all"
              >
                <Lock size={14} />
                View plans
              </button>
            </div>

            <p className="text-[10px] text-ink-disabled">No credit card required for the free trial · Cancel anytime</p>
          </div>
        </div>
      </div>

    </section>
  );
}
