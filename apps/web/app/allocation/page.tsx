import { AppShell } from '../../src/components/layout/app-shell';

export default function AllocationPage() {
  return (
    <AppShell title="Allocation" subtitle="Portfolio composition and concentration analysis.">
      <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
        <p style={{ margin: 0 }}>Allocation detail page is prepared for deeper drill-down components.</p>
      </section>
    </AppShell>
  );
}
