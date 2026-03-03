function pushFilter(clauses, values, sql, value) {
  values.push(value);
  clauses.push(`${sql} $${values.length}`);
}

export function buildLatestSnapshotsQuery({ userId, accountId, category, currency, limit = 25 }) {
  const values = [userId];
  const clauses = ['s.user_id = $1'];

  if (accountId) pushFilter(clauses, values, 'h.account_id =', accountId);
  if (category) pushFilter(clauses, values, 'h.asset_category =', category);
  if (currency) pushFilter(clauses, values, 'h.currency =', currency);

  values.push(limit);

  return {
    text: `
      SELECT
        s.id,
        s.snapshot_date,
        s.snapshot_type,
        s.net_worth,
        s.total_assets,
        s.total_liabilities
      FROM snapshots s
      JOIN snapshot_holdings h ON h.snapshot_id = s.id
      WHERE ${clauses.join(' AND ')}
      GROUP BY s.id
      ORDER BY s.snapshot_date DESC
      LIMIT $${values.length}
    `,
    values,
  };
}

export function buildSnapshotTrendQuery({ userId, startDate, endDate }) {
  const values = [userId, startDate, endDate];
  return {
    text: `
      SELECT snapshot_date, net_worth, total_assets, total_liabilities
      FROM snapshots
      WHERE user_id = $1
        AND snapshot_date BETWEEN $2 AND $3
      ORDER BY snapshot_date ASC
    `,
    values,
  };
}

export function buildSnapshotAllocationQuery({ snapshotId }) {
  return {
    text: `
      SELECT
        h.account_id,
        h.asset_category,
        h.currency,
        SUM(h.market_value_base) AS total_value_base,
        SUM(h.market_value_local) AS total_value_local
      FROM snapshot_holdings h
      WHERE h.snapshot_id = $1
      GROUP BY h.account_id, h.asset_category, h.currency
      ORDER BY total_value_base DESC
    `,
    values: [snapshotId],
  };
}
