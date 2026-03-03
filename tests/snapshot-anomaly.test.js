import test from 'node:test';
import assert from 'node:assert/strict';

import { processSnapshotJob } from '../apps/worker/src/snapshotProcessor.js';

test('snapshot processor persists high-severity anomaly for large net worth change', async () => {
  let diffWrite = null;

  await processSnapshotJob(
    {
      userId: 'u1',
      snapshotType: 'weekly',
      snapshotDate: '2026-03-02',
    },
    {
      transactionClient: {
        getPositionsSummary: async () => ({ holdings: [{ assetCategory: 'stock', marketValueBase: 1500 }] }),
      },
      ratesProvider: {
        getRates: async () => ({ USD_TWD: 32.1 }),
      },
      snapshotRepo: {
        findPreviousSnapshot: async () => ({ id: 'prev-2', netWorth: 1000 }),
        createSnapshot: async (payload) => ({ id: 'snap-2', ...payload }),
        createDiff: async (payload) => {
          diffWrite = payload;
          return payload;
        },
      },
    },
  );

  assert.ok(Array.isArray(diffWrite.anomalies));
  assert.equal(diffWrite.anomalies.length > 0, true);
  assert.equal(diffWrite.anomalies[0].severity, 'high');
});
