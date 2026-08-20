import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaTv, 
  FaPrint,
  FaFileExcel,
  FaChevronDown,
  FaSpinner, 
  FaLock,
  FaUnlockAlt,
  FaTable,
  FaUsers,
  FaDatabase,
  FaUserShield
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { generateAndDownloadHospitalExcel } from '../services/excelExportService';
import MedicalPrintView from '../components/common/MedicalPrintView';
import Footer from '../components/common/Footer';
import AdminReportDetailModal from '../components/admin/modals/AdminReportDetailModal';

// Lazy-loaded Tab components for performance and code splitting
const ReportsTab = lazy(() => import('../components/admin/tabs/ReportsTab'));
const StaffTab = lazy(() => import('../components/admin/tabs/StaffTab'));
const DatabaseTab = lazy(() => import('../components/admin/tabs/DatabaseTab'));
const AccountsTab = lazy(() => import('../components/admin/tabs/AccountsTab'));

const TabLoadingFallback = () => (
  <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
    <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
    <p style={{ marginTop: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.95rem' }}>
      Đang tải dữ liệu phân hệ quản trị...
    </p>
  </div>
);

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Active Tab State: 'reports' | 'staff' | 'database' | 'accounts'
  const [activeTab, setActiveTab] = useState('reports');

  // Report Date State
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lockingAll, setLockingAll] = useState(false);

  // Export Excel & Print Modal States
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printReports, setPrintReports] = useState([]);

  // Report Detail Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [modalReportLocked, setModalReportLocked] = useState(false);
  const [togglingModalLock, setTogglingModalLock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State inside Modal
  const [editHeader, setEditHeader] = useState({
    reportDate: '',
    doctorName: '',
    nurseName: '',
    overtimeStaff: [],
    room: '',
    shiftTime: ''
  });
  const [editReportData, setEditReportData] = useState({});
  const [editTransferCases, setEditTransferCases] = useState([]);
  const [editSurgeryCases, setEditSurgeryCases] = useState([]);
  const [editDeathCases, setEditDeathCases] = useState([]);
  const [editCriticalCases, setEditCriticalCases] = useState([]);

  // Fetch Report Status for Active Date
  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getDepartmentStatus(date);
      if (res && res.data) {
        setStatusList(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải trạng thái báo cáo:', err);
      const errMsg = err.response?.data?.error;
      setError(typeof errMsg === 'string' ? errMsg : 'Không thể kết nối đến máy chủ để tải danh sách báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchStatus();
    }
  }, [date, activeTab]);

  // Handle Toggle Lock All Reports for Current Date
  const handleToggleLockAll = async () => {
    const submittedDepts = statusList.filter(s => s.status === 'submitted');
    if (submittedDepts.length === 0) {
      alert(`Ngày ${date} chưa có khoa phòng nào nộp báo cáo.`);
      return;
    }
    const allLocked = submittedDepts.every(s => s.isLocked);
    const nextLocked = !allLocked;
    const actionText = allLocked ? 'MỞ KHÓA TOÀN VIỆN' : 'KHÓA SỔ TOÀN VIỆN';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} cho tất cả báo cáo ngày ${date}?`)) {
      return;
    }
    setLockingAll(true);
    try {
      const res = await reportService.toggleLockAllReports(date, nextLocked);
      if (res.success) {
        alert(res.message);
        await fetchStatus();
      }
    } catch (err) {
      alert('Lỗi khóa sổ toàn viện: ' + (err.response?.data?.error || err.message));
    } finally {
      setLockingAll(false);
    }
  };

  // Open Detail Modal for Department Report
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
        setModalReportLocked(Boolean(Number(report.is_locked) === 1));
        let overtime = report.overtime_staff;
        if (typeof overtime === 'string') {
          try { overtime = JSON.parse(overtime); } catch (e) { overtime = []; }
        }
        setEditHeader({
          reportDate: report.report_date ? report.report_date.split('T')[0] : date,
          doctorName: report.doctor_name || '',
          nurseName: report.nurse_name || '',
          overtimeStaff: Array.isArray(overtime) ? overtime : [],
          room: report.room || '',
          shiftTime: report.shift_time || ''
        });
        const parsedData = typeof report.report_data === 'string' ? JSON.parse(report.report_data) : (report.report_data || {});
        setEditReportData(parsedData);
        setEditTransferCases(report.transferCases || []);
        setEditSurgeryCases(report.surgeryCases || []);
        setEditDeathCases(report.deathCases || []);
        setEditCriticalCases(report.criticalCases || []);
      } else {
        setHasReport(false);
        setModalReportLocked(false);
        setEditHeader({ reportDate: date, doctorName: '', nurseName: '', overtimeStaff: [], room: '', shiftTime: '' });
        setEditReportData({});
        setEditTransferCases([]);
        setEditSurgeryCases([]);
        setEditDeathCases([]);
        setEditCriticalCases([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết báo cáo:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Toggle Lock inside Modal
  const handleToggleModalLock = async () => {
    if (!hasReport) {
      alert('Khoa phòng này chưa có báo cáo để khóa/mở khóa.');
      return;
    }
    setTogglingModalLock(true);
    try {
      const targetDate = editHeader.reportDate || date;
      const nextLocked = !modalReportLocked;
      const res = await reportService.toggleReportLock(modalDept.departmentCode, targetDate, nextLocked);
      if (res.success) {
        setModalReportLocked(Boolean(res.isLocked));
        setSaveSuccess(res.message);
        await fetchStatus();
      }
    } catch (err) {
      alert('Lỗi thay đổi trạng thái khóa sổ: ' + (err.response?.data?.error || err.message));
    } finally {
      setTogglingModalLock(false);
    }
  };

  // Save Report Changes (Admin edit on behalf of department)
  const handleSaveReport = async () => {
    setSaving(true);
    setSaveSuccess('');
    try {
      const targetDate = editHeader.reportDate || date;
      const payload = {
        departmentCode: modalDept.departmentCode,
        reportDate: targetDate,
        doctorName: editHeader.doctorName,
        nurseName: editHeader.nurseName,
        overtimeStaff: editHeader.overtimeStaff || [],
        room: editHeader.room,
        shiftTime: editHeader.shiftTime,
        reportData: editReportData,
        status: 'submitted',
        transferCases: editTransferCases,
        surgeryCases: editSurgeryCases,
        deathCases: editDeathCases,
        criticalCases: editCriticalCases
      };

      const res = await reportService.saveReport(payload);
      if (res.success) {
        setSaveSuccess('Đã lưu thông tin báo cáo thành công!');
        setIsEditing(false);
        setHasReport(true);
        fetchStatus();
      }
    } catch (err) {
      alert('Lỗi khi lưu báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Delete Report
  const handleDeleteReport = async () => {
    setDeleting(true);
    try {
      const targetDate = editHeader.reportDate || date;
      const res = await reportService.deleteReport(modalDept.departmentCode, targetDate);
      if (res.success) {
        alert('Đã xóa báo cáo thành công.');
        setModalOpen(false);
        setShowDeleteConfirm(false);
        fetchStatus();
      }
    } catch (err) {
      alert('Lỗi khi xóa báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  // Form Field Change Handlers
  const handleDataChange = (key, value) => {
    setEditReportData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddTransferCase = () => {
    setEditTransferCases(prev => [
      ...prev,
      { patientName: '', age: '', address: '', admissionTime: '', reason: '', clinicalSymptoms: '', clinicalTests: '', diagnosis: '', initialTreatment: '', progressNotes: '', images: [] }
    ]);
  };

  const handleTransferCaseChange = (idx, field, val) => {
    setEditTransferCases(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleRemoveTransferCase = (idx) => {
    setEditTransferCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddSurgeryCase = () => {
    setEditSurgeryCases(prev => [
      ...prev,
      { patientName: '', birthYear: '', address: '', admissionTime: '', clinicalSymptoms: '', clinicalTests: '', preoperativeDiagnosis: '', consultationOrder: '', postoperativeDiagnosis: '', currentStatus: '', images: [] }
    ]);
  };

  const handleSurgeryCaseChange = (idx, field, val) => {
    setEditSurgeryCases(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleRemoveSurgeryCase = (idx) => {
    setEditSurgeryCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddDeathCase = () => {
    setEditDeathCases(prev => [
      ...prev,
      { patientName: '', age: '', address: '', admissionTime: '', admissionStatus: '', medicalHistory: '', clinicalSymptoms: '', clinicalTests: '', diagnosis: '', emergencyTreatment: '', finalOutcome: '', images: [] }
    ]);
  };

  const handleDeathCaseChange = (idx, field, val) => {
    setEditDeathCases(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleRemoveDeathCase = (idx) => {
    setEditDeathCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCriticalCase = () => {
    setEditCriticalCases(prev => [
      ...prev,
      { patientName: '', age: '', address: '', admissionTime: '', medicalHistory: '', clinicalSymptoms: '', clinicalTests: '', diagnosis: '', conditionSummary: '', treatment: '', notes: 'Bàn giao tua sau theo dõi tiếp', images: [] }
    ]);
  };

  const handleCriticalCaseChange = (idx, field, val) => {
    setEditCriticalCases(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleRemoveCriticalCase = (idx) => {
    setEditCriticalCases(prev => prev.filter((_, i) => i !== idx));
  };

  // Export Excel
  const handleExportExcel = async (exportType) => {
    setExportingExcel(true);
    setShowExportMenu(false);
    try {
      await generateAndDownloadHospitalExcel(date, exportType);
    } catch (err) {
      alert('Lỗi xuất file Excel: ' + (err.message || 'Lỗi server'));
    } finally {
      setExportingExcel(false);
    }
  };

  // Medical Print View
  const handlePrintReport = async () => {
    try {
      const res = await reportService.getAllReportsByDate(date);
      if (res && res.data) {
        setPrintReports(res.data);
        setShowPrintModal(true);
      }
    } catch (err) {
      alert('Không thể tải dữ liệu để in báo cáo.');
    }
  };

  // Presentation Navigation
  const handlePresentation = () => {
    navigate(`/presentation/${date}`);
  };

  const submittedCount = statusList.filter(s => s.status === 'submitted').length;
  const allLocked = submittedCount > 0 && statusList.filter(s => s.status === 'submitted').every(s => s.isLocked);

  return (
    <div className="admin-dashboard-container" style={{ paddingBottom: '3rem' }}>
      {/* Top Header Bar */}
      <header className="admin-header" style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img src="/logo.png" alt="Hospital Logo" style={{ width: '44px', height: '44px' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--brand-blue)', margin: 0, lineHeight: 1.2 }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Hệ Thống Quản Trị Báo Cáo Giao Ban Trực Toàn Viện
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeTab === 'reports' && (
            <>
              {/* Date Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <FaCalendarAlt style={{ color: 'var(--brand-blue)', fontSize: '0.9rem' }} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}
                />
              </div>

              {/* Toggle Lock All Reports */}
              <button
                className="btn btn-sm"
                onClick={handleToggleLockAll}
                disabled={lockingAll || submittedCount === 0}
                style={{
                  backgroundColor: allLocked ? '#059669' : '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem'
                }}
                title={allLocked ? 'Mở khóa cho tất cả khoa phòng sửa số liệu' : 'Khóa sổ toàn viện sau 08:30 sáng'}
              >
                {lockingAll ? <FaSpinner className="spinner" /> : allLocked ? <><FaUnlockAlt /> Mở Khóa Toàn Viện</> : <><FaLock /> Khóa Sổ Toàn Viện</>}
              </button>

              {/* Export Excel Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exportingExcel}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', padding: '0.5rem 0.85rem' }}
                >
                  {exportingExcel ? <FaSpinner className="spinner" /> : <FaFileExcel style={{ color: '#10B981' }} />}
                  Xuất Excel <FaChevronDown size={10} />
                </button>
                {showExportMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.35rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    zIndex: 1000,
                    minWidth: '220px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => handleExportExcel('full')}
                      style={{ width: '100%', padding: '0.65rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      📊 Báo Cáo Giao Ban Chuẩn
                    </button>
                    <button
                      onClick={() => handleExportExcel('cases')}
                      style={{ width: '100%', padding: '0.65rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #F1F5F9' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      🏥 Danh Sách Ca Bệnh Chi Tiết
                    </button>
                  </div>
                )}
              </div>

              {/* Print View */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrintReport}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', padding: '0.5rem 0.85rem' }}
              >
                <FaPrint /> In Báo Cáo
              </button>

              {/* Presentation Mode */}
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePresentation}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', padding: '0.5rem 1rem' }}
              >
                <FaTv /> Trình Chiếu Giao Ban
              </button>
            </>
          )}

          {/* Logout Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-red)', borderColor: '#FECACA' }}
            title="Đăng xuất khỏi hệ thống"
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-content" style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 2rem' }}>
        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#FFFFFF',
          padding: '0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'reports' ? 'var(--brand-blue)' : 'transparent',
              color: activeTab === 'reports' ? '#FFFFFF' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            <FaTable /> Báo Cáo Giao Ban
            {statusList.length > 0 && (
              <span style={{
                backgroundColor: activeTab === 'reports' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === 'reports' ? '#FFFFFF' : '#475569',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '800'
              }}>
                {submittedCount}/{statusList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'staff' ? 'var(--brand-blue)' : 'transparent',
              color: activeTab === 'staff' ? '#FFFFFF' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            <FaUsers /> Quản Lý Nhân Sự
          </button>

          <button
            onClick={() => setActiveTab('database')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'database' ? 'var(--brand-blue)' : 'transparent',
              color: activeTab === 'database' ? '#FFFFFF' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            <FaDatabase /> Quản Trị CSDL & Logs
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'accounts' ? 'var(--brand-blue)' : 'transparent',
              color: activeTab === 'accounts' ? '#FFFFFF' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            <FaUserShield /> Quản Lý Tài Khoản
          </button>
        </div>

        {/* Tab Content Display Area with Suspense */}
        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === 'reports' && (
            <ReportsTab
              statusList={statusList}
              loading={loading}
              error={error}
              onClearError={() => setError('')}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {activeTab === 'staff' && <StaffTab />}

          {activeTab === 'database' && <DatabaseTab date={date} />}

          {activeTab === 'accounts' && <AccountsTab />}
        </Suspense>
      </main>

      {/* Admin Report Detail Modal (View, Edit on behalf of department, Lock, Delete) */}
      <AdminReportDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalDept={modalDept}
        date={date}
        editHeader={editHeader}
        setEditHeader={setEditHeader}
        editReportData={editReportData}
        setEditReportData={setEditReportData}
        editTransferCases={editTransferCases}
        setEditTransferCases={setEditTransferCases}
        editSurgeryCases={editSurgeryCases}
        setEditSurgeryCases={setEditSurgeryCases}
        editDeathCases={editDeathCases}
        setEditDeathCases={setEditDeathCases}
        editCriticalCases={editCriticalCases}
        setEditCriticalCases={setEditCriticalCases}
        hasReport={hasReport}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        loadingReport={loadingReport}
        saving={saving}
        saveSuccess={saveSuccess}
        modalReportLocked={modalReportLocked}
        togglingModalLock={togglingModalLock}
        handleToggleModalLock={handleToggleModalLock}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        deleting={deleting}
        handleDeleteReport={handleDeleteReport}
        handleSaveReport={handleSaveReport}
        handleDataChange={handleDataChange}
        handleAddTransferCase={handleAddTransferCase}
        handleTransferCaseChange={handleTransferCaseChange}
        handleRemoveTransferCase={handleRemoveTransferCase}
        handleAddSurgeryCase={handleAddSurgeryCase}
        handleSurgeryCaseChange={handleSurgeryCaseChange}
        handleRemoveSurgeryCase={handleRemoveSurgeryCase}
        handleAddDeathCase={handleAddDeathCase}
        handleDeathCaseChange={handleDeathCaseChange}
        handleRemoveDeathCase={handleRemoveDeathCase}
        handleAddCriticalCase={handleAddCriticalCase}
        handleCriticalCaseChange={handleCriticalCaseChange}
        handleRemoveCriticalCase={handleRemoveCriticalCase}
      />

      {/* Medical Print View Modal */}
      {showPrintModal && (
        <MedicalPrintView
          date={date}
          reports={printReports}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* System Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
