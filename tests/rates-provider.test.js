import test from 'node:test';
import assert from 'node:assert/strict';

import { ExchangeRatesProvider } from '../apps/worker/src/ratesProvider.js';

test('provider caches successful rate lookup by date', async () => {
  let calls = 0;
  const provider = new ExchangeRatesProvider({
    providers: [async () => {
      calls += 1;
      return { USD_TWD: 32.2 };
    }],
  });

  const first = await provider.getRates('2026-03-01');
  const second = await provider.getRates('2026-03-01');

  assert.equal(calls, 1);
  assert.deepEqual(first, second);
});

test('provider falls back when primary source fails', async () => {
  const provider = new ExchangeRatesProvider({
    providers: [
      async () => {
        throw new Error('primary down');
      },
      async () => ({ USD_TWD: 32.1 }),
    ],
  });

  const rates = await provider.getRates('2026-03-02');
  assert.equal(rates.USD_TWD, 32.1);
});
