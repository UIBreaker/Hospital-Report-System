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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 50%, #15803D 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background circle overlay */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />

      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        <div className="text-center mb-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(15, 44, 89, 0.15)',
            marginBottom: '1rem'
          }}>
            <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img-lg" />
          </div>
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </h2>
          <h1 style={{ color: 'var(--brand-red)', fontSize: '1.4rem', fontWeight: '700', marginTop: '0.2rem' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Đăng nhập tài khoản khoa phòng hoặc quản trị
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)' }}>Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--brand-blue-light)' }} />
              <input 
                type="text" 
                placeholder="Nhập tài khoản (VD: Khnv hoặc hscctnt.bvbl)" 
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
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            {isSubmitting ? <><FaSpinner className="spinner" /> Đang kiểm tra...</> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
      
      {/* Bottom Center Copyright */}
      <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center' }}>
        &copy; 2026 Trung Tâm Y Tế Khu Vực Bình Long. Tất cả quyền được bảo lưu.
      </div>

      {/* Bottom Left Version 1.0 Badge */}
      <div style={{
        position: 'fixed', bottom: '1.25rem', left: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#CBD5E1',
        padding: '0.45rem 0.9rem', borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)', fontSize: '0.75rem', fontWeight: '600',
        zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <FaCodeBranch style={{ color: '#38BDF8' }} />
        <span>Phiên bản <strong style={{ color: '#FFFFFF' }}>1.0</strong></span>
      </div>

      {/* Bottom Right Floating AI Assistant */}
      <AIAssistant onAutoFillLogin={handleAutoFillLogin} />
    </div>
  );
};

export default LoginPage;

