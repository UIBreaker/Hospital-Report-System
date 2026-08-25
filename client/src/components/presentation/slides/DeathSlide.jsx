import React from 'react';
import { FaSkullCrossbones, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaExclamationTriangle } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const DeathSlide = ({ slide, isFullscreen }) => {
  const dc = slide.deathCase || {};
  const caseImages = normalizeImages(dc.images);
  const ageFormatted = formatPatientAge(dc.age);

  const contentText = [
    dc.admission_status, dc.admissionStatus, dc.medical_history, dc.medicalHistory,
    dc.clinical_symptoms, dc.clinicalSymptoms, dc.clinical_tests, dc.clinicalTests,
    dc.diagnosis, dc.emergency_treatment, dc.emergencyTreatment, dc.final_outcome, dc.finalOutcome
  ].filter(Boolean).join(' ');

  const cl = contentText.length;
  const bodySize = cl < 200 ? (isFullscreen ? '1.32rem' : '1.15rem')
    : cl < 450 ? (isFullscreen ? '1.2rem' : '1.05rem')
    : (isFullscreen ? '1.08rem' : '0.96rem');

  const diagSize = cl < 200 ? (isFullscreen ? '1.75rem' : '1.5rem')
    : cl < 450 ? (isFullscreen ? '1.55rem' : '1.35rem')
    : (isFullscreen ? '1.4rem' : '1.22rem');

  const lineH = cl < 200 ? '1.65' : cl < 450 ? '1.55' : '1.48';
  const cleanDiagnosis = (dc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

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
      
      {/* ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA TỬ VONG */}
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
          {/* TÊN KHOA TO BẢN NHẤT */}
          <div style={{
            fontSize: isFullscreen ? '2.1rem' : '1.65rem',
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

          {/* BADGE LOẠI CA */}
          <div style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: isFullscreen ? '0.35rem 0.95rem' : '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem',
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

      {/* ZONE 2: THANH THÔNG TIN BỆNH NHÂN (SUB-HEADER BAR) */}
      <div style={{
        backgroundColor: '#FEE2E2',
        border: '2px solid #FECACA',
        borderLeft: '8px solid #DC2626',
        borderRadius: '12px',
        padding: isFullscreen ? '0.65rem 1.25rem' : '0.45rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(220,38,38,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#991B1B' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: isFullscreen ? '1.65rem' : '1.35rem', fontWeight: '900', color: '#7F1D1D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {dc.patient_name || dc.patientName || 'BỆNH NHÂN TỬ VONG'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '0.2rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem'
          }}>
            {ageFormatted}
          </span>
        )}

        {dc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#991B1B', fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
            <FaMapMarkerAlt /> <span>{dc.address}</span>
          </div>
        )}

        {(dc.admission_time || dc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7F1D1D', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem' }}>
            <FaClock style={{ color: '#DC2626' }} /> <span>Giờ vào viện: <strong>{dc.admission_time || dc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* ZONE 3: NỘI DUNG CHUYÊN MÔN (2 COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Cột 1: Tình trạng vào viện & Tiền sử */}
        <div style={{
          backgroundColor: '#FFF7F7',
          borderRadius: '12px',
          border: '2px solid #FECACA',
          padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '1rem' : '0.75rem',
          overflowY: 'auto'
        }}>
          {/* Box Tình trạng lúc vào viện */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #FECACA',
            borderLeft: '6px solid #DC2626',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaExclamationTriangle /> TÌNH TRẠNG LÚC VÀO VIỆN
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
              {dc.admission_status || dc.admissionStatus || '—'}
            </div>
          </div>

          {/* Box Tiền sử */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #FECACA',
            borderLeft: '6px solid #991B1B',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              📋 TIỀN SỬ BỆNH
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
              {dc.medical_history || dc.medicalHistory || '—'}
            </div>
          </div>

          {/* Box Cận lâm sàng */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #FECACA',
            borderLeft: '6px solid #7F1D1D',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
            flex: 1
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              🔬 CẬN LÂM SÀNG & ECG
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
              {dc.clinical_tests || dc.clinicalTests || '—'}
            </div>
          </div>
        </div>

        {/* Cột 2: Chẩn đoán tử vong, Xử trí cấp cứu & Kết luận */}
        <div style={{
          backgroundColor: '#FFF7F7',
          borderRadius: '12px',
          border: '2px solid #FECACA',
          padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '1rem' : '0.75rem',
          overflowY: 'auto'
        }}>
          {/* Box Chẩn đoán tử vong */}
          <div style={{
            backgroundColor: '#FEE2E2',
            borderRadius: '10px',
            border: '2px solid #EF4444',
            borderLeft: '7px solid #DC2626',
            padding: isFullscreen ? '0.85rem 1.15rem' : '0.65rem 0.95rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN TỬ VONG
            </div>
            <div style={{ fontSize: diagSize, fontWeight: '900', color: '#7F1D1D', lineHeight: '1.3' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* Box Xử trí cấp cứu */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #FECACA',
            borderLeft: '6px solid #DC2626',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              🚨 XỬ TRÍ CẤP CỨU & HỒI SỨC
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
              {dc.emergency_treatment || dc.emergencyTreatment || '—'}
            </div>
          </div>

          {/* Box Kết quả & Kết luận */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #FECACA',
            borderLeft: '6px solid #7F1D1D',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              ⚖️ KẾT QUẢ & KẾT LUẬN
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#7F1D1D', fontWeight: '800' }}>
              {dc.final_outcome || dc.finalOutcome || 'Tử vong / Tiên lượng tử vong nặng xin về'}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#FFF7F7',
          border: '1.5px solid #FECACA',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.92rem' : '0.8rem',
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
