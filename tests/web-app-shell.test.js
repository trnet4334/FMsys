import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

test('global styles use Manrope font', () => {
  const globals = fs.readFileSync(path.resolve(process.cwd(), 'apps/web/app/globals.css'), 'utf8');
  assert.match(globals, /Manrope/i);
});
