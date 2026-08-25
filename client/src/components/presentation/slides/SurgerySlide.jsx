import React from 'react';
import { FaProcedures, FaHospital, FaClock, FaMapMarkerAlt, FaFileMedical, FaUserMd } from 'react-icons/fa';
import { formatPatientAge, normalizeImages } from '../../../utils/medicalFormatters';

const SurgerySlide = ({ slide, isFullscreen }) => {
  const sc = slide.surgeryCase || {};
  const caseImages = normalizeImages(sc.images);
  const ageFormatted = formatPatientAge(sc.birth_year || sc.birthYear || sc.age);

  const contentText = [
    sc.reason, sc.clinical_symptoms, sc.clinicalSymptoms, sc.clinical_tests, sc.clinicalTests,
    sc.preoperative_diagnosis, sc.preoperativeDiagnosis, sc.postoperative_diagnosis, sc.postoperativeDiagnosis,
    sc.consultation_order, sc.consultationOrder, sc.current_status, sc.currentStatus
  ].filter(Boolean).join(' ');

  const cl = contentText.length;
  const bodySize = cl < 200 ? (isFullscreen ? '1.32rem' : '1.15rem')
    : cl < 450 ? (isFullscreen ? '1.2rem' : '1.05rem')
    : (isFullscreen ? '1.08rem' : '0.96rem');

  const diagSize = cl < 200 ? (isFullscreen ? '1.75rem' : '1.5rem')
    : cl < 450 ? (isFullscreen ? '1.55rem' : '1.35rem')
    : (isFullscreen ? '1.4rem' : '1.22rem');

  const lineH = cl < 200 ? '1.65' : cl < 450 ? '1.55' : '1.48';
  const preDiag = (sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');
  const postDiag = (sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—').replace(/^Chẩn đoán:\s*/i, '');

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
      
      {/* ZONE 1: TÊN KHOA PHÒNG TO BẢN & PHÂN LOẠI CA PHẪU THUẬT */}
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
            backgroundColor: '#0284C7',
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

      {/* ZONE 2: THANH THÔNG TIN BỆNH NHÂN (SUB-HEADER BAR) */}
      <div style={{
        backgroundColor: '#E0F2FE',
        border: '2px solid #BAE6FD',
        borderLeft: '8px solid #0284C7',
        borderRadius: '12px',
        padding: isFullscreen ? '0.65rem 1.25rem' : '0.45rem 0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: isFullscreen ? '1.5rem' : '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(2,132,199,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#0369A1' }}>BỆNH NHÂN:</span>
          <span style={{ fontSize: isFullscreen ? '1.65rem' : '1.35rem', fontWeight: '900', color: '#0C4A6E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {sc.patient_name || sc.patientName || 'BỆNH NHÂN PHẪU THUẬT'}
          </span>
        </div>

        {ageFormatted && (
          <span style={{
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            padding: '0.2rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem'
          }}>
            {ageFormatted}
          </span>
        )}

        {sc.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0369A1', fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
            <FaMapMarkerAlt /> <span>{sc.address}</span>
          </div>
        )}

        {(sc.admission_time || sc.admissionTime) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0C4A6E', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem' }}>
            <FaClock style={{ color: '#0284C7' }} /> <span>Giờ vào viện: <strong>{sc.admission_time || sc.admissionTime}</strong></span>
          </div>
        )}
      </div>

      {/* ZONE 3: NỘI DUNG CHUYÊN MÔN (2 COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: isFullscreen ? '0.85rem' : '0.65rem', flex: 1, minHeight: 0 }}>
        {/* Cột 1: Lý do, Triệu chứng lâm sàng & CLS */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '2px solid #E2E8F0',
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
            border: '1.5px solid #BAE6FD',
            borderLeft: '6px solid #0284C7',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaClock /> LÝ DO VÀO VIỆN
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '700' }}>
              {sc.reason || '—'}
            </div>
          </div>

          {/* Box Triệu chứng lâm sàng */}
          {(sc.clinical_symptoms || sc.clinicalSymptoms) && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px solid #BAE6FD',
              borderLeft: '6px solid #0284C7',
              padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                🩺 TRIỆU CHỨNG LÂM SÀNG
              </div>
              <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
                {sc.clinical_symptoms || sc.clinicalSymptoms}
              </div>
            </div>
          )}

          {/* Box Cận lâm sàng */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #BAE6FD',
            borderLeft: '6px solid #0369A1',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
            flex: 1
          }}>
            <div style={{ fontSize: isFullscreen ? '1.15rem' : '1rem', fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              🔬 CẬN LÂM SÀNG & CHẨN ĐOÁN HÌNH ẢNH
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#0F172A', fontWeight: '600' }}>
              {sc.clinical_tests || sc.clinicalTests || '—'}
            </div>
          </div>
        </div>

        {/* Cột 2: Chẩn đoán trước mổ, Lệnh mổ, Sau mổ & Tình trạng hiện tại */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '2px solid #E2E8F0',
          padding: isFullscreen ? '1rem 1.25rem' : '0.8rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '1rem' : '0.75rem',
          overflowY: 'auto'
        }}>
          {/* Box Chẩn đoán trước mổ */}
          <div style={{
            backgroundColor: '#E0F2FE',
            borderRadius: '10px',
            border: '2px solid #38BDF8',
            borderLeft: '7px solid #0284C7',
            padding: isFullscreen ? '0.85rem 1.15rem' : '0.65rem 0.95rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaFileMedical /> CHẨN ĐOÁN TRƯỚC MỔ
            </div>
            <div style={{ fontSize: diagSize, fontWeight: '900', color: '#0C4A6E', lineHeight: '1.3' }}>
              {preDiag}
            </div>
          </div>

          {/* Box Lệnh mổ & Chẩn đoán sau mổ */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #BAE6FD',
            borderLeft: '6px solid #0284C7',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            {(sc.consultation_order || sc.consultationOrder) && (
              <div style={{ marginBottom: '0.55rem' }}>
                <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#0369A1' }}>Lệnh mổ / Phương pháp phẫu thuật:</span>
                <div style={{ fontSize: bodySize, fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                  {sc.consultation_order || sc.consultationOrder}
                </div>
              </div>
            )}
            <div>
              <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '800', color: '#0369A1' }}>Chẩn đoán sau mổ:</span>
              <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.1rem', fontWeight: '900', color: '#0284C7', marginTop: '2px' }}>
                {postDiag}
              </div>
            </div>
          </div>

          {/* Box Tình trạng hiện tại */}
          <div style={{
            backgroundColor: '#ECFDF5',
            borderRadius: '10px',
            border: '1.5px solid #A7F3D0',
            borderLeft: '6px solid #059669',
            padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem'
          }}>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              💚 TÌNH TRẠNG HIỆN TẠI & HẬU PHẪU
            </div>
            <div style={{ fontSize: bodySize, lineHeight: lineH, color: '#065F46', fontWeight: '800' }}>
              {sc.current_status || sc.currentStatus || 'Bệnh tỉnh, tiếp xúc tốt, vết mổ khô'}
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
          fontSize: isFullscreen ? '0.92rem' : '0.8rem',
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
