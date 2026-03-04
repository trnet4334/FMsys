'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { fetchMfaCodeForDemo, verifyMfa } from '../../lib/auth-client';

export function MfaPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await verifyMfa(code);
      router.push(nextPath);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'MFA verification failed');
    } finally {
      setPending(false);
    }
  }

  async function loadDemoCode() {
    setError(null);
    try {
      const value = await fetchMfaCodeForDemo();
      setDemoCode(value);
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : 'Unable to load demo code');
    }
  }

  return (
    <section style={{ maxWidth: '28rem', margin: '6rem auto', background: '#ffffffee', border: '1px solid var(--line)', borderRadius: '1rem', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>Multi-factor verification</h1>
      <p style={{ color: 'var(--ink-1)' }}>Enter your 6-digit TOTP code to unlock dashboard access.</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: '0.65rem' }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          required
          style={{ padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid var(--line)', fontSize: '1.1rem', letterSpacing: '0.2em' }}
        />
        <button type="submit" disabled={pending} style={{ padding: '0.7rem', borderRadius: '0.6rem', border: '1px solid var(--line)', background: '#f8fafc' }}>
          Verify and continue
        </button>
      </form>

      <button type="button" onClick={loadDemoCode} style={{ marginTop: '0.8rem', border: '1px dashed var(--line)', background: 'transparent', padding: '0.45rem 0.65rem', borderRadius: '0.6rem' }}>
        Load demo MFA code
      </button>
      {demoCode ? <p style={{ marginTop: '0.45rem' }}>Demo code: <code>{demoCode}</code></p> : null}
      {error ? <p style={{ color: '#dc2626', marginTop: '0.8rem' }}>{error}</p> : null}
    </section>
  );
}
