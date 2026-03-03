import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDashboardView,
  buildFilterState,
  buildCashflowView,
  buildAllocationPerformanceView,
} from '../apps/web/src/views.js';

test('dashboard view includes summary, trend, assets, and anomaly widgets', () => {
  const view = buildDashboardView({
    summary: { netWorth: 1000 },
    trend: [{ date: '2026-03-01', netWorth: 1000 }],
    assets: [{ category: 'stock', total: 800 }],
    anomalies: [{ severity: 'high' }],
  });

  assert.equal(view.cards.length > 0, true);
  assert.equal(view.trendChart.length, 1);
  assert.equal(view.anomalyIndicators.length, 1);
});

test('filter state supports currency and account/category filters', () => {
  const state = buildFilterState({
    currency: 'USD',
    accountId: 'a1',
    category: 'stock',
  });

  assert.equal(state.currency, 'USD');
  assert.equal(state.accountId, 'a1');
  assert.equal(state.category, 'stock');
});

test('cashflow view exposes monthly bar and category pie datasets', () => {
  const view = buildCashflowView({
    monthly: [{ month: '2026-01', inflow: 2000, outflow: 1500 }],
    category: [{ category: 'living', amount: 500 }],
    budgets: [{ category: 'living', status: 'over' }],
  });

  assert.equal(view.monthlyBar.length, 1);
  assert.equal(view.categoryPie.length, 1);
  assert.equal(view.budgetStatus.length, 1);
});

test('allocation/performance view supports TWR/MWR method toggle', () => {
  const view = buildAllocationPerformanceView({
    allocation: [{ category: 'stock', pct: 0.7 }],
    performanceByMethod: { TWR: 0.1, MWR: 0.12 },
    selectedMethod: 'MWR',
  });

  assert.equal(view.selectedMethod, 'MWR');
  assert.equal(view.performanceValue, 0.12);
});
