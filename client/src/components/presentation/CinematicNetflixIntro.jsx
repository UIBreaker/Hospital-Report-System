import React, { useState, useEffect, useRef } from 'react';
import { FaForward, FaExpand, FaTv } from 'react-icons/fa';

// Helper: Format Vietnamese Date
const formatVietnameseDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const dateObj = new Date(`${y}-${m}-${d}T00:00:00`);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = isNaN(dateObj.getTime()) ? '' : days[dateObj.getDay()];
    return `${dayName ? dayName + ', ' : ''}Ngày ${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

// Play a gentle, soothing, prestigious ambient chime using Web Audio API
const playGentleCinematicChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Soft Warm Ambient Sub Swell (65.4Hz - C2)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now);
    subOsc.frequency.exponentialRampToValueAtTime(55.0, now + 2.2);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.5);

    // 2. Pure Warm Sine Pad Harmonics (C3 = 130.81Hz, E3 = 164.81Hz, G3 = 196.0Hz, C4 = 261.63Hz)
    [130.81, 164.81, 196.0, 261.63, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    });

    // 3. Gentle Crystal High Chime (523.25Hz - C5, 659.25Hz - E5, 1046.5Hz - C6)
    [523.25, 659.25, 1046.5].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.15 * idx);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.15 * idx);
      chimeGain.gain.linearRampToValueAtTime(0.045, now + 0.15 * idx + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.15 * idx);
      chimeOsc.stop(now + 2.4);
    });
  } catch (err) {
    // Gracefully handle browser restrictions
  }
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
    // Auto-request fullscreen
    requestFullScreenMode();

    // Play gentle soothing chime
    playGentleCinematicChime();

    // Soft Ambient Dust Particles Canvas (Ethereal & Smooth)
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = Array.from({ length: 65 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.15,
        alpha: Math.random() * 0.6 + 0.2,
        color: ['#38BDF8', '#60A5FA', '#FDE047', '#A7F3D0', '#FFFFFF'][Math.floor(Math.random() * 5)]
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
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
      };
      render();
    }

    // Smooth Timeline
    const t1 = setTimeout(() => {
      setPhase('bloom');
      requestFullScreenMode();
    }, 60);

    const t2 = setTimeout(() => {
      setPhase('zoom');
    }, 2100);

    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2650);

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
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'done' ? 0 : 1
      }}
    >
      <style>{`
        @keyframes softHaloSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes softShockwave {
          0% {
            transform: scale(0.3);
            opacity: 0.8;
            border-width: 3px;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes subtleGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
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
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 75%)',
        filter: 'blur(50px)',
        zIndex: 3,
        animation: 'subtleGlowPulse 4s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 4. Elegant Expanding Concentric Wave Rings */}
      {phase !== 'start' && (
        <>
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.65)',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.35)',
            animation: 'softShockwave 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '2px solid rgba(245, 158, 11, 0.55)',
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.3)',
            animation: 'softShockwave 2.2s 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
          ? 'scale(3.6) translateZ(350px)' 
          : (phase === 'bloom' ? 'scale(1.02)' : 'scale(0.5)'),
        opacity: phase === 'zoom' ? 0 : (phase === 'bloom' ? 1 : 0),
        filter: phase === 'zoom' ? 'blur(14px) brightness(2.2)' : 'blur(0px)',
        transition: phase === 'zoom' 
          ? 'transform 0.55s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease-out, filter 0.5s ease-out' 
          : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out',
        willChange: 'transform, opacity, filter'
      }}>
        
        {/* Soft Radial Backlight behind Logo */}
        <div style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(37, 99, 235, 0.25) 50%, transparent 75%)',
          filter: 'blur(30px)',
          zIndex: -1
        }} />

        {/* Elegant Thin Spinning Luminous Rings */}
        <div style={{
          position: 'absolute',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(56, 189, 248, 0.5)',
          animation: 'softHaloSpin 18s linear infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: '235px',
          height: '235px',
          borderRadius: '50%',
          border: '1px dotted rgba(245, 158, 11, 0.4)',
          animation: 'softHaloSpin 24s linear infinite reverse',
          zIndex: 0
        }} />

        {/* ========================================================================= */}
        {/* THE FLAWLESS CIRCULAR LOGO EMBLEM (100% Rounded, Zero Square Box Artifact) */}
        {/* ========================================================================= */}
        <div style={{
          width: '155px',
          height: '155px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '8px',
          boxShadow: '0 0 45px rgba(56, 189, 248, 0.65), 0 0 90px rgba(37, 99, 235, 0.35), 0 0 0 6px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden', // Ensures perfectly round clipping
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box'
        }}>
          <img
            src="/logo.png"
            alt="Logo Bệnh Viện Bình Long"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%', // Ensures the image content is round
              display: 'block'
            }}
          />
        </div>

        {/* Upper Agency Subtitle */}
        <div style={{
          marginTop: '1.85rem',
          fontSize: '0.9rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          opacity: phase !== 'start' ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.2s',
          textShadow: '0 0 15px rgba(56, 189, 248, 0.8)'
        }}>
          SỞ Y TẾ BÌNH PHƯỚC
        </div>

        {/* Main Hospital Name with Gentle Letter Expansion */}
        <h1 style={{
          margin: '0.35rem 0 0 0',
          fontSize: '2rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '5.5px' : '1px',
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
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.3), rgba(56, 189, 248, 0.45), rgba(37, 99, 235, 0.3))',
          border: '1.5px solid rgba(56, 189, 248, 0.7)',
          borderRadius: '35px',
          padding: '0.6rem 1.85rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backdropFilter: 'blur(8px)'
        }}>
          <FaTv style={{ color: '#FDE047', fontSize: '1.1rem' }} />
          <span>PHIÊN HỌP GIAO BAN CHUYÊN MÔN TOÀN VIỆN</span>
          {date && (
            <span style={{ color: '#FDE047', fontWeight: '900' }}>
              • {formatVietnameseDate(date)}
            </span>
          )}
        </div>
      </div>

      {/* 6. Bottom Status & Start Button Bar */}
      <div style={{
        position: 'absolute',
        bottom: '2.25rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 3rem',
        zIndex: 20
      }}>
        {/* Fullscreen Notice Pill */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.75)',
          fontSize: '0.82rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '0.45rem 1rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(6px)'
        }}>
          <FaExpand style={{ color: '#38BDF8' }} /> Chế độ toàn màn hình tự động (Nhấn F hoặc Esc để thoát)
        </div>

        {/* Start / Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            color: '#FFFFFF',
            borderRadius: '30px',
            padding: '0.55rem 1.4rem',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
          }}
        >
          <span>Bắt đầu ngay</span> <FaForward style={{ fontSize: '0.82rem' }} />
        </button>
      </div>
    </div>
  );
};

export default CinematicNetflixIntro;
