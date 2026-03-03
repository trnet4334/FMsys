type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: string;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem' }}>
      <div>
        <h2 style={{ margin: 0, color: 'var(--ink-0)', fontSize: '1.05rem' }}>{title}</h2>
        {subtitle ? <p style={{ margin: '0.2rem 0 0', color: 'var(--ink-1)', fontSize: '0.85rem' }}>{subtitle}</p> : null}
      </div>
      {action ? (
        <button style={{ border: '1px solid var(--line)', borderRadius: '999px', padding: '0.35rem 0.65rem', background: '#fff' }}>
          {action}
        </button>
      ) : null}
    </header>
  );
}
