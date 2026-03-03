async function getJson(fetchImpl, url) {
  const response = await fetchImpl(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`request failed: ${url}`);
  }
  return response.json();
}

export async function fetchDashboardData({
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4020',
  fetchImpl = fetch,
} = {}) {
  const [summary, trend, allocation, alerts, cashflow] = await Promise.all([
    getJson(fetchImpl, `${baseUrl}/api/net-worth/summary?userId=demo-user`),
    getJson(fetchImpl, `${baseUrl}/api/trend?userId=demo-user`),
    getJson(fetchImpl, `${baseUrl}/api/allocation?snapshotId=snap-001`),
    getJson(fetchImpl, `${baseUrl}/api/alerts`),
    getJson(fetchImpl, `${baseUrl}/api/cashflow/budget?userId=demo-user&month=2026-03`),
  ]);

  return {
    snapshot: {
      totalAssets: summary.totalAssets,
      totalLiabilities: summary.totalLiabilities,
      netWorth: summary.netWorth,
      deltaPct: summary.deltaPct ?? 0,
      currency: 'TWD',
    },
    trend: trend.series ?? [],
    allocation: allocation.breakdown ?? [],
    alerts: alerts.items ?? [],
    cashflow: {
      inflow: cashflow.inflow ?? 0,
      outflow: cashflow.outflow ?? 0,
    },
  };
}
