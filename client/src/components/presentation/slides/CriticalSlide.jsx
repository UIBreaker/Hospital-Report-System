import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const CriticalSlide = ({ slide, isFullscreen }) => {
  const cc = slide.criticalCase || {};
  const caseImages = normalizeImages(cc.images);
  const ageFormatted = formatPatientAge(cc.age);
  const PURPLE = { main: '#7C3AED', dark: '#5B21B6', light: '#FAF5FF', border: '#DDD6FE', soft: '#EDE9FE' };

  const contentLength = [
    cc.medical_history || cc.medicalHistory || '',
    cc.clinical_symptoms || cc.clinicalSymptoms || '',
    cc.clinical_tests || cc.clinicalTests || '',
    cc.diagnosis || '',
    cc.condition_summary || cc.conditionSummary || '',
    cc.treatment || '',
    cc.notes || '',
  ].join('').length;

  const af = ((cl) => {
    if (cl < 220) return { 
      bodySize: isFullscreen ? '1.4rem' : '1.2rem', 
      diagSize: isFullscreen ? '1.75rem' : '1.5rem',
      hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
      lineH: '1.8', gap: isFullscreen ? '1rem' : '0.8rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
    };
    if (cl < 500) return { 
      bodySize: isFullscreen ? '1.25rem' : '1.1rem', 
      diagSize: isFullscreen ? '1.6rem' : '1.38rem',
      hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
      lineH: '1.68', gap: isFullscreen ? '0.85rem' : '0.65rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
    };
    if (cl < 900) return { 
      bodySize: isFullscreen ? '1.15rem' : '1.02rem', 
      diagSize: isFullscreen ? '1.48rem' : '1.28rem',
      hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
      lineH: '1.6', gap: isFullscreen ? '0.7rem' : '0.52rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
    };
    return { 
      bodySize: isFullscreen ? '1.05rem' : '0.92rem', 
      diagSize: isFullscreen ? '1.35rem' : '1.18rem',
      hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
      lineH: '1.5', gap: isFullscreen ? '0.55rem' : '0.4rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
    };
  })(contentLength);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
      {/* Slide type label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: PURPLE.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaHeartbeat style={{ color: PURPLE.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
          {slide.deptName} &nbsp;•&nbsp; CA BỆNH NẶNG THEO DÕI {slide.caseIndex}/{slide.totalCases}
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
      </div>

      {/* Patient header bar */}
      <div style={{
        backgroundColor: PURPLE.soft, border: `2px solid ${PURPLE.border}`,
        borderLeft: `8px solid ${PURPLE.main}`, borderRadius: '12px',
        padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
        flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.15)'
      }}>
        <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: PURPLE.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
          {cc.patient_name || cc.patientName || 'BỆNH NHÂN NẶNG'}
        </span>
        {ageFormatted && <span style={{ backgroundColor: PURPLE.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(124,58,237,0.3)' }}>{ageFormatted}</span>}
        {cc.address && <span style={{ color: PURPLE.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {cc.address}</span>}
        {(cc.admission_time || cc.admissionTime) && <span style={{ color: PURPLE.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{cc.admission_time || cc.admissionTime}</strong></span>}
      </div>

      {/* Medical grid — 2 columns with full vertical expansion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Col 1: Tiền sử & Khám lâm sàng & CLS */}
        <div style={{ backgroundColor: '#FAF5FF', borderRadius: '12px', border: `2px solid ${PURPLE.border}`, borderLeft: `6px solid ${PURPLE.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(124,58,237,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: PURPLE.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${PURPLE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            🩺 TIỀN SỬ & LÂM SÀNG / CLS
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Tiền sử bệnh:</span>
              <div style={{ color: '#334155', fontWeight: '600' }}>{cc.medical_history || cc.medicalHistory || '—'}</div>
            </div>
            {(cc.clinical_symptoms || cc.clinicalSymptoms) && (
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lâm sàng & Sinh hiệu:</span>
                <div style={{ color: '#0F172A', fontWeight: '600' }}>{cc.clinical_symptoms || cc.clinicalSymptoms}</div>
              </div>
            )}
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Cận lâm sàng & Kết quả xét nghiệm:</span>
              <div style={{ color: '#334155', fontWeight: '600' }}>{cc.clinical_tests || cc.clinicalTests || '—'}</div>
            </div>
          </div>
        </div>

        {/* Col 2: Chẩn đoán & Diễn biến & Xử trí bàn giao */}
        <div style={{ backgroundColor: '#FAF5FF', borderRadius: '12px', border: `2px solid ${PURPLE.border}`, borderLeft: `6px solid #5B21B6`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(124,58,237,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${PURPLE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            💓 CHẨN ĐOÁN & XỬ TRÍ BÀN GIAO
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            {/* Chẩn đoán highlight */}
            <div style={{ backgroundColor: PURPLE.soft, border: `2px solid ${PURPLE.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(124,58,237,0.12)' }}>
              <span style={{ fontWeight: '900', color: PURPLE.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏥 CHẨN ĐOÁN:
              </span>
              <span style={{ color: '#5B21B6', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>
                {cc.diagnosis || '—'}
              </span>
            </div>

            {/* Tóm tắt diễn biến */}
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Tóm tắt tình trạng & Diễn biến:</span>
              <div style={{ color: '#0F172A', fontWeight: '600' }}>{cc.condition_summary || cc.conditionSummary || '—'}</div>
            </div>

            {/* Xử trí & Bàn giao */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Xử trí & Theo dõi tiếp:</span>
              <div style={{ color: '#5B21B6', fontWeight: '700' }}>{cc.treatment || '—'}</div>
            </div>

            {/* Ghi chú tua trực */}
            {cc.notes && (
              <div style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '8px', padding: '0.55rem 0.85rem' }}>
                <span style={{ fontWeight: '800', color: '#92400E' }}>📌 Ghi chú tua sau: </span>
                <span style={{ color: '#78350F', fontWeight: '600' }}>{cc.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: image badge */}
      {caseImages.length > 0 && (
        <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: PURPLE.soft, border: `2px dashed ${PURPLE.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: PURPLE.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
          <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
          <span style={{ fontStyle: 'italic', color: '#5B21B6' }}>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}
    </div>
  );
};

export default CriticalSlide;
