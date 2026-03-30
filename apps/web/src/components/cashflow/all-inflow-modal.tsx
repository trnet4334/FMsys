'use client';

import { Banknote, Gift, Landmark, TrendingUp, Inbox, X } from 'lucide-react';
import { useEffect } from 'react';

import { fmtCurrency } from '../../lib/format';
import { useScrollFade } from './use-scroll-fade';

type InflowItem = {
  id: string;
  Icon: typeof Banknote;
  iconBg: string;
  iconColor: string;
  label: string;
  category: string;
  date: string;
  amount: number;
  status: 'Cleared' | 'Pending' | 'Processing';
};

const STATUS_STYLE: Record<InflowItem['status'], string> = {
  Cleared:    'text-emerald-500',
  Pending:    'text-warn',
  Processing: 'text-brand',
};

const ALL_INFLOWS: InflowItem[] = [
  { id:  '1', Icon: Banknote,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Monthly Salary – TechCorp',        category: 'Payroll',    date: 'Jun 28, 2024', amount:  8450.00, status: 'Cleared'    },
  { id:  '2', Icon: Landmark,   iconBg: 'bg-brand/10',       iconColor: 'text-brand',       label: 'Quarterly Dividend – AAPL',        category: 'Investment', date: 'Jun 24, 2024', amount:  1240.50, status: 'Cleared'    },
  { id:  '3', Icon: TrendingUp, iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500',   label: 'Gift Transfer – Family',           category: 'Gift',       date: 'Jun 20, 2024', amount:   500.00, status: 'Cleared'    },
  { id:  '4', Icon: Banknote,   iconBg: 'bg-ink-1/10',       iconColor: 'text-ink-disabled',label: 'Contract Bonus – Project X',       category: 'Bonus',      date: 'Jun 15, 2024', amount:  2100.00, status: 'Pending'    },
  { id:  '5', Icon: TrendingUp, iconBg: 'bg-violet-500/10',  iconColor: 'text-violet-500',  label: 'Stock Sale – TSLA',                category: 'Investment', date: 'Jun 12, 2024', amount:  3875.20, status: 'Cleared'    },
  { id:  '6', Icon: Landmark,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Interest Income – Savings Acct',   category: 'Interest',   date: 'Jun 10, 2024', amount:   182.40, status: 'Cleared'    },
  { id:  '7', Icon: Banknote,   iconBg: 'bg-brand/10',       iconColor: 'text-brand',       label: 'Freelance Payment – Client A',    category: 'Freelance',  date: 'Jun 08, 2024', amount:  1500.00, status: 'Processing' },
  { id:  '8', Icon: Gift,       iconBg: 'bg-rose-500/10',    iconColor: 'text-rose-500',    label: 'Birthday Gift – Friends',          category: 'Gift',       date: 'Jun 05, 2024', amount:   300.00, status: 'Cleared'    },
  { id:  '9', Icon: TrendingUp, iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500',   label: 'Crypto Profit – BTC',             category: 'Crypto',     date: 'Jun 03, 2024', amount:  2640.00, status: 'Cleared'    },
  { id: '10', Icon: Banknote,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Monthly Salary – TechCorp',        category: 'Payroll',    date: 'May 28, 2024', amount:  8450.00, status: 'Cleared'    },
  { id: '11', Icon: Landmark,   iconBg: 'bg-brand/10',       iconColor: 'text-brand',       label: 'Quarterly Dividend – MSFT',        category: 'Investment', date: 'May 22, 2024', amount:   980.00, status: 'Cleared'    },
  { id: '12', Icon: Banknote,   iconBg: 'bg-ink-1/10',       iconColor: 'text-ink-disabled',label: 'Referral Bonus – App Store',       category: 'Bonus',      date: 'May 18, 2024', amount:   450.00, status: 'Cleared'    },
  { id: '13', Icon: TrendingUp, iconBg: 'bg-violet-500/10',  iconColor: 'text-violet-500',  label: 'ETF Dividend – VOO',               category: 'Investment', date: 'May 15, 2024', amount:   634.80, status: 'Cleared'    },
  { id: '14', Icon: Landmark,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Rental Income – Unit 3B',          category: 'Rental',     date: 'May 10, 2024', amount:  1800.00, status: 'Cleared'    },
  { id: '15', Icon: Banknote,   iconBg: 'bg-brand/10',       iconColor: 'text-brand',       label: 'Consulting Fee – Client B',        category: 'Freelance',  date: 'May 07, 2024', amount:  2250.00, status: 'Pending'    },
  { id: '16', Icon: TrendingUp, iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500',   label: 'Stock Sale – NVDA',                category: 'Investment', date: 'May 04, 2024', amount:  5120.00, status: 'Cleared'    },
  { id: '17', Icon: Banknote,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Monthly Salary – TechCorp',        category: 'Payroll',    date: 'Apr 28, 2024', amount:  8450.00, status: 'Cleared'    },
  { id: '18', Icon: Gift,       iconBg: 'bg-rose-500/10',    iconColor: 'text-rose-500',    label: 'Wedding Gift Income',              category: 'Gift',       date: 'Apr 20, 2024', amount:  1200.00, status: 'Cleared'    },
  { id: '19', Icon: Landmark,   iconBg: 'bg-brand/10',       iconColor: 'text-brand',       label: 'Bond Coupon – Treasury 2034',      category: 'Investment', date: 'Apr 15, 2024', amount:   720.00, status: 'Cleared'    },
  { id: '20', Icon: Banknote,   iconBg: 'bg-ink-1/10',       iconColor: 'text-ink-disabled',label: 'Performance Bonus – Q1',           category: 'Bonus',      date: 'Apr 05, 2024', amount:  3000.00, status: 'Cleared'    },
];

type Props = { onClose: () => void };

export function AllInflowModal({ onClose }: Props) {
  const { listRef, atBottom, handleScroll } = useScrollFade();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const total = ALL_INFLOWS.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${ALL_INFLOWS.length === 0 ? 'min-h-[320px]' : 'min-h-[560px]'}`}>

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
            <h2 className="text-base font-bold text-ink-0">All Inflow Transactions</h2>
            <p className="text-[10px] text-ink-disabled font-medium">{ALL_INFLOWS.length} records · TWD {fmtCurrency.format(total)}</p>
          </div>
        </div>

        {/* List area */}
        {ALL_INFLOWS.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="size-14 rounded-full bg-bg-1 border border-line flex items-center justify-center">
              <Inbox size={24} className="text-ink-disabled" />
            </div>
            <p className="text-sm font-bold text-ink-0">目前無資料</p>
            <p className="text-xs text-ink-disabled">尚未有任何收入交易紀錄</p>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0">
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-auto divide-y divide-line overscroll-contain"
            >
              {ALL_INFLOWS.map(({ id, Icon, iconBg, iconColor, label, category, date, amount, status }) => (
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
                    <p className="text-sm font-bold text-emerald-500 tabular-nums">+TWD {fmtCurrency.format(amount)}</p>
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

        {/* Footer drag hint */}
        <div className="px-6 py-3 border-t border-line bg-bg-1/50 shrink-0 flex items-center justify-center gap-2">
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <div className="w-6 h-0.5 bg-ink-disabled rounded-full" />
            <div className="w-4 h-0.5 bg-ink-disabled rounded-full" />
          </div>
          <span className="text-[10px] text-ink-disabled font-bold uppercase tracking-widest">
            Drag to scroll
          </span>
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <div className="w-4 h-0.5 bg-ink-disabled rounded-full" />
            <div className="w-6 h-0.5 bg-ink-disabled rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}
