import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  children?: ReactNode;
};

export function MetricCard({ label, value, delta, children }: MetricCardProps) {
  return (
    <article
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-soft)',
        padding: '1rem 1.2rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <p style={{ margin: 0, color: 'var(--ink-1)', fontSize: '0.82rem' }}>{label}</p>
      <h3 style={{ margin: '0.4rem 0 0', color: 'var(--ink-0)', fontSize: '1.5rem' }}>{value}</h3>
      {delta ? <p style={{ margin: '0.35rem 0 0', color: 'var(--brand)', fontSize: '0.85rem' }}>{delta}</p> : null}
      {children}
    </article>
  );
}
