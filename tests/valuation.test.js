import test from 'node:test';
import assert from 'node:assert/strict';

import { valuateHoldings } from '../packages/shared/src/valuation.js';

test('valuation computes local and base market values using snapshot rates', () => {
  const rates = { USD_TWD: 32 };
  const holdings = [
    {
      assetCategory: 'stock',
      quantity: 2,
      currentPrice: 100,
      currency: 'USD',
    },
  ];

  const valued = valuateHoldings({ holdings, rates, baseCurrency: 'TWD' });

  assert.equal(valued[0].marketValueLocal, 200);
  assert.equal(valued[0].marketValueBase, 6400);
});
