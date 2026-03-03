import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  'apps/web/src/components/layout/app-shell.tsx',
  'apps/web/app/cashflow/page.tsx',
  'apps/web/app/allocation/page.tsx',
];

test('app shell and secondary pages exist', () => {
  for (const file of files) {
    assert.equal(fs.existsSync(file), true, `missing ${file}`);
  }
});
