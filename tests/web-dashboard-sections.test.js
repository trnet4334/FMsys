import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requiredFiles = [
  'apps/web/src/components/dashboard/net-worth-hero.tsx',
  'apps/web/src/components/dashboard/trend-panel.tsx',
  'apps/web/src/components/dashboard/allocation-panel.tsx',
  'apps/web/src/components/dashboard/alerts-panel.tsx',
  'apps/web/src/components/dashboard/cashflow-mini-panel.tsx',
];

test('dashboard section component files exist', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `missing ${file}`);
  }
});
