import React from 'react';
import { FaAmbulance } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const TransferSlide = ({ slide, isFullscreen }) => {
  const tc = slide.transferCase || {};
  const caseImages = normalizeImages(tc.images);
  const ageFormatted = formatPatientAge(tc.age);
  const AMBER = { main: '#D97706', dark: '#92400E', light: '#FFFBEB', border: '#FDE68A', soft: '#FEF3C7' };

  // ================= PART 1: TIẾP NHẬN =================
  if (slide.type === 'transfer') {
    const contentLength = [
      tc.reason || '',
      tc.initial_treatment || tc.initialTreatment || '',
      tc.clinical_symptoms || tc.clinicalSymptoms || '',
      tc.clinical_tests || tc.clinicalTests || '',
      tc.diagnosis || '',
    ].join('').length;

    const af = ((cl) => {
      if (cl < 180) return { 
        bodySize: isFullscreen ? '1.45rem' : '1.25rem', 
        diagSize: isFullscreen ? '1.85rem' : '1.6rem',
        hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
        lineH: '1.8', gap: isFullscreen ? '1.1rem' : '0.85rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
      };
      if (cl < 400) return { 
        bodySize: isFullscreen ? '1.3rem' : '1.15rem', 
        diagSize: isFullscreen ? '1.7rem' : '1.48rem',
        hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
        lineH: '1.7', gap: isFullscreen ? '0.9rem' : '0.7rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
      };
      if (cl < 700) return { 
        bodySize: isFullscreen ? '1.18rem' : '1.05rem', 
        diagSize: isFullscreen ? '1.55rem' : '1.35rem',
        hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
        lineH: '1.62', gap: isFullscreen ? '0.75rem' : '0.58rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
      };
      return { 
        bodySize: isFullscreen ? '1.05rem' : '0.95rem', 
        diagSize: isFullscreen ? '1.4rem' : '1.22rem',
        hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
        lineH: '1.52', gap: isFullscreen ? '0.6rem' : '0.45rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
      };
    })(contentLength);

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
        {/* Slide type label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaAmbulance style={{ color: AMBER.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
            {slide.deptName} &nbsp;•&nbsp; CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 1: TIẾP NHẬN)
          </div>
          <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
        </div>

        {/* Patient header bar */}
        <div style={{
          backgroundColor: AMBER.soft, border: `2px solid ${AMBER.border}`,
          borderLeft: `8px solid ${AMBER.main}`, borderRadius: '12px',
          padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
          display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
          flexShrink: 0, boxShadow: '0 4px 14px rgba(217,119,6,0.15)'
        }}>
          <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
            {tc.patient_name || tc.patientName || 'BỆNH NHÂN CHUYỂN VIỆN'}
          </span>
          {ageFormatted && <span style={{ backgroundColor: AMBER.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(217,119,6,0.3)' }}>{ageFormatted}</span>}
          {tc.address && <span style={{ color: AMBER.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {tc.address}</span>}
          {(tc.admission_time || tc.admissionTime) && <span style={{ color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Giờ vào: <strong>{tc.admission_time || tc.admissionTime}</strong></span>}
        </div>

        {/* Medical grid — 2 columns with full height distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
          {/* Col 1: Lý do + Xử trí */}
          <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `6px solid ${AMBER.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(217,119,6,0.06)', overflowY: 'auto' }}>
            <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
              ⏰ LÝ DO & XỬ TRÍ BAN ĐẦU
            </div>
            <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lý do vào viện:</span>
                <div style={{ color: '#0F172A', fontWeight: '600' }}>{tc.reason || '—'}</div>
              </div>
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Xử trí ban đầu:</span>
                <div style={{ color: '#1E293B', fontWeight: '600', backgroundColor: '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                  {tc.initial_treatment || tc.initialTreatment || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: CLS + Chẩn đoán */}
          <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `6px solid #B45309`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(217,119,6,0.06)', overflowY: 'auto' }}>
            <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
              🔬 LÂM SÀNG, CẬN LÂM SÀNG & CHẨN ĐOÁN
            </div>
            <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
              <div style={{ backgroundColor: AMBER.soft, border: `2px solid ${AMBER.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(217,119,6,0.12)' }}>
                <span style={{ fontWeight: '900', color: AMBER.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏥 CHẨN ĐOÁN XÁC ĐỊNH:
                </span>
                <span style={{ color: '#92400E', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>
                  {tc.diagnosis || '—'}
                </span>
              </div>
              {(tc.clinical_symptoms || tc.clinicalSymptoms) && (
                <div>
                  <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lâm sàng / Triệu chứng khám:</span>
                  <div style={{ color: '#0F172A', fontWeight: '600' }}>{tc.clinical_symptoms || tc.clinicalSymptoms}</div>
                </div>
              )}
              <div>
                <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Cận lâm sàng / X-Quang / XN:</span>
                <div style={{ color: '#334155', fontWeight: '600' }}>{tc.clinical_tests || tc.clinicalTests || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: image badge */}
        {caseImages.length > 0 && (
          <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: AMBER.soft, border: `2px dashed ${AMBER.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
            <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
            <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
          </div>
        )}
      </div>
    );
  }

  // ================= PART 2: DIỄN BIẾN & TÌNH TRẠNG CHUYỂN =================
  const progText = tc.progress_notes || '';
  const contentLength = progText.length + (tc.diagnosis || '').length;
  const af = ((cl) => {
    if (cl < 200) return { bodySize: isFullscreen ? '1.5rem' : '1.3rem', lineH: '1.85' };
    if (cl < 450) return { bodySize: isFullscreen ? '1.35rem' : '1.18rem', lineH: '1.75' };
    if (cl < 750) return { bodySize: isFullscreen ? '1.2rem' : '1.08rem', lineH: '1.65' };
    return { bodySize: isFullscreen ? '1.05rem' : '0.95rem', lineH: '1.55' };
  })(contentLength);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
      {/* Slide type label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>📝</span>
          {slide.deptName} &nbsp;•&nbsp; CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 2: DIỄN BIẾN)
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
      </div>

      {/* Patient summary bar */}
      <div style={{ backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE', borderLeft: '7px solid #2563EB', borderRadius: '10px', padding: isFullscreen ? '0.65rem 1.3rem' : '0.45rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0, boxShadow: '0 3px 10px rgba(37,99,235,0.08)' }}>
        <div style={{ fontSize: isFullscreen ? '1.4rem' : '1.18rem', fontWeight: '900', color: '#0F2C59' }}>
          👤 {tc.patient_name || tc.patientName || 'Bệnh nhân chuyển viện'}
        </div>
        {tc.diagnosis && <div style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: AMBER.dark }}>🏥 CĐ: <span style={{ color: '#92400E' }}>{tc.diagnosis}</span></div>}
      </div>

      {/* Full-width progress notes with large text and relaxed spacing */}
      <div style={{ flex: 1, minHeight: 0, backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `7px solid ${AMBER.main}`, padding: isFullscreen ? '1.2rem 1.6rem' : '0.9rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', boxShadow: '0 4px 16px rgba(217,119,6,0.08)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isFullscreen ? '1.2rem' : '1.05rem', fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.45rem', flexShrink: 0 }}>
          <span>📋</span><span>NỘI DUNG DIỄN BIẾN, HỘI CHẨN & TÌNH TRẠNG CHUYỂN VIỆN:</span>
        </div>
        <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, color: '#0F172A', fontWeight: '600', whiteSpace: 'pre-wrap', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {progText || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '1.2rem' }}>(Không có ghi chú diễn biến bổ sung cho ca bệnh này)</span>}
        </div>
      </div>

      {caseImages.length > 0 && (
        <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: AMBER.soft, border: `2px dashed ${AMBER.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
          <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
          <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}
    </div>
  );
};

export default TransferSlide;
