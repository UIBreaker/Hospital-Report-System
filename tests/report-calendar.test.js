const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../server/src/config/db');
const pool = {};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };
const { getReportCalendar } = require('../server/src/controllers/adminController');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test('calendar rejects invalid month without querying reports', async () => {
  let queried = false;
  pool.execute = async () => { queried = true; };
  const res = response();
  await getReportCalendar({ query: { month: '2100-13' } }, res, error => { throw error; });
  assert.equal(res.statusCode, 400);
  assert.equal(queried, false);
});

test('calendar reads submitted and locked counts for the requested month', async () => {
  const queries = [];
  pool.execute = async (sql, params) => {
    queries.push({ sql, params });
    return queries.length === 1
      ? [[{ date: '2100-02-01', submitted_count: '2', locked_count: '2' }]]
      : [[{ latest_date: '2100-02-01' }]];
  };
  const res = response();
  await getReportCalendar({ query: { month: '2100-02' } }, res, error => { throw error; });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(queries[0].params, ['2100-02-01', '2100-03-01']);
  assert.match(queries[0].sql, /status = 'submitted'/);
  assert.deepEqual(res.body.data, {
    month: '2100-02', latestReportDate: '2100-02-01',
    days: [{ date: '2100-02-01', submittedCount: 2, lockedCount: 2 }]
  });
});
