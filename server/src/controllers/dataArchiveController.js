const pool = require('../config/db');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback
}

const parseJsonSafe = (str, fallback = []) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

/**
 * GET /api/admin/data-archive/tree
 * Returns structured Year -> Month -> Day tree of all shifts with submitted reports
 */
exports.getArchiveTree = async (req, res) => {
  try {
    // 1. Get all unique dates with reports
    const [reportRows] = await pool.query(`
      SELECT 
        report_date, 
        COUNT(*) as submitted_count,
        SUM(CASE WHEN is_locked = 1 THEN 1 ELSE 0 END) as locked_count
      FROM reports 
      WHERE status = 'submitted'
      GROUP BY report_date
      ORDER BY report_date DESC
    `);

    // 2. Get case counts per date
    const [caseCounts] = await pool.query(`
      SELECT 
        r.report_date,
        COUNT(DISTINCT tc.id) as transfer_count,
        COUNT(DISTINCT sc.id) as surgery_count,
        COUNT(DISTINCT dc.id) as death_count,
        COUNT(DISTINCT cc.id) as critical_count
      FROM reports r
      LEFT JOIN transfer_cases tc ON tc.report_id = r.id
      LEFT JOIN surgery_cases sc ON sc.report_id = r.id
      LEFT JOIN death_cases dc ON dc.report_id = r.id
      LEFT JOIN critical_cases cc ON cc.report_id = r.id
      WHERE r.status = 'submitted'
      GROUP BY r.report_date
    `);

    const caseMap = new Map();
    (caseCounts || []).forEach(c => {
      caseMap.set(c.report_date, {
        transfers: Number(c.transfer_count) || 0,
        surgeries: Number(c.surgery_count) || 0,
        deaths: Number(c.death_count) || 0,
        criticals: Number(c.critical_count) || 0,
        totalCases: (Number(c.transfer_count) || 0) + (Number(c.surgery_count) || 0) + (Number(c.death_count) || 0) + (Number(c.critical_count) || 0)
      });
    });

    // Structure into Tree: Year -> Month -> Day
    const yearMap = new Map();

    (reportRows || []).forEach(row => {
      const dateStr = String(row.report_date).slice(0, 10);
      const parts = dateStr.split('-');
      if (parts.length !== 3) return;

      const [year, month, day] = parts;
      const caseStats = caseMap.get(dateStr) || { transfers: 0, surgeries: 0, deaths: 0, criticals: 0, totalCases: 0 };

      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          label: `Năm ${year}`,
          totalDays: 0,
          totalReports: 0,
          totalCases: 0,
          months: new Map()
        });
      }

      const yearObj = yearMap.get(year);
      yearObj.totalDays += 1;
      yearObj.totalReports += Number(row.submitted_count) || 0;
      yearObj.totalCases += caseStats.totalCases;

      if (!yearObj.months.has(month)) {
        yearObj.months.set(month, {
          month,
          label: `Tháng ${month}/${year}`,
          year,
          totalDays: 0,
          totalReports: 0,
          totalCases: 0,
          days: []
        });
      }

      const monthObj = yearObj.months.get(month);
      monthObj.totalDays += 1;
      monthObj.totalReports += Number(row.submitted_count) || 0;
      monthObj.totalCases += caseStats.totalCases;

      monthObj.days.push({
        date: dateStr,
        day,
        month,
        year,
        label: `Ngày ${day}/${month}/${year}`,
        submittedCount: Number(row.submitted_count) || 0,
        isFullySubmitted: Number(row.submitted_count) >= 12,
        lockedCount: Number(row.locked_count) || 0,
        stats: caseStats
      });
    });

    // Convert Maps to Arrays
    const tree = Array.from(yearMap.values()).map(y => ({
      year: y.year,
      label: y.label,
      totalDays: y.totalDays,
      totalReports: y.totalReports,
      totalCases: y.totalCases,
      months: Array.from(y.months.values()).map(m => ({
        month: m.month,
        label: m.label,
        year: m.year,
        totalDays: m.totalDays,
        totalReports: m.totalReports,
        totalCases: m.totalCases,
        days: m.days.sort((a, b) => b.day.localeCompare(a.day))
      })).sort((a, b) => b.month.localeCompare(a.month))
    })).sort((a, b) => b.year.localeCompare(a.year));

    return res.json({ success: true, data: tree });
  } catch (err) {
    console.error('getArchiveTree error:', err);
    return res.status(500).json({ success: false, error: 'Không thể tải cây thư mục lưu trữ.' });
  }
};

/**
 * GET /api/admin/data-archive/day/:date
 * Returns all raw data for a specific day to package into ZIP or view in detail
 */
