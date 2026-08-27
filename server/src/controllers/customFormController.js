const pool = require('../config/db');

const safeParse = (str, fallback = {}) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const parseCaseImages = (caseItem) => {
  if (!caseItem) return caseItem;
  let images = caseItem.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [images];
    }
  }
  return {
    ...caseItem,
    images: Array.isArray(images) ? images : (images ? [images] : [])
  };
};

// 1. Get All Custom Forms
const getAllForms = async (req, res, next) => {
  try {
    const [forms] = await pool.execute(
      `SELECT f.*, 
        (SELECT COUNT(*) FROM custom_form_submissions s WHERE s.form_id = f.id) as submissions_count
       FROM custom_forms f
       ORDER BY f.created_at DESC`
    );

    const [permissions] = await pool.execute('SELECT * FROM custom_form_permissions');

    const result = forms.map(form => {
      const formPerms = permissions.filter(p => p.form_id === form.id);
      const subCount = Number(form.submissions_count || 0);
      return {
        ...form,
        submissions_count: subCount,
        total_submissions: subCount,
        schema_json: safeParse(form.schema_json, []),
        tracker_config: safeParse(form.tracker_config, {}),
        permissions: formPerms
      };
    });

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Single Form By Code
const getFormByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const [forms] = await pool.execute(
      'SELECT * FROM custom_forms WHERE code = ?',
      [code]
    );

    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu tùy chỉnh.' });
    }

    const form = forms[0];
    const [permissions] = await pool.execute(
      'SELECT * FROM custom_form_permissions WHERE form_id = ?',
      [form.id]
    );

    res.json({
      success: true,
      data: {
        ...form,
        schema_json: safeParse(form.schema_json, []),
        tracker_config: safeParse(form.tracker_config, {}),
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Create Custom Form
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
      is_active,
      permissions
    } = req.body;

    if (!code || !title) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp Mã định danh (Code) và Tên biểu mẫu (Title).'
      });
    }

    // Check duplicate code
    const [existing] = await connection.execute(
      'SELECT id FROM custom_forms WHERE code = ?',
      [code.trim()]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Mã biểu mẫu (Slug Code) này đã tồn tại trên hệ thống. Vui lòng chọn mã khác.'
      });
    }

    const [insertResult] = await connection.execute(
      `INSERT INTO custom_forms (
        code, title, description, form_type, theme_color, schema_json, tracker_config, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.trim(),
        title.trim(),
        description || null,
        form_type || 'input',
        theme_color || '#2563EB',
        JSON.stringify(schema_json || []),
        JSON.stringify(tracker_config || {}),
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        req.user?.username || 'Admin'
      ]
    );

    const formId = insertResult.insertId;

    // Insert permissions
    if (Array.isArray(permissions) && permissions.length > 0) {
      for (const perm of permissions) {
        if (perm.target_type && perm.target_value) {
          await connection.execute(
            `INSERT INTO custom_form_permissions (form_id, target_type, target_value, permission)
             VALUES (?, ?, ?, ?)`,
            [formId, perm.target_type, perm.target_value, perm.permission || 'edit']
          );
        }
      }
    } else {
      // Default: All departments can view and edit
      await connection.execute(
        `INSERT INTO custom_form_permissions (form_id, target_type, target_value, permission)
         VALUES (?, 'all', 'all', 'edit')`,
        [formId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Tạo biểu mẫu tùy chỉnh thành công!',
      data: { id: formId, code: code.trim() }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// 4. Update Custom Form
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

    const [existing] = await connection.execute(
      'SELECT id FROM custom_forms WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu cần cập nhật.' });
    }

    await connection.execute(
      `UPDATE custom_forms SET
        title = ?,
        description = ?,
        form_type = ?,
        theme_color = ?,
        schema_json = ?,
        tracker_config = ?,
        is_active = ?
       WHERE id = ?`,
      [
        title ? title.trim() : '',
        description !== undefined ? description : null,
        form_type || 'input',
        theme_color || '#2563EB',
        JSON.stringify(schema_json || []),
        JSON.stringify(tracker_config || {}),
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    // Update permissions: Delete old and insert new
    if (Array.isArray(permissions)) {
      await connection.execute('DELETE FROM custom_form_permissions WHERE form_id = ?', [id]);
      for (const perm of permissions) {
        if (perm.target_type && perm.target_value) {
          await connection.execute(
            `INSERT INTO custom_form_permissions (form_id, target_type, target_value, permission)
             VALUES (?, ?, ?, ?)`,
            [id, perm.target_type, perm.target_value, perm.permission || 'edit']
          );
        }
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

// 5. Delete Custom Form
const deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM custom_forms WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Đã xóa biểu mẫu tùy chỉnh thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// 6. Submit Dynamic Form Data
const submitFormData = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { submission_date, submission_data } = req.body;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ? AND is_active = 1', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Biểu mẫu không tồn tại hoặc đã bị tạm ngưng.' });
    }

    const form = forms[0];
    const userDept = req.user?.departmentCode || 'admin';
    const username = req.user?.username || 'Unknown';
    const subDate = submission_date || new Date().toISOString().split('T')[0];

    const [result] = await pool.execute(
      `INSERT INTO custom_form_submissions (form_id, submitted_by_user, department_code, submission_date, submission_data)
       VALUES (?, ?, ?, ?, ?)`,
      [form.id, username, userDept, subDate, JSON.stringify(submission_data || {})]
    );

    res.json({
      success: true,
      message: 'Nộp báo cáo biểu mẫu thành công!',
      submission_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get Submissions For Form
const getFormSubmissions = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { date } = req.query;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu.' });
    }

    const form = forms[0];
    let query = `
      SELECT s.*, 
             CASE 
               WHEN s.department_code = 'personal' THEN 'Tài khoản cá nhân'
               WHEN su.department_name IS NOT NULL THEN su.department_name
               WHEN u.department_name IS NOT NULL THEN u.department_name
               ELSE s.department_code 
             END as department_name,
             COALESCE(su.full_name, s.submitted_by_user) as user_full_name
      FROM custom_form_submissions s
      LEFT JOIN users u ON s.department_code = u.department_code
      LEFT JOIN system_users su ON (s.submitted_by_user = su.username OR s.submitted_by_user = su.full_name)
      WHERE s.form_id = ?
    `;
    const params = [form.id];

    if (date && date.trim() !== '') {
      query += ' AND DATE(s.submission_date) = DATE(?)';
      params.push(date.trim());
    }

    query += ' ORDER BY s.created_at DESC';

    const [submissions] = await pool.execute(query, params);

    const formatted = submissions.map(s => {
      let subDateStr = s.submission_date;
      if (s.submission_date instanceof Date) {
        const y = s.submission_date.getFullYear();
        const m = String(s.submission_date.getMonth() + 1).padStart(2, '0');
        const d = String(s.submission_date.getDate()).padStart(2, '0');
        subDateStr = `${y}-${m}-${d}`;
      } else if (typeof s.submission_date === 'string' && s.submission_date.includes('T')) {
        subDateStr = s.submission_date.split('T')[0];
      }

      return {
        ...s,
        submission_date: subDateStr,
        submission_data: safeParse(s.submission_data, {})
      };
    });

    res.json({
      success: true,
      form: {
        id: form.id,
        code: form.code,
        title: form.title,
        theme_color: form.theme_color,
        schema_json: safeParse(form.schema_json, []),
        permissions: safeParse(form.permissions, [])
      },
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// 7.1 Xóa bản ghi đã nộp (Chỉ người có quyền sửa / Admin / Người nộp mới được xóa)
const deleteFormSubmission = async (req, res, next) => {
  try {
    const { code, submissionId } = req.params;
    const user = req.user;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu.' });
    }

    const form = forms[0];
    const [submissions] = await pool.execute(
      'SELECT * FROM custom_form_submissions WHERE id = ? AND form_id = ?',
      [submissionId, form.id]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bản ghi cần xóa.' });
    }

    const submission = submissions[0];

    // Check permission to delete
    let canDelete = false;
    if (user.role === 'admin') {
      canDelete = true;
    } else if (submission.submitted_by_user === user.username) {
      canDelete = true;
    } else {
      const [permissions] = await pool.execute('SELECT * FROM custom_form_permissions WHERE form_id = ?', [form.id]);
      const perms = permissions.length > 0 ? permissions : [{ target_type: 'all', target_value: 'all', permission: 'edit' }];
      const hasEditPerm = perms.some(p => {
        if (p.permission !== 'edit') return false;
        if (p.target_type === 'all') return true;
        if (p.target_type === 'user' && (p.target_value === user.username || p.target_value === user.departmentCode)) return true;
        if (p.target_type === 'dept' && p.target_value === user.departmentCode) return true;
        return false;
      });
      if (hasEditPerm) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền xóa bản ghi này (Chỉ người được cấp quyền sửa hoặc Admin mới có thể xóa).' });
    }

    await pool.execute('DELETE FROM custom_form_submissions WHERE id = ?', [submissionId]);

    res.json({
      success: true,
      message: 'Đã xóa bản ghi thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// 7.2 Sửa / Cập nhật bản ghi đã nộp
const updateFormSubmission = async (req, res, next) => {
  try {
    const { code, submissionId } = req.params;
    const { submission_date, submission_data } = req.body;
    const user = req.user;

    const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [code]);
    if (forms.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy biểu mẫu.' });
    }

    const form = forms[0];
    const [submissions] = await pool.execute(
      'SELECT * FROM custom_form_submissions WHERE id = ? AND form_id = ?',
      [submissionId, form.id]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bản ghi cần chỉnh sửa.' });
    }

    const submission = submissions[0];

    // Check permission to edit
    let canEdit = false;
    if (user.role === 'admin') {
      canEdit = true;
    } else if (submission.submitted_by_user === user.username) {
      canEdit = true;
    } else {
      const [permissions] = await pool.execute('SELECT * FROM custom_form_permissions WHERE form_id = ?', [form.id]);
      const perms = permissions.length > 0 ? permissions : [{ target_type: 'all', target_value: 'all', permission: 'edit' }];
      const hasEditPerm = perms.some(p => {
        if (p.permission !== 'edit') return false;
        if (p.target_type === 'all') return true;
        if (p.target_type === 'user' && (p.target_value === user.username || p.target_value === user.departmentCode)) return true;
        if (p.target_type === 'dept' && p.target_value === user.departmentCode) return true;
        return false;
      });
      if (hasEditPerm) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền chỉnh sửa bản ghi này.' });
    }

    const existingData = safeParse(submission.submission_data, {});
    const updatedData = {
      ...existingData,
      ...(submission_data || {})
    };

    let subDate = submission_date || submission.submission_date;
    if (subDate instanceof Date) {
      const y = subDate.getFullYear();
      const m = String(subDate.getMonth() + 1).padStart(2, '0');
      const d = String(subDate.getDate()).padStart(2, '0');
      subDate = `${y}-${m}-${d}`;
    }

    await pool.execute(
      'UPDATE custom_form_submissions SET submission_date = ?, submission_data = ? WHERE id = ?',
      [subDate, JSON.stringify(updatedData), submissionId]
    );

    res.json({
      success: true,
      message: 'Cập nhật bản ghi báo cáo thành công!',
      data: {
        id: Number(submissionId),
        submission_date: subDate,
        submission_data: updatedData
      }
    });
  } catch (error) {
    next(error);
  }
};

// 8. Realtime Data Tracker Aggregation for All 3 Sources
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
    const source = trackerConfig.source || 'overtime_staff';

    // ==========================================
    // SOURCE 1: Overtime Staff (Nhân sự tăng cường)
    // ==========================================
    if (source === 'overtime_staff') {
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
        source: 'overtime_staff',
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

    // ==========================================
    // SOURCE 2: Clinical Cases (Tổng hợp 4 loại ca bệnh)
    // ==========================================
    if (source === 'clinical_cases') {
      // 1. Transfer cases
      const [transferRows] = await pool.execute(
        `SELECT t.*, r.department_code, u.department_name 
         FROM transfer_cases t
         JOIN reports r ON t.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?
         ORDER BY t.id ASC`,
        [targetDate]
      );

      // 2. Surgery cases
      const [surgeryRows] = await pool.execute(
        `SELECT s.*, r.department_code, u.department_name 
         FROM surgery_cases s
         JOIN reports r ON s.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?
         ORDER BY s.id ASC`,
        [targetDate]
      );

      // 3. Death cases
      const [deathRows] = await pool.execute(
        `SELECT d.*, r.department_code, u.department_name 
         FROM death_cases d
         JOIN reports r ON d.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?
         ORDER BY d.id ASC`,
        [targetDate]
      );

      // 4. Critical cases
      const [criticalRows] = await pool.execute(
        `SELECT c.*, r.department_code, u.department_name 
         FROM critical_cases c
         JOIN reports r ON c.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?
         ORDER BY c.id ASC`,
        [targetDate]
      );

      const transferCases = transferRows.map(parseCaseImages);
      const surgeryCases = surgeryRows.map(parseCaseImages);
      const deathCases = deathRows.map(parseCaseImages);
      const criticalCases = criticalRows.map(parseCaseImages);

      return res.json({
        success: true,
        source: 'clinical_cases',
        form: {
          id: form.id,
          code: form.code,
          title: form.title,
          theme_color: form.theme_color
        },
        targetDate,
        summary: {
          total_cases: transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length,
          total_transfer: transferCases.length,
          total_surgery: surgeryCases.length,
          total_death: deathCases.length,
          total_critical: criticalCases.length
        },
        data: {
          transferCases,
          surgeryCases,
          deathCases,
          criticalCases
        }
      });
    }

    // ==========================================
    // SOURCE 3: Examination Metrics (Thống kê khám & điều trị 12 khoa)
    // ==========================================
    if (source === 'examination_metrics') {
      const [reports] = await pool.execute(
        `SELECT r.id, r.department_code, u.department_name, r.doctor_name, r.nurse_name, r.report_data, r.status
         FROM reports r
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ?`,
        [targetDate]
      );

      let totalKham = 0;
      let totalCu = 0;
      let totalMoi = 0;
      let totalXuat = 0;
      let totalChuyen = 0;
      let totalHienCon = 0;
      let totalTuVong = 0;
      let totalMo = 0;
      let totalXetNghiem = 0;
      let totalSieuAm = 0;
      let totalXquang = 0;
      let totalCT = 0;

      const deptBreakdown = [];

      (reports || []).forEach(r => {
        const raw = safeParse(r.report_data, {});
        
        // Extract metrics flexibly across department structures
        const getNum = (key) => {
          if (raw[key] !== undefined && raw[key] !== null && raw[key] !== '') {
            return Number(raw[key]) || 0;
          }
          return 0;
        };

        const deptKham = getNum('tongSoKham') || getNum('tongSo') || getNum('soCaKham') || getNum('pk21_tongSo') || (raw.khoiNoi ? Number(raw.khoiNoi.tongSo || 0) : 0);
        const deptCu = getNum('benhCu') || (raw.khoiNoi ? Number(raw.khoiNoi.benhCu || 0) : 0);
        const deptMoi = getNum('benhMoi') || (raw.khoiNoi ? Number(raw.khoiNoi.benhMoi || 0) : 0);
        const deptXuat = getNum('xuatVien') || (raw.khoiNoi ? Number(raw.khoiNoi.xuatVien || 0) : 0);
        const deptChuyen = getNum('chuyenVien') || (raw.khoiNoi ? Number(raw.khoiNoi.chuyenVien || 0) : 0);
        const deptHienCon = getNum('hienCon') || getNum('hienCo') || (raw.khoiNoi ? Number(raw.khoiNoi.hienCon || 0) : 0);
        const deptTuVong = getNum('tuVong') || (raw.khoiNoi ? Number(raw.khoiNoi.tuVong || 0) : 0);
        const deptMo = getNum('tongSoCaMo') || 0;
        const deptXN = getNum('tongXetNghiem') || 0;
        const deptSA = getNum('tongSoSieuAm') || 0;
        const deptXQ = getNum('tongSoXquang') || 0;
        const deptCT = getNum('tongSoCT') || 0;

        totalKham += deptKham;
        totalCu += deptCu;
        totalMoi += deptMoi;
        totalXuat += deptXuat;
        totalChuyen += deptChuyen;
        totalHienCon += deptHienCon;
        totalTuVong += deptTuVong;
        totalMo += deptMo;
        totalXetNghiem += deptXN;
        totalSieuAm += deptSA;
        totalXquang += deptXQ;
        totalCT += deptCT;

        deptBreakdown.push({
          department_code: r.department_code,
          department_name: r.department_name || r.department_code,
          doctor_name: r.doctor_name,
          nurse_name: r.nurse_name,
          kham: deptKham,
          benh_cu: deptCu,
          benh_moi: deptMoi,
          xuat_vien: deptXuat,
          chuyen_vien: deptChuyen,
          hien_con: deptHienCon,
          tu_vong: deptTuVong,
          ca_mo: deptMo,
          xet_nghiem: deptXN,
          sieu_am: deptSA,
          xquang: deptXQ,
          ct_scanner: deptCT
        });
      });

      return res.json({
        success: true,
        source: 'examination_metrics',
        form: {
          id: form.id,
          code: form.code,
          title: form.title,
          theme_color: form.theme_color
        },
        targetDate,
        summary: {
          total_departments_reported: reports.length,
          total_kham: totalKham,
          total_benh_cu: totalCu,
          total_benh_moi: totalMoi,
          total_xuat_vien: totalXuat,
          total_chuyen_vien: totalChuyen,
          total_hien_con: totalHienCon,
          total_tu_vong: totalTuVong,
          total_ca_mo: totalMo,
          total_xet_nghiem: totalXetNghiem,
          total_sieu_am: totalSieuAm,
          total_xquang: totalXquang,
          total_ct_scanner: totalCT
        },
        data: deptBreakdown
      });
    }

    // Default generic submissions
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
      source: 'custom_submissions',
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

// 9. Universal Live Data Tracker Feed (For any embedded tracker widgets)
const getUniversalTrackerFeed = async (req, res, next) => {
  try {
    const { source, date, department_code, form_code } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // SOURCE A: OVERTIME STAFF
    if (source === 'overtime_staff' || source === 'tracker_overtime') {
      let query = `
        SELECT r.id, r.department_code, u.department_name, r.doctor_name, r.nurse_name, r.overtime_staff, r.shift_time, r.room
        FROM reports r
        LEFT JOIN users u ON r.department_code = u.department_code
        WHERE r.report_date = ?
      `;
      const params = [targetDate];

      if (department_code && department_code !== 'all') {
        query += ' AND r.department_code = ?';
        params.push(department_code);
      }

      const [reports] = await pool.execute(query, params);

      const overtimeList = [];
      (reports || []).forEach(r => {
        const safeOvertime = safeParse(r.overtime_staff, []);
        if (Array.isArray(safeOvertime) && safeOvertime.length > 0) {
          safeOvertime.forEach(ot => {
            if (ot && (ot.staffName || ot.staff_name || ot.time)) {
              overtimeList.push({
                report_id: r.id,
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
        source: 'overtime_staff',
        targetDate,
        department_code: department_code || 'all',
        total_staff: overtimeList.length,
        total_departments: reports.length,
        data: overtimeList
      });
    }

    // SOURCE B: CLINICAL CASES & STATS
    if (source === 'clinical_cases' || source === 'clinical_stats' || source === 'tracker_clinical_stats' || source === 'tracker_clinical_cases') {
      let deptFilter = '';
      const params = [targetDate];

      if (department_code && department_code !== 'all') {
        deptFilter = ' AND r.department_code = ?';
        params.push(department_code);
      }

      // 1. Transfer cases
      const [transferRows] = await pool.execute(
        `SELECT t.*, r.department_code, u.department_name, r.doctor_name, r.nurse_name 
         FROM transfer_cases t
         JOIN reports r ON t.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ? ${deptFilter}
         ORDER BY t.id ASC`,
        params
      );

      // 2. Surgery cases
      const [surgeryRows] = await pool.execute(
        `SELECT s.*, r.department_code, u.department_name, r.doctor_name, r.nurse_name 
         FROM surgery_cases s
         JOIN reports r ON s.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ? ${deptFilter}
         ORDER BY s.id ASC`,
        params
      );

      // 3. Death cases
      const [deathRows] = await pool.execute(
        `SELECT d.*, r.department_code, u.department_name, r.doctor_name, r.nurse_name 
         FROM death_cases d
         JOIN reports r ON d.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ? ${deptFilter}
         ORDER BY d.id ASC`,
        params
      );

      // 4. Critical cases
      const [criticalRows] = await pool.execute(
        `SELECT c.*, r.department_code, u.department_name, r.doctor_name, r.nurse_name 
         FROM critical_cases c
         JOIN reports r ON c.report_id = r.id
         LEFT JOIN users u ON r.department_code = u.department_code
         WHERE r.report_date = ? ${deptFilter}
         ORDER BY c.id ASC`,
        params
      );

      const transferCases = transferRows.map(parseCaseImages);
      const surgeryCases = surgeryRows.map(parseCaseImages);
      const deathCases = deathRows.map(parseCaseImages);
      const criticalCases = criticalRows.map(parseCaseImages);

      return res.json({
        success: true,
        source: 'clinical_cases',
        targetDate,
        department_code: department_code || 'all',
        summary: {
          total_cases: transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length,
          total_transfer: transferCases.length,
          total_surgery: surgeryCases.length,
          total_death: deathCases.length,
          total_critical: criticalCases.length
        },
        data: {
          transferCases,
          surgeryCases,
          deathCases,
          criticalCases
        }
      });
    }

    // SOURCE C: LINKED FORM SUBMISSIONS
    if (source === 'linked_form' || source === 'tracker_linked_form' || form_code) {
      const targetFormCode = form_code || source;
      const [forms] = await pool.execute('SELECT * FROM custom_forms WHERE code = ?', [targetFormCode]);
      if (forms.length === 0) {
        return res.json({ success: true, source: 'linked_form', data: [] });
      }

      const form = forms[0];
      const [submissions] = await pool.execute(
        `SELECT s.*, 
                CASE 
                  WHEN s.department_code = 'personal' THEN 'Tài khoản cá nhân'
                  WHEN su.department_name IS NOT NULL THEN su.department_name
                  WHEN u.department_name IS NOT NULL THEN u.department_name
                  ELSE s.department_code 
                END as department_name,
                COALESCE(su.full_name, s.submitted_by_user) as user_full_name
         FROM custom_form_submissions s
         LEFT JOIN users u ON s.department_code = u.department_code
         LEFT JOIN system_users su ON (s.submitted_by_user = su.username OR s.submitted_by_user = su.full_name)
         WHERE s.form_id = ? AND DATE(s.submission_date) = DATE(?)
         ORDER BY s.created_at DESC`,
        [form.id, targetDate]
      );

      return res.json({
        success: true,
        source: 'linked_form',
        targetDate,
        form: {
          id: form.id,
          code: form.code,
          title: form.title,
          theme_color: form.theme_color,
          schema_json: safeParse(form.schema_json, [])
        },
        data: submissions.map(s => ({
          ...s,
          submission_data: safeParse(s.submission_data, {})
        }))
      });
    }

    res.json({ success: false, error: 'Không tìm thấy nguồn dữ liệu tracker yêu cầu.' });
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
  deleteFormSubmission,
  updateFormSubmission,
  getTrackerData,
  getUniversalTrackerFeed
};
