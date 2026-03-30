import Link from 'next/link';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

type AlertItem = {
  id: string;
  message: string;
  level: 'high' | 'medium' | 'low';
};

type AlertsPanelProps = {
  alerts: AlertItem[];
};

const levelConfig = {
  high: {
    Icon: ShieldAlert,
    pill: 'bg-rose-500/10 text-rose-500',
    accent: 'bg-rose-500',
    label: 'High',
  },
  medium: {
    Icon: AlertTriangle,
    pill: 'bg-amber-500/10 text-amber-500',
    accent: 'bg-amber-500',
    label: 'Medium',
  },
  low: {
    Icon: Info,
    pill: 'bg-sky-500/10 text-sky-500',
    accent: 'bg-sky-500',
    label: 'Low',
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-line bg-bg-1/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">
            Risk Signals
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          {alerts.length} active
        </span>
      </div>

      <ul>
        {alerts.map((alert) => {
          const { Icon, pill, accent, label } = levelConfig[alert.level];
          return (
            <li key={alert.id} className="border-b border-line last:border-0">
            <Link href="/reports" className="block px-6 py-4 flex items-start gap-3 hover:bg-bg-1/50 transition-colors relative">
              <span
                className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${accent}`}
              />
              <div
                className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${pill}`}
              >
                <Icon size={15} />
              </div>
              <p className="text-sm text-ink-0 leading-relaxed flex-1">{alert.message}</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${pill}`}
              >
                {label}
              </span>
            </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
