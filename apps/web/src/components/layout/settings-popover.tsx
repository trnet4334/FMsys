'use client';

import { BellRing, ChevronRight, CreditCard, Fingerprint, Globe, Moon, X } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from '../../lib/theme';
import { Toggle } from '../ui/toggle';

type SettingsPopoverProps = {
  onClose: () => void;
};

export function SettingsPopover({ onClose }: SettingsPopoverProps) {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [biometric, setBiometric] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
    <div className="absolute right-0 top-full mt-3 w-96 bg-card border border-line rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-line flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-ink-0">Settings</h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand px-2 py-1 bg-brand-weak rounded-lg">
            PRO
          </span>
          <button
            type="button"
            onClick={onClose}
            className="size-6 flex items-center justify-center rounded-md text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-2">
        {/* Section: Preferences */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold text-ink-disabled uppercase tracking-[0.15em]">Preferences</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-1 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-1 flex items-center justify-center text-brand">
              <Moon size={18} />
            </div>
            <span className="font-semibold text-ink-0 text-sm">Dark Mode</span>
          </div>
          <Toggle enabled={isDark} onToggle={toggleTheme} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-1 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-1 flex items-center justify-center text-ink-1">
              <Fingerprint size={18} />
            </div>
            <span className="font-semibold text-ink-0 text-sm">Biometric Login</span>
          </div>
          <Toggle enabled={biometric} onToggle={() => setBiometric((v) => !v)} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-1 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-1 flex items-center justify-center text-ink-1">
              <BellRing size={18} />
            </div>
            <span className="font-semibold text-ink-0 text-sm">Push Notifications</span>
          </div>
          <Toggle enabled={pushNotifications} onToggle={() => setPushNotifications((v) => !v)} />
        </div>

        {/* Section: Localization */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold text-ink-disabled uppercase tracking-[0.15em]">Localization</span>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-1 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-1 flex items-center justify-center text-ink-1 group-hover:text-brand transition-colors">
              <Globe size={18} />
            </div>
            <span className="font-semibold text-ink-0 text-sm">Language</span>
          </div>
          <div className="flex items-center gap-1 text-ink-1 text-sm font-medium">
            <span>English</span>
            <ChevronRight size={14} className="text-ink-disabled" />
          </div>
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-1 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-1 flex items-center justify-center text-ink-1 group-hover:text-brand transition-colors">
              <CreditCard size={18} />
            </div>
            <span className="font-semibold text-ink-0 text-sm">Currency</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="text-brand font-bold">TWD</span>
            <ChevronRight size={14} className="text-ink-disabled" />
          </div>
        </button>
      </div>
    </div>
  );
}
