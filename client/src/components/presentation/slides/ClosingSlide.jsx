import React from 'react';
import {
  FaHospital,
  FaHeartbeat,
  FaHandHoldingHeart,
  FaShieldAlt,
  FaUserMd,
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaHome,
  FaRedoAlt,
  FaStar
} from 'react-icons/fa';
import { formatDate } from '../../../utils/medicalFormatters';

const ClosingSlide = ({ selectedDate, onRestart, isFullscreen }) => {
  const dateStr = formatDate(selectedDate);

  const pillars = [
    {
      title: 'TẬN TÂM',
      desc: 'Hết lòng vì người bệnh, lấy bệnh nhân làm trung tâm',
      icon: <FaHandHoldingHeart />,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    },
    {
      title: 'CHUYÊN NGHIỆP',
      desc: 'Nâng cao trình độ chuyên môn, chuẩn hóa quy trình y khoa',
      icon: <FaUserMd />,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE'
    },
    {
      title: 'AN TOÀN',
      desc: 'Kiểm soát nhiễm khuẩn & phòng ngừa rủi ro tuyệt đối',
      icon: <FaShieldAlt />,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0'
    },
    {
      title: 'ĐỒNG LÒNG',
      desc: 'Đoàn kết, gắn bó vì sự nghiệp chăm sóc sức khỏe nhân dân',
      icon: <FaUsers />,
      color: '#7C3AED',
      bg: '#FAF5FF',
      border: '#DDD6FE'
    }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: isFullscreen ? '2rem 3rem' : '1.25rem 1.85rem',
      backgroundColor: '#FFFFFF',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
      background: 'radial-gradient(circle at center, rgba(239, 246, 255, 0.65) 0%, #FFFFFF 85%)'
    }}>
      <style>{`
        @keyframes closingPopIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subtleHaloGlow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* 1. Header Agency Banner */}
      <div style={{
        animation: 'closingPopIn 0.35s ease both',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: isFullscreen ? '0.45rem 1.45rem' : '0.35rem 1rem',
          borderRadius: '999px',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #DBEAFE',
          color: '#1E40AF',
          fontWeight: '900',
          fontSize: isFullscreen ? '0.98rem' : '0.82rem',
          marginBottom: '0.65rem',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)'
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          <span>SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT KHU VỰC BÌNH LONG</span>
        </div>

        <h1 style={{
          fontSize: isFullscreen ? '3.2rem' : '2.3rem',
          fontWeight: '900',
          color: '#0F2C59',
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
          margin: 0,
          textTransform: 'uppercase'
        }}>
          BẾ MẠC PHIÊN BÁO CÁO GIAO BAN
        </h1>

        <div style={{
          fontSize: isFullscreen ? '1.45rem' : '1.15rem',
          fontWeight: '900',
          color: '#0284C7',
          marginTop: '0.35rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          CHÂN THÀNH CẢM ƠN QUÝ ĐỒNG NGHIỆP!
        </div>
      </div>

      {/* 2. Center Hospital Logo & Glowing Seal */}
      <div style={{
        animation: 'closingPopIn 0.45s ease both 0.1s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 'auto 0'
      }}>
        <div style={{
          position: 'relative',
          width: isFullscreen ? '130px' : '100px',
          height: isFullscreen ? '130px' : '100px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '10px',
          boxShadow: '0 0 35px rgba(2, 132, 199, 0.35), 0 0 0 6px #EFF6FF, 0 8px 24px rgba(15, 44, 89, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'subtleHaloGlow 3s ease-in-out infinite',
          boxSizing: 'border-box'
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Core Heartfelt Message */}
        <p style={{
          maxWidth: '820px',
          fontSize: isFullscreen ? '1.2rem' : '0.98rem',
          color: '#334155',
          lineHeight: 1.6,
          fontWeight: '600',
          marginTop: '1.2rem',
          marginBottom: 0
        }}>
          Kính chúc Ban Giám Đốc cùng toàn thể Quý Y Bác Sĩ, Điều Dưỡng, Kỹ Thuật Viên và Cán Bộ Nhân Viên Y Tế
          luôn dồi dào sức khỏe, nhiệt huyết và hoàn thành xuất sắc mọi nhiệm vụ cứu chữa người bệnh!
        </p>
      </div>

      {/* 3. 4 Core Values Grid */}
      <div style={{
        animation: 'closingPopIn 0.55s ease both 0.2s',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: isFullscreen ? '1.1rem' : '0.75rem',
        marginBottom: '0.85rem'
      }}>
        {pillars.map((p, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: p.bg,
              border: `1.5px solid ${p.border}`,
              borderTop: `5px solid ${p.color}`,
              borderRadius: '14px',
              padding: isFullscreen ? '1rem 0.95rem' : '0.75rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{
              fontSize: isFullscreen ? '1.5rem' : '1.2rem',
              color: p.color,
              marginBottom: '0.25rem'
            }}>
              {p.icon}
            </div>
            <div style={{
              fontSize: isFullscreen ? '1.12rem' : '0.92rem',
              fontWeight: '900',
              color: p.color,
              letterSpacing: '0.5px'
            }}>
              {p.title}
            </div>
            <div style={{
              fontSize: isFullscreen ? '0.82rem' : '0.7rem',
              color: '#475569',
              fontWeight: '600',
              marginTop: '0.25rem',
              lineHeight: 1.3
            }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Footer */}
      <div style={{
        animation: 'closingPopIn 0.65s ease both 0.3s',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1.5px solid #E2E8F0',
        paddingTop: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: isFullscreen ? '0.92rem' : '0.78rem',
          color: '#64748B',
          fontWeight: '700'
        }}>
          <FaCalendarAlt style={{ color: '#2563EB' }} />
          <span>Phiên giao ban kết thúc • Ngày {dateStr}</span>
        </div>

        {onRestart && (
          <button
            onClick={onRestart}
            style={{
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              color: '#1E40AF',
              padding: isFullscreen ? '0.42rem 1.1rem' : '0.35rem 0.85rem',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: isFullscreen ? '0.88rem' : '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
            }}
          >
            <FaRedoAlt /> Về đầu trang (Slide 1)
          </button>
        )}
      </div>

    </div>
  );
};

export default ClosingSlide;
