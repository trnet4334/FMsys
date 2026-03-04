import http from 'node:http';

import {
  getAllocationAnalysis,
  getCashflowBudget,
  getNetWorthSummary,
  getTrendSeries,
} from './analyticsRoutes.js';
import { createAuthRoutes, withAuthRequired } from './authRoutes.js';

const seed = {
  summary: { totalAssets: 5162000, totalLiabilities: 860000, netWorth: 4302000, prevNetWorth: 4160000 },
  trend: [
    { date: '2025-12', netWorth: 3890000 },
    { date: '2026-01', netWorth: 4015000 },
    { date: '2026-02', netWorth: 4160000 },
    { date: '2026-03', netWorth: 4302000 },
  ],
  allocation: [
    { category: 'Stock', pct: 0.48, amount: 2064960 },
    { category: 'Cash', pct: 0.2, amount: 860400 },
    { category: 'Crypto', pct: 0.17, amount: 731340 },
    { category: 'Forex', pct: 0.15, amount: 645300 },
  ],
  alerts: [
    { id: 'a1', message: 'BTC position increased 22% this week', level: 'high' },
    { id: 'a2', message: 'Cash reserve close to floor threshold', level: 'medium' },
  ],
  cashflow: {
    inflow: 220000,
    outflow: 182000,
    budgets: [
      { category: 'living', limit: 25000, spent: 28000 },
      { category: 'transport', limit: 9000, spent: 7000 },
    ],
  },
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function createServer() {
  const authRoutes = createAuthRoutes();

  const handleProtected = withAuthRequired(authRoutes.service, async (req, res, url) => {
    if (req.method === 'GET' && url.pathname === '/api/net-worth/summary') {
      const result = await getNetWorthSummary(
        { userId: url.searchParams.get('userId') ?? 'demo-user' },
        { snapshots: { getLatestSummary: async () => seed.summary } },
      );
      return sendJson(res, result.status, result.body);
    }

    if (req.method === 'GET' && url.pathname === '/api/trend') {
      const result = await getTrendSeries(
        { userId: url.searchParams.get('userId') ?? 'demo-user' },
        { snapshots: { getTrend: async () => seed.trend } },
      );
      return sendJson(res, result.status, result.body);
    }

    if (req.method === 'GET' && url.pathname === '/api/allocation') {
      const result = await getAllocationAnalysis(
        { snapshotId: url.searchParams.get('snapshotId') ?? 'snap-001' },
        { snapshots: { getAllocation: async () => seed.allocation } },
      );
      return sendJson(res, result.status, result.body);
    }

    if (req.method === 'GET' && url.pathname === '/api/alerts') {
      return sendJson(res, 200, { items: seed.alerts });
    }

    if (req.method === 'GET' && url.pathname === '/api/cashflow/budget') {
      const result = await getCashflowBudget(
        { userId: url.searchParams.get('userId') ?? 'demo-user', month: url.searchParams.get('month') ?? '2026-03' },
        { cashflow: { getMonthlySummary: async () => seed.cashflow } },
      );
      return sendJson(res, result.status, result.body);
    }

    return false;
  });

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    res.setHeader('access-control-allow-origin', 'http://127.0.0.1:4010');
    res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type,authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true });
    }

    const authHandled = await authRoutes.handle(req, res, url);
    if (authHandled !== false) {
      return;
    }

    const protectedHandled = await handleProtected(req, res, url);
    if (protectedHandled !== false) {
      return;
    }

    return sendJson(res, 404, { error: 'not found' });
  });
}

export { createServer };

if (import.meta.url === `file://${process.argv[1]}`) {
  const portArg = process.argv.find((arg) => arg.startsWith('--port='));
  const port = portArg ? Number(portArg.split('=')[1]) : 4020;

  createServer().listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`api server listening on http://127.0.0.1:${port}`);
  });
}
