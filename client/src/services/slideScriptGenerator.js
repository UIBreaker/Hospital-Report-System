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
 * Clean spoken number (e.g. '00' -> '0', '08' -> '8')
 */
const cleanNum = (val) => {
  if (val === null || val === undefined || val === '') return '0';
  const s = String(val).trim();
  if (/^0\d+$/.test(s)) return String(parseInt(s, 10));
  return s;
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
      if (slide.summary || slide.hospitalTotal) {
        const ht = slide.summary || slide.hospitalTotal;
        parts.push(`Toàn viện ghi nhận ${cleanNum(ht.tongSoKham || ht.totalKham)} lượt khám bệnh.`);
        if (Number(ht.phauThuat || ht.totalPhauThuat) > 0) parts.push(`Có ${cleanNum(ht.phauThuat || ht.totalPhauThuat)} ca phẫu thuật cấp cứu.`);
        if (Number(ht.chuyenVien || ht.totalChuyenVien) > 0) parts.push(`Có ${cleanNum(ht.chuyenVien || ht.totalChuyenVien)} ca chuyển viện.`);
        if (Number(ht.tuVong || ht.totalTuVong) > 0) parts.push(`Ghi nhận ${cleanNum(ht.tuVong || ht.totalTuVong)} ca tử vong.`);
        else parts.push('Không có trường hợp tử vong.');
      }
      break;
    }

    // 2. HOSPITAL-WIDE SUMMARY SLIDE (Bảng tổng hợp toàn viện)
    case 'summary': {
      parts.push('Tiếp theo là bảng số liệu tổng hợp chuyên môn toàn viện.');
      if (slide.summary || slide.stats) {
        const st = slide.summary || slide.stats;
        parts.push(`Tổng số khám toàn viện đạt ${cleanNum(st.tongSoKham || st.totalKham)} lượt.`);
        parts.push(`Hiện có ${cleanNum(st.hienCon || st.totalHienCon)} bệnh nhân đang điều trị nội trú.`);
        parts.push(`Tổng cộng có ${cleanNum(st.phauThuat || st.totalPhauThuat)} ca mổ, ${cleanNum(st.chuyenVien || st.totalChuyenVien)} ca chuyển viện và ${cleanNum(st.benhNang || st.totalBenhNang)} ca bệnh nặng cần theo dõi sát.`);
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

    // 4. DEPARTMENT DATA SLIDE (Số liệu chuyên môn của khoa & Biểu đồ / Bảng cột)
    case 'department': {
      parts.push(`Số liệu chuyên môn ${slide.deptName || ''}.`);
      if (slide.subTitle) parts.push(`${slide.subTitle}.`);

      if (Array.isArray(slide.sections) && slide.sections.length > 0) {
        slide.sections.forEach(sec => {
          if (sec.title) parts.push(`${sec.title}.`);

          // 4.1 Handle Table-based Departments (LCK, CDHA, XN, GMHS, etc.)
          if (Array.isArray(sec.tableRows) && sec.tableRows.length > 0) {
            sec.tableRows.forEach(row => {
              const rName = row.name || row.label || '';
              const rowParts = [];

              // For LCK (4 Chuyên Khoa)
              if (row.thuThuat !== undefined || row.nhapVien !== undefined) {
                rowParts.push(`${rName}: tổng số khám ${cleanNum(row.tongSo)} ca`);
                if (Number(row.thuThuat) > 0) rowParts.push(`thủ thuật ${cleanNum(row.thuThuat)} ca`);
                if (Number(row.nhapVien) > 0) rowParts.push(`nhập viện ${cleanNum(row.nhapVien)} ca`);
                if (Number(row.chuyenVien) > 0) rowParts.push(`chuyển viện ${cleanNum(row.chuyenVien)} ca`);
              }
              // For CDHA & XN (Kỹ thuật CDHA, Xét nghiệm)
              else if (row.baoHiem !== undefined || row.noiTru !== undefined || row.ngoaiTru !== undefined) {
                rowParts.push(`${rName}: tổng số ${cleanNum(row.tongSo)} lượt`);
                if (Number(row.baoHiem) > 0) rowParts.push(`Bảo hiểm y tế ${cleanNum(row.baoHiem)}`);
                if (Number(row.noiTru) > 0) rowParts.push(`nội trú ${cleanNum(row.noiTru)}`);
                if (Number(row.ngoaiTru) > 0) rowParts.push(`ngoại trú ${cleanNum(row.ngoaiTru)}`);
              }
              // For GMHS (Phẫu thuật & Gây mê)
              else if (row.cc !== undefined || row.ct !== undefined || row.tong !== undefined) {
                rowParts.push(`${rName}: tổng số ${cleanNum(row.tong)} ca`);
                if (row.cc && row.cc !== '—' && Number(row.cc) > 0) rowParts.push(`mổ cấp cứu ${cleanNum(row.cc)}`);
                if (row.ct && row.ct !== '—' && Number(row.ct) > 0) rowParts.push(`mổ kế hoạch ${cleanNum(row.ct)}`);
              }
              // General Table Row
              else if (row.tongSo !== undefined || row.value !== undefined) {
                rowParts.push(`${rName}: ${cleanNum(row.tongSo || row.value)}`);
              }

              if (rowParts.length > 0) {
                parts.push(rowParts.join(', ') + '.');
              }
            });
          }

          // 4.2 Handle Item-based sections (Nội, Nhi, Sản, HSCC, TNT, v.v.)
          if (Array.isArray(sec.items) && sec.items.length > 0) {
            sec.items.forEach(item => {
              if (item.label && item.value !== undefined && item.value !== null && item.value !== '') {
                parts.push(`${item.label}: ${cleanNum(item.value)}.`);
              }
            });
          }

          // 4.3 Handle Note / Personnel values
          if (sec.value && typeof sec.value === 'string') {
            parts.push(`${sec.value}.`);
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

    // 6.1 TRANSFER CASE SLIDE (PART 1: Tiếp nhận, Chẩn đoán & Xử trí ban đầu)
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
      if (tc.diagnosis) parts.push(`Chẩn đoán xác định: ${tc.diagnosis}.`);
      if (tc.initial_treatment || tc.initialTreatment) parts.push(`Xử trí ban đầu: ${tc.initial_treatment || tc.initialTreatment}.`);
      break;
    }

    // 6.2 TRANSFER CLINICAL SLIDE (PART 2: Chi tiết Lâm sàng & Cận lâm sàng)
    case 'transfer_clinical': {
      const tc = slide.transferCase || {};
      const pIndex = slide.caseIndex || 1;
      const pName = tc.patient_name || tc.patientName || 'Bệnh nhân';
      parts.push(`Chi tiết lâm sàng và cận lâm sàng ca chuyển viện số ${pIndex} của bệnh nhân ${pName}.`);

      if (tc.clinical_symptoms || tc.clinicalSymptoms) parts.push(`Lâm sàng và triệu chứng khám: ${tc.clinical_symptoms || tc.clinicalSymptoms}.`);
      if (tc.clinical_tests || tc.clinicalTests) parts.push(`Cận lâm sàng, X-quang và xét nghiệm: ${tc.clinical_tests || tc.clinicalTests}.`);
      break;
    }

    // 6.3 TRANSFER PROGRESS SLIDE (PART 3: Diễn biến chuyển viện)
    case 'transfer_progress': {
      const tc = slide.transferCase || {};
      const pIndex = slide.caseIndex || 1;
      const pName = tc.patient_name || tc.patientName || 'Bệnh nhân';
      parts.push(`Diễn biến chuyển viện ca số ${pIndex} của bệnh nhân ${pName}.`);
      if (tc.progress_notes || tc.progressNotes) parts.push(`Quá trình và diễn biến chuyển viện: ${tc.progress_notes || tc.progressNotes}.`);
      break;
    }

    // 7.1 SURGERY CASE SLIDE (PART 1: Chẩn đoán & Lệnh mổ)
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

    // 7.2 SURGERY CLINICAL SLIDE (PART 2: Lâm sàng & CLS)
    case 'surgery_clinical': {
      const sc = slide.surgeryCase || {};
      const sIndex = slide.caseIndex || 1;
      const sName = sc.patient_name || sc.patientName || 'Bệnh nhân';
      parts.push(`Chi tiết lâm sàng và cận lâm sàng ca mổ số ${sIndex} của bệnh nhân ${sName}.`);

      if (sc.clinical_symptoms || sc.clinicalSymptoms) parts.push(`Lâm sàng: ${sc.clinical_symptoms || sc.clinicalSymptoms}.`);
      if (sc.clinical_tests || sc.clinicalTests) parts.push(`Cận lâm sàng: ${sc.clinical_tests || sc.clinicalTests}.`);
      break;
    }

    // 8.1 CRITICAL CASE SLIDE (PART 1: Chẩn đoán & Xử trí)
    case 'critical': {
      const cc = slide.criticalCase || {};
      const cIndex = slide.caseIndex || 1;
      const cTotal = slide.totalCases || 1;
      parts.push(`Bệnh nhân nặng cần theo dõi số ${cIndex} trên ${cTotal} của ${slide.deptName || 'khoa'}.`);

      const cName = cc.patient_name || cc.patientName || 'Bệnh nhân';
      const cAge = formatSpokenAge(cc.age);
      parts.push(`Bệnh nhân ${cName}, ${cAge}.`);

      if (cc.admission_time || cc.admissionTime) parts.push(`Vào viện lúc ${cc.admission_time || cc.admissionTime}.`);
      if (cc.diagnosis) parts.push(`Chẩn đoán: ${cc.diagnosis}.`);
      if (cc.treatment) parts.push(`Xử trí: ${cc.treatment}.`);
      if (cc.notes) parts.push(`Bàn giao ca sau: ${cc.notes}.`);
      break;
    }

    // 8.2 CRITICAL CLINICAL SLIDE (PART 2: Lâm sàng & Xét nghiệm)
    case 'critical_clinical': {
      const cc = slide.criticalCase || {};
      const cIndex = slide.caseIndex || 1;
      const cName = cc.patient_name || cc.patientName || 'Bệnh nhân';
      parts.push(`Chi tiết lâm sàng và xét nghiệm bệnh nhân nặng số ${cIndex} ${cName}.`);

      if (cc.medical_history || cc.medicalHistory) parts.push(`Tiền sử bệnh: ${cc.medical_history || cc.medicalHistory}.`);
      if (cc.clinical_symptoms || cc.clinicalSymptoms) parts.push(`Lâm sàng và sinh hiệu: ${cc.clinical_symptoms || cc.clinicalSymptoms}.`);
      if (cc.condition_summary || cc.conditionSummary) parts.push(`Diễn biến: ${cc.condition_summary || cc.conditionSummary}.`);
      if (cc.clinical_tests || cc.clinicalTests) parts.push(`Cận lâm sàng: ${cc.clinical_tests || cc.clinicalTests}.`);
      break;
    }

    // 9.1 DEATH CASE SLIDE (PART 1: Chẩn đoán & Cấp cứu)
    case 'death': {
      const dc = slide.deathCase || {};
      parts.push(`Báo cáo trường hợp tử vong tại ${slide.deptName || 'khoa'}.`);

      const dName = dc.patient_name || dc.patientName || 'Bệnh nhân';
      const dAge = formatSpokenAge(dc.age);
      parts.push(`Bệnh nhân ${dName}, ${dAge}.`);

      if (dc.admission_time || dc.admissionTime) parts.push(`Tiếp nhận lúc ${dc.admission_time || dc.admissionTime}.`);
      if (dc.admission_status || dc.admissionStatus) parts.push(`Tình trạng lúc vào viện: ${dc.admission_status || dc.admissionStatus}.`);
      if (dc.diagnosis) parts.push(`Chẩn đoán tử vong: ${dc.diagnosis}.`);
      if (dc.emergency_treatment || dc.emergencyTreatment) parts.push(`Xử trí hồi sức: ${dc.emergency_treatment || dc.emergencyTreatment}.`);
      if (dc.final_outcome || dc.finalOutcome) parts.push(`Kết luận: ${dc.final_outcome || dc.finalOutcome}.`);
      break;
    }

    // 9.2 DEATH CLINICAL SLIDE (PART 2: Tiền sử, Lâm sàng & ECG)
    case 'death_clinical': {
      const dc = slide.deathCase || {};
      const dName = dc.patient_name || dc.patientName || 'Bệnh nhân';
      parts.push(`Chi tiết tiền sử và lâm sàng ca tử vong bệnh nhân ${dName}.`);

      if (dc.medical_history || dc.medicalHistory) parts.push(`Tiền sử: ${dc.medical_history || dc.medicalHistory}.`);
      if (dc.clinical_symptoms || dc.clinicalSymptoms) parts.push(`Lâm sàng và sinh hiệu: ${dc.clinical_symptoms || dc.clinicalSymptoms}.`);
      if (dc.clinical_tests || dc.clinicalTests) parts.push(`Cận lâm sàng và điện tâm đồ: ${dc.clinical_tests || dc.clinicalTests}.`);
      break;
    }

    // 10. CASE IMAGE SLIDE (Hình ảnh cận lâm sàng)
    case 'case_image':
    case 'fullscreen_image': {
      const pName = slide.caseItem?.patient_name || slide.caseItem?.patientName || slide.patientName || '';
      parts.push(`Hình ảnh cận lâm sàng minh họa số ${slide.imgIndex || 1} của bệnh nhân ${pName}.`);
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
