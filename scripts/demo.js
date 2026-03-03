import { postSnapshotTrigger } from '../apps/api/src/snapshotRoutes.js';
import { processSnapshotJob } from '../apps/worker/src/snapshotProcessor.js';
import { getNetWorthSummary, getCashflowBudget } from '../apps/api/src/analyticsRoutes.js';
import { toDisplayCurrency } from '../packages/shared/src/displayCurrency.js';
import { buildDashboardView } from '../apps/web/src/views.js';
import { buildTabularExport } from '../apps/worker/src/reporting.js';

const queue = [];
const snapshots = [];
const diffs = [];

const triggerRes = await postSnapshotTrigger(
  {
    method: 'POST',
    body: {
      userId: 'demo-user',
      snapshotType: 'manual',
      accountScope: ['broker-1'],
    },
  },
  {
    enqueue: async (jobName, payload) => {
      queue.push({ jobName, payload });
    },
  },
);

console.log('1) trigger response:', triggerRes);
console.log('2) queued jobs:', queue.length);

const job = queue[0];
const processRes = await processSnapshotJob(
  {
    ...job.payload,
    snapshotDate: '2026-03-03',
  },
  {
    transactionClient: {
      getPositionsSummary: async () => ({
        holdings: [
          { assetCategory: 'stock', assetName: '2330.TW', quantity: 10, currentPrice: 980, currency: 'TWD', accountId: 'broker-1' },
          { assetCategory: 'crypto', assetName: 'BTC', quantity: 0.02, currentPrice: 62000, currency: 'USD', accountId: 'exchange-1' },
        ],
      }),
    },
    ratesProvider: {
      getRates: async () => ({ USD_TWD: 32 }),
    },
    snapshotRepo: {
      findPreviousSnapshot: async () => ({ id: 'prev-001', netWorth: 40000 }),
      createSnapshot: async (payload) => {
        const created = { id: `snap-${String(snapshots.length + 1).padStart(3, '0')}`, ...payload, currency: 'TWD' };
        snapshots.push(created);
        return created;
      },
      createDiff: async (payload) => {
        diffs.push(payload);
        return payload;
      },
    },
  },
);

console.log('3) process result:', processRes);
console.log('4) snapshots stored:', snapshots.length, 'diffs stored:', diffs.length);

const latest = snapshots[snapshots.length - 1];
const summaryRes = await getNetWorthSummary(
  { userId: 'demo-user' },
  {
    snapshots: {
      getLatestSummary: async () => ({
        totalAssets: latest.totalAssets,
        totalLiabilities: latest.totalLiabilities,
        netWorth: latest.netWorth,
        prevNetWorth: 40000,
      }),
    },
  },
);

console.log('5) net worth summary:', summaryRes.body);

const cashflowRes = await getCashflowBudget(
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

console.log('6) cashflow alerts:', cashflowRes.body.alerts);

const usdSnapshot = toDisplayCurrency(latest, 'USD');
const dashboard = buildDashboardView({
  summary: usdSnapshot,
  trend: [{ date: '2026-03-03', netWorth: usdSnapshot.netWorth }],
  assets: latest.holdings.map((h) => ({ category: h.assetCategory, total: h.marketValueBase })),
  anomalies: diffs[0]?.anomalies ?? [],
});

console.log('7) dashboard cards (USD):', dashboard.cards);

const exportPack = buildTabularExport([
  { item: 'totalAssets', amount: summaryRes.body.totalAssets },
  { item: 'totalLiabilities', amount: -summaryRes.body.totalLiabilities },
]);

console.log('8) export totals:', { csv: exportPack.csv.total, excel: exportPack.excel.total });
console.log('9) demo done.');
