'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { resetPassword } from '../../lib/auth-client';

interface PolicyRule {
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_POLICY: PolicyRule[] = [
  { label: 'At least 12 characters', test: (v) => v.length >= 12 },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
];

export function ResetPasswordPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const policyMet = PASSWORD_POLICY.every((rule) => rule.test(password));
  const passwordsMatch = password === confirm;

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function handleConfirmChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirm(event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!policyMet || !passwordsMatch) return;

    setError(null);
    setPending(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch {
      setError('This reset link has expired or already been used.');
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
              <p className="text-sm text-[var(--ink-1)]">
                Your password has been reset successfully.
              </p>
            </div>
            <a
              className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 active:scale-[0.98] transition-all"
              href="/login?reset=success"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
            <p className="text-sm text-[var(--ink-1)]">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                New password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--ink-1)] group-focus-within:text-[var(--brand)] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-[var(--line)] bg-white py-3 pl-10 pr-10 text-[var(--ink-0)] placeholder:text-[var(--ink-1)] focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] focus:border-transparent sm:text-sm transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={pending}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ink-1)] hover:text-[var(--ink-0)] transition-colors"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password policy checklist */}
            {password.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {PASSWORD_POLICY.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        met ? 'text-[var(--success,#16a34a)]' : 'text-[var(--ink-1)]'
                      }`}
                    >
                      <span
                        className={`inline-block size-1.5 rounded-full flex-shrink-0 ${
                          met ? 'bg-[var(--success,#16a34a)]' : 'bg-[var(--ink-1)]/40'
                        }`}
                      />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="confirm">
                Confirm password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--ink-1)] group-focus-within:text-[var(--brand)] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-[var(--line)] bg-white py-3 pl-10 pr-10 text-[var(--ink-0)] placeholder:text-[var(--ink-1)] focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] focus:border-transparent sm:text-sm transition-all"
                  id="confirm"
                  name="confirm"
                  placeholder="••••••••••••"
                  required
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={handleConfirmChange}
                  disabled={pending}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ink-1)] hover:text-[var(--ink-0)] transition-colors"
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={pending || !policyMet || !passwordsMatch || confirm.length === 0}
            >
              {pending ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--ink-1)]">
            <a
              className="font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80 transition-colors"
              href="/login"
            >
              ← Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
