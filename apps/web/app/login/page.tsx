import { Suspense } from 'react';
import { LoginPanel } from '../../src/components/auth/login-panel';

export default function LoginPage() {
  return <Suspense><LoginPanel /></Suspense>;
}
