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
  FaMicroscope,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { APP_VERSION } from '../config/version';
import AIAssistant from '../components/common/AIAssistant';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import HospitalPortalIntro from '../components/auth/HospitalPortalIntro';
import MedicalAuthBackground from '../components/common/MedicalAuthBackground';
import VersionChangelogModal from '../components/common/VersionChangelogModal';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [successUser, setSuccessUser] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [mustChangePasswordData, setMustChangePasswordData] = useState({ isOpen: false, username: '', fullName: '' });
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  
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

  // Only auto-redirect if already logged in on initial landing and NOT currently showing login success animation
  useEffect(() => {
    if (user && !isSuccess && !isTransitioning) {
      navigate(isAdmin ? '/admin' : '/report', { replace: true });
    }
  }, [user, isAdmin, navigate, isSuccess, isTransitioning]);

  // Fullscreen Change Listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Prevent blank screen if user is already logged in on cold load
  if (user && !isSuccess && !isTransitioning) {
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

      // Success State Activation
      setIsSuccess(true);
      setSuccessUser(loggedInUser);
      playLoginSuccessSound();

      // Trigger seamless Full-Screen Portal Curtain Transition at 720ms
      setTimeout(() => {
        setIsTransitioning(true);
      }, 720);

      // Perform final smooth navigation into destination workspace at 1150ms
      setTimeout(() => {
        navigate(loggedInUser?.role === 'admin' ? '/admin' : '/report');
      }, 1150);

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
    <div className="full-dvh-screen hide-scrollbar" style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* Seamless Fluid Water Welcome Overlay */}
      {showIntro && (
        <HospitalPortalIntro
          onComplete={() => {
            sessionStorage.setItem('portal_intro_shown', 'true');
            setShowIntro(false);
          }}
        />
      )}

      {/* Full-Screen Seamless Medical Portal Curtain Transition Overlay */}
      {isTransitioning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'radial-gradient(circle at 50% 50%, rgba(240, 253, 244, 0.96) 0%, rgba(224, 242, 254, 0.98) 65%, #F8FAFC 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'portalCurtainExpand 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
          pointerEvents: 'all'
        }}>
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.2rem'
          }}>
            <div style={{
              position: 'absolute',
              inset: '-15px',
              borderRadius: '50%',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              animation: 'portalRipplePulse 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite'
            }} />
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35), 0 0 0 3px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#0F2C59',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '0.35rem',
            textAlign: 'center'
          }}>
            KẾT NỐI CỔNG GIAO BAN THÀNH CÔNG
          </div>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <FaHeartbeat style={{ color: '#10B981', animation: 'heartbeatPulse 0.8s ease-in-out infinite' }} />
            <span>Đang mở không gian làm việc chuyên môn...</span>
          </div>
        </div>
      )}

      {/* Floating Fullscreen F11 Quick Toggle */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Thoát toàn màn hình (Esc / F11)' : 'Bật toàn màn hình (F11)'}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1.2rem',
          zIndex: 99,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1.5px solid #BAE6FD',
          color: '#0284C7',
          padding: '0.42rem 0.85rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.78rem',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(15, 44, 89, 0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.22s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = '#0284C7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = '#BAE6FD';
        }}
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
        <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình (F11)'}</span>
      </button>

      {/* Animations and Shimmer Styles */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes loginBloomExpand {
          0% { opacity: 0; transform: scale(0.97); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        @keyframes portalCurtainExpand {
          0% { opacity: 0; transform: scale(0.96); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        @keyframes portalRipplePulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes heartbeatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }

        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-9px) rotate(-0.5deg); }
          30% { transform: translateX(8px) rotate(0.5deg); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(5px); }
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
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(2, 132, 199, 0.25), 0 0 0 3px rgba(255, 255, 255, 0.95); }
          50% { transform: scale(1.04); box-shadow: 0 8px 30px rgba(2, 132, 199, 0.4), 0 0 0 4px rgba(56, 189, 248, 0.4); }
        }

        @keyframes errorSlideDown {
          0% { opacity: 0; transform: translateY(-8px) scale(0.97); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes successCardMorph {
          0% { opacity: 0; transform: scale(0.94); filter: blur(6px); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        @keyframes successCheckBounce {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(6deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes successRingPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes versionCardGlow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(2, 132, 199, 0.3), 0 3px 10px rgba(2, 132, 199, 0.15);
            border-color: #38BDF8;
          }
          50% {
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.65), 0 0 30px rgba(56, 189, 248, 0.35);
            border-color: #0284C7;
          }
        }

        @keyframes sparkleBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.1); }
        }

        @keyframes successProgressLine {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .login-input-field:focus {
          border-color: #0284C7 !important;
          background-color: #FFFFFF !important;
          box-shadow: 0 0 0 3.5px rgba(2, 132, 199, 0.15) !important;
        }

        .feature-pill-hover {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-pill-hover:hover {
          transform: translateY(-2px) scale(1.012);
          border-color: #BAE6FD !important;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.12) !important;
          background: rgba(255, 255, 255, 0.96) !important;
        }
      `}</style>

      {/* Synchronized Daytime Hospital Garden & Emerald Medical Healing Background */}
      <MedicalAuthBackground />

      {/* Main Two-Column Content Grid */}
      <main className="login-main-grid" style={{
        flex: 1,
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0.4rem 2rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: '3rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        minHeight: 0,
        animation: 'loginBloomExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>

        {/* ================= LEFT COLUMN: BRAND HERO & FROSTED GLASS FEATURE PILLS ================= */}
        <section className="login-brand-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '510px' }}>
          
          {/* Logo with Orbit Rings & Replay Intro Trigger */}
          <div style={{ position: 'relative', width: '82px', height: '82px', marginBottom: '0.1rem' }}>
            <div style={{
              position: 'absolute',
              inset: '-7px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(2, 132, 199, 0.45)',
              animation: 'haloSpinSlow 16s linear infinite',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '50%',
              border: '1.5px solid rgba(13, 148, 136, 0.4)',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              animation: 'haloSpinReverse 9s linear infinite',
              pointerEvents: 'none'
            }} />

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
                padding: '10px',
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
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                color: '#1D4ED8',
                padding: '0.24rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '900',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '0.45rem',
                boxShadow: '0 2px 8px rgba(29, 78, 216, 0.08)'
              }}
            >
              <FaHospital style={{ color: '#0284C7' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            {/* Main Hospital Name */}
            <h1 
              className="login-hospital-title"
              style={{
                fontSize: '2.05rem',
                fontWeight: '900',
                color: '#0F2C59',
                margin: '0 0 0.1rem 0',
                lineHeight: '1.15',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              TRUNG TÂM Y TẾ
            </h1>

            <h2 
              style={{
                fontSize: '2.2rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                lineHeight: '1.15',
                margin: '0 0 0.35rem 0',
                backgroundImage: 'linear-gradient(135deg, #0284C7 0%, #0D9488 60%, #059669 100%)',
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
                fontSize: '0.98rem',
                fontWeight: '800',
                color: '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginBottom: '0.3rem'
              }}
            >
              <FaHeartbeat style={{ color: '#0284C7', fontSize: '1.1rem' }} />
              <span>Hệ Thống Báo Cáo Giao Ban Chuyên Môn Trực Tuyến</span>
            </div>

            <p 
              className="login-desc-text"
              style={{
                fontSize: '0.84rem',
                color: '#475569',
                lineHeight: '1.45',
                margin: 0,
                maxWidth: '450px'
              }}
            >
              Nền tảng quản lý báo cáo giao ban y khoa trực tuyến — Nơi niềm tin, y đức và trách nhiệm cứu chữa người bệnh hội tụ.
            </p>
          </div>

          {/* 3 Frosted Glass Feature Cards (Phong cách Hình 1) */}
          <div className="login-feature-pills" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.15rem', maxWidth: '440px' }}>
            
            {/* Feature 1 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.55rem 0.95rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Bảo Mật & Chuẩn Hóa Y Tế</div>
                <div style={{ color: '#64748B', fontSize: '0.74rem' }}>Mã hóa dữ liệu phân quyền khoa phòng theo tiêu chuẩn ngành</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.55rem 0.95rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}>
                <FaClock />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Giao Ban Thời Gian Thực</div>
                <div style={{ color: '#64748B', fontSize: '0.74rem' }}>Tổng hợp chỉ số toàn viện tức thì chỉ với một thao tác</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-pill-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.55rem 0.95rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}>
                <FaChartBar />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Trình Chiếu & Xuất Báo Cáo</div>
                <div style={{ color: '#64748B', fontSize: '0.74rem' }}>Chế độ Slide toàn màn hình và xuất PDF văn bản lưu trữ</div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= RIGHT COLUMN: PRISTINE WHITE GLASS LOGIN CARD (HÌNH 1) ================= */}
        <section className="login-card-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="login-card-inner"
            style={{
              width: '100%',
              maxWidth: '475px',
              backgroundColor: 'rgba(255, 255, 255, 0.93)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: '24px',
              padding: '1.5rem 1.85rem',
              boxShadow: isSuccess
                ? '0 20px 50px rgba(16, 185, 129, 0.25), 0 0 0 2px #34D399'
                : error 
                ? '0 20px 50px rgba(239, 68, 68, 0.2), 0 0 0 2px #F87171'
                : '0 20px 60px rgba(15, 44, 89, 0.15), 0 0 0 1px rgba(2, 132, 199, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
              border: isSuccess ? '1.5px solid #10B981' : error ? '1.5px solid #EF4444' : '1.5px solid rgba(255, 255, 255, 1)',
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
                padding: '1.2rem 0.5rem',
                animation: 'successCardMorph 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
              }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-12px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                    animation: 'successRingPulse 1.6s ease-out infinite'
                  }} />
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    border: '2px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
                    animation: 'successCheckBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
                  }}>
                    <FaCheckCircle style={{ fontSize: '2.4rem', color: '#10B981' }} />
                  </div>
                </div>

                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  color: '#065F46',
                  margin: '0 0 0.35rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}>
                  Xác Thực Thành Công!
                </h3>

                <p style={{
                  fontSize: '0.92rem',
                  color: '#1E293B',
                  fontWeight: '700',
                  margin: '0 0 0.45rem 0'
                }}>
                  Chào mừng: <strong style={{ color: '#0284C7' }}>{successUser?.full_name || successUser?.fullName || successUser?.username || username}</strong>
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  padding: '0.3rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  color: '#15803D',
                  marginBottom: '1.2rem'
                }}>
                  <FaShieldAlt />
                  <span>{successUser?.role === 'admin' ? 'Quyền Quản Trị Hệ Thống' : `Khoa: ${successUser?.departmentName || successUser?.departmentCode || 'Chuyên Môn'}`}</span>
                </div>

                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981 0%, #0284C7 100%)',
                    borderRadius: '999px',
                    boxShadow: '0 0 10px #10B981',
                    animation: 'successProgressLine 0.9s cubic-bezier(0.4, 0, 0.2, 1) both'
                  }} />
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.55rem', fontWeight: '600' }}>
                  Đang mở cổng báo cáo giao ban chuyên môn...
                </span>
              </div>
            ) : (
              <>
                {/* Top Shield Icon Badge */}
                <div 
                  className="login-shield-badge"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: error ? '#FEF2F2' : '#EFF6FF',
                    border: error ? '1.5px solid #FECACA' : '1.5px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.65rem auto',
                    boxShadow: error ? '0 4px 14px rgba(239, 68, 68, 0.15)' : '0 4px 14px rgba(2, 132, 199, 0.12)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaShieldAlt style={{ fontSize: '1.5rem', color: error ? '#DC2626' : '#0284C7' }} />
                </div>

                {/* Heading */}
                <h3 
                  className="login-card-title"
                  style={{
                    fontSize: '1.38rem',
                    fontWeight: '900',
                    color: '#0F2C59',
                    margin: '0 0 0.18rem 0',
                    textAlign: 'center',
                    letterSpacing: '0.4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  CHÀO MỪNG TRỞ LẠI!
                </h3>

                <p 
                  className="login-card-subtitle"
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    margin: '0 0 0.95rem 0',
                    textAlign: 'center'
                  }}
                >
                  Cổng Đăng Nhập Quản Trị & Báo Cáo Giao Ban Trực Tuyến
                </p>

                {/* Error Alert */}
                {error && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #F87171',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    color: '#991B1B',
                    fontSize: '0.82rem',
                    marginBottom: '0.95rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                    lineHeight: '1.35',
                    boxShadow: '0 3px 12px rgba(239, 68, 68, 0.12)',
                    animation: 'errorSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
                  }}>
                    <div style={{ color: '#DC2626', fontSize: '1.05rem', marginTop: '1px' }}>
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#991B1B', marginBottom: '1px', fontSize: '0.82rem' }}>
                        Đăng Nhập Không Thành Công
                      </div>
                      <div style={{ color: '#B91C1C', fontWeight: '600' }}>
                        {typeof error === 'string' ? error : (error?.message || 'Lỗi đăng nhập')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* Field 1: Username */}
                  <div>
                    <label style={{
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.3rem',
                      letterSpacing: '0.2px'
                    }}>
                      Tên đăng nhập khoa phòng / Quản trị
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaUser style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.95rem',
                        transform: 'translateY(-50%)',
                        color: error ? '#EF4444' : '#0284C7',
                        fontSize: '0.88rem',
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
                          padding: '0.65rem 0.85rem 0.65rem 2.55rem',
                          border: error ? '1.5px solid #F87171' : '1.5px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          outline: 'none',
                          backgroundColor: '#F8FAFC',
                          color: '#0F2C59',
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
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.3rem',
                      letterSpacing: '0.2px'
                    }}>
                      Mật khẩu
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.95rem',
                        transform: 'translateY(-50%)',
                        color: error ? '#EF4444' : '#0284C7',
                        fontSize: '0.88rem',
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
                          padding: '0.65rem 2.55rem 0.65rem 2.55rem',
                          border: error ? '1.5px solid #F87171' : '1.5px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          outline: 'none',
                          backgroundColor: '#F8FAFC',
                          color: '#0F2C59',
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
                          right: '0.8rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
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
                    fontSize: '0.78rem',
                    marginTop: '0.05rem'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#475569',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: '15px',
                          height: '15px',
                          accentColor: '#0284C7',
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
                        color: '#0284C7',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: 0
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
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: '0.96rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                      transition: 'all 0.22s ease',
                      marginTop: '0.3rem',
                      letterSpacing: '0.3px'
                    }}
                    onMouseOver={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.45)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.35)';
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
                  <div style={{ marginTop: '0.55rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                    Chưa có tài khoản nhân viên?{' '}
                    <Link to="/register" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      Đăng ký ngay <FaArrowRight style={{ fontSize: '0.72rem' }} />
                    </Link>
                  </div>

                </form>
              </>
            )}

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1rem 0 0.75rem 0',
              color: '#64748B',
              fontSize: '0.72rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, transparent, #CBD5E1)' }} />
              <div style={{
                padding: '0.2rem 0.85rem',
                backgroundColor: '#F1F5F9',
                borderRadius: '999px',
                border: '1px solid #E2E8F0',
                color: '#0F2C59',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <FaShieldAlt style={{ color: '#0284C7', fontSize: '0.75rem' }} />
                <span>THÔNG TIN HỆ THỐNG</span>
              </div>
              <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, #CBD5E1, transparent)' }} />
            </div>

            {/* 4 Prominent High-Contrast System Badges Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.45rem'
            }}>
              {/* Badge 1: Version (Ultra Eye-Catching Glowing Card) */}
              <div 
                onClick={() => setShowVersionModal(true)}
                title="✨ Nhấp để khám phá toàn bộ tính năng đột phá của phiên bản v2.0.0!"
                style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 45%, #E0F2FE 100%)',
                  border: '2px solid #38BDF8',
                  borderRadius: '12px',
                  padding: '0.45rem 0.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.18rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(2, 132, 199, 0.35), 0 3px 10px rgba(2, 132, 199, 0.18)',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'versionCardGlow 2.5s infinite ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 0 22px rgba(14, 165, 233, 0.7), 0 8px 20px rgba(2, 132, 199, 0.35)';
                  e.currentTarget.style.borderColor = '#0284C7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(2, 132, 199, 0.35), 0 3px 10px rgba(2, 132, 199, 0.18)';
                  e.currentTarget.style.borderColor = '#38BDF8';
                }}
              >
                <div style={{ fontSize: '0.64rem', color: '#1E40AF', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaCodeBranch style={{ color: '#0284C7', fontSize: '0.7rem' }} /> Phiên bản
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  v{APP_VERSION}
                  <span style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.52rem',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    fontWeight: '900',
                    letterSpacing: '0.4px',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
                    animation: 'sparkleBounce 1.8s infinite ease-in-out'
                  }}>
                    🚀 MỚI
                  </span>
                </div>
                <div style={{
                  fontSize: '0.58rem',
                  color: '#0284C7',
                  fontWeight: '900',
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid #BAE6FD',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginTop: '1px'
                }}>
                  ✨ Xem có gì mới? 👉
                </div>
              </div>

              {/* Badge 2: Database */}
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1.5px solid #86EFAC',
                borderRadius: '10px',
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(5, 150, 105, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.08)';
              }}
              >
                <div style={{ fontSize: '0.64rem', color: '#15803D', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaDatabase style={{ color: '#059669', fontSize: '0.68rem' }} /> CSDL Cloud
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: '900', color: '#065F46', whiteSpace: 'nowrap' }}>
                  Aiven SSL
                </div>
                <span style={{ fontSize: '0.58rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} /> 256-bit Online
                </span>
              </div>

              {/* Badge 3: Author */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                border: '1.5px solid #C7D2FE',
                borderRadius: '10px',
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(79, 70, 229, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.08)';
              }}
              >
                <div style={{ fontSize: '0.64rem', color: '#4338CA', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaUser style={{ color: '#4F46E5', fontSize: '0.68rem' }} /> Tác giả
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: '900', color: '#1E1B4B', lineHeight: '1.15' }}>
                  Nhật Nam
                </div>
                <span style={{ fontSize: '0.58rem', color: '#4F46E5', fontWeight: '800' }}>
                  Phòng KHNV
                </span>
              </div>

              {/* Badge 4: Contact Support */}
              <a
                href="https://zalo.me/0916337266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                  border: '1.5px solid #7DD3FC',
                  borderRadius: '10px',
                  padding: '0.45rem 0.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(2, 132, 199, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.08)';
                }}
              >
                <div style={{ fontSize: '0.64rem', color: '#0369A1', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaPhoneAlt style={{ color: '#0284C7', fontSize: '0.68rem' }} /> Kỹ thuật 24/7
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.52rem', padding: '0.05rem 0.25rem', borderRadius: '3px', fontWeight: '900' }}>Zalo</span> 0916...
                </div>
                <span style={{ fontSize: '0.58rem', color: '#0284C7', fontWeight: '800' }}>
                  Chat trực tiếp ➔
                </span>
              </a>

            </div>

          </div>
        </section>

      </main>

      {/* Sleek Light Medical Footer */}
      <footer style={{
        padding: '0.45rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#475569',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        © 2026 <strong style={{ color: '#0F2C59' }}>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />

      {/* Version 2.0.0 Changelog Details Modal */}
      <VersionChangelogModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
      />

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
