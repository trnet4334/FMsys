import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Target,
  Banknote,
  TrendingDown,
} from 'lucide-react';

type ActivityType = 'investment' | 'transaction' | 'alert' | 'goal';

interface Activity {
  type: ActivityType;
  label: string;
  sub: string;
  time: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

const activities: Activity[] = [
  {
    type: 'investment',
    label: 'Bought NVDA',
    sub: '12 shares @ TWD 875.40',
    time: '2 hours ago',
    icon: TrendingUp,
    iconBg: 'bg-brand-weak',
    iconColor: 'text-brand',
  },
  {
    type: 'transaction',
    label: 'Costco Wholesale',
    sub: 'Groceries · −TWD 312.80',
    time: '5 hours ago',
    icon: ShoppingCart,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    type: 'alert',
    label: 'Housing cost alert',
    sub: '45% of expenses — above threshold',
    time: 'Yesterday',
    icon: AlertTriangle,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    type: 'goal',
    label: 'Emergency Fund',
    sub: 'Reached 80% of TWD 100,000 target',
    time: '2 days ago',
    icon: Target,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    type: 'transaction',
    label: 'Monthly Salary – TechCorp',
    sub: 'Payroll · +TWD 8,450.00',
    time: '3 days ago',
    icon: Banknote,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    type: 'investment',
    label: 'ETH position closed',
    sub: '−TWD 156 · −3.2% return',
    time: '5 days ago',
    icon: TrendingDown,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
];

export function RecentActivityPanel() {
  return (
    <section className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-bg-1/40">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-brand shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">
            Recent Activity
          </span>
          <span className="text-xs text-ink-disabled ml-2">Across all accounts</span>
        </div>
        <span className="text-[10px] text-ink-disabled">{activities.length} events</span>
      </div>

      <ul className="divide-y divide-line">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <li
              key={index}
              className="px-6 py-4 flex items-start gap-4 hover:bg-bg-1/50 transition-colors"
            >
              <div
                className={`size-9 rounded-xl ${activity.iconBg} border border-line flex items-center justify-center shrink-0`}
              >
                <Icon size={16} className={activity.iconColor} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0">{activity.label}</p>
                <p className="text-[11px] text-ink-disabled mt-0.5">{activity.sub}</p>
              </div>

              <p className="text-[10px] text-ink-disabled shrink-0 ml-auto mt-0.5 tabular-nums">
                {activity.time}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="px-6 py-3 bg-bg-1/50 border-t border-line flex justify-center">
        <button className="text-[10px] font-extrabold uppercase tracking-widest text-ink-disabled hover:text-ink-0 transition-colors">
          View all activity
        </button>
      </div>
    </section>
  );
}
