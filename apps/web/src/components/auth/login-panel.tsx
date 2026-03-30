'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Eye, KeyRound, Lock, Mail, Wallet } from 'lucide-react';

import { login, startOAuthLogin } from '../../lib/auth-client';

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null);
    setPending(true);
    try {
      await startOAuthLogin(provider);
      router.push(`/mfa?next=${encodeURIComponent(nextPath)}`);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to start OAuth login');
    } finally {
      setPending(false);
    }
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const result = await login(email, password);
      if (result.sessionState === 'authenticated') {
        router.push(nextPath);
      } else if (result.sessionState === 'mfa_setup') {
        router.push('/mfa/setup');
      } else {
        router.push(`/mfa?next=${encodeURIComponent(nextPath)}`);
      }
    } catch (authError) {
      const code = authError instanceof Error ? authError.message : '';
      if (code === 'account_locked') {
        setError('Account is temporarily locked. Try again later.');
      } else if (code === 'account_not_active') {
        setError('Account not yet activated. Check your email.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setPending(false);
    }
  }

  function handlePasskeyClick() {
    console.log('Passkey authentication coming soon');
  }

  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[var(--brand-weak)] blur-[120px]"></div>
            <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-slate-200 blur-[90px]"></div>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--ink-0)] text-white flex items-center justify-center">
              <Wallet size={22} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">FMSYS</h2>
          </div>
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-semibold leading-tight">
              Master your <span className="text-[var(--brand)]">financial future</span> with confidence.
            </h1>
            <p className="mt-5 text-base text-[var(--ink-1)] leading-relaxed">
              Join over 50,000 investors managing their global assets, crypto portfolios, and real estate in one secure ecosystem.
            </p>
          </div>
          <div className="relative z-10 flex gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-semibold">$4.2B+</span>
              <span className="text-sm text-[var(--ink-1)]">Assets Managed</span>
            </div>
            <div className="w-px h-12 bg-[var(--line)]"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-semibold">99.9%</span>
              <span className="text-sm text-[var(--ink-1)]">Uptime Reliability</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-28 bg-[var(--bg-0)]">
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="size-9 rounded-lg bg-[var(--ink-0)] text-white flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">AssetGuard</h2>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              <h2 className="text-3xl font-semibold tracking-tight">Welcome Back</h2>
              <p className="text-[var(--ink-1)]">Enter your credentials to access your dashboard.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-7">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white py-3 text-sm font-semibold text-[var(--ink-0)] hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleOAuth('apple')}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white py-3 text-sm font-semibold text-[var(--ink-0)] hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M17.05 20.28c-.96.95-2.04 1.72-3.12 1.72-1.12 0-1.48-.68-2.76-.68-1.28 0-1.72.64-2.72.68-1.04.04-2.12-.76-3.16-1.76-2.16-2.04-3.72-5.76-3.72-8.68 0-4.6 2.92-7.04 5.68-7.04 1.44 0 2.8.96 3.68.96.84 0 2.52-.96 4.12-.96 1.12 0 3.2.44 4.44 2.2-2.76 1.48-2.32 5.4 0 6.6-1.04 2.48-2.36 5.04-4.44 6.96zM15.41 4.28c-.8-1-1.32-2.4-1.32-3.8 0-.2 0-.4 0-.48 1.4.08 3.04.96 4.04 2.12.84 1 1.44 2.44 1.44 3.84 0 .2 0 .4 0 .48-1.52-.08-2.96-.92-4.16-2.16z"
                  ></path>
                </svg>
                Apple
              </button>
            </div>
            <div className="relative mb-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--line)]"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                <span className="bg-[var(--bg-0)] px-3 text-[var(--ink-1)]">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <a className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80" href="/forgot-password">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--ink-1)] group-focus-within:text-[var(--brand)] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    autoComplete="current-password"
                    className="block w-full rounded-lg border border-[var(--line)] bg-white py-3 pl-10 pr-10 text-[var(--ink-0)] placeholder:text-[var(--ink-1)] focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] focus:border-transparent sm:text-sm transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    disabled={pending}
                  />
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ink-1)] hover:text-[var(--ink-0)]"
                    type="button"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--brand)] focus:ring-[var(--brand)] bg-white"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={pending}
                />
                <label className="ml-3 block text-sm text-[var(--ink-1)]" htmlFor="remember-me">
                  Remember me for 30 days
                </label>
              </div>
              <div>
                <button
                  className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink-0)] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={pending}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handlePasskeyClick}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink-0)] hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <KeyRound size={18} />
                  Sign in with Passkey
                </button>
              </div>
            </form>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <p className="mt-6 text-center text-sm text-[var(--ink-1)]">
              Not a member?
              <a className="ml-2 font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80" href="/register">
                Create an account
              </a>
            </p>
            <p className="mt-3 text-center text-xs text-[var(--ink-1)]">
              Demo recovery credentials: <code>recovery@fmsys.local</code> / <code>recovery-only</code>
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 text-xs text-[var(--ink-1)] uppercase tracking-widest">
              <a className="hover:text-[var(--ink-0)] transition-colors" href="#">
                Privacy Policy
              </a>
              <span className="size-1 bg-[var(--ink-1)]/40 rounded-full"></span>
              <a className="hover:text-[var(--ink-0)] transition-colors" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden sm:block md:block lg:block xl:block 2xl:block" id="rwd-compatibility-tag"></div>
    </div>
  );
}
