import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createUserRepository } from '../apps/api/src/userRepository.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);

test.after(() => pool.end());

test('createUser inserts a pending_verification user', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const user = await repo.create({ email: `test-${Date.now()}@example.com` });
  assert.ok(user.user_id);
  assert.equal(user.account_status, 'pending_verification');
  assert.equal(user.email_verified, false);
});

test('findByEmail returns null for non-existent email', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const user = await repo.findByEmail('nonexistent@example.com');
  assert.equal(user, null);
});

test('findByEmail returns user for existing email', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const email = `find-${Date.now()}@example.com`;
  await repo.create({ email });
  const found = await repo.findByEmail(email);
  assert.equal(found.primary_email, email);
});

test('setPassword stores hash and activates account', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const email = `pwd-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.setPassword(user.user_id, 'hashed-value');
  const updated = await repo.findById(user.user_id);
  assert.equal(updated.password_hash, 'hashed-value');
  assert.equal(updated.account_status, 'active');
});

test('verifyEmail sets email_verified to true', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const email = `verify-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.verifyEmail(user.user_id);
  const updated = await repo.findById(user.user_id);
  assert.equal(updated.email_verified, true);
});

test('incrementFailedAttempts and resetFailedAttempts', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const email = `lock-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  await repo.incrementFailedAttempts(user.user_id);
  const after = await repo.findById(user.user_id);
  assert.equal(after.failed_attempts, 1);
  await repo.resetFailedAttempts(user.user_id);
  const reset = await repo.findById(user.user_id);
  assert.equal(reset.failed_attempts, 0);
});

test('lockAccount sets lockout_until', { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' }, async () => {
  const repo = createUserRepository(pool);
  const email = `lockout-${Date.now()}@example.com`;
  const user = await repo.create({ email });
  const until = new Date(Date.now() + 900_000);
  await repo.lockAccount(user.user_id, until);
  const locked = await repo.findById(user.user_id);
  assert.ok(locked.locked_until);
});
