const pool = require('../config/db');
const bcrypt = require('bcryptjs');

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

const OFFICIAL_DEPARTMENTS = [
  { code: 'lck', username: 'lck.bvbl', name: 'Khoa Liên Chuyên Khoa' },
  { code: 'xn', username: 'xn.bvbl', name: 'Khoa Xét nghiệm' },
  { code: 'cdha', username: 'cdha.bvbl', name: 'Chẩn đoán hình ảnh' },
  { code: 'hscc_tnt', username: 'hscc.bvbl', name: 'Hồi sức cấp cứu – Thận nhân tạo' },
  { code: 'noi', username: 'noi.bvbl', name: 'Khoa Nội' },
  { code: 'nhi', username: 'nhi.bvbl', name: 'Nhi' },
  { code: 'nhiem', username: 'nhiem.bvbl', name: 'Nhiễm' },
  { code: 'san', username: 'san.bvbl', name: 'Sản' },
  { code: 'yhct_phcn', username: 'yhct.bvbl', name: 'Y học cổ truyền – Phục hồi chức năng' },
  { code: 'ngoai_th', username: 'ngoai.bvbl', name: 'Ngoại tổng hợp' },
  { code: 'ctch', username: 'ctch.bvbl', name: 'Chấn thương chỉnh hình' },
  { code: 'gmhs', username: 'gmhs.bvbl', name: 'Gây mê Hồi sức' }
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

    if (!reports || reports.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const reportIds = reports.map(r => r.id);
    const placeholders = reportIds.map(() => '?').join(',');

    // Parallel Batch Queries (Replaces 48 round trips with 4 single queries)
    const [
      [allTransfers],
      [allSurgeries],
      [allDeaths],
      [allCriticals]
    ] = await Promise.all([
      pool.query(`SELECT * FROM transfer_cases WHERE report_id IN (${placeholders})`, reportIds),
      pool.query(`SELECT * FROM surgery_cases WHERE report_id IN (${placeholders})`, reportIds),
      pool.query(`SELECT * FROM death_cases WHERE report_id IN (${placeholders}) ORDER BY id ASC`, reportIds),
      pool.query(`SELECT * FROM critical_cases WHERE report_id IN (${placeholders}) ORDER BY id ASC`, reportIds)
    ]);

    // In-memory Grouping by report_id (O(1) lookups)
    const transfersByReportId = new Map();
    const surgeriesByReportId = new Map();
    const deathsByReportId = new Map();
    const criticalsByReportId = new Map();

    (allTransfers || []).forEach(t => {
      if (!transfersByReportId.has(t.report_id)) transfersByReportId.set(t.report_id, []);
      transfersByReportId.get(t.report_id).push(parseCaseImages(t));
    });

    (allSurgeries || []).forEach(s => {
      if (!surgeriesByReportId.has(s.report_id)) surgeriesByReportId.set(s.report_id, []);
      surgeriesByReportId.get(s.report_id).push(parseCaseImages(s));
    });

    (allDeaths || []).forEach(d => {
      if (!deathsByReportId.has(d.report_id)) deathsByReportId.set(d.report_id, []);
      deathsByReportId.get(d.report_id).push(parseCaseImages(d));
    });

    (allCriticals || []).forEach(c => {
      if (!criticalsByReportId.has(c.report_id)) criticalsByReportId.set(c.report_id, []);
      criticalsByReportId.get(c.report_id).push(parseCaseImages(c));
    });

    const presentationData = reports.map(report => {
      let overtimeStaff = report.overtime_staff;
      if (typeof overtimeStaff === 'string') {
        try { overtimeStaff = JSON.parse(overtimeStaff); } catch (e) { overtimeStaff = []; }
      }

      return {
        ...report,
        overtime_staff: overtimeStaff,
        transferCases: transfersByReportId.get(report.id) || [],
        transfer_cases: transfersByReportId.get(report.id) || [],
        surgeryCases: surgeriesByReportId.get(report.id) || [],
        surgery_cases: surgeriesByReportId.get(report.id) || [],
        deathCases: deathsByReportId.get(report.id) || [],
        death_cases: deathsByReportId.get(report.id) || [],
        criticalCases: criticalsByReportId.get(report.id) || [],
        critical_cases: criticalsByReportId.get(report.id) || []
      };
    });

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

    if (pool.ensureSchema) {
      try { await pool.ensureSchema(); } catch (e) {}
    }

    let users = [];
    try {
      const [dbUsers] = await pool.execute(
        "SELECT department_code, department_name FROM users WHERE role = 'department'"
      );
      users = dbUsers || [];
    } catch (userErr) {
      users = [];
    }

    // Merge DB users with official 12-department definitions so all 12 are always present
    const deptMap = new Map();
    OFFICIAL_DEPARTMENTS.forEach(d => {
      deptMap.set(d.code, { department_code: d.code, department_name: d.name });
    });
    users.forEach(u => {
      deptMap.set(u.department_code, { department_code: u.department_code, department_name: u.department_name });
    });
    const allDepts = Array.from(deptMap.values());

    let reports = [];
    try {
      const [res] = await pool.execute(
        'SELECT id, department_code, doctor_name, status, is_locked, locked_at, locked_by FROM reports WHERE report_date = ?',
        [date]
      );
      reports = res || [];
    } catch (e) {
      try {
        const [res] = await pool.execute(
          'SELECT id, department_code, doctor_name, status FROM reports WHERE report_date = ?',
          [date]
        );
        reports = (res || []).map(r => ({ ...r, is_locked: 0, locked_at: null, locked_by: null }));
      } catch (e2) {
        reports = [];
      }
    }

    const reportMap = {};
    const reportInfoMap = {};
    reports.forEach(r => {
      reportMap[r.department_code] = r.status;
      reportInfoMap[r.department_code] = {
        id: r.id,
        doctorName: r.doctor_name,
        isLocked: Boolean(r.is_locked),
        lockedAt: r.locked_at,
        lockedBy: r.locked_by
      };
    });

    const reportIds = reports.map(r => r.id).filter(Boolean);
    let transferCounts = {}, surgeryCounts = {}, deathCounts = {}, criticalCounts = {};

    if (reportIds.length > 0) {
      try {
        const placeholders = reportIds.map(() => '?').join(',');
        const [
          [tcRows],
          [scRows],
          [dcRows],
          [ccRows]
        ] = await Promise.all([
          pool.query(`SELECT report_id, COUNT(*) as cnt FROM transfer_cases WHERE report_id IN (${placeholders}) GROUP BY report_id`, reportIds),
          pool.query(`SELECT report_id, COUNT(*) as cnt FROM surgery_cases WHERE report_id IN (${placeholders}) GROUP BY report_id`, reportIds),
          pool.query(`SELECT report_id, COUNT(*) as cnt FROM death_cases WHERE report_id IN (${placeholders}) GROUP BY report_id`, reportIds),
          pool.query(`SELECT report_id, COUNT(*) as cnt FROM critical_cases WHERE report_id IN (${placeholders}) GROUP BY report_id`, reportIds)
        ]);

        (tcRows || []).forEach(r => { transferCounts[r.report_id] = r.cnt; });
        (scRows || []).forEach(r => { surgeryCounts[r.report_id] = r.cnt; });
        (dcRows || []).forEach(r => { deathCounts[r.report_id] = r.cnt; });
        (ccRows || []).forEach(r => { criticalCounts[r.report_id] = r.cnt; });
      } catch (countErr) {
        console.warn('Could not query case counts:', countErr.message);
      }
    }

    const statusData = allDepts.map(user => {
      const info = reportInfoMap[user.department_code] || {};
      const rId = info.id;
      return {
        departmentCode: user.department_code,
        departmentName: user.department_name,
        status: reportMap[user.department_code] || 'not_submitted',
        doctorName: info.doctorName || '',
        isLocked: info.isLocked || false,
        lockedAt: info.lockedAt || null,
        lockedBy: info.lockedBy || null,
        transferCasesCount: rId ? (transferCounts[rId] || 0) : 0,
        surgeryCasesCount: rId ? (surgeryCounts[rId] || 0) : 0,
        deathCasesCount: rId ? (deathCounts[rId] || 0) : 0,
        criticalCasesCount: rId ? (criticalCounts[rId] || 0) : 0
      };
    });

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

    const hospitalDataSizeMb = enhancedTables.reduce((acc, t) => acc + (parseFloat(t.sizeMb) || 0), 0);
    const totalRows = enhancedTables.reduce((acc, t) => acc + (parseInt(t.rowsCount, 10) || 0), 0);

    // 2. Tính toán dung lượng vật lý thực tế trên ổ đĩa máy chủ Aiven (Physical Storage)
    let physicalAllocatedMb = 76.16; // Mặc định dung lượng tablespace cấp phát cơ sở
    let systemTablesMb = 7.86;

    try {
      const [spaceRes] = await pool.query(
        'SELECT ROUND(SUM(allocated_size)/1024/1024, 2) AS total_allocated_mb FROM information_schema.INNODB_TABLESPACES'
      );
      if (spaceRes && spaceRes[0] && spaceRes[0].total_allocated_mb) {
        physicalAllocatedMb = parseFloat(spaceRes[0].total_allocated_mb) || physicalAllocatedMb;
      }
    } catch (e) {}

    try {
      const [schemaRes] = await pool.query(
        "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 3) AS sys_size_mb FROM information_schema.TABLES WHERE table_schema IN ('mysql', 'sys', 'performance_schema')"
      );
      if (schemaRes && schemaRes[0] && schemaRes[0].sys_size_mb) {
        systemTablesMb = parseFloat(schemaRes[0].sys_size_mb) || systemTablesMb;
      }
    } catch (e) {}

    // Trên máy chủ Aiven MySQL Cloud (Gói Tiêu Chuẩn 1024 MB = 1.0 GB):
    // Dung lượng ổ đĩa vật lý bao gồm:
    // - User Data & Index Tablespaces (hospital_report)
    // - System Tablespaces & Schema (mysql, sys)
    // - Undo Logs (innodb_undo_001, innodb_undo_002 ~32MB)
    // - Redo Log Files & Temporary Tablespace (~76MB)
    // - Binary Logs, Error Logs & Runtime Base Footprint của Node Aiven (~220MB)
    const baseAivenFootprintMb = 220.0;
    const physicalUsedMb = parseFloat((baseAivenFootprintMb + physicalAllocatedMb + hospitalDataSizeMb).toFixed(1));
    const maxLimitMb = 1024.0; // 1024 MB (1.0 GB Gói Aiven)
    const freeSpaceMb = parseFloat(Math.max(0, maxLimitMb - physicalUsedMb).toFixed(1));
    const usagePercentage = parseFloat(((physicalUsedMb / maxLimitMb) * 100).toFixed(1));

    // Đánh giá mức độ an toàn theo tiêu chuẩn:
    // < 70%: An toàn (Xanh lá), 70% - 85%: Cảnh báo (Cam/Vàng), > 85%: Nguy hiểm (Đỏ)
    let statusLevel = 'safe';
    let statusText = 'An toàn';
    if (usagePercentage >= 85) {
      statusLevel = 'danger';
      statusText = 'Nguy hiểm (Nguy cơ đầy ổ đĩa làm gián đoạn hệ thống)';
    } else if (usagePercentage >= 70) {
      statusLevel = 'warning';
      statusText = 'Cảnh báo (Dung lượng cao, cần theo dõi)';
    } else {
      statusText = 'An toàn (Đang hoạt động ổn định)';
    }

    res.json({
      success: true,
      data: {
        databaseName: dbName,
        // Thông số ổ đĩa vật lý máy chủ Aiven (Physical Storage)
        physicalStorage: {
          usedMb: physicalUsedMb,
          totalMb: maxLimitMb,
          freeMb: freeSpaceMb,
          usagePercentage,
          statusLevel,
          statusText,
          breakdown: {
            hospitalDataMb: parseFloat(hospitalDataSizeMb.toFixed(3)),
            tablespacesMb: physicalAllocatedMb,
            systemTablesMb: systemTablesMb,
            baseRuntimeMb: baseAivenFootprintMb
          }
        },
        totalDataSizeMb: parseFloat(hospitalDataSizeMb.toFixed(3)),
        totalRows,
        maxLimitMb,
        usagePercentage,
        tablesCount: enhancedTables.length,
        tables: enhancedTables
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API: GET /api/admin/reports-payload-size?date=YYYY-MM-DD
 * Tính toán dung lượng phát sinh chi tiết theo từng khoa trong ngày (Văn bản & Hình ảnh)
 */
const getReportsPayloadSize = async (req, res, next) => {
  try {
    const date = req.query.date || req.params.date;
    if (!date) {
      return res.status(400).json({ success: false, error: 'Thiếu tham số ngày báo cáo (date=YYYY-MM-DD)' });
    }

    const [users] = await pool.execute(
      "SELECT department_code, department_name FROM users WHERE role = 'department'"
    );

    const [reports] = await pool.execute(
      `SELECT r.*, u.department_name 
       FROM reports r
       JOIN users u ON r.department_code = u.department_code
       WHERE r.report_date = ?`,
      [date]
    );

    const deptPayloads = [];
    let grandTotalTextBytes = 0;
    let grandTotalImageBytes = 0;

    const reportIds = (reports || []).map(r => r.id);
    const transfersByReportId = new Map();
    const surgeriesByReportId = new Map();
    const deathsByReportId = new Map();
    const criticalsByReportId = new Map();

    if (reportIds.length > 0) {
      const placeholders = reportIds.map(() => '?').join(',');
      const [
        [allTransfers],
        [allSurgeries],
        [allDeaths],
        [allCriticals]
      ] = await Promise.all([
        pool.query(`SELECT * FROM transfer_cases WHERE report_id IN (${placeholders})`, reportIds),
        pool.query(`SELECT * FROM surgery_cases WHERE report_id IN (${placeholders})`, reportIds),
        pool.query(`SELECT * FROM death_cases WHERE report_id IN (${placeholders})`, reportIds),
        pool.query(`SELECT * FROM critical_cases WHERE report_id IN (${placeholders})`, reportIds)
      ]);

      (allTransfers || []).forEach(t => {
        if (!transfersByReportId.has(t.report_id)) transfersByReportId.set(t.report_id, []);
        transfersByReportId.get(t.report_id).push(t);
      });
      (allSurgeries || []).forEach(s => {
        if (!surgeriesByReportId.has(s.report_id)) surgeriesByReportId.set(s.report_id, []);
        surgeriesByReportId.get(s.report_id).push(s);
      });
      (allDeaths || []).forEach(d => {
        if (!deathsByReportId.has(d.report_id)) deathsByReportId.set(d.report_id, []);
        deathsByReportId.get(d.report_id).push(d);
      });
      (allCriticals || []).forEach(c => {
        if (!criticalsByReportId.has(c.report_id)) criticalsByReportId.set(c.report_id, []);
        criticalsByReportId.get(c.report_id).push(c);
      });
    }

    for (const u of users) {
      const report = reports.find(r => r.department_code === u.department_code);
      if (!report) {
        deptPayloads.push({
          departmentCode: u.department_code,
          departmentName: u.department_name,
          submitted: false,
          status: 'not_submitted',
          doctorName: null,
          nurseName: null,
          transferCasesCount: 0,
          surgeryCasesCount: 0,
          deathCasesCount: 0,
          criticalCasesCount: 0,
          totalCasesCount: 0,
          imagesCount: 0,
          textBytes: 0,
          imageBytes: 0,
          totalBytes: 0,
          textKb: 0,
          imageKb: 0,
          totalKb: 0,
          totalMb: 0,
          percentage: 0
        });
        continue;
      }

      // Read from O(1) in-memory maps instead of running DB queries in loop
      const transferCases = transfersByReportId.get(report.id) || [];
      const surgeryCases = surgeriesByReportId.get(report.id) || [];
      const deathCases = deathsByReportId.get(report.id) || [];
      const criticalCases = criticalsByReportId.get(report.id) || [];

      let textBytes = 0;
      let imageBytes = 0;
      let imagesCount = 0;

      // 1. Text from main report
      const headerStr = JSON.stringify({
        doctor_name: report.doctor_name,
        nurse_name: report.nurse_name,
        overtime_staff: report.overtime_staff,
        room: report.room,
        shift_time: report.shift_time,
        status: report.status
      });
      textBytes += Buffer.byteLength(headerStr, 'utf8');
      
      if (report.report_data) {
        const reportDataStr = typeof report.report_data === 'string' ? report.report_data : JSON.stringify(report.report_data);
        textBytes += Buffer.byteLength(reportDataStr, 'utf8');
      }

      // Helper to process cases
      const processCases = (casesList) => {
        for (const c of casesList) {
          const { images, image_url, imageUrl, ...textFields } = c;
          textBytes += Buffer.byteLength(JSON.stringify(textFields), 'utf8');

          const rawImages = images || image_url || imageUrl;
          if (rawImages) {
            let imgArr = [];
            if (typeof rawImages === 'string') {
              try {
                imgArr = JSON.parse(rawImages);
              } catch (e) {
                imgArr = [rawImages];
              }
            } else if (Array.isArray(rawImages)) {
              imgArr = rawImages;
            }

            for (const img of imgArr) {
              imagesCount++;
              if (typeof img === 'string') {
                imageBytes += Buffer.byteLength(img, 'utf8');
              } else if (typeof img === 'object' && img !== null) {
                imageBytes += Buffer.byteLength(JSON.stringify(img), 'utf8');
              }
            }
          }
        }
      };

      processCases(transferCases || []);
      processCases(surgeryCases || []);
      processCases(deathCases || []);
      processCases(criticalCases || []);

      const totalDeptBytes = textBytes + imageBytes;
      grandTotalTextBytes += textBytes;
      grandTotalImageBytes += imageBytes;

      deptPayloads.push({
        departmentCode: u.department_code,
        departmentName: u.department_name,
        submitted: true,
        status: report.status || 'submitted',
        doctorName: report.doctor_name,
        nurseName: report.nurse_name,
        transferCasesCount: (transferCases || []).length,
        surgeryCasesCount: (surgeryCases || []).length,
        deathCasesCount: (deathCases || []).length,
        criticalCasesCount: (criticalCases || []).length,
        totalCasesCount: (transferCases || []).length + (surgeryCases || []).length + (deathCases || []).length + (criticalCases || []).length,
        imagesCount,
        textBytes,
        imageBytes,
        totalBytes: totalDeptBytes,
        textKb: parseFloat((textBytes / 1024).toFixed(2)),
        imageKb: parseFloat((imageBytes / 1024).toFixed(2)),
        totalKb: parseFloat((totalDeptBytes / 1024).toFixed(2)),
        totalMb: parseFloat((totalDeptBytes / 1024 / 1024).toFixed(3)),
        percentage: 0
      });
    }

    const grandTotalBytes = grandTotalTextBytes + grandTotalImageBytes;

    // Calculate percentage
    deptPayloads.forEach(d => {
      d.percentage = grandTotalBytes > 0 ? parseFloat(((d.totalBytes / grandTotalBytes) * 100).toFixed(1)) : 0;
    });

    // Sort: submitted first (sorted by totalBytes desc), then not submitted (by official sequence)
    deptPayloads.sort((a, b) => {
      if (a.submitted && !b.submitted) return -1;
      if (!a.submitted && b.submitted) return 1;
      if (a.submitted && b.submitted) return b.totalBytes - a.totalBytes;
      const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
      const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    res.json({
      success: true,
      data: {
        date,
        grandTotalBytes,
        grandTotalKb: parseFloat((grandTotalBytes / 1024).toFixed(2)),
        grandTotalMb: parseFloat((grandTotalBytes / 1024 / 1024).toFixed(3)),
        grandTotalTextKb: parseFloat((grandTotalTextBytes / 1024).toFixed(2)),
        grandTotalImageKb: parseFloat((grandTotalImageBytes / 1024).toFixed(2)),
        submittedCount: deptPayloads.filter(d => d.submitted).length,
        totalDepartmentsCount: users.length,
        departments: deptPayloads
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

const getAuditLogs = async (req, res, next) => {
  try {
    const { date, departmentCode } = req.query;
    let sql = `
      SELECT a.*, u.department_name 
      FROM report_audit_logs a
      LEFT JOIN users u ON a.department_code = u.department_code
      WHERE 1=1
    `;
    const params = [];
    if (date) {
      sql += ' AND a.report_date = ?';
      params.push(date);
    }
    if (departmentCode) {
      sql += ' AND a.department_code = ?';
      params.push(departmentCode);
    }
    sql += ' ORDER BY a.created_at DESC LIMIT 100';

    const [logs] = await pool.execute(sql, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const toggleReportLock = async (req, res, next) => {
  try {
    const { departmentCode, date } = req.params;
    const { isLocked } = req.body;

    const [existing] = await pool.execute(
      'SELECT id, is_locked, doctor_name, nurse_name FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, date]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Khoa phòng này chưa nộp báo cáo cho ngày ${date}, không thể thực hiện khóa/mở khóa.`
      });
    }

    const report = existing[0];
    const newLockedStatus = isLocked !== undefined ? (isLocked ? 1 : 0) : (report.is_locked ? 0 : 1);
    const adminUser = req.user?.username || req.user?.doctor_name || 'Admin';
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

    await pool.execute(
      `UPDATE reports 
       SET is_locked = ?, locked_at = ${newLockedStatus ? 'NOW()' : 'NULL'}, locked_by = ? 
       WHERE id = ?`,
      [newLockedStatus, newLockedStatus ? adminUser : null, report.id]
    );

    // Write audit log
    try {
      const actionSummary = `[${newLockedStatus ? 'KHÓA SỔ GIAO BAN' : 'MỞ KHÓA BÁO CÁO'}] Admin "${adminUser}" đã ${newLockedStatus ? 'khóa sổ' : 'mở khóa'} báo cáo khoa ${departmentCode} ngày ${date}`;
      await pool.execute(
        `INSERT INTO report_audit_logs 
         (report_id, department_code, report_date, action_type, doctor_name, ip_address, changes_summary)
         VALUES (?, ?, ?, 'UPDATE', ?, ?, ?)`,
        [report.id, departmentCode, date, adminUser, clientIp, actionSummary]
      );
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr.message);
    }

    res.json({
      success: true,
      isLocked: Boolean(newLockedStatus),
      message: newLockedStatus 
        ? `Đã KHÓA SỔ báo cáo khoa ${departmentCode} ngày ${date} thành công!` 
        : `Đã MỞ KHÓA báo cáo khoa ${departmentCode} ngày ${date} thành công! Khoa phòng có thể chỉnh sửa lại số liệu.`
    });
  } catch (error) {
    next(error);
  }
};

const toggleLockAllReports = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { isLocked } = req.body;
    const lockVal = isLocked ? 1 : 0;
    const adminUser = req.user?.username || 'Admin';
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

    const [result] = await pool.execute(
      `UPDATE reports 
       SET is_locked = ?, locked_at = ${lockVal ? 'NOW()' : 'NULL'}, locked_by = ? 
       WHERE report_date = ?`,
      [lockVal, lockVal ? adminUser : null, date]
    );

    // Write audit log
    try {
      const actionSummary = `[${lockVal ? 'KHÓA SỔ TOÀN VIỆN' : 'MỞ KHÓA TOÀN VIỆN'}] Admin "${adminUser}" đã ${lockVal ? 'khóa sổ' : 'mở khóa'} toàn bộ báo cáo ngày ${date} (${result.affectedRows} khoa)`;
      await pool.execute(
        `INSERT INTO report_audit_logs 
         (report_id, department_code, report_date, action_type, doctor_name, ip_address, changes_summary)
         VALUES (0, 'ALL', ?, 'UPDATE', ?, ?, ?)`,
        [date, adminUser, clientIp, actionSummary]
      );
    } catch (auditErr) {}

    res.json({
      success: true,
      affectedRows: result.affectedRows,
      isLocked: Boolean(lockVal),
      message: lockVal 
        ? `Đã KHÓA SỔ TOÀN VIỆN cho ${result.affectedRows} báo cáo ngày ${date}!`
        : `Đã MỞ KHÓA TOÀN VIỆN cho ${result.affectedRows} báo cáo ngày ${date}!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getPresentationData, 
  getDepartmentStatus, 
  getDatabaseStats, 
  getReportsPayloadSize,
  getAuditLogs,
  exportReports,
  getAllAccounts,
  updateAccountPassword,
  resetAccountPassword,
  updateAccountDetails,
  createAccount,
  toggleReportLock,
  toggleLockAllReports
};
