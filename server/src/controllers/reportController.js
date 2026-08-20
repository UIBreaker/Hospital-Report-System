const pool = require('../config/db');

const safeVal = (v) => (v === undefined || v === null || v === '' ? null : v);
const safeJson = (v) => (v ? JSON.stringify(v) : null);

const safeImages = (imgVal) => {
  if (!imgVal) return null;
  if (Array.isArray(imgVal)) {
    return imgVal.length > 0 ? JSON.stringify(imgVal) : null;
  }
  if (typeof imgVal === 'string') {
    return imgVal.trim() ? imgVal : null;
  }
  return null;
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

const createOrUpdateReport = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    if (pool.ensureSchema) {
      await pool.ensureSchema(connection);
    }
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
             (report_id, patient_name, age, address, admission_time, reason, clinical_symptoms, clinical_tests, diagnosis, initial_treatment, progress_notes, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(tc.age),
              safeVal(tc.address),
              safeVal(tc.admissionTime || tc.admission_time),
              safeVal(tc.reason),
              safeVal(tc.clinicalSymptoms || tc.clinical_symptoms),
              safeVal(tc.clinicalTests || tc.clinical_tests),
              safeVal(tc.diagnosis),
              safeVal(tc.initialTreatment || tc.initial_treatment),
              safeVal(tc.progressNotes || tc.progress_notes),
              safeImages(tc.images || tc.image_url || tc.imageUrl)
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
             (report_id, patient_name, birth_year, address, admission_time, reason, clinical_symptoms, clinical_tests, preoperative_diagnosis, consultation_order, postoperative_diagnosis, current_status, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(sc.birthYear || sc.birth_year || sc.age),
              safeVal(sc.address),
              safeVal(sc.admissionTime || sc.admission_time),
              safeVal(sc.reason),
              safeVal(sc.clinicalSymptoms || sc.clinical_symptoms),
              safeVal(sc.clinicalTests || sc.clinical_tests),
              safeVal(sc.preoperativeDiagnosis || sc.preoperative_diagnosis),
              safeVal(sc.consultationOrder || sc.consultation_order),
              safeVal(sc.postoperativeDiagnosis || sc.postoperative_diagnosis),
              safeVal(sc.currentStatus || sc.current_status),
              safeImages(sc.images || sc.image_url || sc.imageUrl)
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
             (report_id, patient_name, age, address, admission_time, reason, admission_status, clinical_symptoms, medical_history, clinical_tests, diagnosis, emergency_treatment, final_outcome, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(dc.age),
              safeVal(dc.address),
              safeVal(dc.admissionTime || dc.admission_time),
              safeVal(dc.reason),
              safeVal(dc.admissionStatus || dc.admission_status),
              safeVal(dc.clinicalSymptoms || dc.clinical_symptoms),
              safeVal(dc.medicalHistory || dc.medical_history),
              safeVal(dc.clinicalTests || dc.clinical_tests),
              safeVal(dc.diagnosis),
              safeVal(dc.emergencyTreatment || dc.emergency_treatment),
              safeVal(dc.finalOutcome || dc.final_outcome),
              safeImages(dc.images || dc.image_url || dc.imageUrl)
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
             (report_id, patient_name, age, address, admission_time, medical_history, clinical_symptoms, clinical_tests, diagnosis, condition_summary, treatment, notes, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              patientName,
              safeVal(cc.age),
              safeVal(cc.address),
              safeVal(cc.admissionTime || cc.admission_time),
              safeVal(cc.medicalHistory || cc.medical_history),
              safeVal(cc.clinicalSymptoms || cc.clinical_symptoms),
              safeVal(cc.clinicalTests || cc.clinical_tests),
              safeVal(cc.diagnosis),
              safeVal(cc.conditionSummary || cc.condition_summary),
              safeVal(cc.treatment),
              safeVal(cc.notes || 'Bàn giao tua sau theo dõi tiếp'),
              safeImages(cc.images || cc.image_url || cc.imageUrl)
            ]
          );
        }
      }
    }

    // Medical Compliance Audit Log Recording
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      const actionType = existing.length > 0 ? 'UPDATE' : 'CREATE';
      const changesSummary = `${actionType === 'CREATE' ? 'Nộp báo cáo lần đầu' : 'Cập nhật chỉnh sửa báo cáo'} bởi BS. ${doctorName || 'N/A'}, ĐD. ${nurseName || 'N/A'}`;

      await connection.execute(
        `INSERT INTO report_audit_logs 
         (report_id, department_code, report_date, action_type, doctor_name, nurse_name, ip_address, changes_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reportId,
          departmentCode,
          reportDate,
          actionType,
          safeVal(doctorName),
          safeVal(nurseName),
          safeVal(clientIp),
          changesSummary
        ]
      );
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr.message);
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
        transferCases: (transferCases || []).map(parseCaseImages),
        surgeryCases: (surgeryCases || []).map(parseCaseImages),
        deathCases: (deathCases || []).map(parseCaseImages),
        criticalCases: (criticalCases || []).map(parseCaseImages)
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
  const connection = await pool.getConnection();
  try {
    const { departmentCode, date } = req.params;

    if (req.user.role !== 'admin' && req.user.departmentCode !== departmentCode) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await connection.beginTransaction();

    // 1. Tìm các report ID tương ứng
    const [reports] = await connection.execute(
      'SELECT id FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, date]
    );

    for (const r of reports) {
      await connection.execute('DELETE FROM transfer_cases WHERE report_id = ?', [r.id]);
      await connection.execute('DELETE FROM surgery_cases WHERE report_id = ?', [r.id]);
      await connection.execute('DELETE FROM death_cases WHERE report_id = ?', [r.id]);
      await connection.execute('DELETE FROM critical_cases WHERE report_id = ?', [r.id]);
    }

    // 2. Dọn sạch các bản ghi mồ côi (nếu có)
    await connection.execute('DELETE FROM transfer_cases WHERE report_id NOT IN (SELECT id FROM reports)');
    await connection.execute('DELETE FROM surgery_cases WHERE report_id NOT IN (SELECT id FROM reports)');
    await connection.execute('DELETE FROM death_cases WHERE report_id NOT IN (SELECT id FROM reports)');
    await connection.execute('DELETE FROM critical_cases WHERE report_id NOT IN (SELECT id FROM reports)');

    // 3. Xóa báo cáo chính
    await connection.execute(
      'DELETE FROM reports WHERE department_code = ? AND report_date = ?',
      [departmentCode, date]
    );

    await connection.commit();

    // 4. Thu hồi dung lượng đĩa và làm mới chỉ số InnoDB
    try {
      await pool.query('OPTIMIZE TABLE death_cases, transfer_cases, critical_cases, surgery_cases, reports');
      await pool.query('ANALYZE TABLE death_cases, transfer_cases, critical_cases, surgery_cases, reports, users, staff_members');
    } catch (optErr) {
      // Bỏ qua lỗi optimize nếu môi trường cloud hạn chế
    }

    res.json({ success: true, message: 'Báo cáo và toàn bộ dữ liệu lâm sàng liên quan đã được xóa và giải phóng dung lượng thành công!' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = { createOrUpdateReport, getReport, getReportsByDate, deleteReport };
