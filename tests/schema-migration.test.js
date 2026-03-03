import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = new URL('../db/migrations/001_init_snapshot_schema.sql', import.meta.url);

test('initial migration defines core finance tables', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'migration file should exist');
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();

  for (const table of ['accounts', 'snapshots', 'snapshot_holdings', 'snapshot_diffs']) {
    assert.match(sql, new RegExp(`create table if not exists ${table}`), `missing ${table} table`);
  }
});

test('snapshots table contains required valuation columns', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  for (const col of ['snapshot_date', 'snapshot_type', 'total_assets', 'net_worth', 'exchange_rates']) {
    assert.match(sql, new RegExp(`\\b${col}\\b`), `missing ${col}`);
  }
});
