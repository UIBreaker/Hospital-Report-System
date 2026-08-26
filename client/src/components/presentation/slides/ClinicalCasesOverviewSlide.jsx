import React from 'react';
import {
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaSkullCrossbones,
  FaClipboardList,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import { formatPatientAge } from '../../../utils/medicalFormatters';

const ClinicalCasesOverviewSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng';
  const transferCases = slide.transferCases || [];
  const surgeryCases = slide.surgeryCases || [];
  const criticalCases = slide.criticalCases || [];
  const deathCases = slide.deathCases || [];

  const totalCount = transferCases.length + surgeryCases.length + criticalCases.length + deathCases.length;

  // Dynamically collect ONLY non-empty categories
  const categories = [];

  if (transferCases.length > 0) {
    categories.push({
      key: 'transfer',
      title: `CA CHUYỂN VIỆN (${transferCases.length} ca)`,
      icon: <FaAmbulance style={{ color: '#D97706' }} />,
      color: '#92400E',
      headerBg: '#FEF3C7',
      bg: '#FFFBEB',
      border: '#FDE68A',
      accent: '#D97706',
      cases: transferCases.map((tc, idx) => ({
        stt: idx + 1,
        name: tc.patient_name || tc.patientName || 'Bệnh nhân',
        age: formatPatientAge(tc.age),
        time: tc.admission_time || tc.admissionTime,
        detailLabel: 'Chẩn đoán / Lý do chuyển',
        detailVal: tc.diagnosis || tc.reason || '—'
      }))
    });
  }

  if (surgeryCases.length > 0) {
    categories.push({
      key: 'surgery',
      title: `CA PHẪU THUẬT / MỔ (${surgeryCases.length} ca)`,
      icon: <FaProcedures style={{ color: '#0284C7' }} />,
      color: '#0369A1',
      headerBg: '#E0F2FE',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      accent: '#0284C7',
      cases: surgeryCases.map((sc, idx) => ({
        stt: idx + 1,
        name: sc.patient_name || sc.patientName || 'Bệnh nhân',
        age: formatPatientAge(sc.birth_year || sc.birthYear || sc.age),
        time: sc.admission_time || sc.admissionTime,
        detailLabel: 'Lệnh mổ / CĐ trước mổ',
        detailVal: sc.consultation_order || sc.consultationOrder || sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'
      }))
    });
  }

  if (criticalCases.length > 0) {
    categories.push({
      key: 'critical',
      title: `BỆNH NHÂN NẶNG THEO DÕI (${criticalCases.length} ca)`,
      icon: <FaHeartbeat style={{ color: '#7C3AED' }} />,
      color: '#6D28D9',
      headerBg: '#F3E8FF',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      accent: '#7C3AED',
      cases: criticalCases.map((cc, idx) => ({
        stt: idx + 1,
        name: cc.patient_name || cc.patientName || 'Bệnh nhân',
        age: formatPatientAge(cc.age),
        time: cc.admission_time || cc.admissionTime,
        detailLabel: 'Chẩn đoán / Diễn biến',
        detailVal: cc.diagnosis || cc.condition_summary || cc.conditionSummary || '—'
      }))
    });
  }

  if (deathCases.length > 0) {
    categories.push({
      key: 'death',
      title: `HỒ SƠ CA TỬ VONG (${deathCases.length} ca)`,
      icon: <FaSkullCrossbones style={{ color: '#DC2626' }} />,
      color: '#991B1B',
      headerBg: '#FEE2E2',
      bg: '#FEF2F2',
      border: '#FECACA',
      accent: '#DC2626',
      cases: deathCases.map((dc, idx) => ({
        stt: idx + 1,
        name: dc.patient_name || dc.patientName || 'Bệnh nhân',
        age: formatPatientAge(dc.age),
        time: dc.admission_time || dc.admissionTime,
        detailLabel: 'Chẩn đoán tử vong',
        detailVal: dc.diagnosis || '—'
      }))
    });
  }

  // Determine grid columns based on number of active categories
  let gridTemplate = '1fr';
  if (categories.length === 2) gridTemplate = '1fr 1fr';
  else if (categories.length === 3) gridTemplate = '1fr 1fr 1fr';
  else if (categories.length === 4) gridTemplate = '1fr 1fr';

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
      padding: isFullscreen ? '1.5rem 2.5rem' : '1.1rem 1.6rem',
      background: '#FFFFFF'
    }}>

      <style>{`
        @keyframes caseOverviewPopIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .category-column-card {
          transition: all 0.2s ease;
        }
        .category-column-card:hover {
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
        paddingBottom: '0.75rem',
        animation: 'caseOverviewPopIn 0.35s ease both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: isFullscreen ? '50px' : '40px',
            height: isFullscreen ? '50px' : '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0F2C59 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isFullscreen ? '1.4rem' : '1.1rem',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
          }}>
            <FaClipboardList />
          </div>
          <div>
            <div style={{
              fontSize: isFullscreen ? '0.82rem' : '0.7rem',
              fontWeight: '800',
              color: '#0284C7',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              {deptName} • DANH MỤC TRỌNG TÂM
            </div>
            <div style={{
              fontSize: isFullscreen ? '1.45rem' : '1.12rem',
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
          borderRadius: '12px',
          padding: isFullscreen ? '0.45rem 1.1rem' : '0.35rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <span style={{ fontSize: isFullscreen ? '0.82rem' : '0.7rem', color: '#1E40AF', fontWeight: '800' }}>
            TỔNG SỐ:
          </span>
          <span style={{ fontSize: isFullscreen ? '1.25rem' : '1rem', color: '#1D4ED8', fontWeight: '900' }}>
            {totalCount} CA BỆNH
          </span>
        </div>
      </div>

      {/* ===================== ZONE 2: DYNAMIC ACTIVE CATEGORIES GRID ===================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: '1rem',
        flex: 1,
        margin: '0.85rem 0',
        minHeight: 0,
        animation: 'caseOverviewPopIn 0.45s ease both 0.1s'
      }}>
        {categories.length > 0 ? (
          categories.map((cat, cIdx) => (
            <div key={cIdx} className="category-column-card" style={{
              backgroundColor: cat.bg,
              border: `1.5px solid ${cat.border}`,
              borderLeft: `6px solid ${cat.accent}`,
              borderRadius: '16px',
              padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1.5px solid ${cat.border}`,
                paddingBottom: '0.5rem',
                marginBottom: '0.65rem'
              }}>
                <span style={{ fontWeight: '900', color: cat.color, fontSize: isFullscreen ? '1rem' : '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {cat.icon} {cat.title}
                </span>
                <span style={{ fontSize: isFullscreen ? '0.78rem' : '0.68rem', color: cat.color, fontWeight: '700' }}>
                  Chi tiết ở slide sau ➔
                </span>
              </div>

              {/* Case Cards List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {cat.cases.map((item, iIdx) => (
                  <div key={iIdx} style={{
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${cat.border}`,
                    borderRadius: '10px',
                    padding: isFullscreen ? '0.6rem 0.85rem' : '0.45rem 0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ color: cat.color, fontSize: isFullscreen ? '0.98rem' : '0.85rem' }}>
                          {item.stt}. {item.name}
                        </strong>{' '}
                        {item.age && (
                          <span style={{ color: '#64748B', fontSize: isFullscreen ? '0.84rem' : '0.74rem', fontWeight: '700' }}>
                            ({item.age})
                          </span>
                        )}
                      </div>
                      {item.time && (
                        <span style={{
                          backgroundColor: cat.headerBg,
                          color: cat.color,
                          fontWeight: '800',
                          fontSize: isFullscreen ? '0.78rem' : '0.68rem',
                          padding: '0.12rem 0.5rem',
                          borderRadius: '6px'
                        }}>
                          ⏰ {item.time}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: isFullscreen ? '0.86rem' : '0.75rem', color: '#1E293B', lineHeight: 1.35, marginTop: '2px' }}>
                      <span style={{ fontWeight: '700', color: '#475569' }}>{item.detailLabel}:</span>{' '}
                      <strong style={{ color: '#0F172A' }}>{item.detailVal}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: '#F0FDF4',
            borderRadius: '16px',
            border: '1.5px dashed #86EFAC',
            color: '#15803D',
            fontSize: '1rem',
            fontWeight: '800'
          }}>
            <FaCheckCircle style={{ fontSize: '2rem', color: '#10B981' }} />
            <span>Không có ca bệnh lâm sàng phát sinh trong ca trực của khoa</span>
          </div>
        )}
      </div>

      {/* ===================== ZONE 3: FOOTER GUIDANCE ===================== */}
      <div style={{
        padding: isFullscreen ? '0.6rem 1.2rem' : '0.45rem 0.9rem',
        backgroundColor: '#F8FAFC',
        border: '1.5px dashed #CBD5E1',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: isFullscreen ? '0.88rem' : '0.75rem',
        color: '#475569',
        fontWeight: '700'
      }}>
        <span>💡 Danh mục {totalCount} ca bệnh lâm sàng trọng điểm cần thảo luận chuyên môn.</span>
        <span style={{ color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '800' }}>
          Nhấn phím ➔ hoặc Space để xem hồ sơ từng ca <FaArrowRight />
        </span>
      </div>

    </div>
  );
};

export default ClinicalCasesOverviewSlide;
