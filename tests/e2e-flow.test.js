import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardView } from '../apps/web/src/views.js';
import { toDisplayCurrency } from '../packages/shared/src/displayCurrency.js';
import { buildTabularExport } from '../apps/worker/src/reporting.js';

test('e2e: dashboard load + currency switch + export keeps coherent totals', () => {
  const snapshot = {
    totalAssets: 3200,
    totalLiabilities: 200,
    netWorth: 3000,
    currency: 'TWD',
    exchangeRates: { USD_TWD: 32 },
  };

  const usdView = toDisplayCurrency(snapshot, 'USD');
  const dashboard = buildDashboardView({
    summary: usdView,
    trend: [{ date: '2026-03-01', netWorth: usdView.netWorth }],
    assets: [{ category: 'stock', total: usdView.totalAssets }],
    anomalies: [],
  });

  const exportData = buildTabularExport([
    { item: 'assets', amount: usdView.totalAssets },
    { item: 'liabilities', amount: -usdView.totalLiabilities },
  ]);

  assert.equal(dashboard.cards.length > 0, true);
  assert.equal(Number(usdView.netWorth.toFixed(2)), 93.75);
  assert.equal(exportData.csv.total, exportData.excel.total);
});
