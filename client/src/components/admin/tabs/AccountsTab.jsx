import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, 
  FaUsers, 
  FaKey, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimes,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaHospitalUser,
  FaLock,
  FaUnlockAlt,
  FaUserCheck,
  FaUserTimes,
  FaSync
} from 'react-icons/fa';
import api from '../../../services/api';
import systemUserService from '../../../services/systemUserService';
import CountUpNumber from '../../common/CountUpNumber';

const AccountsTab = () => {
  // Sub-tab: 'core' | 'system'
  const [subTab, setSubTab] = useState('system');

  // Core Accounts State
  const [coreAccounts, setCoreAccounts] = useState([]);
  const [loadingCore, setLoadingCore] = useState(false);

  // System Users State
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingSystem, setLoadingSystem] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'reset_requested' | 'suspended'

  // Temporary Password Modal State
  const [tempPassModal, setTempPassModal] = useState({
    isOpen: false,
    username: '',
    fullName: '',
    temporaryPassword: '',
    copied: false
  });

  // Core Password Modal
  const [editPasswordModal, setEditPasswordModal] = useState({
    isOpen: false,
    account: null,
    newPassword: '',
    loading: false
  });

  // Fetch Core 13 Accounts
  const fetchCoreAccounts = async () => {
    setLoadingCore(true);
    try {
      const res = await api.get('/admin/accounts');
      if (res.data && res.data.success) {
        setCoreAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching core accounts:', err);
    } finally {
      setLoadingCore(false);
    }
  };

  // Fetch System Users
  const fetchSystemUsers = async () => {
    setLoadingSystem(true);
    try {
      const res = await systemUserService.getAllSystemUsers();
      if (res && res.success) {
        setSystemUsers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching system users:', err);
    } finally {
      setLoadingSystem(false);
    }
  };

  useEffect(() => {
    fetchCoreAccounts();
    fetchSystemUsers();
  }, []);

  // System User Actions
  const handleApprove = async (id, name) => {
    try {
      const res = await systemUserService.approveUser(id);
      if (res && res.success) {
        await fetchSystemUsers();
      }
    } catch (err) {
      alert('Không thể phê duyệt: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn từ chối đăng ký của "${name}"?`)) return;
    try {
      const res = await systemUserService.rejectUser(id);
      if (res && res.success) {
        await fetchSystemUsers();
      }
    } catch (err) {
      alert('Không thể từ chối: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await systemUserService.toggleUserStatus(id, nextStatus);
      if (res && res.success) {
        await fetchSystemUsers();
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAdminResetPassword = async (id, user) => {
    if (!window.confirm(`Hệ thống sẽ tạo mật khẩu ngẫu nhiên phức tạp cho nhân viên "${user.full_name}" (@${user.username}) và yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo. Xác nhận?`)) {
      return;
    }

    try {
      const res = await systemUserService.adminResetPassword(id);
      if (res && res.success) {
        setTempPassModal({
          isOpen: true,
          username: user.username,
          fullName: user.full_name,
          temporaryPassword: res.data.temporaryPassword,
          copied: false
        });
        await fetchSystemUsers();
      }
    } catch (err) {
      alert('Lỗi cấp lại mật khẩu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteSysUser = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi hệ thống?`)) return;
    try {
      const res = await systemUserService.deleteSystemUser(id);
      if (res && res.success) {
        setSystemUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      alert('Không thể xóa: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassModal.temporaryPassword);
    setTempPassModal(prev => ({ ...prev, copied: true }));
    setTimeout(() => {
      setTempPassModal(prev => ({ ...prev, copied: false }));
    }, 2500);
  };

  // Core Account Password Change
  const handleUpdateCorePassword = async (e) => {
    e.preventDefault();
    if (!editPasswordModal.newPassword) return;
    setEditPasswordModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.put(`/admin/accounts/${editPasswordModal.account.id}/password`, {
        newPassword: editPasswordModal.newPassword
      });
      if (res.data && res.data.success) {
        alert('Cập nhật mật khẩu tài khoản thành công!');
        setEditPasswordModal({ isOpen: false, account: null, newPassword: '', loading: false });
        await fetchCoreAccounts();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
      setEditPasswordModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Filtered System Users
  const pendingCount = systemUsers.filter(u => u.status === 'pending').length;
  const resetCount = systemUsers.filter(u => Number(u.reset_requested) === 1).length;

  const filteredSystemUsers = systemUsers.filter(u => {
    if (statusFilter === 'pending') return u.status === 'pending';
    if (statusFilter === 'active') return u.status === 'active';
    if (statusFilter === 'suspended') return u.status === 'suspended';
    if (statusFilter === 'reset_requested') return Number(u.reset_requested) === 1;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1.1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <FaUserShield />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59' }}>
              Quản Trị Tài Khoản & Phân Quyền Bảo Mật
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Bảo vệ 13 tài khoản cốt lõi và quản lý vòng đời tài khoản nhân viên mở rộng.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div style={{
          backgroundColor: '#F1F5F9',
          padding: '0.3rem',
          borderRadius: '10px',
          display: 'flex',
          gap: '0.35rem'
        }}>
          <button
            type="button"
            onClick={() => setSubTab('system')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: subTab === 'system' ? '#2563EB' : 'transparent',
              color: subTab === 'system' ? '#FFFFFF' : '#475569',
              fontWeight: subTab === 'system' ? '800' : '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FaUsers /> Tài Khoản Nhân Viên Mở Rộng
            {(pendingCount > 0 || resetCount > 0) && (
              <span style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: '900'
              }}>
                {pendingCount + resetCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('core')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: subTab === 'core' ? '#2563EB' : 'transparent',
              color: subTab === 'core' ? '#FFFFFF' : '#475569',
              fontWeight: subTab === 'core' ? '800' : '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FaShieldAlt /> 13 Tài Khoản Cốt Lõi (12 Khoa & Admin)
          </button>
        </div>
      </div>

      {/* ================= SUB-TAB 1: SYSTEM USERS ================= */}
      {subTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Summary KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #2563EB', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1E40AF', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
                  <CountUpNumber value={systemUsers.length} duration={800} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginTop: '4px' }}>TỔNG TÀI KHOẢN</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #10B981', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16A34A', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
                  <CountUpNumber value={systemUsers.filter(u => u.status === 'active').length} duration={800} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#065F46', marginTop: '4px' }}>ĐANG HOẠT ĐỘNG</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #D97706', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#D97706', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
                  <CountUpNumber value={pendingCount} duration={800} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#92400E', marginTop: '4px' }}>CHỜ PHÊ DUYỆT</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #DC2626', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#DC2626', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
                  <CountUpNumber value={resetCount} duration={800} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#991B1B', marginTop: '4px' }}>YÊU CẦU CẤP LẠI MK</div>
              </div>
            </div>
          </div>

          {/* Status Filter Bar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `Tất cả (${systemUsers.length})` },
                { key: 'pending', label: `⏳ Chờ duyệt (${pendingCount})`, color: '#D97706' },
                { key: 'reset_requested', label: `🔑 Yêu cầu cấp lại MK (${resetCount})`, color: '#DC2626' },
                { key: 'active', label: '✅ Đang hoạt động', color: '#16A34A' },
                { key: 'suspended', label: '🔒 Đang tạm khóa', color: '#64748B' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: statusFilter === f.key ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: statusFilter === f.key ? '#EFF6FF' : '#FFFFFF',
                    color: statusFilter === f.key ? '#1E40AF' : (f.color || '#475569'),
                    fontWeight: statusFilter === f.key ? '800' : '600',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchSystemUsers}
              disabled={loadingSystem}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.38rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FaSync className={loadingSystem ? 'spinner' : ''} /> Làm mới
            </button>
          </div>

          {/* System Users Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
          }}>
            {loadingSystem ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="analytics-shimmer" style={{ width: '25%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '20%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '15%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '10%', height: '14px', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : filteredSystemUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
                <FaUsers style={{ fontSize: '2.8rem', color: '#CBD5E1', marginBottom: '0.65rem' }} />
                <p>Không có tài khoản nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                      <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>HỌ TÊN & USERNAME</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>TRẠNG THÁI</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>BẢO MẬT & RESET</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>NGÀY TẠO</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '800' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSystemUsers.map((user, idx) => {
                      const isPending = user.status === 'pending';
                      const isResetRequested = Number(user.reset_requested) === 1;
                      const isMustChangePass = Number(user.must_change_password) === 1;
                      const isActive = user.status === 'active';

                      return (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isResetRequested ? '#FFFBEB' : isPending ? '#F0FDF4' : idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                          }}
                        >
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: '800', color: '#0F2C59' }}>{user.full_name}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563EB', fontWeight: '700' }}>
                              @{user.username}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '600' }}>
                            {user.department_name || user.department_code}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isPending ? (
                              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                ⏳ Chờ Admin duyệt
                              </span>
                            ) : user.status === 'active' ? (
                              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                ● Hoạt động
                              </span>
                            ) : user.status === 'suspended' ? (
                              <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                🔒 Đã tạm khóa
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                ✕ Bị từ chối
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isResetRequested ? (
                              <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaKey /> Xin cấp lại MK!
                              </span>
                            ) : isMustChangePass ? (
                              <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '700' }}>
                                🔑 Đang dùng MK tạm
                              </span>
                            ) : (
                              <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: '700' }}>
                                ✓ Bình thường
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.78rem' }}>
                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(user.id, user.full_name)}
                                    style={{
                                      backgroundColor: '#10B981',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '7px',
                                      padding: '0.35rem 0.65rem',
                                      fontWeight: '800',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    <FaUserCheck /> Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(user.id, user.full_name)}
                                    style={{
                                      backgroundColor: '#FEF2F2',
                                      color: '#DC2626',
                                      border: '1px solid #FECACA',
                                      borderRadius: '7px',
                                      padding: '0.35rem 0.65rem',
                                      fontWeight: '700',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <FaUserTimes /> Từ chối
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Reset Temporary Password Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdminResetPassword(user.id, user)}
                                    style={{
                                      backgroundColor: isResetRequested ? '#DC2626' : '#EFF6FF',
                                      color: isResetRequested ? '#FFFFFF' : '#1E40AF',
                                      border: isResetRequested ? 'none' : '1px solid #BFDBFE',
                                      borderRadius: '7px',
                                      padding: '0.35rem 0.65rem',
                                      fontWeight: '800',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      boxShadow: isResetRequested ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none'
                                    }}
                                    title="Cấp mật khẩu tạm thời ngẫu nhiên và yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo"
                                  >
                                    <FaKey /> Cấp lại MK
                                  </button>

                                  {/* Toggle Lock / Unlock */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                    style={{
                                      backgroundColor: '#F8FAFC',
                                      color: isActive ? '#64748B' : '#10B981',
                                      border: '1px solid #CBD5E1',
                                      borderRadius: '7px',
                                      padding: '0.35rem 0.55rem',
                                      fontWeight: '700',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    title={isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                  >
                                    {isActive ? <FaLock /> : <FaUnlockAlt />}
                                  </button>

                                  {/* Delete User */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSysUser(user.id, user.full_name)}
                                    style={{
                                      backgroundColor: '#FEF2F2',
                                      color: '#DC2626',
                                      border: '1px solid #FECACA',
                                      borderRadius: '7px',
                                      padding: '0.35rem 0.55rem',
                                      fontWeight: '700',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Xóa tài khoản"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
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
        </div>
      )}

      {/* ================= SUB-TAB 2: CORE 13 ACCOUNTS ================= */}
      {subTab === 'core' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
        }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
            🛡️ <strong>Danh sách 13 tài khoản cốt lõi:</strong> Bao gồm 12 Khoa/Phòng chức năng và 1 Quản trị viên phòng KHNV phục vụ luồng nộp và trình chiếu giao ban bệnh viện.
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>TÊN ĐĂNG NHẬP</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / ĐƠN VỊ</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>MÃ KHOA</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>VAI TRÒ</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '800' }}>ĐỔI MẬT KHẨU</th>
                </tr>
              </thead>
              <tbody>
                {coreAccounts.map((acc, idx) => (
                  <tr
                    key={acc.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F2C59', fontFamily: 'monospace' }}>
                      {acc.username}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E40AF' }}>
                      {acc.department_name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {acc.department_code}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        backgroundColor: acc.role === 'admin' ? '#FEF3C7' : '#EFF6FF',
                        color: acc.role === 'admin' ? '#92400E' : '#1E40AF',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}>
                        {acc.role === 'admin' ? 'Quản Trị Viên' : 'Khoa Phòng'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setEditPasswordModal({ isOpen: true, account: acc, newPassword: '', loading: false })}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <FaKey /> Đổi MK
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: CẤP MẬT KHẨU TẠM THỜI THÀNH CÔNG ================= */}
      {tempPassModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
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
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              padding: '1.25rem 1.5rem',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaKey style={{ fontSize: '1.3rem' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Cấp Lại Mật Khẩu Tạm Thời</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Bảo Mật Y Tế Tiêu Chuẩn Cao</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTempPassModal({ isOpen: false, username: '', fullName: '', temporaryPassword: '', copied: false })}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem 1.65rem' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Đã tạo mật khẩu tạm thời cho nhân viên <strong>{tempPassModal.fullName}</strong> (@{tempPassModal.username}). Vui lòng sao chép và gửi cho nhân viên:
              </p>

              {/* Password Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}>
                <span style={{ fontSize: '1.35rem', fontWeight: '900', fontFamily: 'monospace', color: '#0F2C59', letterSpacing: '2px' }}>
                  {tempPassModal.temporaryPassword}
                </span>

                <button
                  type="button"
                  onClick={handleCopyPassword}
                  style={{
                    backgroundColor: tempPassModal.copied ? '#10B981' : '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 0.95rem',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tempPassModal.copied ? <><FaCheck /> Đã Chép</> : <><FaCopy /> Sao Chép</>}
                </button>
              </div>

              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '0.75rem 0.95rem',
                fontSize: '0.82rem',
                color: '#1E40AF',
                lineHeight: 1.45,
                marginBottom: '1.5rem'
              }}>
                💡 <strong>Quy trình bảo mật:</strong> Khi nhân viên sử dụng mật khẩu này để đăng nhập, hệ thống sẽ tự động bắt buộc nhân viên đổi mật khẩu mới của riêng họ. Ban Quản Trị sẽ không biết mật khẩu mới này.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setTempPassModal({ isOpen: false, username: '', fullName: '', temporaryPassword: '', copied: false })}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1.6rem',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Hoàn Tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐỔI MẬT KHẨU TÀI KHOẢN CỐT LÕI ================= */}
      {editPasswordModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#0F2C59',
              padding: '1.25rem 1.5rem',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                  Đổi Mật Khẩu Khoa: {editPasswordModal.account?.department_name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#93C5FD' }}>
                  Username: @{editPasswordModal.account?.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditPasswordModal({ isOpen: false, account: null, newPassword: '', loading: false })}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateCorePassword} style={{ padding: '1.5rem 1.65rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={editPasswordModal.newPassword}
                  onChange={(e) => setEditPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu mới..."
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
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditPasswordModal({ isOpen: false, account: null, newPassword: '', loading: false })}
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
                  disabled={editPasswordModal.loading}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.4rem',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: editPasswordModal.loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {editPasswordModal.loading ? 'Đang lưu...' : 'Lưu Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsTab;
