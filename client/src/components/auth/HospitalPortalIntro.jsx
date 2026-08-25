import React, { useState, useEffect, useRef } from 'react';
import { FaHospital, FaForward, FaShieldAlt, FaFileMedical } from 'react-icons/fa';

// Play a prestigious, ultra-clean harmonic medical portal chime using Web Audio API
const playPortalChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Soft Warm Deep Sub Swell (73.4Hz - D2)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(73.42, now);
    subOsc.frequency.exponentialRampToValueAtTime(65.41, now + 2.0);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.16, now + 0.35);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.4);

    // 2. Pure Sine Harmony Chords (D Major / G Major Ambient Lift: D3, F#3, A3, D4, E4)
    [146.83, 185.0, 220.0, 293.66, 369.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + idx * 0.04 + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 2.4);
    });

    // 3. Gentle Crystal Shimmer (587.33Hz - D5, 739.99Hz - F#5, 1174.66Hz - D6)
    [587.33, 739.99, 1174.66].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.12 * idx);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.12 * idx);
      chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.12 * idx + 0.18);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.12 * idx);
      chimeOsc.stop(now + 2.3);
    });
  } catch (err) {
    // Gracefully handle browser autoplay policy
  }
};

const HospitalPortalIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'bloom' -> 'zoom' -> 'done'
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Play gentle chime
    playPortalChime();

    // Ambient floating medical particles on canvas (Gentle crosses + luminous dots)
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const items = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1.2,
        isCross: Math.random() > 0.65,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.12,
        alpha: Math.random() * 0.5 + 0.2,
        color: ['#38BDF8', '#34D399', '#60A5FA', '#FDE047', '#FFFFFF'][Math.floor(Math.random() * 5)]
      }));

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        items.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = canvas.height + 10;
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;

          if (p.isCross) {
            // Draw tiny medical cross
            const len = p.size * 2;
            const thick = Math.max(1, p.size * 0.6);
            ctx.fillRect(p.x - len / 2, p.y - thick / 2, len, thick);
            ctx.fillRect(p.x - thick / 2, p.y - len / 2, thick, len);
          } else {
            // Draw soft luminous circle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
      };
      render();
    }

    // Timeline Sequence
    const t1 = setTimeout(() => {
      setPhase('bloom');
    }, 60);

    const t2 = setTimeout(() => {
      setPhase('zoom');
    }, 2200);

    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2650);

    // Keyboard Shortcuts (Space, Enter, Escape)
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
      cancelAnimationFrame(animId);
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
        inset: 0,
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
        @keyframes portalHaloSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes medicalShockwave {
          0% {
            transform: scale(0.35);
            opacity: 0.85;
            border-width: 3px;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes subtleAuraPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.06); }
        }
      `}</style>

      {/* 1. Canvas Gentle Medical Dust & Cross Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* 2. Deep Royal Navy & Medical Cyan Vignette Backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, #0F2C59 0%, #092042 45%, #030A14 100%)',
        zIndex: 2
      }} />

      {/* 3. Soft Ambient Radial Light Blooms behind Center */}
      <div style={{
        position: 'absolute',
        width: '750px',
        height: '750px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.22) 35%, rgba(37, 99, 235, 0.1) 60%, transparent 75%)',
        filter: 'blur(55px)',
        zIndex: 3,
        animation: 'subtleAuraPulse 4s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 4. Concentric Luminous Pulse Rings in Emerald & Cyan */}
      {phase !== 'start' && (
        <>
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.75)',
            boxShadow: '0 0 45px rgba(56, 189, 248, 0.4)',
            animation: 'medicalShockwave 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.65)',
            boxShadow: '0 0 45px rgba(16, 185, 129, 0.35)',
            animation: 'medicalShockwave 2.2s 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 4,
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* 5. Center Hero Logo & Full Brand Typography */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transform: phase === 'zoom' 
          ? 'scale(3.4) translateZ(320px)' 
          : (phase === 'bloom' ? 'scale(1.02)' : 'scale(0.55)'),
        opacity: phase === 'zoom' ? 0 : (phase === 'bloom' ? 1 : 0),
        filter: phase === 'zoom' ? 'blur(12px) brightness(2.1)' : 'blur(0px)',
        transition: phase === 'zoom' 
          ? 'transform 0.55s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease-out, filter 0.5s ease-out' 
          : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out',
        willChange: 'transform, opacity, filter',
        textAlign: 'center',
        padding: '0 1.5rem'
      }}>
        
        {/* Soft Radial Backlight behind Logo */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(16, 185, 129, 0.25) 50%, transparent 75%)',
          filter: 'blur(30px)',
          zIndex: -1
        }} />

        {/* Elegant Thin Spinning Luminous Rings */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          width: '190px',
          height: '190px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(56, 189, 248, 0.55)',
          animation: 'portalHaloSpin 20s linear infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '-25px',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          border: '1px dotted rgba(52, 211, 153, 0.45)',
          animation: 'portalHaloSpin 26s linear infinite reverse',
          zIndex: 0
        }} />

        {/* PERFECT ROUND HOSPITAL LOGO EMBLEM */}
        <div style={{
          width: '145px',
          height: '145px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          padding: '8px',
          boxShadow: '0 0 45px rgba(56, 189, 248, 0.6), 0 0 90px rgba(16, 185, 129, 0.3), 0 0 0 5px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box',
          marginBottom: '1.5rem'
        }}>
          <img
            src="/logo.png"
            alt="Logo Bệnh Viện Bình Long"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
              display: 'block'
            }}
          />
        </div>

        {/* LINE 1: SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '4.5px' : '2px',
          transition: 'letter-spacing 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out 0.15s',
          opacity: phase !== 'start' ? 1 : 0,
          textShadow: '0 0 15px rgba(56, 189, 248, 0.8)',
          marginBottom: '0.35rem'
        }}>
          SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
        </div>

        {/* LINE 2: TRUNG TÂM Y TẾ */}
        <h1 style={{
          margin: 0,
          fontSize: '2.4rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '5px' : '1.5px',
          transition: 'letter-spacing 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          textShadow: '0 0 25px rgba(255, 255, 255, 0.6), 0 0 50px rgba(56, 189, 248, 0.4), 0 4px 14px rgba(0,0,0,0.8)',
          lineHeight: 1.2
        }}>
          TRUNG TÂM Y TẾ
        </h1>

        {/* LINE 3: KHU VỰC BÌNH LONG */}
        <h2 style={{
          margin: '0.2rem 0 0 0',
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#38BDF8',
          textTransform: 'uppercase',
          letterSpacing: phase !== 'start' ? '6px' : '2px',
          transition: 'letter-spacing 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          textShadow: '0 0 30px rgba(56, 189, 248, 0.7), 0 4px 14px rgba(0,0,0,0.8)',
          lineHeight: 1.2
        }}>
          KHU VỰC BÌNH LONG
        </h2>

        {/* LINE 4: HỆ THỐNG BÁO CÁO GIAO BAN */}
        <div style={{
          marginTop: '1.25rem',
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.25), rgba(56, 189, 248, 0.45), rgba(16, 185, 129, 0.25))',
          border: '1.5px solid rgba(56, 189, 248, 0.75)',
          borderRadius: '35px',
          padding: '0.65rem 2rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1.1rem',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backdropFilter: 'blur(8px)'
        }}>
          <FaFileMedical style={{ color: '#FDE047', fontSize: '1.2rem' }} />
          <span>Hệ Thống Báo Cáo Giao Ban</span>
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
        {/* Status indicator */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.82rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          padding: '0.45rem 1.1rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(6px)'
        }}>
          <FaShieldAlt style={{ color: '#34D399' }} /> Cổng Thông Tin Báo Cáo Giao Ban Trực Tuyến
        </div>

        {/* Skip / Enter Button */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            borderRadius: '30px',
            padding: '0.55rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
        >
          <span>Đăng nhập ngay</span> <FaForward style={{ fontSize: '0.82rem' }} />
        </button>
      </div>
    </div>
  );
};

export default HospitalPortalIntro;
