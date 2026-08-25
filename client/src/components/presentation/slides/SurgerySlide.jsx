import React from 'react';
import { FaProcedures, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaStethoscope, FaFlask, FaCheckCircle } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const SurgerySlide = ({ slide, isFullscreen }) => {
  const sc = slide.surgeryCase || {};
  const caseImages = normalizeImages(sc.images);
  const ageFormatted = formatPatientAge(sc.birth_year || sc.birthYear || sc.age);

  const preDiag = (sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');
  const postDiag = (sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

  const hasSymptoms = Boolean(sc.clinical_symptoms || sc.clinicalSymptoms);
  const hasTests = Boolean(sc.clinical_tests || sc.clinicalTests);

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
      
      {/* 1. ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA PHẪU THUẬT */}
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
            backgroundColor: '#0284C7',
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
            <FaProcedures />
            <span>CA PHẪU THUẬT {slide.caseIndex}/{slide.totalCases}</span>
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
        backgroundColor: '#E0F2FE',
        border: '2px solid #BAE6FD',
        borderLeft: '8px solid #0284C7',
        borderRadius: '12px',
        padding: isFullscreen ? '0.6rem 1.25rem' : '0.42rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(2,132,199,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: '#0369A1' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: FONT_PT_NAME, fontWeight: '900', color: '#0C4A6E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {sc.patient_name || sc.patientName || 'BỆNH NHÂN PHẪU THUẬT'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: FONT_PT_INFO
          }}>
            {ageFormatted}
          </span>
        )}

        {sc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0369A1', fontWeight: '700', fontSize: FONT_PT_INFO }}>
            <FaMapMarkerAlt /> <span>{sc.address}</span>
          </div>
        )}

        {(sc.admission_time || sc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0C4A6E', fontWeight: '800', fontSize: FONT_PT_INFO }}>
            <FaClock style={{ color: '#0284C7' }} /> <span>Giờ vào viện: <strong>{sc.admission_time || sc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* 3. ZONE 3: NỘI DUNG PHẪU THUẬT FLOW (ZERO DEAD WHITESPACE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.55rem', flex: 1, minHeight: 0 }}>
        
        {/* ROW 1: CHẨN ĐOÁN TRƯỚC & SAU MỔ (HERO TOP BANNER) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: postDiag !== '—' ? '1.2fr 1fr' : '1fr',
          gap: isFullscreen ? '0.75rem' : '0.55rem',
          flexShrink: 0
        }}>
          {/* Trước mổ */}
          <div style={{
            backgroundColor: '#E0F2FE',
            border: '2.5px solid #38BDF8',
            borderLeft: '8px solid #0284C7',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.35rem' : '0.65rem 1.1rem',
            boxShadow: '0 4px 12px rgba(2,132,199,0.1)'
          }}>
            <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN TRƯỚC MỔ
            </div>
            <div style={{ fontSize: FONT_DIAG_TEXT, fontWeight: '900', color: '#0C4A6E', lineHeight: '1.25' }}>
              {preDiag}
            </div>
          </div>

          {/* Sau mổ (nếu có) */}
          {postDiag !== '—' && (
            <div style={{
              backgroundColor: '#F0F9FF',
              border: '2px solid #BAE6FD',
              borderLeft: '7px solid #0369A1',
              borderRadius: '12px',
              padding: isFullscreen ? '0.85rem 1.35rem' : '0.65rem 1.1rem'
            }}>
              <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                🩺 CHẨN ĐOÁN SAU MỔ
              </div>
              <div style={{ fontSize: isFullscreen ? '1.75rem' : '1.45rem', fontWeight: '900', color: '#0284C7', lineHeight: '1.25' }}>
                {postDiag}
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: LÝ DO, LÂM SÀNG & CẬN LÂM SÀNG (MIDDLE BALANCED ROW) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: (hasSymptoms || hasTests) ? '1fr 1.3fr' : '1fr',
          gap: isFullscreen ? '0.75rem' : '0.55rem',
          flex: 1,
          minHeight: 0
        }}>
          {/* Lý do & Triệu chứng lâm sàng */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '2px solid #E2E8F0',
            borderLeft: '6px solid #0284C7',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            overflowY: 'auto'
          }}>
            <div>
              <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaClock /> LÝ DO VÀO VIỆN
              </div>
              <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800' }}>
                {sc.reason || '—'}
              </div>
            </div>
            {hasSymptoms && (
              <div style={{ borderTop: '1.5px dashed #CBD5E1', paddingTop: '0.45rem' }}>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaStethoscope /> TRIỆU CHỨNG LÂM SÀNG
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {sc.clinical_symptoms || sc.clinicalSymptoms}
                </div>
              </div>
            )}
          </div>

          {/* Cận lâm sàng & Chẩn đoán hình ảnh */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '2px solid #E2E8F0',
            borderLeft: '6px solid #0369A1',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFlask /> CẬN LÂM SÀNG & HÌNH ẢNH
            </div>
            <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
              {sc.clinical_tests || sc.clinicalTests || '—'}
            </div>
          </div>
        </div>

        {/* ROW 3: LỆNH MỔ & TÌNH TRẠNG HIỆN TẠI (BOTTOM BALANCED ROW) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: isFullscreen ? '0.75rem' : '0.55rem',
          flexShrink: 0
        }}>
          {/* Lệnh mổ */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #BAE6FD',
            borderLeft: '6px solid #0284C7',
            borderRadius: '12px',
            padding: isFullscreen ? '0.75rem 1.25rem' : '0.55rem 0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaProcedures /> LỆNH MỔ / PHƯƠNG PHÁP
            </div>
            <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800', lineHeight: '1.3' }}>
              {sc.consultation_order || sc.consultationOrder || '—'}
            </div>
          </div>

          {/* Tình trạng hiện tại */}
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '2px solid #A7F3D0',
            borderLeft: '6px solid #059669',
            borderRadius: '12px',
            padding: isFullscreen ? '0.75rem 1.25rem' : '0.55rem 0.95rem'
          }}>
            <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#065F46', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaCheckCircle /> HIỆN TẠI & HẬU PHẪU
            </div>
            <div style={{ fontSize: FONT_BODY, color: '#065F46', fontWeight: '900', lineHeight: '1.3' }}>
              {sc.current_status || sc.currentStatus || 'Bệnh tỉnh, tiếp xúc tốt'}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER: HÌNH ẢNH */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1.5px solid #BAE6FD',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.98rem' : '0.85rem',
          color: '#0369A1',
          fontWeight: '800',
          flexShrink: 0
        }}>
          <span>📷 Ca phẫu thuật có <strong>{caseImages.length}</strong> hình ảnh minh họa</span>
          <span>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}

    </div>
  );
};

export default SurgerySlide;
