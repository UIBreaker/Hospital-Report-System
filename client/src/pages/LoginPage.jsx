import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCodeBranch, FaGithub, FaShieldAlt } from 'react-icons/fa';
import { APP_VERSION } from '../config/version';
import AIAssistant from '../components/common/AIAssistant';
import { Button, Notice } from '../components/ui';

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
      {/* Decorative ambient background circle */}
      <div className="login-bg-overlay" aria-hidden="true" />

      <div className="glass-card login-card animate-slide-up" style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(15, 44, 89, 0.12)',
            border: '1px solid #E2E8F0',
            marginBottom: '0.85rem'
          }}>
            <img src="/logo.png" alt="Logo Trung Tâm Y Tế Khu Vực Bình Long" className="logo-img-lg" style={{ width: '70px', height: '70px' }} />
          </div>
          <h2 style={{ color: '#0F2C59', fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </h2>
          <h1 style={{ color: '#DC2626', fontSize: '1.35rem', fontWeight: '800', margin: '0.15rem 0 0.35rem' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
            Đăng nhập tài khoản khoa phòng hoặc quản trị
          </p>
        </div>

        {error && (
          <Notice tone="danger" style={{ marginBottom: '1.25rem' }} onClose={() => setError('')}>
            {error}
          </Notice>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label htmlFor="login-username" style={{ color: '#334155', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94A3B8' }} aria-hidden="true" />
              <input 
                id="login-username"
                type="text" 
                placeholder="VD: Khnv hoặc noi.bvbl" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.6rem', height: '44px', borderRadius: '10px' }}
                autoComplete="username"
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="login-password" style={{ color: '#334155', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94A3B8' }} aria-hidden="true" />
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu ca trực" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.6rem', paddingRight: '2.8rem', height: '44px', borderRadius: '10px' }}
                autoComplete="current-password"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '50%', right: '0.6rem', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.5rem' }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
            disabled={!username || !password}
            fullWidth
            style={{ marginTop: '0.35rem', height: '46px', fontSize: '1rem', borderRadius: '10px' }}
          >
            Đăng Nhập Hệ Thống
          </Button>
        </form>

        {/* In-card Footer info */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaCodeBranch style={{ color: '#2563EB' }} /> Phiên bản <strong>v{APP_VERSION}</strong>
          </span>
          <a
            href="https://github.com/UIBreaker"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F2C59', fontWeight: '700', textDecoration: 'none' }}
          >
            <FaGithub /> UIBreaker
          </a>
        </div>
      </div>
      
      {/* Bottom Copyright & Author Credit */}
      <footer style={{ marginTop: '1.25rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div>&copy; 2026 <strong>Trung Tâm Y Tế Khu Vực Bình Long</strong>.</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
          Phát triển bởi <a href="https://github.com/UIBreaker" target="_blank" rel="noopener noreferrer" style={{ color: '#67E8F9', fontWeight: '700', textDecoration: 'none' }}>Nguyễn Vũ Nhật Nam (UIBreaker)</a>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />
    </main>
  );
};

export default LoginPage;

