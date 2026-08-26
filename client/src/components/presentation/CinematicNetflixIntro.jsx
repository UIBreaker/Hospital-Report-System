import React, { useState, useEffect, useRef } from 'react';
import { FaForward, FaExpand, FaTv, FaHospital, FaHeartbeat, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

// Helper: Format Vietnamese Date
const formatVietnameseDate = (dateStr) => {
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

// Play a prestigious, majestic, and ambient orchestral chime using Web Audio API
const playGentleCinematicChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Deep Majestic Warm Ambient Sub Bass (65.4Hz - C2)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now);
    subOsc.frequency.exponentialRampToValueAtTime(55.0, now + 2.5);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.22, now + 0.5);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 3.0);

    // 2. Pure Warm Sine Pad Harmonics (C3, E3, G3, B3, C4, E4)
    [130.81, 164.81, 196.0, 246.94, 261.63, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07 / (idx + 1), now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.0);
    });

    // 3. Gentle Crystal High Chimes & Arpeggio (523.25Hz, 659.25Hz, 783.99Hz, 1046.5Hz)
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.12 * idx);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.12 * idx);
      chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.12 * idx + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.12 * idx);
      chimeOsc.stop(now + 2.9);
    });

  } catch (err) {}
};

const CinematicNetflixIntro = ({ date = '', onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'bloom' -> 'zoom' -> 'done'
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Request fullscreen immediately upon mounting or user interaction
  const requestFullScreenMode = () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement || document.body;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen().catch(() => {});
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    requestFullScreenMode();
    playGentleCinematicChime();

    // Soft Ambient Dust Particles Canvas (Ethereal & Smooth)
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.55 - 0.2,
        alpha: Math.random() * 0.65 + 0.25,
        color: ['#38BDF8', '#60A5FA', '#FDE047', '#A7F3D0', '#FFFFFF', '#34D399'][Math.floor(Math.random() * 6)]
      }));

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = canvas.height + 10;
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
      };
      render();
    }

    // Cinematic Timeline Progression
    const t1 = setTimeout(() => {
      setPhase('bloom');
      requestFullScreenMode();
    }, 60);

    const t2 = setTimeout(() => {
      setPhase('zoom');
    }, 2400);

    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2950);

    // Keyboard Shortcuts (Space, Enter, Escape, F)
    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape', 'KeyF'].includes(e.code)) {
        requestFullScreenMode();
        if (onComplete) onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = (e) => {
    e.stopPropagation();
    requestFullScreenMode();
    if (onComplete) onComplete();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#040B17',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        perspective: '1200px',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'done' ? 0 : 1
      }}
    >
      <style>{`
        @keyframes softHaloSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes softHaloSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes softShockwave {
          0% {
            transform: scale(0.3);
            opacity: 0.85;
            border-width: 3px;
          }
          100% {
            transform: scale(2.9);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes subtleGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.06); }
        }

        @keyframes ecgIntroFlow {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* 1. Canvas Gentle Dust Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* 2. Deep Royal Navy & Space Vignette Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, #0F2C59 0%, #081B38 45%, #030813 100%)',
        zIndex: 2
      }} />

      {/* 3. Soft Ambient Radial Light Blooms behind Center */}
      <div style={{
        position: 'absolute',
        width: '750px',
        height: '750px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(16, 185, 129, 0.15) 45%, transparent 75%)',
        filter: 'blur(55px)',
        zIndex: 3,
        animation: 'subtleGlowPulse 4s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 4. Elegant Expanding Concentric Wave Rings */}
      {phase !== 'start' && (
        <>
          <div style={{
            position: 'absolute',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.7)',
            boxShadow: '0 0 45px rgba(56, 189, 248, 0.4)',
            animation: 'softShockwave 2.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '2px solid rgba(52, 211, 153, 0.6)',
            boxShadow: '0 0 45px rgba(52, 211, 153, 0.35)',
            animation: 'softShockwave 2.3s 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* 5. Center Hero Logo & Hospital Information (Seamless 3D Scale) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transform: phase === 'zoom' 
          ? 'scale(3.8) translateZ(400px)' 
          : (phase === 'bloom' ? 'scale(1.02)' : 'scale(0.5)'),
        opacity: phase === 'zoom' ? 0 : (phase === 'bloom' ? 1 : 0),
        filter: phase === 'zoom' ? 'blur(16px) brightness(2.2)' : 'blur(0px)',
        transition: phase === 'zoom' 
          ? 'transform 0.55s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease-out, filter 0.5s ease-out' 
          : 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out',
        willChange: 'transform, opacity, filter'
      }}>
        
        {/* Soft Radial Backlight behind Logo */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%)',
          filter: 'blur(35px)',
          zIndex: -1
        }} />

        {/* Elegant Thin Spinning Luminous Rings */}
        <div style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(56, 189, 248, 0.6)',
          animation: 'softHaloSpin 18s linear infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: '245px',
          height: '245px',
          borderRadius: '50%',
          border: '1.5px dotted rgba(52, 211, 153, 0.5)',
          animation: 'softHaloSpinReverse 22s linear infinite',
          zIndex: 0
        }} />

        {/* Circular Emblem with Pure White Glass Shell */}
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '8px',
          boxShadow: '0 0 50px rgba(56, 189, 248, 0.7), 0 0 100px rgba(37, 99, 235, 0.4), 0 0 0 6px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box'
        }}>
          <img
            src="/logo.png"
            alt="Logo TTYT Bình Long"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
              display: 'block'
            }}
          />
        </div>

        {/* Upper Agency Subtitle */}
        <div style={{
          marginTop: '1.8rem',
          fontSize: '0.92rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          opacity: phase !== 'start' ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.2s',
          textShadow: '0 0 15px rgba(56, 189, 248, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaHospital style={{ color: '#38BDF8' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
        </div>

        {/* Main Hospital Name */}
        <h1 style={{
          margin: '0.35rem 0 0 0',
          fontSize: '2.1rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '5px' : '1px',
          transition: 'letter-spacing 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'center',
          textShadow: '0 0 25px rgba(255, 255, 255, 0.6), 0 0 50px rgba(56, 189, 248, 0.4), 0 4px 12px rgba(0,0,0,0.7)',
          lineHeight: 1.25
        }}>
          TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
        </h1>

        {/* Presentation Topic Pill with Luminous Glow */}
        <div style={{
          marginTop: '1.15rem',
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.35), rgba(56, 189, 248, 0.5), rgba(16, 185, 129, 0.35))',
          border: '1.5px solid rgba(56, 189, 248, 0.8)',
          borderRadius: '35px',
          padding: '0.65rem 1.95rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1.02rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backdropFilter: 'blur(10px)'
        }}>
          <FaTv style={{ color: '#FDE047', fontSize: '1.15rem' }} />
          <span>HỘI NGHỊ BÁO CÁO GIAO BAN CHUYÊN MÔN TOÀN VIỆN</span>
          {date && (
            <span style={{ color: '#FDE047', fontWeight: '900' }}>
              • {formatVietnameseDate(date)}
            </span>
          )}
        </div>

        {/* Live Pulse Indicator */}
        <div style={{
          marginTop: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.82rem',
          color: '#34D399',
          fontWeight: '800',
          letterSpacing: '1px'
        }}>
          <FaHeartbeat style={{ color: '#10B981', fontSize: '1rem', animation: 'subtleGlowPulse 1.2s ease-in-out infinite' }} />
          <span>HỆ THỐNG TRÌNH CHIẾU GIAO BAN Y KHOA ĐÃ SẴN SÀNG</span>
        </div>
      </div>

      {/* 6. Skip / Enter Fast Hint Button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2.5rem',
          zIndex: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1.5px solid rgba(255, 255, 255, 0.28)',
          color: '#FFFFFF',
          padding: '0.5rem 1.15rem',
          borderRadius: '25px',
          fontSize: '0.82rem',
          fontWeight: '800',
          letterSpacing: '1px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563EB';
          e.currentTarget.style.borderColor = '#60A5FA';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span>Bỏ qua Intro (Phím Space / Click)</span>
        <FaForward />
      </button>

    </div>
  );
};

export default CinematicNetflixIntro;
