import { Suspense } from 'react';
import { MfaPanel } from '../../src/components/auth/mfa-panel';

export default function MfaPage() {
  return <Suspense><MfaPanel /></Suspense>;
}
