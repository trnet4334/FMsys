import test from 'node:test';
import assert from 'node:assert/strict';

import { postSnapshotTrigger } from '../apps/api/src/snapshotRoutes.js';

test('POST /api/snapshot/trigger enqueues snapshot job', async () => {
  const enqueued = [];
  const response = await postSnapshotTrigger(
    {
      method: 'POST',
      body: {
        userId: 'user-1',
        snapshotType: 'manual',
        accountScope: ['acc-1'],
      },
    },
    {
      enqueue: async (jobName, payload) => {
        enqueued.push({ jobName, payload });
      },
    },
  );

  assert.equal(response.status, 202);
  assert.equal(enqueued.length, 1);
  assert.equal(enqueued[0].jobName, 'snapshot.trigger');
  assert.equal(enqueued[0].payload.userId, 'user-1');
});

test('POST /api/snapshot/trigger validates required fields', async () => {
  const response = await postSnapshotTrigger(
    { method: 'POST', body: { snapshotType: 'manual' } },
    { enqueue: async () => {} },
  );

  assert.equal(response.status, 400);
});
