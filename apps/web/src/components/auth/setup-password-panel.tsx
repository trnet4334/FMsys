'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CircleCheck, Eye, EyeOff, Lock, Wallet } from 'lucide-react';

import { setupPassword } from '../../lib/auth-client';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One digit', test: (pw) => /\d/.test(pw) },
];

function validatePassword(password: string, confirm: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return rule.label + ' is required.';
    }
  }
  if (password !== confirm) {
    return 'Passwords do not match.';
  }
  return null;
}

export function SetupPasswordPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validatePassword(password, confirm);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Missing setup token. Please use the link from your email.');
      return;
    }

    setPending(true);
    try {
      await setupPassword(token, password);
      router.push('/mfa/setup');
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : 'Password setup failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="size-10 rounded-lg bg-[var(--ink-0)] text-white flex items-center justify-center">
            <Wallet size={22} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">FMSYS</h2>
        </div>

        <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="size-12 rounded-full bg-[var(--brand-weak)] flex items-center justify-center">
                <Lock size={24} className="text-[var(--brand)]" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Set your password</h1>
            <p className="text-sm text-[var(--ink-1)]">Choose a strong password to secure your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
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
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={pending}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

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
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={pending}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule.label} className="flex items-center gap-2 text-xs">
                    <CircleCheck
                      size={14}
                      className={rule.test(password) ? 'text-[var(--brand)]' : 'text-[var(--ink-disabled)]'}
                    />
                    <span className={rule.test(password) ? 'text-[var(--ink-0)]' : 'text-[var(--ink-1)]'}>
                      {rule.label}
                    </span>
                  </li>
                ))}
                {confirm.length > 0 && (
                  <li className="flex items-center gap-2 text-xs">
                    <CircleCheck
                      size={14}
                      className={password === confirm ? 'text-[var(--brand)]' : 'text-[var(--ink-disabled)]'}
                    />
                    <span className={password === confirm ? 'text-[var(--ink-0)]' : 'text-[var(--ink-1)]'}>
                      Passwords match
                    </span>
                  </li>
                )}
              </ul>
            )}

            <button
              className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={pending}
            >
              {pending ? 'Setting up…' : 'Set password'}
            </button>
          </form>

          {error !== null ? (
            <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
