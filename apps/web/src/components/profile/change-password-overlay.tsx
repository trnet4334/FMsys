'use client';

import { Eye, EyeOff, Info, KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Overlay } from '../ui/overlay';

type ChangePasswordOverlayProps = {
  onClose: () => void;
};

type VisibilityState = { current: boolean; next: boolean; confirm: boolean };

function getStrength(pw: string): { score: number; label: string; barClass: string; labelClass: string } {
  if (!pw) return { score: 0, label: '', barClass: '', labelClass: '' };
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) score++;
  const levels = [
    { label: 'Weak',   barClass: 'bg-danger',  labelClass: 'text-danger'  },
    { label: 'Fair',   barClass: 'bg-warn',    labelClass: 'text-warn'    },
    { label: 'Good',   barClass: 'bg-brand',   labelClass: 'text-brand'   },
    { label: 'Strong', barClass: 'bg-brand',   labelClass: 'text-brand'   },
  ] as const;
  return { score, ...levels[score - 1]! };
}

export function ChangePasswordOverlay({ onClose }: ChangePasswordOverlayProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState<VisibilityState>({ current: false, next: false, confirm: false });

  const strength = getStrength(next);
  const confirmMatch = confirm.length > 0 && confirm === next;
  const confirmMismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = current.length > 0 && strength.score >= 2 && confirmMatch;

  function toggleShow(field: keyof VisibilityState) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  return (
    <Overlay title="Change Password" onClose={onClose}>
      <div className="px-6 py-8 space-y-8">

        {/* Security instruction */}
        <div className="flex items-start gap-3 p-4 bg-bg-1 border border-line rounded-xl">
          <ShieldCheck size={18} className="text-brand mt-0.5 shrink-0" />
          <p className="text-sm text-ink-1 leading-relaxed">
            Please enter your current password to verify your identity before setting a new one.
          </p>
        </div>

        <div className="space-y-6">
          {/* Current password */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={show.current ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-14 bg-bg-1 border border-line rounded-xl px-4 pr-12 text-sm text-ink-0 placeholder:text-ink-disabled outline-none focus:border-brand/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShow('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-0 transition-colors"
              >
                {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-line" />

          {/* New password */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={show.next ? 'text' : 'password'}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Create new password"
                className="w-full h-14 bg-bg-1 border border-line rounded-xl px-4 pr-12 text-sm text-ink-0 placeholder:text-ink-disabled outline-none focus:border-brand/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShow('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-0 transition-colors"
              >
                {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength indicator */}
            {next.length > 0 && (
              <div className="px-1 pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">
                    Password Strength
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase ${strength.labelClass}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex gap-1.5 h-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        bar <= strength.score ? strength.barClass : 'bg-line'
                      } ${bar <= strength.score && strength.score >= 3 ? 'shadow-[0_0_6px_rgba(0,102,255,0.4)]' : ''}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-ink-disabled flex items-center gap-1.5">
                  <Info size={12} />
                  Use 8+ characters with uppercase letters and numbers
                </p>
              </div>
            )}
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-ink-disabled uppercase tracking-widest px-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={show.confirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-type new password"
                className={`w-full h-14 bg-bg-1 border rounded-xl px-4 pr-12 text-sm text-ink-0 placeholder:text-ink-disabled outline-none transition-colors ${
                  confirmMatch
                    ? 'border-emerald-500/50 focus:border-emerald-500'
                    : confirmMismatch
                    ? 'border-danger/50 focus:border-danger'
                    : 'border-line focus:border-brand/50'
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-0 transition-colors"
              >
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmMismatch && (
              <p className="text-[11px] text-danger px-1">Passwords do not match.</p>
            )}
            {confirmMatch && (
              <p className="text-[11px] text-emerald-500 px-1">Passwords match.</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-4">
          <button
            type="button"
            disabled={!canSubmit}
            className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              canSubmit
                ? 'bg-brand text-white shadow-soft hover:opacity-90 active:scale-[0.98]'
                : 'bg-bg-1 text-ink-disabled border border-line cursor-not-allowed'
            }`}
          >
            <KeyRound size={18} />
            Update Password
          </button>
          <p className="text-center text-[11px] text-ink-disabled px-4 leading-relaxed">
            You will be signed out of all other devices after changing your password.
          </p>
        </div>

      </div>
    </Overlay>
  );
}
