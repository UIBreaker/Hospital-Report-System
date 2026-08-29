import api from './api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { translateFieldKey } from '../utils/medicalFormatters';

const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const dataArchiveService = {
  getArchiveTree: async () => {
    const res = await api.get('/admin/data-archive/tree');
    return res.data;
  },

  getArchiveDayDetails: async (date) => {
    const res = await api.get(`/admin/data-archive/day/${date}`);
    return res.data;
  },

  sendArchiveEmail: async (payload) => {
    const res = await api.post('/admin/data-archive/send-email', payload);
    return res.data;
  },

  /**
   * 1. Generates 01_BaoCao_12_KhoaPhong.html
   */
  generateGeneralReportHtml: (date, dayData) => {
    const reports = dayData.reports || [];
    const dateFormatted = date.split('-').reverse().join('/');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo 12 Khoa Phòng - Ngày ${dateFormatted}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 10mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.4; color: #111827; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 210mm; margin: 0 auto; background-color: #FFFFFF; padding: 15mm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px; box-sizing: border-box; }
    @media print { body { background: none; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .title-box { text-align: center; margin: 15px 0 20px; }
    .title-main { font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #0F2C59; }
    .title-sub { font-size: 11pt; font-style: italic; color: #374151; margin-top: 4px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
    table.data-table th, table.data-table td { border: 1px solid #000; padding: 6px 8px; }
    table.data-table th { background-color: #D9E8FB; color: #0F2C59; font-weight: bold; text-align: center; }
    .btn-print { background-color: #0284C7; color: #FFFFFF; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; font-size: 13px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 210mm; margin: 0 auto 10px; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ In Báo Cáo / Lưu PDF (Ctrl + P)</button>
  </div>
  <div class="container">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <div style="font-size: 9pt; text-transform: uppercase; color: #1E3A8A; font-weight: bold;">SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI</div>
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0F2C59;">TTYT KHU VỰC BÌNH LONG</div>
        </td>
        <td style="width: 50%; text-align: center;">
          <div style="font-size: 9.5pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 9.5pt; font-weight: bold; font-style: italic; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="font-size: 8.5pt; font-style: italic; margin-top: 4px;">Bình Long, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
        </td>
      </tr>
    </table>
    <div class="title-box">
      <div class="title-main">Báo Cáo Tổng Hợp Trực Ban 12 Khoa Phòng</div>
      <div class="title-sub">Ca trực ngày: ${dateFormatted}</div>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 28%;">Khoa Phòng</th>
          <th style="width: 22%;">Bác Sĩ Trực</th>
          <th style="width: 22%;">Điều Dưỡng Trực</th>
          <th style="width: 23%;">Trạng Thái & Phòng</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map((r, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="font-weight: bold; color: #0F2C59;">${escapeHtml(r.department_name || r.department_code)}</td>
            <td style="color: #1D4ED8; font-weight: bold;">${escapeHtml(r.doctor_name || '—')}</td>
            <td style="color: #065F46; font-weight: bold;">${escapeHtml(r.nurse_name || '—')}</td>
            <td><span style="font-size: 8pt; background: #DCFCE7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold;">ĐÃ NỘP</span> ${r.room ? `<div style="font-size: 8pt; color: #64748B;">Phòng: ${escapeHtml(r.room)}</div>` : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  },

  /**
   * 2. Generates 02_ChiSo_BaoCao_TrongCaTruc_CacKhoa.html
   * Exhaustive Department Specialization Metrics for ALL 12 departments
   */
  generateDepartmentMetricsHtml: (date, dayData) => {
    const reports = dayData.reports || [];
    const dateFormatted = date.split('-').reverse().join('/');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Chỉ Số Báo Cáo Trong Ca Trực Các Khoa - Ngày ${dateFormatted}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 8mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.4; color: #111827; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 210mm; margin: 0 auto; background-color: #FFFFFF; padding: 12mm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px; box-sizing: border-box; }
    @media print { body { background: none; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } .dept-block { page-break-inside: avoid; } }
    .title-box { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0F2C59; padding-bottom: 10px; }
    .title-main { font-size: 13.5pt; font-weight: bold; text-transform: uppercase; color: #0F2C59; }
    .dept-block { border: 1.5px solid #CBD5E1; border-radius: 8px; margin-bottom: 16px; overflow: hidden; background: #FFFFFF; }
    .dept-header { background: #0F2C59; color: #FFFFFF; padding: 6px 12px; font-weight: bold; font-size: 10.5pt; display: flex; justify-content: space-between; }
    .metrics-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    .metrics-table th, .metrics-table td { border: 1px solid #E2E8F0; padding: 5px 8px; }
    .metrics-table td.lbl { width: 35%; background: #F8FAFC; font-weight: bold; color: #334155; }
    .metrics-table td.val { width: 15%; text-align: center; font-weight: bold; color: #0F2C59; }
    .sec-sub-header { background-color: #EFF6FF; color: #1E40AF; font-weight: bold; padding: 4px 8px; font-size: 9pt; }
    .btn-print { background-color: #0284C7; color: #FFFFFF; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 210mm; margin: 0 auto 10px; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ In Bảng Chỉ Số / Lưu PDF (Ctrl + P)</button>
  </div>
  <div class="container">
    <div class="title-box">
      <div style="font-size: 9pt; text-transform: uppercase; color: #1E3A8A; font-weight: bold;">TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG</div>
      <div class="title-main" style="margin-top: 4px;">TỔNG HỢP CHỈ SỐ BÁO CÁO CHUYÊN MÔN TRONG CA TRỰC (TẤT CẢ CÁC KHOA)</div>
      <div style="font-size: 10pt; font-style: italic; color: #4B5563; margin-top: 3px;">Ngày ca trực: ${dateFormatted}</div>
    </div>

    ${reports.map((r, i) => {
      let rawForm = {};
      try { rawForm = typeof r.form_data === 'string' ? JSON.parse(r.form_data) : (r.form_data || {}); } catch(e) {}
      
      const metricsList = [];
      const subSections = [];
      const notesList = [];

      Object.entries(rawForm).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '' || k === '_id') return;
        if (k === 'themGio' || k === 'tinhHinhChung' || k === 'ghiChu' || k === 'dienBien') {
          notesList.push({ label: translateFieldKey(k), value: String(v) });
          return;
        }
        if (typeof v === 'object' && !Array.isArray(v)) {
          const subItems = [];
          Object.entries(v).forEach(([subK, subV]) => {
            if (subV !== null && subV !== undefined && subV !== '') {
              subItems.push({ label: translateFieldKey(subK, k), value: String(subV) });
            }
          });
          if (subItems.length > 0) subSections.push({ title: translateFieldKey(k), items: subItems });
        } else if (Array.isArray(v)) {
          // List
        } else {
          metricsList.push({ label: translateFieldKey(k), value: String(v) });
        }
      });

      return `
        <div class="dept-block">
          <div class="dept-header">
            <span>${i + 1}. ${escapeHtml(r.department_name || r.department_code)}</span>
            <span style="font-size: 8.5pt; font-weight: normal; opacity: 0.9;">BS: <strong>${escapeHtml(r.doctor_name || '—')}</strong> | ĐD: <strong>${escapeHtml(r.nurse_name || '—')}</strong></span>
          </div>
          
          <table class="metrics-table">
            <tbody>
              ${Array.from({ length: Math.ceil(metricsList.length / 2) }).map((_, rIdx) => {
                const left = metricsList[rIdx * 2];
                const right = metricsList[rIdx * 2 + 1];
                return `
                  <tr>
                    <td class="lbl">${escapeHtml(left?.label || '')}:</td>
                    <td class="val">${escapeHtml(left?.value || '')}</td>
                    ${right ? `<td class="lbl">${escapeHtml(right.label)}:</td><td class="val">${escapeHtml(right.value)}</td>` : '<td class="lbl"></td><td class="val"></td>'}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${subSections.map(sec => `
            <div class="sec-sub-header">❖ ${escapeHtml(sec.title)}</div>
            <table class="metrics-table">
              <tbody>
                ${Array.from({ length: Math.ceil(sec.items.length / 2) }).map((_, rIdx) => {
                  const left = sec.items[rIdx * 2];
                  const right = sec.items[rIdx * 2 + 1];
                  return `
                    <tr>
                      <td class="lbl">${escapeHtml(left?.label || '')}:</td>
                      <td class="val">${escapeHtml(left?.value || '')}</td>
                      ${right ? `<td class="lbl">${escapeHtml(right.label)}:</td><td class="val">${escapeHtml(right.value)}</td>` : '<td class="lbl"></td><td class="val"></td>'}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `).join('')}

          ${notesList.length > 0 ? `
            <div style="padding: 6px 10px; background: #FFFBEB; font-size: 8.5pt; color: #92400E; border-top: 1px solid #FDE68A;">
              ${notesList.map(n => `<div><strong>📌 ${escapeHtml(n.label)}:</strong> ${escapeHtml(n.value)}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;
  },

  /**
   * 3. Generates 03_CacCaDienBien_LamSangDacBiet.html
   */
  generateClinicalCasesHtml: (date, dayData) => {
    const dateFormatted = date.split('-').reverse().join('/');
    const surgeries = dayData.surgeryCases || [];
    const transfers = dayData.transferCases || [];
    const deaths = dayData.deathCases || [];
    const criticals = dayData.criticalCases || [];

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Các Ca Diễn Biến Lâm Sàng Đặc Biệt - Ngày ${dateFormatted}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 10mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.45; color: #111827; background-color: #F1F5F9; margin: 0; padding: 20px; }
    .container { max-width: 210mm; margin: 0 auto; background-color: #FFFFFF; padding: 15mm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px; box-sizing: border-box; }
    @media print { body { background: none; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } .case-card { page-break-inside: avoid; } }
    .title-box { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0F2C59; padding-bottom: 12px; }
    .title-main { font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #0F2C59; }
    .cat-header { padding: 6px 12px; font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #FFFFFF; border-radius: 4px; margin: 24px 0 12px; }
    .cat-surgery { background: linear-gradient(135deg, #1E40AF, #0284C7); }
    .cat-transfer { background: linear-gradient(135deg, #B45309, #D97706); }
    .cat-death { background: linear-gradient(135deg, #991B1B, #DC2626); }
    .cat-critical { background: linear-gradient(135deg, #5B21B6, #7C3AED); }
    .case-card { border: 1.5px solid #CBD5E1; border-radius: 8px; margin-bottom: 14px; overflow: hidden; background-color: #FFFFFF; }
    .case-card-header { background-color: #F8FAFC; padding: 8px 12px; border-bottom: 1.5px solid #CBD5E1; display: flex; justify-content: space-between; align-items: center; }
    .case-patient-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
    .case-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    .case-table td { padding: 6px 10px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
    .label-col { width: 24%; font-weight: bold; background-color: #F8FAFC; color: #1E293B; }
    .highlight-ls { background-color: #F0F9FF; border-left: 3px solid #0284C7; }
    .highlight-cls { background-color: #FAF5FF; border-left: 3px solid #7C3AED; }
    .highlight-cd { background-color: #FEF3C7; border-left: 3px solid #D97706; font-weight: bold; color: #92400E; }
    .btn-print { background-color: #0284C7; color: #FFFFFF; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 210mm; margin: 0 auto 10px; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ In Hồ Sơ Ca Bệnh / Lưu PDF (Ctrl + P)</button>
  </div>
  <div class="container">
    <div class="title-box">
      <div style="font-size: 9pt; text-transform: uppercase; color: #1E3A8A; font-weight: bold;">TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG</div>
      <div class="title-main" style="margin-top: 4px;">CÁC CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT TRONG CA TRỰC</div>
      <div style="font-size: 10pt; font-style: italic; color: #374151; margin-top: 4px;">Đầy đủ 100% Lâm Sàng, Cận Lâm Sàng, Chẩn Đoán, Xử Trí & Diễn Biến — Ngày ${dateFormatted}</div>
    </div>

    <!-- 1. PHẪU THUẬT -->
    <div class="cat-header cat-surgery">I. DANH SÁCH CA PHẪU THUẬT (${surgeries.length} CA)</div>
    ${surgeries.map((sc, i) => `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-patient-name" style="color: #1E40AF;">#${i + 1}. ${escapeHtml(sc.patient_name || sc.patientName)} (${sc.birth_year || sc.age} tuổi) — ${escapeHtml(sc.department_name || sc.department_code)}</div>
          <div style="font-size: 8.5pt; color: #64748B;">Vào: <strong>${escapeHtml(sc.admission_time || sc.admissionTime || '—')}</strong></div>
        </div>
        <table class="case-table">
          <tr><td class="label-col">Địa chỉ & Lý do vào:</td><td>📍 ${escapeHtml(sc.address || '—')} | <strong>Lý do:</strong> ${escapeHtml(sc.reason || '—')}</td></tr>
          <tr><td class="label-col highlight-ls">🩺 Triệu chứng Lâm sàng:</td><td style="color: #0F172A; font-weight: 500;">${escapeHtml(sc.clinical_symptoms || sc.clinicalSymptoms || '—')}</td></tr>
          <tr><td class="label-col highlight-cls">🔬 Kết quả Cận lâm sàng:</td><td style="color: #4C1D95; font-weight: 500;">${escapeHtml(sc.clinical_tests || sc.clinicalTests || '—')}</td></tr>
          <tr><td class="label-col highlight-cd">🏥 Chẩn đoán trước mổ:</td><td style="color: #92400E; font-weight: bold;">${escapeHtml(sc.preoperative_diagnosis || sc.pre_diagnosis || '—')}</td></tr>
          <tr><td class="label-col">🔪 Lệnh mổ & PTV:</td><td>${escapeHtml(sc.consultation_order || sc.surgery_method || '—')} | PTV: <strong>${escapeHtml(sc.main_surgeon || '—')}</strong> | Gây mê: <strong>${escapeHtml(sc.anesthesiologist || '—')}</strong></td></tr>
          <tr><td class="label-col">🏥 Chẩn đoán sau mổ:</td><td style="color: #1E40AF; font-weight: bold;">${escapeHtml(sc.postoperative_diagnosis || sc.post_diagnosis || '—')}</td></tr>
        </table>
      </div>
    `).join('')}

    <!-- 2. CHUYỂN VIỆN -->
    <div class="cat-header cat-transfer">II. DANH SÁCH CA CHUYỂN VIỆN (${transfers.length} CA)</div>
    ${transfers.map((tc, i) => `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-patient-name" style="color: #B45309;">#${i + 1}. ${escapeHtml(tc.patient_name || tc.patientName)} (${tc.age} tuổi) — ${escapeHtml(tc.department_name || tc.department_code)}</div>
          <div style="font-size: 8.5pt; color: #64748B;">Vào: <strong>${escapeHtml(tc.admission_time || tc.admissionTime || '—')}</strong></div>
        </div>
        <table class="case-table">
          <tr><td class="label-col">Địa chỉ & Lý do vào:</td><td>📍 ${escapeHtml(tc.address || '—')} | <strong>Lý do:</strong> ${escapeHtml(tc.reason || '—')}</td></tr>
          <tr><td class="label-col highlight-ls">🩺 Triệu chứng Lâm sàng:</td><td style="color: #0F172A; font-weight: 500;">${escapeHtml(tc.clinical_symptoms || tc.clinicalSymptoms || '—')}</td></tr>
          <tr><td class="label-col highlight-cls">🔬 Kết quả Cận lâm sàng:</td><td style="color: #4C1D95; font-weight: 500;">${escapeHtml(tc.clinical_tests || tc.clinicalTests || '—')}</td></tr>
          <tr><td class="label-col highlight-cd">🏥 Chẩn đoán:</td><td style="color: #92400E; font-weight: bold;">${escapeHtml(tc.diagnosis || '—')}</td></tr>
          <tr><td class="label-col">💊 Xử trí & Diễn biến:</td><td>${escapeHtml(tc.initial_treatment || '—')} | Diễn biến: ${escapeHtml(tc.progress_notes || '—')}</td></tr>
        </table>
      </div>
    `).join('')}

    <!-- 3. BỆNH NHÂN NẶNG -->
    <div class="cat-header cat-critical">III. BỆNH NHÂN NẶNG THEO DÕI (${criticals.length} CA)</div>
    ${criticals.map((cc, i) => `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-patient-name" style="color: #5B21B6;">#${i + 1}. ${escapeHtml(cc.patient_name || cc.patientName)} (${cc.age} tuổi) — ${escapeHtml(cc.department_name || cc.department_code)}</div>
        </div>
        <table class="case-table">
          <tr><td class="label-col highlight-ls">🩺 Lâm sàng & Sinh hiệu:</td><td>${escapeHtml(cc.clinical_symptoms || '—')}</td></tr>
          <tr><td class="label-col highlight-cls">🔬 Cận lâm sàng:</td><td>${escapeHtml(cc.clinical_tests || '—')}</td></tr>
          <tr><td class="label-col highlight-cd">🏥 Chẩn đoán & Xử trí:</td><td><strong>CĐ:</strong> ${escapeHtml(cc.diagnosis || '—')} | <strong>XT:</strong> ${escapeHtml(cc.treatment || '—')}</td></tr>
        </table>
      </div>
    `).join('')}

    <!-- 4. TỬ VONG -->
    <div class="cat-header cat-death">IV. HỒ SƠ BỆNH NHÂN TỬ VONG (${deaths.length} CA)</div>
    ${deaths.map((dc, i) => `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-patient-name" style="color: #991B1B;">#${i + 1}. ${escapeHtml(dc.patient_name || dc.patientName)} (${dc.age} tuổi)</div>
          <div style="font-size: 8.5pt; color: #991B1B; font-weight: bold;">Tử vong lúc: ${escapeHtml(dc.death_time || '—')}</div>
        </div>
        <table class="case-table">
          <tr><td class="label-col highlight-ls">🩺 Lâm sàng & Sinh hiệu:</td><td>${escapeHtml(dc.clinical_symptoms || '—')}</td></tr>
          <tr><td class="label-col highlight-cls">🔬 Cận lâm sàng / ECG:</td><td>${escapeHtml(dc.clinical_tests || '—')}</td></tr>
          <tr><td class="label-col highlight-cd">🏥 Chẩn đoán tử vong:</td><td style="color: #991B1B; font-weight: bold;">${escapeHtml(dc.diagnosis || '—')}</td></tr>
          <tr><td class="label-col">⚡ Cấp cứu & Kết luận:</td><td>${escapeHtml(dc.emergency_treatment || '—')} | <strong>KL:</strong> ${escapeHtml(dc.final_outcome || '—')}</td></tr>
        </table>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  },

  /**
   * 4. Generates 04_DanhSach_CanBoTruc_Va_ThemGio.html
   */
  generateStaffListHtml: (date, dayData) => {
    const dateFormatted = date.split('-').reverse().join('/');
    const staffList = dayData.overtimeStaffList || [];
    const reports = dayData.reports || [];

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Danh Sách Cán Bộ Trực & Thêm Giờ - Ngày ${dateFormatted}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 10mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.4; color: #111827; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 210mm; margin: 0 auto; background-color: #FFFFFF; padding: 15mm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px; }
    @media print { body { background: none; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
    th, td { border: 1px solid #000; padding: 6px 8px; }
    th { background-color: #D1FAE5; color: #065F46; text-align: center; }
    .btn-print { background-color: #059669; color: #FFFFFF; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 210mm; margin: 0 auto 10px; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ In Danh Sách Nhân Sự (Ctrl + P)</button>
  </div>
  <div class="container">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 9pt; text-transform: uppercase; color: #1E3A8A; font-weight: bold;">TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG</div>
      <div style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase; color: #065F46; margin-top: 4px;">DANH SÁCH CÁN BỘ TRỰC CA & TĂNG CƯỜNG THÊM GIỜ</div>
      <div style="font-size: 10pt; font-style: italic; color: #4B5563;">Ngày ca trực: ${dateFormatted}</div>
    </div>
    <div style="font-weight: bold; text-transform: uppercase; color: #1E3A8A; margin-bottom: 8px;">I. Bác Sĩ & Điều Dưỡng Trực Chính 12 Khoa</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 35%;">Khoa Phòng</th>
          <th style="width: 30%;">Bác Sĩ Trực Ca</th>
          <th style="width: 30%;">Điều Dưỡng Trực Ca</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map((r, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="font-weight: bold;">${escapeHtml(r.department_name || r.department_code)}</td>
            <td style="color: #1D4ED8; font-weight: bold;">${escapeHtml(r.doctor_name || '—')}</td>
            <td style="color: #065F46; font-weight: bold;">${escapeHtml(r.nurse_name || '—')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-weight: bold; text-transform: uppercase; color: #1E3A8A; margin: 20px 0 8px;">II. Nhân Sự Tăng Cường Thêm Giờ (${staffList.length} Cán Bộ)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 30%;">Khoa Phòng</th>
          <th style="width: 30%;">Họ Tên Cán Bộ Tăng Cường</th>
          <th style="width: 20%;">Thời Gian / Ca</th>
          <th style="width: 15%;">Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${staffList.length === 0 ? '<tr><td colspan="5" style="text-align: center; font-style: italic;">Không có cán bộ tăng cường thêm giờ trong ca trực.</td></tr>' : ''}
        ${staffList.map((st, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="font-weight: bold;">${escapeHtml(st.departmentName || st.departmentCode)}</td>
            <td style="color: #047857; font-weight: bold;">${escapeHtml(st.staffName)}</td>
            <td>${escapeHtml(st.time || 'Ca trực')}</td>
            <td>${escapeHtml(st.note || '—')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  },

  /**
   * 5. Generates 05_BoSuuTap_HinhAnh_LamSang_Va_CLS.html
   */
  generateImageGalleryHtml: (date, dayData) => {
    const dateFormatted = date.split('-').reverse().join('/');
    const imagesList = dayData.imagesList || [];

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bộ Sưu Tập Hình Ảnh Lâm Sàng & Cận Lâm Sàng - Ngày ${dateFormatted}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 10mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.4; color: #111827; background-color: #0F172A; margin: 0; padding: 20px; }
    .container { max-width: 210mm; margin: 0 auto; background-color: #FFFFFF; padding: 15mm; border-radius: 8px; box-sizing: border-box; }
    @media print { body { background: none; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } }
    .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
    .img-card { border: 1.5px solid #CBD5E1; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
    .img-card img { width: 100%; height: 220px; object-fit: cover; background-color: #000; }
    .img-card-info { padding: 8px 12px; font-size: 9pt; background: #F8FAFC; }
    .btn-print { background-color: #7C3AED; color: #FFFFFF; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 210mm; margin: 0 auto 10px; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ In Bộ Sưu Tập Ảnh (Ctrl + P)</button>
  </div>
  <div class="container">
    <div style="text-align: center; border-bottom: 2px solid #0F2C59; padding-bottom: 12px;">
      <div style="font-size: 9pt; text-transform: uppercase; color: #1E3A8A; font-weight: bold;">TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG</div>
      <div style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase; color: #7C3AED; margin-top: 4px;">BỘ SƯU TẬP HÌNH ẢNH LÂM SÀNG & CẬN LÂM SÀNG (${imagesList.length} ẢNH)</div>
      <div style="font-size: 10pt; font-style: italic; color: #64748B;">Ca trực ngày: ${dateFormatted}</div>
    </div>
    <div class="gallery-grid">
      ${imagesList.map((img, i) => `
        <div class="img-card">
          <img src="${img.url}" alt="${img.caption || 'Hình ảnh lâm sàng'}" />
          <div class="img-card-info">
            <div style="font-weight: bold; color: #0F2C59;">#${i + 1}. ${escapeHtml(img.patientName)}</div>
            <div style="color: #7C3AED; font-size: 8pt;">${escapeHtml(img.caseType)} — ${escapeHtml(img.caption)}</div>
            ${img.diagnosis ? `<div style="color: #D97706; font-size: 8pt; margin-top: 2px;">CĐ: ${escapeHtml(img.diagnosis)}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  },

  /**
   * Generates Real Excel Spreadsheet File
   */
  generateExcelFileBuffer: async (date, dayData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hospital Report System - BV Binh Long';
    workbook.created = new Date();

    // Sheet 1: Báo Cáo 12 Khoa
    const ws1 = workbook.addWorksheet('1. Báo Cáo 12 Khoa');
    ws1.addRow(['BÁO CÁO GIAO BAN CHUYÊN MÔN TOÀN VIỆN - NGÀY ' + date]);
    ws1.addRow(['STT', 'Khoa Phòng', 'Bác Sĩ Trực', 'Điều Dưỡng Trực', 'Trạng Thái', 'Phòng/Ca Trực']);
    (dayData.reports || []).forEach((r, i) => {
      ws1.addRow([i + 1, r.department_name || r.department_code, r.doctor_name, r.nurse_name, r.status, r.room || r.shift_time || '']);
    });

    // Sheet 2: Ca Diễn Biến Lâm Sàng
    const ws2 = workbook.addWorksheet('2. Ca Lâm Sàng Đặc Biệt');
    ws2.addRow(['DANH SÁCH CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT - NGÀY ' + date]);
    ws2.addRow(['Loại Ca', 'Khoa', 'Họ Tên BN', 'Tuổi', 'Địa Chỉ', 'Giờ Vào', 'Lý Do', 'Triệu Chứng Lâm Sàng', 'Kết Quả Cận Lâm Sàng', 'Chẩn Đoán', 'Xử Trí / Phẫu Thuật', 'Diễn Biến']);

    (dayData.surgeryCases || []).forEach(sc => {
      ws2.addRow(['Phẫu Thuật', sc.department_name || sc.department_code, sc.patient_name || sc.patientName, sc.birth_year || sc.age, sc.address, sc.admission_time, sc.reason, sc.clinical_symptoms, sc.clinical_tests, sc.preoperative_diagnosis, sc.consultation_order, sc.current_status]);
    });
    (dayData.transferCases || []).forEach(tc => {
      ws2.addRow(['Chuyển Viện', tc.department_name || tc.department_code, tc.patient_name || tc.patientName, tc.age, tc.address, tc.admission_time, tc.reason, tc.clinical_symptoms, tc.clinical_tests, tc.diagnosis, tc.initial_treatment, tc.progress_notes]);
    });
    (dayData.deathCases || []).forEach(dc => {
      ws2.addRow(['Tử Vong', dc.department_name || dc.department_code, dc.patient_name || dc.patientName, dc.age, dc.address, dc.admission_time, dc.reason, dc.clinical_symptoms, dc.clinical_tests, dc.diagnosis, dc.emergency_treatment, dc.final_outcome]);
    });
    (dayData.criticalCases || []).forEach(cc => {
      ws2.addRow(['Bệnh Nặng', cc.department_name || cc.department_code, cc.patient_name || cc.patientName, cc.age, cc.address, cc.admission_time, cc.medical_history, cc.clinical_symptoms, cc.clinical_tests, cc.diagnosis, cc.treatment, cc.condition_summary]);
    });

    // Sheet 3: Cán Bộ Trực & Thêm Giờ
    const ws3 = workbook.addWorksheet('3. Nhân Sự Trực & Thêm Giờ');
    ws3.addRow(['DANH SÁCH CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ - NGÀY ' + date]);
    ws3.addRow(['STT', 'Khoa Phòng', 'Cán Bộ Tăng Cường', 'Thời Gian', 'BS Trực Chính', 'ĐD Trực Chính', 'Ghi Chú']);
    (dayData.overtimeStaffList || []).forEach((st, i) => {
      ws3.addRow([i + 1, st.departmentName || st.departmentCode, st.staffName, st.time, st.doctorOnDuty, st.nurseOnDuty, st.note]);
    });

    return await workbook.xlsx.writeBuffer();
  },

  /**
   * Client-Side Master ZIP Packager - 5 DISTINCT INDIVIDUAL FILES + EXCEL & JSON
   */
  generateAndDownloadShiftZip: async (date, dayData, onProgress) => {
    const zip = new JSZip();
    const folderName = `BaoCaoGiaoBan_${date}`;
    const rootFolder = zip.folder(folderName);

    if (onProgress) onProgress('1/5: Đang tạo File Báo Cáo 12 Khoa Phòng...', 10);
    const generalReportHtml = dataArchiveService.generateGeneralReportHtml(date, dayData);
    rootFolder.file(`01_BaoCao_12_KhoaPhong.html`, generalReportHtml);

    if (onProgress) onProgress('2/5: Đang tạo File Chỉ Số Báo Cáo Trong Ca Trực (12 Khoa)...', 25);
    const departmentMetricsHtml = dataArchiveService.generateDepartmentMetricsHtml(date, dayData);
    rootFolder.file(`02_ChiSo_BaoCao_TrongCaTruc_CacKhoa.html`, departmentMetricsHtml);

    if (onProgress) onProgress('3/5: Đang tạo File Các Ca Diễn Biến Lâm Sàng Đặc Biệt...', 40);
    const clinicalCasesHtml = dataArchiveService.generateClinicalCasesHtml(date, dayData);
    rootFolder.file(`03_CacCaDienBien_LamSangDacBiet.html`, clinicalCasesHtml);

    if (onProgress) onProgress('4/5: Đang tạo File Danh Sách Cán Bộ Trực & Thêm Giờ...', 55);
    const staffListHtml = dataArchiveService.generateStaffListHtml(date, dayData);
    rootFolder.file(`04_DanhSach_CanBoTruc_Va_ThemGio.html`, staffListHtml);

    if (onProgress) onProgress('5/5: Đang tạo File Bộ Sưu Tập Ảnh Lâm Sàng...', 70);
    const imageGalleryHtml = dataArchiveService.generateImageGalleryHtml(date, dayData);
    rootFolder.file(`05_BoSuuTap_HinhAnh_LamSang_Va_CLS.html`, imageGalleryHtml);

    // Excel & Raw JSON
    try {
      const excelBuffer = await dataArchiveService.generateExcelFileBuffer(date, dayData);
      rootFolder.file(`06_BangTongHop_SoLieu_ToanVien.xlsx`, excelBuffer);
    } catch (e) {}
    rootFolder.file(`07_DuLieuGiaoBan_RawData.json`, JSON.stringify(dayData, null, 2));

    // Images Subfolder
    const imagesFolder = rootFolder.folder('05_HinhAnh_LamSang_Va_CLS');
    const imagesList = dayData.imagesList || [];
    if (imagesList.length > 0) {
      let loadedCount = 0;
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        try {
          const cleanName = (img.patientName || 'BenhNhan').replace(/[^a-zA-Z0-9]/g, '_');
          const cleanType = (img.caseType || 'Anh').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${String(i + 1).padStart(2, '0')}_${cleanType}_${cleanName}.jpg`;

          if (img.url.startsWith('data:image')) {
            const base64Data = img.url.split(',')[1];
            imagesFolder.file(fileName, base64Data, { base64: true });
          } else if (img.url.startsWith('http')) {
            const res = await fetch(img.url);
            const blob = await res.blob();
            imagesFolder.file(fileName, blob);
          }
          loadedCount++;
          if (onProgress) {
            const pct = 70 + Math.round((loadedCount / imagesList.length) * 20);
            onProgress(`Đang nén ảnh (${loadedCount}/${imagesList.length})...`, pct);
          }
        } catch (imgErr) {}
      }
    }

    if (onProgress) onProgress('Đang nén thành file ZIP hoàn chỉnh...', 95);

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    saveAs(zipBlob, `BaoCaoGiaoBan_Ngay_${date}.zip`);
    if (onProgress) onProgress('Hoàn tất!', 100);
    return true;
  },

  /**
   * Generates Base64 ZIP representation for Email Attachment Dispatch
   */
  generateShiftZipBase64: async (date, dayData) => {
    const zip = new JSZip();
    const folderName = `BaoCaoGiaoBan_${date}`;
    const rootFolder = zip.folder(folderName);

    rootFolder.file(`01_BaoCao_12_KhoaPhong.html`, dataArchiveService.generateGeneralReportHtml(date, dayData));
    rootFolder.file(`02_ChiSo_BaoCao_TrongCaTruc_CacKhoa.html`, dataArchiveService.generateDepartmentMetricsHtml(date, dayData));
    rootFolder.file(`03_CacCaDienBien_LamSangDacBiet.html`, dataArchiveService.generateClinicalCasesHtml(date, dayData));
    rootFolder.file(`04_DanhSach_CanBoTruc_Va_ThemGio.html`, dataArchiveService.generateStaffListHtml(date, dayData));
    rootFolder.file(`05_BoSuuTap_HinhAnh_LamSang_Va_CLS.html`, dataArchiveService.generateImageGalleryHtml(date, dayData));

    try {
      const excelBuffer = await dataArchiveService.generateExcelFileBuffer(date, dayData);
      rootFolder.file(`06_BangTongHop_SoLieu_ToanVien.xlsx`, excelBuffer);
    } catch (e) {}

    rootFolder.file(`07_DuLieuGiaoBan_RawData.json`, JSON.stringify(dayData, null, 2));

    const imagesFolder = rootFolder.folder('05_HinhAnh_LamSang_Va_CLS');
    const imagesList = dayData.imagesList || [];
    for (let i = 0; i < imagesList.length; i++) {
      const img = imagesList[i];
      try {
        const cleanName = (img.patientName || 'BenhNhan').replace(/[^a-zA-Z0-9]/g, '_');
        const cleanType = (img.caseType || 'Anh').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${String(i + 1).padStart(2, '0')}_${cleanType}_${cleanName}.jpg`;

        if (img.url?.startsWith('data:image')) {
          const base64Data = img.url.split(',')[1];
          imagesFolder.file(fileName, base64Data, { base64: true });
        } else if (img.url?.startsWith('http')) {
          const res = await fetch(img.url);
          const blob = await res.blob();
          imagesFolder.file(fileName, blob);
        }
      } catch (imgErr) {}
    }

    return await zip.generateAsync({
      type: 'base64',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }
};

export default dataArchiveService;
