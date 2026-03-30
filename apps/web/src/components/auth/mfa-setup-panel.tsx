'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Check, CircleCheck, ClipboardCopy, Lock, LockKeyhole, ShieldCheck } from 'lucide-react';

import { setupMfa, verifyMfaSetup } from '../../lib/auth-client';

const codeLength = 6;

interface MfaSetupData {
  qrDataUrl: string;
  recoveryCodes: string[];
}

export function MfaSetupPanel() {
  const router = useRouter();

  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setupMfa()
      .then((data) => setSetupData(data as MfaSetupData))
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to initialize MFA setup');
      });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await verifyMfaSetup(code);
      router.push('/dashboard');
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'MFA setup verification failed');
    } finally {
      setPending(false);
    }
  }

  async function copyAllCodes() {
    if (!setupData) return;
    try {
      await navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy codes to clipboard');
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
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[560px] flex flex-col gap-8">
              <div className="@container">
                <div className="rounded-xl overflow-hidden bg-white flex flex-col items-center justify-center min-h-[220px] border border-[var(--line)] shadow-[var(--shadow-soft)]">
                  <div className="relative inline-flex">
                    <ShieldCheck size={96} className="text-[var(--brand)]/20" />
                    <LockKeyhole size={48} className="text-[var(--brand)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="mt-4 text-center px-6 pb-6">
                    <p className="font-semibold">Set Up Two-Factor Authentication</p>
                    <p className="text-[var(--ink-1)] text-sm">Secure your account with an authenticator app</p>
                  </div>
                </div>
              </div>

              {loadError ? (
                <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8">
                  <p className="text-sm text-red-600 text-center">{loadError}</p>
                </div>
              ) : !setupData ? (
                <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8 flex items-center justify-center min-h-[120px]">
                  <p className="text-sm text-[var(--ink-1)]">Loading setup data…</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Authenticator URI */}
                  <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base font-semibold">Step 1 — Add to authenticator app</h2>
                      <p className="text-sm text-[var(--ink-1)]">
                        Copy the URI below and import it manually in your authenticator app (e.g. Google Authenticator, Authy).
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--bg-1)] border border-[var(--line)] p-3 overflow-x-auto">
                      <code className="text-xs break-all text-[var(--ink-0)] font-mono whitespace-pre-wrap">
                        {setupData.qrDataUrl}
                      </code>
                    </div>
                  </div>

                  {/* Step 2: Recovery codes */}
                  <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base font-semibold">Step 2 — Save your recovery codes</h2>
                      <p className="text-sm text-[var(--ink-1)]">
                        Store these codes somewhere safe. Each code can only be used once if you lose access to your authenticator app.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.recoveryCodes.map((rc) => (
                        <div
                          key={rc}
                          className="rounded-lg bg-[var(--bg-1)] border border-[var(--line)] px-3 py-2 text-center"
                        >
                          <code className="text-sm font-mono tracking-widest text-[var(--ink-0)]">{rc}</code>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={copyAllCodes}
                      className="flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink-0)] hover:bg-slate-50 active:scale-[0.98] transition-all"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-[var(--success)]" />
                          <span className="text-[var(--success)]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy size={16} />
                          <span>Copy All Codes</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 3: Verify TOTP */}
                  <div className="rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2 text-center">
                      <h2 className="text-xl font-semibold">Step 3 — Verify your setup</h2>
                      <p className="text-sm text-[var(--ink-1)]">
                        Enter the 6-digit code from your authenticator app to confirm setup.
                      </p>
                    </div>
                    <form onSubmit={submit} className="flex flex-col gap-6">
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
                      <button
                        className="flex w-full justify-center rounded-lg bg-[var(--ink-0)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={pending || code.replace(/\s/g, '').length < codeLength}
                      >
                        {pending ? 'Verifying…' : 'Confirm & Enable MFA'}
                      </button>
                    </form>
                    {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}
                  </div>
                </>
              )}

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
