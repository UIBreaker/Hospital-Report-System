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
  FaLock,
  FaSatelliteDish,
  FaServer,
  FaDatabase
} from 'react-icons/fa';

// =========================================================================
// PURE IN-MEMORY 16-BIT STEREO WAV AUDIO SYNTHESIZER (Native Browser Autoplay)
// =========================================================================

const generateCinematicMedicalAudioWav = () => {
  const sampleRate = 44100;
  const duration = 4.6; // 4.6 seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write WAV RIFF Header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Synthesis Parameters
  const padFreqs = [146.83, 220.0, 293.66, 369.99, 440.0, 554.37];
  const crystalChimes = [
    { time: 0.25, freq: 739.99, pan: -0.4 },
    { time: 0.50, freq: 880.00, pan: 0.3 },
    { time: 0.75, freq: 1108.73, pan: -0.2 },
    { time: 1.00, freq: 1318.51, pan: 0.4 },
    { time: 1.25, freq: 1760.00, pan: -0.3 },
    { time: 1.50, freq: 2217.46, pan: 0.2 }
  ];

  const heartbeats = [
    { start: 0.60, freq1: 85, freq2: 40, amp: 0.75 },
    { start: 0.75, freq1: 115, freq2: 45, amp: 0.85 },
    { start: 2.10, freq1: 85, freq2: 40, amp: 0.60 },
    { start: 2.25, freq1: 115, freq2: 45, amp: 0.70 }
  ];

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sampleL = 0;
    let sampleR = 0;

    // 1. Ambient Healing Pad (D Major with soft swell and decay)
    let padEnv = 0;
    if (t < 0.8) padEnv = (t / 0.8) * 0.32;
    else if (t < 3.2) padEnv = 0.32 - ((t - 0.8) / 2.4) * 0.12;
    else if (t < duration) padEnv = 0.20 * (1 - (t - 3.2) / 1.4);

    padFreqs.forEach((freq, idx) => {
      const vibrato = Math.sin(t * 3.5 + idx) * 0.6;
      const osc = Math.sin(2 * Math.PI * (freq + vibrato) * t);
      const pan = (idx % 2 === 0 ? 0.85 : 1.15) * (1 / (idx * 0.3 + 1));
      sampleL += osc * padEnv * pan;
      sampleR += osc * padEnv * (2 - pan);
    });

    // 2. Realistic Cardiac Heartbeats ("Lub - Dub")
    heartbeats.forEach(hb => {
      if (t >= hb.start && t < hb.start + 0.22) {
        const dt = t - hb.start;
        const pitch = hb.freq1 * Math.exp(-dt * 6) + hb.freq2;
        const env = Math.sin((dt / 0.22) * Math.PI) * hb.amp;
        const thump = Math.sin(2 * Math.PI * pitch * dt) * env * 0.45;
        sampleL += thump;
        sampleR += thump;
      }
    });

    // 3. Crystal Water & Celestial Starlight Chimes
    crystalChimes.forEach(chime => {
      if (t >= chime.time && t < chime.time + 2.8) {
        const dt = t - chime.time;
        const env = Math.exp(-dt * 2.2) * 0.25;
        const osc = Math.sin(2 * Math.PI * chime.freq * dt) + 0.35 * Math.sin(2 * Math.PI * chime.freq * 2 * dt);
        const panL = 0.5 - chime.pan * 0.5;
        const panR = 0.5 + chime.pan * 0.5;
        sampleL += osc * env * panL;
        sampleR += osc * env * panR;
      }
    });

    // Master Soft Limiter / Compression
    const clamp = (val) => Math.max(-1, Math.min(1, Math.tanh(val * 0.85)));
    const intSampleL = Math.floor(clamp(sampleL) * 32767);
    const intSampleR = Math.floor(clamp(sampleR) * 32767);

    view.setInt16(offset, intSampleL, true);
    view.setInt16(offset + 2, intSampleR, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// =========================================================================
// MAIN HOSPITAL PORTAL INTRO (CINEMATIC, NO SKIP, PURE AUTOMATIC TRANSITION)
// =========================================================================
const HospitalPortalIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('start');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [savedUser, setSavedUser] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Khởi tạo cổng bảo mật y tế...');
  const [isExiting, setIsExiting] = useState(false);
  const exitingRef = useRef(false);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Live Clock & Department details
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

  // Automatic Smooth Exit (Triggered only when Intro finishes completely at 100%)
  const handleAutoComplete = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);
    setPhase('fade_out');

    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 650);
  };

  // Instant Sound Synthesizer & Autoplay on Mount
  useEffect(() => {
    let audioUrl = null;
    try {
      audioUrl = generateCinematicMedicalAudioWav();
      const audio = new Audio(audioUrl);
      audio.volume = 0.85;
      audioRef.current = audio;

      // Immediate play attempt
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // In case browser strictly required gesture, listen to any micro-interaction
          const playOnGesture = () => {
            audio.play().catch(() => {});
            window.removeEventListener('pointerdown', playOnGesture);
            window.removeEventListener('keydown', playOnGesture);
            window.removeEventListener('touchstart', playOnGesture);
          };
          window.addEventListener('pointerdown', playOnGesture, { once: true });
          window.addEventListener('keydown', playOnGesture, { once: true });
          window.addEventListener('touchstart', playOnGesture, { once: true });
        });
      }
    } catch (e) {}

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Background Canvas: Medical Aurora, Pulse ECG wave, Starlight Particles
  useEffect(() => {
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

      const particles = Array.from({ length: 45 }, () => ({
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

        // 1. Glowing horizontal ECG waveform
        const ecgY = canvas.height * 0.72;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#38BDF8';

        for (let x = 0; x < canvas.width; x += 3) {
          const normX = (x + time * 95) % canvas.width;
          let yOffset = 0;
          const cycle = normX % 380;
          if (cycle > 120 && cycle < 140) {
            yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -12;
          } else if (cycle >= 150 && cycle < 158) {
            yOffset = ((cycle - 150) / 8) * 8;
          } else if (cycle >= 158 && cycle < 172) {
            yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -65;
          } else if (cycle >= 172 && cycle < 182) {
            yOffset = ((cycle - 172) / 10) * 14;
          } else if (cycle >= 210 && cycle < 245) {
            yOffset = Math.sin((cycle - 210) / 35 * Math.PI) * -20;
          }
          if (x === 0) ctx.moveTo(x, ecgY + yOffset);
          else ctx.lineTo(x, ecgY + yOffset);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 2. Floating Medical Nano Particles
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

  // System Loading Flow (Exactly 4.0 seconds, NO SKIPPING, Auto transition at 100%)
  useEffect(() => {
    setPhase('flow_in');
    let currentProgress = 0;
    
    const statusStages = [
      { at: 15, text: 'Thiết lập kết nối mã hóa y tế 256-bit...' },
      { at: 40, text: 'Đồng bộ cơ sở dữ liệu 12 khoa phòng...' },
      { at: 70, text: 'Tải biểu mẫu giao ban chuyên môn trực tuyến...' },
      { at: 92, text: 'Hệ thống sẵn sàng! Đang vào cổng làm việc...' }
    ];

    const progressInterval = setInterval(() => {
      currentProgress += 2.5; // ~40 ticks * 90ms = 3.6s total loading
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setStatusText('Hoàn tất kết nối! Đang chuyển tiếp...');
        clearInterval(progressInterval);

        // Transition smoothly into Login Page
        setTimeout(() => {
          handleAutoComplete();
        }, 500);
      } else {
        setProgress(Math.floor(currentProgress));
        const matchedStage = statusStages.slice().reverse().find(s => currentProgress >= s.at);
        if (matchedStage) setStatusText(matchedStage.text);
      }
    }, 90);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div
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
        userSelect: 'none',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
        filter: isExiting ? 'blur(14px)' : 'blur(0px)',
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

        @keyframes livePulseDot {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.3); filter: drop-shadow(0 0 8px #10B981); }
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

      {/* 3. CENTER HERO CONTAINER (BORDERLESS, IMMERSIVE, BREATHING) */}
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

        {/* H. Full Progress Meter (0% -> 100%) */}
        <div style={{
          width: '320px',
          height: '5px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          marginTop: '2.2rem',
          overflow: 'hidden',
          position: 'relative',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0284C7 0%, #2DD4BF 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 16px #2DD4BF',
            transition: 'width 0.09s ease-out'
          }} />
        </div>

        {/* I. Live Initialization Status Ticker */}
        <div style={{
          marginTop: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.82rem',
          color: '#94A3B8',
          fontWeight: '600',
          letterSpacing: '0.3px',
          animation: 'heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.2s both'
        }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            animation: 'livePulseDot 1.4s ease-in-out infinite'
          }} />
          <span>{statusText}</span>
          <span style={{ color: '#38BDF8', fontWeight: '800', marginLeft: '0.2rem' }}>{progress}%</span>
        </div>

      </div>

    </div>
  );
};

export default HospitalPortalIntro;
