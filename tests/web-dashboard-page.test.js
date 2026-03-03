import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pagePath = 'apps/web/app/dashboard/page.tsx';

test('dashboard page references all core sections', () => {
  const source = fs.readFileSync(pagePath, 'utf8');

  const requiredImports = [
    'NetWorthHero',
    'TrendPanel',
    'AllocationPanel',
    'AlertsPanel',
    'CashflowMiniPanel',
  ];

  for (const token of requiredImports) {
    assert.match(source, new RegExp(token), `missing ${token}`);
  }
});
