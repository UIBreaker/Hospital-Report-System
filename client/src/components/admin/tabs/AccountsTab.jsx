import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSync,
  FaSearch,
  FaSpinner,
  FaKey,
  FaUnlockAlt,
  FaEdit,
  FaCopy,
  FaCheckCircle,
  FaUserShield,
  FaHospital,
  FaUserTie
} from 'react-icons/fa';
import accountService from '../../../services/accountService';
import AccountFormModal from '../modals/AccountFormModal';

const AccountsTab = () => {
  const [accountsList, setAccountsList] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState('all');
  const [accountActionMsg, setAccountActionMsg] = useState({ type: '', text: '' });
  const [copiedAccount, setCopiedAccount] = useState(null);

  // Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState('password'); // 'password' | 'form'
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError('');
    try {
      const res = await accountService.getAllAccounts();
      if (res.success) {
        setAccountsList(res.data || []);
      }
    } catch (err) {
      setAccountsError(err.response?.data?.error || err.message || 'Lỗi khi tải danh sách tài khoản');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCopyAccount = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleOpenAddAccount = () => {
    setSelectedAccount(null);
    setAccountModalMode('form');
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc) => {
    setSelectedAccount(acc);
    setAccountModalMode('form');
    setIsAccountModalOpen(true);
  };

  const handleOpenChangePassword = (acc) => {
    setSelectedAccount(acc);
    setAccountModalMode('password');
    setIsAccountModalOpen(true);
  };

  const handleQuickResetPassword = async (acc) => {
    if (!window.confirm(`Bạn có chắc muốn đặt lại mật khẩu của "${acc.username}" về mặc định: "123"?`)) {
      return;
    }
    try {
      await accountService.changePassword(acc.id, { newPassword: '123' });
      setAccountActionMsg({
        type: 'success',
        text: `Đã đặt lại mật khẩu tài khoản "${acc.username}" về "123" thành công!`
      });
      setTimeout(() => setAccountActionMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAccountActionMsg({
        type: 'error',
        text: 'Lỗi khi reset mật khẩu: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const filteredAccounts = accountsList.filter((acc) => {
    if (accountRoleFilter !== 'all' && acc.role !== accountRoleFilter) return false;
    if (!accountSearch.trim()) return true;
    const q = accountSearch.toLowerCase();
    return (
      (acc.username && acc.username.toLowerCase().includes(q)) ||
      (acc.department_name && acc.department_name.toLowerCase().includes(q)) ||
      (acc.department_code && acc.department_code.toLowerCase().includes(q))
    );
  });

  const deptAccountsCount = accountsList.filter((a) => a.role === 'department').length;
  const adminAccountsCount = accountsList.filter((a) => a.role === 'admin').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Summary Stat Cards Grid (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Total Accounts */}
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
            <FaUserShield />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F2C59', lineHeight: '1.1' }}>
              {accountsList.length}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              TỔNG SỐ TÀI KHOẢN
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Phân quyền truy cập hệ thống
            </div>
          </div>
        </div>

        {/* Card 2: Department Accounts */}
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
            <FaHospital />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', lineHeight: '1.1' }}>
              {deptAccountsCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              TÀI KHOẢN KHOA PHÒNG
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Nhập và gửi báo cáo trực
            </div>
          </div>
        </div>

        {/* Card 3: Admin Accounts */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #7C3AED',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#EDE9FE',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaUserTie />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#6D28D9', lineHeight: '1.1' }}>
              {adminAccountsCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              QUẢN TRỊ VIÊN (KHNV)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Ban giám đốc & Phòng KHNV
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Message Banner */}
      {accountActionMsg.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: '700',
          backgroundColor: accountActionMsg.type === 'error' ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${accountActionMsg.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          color: accountActionMsg.type === 'error' ? '#DC2626' : '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>
            {accountActionMsg.type === 'error' ? '⚠️ ' : '✓ '}
            {accountActionMsg.text}
          </span>
          <button
            type="button"
            onClick={() => setAccountActionMsg({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
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
        <div style={{ display: 'flex', gap: '0.65rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FaSearch style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Tìm theo tên khoa, username..."
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.48rem 0.85rem 0.48rem 2.2rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                color: '#0F2C59',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <select
            value={accountRoleFilter}
            onChange={(e) => setAccountRoleFilter(e.target.value)}
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
            <option value="all">Tất cả vai trò</option>
            <option value="department">Khoa phòng</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <button
            type="button"
            onClick={fetchAccounts}
            disabled={loadingAccounts}
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
            title="Tải lại danh sách tài khoản"
          >
            <FaSync className={loadingAccounts ? 'spinner' : ''} size={11} /> Làm mới
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenAddAccount}
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
          <FaPlus size={11} /> Thêm Tài Khoản Mới
        </button>
      </div>

      {/* 4. Accounts Data Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
        overflow: 'hidden'
      }}>
        {loadingAccounts ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#2563EB' }} />
            <p style={{ marginTop: '0.85rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
              Đang tải danh sách tài khoản...
            </p>
          </div>
        ) : accountsError ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            ⚠️ {accountsError}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '50px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '28%' }}>KHOA / PHÒNG</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800', width: '24%' }}>TÊN ĐĂNG NHẬP (USERNAME)</th>
                  <th style={{ padding: '0.75rem 1rem', width: '140px', textAlign: 'center', fontWeight: '800' }}>VAI TRÒ</th>
                  <th style={{ padding: '0.75rem 1rem', width: '280px', textAlign: 'center', fontWeight: '800' }}>
                    QUẢN LÝ MẬT KHẨU & THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                      Không tìm thấy tài khoản nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc, index) => {
                    const isAdmin = acc.role === 'admin';
                    return (
                      <tr
                        key={acc.id || index}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                      >
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                          {index + 1}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: isAdmin ? '#6D28D9' : '#0F2C59' }}>
                            {isAdmin ? '🛡️ ' : '🏥 '}
                            {acc.department_name}
                          </div>
                          {acc.department_code && (
                            <span style={{
                              fontSize: '0.72rem',
                              color: '#64748B',
                              backgroundColor: '#F1F5F9',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              fontWeight: '600',
                              marginTop: '2px',
                              display: 'inline-block'
                            }}>
                              Mã: {acc.department_code}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{
                              fontFamily: "'Roboto Mono', monospace",
                              fontWeight: '800',
                              fontSize: '0.88rem',
                              backgroundColor: '#F8FAFC',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              border: '1.5px solid #CBD5E1',
                              color: '#0F2C59'
                            }}>
                              {acc.username}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(acc.username, `user_${acc.id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: copiedAccount === `user_${acc.id}` ? '#10B981' : '#94A3B8',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.85rem'
                              }}
                              title="Copy tên đăng nhập"
                            >
                              {copiedAccount === `user_${acc.id}` ? (
                                <FaCheckCircle style={{ color: '#10B981' }} />
                              ) : (
                                <FaCopy />
                              )}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {isAdmin ? (
                            <span style={{
                              backgroundColor: '#EDE9FE',
                              color: '#6D28D9',
                              border: '1px solid #C4B5FD',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: '800'
                            }}>
                              🛡️ Quản Trị Viên
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1E40AF',
                              border: '1px solid #BFDBFE',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: '800'
                            }}>
                              🏥 Khoa Phòng
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              type="button"
                              onClick={() => handleOpenChangePassword(acc)}
                              style={{
                                backgroundColor: '#0F2C59',
                                color: '#FFFFFF',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Đổi mật khẩu cho tài khoản này"
                            >
                              <FaKey style={{ color: '#FDE047' }} size={10} /> Đổi Mật Khẩu
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickResetPassword(acc)}
                              style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.3rem 0.55rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Đặt lại mật khẩu nhanh về '123'"
                            >
                              <FaUnlockAlt size={10} /> Reset (123)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditAccount(acc)}
                              style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.3rem 0.55rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Chỉnh sửa thông tin tài khoản"
                            >
                              <FaEdit size={10} /> Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Form / Password Modal */}
      <AccountFormModal
        isOpen={isAccountModalOpen}
        modalMode={accountModalMode}
        selectedAccount={selectedAccount}
        onClose={() => setIsAccountModalOpen(false)}
        onWasSaved={() => {
          fetchAccounts();
          setAccountActionMsg({
            type: 'success',
            text:
              accountModalMode === 'password'
                ? 'Đã thay đổi mật khẩu thành công!'
                : selectedAccount
                ? 'Đã cập nhật thông tin tài khoản thành công!'
                : 'Đã tạo tài khoản mới thành công!'
          });
          setTimeout(() => setAccountActionMsg({ type: '', text: '' }), 4000);
        }}
      />
    </div>
  );
};

export default AccountsTab;
