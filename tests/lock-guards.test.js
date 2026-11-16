const test = require('node:test');
const assert = require('node:assert/strict');

// Replace the database module before loading controllers: no real connection is opened.
const dbPath = require.resolve('../server/src/config/db');
const pool = {};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };

const { createOrUpdateReport, deleteReport } = require('../server/src/controllers/reportController');
const { moveReportDate, toggleLockAllReports } = require('../server/src/controllers/adminController');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test('locked report rejects admin edits, deletion, and date moves before any write', async () => {
  for (const action of [createOrUpdateReport, deleteReport, moveReportDate]) {
    const queries = [];
    let rolledBack = false;
    pool.getConnection = async () => ({
      beginTransaction: async () => {},
      execute: async (sql) => {
        queries.push(sql);
        assert.match(sql, /SELECT .*is_locked.*FOR UPDATE/);
        return [[{ id: 42, is_locked: 1 }]];
      },
      rollback: async () => { rolledBack = true; },
      release: () => {}
    });
    const req = {
      user: { role: 'admin', departmentCode: 'khnv' },
      body: { departmentCode: 'noi', reportDate: '2026-11-15', fromDate: '2026-11-15', toDate: '2026-11-16' },
      params: { departmentCode: 'noi', date: '2026-11-15' },
      headers: {}, socket: {}
    };
    const res = response();
    await action(req, res, error => { throw error; });
    assert.equal(res.statusCode, 403);
    assert.match(res.body.error, /mở khóa sổ/);
    assert.equal(queries.length, 1);
    assert.equal(rolledBack, true);
  }
});

test('whole-hospital endpoint only accepts locking submitted reports', async () => {
  const queries = [];
  pool.execute = async (sql) => {
    queries.push(sql);
    return [{ affectedRows: 2 }];
  };
  const req = { params: { date: '2026-11-15' }, body: { isLocked: false }, user: { username: 'admin' }, headers: {}, socket: {} };
  const rejected = response();
  await toggleLockAllReports(req, rejected, error => { throw error; });
  assert.equal(rejected.statusCode, 400);
  assert.equal(queries.length, 0);

  req.body.isLocked = true;
  const accepted = response();
  await toggleLockAllReports(req, accepted, error => { throw error; });
  assert.equal(accepted.statusCode, 200);
  assert.match(queries[0], /status = 'submitted' AND is_locked = 0/);
  assert.equal(accepted.body.isLocked, true);
});
