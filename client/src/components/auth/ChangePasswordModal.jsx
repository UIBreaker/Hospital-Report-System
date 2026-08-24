import React, { useState } from 'react';
import { FaLock, FaKey, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
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
      setErrorMsg(err.response?.data?.error || err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: isMandatory
            ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
            : 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem'
          }}>
            <FaShieldAlt />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.9 }}>
              {isMandatory ? 'BẢO MẬT BẮT BUỘC' : 'QUẢN LÝ MẬT KHẨU'}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', lineHeight: 1.2 }}>
              {isMandatory ? 'Đổi Mật Khẩu Khởi Tạo' : 'Thay Đổi Mật Khẩu'}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.65rem' }}>
          {isMandatory && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '10px',
              padding: '0.75rem 0.95rem',
              fontSize: '0.84rem',
              color: '#92400E',
              lineHeight: 1.45,
              marginBottom: '1.2rem'
            }}>
              👋 Xin chào <strong>{fullName || username}</strong>! Bạn đang sử dụng mật khẩu tạm do Quản trị viên cấp. Vì lý do bảo mật, vui lòng đặt mật khẩu mới của riêng bạn để tiếp tục truy cập.
            </div>
          )}

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <FaExclamationTriangle /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                {isMandatory ? 'Mật khẩu tạm thời' : 'Mật khẩu hiện tại'}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isMandatory ? 'Nhập mật khẩu tạm Admin đã cấp' : 'Nhập mật khẩu đang sử dụng'}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự (nên có số & ký tự đặc biệt)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại chính xác mật khẩu mới"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {!isMandatory && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '0.65rem 1.25rem',
                    fontWeight: '700',
                    fontSize: '0.85rem',
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
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.6rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  flex: isMandatory ? 1 : 'none',
                  justifyContent: 'center'
                }}
              >
                {loading ? <><FaSpinner className="spinner" /> Đang cập nhật...</> : <><FaLock /> Lưu Mật Khẩu Mới</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
