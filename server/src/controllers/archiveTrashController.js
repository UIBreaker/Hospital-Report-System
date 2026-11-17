const crypto = require('crypto');
const pool = require('../config/db');

const todayInVietnam = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = type => parts.find(item => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const ageDays = (date, today = todayInVietnam()) =>
  Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000) + 1);

const isMissingTable = (error) => error?.code === 'ER_NO_SUCH_TABLE';
const TRASH_TABLE = `CREATE TABLE IF NOT EXISTS archive_trash_days (
  report_date DATE PRIMARY KEY,
  trashed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trashed_by VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
const EXCEPTIONS_TABLE = `CREATE TABLE IF NOT EXISTS archive_trash_exceptions (
  report_date DATE PRIMARY KEY,
  restored_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  restored_by VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
const DELETED_TABLE = `CREATE TABLE IF NOT EXISTS archive_deleted_days (
  report_date DATE PRIMARY KEY,
  deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  report_count INT NOT NULL,
  deleted_by VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

async function manualTrashDates(db, lock = false) {
  try {
    const [rows] = await db.query(`SELECT report_date, trashed_at, trashed_by FROM archive_trash_days${lock ? ' FOR UPDATE' : ''}`);
    return new Map(rows.map(row => [String(row.report_date).slice(0, 10), row]));
  } catch (error) {
    if (isMissingTable(error)) return new Map();
    throw error;
  }
}

async function restoredDates(db, lock = false) {
  try {
    const [rows] = await db.query(`SELECT report_date FROM archive_trash_exceptions${lock ? ' FOR UPDATE' : ''}`);
    return new Set(rows.map(row => String(row.report_date).slice(0, 10)));
  } catch (error) {
    if (isMissingTable(error)) return new Set();
    throw error;
  }
}

async function deletedDates(db, start, end) {
  try {
    const [rows] = await db.query(`SELECT DATE_FORMAT(report_date, '%Y-%m-%d') AS date,
      DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i') AS deletedAt, report_count AS reportCount
      FROM archive_deleted_days WHERE report_date >= ? AND report_date < ?`, [start, end]);
    return rows;
  } catch (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
}

async function reportDates(db) {
  const [rows] = await db.query(`SELECT DATE_FORMAT(report_date, '%Y-%m-%d') AS date,
    COUNT(*) AS reportCount FROM reports WHERE status = 'submitted'
    GROUP BY report_date ORDER BY report_date DESC`);
  return rows;
}

const errorResponse = (res, error) => {
  console.error('archive trash error:', error);
  return res.status(500).json({ success: false, error: 'Không thể xử lý Thùng Rác Dữ liệu.' });
};

exports.ageDays = ageDays;
exports.todayInVietnam = todayInVietnam;
exports.manualTrashDates = manualTrashDates;
exports.restoredDates = restoredDates;
exports.deletedDates = deletedDates;

exports.listTrash = async (_req, res) => {
  try {
    const [dates, manual, restored, [caseRows]] = await Promise.all([
      reportDates(pool), manualTrashDates(pool), restoredDates(pool), pool.query(`
        SELECT DATE_FORMAT(r.report_date, '%Y-%m-%d') AS date,
          COUNT(DISTINCT tc.id) AS transfers,
          COUNT(DISTINCT sc.id) AS surgeries
        FROM reports r
        LEFT JOIN transfer_cases tc ON tc.report_id = r.id
        LEFT JOIN surgery_cases sc ON sc.report_id = r.id
        WHERE r.status = 'submitted'
        GROUP BY r.report_date
      `)
    ]);
    const cases = new Map(caseRows.map(row => [String(row.date).slice(0, 10), row]));
    const data = dates.map(row => {
      const date = String(row.date).slice(0, 10);
      const age = ageDays(date);
      const entry = manual.get(date);
      return { date, ageDays: age, reportCount: Number(row.reportCount),
        surgeries: Number(cases.get(date)?.surgeries || 0),
        transfers: Number(cases.get(date)?.transfers || 0),
        reason: entry ? 'manual' : 'expired', trashedAt: entry?.trashed_at || null };
    }).filter(row => manual.has(row.date) || (row.ageDays > 365 && !restored.has(row.date)));
    res.json({ success: true, data });
  } catch (error) { errorResponse(res, error); }
};

exports.moveToTrash = async (req, res) => {
  const date = String(req.params.date || '');
  if (!validDate(date)) return res.status(400).json({ success: false, error: 'Ngày báo cáo không hợp lệ.' });
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM reports WHERE report_date = ? AND status = ?', [date, 'submitted']);
    if (!Number(rows[0]?.count)) return res.status(404).json({ success: false, error: 'Không tìm thấy báo cáo ngày này.' });
    if (ageDays(date) > 365) {
      try { await pool.query('DELETE FROM archive_trash_exceptions WHERE report_date = ?', [date]); }
      catch (error) { if (!isMissingTable(error)) throw error; }
      return res.json({ success: true });
    }
    // The table is created only after an admin explicitly moves a day; deployment never changes existing rows.
    await pool.query(TRASH_TABLE);
    await pool.query('INSERT IGNORE INTO archive_trash_days (report_date, trashed_by) VALUES (?, ?)',
      [date, String(req.user.username || req.user.userId || 'admin').slice(0, 150)]);
    return res.json({ success: true });
  } catch (error) { return errorResponse(res, error); }
};

exports.restoreFromTrash = async (req, res) => {
  const date = String(req.params.date || '');
  if (!validDate(date)) return res.status(400).json({ success: false, error: 'Ngày báo cáo không hợp lệ.' });
  try {
    if (ageDays(date) > 365) {
      await pool.query(EXCEPTIONS_TABLE);
      await pool.query('INSERT IGNORE INTO archive_trash_exceptions (report_date, restored_by) VALUES (?, ?)',
        [date, String(req.user.username || req.user.userId || 'admin').slice(0, 150)]);
    }
    try { await pool.query('DELETE FROM archive_trash_days WHERE report_date = ?', [date]); }
    catch (error) { if (!isMissingTable(error)) throw error; }
    return res.json({ success: true });
  } catch (error) { return errorResponse(res, error); }
};

function parseDates(raw) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 30 || raw.some(d => typeof d !== 'string' || !validDate(d))) return null;
  const dates = [...new Set(raw)].sort();
  return dates.length === raw.length ? dates : null;
}

async function snapshot(db, dates, lock = false) {
  const marks = dates.map(() => '?').join(',');
  const [reports] = await db.query(`SELECT id, department_code, DATE_FORMAT(report_date, '%Y-%m-%d') AS date,
    status, is_locked FROM reports WHERE report_date IN (${marks}) ORDER BY report_date, id ${lock ? 'FOR UPDATE' : ''}`, dates);
  const ids = reports.map(r => r.id);
  const counts = { transfer_cases: 0, surgery_cases: 0, death_cases: 0, critical_cases: 0, custom_form_submissions: 0, report_audit_logs: 0 };
  const caseIds = {};
  if (ids.length) {
    const idMarks = ids.map(() => '?').join(',');
    for (const table of ['transfer_cases', 'surgery_cases', 'death_cases', 'critical_cases', 'report_audit_logs']) {
      const [rows] = await db.query(`SELECT id FROM ${table} WHERE report_id IN (${idMarks}) ORDER BY id ${lock ? 'FOR UPDATE' : ''}`, ids);
      caseIds[table] = rows.map(row => row.id);
      counts[table] = rows.length;
    }
  }
  const [forms] = await db.query(`SELECT id FROM custom_form_submissions WHERE submission_date IN (${marks}) ORDER BY id ${lock ? 'FOR UPDATE' : ''}`, dates);
  counts.custom_form_submissions = forms.length;
  const data = { dates, reports: reports.map(r => ({ id: r.id, date: r.date, departmentCode: r.department_code, status: r.status, locked: !!r.is_locked })), caseIds, formIds: forms.map(f => f.id), counts };
  const digest = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return { ...data, digest, youngerDates: dates.filter(d => ageDays(d) <= 365) };
}

async function allInTrash(db, dates, lock = false) {
  const [manual, restored] = await Promise.all([manualTrashDates(db, lock), restoredDates(db, lock)]);
  return dates.every(date => manual.has(date) || (ageDays(date) > 365 && !restored.has(date)));
}

exports.previewDelete = async (req, res) => {
  const dates = parseDates(req.body?.dates);
  if (!dates) return res.status(400).json({ success: false, error: 'Chọn từ 1 đến 30 ngày hợp lệ.' });
  try {
    if (!await allInTrash(pool, dates)) return res.status(409).json({ success: false, error: 'Một số ngày không còn trong Thùng Rác.' });
    const data = await snapshot(pool, dates);
    if (!data.reports.length) return res.status(404).json({ success: false, error: 'Không còn báo cáo để xóa.' });
    return res.json({ success: true, data });
  } catch (error) { return errorResponse(res, error); }
};

exports.deleteSelected = async (req, res) => {
  const dates = parseDates(req.body?.dates);
  const digest = req.body?.digest;
  const confirmation = req.body?.confirmation;
  if (!dates || !/^[a-f0-9]{64}$/.test(String(digest || '')) || confirmation !== 'XOA DU LIEU') {
    return res.status(400).json({ success: false, error: 'Cần xem trước và nhập đúng xác nhận xóa.' });
  }
  try { await pool.query(DELETED_TABLE); }
  catch (error) { return errorResponse(res, error); }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (!await allInTrash(connection, dates, true)) {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'Danh sách Thùng Rác đã thay đổi. Vui lòng kiểm tra lại.' });
    }
    const data = await snapshot(connection, dates, true);
    if (!data.reports.length || data.digest !== digest) {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'Dữ liệu đã thay đổi. Vui lòng xem lại danh sách trước khi xóa.' });
    }
    const ids = data.reports.map(r => r.id);
    const idMarks = ids.map(() => '?').join(',');
    const dateMarks = dates.map(() => '?').join(',');
    for (const table of ['transfer_cases', 'surgery_cases', 'death_cases', 'critical_cases', 'report_audit_logs']) {
      await connection.query(`DELETE FROM ${table} WHERE report_id IN (${idMarks})`, ids);
    }
    await connection.query(`DELETE FROM custom_form_submissions WHERE submission_date IN (${dateMarks})`, dates);
    await connection.query(`DELETE FROM reports WHERE id IN (${idMarks})`, ids);
    for (const date of dates) {
      const reportCount = data.reports.filter(report => report.date === date).length;
      await connection.query(`INSERT INTO archive_deleted_days (report_date, report_count, deleted_by)
        VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE deleted_at = CURRENT_TIMESTAMP,
        report_count = VALUES(report_count), deleted_by = VALUES(deleted_by)`,
      [date, reportCount, String(req.user?.username || req.user?.userId || 'admin').slice(0, 150)]);
    }
    try { await connection.query(`DELETE FROM archive_trash_days WHERE report_date IN (${dateMarks})`, dates); }
    catch (error) { if (!isMissingTable(error)) throw error; }
    try { await connection.query(`DELETE FROM archive_trash_exceptions WHERE report_date IN (${dateMarks})`, dates); }
    catch (error) { if (!isMissingTable(error)) throw error; }
    await connection.commit();
    return res.json({ success: true, deleted: { dates, reportCount: ids.length, counts: data.counts } });
  } catch (error) {
    await connection.rollback();
    return errorResponse(res, error);
  } finally { connection.release(); }
};
