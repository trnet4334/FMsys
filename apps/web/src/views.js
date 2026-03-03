export function buildDashboardView({ summary, trend, assets, anomalies }) {
  return {
    cards: [
      { id: 'netWorth', label: 'Net Worth', value: summary.netWorth },
      { id: 'assets', label: 'Total Assets', value: summary.totalAssets ?? null },
      { id: 'liabilities', label: 'Total Liabilities', value: summary.totalLiabilities ?? null },
    ],
    trendChart: trend,
    assetSnapshotPanel: assets,
    anomalyIndicators: anomalies,
  };
}

export function buildFilterState({ currency = 'TWD', accountId = null, category = null }) {
  return {
    currency,
    accountId,
    category,
  };
}

export function buildCashflowView({ monthly, category, budgets }) {
  return {
    monthlyBar: monthly,
    categoryPie: category,
    budgetStatus: budgets,
  };
}

export function buildAllocationPerformanceView({
  allocation,
  performanceByMethod,
  selectedMethod = 'TWR',
}) {
  return {
    allocation,
    selectedMethod,
    performanceValue: performanceByMethod[selectedMethod],
  };
}
