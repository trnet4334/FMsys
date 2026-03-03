export function seedDashboardData() {
  return {
    summary: {
      totalAssets: 5162000,
      totalLiabilities: 860000,
      netWorth: 4302000,
      deltaPct: 0.034,
      currency: 'TWD',
    },
    trend: [
      { date: '2025-12', netWorth: 3890000 },
      { date: '2026-01', netWorth: 4015000 },
      { date: '2026-02', netWorth: 4160000 },
      { date: '2026-03', netWorth: 4302000 },
    ],
    allocation: [
      { category: 'Stock', pct: 0.48, amount: 2064960 },
      { category: 'Cash', pct: 0.2, amount: 860400 },
      { category: 'Crypto', pct: 0.17, amount: 731340 },
      { category: 'Forex', pct: 0.15, amount: 645300 },
    ],
    alerts: [
      { id: 'a1', message: 'BTC position increased 22% this week', level: 'high' },
      { id: 'a2', message: 'Cash reserve close to floor threshold', level: 'medium' },
    ],
    cashflow: {
      inflow: 220000,
      outflow: 182000,
    },
  };
}
