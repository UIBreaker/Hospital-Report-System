import React from 'react';
import { formatDate } from '../../../utils/medicalFormatters';
import { FaHospital, FaUsers, FaCalendarAlt } from 'react-icons/fa';

const TitleSlide = ({ selectedDate, reportsCount = 12, isFullscreen }) => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '20px',
      padding: isFullscreen ? '2.5rem 3rem' : '1.5rem 2rem',
      backgroundColor: '#FFFFFF',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. Top-Right Subtle Dot Grid Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '2rem',
          width: '180px',
          height: '140px',
          backgroundImage: 'radial-gradient(#93C5FD 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />

      {/* 2. Floating Faint Medical Cross '+' Accents */}
      <div style={{ position: 'absolute', top: '15%', left: '8%', fontSize: '1.75rem', fontWeight: '900', color: '#BAE6FD', opacity: 0.6, pointerEvents: 'none', zIndex: 0 }}>+</div>
      <div style={{ position: 'absolute', top: '25%', left: '4%', fontSize: '2.5rem', fontWeight: '900', color: '#E0F2FE', opacity: 0.8, pointerEvents: 'none', zIndex: 0 }}>+</div>
      <div style={{ position: 'absolute', top: '45%', right: '5%', fontSize: '2rem', fontWeight: '900', color: '#BAE6FD', opacity: 0.6, pointerEvents: 'none', zIndex: 0 }}>+</div>

      {/* 3. Bottom Smooth Wave Gradients */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '45%',
          height: '40%',
          background: 'radial-gradient(ellipse at bottom left, rgba(186, 230, 253, 0.45) 0%, rgba(224, 242, 254, 0.2) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '45%',
          height: '40%',
          background: 'radial-gradient(ellipse at bottom right, rgba(186, 230, 253, 0.45) 0%, rgba(224, 242, 254, 0.2) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '900px', width: '100%' }}>
        
        {/* Top Agency Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 1.35rem',
          borderRadius: '999px',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #DBEAFE',
          color: '#1E40AF',
          fontWeight: '800',
          fontSize: isFullscreen ? '1.05rem' : '0.88rem',
          marginBottom: isFullscreen ? '1.75rem' : '1.15rem',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          <span>SỞ Y TẾ BÌNH PHƯỚC • TTYT KHU VỰC BÌNH LONG</span>
        </div>

        {/* Main Presentation Title */}
        <h1 style={{
          fontSize: isFullscreen ? '3.5rem' : '2.65rem',
          fontWeight: '900',
          color: '#0F2C59',
          letterSpacing: '-0.5px',
          lineHeight: '1.15',
          margin: '0 0 0.85rem 0',
          textTransform: 'uppercase'
        }}>
          BÁO CÁO GIAO BAN CHUYÊN MÔN
        </h1>

        {/* Decorative ECG Heartbeat Pulse Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '360px', margin: '0 auto 0.85rem auto' }}>
          <svg viewBox="0 0 300 24" style={{ width: '100%', height: '22px' }} fill="none">
            <path 
              d="M0,12 L110,12 L120,4 L128,20 L136,2 L144,22 L152,8 L160,16 L168,12 L300,12" 
              stroke="#38BDF8" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>

        {/* Date Display */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: isFullscreen ? '1.5rem' : '1.2rem',
          color: '#D97706',
          fontWeight: '800',
          marginBottom: isFullscreen ? '2.5rem' : '1.75rem',
          textTransform: 'capitalize'
        }}>
          <FaCalendarAlt style={{ fontSize: '1.1rem' }} />
          <span>{formatDate(selectedDate)}</span>
        </div>

        {/* 2 Horizontal Summary Cards Matching Image 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))',
          gap: isFullscreen ? '2rem' : '1.25rem',
          width: '100%',
          maxWidth: '680px'
        }}>
          {/* Card 1: Khoa Phòng Báo Cáo */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: isFullscreen ? '1.25rem 1.75rem' : '0.95rem 1.35rem',
            boxShadow: '0 8px 25px rgba(15, 44, 89, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            textAlign: 'left'
          }}>
            <div style={{
              width: isFullscreen ? '60px' : '50px',
              height: isFullscreen ? '60px' : '50px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isFullscreen ? '1.65rem' : '1.35rem',
              flexShrink: 0
            }}>
              <FaHospital />
            </div>
            <div>
              <div style={{ fontSize: isFullscreen ? '0.95rem' : '0.82rem', fontWeight: '700', color: '#64748B' }}>
                Khoa Phòng Báo Cáo
              </div>
              <div style={{ fontSize: isFullscreen ? '2rem' : '1.65rem', fontWeight: '900', color: '#2563EB', lineHeight: '1.2', marginTop: '2px' }}>
                {reportsCount} Khoa
              </div>
            </div>
          </div>

          {/* Card 2: Hội Đồng Giao Ban */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: isFullscreen ? '1.25rem 1.75rem' : '0.95rem 1.35rem',
            boxShadow: '0 8px 25px rgba(15, 44, 89, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            textAlign: 'left'
          }}>
            <div style={{
              width: isFullscreen ? '60px' : '50px',
              height: isFullscreen ? '60px' : '50px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isFullscreen ? '1.65rem' : '1.35rem',
              flexShrink: 0
            }}>
              <FaUsers />
            </div>
            <div>
              <div style={{ fontSize: isFullscreen ? '0.95rem' : '0.82rem', fontWeight: '700', color: '#64748B' }}>
                Hội Đồng Giao Ban
              </div>
              <div style={{ fontSize: isFullscreen ? '2rem' : '1.65rem', fontWeight: '900', color: '#10B981', lineHeight: '1.2', marginTop: '2px' }}>
                Ban Giám Đốc
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TitleSlide;
