import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { generate, storeHashes, verify, deleteAll } from '../apps/api/src/recoveryCodeService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

test.after(() => pool?.end());

test('generate returns 8 codes in XXXX-XXXX format', () => {
  const codes = generate();
  assert.equal(codes.length, 8);
  for (const code of codes) {
    assert.match(code, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  }
});

test('generate returns unique codes each call', () => {
  const a = generate();
  const b = generate();
  assert.notDeepEqual(a, b);
});

test('storeHashes inserts 8 rows for user', SKIP, async () => {
  const userId = '00000000-0000-0000-0000-000000000010';
  await deleteAll(pool, userId);
  const codes = generate();
  await storeHashes(pool, userId, codes);
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM recovery_codes WHERE user_id = $1 AND consumed_at IS NULL',
    [userId]
  );
  assert.equal(parseInt(rows[0].count), 8);
});

test('verify returns true for valid code and marks it consumed', SKIP, async () => {
  const userId = '00000000-0000-0000-0000-000000000011';
  await deleteAll(pool, userId);
  const codes = generate();
  await storeHashes(pool, userId, codes);
  const result = await verify(pool, userId, codes[0]);
  assert.equal(result, true);
  // Second use of same code should fail
  const reuse = await verify(pool, userId, codes[0]);
  assert.equal(reuse, false);
});

test('verify returns false for wrong code', SKIP, async () => {
  const userId = '00000000-0000-0000-0000-000000000012';
  await deleteAll(pool, userId);
  const codes = generate();
  await storeHashes(pool, userId, codes);
  const result = await verify(pool, userId, 'XXXX-XXXX');
  assert.equal(result, false);
});

test('deleteAll removes all codes for user', SKIP, async () => {
  const userId = '00000000-0000-0000-0000-000000000013';
  const codes = generate();
  await storeHashes(pool, userId, codes);
  await deleteAll(pool, userId);
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM recovery_codes WHERE user_id = $1',
    [userId]
  );
  assert.equal(parseInt(rows[0].count), 0);
});
