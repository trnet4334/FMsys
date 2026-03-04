import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { MfaPanel } from '../../src/components/auth/mfa-panel';

export default async function MfaPage() {
  const cookieStore = await cookies();
  const state = cookieStore.get('fm_session_state')?.value;

  if (state === 'authenticated') {
    redirect('/dashboard');
  }

  if (state !== 'pre_mfa') {
    redirect('/login');
  }

  return <MfaPanel />;
}
