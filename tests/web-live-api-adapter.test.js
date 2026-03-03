import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchDashboardData } from '../apps/web/src/lib/dashboard-api.js';

test('fetchDashboardData maps live endpoints into dashboard view model', async () => {
  const responses = {
    '/api/net-worth/summary': { totalAssets: 1000, totalLiabilities: 200, netWorth: 800, deltaPct: 0.1 },
    '/api/trend': { series: [{ date: '2026-03', netWorth: 800 }] },
    '/api/allocation': { breakdown: [{ category: 'stock', pct: 0.5, amount: 400 }] },
    '/api/alerts': { items: [{ id: 'a1', message: 'alert', level: 'high' }] },
    '/api/cashflow/budget': { inflow: 200, outflow: 150, alerts: [] },
  };

  const fetchImpl = async (url) => {
    const path = new URL(url).pathname;
    return {
      ok: true,
      json: async () => responses[path],
    };
  };

  const data = await fetchDashboardData({ baseUrl: 'http://localhost:4020', fetchImpl });

  assert.equal(data.snapshot.netWorth, 800);
  assert.equal(data.trend.length, 1);
  assert.equal(data.allocation.length, 1);
  assert.equal(data.alerts.length, 1);
  assert.equal(data.cashflow.inflow, 200);
});
