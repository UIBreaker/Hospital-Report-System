import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FaWpforms,
  FaSignOutAlt,
  FaUser,
  FaSpinner,
  FaCheckCircle,
  FaFileAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaShieldAlt,
  FaChartLine,
  FaPlusCircle,
  FaListUl,
  FaClipboardCheck
} from 'react-icons/fa';
import customFormService from '../../services/customFormService';
import DynamicFormRenderer from '../admin/custom-forms/DynamicFormRenderer';
import DynamicFormSubmissions from '../admin/custom-forms/DynamicFormSubmissions';

const PersonalCustomFormsPortal = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // view: 'list' | 'fill' | 'submissions'
  const [activeView, setActiveView] = useState('list');
  const [selectedFormCode, setSelectedFormCode] = useState('');

  const fetchAccessibleForms = async () => {
    setLoading(true);
    try {
      const res = await customFormService.getAllForms();
      if (res && res.success) {
        // Filter forms accessible to this user
        const accessible = (res.data || []).filter(f => {
          if (!f.is_active) return false;
          const perms = f.permissions || [];
          if (perms.length === 0) return true;
          return perms.some(p => {
            if (p.target_type === 'all') return true;
            if (p.target_type === 'user' && p.target_value === user?.username) return true;
            if (p.target_type === 'role' && ['staff', 'personal'].includes(p.target_value)) return true;
            if (p.target_type === 'department' && p.target_value === 'personal') return true;
            return false;
          });
        });
        setForms(accessible);
      }
    } catch (err) {
      console.error('Error fetching accessible forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessibleForms();
  }, [user]);

  const handleFillForm = (code) => {
    setSelectedFormCode(code);
    setActiveView('fill');
  };

  const handleViewSubmissions = (code) => {
    setSelectedFormCode(code);
    setActiveView('submissions');
  };

  const handleBackToList = () => {
    setSelectedFormCode('');
    setActiveView('list');
  };

  const filteredForms = forms.filter(f => 
    (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(15, 44, 89, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.3px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#93C5FD', fontWeight: '600' }}>
              Cổng Biểu Mẫu Cá Nhân • Phân Quyền Báo Cáo
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
              <FaUser />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800' }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: '#93C5FD' }}>@{user?.username} • Tài khoản cá nhân</div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        {activeView === 'fill' && (
          <DynamicFormRenderer
            formCode={selectedFormCode}
            onBack={handleBackToList}
          />
        )}

        {activeView === 'submissions' && (
          <DynamicFormSubmissions
            formCode={selectedFormCode}
            onBack={handleBackToList}
          />
        )}

        {activeView === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Banner Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem 1.8rem',
              boxShadow: '0 4px 20px rgba(15, 44, 89, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.4rem', fontWeight: '900', color: '#0F2C59' }}>
                  📋 Danh Sách Biểu Mẫu Được Phân Quyền ({forms.length})
                </h2>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                  Bạn có thể chọn biểu mẫu bên dưới để nhập số liệu báo cáo hoặc theo dõi các bản ghi đã gửi.
                </p>
              </div>

              {/* Search Bar */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '320px'
              }}>
                <FaSearch style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm biểu mẫu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem 0.6rem 2.3rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '3.5rem', textAlign: 'center', color: '#64748B', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <FaSpinner className="spinner" style={{ fontSize: '2.2rem', color: '#2563EB', marginBottom: '0.85rem' }} />
                <p style={{ margin: 0, fontWeight: '700' }}>Đang nạp danh sách biểu mẫu phân quyền của bạn...</p>
              </div>
            ) : filteredForms.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px dashed #CBD5E1',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                color: '#64748B'
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem' }}>
                  <FaWpforms />
                </div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#0F2C59' }}>
                  Chưa Có Biểu Mẫu Nào Được Phân Quyền
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', maxWidth: '500px', margin: '0 auto' }}>
                  Tài khoản cá nhân của bạn hiện chưa được Quản trị viên phân quyền vào biểu mẫu nào. Vui lòng liên hệ Phòng Kế Hoạch Nghiệp Vụ (Admin) để được mở quyền truy cập.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {filteredForms.map(form => {
                  const themeColor = form.theme_color || '#2563EB';

                  return (
                    <div
                      key={form.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        borderLeft: `6px solid ${themeColor}`,
                        padding: '1.35rem 1.5rem',
                        boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{
                            backgroundColor: form.form_type === 'tracker' ? '#EFF6FF' : '#ECFDF5',
                            color: form.form_type === 'tracker' ? '#1D4ED8' : '#047857',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '0.74rem'
                          }}>
                            {form.form_type === 'tracker' ? '📊 Data Tracker' : '📝 Form Báo Cáo'}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748B' }}>
                            /{form.code}
                          </span>
                        </div>

                        <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                          {form.title}
                        </h3>

                        {form.description && (
                          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>
                            {form.description}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleFillForm(form.code)}
                          style={{
                            flex: 1,
                            backgroundColor: themeColor,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '9px',
                            padding: '0.6rem 0.85rem',
                            fontWeight: '800',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: `0 3px 10px ${themeColor}33`
                          }}
                        >
                          <FaPlusCircle /> Điền Báo Cáo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleViewSubmissions(form.code)}
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            borderRadius: '9px',
                            padding: '0.6rem 0.85rem',
                            fontWeight: '700',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title="Xem lịch sử các bản ghi đã nộp"
                        >
                          <FaClipboardCheck /> Bản ghi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonalCustomFormsPortal;
