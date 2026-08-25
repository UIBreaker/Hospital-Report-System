import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHospital, 
  FaSignInAlt, 
  FaShieldAlt, 
  FaFileMedical, 
  FaHeartbeat, 
  FaClock, 
  FaCalendarAlt, 
  FaUserCheck,
  FaSun,
  FaMoon,
  FaCloudSun
} from 'react-icons/fa';

// Play a warm, uplifting, soothing "Welcome Back" sunrise harmonic chord using Web Audio API
const playWelcomeWarmChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Warm Gentle Acoustic Bass Note (G2 = 98Hz)
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    baseOsc.type = 'triangle';
    baseOsc.frequency.setValueAtTime(98.0, now);
    baseOsc.frequency.exponentialRampToValueAtTime(97.0, now + 2.5);

    baseGain.gain.setValueAtTime(0.0001, now);
    baseGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    baseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    baseOsc.connect(baseGain);
    baseGain.connect(ctx.destination);
    baseOsc.start(now);
    baseOsc.stop(now + 3.0);

    // 2. Warm Sunrise Major Harmony Chord (G3, B3, D4, F#4, A4, D5)
    const notes = [196.0, 246.94, 293.66, 369.99, 440.0, 587.33];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.065 / (idx + 1), now + idx * 0.07 + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + 2.8);
    });

    // 3. Gentle Celestial Bell Chime (B5 = 987.77Hz, D6 = 1174.66Hz)
    [987.77, 1174.66].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.35 + idx * 0.15);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.35 + idx * 0.15);
      chimeGain.gain.linearRampToValueAtTime(0.035, now + 0.35 + idx * 0.15 + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.35 + idx * 0.15);
      chimeOsc.stop(now + 2.7);
    });
  } catch (err) {
    // Gracefully handle browser policy
  }
};

const HospitalPortalIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'reveal' -> 'exit' -> 'done'
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [savedUser, setSavedUser] = useState('');
  const canvasRef = useRef(null);

  // Time & Shift Analysis
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    setTimeStr(`${hours}:${mins}:${secs}`);

    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    setDateStr(`${dayName}, ngày ${d}/${m}/${y}`);

    const remembered = localStorage.getItem('saved_hospital_username');
    if (remembered) {
      setSavedUser(remembered);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return { text: 'Chào Buổi Sáng Ca Trực Mới • Chúc Một Ngày Bình An & Thuận Lợi!', icon: <FaSun style={{ color: '#FBBF24' }} /> };
    } else if (hour >= 11 && hour < 14) {
      return { text: 'Chào Buổi Trưa • Chúc Quý Đồng Nghiệp Nhiều Sức Khỏe & Năng Lượng!', icon: <FaCloudSun style={{ color: '#38BDF8' }} /> };
    } else if (hour >= 14 && hour < 18) {
      return { text: 'Chào Buổi Chiều • Tiếp Tục Ca Trực Thuận Lợi & Tận Tâm!', icon: <FaCloudSun style={{ color: '#60A5FA' }} /> };
    } else {
      return { text: 'Chào Ca Trực Đêm • Chúc Quý Bác Sĩ & Điều Dưỡng Bình Yên, Vững Vàng!', icon: <FaMoon style={{ color: '#C084FC' }} /> };
    }
  };

  const greeting = getGreeting();

  useEffect(() => {
    playWelcomeWarmChime();

    // Gentle Floating Golden & Cyan Ambient Sparks (Warm & Welcoming)
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        alpha: Math.random() * 0.6 + 0.2,
        color: ['#FDE047', '#38BDF8', '#34D399', '#93C5FD', '#FFFFFF'][Math.floor(Math.random() * 5)]
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

    // Sequence Timeline
    const t1 = setTimeout(() => setPhase('reveal'), 80);
    const t2 = setTimeout(() => setPhase('exit'), 2700);
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 3100);

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
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#07152B',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'done' ? 0 : 1,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <style>{`
        @keyframes welcomeCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes auroraWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes ecgBeatLine {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes subtleHaloBreathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes shineSweep {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>

      {/* 1. Canvas Ambient Sparks */}
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

      {/* 2. Soft Dynamic Aurora Sunrise Backdrop (Warm Teal & Deep Royal Navy) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 20%, #0F3D7A 0%, #092047 45%, #051021 100%)',
        zIndex: 2
      }} />

      {/* 3. Soft Sunrise Golden & Emerald Glow Blooms */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '650px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(16, 185, 129, 0.2) 40%, transparent 75%)',
        filter: 'blur(60px)',
        zIndex: 3,
        animation: 'subtleHaloBreathe 5s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 4. THE WELCOME SANCTUARY GLASS CARD (TẤM THẺ KÍNH CHÀO ĐÓN HOÀNG GIA) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '820px',
        width: '92%',
        backgroundColor: 'rgba(15, 33, 64, 0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1.5px solid rgba(255, 255, 255, 0.22)',
        borderRadius: '28px',
        padding: '2.4rem 2.8rem',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65), 0 0 50px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transform: phase === 'exit' 
          ? 'scale(1.08) translateY(-25px)' 
          : (phase === 'reveal' ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(30px)'),
        opacity: phase === 'exit' ? 0 : (phase === 'reveal' ? 1 : 0),
        filter: phase === 'exit' ? 'blur(8px)' : 'blur(0px)',
        transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out, filter 0.5s ease-out',
        willChange: 'transform, opacity, filter',
        overflow: 'hidden'
      }}>
        
        {/* Shimmer Light Streak across card */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '60%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
          transform: 'skewX(-25deg)',
          animation: 'shineSweep 4s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        {/* Top Warm Welcome Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          border: '1.5px solid rgba(56, 189, 248, 0.5)',
          borderRadius: '999px',
          padding: '0.45rem 1.35rem',
          fontSize: '0.92rem',
          fontWeight: '800',
          color: '#E0F2FE',
          letterSpacing: '0.5px',
          boxShadow: '0 2px 14px rgba(56, 189, 248, 0.25)',
          marginBottom: '1.4rem'
        }}>
          {greeting.icon}
          <span>{greeting.text}</span>
        </div>

        {/* Logo & Orbital Heartbeat Pulse */}
        <div style={{ position: 'relative', marginBottom: '1.3rem' }}>
          {/* Luminous aura behind logo */}
          <div style={{
            position: 'absolute',
            inset: '-18px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 75%)',
            filter: 'blur(16px)',
            zIndex: 0
          }} />

          {/* Perfect Round Logo Emblem */}
          <div style={{
            width: '125px',
            height: '125px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            padding: '7px',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.6), 0 0 0 5px rgba(255, 255, 255, 0.95), 0 12px 30px rgba(0,0,0,0.4)',
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
        </div>

        {/* Brand Hierarchy */}
        {/* 1. SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI */}
        <div style={{
          fontSize: '0.98rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '3.5px',
          textShadow: '0 0 14px rgba(56, 189, 248, 0.7)',
          marginBottom: '0.3rem'
        }}>
          SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
        </div>

        {/* 2. TRUNG TÂM Y TẾ */}
        <h1 style={{
          margin: 0,
          fontSize: '2.2rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          textShadow: '0 2px 20px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0,0,0,0.8)',
          lineHeight: 1.2
        }}>
          TRUNG TÂM Y TẾ
        </h1>

        {/* 3. KHU VỰC BÌNH LONG */}
        <h2 style={{
          margin: '0.15rem 0 0 0',
          fontSize: '2.4rem',
          fontWeight: '900',
          color: '#38BDF8',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textShadow: '0 0 25px rgba(56, 189, 248, 0.8), 0 4px 14px rgba(0,0,0,0.8)',
          lineHeight: 1.2
        }}>
          KHU VỰC BÌNH LONG
        </h2>

        {/* 4. HỆ THỐNG BÁO CÁO GIAO BAN */}
        <div style={{
          marginTop: '1.1rem',
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(2, 132, 199, 0.45) 50%, rgba(16, 185, 129, 0.3) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.65)',
          borderRadius: '30px',
          padding: '0.55rem 1.8rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1.05rem',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 25px rgba(2, 132, 199, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <FaFileMedical style={{ color: '#FDE047', fontSize: '1.15rem' }} />
          <span>Hệ Thống Báo Cáo Giao Ban</span>
        </div>

        {/* Real-time Shift & Attendance Ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          width: '100%',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '0.86rem',
          fontWeight: '700'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93C5FD' }}>
            <FaCalendarAlt style={{ color: '#38BDF8' }} /> <span>{dateStr || 'Hôm nay'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86EFAC' }}>
            <FaClock style={{ color: '#34D399' }} /> <span>{timeStr || 'Thời gian thực'}</span>
          </div>

          {savedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FDE047' }}>
              <FaUserCheck style={{ color: '#FBBF24' }} /> <span>Chào trở lại: <strong>{savedUser}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#DDD6FE' }}>
              <FaShieldAlt style={{ color: '#A78BFA' }} /> <span>Cổng Đăng Nhập Bảo Mật</span>
            </div>
          )}
        </div>

      </div>

      {/* 5. Bottom Prompt Bar */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20
      }}>
        <button
          type="button"
          onClick={handleSkip}
          style={{
            background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            borderRadius: '999px',
            padding: '0.65rem 2rem',
            fontSize: '0.95rem',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 6px 25px rgba(2, 132, 199, 0.5), 0 0 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(2, 132, 199, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(2, 132, 199, 0.5)';
          }}
        >
          <span>VÀO HỆ THỐNG LÀM VIỆC</span> <FaSignInAlt style={{ fontSize: '0.95rem' }} />
        </button>
      </div>

    </div>
  );
};

export default HospitalPortalIntro;
