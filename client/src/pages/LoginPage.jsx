import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaHeadset
} from 'react-icons/fa';
import { APP_VERSION } from '../config/version';
import AIAssistant from '../components/common/AIAssistant';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const { login, user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-fill remembered username on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('saved_hospital_username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/report');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
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
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/report');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu.');
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
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #D8EEFE 25%, #E6F6FF 50%, #DCFCE7 80%, #BBF7D0 100%)',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>

      {/* 1. Decorative Hospital Building Blurred Image in Background */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '58%',
          maxWidth: '850px',
          height: '65%',
          backgroundImage: "url('/hospital_building_new.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          opacity: 0.22,
          filter: 'blur(1px) contrast(1.05)',
          WebkitMaskImage: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)',
          maskImage: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* 2. Top-Right Decorative Dot Grid Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: '2.5rem',
          right: '3rem',
          width: '240px',
          height: '180px',
          backgroundImage: 'radial-gradient(#0284C7 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* 3. Decorative Glowing Circular Accents */}
      <div 
        style={{
          position: 'absolute',
          top: '16%',
          left: '4.5%',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#06B6D4',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.7)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />
      <div 
        style={{
          position: 'absolute',
          top: '32%',
          left: '38%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* Main Two-Column Content Grid */}
      <main style={{
        maxWidth: '1280px',
        margin: 'auto',
        padding: '3rem 2rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>

        {/* ================= LEFT COLUMN: BRAND IDENTITY & FEATURES ================= */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '540px' }}>
          
          {/* Logo with Soft Glow */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo TTYT Bình Long" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Titles & Headings */}
          <div>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '800',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
              boxShadow: '0 2px 6px rgba(29, 78, 216, 0.1)'
            }}>
              SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            <h1 style={{
              fontSize: '2.15rem',
              fontWeight: '900',
              color: '#0F2C59',
              margin: '0 0 0.5rem 0',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              TRUNG TÂM Y TẾ<br/>KHU VỰC BÌNH LONG
            </h1>

            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: '800',
              margin: '0 0 1rem 0',
              background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.3px'
            }}>
              Hệ Thống Báo Cáo Giao Ban
            </h2>

            <p style={{
              fontSize: '0.95rem',
              color: '#475569',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '480px'
            }}>
              Nền tảng quản lý báo cáo giao ban nhanh chóng, chính xác và hiệu quả cho các đơn vị y tế.
            </p>
          </div>

          {/* 3 Feature Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.5rem' }}>
            
            {/* Feature 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 15px rgba(15, 44, 89, 0.05)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.15rem'
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.92rem' }}>Bảo mật & An toàn</div>
                <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn cao nhất</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 15px rgba(15, 44, 89, 0.05)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.15rem'
              }}>
                <FaClock />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.92rem' }}>Nhanh chóng & Hiệu quả</div>
                <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Tối ưu quy trình, tiết kiệm thời gian và nâng cao hiệu suất</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 15px rgba(15, 44, 89, 0.05)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.15rem'
              }}>
                <FaChartBar />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.92rem' }}>Báo cáo chính xác</div>
                <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Thống kê và tổng hợp dữ liệu trực quan, chính xác</div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= RIGHT COLUMN: WHITE FROSTED LOGIN CARD ================= */}
        <section style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '490px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2.5rem 2.25rem',
            boxShadow: '0 20px 50px rgba(15, 44, 89, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.95)'
          }}>

            {/* Top Shield Icon Badge */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem auto',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
            }}>
              <FaShieldAlt style={{ fontSize: '1.85rem', color: '#2563EB' }} />
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '1.45rem',
              fontWeight: '800',
              color: '#0F2C59',
              margin: '0 0 0.35rem 0',
              textAlign: 'center',
              letterSpacing: '0.2px'
            }}>
              Chào mừng bạn trở lại!
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: '#64748B',
              margin: '0 0 1.5rem 0',
              textAlign: 'center'
            }}>
              Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
            </p>

            {/* Error Alert */}
            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                lineHeight: '1.4'
              }}>
                <FaInfoCircle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Field 1: Username */}
              <div>
                <label style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#334155',
                  display: 'block',
                  marginBottom: '0.4rem'
                }}>
                  Tên đăng nhập khoa phòng / Quản trị
                </label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    color: '#0284C7',
                    fontSize: '0.95rem'
                  }} />
                  <input
                    type="text"
                    placeholder="VD: Khnv hoặc noi.bvbl..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 2.75rem',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284C7';
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <label style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#334155',
                  display: 'block',
                  marginBottom: '0.4rem'
                }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    color: '#0284C7',
                    fontSize: '0.95rem'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 2.85rem 0.8rem 2.75rem',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284C7';
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
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
                    fontSize: '0.82rem',
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
                  padding: '0.88rem 1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem',
                  letterSpacing: '0.3px'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.45)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
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

            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.75rem 0 1rem 0',
              color: '#94A3B8',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              <span style={{ padding: '0 0.75rem' }}>Thông tin hệ thống</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            </div>

            {/* 4 System Badges Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.45rem'
            }}>
              {/* Badge 1: Version */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.45rem 0.3rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaCodeBranch style={{ color: '#0284C7', fontSize: '0.65rem' }} /> Phiên bản
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0F2C59' }}>
                  v{APP_VERSION}
                </div>
              </div>

              {/* Badge 2: Database */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.45rem 0.3rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaDatabase style={{ color: '#059669', fontSize: '0.65rem' }} /> Cơ sở dữ liệu
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F2C59', whiteSpace: 'nowrap' }}>
                  Aiven MySQL SSL
                </div>
              </div>

              {/* Badge 3: Author */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.45rem 0.3rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaUser style={{ color: '#2563EB', fontSize: '0.65rem' }} /> Phát triển bởi
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0F2C59', lineHeight: '1.2' }}>
                  Nguyễn Vũ Nhật Nam <span style={{ color: '#64748B', fontSize: '0.65rem' }}>(UIBreaker)</span>
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
                  padding: '0.45rem 0.3rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  textDecoration: 'none'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FaPhoneAlt style={{ color: '#0284C7', fontSize: '0.65rem' }} /> Liên hệ hỗ trợ
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.58rem', padding: '0.05rem 0.25rem', borderRadius: '3px', fontWeight: '900' }}>Zalo</span> 0916.337.266
                </div>
              </a>

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem 2rem',
        textAlign: 'center',
        fontSize: '0.84rem',
        color: '#475569',
        borderTop: '1px solid rgba(255, 255, 255, 0.45)',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(6px)',
        position: 'relative',
        zIndex: 10
      }}>
        © 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />

      {/* Forgot Password Modal */}
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
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem',
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
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.65rem',
              margin: '0 auto 1rem auto'
            }}>
              <FaHeadset />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
              Hỗ Trợ Tài Khoản & Mật Khẩu
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              Nếu khoa/phòng quên mật khẩu hoặc cần cấp lại thông tin đăng nhập, vui lòng liên hệ trực tiếp:
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                🏢 <strong>Đơn vị phụ trách:</strong> Phòng Kế Hoạch - Nghiệp Vụ
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                👨‍💻 <strong>Kỹ thuật viên:</strong> Nguyễn Vũ Nhật Nam
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                📞 <strong>Hotline / Zalo:</strong> <a href="https://zalo.me/0916337266" target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none' }}>0916.337.266</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a
                href="https://zalo.me/0916337266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Nhắn tin qua Zalo
              </a>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
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
