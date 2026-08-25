const pool = require('../config/db');

const DEPARTMENT_NAMES = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét Nghiệm',
  cdha: 'Khoa Chẩn Đoán Hình Ảnh',
  hscc_tnt: 'Khoa Hồi Sức Cấp Cứu - Thận Nhân Tạo',
  noi: 'Khoa Nội Tổng Hợp',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Phụ Sản',
  yhct_phcn: 'Khoa Y Học Cổ Truyền - PHCN',
  ngoai_th: 'Khoa Ngoại Tổng Hợp',
  ctch: 'Khoa Chấn Thương Chỉnh Hình',
  gmhs: 'Khoa Gây Mê Hồi Sức'
};

const CORE_12_DEPTS = [
  'hscc_tnt', 'noi', 'ngoai_th', 'ctch', 'san', 'nhi', 'nhiem', 'gmhs', 'yhct_phcn', 'cdha', 'xn', 'lck'
];

/**
 * GET /api/admin/submission-history/shift-reports
 * Lịch sử nộp Báo Cáo Giao Ban 12 Khoa Phòng
 */
const getShiftReportHistory = async (req, res, next) => {
  try {
    const { date, startDate, endDate, departmentCode, searchTerm, status } = req.query;

    let targetDate = date || new Date().toISOString().split('T')[0];

    let whereClauses = [];
    let queryParams = [];

    // Date filtering
    if (startDate && endDate) {
      whereClauses.push('r.report_date BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    } else if (date) {
      whereClauses.push('r.report_date = ?');
      queryParams.push(date);
    }

    // Department filtering
    if (departmentCode && departmentCode !== 'all') {
      whereClauses.push('r.department_code = ?');
      queryParams.push(departmentCode);
    }

    // Search term (Doctor, Nurse, Department)
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      whereClauses.push('(r.doctor_name LIKE ? OR r.nurse_name LIKE ? OR r.department_code LIKE ? OR u.department_name LIKE ?)');
      queryParams.push(term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Fetch reports with case counts
    const sql = `
      SELECT 
        r.id,
        r.department_code,
        COALESCE(u.department_name, r.department_code) AS department_name,
        r.report_date,
        r.doctor_name,
        r.nurse_name,
        r.room,
        r.shift_time,
        r.is_locked,
        r.locked_at,
        r.locked_by,
        r.created_at,
        r.updated_at,
        r.report_data,
        u.avatar_url,
        (SELECT COUNT(*) FROM report_audit_logs ral WHERE ral.report_id = r.id) AS edit_count,
        (SELECT COUNT(*) FROM surgery_cases sc WHERE sc.report_id = r.id) AS surgery_count,
        (SELECT COUNT(*) FROM transfer_cases tc WHERE tc.report_id = r.id) AS transfer_count,
        (SELECT COUNT(*) FROM critical_cases cc WHERE cc.report_id = r.id) AS critical_count,
        (SELECT COUNT(*) FROM death_cases dc WHERE dc.report_id = r.id) AS death_count
      FROM reports r
      LEFT JOIN users u ON r.department_code = u.department_code
      ${whereSql}
      ORDER BY r.created_at DESC, r.report_date DESC
    `;

    const [rows] = await pool.execute(sql, queryParams);

    // Process rows to compute deadline punctuality & stats
    const processedHistory = rows.map(r => {
      // Determine if submitted on time (Standard: Submitted before 07:30 AM on handover day)
      let isOnTime = true;
      if (r.created_at) {
        const createdDate = new Date(r.created_at);
        const hours = createdDate.getHours();
        const minutes = createdDate.getMinutes();
        // If created on next day after 07:30 AM
        if (hours > 7 || (hours === 7 && minutes > 30)) {
          isOnTime = false;
        }
      }

      return {
        id: r.id,
        departmentCode: r.department_code,
        departmentName: DEPARTMENT_NAMES[r.department_code] || r.department_name,
        reportDate: r.report_date,
        doctorName: r.doctor_name || '',
        nurseName: r.nurse_name || '',
        room: r.room || '',
        shiftTime: r.shift_time || '24/24',
        isLocked: Boolean(r.is_locked),
        lockedAt: r.locked_at,
        lockedBy: r.locked_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        avatarUrl: r.avatar_url || '',
        editCount: Number(r.edit_count || 0),
        isOnTime,
        caseCounts: {
          surgery: Number(r.surgery_count || 0),
          transfer: Number(r.transfer_count || 0),
          critical: Number(r.critical_count || 0),
          death: Number(r.death_count || 0),
          total: Number(r.surgery_count || 0) + Number(r.transfer_count || 0) + Number(r.critical_count || 0) + Number(r.death_count || 0)
        }
      };
    });

    // 12-Department Status Matrix for targetDate
    const [dateReports] = await pool.execute(
      `SELECT r.id, r.department_code, r.doctor_name, r.nurse_name, r.is_locked, r.created_at, r.updated_at
       FROM reports r
       WHERE r.report_date = ?`,
      [targetDate]
    );

    const submittedMap = new Map();
    dateReports.forEach(dr => {
      submittedMap.set(dr.department_code, dr);
    });

    const matrix12Depts = CORE_12_DEPTS.map(code => {
      const report = submittedMap.get(code);
      return {
        departmentCode: code,
        departmentName: DEPARTMENT_NAMES[code] || code,
        isSubmitted: Boolean(report),
        reportId: report ? report.id : null,
        doctorName: report ? report.doctor_name : null,
        nurseName: report ? report.nurse_name : null,
        isLocked: report ? Boolean(report.is_locked) : false,
        submittedAt: report ? report.created_at : null,
        updatedAt: report ? report.updated_at : null
      };
    });

    const submittedCount = matrix12Depts.filter(d => d.isSubmitted).length;
    const pendingCount = matrix12Depts.length - submittedCount;

    res.json({
      success: true,
      data: {
        history: processedHistory,
        matrix12Depts,
        summary: {
          targetDate,
          totalSubmitted: submittedCount,
          totalPending: pendingCount,
          totalDepts: matrix12Depts.length,
          totalHistoryRecords: processedHistory.length,
          onTimeCount: processedHistory.filter(h => h.isOnTime).length,
          lateCount: processedHistory.filter(h => !h.isOnTime).length,
          lockedCount: processedHistory.filter(h => h.isLocked).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/submission-history/custom-forms
 * Lịch sử nộp Bản Ghi Biểu Mẫu Tùy Chỉnh (Custom Forms)
 */
const getCustomFormsHistory = async (req, res, next) => {
  try {
    const { date, startDate, endDate, formCode, formId, username, departmentCode, searchTerm } = req.query;

    let whereClauses = [];
    let queryParams = [];

    // Date filtering
    if (startDate && endDate) {
      whereClauses.push('cfs.submission_date BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    } else if (date) {
      whereClauses.push('cfs.submission_date = ?');
      queryParams.push(date);
    }

    // Form filter
    if (formId && formId !== 'all') {
      whereClauses.push('cfs.form_id = ?');
      queryParams.push(formId);
    } else if (formCode && formCode !== 'all') {
      whereClauses.push('cf.code = ?');
      queryParams.push(formCode);
    }

    // Submitter username
    if (username && username.trim()) {
      whereClauses.push('cfs.submitted_by_user = ?');
      queryParams.push(username.trim());
    }

    // Department filter
    if (departmentCode && departmentCode !== 'all') {
      whereClauses.push('cfs.department_code = ?');
      queryParams.push(departmentCode);
    }

    // Search term
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      whereClauses.push('(cf.title LIKE ? OR cf.code LIKE ? OR cfs.submitted_by_user LIKE ? OR su.full_name LIKE ? OR u.full_name LIKE ?)');
      queryParams.push(term, term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        cfs.id,
        cfs.form_id,
        cf.code AS form_code,
        cf.title AS form_title,
        cf.form_type,
        cf.theme_color,
        cfs.submitted_by_user,
        COALESCE(su.full_name, u.full_name, cfs.submitted_by_user) AS submitted_by_name,
        cfs.department_code,
        COALESCE(su.department_name, u.department_name, cfs.department_code) AS department_name,
        COALESCE(su.avatar_url, u.avatar_url, '') AS avatar_url,
        cfs.submission_date,
        cfs.status,
        cfs.submission_data,
        cfs.created_at,
        cfs.updated_at
      FROM custom_form_submissions cfs
      JOIN custom_forms cf ON cfs.form_id = cf.id
      LEFT JOIN system_users su ON cfs.submitted_by_user = su.username
      LEFT JOIN users u ON cfs.submitted_by_user = u.username
      ${whereSql}
      ORDER BY cfs.created_at DESC
    `;

    const [rows] = await pool.execute(sql, queryParams);

    // List of active custom forms for dropdown filter
    const [formsList] = await pool.execute(
      `SELECT cf.id, cf.code, cf.title, cf.form_type, cf.theme_color,
              (SELECT COUNT(*) FROM custom_form_submissions cfs WHERE cfs.form_id = cf.id) AS total_submissions
       FROM custom_forms cf
       WHERE cf.is_active = 1
       ORDER BY cf.title ASC`
    );

    // Today's total count
    const today = new Date().toISOString().split('T')[0];
    const [todayCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM custom_form_submissions WHERE submission_date = ?',
      [today]
    );

    res.json({
      success: true,
      data: {
        history: rows,
        formsList,
        summary: {
          totalSubmissions: rows.length,
          todaySubmissionsCount: todayCount[0]?.count || 0,
          totalFormsActive: formsList.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShiftReportHistory,
  getCustomFormsHistory
};
