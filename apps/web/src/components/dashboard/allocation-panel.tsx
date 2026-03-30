import { fmt } from '../../lib/format';

type AllocationSlice = {
  category: string;
  pct: number;
  amount: number;
};

type AllocationPanelProps = {
  slices: AllocationSlice[];
};

/** Cycle through distinct brand-adjacent hues per slice */
const BAR_COLORS = [
  'var(--brand)',
  'var(--info)',
  'var(--success)',
  'var(--warn)',
  'var(--danger)',
];

export function AllocationPanel({ slices }: AllocationPanelProps) {
  return (
    <section className="rounded-xl p-6 bg-card border border-line shadow-soft">
      <div className="mb-5">
        <h3 className="text-ink-0 text-lg font-bold">Allocation</h3>
        <p className="text-ink-1 text-sm">Category breakdown</p>
      </div>

      <div className="flex flex-col gap-5">
        {slices.map((slice, i) => (
          <div key={slice.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ink-0 text-sm font-medium">{slice.category}</span>
              <div className="flex items-center gap-3">
                <span className="text-ink-1 text-xs">{fmt.format(slice.amount)}</span>
                <span className="text-ink-0 text-sm font-bold w-10 text-right">
                  {(slice.pct * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--bg-1)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${slice.pct * 100}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
