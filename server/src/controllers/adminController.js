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

module.exports = { getPresentationData, getDepartmentStatus };
