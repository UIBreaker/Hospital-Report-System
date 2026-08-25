import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt,
  FaClock,
  FaChartBar,
  FaSignInAlt,
  FaArrowRight,
  FaCodeBranch, 
  FaDatabase, 
  FaPhoneAlt,
  FaSpinner,
  FaTimes,
  FaInfoCircle,
  FaHeadset,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeartbeat,
  FaHospital,
  FaMicroscope
} from 'react-icons/fa';
import { APP_VERSION } from '../config/version';
import AIAssistant from '../components/common/AIAssistant';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import HospitalPortalIntro from '../components/auth/HospitalPortalIntro';
import MedicalAuthBackground from '../components/common/MedicalAuthBackground';

// Web Audio API Sound Synthesizers for Login State Feedback
const playLoginSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.07;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  } catch (e) {}
};

const playLoginErrorSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const tones = [220, 185];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const t = now + idx * 0.12;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch (e) {}
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [mustChangePasswordData, setMustChangePasswordData] = useState({ isOpen: false, username: '', fullName: '' });
  
  // Only show intro if it's the very first visit of this browser session or right after logout
  const [showIntro, setShowIntro] = useState(() => {
    const justLoggedOut = sessionStorage.getItem('just_logged_out_username');
    if (justLoggedOut) return true;
    const alreadyShown = sessionStorage.getItem('portal_intro_shown');
    return !alreadyShown;
  });
  
  const { login, user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('saved_hospital_username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/report', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  if (user) {
    return null;
  }

  const triggerErrorFeedback = (msg) => {
    setError(msg);
    setIsShaking(true);
    playLoginErrorSound();
    setTimeout(() => {
      setIsShaking(false);
    }, 650);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      triggerErrorFeedback('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem('saved_hospital_username', username.trim());
      } else {
        localStorage.removeItem('saved_hospital_username');
      }

      const loggedInUser = await login(username, password);
      
      if (loggedInUser?.mustChangePassword) {
        setMustChangePasswordData({
          isOpen: true,
          username: loggedInUser.username,
          fullName: loggedInUser.full_name
        });
        setIsSubmitting(false);
        return;
      }

      // Success State
      setIsSuccess(true);
      setSuccessUser(loggedInUser);
      playLoginSuccessSound();

      setTimeout(() => {
        navigate(loggedInUser?.role === 'admin' ? '/admin' : '/report');
      }, 950);

    } catch (err) {
      const rawMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      let displayMsg = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      if (typeof rawMsg === 'string' && rawMsg.trim()) {
        displayMsg = rawMsg;
      }
      triggerErrorFeedback(displayMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFillLogin = (autoUser, autoPass) => {
    setUsername(autoUser);
    setPassword(autoPass);
    setError('');
  };

  return (
    <div className="full-dvh-screen" style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      backgroundColor: '#030914',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* Seamless Fluid Water Welcome Overlay (Zero White Flash) */}
      {showIntro && (
        <HospitalPortalIntro
          onComplete={() => {
            sessionStorage.setItem('portal_intro_shown', 'true');
            setShowIntro(false);
          }}
        />
      )}

      {/* Futuristic Animations and Shimmer Styles */}
      <style>{`
        @keyframes loginBloomExpand {
          0% { opacity: 0; transform: scale(0.96); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px) rotate(-0.5deg); }
          30% { transform: translateX(9px) rotate(0.5deg); }
          45% { transform: translateX(-7px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(2px); }
        }

        @keyframes haloSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes haloSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes pulseLogoGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(56, 189, 248, 0.45), 0 0 50px rgba(14, 165, 233, 0.2); }
          50% { transform: scale(1.04); box-shadow: 0 0 35px rgba(56, 189, 248, 0.75), 0 0 70px rgba(45, 212, 191, 0.35); }
        }

        @keyframes errorSlideDown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.96); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes successCardMorph {
          0% { opacity: 0; transform: scale(0.92); filter: blur(8px); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        @keyframes successCheckBounce {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.25) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes successRingPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes successProgressLine {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .login-input-field:focus {
          border-color: #38BDF8 !important;
          background-color: rgba(10, 25, 50, 0.95) !important;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.45), inset 0 0 10px rgba(56, 189, 248, 0.1) !important;
        }

        .feature-pill-hover {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-pill-hover:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: #38BDF8 !important;
          box-shadow: 0 12px 30px rgba(56, 189, 248, 0.22) !important;
          background: rgba(15, 34, 68, 0.85) !important;
        }
      `}</style>

      {/* Synchronized Obsidian Dynamic Medical Background (ECG Canvas, Starlight Particles, Auroras) */}
      <MedicalAuthBackground />

      {/* Main Two-Column Content Grid */}
      <main className="login-main-grid" style={{
        flex: 1,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.2rem 2.5rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: '3.5rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        minHeight: 0,
        animation: 'loginBloomExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>

        {/* ================= LEFT COLUMN: BRAND HERO & PREMIUM FEATURE PILLS ================= */}
        <section className="login-brand-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
          
          {/* Logo with Orbit Rings & Replay Intro Trigger */}
          <div style={{ position: 'relative', width: '92px', height: '92px', marginBottom: '0.2rem' }}>
            {/* Outer Rotating Laser Ring */}
            <div style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(56, 189, 248, 0.5)',
              animation: 'haloSpinSlow 16s linear infinite',
              pointerEvents: 'none'
            }} />
            
            {/* Inner Reverse Ring */}
            <div style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              border: '1.5px solid rgba(45, 212, 191, 0.4)',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              animation: 'haloSpinReverse 9s linear infinite',
              pointerEvents: 'none'
            }} />

            {/* Logo Center Sphere */}
            <div 
              className="login-logo-circle"
              onClick={() => setShowIntro(true)}
              title="Xem lại hiệu ứng giới thiệu Cổng Thông Tin"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                cursor: 'pointer',
                animation: 'pulseLogoGlow 3.5s ease-in-out infinite',
                boxSizing: 'border-box'
              }}
            >
              <img 
                src="/logo.png" 
                alt="Logo TTYT Bình Long" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Titles & Headings */}
          <div>
            {/* Agency Badge */}
            <div 
              className="login-agency-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38BDF8',
                padding: '0.3rem 0.95rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
              }}
            >
              <FaHospital style={{ color: '#2DD4BF' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            {/* Main Hospital Name */}
            <h1 
              className="login-hospital-title"
              style={{
                fontSize: '2.15rem',
                fontWeight: '900',
                color: '#FFFFFF',
                margin: '0 0 0.15rem 0',
                lineHeight: '1.15',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              TRUNG TÂM Y TẾ
            </h1>

            <h2 
              style={{
                fontSize: '2.35rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                lineHeight: '1.15',
                margin: '0 0 0.55rem 0',
                backgroundImage: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #A7F3D0 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                display: 'inline-block'
              }}
            >
              KHU VỰC BÌNH LONG
            </h2>

            <div 
              style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: '#93C5FD',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                marginBottom: '0.45rem'
              }}
            >
              <FaHeartbeat style={{ color: '#38BDF8', fontSize: '1.15rem' }} />
              <span>Hệ Thống Báo Cáo Giao Ban Chuyên Môn Trực Tuyến</span>
            </div>

            <p 
              className="login-desc-text"
              style={{
                fontSize: '0.88rem',
                color: '#94A3B8',
                lineHeight: '1.5',
                margin: 0,
                maxWidth: '470px'
              }}
            >
              Nền tảng số hóa quản lý báo cáo giao ban y khoa nhanh chóng, bảo mật và chính xác phục vụ toàn diện các khoa phòng.
            </p>
          </div>

          {/* 3 Translucent Obsidian Glass Feature Cards */}
          <div className="login-feature-pills" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.35rem', maxWidth: '440px' }}>
            
            {/* Feature 1 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              backgroundColor: 'rgba(11, 24, 48, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.65rem 1.05rem',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(2, 132, 199, 0.5) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.05rem',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)'
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#F8FAFC', fontSize: '0.88rem' }}>Bảo Mật & Chuẩn Hóa Y Tế</div>
                <div style={{ color: '#94A3B8', fontSize: '0.76rem' }}>Mã hóa dữ liệu phân quyền khoa phòng theo tiêu chuẩn ngành</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              backgroundColor: 'rgba(11, 24, 48, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.65rem 1.05rem',
              borderRadius: '16px',
              border: '1px solid rgba(45, 212, 191, 0.22)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(16, 185, 129, 0.5) 100%)',
                border: '1px solid rgba(45, 212, 191, 0.45)',
                color: '#2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.05rem',
                boxShadow: '0 0 15px rgba(45, 212, 191, 0.25)'
              }}>
                <FaClock />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#F8FAFC', fontSize: '0.88rem' }}>Giao Ban Thời Gian Thực</div>
                <div style={{ color: '#94A3B8', fontSize: '0.76rem' }}>Tổng hợp chỉ số toàn viện tức thì chỉ với một thao tác</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              backgroundColor: 'rgba(11, 24, 48, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.65rem 1.05rem',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.22)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(124, 58, 237, 0.5) 100%)',
                border: '1px solid rgba(129, 140, 248, 0.45)',
                color: '#818CF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.05rem',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)'
              }}>
                <FaChartBar />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#F8FAFC', fontSize: '0.88rem' }}>Trình Chiếu & Xuất Báo Cáo</div>
                <div style={{ color: '#94A3B8', fontSize: '0.76rem' }}>Chế độ Slide toàn màn hình và xuất PDF văn bản lưu trữ</div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= RIGHT COLUMN: MASTERPIECE OBSIDIAN GLASS LOGIN CARD ================= */}
        <section className="login-card-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="login-card-inner"
            style={{
              width: '100%',
              maxWidth: '490px',
              backgroundColor: 'rgba(10, 22, 46, 0.84)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: '24px',
              padding: '1.85rem 2.15rem',
              boxShadow: isSuccess
                ? '0 25px 65px rgba(16, 185, 129, 0.35), 0 0 40px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                : error 
                ? '0 25px 65px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
                : '0 25px 65px rgba(0, 0, 0, 0.75), 0 0 35px rgba(14, 165, 233, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              border: isSuccess 
                ? '1.5px solid #10B981' 
                : error 
                ? '1.5px solid #EF4444' 
                : '1.5px solid rgba(56, 189, 248, 0.3)',
              boxSizing: 'border-box',
              animation: isShaking ? 'loginShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' : 'none',
              transition: 'box-shadow 0.3s ease, border 0.3s ease, transform 0.3s ease'
            }}
          >

            {isSuccess ? (
              /* ================= SUCCESS TRANSFORMATION VIEW ================= */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.4rem 0.5rem',
                animation: 'successCardMorph 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
              }}>
                <div style={{ position: 'relative', width: '88px', height: '88px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-14px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
                    animation: 'successRingPulse 1.6s ease-out infinite'
                  }} />
                  <div style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '2px solid #34D399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 35px rgba(16, 185, 129, 0.6)',
                    animation: 'successCheckBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
                  }}>
                    <FaCheckCircle style={{ fontSize: '2.6rem', color: '#10B981' }} />
                  </div>
                </div>

                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  color: '#34D399',
                  margin: '0 0 0.4rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px'
                }}>
                  Xác Thực Thành Công!
                </h3>

                <p style={{
                  fontSize: '0.96rem',
                  color: '#F8FAFC',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Chào mừng: <strong style={{ color: '#38BDF8' }}>{successUser?.full_name || successUser?.fullName || successUser?.username || username}</strong>
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  color: '#6EE7B7',
                  marginBottom: '1.4rem'
                }}>
                  <FaShieldAlt />
                  <span>{successUser?.role === 'admin' ? 'Quyền Quản Trị Hệ Thống' : `Khoa: ${successUser?.departmentName || successUser?.departmentCode || 'Chuyên Môn'}`}</span>
                </div>

                {/* Progress bar line */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981 0%, #38BDF8 100%)',
                    borderRadius: '999px',
                    boxShadow: '0 0 12px #38BDF8',
                    animation: 'successProgressLine 0.9s cubic-bezier(0.4, 0, 0.2, 1) both'
                  }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.65rem', fontWeight: '600' }}>
                  Đang mở cổng báo cáo giao ban chuyên môn...
                </span>
              </div>
            ) : (
              <>
                {/* Top Shield Icon Badge */}
                <div 
                  className="login-shield-badge"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: error ? 'rgba(239, 68, 68, 0.18)' : 'rgba(14, 165, 233, 0.18)',
                    border: error ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(56, 189, 248, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.85rem auto',
                    boxShadow: error ? '0 0 25px rgba(239, 68, 68, 0.35)' : '0 0 25px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaShieldAlt style={{ fontSize: '1.75rem', color: error ? '#F87171' : '#38BDF8' }} />
                </div>

                {/* Heading */}
                <h3 
                  className="login-card-title"
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    margin: '0 0 0.25rem 0',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}
                >
                  CHÀO MỪNG TRỞ LẠI!
                </h3>

                <p 
                  className="login-card-subtitle"
                  style={{
                    fontSize: '0.84rem',
                    color: '#94A3B8',
                    margin: '0 0 1.25rem 0',
                    textAlign: 'center'
                  }}
                >
                  Cổng Đăng Nhập Quản Trị & Báo Cáo Giao Ban Trực Tuyến
                </p>

                {/* Enhanced Animated Error Alert */}
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.18)',
                    border: '1.5px solid rgba(248, 113, 113, 0.55)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: '#FECACA',
                    fontSize: '0.84rem',
                    marginBottom: '1.15rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    lineHeight: '1.4',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)',
                    animation: 'errorSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
                  }}>
                    <div style={{ color: '#F87171', fontSize: '1.15rem', marginTop: '1px' }}>
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#FCA5A5', marginBottom: '2px', fontSize: '0.86rem' }}>
                        Đăng Nhập Không Thành Công
                      </div>
                      <div style={{ color: '#FECACA', fontWeight: '600' }}>
                        {typeof error === 'string' ? error : (error?.message || 'Lỗi đăng nhập')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                  
                  {/* Field 1: Username */}
                  <div>
                    <label style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      color: '#E2E8F0',
                      display: 'block',
                      marginBottom: '0.4rem',
                      letterSpacing: '0.3px'
                    }}>
                      Tên đăng nhập khoa phòng / Quản trị
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaUser style={{
                        position: 'absolute',
                        top: '50%',
                        left: '1rem',
                        transform: 'translateY(-50%)',
                        color: error ? '#F87171' : '#38BDF8',
                        fontSize: '0.92rem',
                        transition: 'color 0.2s ease'
                      }} />
                      <input
                        className="login-input-field"
                        type="text"
                        placeholder="VD: Khnv hoặc noi.bvbl..."
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError('');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.85rem 0.75rem 2.65rem',
                          border: error ? '1.5px solid #EF4444' : '1.5px solid rgba(56, 189, 248, 0.28)',
                          borderRadius: '12px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          backgroundColor: 'rgba(6, 14, 28, 0.85)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <label style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      color: '#E2E8F0',
                      display: 'block',
                      marginBottom: '0.4rem',
                      letterSpacing: '0.3px'
                    }}>
                      Mật khẩu
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '1rem',
                        transform: 'translateY(-50%)',
                        color: error ? '#F87171' : '#38BDF8',
                        fontSize: '0.92rem',
                        transition: 'color 0.2s ease'
                      }} />
                      <input
                        className="login-input-field"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.65rem 0.75rem 2.65rem',
                          border: error ? '1.5px solid #EF4444' : '1.5px solid rgba(56, 189, 248, 0.28)',
                          borderRadius: '12px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          backgroundColor: 'rgba(6, 14, 28, 0.85)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '0.85rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Remember Me & Forgot Password */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    marginTop: '0.1rem'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#CBD5E1',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#38BDF8',
                          cursor: 'pointer'
                        }}
                      />
                      Ghi nhớ đăng nhập
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#38BDF8',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                      color: '#FFFFFF',
                      border: '1.5px solid rgba(255, 255, 255, 0.35)',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '1.02rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 30px rgba(14, 165, 233, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.25s ease',
                      marginTop: '0.45rem',
                      letterSpacing: '0.4px'
                    }}
                    onMouseOver={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.015)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(14, 165, 233, 0.75)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.5)';
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="spinner" /> Đang xác thực...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt /> ĐĂNG NHẬP HỆ THỐNG <FaArrowRight />
                      </>
                    )}
                  </button>

                  {/* Register Link */}
                  <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.84rem', color: '#94A3B8' }}>
                    Chưa có tài khoản nhân viên?{' '}
                    <Link to="/register" style={{ color: '#38BDF8', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Đăng ký ngay <FaArrowRight style={{ fontSize: '0.75rem' }} />
                    </Link>
                  </div>

                </form>
              </>
            )}

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.2rem 0 0.85rem 0',
              color: '#64748B',
              fontSize: '0.72rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(56, 189, 248, 0.2)' }} />
              <span style={{ padding: '0 0.75rem', color: '#93C5FD' }}>THÔNG TIN HỆ THỐNG</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(56, 189, 248, 0.2)' }} />
            </div>

            {/* 4 Obsidian Glass System Badges Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.45rem'
            }}>
              {/* Badge 1: Version */}
              <div style={{
                backgroundColor: 'rgba(6, 14, 28, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaCodeBranch style={{ color: '#38BDF8', fontSize: '0.65rem' }} /> Phiên bản
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#38BDF8' }}>
                  v{APP_VERSION}
                </div>
              </div>

              {/* Badge 2: Database */}
              <div style={{
                backgroundColor: 'rgba(6, 14, 28, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaDatabase style={{ color: '#34D399', fontSize: '0.65rem' }} /> CSDL
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34D399', whiteSpace: 'nowrap' }}>
                  Aiven SSL
                </div>
              </div>

              {/* Badge 3: Author */}
              <div style={{
                backgroundColor: 'rgba(6, 14, 28, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaUser style={{ color: '#818CF8', fontSize: '0.65rem' }} /> Tác giả
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#F1F5F9', lineHeight: '1.2' }}>
                  Nhật Nam
                </div>
              </div>

              {/* Badge 4: Contact */}
              <a
                href="https://zalo.me/0916337266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '10px',
                  padding: '0.45rem 0.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  textDecoration: 'none'
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#38BDF8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaPhoneAlt style={{ color: '#38BDF8', fontSize: '0.65rem' }} /> Hỗ trợ
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.55rem', padding: '0.05rem 0.25rem', borderRadius: '3px', fontWeight: '900' }}>Zalo</span> 0916...
                </div>
              </a>

            </div>

          </div>
        </section>

      </main>

      {/* Sleek Dark Obsidian Footer */}
      <footer style={{
        padding: '0.65rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: '#94A3B8',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        backgroundColor: 'rgba(3, 9, 20, 0.75)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        © 2026 <strong style={{ color: '#E2E8F0' }}>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />

      {/* New Admin-Assisted Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      {/* Mandatory Password Change Modal */}
      <ChangePasswordModal
        isOpen={mustChangePasswordData.isOpen}
        username={mustChangePasswordData.username}
        fullName={mustChangePasswordData.fullName}
        isMandatory={true}
        onSuccess={(data) => {
          setMustChangePasswordData({ isOpen: false, username: '', fullName: '' });
          if (data?.token) {
            localStorage.setItem('token', data.token);
          }
          alert('Đổi mật khẩu thành công! Đang chuyển hướng vào hệ thống...');
          window.location.reload();
        }}
        onClose={() => setMustChangePasswordData({ isOpen: false, username: '', fullName: '' })}
      />

    </div>
  );
};

export default LoginPage;
