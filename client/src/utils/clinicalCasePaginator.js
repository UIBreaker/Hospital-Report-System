import { formatPatientAge, normalizeImages } from './medicalFormatters.js';

/**
 * Builds sequentially formatted, scrollbar-free clinical case slides
 * Following the exact bullet point order requested by TTYT Bình Long:
 * 
 * 1. BỆNH CHUYỂN VIỆN:
 *    Họ tên, tuổi, địa chỉ -> giờ vào -> lí do vào -> Lâm Sàng -> Cận Lâm Sàng -> chẩn đoán -> xử trí -> diễn biến -> hình ảnh
 * 
 * 2. BỆNH PHẪU THUẬT (BỆNH MỔ):
 *    Họ tên, tuổi, địa chỉ -> giờ vào -> lí do vào -> Lâm Sàng -> Cận Lâm Sàng -> chẩn đoán trước mổ -> Nội Dung Hội Chẩn / Lệnh Mổ -> Chẩn Đoán Sau Mổ -> Tình Trạng Hiện Tại (Hậu Phẫu) -> hình ảnh
 * 
 * 3. BỆNH NẶNG THEO DÕI:
 *    Họ tên, tuổi, địa chỉ -> giờ vào -> Tiền căn bệnh -> Lâm Sàng -> Cận Lâm Sàng -> Chẩn đoán bệnh -> Tình trạng bệnh & Diễn biến -> Xử trí điều trị -> Ghi chú / Hướng xử trí tiếp theo -> hình ảnh
 * 
 * 4. BÁO CÁO BỆNH NHÂN TỬ VONG:
 *    Họ tên, tuổi, địa chỉ -> giờ vào -> lí do vào -> Tình Trạng Lúc Vào Khoa -> Tiền Sử Bệnh -> Lâm Sàng -> Kết Quả Cận Lâm Sàng -> Chẩn Đoán Tử Vong -> Xử Trí Cấp Cứu -> Kết Quả Cuối Cùng & Hướng Xử Lý Thi Thể -> hình ảnh
 */
