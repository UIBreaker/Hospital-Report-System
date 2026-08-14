const pool = require('../config/db');

const createOrUpdateReport = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const {
      departmentCode,
      reportDate,
      doctorName,
      nurseName,
      overtimeStaff,
      room,
      shiftTime,
      reportData,
      status,
      transferCases,
      surgeryCases,
      deathCases,
      criticalCases
    } = req.body;

    // Helper: convert undefined/empty string to null for mysql2 (used for all inserts)
    const safeVal = (v) => (v === undefined || v === null || v === '' ? null : v);
    const safeJson = (v) => (v ? JSON.stringify(v) : null);

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
         SET doctor_name = ?, nurse_name = ?, overtime_staff = ?, room = ?, shift_time = ?, report_data = ?, status = ?
         WHERE id = ?`,
        [
          safeVal(doctorName),
          safeVal(nurseName),
          safeJson(overtimeStaff),
          safeVal(room),
          safeVal(shiftTime),
          JSON.stringify(reportData || {}),
          status || 'submitted',
          reportId
        ]
      );
      
      // Delete old sub-records before re-inserting
      await connection.execute('DELETE FROM transfer_cases WHERE report_id = ?', [reportId]);
      await connection.execute('DELETE FROM surgery_cases WHERE report_id = ?', [reportId]);
      await connection.execute('DELETE FROM death_cases WHERE report_id = ?', [reportId]);
      await connection.execute('DELETE FROM critical_cases WHERE report_id = ?', [reportId]);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO reports (department_code, report_date, doctor_name, nurse_name, overtime_staff, room, shift_time, report_data, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          safeVal(departmentCode),
          safeVal(reportDate),
          safeVal(doctorName),
          safeVal(nurseName),
          safeJson(overtimeStaff),
          safeVal(room),
          safeVal(shiftTime),
          JSON.stringify(reportData || {}),
          status || 'submitted'
        ]
      );
      reportId = result.insertId;
    }

    // Insert new transfer cases
    if (transferCases && Array.isArray(transferCases) && transferCases.length > 0) {
      for (const tc of transferCases) {
        const patientName = safeVal(tc.patientName || tc.patient_name);
        if (patientName || tc.admissionTime || tc.diagnosis) {
          await connection.execute(
            `INSERT INTO transfer_cases 
             (report_id, patient_name, age, address, admission_time, reason, clinical_tests, diagnosis, initial_treatment, progress_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(tc.age),
              safeVal(tc.address),
              safeVal(tc.admissionTime || tc.admission_time),
              safeVal(tc.reason),
              safeVal(tc.clinicalTests || tc.clinical_tests),
              safeVal(tc.diagnosis),
              safeVal(tc.initialTreatment || tc.initial_treatment),
              safeVal(tc.progressNotes || tc.progress_notes)
            ]
          );
        }
      }
    }

    // Insert new surgery cases (Bệnh mổ)
    if (surgeryCases && Array.isArray(surgeryCases) && surgeryCases.length > 0) {
      for (const sc of surgeryCases) {
        const patientName = safeVal(sc.patientName || sc.patient_name);
        if (patientName || sc.admissionTime || sc.preoperativeDiagnosis || sc.preoperative_diagnosis) {
          await connection.execute(
            `INSERT INTO surgery_cases 
             (report_id, patient_name, birth_year, address, admission_time, reason, preoperative_diagnosis, consultation_order, postoperative_diagnosis, current_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(sc.birthYear || sc.birth_year || sc.age),
              safeVal(sc.address),
              safeVal(sc.admissionTime || sc.admission_time),
              safeVal(sc.reason),
              safeVal(sc.preoperativeDiagnosis || sc.preoperative_diagnosis),
              safeVal(sc.consultationOrder || sc.consultation_order),
              safeVal(sc.postoperativeDiagnosis || sc.postoperative_diagnosis),
              safeVal(sc.currentStatus || sc.current_status)
            ]
          );
        }
      }
    }

    // Insert new death cases (Bệnh tử vong)
    if (deathCases && Array.isArray(deathCases) && deathCases.length > 0) {
      for (const dc of deathCases) {
        const patientName = safeVal(dc.patientName || dc.patient_name);
        if (patientName || dc.admissionTime || dc.diagnosis) {
          await connection.execute(
            `INSERT INTO death_cases 
             (report_id, patient_name, age, address, admission_time, reason, admission_status, medical_history, clinical_tests, diagnosis, emergency_treatment, final_outcome)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(dc.age),
              safeVal(dc.address),
              safeVal(dc.admissionTime || dc.admission_time),
              safeVal(dc.reason),
              safeVal(dc.admissionStatus || dc.admission_status),
              safeVal(dc.medicalHistory || dc.medical_history),
              safeVal(dc.clinicalTests || dc.clinical_tests),
              safeVal(dc.diagnosis),
              safeVal(dc.emergencyTreatment || dc.emergency_treatment),
              safeVal(dc.finalOutcome || dc.final_outcome)
            ]
          );
        }
      }
    }

    // Insert new critical cases (Bệnh nặng theo dõi)
    if (criticalCases && Array.isArray(criticalCases) && criticalCases.length > 0) {
      for (const cc of criticalCases) {
        const patientName = safeVal(cc.patientName || cc.patient_name);
        if (patientName || cc.admissionTime || cc.diagnosis || cc.conditionSummary || cc.condition_summary) {
          await connection.execute(
            `INSERT INTO critical_cases 
             (report_id, patient_name, age, address, admission_time, medical_history, diagnosis, condition_summary, treatment, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(cc.age),
              safeVal(cc.address),
              safeVal(cc.admissionTime || cc.admission_time),
              safeVal(cc.medicalHistory || cc.medical_history),
              safeVal(cc.diagnosis),
              safeVal(cc.conditionSummary || cc.condition_summary),
              safeVal(cc.treatment),
              safeVal(cc.notes || 'Bàn giao tua sau theo dõi tiếp')
            ]
          );
        }
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

    res.json({
      success: true,
      data: {
        ...report,
        transferCases,
        surgeryCases,
        deathCases,
        criticalCases
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
