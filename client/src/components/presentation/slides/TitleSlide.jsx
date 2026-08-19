import React from 'react';
import { formatDate } from '../../../utils/medicalFormatters';

const TitleSlide = ({ selectedDate, reportsCount = 0, isFullscreen }) => {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
      borderRadius: '20px', padding: isFullscreen ? '2rem' : '1rem'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Hospital Badge / Logo */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
        padding: '0.6rem 1.4rem', borderRadius: '999px',
        backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE',
        color: '#1E40AF', fontWeight: '800',
        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
        marginBottom: isFullscreen ? '2rem' : '1.2rem',
        letterSpacing: '0.5px', textTransform: 'uppercase',
        boxShadow: '0 4px 12px rgba(37,99,235,0.08)',
        zIndex: 1
      }}>
        <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px' }} />
        <span>Sở Y Tế Bình Phước • TTYT Khu Vực Bình Long</span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: isFullscreen ? '3.6rem' : '2.7rem',
        fontWeight: '900', color: '#0F2C59',
        letterSpacing: '-1px', lineHeight: 1.15,
        margin: '0 0 1rem 0', zIndex: 1,
        textTransform: 'uppercase'
      }}>
        BÁO CÁO GIAO BAN CHUYÊN MÔN
      </h1>

      {/* Subtitle / Date */}
      <div style={{
        fontSize: isFullscreen ? '1.8rem' : '1.35rem',
        color: '#D97706', fontWeight: '800',
        marginBottom: isFullscreen ? '2.5rem' : '1.5rem',
        zIndex: 1, textTransform: 'capitalize'
      }}>
        {formatDate(selectedDate)}
      </div>

      {/* Stats pill */}
      <div style={{
        display: 'flex', gap: '1.5rem', justifyContent: 'center',
        zIndex: 1, flexWrap: 'wrap'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF', border: '2px solid #E2E8F0',
          borderRadius: '16px', padding: isFullscreen ? '1rem 2rem' : '0.75rem 1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.88rem', fontWeight: '700', color: '#64748B' }}>Khoa Phòng Báo Cáo</span>
          <span style={{ fontSize: isFullscreen ? '2.2rem' : '1.6rem', fontWeight: '900', color: '#2563EB' }}>{reportsCount} Khoa</span>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF', border: '2px solid #E2E8F0',
          borderRadius: '16px', padding: isFullscreen ? '1rem 2rem' : '0.75rem 1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.88rem', fontWeight: '700', color: '#64748B' }}>Hội Đồng Giao Ban</span>
          <span style={{ fontSize: isFullscreen ? '2.2rem' : '1.6rem', fontWeight: '900', color: '#059669' }}>Ban Giám Đốc</span>
        </div>
      </div>
    </div>
  );
};

export default TitleSlide;
