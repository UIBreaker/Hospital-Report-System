import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHospital, 
  FaSignInAlt, 
  FaShieldAlt, 
  FaClock, 
  FaCalendarAlt, 
  FaUserCheck,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaHeartbeat,
  FaCheckCircle,
  FaArrowRight,
  FaSatelliteDish,
  FaLock
} from 'react-icons/fa';

// Subtle Pristine Acoustic Harmony Chime (Pure fluid sine wave chords)
const playSereneAcousticChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    // Harmonic chords in C Major Pentatonic (C4, E4, G4, B4, D5, G5)
    [261.63, 329.63, 392.0, 493.88, 587.33, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), now + idx * 0.08 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 3.4);
    });
  } catch (err) {
    // Ignore autoplay restriction
  }
};

const HospitalPortalIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('start');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [savedUser, setSavedUser] = useState('');
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const exitingRef = useRef(false);
  const canvasRef = useRef(null);

  // Live Clock & User detection
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs}`);

      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      setDateStr(`${dayName}, ${d}/${m}/${y}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const remembered = localStorage.getItem('saved_hospital_username');
    if (remembered) setSavedUser(remembered);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return { text: 'Chào Ca Trực Sáng • Chúc Một Ngày Bình An & Thuận Lợi', icon: <FaSun style={{ color: '#FBBF24' }} /> };
    } else if (hour >= 11 && hour < 14) {
      return { text: 'Chào Ca Trực Trưa • Chúc Quý Đồng Nghiệp Năng Lượng & Vững Vàng', icon: <FaCloudSun style={{ color: '#38BDF8' }} /> };
    } else if (hour >= 14 && hour < 18) {
      return { text: 'Chào Ca Trực Chiều • Tiếp Tục Ca Trực Tận Tâm & An Toàn', icon: <FaCloudSun style={{ color: '#60A5FA' }} /> };
    } else {
      return { text: 'Chào Ca Trực Đêm • Chúc Quý Bác Sĩ & Điều Dưỡng Bình Yên, Vững Vàng', icon: <FaMoon style={{ color: '#C084FC' }} /> };
    }
  };

  const greeting = getGreeting();

  const handleSmoothExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);
    setPhase('fade_out');

    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 550);
  };

  const handleSkip = (e) => {
    if (e) e.stopPropagation();
    handleSmoothExit();
  };

  // Canvas Cinematic Animation (Medical Aurora + ECG Pulse + Floating Nodes)
  useEffect(() => {
    playSereneAcousticChime();

    const canvas = canvasRef.current;
    let animId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // Star / Medical Nano-Particles
      const particles = Array.from({ length: 48 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: (Math.random() * 0.35 + 0.1) * -1,
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        color: ['#38BDF8', '#2DD4BF', '#818CF8', '#A7F3D0', '#FFFFFF'][Math.floor(Math.random() * 5)]
      }));

      let time = 0;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.015;

        // 1. Draw glowing horizontal ECG waveform through middle-bottom
        const ecgY = canvas.height * 0.72;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#38BDF8';

        for (let x = 0; x < canvas.width; x += 3) {
          const normX = (x + time * 90) % canvas.width;
          let yOffset = 0;
          // Generate periodic P-Q-R-S-T cardiac waveform peak
          const cycle = normX % 380;
          if (cycle > 120 && cycle < 140) {
            yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -12; // P wave
          } else if (cycle >= 150 && cycle < 158) {
            yOffset = ((cycle - 150) / 8) * 8; // Q dip
          } else if (cycle >= 158 && cycle < 172) {
            yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -65; // R spike
          } else if (cycle >= 172 && cycle < 182) {
            yOffset = ((cycle - 172) / 10) * 14; // S dip
          } else if (cycle >= 210 && cycle < 245) {
            yOffset = Math.sin((cycle - 210) / 35 * Math.PI) * -20; // T wave
          }
          if (x === 0) ctx.moveTo(x, ecgY + yOffset);
          else ctx.lineTo(x, ecgY + yOffset);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 2. Draw Floating Medical Particles
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 3 + p.pulseOffset));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
      };
      render();

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animId);
      };
    }
  }, []);

  // Smooth Loading Progress Counter (0% -> 100% in 2.2s)
  useEffect(() => {
    setPhase('flow_in');
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval);
      } else {
        setProgress(currentProgress);
      }
    }, 60);

    const autoTimer = setTimeout(() => {
      handleSmoothExit();
    }, 4200);

    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code)) {
        handleSmoothExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(autoTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#030A16',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), filter 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.03)' : 'scale(1)',
        filter: isExiting ? 'blur(12px)' : 'blur(0px)',
        pointerEvents: isExiting ? 'none' : 'auto',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <style>{`
        @keyframes haloSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes haloSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes pulseRadialBeat {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 25px rgba(45, 212, 191, 0.6)); }
        }

        @keyframes ambientAuroraShift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.45; }
          50% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.75; }
        }

        @keyframes textGlowShimmer {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.35)); }
          50% { filter: drop-shadow(0 0 30px rgba(45, 212, 191, 0.7)); }
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>

      {/* 1. Cinematic Background Canvas */}
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

      {/* 2. Deep Obsidian Ambient Auroras */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        width: '900px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(20, 184, 166, 0.18) 35%, rgba(99, 102, 241, 0.08) 60%, transparent 80%)',
        filter: 'blur(90px)',
        zIndex: 2,
        animation: 'ambientAuroraShift 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* 3. CENTER HERO CONTAINER (BORDERLESS, SLEEK, BREATHING) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '920px',
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem',
        boxSizing: 'border-box'
      }}>
        
        {/* A. Top Dynamic Greeting Capsule */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          padding: '0.42rem 1.3rem',
          fontSize: '0.86rem',
          fontWeight: '700',
          color: '#E0F2FE',
          letterSpacing: '0.3px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          marginBottom: '1.8rem',
          animation: 'heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem' }}>{greeting.icon}</span>
          <span>{greeting.text}</span>
        </div>

        {/* B. Holographic Medical Emblem with Dual Kinetic Orbit Rings */}
        <div style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.6rem',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both'
        }}>
          {/* Outer Cyan Laser Orbit Ring */}
          <div style={{
            position: 'absolute',
            inset: '-14px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(56, 189, 248, 0.55)',
            animation: 'haloSpinSlow 24s linear infinite',
            filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))'
          }} />

          {/* Inner Teal Reticle Ring */}
          <div style={{
            position: 'absolute',
            inset: '-5px',
            borderRadius: '50%',
            border: '1px solid rgba(45, 212, 191, 0.45)',
            borderTopColor: '#5EEAD4',
            borderRightColor: 'transparent',
            animation: 'haloSpinReverse 14s linear infinite'
          }} />

          {/* Glowing Heartbeat Pulse Aura */}
          <div style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(45, 212, 191, 0.2) 50%, transparent 75%)',
            filter: 'blur(16px)',
            animation: 'pulseRadialBeat 2.4s ease-in-out infinite',
            zIndex: 0
          }} />

          {/* Logo Center Sphere */}
          <div style={{
            width: '108px',
            height: '108px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            padding: '6px',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.6), 0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

        {/* C. Typography: SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI */}
        <div style={{
          fontSize: '0.92rem',
          fontWeight: '800',
          color: '#93C5FD',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
          marginBottom: '0.45rem',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both'
        }}>
          SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
        </div>

        {/* D. Main Center Headline */}
        <h1 style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '3.5px',
          lineHeight: 1.2,
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both'
        }}>
          TRUNG TÂM Y TẾ
        </h1>

        {/* E. Gradient Highlight: KHU VỰC BÌNH LONG */}
        <h2 style={{
          margin: '0.2rem 0 0 0',
          fontSize: '2.75rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #A7F3D0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '5px',
          lineHeight: 1.2,
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both, textGlowShimmer 4s ease-in-out infinite'
        }}>
          KHU VỰC BÌNH LONG
        </h2>

        {/* F. Subtitle: Hệ Thống Báo Cáo Giao Ban Trực Tuyến */}
        <div style={{
          marginTop: '1.2rem',
          color: '#E2E8F0',
          fontWeight: '700',
          fontSize: '1.05rem',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both'
        }}>
          <FaHeartbeat style={{ color: '#38BDF8', fontSize: '1.25rem' }} />
          <span>Hệ Thống Báo Cáo Giao Ban Chuyên Môn Trực Tuyến</span>
        </div>

        {/* G. Realtime Security & Time Status Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '1.6rem',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.0s both'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#BAE6FD'
          }}>
            <FaCalendarAlt style={{ color: '#38BDF8' }} />
            <span>{dateStr || '25/08/2026'}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#99F6E4'
          }}>
            <FaClock style={{ color: '#2DD4BF' }} />
            <span>{timeStr || 'Thời gian thực'}</span>
          </div>

          {savedUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(254, 240, 138, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(254, 240, 138, 0.2)',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#FEF08A'
            }}>
              <FaUserCheck style={{ color: '#FACC15' }} />
              <span>Chào trở lại: <strong>{savedUser}</strong></span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(167, 139, 250, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#DDD6FE'
            }}>
              <FaShieldAlt style={{ color: '#A78BFA' }} />
              <span>Mã Hóa Chuẩn Y Tế 256-bit</span>
            </div>
          )}
        </div>

        {/* H. Sleek Futuristic Progress Line */}
        <div style={{
          width: '280px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          marginTop: '2rem',
          overflow: 'hidden',
          position: 'relative',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0284C7 0%, #2DD4BF 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 12px #2DD4BF',
            transition: 'width 0.1s ease-out'
          }} />
        </div>

        {/* I. Interactive Launch Action Button */}
        <div style={{
          marginTop: '1.4rem',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.2s both'
        }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.85) 0%, rgba(13, 148, 136, 0.85) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '0.75rem 2.4rem',
              fontSize: '0.95rem',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.4), 0 0 20px rgba(45, 212, 191, 0.25)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(2, 132, 199, 0.65), 0 0 30px rgba(45, 212, 191, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(2, 132, 199, 0.4), 0 0 20px rgba(45, 212, 191, 0.25)';
            }}
          >
            <span>VÀO HỆ THỐNG LÀM VIỆC</span>
            <FaArrowRight style={{ fontSize: '0.9rem' }} />
          </button>
        </div>

        {/* J. Subtext Hint */}
        <div style={{
          marginTop: '0.85rem',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.45)',
          fontWeight: '600',
          letterSpacing: '0.3px',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.3s both'
        }}>
          Nhấn phím cách hoặc click bất kỳ đâu để vào ngay
        </div>

      </div>

    </div>
  );
};

export default HospitalPortalIntro;
