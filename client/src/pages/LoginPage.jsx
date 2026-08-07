import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaHospitalAlt, FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

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
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div className="text-center mb-6">
          <FaHospitalAlt style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem' }} />
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Hệ Thống Báo Cáo Giao Ban
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Bệnh Viện Bình Long</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <FaUser style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input 
              type="text" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
              required 
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', right: '0.5rem', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.5rem' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting || !username || !password}
            style={{ marginTop: '1rem', backgroundColor: '#fff', color: '#1E40AF' }}
          >
            {isSubmitting ? <FaSpinner className="spinner" /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
      
      <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
        &copy; 2026 Bệnh Viện Bình Long
      </div>
    </div>
  );
};

export default LoginPage;
