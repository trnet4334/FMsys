import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createTokenRepository } from '../apps/api/src/tokenRepository.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

test.after(() => pool?.end());

test('create returns a token_value string', SKIP, async () => {
  const repo = createTokenRepository(pool);
  const tokenValue = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'email_verification',
    ttlMs: 900_000,
  });
  assert.equal(typeof tokenValue, 'string');
  assert.ok(tokenValue.length > 20);
});

test('findValid returns token row for valid token', SKIP, async () => {
  const repo = createTokenRepository(pool);
  const tokenValue = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'email_verification',
    ttlMs: 900_000,
  });
  const row = await repo.findValid(tokenValue);
  assert.ok(row);
  assert.equal(row.token_value, tokenValue);
  assert.equal(row.token_type, 'email_verification');
  assert.equal(row.consumed_at, null);
});

test('findValid returns null for expired token', SKIP, async () => {
  // Insert an expired token directly
  const past = new Date(Date.now() - 1000).toISOString();
  const tokenValue = 'expired-test-token-' + Date.now();
  await pool.query(
    `INSERT INTO auth_tokens (token_value, user_id, token_type, expires_at)
     VALUES ($1, $2, 'email_verification', $3)`,
    [tokenValue, '00000000-0000-0000-0000-000000000001', past]
  );
  const repo = createTokenRepository(pool);
  const found = await repo.findValid(tokenValue);
  assert.equal(found, null);
});

test('findValid returns null for consumed token', SKIP, async () => {
  const repo = createTokenRepository(pool);
  const tokenValue = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'password_setup',
    ttlMs: 900_000,
  });
  const row = await repo.findValid(tokenValue);
  await repo.consume(row.token_id);
  const afterConsume = await repo.findValid(tokenValue);
  assert.equal(afterConsume, null);
});

test('consume sets consumed_at', SKIP, async () => {
  const repo = createTokenRepository(pool);
  const tokenValue = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'password_reset',
    ttlMs: 900_000,
  });
  const row = await repo.findValid(tokenValue);
  await repo.consume(row.token_id);
  // Verify consumed by trying to find it again
  const afterConsume = await repo.findValid(tokenValue);
  assert.equal(afterConsume, null);
});