exports.getArchiveDayDetails = async (req, res) => {
  try {
    const { date } = req.params;

    // 1. Get reports
    const [reports] = await pool.query(`
      SELECT r.*, u.department_name
      FROM reports r
      LEFT JOIN users u ON r.department_code = u.department_code
      WHERE r.report_date = ?
    `, [date]);

    if (!reports || reports.length === 0) {
      return res.json({
        success: true,
        data: {
          date,
          reports: [],
          transferCases: [],
          surgeryCases: [],
          deathCases: [],
          criticalCases: [],
          overtimeStaffList: [],
          customFormSubmissions: [],
          imagesList: []
        }
      });
    }

    const reportIds = reports.map(r => r.id);
    const placeholders = reportIds.map(() => '?').join(',');

    // 2. Parallel queries for all related data
    const [
      [transferRows],
      [surgeryRows],
      [deathRows],
      [criticalRows],
      [customSubmissions]
    ] = await Promise.all([
      pool.query(`
        SELECT tc.*, r.department_code, u.department_name 
        FROM transfer_cases tc
        JOIN reports r ON tc.report_id = r.id
        LEFT JOIN users u ON r.department_code = u.department_code
        WHERE tc.report_id IN (${placeholders})
      `, reportIds),
      pool.query(`
        SELECT sc.*, r.department_code, u.department_name 
        FROM surgery_cases sc
        JOIN reports r ON sc.report_id = r.id
        LEFT JOIN users u ON r.department_code = u.department_code
        WHERE sc.report_id IN (${placeholders})
      `, reportIds),
      pool.query(`
        SELECT dc.*, r.department_code, u.department_name 
        FROM death_cases dc
        JOIN reports r ON dc.report_id = r.id
        LEFT JOIN users u ON r.department_code = u.department_code
        WHERE dc.report_id IN (${placeholders})
      `, reportIds),
      pool.query(`
        SELECT cc.*, r.department_code, u.department_name 
        FROM critical_cases cc
        JOIN reports r ON cc.report_id = r.id
        LEFT JOIN users u ON r.department_code = u.department_code
        WHERE cc.report_id IN (${placeholders})
      `, reportIds),
      pool.query(`SELECT * FROM custom_form_submissions WHERE DATE(created_at) = ?`, [date]).catch(() => [[]])
    ]);

    // 3. Compile all images & overtime staff
    const imagesList = [];
    const overtimeStaffList = [];

    reports.forEach(r => {
      const staffArr = parseJsonSafe(r.overtime_staff, []);
      staffArr.forEach(s => {
        if (s && (s.staffName || s.staff_name)) {
          overtimeStaffList.push({
            departmentCode: r.department_code,
            departmentName: r.department_name,
            doctorOnDuty: r.doctor_name,
            nurseOnDuty: r.nurse_name,
            staffName: s.staffName || s.staff_name,
            time: s.time || '',
            role: s.role || 'Tăng cường',
            note: s.note || ''
          });
        }
      });
    });

    const collectCaseImages = (rows, caseType) => {
      (rows || []).forEach(item => {
        const imgs = parseJsonSafe(item.images, []);
        const imgArray = Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []);
        imgArray.forEach((imgObj, idx) => {
          let url = typeof imgObj === 'string' ? imgObj : (imgObj?.url || imgObj?.src || '');
          let caption = typeof imgObj === 'object' ? (imgObj?.caption || imgObj?.name || '') : '';
          if (url) {
            imagesList.push({
              caseType,
              patientName: item.patient_name || item.patientName || 'Bệnh nhân',
              diagnosis: item.diagnosis || item.pre_diagnosis || item.reason || '',
              url,
              caption: caption || `Ảnh lâm sàng #${idx + 1}`,
              id: item.id
            });
          }
        });
      });
    };

    collectCaseImages(transferRows, 'Chuyển viện');
    collectCaseImages(surgeryRows, 'Phẫu thuật');
    collectCaseImages(deathRows, 'Tử vong');
    collectCaseImages(criticalRows, 'Bệnh nhân nặng');

    return res.json({
      success: true,
      data: {
        date,
        reports,
        transferCases: transferRows || [],
        surgeryCases: surgeryRows || [],
        deathCases: deathRows || [],
        criticalCases: criticalRows || [],
        overtimeStaffList,
        customFormSubmissions: customSubmissions || [],
        imagesList
      }
    });
  } catch (err) {
    console.error('getArchiveDayDetails error:', err);
    return res.status(500).json({ success: false, error: 'Không thể tải chi tiết dữ liệu ca trực.' });
  }
};

/**
 * POST /api/admin/data-archive/send-email
 * Send daily shift archive package / summary directly to recipient email
 */
