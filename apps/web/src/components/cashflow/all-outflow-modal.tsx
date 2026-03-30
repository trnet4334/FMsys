'use client';

import { Car, Dumbbell, Home, Inbox, Plane, ShoppingCart, Smartphone, Tv, Utensils, X, Zap } from 'lucide-react';
import { useEffect } from 'react';

import { fmtCurrency } from '../../lib/format';
import { useScrollFade } from './use-scroll-fade';

type OutflowStatus = 'Charged' | 'Pending' | 'Processing';

type OutflowItem = {
  id: string;
  Icon: typeof ShoppingCart;
  iconBg: string;
  iconColor: string;
  label: string;
  category: string;
  date: string;
  amount: number;
  status: OutflowStatus;
};

const STATUS_STYLE: Record<OutflowStatus, string> = {
  Charged:    'text-ink-disabled',
  Pending:    'text-warn',
  Processing: 'text-brand',
};

const ALL_OUTFLOWS: OutflowItem[] = [
  { id:  '1', Icon: ShoppingCart, iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500',  label: 'Whole Foods Market',        category: 'Groceries', date: 'Jun 28, 2024', amount:  124.50, status: 'Charged'    },
  { id:  '2', Icon: Car,          iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500',   label: 'Shell Gasoline',            category: 'Transport', date: 'Jun 27, 2024', amount:   65.00, status: 'Charged'    },
  { id:  '3', Icon: Home,         iconBg: 'bg-brand/10',      iconColor: 'text-brand',      label: 'Metropolitan Properties',  category: 'Housing',   date: 'Jun 25, 2024', amount: 2100.00, status: 'Charged'    },
  { id:  '4', Icon: Utensils,     iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', label: 'Din Tai Fung',              category: 'Dining',    date: 'Jun 23, 2024', amount:   89.20, status: 'Charged'    },
  { id:  '5', Icon: Smartphone,   iconBg: 'bg-ink-1/10',      iconColor: 'text-ink-disabled',label: 'Apple Store – AirPods',   category: 'Tech',      date: 'Jun 21, 2024', amount:  249.00, status: 'Charged'    },
  { id:  '6', Icon: Tv,           iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500',   label: 'Netflix Subscription',     category: 'Entertainment', date: 'Jun 20, 2024', amount:  18.99, status: 'Charged' },
  { id:  '7', Icon: Dumbbell,     iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500', label: 'Equinox All Access',       category: 'Health',    date: 'Jun 18, 2024', amount:  265.00, status: 'Charged'    },
  { id:  '8', Icon: Zap,          iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-500', label: 'Taiwan Power Co.',          category: 'Utilities', date: 'Jun 17, 2024', amount:  142.00, status: 'Charged'    },
  { id:  '9', Icon: Plane,        iconBg: 'bg-sky-500/10',    iconColor: 'text-sky-500',    label: 'Delta Airlines',           category: 'Travel',    date: 'Jun 15, 2024', amount:  425.20, status: 'Processing' },
  { id: '10', Icon: ShoppingCart, iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500',  label: 'Costco Wholesale',         category: 'Groceries', date: 'Jun 14, 2024', amount:  312.80, status: 'Charged'    },
  { id: '11', Icon: Car,          iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500',   label: 'Uber Ride',                category: 'Transport', date: 'Jun 12, 2024', amount:   23.50, status: 'Charged'    },
  { id: '12', Icon: Utensils,     iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', label: 'Sushi Express',            category: 'Dining',    date: 'Jun 10, 2024', amount:   56.40, status: 'Charged'    },
  { id: '13', Icon: Home,         iconBg: 'bg-brand/10',      iconColor: 'text-brand',      label: 'Water & Sewage Bill',      category: 'Utilities', date: 'Jun 08, 2024', amount:   48.00, status: 'Charged'    },
  { id: '14', Icon: Smartphone,   iconBg: 'bg-ink-1/10',      iconColor: 'text-ink-disabled',label: 'Chunghwa Telecom',        category: 'Tech',      date: 'Jun 06, 2024', amount:  599.00, status: 'Pending'    },
  { id: '15', Icon: Tv,           iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500',   label: 'Spotify Premium',          category: 'Entertainment', date: 'Jun 05, 2024', amount:  7.00, status: 'Charged'  },
  { id: '16', Icon: Dumbbell,     iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500', label: 'Peloton Digital',          category: 'Health',    date: 'Jun 03, 2024', amount:  144.00, status: 'Charged'    },
  { id: '17', Icon: ShoppingCart, iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500',  label: 'IKEA Furniture',           category: 'Shopping',  date: 'Jun 02, 2024', amount:  890.00, status: 'Charged'    },
  { id: '18', Icon: Zap,          iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-500', label: 'Gas & Heating Bill',       category: 'Utilities', date: 'Jun 01, 2024', amount:   98.50, status: 'Charged'    },
  { id: '19', Icon: Plane,        iconBg: 'bg-sky-500/10',    iconColor: 'text-sky-500',    label: 'Booking.com – Hotel',      category: 'Travel',    date: 'May 30, 2024', amount:  560.00, status: 'Charged'    },
  { id: '20', Icon: Utensils,     iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', label: 'Mos Burger',               category: 'Dining',    date: 'May 28, 2024', amount:   34.80, status: 'Charged'    },
];

type Props = { onClose: () => void };

export function AllOutflowModal({ onClose }: Props) {
  const { listRef, atBottom, handleScroll } = useScrollFade();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const total = ALL_OUTFLOWS.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${ALL_OUTFLOWS.length === 0 ? 'min-h-[320px]' : 'min-h-[560px]'}`}>

        {/* Header */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-ink-0">All Outflow Transactions</h2>
            <p className="text-[10px] text-ink-disabled font-medium">{ALL_OUTFLOWS.length} records · −TWD {fmtCurrency.format(total)}</p>
          </div>
        </div>

        {/* List area */}
        {ALL_OUTFLOWS.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="size-14 rounded-full bg-bg-1 border border-line flex items-center justify-center">
              <Inbox size={24} className="text-ink-disabled" />
            </div>
            <p className="text-sm font-bold text-ink-0">目前無資料</p>
            <p className="text-xs text-ink-disabled">尚未有任何支出交易紀錄</p>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0">
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-auto divide-y divide-line overscroll-contain"
            >
              {ALL_OUTFLOWS.map(({ id, Icon, iconBg, iconColor, label, category, date, amount, status }) => (
                <div
                  key={id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-bg-1/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`size-10 rounded-xl ${iconBg} border border-line flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-0 truncate">{label}</p>
                      <p className="text-[10px] text-ink-disabled font-semibold uppercase tracking-wider mt-0.5">
                        {category} · {date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-rose-500 tabular-nums">−TWD {fmtCurrency.format(amount)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${STATUS_STYLE[status]}`}>{status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent transition-opacity duration-300 ${atBottom ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line bg-bg-1/50 shrink-0 flex items-center justify-center gap-2">
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <div className="w-6 h-0.5 bg-ink-disabled rounded-full" />
            <div className="w-4 h-0.5 bg-ink-disabled rounded-full" />
          </div>
          <span className="text-[10px] text-ink-disabled font-bold uppercase tracking-widest">Drag to scroll</span>
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <div className="w-4 h-0.5 bg-ink-disabled rounded-full" />
            <div className="w-6 h-0.5 bg-ink-disabled rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}
