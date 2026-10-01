import { formatPatientAge, normalizeImages } from './medicalFormatters.js';

/**
 * Estimates visual line count of a bullet item on a 16:9 widescreen presentation display.
 * Standard projector width comfortably holds ~85 Vietnamese characters per line.
 */
export const estimateItemVisualLines = (item) => {
  const text = `${item.label || ''}: ${item.value || ''}`;
  const charLen = text.length;
  if (charLen <= 85) return 1;
  return 1 + Math.ceil((charLen - 85) / 85);
};

export const calcTotalVisualLines = (items = []) => {
  return items.reduce((acc, it) => acc + estimateItemVisualLines(it), 0);
};

/**
 * Intelligently chunks items into slide pages so that no slide exceeds maxLinesPerSlide.
 * Default maxLinesPerSlide is 10 lines (safe capacity on 16:9 widescreen presentation).
 */
export const paginateItemsIntelligently = (items = [], maxLinesPerSlide = 10) => {
  const pages = [];
  let currentPage = [];
  let currentLines = 0;

  for (const item of items) {
    const itemLines = estimateItemVisualLines(item);

    // If adding this item exceeds budget and current page already has content:
    // Move to next page!
    if (currentPage.length > 0 && (currentLines + itemLines > maxLinesPerSlide)) {
      pages.push(currentPage);
      currentPage = [item];
      currentLines = itemLines;
    } else {
      currentPage.push(item);
      currentLines += itemLines;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

/**
 * Orphan item prevention:
 * Consolidates any slide page that has only 1 short item (lines <= 2) into
 * a neighboring slide page if that neighbor has sufficient space.
 * This guarantees items like 'Chẩn đoán' or 'Xử trí' never sit stranded alone on an empty slide!
 */
export const consolidateSlidePages = (pages = [], maxLinesPerSlide = 10) => {
  if (pages.length <= 1) return pages;

  const result = [];
  for (let i = 0; i < pages.length; i++) {
    const current = pages[i];
    const currentLines = calcTotalVisualLines(current);

    // If current page is an orphan (only 1 item with <= 2 lines):
    if (current.length === 1 && currentLines <= 2) {
      // 1. Try to merge into the previous page in result if it fits
      if (result.length > 0) {
        const prev = result[result.length - 1];
        const prevLines = calcTotalVisualLines(prev);
        if (prevLines + currentLines <= maxLinesPerSlide) {
          prev.push(...current);
          continue;
        }
      }

      // 2. Or try to merge into the next page if there is one and it fits
      if (i + 1 < pages.length) {
        const next = pages[i + 1];
        const nextLines = calcTotalVisualLines(next);
        if (nextLines + currentLines <= maxLinesPerSlide) {
          next.unshift(...current);
          continue;
        }
      }
    }

    result.push([...current]);
  }

  return result;
};

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
  const estimatedLines = calcTotalVisualLines(activeItems);

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

  // Determine if fits safely on 1 single slide without ANY risk of bottom cutoff:
  // A slide with large presentation fonts can safely hold up to 7 visual lines.
  // If content has > 7 lines, or total text > 320 chars, or detailed field (> 140 chars),
  // it must cleanly paginate into multiple slides.
  const fitsSingleSlide = (
    estimatedLines <= 7 &&
    activeItems.length <= 7 &&
    totalLength <= 320 &&
    maxItemLength <= 140
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
    // Medical phase breakdown
    const p1Items = activeItems.filter(it => phase1Keys.includes(it.key));
    const p2Items = activeItems.filter(it => phase2Keys.includes(it.key));

    const p1Effective = p1Items.length > 0 ? p1Items : activeItems.slice(0, Math.ceil(activeItems.length / 2));
    const p2Effective = p2Items.length > 0 ? p2Items : activeItems.slice(Math.ceil(activeItems.length / 2));

    const p1Lines = calcTotalVisualLines(p1Effective);

    let allPages = [];

    // If Phase 1 fits within 10 lines (like Nguyễn Thị Oánh with 9 lines),
    // keep Phase 1 together on Slide 1 and Phase 2 on Slide 2!
    if (p1Lines <= 10) {
      allPages = [p1Effective, p2Effective];
    } else {
      // Phase 1 is very long (> 10 lines, like Hồ Thị Chờ with 15 lines):
      // Intelligently paginate Phase 1 and Phase 2, then consolidate any orphan pages
      const p1Pages = paginateItemsIntelligently(p1Effective, 10);
      const p2Pages = paginateItemsIntelligently(p2Effective, 10);
      allPages = consolidateSlidePages([...p1Pages, ...p2Pages], 10);
    }

    const totalParts = allPages.length;

    allPages.forEach((pageItems, pIdx) => {
      const partIndex = pIdx + 1;
      const partSuffix = `(Phần ${partIndex}/${totalParts})`;

      // Dynamic smart subtitle generation based on total parts and phase position
      let partSubtitle = '';
      if (totalParts === 2) {
        partSubtitle = partIndex === 1 ? p1Subtitle : p2Subtitle;
      } else if (totalParts === 3) {
        if (partIndex === 1) {
          partSubtitle = 'PHẦN 1: TIẾP NHẬN & LÂM SÀNG';
        } else if (partIndex === 2) {
          partSubtitle = caseType === 'surgery' 
            ? 'PHẦN 2: CẬN LÂM SÀNG & TIỀN PHẪU' 
            : 'PHẦN 2: CẬN LÂM SÀNG & CHẨN ĐOÁN';
        } else {
          partSubtitle = caseType === 'surgery'
            ? 'PHẦN 3: HỘI CHẨN & HẬU PHẪU'
            : (caseType === 'death' ? 'PHẦN 3: XỬ TRÍ & KẾT QUẢ' : 'PHẦN 3: XỬ TRÍ & DIỄN BIẾN');
        }
      } else {
        // 4+ parts fallback: descriptive labels
        const firstLabel = pageItems[0]?.label || '';
        const lastLabel = pageItems[pageItems.length - 1]?.label || '';
        partSubtitle = `PHẦN ${partIndex}/${totalParts}: ${firstLabel.toUpperCase()}${firstLabel !== lastLabel ? ' – ' + lastLabel.toUpperCase() : ''}`;
      }

      slides.push({
        ...baseSlideData,
        type: caseType,
        title: `${caseType.toUpperCase()} #${caseIndex} (${partSubtitle}) – ${deptName}`,
        caseType,
        bulletItems: pageItems,
        totalParts,
        partIndex,
        partSubtitle,
        partSuffix
      });
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
