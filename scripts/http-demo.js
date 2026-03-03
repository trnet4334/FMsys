import http from 'node:http';

import { postSnapshotTrigger } from '../apps/api/src/snapshotRoutes.js';
import { getNetWorthSummary, getCashflowBudget } from '../apps/api/src/analyticsRoutes.js';

const queue = [];

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/snapshot/trigger') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = raw ? JSON.parse(raw) : {};

      const result = await postSnapshotTrigger(
        { method: 'POST', body },
        {
          enqueue: async (jobName, payload) => queue.push({ jobName, payload }),
        },
      );
      return sendJson(res, result.status, result.body);
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/net-worth/summary')) {
      const result = await getNetWorthSummary(
        { userId: 'demo-user' },
        {
          snapshots: {
            getLatestSummary: async () => ({
              totalAssets: 49480,
              totalLiabilities: 0,
              netWorth: 49480,
              prevNetWorth: 40000,
            }),
          },
        },
      );
      return sendJson(res, result.status, result.body);
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/cashflow/budget')) {
      const result = await getCashflowBudget(
        { userId: 'demo-user', month: '2026-03' },
        {
          cashflow: {
            getMonthlySummary: async () => ({
              inflow: 90000,
              outflow: 52000,
              budgets: [
                { category: 'living', limit: 25000, spent: 28000 },
                { category: 'transport', limit: 8000, spent: 6000 },
              ],
            }),
          },
        },
      );
      return sendJson(res, result.status, result.body);
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const triggerRes = await fetch(`${base}/api/snapshot/trigger`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    userId: 'demo-user',
    snapshotType: 'manual',
    accountScope: ['broker-1'],
  }),
});
const triggerJson = await triggerRes.json();

const summaryRes = await fetch(`${base}/api/net-worth/summary?userId=demo-user`);
const summaryJson = await summaryRes.json();

const cashflowRes = await fetch(`${base}/api/cashflow/budget?userId=demo-user&month=2026-03`);
const cashflowJson = await cashflowRes.json();

console.log('HTTP Demo Results');
console.log('1) POST /api/snapshot/trigger ->', triggerRes.status, triggerJson);
console.log('2) queued jobs ->', queue.length);
console.log('3) GET /api/net-worth/summary ->', summaryRes.status, summaryJson);
console.log('4) GET /api/cashflow/budget ->', cashflowRes.status, {
  alerts: cashflowJson.alerts,
  inflow: cashflowJson.inflow,
  outflow: cashflowJson.outflow,
});

server.close();
