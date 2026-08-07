const pool = require('../config/db');

const createOrUpdateReport = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { departmentCode, reportDate, doctorName, room, shiftTime, reportData, status, transferCases } = req.body;

    // Check if report exists
    const [existing] = await connection.execute(
      'SELECT id FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, reportDate]
    );

    let reportId;
    if (existing.length > 0) {
      reportId = existing[0].id;
      await connection.execute(
        `UPDATE reports 
         SET doctor_name = ?, room = ?, shift_time = ?, report_data = ?, status = ?
         WHERE id = ?`,
        [doctorName, room, shiftTime, JSON.stringify(reportData), status || 'submitted', reportId]
      );
      
      // Delete old transfer cases
      await connection.execute('DELETE FROM transfer_cases WHERE report_id = ?', [reportId]);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO reports (department_code, report_date, doctor_name, room, shift_time, report_data, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [departmentCode, reportDate, doctorName, room, shiftTime, JSON.stringify(reportData), status || 'submitted']
      );
      reportId = result.insertId;
    }

    // Insert new transfer cases
    if (transferCases && transferCases.length > 0) {
      for (const tc of transferCases) {
        await connection.execute(
          `INSERT INTO transfer_cases (report_id, patient_name, age, address, admission_time, reason, clinical_tests, diagnosis, initial_treatment, progress_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [reportId, tc.patientName || null, tc.age || null, tc.address || null, tc.admissionTime || null, tc.reason || null, tc.clinicalTests || null, tc.diagnosis || null, tc.initialTreatment || null, tc.progressNotes || null]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, data: { id: reportId } });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getReport = async (req, res, next) => {
  try {
    const { departmentCode, date } = req.params;
    
    // Auth check: normal user can only get their own dept, admin can get any
    if (req.user.role !== 'admin' && req.user.departmentCode !== departmentCode) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const [reports] = await pool.execute(
      'SELECT * FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, date]
    );

    if (reports.length === 0) {
      return res.json({ success: true, data: null });
    }

    const report = reports[0];
    const [transferCases] = await pool.execute(
      'SELECT * FROM transfer_cases WHERE report_id = ?',
      [report.id]
    );

    res.json({
      success: true,
      data: {
        ...report,
        transferCases
      }
    });
  } catch (error) {
    next(error);
  }
};

const getReportsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    if (req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const [reports] = await pool.execute(
      'SELECT * FROM reports WHERE report_date = ?',
      [date]
    );

    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const { departmentCode, date } = req.params;

    if (req.user.role !== 'admin' && req.user.departmentCode !== departmentCode) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await pool.execute(
      'DELETE FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, date]
    );

    res.json({ success: true, message: 'Báo cáo đã được xóa thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrUpdateReport, getReport, getReportsByDate, deleteReport };
