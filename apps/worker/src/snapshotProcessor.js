import { valuateHoldings } from '../../../packages/shared/src/valuation.js';

function computeNetWorth(holdings) {
  return holdings.reduce((sum, item) => sum + Number(item.marketValueBase ?? 0), 0);
}

function computeDiff(currentNetWorth, previousNetWorth = 0) {
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePct = previousNetWorth === 0 ? null : netWorthChange / previousNetWorth;
  return { netWorthChange, netWorthChangePct };
}

function detectAnomalies({ netWorthChangePct }) {
  const anomalies = [];

  if (netWorthChangePct !== null && Math.abs(netWorthChangePct) >= 0.1) {
    anomalies.push({
      type: 'net-worth-change',
      severity: 'high',
      threshold: 0.1,
      observed: netWorthChangePct,
    });
  }

  return anomalies;
}

export async function processSnapshotJob(job, deps) {
  const { userId, snapshotType, snapshotDate } = job;

  const [positions, rates, previous] = await Promise.all([
    deps.transactionClient.getPositionsSummary(userId),
    deps.ratesProvider.getRates(snapshotDate),
    deps.snapshotRepo.findPreviousSnapshot(userId, snapshotType),
  ]);

  const holdings = valuateHoldings({
    holdings: positions.holdings ?? [],
    rates,
    baseCurrency: 'TWD',
  });
  const netWorth = computeNetWorth(holdings);

  const snapshot = await deps.snapshotRepo.createSnapshot({
    userId,
    snapshotType,
    snapshotDate,
    holdings,
    totalAssets: netWorth,
    totalLiabilities: 0,
    netWorth,
    exchangeRates: rates,
    metadata: { source: 'snapshot-processor' },
  });

  const diff = computeDiff(netWorth, previous?.netWorth ?? 0);
  const anomalies = detectAnomalies(diff);

  await deps.snapshotRepo.createDiff({
    snapshotId: snapshot.id,
    prevSnapshotId: previous?.id ?? null,
    netWorthChange: diff.netWorthChange,
    netWorthChangePct: diff.netWorthChangePct,
    categoryChanges: {},
    newHoldings: [],
    removedHoldings: [],
    anomalies,
  });

  return {
    snapshotId: snapshot.id,
  };
}
