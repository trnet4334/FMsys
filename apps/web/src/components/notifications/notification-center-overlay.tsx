'use client';

import { Archive, CheckCircle, Search, ShieldCheck, Terminal, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';

import { Overlay } from '../ui/overlay';
import { type NotificationDetail, NotificationDetailOverlay } from './notification-detail-overlay';

type NotificationCenterOverlayProps = {
  onClose: () => void;
};

type Category = 'All' | 'Security' | 'Transactions' | 'System';

const FILTERS: Category[] = ['All', 'Security', 'Transactions', 'System'];

type NotificationItem = {
  id: string;
  category: Category;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  badge: string | null;
  detail: NotificationDetail;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'Transactions',
    title: 'Large Transaction Detected',
    body: "TWD 50,000 sent to Binance. If this wasn't you, lock your vault immediately.",
    time: '2 mins ago',
    unread: true,
    badge: null,
    detail: {
      Icon: Wallet,
      iconClass: 'text-danger',
      bgClass: 'bg-danger/10',
      glowClass: 'bg-danger',
      category: 'Transactions',
      categoryClass: 'bg-danger/10 text-danger border border-danger/20',
      timestamp: 'Oct 24, 2024 at 14:20',
      title: 'Large Transaction Detected',
      fullBody: "A withdrawal of TWD 50,000 was initiated from your account to an unknown recipient. If this wasn't you, please lock your vault immediately and contact support.",
      location: 'Taipei, Taiwan',
      details: [
        { label: 'Amount',    value: 'TWD 50,000' },
        { label: 'Recipient', value: 'Binance' },
        { label: 'Address',   value: '0x4a...a3f2', mono: true },
        { label: 'Location',  value: 'Taipei, Taiwan' },
        { label: 'IP Address', value: '192.168.1.45', mono: true },
      ],
      primaryAction: 'Lock My Vault',
      primaryDanger: true,
      secondaryAction: 'I Recognize This',
    },
  },
  {
    id: '2',
    category: 'Security',
    title: 'New Login: Chrome on MacOS',
    body: 'Detected login from IP 192.168.1.45 in Taipei City, Taiwan.',
    time: '15 mins ago',
    unread: true,
    badge: null,
    detail: {
      Icon: ShieldCheck,
      iconClass: 'text-brand',
      bgClass: 'bg-brand-weak',
      glowClass: 'bg-brand',
      category: 'Security',
      categoryClass: 'bg-brand-weak text-brand border border-brand/20',
      timestamp: 'Oct 24, 2024 at 14:05',
      title: 'New Login: Chrome on MacOS',
      fullBody: 'A new login was detected on Chrome running on MacOS from Taipei City, Taiwan. If this was not you, revoke the session immediately to protect your account.',
      location: 'Taipei City, Taiwan',
      details: [
        { label: 'Device',   value: 'Chrome on MacOS' },
        { label: 'IP',       value: '192.168.1.45', mono: true },
        { label: 'Location', value: 'Taipei City, Taiwan' },
        { label: 'Time',     value: '15 mins ago' },
      ],
      primaryAction: 'Revoke Session',
      primaryDanger: true,
      secondaryAction: 'This Was Me',
    },
  },
  {
    id: '3',
    category: 'All',
    title: 'Monthly Yield Report',
    body: 'Your Staking Portfolio outperformed the market index this month.',
    time: '2 hours ago',
    unread: false,
    badge: '+12.4%',
    detail: {
      Icon: TrendingUp,
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      glowClass: 'bg-emerald-500',
      category: 'Performance',
      categoryClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      timestamp: 'Oct 24, 2024 at 12:00',
      title: 'Monthly Yield Report',
      fullBody: 'Your Staking Portfolio achieved a 12.4% gain this month, outperforming the benchmark market index. Full breakdown is available in the Reports section.',
      location: null,
      details: [
        { label: 'Portfolio',  value: 'Staking Portfolio' },
        { label: 'Gain',       value: '+12.4%' },
        { label: 'Period',     value: 'October 2024' },
        { label: 'Benchmark',  value: 'Market Index' },
      ],
      primaryAction: 'View Full Report',
      primaryDanger: false,
      secondaryAction: 'Dismiss',
    },
  },
  {
    id: '4',
    category: 'System',
    title: 'System Maintenance',
    body: 'Swap feature will be offline for 30 minutes tonight at 02:00 UTC.',
    time: '5 hours ago',
    unread: false,
    badge: null,
    detail: {
      Icon: Terminal,
      iconClass: 'text-ink-1',
      bgClass: 'bg-card',
      glowClass: 'bg-ink-1',
      category: 'System',
      categoryClass: 'bg-card text-ink-1 border border-line',
      timestamp: 'Oct 24, 2024 at 09:00',
      title: 'System Maintenance',
      fullBody: 'The Swap feature will undergo scheduled maintenance tonight from 02:00 to 02:30 UTC. All other features remain fully available during this window.',
      location: null,
      details: [
        { label: 'Feature', value: 'Swap' },
        { label: 'Window',  value: '02:00–02:30 UTC' },
        { label: 'Impact',  value: 'Low' },
        { label: 'Status',  value: 'Scheduled' },
      ],
      primaryAction: 'Set Reminder',
      primaryDanger: false,
      secondaryAction: 'Got It',
    },
  },
  {
    id: '5',
    category: 'Transactions',
    title: 'Withdrawal Confirmed',
    body: 'USD 1,200.00 successfully transferred to your linked bank account.',
    time: 'Yesterday',
    unread: false,
    badge: null,
    detail: {
      Icon: CheckCircle,
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      glowClass: 'bg-emerald-500',
      category: 'Transactions',
      categoryClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      timestamp: 'Oct 23, 2024 at 16:45',
      title: 'Withdrawal Confirmed',
      fullBody: 'Your withdrawal of USD 1,200.00 has been successfully processed and transferred to your linked bank account. Please allow 1–2 business days for the funds to appear.',
      location: null,
      details: [
        { label: 'Amount',      value: 'USD 1,200.00' },
        { label: 'Destination', value: 'Linked Bank' },
        { label: 'Status',      value: 'Confirmed' },
        { label: 'Reference',   value: '#TXN-8821', mono: true },
      ],
      primaryAction: 'View Receipt',
      primaryDanger: false,
      secondaryAction: 'Done',
    },
  },
];

