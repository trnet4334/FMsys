import { Calendar, CreditCard, TrendingUp, Zap, Banknote } from 'lucide-react'

type EventType = 'bill' | 'dividend' | 'expiry' | 'income'

type FinancialEvent = {
  day: string
  month: string
  category: string
  name: string
  type: EventType
}

const EVENTS: FinancialEvent[] = [
  { day: '1',  month: 'APR', category: 'Credit Card', name: 'Visa Signature payment due',  type: 'bill'     },
  { day: '3',  month: 'APR', category: 'Utilities',   name: 'Chunghwa Telecom bill',        type: 'bill'     },
  { day: '5',  month: 'APR', category: 'Investment',  name: 'AAPL quarterly dividend',      type: 'dividend' },
  { day: '15', month: 'APR', category: 'Options',     name: 'AAPL 200C expiry',             type: 'expiry'   },
  { day: '28', month: 'APR', category: 'Payroll',     name: 'Monthly salary – TechCorp',    type: 'income'   },
]

const TYPE_STYLES: Record<EventType, { badge: string; icon: string }> = {
  bill:     { badge: 'bg-rose-500/10 text-rose-500',       icon: 'bg-rose-500/10 text-rose-500'       },
  dividend: { badge: 'bg-emerald-500/10 text-emerald-500', icon: 'bg-emerald-500/10 text-emerald-500' },
  expiry:   { badge: 'bg-amber-500/10 text-amber-500',     icon: 'bg-amber-500/10 text-amber-500'     },
  income:   { badge: 'bg-brand-weak text-brand',           icon: 'bg-brand-weak text-brand'           },
}

const TYPE_LABELS: Record<EventType, string> = {
  bill:     'Bill',
  dividend: 'Dividend',
  expiry:   'Expiry',
  income:   'Income',
}

function EventIcon({ type }: { type: EventType }) {
  const props = { size: 13 }
  switch (type) {
    case 'bill':     return <CreditCard {...props} />
    case 'dividend': return <TrendingUp {...props} />
    case 'expiry':   return <Zap {...props} />
    case 'income':   return <Banknote {...props} />
    default:         return <Calendar {...props} />
  }
}

export function UpcomingEventsPanel() {
  return (
    <section className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex items-center gap-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">
          Upcoming
        </h2>
        <span className="size-1 rounded-full bg-line shrink-0" />
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-weak text-brand border border-brand/20">
          Next 30 days
        </span>
      </div>

      <ul>
        {EVENTS.map((event) => {
          const styles = TYPE_STYLES[event.type]
          return (
            <li
              key={`${event.day}-${event.name}`}
              className="px-6 py-4 flex items-center gap-3 border-b border-line last:border-0 hover:bg-bg-1/50 transition-colors"
            >
              <div className="shrink-0 w-10 text-center">
                <span className="text-base font-black text-ink-0 leading-none block">
                  {event.day}
                </span>
                <span className="text-[9px] font-bold text-ink-disabled uppercase leading-none mt-0.5 block">
                  {event.month}
                </span>
              </div>

              <div className="w-px h-8 bg-line shrink-0" />

              <div
                className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${styles.icon}`}
              >
                <EventIcon type={event.type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0 truncate">{event.name}</p>
                <p className="text-[10px] text-ink-disabled mt-0.5">{event.category}</p>
              </div>

              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${styles.badge}`}
              >
                {TYPE_LABELS[event.type]}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
