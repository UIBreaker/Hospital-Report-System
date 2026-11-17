const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbPath = path.resolve(__dirname, '../src/config/db.js');
const controllerPath = path.resolve(__dirname, '../src/controllers/archiveTrashController.js');

const writes = [];
const connection = {
  beginTransaction: async () => writes.push('begin'),
  rollback: async () => writes.push('rollback'),
  commit: async () => writes.push('commit'),
  release: () => {},
  query: async sql => {
    if (sql.startsWith('SELECT report_date, trashed_at')) return [[]];
    if (sql.includes('FROM reports WHERE report_date IN')) return [[{
      id: 42, department_code: 'xn', date: '2020-01-01', status: 'submitted', is_locked: 1
    }]];
    if (sql.startsWith('SELECT id FROM')) return [[]];
    if (/^(DELETE|UPDATE|INSERT)/.test(sql)) writes.push(sql);
    return [[]];
  }
};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { getConnection: async () => connection, query: connection.query } };
const controller = require(controllerPath);

const response = () => ({
  code: 200, body: null,
  status(code) { this.code = code; return this; },
  json(body) { this.body = body; return this; }
});

test('tuổi thọ tính cả ngày báo cáo và chuyển vào thùng rác từ ngày 366', () => {
  assert.equal(controller.ageDays('2026-11-16', '2026-11-16'), 1);
  assert.equal(controller.ageDays('2026-11-16', '2026-11-17'), 2);
  assert.equal(controller.ageDays('2025-11-17', '2026-11-16'), 365);
  assert.equal(controller.ageDays('2025-11-17', '2026-11-17'), 366);
});

test('không xóa khi thiếu câu xác nhận hoặc dữ liệu xem trước đã thay đổi', async () => {
  writes.length = 0;
  const invalid = response();
  await controller.deleteSelected({ body: { dates: ['2020-01-01'], digest: 'a'.repeat(64), confirmation: '' } }, invalid);
  assert.equal(invalid.code, 400);
  assert.equal(writes.length, 0);

  const stale = response();
  await controller.deleteSelected({ body: { dates: ['2020-01-01'], digest: 'a'.repeat(64), confirmation: 'XOA DU LIEU' } }, stale);
  assert.equal(stale.code, 409);
  assert.deepEqual(writes, ['begin', 'rollback']);
});

test('xóa đúng ngày đã xem trước trong một giao dịch', async () => {
  writes.length = 0;
  const preview = response();
  await controller.previewDelete({ body: { dates: ['2020-01-01'] } }, preview);
  assert.equal(preview.code, 200);
  assert.deepEqual(preview.body.data.reports.map(report => report.id), [42]);
  assert.equal(writes.length, 0);

  const result = response();
  await controller.deleteSelected({ body: {
    dates: ['2020-01-01'], digest: preview.body.data.digest, confirmation: 'XOA DU LIEU'
  } }, result);
  assert.equal(result.code, 200);
  assert.equal(result.body.deleted.reportCount, 1);
  assert.equal(writes[0], 'begin');
  assert.equal(writes.at(-1), 'commit');
  assert.equal(writes.filter(write => write.startsWith('DELETE FROM reports')).length, 1);
  assert.equal(writes.some(write => write.startsWith('INSERT INTO archive_deleted_days')), true);
});

test('hoàn tác ngày quá hạn tạo ngoại lệ thay vì xóa báo cáo', async () => {
  writes.length = 0;
  const result = response();
  await controller.restoreFromTrash({ params: { date: '2020-01-01' }, user: { username: 'admin' } }, result);
  assert.equal(result.code, 200);
  assert.equal(writes.some(write => write.startsWith('INSERT IGNORE INTO archive_trash_exceptions')), true);
  assert.equal(writes.some(write => write.startsWith('DELETE FROM reports')), false);
});
