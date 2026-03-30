'use client';

import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { SubItem } from './subscription-tab';

type EditSubscriptionModalProps = {
  item: SubItem;
  onClose: () => void;
};

const CATEGORIES = ['Entertainment', 'Cloud/SaaS', 'Health & Fitness', 'Productivity', 'Utility', 'Infrastructure'];

export function EditSubscriptionModal({ item, onClose }: EditSubscriptionModalProps) {
  const [name, setName]             = useState(item.label);
  const [category, setCategory]     = useState(item.category);
  const [amount, setAmount]         = useState(String(item.amount));
  const [billing, setBilling]       = useState<'Monthly' | 'Yearly'>(item.billing);
  const [nextPayment, setNextPayment] = useState('');
  const [autoRenew, setAutoRenew]   = useState(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-8 h-20 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="font-bold text-ink-0 text-xl">Subscriptions</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">

          {/* Identity header */}
          <div className="flex items-center gap-6">
            <div className={`size-20 rounded-xl ${item.iconBg} border border-line flex items-center justify-center shrink-0`}>
              <item.Icon size={36} className={item.iconColor} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Editing Subscription</p>
              <h3 className="text-3xl font-black tracking-tight text-ink-0">{item.label}</h3>
            </div>
          </div>

          {/* Form — bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Service name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer appearance-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Monthly Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-bold text-sm">TWD</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-bg-1 border border-line rounded-xl pl-14 pr-4 py-4 text-ink-0 text-lg font-bold font-mono focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
                />
              </div>
            </div>

            {/* Billing cycle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Billing Cycle</label>
              <div className="flex p-1 bg-bg-1 border border-line rounded-xl">
                {(['Monthly', 'Yearly'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                      billing === b ? 'bg-brand text-white shadow-soft' : 'text-ink-disabled hover:text-ink-1'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Next payment date — full width */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-ink-disabled uppercase tracking-widest px-1">Next Payment Date</label>
              <input
                type="date"
                value={nextPayment}
                onChange={(e) => setNextPayment(e.target.value)}
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-4 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors [color-scheme:dark]"
              />
            </div>

          </div>

          {/* Auto-Renew */}
          <div className="pt-2 border-t border-line">
            <div className="flex items-center justify-between p-5 bg-danger/5 border border-danger/15 rounded-xl">
              <div>
                <p className="text-ink-0 font-bold text-sm">Auto-Renew Status</p>
                <p className="text-ink-1 text-xs mt-0.5">Disable to stop future payments for this service.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-14 h-8 rounded-full relative transition-colors ${autoRenew ? 'bg-brand' : 'bg-bg-1 border border-line'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full shadow-sm transition-all ${autoRenew ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-line bg-bg-1/50 flex flex-col-reverse md:flex-row gap-3 justify-between items-center shrink-0">
          <button
            type="button"
            className="w-full md:w-auto flex items-center gap-2 px-5 py-3.5 text-ink-disabled hover:text-danger transition-colors text-sm font-bold rounded-xl hover:bg-danger/5"
          >
            <Trash2 size={15} />
            Cancel Subscription
          </button>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-3.5 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all text-sm"
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="px-9 py-3.5 bg-brand text-white font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm"
            >
              Update Subscription
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