const ICON_MAP: Record<string, { Icon: typeof Wallet; iconClass: string; bgClass: string }> = {
  '1': { Icon: Wallet,      iconClass: 'text-danger',      bgClass: 'bg-danger/10'       },
  '2': { Icon: ShieldCheck, iconClass: 'text-brand',       bgClass: 'bg-brand-weak'      },
  '3': { Icon: TrendingUp,  iconClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10'  },
  '4': { Icon: Terminal,    iconClass: 'text-ink-1',       bgClass: 'bg-card'            },
  '5': { Icon: CheckCircle, iconClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10'  },
};

export function NotificationCenterOverlay({ onClose }: NotificationCenterOverlayProps) {
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? NOTIFICATIONS.find((n) => n.id === selectedId) ?? null : null;

  const visible = NOTIFICATIONS.filter((n) => {
    const matchesFilter = activeFilter === 'All' || n.category === activeFilter;
    const matchesQuery =
      query === '' ||
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <Overlay title="Notifications" onClose={onClose}>
        <div className="px-6 py-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-disabled" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts..."
              className="w-full bg-bg-1 border border-line rounded-xl py-3 pl-10 pr-4 text-sm text-ink-0 placeholder:text-ink-disabled outline-none focus:border-brand/50 transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? 'bg-brand text-white shadow-soft'
                    : 'bg-bg-1 text-ink-1 border border-line hover:border-brand/30 hover:text-ink-0'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Section heading */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Recent Updates</h3>
            <button type="button" className="text-brand text-xs font-bold hover:underline">
              Mark all as read
            </button>
          </div>

          {/* Notification list */}
          <div className="space-y-2">
            {visible.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <Archive size={40} className="text-ink-disabled opacity-40" />
                <p className="text-sm font-medium text-ink-disabled">No notifications found.</p>
              </div>
            )}

            {visible.map((n) => {
              const { Icon, iconClass, bgClass } = ICON_MAP[n.id]!;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className={`w-full text-left p-4 rounded-xl flex gap-4 transition-colors relative overflow-hidden hover:bg-bg-1 ${
                    n.unread ? 'bg-bg-1 border border-line' : 'bg-bg-1/40'
                  }`}
                >
                  {n.unread && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand rounded-full" />
                  )}

                  <div className={`shrink-0 size-11 rounded-xl ${bgClass} flex items-center justify-center`}>
                    <Icon size={20} className={iconClass} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-sm font-bold leading-tight ${n.unread ? 'text-ink-0' : 'text-ink-1'}`}>
                        {n.title}
                      </span>
                      {n.badge ? (
                        <span className="shrink-0 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {n.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-ink-disabled shrink-0">{n.time}</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-1 leading-relaxed line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">
                        {n.category === 'All' ? 'Performance' : n.category}
                      </span>
                      {n.badge && (
                        <>
                          <span className="text-[10px] text-ink-disabled">·</span>
                          <span className="text-[10px] text-ink-disabled">{n.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {n.unread && <div className="size-2 rounded-full bg-brand shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>

          {visible.length > 0 && (
            <div className="py-8 flex flex-col items-center gap-2 text-center opacity-40">
              <Archive size={28} className="text-ink-disabled" />
              <p className="text-xs font-medium text-ink-disabled">You've reached the end.</p>
            </div>
          )}
        </div>
      </Overlay>

      {selected && (
        <NotificationDetailOverlay
          notification={selected.detail}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
