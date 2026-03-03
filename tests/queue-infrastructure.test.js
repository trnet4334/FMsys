import test from 'node:test';
import assert from 'node:assert/strict';

import { InMemoryQueue } from '../apps/worker/src/queue.js';

test('queue retries failed jobs and eventually succeeds', async () => {
  let attempts = 0;
  const queue = new InMemoryQueue({ maxAttempts: 3 });

  await queue.enqueue('snapshot', async () => {
    attempts += 1;
    if (attempts < 3) throw new Error('temporary');
    return 'ok';
  });

  await queue.runPending();

  assert.equal(queue.stats.completed, 1);
  assert.equal(queue.stats.deadLetter, 0);
  assert.equal(attempts, 3);
});

test('queue moves job to dead-letter after max attempts', async () => {
  const queue = new InMemoryQueue({ maxAttempts: 2 });

  await queue.enqueue('report', async () => {
    throw new Error('permanent');
  });

  await queue.runPending();

  assert.equal(queue.stats.completed, 0);
  assert.equal(queue.stats.deadLetter, 1);
  assert.equal(queue.deadLetter.length, 1);
});
