import api from './api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
   * Client-Side Instant ZIP Packager
   * Packages reports, staff, clinical cases, and clinical images into a single clean ZIP archive
   */
  generateAndDownloadShiftZip: async (date, dayData, onProgress) => {
    const zip = new JSZip();
    const cleanDate = date.replace(/-/g, '');
    const folderName = `BaoCaoGiaoBan_${date}`;
    const rootFolder = zip.folder(folderName);

    if (onProgress) onProgress('Đang chuẩn bị dữ liệu văn bản báo cáo...', 15);

    // 1. Summary Info File
    const summaryText = [
      `=============================================================`,
      `TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG`,
      `GÓI HỒ SƠ LƯU TRỮ GIAO BAN CHUYÊN MÔN TOÀN VIỆN`,
      `Ngày ca trực: ${date}`,
      `Thời gian xuất gói: ${new Date().toLocaleString('vi-VN')}`,
      `=============================================================`,
      ``,
      `I. TỔNG QUAN CA TRỰC:`,
      `- Tổng số khoa nộp báo cáo: ${dayData.reports?.length || 0} khoa`,
      `- Tổng ca chuyển viện: ${dayData.transferCases?.length || 0} ca`,
      `- Tổng ca phẫu thuật: ${dayData.surgeryCases?.length || 0} ca`,
      `- Tổng ca tử vong: ${dayData.deathCases?.length || 0} ca`,
      `- Tổng ca bệnh nhân nặng: ${dayData.criticalCases?.length || 0} ca`,
      `- Tổng nhân sự trực & tăng cường: ${dayData.overtimeStaffList?.length || 0} cán bộ`,
      `- Tổng số hình ảnh lâm sàng đính kèm: ${dayData.imagesList?.length || 0} ảnh`,
      ``,
      `II. CHI TIẾT TỪNG KHOA PHÒNG:`
    ];

    (dayData.reports || []).forEach((r, idx) => {
      summaryText.push(`\n[${idx + 1}] KHOA: ${r.department_name || r.department_code}`);
      summaryText.push(`  - Bác sĩ trực: ${r.doctor_name || '—'}`);
      summaryText.push(`  - Điều dưỡng trực: ${r.nurse_name || '—'}`);
      summaryText.push(`  - Trạng thái: ${r.status === 'submitted' ? 'ĐÃ NỘP' : 'CHƯA NỘP'}`);
      if (r.shift_time || r.room) summaryText.push(`  - Phòng/Ca: ${r.room || ''} ${r.shift_time || ''}`);
    });

    rootFolder.file(`01_TongHopGiaoBan_${date}.txt`, summaryText.join('\n'));

    // 2. Overtime Staff List File
    if (dayData.overtimeStaffList && dayData.overtimeStaffList.length > 0) {
      const staffLines = [
        `DANH SÁCH CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ - NGÀY ${date}`,
        `-------------------------------------------------------------`,
        ...dayData.overtimeStaffList.map((s, i) => 
          `${i + 1}. [${s.departmentName || s.departmentCode}] ${s.staffName} (${s.time || ''}) - BS Trực: ${s.doctorOnDuty || '—'} | ĐD Trực: ${s.nurseOnDuty || '—'} ${s.note ? `| Ghi chú: ${s.note}` : ''}`
        )
      ];
      rootFolder.file(`02_DanhSach_CanBoTruc_TangCuong_${date}.txt`, staffLines.join('\n'));
    }

    // 3. Clinical Cases File
    const caseLines = [
      `DANH SÁCH CÁC CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT - NGÀY ${date}`,
      `=============================================================`,
      ``,
      `--- 1. CA PHẪU THUẬT (${dayData.surgeryCases?.length || 0} ca) ---`
    ];

    (dayData.surgeryCases || []).forEach((sc, i) => {
      caseLines.push(`[Ca mổ #${i + 1}] ${sc.patient_name || sc.patientName} (${sc.age || sc.birth_year || ''}) - Giờ mổ: ${sc.surgery_time || '—'}`);
      caseLines.push(`  + Chẩn đoán trước mổ: ${sc.pre_diagnosis || sc.preoperativeDiagnosis || '—'}`);
      caseLines.push(`  + Phương pháp mổ: ${sc.surgery_method || sc.consultation_order || '—'}`);
      caseLines.push(`  + Chẩn đoán sau mổ: ${sc.post_diagnosis || sc.postoperativeDiagnosis || '—'}`);
      caseLines.push(`  + Phẫu thuật viên: ${sc.main_surgeon || '—'} | Gây mê: ${sc.anesthesiologist || '—'}`);
    });

    caseLines.push(`\n--- 2. CA CHUYỂN VIỆN (${dayData.transferCases?.length || 0} ca) ---`);
    (dayData.transferCases || []).forEach((tc, i) => {
      caseLines.push(`[Ca chuyển #${i + 1}] ${tc.patient_name || tc.patientName} (${tc.age || ''}) - Địa chỉ: ${tc.address || ''}`);
      caseLines.push(`  + Giờ vào: ${tc.admission_time || tc.admissionTime || '—'} | Lý do: ${tc.reason || '—'}`);
      caseLines.push(`  + Chẩn đoán: ${tc.diagnosis || '—'}`);
      caseLines.push(`  + Xử trí ban đầu: ${tc.initial_treatment || tc.initialTreatment || '—'}`);
      caseLines.push(`  + Diễn biến chuyển: ${tc.progress_notes || tc.progressNotes || '—'}`);
    });

    caseLines.push(`\n--- 3. CA TỬ VONG (${dayData.deathCases?.length || 0} ca) ---`);
    (dayData.deathCases || []).forEach((dc, i) => {
      caseLines.push(`[Ca tử vong #${i + 1}] ${dc.patient_name || dc.patientName} (${dc.age || ''}) - Giờ vào: ${dc.admission_time || '—'} | Tử vong lúc: ${dc.death_time || '—'}`);
      caseLines.push(`  + Chẩn đoán: ${dc.diagnosis || '—'}`);
      caseLines.push(`  + Xử trí cấp cứu: ${dc.treatment_summary || dc.emergency_treatment || '—'}`);
      caseLines.push(`  + Nguyên nhân: ${dc.cause_of_death || dc.final_outcome || '—'}`);
    });

    caseLines.push(`\n--- 4. BỆNH NHÂN NẶNG CẦN THEO DÕI (${dayData.criticalCases?.length || 0} ca) ---`);
    (dayData.criticalCases || []).forEach((cc, i) => {
      caseLines.push(`[Ca nặng #${i + 1}] ${cc.patient_name || cc.patientName} (${cc.age || ''}) - Vào lúc: ${cc.admission_time || '—'}`);
      caseLines.push(`  + Chẩn đoán: ${cc.diagnosis || '—'}`);
      caseLines.push(`  + Diễn biến: ${cc.condition_summary || '—'}`);
      caseLines.push(`  + Xử trí & Bàn giao: ${cc.treatment || ''} ${cc.notes ? `(${cc.notes})` : ''}`);
    });

    rootFolder.file(`03_CaDienBienLamSangDacBiet_${date}.txt`, caseLines.join('\n'));

    // 4. Raw JSON Data for backup
    rootFolder.file(`04_HoSoGiaoBan_BackupData_${date}.json`, JSON.stringify(dayData, null, 2));

    // 5. Clinical Images Subfolder
    const imagesFolder = rootFolder.folder('HinhAnh_LamSang');
    const imagesList = dayData.imagesList || [];

    if (imagesList.length > 0) {
      if (onProgress) onProgress(`Đang nén ${imagesList.length} hình ảnh lâm sàng...`, 40);

      let loadedCount = 0;
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        try {
          const cleanName = (img.patientName || 'BenhNhan').replace(/[^a-zA-Z0-9]/g, '_');
          const cleanType = (img.caseType || 'Anh').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${String(i + 1).padStart(2, '0')}_${cleanType}_${cleanName}.jpg`;

          if (img.url.startsWith('data:image')) {
            // Base64 image
            const base64Data = img.url.split(',')[1];
            imagesFolder.file(fileName, base64Data, { base64: true });
          } else if (img.url.startsWith('http')) {
            // Remote URL
            const res = await fetch(img.url);
            const blob = await res.blob();
            imagesFolder.file(fileName, blob);
          }
          loadedCount++;
          if (onProgress) {
            const pct = 40 + Math.round((loadedCount / imagesList.length) * 45);
            onProgress(`Đang đóng gói ảnh (${loadedCount}/${imagesList.length})...`, pct);
          }
        } catch (imgErr) {
          console.warn(`Lỗi đóng gói ảnh #${i + 1}:`, imgErr.message);
        }
      }
    }

    if (onProgress) onProgress('Đang tạo tệp nén ZIP hoàn chỉnh...', 90);

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    saveAs(zipBlob, `BaoCaoGiaoBan_Ngay_${date}.zip`);

    if (onProgress) onProgress('Hoàn tất!', 100);
    return true;
  }
};

export default dataArchiveService;
