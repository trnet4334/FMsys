import { SectionHeader } from '../ui/section-header';

type CashflowMiniPanelProps = {
  inflow: number;
  outflow: number;
};

const formatter = new Intl.NumberFormat('en-US');

export function CashflowMiniPanel({ inflow, outflow }: CashflowMiniPanelProps) {
  const net = inflow - outflow;
  return (
    <section
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-soft)',
        padding: '1rem',
      }}
    >
      <SectionHeader title="Cashflow" subtitle="This month" />
      <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.4rem', fontSize: '0.88rem' }}>
        <p style={{ margin: 0 }}>Inflow: TWD {formatter.format(inflow)}</p>
        <p style={{ margin: 0 }}>Outflow: TWD {formatter.format(outflow)}</p>
        <p style={{ margin: 0, color: net >= 0 ? 'var(--brand)' : 'var(--danger)' }}>
          Net: TWD {formatter.format(net)}
        </p>
      </div>
    </section>
  );
}
