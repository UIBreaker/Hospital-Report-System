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
  FaHeartbeat
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

    // Victory Triad Arpeggio (C5 -> E5 -> G5 -> C6)
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

    // Low-end Error Thud
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
        return;
      }

      // Success State Activation
      setIsSuccess(true);
      setSuccessUser(loggedInUser);
      playLoginSuccessSound();

      setTimeout(() => {
        navigate(loggedInUser.role === 'admin' ? '/admin' : '/report');
      }, 950);

    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      const formattedErr = typeof errMsg === 'string' ? errMsg : (errMsg?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      triggerErrorFeedback(formattedErr);
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
      background: 'linear-gradient(125deg, #DCEEFE 0%, #C7E5FD 18%, #93C5FD 42%, #3B82F6 72%, #10B981 100%)',
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

      {/* Blooming & Feedback Transition Styles for Login Content */}
      <style>{`
        @keyframes loginBloomExpand {
          0% {
            opacity: 0.5;
            transform: scale(0.96);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
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

        @keyframes errorSlideDown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.96); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes errorIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.22); filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8)); }
        }

        @keyframes successCardMorph {
          0% { opacity: 0; transform: scale(0.92); filter: blur(6px); }
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
      `}</style>

      {/* Synchronized Dynamic Medical Background (ECG Canvas, Nano Particles, Auroras, Dot Grid) */}
      <MedicalAuthBackground />

      {/* Main Two-Column Content Grid */}
      <main className="login-main-grid" style={{
        flex: 1,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 2.5rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '3.5rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        minHeight: 0,
        animation: 'loginBloomExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>

        {/* ================= LEFT COLUMN: BRAND IDENTITY & FEATURE PILLS ================= */}
        <section className="login-brand-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '470px' }}>
          
          {/* Logo with Soft Glow & Replay Intro Trigger */}
          <div 
            className="login-logo-circle"
            onClick={() => setShowIntro(true)}
            title="Xem lại hiệu ứng giới thiệu Cổng Thông Tin"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(2, 132, 199, 0.22), 0 0 0 3.5px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              marginBottom: '0.15rem',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="/logo.png" 
              alt="Logo TTYT Bình Long" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Titles & Headings */}
          <div>
            <div 
              className="login-agency-badge"
              style={{
                display: 'inline-block',
                backgroundColor: '#DBEAFE',
                color: '#1D4ED8',
                padding: '0.24rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '0.45rem',
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.08)'
              }}
            >
              SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            <h1 
              className="login-hospital-title"
              style={{
                fontSize: '1.9rem',
                fontWeight: '900',
                color: '#0F2C59',
                margin: '0 0 0.25rem 0',
                lineHeight: '1.18',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              TRUNG TÂM Y TẾ<br className="hide-on-mobile"/>KHU VỰC BÌNH LONG
            </h1>

            <h2 
              className="login-system-title"
              style={{
                fontSize: '1.45rem',
                fontWeight: '800',
                margin: '0 0 0.4rem 0',
                background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.2px'
              }}
            >
              Hệ Thống Báo Cáo Giao Ban
            </h2>

            <p 
              className="login-desc-text"
              style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: '1.45',
                margin: 0,
                maxWidth: '430px'
              }}
            >
              Nền tảng quản lý báo cáo giao ban nhanh chóng, chính xác và hiệu quả cho các đơn vị y tế.
            </p>
          </div>

          {/* 3 Translucent Frosted Glass Feature Cards */}
          <div className="login-feature-pills" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.25rem', maxWidth: '385px' }}>
            
            {/* Feature 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '0.55rem 0.9rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
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
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Bảo mật & An toàn</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn cao nhất</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '0.55rem 0.9rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}>
                <FaClock />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Nhanh chóng & Hiệu quả</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Tối ưu quy trình, tiết kiệm thời gian và nâng cao hiệu suất</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '0.55rem 0.9rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}>
                <FaChartBar />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Báo cáo chính xác</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Thống kê và tổng hợp dữ liệu trực quan, chính xác</div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= RIGHT COLUMN: CRISP WHITE LOGIN CARD ================= */}
        <section className="login-card-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="login-card-inner"
            style={{
              width: '100%',
              maxWidth: '485px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.75rem 2rem',
              boxShadow: isSuccess
                ? '0 25px 60px rgba(16, 185, 129, 0.28), 0 0 0 2px rgba(16, 185, 129, 0.5)'
                : error 
                ? '0 25px 60px rgba(239, 68, 68, 0.22), 0 0 0 2px rgba(239, 68, 68, 0.4)'
                : '0 25px 60px rgba(15, 44, 89, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: isSuccess ? '1.5px solid #6EE7B7' : error ? '1.5px solid #FCA5A5' : '1px solid rgba(255, 255, 255, 0.95)',
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
                {/* Glowing Success Sphere with Animated Ripple Ring */}
                <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-12px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 70%)',
                    animation: 'successRingPulse 1.6s ease-out infinite'
                  }} />
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    border: '2px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)',
                    animation: 'successCheckBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
                  }}>
                    <FaCheckCircle style={{ fontSize: '2.5rem', color: '#10B981' }} />
                  </div>
                </div>

                <h3 style={{
                  fontSize: '1.45rem',
                  fontWeight: '900',
                  color: '#065F46',
                  margin: '0 0 0.4rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}>
                  Xác Thực Thành Công!
                </h3>

                <p style={{
                  fontSize: '0.94rem',
                  color: '#1E293B',
                  fontWeight: '700',
                  margin: '0 0 0.4rem 0'
                }}>
                  Chào mừng: <strong style={{ color: '#0284C7' }}>{successUser?.full_name || successUser?.fullName || successUser?.username || username}</strong>
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#15803D',
                  marginBottom: '1.4rem'
                }}>
                  <FaShieldAlt />
                  <span>{successUser?.role === 'admin' ? 'Quyền Quản Trị Hệ Thống' : `Khoa: ${successUser?.departmentName || successUser?.departmentCode || 'Chuyên Môn'}`}</span>
                </div>

                {/* Progress bar line */}
                <div style={{
                  width: '100%',
                  height: '6px',
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
                <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.6rem', fontWeight: '600' }}>
                  Đang mở cổng giao ban chuyên môn...
                </span>
              </div>
            ) : (
              <>
                {/* Top Shield Icon Badge */}
                <div 
                  className="login-shield-badge"
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: error ? '#FEF2F2' : '#EFF6FF',
                    border: error ? '1.5px solid #FECACA' : '1.5px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem auto',
                    boxShadow: error ? '0 4px 14px rgba(239, 68, 68, 0.15)' : '0 4px 14px rgba(37, 99, 235, 0.12)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaShieldAlt style={{ fontSize: '1.65rem', color: error ? '#DC2626' : '#2563EB' }} />
                </div>

                {/* Heading */}
                <h3 
                  className="login-card-title"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: '800',
                    color: '#0F2C59',
                    margin: '0 0 0.2rem 0',
                    textAlign: 'center',
                    letterSpacing: '0.2px'
                  }}
                >
                  Chào mừng bạn trở lại!
                </h3>

                <p 
                  className="login-card-subtitle"
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748B',
                    margin: '0 0 1.15rem 0',
                    textAlign: 'center'
                  }}
                >
                  Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
                </p>

                {/* Enhanced Animated Error Alert */}
                {error && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                    border: '1.5px solid #F87171',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: '#991B1B',
                    fontSize: '0.84rem',
                    marginBottom: '1.15rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    lineHeight: '1.4',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
                    animation: 'errorSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
                  }}>
                    <div style={{ animation: 'errorIconPulse 1.6s ease-in-out infinite', color: '#DC2626', fontSize: '1.15rem', marginTop: '1px' }}>
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#991B1B', marginBottom: '2px', fontSize: '0.86rem' }}>
                        Đăng Nhập Không Thành Công
                      </div>
                      <div style={{ color: '#B91C1C', fontWeight: '600' }}>
                        {typeof error === 'string' ? error : (error?.message || 'Lỗi đăng nhập')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Field 1: Username */}
                  <div>
                    <label style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.35rem'
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
                        fontSize: '0.9rem',
                        transition: 'color 0.2s ease'
                      }} />
                      <input
                        type="text"
                        placeholder="VD: Khnv hoặc noi.bvbl..."
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError('');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem 0.7rem 2.55rem',
                          border: error ? '1.5px solid #F87171' : '1.5px solid #E2E8F0',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: error ? '#FFF5F5' : '#F8FAFC',
                          color: '#0F2C59',
                          fontWeight: '600',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = error ? '#EF4444' : '#0284C7';
                          e.target.style.backgroundColor = '#FFFFFF';
                          e.target.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : '0 0 0 3px rgba(2, 132, 199, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = error ? '#F87171' : '#E2E8F0';
                          e.target.style.backgroundColor = error ? '#FFF5F5' : '#F8FAFC';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

              {/* Field 2: Password */}
              <div>
                <label style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#334155',
                  display: 'block',
                  marginBottom: '0.35rem'
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
                    fontSize: '0.9rem',
                    transition: 'color 0.2s ease'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.65rem 0.7rem 2.55rem',
                      border: error ? '1.5px solid #F87171' : '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: error ? '#FFF5F5' : '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = error ? '#EF4444' : '#0284C7';
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : '0 0 0 3px rgba(2, 132, 199, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? '#F87171' : '#E2E8F0';
                      e.target.style.backgroundColor = error ? '#FFF5F5' : '#F8FAFC';
                      e.target.style.boxShadow = 'none';
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
                      fontSize: '0.92rem',
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
                fontSize: '0.8rem',
                marginTop: '0.05rem'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '15px',
                      height: '15px',
                      accentColor: '#10B981',
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
                    fontWeight: '700',
                    fontSize: '0.8rem',
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
                  padding: '0.8rem 1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.32)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.35rem',
                  letterSpacing: '0.2px'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.42)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.32)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" /> Đang xác thực...
                  </>
                ) : (
                  <>
                    <FaSignInAlt /> Đăng Nhập Hệ Thống <FaArrowRight />
                  </>
                )}
              </button>
              {/* Register Link */}
              <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                Chưa có tài khoản nhân viên?{' '}
                <Link to="/register" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none' }}>
                  Đăng ký ngay
                </Link>
              </div>

            </form>
          </>
        )}

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.05rem 0 0.75rem 0',
              color: '#94A3B8',
              fontSize: '0.7rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              <span style={{ padding: '0 0.65rem' }}>Thông tin hệ thống</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            </div>

            {/* 4 System Badges Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem'
            }}>
              {/* Badge 1: Version */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.4rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.12rem'
              }}>
                <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaCodeBranch style={{ color: '#0284C7', fontSize: '0.62rem' }} /> Phiên bản
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F2C59' }}>
                  v{APP_VERSION}
                </div>
              </div>

              {/* Badge 2: Database */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.4rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.12rem'
              }}>
                <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaDatabase style={{ color: '#059669', fontSize: '0.62rem' }} /> Cơ sở dữ liệu
                </div>
                <div style={{ fontSize: '0.69rem', fontWeight: '800', color: '#0F2C59', whiteSpace: 'nowrap' }}>
                  Aiven MySQL SSL
                </div>
              </div>

              {/* Badge 3: Author */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.4rem 0.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.12rem'
              }}>
                <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaUser style={{ color: '#2563EB', fontSize: '0.62rem' }} /> Phát triển bởi
                </div>
                <div style={{ fontSize: '0.67rem', fontWeight: '800', color: '#0F2C59', lineHeight: '1.2' }}>
                  Nguyễn Vũ Nhật Nam <span style={{ color: '#64748B', fontSize: '0.62rem' }}>(UIBreaker)</span>
                </div>
              </div>

              {/* Badge 4: Contact */}
              <a
                href="https://zalo.me/0916337266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '0.4rem 0.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.12rem',
                  textDecoration: 'none'
                }}
              >
                <div style={{ fontSize: '0.64rem', color: '#0284C7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaPhoneAlt style={{ color: '#0284C7', fontSize: '0.62rem' }} /> Liên hệ hỗ trợ
                </div>
                <div style={{ fontSize: '0.69rem', fontWeight: '800', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.55rem', padding: '0.05rem 0.22rem', borderRadius: '3px', fontWeight: '900' }}>Zalo</span> 0916.337.266
                </div>
              </a>

            </div>

          </div>
        </section>

      </main>

      {/* Compact Footer */}
      <footer style={{
        padding: '0.55rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#475569',
        borderTop: '1px solid rgba(255, 255, 255, 0.45)',
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(6px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        © 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
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

      {/* Old Modal Comment */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
            animation: 'scaleUp 0.25s ease-out'
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>

            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 0.75rem auto'
            }}>
              <FaHeadset />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F2C59', margin: '0 0 0.35rem 0' }}>
              Hỗ Trợ Tài Khoản & Mật Khẩu
            </h3>

            <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.45', margin: '0 0 1.25rem 0' }}>
              Nếu khoa/phòng quên mật khẩu hoặc cần cấp lại thông tin đăng nhập, vui lòng liên hệ trực tiếp:
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              textAlign: 'left',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.4rem' }}>
                🏢 <strong>Đơn vị phụ trách:</strong> Phòng Kế Hoạch - Nghiệp Vụ
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.4rem' }}>
                👨‍💻 <strong>Kỹ thuật viên:</strong> Nguyễn Vũ Nhật Nam
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                📞 <strong>Hotline / Zalo:</strong> <a href="https://zalo.me/0916337266" target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none' }}>0916.337.266</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
              <a
                href="https://zalo.me/0916337266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.55rem 1.15rem',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Nhắn tin qua Zalo
              </a>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{
                  padding: '0.55rem 1.15rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
