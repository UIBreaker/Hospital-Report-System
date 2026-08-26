import React from 'react';
import {
  FaUserMd,
  FaUserNurse,
  FaClock,
  FaDoorOpen,
  FaHospital,
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaSkullCrossbones,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaFileMedicalAlt,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

// Helper: Format Vietnamese Date
const formatVietnameseFullDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const dateObj = new Date(`${y}-${m}-${d}T00:00:00`);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = isNaN(dateObj.getTime()) ? '' : days[dateObj.getDay()];
    return `${dayName ? dayName + ', ' : ''}ngày ${d.padStart(2, '0')} tháng ${m.padStart(2, '0')} năm ${y}`;
  }
  return dateStr;
};

const DepartmentIntroSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng Chuyên Môn';
  const report = slide.report || {};
  const dateStr = slide.reportDate || report.report_date || '';
  const formattedDateVN = formatVietnameseFullDate(dateStr);

  const doctorName = (slide.doctorName || report.doctor_name || '').trim();
  const nurseName = (slide.nurseName || report.nurse_name || '').trim();
  const room = (slide.room || report.room || '').trim();
  const shiftTime = (slide.shiftTime || report.shift_time || '').trim();

  const safeArray = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const overtimeStaff = safeArray(slide.overtimeStaff || report.overtime_staff).filter(s => s && (s.staffName || s.name));
  const transferCases = safeArray(slide.transferCases || report.transfer_cases);
  const surgeryCases = safeArray(slide.surgeryCases || report.surgery_cases);
  const deathCases = safeArray(slide.deathCases || report.death_cases);
  const criticalCases = safeArray(slide.criticalCases || report.critical_cases);

  const totalClinicalCases = transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length;

  // Collect ONLY existing clinical categories (exclude 0 counts!)
  const activeClinicalBadges = [];
  if (transferCases.length > 0) {
    activeClinicalBadges.push({
      label: 'CA CHUYỂN VIỆN',
      count: transferCases.length,
      icon: <FaAmbulance />,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    });
  }
  if (surgeryCases.length > 0) {
    activeClinicalBadges.push({
      label: 'CA PHẪU THUẬT',
      count: surgeryCases.length,
      icon: <FaProcedures />,
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD'
    });
  }
  if (criticalCases.length > 0) {
    activeClinicalBadges.push({
      label: 'BỆNH NẶNG THEO DÕI',
      count: criticalCases.length,
      icon: <FaHeartbeat />,
      color: '#7C3AED',
      bg: '#FAF5FF',
      border: '#E9D5FF'
    });
  }
  if (deathCases.length > 0) {
    activeClinicalBadges.push({
      label: 'HỒ SƠ TỬ VONG',
      count: deathCases.length,
      icon: <FaSkullCrossbones />,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    });
  }

  const hasOvertime = overtimeStaff.length > 0;

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
      padding: isFullscreen ? '1.8rem 3rem' : '1.2rem 2rem',
      background: 'radial-gradient(circle at 10% 15%, rgba(239, 246, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 50%, #FFFFFF 100%)',
      borderRadius: '0px'
    }}>

      <style>{`
        @keyframes introPopIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ===================== ZONE 1: TOP HEADER & AGENCY TITLE ===================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '0.85rem',
        animation: 'introPopIn 0.35s ease both'
      }}>
        {/* Authority Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
          <div style={{
            width: isFullscreen ? '56px' : '44px',
            height: isFullscreen ? '56px' : '44px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #BAE6FD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div>
            <div style={{
              fontSize: isFullscreen ? '0.82rem' : '0.72rem',
              fontWeight: '800',
              color: '#1D4ED8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <FaHospital style={{ color: '#0284C7' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT KHU VỰC BÌNH LONG
            </div>
            <div style={{
              fontSize: isFullscreen ? '1.05rem' : '0.88rem',
              fontWeight: '900',
              color: '#0F2C59',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              HỘI NGHỊ BÁO CÁO GIAO BAN CHUYÊN MÔN TOÀN VIỆN
            </div>
          </div>
        </div>

        {/* Date Badge */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '12px',
          padding: isFullscreen ? '0.5rem 1.2rem' : '0.4rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)'
        }}>
          <FaCalendarAlt style={{ color: '#2563EB', fontSize: isFullscreen ? '1.2rem' : '1rem' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Ca trực ngày</div>
            <div style={{ fontSize: isFullscreen ? '0.98rem' : '0.82rem', color: '#1E3A8A', fontWeight: '900' }}>{formattedDateVN}</div>
          </div>
        </div>
      </div>

      {/* ===================== ZONE 2: GRAND EXECUTIVE DEPARTMENT HERO BANNER ===================== */}
      <div style={{
        margin: isFullscreen ? '1.2rem 0' : '0.85rem 0',
        padding: isFullscreen ? '1.6rem 2.2rem' : '1.1rem 1.5rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #0F2C59 0%, #1E3A8A 55%, #0284C7 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 15px 40px rgba(15, 44, 89, 0.22)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'introPopIn 0.45s ease both 0.1s'
      }}>
        {/* Shimmer Rainbow Glow Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 50%, #F59E0B 100%)'
        }} />

        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '0.25rem 0.85rem',
            borderRadius: '999px',
            fontSize: isFullscreen ? '0.86rem' : '0.74rem',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '0.45rem',
            color: '#7DD3FC'
          }}>
            <FaStar style={{ color: '#FDE047' }} /> TRÌNH BÀY BÁO CÁO CHUYÊN MÔN
          </div>

          <h1 style={{
            fontSize: isFullscreen ? '3.1rem' : '2.2rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            color: '#FFFFFF'
          }}>
            {deptName}
          </h1>

          <div style={{
            fontSize: isFullscreen ? '1.05rem' : '0.88rem',
            color: '#BAE6FD',
            marginTop: '0.45rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaFileMedicalAlt style={{ color: '#38BDF8' }} />
            <span>Báo cáo hoạt động chuyên môn, các chỉ số thực hiện và diễn biến ca trực</span>
          </div>
        </div>

        {/* Total Cases Big Badge IF > 0 */}
        {totalClinicalCases > 0 && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: isFullscreen ? '1rem 1.6rem' : '0.75rem 1.2rem',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <div style={{ fontSize: isFullscreen ? '0.82rem' : '0.7rem', color: '#93C5FD', fontWeight: '800', textTransform: 'uppercase' }}>
              Ca Bệnh Lâm Sàng
            </div>
            <div style={{
              fontSize: isFullscreen ? '2.4rem' : '1.75rem',
              fontWeight: '900',
              color: '#FDE047',
              lineHeight: 1.1,
              marginTop: '2px'
            }}>
              {totalClinicalCases} CA
            </div>
            <div style={{ fontSize: isFullscreen ? '0.76rem' : '0.66rem', color: '#E2E8F0', fontWeight: '700' }}>
              (Có hồ sơ chi tiết)
            </div>
          </div>
        )}
      </div>

      {/* ===================== ZONE 3: PERSONNEL & CLINICAL SUMMARY ===================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: hasOvertime ? '1.2fr 1fr' : '1fr',
        gap: '1rem',
        margin: isFullscreen ? '0.85rem 0' : '0.55rem 0',
        animation: 'introPopIn 0.5s ease both 0.2s'
      }}>
        
        {/* Main Duty Squad Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '16px',
          padding: isFullscreen ? '1.2rem 1.6rem' : '0.9rem 1.2rem',
          boxShadow: '0 6px 22px rgba(15, 44, 89, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{
            fontSize: isFullscreen ? '0.92rem' : '0.78rem',
            fontWeight: '900',
            color: '#1E40AF',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderBottom: '1.5px solid #EFF6FF',
            paddingBottom: '0.45rem'
          }}>
            <FaUsers style={{ color: '#2563EB' }} /> THÀNH PHẦN NHÂN SỰ TRỰC CA
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: (doctorName && nurseName) ? '1fr 1fr' : '1fr', gap: '0.85rem' }}>
            {/* Doctor */}
            {doctorName ? (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #DBEAFE',
                borderLeft: '5px solid #2563EB',
                borderRadius: '12px',
                padding: isFullscreen ? '0.75rem 1.1rem' : '0.55rem 0.85rem'
              }}>
                <div style={{ fontSize: isFullscreen ? '0.8rem' : '0.7rem', color: '#1E40AF', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaUserMd style={{ color: '#2563EB' }} /> BÁC SĨ TRỰC CA:
                </div>
                <div style={{
                  fontSize: isFullscreen ? '1.25rem' : '1.02rem',
                  fontWeight: '900',
                  color: '#0F2C59',
                  marginTop: '4px',
                  lineHeight: 1.2
                }}>
                  {doctorName}
                </div>
              </div>
            ) : null}

            {/* Nurse */}
            {nurseName ? (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #DCFCE7',
                borderLeft: '5px solid #059669',
                borderRadius: '12px',
                padding: isFullscreen ? '0.75rem 1.1rem' : '0.55rem 0.85rem'
              }}>
                <div style={{ fontSize: isFullscreen ? '0.8rem' : '0.7rem', color: '#065F46', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaUserNurse style={{ color: '#059669' }} /> ĐIỀU DƯỠNG TRỰC:
                </div>
                <div style={{
                  fontSize: isFullscreen ? '1.25rem' : '1.02rem',
                  fontWeight: '900',
                  color: '#064E3B',
                  marginTop: '4px',
                  lineHeight: 1.2
                }}>
                  {nurseName}
                </div>
              </div>
            ) : null}
          </div>

          {/* Room & Shift Chips (Only if present) */}
          {(room || shiftTime) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: isFullscreen ? '0.55rem 1rem' : '0.4rem 0.75rem',
              fontSize: isFullscreen ? '0.9rem' : '0.78rem'
            }}>
              {room && (
                <div style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaDoorOpen style={{ color: '#64748B' }} />
                  <span>Phòng: <strong style={{ color: '#0F2C59' }}>{room}</strong></span>
                </div>
              )}
              {shiftTime && (
                <div style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaClock style={{ color: '#0284C7' }} />
                  <span>Khung giờ: <strong style={{ color: '#0284C7' }}>{shiftTime}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overtime Staff Card (ONLY SHOWN IF THERE ARE OVERTIME STAFF!) */}
        {hasOvertime && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: '16px',
            padding: isFullscreen ? '1.2rem 1.6rem' : '0.9rem 1.2rem',
            boxShadow: '0 6px 22px rgba(15, 44, 89, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: isFullscreen ? '0.92rem' : '0.78rem',
              fontWeight: '900',
              color: '#9A3412',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1.5px solid #FFF7ED',
              paddingBottom: '0.45rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaClock style={{ color: '#EA580C' }} /> NHÂN SỰ TĂNG CƯỜNG / THÊM GIỜ
              </span>
              <span style={{
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                padding: '0.15rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: '800'
              }}>
                {overtimeStaff.length} người
              </span>
            </div>

            <div style={{
              flex: 1,
              marginTop: '0.55rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              overflowY: 'auto'
            }}>
              {overtimeStaff.map((staff, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '10px',
                  padding: isFullscreen ? '0.5rem 0.85rem' : '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: isFullscreen ? '0.92rem' : '0.8rem'
                }}>
                  <span style={{ fontWeight: '800', color: '#7C2D12' }}>
                    {idx + 1}. {staff.staffName || staff.name}
                  </span>
                  <span style={{
                    backgroundColor: '#FFEDD5',
                    color: '#9A3412',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '0.76rem'
                  }}>
                    ⏰ {staff.time || staff.hours || 'Trong ca trực'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ===================== ZONE 4: CLINICAL CASES PILLS (ONLY NON-ZERO CATEGORIES!) ===================== */}
      {activeClinicalBadges.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeClinicalBadges.length}, 1fr)`,
          gap: '0.85rem',
          marginTop: '0.45rem',
          animation: 'introPopIn 0.55s ease both 0.3s'
        }}>
          {activeClinicalBadges.map((badge, idx) => (
            <div key={idx} style={{
              backgroundColor: badge.bg,
              border: `1.5px solid ${badge.border}`,
              borderLeft: `5.5px solid ${badge.color}`,
              borderRadius: '14px',
              padding: isFullscreen ? '0.75rem 1.15rem' : '0.55rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: isFullscreen ? '0.78rem' : '0.68rem', color: badge.color, fontWeight: '900', textTransform: 'uppercase' }}>
                  {badge.label}
                </div>
                <div style={{ fontSize: isFullscreen ? '1.45rem' : '1.15rem', fontWeight: '900', color: badge.color }}>
                  {badge.count} ca
                </div>
              </div>
              <span style={{ color: badge.color, fontSize: isFullscreen ? '1.6rem' : '1.3rem' }}>
                {badge.icon}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Reassurance Pill when no clinical cases exist */
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1.5px solid #BBF7D0',
          borderLeft: '5px solid #10B981',
          borderRadius: '12px',
          padding: isFullscreen ? '0.65rem 1.2rem' : '0.45rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: '#15803D',
          fontSize: isFullscreen ? '0.95rem' : '0.82rem',
          fontWeight: '800',
          marginTop: '0.35rem',
          animation: 'introPopIn 0.55s ease both 0.3s'
        }}>
          <FaCheckCircle style={{ color: '#10B981', fontSize: '1.15rem', flexShrink: 0 }} />
          <span>Ca trực chuyên môn an toàn — Không ghi nhận ca chuyển viện, ca mổ hay ca bệnh nặng đặc biệt.</span>
        </div>
      )}

    </div>
  );
};

export default DepartmentIntroSlide;
