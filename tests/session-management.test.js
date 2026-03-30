import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
const emailCalls = [];
const resetCalls = [];
const alertCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ email, token }); },
  async sendPasswordResetEmail(email, token) { resetCalls.push({ email, token }); },
  async sendNewDeviceAlert(email, details) { alertCalls.push({ email, details }); },
};

test.after(() => pool.end());
test.beforeEach(() => { emailCalls.length = 0; resetCalls.length = 0; alertCalls.length = 0; });

test('password reset revokes all user sessions', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `sm-${Date.now()}@test.com`;

  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const { sessionId } = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });

  // Session should be valid
  const before = await auth.getSessionDb(sessionId);
  assert.ok(before);

  // Request password reset and use the token
  await auth.forgotPassword({ email });
  const rToken = resetCalls[0]?.token;
  assert.ok(rToken, 'Reset token must be present');

  const result = await auth.resetPassword({ token: rToken, password: 'NewPass456!' });
  assert.equal(result.ok, true);

  // Original session should now be revoked
  const after = await auth.getSessionDb(sessionId);
  assert.equal(after, null);
});
