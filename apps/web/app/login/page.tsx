import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LoginPanel } from '../../src/components/auth/login-panel';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const state = cookieStore.get('fm_session_state')?.value;

  if (state === 'authenticated') {
    redirect('/dashboard');
  }

  return <LoginPanel />;
}
