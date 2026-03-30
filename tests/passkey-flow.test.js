import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createPasskeyService } from '../apps/api/src/passkeyService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

test.after(() => pool.end());

const config = {
  webauthn: {
    rpId: 'localhost',
    rpName: 'FMsys',
    origin: 'http://localhost:4010',
    challengeTtlMs: 60_000,
  },
};

test('generateRegistrationOptions returns challenge and rpId', SKIP, async () => {
  const svc = createPasskeyService({ pool, config });
  const opts = await svc.generateRegistrationOptions(
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
  );
  assert.ok(opts.challenge);
  assert.equal(opts.rp.id, 'localhost');
  assert.equal(opts.rp.name, 'FMsys');
});

test('generateAssertionOptions returns allowCredentials array', SKIP, async () => {
  const svc = createPasskeyService({ pool, config });
  const opts = await svc.generateAssertionOptions('00000000-0000-0000-0000-000000000001');
  assert.ok(Array.isArray(opts.allowCredentials));
});

test('verifyRegistration rejects invalid response', SKIP, async () => {
  const svc = createPasskeyService({ pool, config });
  await svc.generateRegistrationOptions('00000000-0000-0000-0000-000000000001', 'test@example.com');
  const result = await svc.verifyRegistration('00000000-0000-0000-0000-000000000001', {
    id: 'fake',
    rawId: 'fake',
    response: { attestationObject: 'fake', clientDataJSON: 'fake' },
    type: 'public-key',
  }).catch(() => ({ verified: false }));
  assert.equal(result.verified, false);
});
