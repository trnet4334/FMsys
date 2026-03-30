export type GoalItem = {
  id: string;
  label: string;
  current: number;
  goal: number;
  pct: number;
  status: 'On Track' | 'Needs Focus' | 'Completed';
  barClass: string;
  statusClass: string;
};

export const GOALS: GoalItem[] = [
  {
    id: 'summer-retreat',
    label: 'Summer Retreat 2024',
    current: 21250,
    goal: 25000,
    pct: 85,
    status: 'On Track',
    barClass: 'from-emerald-500 to-emerald-400',
    statusClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'portfolio-capital',
    label: 'New Portfolio Capital',
    current: 42000,
    goal: 100000,
    pct: 42,
    status: 'Needs Focus',
    barClass: 'from-brand to-blue-400',
    statusClass: 'text-warn bg-warn/10 border-warn/20',
  },
  {
    id: 'emergency-fund',
    label: 'Emergency Fund',
    current: 201000,
    goal: 300000,
    pct: 67,
    status: 'On Track',
    barClass: 'from-emerald-500 to-emerald-400',
    statusClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
];
