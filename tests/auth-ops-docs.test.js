import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const paths = [
  'ops/runbooks/auth-gateway-rollout.md',
  'ops/observability/auth-gateway-dashboard.md',
];

test('auth rollout runbook and observability docs exist', () => {
  for (const path of paths) {
    assert.equal(fs.existsSync(path), true, `missing ${path}`);
  }
});
