import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaUserShield, FaKey, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';
import accountService from '../../../services/accountService';

const DEPARTMENT_MAP = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét nghiệm',
  cdha: 'Chẩn đoán hình ảnh',
  hscc_tnt: 'Hồi sức cấp cứu – Thận nhân tạo',
  noi: 'Khoa Nội tổng hợp',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Truyền nhiễm',
  san: 'Khoa Sản (CSSK Sinh sản)',
  yhct_phcn: 'Y học cổ truyền – Phục hồi chức năng',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Phẫu thuật, gây mê hồi sức',
  duoc: 'Khoa Dược - Trang thiết bị - VTYT',
  kham_benh: 'Khoa Khám bệnh'
};

const DEPARTMENT_ORDER = [
  'lck',
  'xn',
  'cdha',
  'hscc_tnt',
  'noi',
  'nhi',
  'nhiem',
  'san',
  'yhct_phcn',
  'ngoai_th',
  'ctch',
  'gmhs',
  'duoc',
  'kham_benh'
];

const AccountFormModal = ({
  isOpen,
  modalMode, // 'password' | 'form'
  selectedAccount,
  onClose,
  onWasSaved
}) => {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Password mode state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Account form mode state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'department',
    department_name: '',
    department_code: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActionMsg({ type: '', text: '' });
    setPasswordData({ newPassword: '', confirmPassword: '' });

    if (selectedAccount) {
      setFormData({
        username: selectedAccount.username || '',
        password: '',
        role: selectedAccount.role || 'department',
        department_name: selectedAccount.department_name || '',
        department_code: selectedAccount.department_code || ''
      });
    } else {
      setFormData({
        username: '',
        password: '',
        role: 'department',
        department_name: '',
        department_code: 'lck'
      });
    }
  }, [selectedAccount, modalMode, isOpen]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword.trim()) {
      setActionMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu mới.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setActionMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setSaving(true);
    setActionMsg({ type: '', text: '' });
    try {
      await accountService.changePassword(selectedAccount.id, {
        newPassword: passwordData.newPassword
      });
      if (onWasSaved) onWasSaved();
      onClose();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Lỗi khi đổi mật khẩu.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setActionMsg({ type: 'error', text: 'Vui lòng nhập tên đăng nhập.' });
      return;
    }
    if (!selectedAccount && !formData.password.trim()) {
      setActionMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu cho tài khoản mới.' });
      return;
    }

    setSaving(true);
    setActionMsg({ type: '', text: '' });
    try {
      if (selectedAccount && selectedAccount.id) {
        await accountService.updateAccount(selectedAccount.id, formData);
      } else {
        await accountService.createAccount(formData);
      }
      if (onWasSaved) onWasSaved();
      onClose();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Lỗi khi lưu tài khoản.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 44, 89, 0.6)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#0F2C59',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3
            style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '800',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {modalMode === 'password' ? (
              <>
                <FaKey style={{ color: '#FDE047' }} /> Đổi Mật Khẩu: {selectedAccount?.username}
              </>
            ) : (
              <>
                <FaUserShield /> {selectedAccount ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        {modalMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actionMsg.text && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  backgroundColor: actionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
                  color: actionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)'
                }}
              >
                {actionMsg.text}
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Mật Khẩu Mới <span style={{ color: 'var(--brand-red)' }}>*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Xác Nhận Mật Khẩu <span style={{ color: 'var(--brand-red)' }}>*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới..."
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Cập Nhật Mật Khẩu</>}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actionMsg.text && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  backgroundColor: actionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
                  color: actionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)'
                }}
              >
                {actionMsg.text}
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Tên Đăng Nhập <span style={{ color: 'var(--brand-red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="VD: khoanoicapcuu, bstran..."
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>

            {!selectedAccount && (
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Mật Khẩu Khởi Tạo <span style={{ color: 'var(--brand-red)' }}>*</span>
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Vai Trò (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="department">Khoa Phòng</option>
                <option value="admin">Quản Trị Viên</option>
              </select>
            </div>

            {formData.role === 'department' ? (
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Khoa / Phòng Liên Kết
                </label>
                <select
                  value={formData.department_code}
                  onChange={(e) => {
                    const code = e.target.value;
                    setFormData({
                      ...formData,
                      department_code: code,
                      department_name: DEPARTMENT_MAP[code] || ''
                    });
                  }}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  {DEPARTMENT_ORDER.map((code) => (
                    <option key={code} value={code}>
                      {DEPARTMENT_MAP[code] || code}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Tên Hiển Thị (Bộ Phận / Họ Tên)
                </label>
                <input
                  type="text"
                  placeholder="VD: Phòng Kế Hoạch Nghiệp Vụ..."
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Tài Khoản</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : modalContent;
};

export default AccountFormModal;
