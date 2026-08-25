import React from 'react';
import { FaAmbulance, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaStethoscope } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const TransferSlide = ({ slide, isFullscreen }) => {
  const tc = slide.transferCase || {};
  const caseImages = normalizeImages(tc.images);
  const ageFormatted = formatPatientAge(tc.age);
  const AMBER = {
    main: '#D97706',
    dark: '#92400E',
    navy: '#0F2C59',
    light: '#FFFBEB',
    border: '#FDE68A',
    soft: '#FEF3C7'
  };

  const isPart1 = slide.type === 'transfer';
  const partTitle = isPart1 ? 'PHẦN 1: TIẾP NHẬN & CHẨN ĐOÁN' : 'PHẦN 2: DIỄN BIẾN & CHUYỂN VIỆN';

  const contentText = isPart1
    ? [tc.reason, tc.initial_treatment, tc.initialTreatment, tc.clinical_symptoms, tc.clinicalSymptoms, tc.clinical_tests, tc.clinicalTests, tc.diagnosis].filter(Boolean).join(' ')
    : [tc.diagnosis, tc.progress_notes, tc.progressNotes].filter(Boolean).join(' ');

  const cl = contentText.length;

  const bodySize = cl < 200 ? (isFullscreen ? '1.32rem' : '1.15rem')
    : cl < 450 ? (isFullscreen ? '1.2rem' : '1.05rem')
    : (isFullscreen ? '1.08rem' : '0.96rem');

  const diagSize = cl < 200 ? (isFullscreen ? '1.75rem' : '1.5rem')
    : cl < 450 ? (isFullscreen ? '1.55rem' : '1.35rem')
    : (isFullscreen ? '1.4rem' : '1.22rem');

  const lineH = cl < 200 ? '1.65' : cl < 450 ? '1.55' : '1.48';
  const cleanDiagnosis = (tc.diagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

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
      
      {/* ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA BỆNH (EXECUTIVE BANNER) */}
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
            backgroundColor: '#D97706',
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

      {/* ZONE 2: THANH THÔNG TIN BỆNH NHÂN (SUB-HEADER BAR) */}
      <div style={{
        backgroundColor: '#FEF3C7',
        border: '2px solid #FDE68A',
        borderLeft: '8px solid #D97706',
        borderRadius: '12px',
        padding: isFullscreen ? '0.65rem 1.25rem' : '0.45rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(217,119,6,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#92400E' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: isFullscreen ? '1.65rem' : '1.35rem', fontWeight: '900', color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {tc.patient_name || tc.patientName || 'BỆNH NHÂN CHUYỂN VIỆN'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            padding: '0.2rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem'
          }}>
            {ageFormatted}
          </span>
        )}

        {tc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#92400E', fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
            <FaMapMarkerAlt /> <span>{tc.address}</span>
          </div>
        )}

        {(tc.admission_time || tc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#78350F', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem' }}>
            <FaClock style={{ color: '#D97706' }} /> <span>Giờ vào viện: <strong>{tc.admission_time || tc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* ZONE 3: NỘI DUNG CHUYÊN MÔN (HIGH-LEGIBILITY MEDICAL CARDS) */}
      {isPart1 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
          {/* Cột 1: Lý do vào viện & Xử trí ban đầu */}
          <div style={{
            backgroundColor: '#FFFDF5',
            borderRadius: '12px',
            border: '2px solid #FDE68A',
            padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: isFullscreen ? '1rem' : '0.75rem',
            overflowY: 'auto'
          }}>
            {/* Box Lý do */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px solid #FDE68A',
              borderLeft: '6px solid #D97706',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaClock /> LÝ DO VÀO VIỆN
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
                {tc.reason || '—'}
              </div>
            </div>

            {/* Box Xử trí ban đầu */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px solid #FDE68A',
              borderLeft: '6px solid #B45309',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
              flex: 1
            }}>
              <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaStethoscope /> XỬ TRÍ BAN ĐẦU
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
                {tc.initial_treatment || tc.initialTreatment || '—'}
              </div>
            </div>
          </div>

          {/* Cột 2: Chẩn đoán xác định, Lâm sàng & Cận lâm sàng */}
          <div style={{
            backgroundColor: '#FFFDF5',
            borderRadius: '12px',
            border: '2px solid #FDE68A',
            padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: isFullscreen ? '1rem' : '0.75rem',
            overflowY: 'auto'
          }}>
            {/* Box Chẩn đoán (Nổi bật nhất) */}
            <div style={{
              backgroundColor: '#FEF3C7',
              borderRadius: '10px',
              border: '2px solid #F59E0B',
              borderLeft: '7px solid #D97706',
              padding: isFullscreen ? '0.85rem 1.15rem' : '0.65rem 0.95rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaFileMedical /> CHẨN ĐOÁN XÁC ĐỊNH
              </div>
              <div style={{ fontSize: diagSize, fontWeight: '900', color: '#78350F', lineHeight: '1.3' }}>
                {cleanDiagnosis}
              </div>
            </div>

            {/* Box Lâm sàng & Triệu chứng */}
            {(tc.clinical_symptoms || tc.clinicalSymptoms) && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1.5px solid #FDE68A',
                borderLeft: '6px solid #D97706',
                padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
              }}>
                <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  🩺 LÂM SÀNG & TRIỆU CHỨNG KHÁM
                </div>
                <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
                  {tc.clinical_symptoms || tc.clinicalSymptoms}
                </div>
              </div>
            )}

            {/* Box Cận lâm sàng */}
            {(tc.clinical_tests || tc.clinicalTests) && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1.5px solid #FDE68A',
                borderLeft: '6px solid #B45309',
                padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
              }}>
                <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  🔬 CẬN LÂM SÀNG & X-QUANG / XÉT NGHIỆM
                </div>
                <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
                  {tc.clinical_tests || tc.clinicalTests}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PART 2: DIỄN BIẾN CHUYỂN VIỆN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
          {/* Box Chẩn đoán */}
          <div style={{
            backgroundColor: '#FEF3C7',
            borderRadius: '12px',
            border: '2px solid #F59E0B',
            borderLeft: '8px solid #D97706',
            padding: isFullscreen ? '1rem 1.4rem' : '0.75rem 1.1rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN KHI CHUYỂN VIỆN
            </div>
            <div style={{ fontSize: diagSize, fontWeight: '900', color: '#78350F', lineHeight: '1.3' }}>
              {cleanDiagnosis}
            </div>
          </div>

          {/* Box Diễn biến chuyển viện */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '2px solid #FDE68A',
            borderLeft: '8px solid #B45309',
            padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.25rem',
            flex: 1,
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.1rem', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaAmbulance /> QUÁ TRÌNH DIỄN BIẾN & XỬ TRÍ CHUYỂN TUYẾN
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
              {tc.progress_notes || tc.progressNotes || '—'}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: HÌNH ẢNH MINH HỌA NẾU CÓ */}
      {caseImages.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isFullscreen ? '0.92rem' : '0.8rem',
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
