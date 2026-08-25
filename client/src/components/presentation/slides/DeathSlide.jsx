import React from 'react';
import { FaSkullCrossbones, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaExclamationTriangle, FaStethoscope, FaFlask, FaBalanceScale } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const DeathSlide = ({ slide, isFullscreen }) => {
  const dc = slide.deathCase || {};
  const caseImages = normalizeImages(dc.images);
  const ageFormatted = formatPatientAge(dc.age);
  const cleanDiagnosis = (dc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

  const hasHistory = Boolean(dc.medical_history || dc.medicalHistory);
  const hasSymptoms = Boolean(dc.clinical_symptoms || dc.clinicalSymptoms);
  const hasTests = Boolean(dc.clinical_tests || dc.clinicalTests);

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
      
      {/* 1. ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA TỬ VONG */}
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
            backgroundColor: '#DC2626',
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
            <FaSkullCrossbones />
            <span>HỒ SƠ TỬ VONG {slide.caseIndex}/{slide.totalCases}</span>
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
        backgroundColor: '#FEE2E2',
        border: '2px solid #FECACA',
        borderLeft: '8px solid #DC2626',
        borderRadius: '12px',
        padding: isFullscreen ? '0.6rem 1.25rem' : '0.42rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(220,38,38,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: '#991B1B' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: FONT_PT_NAME, fontWeight: '900', color: '#7F1D1D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {dc.patient_name || dc.patientName || 'BỆNH NHÂN TỬ VONG'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: FONT_PT_INFO
          }}>
            {ageFormatted}
          </span>
        )}

        {dc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#991B1B', fontWeight: '700', fontSize: FONT_PT_INFO }}>
            <FaMapMarkerAlt /> <span>{dc.address}</span>
          </div>
        )}

        {(dc.admission_time || dc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7F1D1D', fontWeight: '800', fontSize: FONT_PT_INFO }}>
            <FaClock style={{ color: '#DC2626' }} /> <span>Giờ vào viện: <strong>{dc.admission_time || dc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* 3. ZONE 3: NỘI DUNG TỬ VONG FLOW (ZERO DEAD WHITESPACE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.55rem', flex: 1, minHeight: 0 }}>
        
        {/* ROW 1: CHẨN ĐOÁN TỬ VONG (HERO TOP BANNER) */}
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '2.5px solid #EF4444',
          borderLeft: '9px solid #DC2626',
          borderRadius: '12px',
          padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1.1rem',
          boxShadow: '0 4px 14px rgba(220,38,38,0.14)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: FONT_DIAG_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FaFileMedical /> CHẨN ĐOÁN TỬ VONG
          </div>
          <div style={{ fontSize: FONT_DIAG_TEXT, fontWeight: '900', color: '#7F1D1D', lineHeight: '1.25' }}>
            {cleanDiagnosis}
          </div>
        </div>

        {/* ROW 2: TÌNH TRẠNG VÀO VIỆN, TIỀN SỬ & CLS/ECG (MIDDLE BALANCED ROW) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: isFullscreen ? '0.75rem' : '0.55rem',
          flex: 1,
          minHeight: 0
        }}>
          {/* Tình trạng vào viện & Tiền sử */}
          <div style={{
            backgroundColor: '#FFF7F7',
            border: '2px solid #FECACA',
            borderLeft: '6px solid #DC2626',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            overflowY: 'auto'
          }}>
            <div>
              <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaExclamationTriangle /> TÌNH TRẠNG LÚC VÀO VIỆN
              </div>
              <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800' }}>
                {dc.admission_status || dc.admissionStatus || '—'}
              </div>
            </div>
            {hasHistory && (
              <div style={{ borderTop: '1.5px dashed #FECACA', paddingTop: '0.45rem' }}>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  📋 TIỀN SỬ BỆNH
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {dc.medical_history || dc.medicalHistory}
                </div>
              </div>
            )}
          </div>

          {/* Lâm sàng & Cận lâm sàng ECG */}
          <div style={{
            backgroundColor: '#FFF7F7',
            border: '2px solid #FECACA',
            borderLeft: '6px solid #991B1B',
            borderRadius: '12px',
            padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            overflowY: 'auto'
          }}>
            {hasSymptoms && (
              <div>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaStethoscope /> LÂM SÀNG & SINH HIỆU
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {dc.clinical_symptoms || dc.clinicalSymptoms}
                </div>
              </div>
            )}
            {hasTests && (
              <div style={{ borderTop: hasSymptoms ? '1.5px dashed #FECACA' : 'none', paddingTop: hasSymptoms ? '0.45rem' : 0 }}>
                <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaFlask /> CẬN LÂM SÀNG & ECG
                </div>
                <div style={{ fontSize: FONT_BODY, lineHeight: LINE_H, color: '#0F172A', fontWeight: '600' }}>
                  {dc.clinical_tests || dc.clinicalTests}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: XỬ TRÍ CẤP CỨU & KẾT LUẬN (BOTTOM BALANCED ROW) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: isFullscreen ? '0.75rem' : '0.55rem',
          flexShrink: 0
        }}>
          {/* Xử trí cấp cứu */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #FECACA',
            borderLeft: '6px solid #DC2626',
            borderRadius: '12px',
            padding: isFullscreen ? '0.75rem 1.25rem' : '0.55rem 0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🚨 XỬ TRÍ CẤP CỨU & HỒI SỨC
            </div>
            <div style={{ fontSize: FONT_BODY, color: '#0F172A', fontWeight: '800', lineHeight: '1.3' }}>
              {dc.emergency_treatment || dc.emergencyTreatment || '—'}
            </div>
          </div>

          {/* Kết quả & Kết luận */}
          <div style={{
            backgroundColor: '#FFF5F5',
            border: '2px solid #FECACA',
            borderLeft: '6px solid #7F1D1D',
            borderRadius: '12px',
            padding: isFullscreen ? '0.75rem 1.25rem' : '0.55rem 0.95rem'
          }}>
            <div style={{ fontSize: FONT_SECTION_TITLE, fontWeight: '900', color: '#7F1D1D', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaBalanceScale /> KẾT LUẬN
            </div>
            <div style={{ fontSize: FONT_BODY, color: '#7F1D1D', fontWeight: '900', lineHeight: '1.3' }}>
              {dc.final_outcome || dc.finalOutcome || 'Tử vong / Nặng xin về'}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER: HÌNH ẢNH */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#FFF7F7',
          border: '1.5px solid #FECACA',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.98rem' : '0.85rem',
          color: '#991B1B',
          fontWeight: '800',
          flexShrink: 0
        }}>
          <span>📷 Hồ sơ tử vong có <strong>{caseImages.length}</strong> hình ảnh minh họa</span>
          <span>(Xem ở Slide tiếp theo ➔)</span>
        </div>
      )}

    </div>
  );
};

export default DeathSlide;
