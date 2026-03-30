'use client';

import { FormEvent, useState } from 'react';

import { Mail, ShieldCheck, Wallet } from 'lucide-react';

import { register } from '../../lib/auth-client';

export function RegisterPanel() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();

    try {
      await register(email);
      setSuccessEmail(email);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed');
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
          {successEmail === null ? (
            <>
              <div className="flex flex-col gap-2 mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
                <p className="text-sm text-[var(--ink-1)]">Enter your email to get started.</p>
              </div>

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
                  {pending ? 'Sending…' : 'Create account'}
                </button>
              </form>

              {error !== null ? (
                <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
              ) : null}

              <p className="mt-6 text-center text-sm text-[var(--ink-1)]">
                Already have an account?{' '}
                <a className="font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80" href="/login">
                  Sign in
                </a>
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="size-14 rounded-full bg-[var(--brand-weak)] flex items-center justify-center">
                <ShieldCheck size={28} className="text-[var(--brand)]" />
              </div>
              <h2 className="text-xl font-semibold">Check your inbox</h2>
              <p className="text-sm text-[var(--ink-1)] leading-relaxed">
                We sent a verification link to{' '}
                <span className="font-semibold text-[var(--ink-0)]">{successEmail}</span>.
                Click the link in the email to continue setting up your account.
              </p>
              <p className="text-xs text-[var(--ink-1)] mt-2">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  type="button"
                  className="font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80"
                  onClick={() => setSuccessEmail(null)}
                >
                  try again
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
