function sumAmount(rows) {
  return rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
}

export function schedulePeriodicReports({ now }) {
  return [
    { type: 'weekly', runAt: now },
    { type: 'monthly', runAt: now },
  ];
}

export function renderPdfReportPayload(data) {
  return {
    ...data,
    sections: [
      'summary',
      'asset-overview',
      'allocation',
      'performance',
      'cashflow',
      'fx',
      'alerts',
    ],
  };
}

export function buildTabularExport(rows) {
  const total = sumAmount(rows);
  return {
    total,
    csv: {
      rows,
      total,
    },
    excel: {
      rows,
      total,
    },
  };
}

export function getReportArchive({ reports, includeEmail }) {
  return {
    reports,
    emailDelivery: {
      enabled: Boolean(includeEmail),
    },
  };
}
