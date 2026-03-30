import http from 'node:http';

import {
  getAllocationAnalysis,
  getCashflowBudget,
  getNetWorthSummary,
  getTrendSeries,
} from './analyticsRoutes.js';
import { createAuthService } from './authService.js';
import { createAuthRoutes, withAuthRequired } from './authRoutes.js';
import { createPool } from './db.js';
import { loadAuthConfig } from './authConfig.js';
import { createEmailService } from './emailService.js';

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
  const config = loadAuthConfig();
  const pool = config.database.url ? createPool(config.database.url) : null;
  const emailSvc = pool ? createEmailService(config.resend) : null;
  const authService = pool
    ? createAuthService({ config, pool, emailService: emailSvc })
    : createAuthService();
  const allowedOrigins = config.app.allowedOrigins;
  const authRoutes = createAuthRoutes(authService, allowedOrigins);

  // Periodic cleanup: remove expired sessions and tokens every 10 minutes
  let cleanupInterval = null;
  if (authService.sessionRepo) {
    cleanupInterval = setInterval(async () => {
      try {
        const deleted = await authService.sessionRepo.deleteExpired();
        if (deleted > 0) {
          // eslint-disable-next-line no-console
          console.log(`[cleanup] Removed ${deleted} expired sessions`);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[cleanup] Session cleanup failed:', err.message);
      }
      if (authService.tokenRepo) {
        try {
          await authService.tokenRepo.deleteExpired();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[cleanup] Token cleanup failed:', err.message);
        }
      }
    }, 10 * 60 * 1000);
  }

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

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const origin = req.headers.origin;
    const corsOrigins = new Set(allowedOrigins);

    if (origin && corsOrigins.has(origin)) {
      res.setHeader('access-control-allow-origin', origin);
      res.setHeader('vary', 'Origin');
    } else {
      res.setHeader('access-control-allow-origin', allowedOrigins[0] ?? 'http://127.0.0.1:4010');
    }
    res.setHeader('access-control-allow-methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type,authorization,cookie');

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

  return { server, authService, cleanupInterval };
}

export { createServer };

if (import.meta.url === `file://${process.argv[1]}`) {
  const portArg = process.argv.find((arg) => arg.startsWith('--port='));
  const port = portArg ? Number(portArg.split('=')[1]) : 4020;

  const { server, cleanupInterval } = createServer();
  server.listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`api server listening on http://127.0.0.1:${port}`);
  });
  process.on('SIGTERM', () => {
    if (cleanupInterval) clearInterval(cleanupInterval);
    server.close(() => process.exit(0));
  });
}
