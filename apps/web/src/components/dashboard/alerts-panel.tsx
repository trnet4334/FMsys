import { SectionHeader } from '../ui/section-header';
import { StatusBadge } from '../ui/status-badge';

type AlertItem = {
  id: string;
  message: string;
  level: 'high' | 'medium' | 'low';
};

type AlertsPanelProps = {
  alerts: AlertItem[];
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
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
      <SectionHeader title="Anomalies" subtitle="Risk and threshold signals" />
      <ul style={{ listStyle: 'none', margin: '0.8rem 0 0', padding: 0, display: 'grid', gap: '0.55rem' }}>
        {alerts.map((alert) => (
          <li key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem' }}>
            <span style={{ color: 'var(--ink-0)', fontSize: '0.88rem' }}>{alert.message}</span>
            <StatusBadge level={alert.level} />
          </li>
        ))}
      </ul>
    </section>
  );
}
