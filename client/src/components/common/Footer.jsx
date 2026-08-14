import React from 'react';
import { FaGithub, FaHeart, FaCodeBranch, FaExternalLinkAlt, FaHospital, FaCheckCircle } from 'react-icons/fa';
import { APP_VERSION_TAG } from '../../config/version';

const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '1.75rem 1rem 2rem',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: 'transparent',
        color: '#64748B',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '0.85rem'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}
      >
        {/* Top Unit Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.9rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            Trung Tâm Y Tế Khu Vực Bình Long
          </span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ fontWeight: '600', color: '#2563EB', fontSize: '0.85rem' }}>
            Phòng Kế Hoạch - Nghiệp Vụ
          </span>
        </div>

        {/* Middle Badges Row: Version, GitHub Author, Database Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Version Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}
          >
            <FaCodeBranch style={{ color: '#3B82F6' }} /> Phiên bản {APP_VERSION_TAG}
          </span>

          {/* GitHub Author Pill Badge */}
          <a
            href="https://github.com/UIBreaker"
            target="_blank"
            rel="noopener noreferrer"
            title="Xem mã nguồn & GitHub của tác giả Nguyễn Vũ Nhật Nam"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '0.3rem 0.85rem',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: '700',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.color = '#2563EB';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <FaGithub style={{ fontSize: '0.95rem', color: '#1E293B' }} />
            <span>Tác giả: <strong>Nguyễn Vũ Nhật Nam</strong> (UIBreaker)</span>
            <FaExternalLinkAlt style={{ fontSize: '0.65rem', opacity: 0.6 }} />
          </a>

          {/* Cloud Database Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '600'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
            Aiven Cloud MySQL SSL
          </span>
        </div>

        {/* Bottom Copyright Line */}
        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
          &copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Tỉnh Bình Phước. Phát triển cho công tác Báo cáo Giao ban Bệnh viện.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
