import type { ReactNode } from 'react';
import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cashflow', label: 'Cashflow' },
  { href: '/allocation', label: 'Allocation' },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <main style={{ padding: '2rem clamp(1rem, 2vw, 2.5rem)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, letterSpacing: '-0.02em', fontSize: '2rem' }}>{title}</h1>
          {subtitle ? <p style={{ margin: '0.25rem 0 0', color: 'var(--ink-1)' }}>{subtitle}</p> : null}
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '0.42rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid var(--line)',
                textDecoration: 'none',
                color: 'var(--ink-0)',
                background: '#fff',
                fontSize: '0.86rem',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
}
