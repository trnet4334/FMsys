import test from 'node:test';
import assert from 'node:assert/strict';

import {
  schedulePeriodicReports,
  renderPdfReportPayload,
  buildTabularExport,
  getReportArchive,
} from '../apps/worker/src/reporting.js';

test('report scheduler creates weekly and monthly jobs', () => {
  const jobs = schedulePeriodicReports({ now: '2026-03-02T01:00:00Z' });
  assert.equal(jobs.some((job) => job.type === 'weekly'), true);
  assert.equal(jobs.some((job) => job.type === 'monthly'), true);
});

test('pdf payload contains fixed template sections', () => {
  const payload = renderPdfReportPayload({
    summary: {},
    allocations: [],
    performance: {},
    cashflow: {},
    fx: {},
    alerts: [],
  });

  assert.deepEqual(payload.sections, [
    'summary',
    'asset-overview',
    'allocation',
    'performance',
    'cashflow',
    'fx',
    'alerts',
  ]);
});

test('tabular exports keep total consistency across csv/excel representations', () => {
  const data = [
    { item: 'a', amount: 100 },
    { item: 'b', amount: 50 },
  ];

  const result = buildTabularExport(data);
  assert.equal(result.total, 150);
  assert.equal(result.csv.total, 150);
  assert.equal(result.excel.total, 150);
});

test('report archive retrieval can include optional email delivery metadata', () => {
  const archive = getReportArchive({
    reports: [{ id: 'r1', format: 'pdf' }],
    includeEmail: true,
  });

  assert.equal(archive.reports.length, 1);
  assert.equal(archive.emailDelivery.enabled, true);
});
