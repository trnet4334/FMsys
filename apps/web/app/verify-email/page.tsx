'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }

    const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4020';
    fetch(`${API}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.setupToken) {
          router.replace(`/setup-password?token=${encodeURIComponent(data.setupToken)}`);
        } else {
          setStatus('error');
          setError('This verification link is invalid or has expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setError('Could not connect to server. Please try again.');
      });
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-center space-y-4">
          <Loader className="mx-auto text-brand animate-spin" size={40} />
          <p className="text-ink-1">Verifying your email…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 px-4">
      <div className="text-center space-y-4">
        <XCircle className="mx-auto text-red-400" size={48} />
        <h1 className="text-2xl font-black text-ink-0">Verification failed</h1>
        <p className="text-ink-1 text-sm">{error}</p>
        <Link href="/register" className="text-brand text-sm hover:underline">
          Start over
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-0">
          <div className="text-ink-1">Loading…</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
