import React from 'react';
import { FaProcedures } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const SurgerySlide = ({ slide, isFullscreen }) => {
  const sc = slide.surgeryCase || {};
  const caseImages = normalizeImages(sc.images);
  const ageFormatted = formatPatientAge(sc.birth_year || sc.birthYear || sc.age);
  const BLUE = { main: '#0284C7', dark: '#0369A1', light: '#F0F9FF', border: '#BAE6FD', soft: '#E0F2FE' };

  const contentLength = [
    sc.reason || '',
    sc.clinical_symptoms || sc.clinicalSymptoms || '',
    sc.clinical_tests || sc.clinicalTests || '',
    sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '',
    sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '',
    sc.consultation_order || sc.consultationOrder || '',
    sc.current_status || sc.currentStatus || '',
  ].join('').length;

  const af = ((cl) => {
    if (cl < 200) return { 
      bodySize: isFullscreen ? '1.4rem' : '1.2rem', 
      diagSize: isFullscreen ? '1.75rem' : '1.5rem',
      hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
      lineH: '1.8', gap: isFullscreen ? '1rem' : '0.8rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
    };
    if (cl < 450) return { 
      bodySize: isFullscreen ? '1.25rem' : '1.1rem', 
      diagSize: isFullscreen ? '1.6rem' : '1.38rem',
      hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
      lineH: '1.68', gap: isFullscreen ? '0.85rem' : '0.65rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
    };
    if (cl < 800) return { 
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
        <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: BLUE.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaProcedures style={{ color: BLUE.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
          {slide.deptName} &nbsp;•&nbsp; CA PHẪU THUẬT {slide.caseIndex}/{slide.totalCases}
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
      </div>

      {/* Patient header bar */}
      <div style={{
        backgroundColor: BLUE.soft, border: `2px solid ${BLUE.border}`,
        borderLeft: `8px solid ${BLUE.main}`, borderRadius: '12px',
        padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
        flexShrink: 0, boxShadow: '0 4px 14px rgba(2,132,199,0.15)'
      }}>
        <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: BLUE.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
          {sc.patient_name || sc.patientName || 'BỆNH NHÂN PHẪU THUẬT'}
        </span>
        {ageFormatted && <span style={{ backgroundColor: BLUE.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(2,132,199,0.3)' }}>{ageFormatted}</span>}
        {sc.address && <span style={{ color: BLUE.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {sc.address}</span>}
        {(sc.admission_time || sc.admissionTime) && <span style={{ color: BLUE.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{sc.admission_time || sc.admissionTime}</strong></span>}
      </div>

      {/* Medical grid — 2 columns with full vertical expansion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Col 1: Lý do, Triệu chứng & CLS */}
        <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', border: `2px solid ${BLUE.border}`, borderLeft: `6px solid ${BLUE.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(2,132,199,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: BLUE.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${BLUE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            ⏰ LÝ DO & KHÁM LÂM SÀNG
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lý do vào viện:</span>
              <div style={{ color: '#0F172A', fontWeight: '600' }}>{sc.reason || '—'}</div>
            </div>
            {(sc.clinical_symptoms || sc.clinicalSymptoms) && (
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Triệu chứng lâm sàng:</span>
                <div style={{ color: '#0F172A', fontWeight: '600' }}>{sc.clinical_symptoms || sc.clinicalSymptoms}</div>
              </div>
            )}
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Cận lâm sàng & Chẩn đoán hình ảnh:</span>
              <div style={{ color: '#334155', fontWeight: '600' }}>{sc.clinical_tests || sc.clinicalTests || '—'}</div>
            </div>
          </div>
        </div>

        {/* Col 2: Chẩn đoán trước mổ, Lệnh mổ, Sau mổ, Hiện tại */}
        <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', border: `2px solid ${BLUE.border}`, borderLeft: `6px solid #0369A1`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(2,132,199,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${BLUE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            🔪 CHẨN ĐOÁN & QUÁ TRÌNH PHẪU THUẬT
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            {/* Chẩn đoán trước mổ highlight */}
            <div style={{ backgroundColor: BLUE.soft, border: `2px solid ${BLUE.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(2,132,199,0.12)' }}>
              <span style={{ fontWeight: '900', color: BLUE.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏥 CHẨN ĐOÁN TRƯỚC MỔ:
              </span>
              <span style={{ color: '#0369A1', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>
                {sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}
              </span>
            </div>

            {/* Lệnh mổ & CĐ sau mổ */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              {(sc.consultation_order || sc.consultationOrder) && (
                <div>
                  <span style={{ fontWeight: '800', color: '#1E293B' }}>Lệnh mổ / Phương pháp: </span>
                  <span style={{ color: '#0F172A', fontWeight: '700' }}>{sc.consultation_order || sc.consultationOrder}</span>
                </div>
              )}
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B' }}>Chẩn đoán sau mổ: </span>
                <span style={{ color: '#0369A1', fontWeight: '800' }}>{sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</span>
              </div>
            </div>

            {/* Tình trạng hiện tại */}
            <div style={{ backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '8px', padding: '0.55rem 0.85rem' }}>
              <span style={{ fontWeight: '800', color: '#065F46' }}>Tình trạng hiện tại: </span>
              <span style={{ color: '#047857', fontWeight: '700' }}>{sc.current_status || sc.currentStatus || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: image badge */}
      {caseImages.length > 0 && (
        <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: BLUE.soft, border: `2px dashed ${BLUE.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: BLUE.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
          <span>📷 Ca mổ có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
          <span style={{ fontStyle: 'italic', color: '#0369A1' }}>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}
    </div>
  );
};

export default SurgerySlide;
