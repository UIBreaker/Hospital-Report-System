import React from 'react';
import { FaAmbulance, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaStethoscope, FaFlask } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const TransferSlide = ({ slide, isFullscreen }) => {
  const tc = slide.transferCase || {};
  const caseImages = normalizeImages(tc.images);
  const ageFormatted = formatPatientAge(tc.age);
  const isPart1 = slide.type === 'transfer';
  const partTitle = isPart1 ? 'PHẦN 1: TIẾP NHẬN & CHẨN ĐOÁN' : 'PHẦN 2: DIỄN BIẾN & CHUYỂN VIỆN';

  const cleanDiagnosis = (tc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');
  const hasSymptoms = Boolean(tc.clinical_symptoms || tc.clinicalSymptoms);
  const hasTests = Boolean(tc.clinical_tests || tc.clinicalTests);

  // Dynamic Typography based on fullscreen & length
  const FONT_DEPT = isFullscreen ? '2.2rem' : '1.75rem';
  const FONT_BADGE = isFullscreen ? '1.18rem' : '0.98rem';
  const FONT_PT_NAME = isFullscreen ? '1.65rem' : '1.38rem';
  const FONT_PT_INFO = isFullscreen ? '1.18rem' : '0.98rem';
  const FONT_DIAG_TITLE = isFullscreen ? '1.2rem' : '1.02rem';
  const FONT_DIAG_TEXT = isFullscreen ? '2.05rem' : '1.72rem';
  const FONT_SECTION_TITLE = isFullscreen ? '1.25rem' : '1.08rem';
  const FONT_BODY = isFullscreen ? '1.42rem' : '1.22rem';
  const LINE_H = '1.58';

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      gap: isFullscreen ? '0.75rem' : '0.55rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA BỆNH */}
      <div style={{
        backgroundColor: '#0F2C59',
        borderRadius: '14px',
        padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '1.1rem' : '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: FONT_DEPT,
            fontWeight: '900',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <FaHospital style={{ color: '#38BDF8', fontSize: isFullscreen ? '2rem' : '1.5rem' }} />
            <span>{slide.deptName}</span>
          </div>

          <div style={{
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            padding: isFullscreen ? '0.35rem 0.95rem' : '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: FONT_BADGE,
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <FaAmbulance />
            <span>CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} ({partTitle})</span>
          </div>
        </div>

        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', objectFit: 'contain', flexShrink: 0 }}
        />
      </div>

      {/* 2. ZONE 2: THANH THÔNG TIN BỆNH NHÂN */}
      <div style={{
        backgroundColor: '#FEF3C7',
        border: '2px solid #FDE68A',
        borderLeft: '8px solid #D97706',
        borderRadius: '12px',
        padding: isFullscreen ? '0.6rem 1.25rem' : '0.42rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(217,119,6,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: '#92400E' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: FONT_PT_NAME, fontWeight: '900', color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {tc.patient_name || tc.patientName || 'BỆNH NHÂN CHUYỂN VIỆN'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: FONT_PT_INFO
          }}>
            {ageFormatted}
          </span>
        )}

        {tc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#92400E', fontWeight: '700', fontSize: FONT_PT_INFO }}>
            <FaMapMarkerAlt /> <span>{tc.address}</span>
          </div>
        )}

        {(tc.admission_time || tc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#78350F', fontWeight: '800', fontSize: FONT_PT_INFO }}>
            <FaClock style={{ color: '#D97706' }} /> <span>Giờ vào viện: <strong>{tc.admission_time || tc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* 3. ZONE 3: NỘI DUNG Y KHOA PHÂN VÙNG THÔNG MINH (ZERO WHITESPACE FLOW) */}
      {isPart1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.55rem', flex: 1, minHeight: 0 }}>
          
          {/* ROW 1: CHẨN ĐOÁN XÁC ĐỊNH (HERO BANNER CỰC ĐẠI) */}
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '2.5px solid #F59E0B',
            borderLeft: '9px solid #D97706',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1.1rem',
            boxShadow: '0 4px 14px rgba(217,119,6,0.12)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN XÁC ĐỊNH
            </div>
            <div style={{ fontSize: FONT_DIAG_TEXT, fontWeight: '900', color: '#78350F', lineHeight: '1.25' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* ROW 2: LÂM SÀNG & CẬN LÂM SÀNG (2 CỘT CÂN ĐỐI TỰ NHIÊN) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: (hasSymptoms && hasTests) ? '1fr 1fr' : '1fr',
            gap: isFullscreen ? '0.75rem' : '0.55rem',
            flex: 1,
            minHeight: 0
          }}>
            {/* Box Lâm sàng */}
            {hasSymptoms && (
              <div style={{
                backgroundColor: '#FFFDF5',
                border: '2px solid #FDE68A',
                borderLeft: '6px solid #D97706',
                borderRadius: '12px',
                padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaStethoscope /> LÂM SÀNG & TRIỆU CHỨNG KHÁM
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {tc.clinical_symptoms || tc.clinicalSymptoms}
                </div>
              </div>
            )}

            {/* Box Cận lâm sàng */}
            {hasTests && (
              <div style={{
                backgroundColor: '#FFFDF5',
                border: '2px solid #FDE68A',
                borderLeft: '6px solid #B45309',
                borderRadius: '12px',
                padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaFlask /> CẬN LÂM SÀNG & X-QUANG / XÉT NGHIỆM
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {tc.clinical_tests || tc.clinicalTests}
                </div>
              </div>
            )}
          </div>

          {/* ROW 3: LÝ DO VÀO VIỆN & XỬ TRÍ BAN ĐẦU (BOTTOM BALANCED ROW) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2.2fr',
            gap: isFullscreen ? '0.75rem' : '0.55rem',
            flexShrink: 0
          }}>
            {/* Lý do */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderLeft: '6px solid #D97706',
              borderRadius: '12px',
              padding: isFullscreen ? '0.75rem 1.15rem' : '0.55rem 0.9rem'
            }}>
              <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaClock /> LÝ DO VÀO VIỆN
              </div>
              <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800', lineHeight: '1.3' }}>
                {tc.reason || '—'}
              </div>
            </div>

            {/* Xử trí ban đầu */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #FDE68A',
              borderLeft: '6px solid #B45309',
              borderRadius: '12px',
              padding: isFullscreen ? '0.75rem 1.15rem' : '0.55rem 0.9rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaStethoscope /> XỬ TRÍ BAN ĐẦU
              </div>
              <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800', lineHeight: '1.3' }}>
                {tc.initial_treatment || tc.initialTreatment || '—'}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* PART 2: DIỄN BIẾN & CHUYỂN VIỆN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.55rem', flex: 1, minHeight: 0 }}>
          {/* Box Chẩn đoán */}
          <div style={{
            backgroundColor: '#FEF3C7',
            borderRadius: '12px',
            border: '2.5px solid #F59E0B',
            borderLeft: '9px solid #D97706',
            padding: isFullscreen ? '0.95rem 1.4rem' : '0.75rem 1.1rem',
            flexShrink: 0
          }}>
            <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN KHI CHUYỂN VIỆN
            </div>
            <div style={{ fontSize: FONT_DIAG_TEXT, fontWeight: '900', color: '#78350F', lineHeight: '1.25' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* Box Diễn biến chuyển viện */}
          <div style={{
            backgroundColor: '#FFFDF5',
            borderRadius: '12px',
            border: '2px solid #FDE68A',
            borderLeft: '8px solid #B45309',
            padding: isFullscreen ? '1.4rem 1.6rem' : '1rem 1.25rem',
            flex: 1,
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.35rem' : '1.18rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaAmbulance /> QUÁ TRÌNH DIỄN BIẾN & XỬ TRÍ CHUYỂN TUYẾN
            </div>
            <div style={{ fontSize: isFullscreen ? '1.5rem' : '1.3rem', lineHeight: '1.7', color: '#0F172A', fontWeight: '600' }}>
              {tc.progress_notes || tc.progressNotes || '—'}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: HÌNH ẢNH */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.98rem' : '0.85rem',
          color: '#92400E',
          fontWeight: '800',
          flexShrink: 0
        }}>
          <span>📷 Ca bệnh có <strong>{caseImages.length}</strong> hình ảnh cận lâm sàng minh họa</span>
          <span>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}

    </div>
  );
};

export default TransferSlide;