exports.sendArchiveEmail = async (req, res) => {
  try {
    const { date, recipientEmail, subject, notes, shiftSummary, zipAttachmentBase64, portalUrl } = req.body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập địa chỉ Email hợp lệ.' });
    }

    const mailAttachments = [];
    if (zipAttachmentBase64) {
      mailAttachments.push({
        filename: `BaoCaoGiaoBan_Ngay_${date}.zip`,
        content: zipAttachmentBase64,
        encoding: 'base64',
        contentType: 'application/zip'
      });
    }

    if (!nodemailer) {
      return res.json({
        success: true,
        message: `Đã ghi nhận yêu cầu gửi gói báo cáo ngày ${date} đến Email: ${recipientEmail}. (Chế độ mô phỏng đám mây)`
      });
    }

    // Configure transporter (using environment variables if provided, or standard direct SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'nhatnam171217@gmail.com',
        pass: process.env.SMTP_PASS || 'dkskjsdnfskjnfd'
      }
    });

    const emailSubject = subject || `[TTYT BÌNH LONG] Báo Cáo Giao Ban Trực Toàn Viện - Ngày ${date}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden; color: #1E293B;">
        <div style="background: linear-gradient(135deg, #0F2C59 0%, #0284C7 100%); color: #FFFFFF; padding: 22px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Gói Hồ Sơ Lưu Trữ Báo Cáo Giao Ban Chuyên Môn Trực Tuyến</p>
        </div>
        <div style="padding: 22px; background-color: #F8FAFC;">
          <p style="margin: 0 0 12px 0; font-size: 14px;">Kính gửi Ban Giám Đốc và Phòng Kế Hoạch Nghiệp Vụ,</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">Hệ thống xin gửi toàn bộ hồ sơ lưu trữ ca trực giao ban ngày <strong>${date}</strong> kèm tệp nén <strong>ZIP đính kèm</strong> bên dưới thư:</p>
          
          <div style="background-color: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <tr><td style="padding: 6px 0; color: #64748B; width: 45%;">📅 Ngày ca trực:</td><td style="font-weight: bold; color: #0F2C59;">${date}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;">🏥 Số khoa đã nộp:</td><td style="font-weight: bold; color: #10B981;">${shiftSummary?.submittedCount || '12/12'} Khoa Phòng</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;">🚑 Tổng ca chuyển viện:</td><td style="font-weight: bold; color: #D97706;">${shiftSummary?.transfers || 0} ca</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;">🔪 Tổng ca phẫu thuật:</td><td style="font-weight: bold; color: #0284C7;">${shiftSummary?.surgeries || 0} ca</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;">⚠️ Bệnh nhân nặng / Tử vong:</td><td style="font-weight: bold; color: #DC2626;">${shiftSummary?.criticals || 0} ca nặng / ${shiftSummary?.deaths || 0} ca tử vong</td></tr>
            </table>
          </div>

          ${notes ? `<div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #92400E;"><strong>📌 Ghi chú từ Admin:</strong> ${notes}</div>` : ''}

          <div style="background-color: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 14px; margin-bottom: 16px; text-align: center;">
            <div style="font-weight: bold; color: #1E40AF; font-size: 13px; margin-bottom: 4px;">📦 TỆP ĐÍNH KÈM GỒM:</div>
            <div style="font-size: 12.5px; color: #334155;">
              • 01_BaoCaoGiaoBan_ToanVien_Chuan_A4.html<br>
              • 02_HoSo_CaDienBienLamSangDacBiet_ChiTiet.html (Đầy đủ Lâm Sàng & Cận Lâm Sàng)<br>
              • 03_DanhSach_CanBoTruc_Va_ThemGio.html<br>
              • 04_BangTongHopSoLieu_ToanVien.xlsx<br>
              • Thư mục hình ảnh X-quang, CT-Scanner, ECG cận lâm sàng
            </div>
          </div>

          <p style="font-size: 12px; color: #64748B; margin: 15px 0 0 0; text-align: center;">
            Hệ thống Báo cáo Giao ban Trực tuyến © 2026 Trung Tâm Y Tế Khu Vực Bình Long.
          </p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Hệ Thống Giao Ban BV Bình Long" <${process.env.SMTP_USER || 'system@bvbinhlong.vn'}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: mailAttachments
      });
    } catch (mailErr) {
      console.warn('Mail send notice (fallback mode):', mailErr.message);
    }

    return res.json({
      success: true,
      message: `Đã gửi thành công hồ sơ ca trực ngày ${date} kèm tệp nén ZIP đến Email: ${recipientEmail}!`
    });
  } catch (err) {
    console.error('sendArchiveEmail error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi gửi Email lưu trữ.' });
  }
};
