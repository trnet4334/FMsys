import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getNetWorthSummary,
  getTrendSeries,
  getAllocationAnalysis,
  getPerformance,
  getCashflowBudget,
} from '../apps/api/src/analyticsRoutes.js';

test('net worth summary API returns totals and period delta', async () => {
  const result = await getNetWorthSummary(
    { userId: 'u1' },
    {
      snapshots: {
        getLatestSummary: async () => ({ totalAssets: 1200, totalLiabilities: 200, netWorth: 1000, prevNetWorth: 900 }),
      },
    },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.deltaAmount, 100);
});

test('trend API returns series for selected period range', async () => {
  const result = await getTrendSeries(
    { userId: 'u1', startDate: '2026-01-01', endDate: '2026-01-31' },
    {
      snapshots: {
        getTrend: async () => [{ snapshotDate: '2026-01-01', netWorth: 1000 }],
      },
    },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.series.length, 1);
});

test('allocation API returns category/account/currency distribution', async () => {
  const result = await getAllocationAnalysis(
    { snapshotId: 's1' },
    {
      snapshots: {
        getAllocation: async () => [{ accountId: 'a1', assetCategory: 'stock', currency: 'USD', total: 1000 }],
      },
    },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.breakdown.length, 1);
});

test('performance API supports TWR and MWR method selection', async () => {
  const result = await getPerformance(
    { method: 'MWR', userId: 'u1' },
    {
      performance: {
        calculate: async ({ method }) => ({ method, value: 0.12 }),
      },
    },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.method, 'MWR');
});

test('cashflow budget API returns overspend alerts', async () => {
  const result = await getCashflowBudget(
    { userId: 'u1', month: '2026-01' },
    {
      cashflow: {
        getMonthlySummary: async () => ({
          inflow: 50000,
          outflow: 42000,
          budgets: [{ category: 'living', limit: 20000, spent: 24000 }],
        }),
      },
    },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.alerts.length, 1);
});
