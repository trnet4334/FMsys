import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'ops/runbooks/backup-restore.md',
  'ops/observability/dashboard.json',
  'ops/observability/alerts.yaml',
];

test('ops artifacts exist for backup, dashboards, and alerting', () => {
  for (const file of files) {
    assert.equal(fs.existsSync(file), true, `missing ${file}`);
  }
});
