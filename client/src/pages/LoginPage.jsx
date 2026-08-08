import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash, FaCodeBranch } from 'react-icons/fa';
import AIAssistant from '../components/common/AIAssistant';

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
    <div className="login-wrapper">
      {/* Decorative ambient background circle */}
      <div className="login-bg-overlay" />

      <div className="glass-card login-card animate-slide-up">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(15, 44, 89, 0.15)',
            marginBottom: '0.85rem'
          }}>
            <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img-lg" />
          </div>
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </h2>
          <h1 style={{ color: 'var(--brand-red)', fontSize: '1.3rem', fontWeight: '800', marginTop: '0.15rem' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Đăng nhập tài khoản khoa phòng hoặc quản trị
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)' }}>Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--brand-blue-light)' }} />
              <input 
                type="text" 
                placeholder="VD: Khnv hoặc noi.bvbl" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.6rem' }}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)' }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--brand-blue-light)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '50%', right: '0.5rem', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting || !username || !password}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {isSubmitting ? <><FaSpinner className="spinner" /> Đang kiểm tra...</> : 'Đăng Nhập'}
          </button>
        </form>

        {/* In-card Footer info */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FaCodeBranch style={{ color: '#2563EB' }} /> Phiên bản <strong>1.0</strong>
          </span>
          <span>TTYT Bình Long</span>
        </div>
      </div>
      
      {/* Bottom Copyright */}
      <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textAlign: 'center' }}>
        &copy; 2026 Trung Tâm Y Tế Khu Vực Bình Long.
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />
    </div>
  );
};

export default LoginPage;
