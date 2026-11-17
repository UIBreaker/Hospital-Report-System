const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../server/src/config/db');
const pool = {};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };
const { getHospitalAnalytics } = require('../server/src/controllers/analyticsController');

test('daily analytics includes submitted discharge and transfer fields from department forms', async () => {
  const queries = [];
  pool.query = async sql => {
    queries.push(sql);
    if (queries.length === 1) return [[
      { id: 1, department_code: 'nhi', report_date: '2026-11-16', status: 'submitted', report_data: JSON.stringify({ benhMoi: 0, benhMoi_cc: 4, benhMoi_pk: 5, xuatVien: 0, xuat: 3, chuyenVien: 2 }) },
      { id: 2, department_code: 'hscc_tnt', report_date: '2026-11-16', status: 'submitted', report_data: JSON.stringify({ hscc: { xuatVien: 2, chuyenVien: 1 }, tnt: { tnt_xuatVien: 1, tnt_chuyenVien: 2 }, pk21: { pk21_chuyenVien: 1 } }) }
    ]];
    if (sql.includes('transfer_cases')) return [[{ report_id: 1, cnt: 1 }]];
    return [[]];
  };
  const res = { json(body) { this.body = body; } };
  await getHospitalAnalytics({ query: { range: 'day', date: '2026-11-16' } }, res, error => { throw error; });

  assert.match(queries[0], /r\.status = 'submitted'/);
  assert.equal(res.body.data.comparison.benhMoi.current, 9);
  assert.equal(res.body.data.comparison.xuatVien.current, 6);
  assert.equal(res.body.data.comparison.chuyenVien.current, 6);
  assert.equal(res.body.data.comparison.previousDate, null);
  assert.equal(res.body.data.comparison.xuatVien.percent, null);
  const day = res.body.data.timeSeries.find(point => point.date === '2026-11-16');
  assert.equal(res.body.data.timeSeries.at(-1).date, '2026-11-16');
  assert.equal(day.xuatVien, 6);
  assert.equal(day.chuyenVien, 6);
});
