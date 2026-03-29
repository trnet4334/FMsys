// tests/email-service.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

test('sendVerificationEmail calls resend with correct params', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = { emails: { send: async (params) => { sentEmails.push(params); return { id: 'test' }; } } };
  const svc = createEmailService({ resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' }, mockClient);
  await svc.sendVerificationEmail('user@test.com', 'abc123');
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'user@test.com');
  assert.ok(sentEmails[0].html.includes('abc123'));
});

test('sendPasswordResetEmail calls resend with reset URL', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = { emails: { send: async (params) => { sentEmails.push(params); return { id: 'test' }; } } };
  const svc = createEmailService({ resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' }, mockClient);
  await svc.sendPasswordResetEmail('user@test.com', 'resettoken123');
  assert.equal(sentEmails.length, 1);
  assert.ok(sentEmails[0].html.includes('resettoken123'));
});

test('sendNewDeviceAlert calls resend with device details', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = { emails: { send: async (params) => { sentEmails.push(params); return { id: 'test' }; } } };
  const svc = createEmailService({ resendApiKey: '', emailFrom: 'test@fmsys.app', appUrl: 'http://localhost:4010' }, mockClient);
  await svc.sendNewDeviceAlert('user@test.com', { device: 'Chrome/Mac', ip: '192.168.1.1', time: new Date('2026-01-01') });
  assert.equal(sentEmails.length, 1);
  assert.ok(sentEmails[0].html.includes('Chrome/Mac'));
});
