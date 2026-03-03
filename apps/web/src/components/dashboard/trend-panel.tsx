import { SectionHeader } from '../ui/section-header';

type TrendPoint = { date: string; netWorth: number };

type TrendPanelProps = {
  points: TrendPoint[];
};

function buildPath(points: TrendPoint[], width = 620, height = 220) {
  const min = Math.min(...points.map((p) => p.netWorth));
  const max = Math.max(...points.map((p) => p.netWorth));
  const span = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.netWorth - min) / span) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function TrendPanel({ points }: TrendPanelProps) {
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
      <SectionHeader title="Net Worth Trend" subtitle="Weekly / monthly signal" action="Range" />
      <svg width="100%" viewBox="0 0 620 220" style={{ marginTop: '0.8rem' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d8b82" />
            <stop offset="100%" stopColor="#5fa8e8" />
          </linearGradient>
        </defs>
        <path d={buildPath(points)} stroke="url(#lineGradient)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </section>
  );
}
