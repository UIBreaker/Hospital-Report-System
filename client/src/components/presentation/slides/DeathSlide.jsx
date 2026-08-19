import React from 'react';
import { FaSkullCrossbones } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const DeathSlide = ({ slide, isFullscreen }) => {
  const dc = slide.deathCase || {};
  const caseImages = normalizeImages(dc.images);
  const ageFormatted = formatPatientAge(dc.age);
  const RED = { main: '#DC2626', dark: '#991B1B', light: '#FEF2F2', border: '#FECACA', soft: '#FEE2E2' };

  const contentLength = [
    dc.admission_status || dc.admissionStatus || '',
    dc.medical_history || dc.medicalHistory || '',
    dc.clinical_symptoms || dc.clinicalSymptoms || '',
    dc.clinical_tests || dc.clinicalTests || '',
    dc.diagnosis || '',
    dc.emergency_treatment || dc.emergencyTreatment || '',
    dc.final_outcome || dc.finalOutcome || '',
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
        <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: RED.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaSkullCrossbones style={{ color: RED.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
          {slide.deptName} &nbsp;•&nbsp; HỒ SƠ TỬ VONG {slide.caseIndex}/{slide.totalCases}
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
      </div>

      {/* Patient header bar with Alert Red */}
      <div style={{
        backgroundColor: RED.soft, border: `2px solid ${RED.border}`,
        borderLeft: `8px solid ${RED.main}`, borderRadius: '12px',
        padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
        flexShrink: 0, boxShadow: '0 4px 14px rgba(220,38,38,0.18)'
      }}>
        <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: RED.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
          {dc.patient_name || dc.patientName || 'BỆNH NHÂN TỬ VONG'}
        </span>
        {ageFormatted && <span style={{ backgroundColor: RED.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}>{ageFormatted}</span>}
        {dc.address && <span style={{ color: RED.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {dc.address}</span>}
        {(dc.admission_time || dc.admissionTime) && <span style={{ color: RED.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{dc.admission_time || dc.admissionTime}</strong></span>}
      </div>

      {/* Medical grid — 2 columns with full vertical expansion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Col 1: Tình trạng lúc vào & Tiền sử */}
        <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', border: `2px solid ${RED.border}`, borderLeft: `6px solid ${RED.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(220,38,38,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: RED.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${RED.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            ⚠️ TÌNH TRẠNG VÀO VIỆN & TIỀN SỬ
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Tình trạng lúc vào viện:</span>
              <div style={{ color: '#0F172A', fontWeight: '600' }}>{dc.admission_status || dc.admissionStatus || '—'}</div>
            </div>
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Tiền sử bệnh:</span>
              <div style={{ color: '#334155', fontWeight: '600' }}>{dc.medical_history || dc.medicalHistory || '—'}</div>
            </div>
            {(dc.clinical_symptoms || dc.clinicalSymptoms) && (
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lâm sàng & Sinh hiệu:</span>
                <div style={{ color: '#0F172A', fontWeight: '600' }}>{dc.clinical_symptoms || dc.clinicalSymptoms}</div>
              </div>
            )}
            <div>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Cận lâm sàng & ECG:</span>
              <div style={{ color: '#334155', fontWeight: '600' }}>{dc.clinical_tests || dc.clinicalTests || '—'}</div>
            </div>
          </div>
        </div>

        {/* Col 2: Chẩn đoán tử vong & Cấp cứu */}
        <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', border: `2px solid ${RED.border}`, borderLeft: `6px solid #B91C1C`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(220,38,38,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${RED.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
            🚨 CHẨN ĐOÁN & XỬ TRÍ CẤP CỨU
          </div>
          <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
            {/* Chẩn đoán tử vong highlight */}
            <div style={{ backgroundColor: RED.soft, border: `2px solid ${RED.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(220,38,38,0.15)' }}>
              <span style={{ fontWeight: '900', color: RED.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏥 CHẨN ĐOÁN TỬ VONG:
              </span>
              <span style={{ color: '#991B1B', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>
                {dc.diagnosis || '—'}
              </span>
            </div>

            {/* Xử trí cấp cứu */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Xử trí cấp cứu ngừng tuần hoàn / Hồi sức:</span>
              <div style={{ color: '#0F172A', fontWeight: '600' }}>{dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
            </div>

            {/* Kết quả & Kết luận */}
            <div style={{ backgroundColor: '#FFF1F2', border: '1.5px solid #FDA4AF', borderRadius: '8px', padding: '0.55rem 0.85rem' }}>
              <span style={{ fontWeight: '800', color: '#9F1239' }}>Kết quả & Kết luận: </span>
              <span style={{ color: '#BE123C', fontWeight: '700' }}>{dc.final_outcome || dc.finalOutcome || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: image badge */}
      {caseImages.length > 0 && (
        <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: RED.soft, border: `2px dashed ${RED.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: RED.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
          <span>📷 Hồ sơ có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
          <span style={{ fontStyle: 'italic', color: '#991B1B' }}>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}
    </div>
  );
};

export default DeathSlide;
