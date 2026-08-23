import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaForward } from 'react-icons/fa';

// Helper: Format Vietnamese Date
const formatVietnameseDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `Ngày ${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

// Play a cinematic deep harmonic chord using Web Audio API (zero audio file dependency)
const playCinematicSting = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Deep Sub Bass Impact (55Hz -> 40Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 1.8);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.3);

    // 2. Cinematic Warm Mid Pad (164.8Hz - E3 & 220Hz - A3)
    [164.81, 220.0, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 2.0);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.3);
    });

    // 3. Shimmer High Harmonics (523.25Hz - C5 / 659.25Hz - E5)
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(523.25, now + 0.2);
    shimmerGain.gain.setValueAtTime(0.001, now);
    shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmerOsc.start(now + 0.2);
    shimmerOsc.stop(now + 2.2);
  } catch (err) {
    // Audio autoplay restrictions gracefully handled
  }
};

const CinematicNetflixIntro = ({ date = '', onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'burst' -> 'zoom' -> 'done'
  const containerRef = useRef(null);

  useEffect(() => {
    // Play audio sting
    playCinematicSting();

    // Timeline of Cinematic Animation
    const t1 = setTimeout(() => {
      setPhase('burst');
    }, 100);

    const t2 = setTimeout(() => {
      setPhase('zoom');
    }, 1850);

    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2450);

    // Keyboard shortcut to skip immediately (Space, Enter, Escape)
    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code)) {
        if (onComplete) onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = (e) => {
    e.stopPropagation();
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
        backgroundColor: '#030712',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        perspective: '1200px',
        transition: 'opacity 0.4s ease-out',
        opacity: phase === 'done' ? 0 : 1
      }}
    >
      <style>{`
        @keyframes shockwavePulse {
          0% {
            transform: scale(0.1);
            opacity: 0.9;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }

        @keyframes laserStreak {
          0% {
            transform: scaleX(0.05) rotate(-15deg);
            opacity: 0;
          }
          40% {
            transform: scaleX(1.4) rotate(0deg);
            opacity: 0.9;
          }
          100% {
            transform: scaleX(2.5) rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes haloRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes particleTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        @keyframes textShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* 1. Deep Space Cosmic Ambient Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, #0B2545 0%, #06152B 45%, #02060D 100%)',
        zIndex: 1
      }} />

      {/* 2. Expanding Light Shockwaves (Radiating from Center) */}
      {phase !== 'start' && (
        <>
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.6)',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.4), inset 0 0 30px rgba(56, 189, 248, 0.3)',
            animation: 'shockwavePulse 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
            zIndex: 2,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.35)',
            animation: 'shockwavePulse 1.8s 0.25s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
            zIndex: 2,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '3px solid rgba(245, 158, 11, 0.7)',
            boxShadow: '0 0 60px rgba(245, 158, 11, 0.5)',
            animation: 'shockwavePulse 1.8s 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
            zIndex: 2,
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* 3. Horizontal Anamorphic Optical Laser Flare (Netflix Style) */}
      {phase !== 'start' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '120vw',
          height: '4px',
          marginLeft: '-60vw',
          marginTop: '-2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.8) 30%, #FFFFFF 50%, rgba(239, 68, 68, 0.8) 70%, transparent 100%)',
          boxShadow: '0 0 35px 8px rgba(56, 189, 248, 0.7)',
          animation: 'laserStreak 1.4s ease-out forwards',
          zIndex: 3,
          pointerEvents: 'none'
        }} />
      )}

      {/* 4. Center Logo Container (Scales up then blasts through screen) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transform: phase === 'zoom' 
          ? 'scale(3.6) translateZ(300px)' 
          : (phase === 'burst' ? 'scale(1.05)' : 'scale(0.4)'),
        opacity: phase === 'zoom' ? 0 : (phase === 'burst' ? 1 : 0),
        filter: phase === 'zoom' ? 'blur(12px) brightness(2.5)' : 'blur(0px)',
        transition: phase === 'zoom' 
          ? 'transform 0.55s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.5s ease-out, filter 0.5s ease-out' 
          : 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease-out',
        willChange: 'transform, opacity, filter'
      }}>
        {/* Glowing Aura Behind Logo */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%)',
          filter: 'blur(30px)',
          zIndex: -1
        }} />

        {/* Rotating Cosmic Halo Rings */}
        <div style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '2px dashed rgba(56, 189, 248, 0.5)',
          animation: 'haloRotate 10s linear infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '1.5px dotted rgba(245, 158, 11, 0.4)',
          animation: 'haloRotate 14s linear infinite reverse',
          zIndex: 0
        }} />

        {/* The Hospital Logo */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          boxShadow: '0 0 50px rgba(56, 189, 248, 0.7), 0 0 90px rgba(37, 99, 235, 0.4), 0 0 0 6px rgba(255, 255, 255, 0.95)',
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
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))'
            }}
          />
        </div>

        {/* Agency Subtitle */}
        <div style={{
          marginTop: '1.75rem',
          fontSize: '0.88rem',
          fontWeight: '800',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          opacity: phase === 'burst' ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.2s',
          textShadow: '0 0 15px rgba(56, 189, 248, 0.8)'
        }}>
          SỞ Y TẾ BÌNH PHƯỚC
        </div>

        {/* Main Title with Expanding Letter Spacing */}
        <h1 style={{
          margin: '0.35rem 0 0 0',
          fontSize: '1.85rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: phase === 'burst' ? '6px' : '1px',
          transition: 'letter-spacing 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)',
          textAlign: 'center',
          textShadow: '0 0 25px rgba(255, 255, 255, 0.6), 0 0 45px rgba(56, 189, 248, 0.4)',
          lineHeight: 1.2
        }}>
          TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
        </h1>

        {/* Presentation Topic Pill */}
        <div style={{
          marginTop: '1rem',
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.25), rgba(56, 189, 248, 0.35), rgba(37, 99, 235, 0.25))',
          border: '1.5px solid rgba(56, 189, 248, 0.6)',
          borderRadius: '30px',
          padding: '0.5rem 1.6rem',
          color: '#38BDF8',
          fontWeight: '800',
          fontSize: '0.96rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <span>❖ PHIÊN HỌP GIAO BAN CHUYÊN MÔN TOÀN VIỆN ❖</span>
          {date && (
            <span style={{ color: '#FDE047', fontWeight: '900' }}>
              • {formatVietnameseDate(date)}
            </span>
          )}
        </div>
      </div>

      {/* 5. Skip Button in Top Right */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        right: '2.5rem',
        zIndex: 20
      }}>
        <button
          type="button"
          onClick={handleSkip}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            borderRadius: '25px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          <span>Bỏ qua</span> <FaForward style={{ fontSize: '0.8rem' }} />
        </button>
      </div>
    </div>
  );
};

export default CinematicNetflixIntro;
