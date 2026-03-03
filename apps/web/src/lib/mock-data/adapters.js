export function adaptDashboardData(seed) {
  return {
    snapshot: seed.summary,
    trend: seed.trend,
    allocation: seed.allocation,
    alerts: seed.alerts,
    cashflow: seed.cashflow,
  };
}
