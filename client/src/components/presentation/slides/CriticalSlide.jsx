import React from 'react';
import { FaHeartbeat, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaStethoscope, FaStickyNote } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const CriticalSlide = ({ slide, isFullscreen }) => {
  const cc = slide.criticalCase || {};
  const caseImages = normalizeImages(cc.images);
  const ageFormatted = formatPatientAge(cc.age);

  const contentText = [
    cc.medical_history, cc.medicalHistory, cc.clinical_symptoms, cc.clinicalSymptoms,
    cc.clinical_tests, cc.clinicalTests, cc.diagnosis, cc.condition_summary, cc.conditionSummary,
    cc.treatment, cc.notes
  ].filter(Boolean).join(' ');

  const cl = contentText.length;
  const bodySize = cl < 200 ? (isFullscreen ? '1.32rem' : '1.15rem')
    : cl < 450 ? (isFullscreen ? '1.2rem' : '1.05rem')
    : (isFullscreen ? '1.08rem' : '0.96rem');

  const diagSize = cl < 200 ? (isFullscreen ? '1.75rem' : '1.5rem')
    : cl < 450 ? (isFullscreen ? '1.55rem' : '1.35rem')
    : (isFullscreen ? '1.4rem' : '1.22rem');

  const lineH = cl < 200 ? '1.65' : cl < 450 ? '1.55' : '1.48';
  const cleanDiagnosis = (cc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

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
      
      {/* ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA BỆNH NẶNG */}
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
            backgroundColor: '#7C3AED',
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
            <FaHeartbeat />
            <span>BỆNH NẶNG THEO DÕI {slide.caseIndex}/{slide.totalCases}</span>
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
        backgroundColor: '#EDE9FE',
        border: '2px solid #DDD6FE',
        borderLeft: '8px solid #7C3AED',
        borderRadius: '12px',
        padding: isFullscreen ? '0.65rem 1.25rem' : '0.45rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(124,58,237,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#5B21B6' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: isFullscreen ? '1.65rem' : '1.35rem', fontWeight: '900', color: '#4C1D95', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cc.patient_name || cc.patientName || 'BỆNH NHÂN NẶNG'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            padding: '0.2rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem'
          }}>
            {ageFormatted}
          </span>
        )}

        {cc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#5B21B6', fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
            <FaMapMarkerAlt /> <span>{cc.address}</span>
          </div>
        )}

        {(cc.admission_time || cc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4C1D95', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem' }}>
            <FaClock style={{ color: '#7C3AED' }} /> <span>Giờ vào viện: <strong>{cc.admission_time || cc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* ZONE 3: NỘI DUNG CHUYÊN MÔN (2 COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Cột 1: Tiền sử & Lâm sàng / CLS */}
        <div style={{
          backgroundColor: '#FAF5FF',
          borderRadius: '12px',
          border: '2px solid #DDD6FE',
          padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '1rem' : '0.75rem',
          overflowY: 'auto'
        }}>
          {/* Tiền sử bệnh */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #DDD6FE',
            borderLeft: '6px solid #7C3AED',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              📋 TIỀN SỬ BỆNH
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
              {cc.medical_history || cc.medicalHistory || 'Chưa ghi nhận'}
            </div>
          </div>

          {/* Lâm sàng & Sinh hiệu */}
          {(cc.clinical_symptoms || cc.clinicalSymptoms) && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px solid #DDD6FE',
              borderLeft: '6px solid #7C3AED',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                🩺 LÂM SÀNG & SINH HIỆU
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
                {cc.clinical_symptoms || cc.clinicalSymptoms}
              </div>
            </div>
          )}

          {/* Cận lâm sàng */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #DDD6FE',
            borderLeft: '6px solid #5B21B6',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
            flex: 1
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              🔬 CẬN LÂM SÀNG & XÉT NGHIỆM
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
              {cc.clinical_tests || cc.clinicalTests || '—'}
            </div>
          </div>
        </div>

        {/* Cột 2: Chẩn đoán, Xử trí, Diễn biến & Bàn giao */}
        <div style={{
          backgroundColor: '#FAF5FF',
          borderRadius: '12px',
          border: '2px solid #DDD6FE',
          padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '1rem' : '0.75rem',
          overflowY: 'auto'
        }}>
          {/* Box Chẩn đoán */}
          <div style={{
            backgroundColor: '#EDE9FE',
            borderRadius: '10px',
            border: '2px solid #8B5CF6',
            borderLeft: '7px solid #7C3AED',
            padding: isFullscreen ? '0.85rem 1.15rem' : '0.65rem 0.95rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN XÁC ĐỊNH
            </div>
            <div style={{ fontSize: diagSize, fontWeight: '900', color: '#4C1D95', lineHeight: '1.3' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* Box Diễn biến tình trạng */}
          {(cc.condition_summary || cc.conditionSummary) && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px solid #DDD6FE',
              borderLeft: '6px solid #7C3AED',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                ⚡ TÓM TẮT TÌNH TRẠNG & DIỄN BIẾN
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
                {cc.condition_summary || cc.conditionSummary}
              </div>
            </div>
          )}

          {/* Box Xử trí & Theo dõi tiếp */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #DDD6FE',
            borderLeft: '6px solid #5B21B6',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              💊 XỬ TRÍ & THEO DÕI TIẾP
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#4C1D95', fontWeight: '800' }}>
              {cc.treatment || 'Chăm sóc theo dõi cấp II'}
            </div>
          </div>

          {/* Box Ghi chú bàn giao */}
          {cc.notes && (
            <div style={{
              backgroundColor: '#FFFBEB',
              borderRadius: '10px',
              border: '1.5px solid #FDE68A',
              borderLeft: '6px solid #D97706',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FaStickyNote /> GHI CHÚ BÀN GIAO TUA SAU
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#78350F', fontWeight: '700' }}>
                {cc.notes}
              </div>
            </div>
          )}
        </div>
      </div>

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
          fontSize: isFullscreen ? '0.92rem' : '0.8rem',
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
