'use client';

type ToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
};

export function Toggle({ enabled, onToggle, size = 'md' }: ToggleProps) {
  const track = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const thumb = size === 'sm' ? 'size-3.5' : 'size-4';
  const travel = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`${track} rounded-full relative flex items-center px-1 transition-colors shrink-0 ${
        enabled
          ? 'bg-brand shadow-[0_0_10px_rgba(0,102,255,0.3)]'
          : 'bg-bg-1 border border-line'
      }`}
    >
      <div
        className={`${thumb} bg-white rounded-full transition-transform duration-200 ${
          enabled ? travel : 'translate-x-0'
        }`}
      />
    </button>
  );
}
