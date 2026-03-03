import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { postSnapshotReadyWebhook, InMemoryIdempotencyStore } from '../apps/api/src/webhookRoutes.js';

function sign(body, secret) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
}

test('webhook accepts valid signed payload and stores idempotency key', async () => {
  const secret = 'top-secret';
  const body = { eventId: 'evt-1', snapshotId: 'snap-1' };
  const idempotency = new InMemoryIdempotencyStore();

  const result = await postSnapshotReadyWebhook(
    { method: 'POST', headers: { 'x-signature': sign(body, secret) }, body },
    { webhookSecret: secret, idempotency },
  );

  assert.equal(result.status, 202);
  assert.equal(idempotency.has('evt-1'), true);
});

test('webhook rejects duplicated event id', async () => {
  const secret = 'top-secret';
  const body = { eventId: 'evt-2', snapshotId: 'snap-1' };
  const idempotency = new InMemoryIdempotencyStore();

  await postSnapshotReadyWebhook(
    { method: 'POST', headers: { 'x-signature': sign(body, secret) }, body },
    { webhookSecret: secret, idempotency },
  );

  const second = await postSnapshotReadyWebhook(
    { method: 'POST', headers: { 'x-signature': sign(body, secret) }, body },
    { webhookSecret: secret, idempotency },
  );

  assert.equal(second.status, 409);
});
