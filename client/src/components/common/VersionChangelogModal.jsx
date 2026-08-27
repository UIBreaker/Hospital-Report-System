import React from 'react';
import { 
  FaTimes, 
  FaRocket, 
  FaTv, 
  FaWpforms, 
  FaRobot, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaStar, 
  FaCodeBranch, 
  FaCalendarAlt, 
  FaUserTie,
  FaHeartbeat,
  FaFilePdf
} from 'react-icons/fa';

const CHANGELOG_SECTIONS = [
  {
    icon: <FaTv style={{ color: '#0284C7' }} />,
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: 'Động Cơ Trình Chiếu Giao Ban 4K Siêu Cấp',
    badge: 'Nổi bật',
    badgeBg: '#0284C7',
    items: [
      'Giao diện tràn viền 100% full-screen, tối ưu hóa hiển thị cho màn hình LED hội trường lớn.',
      'Bổ sung Slide giới thiệu trang trọng mở đầu từng khoa và Slide Bế Mạc Tri Ân ở cuối phiên.',
      'Hiệu ứng số nhảy ngẫu nhiên Slot Machine ở Slide 1 mang phong cách công nghệ cao.',
      'Tự động ẩn triệt để các mục số liệu 0, chỉ hiển thị số liệu thực tế giúp giao ban trực quan, mạch lạc.'
    ]
  },
  {
    icon: <FaWpforms style={{ color: '#059669' }} />,
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: 'Hệ Thống Biểu Mẫu Động Cho 12 Khoa Phòng',
    badge: 'Đột phá',
    badgeBg: '#059669',
    items: [
      'Admin có thể tùy biến thêm/sửa/xóa trường dữ liệu động cho từng khoa lâm sàng và cận lâm sàng.',
      'Hỗ trợ đầy đủ các khối: Hồi Sức Cấp Cứu, Thận Nhân Tạo, Phòng Khám 21, Ca Phẫu Thuật, Ca Chuyển Viện.',
      'Tích hợp tính năng tự sinh dữ liệu mẫu với phím tắt "lorem + Enter" cực nhanh.'
    ]
  },
  {
    icon: <FaRobot style={{ color: '#7C3AED' }} />,
    bg: '#F5F3FF',
    border: '#DDD6FE',
    title: 'Trợ Lý Y Tế AI Hỗ Trợ 24/7',
    badge: 'Thông minh',
    badgeBg: '#7C3AED',
    items: [
      'Hỗ trợ tra cứu nhanh tài khoản & mật khẩu các khoa phòng với nút "Điền Tự Động" 1-click.',
      'Hướng dẫn chi tiết quy trình nhập ca bệnh lâm sàng, ca mổ, ca tử vong và kỹ thuật kiểm thử tự động.'
    ]
  },
  {
    icon: <FaShieldAlt style={{ color: '#D97706' }} />,
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: 'Bảo Mật Y Tế & Xuất Bản Báo Cáo Chuẩn A4',
    badge: 'Chuẩn hóa',
    badgeBg: '#D97706',
    items: [
      'Cơ sở dữ liệu đám mây mã hóa SSL 256-bit an toàn tuyệt đối.',
      'Tính năng Xuất Báo Cáo PDF chuẩn A4 Quốc gia phục vụ lưu trữ hồ sơ bệnh viện theo quy định Bộ Y Tế.'
    ]
  }
];

const VersionChangelogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="version-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(15, 44, 89, 0.35)',
          border: '1.5px solid rgba(186, 230, 253, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.92) translateY(12px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 60%, #059669 100%)',
          padding: '1.2rem 1.5rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#FFFFFF'
            }}>
              <FaRocket />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.3px' }}>
                  NHẬT KÝ PHIÊN BẢN v2.0.0
                </span>
                <span style={{
                  backgroundColor: '#FEF08A',
                  color: '#854D0E',
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                }}>
                  ✨ BẢN MỚI
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#E0F2FE', marginTop: '2px', opacity: 0.95 }}>
                Hệ Thống Báo Cáo Giao Ban Trực Tuyến — TTYT Khu Vực Bình Long
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Info Meta Bar */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: '#475569',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaCalendarAlt style={{ color: '#0284C7' }} />
            <span>Phát hành: <strong>Tháng 08/2026</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaUserTie style={{ color: '#059669' }} />
            <span>Phát triển bởi: <strong style={{ color: '#0F2C59' }}>Nguyễn Vũ Nhật Nam (KHNV)</strong></span>
          </div>
        </div>

        {/* Scrollable Changelog Content */}
        <div style={{
          padding: '1.2rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {CHANGELOG_SECTIONS.map((sec, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: sec.bg,
                border: `1.5px solid ${sec.border}`,
                borderRadius: '16px',
                padding: '1rem 1.15rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ fontSize: '1.1rem' }}>{sec.icon}</div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: '#0F2C59' }}>
                    {sec.title}
                  </h4>
                </div>
                <span style={{
                  backgroundColor: sec.badgeBg,
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '0.12rem 0.55rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  {sec.badge}
                </span>
              </div>

              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.82rem', lineHeight: '1.55' }}>
                {sec.items.map((item, iIdx) => (
                  <li key={iIdx} style={{ marginBottom: iIdx < sec.items.length - 1 ? '0.35rem' : 0 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaCheckCircle style={{ color: '#10B981' }} />
            <span>Hệ thống hoạt động ổn định 24/7</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.35rem',
              background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Đã hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default VersionChangelogModal;
