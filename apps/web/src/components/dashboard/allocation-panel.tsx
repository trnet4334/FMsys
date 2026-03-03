import { SectionHeader } from '../ui/section-header';

type AllocationSlice = {
  category: string;
  pct: number;
  amount: number;
};

type AllocationPanelProps = {
  slices: AllocationSlice[];
};

export function AllocationPanel({ slices }: AllocationPanelProps) {
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
      <SectionHeader title="Allocation" subtitle="Category split" />
      <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.6rem' }}>
        {slices.map((slice) => (
          <div key={slice.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span>{slice.category}</span>
              <span>{(slice.pct * 100).toFixed(1)}%</span>
            </div>
            <div style={{ marginTop: '0.3rem', height: 8, background: '#e6efee', borderRadius: 999 }}>
              <div
                style={{
                  width: `${slice.pct * 100}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #0d8b82, #64a5f2)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
