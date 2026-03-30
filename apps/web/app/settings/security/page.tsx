'use client';

import { useState, useEffect } from 'react';
import { Monitor, Key, Lock, Trash2, Plus } from 'lucide-react';
import * as authClient from '../../../src/lib/auth-client';

interface Session {
  session_id: string;
  device_label?: string;
  ip_address?: string;
  last_active_at?: string;
  is_current?: boolean;
}

function validatePasswordPolicy(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsError, setSessionsError] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    authClient.listSessions().then((res) => {
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API shape not yet typed
        setSessions((res.data as any).sessions ?? []);
      } else {
        setSessionsError('Session management not yet available.');
      }
    });
  }, []);

  async function handleRevokeSession(id: string) {
    await authClient.revokeSession(id);
    setSessions((prev) => prev.filter((s) => s.session_id !== id));
  }

  async function handleRevokeAll() {
    await authClient.revokeAllSessions();
    setSessions([]);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);

    const policyError = validatePasswordPolicy(newPw);
    if (policyError) {
      setPwMessage({ ok: false, text: policyError });
      return;
    }

    if (newPw !== confirmPw) {
      setPwMessage({ ok: false, text: 'Passwords do not match.' });
      return;
    }

    setPwLoading(true);
    const res = await authClient.changePassword(currentPw, newPw);
    setPwLoading(false);

    if (res.ok) {
      setPwMessage({ ok: true, text: 'Password updated successfully.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- error shape from API
      const errorCode = (res.data as any)?.error;
      setPwMessage({
        ok: false,
        text:
          errorCode === 'invalid_credentials'
            ? 'Current password is incorrect.'
            : 'Failed to update password.',
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-0">Security Settings</h1>
        <p className="text-sm text-ink-1 mt-1">Manage your sessions, passkeys, and password</p>
      </div>

      {/* Active Sessions */}
      <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Monitor size={18} className="text-brand" />
          <h2 className="text-base font-bold text-ink-0">Active Sessions</h2>
        </div>
        {sessionsError ? (
          <p className="text-sm text-ink-disabled">{sessionsError}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-ink-disabled">No other active sessions.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.session_id}
                className="flex items-center justify-between py-2 border-b border-line last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-0">{s.device_label ?? 'Unknown device'}</p>
                    {s.is_current && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-disabled">
                    {s.ip_address} · Last active{' '}
                    {s.last_active_at ? new Date(s.last_active_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                {!s.is_current && (
                  <button
                    onClick={() => handleRevokeSession(s.session_id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={13} /> Revoke
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleRevokeAll}
              className="text-sm text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              Sign out all other sessions
            </button>
          </div>
        )}
      </div>

      {/* Passkeys */}
      <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Key size={18} className="text-brand" />
          <h2 className="text-base font-bold text-ink-0">Passkeys</h2>
        </div>
        <p className="text-sm text-ink-disabled">Use a passkey for faster, passwordless sign-in.</p>
        <button className="flex items-center gap-2 text-sm font-semibold text-brand hover:opacity-80 transition-opacity">
          <Plus size={15} /> Add Passkey
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-brand" />
          <h2 className="text-base font-bold text-ink-0">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {(
            [
              { label: 'Current Password', value: currentPw, setter: setCurrentPw, autoComplete: 'current-password' },
              { label: 'New Password', value: newPw, setter: setNewPw, autoComplete: 'new-password' },
              { label: 'Confirm New Password', value: confirmPw, setter: setConfirmPw, autoComplete: 'new-password' },
            ] as const
          ).map(({ label, value, setter, autoComplete }) => (
            <div key={label} className="space-y-1.5">
              <label className="block text-xs font-bold text-ink-disabled uppercase tracking-widest">
                {label}
              </label>
              <input
                type="password"
                autoComplete={autoComplete}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3 text-sm text-ink-0 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>
          ))}
          {pwMessage && (
            <p className={`text-sm ${pwMessage.ok ? 'text-emerald-500' : 'text-red-400'}`}>
              {pwMessage.text}
            </p>
          )}
          <p className="text-xs text-ink-disabled">
            Must be 12+ characters with uppercase, lowercase, and a number.
          </p>
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2.5 bg-brand text-white text-sm font-black rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
