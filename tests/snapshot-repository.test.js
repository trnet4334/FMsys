import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLatestSnapshotsQuery,
  buildSnapshotTrendQuery,
  buildSnapshotAllocationQuery,
} from '../packages/shared/src/snapshotRepository.js';

test('buildLatestSnapshotsQuery builds account/category/currency filters', () => {
  const result = buildLatestSnapshotsQuery({
    userId: 'u1',
    accountId: 'a1',
    category: 'stock',
    currency: 'USD',
    limit: 10,
  });

  assert.match(result.text, /where s\.user_id = \$1/i);
  assert.match(result.text, /h\.account_id = \$2/i);
  assert.match(result.text, /h\.asset_category = \$3/i);
  assert.match(result.text, /h\.currency = \$4/i);
  assert.equal(result.values.length, 5);
});

test('buildSnapshotTrendQuery supports period range filtering', () => {
  const result = buildSnapshotTrendQuery({
    userId: 'u1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  });

  assert.match(result.text, /snapshot_date between \$2 and \$3/i);
  assert.deepEqual(result.values, ['u1', '2026-01-01', '2026-01-31']);
});

test('buildSnapshotAllocationQuery groups by account category currency', () => {
  const result = buildSnapshotAllocationQuery({
    snapshotId: 's1',
  });

  assert.match(result.text, /group by h\.account_id, h\.asset_category, h\.currency/i);
  assert.deepEqual(result.values, ['s1']);
});
