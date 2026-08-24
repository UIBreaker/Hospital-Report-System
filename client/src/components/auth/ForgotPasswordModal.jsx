import React, { useState } from 'react';
import { FaKey, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaHospitalUser } from 'react-icons/fa';
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
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await authService.forgotPassword(username.trim());
      if (res && res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Lỗi khi gửi yêu cầu cấp lại mật khẩu.');
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
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <FaKey />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Yêu Cầu Cấp Lại Mật Khẩu</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#93C5FD' }}>Hỗ trợ bởi Quản Trị Viên (Admin)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 1.65rem' }}>
          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <FaCheckCircle style={{ fontSize: '3.2rem', color: '#10B981', marginBottom: '0.85rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
                Đã Gửi Yêu Cầu Thành Công!
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {successMsg}
              </p>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginTop: 0, marginBottom: '1.2rem' }}>
                Nhập tên đăng nhập của bạn. Yêu cầu sẽ được chuyển đến Admin phòng KHNV để cấp mật khẩu tạm thời an toàn.
              </p>

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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Tên đăng nhập
                </label>
                <div style={{ position: 'relative' }}>
                  <FaHospitalUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: bs.nam, lck.bvbl..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
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
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '0.6rem 1.2rem',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.4rem',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {loading ? <><FaSpinner className="spinner" /> Đang gửi...</> : <><FaKey /> Gửi Yêu Cầu</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
