'use client';

import { ArrowLeftRight, Banknote, Bitcoin, Building2, EyeOff, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { Toggle } from '../ui/toggle';
import { Overlay } from '../ui/overlay';

type AssetPreferencesOverlayProps = {
  onClose: () => void;
};

const CURRENCIES = [
  { code: 'TWD', name: 'NT Dollar' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
];

const ASSET_CLASSES = [
  { key: 'stocks',      Icon: TrendingUp,     label: 'Stocks',       defaultOn: true  },
  { key: 'crypto',      Icon: Bitcoin,        label: 'Crypto',       defaultOn: true  },
  { key: 'forex',       Icon: ArrowLeftRight, label: 'Forex',        defaultOn: false },
  { key: 'realEstate',  Icon: Building2,      label: 'Real Estate',  defaultOn: true  },
  { key: 'cash',        Icon: Banknote,       label: 'Cash',         defaultOn: true  },
];

const FREQUENCIES = ['Real-time', 'Daily', 'Weekly'];

export function AssetPreferencesOverlay({ onClose }: AssetPreferencesOverlayProps) {
  const [currency, setCurrency] = useState('TWD');
  const [assets, setAssets] = useState<Record<string, boolean>>(
    Object.fromEntries(ASSET_CLASSES.map((a) => [a.key, a.defaultOn]))
  );
  const [frequency, setFrequency] = useState('Real-time');

  function toggleAsset(key: string) {
    setAssets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Overlay title="Asset Preferences" onClose={onClose}>
      <div className="px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl bg-bg-1 border border-line p-6">
          <div className="absolute -top-10 -right-10 size-32 bg-brand/10 blur-[40px] rounded-full" />
          <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest mb-2">Configuration</p>
          <h2 className="text-2xl font-extrabold text-ink-0 leading-tight">
            Optimize Your<br />Financial Canvas
          </h2>
        </div>

        {/* Currency */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Default Currency</h3>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(({ code, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`rounded-xl p-4 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                  currency === code
                    ? 'bg-brand-weak text-brand border border-brand/20'
                    : 'bg-bg-1 text-ink-1 border border-line hover:border-brand/30'
                }`}
              >
                <span className="text-base font-bold">{code}</span>
                <span className="text-[10px] font-medium opacity-70">{name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Asset classes */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Tracked Asset Classes</h3>
          <div className="bg-bg-1 rounded-xl overflow-hidden divide-y divide-line">
            {ASSET_CLASSES.map(({ key, Icon, label }) => (
              <div key={key} className="flex items-center justify-between p-4 hover:bg-card transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-brand-weak flex items-center justify-center">
                    <Icon size={18} className="text-brand" />
                  </div>
                  <span className="text-sm font-semibold text-ink-0">{label}</span>
                </div>
                <Toggle enabled={assets[key]!} onToggle={() => toggleAsset(key)} />
              </div>
            ))}
          </div>
        </section>

        {/* Update frequency */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Data Update Frequency</h3>
          <div className="flex p-1 bg-bg-1 rounded-xl gap-1">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  frequency === f
                    ? 'bg-card text-ink-0 shadow-soft'
                    : 'text-ink-1 hover:text-ink-0'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-ink-disabled font-medium px-2">
            Real-time updates may increase battery usage and data consumption.
          </p>
        </section>

        {/* Hidden accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Hidden Accounts</h3>
            <button type="button" className="text-brand text-xs font-bold">Manage</button>
          </div>
          <div className="bg-bg-1 rounded-xl p-6 border border-dashed border-line text-center space-y-3">
            <div className="size-12 bg-card rounded-full flex items-center justify-center mx-auto">
              <EyeOff size={20} className="text-ink-disabled" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink-0">No hidden accounts</p>
              <p className="text-xs text-ink-1 px-4">Hidden accounts are excluded from net worth but still tracked.</p>
            </div>
            <button type="button" className="w-full bg-card text-ink-0 font-bold text-sm py-3 rounded-xl border border-line hover:bg-bg-1 transition-colors">
              Add Account to Hide
            </button>
          </div>
        </section>
      </div>
    </Overlay>
  );
}
