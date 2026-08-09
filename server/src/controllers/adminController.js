const pool = require('../config/db');

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
      
      presentationData.push({
        ...report,
        transferCases
      });
    }

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

    const totalSizeMb = tables.reduce((acc, t) => acc + (parseFloat(t.sizeMb) || 0), 0);
    const totalRows = tables.reduce((acc, t) => acc + (parseInt(t.rowsCount, 10) || 0), 0);
    const maxLimitMb = 1024; // 1024 MB (1GB default limit)

    res.json({
      success: true,
      data: {
        databaseName: dbName,
        totalSizeMb: parseFloat(totalSizeMb.toFixed(3)),
        totalRows,
        maxLimitMb,
        usagePercentage: parseFloat(((totalSizeMb / maxLimitMb) * 100).toFixed(2)),
        tablesCount: tables.length,
        tables
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPresentationData, getDepartmentStatus, getDatabaseStats };
