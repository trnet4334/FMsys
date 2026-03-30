'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Copy, Check, ArrowRight } from 'lucide-react';
import * as authClient from '../../../src/lib/auth-client';

export default function MfaSetupPage() {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authClient.setupMfa().then((res) => {
      if (res.ok) {
        setQrDataUrl(res.data.qrDataUrl ?? '');
        setRecoveryCodes(res.data.recoveryCodes ?? []);
      } else {
        setError('Failed to initialize MFA setup.');
      }
      setLoading(false);
    });
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError('');
    const res = await authClient.verifyMfaSetup(code);
    setVerifying(false);
    if (res.ok) {
      router.replace('/dashboard');
    } else {
      setError('Invalid code. Please try again.');
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-ink-1">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Shield className="mx-auto text-brand mb-4" size={40} />
          <h1 className="text-3xl font-black text-ink-0">Set up two-factor auth</h1>
          <p className="mt-2 text-ink-1 text-sm">
            Scan the QR code with your authenticator app, then enter the 6-digit code.
          </p>
        </div>

        {qrDataUrl && (
          <div className="flex justify-center">
            <img
              src={qrDataUrl}
              alt="MFA QR code"
              className="rounded-xl border border-line"
              width={180}
              height={180}
            />
          </div>
        )}

        {recoveryCodes.length > 0 && (
          <div className="bg-bg-1 border border-line rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-ink-disabled uppercase tracking-widest">
                Recovery Codes
              </p>
              <button
                type="button"
                onClick={copyAll}
                className="flex items-center gap-1 text-xs text-brand hover:underline"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}{' '}
                {copied ? 'Copied!' : 'Copy all'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.map((c) => (
                <code
                  key={c}
                  className="text-xs font-mono bg-bg-0 border border-line rounded-lg px-2 py-1.5 text-ink-1 text-center"
                >
                  {c}
                </code>
              ))}
            </div>
            <p className="text-[11px] text-ink-disabled">
              Save these codes. Each can be used once if you lose access to your authenticator.
            </p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-disabled uppercase tracking-widest">
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-bg-1 border border-line rounded-xl px-4 py-3.5 text-xl font-mono text-center text-ink-0 placeholder:text-ink-disabled focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full bg-brand text-white font-black rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {verifying ? 'Verifying…' : 'Confirm & Continue'}{' '}
            {!verifying && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
