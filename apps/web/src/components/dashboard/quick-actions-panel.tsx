import Link from 'next/link';
import { Plus, Upload, Target, Download, ArrowUpRight } from 'lucide-react';

interface QuickAction {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
}

const actions: QuickAction[] = [
  {
    href: '/cashflow',
    icon: Plus,
    label: 'Add Transaction',
    desc: 'Log income or expense',
  },
  {
    href: '/allocation#investment-records',
    icon: Upload,
    label: 'Import Records',
    desc: 'Upload CSV or XLSX',
  },
  {
    href: '/cashflow',
    icon: Target,
    label: 'Set Target',
    desc: 'Create a financial goal',
  },
  {
    href: '/reports',
    icon: Download,
    label: 'Export Report',
    desc: 'Download your data',
  },
];

export function QuickActionsPanel() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href + action.label}
            href={action.href}
            className="relative overflow-hidden block p-5 rounded-2xl border border-line bg-card hover:border-brand/40 transition-all group cursor-pointer"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/5 group-hover:to-violet-500/5 transition-all" />

            <div className="size-10 rounded-xl bg-brand-weak border border-brand/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_16px_rgba(0,102,255,0.2)] transition-all">
              <Icon size={16} className="text-brand" />
            </div>

            <p className="text-sm font-bold text-ink-0 group-hover:text-brand transition-colors">
              {action.label}
            </p>
            <p className="text-[11px] text-ink-disabled mt-1 leading-snug">{action.desc}</p>

            <span className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={14} className="text-brand" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
