import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requiredFiles = [
  'apps/web/src/styles/tokens.css',
  'apps/web/src/components/ui/metric-card.tsx',
  'apps/web/src/components/ui/section-header.tsx',
  'apps/web/src/components/ui/status-badge.tsx',
];

test('theme tokens and UI primitives exist', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `missing ${file}`);
  }
});
