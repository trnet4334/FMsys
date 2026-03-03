import test from 'node:test';
import assert from 'node:assert/strict';

import { seedDashboardData } from '../apps/web/src/lib/mock-data/seed.js';
import { adaptDashboardData } from '../apps/web/src/lib/mock-data/adapters.js';

test('mock adapter maps seed to dashboard contracts', () => {
  const seed = seedDashboardData();
  const result = adaptDashboardData(seed);

  assert.ok(result.snapshot.netWorth > 0);
  assert.ok(result.trend.length > 0);
  assert.ok(result.allocation.length > 0);
  assert.ok(result.alerts.length > 0);
  assert.ok(result.cashflow.inflow >= 0);
});
