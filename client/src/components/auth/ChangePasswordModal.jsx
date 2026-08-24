import React, { useState } from 'react';
import { 
  FaLock, 
  FaKey, 
  FaSpinner, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash, 
  FaTimes, 
  FaCheck, 
  FaInfoCircle, 
  FaArrowRight 
} from 'react-icons/fa';
import authService from '../../services/authService';

const ChangePasswordModal = ({
  isOpen = false,
  username = '',
  fullName = '',
  isMandatory = false,
  onSuccess,
  onClose
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ các trường thông tin.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        username,
        currentPassword,
        newPassword
      });

      if (res && res.success) {
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.'));
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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
        maxWidth: '490px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(15, 44, 89, 0.22), 0 2px 6px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        padding: '2rem 2.2rem',
        boxSizing: 'border-box',
        position: 'relative',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Close Button Top Right (if not mandatory) */}
        {!isMandatory && onClose && (
          <button
            type="button"
            onClick={onClose}
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
        )}

        {/* Top Badge Icon */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: isMandatory ? '#FEF3C7' : '#EFF6FF',
          border: `1.5px solid ${isMandatory ? '#FDE68A' : '#DBEAFE'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem auto',
          boxShadow: isMandatory ? '0 4px 14px rgba(217, 119, 6, 0.15)' : '0 4px 14px rgba(37, 99, 235, 0.12)'
        }}>
          <FaShieldAlt style={{ fontSize: '1.55rem', color: isMandatory ? '#D97706' : '#2563EB' }} />
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
          {isMandatory ? 'Đổi Mật Khẩu Khởi Tạo' : 'Đổi Mật Khẩu Tài Khoản'}
        </h3>

        <p style={{
          fontSize: '0.82rem',
          color: '#64748B',
          margin: '0 0 1.2rem 0',
          textAlign: 'center'
        }}>
          {isMandatory
            ? `Tài khoản @${username} đang dùng mật khẩu tạm. Vui lòng thiết lập mật khẩu mới.`
            : `Cập nhật mật khẩu bảo mật cho tài khoản @${username}`}
        </p>

        {/* Mandatory Warning Note */}
        {isMandatory && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            fontSize: '0.82rem',
            color: '#92400E',
            lineHeight: 1.45,
            marginBottom: '1.1rem'
          }}>
            👋 Xin chào <strong>{fullName || username}</strong>! Vì lý do an toàn thông tin y tế, bạn cần đổi mật khẩu mới để kích hoạt và truy cập hệ thống.
          </div>
        )}

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
            <span>{typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi đổi mật khẩu')}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Field 1: Current Password */}
          <div>
            <label style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#334155',
              display: 'block',
              marginBottom: '0.35rem'
            }}>
              {isMandatory ? 'Mật khẩu tạm thời *' : 'Mật khẩu hiện tại *'}
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                top: '50%',
                left: '0.95rem',
                transform: 'translateY(-50%)',
                color: '#0284C7',
                fontSize: '0.9rem'
              }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder={isMandatory ? 'Nhập mật khẩu tạm được cấp' : 'Nhập mật khẩu đang dùng'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.65rem 0.7rem 2.55rem',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                  color: '#0F2C59',
                  fontWeight: '600',
                  boxSizing: 'border-box'
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
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
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
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Field 2: New Password */}
          <div>
            <label style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#334155',
              display: 'block',
              marginBottom: '0.35rem'
            }}>
              Mật khẩu mới * (Tối thiểu 6 ký tự)
            </label>
            <div style={{ position: 'relative' }}>
              <FaKey style={{
                position: 'absolute',
                top: '50%',
                left: '0.95rem',
                transform: 'translateY(-50%)',
                color: '#0284C7',
                fontSize: '0.9rem'
              }} />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.65rem 0.7rem 2.55rem',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                  color: '#0F2C59',
                  fontWeight: '600',
                  boxSizing: 'border-box'
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
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
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
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Field 3: Confirm New Password */}
          <div>
            <label style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#334155',
              display: 'block',
              marginBottom: '0.35rem'
            }}>
              Xác nhận mật khẩu mới *
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                top: '50%',
                left: '0.95rem',
                transform: 'translateY(-50%)',
                color: '#0284C7',
                fontSize: '0.9rem'
              }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.65rem 0.7rem 2.55rem',
                  border: `1.5px solid ${isPasswordMatch ? '#10B981' : confirmPassword ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                  color: '#0F2C59',
                  fontWeight: '600',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
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
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Password Match Status */}
          {confirmPassword && (
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isPasswordMatch ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isPasswordMatch ? <><FaCheck /> Mật khẩu xác nhận trùng khớp</> : <>⚠️ Mật khẩu xác nhận chưa khớp</>}
            </div>
          )}

          {/* Submit / Cancel Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: isMandatory ? '1fr' : '1fr 1.5fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
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
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.8rem 1.2rem',
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
                  <FaSpinner className="spinner" /> Đang cập nhật...
                </>
              ) : (
                <>
                  <FaShieldAlt /> Xác Nhận Đổi Mật Khẩu <FaArrowRight />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
