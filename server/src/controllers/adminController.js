const pool = require('../config/db');

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

const DEPARTMENT_ORDER = [
  'lck',
  'xn',
  'cdha',
  'hscc_tnt',
  'noi',
  'nhi',
  'nhiem',
  'san',
  'yhct_phcn',
  'ngoai_th',
  'ctch',
  'gmhs'
];

const getPresentationData = async (req, res, next) => {
  try {
    const { date } = req.params;

    const [reports] = await pool.execute(
      `SELECT r.*, u.department_name 
       FROM reports r
       JOIN users u ON r.department_code = u.department_code
       WHERE r.report_date = ?`,
      [date]
    );

    const presentationData = [];

    for (const report of reports) {
      const [transferCases] = await pool.execute(
        'SELECT * FROM transfer_cases WHERE report_id = ?',
        [report.id]
      );
      const [surgeryCases] = await pool.execute(
        'SELECT * FROM surgery_cases WHERE report_id = ?',
        [report.id]
      );
      const [deathCases] = await pool.execute(
        'SELECT * FROM death_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );
      const [criticalCases] = await pool.execute(
        'SELECT * FROM critical_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );

      let overtimeStaff = report.overtime_staff;
      if (typeof overtimeStaff === 'string') {
        try { overtimeStaff = JSON.parse(overtimeStaff); } catch (e) { overtimeStaff = []; }
      }

      presentationData.push({
        ...report,
        overtime_staff: overtimeStaff,
        transferCases: (transferCases || []).map(parseCaseImages),
        surgeryCases: (surgeryCases || []).map(parseCaseImages),
        deathCases: (deathCases || []).map(parseCaseImages),
        criticalCases: (criticalCases || []).map(parseCaseImages)
      });
    }

    // Sort by official 12-department sequence
    presentationData.sort((a, b) => {
      const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
      const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    res.json({ success: true, data: presentationData });
  } catch (error) {
    next(error);
  }
};

const getDepartmentStatus = async (req, res, next) => {
  try {
    const { date } = req.params;

    const [users] = await pool.execute(
      "SELECT department_code, department_name FROM users WHERE role = 'department'"
    );

    const [reports] = await pool.execute(
      'SELECT department_code, status FROM reports WHERE report_date = ?',
      [date]
    );

    const reportMap = {};
    reports.forEach(r => {
      reportMap[r.department_code] = r.status;
    });

    const statusData = users.map(user => ({
      departmentCode: user.department_code,
      departmentName: user.department_name,
      status: reportMap[user.department_code] || 'not_submitted'
    }));

    // Sort by official 12-department sequence
    statusData.sort((a, b) => {
      const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
      const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    res.json({ success: true, data: statusData });
  } catch (error) {
    next(error);
  }
};

const getDatabaseStats = async (req, res, next) => {
  try {
    let dbName = process.env.DB_NAME || 'hospital_report';
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        dbName = url.pathname.replace('/', '') || dbName;
      } catch (e) {
        // keep fallback dbName
      }
    }

    // Tự động làm mới thống kê InnoDB để cập nhật dung lượng ảnh và bản ghi mới tức thì
    try {
      await pool.query('ANALYZE TABLE death_cases, transfer_cases, critical_cases, surgery_cases, reports, users, staff_members');
    } catch (analyzeErr) {
      // Bỏ qua nếu môi trường DB không cho phép ANALYZE
    }

    const [tables] = await pool.query(
      `SELECT 
         table_name AS tableName, 
         table_rows AS rowsCount,
         ROUND(((data_length + index_length) / 1024 / 1024), 3) AS sizeMb,
         ROUND(((data_length + index_length) / 1024), 2) AS sizeKb,
         ROUND((data_length / 1024), 2) AS dataSizeKb,
         ROUND((index_length / 1024), 2) AS indexSizeKb
       FROM information_schema.TABLES 
       WHERE table_schema = ? 
       ORDER BY (data_length + index_length) DESC`,
      [dbName]
    );

    // Lấy số dòng thực tế chính xác 100% cho từng bảng
    const enhancedTables = await Promise.all(
      tables.map(async (t) => {
        let exactRows = parseInt(t.rowsCount, 10) || 0;
        try {
          // Thoát tên bảng an toàn
          const validName = t.tableName.replace(/[^a-zA-Z0-9_]/g, '');
          if (validName) {
            const [cntRes] = await pool.query(`SELECT COUNT(*) AS total FROM \`${validName}\``);
            if (cntRes && cntRes[0] && cntRes[0].total !== undefined) {
              exactRows = Number(cntRes[0].total);
            }
          }
        } catch (cntErr) {
          // Dùng số ước tính từ information_schema nếu có lỗi
        }

        return {
          ...t,
          rowsCount: exactRows
        };
      })
    );

    const totalSizeMb = enhancedTables.reduce((acc, t) => acc + (parseFloat(t.sizeMb) || 0), 0);
    const totalRows = enhancedTables.reduce((acc, t) => acc + (parseInt(t.rowsCount, 10) || 0), 0);
    const maxLimitMb = 1024; // 1024 MB (1GB default limit)

    res.json({
      success: true,
      data: {
        databaseName: dbName,
        totalSizeMb: parseFloat(totalSizeMb.toFixed(3)),
        totalRows,
        maxLimitMb,
        usagePercentage: parseFloat(((totalSizeMb / maxLimitMb) * 100).toFixed(2)),
        tablesCount: enhancedTables.length,
        tables: enhancedTables
      }
    });
  } catch (error) {
    next(error);
  }
};

const { generateHospitalExcelReport } = require('../services/excelExportService');

const exportReports = async (req, res, next) => {
  try {
    const date = req.query.date || req.params.date;
    if (!date) {
      return res.status(400).json({ success: false, error: 'Thiếu tham số ngày báo cáo (date=YYYY-MM-DD)' });
    }

    const [deptUsers] = await pool.execute(
      "SELECT department_code, department_name FROM users WHERE role = 'department'"
    );

    const [reports] = await pool.execute(
      `SELECT r.*, u.department_name 
       FROM reports r
       JOIN users u ON r.department_code = u.department_code
       WHERE r.report_date = ?`,
      [date]
    );

    const detailedReports = [];
    for (const report of reports) {
      const [transferCases] = await pool.execute(
        'SELECT * FROM transfer_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );
      const [surgeryCases] = await pool.execute(
        'SELECT * FROM surgery_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );
      const [deathCases] = await pool.execute(
        'SELECT * FROM death_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );
      const [criticalCases] = await pool.execute(
        'SELECT * FROM critical_cases WHERE report_id = ? ORDER BY id ASC',
        [report.id]
      );

      let overtimeStaff = report.overtime_staff;
      if (typeof overtimeStaff === 'string') {
        try { overtimeStaff = JSON.parse(overtimeStaff); } catch (e) { overtimeStaff = []; }
      }

      let reportData = report.report_data;
      if (typeof reportData === 'string') {
        try { reportData = JSON.parse(reportData); } catch (e) { reportData = {}; }
      }

      detailedReports.push({
        ...report,
        report_data: reportData,
        overtime_staff: overtimeStaff,
        transferCases: (transferCases || []).map(parseCaseImages),
        surgeryCases: (surgeryCases || []).map(parseCaseImages),
        deathCases: (deathCases || []).map(parseCaseImages),
        criticalCases: (criticalCases || []).map(parseCaseImages)
      });
    }

    const workbook = await generateHospitalExcelReport(date, deptUsers, detailedReports);
    const filename = `Bao_Cao_Giao_Ban_Tong_Hop_${date}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

const bcrypt = require('bcryptjs');

const OFFICIAL_DEPARTMENTS = [
  { code: 'lck', username: 'lck.bvbl', name: 'Khoa Liên Chuyên Khoa' },
  { code: 'xn', username: 'xn.bvbl', name: 'Khoa Xét nghiệm' },
  { code: 'cdha', username: 'cdha.bvbl', name: 'Chẩn đoán hình ảnh' },
  { code: 'hscc_tnt', username: 'hscc.bvbl', name: 'Hồi sức cấp cứu – Thận nhân tạo' },
  { code: 'noi', username: 'noi.bvbl', name: 'Khoa Nội tổng hợp' },
  { code: 'nhi', username: 'nhi.bvbl', name: 'Khoa Nhi' },
  { code: 'nhiem', username: 'nhiem.bvbl', name: 'Khoa Truyền nhiễm' },
  { code: 'san', username: 'san.bvbl', name: 'Khoa Sản (CSSK Sinh sản)' },
  { code: 'yhct_phcn', username: 'yhct.bvbl', name: 'Y học cổ truyền – PHCN' },
  { code: 'ngoai_th', username: 'ngoai.bvbl', name: 'Ngoại tổng hợp' },
  { code: 'ctch', username: 'ctch.bvbl', name: 'Chấn thương chỉnh hình' },
  { code: 'gmhs', username: 'gmhs.bvbl', name: 'Phẫu thuật, gây mê hồi sức' }
];

const DEFAULT_HASH_123 = '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa'; // 123

const getAllAccounts = async (req, res, next) => {
  try {
    // 1. Fetch current users
    let [users] = await pool.execute(
      'SELECT id, username, department_code, department_name, role FROM users'
    );

    // 2. Ensure all 12 official department accounts exist in DB
    const existingDeptCodes = new Set(users.map(u => u.department_code));
    const existingUsernames = new Set(users.map(u => u.username?.toLowerCase()));

    for (const dept of OFFICIAL_DEPARTMENTS) {
      if (!existingDeptCodes.has(dept.code)) {
        try {
          const username = existingUsernames.has(dept.username.toLowerCase()) 
            ? `${dept.code}.bvbl` 
            : dept.username;

          await pool.execute(
            'INSERT INTO users (username, password_hash, department_code, department_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, DEFAULT_HASH_123, dept.code, dept.name, 'department']
          );
        } catch (seedErr) {
          console.warn(`Seed notice for ${dept.code}:`, seedErr.message);
        }
      }
    }

    // Re-fetch clean list after auto-seed
    [users] = await pool.execute(
      'SELECT id, username, department_code, department_name, role FROM users'
    );

    // 3. Sort according to official 12-department sequence, admin first
    users.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
      const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateAccountPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).trim() === '') {
      return res.status(400).json({ success: false, error: 'Mật khẩu mới không được để trống' });
    }

    const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản người dùng' });
    }

    const password_hash = await bcrypt.hash(String(newPassword).trim(), 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);

    res.json({
      success: true,
      message: `Đã cập nhật mật khẩu thành công cho tài khoản "${existing[0].username}" (${existing[0].department_name})!`
    });
  } catch (error) {
    next(error);
  }
};

const resetAccountPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const defaultPassword = req.body.defaultPassword || '123';

    const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản người dùng' });
    }

    const password_hash = await bcrypt.hash(String(defaultPassword).trim(), 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);

    res.json({
      success: true,
      message: `Đã đặt lại mật khẩu về "${defaultPassword}" cho tài khoản "${existing[0].username}"!`
    });
  } catch (error) {
    next(error);
  }
};

const updateAccountDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, department_name, department_code, role, newPassword } = req.body;

    const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
    }

    let query = 'UPDATE users SET username = ?, department_name = ?, department_code = ?, role = ?';
    const params = [
      username || existing[0].username,
      department_name || existing[0].department_name,
      department_code || existing[0].department_code,
      role || existing[0].role
    ];

    if (newPassword && String(newPassword).trim() !== '') {
      const password_hash = await bcrypt.hash(String(newPassword).trim(), 10);
      query += ', password_hash = ?';
      params.push(password_hash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    const [updated] = await pool.execute('SELECT id, username, department_code, department_name, role FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Đã cập nhật thông tin tài khoản "${updated[0].username}" thành công!`,
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { username, password, department_code, department_name, role } = req.body;

    if (!username || !password || !department_code || !department_name) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin tài khoản và mật khẩu' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Tên đăng nhập đã tồn tại trên hệ thống' });
    }

    const password_hash = await bcrypt.hash(String(password).trim(), 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, department_code, department_name, role) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), password_hash, department_code.trim(), department_name.trim(), role || 'department']
    );

    res.json({
      success: true,
      message: `Đã tạo tài khoản "${username}" thành công!`,
      data: { id: result.insertId, username, department_code, department_name, role: role || 'department' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getPresentationData, 
  getDepartmentStatus, 
  getDatabaseStats, 
  exportReports,
  getAllAccounts,
  updateAccountPassword,
  resetAccountPassword,
  updateAccountDetails,
  createAccount
};
