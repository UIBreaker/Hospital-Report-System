import React from 'react';
import { FaGithub, FaHeart, FaHospital, FaCodeBranch, FaServer, FaShieldAlt, FaExternalLinkAlt, FaUserMd } from 'react-icons/fa';
import { APP_VERSION_TAG, APP_RELEASE_DATE } from '../../config/version';

const Footer = ({ isDark = true }) => {
  return (
    <footer
      style={{
        marginTop: '3.5rem',
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        borderTop: '1px solid #1E293B',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '0.875rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Top Accent Gradient Bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0F2C59 0%, #2563EB 25%, #D97706 50%, #0284C7 75%, #DC2626 100%)' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Column 1: Đơn vị công tác */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="Logo TTYT Bình Long" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
              <div>
                <h4 style={{ color: '#F8FAFC', fontSize: '0.95rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  TTYT KHU VỰC BÌNH LONG
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: '600' }}>Sở Y Tế Tỉnh Bình Phước</span>
              </div>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
              Hệ thống Báo cáo Giao ban Trực tuyến & Quản trị Y tế Thông minh phục vụ 12 Khoa/Phòng chuyên môn và Ban Giám Đốc.
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748B' }}>
              <FaHospital style={{ color: '#38BDF8' }} /> Phòng Kế Hoạch - Nghiệp Vụ (KHNV)
            </div>
          </div>

          {/* Column 2: Tác giả & Kỹ sư phát triển */}
          <div>
            <h4 style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaUserMd style={{ color: '#38BDF8' }} /> Tác Giả Phát Triển
            </h4>
            <div style={{ backgroundColor: '#1E293B', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Nguyễn Vũ Nhật Nam
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                Phòng Kế Hoạch - Nghiệp Vụ • TTYT Bình Long
              </div>

              {/* GitHub Link Button */}
              <a
                href="https://github.com/UIBreaker"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: '1px solid #475569',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.borderColor = '#3B82F6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0F172A';
                  e.currentTarget.style.borderColor = '#475569';
                }}
              >
                <FaGithub style={{ fontSize: '1.05rem' }} />
                <span>github.com/UIBreaker</span>
                <FaExternalLinkAlt style={{ fontSize: '0.65rem', opacity: 0.7 }} />
              </a>
            </div>
          </div>

          {/* Column 3: Thông tin phiên bản & Hạ tầng */}
          <div>
            <h4 style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaShieldAlt style={{ color: '#10B981' }} /> Hệ Thống & Bảo Mật
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCodeBranch style={{ color: '#38BDF8' }} />
                <span>Phiên bản chính thức: <strong style={{ color: '#F8FAFC' }}>{APP_VERSION_TAG}</strong> ({APP_RELEASE_DATE})</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaServer style={{ color: '#10B981' }} />
                <span>Cơ sở dữ liệu: <strong style={{ color: '#10B981' }}>Aiven Cloud MySQL (SSL)</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                <span>Trạng thái: <strong style={{ color: '#10B981' }}>Đang hoạt động ổn định 24/7</strong></span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div style={{
          borderTop: '1px solid #1E293B',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: '#64748B'
        }}>
          <div>
            &copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong>. Tất cả các quyền được bảo lưu.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Phát triển với <FaHeart style={{ color: '#EF4444', fontSize: '0.75rem' }} /> bởi{' '}
            <a
              href="https://github.com/UIBreaker"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: '700' }}
            >
              UIBreaker (Nguyễn Vũ Nhật Nam)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
