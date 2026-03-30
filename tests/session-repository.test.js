import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createSessionRepository } from '../apps/api/src/sessionRepository.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

test.after(() => pool?.end());

const testConfig = {
  session: {
    ttlMs: 86_400_000,   // 24 hours
    idleMs: 1_800_000,   // 30 minutes
  },
};

test('create returns a session with session_id and state pre_mfa', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const session = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    state: 'pre_mfa',
    ip: '127.0.0.1',
    userAgent: 'TestAgent/1.0',
    deviceLabel: 'Test Device',
  });
  assert.ok(session.session_id);
  assert.equal(session.session_state, 'pre_mfa');
});

test('findValid returns session for valid session_id', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const created = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    state: 'pre_mfa',
    ip: '127.0.0.1',
    userAgent: 'TestAgent/1.0',
  });
  const found = await repo.findValid(created.session_id);
  assert.ok(found);
  assert.equal(found.session_id, created.session_id);
});

test('findValid returns null for expired session', SKIP, async () => {
  // This test requires inserting a session with expires_at in the past
  // Use a direct pool.query to insert an expired session
  const repo = createSessionRepository(pool, testConfig);
  const past = new Date(Date.now() - 1000).toISOString();
  const { rows } = await pool.query(
    `INSERT INTO auth_sessions (user_id, session_state, auth_method, expires_at, idle_timeout_at)
     VALUES ($1, 'pre_mfa', 'email', $2, NOW() + INTERVAL '30 minutes') RETURNING session_id`,
    ['00000000-0000-0000-0000-000000000001', past]
  );
  const sessionId = rows[0].session_id;
  const found = await repo.findValid(sessionId);
  assert.equal(found, null);
});

test('findValid returns null for idle-timed-out session', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const past = new Date(Date.now() - 1000).toISOString();
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const { rows } = await pool.query(
    `INSERT INTO auth_sessions (user_id, session_state, auth_method, expires_at, idle_timeout_at)
     VALUES ($1, 'pre_mfa', 'email', $2, $3) RETURNING session_id`,
    ['00000000-0000-0000-0000-000000000001', future, past]
  );
  const sessionId = rows[0].session_id;
  const found = await repo.findValid(sessionId);
  assert.equal(found, null);
});

test('updateState transitions session_state', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const session = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    state: 'pre_mfa',
    ip: '127.0.0.1',
    userAgent: 'TestAgent/1.0',
  });
  await repo.updateState(session.session_id, 'authenticated');
  const updated = await repo.findValid(session.session_id);
  assert.equal(updated.session_state, 'authenticated');
});

test('delete removes session', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const session = await repo.create({
    userId: '00000000-0000-0000-0000-000000000001',
    state: 'pre_mfa',
    ip: '127.0.0.1',
    userAgent: 'TestAgent/1.0',
  });
  await repo.delete(session.session_id);
  const found = await repo.findValid(session.session_id);
  assert.equal(found, null);
});

test('findAllByUser returns valid sessions for user', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const userId = '00000000-0000-0000-0000-000000000002';
  await repo.create({ userId, state: 'authenticated', ip: '127.0.0.1', userAgent: 'A' });
  await repo.create({ userId, state: 'authenticated', ip: '127.0.0.2', userAgent: 'B' });
  const sessions = await repo.findAllByUser(userId);
  assert.ok(sessions.length >= 2);
});

test('revokeAll deletes all sessions for user', SKIP, async () => {
  const repo = createSessionRepository(pool, testConfig);
  const userId = '00000000-0000-0000-0000-000000000003';
  await repo.create({ userId, state: 'authenticated', ip: '127.0.0.1', userAgent: 'A' });
  await repo.revokeAll(userId);
  const sessions = await repo.findAllByUser(userId);
  assert.equal(sessions.length, 0);
});
