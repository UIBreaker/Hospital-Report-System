import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaCodeBranch, 
  FaGithub, 
  FaPhoneAlt, 
  FaHospital, 
  FaArrowRight,
  FaDatabase
} from 'react-icons/fa';
import { APP_VERSION } from '../config/version';
import AIAssistant from '../components/common/AIAssistant';
import { Button, Notice, Badge } from '../components/ui';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/report');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
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
    <main className="login-wrapper">
      {/* Decorative ambient background lights */}
      <div className="login-bg-overlay" aria-hidden="true" />
      <div 
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
          bottom: '-80px',
          left: '-80px',
          pointerEvents: 'none'
        }} 
        aria-hidden="true" 
      />

      {/* Main Login Card */}
      <div className="glass-card login-card animate-slide-up">
        {/* Hospital Branding Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(15, 44, 89, 0.12), 0 0 0 1px #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            marginBottom: '0.65rem'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo Trung Tâm Y Tế Khu Vực Bình Long" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.15rem 0.6rem',
            borderRadius: '999px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            fontSize: '0.68rem',
            fontWeight: '800',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '0.3rem'
          }}>
            <FaHospital style={{ color: '#2563EB' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
          </div>

          <h2 style={{ color: '#0F2C59', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase', margin: '0 0 0.15rem' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </h2>
          <h1 style={{ color: '#DC2626', fontSize: '1.28rem', fontWeight: '900', margin: '0 0 0.2rem', letterSpacing: '-0.2px' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.78rem', margin: 0 }}>
            Đăng nhập tài khoản khoa phòng hoặc quản trị
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <Notice tone="danger" style={{ marginBottom: '0.85rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} onClose={() => setError('')}>
            {error}
          </Notice>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Username Field */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="login-username" style={{ color: '#1E293B', fontWeight: '700', fontSize: '0.78rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaUser style={{ color: '#1E40AF', fontSize: '0.75rem' }} /> Tên đăng nhập khoa phòng / Quản trị
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-username"
                type="text" 
                placeholder="VD: Khnv hoặc noi.bvbl" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  paddingLeft: '0.85rem', 
                  height: '42px', 
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#0F172A',
                  transition: 'all 0.2s ease'
                }}
                autoComplete="username"
                autoFocus
                required 
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="login-password" style={{ color: '#1E293B', fontWeight: '700', fontSize: '0.78rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaLock style={{ color: '#1E40AF', fontSize: '0.75rem' }} /> Mật khẩu ca trực
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu ca trực" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  paddingLeft: '0.85rem', 
                  paddingRight: '2.6rem', 
                  height: '42px', 
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#0F172A',
                  transition: 'all 0.2s ease'
                }}
                autoComplete="current-password"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  right: '0.5rem', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748B', 
                  cursor: 'pointer', 
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem'
                }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
            disabled={!username || !password}
            fullWidth
            style={{ 
              marginTop: '0.2rem', 
              height: '44px', 
              fontSize: '0.95rem', 
              borderRadius: '10px',
              fontWeight: '700',
              boxShadow: '0 6px 16px rgba(15, 44, 89, 0.25)'
            }}
          >
            Đăng Nhập Hệ Thống <FaArrowRight style={{ marginLeft: '0.4rem', fontSize: '0.8rem' }} />
          </Button>
        </form>

        {/* Integrated Info Block inside Card */}
        <div style={{ 
          marginTop: '1.15rem', 
          paddingTop: '0.85rem', 
          borderTop: '1px solid #E2E8F0', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.55rem',
          fontSize: '0.74rem'
        }}>
          {/* Row 1: Version & Database SSL */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#1E40AF', fontWeight: '700', backgroundColor: '#EFF6FF', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
              <FaCodeBranch style={{ color: '#2563EB', fontSize: '0.7rem' }} /> Phiên bản <strong>v{APP_VERSION}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: '600', backgroundColor: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
              Aiven Cloud MySQL SSL
            </span>
          </div>

          {/* Row 2: Author GitHub & Phone Contact */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.2rem' }}>
            <a
              href="https://github.com/UIBreaker"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub của tác giả Nguyễn Vũ Nhật Nam"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                color: '#0F2C59', 
                fontWeight: '700', 
                textDecoration: 'none',
                padding: '0.15rem 0.45rem',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9'
              }}
            >
              <FaGithub style={{ fontSize: '0.85rem' }} />
              <span>Phát triển bởi: <strong>Nguyễn Vũ Nhật Nam</strong> (UIBreaker)</span>
            </a>

            <a 
              href="https://zalo.me/0916337266" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#0284C7', 
                fontWeight: '800', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                backgroundColor: '#F0F9FF',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                border: '1px solid #BAE6FD',
                transition: 'all 0.2s ease'
              }}
              title="Nhắn tin Zalo tác giả: 0916337266"
            >
              <span style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: '900', padding: '1px 4px', borderRadius: '4px' }}>Zalo</span>
              <span>0916.337.266</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Ultra-compact Footer (No Overflow) */}
      <footer style={{ 
        marginTop: '1.2rem', 
        color: 'rgba(255, 255, 255, 0.75)', 
        fontSize: '0.72rem', 
        textAlign: 'center', 
        position: 'relative',
        zIndex: 10,
        maxWidth: '460px'
      }}>
        &copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />
    </main>
  );
};

export default LoginPage;


