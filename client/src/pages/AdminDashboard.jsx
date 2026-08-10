import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaCalendarAlt, FaSignOutAlt, FaTv, FaCheck, FaTimes, FaSpinner, FaSync, FaEdit, FaSave, FaEye, FaPlus, FaTrash, FaAmbulance, FaExclamationTriangle, FaCodeBranch, FaDatabase, FaTable, FaServer, FaHdd, FaLayerGroup, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import reportService from '../services/reportService';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Tab State: 'reports' (Báo Cáo Giao Ban) | 'database' (Quản Lý Database)
  const [activeTab, setActiveTab] = useState('reports');

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Database Stats State
  const [dbStats, setDbStats] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbError, setDbError] = useState('');
  const [lastDbUpdate, setLastDbUpdate] = useState('');

  // Modal State for View & Edit & Delete Report
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Editable Form Data inside Modal
  const [editHeader, setEditHeader] = useState({ doctorName: '', room: '', shiftTime: '' });
  const [editReportData, setEditReportData] = useState({});
  const [editTransferCases, setEditTransferCases] = useState([]);
  const [hasReport, setHasReport] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportService.getDepartmentStatus(date);
      setStatusList(response.data || []);
    } catch (err) {
      setError('Không thể tải trạng thái báo cáo.');
      setStatusList([
        { departmentCode: 'lck', departmentName: 'Khoa Liên Chuyên Khoa', status: 'not_submitted' },
        { departmentCode: 'xn', departmentName: 'Khoa Xét nghiệm', status: 'not_submitted' },
        { departmentCode: 'cdha', departmentName: 'Chẩn đoán hình ảnh', status: 'not_submitted' },
        { departmentCode: 'hscc_tnt', departmentName: 'Hồi sức cấp cứu – Thận nhân tạo', status: 'not_submitted' },
        { departmentCode: 'noi', departmentName: 'Khoa Nội', status: 'not_submitted' },
        { departmentCode: 'nhi', departmentName: 'Khoa Nhi', status: 'not_submitted' },
        { departmentCode: 'nhiem', departmentName: 'Khoa Nhiễm', status: 'not_submitted' },
        { departmentCode: 'san', departmentName: 'Khoa Sản', status: 'not_submitted' },
        { departmentCode: 'yhct_phcn', departmentName: 'Y học cổ truyền – Phục hồi chức năng', status: 'not_submitted' },
        { departmentCode: 'ngoai_th', departmentName: 'Ngoại tổng hợp', status: 'not_submitted' },
        { departmentCode: 'ctch', departmentName: 'Chấn thương chỉnh hình', status: 'not_submitted' },
        { departmentCode: 'gmhs', departmentName: 'Gây mê Hồi sức', status: 'not_submitted' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    setLoadingDb(true);
    setDbError('');
    try {
      const response = await reportService.getDatabaseStats();
      if (response && response.data) {
        setDbStats(response.data);
        setLastDbUpdate(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      setDbError(err.response?.data?.error || 'Không thể tải thông tin dung lượng database.');
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchStatus();
    } else if (activeTab === 'database') {
      fetchDatabaseStats();
    }
  }, [date, activeTab]);

  const handlePresentation = () => {
    navigate(`/presentation/${date}`);
  };

  const handleOpenDetailModal = async (dept) => {
    setModalDept(dept);
    setModalOpen(true);
    setLoadingReport(true);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setSaveSuccess('');
    try {
      const res = await reportService.getReport(dept.departmentCode, date);
      const report = res.data;
      if (report) {
        setHasReport(true);
        setEditHeader({
          doctorName: report.doctor_name || '',
          room: report.room || '',
          shiftTime: report.shift_time || ''
        });
        const parsedData = typeof report.report_data === 'string' ? JSON.parse(report.report_data) : (report.report_data || {});
        setEditReportData(parsedData);
        setEditTransferCases(report.transferCases || []);
      } else {
        setHasReport(false);
        setEditHeader({ doctorName: '', room: '', shiftTime: '' });
        setEditReportData({});
        setEditTransferCases([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết báo cáo:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSaveReport = async () => {
    setSaving(true);
    setSaveSuccess('');
    try {
      await reportService.createOrUpdateReport({
        departmentCode: modalDept.departmentCode,
        reportDate: date,
        doctorName: editHeader.doctorName,
        room: editHeader.room,
        shiftTime: editHeader.shiftTime,
        reportData: editReportData,
        transferCases: editTransferCases
      });
      setSaveSuccess('Đã lưu thay đổi báo cáo thành công!');
      setIsEditing(false);
      setHasReport(true);
      fetchStatus();
    } catch (err) {
      alert('Không thể lưu báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    setDeleting(true);
    try {
      await reportService.deleteReport(modalDept.departmentCode, date);
      setModalOpen(false);
      setShowDeleteConfirm(false);
      fetchStatus();
    } catch (err) {
      alert('Không thể xóa báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleReportDataChange = (path, val) => {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(editReportData));
    let curr = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = val;
    setEditReportData(newData);
  };

  const handleAddTransferCase = () => {
    setEditTransferCases([
      ...editTransferCases,
      { patientName: '', age: '', address: '', admissionTime: '', reason: '', clinicalTests: '', diagnosis: '', initialTreatment: '', progressNotes: '' }
    ]);
  };

  const handleRemoveTransferCase = (index) => {
    setEditTransferCases(editTransferCases.filter((_, i) => i !== index));
  };

  const handleTransferCaseChange = (index, field, val) => {
    const newCases = [...editTransferCases];
    newCases[index] = { ...newCases[index], [field]: val };
    setEditTransferCases(newCases);
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
    'gmhs'
  ];

  const submittedCount = statusList.filter(s => s.status === 'submitted').length;
  const totalCount = statusList.length;

  const ADMIN_FIELD_LABELS = {
    // Khoa Liên Chuyên Khoa
    tmh_tongSo: 'Tai Mũi Họng (Tổng số)',
    tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
    mat_tongSo: 'Mắt (Tổng số)',
    mat_thuThuat: 'Mắt (Thủ thuật)',
    rhm_noi_tongSo: 'RHM + Nội (Tổng số)',
    rhm_noi_thuThuat: 'RHM + Nội (Thủ thuật)',
    daLieu_tongSo: 'Da liễu (Tổng số)',
    nhapVien_tongSo: 'Nhập viện',
    chuyenVien_tongSo: 'Chuyển viện',
    tong4ck_tongSo: 'Tổng số 4 Chuyên Khoa',
    tong4ck_thuThuat: 'Tổng Thủ thuật 4CK',

    // Các khoa khác
    bsSieuAm: 'Bác sĩ trực Siêu âm',
    bsXquangCT: 'Bác sĩ trực Xquang – CT Scan',
    themGio: 'Ghi chú thêm giờ',
    techniques: 'Thống kê kỹ thuật',
    noiTru: 'Điều trị nội trú',
    ngoaiTru: 'Điều trị ngoại trú',
    keToa: 'Kê toa',
    hscc: 'Khối Hồi sức cấp cứu (HSCC)',
    tnt: 'Khối Thận nhân tạo (TNT)',
    pk21: 'Phòng khám 21',
    tuVong: '⚠️ TỬ VONG'
  };

  const getAdminFieldLabel = (key) => {
    if (key.toLowerCase().includes('tuvong') || key.toLowerCase().includes('tu_vong')) {
      return '🚨 TỬ VONG (Số ca)';
    }
    return ADMIN_FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase());
  };

  const renderEditableFields = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return null;
    return Object.entries(obj).map(([key, value]) => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const isTuVong = key.toLowerCase().includes('tuvong') || key.toLowerCase().includes('tu_vong');

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={fieldPath} style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
            <h4 style={{ color: 'var(--brand-blue)', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase' }}>{getAdminFieldLabel(key)}</h4>
            <div className="form-grid" style={{ marginTop: '0.5rem' }}>
              {renderEditableFields(value, fieldPath)}
            </div>
          </div>
        );
      }

      // Handle Array of Objects (e.g. techniques in Chẩn đoán hình ảnh)
      if (Array.isArray(value)) {
        return (
          <div key={fieldPath} style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
            <h4 style={{ color: 'var(--brand-blue)', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              {key === 'techniques' ? 'Thống Kê Kỹ Thuật (Chẩn Đoán Hình Ảnh)' : getAdminFieldLabel(key)}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: 'var(--brand-blue)' }}>
                    <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'left', fontWeight: '700' }}>Kỹ thuật</th>
                    <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: '700' }}>Tổng số</th>
                    <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: '700' }}>Bảo hiểm</th>
                    <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: '700' }}>Nội trú</th>
                    <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: '700' }}>Ngoại trú</th>
                  </tr>
                </thead>
                <tbody>
                  {value.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', fontWeight: '700', color: 'var(--brand-blue)' }}>
                        {item.name || `Mục ${idx + 1}`}
                      </td>
                      {['tongSo', 'baoHiem', 'noiTru', 'ngoaiTru'].map(col => (
                        <td key={col} style={{ padding: '6px 8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                          {isEditing ? (
                            <input 
                              type="number"
                              min="0"
                              value={item[col] ?? ''}
                              onChange={(e) => {
                                const newArray = JSON.parse(JSON.stringify(value));
                                newArray[idx][col] = e.target.value;
                                handleReportDataChange(fieldPath, newArray);
                              }}
                              style={{ width: '80px', padding: '4px 6px', textAlign: 'center', border: '1.5px solid var(--border)', borderRadius: '4px' }}
                            />
                          ) : (
                            <span style={{ fontWeight: '700', color: col === 'tongSo' ? 'var(--brand-blue)' : 'var(--text-main)' }}>
                              {item[col] || '0'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      return (
        <div key={fieldPath} className="form-group" style={isTuVong ? { backgroundColor: '#FEF2F2', padding: '0.5rem', borderRadius: '8px', border: '1px solid #FCA5A5' } : {}}>
          <label style={{ fontSize: '0.8rem', color: isTuVong ? '#DC2626' : 'var(--text-muted)', fontWeight: isTuVong ? '800' : '600' }}>
            {getAdminFieldLabel(key)}
          </label>
          {isEditing ? (
            <input 
              type="text" 
              value={value ?? ''} 
              onChange={(e) => handleReportDataChange(fieldPath, e.target.value)} 
              style={isTuVong ? { borderColor: '#DC2626', color: '#DC2626', fontWeight: '800', backgroundColor: '#FFF' } : {}}
            />
          ) : (
            <div style={{
              padding: '0.6rem 0.85rem',
              backgroundColor: isTuVong ? '#FEE2E2' : 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isTuVong ? '#DC2626' : 'var(--border)'}`,
              fontSize: '0.9rem',
              fontWeight: isTuVong ? '800' : '600',
              color: isTuVong ? '#DC2626' : (value ? 'var(--text-main)' : 'var(--text-muted)'),
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="admin-dashboard-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Brand Header */}
      <header className="card admin-header" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', background: '#FFFFFF' }}>
        <div className="admin-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img" />
          <div>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--brand-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h4>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', fontWeight: '800' }}>
              KHNV — Theo Dõi Báo Cáo Giao Ban
            </h2>
          </div>
        </div>

        <div className="admin-header-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-date-picker-box" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-color)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
            <FaCalendarAlt color="var(--brand-blue-light)" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', outline: 'none', padding: 0, width: 'auto', background: 'transparent', fontWeight: '600', color: 'var(--brand-blue)', fontSize: '0.9rem' }}
            />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchStatus} title="Làm mới dữ liệu" style={{ padding: '0.5rem 0.75rem' }}>
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handlePresentation} style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
            <FaTv /> Trình Chiếu Giao Ban
          </button>
          <button className="btn btn-secondary btn-sm" onClick={logout} style={{ fontSize: '0.85rem', padding: '0.55rem 0.9rem' }}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation Tabs (Báo Cáo Giao Ban vs Quản Lý Database) */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
        borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'reports' ? 'var(--brand-blue)' : '#F1F5F9',
            color: activeTab === 'reports' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(15, 44, 89, 0.2)' : 'none'
          }}
        >
          <FaLayerGroup /> Báo Cáo Giao Ban
        </button>
        
        <button
          onClick={() => setActiveTab('database')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'database' ? 'var(--brand-blue)' : '#F1F5F9',
            color: activeTab === 'database' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'database' ? '0 4px 12px rgba(15, 44, 89, 0.2)' : 'none'
          }}
        >
          <FaDatabase /> Quản Lý Database
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BÁO CÁO GIAO BAN                                       */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          {/* Stats Summary Grid (Clean 3-column on all screens) */}
          <div className="admin-stats-grid">
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{totalCount}</div>
              <div className="stats-lbl" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số khoa</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '4px solid var(--brand-green)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-green)' }}>{submittedCount}</div>
              <div className="stats-lbl" style={{ color: 'var(--brand-green)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đã nộp</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderLeft: '4px solid #D97706' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#92400E' }}>{totalCount - submittedCount}</div>
              <div className="stats-lbl" style={{ color: '#92400E', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chưa nộp</div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--warning-light)', color: '#92400E', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Department Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu báo cáo...</p>
            </div>
          ) : (
            <div className="admin-dept-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {[...statusList].sort((a, b) => {
                const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
                const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
                return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
              }).map((dept, index) => {
                const isSubmitted = dept.status === 'submitted';
                return (
                  <div 
                    key={dept.departmentCode} 
                    className="card"
                    onClick={() => handleOpenDetailModal(dept)}
                    style={{ 
                      borderLeft: `5px solid ${isSubmitted ? 'var(--brand-green)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      animationDelay: `${index * 0.04}s`,
                      animation: 'slideUp 0.3s ease-out forwards',
                      opacity: 0,
                      position: 'relative',
                      padding: '1.1rem 1.25rem'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)', lineHeight: 1.3 }}>{dept.departmentName}</h3>
                      {isSubmitted ? 
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                          <FaCheck size={10} /> Đã nộp
                        </span> : 
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                          <FaTimes size={10} /> Chưa nộp
                        </span>
                      }
                    </div>
                    
                    {isSubmitted ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {dept.doctorName && <p style={{ marginBottom: '0.5rem' }}>👨‍⚕️ <strong>Bác sĩ trực:</strong> {dept.doctorName}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ color: 'var(--brand-green)', fontWeight: '600', fontSize: '0.8rem' }}>✓ Đã nộp báo cáo</span>
                          <span className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                            <FaEye /> Xem / Sửa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có báo cáo</span>
                        <span className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                          <FaEdit /> Nhập hộ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: QUẢN LÝ DATABASE                                       */}
      {/* ============================================================ */}
      {activeTab === 'database' && (
        <div className="animate-fade-in">
          {/* Controls & Title Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-blue)', fontSize: '1.3rem' }}>
                <FaDatabase />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-blue)', fontWeight: '800', margin: 0 }}>
                  Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Giám sát dung lượng lưu trữ, cấu trúc bảng và tài nguyên hệ thống theo thời gian thực.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {lastDbUpdate && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  🕒 Cập nhật: <strong>{lastDbUpdate}</strong>
                </span>
              )}
              <button 
                className="btn btn-primary btn-sm" 
                onClick={fetchDatabaseStats} 
                disabled={loadingDb}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem' }}
              >
                <FaSync className={loadingDb ? 'spinner' : ''} /> {loadingDb ? 'Đang tải...' : 'Làm Mới Dữ Liệu'}
              </button>
            </div>
          </div>

          {dbError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ❌ <strong>Lỗi kết nối cơ sở dữ liệu:</strong> {dbError}
            </div>
          )}

          {loadingDb && !dbStats ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang truy vấn thông tin dung lượng database...</p>
            </div>
          ) : dbStats ? (
            <>
              {/* Top Overview Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Metric 1: Total Storage & Progress Bar */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderLeft: '4px solid #10B981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tổng dung lượng đã dùng
                    </span>
                    <FaHdd style={{ color: '#10B981', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065F46' }}>
                      {dbStats.totalSizeMb} <span style={{ fontSize: '1rem', fontWeight: '600' }}>MB</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#047857' }}>
                      / {dbStats.maxLimitMb} MB ({dbStats.usagePercentage}% giới hạn)
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(dbStats.usagePercentage, 1)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981, #059669)',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                </div>

                {/* Metric 2: Tables & Records Count */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cấu trúc & Bản ghi
                    </span>
                    <FaTable style={{ color: 'var(--brand-blue)', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '0.2rem' }}>
                    {dbStats.tablesCount} <span style={{ fontSize: '1rem', fontWeight: '600' }}>bảng dữ liệu</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                    Ước tính khoảng <strong>{dbStats.totalRows}</strong> bản ghi tổng cộng
                  </div>
                </div>

                {/* Metric 3: Database Name & Status */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)', borderLeft: '4px solid #8B5CF6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cơ sở dữ liệu
                    </span>
                    <FaServer style={{ color: '#8B5CF6', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#5B21B6', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
                    {dbStats.databaseName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                      ✓ Kết Nối Sẵn Sàng (Online)
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Details Card */}
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--brand-blue)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTable style={{ color: 'var(--brand-blue-light)' }} /> Danh Sách Chi Tiết Các Bảng Dữ Liệu
                </h4>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', width: '50px' }}>#</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Tên Bảng</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Mô Tả Chức Năng</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Số Dòng (Rows)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Dữ Liệu (Data)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Chỉ Mục (Index)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Tổng Dung Lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbStats.tables.map((table, idx) => {
                      const desc = {
                        users: 'Tài khoản đăng nhập & phân quyền cán bộ/khoa phòng',
                        reports: 'Báo cáo số liệu giao ban hàng ngày của 11 khoa phòng',
                        transfer_cases: 'Hồ sơ chi tiết các ca bệnh nhân chuyển viện cấp cứu'
                      }[table.tableName] || 'Bảng dữ liệu hệ thống';

                      return (
                        <tr 
                          key={table.tableName}
                          style={{ 
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'; }}
                        >
                          <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ 
                              fontFamily: 'monospace', 
                              fontWeight: '700', 
                              backgroundColor: '#F1F5F9', 
                              padding: '0.25rem 0.55rem', 
                              borderRadius: '4px',
                              color: 'var(--brand-blue)'
                            }}>
                              {table.tableName}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                            {desc}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '600', color: '#475569' }}>
                            {Number(table.rowsCount).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748B' }}>
                            {table.dataSizeKb} KB
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748B' }}>
                            {table.indexSizeKb} KB
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '800', color: '#0F2C59' }}>
                            <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                              {table.sizeMb} MB
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Informational Guidance Box */}
              <div className="card" style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <FaInfoCircle style={{ color: 'var(--brand-blue)', fontSize: '1.3rem', marginTop: '0.15rem', flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  <strong>💡 Ghi chú kỹ thuật về dung lượng hệ thống:</strong>
                  <p style={{ margin: '0.35rem 0 0 0' }}>
                    • Hệ thống sử dụng định dạng lưu trữ JSON nén hiện đại cho 11 biểu mẫu chuyên khoa, giúp dung lượng mỗi bản ghi báo cáo chỉ chiếm khoảng <strong>2 - 5 KB</strong>.
                    <br />
                    • Với giới hạn <strong>1024 MB</strong>, cơ sở dữ liệu có khả năng lưu trữ liên tục hơn <strong>10 năm dữ liệu giao ban</strong> của toàn bộ trung tâm y tế mà không lo đầy bộ nhớ.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* MODAL: VIEW, EDIT & DELETE REPORT DETAILS */}
      {modalOpen && modalDept && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--brand-blue)',
              color: 'white',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px' }} />
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>
                    {modalDept.departmentName}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#DBEAFE' }}>
                    Báo cáo giao ban ngày {date}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {loadingReport ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Đang tải thông tin báo cáo...</p>
                </div>
              ) : (
                <div>
                  {saveSuccess && (
                    <div style={{ backgroundColor: 'var(--brand-green-subtle)', color: 'var(--brand-green)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: '600' }}>
                      ✅ {saveSuccess}
                    </div>
                  )}

                  {/* Confirmation banner for deleting report */}
                  {showDeleteConfirm && (
                    <div style={{ backgroundColor: 'var(--danger-light)', border: '1.5px solid var(--brand-red)', color: 'var(--brand-red)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>
                        <FaExclamationTriangle size={20} /> Xác nhận xóa toàn bộ báo cáo này?
                      </div>
                      <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#991B1B' }}>
                        Thao tác này sẽ xóa báo cáo ngày {date} của khoa <strong>{modalDept.departmentName}</strong> và đưa trạng thái về <strong>"Chưa nộp"</strong>. Không thể hoàn tác.
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteReport} disabled={deleting}>
                          {deleting ? <><FaSpinner className="spinner" /> Đang xóa...</> : <>✅ Có, Xóa Ngay</>}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header Form */}
                  <div className="form-section" style={{ marginBottom: '1rem' }}>
                    <h4 className="section-title">THÔNG TIN CA TRỰC</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Bác sĩ trực chính</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.doctorName} onChange={(e) => setEditHeader({...editHeader, doctorName: e.target.value})} placeholder="Tên bác sĩ trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--brand-blue)' }}>
                            {editHeader.doctorName || 'Chưa nhập'}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Phòng / Buồng</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.room} onChange={(e) => setEditHeader({...editHeader, room: e.target.value})} placeholder="Phòng trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
                            {editHeader.room || '-'}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Thời gian trực</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.shiftTime} onChange={(e) => setEditHeader({...editHeader, shiftTime: e.target.value})} placeholder="Giờ trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
                            {editHeader.shiftTime || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Report Data Section */}
                  <div className="form-section" style={{ marginBottom: '1rem' }}>
                    <h4 className="section-title">DỮ LIỆU BÁO CÁO CHUYÊN MÔN</h4>
                    {Object.keys(editReportData).length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có dữ liệu chuyên môn.</p>
                    ) : (
                      <div className="form-grid">
                        {renderEditableFields(editReportData)}
                      </div>
                    )}
                  </div>

                  {/* Transfer Cases Section */}
                  <div className="form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: 'var(--brand-red)' }}>
                        <FaAmbulance /> BỆNH CHUYỂN VIỆN ({editTransferCases.length} ca)
                      </h4>
                      {isEditing && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddTransferCase}>
                          <FaPlus /> Thêm ca chuyển
                        </button>
                      )}
                    </div>

                    {editTransferCases.length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Không có ca chuyển viện.</p>
                    ) : (
                      editTransferCases.map((tc, idx) => (
                        <div key={idx} className="sub-section" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--brand-red)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ color: 'var(--brand-red)', fontWeight: '700' }}>Ca #{idx + 1} {tc.patient_name || tc.patientName ? `— ${tc.patient_name || tc.patientName}` : ''}</h5>
                            {isEditing && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveTransferCase(idx)}>
                                <FaTrash /> Xóa
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Tên / Tuổi / ĐC</label>
                                <input type="text" value={tc.patientName || tc.patient_name || ''} onChange={(e) => handleTransferCaseChange(idx, 'patientName', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện</label>
                                <input type="text" value={tc.admissionTime || tc.admission_time || ''} onChange={(e) => handleTransferCaseChange(idx, 'admissionTime', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lý do vào viện</label>
                                <input type="text" value={tc.reason || ''} onChange={(e) => handleTransferCaseChange(idx, 'reason', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / XN</label>
                                <textarea value={tc.clinicalTests || tc.clinical_tests || ''} onChange={(e) => handleTransferCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" rows={2} />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán</label>
                                <input type="text" value={tc.diagnosis || ''} onChange={(e) => handleTransferCaseChange(idx, 'diagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Xử trí ban đầu</label>
                                <textarea value={tc.initialTreatment || tc.initial_treatment || ''} onChange={(e) => handleTransferCaseChange(idx, 'initialTreatment', e.target.value)} className="note-field" rows={2} />
                              </div>
                              <div className="form-group full-width">
                                <label>Diễn biến / Hội chẩn</label>
                                <textarea value={tc.progressNotes || tc.progress_notes || ''} onChange={(e) => handleTransferCaseChange(idx, 'progressNotes', e.target.value)} className="note-field" rows={2} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {tc.patient_name || tc.patientName || '-'}</div>
                              <div><strong>Giờ vào:</strong> {tc.admission_time || tc.admissionTime || '-'}</div>
                              <div><strong>Lý do:</strong> {tc.reason || '-'}</div>
                              <div><strong>Chẩn đoán:</strong> {tc.diagnosis || '-'}</div>
                              <div><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '-'}</div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {!isEditing ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Chỉnh Sửa Báo Cáo
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                    Hủy Chỉnh Sửa
                  </button>
                )}

                {hasReport && !showDeleteConfirm && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash /> Xóa Báo Cáo (Trở về Chưa Nộp)
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Đóng
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-primary" onClick={handleSaveReport} disabled={saving}>
                    {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Thay Đổi</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
