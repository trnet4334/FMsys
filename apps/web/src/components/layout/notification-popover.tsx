'use client';

import { BarChart2, ShieldCheck, Wallet, X } from 'lucide-react';

type NotificationPopoverProps = {
  onClose: () => void;
  onViewAll: () => void;
};

const NOTIFICATIONS = [
  {
    id: '1',
    Icon: Wallet,
    iconClass: 'text-danger',
    bgClass: 'bg-danger/10',
    title: 'Large Transaction',
    body: '-TWD 15,000 at AAPL',
    boldWord: 'AAPL',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    Icon: BarChart2,
    iconClass: 'text-brand',
    bgClass: 'bg-brand-weak',
    title: 'Weekly Summary Ready',
    body: 'Your portfolio performance report for last week is now available.',
    boldWord: null,
    time: '3h ago',
    unread: true,
  },
  {
    id: '3',
    Icon: ShieldCheck,
    iconClass: 'text-warn',
    bgClass: 'bg-amber-500/10',
    title: 'Security Alert',
    body: 'New login detected from iPhone 15 Pro in Taipei.',
    boldWord: 'iPhone 15 Pro',
    time: '6h ago',
    unread: true,
  },
];

export function NotificationPopover({ onClose, onViewAll }: NotificationPopoverProps) {
  return (
    <div className="absolute right-0 top-full mt-3 w-[calc(100vw-3rem)] max-w-sm bg-card border border-line rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-bg-1/50">
        <h3 className="text-ink-0 font-bold tracking-tight">Recent Alerts</h3>
        <div className="flex items-center gap-3">
          <button type="button" className="text-xs text-brand font-bold hover:underline">
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            className="size-6 flex items-center justify-center rounded-md text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-line">
        {NOTIFICATIONS.map((n) => (
          <button
            key={n.id}
            type="button"
            className="w-full flex gap-4 px-5 py-4 hover:bg-bg-1 transition-colors text-left"
          >
            <div className={`mt-0.5 size-10 rounded-xl ${n.bgClass} flex items-center justify-center shrink-0`}>
              <n.Icon size={18} className={n.iconClass} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-ink-0 font-semibold text-sm">{n.title}</span>
                <span className="text-[10px] font-bold text-ink-disabled uppercase tracking-wide shrink-0">{n.time}</span>
              </div>
              <p className="text-ink-1 text-sm leading-snug">
                {n.boldWord
                  ? n.body.split(n.boldWord).map((part, i, arr) =>
                      i < arr.length - 1
                        ? <span key={i}>{part}<span className="text-ink-0 font-medium">{n.boldWord}</span></span>
                        : <span key={i}>{part}</span>
                    )
                  : n.body}
              </p>
            </div>
            {n.unread && <div className="size-2 rounded-full bg-brand mt-2 shrink-0" />}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-line bg-bg-1/30">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full py-2 text-sm font-bold text-ink-0 rounded-lg hover:bg-bg-1 transition-colors"
        >
          View All Activity
        </button>
      </div>
    </div>
  );
}
