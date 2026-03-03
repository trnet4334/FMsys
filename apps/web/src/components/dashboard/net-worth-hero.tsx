import { MetricCard } from '../ui/metric-card';

type NetWorthHeroProps = {
  snapshot: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    deltaPct: number;
    currency: string;
  };
};

const formatter = new Intl.NumberFormat('en-US');

export function NetWorthHero({ snapshot }: NetWorthHeroProps) {
  const deltaLabel = `${snapshot.deltaPct >= 0 ? '+' : ''}${(snapshot.deltaPct * 100).toFixed(2)}% vs last period`;

  return (
    <section
      style={{
        display: 'grid',
        gap: '0.9rem',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      }}
    >
      <MetricCard label="Net Worth" value={`${snapshot.currency} ${formatter.format(snapshot.netWorth)}`} delta={deltaLabel} />
      <MetricCard label="Total Assets" value={`${snapshot.currency} ${formatter.format(snapshot.totalAssets)}`} />
      <MetricCard label="Total Liabilities" value={`${snapshot.currency} ${formatter.format(snapshot.totalLiabilities)}`} />
    </section>
  );
}
