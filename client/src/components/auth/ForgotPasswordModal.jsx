import React, { useState } from 'react';
import { 
  FaKey, 
  FaTimes, 
  FaSpinner, 
  FaCheckCircle, 
  FaUser, 
  FaShieldAlt, 
  FaInfoCircle, 
  FaArrowRight, 
  FaArrowLeft 
} from 'react-icons/fa';
import authService from '../../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập của bạn.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await authService.forgotPassword(username.trim());
      if (res && res.success) {
        setSuccessMsg(res.message || 'Yêu cầu cấp lại mật khẩu đã được gửi đến Admin phòng KHNV.');
      }
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Lỗi khi gửi yêu cầu cấp lại mật khẩu.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setSuccessMsg('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(15, 44, 89, 0.22), 0 2px 6px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        padding: '2rem 2.2rem',
        boxSizing: 'border-box',
        position: 'relative',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#E2E8F0';
            e.currentTarget.style.color = '#0F2C59';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
          title="Đóng"
        >
          <FaTimes />
        </button>

        {/* Top Key Badge */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem auto',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)'
        }}>
          <FaKey style={{ fontSize: '1.45rem', color: '#2563EB' }} />
        </div>

        {/* Heading */}
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: '800',
          color: '#0F2C59',
          margin: '0 0 0.25rem 0',
          textAlign: 'center',
          letterSpacing: '0.2px'
        }}>
          Quên Mật Khẩu?
        </h3>

        <p style={{
          fontSize: '0.82rem',
          color: '#64748B',
          margin: '0 0 1.25rem 0',
          textAlign: 'center'
        }}>
          Gửi yêu cầu đến Quản trị viên phòng KHNV để được cấp lại mật khẩu tạm thời
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            padding: '0.65rem 0.95rem',
            color: '#991B1B',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            lineHeight: '1.4'
          }}>
            <FaInfoCircle style={{ flexShrink: 0 }} />
            <span>{typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi yêu cầu')}</span>
          </div>
        )}

        {/* Success State */}
        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
            <FaCheckCircle style={{ fontSize: '3.5rem', color: '#10B981', marginBottom: '0.85rem' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
              Đã Gửi Yêu Cầu Thành Công!
            </h4>
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              fontSize: '0.88rem',
              color: '#166534',
              lineHeight: '1.5',
              marginBottom: '1.4rem',
              textAlign: 'left'
            }}>
              {successMsg}
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '0.75rem 1.2rem',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              Đã Hiểu & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Username Input */}
            <div>
              <label style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#334155',
                display: 'block',
                marginBottom: '0.35rem'
              }}>
                Tên đăng nhập tài khoản của bạn *
              </label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.95rem',
                  transform: 'translateY(-50%)',
                  color: '#0284C7',
                  fontSize: '0.9rem'
                }} />
                <input
                  type="text"
                  placeholder="VD: nguyenvana, Khnv, noi.bvbl..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.55rem',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
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
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.backgroundColor = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem', marginTop: '0.35rem' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.2rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.32)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.42)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.32)';
                }}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <FaKey /> Gửi Yêu Cầu <FaArrowRight />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;
