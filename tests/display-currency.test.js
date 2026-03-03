import test from 'node:test';
import assert from 'node:assert/strict';

import { toDisplayCurrency } from '../packages/shared/src/displayCurrency.js';

test('display currency conversion returns converted view without mutating snapshot', () => {
  const snapshot = {
    netWorth: 3200,
    totalAssets: 3200,
    exchangeRates: { USD_TWD: 32 },
    currency: 'TWD',
  };

  const converted = toDisplayCurrency(snapshot, 'USD');

  assert.equal(converted.currency, 'USD');
  assert.equal(converted.netWorth, 100);
  assert.equal(snapshot.currency, 'TWD');
  assert.equal(snapshot.netWorth, 3200);
});
