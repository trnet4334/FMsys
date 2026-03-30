'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CircleCheck, CircleHelp, Lock, LockKeyhole, ShieldCheck } from 'lucide-react';

import { fetchMfaCodeForDemo, verifyMfa } from '../../lib/auth-client';

const codeLength = 6;

export function MfaPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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
      setCode(value.slice(0, codeLength));
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : 'Unable to load demo code');
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const padded = code.padEnd(codeLength, ' ');
    const next = padded.split('');
    next[index] = digit;
    const updated = next.join('').replace(/\s+$/, '');
    setCode(updated);

    if (digit && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleBackspace(index: number, value: string) {
    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function toggleRecoveryMode() {
    setCode('');
    setError(null);
    setUseRecovery((prev) => !prev);
  }

  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen flex flex-col">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--line)] px-6 md:px-10 py-4 bg-[var(--bg-0)]">
            <div className="flex items-center gap-4">
              <div className="text-[var(--ink-0)]">
                <ShieldCheck size={30} />
              </div>
              <h2 className="text-lg font-semibold leading-tight tracking-tight">FMSYS</h2>
            </div>
            <button className="flex items-center justify-center rounded-lg h-10 bg-white text-[var(--ink-0)] px-3 border border-[var(--line)] hover:bg-slate-50 transition-colors" type="button">
              <CircleHelp size={20} />
            </button>
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[520px] flex flex-col gap-8">
              <div className="@container">
                <div className="rounded-xl overflow-hidden bg-white flex flex-col items-center justify-center min-h-[220px] border border-[var(--line)] shadow-[var(--shadow-soft)]">
                  <div className="relative inline-flex">
                    <ShieldCheck size={96} className="text-[var(--brand)]/20" />
                    <LockKeyhole size={48} className="text-[var(--brand)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="mt-4 text-center px-6">
                    <p className="font-semibold">Verification Required</p>
                    <p className="text-[var(--ink-1)] text-sm">Security check to protect your account</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-[var(--shadow-soft)] border border-[var(--line)]">
                <div className="flex flex-col gap-2 mb-8 text-center">
                  <h1 className="text-2xl md:text-3xl font-semibold leading-tight">Enter MFA Code</h1>
                  <p className="text-[var(--ink-1)] text-sm">Please enter the 6-digit code from your authenticator app.</p>
                </div>
                <form onSubmit={submit} className="flex flex-col gap-6">
                  {useRecovery ? (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="recovery-code" className="text-sm font-medium text-[var(--ink-1)]">
                        Recovery code
                      </label>
                      <input
                        id="recovery-code"
                        type="text"
                        placeholder="XXXX-XXXX"
                        autoComplete="off"
                        spellCheck={false}
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        disabled={pending}
                        className="rounded-lg border border-[var(--line)] bg-white py-3 px-4 text-[var(--ink-0)] placeholder:text-[var(--ink-1)] focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] focus:border-transparent sm:text-sm transition-all font-mono tracking-widest"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between gap-2 md:gap-4">
                      {Array.from({ length: codeLength }).map((_, index) => (
                        <input
                          key={`digit-${index}`}
                          ref={(element) => {
                            inputsRef.current[index] = element;
                          }}
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          className="flex h-12 w-10 md:h-14 md:w-12 text-center text-xl font-semibold rounded-lg border-2 border-[var(--line)] bg-white focus:border-[var(--brand)] focus:ring-0 text-[var(--ink-0)] transition-all"
                          inputMode="numeric"
                          maxLength={1}
                          type="text"
                          value={code[index] ?? ''}
                          onChange={(event) => updateDigit(index, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Backspace') {
                              handleBackspace(index, code[index] ?? '');
                            }
                          }}
                          disabled={pending}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <button
                      className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-[var(--ink-0)] text-white text-base font-semibold hover:bg-slate-900 active:scale-[0.98] transition-all shadow-[var(--shadow-soft)] disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={pending}
                    >
                      Verify
                    </button>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={toggleRecoveryMode}
                        className="text-[var(--brand)] font-semibold hover:underline"
                        disabled={pending}
                      >
                        {useRecovery ? 'Use authenticator app' : 'Use recovery code'}
                      </button>
                    </div>
                  </div>
                </form>
                <button
                  type="button"
                  onClick={loadDemoCode}
                  className="mt-6 w-full rounded-lg border border-dashed border-[var(--line)] bg-transparent px-4 py-2 text-sm text-[var(--ink-0)] hover:bg-slate-50 transition-colors"
                  disabled={pending}
                >
                  Load demo MFA code
                </button>
                {demoCode ? <p className="mt-2 text-sm">Demo code: <code>{demoCode}</code></p> : null}
                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
              </div>
              <div className="text-center flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink-1)]">
                    <Lock size={14} />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink-1)]">
                    <CircleCheck size={14} />
                    <span>Verified Session</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--ink-1)]">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </main>
          <footer className="p-6 text-center">
            <p className="text-xs text-[var(--ink-1)]">© 2024 SecureGuard Technologies Inc. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
