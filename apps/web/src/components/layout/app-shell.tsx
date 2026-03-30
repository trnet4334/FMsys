import type { ReactNode } from 'react';

import { Header } from './header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg-0 text-ink-0">
      <Header />
      <main className="flex-1 px-4 md:px-10 py-8 max-w-[1440px] mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-line py-8 text-center text-ink-1 text-sm">
        <p>© 2026 FMSYS. All financial data is encrypted and secure.</p>
      </footer>
    </div>
  );
}
