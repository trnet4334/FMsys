import { AlertsPanel } from '../../src/components/dashboard/alerts-panel';
import { AllocationPanel } from '../../src/components/dashboard/allocation-panel';
import { CashflowMiniPanel } from '../../src/components/dashboard/cashflow-mini-panel';
import { NetWorthHero } from '../../src/components/dashboard/net-worth-hero';
import { TrendPanel } from '../../src/components/dashboard/trend-panel';
import { AppShell } from '../../src/components/layout/app-shell';
import { adaptDashboardData } from '../../src/lib/mock-data/adapters';
import { fetchDashboardData } from '../../src/lib/dashboard-api';
import { seedDashboardData } from '../../src/lib/mock-data/seed';

export default async function DashboardPage() {
  let dataSource = 'Live API mode';
  let data;

  try {
    data = await fetchDashboardData();
  } catch {
    data = adaptDashboardData(seedDashboardData());
    dataSource = 'Mock fallback mode';
  }

  return (
    <AppShell title="Financial Command Center" subtitle="Desktop-first snapshot of wealth, risk, and momentum.">
      <div style={{ color: 'var(--ink-1)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>{dataSource}</div>

      <NetWorthHero snapshot={data.snapshot} />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <TrendPanel points={data.trend} />
        <AllocationPanel slices={data.allocation} />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <AlertsPanel alerts={data.alerts} />
        <CashflowMiniPanel inflow={data.cashflow.inflow} outflow={data.cashflow.outflow} />
      </section>
    </AppShell>
  );
}
