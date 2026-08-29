import React, { useState } from 'react';
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
  FaMicrophoneAlt,
  FaChartLine,
  FaFilePdf
} from 'react-icons/fa';

const CHANGELOG_SECTIONS = [
  {
    icon: <FaMicrophoneAlt style={{ color: '#D97706' }} />,
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: '🎙️ Giao Ban Tự Động Giọng Đọc AI & Đổi Slide Thông Minh',
    badge: 'Đột phá v2.0',
    badgeBg: '#D97706',
    items: [
      'Trợ lý AI tự động thuyết minh toàn bộ báo cáo và chi tiết từng ca bệnh bằng giọng đọc tiếng Việt truyền cảm, tự nhiên.',
      'Phát âm chuẩn xác 100% các thuật ngữ Y khoa chuyên ngành (ICD-10, CPR, CLS, SpO2, chỉ số sinh hiệu, chẩn đoán xác định...).',
      'Tự động chuyển tiếp slide khi đọc xong từng khoa phòng và từng ca bệnh.',
      'Phím tắt tiện lợi: Phím Space (Tạm dừng/Đọc tiếp), phím R (Đọc lại slide), phím mũi tên chuyển slide linh hoạt.',
      'Tự động ẩn thanh điều khiển sau 2 giây không rê chuột để giữ trọn không gian hội trường sạch sẽ và tập trung.'
    ]
  },
  {
    icon: <FaTv style={{ color: '#0284C7' }} />,
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: '🖥️ Màn Hình Trình Chiếu Giao Ban 4K & Auto-Scale Font',
    badge: 'Đại tu giao diện',
    badgeBg: '#0284C7',
    items: [
      'Tái thiết kế toàn bộ 5 loại slide ca bệnh (Chuyển viện, Phẫu thuật, Tử vong, Bệnh nặng, Ảnh CLS) với thanh thông tin bệnh nhân nằm ngang và lưới chuyên môn to rõ.',
      'Công nghệ Auto-Scale Font tự động co giãn kích thước chữ vừa khít màn hình — không bao giờ bị tràn slide hay mất chữ trên màn hình LED lớn.',
      'Bổ sung Slide giới thiệu trang trọng mở đầu từng khoa và Slide Bế Mạc Tri Ân ở cuối phiên giao ban.',
      'Hiệu ứng số nhảy Slot Machine công nghệ cao ở Slide bìa mang phong cách hiện đại.'
    ]
  },
  {
    icon: <FaChartLine style={{ color: '#7C3AED' }} />,
    bg: '#FAF5FF',
    border: '#DDD6FE',
    title: '📊 Admin Dashboard Mượt Mà & Số Nhảy Shimmer "Bùng Nổ"',
    badge: 'Trải nghiệm đỉnh cao',
    badgeBg: '#7C3AED',
    items: [
      'Hiệu ứng số nhảy gia tốc (CountUp) sống động trên cả 6 phân hệ quản trị (Báo cáo, Biểu đồ phân tích, Lịch sử nộp, Biểu mẫu, Nhân sự, CSDL).',
      'Dải ánh sáng quét Shimmer Skeleton mượt mà khi tải hoặc lọc dữ liệu, loại bỏ cảm giác chờ đợi hay chớp giật.',
      'Nhận diện trực quan tức thì: Khoa Đã Nộp (Xanh ngọc rực rỡ) vs Khoa Chưa Nộp (Đỏ cam cảnh báo kèm viền 7px nổi bật).',
      'Sidebar đóng/mở chuẩn Physics cubic-bezier siêu êm ái, chuyển tab không độ trễ.'
    ]
  },
  {
    icon: <FaWpforms style={{ color: '#059669' }} />,
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: '📝 Hệ Thống Biểu Mẫu Động (Dynamic Form Builder) Cho 12 Khoa',
    badge: 'Linh hoạt',
    badgeBg: '#059669',
    items: [
      'Quản trị viên tự do thêm/sửa/xóa các trường số liệu cho từng khoa phòng trực tiếp trên giao diện mà không cần can thiệp mã nguồn.',
      'Hỗ trợ đầy đủ các khối chuyên khoa: Hồi Sức Cấp Cứu, Thận Nhân Tạo, Phòng Khám 21, Ca Phẫu Thuật, Ca Chuyển Viện.',
      'Tích hợp công cụ tính toán tự động (Tracker Widget) và phím tắt "lorem + Enter" tạo dữ liệu mẫu kiểm thử tức thì.'
    ]
  },
  {
    icon: <FaFilePdf style={{ color: '#DC2626' }} />,
    bg: '#FEF2F2',
    border: '#FECACA',
    title: '📄 Phiếu Báo Cáo Giao Ban Chuẩn A4 Quốc Gia & Tải PDF',
    badge: 'Chuẩn Bộ Y Tế',
    badgeBg: '#DC2626',
    items: [
      'Tạo bản in chuẩn hóa mẫu báo cáo giao ban chuyên môn bệnh viện cho từng khoa và toàn viện theo quy định Bộ Y Tế.',
      'In ấn 1 chạm hoặc tải file PDF chất lượng cao, tự động phân trang và canh lề A4 hoàn hảo.'
    ]
  },
  {
    icon: <FaShieldAlt style={{ color: '#4F46E5' }} />,
    bg: '#EEF2FF',
    border: '#C7D2FE',
    title: '🔒 CSDL Đám Mây Mã Hóa SSL 256-Bit & Trợ Lý AI 24/7',
    badge: 'An toàn bảo mật',
    badgeBg: '#4F46E5',
    items: [
      'Cơ sở dữ liệu đám mây Aiven MySQL mã hóa SSL 256-bit an toàn, bảo vệ dữ liệu bệnh nhân và ca trực 24/7.',
      'Trợ lý AI thông minh sẵn sàng hỗ trợ điền nhanh thông tin đăng nhập các khoa phòng và hướng dẫn sử dụng.'
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '660px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(15, 44, 89, 0.4)',
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
          @keyframes shimmerSweep {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284C7 0%, #0F2C59 60%, #0369A1 100%)',
          padding: '1.2rem 1.6rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              color: '#FEF08A',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <FaRocket />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.3px' }}>
                  NHẬT KÝ PHIÊN BẢN v2.0.0
                </span>
                <span style={{
                  backgroundColor: '#FEF08A',
                  color: '#854D0E',
                  fontSize: '0.7rem',
                  fontWeight: '900',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                }}>
                  ✨ BƯỚC NHẢY VỌT TỪ v1.37.5
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#E0F2FE', marginTop: '2px', opacity: 0.95 }}>
                Hệ Thống Báo Cáo Giao Ban Trực Tuyến — TTYT Khu Vực Bình Long
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease'
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
          padding: '0.65rem 1.6rem',
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
            <span>Phát hành chính thức: <strong>Tháng 08/2026</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaUserTie style={{ color: '#059669' }} />
            <span>Tác giả & Phát triển: <strong style={{ color: '#0F2C59' }}>Nguyễn Vũ Nhật Nam (Phòng KHNV)</strong></span>
          </div>
        </div>

        {/* Scrollable Changelog Content */}
        <div style={{
          padding: '1.2rem 1.6rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Highlight intro card */}
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '1.5px solid #BAE6FD',
            borderRadius: '16px',
            padding: '0.85rem 1.1rem',
            fontSize: '0.82rem',
            color: '#0369A1',
            lineHeight: 1.55,
            fontWeight: '600'
          }}>
            🎉 <strong>Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp!</strong> Toàn bộ hệ thống giao ban đã được nâng cấp toàn diện từ nền tảng <strong>v1.37.5</strong> lên <strong>v2.0.0</strong> với hàng loạt công nghệ tự động hóa AI, giao diện trình chiếu hội trường 4K và bộ công cụ quản trị bùng nổ giúp các ca trực và phiên giao ban diễn ra nhanh gọn, trực quan và chính xác nhất!
          </div>

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
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
                  padding: '0.15rem 0.55rem',
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
          padding: '0.85rem 1.6rem',
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
              padding: '0.55rem 1.45rem',
              background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(2, 132, 199, 0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Đã hiểu & Bắt đầu trải nghiệm ✨
          </button>
        </div>

      </div>
    </div>
  );
};

export default VersionChangelogModal;
