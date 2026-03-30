'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as authClient from '../../src/lib/auth-client';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await authClient.resetPassword(token, password);
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.replace('/login'), 2000);
    } else {
      setError(
        res.data?.error === 'token_expired'
          ? 'This reset link has expired. Please request a new one.'
          : res.data?.error ?? 'Something went wrong. Please try again.',
      );
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-black text-ink-0">Password updated</h1>
          <p className="text-ink-1 text-sm">
            Your password has been reset. Redirecting you to sign in…
          </p>
          <Link href="/login" className="text-brand text-sm hover:underline">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-ink-0">Choose a new password</h1>
          <p className="mt-2 text-ink-1 text-sm">
            Choose a strong password (12+ chars, upper, lower, number)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['password', 'confirm'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <label className="block text-xs font-bold text-ink-disabled uppercase tracking-widest">
                {field === 'password' ? 'New Password' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={field === 'password' ? password : confirm}
                  onChange={(e) =>
                    field === 'password' ? setPassword(e.target.value) : setConfirm(e.target.value)
                  }
                  placeholder="••••••••••••"
                  required
                  className={`w-full bg-bg-1 border rounded-xl pl-10 pr-10 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors ${mismatch && field === 'confirm' ? 'border-red-400' : 'border-line'}`}
                />
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-1"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password || !confirm || mismatch}
            className="w-full bg-brand text-white font-black rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Reset Password'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-ink-disabled">
          <Link href="/login" className="text-brand hover:underline font-semibold">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-0">
          <div className="text-ink-1">Loading…</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
