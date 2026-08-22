import React from 'react';

/**
 * MedicalLoader - High-end hospital branded loading animation
 * Features:
 * - Glowing pulsing hospital logo with concentric ripples
 * - Animated rotating luminous gradient ring
 * - ECG heartbeat pulse wave
 * - Polished typography with animated loading dots
 */
const MedicalLoader = ({
  text = 'Đang tải dữ liệu báo cáo giao ban...',
  subtext = 'Hệ thống Quản lý Báo cáo Giao ban Trực Toàn Viện',
  fullScreen = false,
  dark = false,
  minHeight = '320px',
  size = 'normal' // 'small' | 'normal' | 'large'
}) => {
  const isLarge = size === 'large' || fullScreen;
  const isSmall = size === 'small';
  const logoSize = isLarge ? 80 : isSmall ? 48 : 64;

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: isLarge ? '2.5rem' : '1.5rem',
      position: 'relative',
      userSelect: 'none'
    }}>
      <style>{`
        @keyframes medicalRipple {
          0% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.35;
          }
          100% {
            transform: scale(1.75);
            opacity: 0;
          }
        }
        @keyframes medicalSpinHalo {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes medicalEcgDash {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes medicalDotPulse {
          0%, 20% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          80%, 100% { opacity: 0.2; transform: translateY(0); }
        }
        @keyframes medicalLogoBreath {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 15px rgba(37, 99, 235, 0.25)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 8px 25px rgba(16, 185, 129, 0.4)); }
        }
      `}</style>

      {/* Center Logo with Animated Concentric Ripples */}
      <div style={{
        position: 'relative',
        width: `${logoSize + 40}px`,
        height: `${logoSize + 40}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isLarge ? '1.5rem' : '1rem'
      }}>
        {/* Ripple Wave 1 */}
        <div style={{
          position: 'absolute',
          width: `${logoSize + 16}px`,
          height: `${logoSize + 16}px`,
          borderRadius: '50%',
          border: '2px solid rgba(56, 189, 248, 0.6)',
          animation: 'medicalRipple 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
          pointerEvents: 'none'
        }} />

        {/* Ripple Wave 2 */}
        <div style={{
          position: 'absolute',
          width: `${logoSize + 16}px`,
          height: `${logoSize + 16}px`,
          borderRadius: '50%',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          animation: 'medicalRipple 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 0.75s',
          pointerEvents: 'none'
        }} />

        {/* Rotating Luminous Halo Gradient Ring */}
        <div style={{
          position: 'absolute',
          width: `${logoSize + 10}px`,
          height: `${logoSize + 10}px`,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #2563EB, #06B6D4, #10B981, #3B82F6, #2563EB)',
          animation: 'medicalSpinHalo 4s linear infinite',
          opacity: 0.85,
          padding: '2.5px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: dark ? '#0F2C59' : '#FFFFFF'
          }} />
        </div>

        {/* Center Circular Logo Badge */}
        <div style={{
          position: 'relative',
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: isLarge ? '10px' : '7px',
          boxShadow: '0 4px 20px rgba(15, 44, 89, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          animation: 'medicalLogoBreath 2.2s ease-in-out infinite'
        }}>
          <img
            src="/logo.png"
            alt="Logo Bệnh Viện"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* Decorative Animated ECG Heartbeat Wave */}
      <div style={{ width: isLarge ? '200px' : '140px', height: '18px', marginBottom: '0.85rem' }}>
        <svg viewBox="0 0 200 20" style={{ width: '100%', height: '100%' }} fill="none">
          <path
            d="M0,10 L70,10 L78,3 L84,17 L90,2 L96,18 L102,6 L108,13 L114,10 L200,10"
            stroke={dark ? '#38BDF8' : '#2563EB'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="200"
            style={{ animation: 'medicalEcgDash 1.8s ease-in-out infinite' }}
          />
        </svg>
      </div>

      {/* Main Agency Name */}
      <div style={{
        fontSize: isLarge ? '0.92rem' : '0.82rem',
        fontWeight: '800',
        color: dark ? '#93C5FD' : '#1E40AF',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '0.25rem'
      }}>
        TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
      </div>

      {/* Dynamic Loading Message with Animated Dots */}
      <div style={{
        fontSize: isLarge ? '1.25rem' : '1rem',
        fontWeight: '800',
        color: dark ? '#FFFFFF' : '#0F2C59',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        marginBottom: subtext ? '0.35rem' : '0'
      }}>
        <span>{text.replace(/\.+$/, '')}</span>
        <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '3px' }}>
          <span style={{ animation: 'medicalDotPulse 1.4s infinite 0s', color: '#2563EB', fontWeight: '900' }}>•</span>
          <span style={{ animation: 'medicalDotPulse 1.4s infinite 0.2s', color: '#06B6D4', fontWeight: '900' }}>•</span>
          <span style={{ animation: 'medicalDotPulse 1.4s infinite 0.4s', color: '#10B981', fontWeight: '900' }}>•</span>
        </span>
      </div>

      {/* Subtext info */}
      {subtext && (
        <div style={{
          fontSize: isLarge ? '0.85rem' : '0.78rem',
          color: dark ? '#94A3B8' : '#64748B',
          fontWeight: '500',
          maxWidth: '400px'
        }}>
          {subtext}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: dark ? '#0A192F' : '#F8FAFC',
        background: dark
          ? 'radial-gradient(circle at 50% 40%, #0F2C59 0%, #0A192F 100%)'
          : 'radial-gradient(circle at 50% 40%, #EFF6FF 0%, #F8FAFC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: dark ? '#0F2C59' : '#FFFFFF',
      borderRadius: '16px',
      border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      boxShadow: '0 2px 10px rgba(15, 44, 89, 0.03)'
    }}>
      {content}
    </div>
  );
};

export default MedicalLoader;
