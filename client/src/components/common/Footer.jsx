import React from 'react';
import { 
  FaGithub, 
  FaCodeBranch, 
  FaExternalLinkAlt, 
  FaFileExcel, 
  FaFilePdf, 
  FaDatabase, 
  FaCheckCircle,
  FaServer,
  FaShieldAlt
} from 'react-icons/fa';
import { 
  SiReact, 
  SiVite, 
  SiReactrouter, 
  SiNodedotjs, 
  SiExpress, 
  SiMysql, 
  SiCloudinary, 
  SiVercel, 
  SiJsonwebtokens 
} from 'react-icons/si';
import { APP_VERSION_TAG } from '../../config/version';

const TECH_STACK = [
  {
    name: 'React 18',
    role: 'UI Library',
    icon: SiReact,
    color: '#087EA4',
    bg: '#EBF8FF',
    border: '#BAE6FD'
  },
  {
    name: 'Vite 6',
    role: 'Build Tool',
    icon: SiVite,
    color: '#646CFF',
    bg: '#EEF2FF',
    border: '#C7D2FE'
  },
  {
    name: 'React Router 6',
    role: 'SPA Routing',
    icon: SiReactrouter,
    color: '#CA4245',
    bg: '#FEF2F2',
    border: '#FECACA'
  },
  {
    name: 'Node.js',
    role: 'Runtime Engine',
    icon: SiNodedotjs,
    color: '#339933',
    bg: '#F0FDF4',
    border: '#BBF7D0'
  },
  {
    name: 'Express.js',
    role: 'RESTful API',
    icon: SiExpress,
    color: '#1E293B',
    bg: '#F8FAFC',
    border: '#E2E8F0'
  },
  {
    name: 'MySQL 8.4',
    role: 'Relational DB',
    icon: SiMysql,
    color: '#00758F',
    bg: '#F0F9FF',
    border: '#BAE6FD'
  },
  {
    name: 'Aiven Cloud',
    role: 'Managed DB SSL',
    icon: FaDatabase,
    color: '#FF3554',
    bg: '#FFF1F2',
    border: '#FECDD3'
  },
  {
    name: 'Cloudinary',
    role: 'Medical Image CDN',
    icon: SiCloudinary,
    color: '#3448C5',
    bg: '#EEF2FF',
    border: '#C7D2FE'
  },
  {
    name: 'Vercel',
    role: 'Edge Serverless',
    icon: SiVercel,
    color: '#000000',
    bg: '#F8FAFC',
    border: '#E2E8F0'
  },
  {
    name: 'JWT Auth',
    role: 'Security & Token',
    icon: SiJsonwebtokens,
    color: '#D63AFF',
    bg: '#FAF5FF',
    border: '#E9D5FF'
  },
  {
    name: 'ExcelJS',
    role: '3-Sheet Engine',
    icon: FaFileExcel,
    color: '#107C41',
    bg: '#F0FDF4',
    border: '#BBF7D0'
  },
  {
    name: 'html2pdf',
    role: 'A4 Print Engine',
    icon: FaFilePdf,
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA'
  },
  {
    name: 'GitHub',
    role: 'CI/CD & Source',
    icon: FaGithub,
    color: '#24292E',
    bg: '#F8FAFC',
    border: '#E2E8F0'
  }
];

const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '3.5rem',
        padding: '2.5rem 1.5rem 2rem',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        color: '#475569',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          textAlign: 'center'
        }}
      >
        {/* Unit Branding Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <img
              src="/logo.png"
              alt="Logo TTYT Bình Long"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
            <span style={{ fontWeight: '900', color: 'var(--brand-blue)', fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
            Sở Y Tế Thành Phố Đồng Nai • Phòng Kế Hoạch - Nghiệp Vụ • Hệ Thống Báo Cáo Giao Ban Trực
          </p>
        </div>

        {/* Tech Stack Showcase */}
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              fontWeight: '800',
              color: '#0F2C59',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            <span style={{ height: '1px', width: '40px', backgroundColor: '#CBD5E1' }} />
            <span>⚡ Nền Tảng Công Nghệ Vận Hành Hệ Thống</span>
            <span style={{ height: '1px', width: '40px', backgroundColor: '#CBD5E1' }} />
          </div>

          {/* Technology Badges Grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            {TECH_STACK.map((tech) => {
              const IconComponent = tech.icon;
              return (
                <div
                  key={tech.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: tech.bg,
                    border: `1px solid ${tech.border}`,
                    padding: '0.4rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#1E293B',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${tech.border}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                  }}
                  title={`${tech.name} — ${tech.role}`}
                >
                  <IconComponent style={{ fontSize: '1.1rem', color: tech.color, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                    <span style={{ fontWeight: '800', color: '#0F2C59' }}>{tech.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>{tech.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Badges & Author Contacts Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Version Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}
          >
            <FaCodeBranch style={{ color: '#3B82F6' }} /> Phiên bản <strong>{APP_VERSION_TAG}</strong>
          </span>

          {/* GitHub Author Pill */}
          <a
            href="https://github.com/UIBreaker"
            target="_blank"
            rel="noopener noreferrer"
            title="Xem mã nguồn & GitHub của tác giả Nguyễn Vũ Nhật Nam"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.8rem',
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
            <FaGithub style={{ fontSize: '1rem', color: '#1E293B' }} />
            <span>Tác giả: <strong>Nguyễn Vũ Nhật Nam</strong> (UIBreaker)</span>
            <FaExternalLinkAlt style={{ fontSize: '0.65rem', opacity: 0.6 }} />
          </a>

          {/* Zalo Contact Pill */}
          <a
            href="https://zalo.me/0916337266"
            target="_blank"
            rel="noopener noreferrer"
            title="Nhắn tin Zalo hỗ trợ kỹ thuật"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#F0F9FF',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '700',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#E0F2FE';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,132,199,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F9FF';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <span style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: '900', padding: '1px 5px', borderRadius: '4px' }}>Zalo</span>
            <span>Hỗ trợ: <strong>0916.337.266</strong></span>
          </a>

          {/* Cloud SSL Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block', boxShadow: '0 0 6px #16A34A' }} />
            Aiven Cloud MySQL SSL • Vercel Edge
          </span>
        </div>

        {/* Bottom Copyright Line */}
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', width: '100%', maxWidth: '800px' }}>
          &copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai. Phát triển phục vụ công tác Giao ban Bệnh viện.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

