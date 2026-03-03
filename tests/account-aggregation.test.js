import test from 'node:test';
import assert from 'node:assert/strict';

import { aggregateAccountBalances } from '../packages/shared/src/accountAggregation.js';

test('aggregation preserves account-level totals', () => {
  const result = aggregateAccountBalances({
    holdings: [
      { accountId: 'a1', marketValueBase: 1000 },
      { accountId: 'a2', marketValueBase: 500 },
    ],
    transfers: [],
  });

  assert.deepEqual(result.accounts, {
    a1: 1000,
    a2: 500,
  });
  assert.equal(result.netWorth, 1500);
});

test('internal transfers do not change aggregate net worth', () => {
  const result = aggregateAccountBalances({
    holdings: [
      { accountId: 'a1', marketValueBase: 1000 },
      { accountId: 'a2', marketValueBase: 500 },
    ],
    transfers: [{ fromAccountId: 'a1', toAccountId: 'a2', amountBase: 100 }],
  });

  assert.equal(result.netWorth, 1500);
});
