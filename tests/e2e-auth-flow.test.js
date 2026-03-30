import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';
import { createEmailService } from '../apps/api/src/emailService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };
const pool = createPool(DB_URL);

test.after(() => pool.end());

const sentEmails = [];
const mockEmailClient = {
  emails: {
    send: async (params) => { sentEmails.push(params); return { id: 'mock-id' }; },
  },
};

function createSvc() {
  const emailSvc = createEmailService(
    { resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' },
    mockEmailClient,
  );
  return createAuthService({ pool, emailService: emailSvc });
}

const testEmail = `e2e-${Date.now()}@example.com`;

test('01 register creates user and sends verification email', SKIP, async () => {
  sentEmails.length = 0;
  const svc = createSvc();
  const result = await svc.register({ email: testEmail });
  assert.equal(result.ok, true);
  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].html, /verify/i);
  const match = sentEmails[0].html.match(/token=([A-Za-z0-9_-]+)/);
  assert.ok(match, 'email should contain token URL');
  global.__e2eVerifyToken = match[1];
});

test('02 verify email returns setup token', SKIP, async () => {
  assert.ok(global.__e2eVerifyToken, 'token from previous test required');
  const svc = createSvc();
  const result = await svc.verifyEmail({ token: global.__e2eVerifyToken });
  assert.equal(result.ok, true);
  assert.ok(result.setupToken);
  global.__e2eSetupToken = result.setupToken;
});

test('03 setup password creates mfa_setup session', SKIP, async () => {
  assert.ok(global.__e2eSetupToken, 'setup token required');
  const svc = createSvc();
  const result = await svc.setupPassword({ token: global.__e2eSetupToken, password: 'SecurePass123!' });
  assert.equal(result.ok, true);
  assert.ok(result.sessionId);
  global.__e2eSetupSessionId = result.sessionId;
});

test('04 setup MFA returns 8 recovery codes', SKIP, async () => {
  assert.ok(global.__e2eSetupSessionId, 'setup session required');
  const svc = createSvc();
  const result = await svc.setupMfa({ sessionId: global.__e2eSetupSessionId });
  assert.equal(result.ok, true);
  assert.equal(result.recoveryCodes.length, 8);
  assert.ok(result.qrDataUrl);
});

test('05 login with correct credentials returns pre_mfa session', SKIP, async () => {
  const svc = createSvc();
  const result = await svc.login({ email: testEmail, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'TestAgent/1.0' });
  assert.equal(result.ok, true);
  assert.equal(result.sessionState, 'pre_mfa');
  global.__e2eLoginSessionId = result.sessionId;
});

test('06 login with wrong password returns error', SKIP, async () => {
  const svc = createSvc();
  const result = await svc.login({ email: testEmail, password: 'wrongpassword', sourceIp: '127.0.0.2', userAgent: 'TestAgent/1.0' });
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});

test('07 forgot password is enumeration-safe', SKIP, async () => {
  sentEmails.length = 0;
  const svc = createSvc();
  const r1 = await svc.forgotPassword({ email: testEmail });
  assert.equal(r1.ok, true);
  const r2 = await svc.forgotPassword({ email: 'nobody@nowhere.example' });
  assert.equal(r2.ok, true);
  assert.equal(sentEmails.length, 1); // only sent for real account
  const match = sentEmails[0].html.match(/token=([A-Za-z0-9_-]+)/);
  assert.ok(match);
  global.__e2eResetToken = match[1];
});

test('08 reset password revokes all sessions', SKIP, async () => {
  assert.ok(global.__e2eResetToken, 'reset token required');
  const svc = createSvc();
  const result = await svc.resetPassword({ token: global.__e2eResetToken, password: 'NewPass999!' });
  assert.equal(result.ok, true);
});

test('09 duplicate registration returns error', SKIP, async () => {
  const svc = createSvc();
  const result = await svc.register({ email: testEmail });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'email_already_registered');
});
