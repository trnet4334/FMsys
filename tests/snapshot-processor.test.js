import test from 'node:test';
import assert from 'node:assert/strict';

import { processSnapshotJob } from '../apps/worker/src/snapshotProcessor.js';

test('snapshot processor persists snapshot and diff from provider data', async () => {
  const writes = { snapshot: null, diff: null };

  const result = await processSnapshotJob(
    {
      userId: 'u1',
      snapshotType: 'manual',
      snapshotDate: '2026-03-01',
    },
    {
      transactionClient: {
        getPositionsSummary: async () => ({
          holdings: [{ assetCategory: 'stock', quantity: 4, currentPrice: 10, currency: 'USD' }],
        }),
      },
      ratesProvider: {
        getRates: async () => ({ USD_TWD: 30 }),
      },
      snapshotRepo: {
        findPreviousSnapshot: async () => ({ id: 'prev-1', netWorth: 1000 }),
        createSnapshot: async (payload) => {
          writes.snapshot = payload;
          return { id: 'snap-1', ...payload };
        },
        createDiff: async (payload) => {
          writes.diff = payload;
          return payload;
        },
      },
    },
  );

  assert.equal(result.snapshotId, 'snap-1');
  assert.equal(writes.snapshot.netWorth, 1200);
  assert.equal(writes.snapshot.holdings[0].marketValueLocal, 40);
  assert.equal(writes.snapshot.holdings[0].marketValueBase, 1200);
  assert.equal(writes.diff.netWorthChange, 200);
  assert.equal(writes.diff.prevSnapshotId, 'prev-1');
});
