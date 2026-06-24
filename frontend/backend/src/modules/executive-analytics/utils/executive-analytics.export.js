const XLSX = require('xlsx');

function rowsToCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

function payloadToRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.kpis) {
    return Object.entries(payload.kpis).map(([key, value]) => ({ metric: key, value }));
  }
  if (payload?.items) return payload.items;
  return [{ data: JSON.stringify(payload) }];
}

async function buildExportBuffer(format, payload, reportName) {
  const rows = payloadToRows(payload);

  if (format === 'CSV') {
    return { buffer: Buffer.from(rowsToCsv(rows), 'utf8'), contentType: 'text/csv', extension: 'csv' };
  }

  if (format === 'XLSX') {
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Report');
    const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
    return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' };
  }

  if (format === 'PDF') {
    const text = `${reportName}\n\n${JSON.stringify(payload, null, 2)}`;
    return { buffer: Buffer.from(text, 'utf8'), contentType: 'application/pdf', extension: 'pdf' };
  }

  return {
    buffer: Buffer.from(JSON.stringify(payload, null, 2), 'utf8'),
    contentType: 'application/json',
    extension: 'json',
  };
}

module.exports = { buildExportBuffer, rowsToCsv, payloadToRows };
