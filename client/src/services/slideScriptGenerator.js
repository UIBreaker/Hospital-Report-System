import { normalizeMedicalSpeechText } from './medicalPhonetics';

/**
 * Format patient age into natural spoken phrase
 */
const formatSpokenAge = (val) => {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}$/.test(s)) return `sinh năm ${s}`;
  if (/^\d+$/.test(s)) return `${s} tuổi`;
  return `${s}`;
};

/**
 * Generate natural, professional Vietnamese narration script for any slide
 */
export const generateSlideNarrationScript = (slide, context = {}) => {
  if (!slide) return '';
  const { dateStr = '', slideIndex = 0, totalSlides = 0 } = context;
  const parts = [];

  switch (slide.type) {
    // 1. TITLE SLIDE (Mở đầu giao ban toàn viện)
    case 'title': {
      parts.push('Kính thưa Ban Giám Đốc và toàn thể hội nghị giao ban.');
      parts.push(`Sau đây là nội dung báo cáo giao ban chuyên môn ca trực ngày ${slide.formattedDateVN || dateStr || 'hôm nay'}.`);
      if (slide.hospitalTotal) {
        const ht = slide.hospitalTotal;
        parts.push(`Toàn viện ghi nhận ${ht.totalKham || 0} lượt khám bệnh.`);
        if (ht.totalPhauThuat > 0) parts.push(`Có ${ht.totalPhauThuat} ca phẫu thuật cấp cứu.`);
        if (ht.totalChuyenVien > 0) parts.push(`Có ${ht.totalChuyenVien} ca chuyển viện.`);
        if (ht.totalTuVong > 0) parts.push(`Ghi nhận ${ht.totalTuVong} ca tử vong.`);
        else parts.push('Không có trường hợp tử vong.');
      }
      break;
    }

    // 2. HOSPITAL-WIDE SUMMARY SLIDE (Bảng tổng hợp toàn viện)
    case 'summary': {
      parts.push('Tiếp theo là bảng số liệu tổng hợp chuyên môn toàn viện.');
      if (slide.stats) {
        const st = slide.stats;
        parts.push(`Tổng số khám toàn viện đạt ${st.totalKham || 0} lượt.`);
        parts.push(`Hiện có ${st.totalHienCon || 0} bệnh nhân đang điều trị nội trú.`);
        parts.push(`Tổng cộng có ${st.totalPhauThuat || 0} ca mổ, ${st.totalChuyenVien || 0} ca chuyển viện và ${st.totalBenhNang || 0} ca bệnh nặng cần theo dõi sát.`);
      }
      break;
    }

    // 3. DEPARTMENT INTRO SLIDE (Mở đầu ca trực của từng khoa)
    case 'dept_intro': {
      parts.push(`Báo cáo ca trực ${slide.deptName || 'khoa'}.`);
      if (slide.doctorName) parts.push(`Bác sĩ trực: ${slide.doctorName}.`);
      if (slide.nurseName) parts.push(`Điều dưỡng trực: ${slide.nurseName}.`);
      if (slide.room) parts.push(`Phòng trực: ${slide.room}.`);
      if (slide.shiftTime) parts.push(`Thời gian ca trực: ${slide.shiftTime}.`);
      if (Array.isArray(slide.overtimeStaff) && slide.overtimeStaff.length > 0) {
        const otNames = slide.overtimeStaff.map(o => o.staffName || o.name).filter(Boolean).join(', ');
        if (otNames) parts.push(`Nhân sự tăng cường gồm có: ${otNames}.`);
      }
      break;
    }

    // 4. DEPARTMENT DATA SLIDE (Số liệu chuyên môn của khoa)
    case 'department': {
      parts.push(`Số liệu chuyên môn ${slide.deptName || ''}.`);
      if (slide.subTitle) parts.push(`${slide.subTitle}.`);

      if (Array.isArray(slide.sections) && slide.sections.length > 0) {
        slide.sections.forEach(sec => {
          if (sec.title) parts.push(`Phần ${sec.title}.`);
          if (Array.isArray(sec.items) && sec.items.length > 0) {
            sec.items.forEach(item => {
              if (item.label && item.value !== undefined && item.value !== null && item.value !== '') {
                parts.push(`${item.label}: ${item.value}.`);
              }
            });
          }
        });
      }

      // Read shift notes / general condition if present
      if (slide.formData) {
        const fd = slide.formData;
        if (fd.tinhHinhChung) parts.push(`Tình hình chung ca trực: ${fd.tinhHinhChung}.`);
        if (fd.themGio) parts.push(`Ghi chú thêm giờ: ${fd.themGio}.`);
        if (fd.ghiChu) parts.push(`Ghi chú: ${fd.ghiChu}.`);
      }
      break;
    }

    // 5. CLINICAL CASES OVERVIEW SLIDE (Khối tổng hợp các ca đặc biệt)
    case 'clinical_overview': {
      parts.push(`Tổng hợp các ca bệnh đặc biệt trong ca trực ${slide.deptName || ''}.`);
      if (slide.transferCases?.length > 0) parts.push(`Có ${slide.transferCases.length} ca chuyển viện.`);
      if (slide.surgeryCases?.length > 0) parts.push(`Có ${slide.surgeryCases.length} ca phẫu thuật.`);
      if (slide.criticalCases?.length > 0) parts.push(`Có ${slide.criticalCases.length} bệnh nhân nặng cần theo dõi.`);
      if (slide.deathCases?.length > 0) parts.push(`Có ${slide.deathCases.length} ca tử vong.`);
      break;
    }

    // 6. TRANSFER CASE SLIDE (Ca chuyển viện)
    case 'transfer': {
      const tc = slide.transferCase || {};
      const pIndex = slide.caseIndex || 1;
      const pTotal = slide.totalCases || 1;
      parts.push(`Ca chuyển viện số ${pIndex} trên ${pTotal} của ${slide.deptName || 'khoa'}.`);
      
      const pName = tc.patient_name || tc.patientName || 'Bệnh nhân';
      const pAge = formatSpokenAge(tc.age);
      const pAddress = tc.address ? `địa chỉ tại ${tc.address}` : '';
      parts.push(`Bệnh nhân ${pName}, ${pAge} ${pAddress}.`);

      if (tc.admission_time || tc.admissionTime) parts.push(`Vào viện lúc ${tc.admission_time || tc.admissionTime}.`);
      if (tc.reason) parts.push(`Lý do vào viện: ${tc.reason}.`);
      if (tc.clinical_symptoms || tc.clinicalSymptoms) parts.push(`Lâm sàng: ${tc.clinical_symptoms || tc.clinicalSymptoms}.`);
      if (tc.clinical_tests || tc.clinicalTests) parts.push(`Cận lâm sàng: ${tc.clinical_tests || tc.clinicalTests}.`);
      if (tc.diagnosis) parts.push(`Chẩn đoán: ${tc.diagnosis}.`);
      if (tc.initial_treatment || tc.initialTreatment) parts.push(`Xử trí ban đầu: ${tc.initial_treatment || tc.initialTreatment}.`);
      if (tc.progress_notes || tc.progressNotes) parts.push(`Diễn biến chuyển viện: ${tc.progress_notes || tc.progressNotes}.`);
      break;
    }

    // 7. SURGERY CASE SLIDE (Ca mổ)
    case 'surgery': {
      const sc = slide.surgeryCase || {};
      const sIndex = slide.caseIndex || 1;
      const sTotal = slide.totalCases || 1;
      parts.push(`Ca phẫu thuật số ${sIndex} trên ${sTotal} của ${slide.deptName || 'khoa'}.`);

      const sName = sc.patient_name || sc.patientName || 'Bệnh nhân';
      const sAge = formatSpokenAge(sc.birth_year || sc.birthYear || sc.age);
      parts.push(`Bệnh nhân ${sName}, ${sAge}.`);

      if (sc.admission_time || sc.admissionTime) parts.push(`Vào viện lúc ${sc.admission_time || sc.admissionTime}.`);
      if (sc.reason) parts.push(`Lý do: ${sc.reason}.`);
      if (sc.preoperative_diagnosis || sc.preoperativeDiagnosis) parts.push(`Chẩn đoán trước mổ: ${sc.preoperative_diagnosis || sc.preoperativeDiagnosis}.`);
      if (sc.consultation_order || sc.consultationOrder) parts.push(`Lệnh mổ: ${sc.consultation_order || sc.consultationOrder}.`);
      if (sc.postoperative_diagnosis || sc.postoperativeDiagnosis) parts.push(`Chẩn đoán sau mổ: ${sc.postoperative_diagnosis || sc.postoperativeDiagnosis}.`);
      if (sc.current_status || sc.currentStatus) parts.push(`Hiện tại: ${sc.current_status || sc.currentStatus}.`);
      break;
    }

    // 8. CRITICAL CASE SLIDE (Bệnh nhân nặng)
    case 'critical': {
      const cc = slide.criticalCase || {};
      const cIndex = slide.caseIndex || 1;
      const cTotal = slide.totalCases || 1;
      parts.push(`Bệnh nhân nặng cần theo dõi số ${cIndex} trên ${cTotal} của ${slide.deptName || 'khoa'}.`);

      const cName = cc.patient_name || cc.patientName || 'Bệnh nhân';
      const cAge = formatSpokenAge(cc.age);
      parts.push(`Bệnh nhân ${cName}, ${cAge}.`);

      if (cc.admission_time || cc.admissionTime) parts.push(`Vào viện lúc ${cc.admission_time || cc.admissionTime}.`);
      if (cc.medical_history || cc.medicalHistory) parts.push(`Tiền sử bệnh: ${cc.medical_history || cc.medicalHistory}.`);
      if (cc.clinical_symptoms || cc.clinicalSymptoms) parts.push(`Lâm sàng và sinh hiệu: ${cc.clinical_symptoms || cc.clinicalSymptoms}.`);
      if (cc.diagnosis) parts.push(`Chẩn đoán: ${cc.diagnosis}.`);
      if (cc.condition_summary || cc.conditionSummary) parts.push(`Diễn biến: ${cc.condition_summary || cc.conditionSummary}.`);
      if (cc.treatment) parts.push(`Xử trí: ${cc.treatment}.`);
      if (cc.notes) parts.push(`Bàn giao ca sau: ${cc.notes}.`);
      break;
    }

    // 9. DEATH CASE SLIDE (Ca tử vong)
    case 'death': {
      const dc = slide.deathCase || {};
      parts.push(`Báo cáo trường hợp tử vong tại ${slide.deptName || 'khoa'}.`);

      const dName = dc.patient_name || dc.patientName || 'Bệnh nhân';
      const dAge = formatSpokenAge(dc.age);
      parts.push(`Bệnh nhân ${dName}, ${dAge}.`);

      if (dc.admission_time || dc.admissionTime) parts.push(`Tiếp nhận lúc ${dc.admission_time || dc.admissionTime}.`);
      if (dc.admission_status || dc.admissionStatus) parts.push(`Tình trạng lúc vào viện: ${dc.admission_status || dc.admissionStatus}.`);
      if (dc.medical_history || dc.medicalHistory) parts.push(`Tiền sử: ${dc.medical_history || dc.medicalHistory}.`);
      if (dc.diagnosis) parts.push(`Chẩn đoán: ${dc.diagnosis}.`);
      if (dc.emergency_treatment || dc.emergencyTreatment) parts.push(`Xử trí hồi sức: ${dc.emergency_treatment || dc.emergencyTreatment}.`);
      if (dc.final_outcome || dc.finalOutcome) parts.push(`Kết luận: ${dc.final_outcome || dc.finalOutcome}.`);
      break;
    }

    // 10. FULLSCREEN IMAGE SLIDE (Hình ảnh lâm sàng)
    case 'fullscreen_image': {
      parts.push(`Hình ảnh tư liệu ${slide.caseType === 'surgery' ? 'phẫu thuật' : 'lâm sàng'} đính kèm của bệnh nhân ${slide.patientName || ''}.`);
      break;
    }

    // 11. CLOSING SLIDE (Kết thúc giao ban)
    case 'closing': {
      parts.push('Nội dung báo cáo giao ban chuyên môn đến đây là kết thúc.');
      parts.push('Kính chúc Ban Giám Đốc và toàn thể y bác sĩ, nhân viên y tế một ngày làm việc hiệu quả và thành công.');
      break;
    }

    default:
      if (slide.title) parts.push(slide.title);
      if (slide.subTitle) parts.push(slide.subTitle);
      break;
  }

  const rawScript = parts.join(' ');
  return normalizeMedicalSpeechText(rawScript);
};

export default generateSlideNarrationScript;
