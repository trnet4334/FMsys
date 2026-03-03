import { AlertsPanel } from '../../src/components/dashboard/alerts-panel';
import { AllocationPanel } from '../../src/components/dashboard/allocation-panel';
import { CashflowMiniPanel } from '../../src/components/dashboard/cashflow-mini-panel';
import { NetWorthHero } from '../../src/components/dashboard/net-worth-hero';
import { TrendPanel } from '../../src/components/dashboard/trend-panel';
import { adaptDashboardData } from '../../src/lib/mock-data/adapters';
import { seedDashboardData } from '../../src/lib/mock-data/seed';

export default function DashboardPage() {
  const data = adaptDashboardData(seedDashboardData());

  return (
    <main
      style={{
        padding: '2.2rem clamp(1rem, 2vw, 2.5rem)',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 8% 12%, rgba(13, 139, 130, 0.14) 0%, rgba(13, 139, 130, 0) 38%), radial-gradient(circle at 92% 3%, rgba(100, 165, 242, 0.2) 0%, rgba(100, 165, 242, 0) 31%), linear-gradient(180deg, var(--bg-0), #ffffff 80%)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, letterSpacing: '-0.02em', fontSize: '2rem' }}>Financial Command Center</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--ink-1)' }}>Desktop-first snapshot of wealth, risk, and momentum.</p>
        </div>
        <div style={{ color: 'var(--ink-1)', fontSize: '0.85rem' }}>Mock data mode</div>
      </header>

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
    </main>
  );
}
