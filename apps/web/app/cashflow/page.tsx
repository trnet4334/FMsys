import { AppShell } from '../../src/components/layout/app-shell';

export default function CashflowPage() {
  return (
    <AppShell title="Cashflow" subtitle="Monthly inflow, outflow, and budget posture.">
      <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
        <p style={{ margin: 0 }}>Cashflow detail page is the next expansion target.</p>
      </section>
    </AppShell>
  );
}
