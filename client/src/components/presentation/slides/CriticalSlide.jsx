import React from 'react';
import { FaHeartbeat, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaStethoscope, FaFlask, FaStickyNote, FaCapsules, FaArrowRight } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const CriticalSlide = ({ slide, isFullscreen }) => {
  const cc = slide.criticalCase || {};
  const caseImages = normalizeImages(cc.images);
  const ageFormatted = formatPatientAge(cc.age);
  const cleanDiagnosis = (cc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

  const hasHistory = Boolean(cc.medical_history || cc.medicalHistory);
  const hasSymptoms = Boolean(cc.clinical_symptoms || cc.clinicalSymptoms);
  const hasTests = Boolean(cc.clinical_tests || cc.clinicalTests);

  const isOverview = slide.type === 'critical';
  const isClinical = slide.type === 'critical_clinical';

  const partTitle = isOverview
    ? 'CHẨN ĐOÁN, XỬ TRÍ & BÀN GIAO TUA SAU'
    : 'TIỀN SỬ, LÂM SÀNG & XÉT NGHIỆM / CLS';

  const FONT_DEPT = isFullscreen ? '2.2rem' : '1.75rem';
  const FONT_BADGE = isFullscreen ? '1.15rem' : '0.96rem';
  const FONT_PT_NAME = isFullscreen ? '1.65rem' : '1.38rem';
  const FONT_PT_INFO = isFullscreen ? '1.18rem' : '0.98rem';
  const FONT_DIAG_TITLE = isFullscreen ? '1.2rem' : '1.02rem';
  const FONT_DIAG_TEXT = isFullscreen ? '2.1rem' : '1.75rem';
  const FONT_SECTION_TITLE = isFullscreen ? '1.35rem' : '1.15rem';
  const FONT_BODY = isFullscreen ? '1.55rem' : '1.32rem';
  const LINE_H = '1.65';

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
      
      {/* 1. ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA BỆNH NẶNG */}
      <div 
        className="anim-header-drop"
        style={{
          backgroundColor: '#0F2C59',
          borderRadius: '14px',
          padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(15, 44, 89, 0.25)',
          flexShrink: 0
        }}
      >
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
            backgroundColor: '#7C3AED',
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
            <FaHeartbeat />
            <span>BỆNH NẶNG THEO DÕI {slide.caseIndex}/{slide.totalCases} • {partTitle}</span>
          </div>
        </div>

        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', objectFit: 'contain', flexShrink: 0 }}
        />
      </div>

      {/* 2. ZONE 2: THANH THÔNG TIN BỆNH NHÂN */}
      <div 
        className="anim-info-pop anim-delay-1"
        style={{
          backgroundColor: '#EDE9FE',
          border: '2px solid #DDD6FE',
          borderLeft: '8px solid #7C3AED',
          borderRadius: '12px',
          padding: isFullscreen ? '0.6rem 1.25rem' : '0.42rem 0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: isFullscreen ? '1.5rem' : '1rem',
          flexWrap: 'wrap',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(124,58,237,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: '#5B21B6' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: FONT_PT_NAME, fontWeight: '900', color: '#4C1D95', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cc.patient_name || cc.patientName || 'BỆNH NHÂN NẶNG'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: FONT_PT_INFO
          }}>
            {ageFormatted}
          </span>
        )}

        {cc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#5B21B6', fontWeight: '700', fontSize: FONT_PT_INFO }}>
            <FaMapMarkerAlt /> <span>{cc.address}</span>
          </div>
        )}

        {(cc.admission_time || cc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4C1D95', fontWeight: '800', fontSize: FONT_PT_INFO }}>
            <FaClock style={{ color: '#7C3AED' }} /> <span>Giờ vào viện: <strong>{cc.admission_time || cc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* 3. ZONE 3: NỘI DUNG BỆNH NẶNG */}
      {isOverview && (
        /* SLIDE 1: CHẨN ĐOÁN, XỬ TRÍ & BÀN GIAO */
        <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
          {/* Chẩn đoán xác định */}
          <div style={{
            backgroundColor: '#EDE9FE',
            border: '2.5px solid #8B5CF6',
            borderLeft: '10px solid #7C3AED',
            borderRadius: '14px',
            padding: isFullscreen ? '1.25rem 1.6rem' : '0.95rem 1.25rem',
            boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN XÁC ĐỊNH
            </div>
            <div style={{ fontSize: FONT_DIAG_TEXT, fontWeight: '900', color: '#4C1D95', lineHeight: '1.25' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* Diễn biến & Xử trí bàn giao */}
          <div style={{ display: 'grid', gridTemplateColumns: cc.notes ? '1.3fr 1fr' : '1fr', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
            {/* Xử trí & Diễn biến */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #DDD6FE',
              borderLeft: '8px solid #7C3AED',
              borderRadius: '14px',
              padding: isFullscreen ? '1.25rem 1.5rem' : '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaCapsules /> XỬ TRÍ & THEO DÕI TIẾP
                </div>
                <div style={{ fontSize: isFullscreen ? '1.75rem' : '1.45rem', color: '#4C1D95', fontWeight: '900', lineHeight: '1.5' }}>
                  {cc.treatment || 'Chăm sóc theo dõi cấp II'}
                </div>
                {(cc.condition_summary || cc.conditionSummary) && (
                  <div style={{ fontSize: isFullscreen ? '1.4rem' : '1.2rem', color: '#0F172A', fontWeight: '600', marginTop: '0.5rem', borderTop: '1.5px dashed #DDD6FE', paddingTop: '0.5rem' }}>
                    <strong>Tóm tắt diễn biến:</strong> {cc.condition_summary || cc.conditionSummary}
                  </div>
                )}
              </div>

              {(hasSymptoms || hasTests || hasHistory) && (
                <div style={{
                  backgroundColor: '#EDE9FE',
                  color: '#5B21B6',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: isFullscreen ? '1.05rem' : '0.9rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.5rem'
                }}>
                  <FaArrowRight /> <span>Chi tiết Tiền sử, Lâm sàng & Xét nghiệm ở Slide tiếp theo</span>
                </div>
              )}
            </div>

            {/* Ghi chú bàn giao tua sau */}
            {cc.notes && (
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '2px solid #FDE68A',
                borderLeft: '8px solid #D97706',
                borderRadius: '14px',
                padding: isFullscreen ? '1.25rem 1.5rem' : '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <FaStickyNote /> GHI CHÚ BÀN GIAO TUA SAU
                  </div>
                  <div style={{ fontSize: isFullscreen ? '1.75rem' : '1.45rem', color: '#78350F', fontWeight: '900', lineHeight: '1.5' }}>
                    {cc.notes}
                  </div>
                </div>
                <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#B45309', fontWeight: '700' }}>
                  📌 Lưu ý bàn giao trực tiếp tại giường bệnh
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isClinical && (
        /* SLIDE 2: TIỀN SỬ, LÂM SÀNG & XÉT NGHIỆM / CLS */
        <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.55rem', flex: 1, minHeight: 0 }}>
          <div style={{
            backgroundColor: '#EDE9FE',
            border: '2px solid #8B5CF6',
            borderLeft: '8px solid #7C3AED',
            borderRadius: '12px',
            padding: isFullscreen ? '0.65rem 1.25rem' : '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            flexShrink: 0
          }}>
            <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              🏥 CHẨN ĐOÁN:
            </span>
            <span style={{ fontSize: isFullscreen ? '1.55rem' : '1.3rem', fontWeight: '900', color: '#4C1D95' }}>
              {cleanDiagnosis}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: (hasSymptoms || hasHistory) && hasTests ? '1.1fr 1.3fr' : '1fr',
            gap: isFullscreen ? '0.85rem' : '0.65rem',
            flex: 1,
            minHeight: 0
          }}>
            {/* Tiền sử & Lâm sàng */}
            <div style={{
              backgroundColor: '#FAF5FF',
              border: '2px solid #DDD6FE',
              borderLeft: '8px solid #7C3AED',
              borderRadius: '14px',
              padding: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              overflowY: 'auto',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}>
              {hasHistory && (
                <div>
                  <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    📋 TIỀN SỬ BỆNH
                  </div>
                  <div style={{ fontSize: isFullscreen ? '1.45rem' : '1.25rem', color: '#0F172A', fontWeight: '800' }}>
                    {cc.medical_history || cc.medicalHistory}
                  </div>
                </div>
              )}

              {hasSymptoms && (
                <div style={{ borderTop: hasHistory ? '1.5px dashed #DDD6FE' : 'none', paddingTop: hasHistory ? '0.6rem' : 0 }}>
                  <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <FaStethoscope /> LÂM SÀNG & SINH HIỆU
                  </div>
                  <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                    {cc.clinical_symptoms || cc.clinicalSymptoms}
                  </div>
                </div>
              )}
            </div>

            {/* Cận lâm sàng */}
            <div style={{
              backgroundColor: '#FAF5FF',
              border: '2px solid #DDD6FE',
              borderLeft: '8px solid #5B21B6',
              borderRadius: '14px',
              padding: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaFlask /> KẾT QUẢ CẬN LÂM SÀNG & XÉT NGHIỆM
              </div>
              <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                {cc.clinical_tests || cc.clinicalTests || 'Chưa có kết quả cận lâm sàng'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: HÌNH ẢNH */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#FAF5FF',
          border: '1.5px solid #DDD6FE',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.98rem' : '0.85rem',
          color: '#5B21B6',
          fontWeight: '800',
          flexShrink: 0
        }}>
          <span>📷 Ca bệnh có <strong>{caseImages.length}</strong> hình ảnh minh họa</span>
          <span>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}

    </div>
  );
};

export default CriticalSlide;
