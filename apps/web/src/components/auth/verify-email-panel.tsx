'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CircleAlert, CircleCheck, Loader2, ShieldCheck, Wallet } from 'lucide-react';

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setErrorMessage('Missing verification token.');
        setStatus('error');
        return;
      }

      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4020';
        const res = await fetch(`${base}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
          credentials: 'include',
        });
        const data: { setupToken?: string; error?: string } = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error ?? 'Invalid or expired verification link.');
          setStatus('error');
          return;
        }

        setStatus('success');
        router.push(`/setup-password?token=${encodeURIComponent(data.setupToken ?? '')}`);
      } catch {
        setErrorMessage('Unable to verify email. Please try again.');
        setStatus('error');
      }
    }

    void verify();
  }, [token, router]);

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
          <div className="flex flex-col items-center gap-4 text-center py-4">
            {status === 'loading' && (
              <>
                <div className="size-14 rounded-full bg-[var(--brand-weak)] flex items-center justify-center">
                  <Loader2 size={28} className="text-[var(--brand)] animate-spin" />
                </div>
                <h2 className="text-xl font-semibold">Verifying your email…</h2>
                <p className="text-sm text-[var(--ink-1)]">Please wait while we confirm your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="size-14 rounded-full bg-[var(--brand-weak)] flex items-center justify-center">
                  <CircleCheck size={28} className="text-[var(--brand)]" />
                </div>
                <h2 className="text-xl font-semibold">Email verified</h2>
                <p className="text-sm text-[var(--ink-1)]">Redirecting you to set up your password…</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="size-14 rounded-full bg-red-50 flex items-center justify-center">
                  <CircleAlert size={28} className="text-[var(--danger)]" />
                </div>
                <h2 className="text-xl font-semibold">Verification failed</h2>
                <p className="text-sm text-[var(--ink-1)]">
                  {errorMessage ?? 'Invalid or expired verification link.'}
                </p>
                <a
                  href="/register"
                  className="mt-2 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand)]/80"
                >
                  Back to registration
                </a>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--ink-1)]">
            <ShieldCheck size={14} />
            <span>Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
