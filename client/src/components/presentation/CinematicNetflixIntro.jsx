import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaForward, FaExpand, FaTv } from 'react-icons/fa';

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

// Play a high-end cinematic deep harmonic swell using Web Audio API
const playCinematicSting = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Deep Sub Bass Impact (45Hz -> 32Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(48, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 2.0);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.42, now + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.5);

    // 2. Cinematic Warm Brass/Pad Chord (A2 = 110Hz, C#3 = 138.59Hz, E3 = 164.81Hz, A3 = 220Hz)
    [110.0, 138.59, 164.81, 220.0, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.015, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 2.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    });

    // 3. Shimmer High Glass Harmonics (659.25Hz - E5 & 987.77Hz - B5)
    [659.25, 987.77, 1318.51].forEach((freq) => {
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(freq, now + 0.2);
      shimmerGain.gain.setValueAtTime(0.001, now);
      shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.6);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + 0.2);
      shimmerOsc.stop(now + 2.4);
    });
  } catch (err) {
    // Gracefully handle browser audio restrictions
  }
};

const CinematicNetflixIntro = ({ date = '', onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'burst' -> 'flare' -> 'zoom' -> 'done'
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
    // Attempt fullscreen on mount
    requestFullScreenMode();

    // Play cinematic sound
    playCinematicSting();

    // 3D Canvas Starfield & Medical Particles
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const stars = Array.from({ length: 90 }, () => ({
        x: (Math.random() - 0.5) * canvas.width * 1.5,
        y: (Math.random() - 0.5) * canvas.height * 1.5,
        z: Math.random() * 1000 + 200,
        size: Math.random() * 2.5 + 1,
        color: ['#38BDF8', '#60A5FA', '#FDE047', '#F87171', '#FFFFFF'][Math.floor(Math.random() * 5)]
      }));

      const render = () => {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        stars.forEach((star) => {
          star.z -= 4.5;
          if (star.z <= 0) star.z = 1000;

          const k = 400 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const alpha = Math.min(1, (1000 - star.z) / 400);
            ctx.beginPath();
            ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 12;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        });

        animId = requestAnimationFrame(render);
      };
      render();
    }

    // Animation Timeline
    const t1 = setTimeout(() => {
      setPhase('burst');
      requestFullScreenMode();
    }, 80);

    const t2 = setTimeout(() => {
      setPhase('flare');
    }, 1100);

    const t3 = setTimeout(() => {
      setPhase('zoom');
    }, 2000);

    const t4 = setTimeout(() => {
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
      clearTimeout(t4);
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
        backgroundColor: '#02060D',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        perspective: '1400px',
        transition: 'opacity 0.4s ease-out',
        opacity: phase === 'done' ? 0 : 1
      }}
    >
      <style>{`
        @keyframes godRaySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes opticalShockwave {
          0% {
            transform: scale(0.05);
            opacity: 1;
            border-width: 8px;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: scale(3.8);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes chromaticRibbon1 {
          0% { transform: translateY(-100%) rotate(-35deg) scaleX(0.1); opacity: 0; }
          50% { transform: translateY(0) rotate(-15deg) scaleX(2.5); opacity: 0.85; }
          100% { transform: translateY(100%) rotate(5deg) scaleX(3.5); opacity: 0; }
        }

        @keyframes chromaticRibbon2 {
          0% { transform: translateY(100%) rotate(35deg) scaleX(0.1); opacity: 0; }
          50% { transform: translateY(0) rotate(15deg) scaleX(2.5); opacity: 0.85; }
          100% { transform: translateY(-100%) rotate(-5deg) scaleX(3.5); opacity: 0; }
        }

        @keyframes hudPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.08) rotate(180deg); opacity: 1; }
        }

        @keyframes textShimmer {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }
      `}</style>

      {/* 1. Canvas 3D Starfield Backdrop */}
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

      {/* 2. Deep Blue & Crimson Radial Gradient Vignette */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(15, 44, 89, 0.75) 0%, rgba(6, 18, 38, 0.9) 50%, #02060D 100%)',
        zIndex: 2
      }} />

      {/* 3. Volumetric God-Rays / Light Beams from Center */}
      <div style={{
        position: 'absolute',
        width: '900px',
        height: '900px',
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(56, 189, 248, 0.15) 20deg, transparent 40deg, rgba(239, 68, 68, 0.12) 70deg, transparent 90deg, rgba(245, 158, 11, 0.15) 120deg, transparent 150deg, rgba(56, 189, 248, 0.18) 180deg, transparent 210deg, rgba(16, 185, 129, 0.14) 240deg, transparent 270deg, rgba(245, 158, 11, 0.15) 300deg, transparent 330deg)',
        animation: 'godRaySpin 24s linear infinite',
        zIndex: 3,
        pointerEvents: 'none',
        opacity: phase !== 'start' ? 1 : 0,
        transition: 'opacity 0.8s ease-out'
      }} />

      {/* 4. Optical Shockwaves (Tri-Color Expanding Rings) */}
      {phase !== 'start' && (
        <>
          <div style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: '3px solid rgba(56, 189, 248, 0.85)',
            boxShadow: '0 0 60px rgba(56, 189, 248, 0.6), inset 0 0 40px rgba(56, 189, 248, 0.4)',
            animation: 'opticalShockwave 2s cubic-bezier(0.1, 0.85, 0.25, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: '3px solid rgba(239, 68, 68, 0.75)',
            boxShadow: '0 0 70px rgba(239, 68, 68, 0.5)',
            animation: 'opticalShockwave 2s 0.2s cubic-bezier(0.1, 0.85, 0.25, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: '4px solid rgba(245, 158, 11, 0.85)',
            boxShadow: '0 0 80px rgba(245, 158, 11, 0.6)',
            animation: 'opticalShockwave 2s 0.45s cubic-bezier(0.1, 0.85, 0.25, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* 5. Netflix-Style Chromatic Light Ribbons */}
      {phase === 'flare' && (
        <>
          <div style={{
            position: 'absolute',
            width: '150vw',
            height: '60px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.7) 35%, #FFFFFF 50%, rgba(239, 68, 68, 0.7) 65%, transparent 100%)',
            boxShadow: '0 0 50px 15px rgba(56, 189, 248, 0.8)',
            animation: 'chromaticRibbon1 0.9s ease-out forwards',
            zIndex: 5,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '150vw',
            height: '40px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.7) 35%, #FFFFFF 50%, rgba(16, 185, 129, 0.7) 65%, transparent 100%)',
            boxShadow: '0 0 50px 15px rgba(245, 158, 11, 0.8)',
            animation: 'chromaticRibbon2 0.9s 0.1s ease-out forwards',
            zIndex: 5,
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* 6. Center Hero Presentation (Logo + Glowing Titles) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transform: phase === 'zoom' 
          ? 'scale(4.2) translateZ(450px)' 
          : (phase === 'burst' || phase === 'flare' ? 'scale(1.06)' : 'scale(0.35)'),
        opacity: phase === 'zoom' ? 0 : (phase === 'burst' || phase === 'flare' ? 1 : 0),
        filter: phase === 'zoom' ? 'blur(16px) brightness(3.0)' : 'blur(0px)',
        transition: phase === 'zoom' 
          ? 'transform 0.6s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.55s ease-out, filter 0.55s ease-out' 
          : 'transform 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease-out',
        willChange: 'transform, opacity, filter'
      }}>
        
        {/* Glowing Aura Behind Logo */}
        <div style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(37, 99, 235, 0.35) 45%, transparent 75%)',
          filter: 'blur(35px)',
          zIndex: -1
        }} />

        {/* Futuristic Sci-Fi Medical HUD / Hologram Reticle */}
        <div style={{
          position: 'absolute',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          border: '2px dashed rgba(56, 189, 248, 0.65)',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
          animation: 'hudPulse 12s linear infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: '235px',
          height: '235px',
          borderRadius: '50%',
          border: '1.5px dotted rgba(245, 158, 11, 0.55)',
          animation: 'godRaySpin 16s linear infinite reverse',
          zIndex: 0
        }} />

        {/* The Hospital Logo with 3D Glossy Elevation */}
        <div style={{
          width: '155px',
          height: '155px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '18px',
          boxShadow: '0 0 60px rgba(56, 189, 248, 0.8), 0 0 110px rgba(37, 99, 235, 0.5), 0 0 0 8px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <img
            src="/logo.png"
            alt="Logo Bệnh Viện Bình Long"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.25))'
            }}
          />
        </div>

        {/* Upper Agency Subtitle */}
        <div style={{
          marginTop: '2rem',
          fontSize: '0.95rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          opacity: phase !== 'start' ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.2s',
          textShadow: '0 0 20px rgba(56, 189, 248, 0.9)'
        }}>
          SỞ Y TẾ BÌNH PHƯỚC
        </div>

        {/* Main Hospital Name with Letter Tracking & Gradient Glow */}
        <h1 style={{
          margin: '0.4rem 0 0 0',
          fontSize: '2.1rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '7px' : '1px',
          transition: 'letter-spacing 1.3s cubic-bezier(0.1, 0.85, 0.25, 1)',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.7), 0 0 60px rgba(56, 189, 248, 0.5), 0 4px 12px rgba(0,0,0,0.8)',
          lineHeight: 1.2
        }}>
          TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
        </h1>

        {/* Presentation Topic Pill with Glow & Full-Screen Indicator */}
        <div style={{
          marginTop: '1.25rem',
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.35), rgba(56, 189, 248, 0.5), rgba(37, 99, 235, 0.35))',
          border: '2px solid rgba(56, 189, 248, 0.75)',
          borderRadius: '35px',
          padding: '0.65rem 2rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1.05rem',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <FaTv style={{ color: '#FDE047', fontSize: '1.15rem' }} />
          <span>PHIÊN HỌP GIAO BAN CHUYÊN MÔN TOÀN VIỆN</span>
          {date && (
            <span style={{ color: '#FDE047', fontWeight: '900' }}>
              • {formatVietnameseDate(date)}
            </span>
          )}
        </div>
      </div>

      {/* 7. Bottom Action & Fullscreen Notice Bar */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 3rem',
        zIndex: 20
      }}>
        {/* Fullscreen status notice */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '0.82rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: '0.4rem 0.85rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <FaExpand style={{ color: '#38BDF8' }} /> Chế độ toàn màn hình tự động (Nhấn F hoặc Esc để thoát)
        </div>

        {/* Skip button */}
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
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
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
