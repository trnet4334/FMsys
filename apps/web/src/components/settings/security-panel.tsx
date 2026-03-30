'use client';

import { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, Monitor, MapPin, Clock, Trash2, KeyRound } from 'lucide-react';
import {
  listSessions,
  revokeSession,
  revokeAllSessions,
  changePassword,
} from '../../lib/auth-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Session {
  session_id: string;
  device_label?: string;
  user_agent?: string;
  ip_address?: string;
  last_active_at?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function deviceLabel(session: Session): string {
  const label = session.device_label ?? session.user_agent ?? '';
  return label.length > 40 ? label.slice(0, 40) + '…' : label || 'Unknown device';
}

// ---------------------------------------------------------------------------
// Section 1: Active Sessions
// ---------------------------------------------------------------------------

function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      setSessions(data.sessions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function handleRevoke(sessionId: string) {
    setRevoking(sessionId);
    setError(null);
    try {
      await revokeSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    setError(null);
    try {
      await revokeAllSessions();
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Active Sessions</h2>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
          >
            {revokingAll ? 'Revoking…' : 'Revoke All Other Sessions'}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-[var(--bg-1)] animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--ink-1)]">No active sessions found.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.session_id}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <Monitor size={14} className="shrink-0 text-[var(--ink-1)]" />
                  <span className="text-sm font-medium text-[var(--ink-0)] truncate">
                    {deviceLabel(session)}
                  </span>
                </div>
                <div className="flex items-center gap-4 pl-5">
                  <span className="flex items-center gap-1 text-xs text-[var(--ink-1)]">
                    <MapPin size={11} />
                    {session.ip_address ?? '—'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--ink-1)]">
                    <Clock size={11} />
                    {relativeTime(session.last_active_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(session.session_id)}
                disabled={revoking === session.session_id}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60 shrink-0"
              >
                {revoking === session.session_id ? (
                  '…'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Trash2 size={13} />
                    Revoke
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 2: Change Password
// ---------------------------------------------------------------------------

function ChangePasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && next.length >= 8 && next === confirm && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {/* Current password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-0)]">
            Current password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)]"
            />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-0)] py-2 pl-9 pr-9 text-sm text-[var(--ink-0)] placeholder:text-[var(--ink-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              placeholder="Current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-0)]">
            New password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)]"
            />
            <input
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-0)] py-2 pl-9 pr-9 text-sm text-[var(--ink-0)] placeholder:text-[var(--ink-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
              tabIndex={-1}
            >
              {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-0)]">
            Confirm new password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)]"
            />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full rounded-lg border py-2 pl-9 pr-9 text-sm text-[var(--ink-0)] placeholder:text-[var(--ink-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--bg-0)] ${
                mismatch ? 'border-red-300' : 'border-[var(--line)]'
              }`}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {mismatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Password updated successfully
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-[var(--ink-0)] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-all disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 3: Passkeys (placeholder)
// ---------------------------------------------------------------------------

function PasskeysSection() {
  return (
    <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-[var(--bg-1)] p-2.5">
          <KeyRound size={20} className="text-[var(--ink-1)]" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-1">Passkeys</h2>
          <p className="text-sm text-[var(--ink-1)] mb-4">
            Use a passkey for faster, passwordless sign-in.
          </p>
          <button
            disabled
            title="Coming soon"
            className="rounded-lg bg-[var(--ink-0)] px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60 cursor-not-allowed"
          >
            Add Passkey
            <span className="ml-2 text-xs font-normal opacity-70">(Coming soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function SecurityPanel() {
  return (
    <div className="space-y-6">
      <SessionsSection />
      <ChangePasswordSection />
      <PasskeysSection />
    </div>
  );
}
