import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-0':   'var(--bg-0)',
        'bg-1':   'var(--bg-1)',
        'card':   'var(--card)',
        'line':   'var(--line)',
        'ink-0':        'var(--ink-0)',
        'ink-1':        'var(--ink-1)',
        'ink-disabled': 'var(--ink-disabled)',
        'brand':      'var(--brand)',
        'brand-weak': 'var(--brand-weak)',
        'success': 'var(--success)',
        'danger':  'var(--danger)',
        'info':    'var(--info)',
        'warn':    'var(--warn)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
};

export default config;
