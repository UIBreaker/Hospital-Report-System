import React from 'react';
import {
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaSkullCrossbones,
  FaClipboardList,
  FaUserInjured,
  FaClock,
  FaHospital,
  FaArrowRight
} from 'react-icons/fa';
import { formatPatientAge } from '../../../utils/medicalFormatters';

const ClinicalCasesOverviewSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng';
  const transferCases = slide.transferCases || [];
  const surgeryCases = slide.surgeryCases || [];
  const criticalCases = slide.criticalCases || [];
  const deathCases = slide.deathCases || [];

  const totalCount = transferCases.length + surgeryCases.length + criticalCases.length + deathCases.length;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: isFullscreen ? '1.4rem 2rem' : '1rem 1.4rem',
      background: '#FFFFFF',
      borderRadius: '20px'
    }}>

      <style>{`
        @keyframes caseOverviewPopIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .case-category-box {
          transition: all 0.2s ease;
        }
        .case-category-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 44, 89, 0.08) !important;
        }
      `}</style>

      {/* ===================== ZONE 1: HEADER BAR ===================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '0.65rem',
        animation: 'caseOverviewPopIn 0.4s ease both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: isFullscreen ? '48px' : '38px',
            height: isFullscreen ? '48px' : '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0F2C59 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isFullscreen ? '1.3rem' : '1.05rem',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <FaClipboardList />
          </div>
          <div>
            <div style={{
              fontSize: isFullscreen ? '0.76rem' : '0.66rem',
              fontWeight: '800',
              color: '#0284C7',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              {deptName} • DANH MỤC TRỌNG TÂM
            </div>
            <div style={{
              fontSize: isFullscreen ? '1.35rem' : '1.05rem',
              fontWeight: '900',
              color: '#0F2C59',
              textTransform: 'uppercase',
              letterSpacing: '0.4px'
            }}>
              TỔNG QUAN CÁC CA BỆNH LÂM SÀNG TẠI KHOA
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '10px',
          padding: isFullscreen ? '0.4rem 0.95rem' : '0.3rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: isFullscreen ? '0.78rem' : '0.68rem', color: '#1E40AF', fontWeight: '800' }}>
            TỔNG SỐ:
          </span>
          <span style={{ fontSize: isFullscreen ? '1.15rem' : '0.95rem', color: '#1D4ED8', fontWeight: '900' }}>
            {totalCount} CA BỆNH
          </span>
        </div>
      </div>

      {/* ===================== ZONE 2: FOUR-CATEGORY CLINICAL GRID ===================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem',
        flex: 1,
        margin: '0.65rem 0',
        minHeight: 0,
        animation: 'caseOverviewPopIn 0.5s ease both 0.1s'
      }}>

        {/* Box 1: Ca Chuyển Viện */}
        <div className="case-category-box" style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderLeft: '5.5px solid #D97706',
          borderRadius: '14px',
          padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #FDE68A',
            paddingBottom: '0.4rem',
            marginBottom: '0.45rem'
          }}>
            <span style={{ fontWeight: '900', color: '#92400E', fontSize: isFullscreen ? '0.92rem' : '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaAmbulance style={{ color: '#D97706' }} /> I. CA CHUYỂN VIỆN ({transferCases.length} ca)
            </span>
            <span style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#B45309', fontWeight: '700' }}>
              (Xem chi tiết slide tiếp theo ➔)
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {transferCases.length > 0 ? (
              transferCases.map((tc, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FEF3C7',
                  borderRadius: '8px',
                  padding: '0.4rem 0.65rem',
                  fontSize: isFullscreen ? '0.86rem' : '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#92400E' }}>{idx + 1}. {tc.patient_name || tc.patientName || 'Bệnh nhân'}</strong>{' '}
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({formatPatientAge(tc.age)})</span>
                    <div style={{ color: '#451A03', fontSize: '0.76rem', marginTop: '1px' }}>
                      <strong>CĐ:</strong> {tc.diagnosis || tc.reason || '—'}
                    </div>
                  </div>
                  {(tc.admission_time || tc.admissionTime) && (
                    <span style={{ color: '#B45309', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', backgroundColor: '#FEF3C7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ⏰ {tc.admission_time || tc.admissionTime}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>
                ✓ Không có ca chuyển viện
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Ca Phẫu Thuật */}
        <div className="case-category-box" style={{
          backgroundColor: '#F0F9FF',
          border: '1.5px solid #BAE6FD',
          borderLeft: '5.5px solid #0284C7',
          borderRadius: '14px',
          padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #BAE6FD',
            paddingBottom: '0.4rem',
            marginBottom: '0.45rem'
          }}>
            <span style={{ fontWeight: '900', color: '#0369A1', fontSize: isFullscreen ? '0.92rem' : '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaProcedures style={{ color: '#0284C7' }} /> II. CA PHẪU THUẬT / MỔ ({surgeryCases.length} ca)
            </span>
            <span style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#0284C7', fontWeight: '700' }}>
              (Xem chi tiết slide tiếp theo ➔)
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {surgeryCases.length > 0 ? (
              surgeryCases.map((sc, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0F2FE',
                  borderRadius: '8px',
                  padding: '0.4rem 0.65rem',
                  fontSize: isFullscreen ? '0.86rem' : '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#0369A1' }}>{idx + 1}. {sc.patient_name || sc.patientName || 'Bệnh nhân'}</strong>{' '}
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({formatPatientAge(sc.birth_year || sc.birthYear || sc.age)})</span>
                    <div style={{ color: '#0C4A6E', fontSize: '0.76rem', marginTop: '1px' }}>
                      <strong>Lệnh mổ / CĐ:</strong> {sc.consultation_order || sc.consultationOrder || sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}
                    </div>
                  </div>
                  {(sc.admission_time || sc.admissionTime) && (
                    <span style={{ color: '#0369A1', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', backgroundColor: '#E0F2FE', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ⏰ {sc.admission_time || sc.admissionTime}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>
                ✓ Không có ca phẫu thuật
              </div>
            )}
          </div>
        </div>

        {/* Box 3: Bệnh Nhân Nặng Cần Theo Dõi */}
        <div className="case-category-box" style={{
          backgroundColor: '#FAF5FF',
          border: '1.5px solid #E9D5FF',
          borderLeft: '5.5px solid #7C3AED',
          borderRadius: '14px',
          padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #E9D5FF',
            paddingBottom: '0.4rem',
            marginBottom: '0.45rem'
          }}>
            <span style={{ fontWeight: '900', color: '#6D28D9', fontSize: isFullscreen ? '0.92rem' : '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaHeartbeat style={{ color: '#7C3AED' }} /> III. BỆNH NHÂN NẶNG THEO DÕI ({criticalCases.length} ca)
            </span>
            <span style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#7C3AED', fontWeight: '700' }}>
              (Xem chi tiết slide tiếp theo ➔)
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {criticalCases.length > 0 ? (
              criticalCases.map((cc, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F3E8FF',
                  borderRadius: '8px',
                  padding: '0.4rem 0.65rem',
                  fontSize: isFullscreen ? '0.86rem' : '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#6D28D9' }}>{idx + 1}. {cc.patient_name || cc.patientName || 'Bệnh nhân'}</strong>{' '}
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({formatPatientAge(cc.age)})</span>
                    <div style={{ color: '#4C1D95', fontSize: '0.76rem', marginTop: '1px' }}>
                      <strong>CĐ / Diễn biến:</strong> {cc.diagnosis || cc.condition_summary || cc.conditionSummary || '—'}
                    </div>
                  </div>
                  {(cc.admission_time || cc.admissionTime) && (
                    <span style={{ color: '#6D28D9', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', backgroundColor: '#F3E8FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ⏰ {cc.admission_time || cc.admissionTime}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>
                ✓ Không có bệnh nhân nặng đặc biệt
              </div>
            )}
          </div>
        </div>

        {/* Box 4: Ca Tử Vong */}
        <div className="case-category-box" style={{
          backgroundColor: deathCases.length > 0 ? '#FEF2F2' : '#F8FAFC',
          border: deathCases.length > 0 ? '1.5px solid #FECACA' : '1.5px solid #E2E8F0',
          borderLeft: deathCases.length > 0 ? '5.5px solid #DC2626' : '5.5px solid #94A3B8',
          borderRadius: '14px',
          padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: deathCases.length > 0 ? '1.5px solid #FECACA' : '1.5px solid #E2E8F0',
            paddingBottom: '0.4rem',
            marginBottom: '0.45rem'
          }}>
            <span style={{ fontWeight: '900', color: deathCases.length > 0 ? '#991B1B' : '#64748B', fontSize: isFullscreen ? '0.92rem' : '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaSkullCrossbones style={{ color: deathCases.length > 0 ? '#DC2626' : '#94A3B8' }} /> IV. HỒ SƠ CA TỬ VONG ({deathCases.length} ca)
            </span>
            <span style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: deathCases.length > 0 ? '#DC2626' : '#94A3B8', fontWeight: '700' }}>
              {deathCases.length > 0 ? '(Xem chi tiết slide tiếp theo ➔)' : '(Ca trực an toàn)'}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {deathCases.length > 0 ? (
              deathCases.map((dc, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FEE2E2',
                  borderRadius: '8px',
                  padding: '0.4rem 0.65rem',
                  fontSize: isFullscreen ? '0.86rem' : '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#991B1B' }}>{idx + 1}. {dc.patient_name || dc.patientName || 'Bệnh nhân'}</strong>{' '}
                    <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({formatPatientAge(dc.age)})</span>
                    <div style={{ color: '#7F1D1D', fontSize: '0.76rem', marginTop: '1px' }}>
                      <strong>Chẩn đoán tử vong:</strong> {dc.diagnosis || '—'}
                    </div>
                  </div>
                  {(dc.admission_time || dc.admissionTime) && (
                    <span style={{ color: '#991B1B', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', backgroundColor: '#FEE2E2', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ⏰ {dc.admission_time || dc.admissionTime}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>
                ✓ Không có ca tử vong trong ca trực
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===================== ZONE 3: FOOTER GUIDANCE ===================== */}
      <div style={{
        padding: isFullscreen ? '0.5rem 1rem' : '0.4rem 0.75rem',
        backgroundColor: '#F8FAFC',
        border: '1.5px dashed #CBD5E1',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: isFullscreen ? '0.82rem' : '0.72rem',
        color: '#475569',
        fontWeight: '700'
      }}>
        <span>💡 Danh mục {totalCount} ca bệnh lâm sàng trọng điểm cần thảo luận và báo cáo trong ca trực.</span>
        <span style={{ color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Nhấn phím ➔ hoặc Space để xem hồ sơ từng ca <FaArrowRight />
        </span>
      </div>

    </div>
  );
};

export default ClinicalCasesOverviewSlide;
