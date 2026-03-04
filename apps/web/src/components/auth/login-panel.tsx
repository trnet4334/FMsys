'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { startOAuthLogin, startRecoveryLogin } from '../../lib/auth-client';

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

  async function handleRecoverySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      await startRecoveryLogin({ email, password });
      router.push(`/mfa?next=${encodeURIComponent(nextPath)}`);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Recovery login failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <section style={{ maxWidth: '32rem', margin: '6rem auto', background: '#ffffffee', border: '1px solid var(--line)', borderRadius: '1rem', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0, marginBottom: '0.3rem' }}>Sign in to Financial Command Center</h1>
      <p style={{ marginTop: 0, color: 'var(--ink-1)' }}>OAuth is the primary login method. MFA is required before dashboard access.</p>

      <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
        <button type="button" disabled={pending} onClick={() => handleOAuth('google')} style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--line)', background: '#fff' }}>
          Continue with Google
        </button>
        <button type="button" disabled={pending} onClick={() => handleOAuth('apple')} style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--line)', background: '#fff' }}>
          Continue with Apple
        </button>
      </div>

      <details style={{ marginTop: '1.2rem' }}>
        <summary>Fallback recovery login (secondary)</summary>
        <form onSubmit={handleRecoverySubmit} style={{ display: 'grid', gap: '0.5rem', marginTop: '0.6rem' }}>
          <input name="email" type="email" required placeholder="recovery@fmsys.local" style={{ padding: '0.55rem', borderRadius: '0.55rem', border: '1px solid var(--line)' }} />
          <input name="password" type="password" required placeholder="Recovery password" style={{ padding: '0.55rem', borderRadius: '0.55rem', border: '1px solid var(--line)' }} />
          <button type="submit" disabled={pending} style={{ padding: '0.65rem', borderRadius: '0.65rem', border: '1px solid var(--line)', background: '#f8fafc' }}>
            Continue with recovery access
          </button>
        </form>
      </details>

      {error ? <p style={{ color: '#dc2626', marginTop: '0.8rem' }}>{error}</p> : null}
      <p style={{ color: 'var(--ink-1)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Demo recovery credentials: <code>recovery@fmsys.local</code> / <code>recovery-only</code>
      </p>
    </section>
  );
}
