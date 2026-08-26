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
  FaCalendarCheck,
  FaFileMedicalAlt,
  FaStar,
  FaChevronRight
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

  const doctorName = slide.doctorName || report.doctor_name || '';
  const nurseName = slide.nurseName || report.nurse_name || '';
  const room = slide.room || report.room || '';
  const shiftTime = slide.shiftTime || report.shift_time || 'Ca trực 24/24';

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

  const overtimeStaff = safeArray(slide.overtimeStaff || report.overtime_staff);
  const transferCases = safeArray(slide.transferCases || report.transfer_cases);
  const surgeryCases = safeArray(slide.surgeryCases || report.surgery_cases);
  const deathCases = safeArray(slide.deathCases || report.death_cases);
  const criticalCases = safeArray(slide.criticalCases || report.critical_cases);

  const totalClinicalCases = transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length;

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
      padding: isFullscreen ? '1.5rem 2.2rem' : '1rem 1.4rem',
      background: 'radial-gradient(circle at 10% 15%, rgba(239, 246, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 50%, #FFFFFF 100%)',
      borderRadius: '20px'
    }}>

      <style>{`
        @keyframes introSlidePopIn {
          0% { opacity: 0; transform: scale(0.97) translateY(8px); filter: blur(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        @keyframes introBadgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes introLogoOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .intro-card-hover {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(15, 44, 89, 0.1) !important;
          border-color: #93C5FD !important;
        }
      `}</style>

      {/* Subtle Background Watermark Accents */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-30px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-30px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* ===================== ZONE 1: TOP HEADER & AGENCY TITLE ===================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '0.75rem',
        animation: 'introSlidePopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>
        {/* Left: Authority & Scope */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            position: 'relative',
            width: isFullscreen ? '62px' : '50px',
            height: isFullscreen ? '62px' : '50px',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(2, 132, 199, 0.5)',
              animation: 'introLogoOrbit 14s linear infinite'
            }} />
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)',
              boxSizing: 'border-box'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <div>
            <div style={{
              fontSize: isFullscreen ? '0.78rem' : '0.68rem',
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
              fontSize: isFullscreen ? '0.98rem' : '0.82rem',
              fontWeight: '900',
              color: '#0F2C59',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              HỘI NGHỊ BÁO CÁO GIAO BAN CHUYÊN MÔN TOÀN VIỆN
            </div>
          </div>
        </div>

        {/* Right: Date Badge */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '12px',
          padding: isFullscreen ? '0.45rem 1rem' : '0.35rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
        }}>
          <FaCalendarCheck style={{ color: '#2563EB', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: isFullscreen ? '0.68rem' : '0.6rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Báo cáo ca trực</div>
            <div style={{ fontSize: isFullscreen ? '0.88rem' : '0.75rem', color: '#1E3A8A', fontWeight: '900' }}>{formattedDateVN}</div>
          </div>
        </div>
      </div>

      {/* ===================== ZONE 2: DEPARTMENT HERO BANNER ===================== */}
      <div style={{
        margin: '0.65rem 0',
        padding: isFullscreen ? '1.1rem 1.6rem' : '0.8rem 1.2rem',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #0F2C59 0%, #1E3A8A 60%, #0369A1 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 12px 35px rgba(15, 44, 89, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        position: 'relative',
        overflow: 'hidden',
        animation: 'introSlidePopIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.1s'
      }}>
        {/* Shimmer Light Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 50%, #F59E0B 100%)'
        }} />

        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.2rem 0.75rem',
            borderRadius: '999px',
            fontSize: isFullscreen ? '0.8rem' : '0.7rem',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '0.35rem',
            color: '#7DD3FC'
          }}>
            <FaStar style={{ color: '#FDE047' }} /> TIẾP THEO TRÌNH BÀY BÁO CÁO
          </div>

          <h1 style={{
            fontSize: isFullscreen ? '2.4rem' : '1.75rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 3px 12px rgba(0, 0, 0, 0.4)',
            color: '#FFFFFF'
          }}>
            {deptName}
          </h1>

          <div style={{
            fontSize: isFullscreen ? '0.92rem' : '0.78rem',
            color: '#BAE6FD',
            marginTop: '0.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <FaFileMedicalAlt />
            <span>Tổng hợp hoạt động khám chữa bệnh, chỉ số chuyên môn & các ca bệnh diễn biến ca trực</span>
          </div>
        </div>

        {/* Big Department Status Badge */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1.5px solid rgba(255, 255, 255, 0.28)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <div style={{ fontSize: isFullscreen ? '0.75rem' : '0.65rem', color: '#93C5FD', fontWeight: '800', textTransform: 'uppercase' }}>
            Tổng Ca Bệnh Lâm Sàng
          </div>
          <div style={{
            fontSize: isFullscreen ? '2.1rem' : '1.5rem',
            fontWeight: '900',
            color: '#FDE047',
            lineHeight: 1.1,
            marginTop: '2px'
          }}>
            {totalClinicalCases > 0 ? `${totalClinicalCases} CA` : '0 CA'}
          </div>
          <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#E2E8F0', fontWeight: '600' }}>
            {totalClinicalCases > 0 ? '(Có hồ sơ chi tiết)' : '(Ca trực an toàn)'}
          </div>
        </div>
      </div>

      {/* ===================== ZONE 3: SHIFT PERSONNEL & DUTY SQUAD GRID ===================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '0.85rem',
        margin: '0.4rem 0',
        animation: 'introSlidePopIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both 0.2s'
      }}>
        
        {/* Left Card: Shift Personnel (Bác sĩ, Điều dưỡng, Phòng) */}
        <div className="intro-card-hover" style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '16px',
          padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem',
          boxShadow: '0 6px 20px rgba(15, 44, 89, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.65rem'
        }}>
          <div style={{
            fontSize: isFullscreen ? '0.85rem' : '0.74rem',
            fontWeight: '900',
            color: '#1E40AF',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderBottom: '1.5px solid #EFF6FF',
            paddingBottom: '0.35rem'
          }}>
            <FaUsers style={{ color: '#2563EB' }} /> THÀNH PHẦN NHÂN SỰ ĐIỀU HÀNH CA TRỰC
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {/* Doctor */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderLeft: '4.5px solid #2563EB',
              borderRadius: '10px',
              padding: isFullscreen ? '0.6rem 0.85rem' : '0.45rem 0.65rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '0.74rem' : '0.64rem', color: '#1E40AF', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FaUserMd style={{ color: '#2563EB' }} /> BÁC SĨ TRỰC CA:
              </div>
              <div style={{
                fontSize: isFullscreen ? '1.1rem' : '0.92rem',
                fontWeight: '900',
                color: '#0F2C59',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {doctorName || '— (Chưa ghi nhận)'}
              </div>
            </div>

            {/* Nurse */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderLeft: '4.5px solid #059669',
              borderRadius: '10px',
              padding: isFullscreen ? '0.6rem 0.85rem' : '0.45rem 0.65rem'
            }}>
              <div style={{ fontSize: isFullscreen ? '0.74rem' : '0.64rem', color: '#065F46', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FaUserNurse style={{ color: '#059669' }} /> ĐIỀU DƯỠNG TRỰC:
              </div>
              <div style={{
                fontSize: isFullscreen ? '1.1rem' : '0.92rem',
                fontWeight: '900',
                color: '#064E3B',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {nurseName || '— (Chưa ghi nhận)'}
              </div>
            </div>
          </div>

          {/* Room & Shift Details */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: isFullscreen ? '0.45rem 0.85rem' : '0.35rem 0.65rem',
            fontSize: isFullscreen ? '0.82rem' : '0.72rem'
          }}>
            <div style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaDoorOpen style={{ color: '#64748B' }} />
              <span>Phòng / Khu vực: <strong style={{ color: '#0F2C59' }}>{room || 'Khu Chuyên Môn'}</strong></span>
            </div>
            <div style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaClock style={{ color: '#0284C7' }} />
              <span>Khung giờ: <strong style={{ color: '#0284C7' }}>{shiftTime || 'Ca trực 24/24'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Card: Overtime & Backup Staff */}
        <div className="intro-card-hover" style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px',
          padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem',
          boxShadow: '0 6px 20px rgba(15, 44, 89, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: isFullscreen ? '0.85rem' : '0.74rem',
            fontWeight: '900',
            color: '#9A3412',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #FFF7ED',
            paddingBottom: '0.35rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaClock style={{ color: '#EA580C' }} /> NHÂN SỰ THÊM GIỜ / TĂNG CƯỜNG
            </span>
            <span style={{
              backgroundColor: overtimeStaff.length > 0 ? '#EA580C' : '#94A3B8',
              color: '#FFFFFF',
              padding: '0.12rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '800'
            }}>
              {overtimeStaff.length} người
            </span>
          </div>

          <div style={{
            flex: 1,
            marginTop: '0.45rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            overflowY: 'auto',
            maxHeight: isFullscreen ? '110px' : '85px'
          }}>
            {overtimeStaff.length > 0 ? (
              overtimeStaff.map((staff, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: isFullscreen ? '0.85rem' : '0.74rem'
                }}>
                  <span style={{ fontWeight: '800', color: '#7C2D12' }}>
                    {idx + 1}. {staff.staffName || staff.name || 'Nhân sự tăng cường'}
                  </span>
                  <span style={{
                    backgroundColor: '#FFEDD5',
                    color: '#9A3412',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.72rem'
                  }}>
                    ⏰ {staff.time || staff.hours || 'Trong ca trực'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontStyle: 'italic',
                fontSize: isFullscreen ? '0.85rem' : '0.74rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '0.75rem'
              }}>
                ✓ Không có nhân sự phát sinh thêm giờ ca này
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===================== ZONE 4: CLINICAL CASES MINI SUMMARY PILLS ===================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.65rem',
        marginTop: '0.3rem',
        animation: 'introSlidePopIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both 0.3s'
      }}>
        {/* 1. Transfers */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderLeft: '4.5px solid #D97706',
          borderRadius: '12px',
          padding: isFullscreen ? '0.55rem 0.85rem' : '0.4rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#92400E', fontWeight: '800', textTransform: 'uppercase' }}>
              Ca Chuyển Viện
            </div>
            <div style={{ fontSize: isFullscreen ? '1.2rem' : '0.98rem', fontWeight: '900', color: '#B45309' }}>
              {transferCases.length} ca
            </div>
          </div>
          <FaAmbulance style={{ color: '#D97706', fontSize: isFullscreen ? '1.4rem' : '1.1rem' }} />
        </div>

        {/* 2. Surgeries */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1.5px solid #BAE6FD',
          borderLeft: '4.5px solid #0284C7',
          borderRadius: '12px',
          padding: isFullscreen ? '0.55rem 0.85rem' : '0.4rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#0369A1', fontWeight: '800', textTransform: 'uppercase' }}>
              Ca Phẫu Thuật
            </div>
            <div style={{ fontSize: isFullscreen ? '1.2rem' : '0.98rem', fontWeight: '900', color: '#0284C7' }}>
              {surgeryCases.length} ca
            </div>
          </div>
          <FaProcedures style={{ color: '#0284C7', fontSize: isFullscreen ? '1.4rem' : '1.1rem' }} />
        </div>

        {/* 3. Critical */}
        <div style={{
          backgroundColor: '#FAF5FF',
          border: '1.5px solid #E9D5FF',
          borderLeft: '4.5px solid #7C3AED',
          borderRadius: '12px',
          padding: isFullscreen ? '0.55rem 0.85rem' : '0.4rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: '#6D28D9', fontWeight: '800', textTransform: 'uppercase' }}>
              Bệnh Nặng Theo Dõi
            </div>
            <div style={{ fontSize: isFullscreen ? '1.2rem' : '0.98rem', fontWeight: '900', color: '#7C3AED' }}>
              {criticalCases.length} ca
            </div>
          </div>
          <FaHeartbeat style={{ color: '#7C3AED', fontSize: isFullscreen ? '1.4rem' : '1.1rem' }} />
        </div>

        {/* 4. Mortality */}
        <div style={{
          backgroundColor: deathCases.length > 0 ? '#FEF2F2' : '#F8FAFC',
          border: deathCases.length > 0 ? '1.5px solid #FECACA' : '1.5px solid #E2E8F0',
          borderLeft: deathCases.length > 0 ? '4.5px solid #DC2626' : '4.5px solid #94A3B8',
          borderRadius: '12px',
          padding: isFullscreen ? '0.55rem 0.85rem' : '0.4rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.72rem' : '0.62rem', color: deathCases.length > 0 ? '#991B1B' : '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
              Hồ Sơ Tử Vong
            </div>
            <div style={{ fontSize: isFullscreen ? '1.2rem' : '0.98rem', fontWeight: '900', color: deathCases.length > 0 ? '#DC2626' : '#64748B' }}>
              {deathCases.length} ca
            </div>
          </div>
          <FaSkullCrossbones style={{ color: deathCases.length > 0 ? '#DC2626' : '#94A3B8', fontSize: isFullscreen ? '1.4rem' : '1.1rem' }} />
        </div>

      </div>

    </div>
  );
};

export default DepartmentIntroSlide;
