import test from 'node:test';
import assert from 'node:assert/strict';

import { TransactionApiClient } from '../apps/api/src/transactionApiClient.js';

test('client fetches positions summary endpoint', async () => {
  const calls = [];
  const client = new TransactionApiClient({
    baseUrl: 'https://tx.example',
    apiKey: 'k',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        json: async () => ({ data: [] }),
      };
    },
  });

  await client.getPositionsSummary('user-1');

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/api\/positions\/summary\?userId=user-1/);
});

test('client fetches realized pnl and cashflow summary endpoints', async () => {
  const urls = [];
  const client = new TransactionApiClient({
    baseUrl: 'https://tx.example',
    apiKey: 'k',
    fetchImpl: async (url) => {
      urls.push(url);
      return {
        ok: true,
        json: async () => ({ ok: true }),
      };
    },
  });

  await client.getRealizedPnl({ userId: 'user-1', from: '2026-01-01', to: '2026-01-31' });
  await client.getCashflowSummary({ userId: 'user-1', month: '2026-01' });

  assert.equal(urls.length, 2);
  assert.match(urls[0], /\/api\/pnl\/realized/);
  assert.match(urls[1], /\/api\/cashflow\/summary/);
});
