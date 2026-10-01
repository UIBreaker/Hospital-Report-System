import React from 'react';
import { 
  FaHospital, 
  FaAmbulance, 
  FaProcedures, 
  FaHeartbeat, 
  FaSkullCrossbones, 
  FaImages 
} from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const CASE_THEMES = {
  transfer: {
    main: '#D97706',
    dark: '#92400E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    title: 'BỆNH CHUYỂN VIỆN',
    badgeLabel: 'CA CHUYỂN VIỆN',
    icon: <FaAmbulance />
  },
  surgery: {
    main: '#0284C7',
    dark: '#0369A1',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    title: 'BỆNH PHẪU THUẬT (BỆNH MỔ)',
    badgeLabel: 'CA PHẪU THUẬT',
    icon: <FaProcedures />
  },
  critical: {
    main: '#7C3AED',
    dark: '#5B21B6',
    bg: '#EDE9FE',
    border: '#DDD6FE',
    title: 'BỆNH NẶNG THEO DÕI',
    badgeLabel: 'CA BỆNH NẶNG',
    icon: <FaHeartbeat />
  },
  death: {
    main: '#DC2626',
    dark: '#991B1B',
    bg: '#FEE2E2',
    border: '#FECACA',
    title: 'BÁO CÁO BỆNH NHÂN TỬ VONG',
    badgeLabel: 'CA TỬ VONG',
    icon: <FaSkullCrossbones />
  }
};

