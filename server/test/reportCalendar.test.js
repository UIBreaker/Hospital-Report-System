const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbPath = path.resolve(__dirname, '../src/config/db.js');
const adminPath = path.resolve(__dirname, '../src/controllers/adminController.js');
const pool = {
  execute: async sql => sql.includes('MAX(report_date)')
    ? [[{ latest_date: '2026-11-02' }]]
    : [[
      { date: '2026-11-01', submitted_count: 12, locked_count: 12 },
      { date: '2026-11-02', submitted_count: 11, locked_count: 0 }
    ]],
  query: async sql => {
    if (sql.includes('FROM archive_trash_days')) return [[{ report_date: '2026-11-02' }]];
    if (sql.includes('FROM archive_trash_exceptions')) return [[]];
    if (sql.includes('FROM archive_deleted_days')) return [[
      { date: '2026-11-01', deletedAt: '2026-11-10 10:00', reportCount: 12 },
      { date: '2026-11-03', deletedAt: '2026-11-11 10:00', reportCount: 10 }
    ]];
    throw new Error(`Unexpected query: ${sql}`);
  }
};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };
const { getReportCalendar } = require(adminPath);

test('lịch phân biệt báo cáo hiện có, Thùng Rác và ngày đã xóa', async () => {
  const res = { body: null, json(body) { this.body = body; return this; } };
  await getReportCalendar({ query: { month: '2026-11' } }, res, error => { throw error; });
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.data.days.map(day => [day.date, day.storageStatus]), [
    ['2026-11-01', 'active'],
    ['2026-11-02', 'trash'],
    ['2026-11-03', 'deleted']
  ]);
  assert.equal(res.body.data.days[2].deletedReportCount, 10);
  assert.equal(res.body.data.latestReportDate, '2026-11-02');
});
