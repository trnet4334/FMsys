'use client';

import { ChevronRight, LogOut, ShieldCheck, SlidersHorizontal, User, X } from 'lucide-react';

type ProfilePopoverProps = {
  onClose: () => void;
  onMyAccount: () => void;
  onAssetPreferences: () => void;
  onSecurityCenter: () => void;
};

const MENU_ITEMS = [
  { Icon: User,               label: 'My Account',        key: 'myAccount' as const },
  { Icon: SlidersHorizontal,  label: 'Asset Preferences', key: 'assetPreferences' as const },
  { Icon: ShieldCheck,        label: 'Security Center',   key: 'securityCenter' as const },
];

export function ProfilePopover({ onClose, onMyAccount, onAssetPreferences, onSecurityCenter }: ProfilePopoverProps) {
  const handlers = { myAccount: onMyAccount, assetPreferences: onAssetPreferences, securityCenter: onSecurityCenter };
  return (
    <div className="absolute right-0 top-full mt-3 w-80 bg-card border border-line rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* User info */}
      <div className="p-6 border-b border-line bg-bg-1/40">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 size-6 flex items-center justify-center rounded-md text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-brand-weak border-2 border-brand/30 flex items-center justify-center text-brand text-xl font-bold shrink-0">
            U
          </div>
          <div>
            <p className="text-ink-0 text-base font-bold tracking-tight">User</p>
            <p className="text-ink-1 text-sm">user@fmsys.local</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-brand-weak text-brand text-[10px] font-bold uppercase tracking-widest border border-brand/20">
            Pro
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            Verified
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-2">
        {MENU_ITEMS.map(({ Icon, label, key }) => (
          <button
            key={label}
            type="button"
            onClick={handlers[key]}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-1 hover:bg-bg-1 hover:text-ink-0 rounded-lg transition-colors"
          >
            <Icon size={18} className="text-ink-disabled shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            <ChevronRight size={14} className="text-ink-disabled" />
          </button>
        ))}

        <div className="h-px bg-line my-2 mx-2" />

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-danger hover:bg-danger/10 rounded-lg transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          Logout
        </button>
      </nav>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-line bg-bg-1/30 flex justify-between items-center">
        <span className="text-[10px] text-ink-disabled font-bold uppercase tracking-tight">
          FMSYS v0.1.0
        </span>
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] text-ink-1 font-medium">Connected</span>
        </div>
      </div>
    </div>
  );
}
