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
  FaArrowRight 
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
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)',
          bottom: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }} 
        aria-hidden="true" 
      />

      {/* Main Login Card */}
      <div className="glass-card login-card animate-slide-up">
        {/* Hospital Branding Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '22px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 12px 28px rgba(15, 44, 89, 0.15), 0 0 0 1px #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            marginBottom: '1rem',
            transition: 'transform 0.3s ease'
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
            gap: '0.35rem',
            padding: '0.2rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: '0.45rem'
          }}>
            <FaHospital style={{ color: '#2563EB' }} /> SỞ Y TẾ TỈNH BÌNH PHƯỚC
          </div>

          <h2 style={{ color: '#0F2C59', fontSize: '0.88rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </h2>
          <h1 style={{ color: '#DC2626', fontSize: '1.45rem', fontWeight: '900', margin: '0.15rem 0 0.35rem', letterSpacing: '-0.3px' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
            Cổng thông tin báo cáo ca trực & giao ban y tế trực tuyến
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <Notice tone="danger" style={{ marginBottom: '1.25rem' }} onClose={() => setError('')}>
            {error}
          </Notice>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Username Field */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="login-username" style={{ color: '#1E293B', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaUser style={{ color: '#1E40AF', fontSize: '0.8rem' }} /> Tên đăng nhập khoa phòng / Quản trị
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-username"
                type="text" 
                placeholder="VD: Khnv hoặc noi.bvbl" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  paddingLeft: '1rem', 
                  height: '46px', 
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
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
            <label htmlFor="login-password" style={{ color: '#1E293B', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaLock style={{ color: '#1E40AF', fontSize: '0.8rem' }} /> Mật khẩu ca trực
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu ca trực" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  paddingLeft: '1rem', 
                  paddingRight: '2.8rem', 
                  height: '46px', 
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
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
                  right: '0.6rem', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748B', 
                  cursor: 'pointer', 
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
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
              marginTop: '0.35rem', 
              height: '48px', 
              fontSize: '1rem', 
              borderRadius: '12px',
              fontWeight: '700',
              boxShadow: '0 8px 20px rgba(15, 44, 89, 0.3)'
            }}
          >
            Đăng Nhập Hệ Thống <FaArrowRight style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }} />
          </Button>
        </form>

        {/* In-card Footer info */}
        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #E2E8F0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '0.75rem', 
          color: '#64748B' 
        }}>
          <Badge tone="primary" dot>
            Phiên bản <strong>v{APP_VERSION}</strong>
          </Badge>
          <a
            href="https://github.com/UIBreaker"
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              color: '#0F2C59', 
              fontWeight: '700', 
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: '#F1F5F9'
            }}
          >
            <FaGithub /> UIBreaker
          </a>
        </div>
      </div>
      
      {/* Bottom Copyright, Author Credit & Phone Contact */}
      <footer style={{ 
        marginTop: '1.5rem', 
        color: 'rgba(255, 255, 255, 0.9)', 
        fontSize: '0.82rem', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.4rem',
        position: 'relative',
        zIndex: 10,
        maxWidth: '520px',
        padding: '0 1rem'
      }}>
        <div>&copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong>. Tất cả quyền được bảo lưu.</div>
        <div style={{ 
          fontSize: '0.78rem', 
          color: 'rgba(255, 255, 255, 0.85)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span>Phát triển bởi <strong>Nguyễn Vũ Nhật Nam</strong> (Phòng Kế Hoạch - Nghiệp Vụ)</span>
          <span>•</span>
          <a 
            href="tel:0916337266" 
            style={{ 
              color: '#67E8F9', 
              fontWeight: '800', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              backgroundColor: 'rgba(15, 44, 89, 0.6)',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(103, 232, 249, 0.4)'
            }}
            title="Bấm để gọi hỗ trợ kỹ thuật"
          >
            <FaPhoneAlt style={{ fontSize: '0.7rem' }} /> SĐT: 0916.337.266
          </a>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />
    </main>
  );
};

export default LoginPage;