export const buildCaseSlides = ({
  caseType,
  caseItem,
  caseIndex,
  totalCases,
  deptCode,
  deptName
}) => {
  if (!caseItem) return [];
  const slides = [];

  const pName = caseItem.patient_name || caseItem.patientName || 'BỆNH NHÂN';
  const rawAge = caseItem.birth_year || caseItem.birthYear || caseItem.age;
  const ageFormatted = formatPatientAge(rawAge);
  const pAddress = caseItem.address || '';
  const normImgs = normalizeImages(caseItem.images);

  let configs = [];
  let phase1Keys = [];
  let phase2Keys = [];
  let p1Subtitle = '';
  let p2Subtitle = '';

  if (caseType === 'transfer') {
    p1Subtitle = 'PHẦN 1: TIẾP NHẬN & CHẨN ĐOÁN';
    p2Subtitle = 'PHẦN 2: XỬ TRÍ & DIỄN BIẾN';
    phase1Keys = ['admission_time', 'reason', 'clinical_symptoms', 'clinical_tests', 'diagnosis'];
    phase2Keys = ['initial_treatment', 'progress_notes'];
    configs = [
      { key: 'admission_time', val: caseItem.admission_time || caseItem.admissionTime, label: 'Giờ ngày vào viện' },
      { key: 'reason', val: caseItem.reason, label: 'Lí do vào viện' },
      { key: 'clinical_symptoms', val: caseItem.clinical_symptoms || caseItem.clinicalSymptoms, label: 'Lâm Sàng' },
      { key: 'clinical_tests', val: caseItem.clinical_tests || caseItem.clinicalTests, label: 'Cận Lâm Sàng' },
      { key: 'diagnosis', val: caseItem.diagnosis, label: 'Chẩn đoán', isHighlight: true, uppercase: true },
      { key: 'initial_treatment', val: caseItem.initial_treatment || caseItem.initialTreatment, label: 'Xử trí' },
      { key: 'progress_notes', val: caseItem.progress_notes || caseItem.progressNotes, label: 'Diễn biến' }
    ];
  } else if (caseType === 'surgery') {
    p1Subtitle = 'PHẦN 1: TIẾP NHẬN & TIỀN PHẪU';
    p2Subtitle = 'PHẦN 2: HỘI CHẨN & HẬU PHẪU';
    phase1Keys = ['admission_time', 'reason', 'clinical_symptoms', 'clinical_tests', 'preoperative_diagnosis'];
    phase2Keys = ['consultation_order', 'postoperative_diagnosis', 'current_status'];
    configs = [
      { key: 'admission_time', val: caseItem.admission_time || caseItem.admissionTime, label: 'Giờ ngày vào viện' },
      { key: 'reason', val: caseItem.reason, label: 'Lí do vào viện' },
      { key: 'clinical_symptoms', val: caseItem.clinical_symptoms || caseItem.clinicalSymptoms, label: 'Lâm Sàng' },
      { key: 'clinical_tests', val: caseItem.clinical_tests || caseItem.clinicalTests, label: 'Cận Lâm Sàng' },
      { key: 'preoperative_diagnosis', val: caseItem.preoperative_diagnosis || caseItem.preoperativeDiagnosis, label: 'Chẩn đoán trước mổ', isHighlight: true },
      { key: 'consultation_order', val: caseItem.consultation_order || caseItem.consultationOrder, label: 'Nội Dung Hội Chẩn / Lệnh Mổ' },
      { key: 'postoperative_diagnosis', val: caseItem.postoperative_diagnosis || caseItem.postoperativeDiagnosis, label: 'Chẩn Đoán Sau Mổ', isHighlight: true, uppercase: true },
      { key: 'current_status', val: caseItem.current_status || caseItem.currentStatus, label: 'Tình Trạng Hiện Tại (Hậu Phẫu)' }
    ];
  } else if (caseType === 'critical') {
    p1Subtitle = 'PHẦN 1: TIẾP NHẬN & CHẨN ĐOÁN';
    p2Subtitle = 'PHẦN 2: DIỄN BIẾN & ĐIỀU TRỊ';
    phase1Keys = ['admission_time', 'medical_history', 'clinical_symptoms', 'clinical_tests', 'diagnosis'];
    phase2Keys = ['condition_summary', 'treatment', 'notes'];
    configs = [
      { key: 'admission_time', val: caseItem.admission_time || caseItem.admissionTime, label: 'Giờ ngày vào viện' },
      { key: 'medical_history', val: caseItem.medical_history || caseItem.medicalHistory, label: 'Tiền căn bệnh' },
      { key: 'clinical_symptoms', val: caseItem.clinical_symptoms || caseItem.clinicalSymptoms, label: 'Lâm Sàng' },
      { key: 'clinical_tests', val: caseItem.clinical_tests || caseItem.clinicalTests, label: 'Cận Lâm Sàng' },
      { key: 'diagnosis', val: caseItem.diagnosis, label: 'Chẩn đoán bệnh', isHighlight: true, uppercase: true },
      { key: 'condition_summary', val: caseItem.condition_summary || caseItem.conditionSummary, label: 'Tình trạng bệnh & Diễn biến' },
      { key: 'treatment', val: caseItem.treatment, label: 'Xử trí điều trị' },
      { key: 'notes', val: caseItem.notes, label: 'Ghi chú / Hướng xử trí tiếp theo' }
    ];
  } else if (caseType === 'death') {
    p1Subtitle = 'PHẦN 1: TIẾP NHẬN & LÂM SÀNG';
    p2Subtitle = 'PHẦN 2: CHẨN ĐOÁN & XỬ TRÍ';
    phase1Keys = ['admission_time', 'reason', 'admission_status', 'medical_history', 'clinical_symptoms', 'clinical_tests'];
    phase2Keys = ['diagnosis', 'emergency_treatment', 'final_outcome'];
    configs = [
      { key: 'admission_time', val: caseItem.admission_time || caseItem.admissionTime, label: 'Giờ ngày vào viện' },
      { key: 'reason', val: caseItem.reason, label: 'Lí do vào viện' },
      { key: 'admission_status', val: caseItem.admission_status || caseItem.admissionStatus, label: 'Tình Trạng Lúc Vào Khoa' },
      { key: 'medical_history', val: caseItem.medical_history || caseItem.medicalHistory, label: 'Tiền Sử Bệnh' },
      { key: 'clinical_symptoms', val: caseItem.clinical_symptoms || caseItem.clinicalSymptoms, label: 'Lâm Sàng' },
      { key: 'clinical_tests', val: caseItem.clinical_tests || caseItem.clinicalTests, label: 'Kết Quả Cận Lâm Sàng' },
      { key: 'diagnosis', val: caseItem.diagnosis, label: 'Chẩn Đoán Tử Vong', isHighlight: true, uppercase: true },
      { key: 'emergency_treatment', val: caseItem.emergency_treatment || caseItem.emergencyTreatment, label: 'Xử Trí Cấp Cứu' },
      { key: 'final_outcome', val: caseItem.final_outcome || caseItem.finalOutcome, label: 'Kết Quả Cuối Cùng & Hướng Xử Lý Thi Thể' }
    ];
  }

  // Filter to active (non-empty) items
  const activeItems = configs
    .filter(c => c.val !== null && c.val !== undefined && String(c.val).trim() !== '' && String(c.val).trim() !== '—')
    .map(c => ({
      key: c.key,
      label: c.label,
      value: String(c.val).trim(),
      isHighlight: Boolean(c.isHighlight),
      uppercase: Boolean(c.uppercase)
    }));

  if (activeItems.length === 0) {
    activeItems.push({ key: 'info', label: 'Thông tin ca bệnh', value: 'Chưa cập nhật chi tiết' });
  }

  const totalLength = activeItems.reduce((acc, it) => acc + it.value.length + it.label.length, 0);
  const maxItemLength = Math.max(...activeItems.map(it => it.value.length), 0);

  const baseSlideData = {
    deptCode,
    deptName,
    caseIndex,
    totalCases,
    patientName: pName,
    patientAge: ageFormatted,
    patientAddress: pAddress,
    images: normImgs,
    rawCase: caseItem,
    caseItem
  };

  // Estimate visual lines required on a 16:9 presentation display:
  // Each item occupies at least 1 line for bullet + label + text.
  // Each ~80 characters beyond that adds a wrapped line.
  const estimatedLines = activeItems.reduce((acc, it) => {
    const textLen = (it.label || '').length + (it.value || '').length;
    const lines = Math.max(1, Math.ceil(textLen / 80));
    return acc + lines;
  }, 0);

  // Determine if fits safely on 1 single slide without ANY risk of bottom cutoff:
  // A slide with large presentation fonts can safely hold up to 7 visual lines.
  // If content has > 7 lines, or >= 7 bullet items with any detailed field (> 120 chars),
  // or total text > 380 chars, it MUST cleanly split into 2 slides (Phase 1 & Phase 2).
  const fitsSingleSlide = (
    estimatedLines <= 7 &&
    activeItems.length <= 6 &&
    totalLength <= 380 &&
    maxItemLength <= 160
  );

  if (fitsSingleSlide) {
    slides.push({
      ...baseSlideData,
      type: caseType,
      title: `${caseType.toUpperCase()} #${caseIndex} – ${deptName}`,
      caseType,
      bulletItems: activeItems,
      totalParts: 1,
      partIndex: 1,
      partSubtitle: '',
      partSuffix: ''
    });
  } else {
    // Split into 2 slides cleanly
    const p1Items = activeItems.filter(it => phase1Keys.includes(it.key));
    const p2Items = activeItems.filter(it => phase2Keys.includes(it.key));

    const slide1Items = p1Items.length > 0 ? p1Items : activeItems.slice(0, Math.ceil(activeItems.length / 2));
    const slide2Items = p2Items.length > 0 ? p2Items : activeItems.slice(Math.ceil(activeItems.length / 2));

    slides.push({
      ...baseSlideData,
      type: caseType,
      title: `${caseType.toUpperCase()} #${caseIndex} (${p1Subtitle}) – ${deptName}`,
      caseType,
      bulletItems: slide1Items,
      totalParts: 2,
      partIndex: 1,
      partSubtitle: p1Subtitle,
      partSuffix: '(Phần 1/2)'
    });

    slides.push({
      ...baseSlideData,
      type: caseType,
      title: `${caseType.toUpperCase()} #${caseIndex} (${p2Subtitle}) – ${deptName}`,
      caseType,
      bulletItems: slide2Items,
      totalParts: 2,
      partIndex: 2,
      partSubtitle: p2Subtitle,
      partSuffix: '(Phần 2/2)'
    });
  }

  // Append dedicated image slide(s) if images exist
  normImgs.forEach((imgObj, imgIdx) => {
    slides.push({
      type: 'case_image',
      title: `HÌNH ẢNH CA BỆNH #${caseIndex} (${imgIdx + 1}/${normImgs.length}) – ${deptName}`,
      deptCode,
      deptName,
      caseType,
      caseItem,
      image: imgObj,
      imgIndex: imgIdx + 1,
      totalImages: normImgs.length
    });
  });

  return slides;
};
