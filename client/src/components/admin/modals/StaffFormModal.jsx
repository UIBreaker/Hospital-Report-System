import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaUsers, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';
import staffService from '../../../services/staffService';

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

const StaffFormModal = ({
  isOpen,
  onClose,
  editingStaff,
  onSaveSuccess
}) => {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    position: 'Bác sĩ',
    department: 'lck',
    certificate: '',
    gender: 'Nam'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        full_name: editingStaff.full_name || '',
        position: editingStaff.position || 'Bác sĩ',
        department: editingStaff.department || 'lck',
        certificate: editingStaff.certificate || '',
        gender: editingStaff.gender || 'Nam'
      });
    } else {
      setFormData({
        full_name: '',
        position: 'Bác sĩ',
        department: 'lck',
        certificate: '',
        gender: 'Nam'
      });
    }
    setActionMsg({ type: '', text: '' });
  }, [editingStaff, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setActionMsg({ type: 'error', text: 'Vui lòng nhập họ và tên nhân sự.' });
      return;
    }

    setSaving(true);
    setActionMsg({ type: '', text: '' });
    try {
      if (editingStaff && editingStaff.id) {
        await staffService.updateStaff(editingStaff.id, formData);
        setActionMsg({ type: 'success', text: 'Cập nhật thông tin nhân sự thành công!' });
      } else {
        await staffService.createStaff(formData);
        setActionMsg({ type: 'success', text: 'Thêm nhân sự mới thành công!' });
      }
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error || 'Có lỗi xảy ra khi lưu thông tin nhân sự.'
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
          maxWidth: '520px',
          padding: 0,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--brand-blue)',
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
            <FaUsers /> {editingStaff ? 'Chỉnh Sửa Nhân Sự' : 'Thêm Mới Nhân Sự'}
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {actionMsg.text && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                backgroundColor: actionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
                color: actionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)'
              }}
            >
              {actionMsg.text}
            </div>
          )}

          <div className="form-group">
            <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', color: 'var(--text-dark)' }}>
              Họ và Tên Nhân Sự <span style={{ color: 'var(--brand-red)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: BS. Nguyễn Văn A..."
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="form-control"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', color: 'var(--text-dark)' }}>
                Chức vụ / Vị trí
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="Bác sĩ">Bác sĩ</option>
                <option value="Điều dưỡng">Điều dưỡng</option>
                <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                <option value="Hộ sinh">Hộ sinh</option>
                <option value="Dược sĩ">Dược sĩ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', color: 'var(--text-dark)' }}>
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="form-control"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', color: 'var(--text-dark)' }}>
              Khoa / Phòng trực thuộc
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

          <div className="form-group">
            <label style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', color: 'var(--text-dark)' }}>
              Số Chứng Chỉ Hành Nghề (Nếu có)
            </label>
            <input
              type="text"
              placeholder="VD: CCHN-001234/BP-CCHN..."
              value={formData.certificate}
              onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
              className="form-control"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.75rem',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '1rem'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '0.6rem 1.2rem', fontWeight: '600' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', fontWeight: '700' }}
            >
              {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Nhân Sự</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : modalContent;
};

export default StaffFormModal;