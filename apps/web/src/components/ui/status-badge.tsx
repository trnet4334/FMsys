type StatusBadgeProps = {
  level: 'high' | 'medium' | 'low';
};

const palette = {
  high: { bg: '#fdebec', text: 'var(--danger)' },
  medium: { bg: '#fff3e5', text: 'var(--warn)' },
  low: { bg: 'var(--brand-weak)', text: 'var(--brand)' },
};

export function StatusBadge({ level }: StatusBadgeProps) {
  const style = palette[level];
  return (
    <span
      style={{
        background: style.bg,
        color: style.text,
        borderRadius: '999px',
        padding: '0.18rem 0.5rem',
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {level}
    </span>
  );
}
