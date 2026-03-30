import type { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="neutral" className="bg-[var(--bg-0)] text-[var(--ink-0)] min-h-screen">
      {children}
    </div>
  );
}
