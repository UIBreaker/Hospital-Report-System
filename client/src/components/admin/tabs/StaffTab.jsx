import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaUsers,
  FaUserMd,
  FaUserNurse,
  FaPlus,
  FaSync,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import staffService from '../../../services/staffService';
import StaffFormModal from '../modals/StaffFormModal';

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

const StaffTab = () => {
  const [mounted, setMounted] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('all');
  const [staffPosFilter, setStaffPosFilter] = useState('all');

  // Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Delete Confirm Modal
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError('');
    try {
      const params = {};
      if (staffDeptFilter !== 'all') params.department = staffDeptFilter;
      if (staffPosFilter !== 'all') params.position = staffPosFilter;
      if (staffSearch.trim()) params.search = staffSearch.trim();

      const res = await staffService.getAllStaff(params);
      setStaffList(res.data || []);
    } catch (err) {
      setStaffError('Lỗi khi tải danh sách nhân sự: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [staffDeptFilter, staffPosFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaff();
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDeleteStaffConfirm = async () => {
    if (!staffToDelete) return;
    setDeletingStaff(true);
    try {
      await staffService.deleteStaff(staffToDelete.id);
      setStaffToDelete(null);
      fetchStaff();
    } catch (err) {
      alert('Lỗi khi xóa nhân sự: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingStaff(false);
    }
  };

  const totalStaffCount = staffList.length;
  const doctorCount = staffList.filter((s) => s.position === 'Bác sĩ').length;
  const nurseCount = staffList.filter((s) => s.position !== 'Bác sĩ').length;

  return (
    <div className="animate-fade-in">
      {/* Staff Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            borderLeft: '4px solid var(--brand-blue)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--brand-blue)' }}>
                {totalStaffCount}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                Tổng nhân sự
              </div>
            </div>
            <FaUsers style={{ fontSize: '2rem', color: 'var(--brand-blue)', opacity: 0.6 }} />
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
            borderLeft: '4px solid #10B981',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065F46' }}>{doctorCount}</div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#047857',
                  textTransform: 'uppercase'
                }}
              >
                Bác sĩ
              </div>
            </div>
            <FaUserMd style={{ fontSize: '2rem', color: '#10B981', opacity: 0.6 }} />
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            borderLeft: '4px solid #D97706',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400E' }}>{nurseCount}</div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#92400E',
                  textTransform: 'uppercase'
                }}
              >
                Điều dưỡng / KTV / Khác
              </div>
            </div>
            <FaUserNurse style={{ fontSize: '2rem', color: '#D97706', opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}
        >
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <FaSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Tìm theo họ tên, CCHN..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          <select
            value={staffDeptFilter}
            onChange={(e) => setStaffDeptFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: '180px', fontSize: '0.88rem' }}
          >
            <option value="all">Tất cả khoa phòng</option>
            {DEPARTMENT_ORDER.map((code) => (
              <option key={code} value={code}>
                {DEPARTMENT_MAP[code] || code}
              </option>
            ))}
          </select>

          <select
            value={staffPosFilter}
            onChange={(e) => setStaffPosFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.88rem' }}
          >
            <option value="all">Tất cả vị trí</option>
            <option value="Bác sĩ">Bác sĩ</option>
            <option value="Điều dưỡng">Điều dưỡng</option>
            <option value="Kỹ thuật viên">Kỹ thuật viên</option>
            <option value="Hộ sinh">Hộ sinh</option>
            <option value="Dược sĩ">Dược sĩ</option>
            <option value="Khác">Khác</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.55rem 0.9rem' }}>
            <FaSearch /> Tìm
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchStaff}
            disabled={loadingStaff}
            style={{ padding: '0.55rem 0.9rem' }}
            title="Tải lại danh sách"
          >
            <FaSync className={loadingStaff ? 'spinner' : ''} />
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleOpenAddStaff}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontWeight: '700' }}
          >
            <FaPlus /> Thêm Nhân Sự
          </button>
        </div>
      </div>

      {staffError && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          {staffError}
        </div>
      )}

      {/* Staff Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
        {loadingStaff ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Đang tải danh sách nhân sự...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FaUsers style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>Không tìm thấy nhân sự nào phù hợp với điều kiện tìm kiếm.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', width: '50px' }}>STT</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Họ và Tên</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Chức vụ</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Khoa Phòng</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Số CCHN</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Giới tính</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center', width: '150px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, idx) => (
                <tr
                  key={staff.id}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--brand-blue)' }}>
                    {staff.position === 'Bác sĩ' ? '👨‍⚕️ ' : '🧑‍⚕️ '}
                    {staff.full_name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: staff.position === 'Bác sĩ' ? '#DBEAFE' : '#FEF3C7',
                        color: staff.position === 'Bác sĩ' ? '#1E40AF' : '#92400E',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700'
                      }}
                    >
                      {staff.position}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '600' }}>
                    {DEPARTMENT_MAP[staff.department] || staff.department}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>
                    {staff.certificate || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{staff.gender || 'Nam'}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEditStaff(staff)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        title="Chỉnh sửa"
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setStaffToDelete(staff)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        title="Xóa nhân sự"
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isModalOpen}
        editingStaff={editingStaff}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchStaff}
      />

      {/* Delete Confirmation Modal */}
      {staffToDelete &&
        mounted &&
        createPortal(
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
            <div className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
              <FaExclamationTriangle
                style={{ fontSize: '3rem', color: 'var(--brand-red)', marginBottom: '1rem' }}
              />
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  color: 'var(--brand-blue)',
                  marginBottom: '0.5rem'
                }}
              >
                Xác Nhận Xóa Nhân Sự?
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Bạn có chắc chắn muốn xóa nhân sự <strong>"{staffToDelete.full_name}"</strong> thuộc khoa{' '}
                <strong>{DEPARTMENT_MAP[staffToDelete.department] || staffToDelete.department}</strong>?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteStaffConfirm}
                  disabled={deletingStaff}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                >
                  {deletingStaff ? (
                    <>
                      <FaSpinner className="spinner" /> Đang xóa...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Xác nhận xóa
                    </>
                  )}
                </button>
                <button className="btn btn-secondary" onClick={() => setStaffToDelete(null)} disabled={deletingStaff}>
                  Hủy
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default StaffTab;
