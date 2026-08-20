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
  FaCheckCircle
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

  return (
    <div className="animate-fade-in">
      {/* Stats Summary Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            borderLeft: '4px solid var(--brand-blue)'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>
            {accountsList.length}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Tổng số tài khoản
          </div>
        </div>
        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            borderLeft: '4px solid var(--brand-green)'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-green)' }}>
            {accountsList.filter((a) => a.role === 'department').length}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: 'var(--brand-green)',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Tài khoản Khoa/Phòng
          </div>
        </div>
        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FAF5FF, #E9D5FF)',
            borderLeft: '4px solid #7C3AED'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#7C3AED' }}>
            {accountsList.filter((a) => a.role === 'admin').length}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: '#7C3AED',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Quản trị viên (KHNV)
          </div>
        </div>
      </div>

      {/* Action Message Banner */}
      {accountActionMsg.text && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.92rem',
            fontWeight: '600',
            backgroundColor:
              accountActionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
            color: accountActionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>
            {accountActionMsg.type === 'error' ? '⚠️ ' : '✓ '}
            {accountActionMsg.text}
          </span>
          <button
            onClick={() => setAccountActionMsg({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FaSearch
              style={{
                position: 'absolute',
                top: '50%',
                left: '0.85rem',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên khoa, username..."
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.4rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                padding: '0.55rem 0.75rem 0.55rem 2.4rem',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <select
            value={accountRoleFilter}
            onChange={(e) => setAccountRoleFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '0.9rem',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="department">Khoa phòng</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <button
            onClick={fetchAccounts}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Tải lại danh sách tài khoản"
          >
            <FaSync /> Làm mới
          </button>
        </div>

        <button
          onClick={handleOpenAddAccount}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
        >
          <FaPlus /> Thêm Tài Khoản Mới
        </button>
      </div>

      {/* Accounts Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {loadingAccounts ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải danh sách tài khoản...</p>
          </div>
        ) : accountsError ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>⚠️ {accountsError}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', textAlign: 'left' }}>
                  <th style={{ padding: '0.9rem 1rem', width: '50px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Khoa / Phòng</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Tên Đăng Nhập (Username)</th>
                  <th style={{ padding: '0.9rem 1rem', width: '140px', textAlign: 'center' }}>Vai Trò</th>
                  <th style={{ padding: '0.9rem 1rem', width: '280px', textAlign: 'center' }}>
                    Quản Lý Mật Khẩu & Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy tài khoản nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc, index) => {
                    const isAdmin = acc.role === 'admin';
                    return (
                      <tr
                        key={acc.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: isAdmin ? '#7C3AED' : '#0F2C59' }}>
                            {isAdmin ? '🛡️ ' : '🏥 '}
                            {acc.department_name}
                          </div>
                          {acc.department_code && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748B',
                                backgroundColor: '#E2E8F0',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}
                            >
                              Mã: {acc.department_code}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: '800',
                                fontSize: '0.98rem',
                                backgroundColor: '#F1F5F9',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                color: '#0F2C59'
                              }}
                            >
                              {acc.username}
                            </span>
                            <button
                              onClick={() => handleCopyAccount(acc.username, `user_${acc.id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: copiedAccount === `user_${acc.id}` ? 'var(--brand-green)' : '#94A3B8',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Copy tên đăng nhập"
                            >
                              {copiedAccount === `user_${acc.id}` ? (
                                <FaCheckCircle style={{ color: '#16A34A' }} />
                              ) : (
                                <FaCopy />
                              )}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {isAdmin ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#EDE9FE',
                                color: '#6D28D9',
                                border: '1px solid #C4B5FD',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              🛡️ Quản Trị Viên
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#E0F2FE',
                                color: '#0369A1',
                                border: '1px solid #BAE6FD',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              🏥 Khoa Phòng
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              flexWrap: 'wrap'
                            }}
                          >
                            <button
                              onClick={() => handleOpenChangePassword(acc)}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#0F2C59',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                borderRadius: '5px'
                              }}
                              title="Đổi mật khẩu cho tài khoản này"
                            >
                              <FaKey style={{ color: '#FDE047' }} /> Đổi Mật Khẩu
                            </button>

                            <button
                              onClick={() => handleQuickResetPassword(acc)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.55rem',
                                fontSize: '0.8rem',
                                borderRadius: '5px'
                              }}
                              title="Đặt lại mật khẩu nhanh về '123'"
                            >
                              <FaUnlockAlt /> Reset (123)
                            </button>

                            <button
                              onClick={() => handleOpenEditAccount(acc)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.55rem',
                                fontSize: '0.8rem',
                                borderRadius: '5px'
                              }}
                              title="Chỉnh sửa thông tin tài khoản"
                            >
                              <FaEdit /> Sửa
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
