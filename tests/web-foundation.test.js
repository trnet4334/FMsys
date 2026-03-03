import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requiredFiles = [
  'apps/web/app/layout.tsx',
  'apps/web/app/page.tsx',
  'apps/web/app/dashboard/page.tsx',
  'apps/web/app/globals.css',
  'apps/web/tailwind.config.ts',
  'apps/web/postcss.config.js',
  'apps/web/next.config.ts',
  'apps/web/tsconfig.json',
];

test('web app foundation files exist', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `missing ${file}`);
  }
});
