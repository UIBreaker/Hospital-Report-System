const pool = require('../config/db');

// Helper to safe parse JSON
const safeParse = (val, fallback = {}) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

// Get All Forms (Admin sees all; Department sees forms they have permission for)
const getAllForms = async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user && (user.role === 'admin' || user.username === 'Khnv' || user.departmentCode === 'admin');

    let sql = 'SELECT * FROM custom_forms';
    const params = [];

    if (!isAdmin) {
      sql = `
        SELECT DISTINCT f.*
        FROM custom_forms f
        LEFT JOIN custom_form_permissions p ON f.id = p.form_id
        WHERE f.is_active = 1
          AND (
            p.target_type = 'all'
            OR (p.target_type = 'department' AND p.target_value = ?)
            OR (p.target_type = 'role' AND p.target_value = ?)
            OR (p.target_type = 'user' AND p.target_value = ?)
          )
      `;
      params.push(user.departmentCode || '', user.role || '', user.username || '');
    }

    sql += ' ORDER BY created_at DESC';
    const [forms] = await pool.execute(sql, params);

    // Attach submission counts
    const formIds = forms.map(f => f.id);
    let countsMap = new Map();

    if (formIds.length > 0) {
      const placeholders = formIds.map(() => '?').join(',');
      const [counts] = await pool.execute(
        `SELECT form_id, COUNT(*) as total_submissions, MAX(submission_date) as latest_date
         FROM custom_form_submissions
         WHERE form_id IN (${placeholders})
         GROUP BY form_id`,
        formIds
      );
      counts.forEach(c => countsMap.set(c.form_id, c));
    }

    const formatted = forms.map(f => {
      const cnt = countsMap.get(f.id);
      return {
        ...f,
        schema_json: safeParse(f.schema_json, []),
        tracker_config: safeParse(f.tracker_config, null),
        total_submissions: cnt ? Number(cnt.total_submissions) : 0,
        latest_submission_date: cnt ? cnt.latest_date : null
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Get Form by Code or ID
const getFormByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const isNum = /^\d+$/.test(code);

    const [forms] = await pool.execute(
      isNum ? 'SELECT * FROM custom_forms WHERE id = ?' : 'SELECT * FROM custom_forms WHERE code = ?',
      [code]
    );

    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu tùy chỉnh.' });
    }

    const form = forms[0];

    // Fetch permissions
    const [permissions] = await pool.execute(
      'SELECT target_type, target_value, permission FROM custom_form_permissions WHERE form_id = ?',
      [form.id]
    );

    res.json({
      success: true,
      data: {
        ...form,
        schema_json: safeParse(form.schema_json, []),
        tracker_config: safeParse(form.tracker_config, null),
        permissions: permissions || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Custom Form
const createForm = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      code,
      title,
      description,
      form_type,
      theme_color,
      schema_json,
      tracker_config,
      permissions
    } = req.body;

    if (!code || !title || !schema_json) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp: Mã biểu mẫu (code), Tên biểu mẫu (title) và Cấu hình trường (schema_json).'
      });
    }

    const cleanCode = String(code).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    // Check code uniqueness
    const [existing] = await connection.execute('SELECT id FROM custom_forms WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `Mã biểu mẫu "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác.`
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO custom_forms (code, title, description, form_type, theme_color, schema_json, tracker_config, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        cleanCode,
        title.trim(),
        description || '',
        form_type || 'input',
        theme_color || '#2563EB',
        JSON.stringify(schema_json),
        tracker_config ? JSON.stringify(tracker_config) : null,
        req.user?.username || 'Admin'
      ]
    );

    const formId = result.insertId;

    // Insert permissions
    const perms = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : [{ target_type: 'all', target_value: 'all', permission: 'edit' }];

    for (const p of perms) {
      await connection.execute(
        `INSERT INTO custom_form_permissions (form_id, target_type, target_value, permission)
         VALUES (?, ?, ?, ?)`,
        [formId, p.target_type || 'all', p.target_value || 'all', p.permission || 'edit']
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Tạo biểu mẫu tùy chỉnh thành công!',
      data: { id: formId, code: cleanCode, title }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Admin: Update Custom Form
const updateForm = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      title,
      description,
      form_type,
      theme_color,
      schema_json,
      tracker_config,
      is_active,
      permissions
    } = req.body;

    const [forms] = await connection.execute('SELECT id FROM custom_forms WHERE id = ?', [id]);
    if (forms.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu cần cập nhật.' });
    }

    await connection.execute(
      `UPDATE custom_forms
       SET title = ?, description = ?, form_type = ?, theme_color = ?, schema_json = ?, tracker_config = ?, is_active = ?
       WHERE id = ?`,
      [
        title,
        description || '',
        form_type || 'input',
        theme_color || '#2563EB',
        JSON.stringify(schema_json || []),
        tracker_config ? JSON.stringify(tracker_config) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    // Update permissions if provided
    if (Array.isArray(permissions)) {
      await connection.execute('DELETE FROM custom_form_permissions WHERE form_id = ?', [id]);
      for (const p of permissions) {
        await connection.execute(
          `INSERT INTO custom_form_permissions (form_id, target_type, target_value, permission)
           VALUES (?, ?, ?, ?)`,
          [id, p.target_type || 'all', p.target_value || 'all', p.permission || 'edit']
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Cập nhật cấu hình biểu mẫu thành công!'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Admin: Delete Custom Form
const deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM custom_forms WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Đã xóa biểu mẫu tùy chỉnh thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Submit Custom Form Data
const submitFormData = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { submission_date, submission_data } = req.body;
    const user = req.user;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ? AND is_active = 1', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Biểu mẫu không tồn tại hoặc đã bị tạm ngưng.' });
    }

    const form = forms[0];
    const deptCode = user?.departmentCode || 'admin';
    const subDate = submission_date || new Date().toISOString().split('T')[0];

    const [result] = await pool.execute(
      `INSERT INTO custom_form_submissions (form_id, submitted_by_user, department_code, submission_date, submission_data, status)
       VALUES (?, ?, ?, ?, ?, 'submitted')`,
      [
        form.id,
        user?.username || 'user',
        deptCode,
        subDate,
        JSON.stringify(submission_data || {})
      ]
    );

    res.json({
      success: true,
      message: 'Nộp báo cáo theo biểu mẫu thành công!',
      data: {
        id: result.insertId,
        form_title: form.title,
        submission_date: subDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Submissions for a Form
const getFormSubmissions = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { date, department_code } = req.query;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu.' });
    }

    const form = forms[0];

    let sql = 'SELECT * FROM custom_form_submissions WHERE form_id = ?';
    const params = [form.id];

    if (date) {
      sql += ' AND submission_date = ?';
      params.push(date);
    }

    if (department_code) {
      sql += ' AND department_code = ?';
      params.push(department_code);
    }

    sql += ' ORDER BY submission_date DESC, created_at DESC';
    const [submissions] = await pool.execute(sql, params);

    const formatted = submissions.map(s => ({
      ...s,
      submission_data: safeParse(s.submission_data, {})
    }));

    res.json({
      success: true,
      form: {
        id: form.id,
        code: form.code,
        title: form.title,
        theme_color: form.theme_color,
        schema_json: safeParse(form.schema_json, [])
      },
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Realtime Data Tracker Aggregation
const getTrackerData = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu theo dõi.' });
    }

    const form = forms[0];
    const trackerConfig = safeParse(form.tracker_config, { source: 'overtime_staff' });

    // 1. Source: Overtime Staff from 12 Departments Reports
    if (trackerConfig.source === 'overtime_staff' || !trackerConfig.source) {
      const [reports] = await pool.execute(
        `SELECT r.id, r.department_code, u.department_name, r.doctor_name, r.nurse_name, r.overtime_staff, r.shift_time, r.room
         FROM reports r
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?`,
        [targetDate]
      );

      const overtimeList = [];
      (reports || []).forEach(r => {
        const safeOvertime = safeParse(r.overtime_staff, []);
        if (Array.isArray(safeOvertime) && safeOvertime.length > 0) {
          safeOvertime.forEach(ot => {
            if (ot && (ot.staffName || ot.staff_name || ot.time)) {
              overtimeList.push({
                department_code: r.department_code,
                department_name: r.department_name || r.department_code,
                doctor_name: r.doctor_name,
                nurse_name: r.nurse_name,
                staff_name: ot.staffName || ot.staff_name || '—',
                time: ot.time || '—',
                room: r.room || '—'
              });
            }
          });
        }
      });

      return res.json({
        success: true,
        form: {
          id: form.id,
          code: form.code,
          title: form.title,
          theme_color: form.theme_color
        },
        targetDate,
        total_departments_reported: reports.length,
        total_overtime_staff: overtimeList.length,
        data: overtimeList
      });
    }

    // 2. Fallback: Generic Submissions
    const [submissions] = await pool.execute(
      `SELECT s.*, u.department_name
       FROM custom_form_submissions s
       LEFT JOIN users u ON s.department_code = u.department_code
       WHERE s.form_id = ? AND s.submission_date = ?
       ORDER BY s.created_at DESC`,
      [form.id, targetDate]
    );

    res.json({
      success: true,
      form: {
        id: form.id,
        code: form.code,
        title: form.title,
        theme_color: form.theme_color
      },
      targetDate,
      data: submissions.map(s => ({ ...s, submission_data: safeParse(s.submission_data, {}) }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllForms,
  getFormByCode,
  createForm,
  updateForm,
  deleteForm,
  submitFormData,
  getFormSubmissions,
  getTrackerData
};
