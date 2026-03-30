'use client';

import { FormEvent, useState } from 'react';
import { Mail } from 'lucide-react';

import { forgotPassword } from '../../lib/auth-client';

export function ForgotPasswordPanel() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();

    try {
      await forgotPassword(email);
    } catch {
      // Intentionally ignored — enumeration prevention: always show success
    } finally {
      setPending(false);
      setSubmitted(true);
    }
  }

  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
            <p className="text-sm text-[var(--ink-1)]">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg border border-[var(--line)] bg-slate-50 p-4 text-sm text-[var(--ink-0)]">
              If an account with that email exists, we'll send a reset link shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--ink-1)] group-focus-within:text-[var(--brand)] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    autoComplete="email"
                    className="block w-full rounded-lg border border-[var(--line)] bg-white py-3 pl-10 pr-3 text-[var(--ink-0)] placeholder:text-[var(--ink-1)] focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] focus:border-transparent sm:text-sm transition-all"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    type="email"
                    disabled={pending}
                  />
                </div>
              </div>

              <button
                className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={pending}
              >
                {pending ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

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
