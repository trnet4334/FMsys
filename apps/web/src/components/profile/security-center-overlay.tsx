'use client';

import { AlertTriangle, Eye, Fingerprint, Info, KeyRound, Laptop, Share2, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

import { Toggle } from '../ui/toggle';
import { Overlay } from '../ui/overlay';

type SecurityCenterOverlayProps = {
  onClose: () => void;
};

const SESSIONS = [
  { Icon: Smartphone, device: 'iPhone 15 Pro', location: 'Taipei, TW', time: 'Active now', current: true },
  { Icon: Laptop,     device: 'MacBook Pro',   location: 'Taipei, TW', time: '2 hours ago',  current: false },
];

const ALERTS = [
  {
    Icon: AlertTriangle,
    iconClass: 'text-warn',
    borderClass: 'border-l-warn',
    title: 'Login from New Device',
    body: 'A new login was detected on a MacBook Pro in Taipei. If this wasn\'t you, revoke the session immediately.',
    time: 'Oct 24, 14:20',
    dim: false,
  },
  {
    Icon: Info,
    iconClass: 'text-ink-disabled',
    borderClass: 'border-l-line',
    title: 'Password Changed',
    body: 'Your account password was successfully updated via the mobile app.',
    time: 'Sep 12, 09:15',
    dim: true,
  },
];

export function SecurityCenterOverlay({ onClose }: SecurityCenterOverlayProps) {
  const [biometric, setBiometric] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <Overlay title="Security Center" onClose={onClose}>
      <div className="px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl bg-bg-1 border border-line p-8">
          <div className="absolute -right-10 -top-10 size-48 bg-brand/10 blur-[64px] rounded-full" />
          <div className="relative">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-brand-weak text-brand mb-4 border border-brand/20">
              <Shield size={22} />
            </div>
            <h2 className="text-2xl font-extrabold text-ink-0 tracking-tight mb-2">Security Center</h2>
            <p className="text-ink-1 text-sm">Manage your account protection and active sessions.</p>
          </div>
        </div>

        {/* Authentication */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Authentication</h3>
            <span className="text-[10px] font-bold text-brand px-2 py-0.5 rounded-full bg-brand-weak border border-brand/20 uppercase">
              Highly Secure
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Biometric */}
            <div className="p-5 rounded-xl bg-bg-1 border border-line flex flex-col justify-between gap-6 hover:border-brand/30 transition-colors">
              <div className="flex justify-between items-start">
                <Fingerprint size={28} className="text-brand" />
                <Toggle enabled={biometric} onToggle={() => setBiometric((v) => !v)} size="sm" />
              </div>
              <div>
                <h4 className="font-bold text-ink-0 text-sm mb-1">Biometric Login</h4>
                <p className="text-xs text-ink-1 leading-relaxed">Use FaceID or Fingerprint for rapid access.</p>
              </div>
            </div>
            {/* 2FA */}
            <div className="p-5 rounded-xl bg-bg-1 border border-line flex flex-col justify-between gap-6 hover:border-brand/30 transition-colors">
              <div className="flex justify-between items-start">
                <Smartphone size={28} className="text-brand" />
                <Toggle enabled={twoFa} onToggle={() => setTwoFa((v) => !v)} size="sm" />
              </div>
              <div>
                <h4 className="font-bold text-ink-0 text-sm mb-1">2-Factor Auth</h4>
                <p className="text-xs text-ink-1 leading-relaxed">Secondary code via SMS or Authenticator.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Active sessions */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Active Sessions</h3>
          <div className="bg-bg-1 rounded-xl overflow-hidden divide-y divide-line">
            {SESSIONS.map(({ Icon, device, location, time, current }) => (
              <div key={device} className="p-4 flex items-center justify-between hover:bg-card transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-card flex items-center justify-center border border-line">
                    <Icon size={18} className="text-ink-1" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-0 text-sm">{device}</span>
                      {current && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-1">{location} · {time}</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-danger px-3 py-1 rounded-lg hover:bg-danger/10 transition-colors">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Security alerts */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Security Alerts</h3>
          <div className="space-y-3">
            {ALERTS.map(({ Icon, iconClass, borderClass, title, body, time, dim }) => (
              <div
                key={title}
                className={`p-4 rounded-xl bg-bg-1 border-l-4 ${borderClass} flex items-start gap-4 ${dim ? 'opacity-60' : ''}`}
              >
                <Icon size={18} className={`${iconClass} mt-0.5 shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-ink-0">{title}</span>
                    <span className="text-[10px] text-ink-disabled shrink-0 ml-2">{time}</span>
                  </div>
                  <p className="text-xs text-ink-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">Privacy Settings</h3>
          <div className="bg-bg-1 border border-line rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Share2 size={18} className="text-brand shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-ink-0">Data Sharing</h4>
                  <p className="text-[11px] text-ink-1">Share anonymized data to improve our services.</p>
                </div>
              </div>
              <Toggle enabled={dataSharing} onToggle={() => setDataSharing((v) => !v)} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Eye size={18} className="text-brand shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-ink-0">Profile Visibility</h4>
                  <p className="text-[11px] text-ink-1">Make your vault visible to authorized contacts.</p>
                </div>
              </div>
              <Toggle enabled={profileVisible} onToggle={() => setProfileVisible((v) => !v)} size="sm" />
            </div>
          </div>
        </section>

        {/* Action */}
        <button
          type="button"
          className="w-full py-4 rounded-xl bg-brand text-white font-bold shadow-soft hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          Reset Security Keys
        </button>
      </div>
    </Overlay>
  );
}
