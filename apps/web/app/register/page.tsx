'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import * as authClient from '../../src/lib/auth-client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await authClient.register(email);
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError(
        res.data?.error === 'email_already_registered'
          ? 'An account with this email already exists.'
          : 'Something went wrong. Please try again.',
      );
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle className="mx-auto text-emerald-500" size={48} />
          <h1 className="text-2xl font-black text-ink-0">Check your inbox</h1>
          <p className="text-ink-1 text-sm">
            We sent a verification link to <strong>{email}</strong>. Click the link to continue
            setting up your account.
          </p>
          <Link href="/login" className="text-brand text-sm hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-ink-0">Create account</h1>
          <p className="mt-2 text-ink-1 text-sm">Start managing your finances today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-disabled uppercase tracking-widest">
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-bg-1 border border-line rounded-xl pl-10 pr-4 py-3.5 text-sm text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-brand text-white font-black rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Continue'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-ink-disabled">
          Already have an account?{' '}
          <Link href="/login" className="text-brand hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
