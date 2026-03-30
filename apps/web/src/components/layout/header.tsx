'use client';

import { Bell, LineChart, Search, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { NotificationCenterOverlay } from '../notifications/notification-center-overlay';
import { AssetPreferencesOverlay }   from '../profile/asset-preferences-overlay';
import { MyAccountOverlay }          from '../profile/my-account-overlay';
import { SecurityCenterOverlay }     from '../profile/security-center-overlay';
import { NotificationPopover }       from './notification-popover';
import { ProfilePopover }            from './profile-popover';
import { SettingsPopover }           from './settings-popover';

const navLinks = [
  { href: '/dashboard', label: 'Portfolio'         },
  { href: '/cashflow',  label: 'Cashflow'           },
  { href: '/allocation',label: 'Allocation'         },
  { href: '/reports',   label: 'Report & Insights'  },
];

const UNREAD_COUNT = 3;

type Panel  = 'notifications' | 'settings' | 'profile' | null;
type Overlay = 'notificationCenter' | 'myAccount' | 'assetPreferences' | 'securityCenter' | null;

export function Header() {
  const pathname = usePathname();
  const [openPanel,   setOpenPanel]   = useState<Panel>(null);
  const [openOverlay, setOpenOverlay] = useState<Overlay>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggle(panel: Panel) {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPanel(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line bg-card/80 backdrop-blur-xl px-6 md:px-10">
      {/* Subtle glow accent behind brand */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-64 bg-brand/5 blur-3xl" />

      <div className="relative flex items-center justify-between h-16">

        {/* ── Brand + Nav ── */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative size-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-brand rounded-lg opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
              <div className="relative size-8 bg-gradient-to-br from-brand to-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(0,102,255,0.4)]">
                <LineChart size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-ink-0 text-base font-black tracking-tight">FM</span>
              <span className="text-brand text-base font-black tracking-tight">SYS</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-5 bg-line" />

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    active
                      ? 'text-brand bg-brand-weak'
                      : 'text-ink-1 hover:text-ink-0 hover:bg-bg-1'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand rounded-full shadow-[0_0_6px_rgba(0,102,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Actions ── */}
        <div ref={containerRef} className="flex items-center gap-2">

          {/* Search */}
          <label className="hidden md:flex items-center bg-bg-1 border border-line hover:border-brand/30 rounded-xl px-3 py-2 w-56 gap-2 cursor-text transition-colors group">
            <Search size={14} className="text-ink-disabled group-hover:text-ink-1 transition-colors shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-sm w-full text-ink-0 placeholder:text-ink-disabled"
              placeholder="Search..."
              type="text"
            />
          </label>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
            <TrendingUp size={11} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">+18.4%</span>
          </div>

          {/* Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('notifications')}
              className={`size-9 flex items-center justify-center rounded-xl transition-all ${
                openPanel === 'notifications'
                  ? 'bg-brand-weak text-brand shadow-[0_0_12px_rgba(0,102,255,0.2)]'
                  : 'bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:border-brand/30'
              }`}
            >
              <Bell size={16} />
              {UNREAD_COUNT > 0 && (
                <span className="absolute top-1 right-1 flex size-3.5">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-danger opacity-60" />
                  <span className="relative flex size-3.5 rounded-full bg-danger items-center justify-center text-[8px] text-white font-black">
                    {UNREAD_COUNT}
                  </span>
                </span>
              )}
            </button>
            {openPanel === 'notifications' && (
              <NotificationPopover
                onClose={() => setOpenPanel(null)}
                onViewAll={() => { setOpenPanel(null); setOpenOverlay('notificationCenter'); }}
              />
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('settings')}
              className={`size-9 flex items-center justify-center rounded-xl transition-all ${
                openPanel === 'settings'
                  ? 'bg-brand-weak text-brand shadow-[0_0_12px_rgba(0,102,255,0.2)]'
                  : 'bg-bg-1 border border-line text-ink-1 hover:text-ink-0 hover:border-brand/30'
              }`}
            >
              <Settings size={16} />
            </button>
            {openPanel === 'settings' && (
              <SettingsPopover onClose={() => setOpenPanel(null)} />
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('profile')}
              className={`size-9 rounded-xl flex items-center justify-center text-xs font-black select-none transition-all ${
                openPanel === 'profile'
                  ? 'bg-brand text-white shadow-[0_0_16px_rgba(0,102,255,0.4)]'
                  : 'bg-gradient-to-br from-brand/20 to-violet-500/20 text-brand border border-brand/20 hover:border-brand/50'
              }`}
            >
              U
            </button>
            {openPanel === 'profile' && (
              <ProfilePopover
                onClose={() => setOpenPanel(null)}
                onMyAccount={() => { setOpenPanel(null); setOpenOverlay('myAccount'); }}
                onAssetPreferences={() => { setOpenPanel(null); setOpenOverlay('assetPreferences'); }}
                onSecurityCenter={() => { setOpenPanel(null); setOpenOverlay('securityCenter'); }}
              />
            )}
          </div>
        </div>
      </div>
    </header>

    {openOverlay === 'notificationCenter' && <NotificationCenterOverlay onClose={() => setOpenOverlay(null)} />}
    {openOverlay === 'myAccount'          && <MyAccountOverlay          onClose={() => setOpenOverlay(null)} />}
    {openOverlay === 'assetPreferences'   && <AssetPreferencesOverlay   onClose={() => setOpenOverlay(null)} />}
    {openOverlay === 'securityCenter'     && <SecurityCenterOverlay     onClose={() => setOpenOverlay(null)} />}
    </>
  );
}
