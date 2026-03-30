'use client';

import { Banknote, Bitcoin, Building2, CreditCard, Landmark, Plus, Trash2, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'crypto' | 'cash';

export type AccountEntry = {
  id: string;
  type: AccountType;
  label: string;
  sub: string;
  amount: number;
};

const TYPE_CONFIG: Record<AccountType, { Icon: typeof Landmark; iconClass: string; label: string }> = {
  checking:   { Icon: Landmark,   iconClass: 'text-ink-0',       label: 'Checking'   },
  savings:    { Icon: Building2,  iconClass: 'text-emerald-500', label: 'Savings'    },
  credit:     { Icon: CreditCard, iconClass: 'text-brand',       label: 'Credit'     },
  investment: { Icon: Wallet,     iconClass: 'text-violet-500',  label: 'Investment' },
  crypto:     { Icon: Bitcoin,    iconClass: 'text-amber-500',   label: 'Crypto'     },
  cash:       { Icon: Banknote,   iconClass: 'text-emerald-500', label: 'Cash'       },
};

const ACCOUNT_TYPES = Object.entries(TYPE_CONFIG) as [AccountType, typeof TYPE_CONFIG[AccountType]][];

type ManageAccountsModalProps = {
  accounts: AccountEntry[];
  onAdd: (account: AccountEntry) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

export function ManageAccountsModal({ accounts, onAdd, onRemove, onClose }: ManageAccountsModalProps) {
  const [type, setType]     = useState<AccountType>('checking');
  const [label, setLabel]   = useState('');
  const [last4, setLast4]   = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleAdd() {
    const trimmed = label.trim();
    if (!trimmed) return;
    const digits = last4.trim().slice(-4).padStart(4, '0');
    const typeLabel = TYPE_CONFIG[type].label;
    onAdd({
      id: `${Date.now()}`,
      type,
      label: trimmed,
      sub: `${typeLabel} •••• ${digits}`,
      amount: parseFloat(balance) || 0,
    });
    setLabel('');
    setLast4('');
    setBalance('');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={16} />
          </button>
          <h2 className="text-base font-bold text-ink-0">Manage Accounts</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Existing accounts */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Connected Accounts</p>
            {accounts.length === 0 ? (
              <div className="py-8 text-center text-ink-disabled text-sm">No accounts added yet.</div>
            ) : (
              <div className="divide-y divide-line rounded-xl overflow-hidden border border-line">
                {accounts.map((acc) => {
                  const { Icon, iconClass } = TYPE_CONFIG[acc.type];
                  const positive = acc.amount >= 0;
                  return (
                    <div key={acc.id} className="flex items-center gap-3 px-4 py-3 bg-bg-1 hover:bg-card transition-colors">
                      <div className="size-9 rounded-lg bg-card flex items-center justify-center border border-line shrink-0">
                        <Icon size={16} className={iconClass} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink-0 truncate">{acc.label}</p>
                        <p className="text-[10px] text-ink-disabled">{acc.sub}</p>
                      </div>
                      <p className={`text-sm font-bold shrink-0 ${positive ? 'text-ink-0' : 'text-rose-500'}`}>
                        {positive ? '' : '−'}TWD {Math.abs(acc.amount).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemove(acc.id)}
                        className="size-8 flex items-center justify-center rounded-lg text-ink-disabled hover:text-danger hover:bg-danger/10 transition-colors shrink-0 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add account form */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Add New Account</p>

            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      type === key
                        ? 'bg-brand-weak border-brand/40 text-brand'
                        : 'bg-bg-1 border-line text-ink-1 hover:border-brand/30'
                    }`}
                  >
                    <cfg.Icon size={14} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Account Name</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Citadel Platinum"
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>

            {/* Last 4 + Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Last 4 Digits</label>
                <input
                  type="text"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Balance (TWD)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-line bg-bg-1/50 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!label.trim()}
            className="w-full py-4 bg-brand text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-soft hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

      </div>
    </div>
  );
}
