import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FaWpforms,
  FaSignOutAlt,
  FaUser,
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
  FaClipboardCheck,
  FaHospital,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaLayerGroup,
  FaEye,
  FaLock
} from 'react-icons/fa';
import customFormService from '../../services/customFormService';
import DynamicFormRenderer from '../admin/custom-forms/DynamicFormRenderer';
import DynamicFormSubmissions from '../admin/custom-forms/DynamicFormSubmissions';
import TrackerWidgetView from '../admin/custom-forms/TrackerWidgetView';
import MedicalLoader from '../common/MedicalLoader';

const PersonalCustomFormsPortal = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // view: 'list' | 'fill' | 'submissions'
  const [activeView, setActiveView] = useState('list');
  const [selectedFormCode, setSelectedFormCode] = useState('');
  const [isReadOnlySubmissions, setIsReadOnlySubmissions] = useState(false);

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

  // Kiểm tra quyền phân bổ cho tài khoản hiện tại đối với từng biểu mẫu
  const getUserFormPermission = (form) => {
    if (!user) return 'none';
    if (user.role === 'admin') return 'edit';

    const perms = form?.permissions || [];
    if (perms.length === 0) return 'edit'; // Mặc định mở nếu chưa đặt quyền

    // 1. Kiểm tra trực tiếp theo username của tài khoản
    const userPerm = perms.find(p => p.target_type === 'user' && p.target_value === user.username);
    if (userPerm) return userPerm.permission; // 'edit' hoặc 'view'

    // 2. Kiểm tra theo khoa phòng
    const deptPerm = perms.find(p => p.target_type === 'department' && p.target_value === user.departmentCode);
    if (deptPerm) return deptPerm.permission;

    // 3. Kiểm tra theo role
    const rolePerm = perms.find(p => p.target_type === 'role' && (p.target_value === user.role || p.target_value === 'staff' || p.target_value === 'personal'));
    if (rolePerm) return rolePerm.permission;

    // 4. Quyền toàn viện (all)
    const allPerm = perms.find(p => p.target_type === 'all');
    if (allPerm) return allPerm.permission;

    return 'view'; // fallback view-only
  };

  const handleFillForm = (code) => {
    setSelectedFormCode(code);
    setIsReadOnlySubmissions(false);
    setActiveView('fill');
  };

  const handleViewSubmissions = (code, readOnlyMode = true) => {
    setSelectedFormCode(code);
    setIsReadOnlySubmissions(Boolean(readOnlyMode));
    setActiveView('submissions');
  };

  const handleBackToList = () => {
    setSelectedFormCode('');
    setIsReadOnlySubmissions(false);
    setActiveView('list');
    fetchAccessibleForms();
  };

  const filteredForms = forms.filter(f => 
    (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trackerForms = filteredForms.filter(f => f.form_type === 'tracker');
  const inputForms = filteredForms.filter(f => f.form_type !== 'tracker');

  const todayStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F0FA 30%, #F8FAFC 70%, #EBF5FF 100%)',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Ambient Lighting Layer */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 15% 15%, rgba(199, 229, 253, 0.45) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(224, 242, 254, 0.5) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(209, 250, 229, 0.4) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header style={{
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '0.9rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(15, 44, 89, 0.18)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.12rem', fontWeight: '900', letterSpacing: '0.3px', color: '#FFFFFF' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h1>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#93C5FD', fontWeight: '600', letterSpacing: '0.2px' }}>
              Cổng Biểu Mẫu Chuyên Môn & Data Tracker Cá Nhân
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.22)'
          }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
              <FaUser />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFFFFF' }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: '600' }}>@{user?.username} • Tài khoản cá nhân</div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              padding: '0.5rem 1rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main style={{ flex: 1, maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '1.75rem 1.5rem 4rem', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>
        
        {/* SUB-VIEW 1: FORM FILL */}
        {activeView === 'fill' && (
          <DynamicFormRenderer
            formCode={selectedFormCode}
            onBack={handleBackToList}
          />
        )}

        {/* SUB-VIEW 2: SUBMISSIONS */}
        {activeView === 'submissions' && (
          <DynamicFormSubmissions
            formCode={selectedFormCode}
            readOnly={isReadOnlySubmissions}
            onBack={handleBackToList}
          />
        )}

        {/* MAIN PORTAL LIST VIEW */}
        {activeView === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Hero Banner Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem 2.2rem',
              boxShadow: '0 10px 30px rgba(15, 44, 89, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background gradient accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '320px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(224, 242, 254, 0.4) 100%)',
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <FaShieldAlt /> HỆ THỐNG PHÂN QUYỀN TRUY CẬP
                </div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.55rem', fontWeight: '900', color: '#0F2C59', letterSpacing: '-0.3px' }}>
                  Xin chào, {user?.full_name || user?.username}!
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', maxWidth: '640px', lineHeight: 1.5 }}>
                  Dưới đây là các biểu mẫu và bảng theo dõi dữ liệu tự động mà bạn được Ban Giám Đốc & Admin cấp quyền truy cập.
                </p>
              </div>

              {/* Search Bar & Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaCalendarAlt style={{ color: '#2563EB' }} /> {todayStr}
                </div>
                <div style={{ position: 'relative', width: '280px' }}>
                  <FaSearch style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
                  <input
                    type="text"
                    placeholder="Tìm nhanh biểu mẫu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem 0.6rem 2.3rem',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#F8FAFC'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.backgroundColor = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.backgroundColor = '#F8FAFC';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <MedicalLoader
                text="Đang nạp danh sách biểu mẫu phân quyền của bạn..."
                subtext="TTYT Khu Vực Bình Long • Hệ Thống Biểu Mẫu Tùy Chỉnh"
                minHeight="350px"
              />
            ) : filteredForms.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '2px dashed #CBD5E1',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
                  <FaWpforms />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#0F2C59' }}>
                  Chưa Có Biểu Mẫu Nào Được Phân Quyền
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', maxWidth: '520px', margin: '0 auto' }}>
                  Tài khoản cá nhân của bạn hiện chưa được Quản trị viên phân quyền vào biểu mẫu nào. Vui lòng liên hệ Phòng Kế Hoạch Nghiệp Vụ (Admin) để được mở quyền truy cập.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                {/* ======================================================== */}
                {/* 1. DATA TRACKERS SECTION: BUNG TRỰC TIẾP RA NGOÀI ĐỂ XEM */}
                {/* ======================================================== */}
                {trackerForms.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaChartLine />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59' }}>
                          ⚡ Data Tracker Tự Động ({trackerForms.length})
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                          Số liệu tổng hợp trực tiếp từ ca trực các khoa — Có thể chọn ngày để xem ngay
                        </p>
                      </div>
                    </div>

                    {/* Render each tracker embedded right here */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {trackerForms.map(tracker => (
                        <div
                          key={tracker.id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '24px',
                            border: '1.5px solid #E2E8F0',
                            padding: '1.5rem 1.8rem',
                            boxShadow: '0 10px 30px rgba(15, 44, 89, 0.06)'
                          }}
                        >
                          <TrackerWidgetView
                            formCode={tracker.code}
                            isEmbedded={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 2. INPUT FORMS SECTION: FORM NHẬP LIỆU & BÁO CÁO        */}
                {/* ======================================================== */}
                {inputForms.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaFileAlt />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59' }}>
                          📝 Biểu Mẫu Nhập Liệu & Báo Cáo ({inputForms.length})
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                          Các mẫu phiếu khảo sát, biên bản kiểm tra cần nhập số liệu định kỳ
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                      {inputForms.map(form => {
                        const themeColor = form.theme_color || '#2563EB';
                        const fieldsCount = Array.isArray(form.schema_json) ? form.schema_json.length : 0;
                        const submissionsCount = form.total_submissions || form.submissions_count || 0;
                        const userPerm = getUserFormPermission(form);
                        const isViewOnly = userPerm === 'view';

                        return (
                          <div
                            key={form.id}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '20px',
                              border: '1.5px solid #E2E8F0',
                              borderTop: `6px solid ${themeColor}`,
                              padding: '1.5rem',
                              boxShadow: '0 6px 20px rgba(15, 44, 89, 0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '1.2rem',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span style={{
                                  backgroundColor: isViewOnly ? '#FEF3C7' : '#ECFDF5',
                                  color: isViewOnly ? '#92400E' : '#047857',
                                  border: isViewOnly ? '1px solid #FDE68A' : 'none',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '8px',
                                  fontWeight: '800',
                                  fontSize: '0.74rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}>
                                  {isViewOnly ? <><FaEye /> Quyền Chỉ Xem</> : '📝 Form Báo Cáo'}
                                </span>
                                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', fontWeight: '700' }}>
                                  /{form.code}
                                </span>
                              </div>

                              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59', lineHeight: 1.3 }}>
                                {form.title}
                              </h3>

                              {form.description ? (
                                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>
                                  {form.description}
                                </p>
                              ) : (
                                <div style={{ height: '0.5rem' }} />
                              )}

                              {/* Stats Pill */}
                              <div style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                padding: '0.65rem 0.95rem',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem',
                                color: '#64748B'
                              }}>
                                <span>Số trường: <strong style={{ color: '#0F2C59' }}>{fieldsCount}</strong></span>
                                <span>Đã nộp: <strong style={{ color: themeColor }}>{submissionsCount} bản ghi</strong></span>
                              </div>
                            </div>

                            {/* Buttons: Nếu tài khoản chỉ có quyền xem thì CHỈ hiện nút [Xem Dữ Liệu] */}
                            {isViewOnly ? (
                              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleViewSubmissions(form.code, true)}
                                  style={{
                                    width: '100%',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                  title="Xem toàn bộ dữ liệu báo cáo (Chế độ chỉ đọc - Không thể thêm, sửa hay xóa)"
                                >
                                  <FaEye /> Xem Dữ Liệu ({submissionsCount})
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleFillForm(form.code)}
                                  style={{
                                    flex: 1.2,
                                    background: `linear-gradient(135deg, ${themeColor} 0%, #10B981 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0.7rem 1rem',
                                    fontWeight: '800',
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.45rem',
                                    boxShadow: `0 4px 12px ${themeColor}33`
                                  }}
                                >
                                  <FaPlusCircle /> Điền Báo Cáo
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleViewSubmissions(form.code, false)}
                                  style={{
                                    flex: 0.8,
                                    backgroundColor: '#F1F5F9',
                                    color: '#334155',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '12px',
                                    padding: '0.7rem 0.85rem',
                                    fontWeight: '700',
                                    fontSize: '0.84rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem'
                                  }}
                                  title="Xem lịch sử các bản ghi đã nộp"
                                >
                                  <FaClipboardCheck /> Bản ghi ({submissionsCount})
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.78rem',
        color: '#64748B',
        fontWeight: '600',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF'
      }}>
        © 2026 Trung Tâm Y Tế Khu Vực Bình Long — Hệ Thống Biểu Mẫu Chuyên Môn & Giao Ban Toàn Viện
      </footer>
    </div>
  );
};

export default PersonalCustomFormsPortal;
