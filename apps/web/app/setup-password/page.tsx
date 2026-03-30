import { Suspense } from 'react';
import { SetupPasswordPanel } from '../../src/components/auth/setup-password-panel';

export default function SetupPasswordPage() {
  return <Suspense><SetupPasswordPanel /></Suspense>;
}
