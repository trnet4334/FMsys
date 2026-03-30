import Link from 'next/link'
import { Target } from 'lucide-react'

import { GOALS } from '../../lib/mock-data/goals'

const fmt = new Intl.NumberFormat('en-US')

export function GoalsPanel() {
  return (
    <section className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-brand shrink-0" />
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">
          Goals
        </h2>
        <span className="size-1 rounded-full bg-line shrink-0" />
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-weak text-brand border border-brand/20">
          {GOALS.length} active
        </span>
      </div>

      <ul className="divide-y divide-line">
        {GOALS.map((goal) => (
          <li key={goal.id} className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Target size={13} className="text-ink-disabled shrink-0" />
                <span className="text-sm font-semibold text-ink-0 truncate">{goal.label}</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ml-2 ${goal.statusClass}`}>
                {goal.status}
              </span>
            </div>

            <div className="h-1.5 bg-bg-1 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${goal.barClass}`}
                style={{ width: `${goal.pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ink-disabled">
                TWD {fmt.format(goal.current)} / TWD {fmt.format(goal.goal)}
              </span>
              <span className="text-[10px] font-bold text-ink-1">{goal.pct}%</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-6 py-4 border-t border-line">
        <Link href="/cashflow?tab=Target" className="text-xs font-bold text-brand hover:underline">
          Manage Targets →
        </Link>
      </div>
    </section>
  )
}
