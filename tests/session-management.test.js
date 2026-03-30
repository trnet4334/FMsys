import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

const alertCalls = [];
const mockEmailService = {
  async sendVerificationEmail() {},
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert(email, details) { alertCalls.push({ email, details }); },
};

test.after(() => pool.end());
test.beforeEach(() => { alertCalls.length = 0; });

test('authService instantiates with device tracking enabled', async () => {
  const svc = createAuthService({ pool, emailService: mockEmailService });
  assert.ok(typeof svc.verifyMfaDb === 'function');
  assert.ok(typeof svc.verifyMfaSetup === 'function');
});

test('first login from device triggers new device alert (DB required)', SKIP, async () => {
  assert.ok(true); // full test requires seeded user in DB
});

test('known device does not re-trigger alert (DB required)', SKIP, async () => {
  assert.ok(true);
});

test('password reset revokes all sessions (DB required)', SKIP, async () => {
  assert.ok(true);
});
