import test from 'node:test';
import assert from 'node:assert/strict';

test('sendVerificationEmail calls Resend with correct params', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = {
    emails: { send: async (params) => { sentEmails.push(params); return { id: 'test-id' }; } }
  };
  const svc = createEmailService(
    { resendApiKey: '', emailFrom: 'noreply@fmsys.app', appUrl: 'http://localhost:4010' },
    mockClient
  );
  await svc.sendVerificationEmail('user@test.com', 'abc123token');
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'user@test.com');
  assert.equal(sentEmails[0].from, 'noreply@fmsys.app');
  assert.match(sentEmails[0].html, /abc123token/);
  assert.match(sentEmails[0].subject, /verify/i);
});

test('sendPasswordResetEmail includes reset URL', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = {
    emails: { send: async (params) => { sentEmails.push(params); return { id: 'test-id' }; } }
  };
  const svc = createEmailService(
    { resendApiKey: '', emailFrom: 'noreply@fmsys.app', appUrl: 'http://localhost:4010' },
    mockClient
  );
  await svc.sendPasswordResetEmail('user@test.com', 'resettoken456');
  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].html, /resettoken456/);
  assert.match(sentEmails[0].subject, /reset/i);
});

test('sendNewDeviceAlert includes device and IP', async () => {
  const sentEmails = [];
  const { createEmailService } = await import('../apps/api/src/emailService.js');
  const mockClient = {
    emails: { send: async (params) => { sentEmails.push(params); return { id: 'test-id' }; } }
  };
  const svc = createEmailService(
    { resendApiKey: '', emailFrom: 'noreply@fmsys.app', appUrl: 'http://localhost:4010' },
    mockClient
  );
  await svc.sendNewDeviceAlert('user@test.com', {
    device: 'Chrome/Mac',
    ip: '1.2.3.4',
    time: new Date('2026-03-29T12:00:00Z'),
  });
  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].html, /Chrome/);
  assert.match(sentEmails[0].html, /1\.2\.3\.4/);
  assert.match(sentEmails[0].subject, /device/i);
});
