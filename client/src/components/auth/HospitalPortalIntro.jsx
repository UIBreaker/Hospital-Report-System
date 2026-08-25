import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHospital, 
  FaSignInAlt, 
  FaShieldAlt, 
  FaFileMedical, 
  FaClock, 
  FaCalendarAlt, 
  FaUserCheck,
  FaSun,
  FaMoon,
  FaCloudSun
} from 'react-icons/fa';

// Pure Peaceful Zen Meditation & Water Droplet Acoustic Chime (Extremely gentle & serene)
const playSereneWaterChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Gentle Water Drop Sine Tone (F#4 -> D5 Pure Fluid Ripple)
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(370.0, now);
    dropOsc.frequency.exponentialRampToValueAtTime(587.33, now + 0.08);

    dropGain.gain.setValueAtTime(0.0001, now);
    dropGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    dropOsc.connect(dropGain);
    dropGain.connect(ctx.destination);
    dropOsc.start(now);
    dropOsc.stop(now + 1.3);

    // 2. Warm Serene Meditation Ambient Pad (D3 = 146.8Hz, F#3 = 185.0Hz, A3 = 220Hz, D4 = 293.6Hz, F#4 = 370Hz)
    [146.83, 185.0, 220.0, 293.66, 369.99, 440.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.045 / (idx + 1), now + 0.05 + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.05);
      osc.stop(now + 4.0);
    });

    // 3. Gentle Crystal Water Bell Harmonics (A5 = 880Hz, D6 = 1174.6Hz)
    [880.0, 1174.66].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.35 + idx * 0.25);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.35 + idx * 0.25);
      chimeGain.gain.linearRampToValueAtTime(0.025, now + 0.35 + idx * 0.25 + 0.2);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.35 + idx * 0.25);
      chimeOsc.stop(now + 3.7);
    });
  } catch (err) {
    // Gracefully handle browser autoplay restriction
  }
};

const HospitalPortalIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('start');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [savedUser, setSavedUser] = useState('');
  const canvasRef = useRef(null);

  // Time & Shift Analysis
  useEffect(() => {
    const updateTime = () => {
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
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const remembered = localStorage.getItem('saved_hospital_username');
    if (remembered) {
      setSavedUser(remembered);
    }

    return () => clearInterval(interval);
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
    playSereneWaterChime();

    // Serene Flowing Water Waves on 2D Canvas (Gentle, peaceful, organic water ripples)
    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let waveOffset = 0;

      // Soft water droplets & bioluminescent bubbles
      const bubbles = Array.from({ length: 35 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3.5 + 1.2,
        speedY: Math.random() * 0.25 + 0.08,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayDistance: Math.random() * 30 + 10,
        initialX: Math.random() * canvas.width,
        alpha: Math.random() * 0.45 + 0.15,
        color: ['#38BDF8', '#5EEAD4', '#93C5FD', '#A7F3D0', '#FFFFFF'][Math.floor(Math.random() * 5)]
      }));

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waveOffset += 0.012;

        // Draw 3 layers of soft organic water flow waves at bottom/middle
        const drawWave = (baseY, amplitude, frequency, speed, color, alpha) => {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          ctx.lineTo(0, baseY);

          for (let x = 0; x <= canvas.width; x += 15) {
            const y = baseY + Math.sin(x * frequency + waveOffset * speed) * amplitude + Math.cos(x * frequency * 0.6 + waveOffset * 0.8) * (amplitude * 0.5);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        };

        // Deep serene aquatic wave layers
        drawWave(canvas.height * 0.72, 35, 0.003, 1.2, '#0C3259', 0.25);
        drawWave(canvas.height * 0.78, 25, 0.004, 0.9, '#0E4473', 0.2);
        drawWave(canvas.height * 0.84, 18, 0.005, 1.5, '#0D548C', 0.15);

        // Draw gentle floating bioluminescent water bubbles
        bubbles.forEach((b, i) => {
          b.y -= b.speedY;
          b.x = b.initialX + Math.sin(waveOffset + i) * b.swayDistance;

          if (b.y < -20) {
            b.y = canvas.height + 20;
            b.initialX = Math.random() * canvas.width;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.globalAlpha = b.alpha * (0.8 + 0.2 * Math.sin(waveOffset * 2 + i));
          ctx.shadowBlur = 12;
          ctx.shadowColor = b.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
      };
      render();
    }

    // Peaceful Flow Sequence
    const t1 = setTimeout(() => setPhase('flow_in'), 80);
    const t2 = setTimeout(() => setPhase('flowing'), 1200);
    const t3 = setTimeout(() => {
      handleSmoothExit();
    }, 5000);

    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code)) {
        handleSmoothExit();
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
  }, []);

  const [isExiting, setIsExiting] = useState(false);
  const exitingRef = useRef(false);

  const handleSmoothExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);
    setPhase('fade_out');

    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 600);
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    handleSmoothExit();
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#041224',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), filter 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
        filter: isExiting ? 'blur(10px)' : 'blur(0px)',
        pointerEvents: isExiting ? 'none' : 'auto',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <style>{`
        @keyframes waterRippleExpand {
          0% {
            transform: scale(0.65);
            opacity: 0.8;
            border-width: 2px;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes waterShimmerFluid {
          0% { transform: translate(-100%, -100%) rotate(45deg); }
          100% { transform: translate(200%, 200%) rotate(45deg); }
        }

        @keyframes sereneBreathingAura {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }

        @keyframes waterCaressGlow {
          0%, 100% { box-shadow: 0 0 35px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.45); }
          50% { box-shadow: 0 0 60px rgba(45, 212, 191, 0.35), inset 0 1px 4px rgba(255, 255, 255, 0.65); }
        }

        @keyframes fluidItemRise {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>

      {/* 1. Canvas Fluid Water Caustics & Bioluminescent Bubbles */}
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

      {/* 2. Deep Peaceful Ocean-Navy Ambient Radial Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 35%, #0A2E52 0%, #061F3A 40%, #031020 100%)',
        zIndex: 2
      }} />

      {/* 3. Soft Serene Water Light Pool behind Sanctuary */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '720px',
        height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.2) 0%, rgba(56, 189, 248, 0.18) 40%, transparent 75%)',
        filter: 'blur(70px)',
        zIndex: 3,
        animation: 'sereneBreathingAura 6s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 4. Expanding Gentle Water Ripple Rings */}
      {phase !== 'start' && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '1.5px solid rgba(45, 212, 191, 0.55)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)',
          animation: 'waterRippleExpand 3.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          zIndex: 4,
          pointerEvents: 'none'
        }} />
      )}

      {/* 5. THE SERENE WATER SANCTUARY CARD (THẺ KÍNH NƯỚC TĨNH LẶNG & YÊN BÌNH) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '820px',
        width: '92%',
        backgroundColor: 'rgba(8, 28, 54, 0.72)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1.5px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '30px',
        padding: '2.4rem 2.8rem',
        animation: 'waterCaressGlow 5s ease-in-out infinite',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), 0 0 45px rgba(56, 189, 248, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transform: phase === 'flow_in' || phase === 'flowing' 
          ? 'scale(1) translateY(0)' 
          : 'scale(0.95) translateY(20px)',
        opacity: phase === 'start' ? 0 : 1,
        transition: 'transform 1.1s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-out',
        willChange: 'transform, opacity',
        overflow: 'hidden'
      }}>
        
        {/* Soft Organic Fluid Shimmer Streak */}
        <div style={{
          position: 'absolute',
          top: '-150%',
          left: '-150%',
          width: '300%',
          height: '300%',
          background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%)',
          animation: 'waterShimmerFluid 8s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        {/* 1. Top Warm Welcome Pill (Floats in seamlessly) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(45, 212, 191, 0.12)',
          border: '1.5px solid rgba(45, 212, 191, 0.45)',
          borderRadius: '999px',
          padding: '0.45rem 1.4rem',
          fontSize: '0.92rem',
          fontWeight: '800',
          color: '#CCFBF1',
          letterSpacing: '0.4px',
          boxShadow: '0 2px 14px rgba(45, 212, 191, 0.2)',
          marginBottom: '1.4rem',
          animation: 'fluidItemRise 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.1s both'
        }}>
          {greeting.icon}
          <span>{greeting.text}</span>
        </div>

        {/* 2. Logo with Serene Water Aura & Crystal Rim */}
        <div style={{
          position: 'relative',
          marginBottom: '1.3rem',
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.25s both'
        }}>
          {/* Gentle water aura */}
          <div style={{
            position: 'absolute',
            inset: '-16px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.5) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 75%)',
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
            boxShadow: '0 0 35px rgba(45, 212, 191, 0.55), 0 0 0 5px rgba(255, 255, 255, 0.95), 0 10px 30px rgba(0,0,0,0.35)',
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

        {/* 3. SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '900',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '3.5px',
          textShadow: '0 0 14px rgba(56, 189, 248, 0.65)',
          marginBottom: '0.3rem',
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.4s both'
        }}>
          SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
        </div>

        {/* 4. TRUNG TÂM Y TẾ */}
        <h1 style={{
          margin: 0,
          fontSize: '2.25rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          textShadow: '0 2px 20px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0,0,0,0.7)',
          lineHeight: 1.2,
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.55s both'
        }}>
          TRUNG TÂM Y TẾ
        </h1>

        {/* 5. KHU VỰC BÌNH LONG */}
        <h2 style={{
          margin: '0.15rem 0 0 0',
          fontSize: '2.45rem',
          fontWeight: '900',
          color: '#38BDF8',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textShadow: '0 0 25px rgba(56, 189, 248, 0.8), 0 4px 14px rgba(0,0,0,0.8)',
          lineHeight: 1.2,
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.7s both'
        }}>
          KHU VỰC BÌNH LONG
        </h2>

        {/* 6. HỆ THỐNG BÁO CÁO GIAO BAN */}
        <div style={{
          marginTop: '1.15rem',
          background: 'linear-gradient(90deg, rgba(13, 148, 136, 0.35) 0%, rgba(2, 132, 199, 0.45) 50%, rgba(13, 148, 136, 0.35) 100%)',
          border: '1.5px solid rgba(45, 212, 191, 0.65)',
          borderRadius: '30px',
          padding: '0.55rem 1.85rem',
          color: '#FFFFFF',
          fontWeight: '900',
          fontSize: '1.05rem',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 25px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.85s both'
        }}>
          <FaFileMedical style={{ color: '#5EEAD4', fontSize: '1.15rem' }} />
          <span>Hệ Thống Báo Cáo Giao Ban Trực Tuyến</span>
        </div>

        {/* 7. Real-time Shift & Attendance Ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginTop: '1.35rem',
          paddingTop: '1.05rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          width: '100%',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '0.86rem',
          fontWeight: '700',
          animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 1.0s both'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93C5FD' }}>
            <FaCalendarAlt style={{ color: '#38BDF8' }} /> <span>{dateStr || 'Hôm nay'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#5EEAD4' }}>
            <FaClock style={{ color: '#2DD4BF' }} /> <span>{timeStr || 'Thời gian thực'}</span>
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

      {/* 6. Bottom Action Button (Gentle Water Emerald Ripple Glow) */}
      <div style={{
        position: 'absolute',
        bottom: '2.1rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        animation: 'fluidItemRise 0.9s cubic-bezier(0.25, 1, 0.5, 1) 1.15s both'
      }}>
        <button
          type="button"
          onClick={handleSkip}
          style={{
            background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.45)',
            color: '#FFFFFF',
            borderRadius: '999px',
            padding: '0.65rem 2.1rem',
            fontSize: '0.95rem',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 6px 25px rgba(2, 132, 199, 0.45), 0 0 20px rgba(45, 212, 191, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(2, 132, 199, 0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(2, 132, 199, 0.45)';
          }}
        >
          <span>VÀO HỆ THỐNG LÀM VIỆC</span> <FaSignInAlt style={{ fontSize: '0.95rem' }} />
        </button>
      </div>

    </div>
  );
};

export default HospitalPortalIntro;
