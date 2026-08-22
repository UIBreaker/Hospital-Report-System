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
  FaExclamationTriangle,
  FaIdCard,
  FaHospital
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Summary Stat Cards Grid (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Total Staff */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #2563EB',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaUsers />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F2C59', lineHeight: '1.1' }}>
              {totalStaffCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              TỔNG SỐ NHÂN SỰ
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Đã đăng ký trong danh bạ
            </div>
          </div>
        </div>

        {/* Card 2: Doctors */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #10B981',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaUserMd />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', lineHeight: '1.1' }}>
              {doctorCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              BÁC SĨ ĐIỀU TRỊ
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Bác sĩ trực chuyên khoa
            </div>
          </div>
        </div>

        {/* Card 3: Nurses & Techs */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #F59E0B',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaUserNurse />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#D97706', lineHeight: '1.1' }}>
              {nurseCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              ĐIỀU DƯỠNG / KTV / KHÁC
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Điều dưỡng & Kỹ thuật viên
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Toolbar & Filter Controls */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        {/* Search & Filter Form */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <FaSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Tìm theo họ tên, CCHN..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              style={{
                padding: '0.48rem 0.85rem 0.48rem 2.2rem',
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                color: '#0F2C59',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Department Filter */}
          <select
            value={staffDeptFilter}
            onChange={(e) => setStaffDeptFilter(e.target.value)}
            style={{
              padding: '0.48rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#0F2C59',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả khoa phòng</option>
            {DEPARTMENT_ORDER.map((code) => (
              <option key={code} value={code}>
                {DEPARTMENT_MAP[code] || code}
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={staffPosFilter}
            onChange={(e) => setStaffPosFilter(e.target.value)}
            style={{
              padding: '0.48rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#0F2C59',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả chức danh</option>
            <option value="Bác sĩ">Bác sĩ</option>
            <option value="Điều dưỡng">Điều dưỡng</option>
            <option value="Kỹ thuật viên">Kỹ thuật viên</option>
            <option value="Hộ sinh">Hộ sinh</option>
            <option value="Dược sĩ">Dược sĩ</option>
            <option value="Khác">Khác</option>
          </select>

          <button
            type="submit"
            style={{
              backgroundColor: '#F1F5F9',
              border: '1.5px solid #CBD5E1',
              color: '#334155',
              borderRadius: '8px',
              padding: '0.48rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaSearch size={11} /> Tìm kiếm
          </button>
        </form>

        {/* Action Buttons: Refresh & Add Staff */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loadingStaff}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#334155',
              borderRadius: '8px',
              padding: '0.48rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Làm mới danh sách"
          >
            <FaSync className={loadingStaff ? 'spinner' : ''} size={11} /> Làm mới
          </button>

          <button
            type="button"
            onClick={handleOpenAddStaff}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.48rem 0.95rem',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <FaPlus size={11} /> Thêm Nhân Sự
          </button>
        </div>
      </div>

      {staffError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          {staffError}
        </div>
      )}

      {/* 3. Staff Data Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
        overflow: 'hidden'
      }}>
        {loadingStaff ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#2563EB' }} />
            <p style={{ marginTop: '0.85rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
              Đang tải danh sách nhân sự...
            </p>
          </div>
        ) : staffList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <FaUsers style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F2C59' }}>
              Không tìm thấy nhân sự phù hợp
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.25rem' }}>
              Vui lòng thử tìm kiếm với từ khóa khác hoặc bấm nút "Thêm Nhân Sự" để tạo mới.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '5%', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '28%' }}>HỌ TÊN & CHỨNG CHỈ HÀNH NGHỀ</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '25%' }}>KHOA PHÒNG</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '18%' }}>CHỨC DANH</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '12%', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '12%', textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((st, idx) => {
                  const isDoctor = st.position === 'Bác sĩ';
                  return (
                    <tr
                      key={st.id || idx}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                    >
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '700', color: '#64748B' }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isDoctor ? '#EFF6FF' : '#FEF3C7',
                            color: isDoctor ? '#2563EB' : '#D97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {isDoctor ? <FaUserMd /> : <FaUserNurse />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F2C59' }}>{st.full_name || st.name}</div>
                            {st.license_number && (
                              <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1px' }}>
                                <FaIdCard size={10} /> CCHN: {st.license_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          backgroundColor: '#F8FAFC',
                          color: '#0F2C59',
                          border: '1px solid #E2E8F0',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          display: 'inline-block'
                        }}>
                          {DEPARTMENT_MAP[st.department_code || st.department] || st.department_name || st.department_code || 'Chưa phân khoa'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          backgroundColor: isDoctor ? '#DCFCE7' : '#FEF3C7',
                          color: isDoctor ? '#065F46' : '#92400E',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          display: 'inline-block'
                        }}>
                          {st.position || 'Nhân sự'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: '#DCFCE7',
                          color: '#065F46',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontWeight: '800',
                          fontSize: '0.72rem'
                        }}>
                          Đang công tác
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(st)}
                            style={{
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#2563EB',
                              borderRadius: '6px',
                              padding: '0.3rem 0.55rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Sửa thông tin"
                          >
                            <FaEdit size={10} /> Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => setStaffToDelete(st)}
                            style={{
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              borderRadius: '6px',
                              padding: '0.3rem 0.55rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Xóa nhân sự"
                          >
                            <FaTrash size={10} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Form Modal (Add / Edit) */}
      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={editingStaff}
        onSuccess={fetchStaff}
        departments={DEPARTMENT_MAP}
        departmentOrder={DEPARTMENT_ORDER}
      />

      {/* Delete Confirmation Modal (Portal) */}
      {mounted && staffToDelete && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              margin: '0 auto 1rem auto'
            }}>
              <FaExclamationTriangle />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
              Xác Nhận Xóa Nhân Sự
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>
              Bạn có chắc chắn muốn xóa nhân sự <strong>"{staffToDelete.full_name || staffToDelete.name}"</strong> khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                disabled={deletingStaff}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.55rem 1.25rem',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleDeleteStaffConfirm}
                disabled={deletingStaff}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.55rem 1.25rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {deletingStaff ? <><FaSpinner className="spinner" /> Đang xóa...</> : <><FaTrash /> Xác Nhận Xóa</>}
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
