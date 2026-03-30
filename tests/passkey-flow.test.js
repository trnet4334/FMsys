import test from 'node:test';
import assert from 'node:assert/strict';
import { createPasskeyService } from '../apps/api/src/passkeyService.js';

const config = { webauthn: { rpId: 'localhost', rpName: 'FMsys', origin: 'http://localhost:4010', challengeTtlMs: 60000 } };

// Use a mock pool that returns empty rows (no real DB needed for option generation)
const mockPool = {
  query: async () => ({ rows: [] }),
};

test('generateRegistrationOptions returns challenge and rpId', async () => {
  const svc = createPasskeyService({ pool: mockPool, config });
  const opts = await svc.generateRegistrationOptions('test-user-id', 'test@example.com');
  assert.ok(opts.challenge);
  assert.equal(opts.rp.id, 'localhost');
  assert.equal(opts.rp.name, 'FMsys');
});

test('generateAssertionOptions returns allowCredentials array', async () => {
  const svc = createPasskeyService({ pool: mockPool, config });
  const opts = await svc.generateAssertionOptions('test-user-id');
  assert.ok(Array.isArray(opts.allowCredentials));
});

test('challenge expires after TTL', async () => {
  const shortConfig = { ...config, webauthn: { ...config.webauthn, challengeTtlMs: 1 } };
  const svc = createPasskeyService({ pool: mockPool, config: shortConfig });
  await svc.generateRegistrationOptions('ttl-user', 'ttl@example.com');
  await new Promise(r => setTimeout(r, 50));
  // A verification attempt with the expired challenge should fail
  try {
    await svc.verifyRegistration('ttl-user', { challenge: 'fake', response: {} });
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(err.message.includes('Challenge'));
  }
});