const ClinicalCaseSlide = ({ slide = {}, isFullscreen = true }) => {
  // Determine case category
  let category = 'transfer';
  const type = (slide.type || slide.caseType || '').toLowerCase();
  if (type.includes('surgery')) category = 'surgery';
  else if (type.includes('critical')) category = 'critical';
  else if (type.includes('death')) category = 'death';
  else if (type.includes('transfer')) category = 'transfer';

  const theme = CASE_THEMES[category] || CASE_THEMES.transfer;

  // Extract raw case object
  const rawCase = slide.transferCase || slide.surgeryCase || slide.deathCase || slide.criticalCase || slide.caseItem || {};
  const caseImages = normalizeImages(slide.images || rawCase.images);

  // Patient Info
  const pName = slide.patientName || rawCase.patient_name || rawCase.patientName || 'BỆNH NHÂN';
  const rawAge = slide.patientAge || rawCase.birth_year || rawCase.birthYear || rawCase.age;
  const ageFormatted = formatPatientAge(rawAge);
  const pAddress = slide.patientAddress || rawCase.address || '';
  const caseNum = slide.caseIndex || 1;
  const totalNum = slide.totalCases || 1;

  // Bullet items
  let items = slide.bulletItems;
  if (!items || !Array.isArray(items) || items.length === 0) {
    items = [];
    const add = (label, val, isHighlight = false, uppercase = false) => {
      if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim() !== '—') {
        items.push({ label, value: String(val).trim(), isHighlight, uppercase });
      }
    };

    if (category === 'transfer') {
      add('Giờ ngày vào viện', rawCase.admission_time || rawCase.admissionTime);
      add('Lí do vào viện', rawCase.reason);
      add('Lâm Sàng', rawCase.clinical_symptoms || rawCase.clinicalSymptoms);
      add('Cận Lâm Sàng', rawCase.clinical_tests || rawCase.clinicalTests);
      add('Chẩn đoán', rawCase.diagnosis, true, true);
      add('Xử trí', rawCase.initial_treatment || rawCase.initialTreatment);
      add('Diễn biến', rawCase.progress_notes || rawCase.progressNotes);
    } else if (category === 'surgery') {
      add('Giờ ngày vào viện', rawCase.admission_time || rawCase.admissionTime);
      add('Lí do vào viện', rawCase.reason);
      add('Lâm Sàng', rawCase.clinical_symptoms || rawCase.clinicalSymptoms);
      add('Cận Lâm Sàng', rawCase.clinical_tests || rawCase.clinicalTests);
      add('Chẩn đoán trước mổ', rawCase.preoperative_diagnosis || rawCase.preoperativeDiagnosis, true);
      add('Nội Dung Hội Chẩn / Lệnh Mổ', rawCase.consultation_order || rawCase.consultationOrder);
      add('Chẩn Đoán Sau Mổ', rawCase.postoperative_diagnosis || rawCase.postoperativeDiagnosis, true, true);
      add('Tình Trạng Hiện Tại (Hậu Phẫu)', rawCase.current_status || rawCase.currentStatus);
    } else if (category === 'critical') {
      add('Giờ ngày vào viện', rawCase.admission_time || rawCase.admissionTime);
      add('Tiền căn bệnh', rawCase.medical_history || rawCase.medicalHistory);
      add('Lâm Sàng', rawCase.clinical_symptoms || rawCase.clinicalSymptoms);
      add('Cận Lâm Sàng', rawCase.clinical_tests || rawCase.clinicalTests);
      add('Chẩn đoán bệnh', rawCase.diagnosis, true, true);
      add('Tình trạng bệnh & Diễn biến', rawCase.condition_summary || rawCase.conditionSummary);
      add('Xử trí điều trị', rawCase.treatment);
      add('Ghi chú / Hướng xử trí tiếp theo', rawCase.notes);
    } else if (category === 'death') {
      add('Giờ ngày vào viện', rawCase.admission_time || rawCase.admissionTime);
      add('Lí do vào viện', rawCase.reason);
      add('Tình Trạng Lúc Vào Khoa', rawCase.admission_status || rawCase.admissionStatus);
      add('Tiền Sử Bệnh', rawCase.medical_history || rawCase.medicalHistory);
      add('Lâm Sàng', rawCase.clinical_symptoms || rawCase.clinicalSymptoms);
      add('Kết Quả Cận Lâm Sàng', rawCase.clinical_tests || rawCase.clinicalTests);
      add('Chẩn Đoán Tử Vong', rawCase.diagnosis, true, true);
      add('Xử Trí Cấp Cứu', rawCase.emergency_treatment || rawCase.emergencyTreatment);
      add('Kết Quả Cuối Cùng & Hướng Xử Lý Thi Thể', rawCase.final_outcome || rawCase.finalOutcome);
    }
  }

  // Calculate dynamic typography scale to ensure NO scrollbar while maximizing legibility
  const totalLength = items.reduce((acc, it) => acc + (it.value || '').length + (it.label || '').length, 0);
  const itemCount = items.length;

  let dynamicFontSize = isFullscreen ? '1.65rem' : '1.25rem';
  let dynamicLineHeight = '1.65';
  let dynamicGap = isFullscreen ? '1.05rem' : '0.7rem';

  if (totalLength > 750) {
    dynamicFontSize = isFullscreen ? '1.32rem' : '1.05rem';
    dynamicLineHeight = '1.5';
    dynamicGap = isFullscreen ? '0.65rem' : '0.45rem';
  } else if (totalLength > 450) {
    dynamicFontSize = isFullscreen ? '1.48rem' : '1.15rem';
    dynamicLineHeight = '1.58';
    dynamicGap = isFullscreen ? '0.85rem' : '0.55rem';
  }

  const partSuffix = slide.partSuffix || (slide.totalParts > 1 ? `(Phần ${slide.partIndex}/${slide.totalParts})` : '');
  const partSubtitle = slide.partSubtitle || '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: isFullscreen ? '1.2rem 2rem' : '0.9rem 1.2rem',
      boxSizing: 'border-box',
      boxShadow: '0 8px 30px rgba(15, 44, 89, 0.08)',
      gap: isFullscreen ? '0.65rem' : '0.45rem',
      overflow: 'hidden'
    }}>
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isFullscreen ? '0.55rem 1.3rem' : '0.45rem 0.9rem',
        backgroundColor: '#0F2C59',
        borderRadius: '12px',
        color: '#FFFFFF',
        boxShadow: '0 4px 15px rgba(15, 44, 89, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '0.85rem' : '0.6rem', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: isFullscreen ? '1.45rem' : '1.15rem',
            fontWeight: '900',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem'
          }}>
            <FaHospital style={{ color: '#38BDF8', fontSize: isFullscreen ? '1.5rem' : '1.2rem' }} />
            <span>{slide.deptName || 'KHOA LÂM SÀNG'}</span>
          </div>

          <div style={{
            backgroundColor: theme.main,
            color: '#FFFFFF',
            padding: isFullscreen ? '0.25rem 0.85rem' : '0.2rem 0.65rem',
            borderRadius: '999px',
            fontSize: isFullscreen ? '0.9rem' : '0.75rem',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {theme.icon}
            <span>
              {theme.badgeLabel} #{caseNum}/{totalNum} {partSuffix}
            </span>
          </div>

          {partSubtitle && (
            <span style={{
              fontSize: isFullscreen ? '0.82rem' : '0.72rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#E0F2FE',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontWeight: '700'
            }}>
              {partSubtitle}
            </span>
          )}
        </div>

        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: isFullscreen ? '38px' : '30px',
            height: isFullscreen ? '38px' : '30px',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* 2. Main Title (Centered) */}
      <div style={{
        textAlign: 'center',
        fontSize: isFullscreen ? '2.4rem' : '1.75rem',
        fontWeight: '900',
        color: theme.main,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: isFullscreen ? '0.2rem' : '0.1rem',
        marginBottom: isFullscreen ? '0.35rem' : '0.2rem',
        lineHeight: 1.2,
        flexShrink: 0
      }}>
        {theme.title}
      </div>

      {/* 3. Case & Patient Header (Bold Numbered Line) */}
      <div style={{
        fontSize: isFullscreen ? '1.75rem' : '1.35rem',
        fontWeight: '900',
        color: '#0F2C59',
        borderBottom: `2.5px solid ${theme.border}`,
        paddingBottom: isFullscreen ? '0.5rem' : '0.35rem',
        marginBottom: isFullscreen ? '0.5rem' : '0.3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        flexShrink: 0
      }}>
        <span>
          {caseNum}/ {pName.toUpperCase()}
          {ageFormatted ? `, ${ageFormatted}` : ''}
          {pAddress ? `, ${pAddress}` : ''}
          {partSuffix ? ` ${partSuffix}` : ''}
        </span>
      </div>

      {/* 4. Sequential Bullet Items Container */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: (itemCount <= 5 || totalLength < 350) ? 'space-evenly' : 'flex-start',
        gap: dynamicGap,
        overflow: 'hidden'
      }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: isFullscreen ? '0.85rem' : '0.55rem',
              fontSize: dynamicFontSize,
              lineHeight: dynamicLineHeight,
              color: '#1E293B'
            }}
          >
            {/* Bullet Point Symbol */}
            <span style={{
              color: theme.main,
              fontWeight: '900',
              fontSize: isFullscreen ? `calc(${dynamicFontSize} * 1.15)` : dynamicFontSize,
              lineHeight: dynamicLineHeight,
              userSelect: 'none',
              flexShrink: 0
            }}>
              •
            </span>

            {/* Content text */}
            <div style={{ flex: 1, wordBreak: 'break-word' }}>
              <strong style={{
                color: item.isHighlight ? theme.dark : '#0F2C59',
                fontWeight: '800',
                marginRight: '0.45rem'
              }}>
                {item.label}:
              </strong>
              <span style={{
                fontWeight: item.isHighlight ? '800' : '500',
                color: item.isHighlight ? theme.dark : '#1E293B',
                textTransform: item.uppercase ? 'uppercase' : 'none'
              }}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Footer: Clinical Images Notice (if any) */}
      {caseImages.length > 0 && (
        <div style={{
          padding: isFullscreen ? '0.35rem 0.9rem' : '0.25rem 0.65rem',
          backgroundColor: theme.bg,
          border: `1.5px dashed ${theme.main}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: theme.dark,
          fontWeight: '700',
          fontSize: isFullscreen ? '0.92rem' : '0.78rem',
          flexShrink: 0,
          marginTop: 'auto'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FaImages style={{ color: theme.main }} />
            Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong>
          </span>
          <span style={{ fontStyle: 'italic', color: theme.dark }}>
            (Xem ở Slide tiếp theo ➔)
          </span>
        </div>
      )}
    </div>
  );
};

export default ClinicalCaseSlide;
