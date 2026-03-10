import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

test('login panel includes neutral theme marker', () => {
  const source = read('apps/web/src/components/auth/login-panel.tsx');
  assert.match(source, /data-theme="neutral"/i);
});
