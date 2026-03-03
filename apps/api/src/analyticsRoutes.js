export async function getNetWorthSummary(query, deps) {
  const summary = await deps.snapshots.getLatestSummary(query.userId);
  const deltaAmount = Number(summary.netWorth) - Number(summary.prevNetWorth ?? 0);
  const deltaPct = Number(summary.prevNetWorth ?? 0) === 0 ? null : deltaAmount / Number(summary.prevNetWorth);

  return {
    status: 200,
    body: {
      totalAssets: summary.totalAssets,
      totalLiabilities: summary.totalLiabilities,
      netWorth: summary.netWorth,
      deltaAmount,
      deltaPct,
    },
  };
}

export async function getTrendSeries(query, deps) {
  const series = await deps.snapshots.getTrend(query);
  return { status: 200, body: { series } };
}

export async function getAllocationAnalysis(query, deps) {
  const breakdown = await deps.snapshots.getAllocation(query.snapshotId);
  return { status: 200, body: { breakdown } };
}

export async function getPerformance(query, deps) {
  const method = query.method === 'MWR' ? 'MWR' : 'TWR';
  const performance = await deps.performance.calculate({ ...query, method });
  return { status: 200, body: performance };
}

export async function getCashflowBudget(query, deps) {
  const summary = await deps.cashflow.getMonthlySummary(query);
  const alerts = (summary.budgets ?? [])
    .filter((item) => Number(item.spent) > Number(item.limit))
    .map((item) => ({
      type: 'budget-overspend',
      category: item.category,
      limit: item.limit,
      spent: item.spent,
    }));

  return {
    status: 200,
    body: {
      ...summary,
      alerts,
    },
  };
}
