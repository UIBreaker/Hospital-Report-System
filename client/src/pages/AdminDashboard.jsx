import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaTv, 
  FaPrint,
  FaFilePdf,
  FaFileExcel,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaSpinner, 
  FaLock,
  FaUnlockAlt,
  FaTable,
  FaClipboardList,
  FaWpforms,
  FaUsers,
  FaDatabase,
  FaUserShield,
  FaUserMd,
  FaChartLine,
  FaHistory,
  FaRocket,
  FaFolderOpen
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { generateAndDownloadHospitalExcel } from '../services/excelExportService';
import MedicalPrintView from '../components/common/MedicalPrintView';
import Footer from '../components/common/Footer';
import AdminReportDetailModal from '../components/admin/modals/AdminReportDetailModal';
import SecurityLockModal from '../components/admin/modals/SecurityLockModal';
import VersionManageModal from '../components/admin/modals/VersionManageModal';
import MoveReportModal from '../components/admin/modals/MoveReportModal';
import MedicalLoader from '../components/common/MedicalLoader';
import { normalizeImages } from '../utils/medicalFormatters';

// Lazy-loaded Tab components for performance and code splitting
const ReportsTab = lazy(() => import('../components/admin/tabs/ReportsTab'));
const SubmissionHistoryTab = lazy(() => import('../components/admin/tabs/SubmissionHistoryTab'));
const DataArchiveTab = lazy(() => import('../components/admin/tabs/DataArchiveTab'));
const AnalyticsTab = lazy(() => import('../components/admin/tabs/AnalyticsTab'));
const StaffTab = lazy(() => import('../components/admin/tabs/StaffTab'));
const DatabaseTab = lazy(() => import('../components/admin/tabs/DatabaseTab'));
const AccountsTab = lazy(() => import('../components/admin/tabs/AccountsTab'));
const CustomFormsTab = lazy(() => import('../components/admin/tabs/CustomFormsTab'));

const DEPARTMENT_NAMES = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét Nghiệm',
  cdha: 'Khoa Chẩn Đoán Hình Ảnh',
  hscc_tnt: 'Khoa Hồi Sức Cấp Cứu - Thận Nhân Tạo',
  noi: 'Khoa Nội Tổng Hợp',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Phụ Sản',
  yhct_phcn: 'Khoa Y Học Cổ Truyền - PHCN',
  ngoai_th: 'Khoa Ngoại Tổng Hợp',
  ctch: 'Khoa Chấn Thương Chỉnh Hình',
  gmhs: 'Khoa Gây Mê Hồi Sức'
};

const TabLoadingFallback = () => (
  <MedicalLoader
    text="Đang tải dữ liệu phân hệ quản trị..."
    subtext="Vui lòng chờ trong giây lát"
    minHeight="380px"
  />
);

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Active Tab State: 'reports' | 'staff' | 'database' | 'accounts'
  const [activeTab, setActiveTab] = useState('reports');

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Collapsible Sidebar State (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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
  const [securityModal, setSecurityModal] = useState({
    isOpen: false,
    mode: 'confirm',
    targetType: 'all',
    targetName: 'Toàn Viện',
    targetDeptCode: '',
    willLock: true,
    loading: false
  });

  // Export Excel & Print Modal States
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printReports, setPrintReports] = useState([]);

  // Report Detail Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [modalReportDate, setModalReportDate] = useState(date);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [modalReportLocked, setModalReportLocked] = useState(false);
  const [togglingModalLock, setTogglingModalLock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showVersionManageModal, setShowVersionManageModal] = useState(false);

  // Move Report Modal State
  const [dashboardMoveModal, setDashboardMoveModal] = useState({
    isOpen: false,
    departmentCode: '',
    departmentName: '',
    currentDate: '',
    doctorName: '',
    nurseName: ''
  });

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
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      const errMsg = typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Không thể kết nối đến máy chủ để tải danh sách báo cáo.');
      setError(errMsg);
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
  const handleToggleLockAll = () => {
    const submittedDepts = statusList.filter(s => s.status === 'submitted');
    if (submittedDepts.length === 0) {
      alert(`Ngày ${date} chưa có khoa phòng nào nộp báo cáo.`);
      return;
    }
    const allLocked = submittedDepts.every(s => s.isLocked);
    const nextLocked = !allLocked;
    setSecurityModal({
      isOpen: true,
      mode: 'confirm',
      targetType: 'all',
      targetName: 'Toàn Viện',
      targetDeptCode: '',
      willLock: nextLocked,
      loading: false
    });
  };

  // Normalization Helpers for 4 Clinical Case Categories
  const normalizeTransferCase = (c) => ({
    _id: c._id || c.id || `tc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    id: c.id,
    patientName: c.patientName || c.patient_name || '',
    patient_name: c.patientName || c.patient_name || '',
    age: c.age || '',
    address: c.address || '',
    admissionTime: c.admissionTime || c.admission_time || '',
    admission_time: c.admissionTime || c.admission_time || '',
    reason: c.reason || '',
    clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
    clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
    clinicalTests: c.clinicalTests || c.clinical_tests || '',
    clinical_tests: c.clinicalTests || c.clinical_tests || '',
    diagnosis: c.diagnosis || '',
    initialTreatment: c.initialTreatment || c.initial_treatment || '',
    initial_treatment: c.initialTreatment || c.initial_treatment || '',
    progressNotes: c.progressNotes || c.progress_notes || '',
    progress_notes: c.progressNotes || c.progress_notes || '',
    images: normalizeImages(c.images || c.image_url || c.imageUrl || c.image)
  });

  const normalizeSurgeryCase = (sc) => ({
    _id: sc._id || sc.id || `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    id: sc.id,
    patientName: sc.patientName || sc.patient_name || '',
    patient_name: sc.patientName || sc.patient_name || '',
    birthYear: sc.birthYear || sc.birth_year || sc.age || '',
    birth_year: sc.birthYear || sc.birth_year || sc.age || '',
    address: sc.address || '',
    admissionTime: sc.admissionTime || sc.admission_time || '',
    admission_time: sc.admissionTime || sc.admission_time || '',
    reason: sc.reason || '',
    clinicalSymptoms: sc.clinicalSymptoms || sc.clinical_symptoms || '',
    clinical_symptoms: sc.clinicalSymptoms || sc.clinical_symptoms || '',
    clinicalTests: sc.clinicalTests || sc.clinical_tests || '',
    clinical_tests: sc.clinicalTests || sc.clinical_tests || '',
    preoperativeDiagnosis: sc.preoperativeDiagnosis || sc.preoperative_diagnosis || '',
    preoperative_diagnosis: sc.preoperativeDiagnosis || sc.preoperative_diagnosis || '',
    consultationOrder: sc.consultationOrder || sc.consultation_order || '',
    consultation_order: sc.consultationOrder || sc.consultation_order || '',
    postoperativeDiagnosis: sc.postoperativeDiagnosis || sc.postoperative_diagnosis || '',
    postoperative_diagnosis: sc.postoperativeDiagnosis || sc.postoperative_diagnosis || '',
    currentStatus: sc.currentStatus || sc.current_status || '',
    current_status: sc.currentStatus || sc.current_status || '',
    images: normalizeImages(sc.images || sc.image_url || sc.imageUrl || sc.image)
  });

  const normalizeDeathCase = (dc) => ({
    _id: dc._id || dc.id || `dc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    id: dc.id,
    patientName: dc.patientName || dc.patient_name || '',
    patient_name: dc.patientName || dc.patient_name || '',
    age: dc.age || '',
    address: dc.address || '',
    admissionTime: dc.admissionTime || dc.admission_time || '',
    admission_time: dc.admissionTime || dc.admission_time || '',
    reason: dc.reason || '',
    admissionStatus: dc.admissionStatus || dc.admission_status || '',
    admission_status: dc.admissionStatus || dc.admission_status || '',
    clinicalSymptoms: dc.clinicalSymptoms || dc.clinical_symptoms || '',
    clinical_symptoms: dc.clinicalSymptoms || dc.clinical_symptoms || '',
    medicalHistory: dc.medicalHistory || dc.medical_history || '',
    medical_history: dc.medicalHistory || dc.medical_history || '',
    clinicalTests: dc.clinicalTests || dc.clinical_tests || '',
    clinical_tests: dc.clinicalTests || dc.clinical_tests || '',
    diagnosis: dc.diagnosis || '',
    emergencyTreatment: dc.emergencyTreatment || dc.emergency_treatment || '',
    emergency_treatment: dc.emergencyTreatment || dc.emergency_treatment || '',
    finalOutcome: dc.finalOutcome || dc.final_outcome || '',
    final_outcome: dc.finalOutcome || dc.final_outcome || '',
    images: normalizeImages(dc.images || dc.image_url || dc.imageUrl || dc.image)
  });

  const normalizeCriticalCase = (cc) => ({
    _id: cc._id || cc.id || `cc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    id: cc.id,
    patientName: cc.patientName || cc.patient_name || '',
    patient_name: cc.patientName || cc.patient_name || '',
    age: cc.age || '',
    address: cc.address || '',
    admissionTime: cc.admissionTime || cc.admission_time || '',
    admission_time: cc.admissionTime || cc.admission_time || '',
    medicalHistory: cc.medicalHistory || cc.medical_history || '',
    medical_history: cc.medicalHistory || cc.medical_history || '',
    clinicalSymptoms: cc.clinicalSymptoms || cc.clinical_symptoms || '',
    clinical_symptoms: cc.clinicalSymptoms || cc.clinical_symptoms || '',
    clinicalTests: cc.clinicalTests || cc.clinical_tests || '',
    clinical_tests: cc.clinicalTests || cc.clinical_tests || '',
    diagnosis: cc.diagnosis || '',
    conditionSummary: cc.conditionSummary || cc.condition_summary || '',
    condition_summary: cc.conditionSummary || cc.condition_summary || '',
    treatment: cc.treatment || '',
    notes: cc.notes || '',
    images: normalizeImages(cc.images || cc.image_url || cc.imageUrl || cc.image)
  });

  // Open Detail Modal for Department Report
  const handleOpenDetailModal = async (dept, specificDate) => {
    const deptCode = typeof dept === 'string' ? dept : dept?.departmentCode;
    const deptName = typeof dept === 'string' ? (DEPARTMENT_NAMES[dept] || dept) : (dept?.departmentName || DEPARTMENT_NAMES[deptCode] || deptCode);
    const resolvedDept = { departmentCode: deptCode, departmentName: deptName };
    const targetDate = specificDate || date;

    setModalDept(resolvedDept);
    setModalReportDate(targetDate);
    setModalOpen(true);
    setLoadingReport(true);
    setIsEditing(false);
    setSaveSuccess('');
    setShowDeleteConfirm(false);

    try {
      const res = await reportService.getReport(deptCode, targetDate);
      if (res && res.data) {
        const r = res.data;
        setHasReport(true);
        setModalReportLocked(Number(r.is_locked) === 1);

        let overtime = [];
        if (r.overtime_staff) {
          try {
            overtime = typeof r.overtime_staff === 'string' ? JSON.parse(r.overtime_staff) : r.overtime_staff;
          } catch (e) {
            overtime = [];
          }
        }

        let rawData = {};
        if (r.report_data) {
          try {
            rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data) : r.report_data;
          } catch (e) {
            rawData = {};
          }
        }

        setEditHeader({
          reportDate: r.report_date || targetDate,
          doctorName: r.doctor_name || '',
          nurseName: r.nurse_name || '',
          overtimeStaff: Array.isArray(overtime) ? overtime : [],
          room: r.room || '',
          shiftTime: r.shift_time || '24/24'
        });

        setEditReportData(rawData || {});

        const safeCaseArray = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        const rawTransfers = safeCaseArray(r.transferCases || r.transfer_cases || rawData.transferCases || rawData.transfer_cases);
        const rawSurgeries = safeCaseArray(r.surgeryCases || r.surgery_cases || rawData.surgeryCases || rawData.surgery_cases);
        const rawDeaths = safeCaseArray(r.deathCases || r.death_cases || rawData.deathCases || rawData.death_cases);
        const rawCriticals = safeCaseArray(r.criticalCases || r.critical_cases || rawData.criticalCases || rawData.critical_cases);

        setEditTransferCases(rawTransfers.map(normalizeTransferCase));
        setEditSurgeryCases(rawSurgeries.map(normalizeSurgeryCase));
        setEditDeathCases(rawDeaths.map(normalizeDeathCase));
        setEditCriticalCases(rawCriticals.map(normalizeCriticalCase));
      } else {
        setHasReport(false);
        setModalReportLocked(false);
        setEditHeader({
          reportDate: targetDate,
          doctorName: '',
          nurseName: '',
          overtimeStaff: [],
          room: '',
          shiftTime: '24/24'
        });
        setEditReportData({});
        setEditTransferCases([]);
        setEditSurgeryCases([]);
        setEditDeathCases([]);
        setEditCriticalCases([]);
      }
    } catch (err) {
      console.error('Error loading report detail modal:', err);
      setHasReport(false);
    } finally {
      setLoadingReport(false);
    }
  };

  // Toggle Lock inside Modal
  const handleToggleModalLock = () => {
    if (!modalDept) return;
    const nextLocked = !modalReportLocked;
    setSecurityModal({
      isOpen: true,
      mode: 'confirm',
      targetType: 'single',
      targetName: modalDept.departmentName || modalDept.departmentCode,
      targetDeptCode: modalDept.departmentCode,
      willLock: nextLocked,
      loading: false
    });
  };

  const handleConfirmSecurityAction = async () => {
    setSecurityModal(prev => ({ ...prev, loading: true }));
    try {
      if (securityModal.targetType === 'all') {
        const res = await reportService.toggleLockAllReports(date, securityModal.willLock);
        if (res && res.success) {
          await fetchStatus();
          setSecurityModal(prev => ({
            ...prev,
            mode: 'animating',
            loading: false
          }));
        }
      } else {
        const res = await reportService.toggleReportLock(
          securityModal.targetDeptCode,
          date,
          securityModal.willLock
        );
        if (res && res.success) {
          setModalReportLocked(securityModal.willLock);
          await fetchStatus();
          setSecurityModal(prev => ({
            ...prev,
            mode: 'animating',
            loading: false
          }));
        }
      }
    } catch (err) {
      alert('Không thể thực hiện tác vụ bảo mật: ' + (err.response?.data?.error || err.message));
      setSecurityModal(prev => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  const handleCloseSecurityModal = () => {
    setSecurityModal({
      isOpen: false,
      mode: 'confirm',
      targetType: 'all',
      targetName: 'Toàn Viện',
      targetDeptCode: '',
      willLock: true,
      loading: false
    });
  };

  // Form Field Change Handlers
  const handleDataChange = (field, value) => {
    setEditReportData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTransferCase = () => {
    setEditTransferCases((prev) => [
      ...prev,
      normalizeTransferCase({
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        reason: '',
        clinicalSymptoms: '',
        clinicalTests: '',
        diagnosis: '',
        initialTreatment: '',
        progressNotes: '',
        images: []
      })
    ]);
  };

  const handleTransferCaseChange = (index, field, value) => {
    setEditTransferCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveTransferCase = (index) => {
    setEditTransferCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSurgeryCase = () => {
    setEditSurgeryCases((prev) => [
      ...prev,
      normalizeSurgeryCase({
        patientName: '',
        birthYear: '',
        address: '',
        admissionTime: '',
        reason: '',
        clinicalSymptoms: '',
        clinicalTests: '',
        preoperativeDiagnosis: '',
        consultationOrder: '',
        postoperativeDiagnosis: '',
        currentStatus: '',
        images: []
      })
    ]);
  };

  const handleSurgeryCaseChange = (index, field, value) => {
    setEditSurgeryCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveSurgeryCase = (index) => {
    setEditSurgeryCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDeathCase = () => {
    setEditDeathCases((prev) => [
      ...prev,
      normalizeDeathCase({
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        reason: '',
        admissionStatus: '',
        clinicalSymptoms: '',
        medicalHistory: '',
        clinicalTests: '',
        diagnosis: '',
        emergencyTreatment: '',
        finalOutcome: '',
        images: []
      })
    ]);
  };

  const handleDeathCaseChange = (index, field, value) => {
    setEditDeathCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveDeathCase = (index) => {
    setEditDeathCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCriticalCase = () => {
    setEditCriticalCases((prev) => [
      ...prev,
      normalizeCriticalCase({
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        medicalHistory: '',
        clinicalSymptoms: '',
        clinicalTests: '',
        diagnosis: '',
        conditionSummary: '',
        treatment: '',
        notes: '',
        images: []
      })
    ]);
  };

  const handleCriticalCaseChange = (index, field, value) => {
    setEditCriticalCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveCriticalCase = (index) => {
    setEditCriticalCases((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Report on Behalf of Department
  const handleSaveReport = async () => {
    if (!modalDept) return;
    setSaving(true);
    setSaveSuccess('');

    try {
      const payload = {
        departmentCode: modalDept.departmentCode,
        reportDate: date,
        doctorName: editHeader.doctorName,
        nurseName: editHeader.nurseName,
        overtimeStaff: editHeader.overtimeStaff || [],
        room: editHeader.room,
        shiftTime: editHeader.shiftTime || '24/24',
        reportData: editReportData,
        status: 'submitted',
        transferCases: editTransferCases,
        surgeryCases: editSurgeryCases,
        deathCases: editDeathCases,
        criticalCases: editCriticalCases
      };

      const res = await reportService.saveReport(payload);
      if (res && res.success) {
        setSaveSuccess('Lưu báo cáo thành công!');
        setIsEditing(false);
        setHasReport(true);
        await fetchStatus();
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      alert('Lưu báo cáo thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Delete Report
  const handleDeleteReport = async () => {
    if (!modalDept) return;
    setDeleting(true);
    try {
      const res = await reportService.deleteReport(modalDept.departmentCode, date);
      if (res && res.success) {
        setShowDeleteConfirm(false);
        setModalOpen(false);
        await fetchStatus();
      }
    } catch (err) {
      alert('Xóa báo cáo thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  // Export Excel Full
  const handleExportExcel = async (type = 'full') => {
    setShowExportMenu(false);
    setExportingExcel(true);
    try {
      const res = await reportService.getPresentationData(date);
      const reports = (res && res.data) ? res.data : [];
      await generateAndDownloadHospitalExcel(date, reports, statusList);
    } catch (err) {
      console.warn('Client Excel generation failed, falling back to server export:', err);
      try {
        const response = await reportService.exportHospitalReportExcel(date);
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `Bao_Cao_Giao_Ban_Tong_Hop_${date}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (fallbackErr) {
        alert('Không thể xuất file Excel: ' + (fallbackErr.response?.data?.error || fallbackErr.message || err.message || 'Lỗi hệ thống'));
      }
    } finally {
      setExportingExcel(false);
    }
  };

  // Medical Print View & PDF Modal
  const handlePrintReport = async () => {
    try {
      const res = await reportService.getPresentationData(date);
      if (res && res.data) {
        setPrintReports(res.data);
        setShowPrintModal(true);
      } else {
        alert('Không có dữ liệu báo cáo cho ngày này để in / xuất PDF.');
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu in báo cáo:', err);
      alert('Không thể tải dữ liệu để in báo cáo: ' + (err.response?.data?.error || err.message));
    }
  };

  // Presentation Navigation
  const handlePresentation = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement?.requestFullscreen?.().catch(() => {});
      }
    } catch (e) {}
    navigate(`/presentation/${date}`);
  };

  const submittedCount = statusList.filter(s => s.status === 'submitted').length;
  const allLocked = submittedCount > 0 && statusList.filter(s => s.status === 'submitted').every(s => s.isLocked);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      {/* Mobile Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div className="admin-backdrop-overlay" onClick={() => setMobileDrawerOpen(false)} />
      )}
      
      {/* ================= 1. LEFT SIDEBAR (Collapsible Dark Navy Gradient) ================= */}
      <aside className={`admin-sidebar-drawer ${mobileDrawerOpen ? 'open' : ''}`} style={{
        width: isSidebarCollapsed ? '72px' : '240px',
        minWidth: isSidebarCollapsed ? '72px' : '240px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'linear-gradient(180deg, #0A192F 0%, #0F2C59 55%, #0A2540 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isSidebarCollapsed ? '1.25rem 0.5rem' : '1.25rem 0.85rem',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        boxSizing: 'border-box',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* Top: Hospital Logo & Collapse Toggle */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <div style={{
              width: isSidebarCollapsed ? '42px' : '58px',
              height: isSidebarCollapsed ? '42px' : '58px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              padding: isSidebarCollapsed ? '5px' : '8px',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: isSidebarCollapsed ? '0 auto' : '0',
              transition: 'all 0.25s ease',
              flexShrink: 0
            }}>
              <img 
                src="/logo.png" 
                alt="Logo TTYT Bình Long" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>

            {/* In-sidebar Collapse button */}
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                title="Thu gọn menu điều hướng (Mở rộng dashboard)"
              >
                <FaChevronLeft />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={toggleSidebar}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                title="Mở rộng menu điều hướng"
              >
                <FaChevronRight />
              </button>
            </div>
          )}

          {/* Navigation Menu List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {/* Item 1: Báo Cáo Giao Ban */}
            <button
              type="button"
              onClick={() => { setActiveTab('reports'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'reports' ? '#2563EB' : 'transparent',
                color: activeTab === 'reports' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'reports' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Báo Cáo Giao Ban' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'reports') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'reports') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaClipboardList style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
                {!isSidebarCollapsed && <span>Báo Cáo Giao Ban</span>}
              </div>
              {!isSidebarCollapsed && (
                <span style={{
                  backgroundColor: activeTab === 'reports' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: '800'
                }}>
                  {statusList.filter(s => s.status === 'submitted').length}/12
                </span>
              )}
            </button>

            {/* Item 2: Lịch Sử Nộp Báo Cáo */}
            <button
              type="button"
              onClick={() => { setActiveTab('history'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'history' ? '#2563EB' : 'transparent',
                color: activeTab === 'history' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'history' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'history' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Lịch Sử Nộp Báo Cáo' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'history') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'history') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaHistory style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Lịch Sử Nộp Báo Cáo</span>}
            </button>

            {/* Item: Tổng Hợp Dữ Liệu & Kho Lưu Trữ */}
            <button
              type="button"
              onClick={() => { setActiveTab('data_archive'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'data_archive' ? '#2563EB' : 'transparent',
                color: activeTab === 'data_archive' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'data_archive' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'data_archive' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Tổng Hợp Dữ Liệu' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'data_archive') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'data_archive') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaFolderOpen style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Tổng Hợp Dữ Liệu</span>}
            </button>

            {/* Item 3: Số Liệu Thống Kê & Biểu Đồ */}
            <button
              type="button"
              onClick={() => { setActiveTab('analytics'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'analytics' ? '#2563EB' : 'transparent',
                color: activeTab === 'analytics' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'analytics' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'analytics' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Số Liệu Thống Kê & Biểu Đồ' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'analytics') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'analytics') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaChartLine style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Số Liệu Thống Kê</span>}
            </button>

            {/* Item 3: Biểu Mẫu Tùy Chỉnh & Tracker */}
            <button
              type="button"
              onClick={() => { setActiveTab('custom_forms'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'custom_forms' ? '#2563EB' : 'transparent',
                color: activeTab === 'custom_forms' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'custom_forms' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'custom_forms' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Biểu Mẫu Tùy Chỉnh & Tracker' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'custom_forms') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'custom_forms') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaWpforms style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Biểu Mẫu Tùy Chỉnh</span>}
            </button>

            {/* Item 4: Quản Lý Nhân Sự */}
            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'staff' ? '#2563EB' : 'transparent',
                color: activeTab === 'staff' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'staff' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'staff' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Quản Lý Nhân Sự' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'staff') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'staff') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaUsers style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Quản Lý Nhân Sự</span>}
            </button>

            {/* Item 5: Quản Trị CSDL & Logs */}
            <button
              type="button"
              onClick={() => { setActiveTab('database'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'database' ? '#2563EB' : 'transparent',
                color: activeTab === 'database' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'database' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'database' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Quản Trị CSDL & Logs' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'database') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'database') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaDatabase style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Quản Trị CSDL & Logs</span>}
            </button>

            {/* Item 6: Quản Lý Tài Khoản */}
            <button
              type="button"
              onClick={() => { setActiveTab('accounts'); setMobileDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'accounts' ? '#2563EB' : 'transparent',
                color: activeTab === 'accounts' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                fontWeight: activeTab === 'accounts' ? '800' : '600',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'accounts' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
              title={isSidebarCollapsed ? 'Quản Lý Tài Khoản' : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== 'accounts') {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'accounts') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <FaUserShield style={{ fontSize: isSidebarCollapsed ? '1.15rem' : '0.95rem' }} />
              {!isSidebarCollapsed && <span>Quản Lý Tài Khoản</span>}
            </button>
          </nav>
        </div>

        {/* Bottom: User Profile Widget */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            padding: isSidebarCollapsed ? '0.6rem 0.2rem' : '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            gap: '0.65rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          title="Nhấp để xem và quản lý Hồ Sơ Cá Nhân"
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            color: '#0F2C59',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {user?.avatar_url ? (
              user.avatar_url.startsWith('preset_') ? (
                <span style={{ fontSize: '1.25rem' }}>
                  {{
                    preset_doc_m: '👨‍⚕️',
                    preset_doc_f: '👩‍⚕️',
                    preset_nurse_m: '🧑‍⚕️',
                    preset_nurse_f: '👩‍⚕️',
                    preset_surgeon: '😷',
                    preset_admin: '🏛️',
                    preset_tech: '🔬',
                    preset_hospital: '🏥'
                  }[user.avatar_url] || '👨‍⚕️'}
                </span>
              ) : (
                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )
            ) : (
              <FaUserMd />
            )}
          </div>
          {!isSidebarCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: '#93C5FD' }}>Hồ sơ Admin ⚙️</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || user?.username || 'Admin'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Quản trị hệ thống</div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT WRAPPER ================= */}
      <div className="admin-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden', marginLeft: isSidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {/* Top Header Bar */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="show-flex-mobile"
              style={{
                backgroundColor: '#0F2C59',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                marginRight: '0.75rem',
                flexShrink: 0
              }}
              title="Mở menu điều hướng"
            >
              <FaBars />
            </button>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59', margin: 0, lineHeight: 1.2, letterSpacing: '0.3px' }}>
                TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
              </h1>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                Hệ Thống Quản Trị Báo Cáo Giao Ban Trực Toàn Viện
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {activeTab === 'reports' && (
              <>
                {/* Date Picker Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#F8FAFC',
                  padding: '0.42rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1'
                }}>
                  <FaCalendarAlt style={{ color: '#0284C7', fontSize: '0.85rem' }} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      color: '#0F2C59',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Toggle Lock All Reports */}
                <button
                  type="button"
                  onClick={handleToggleLockAll}
                  disabled={lockingAll || submittedCount === 0}
                  style={{
                    backgroundColor: allLocked ? '#10B981' : '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    cursor: (lockingAll || submittedCount === 0) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                  }}
                  title={allLocked ? 'Mở khóa cho tất cả khoa phòng sửa số liệu' : 'Khóa sổ toàn viện sau 08:30 sáng'}
                >
                  {lockingAll ? <FaSpinner className="spinner" /> : allLocked ? <><FaUnlockAlt /> Mở Khóa Toàn Viện</> : <><FaLock /> Khóa Sổ Toàn Viện</>}
                </button>

                {/* Export Excel Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exportingExcel}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      cursor: exportingExcel ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {exportingExcel ? <FaSpinner className="spinner" /> : <FaFileExcel style={{ color: '#10B981' }} />}
                    Xuất Excel <FaChevronDown size={9} />
                  </button>
                  {showExportMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.35rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #E2E8F0',
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

                {/* Print / PDF View */}
                <button
                  type="button"
                  onClick={handlePrintReport}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    cursor: 'pointer'
                  }}
                  title="Xem bản in toàn viện & Tải file PDF A4 chuẩn"
                >
                  <FaFilePdf style={{ color: '#EF4444' }} /> In / Tải PDF
                </button>

                {/* Presentation Mode */}
                <button
                  type="button"
                  onClick={handlePresentation}
                  style={{
                    backgroundColor: '#0F2C59',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 44, 89, 0.25)'
                  }}
                >
                  <FaTv /> Trình Chiếu Giao Ban
                </button>
              </>
            )}

            {/* Version Changelog Manager */}
            <button
              type="button"
              onClick={() => setShowVersionManageModal(true)}
              style={{
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Soạn thảo thông tin phiên bản mới và kiểm soát chế độ nổi bật ngoài trang đăng nhập"
            >
              <FaRocket style={{ color: '#0284C7' }} /> Quản Lý Phiên Bản
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#DC2626',
                border: '1.5px solid #FECACA',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer'
              }}
              title="Đăng xuất khỏi hệ thống"
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </header>

        {/* Main Content Body Area */}
        <main style={{ flex: 1, padding: '1.5rem 1.75rem', maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          <Suspense fallback={<TabLoadingFallback />}>
            {activeTab === 'reports' && (
              <ReportsTab
                statusList={statusList}
                loading={loading}
                error={error}
                onClearError={() => setError('')}
                onOpenDetailModal={handleOpenDetailModal}
                onOpenMoveModal={(dept) => setDashboardMoveModal({
                  isOpen: true,
                  departmentCode: dept.departmentCode,
                  departmentName: dept.departmentName || DEPARTMENT_NAMES[dept.departmentCode] || dept.departmentCode,
                  currentDate: date,
                  doctorName: dept.doctorName || '',
                  nurseName: dept.nurseName || ''
                })}
              />
            )}
            {activeTab === 'history' && (
              <SubmissionHistoryTab
                onViewReportDetail={(deptCode, reportDate) => {
                  handleOpenDetailModal(deptCode, reportDate);
                }}
                onPrintReport={(deptCode, reportDate) => {
                  if (reportDate && reportDate !== date) {
                    setDate(reportDate);
                  }
                  setShowPrintModal(true);
                }}
              />
            )}
            {activeTab === 'data_archive' && (
              <DataArchiveTab
                onOpenPresentation={handlePresentation}
                onOpenPrintView={() => {
                  fetchStatus(date);
                  setShowPrintModal(true);
                }}
                onOpenReportDetail={(r) => {
                  handleOpenDetailModal(r.department_code, r.report_date || date);
                }}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsTab initialDate={date} />}
            {activeTab === 'custom_forms' && <CustomFormsTab />}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'database' && <DatabaseTab date={date} />}
            {activeTab === 'accounts' && <AccountsTab />}
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Admin Report Detail Modal */}
      <AdminReportDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalDept={modalDept}
        date={modalReportDate || date}
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

      {/* High-Tech Security Lockdown & Unlock Modal */}
      <SecurityLockModal
        isOpen={securityModal.isOpen}
        mode={securityModal.mode}
        targetType={securityModal.targetType}
        targetName={securityModal.targetName}
        date={date}
        willLock={securityModal.willLock}
        loading={securityModal.loading}
        onConfirm={handleConfirmSecurityAction}
        onCancel={handleCloseSecurityModal}
        onClose={handleCloseSecurityModal}
      />

      {/* Medical Print View Modal */}
      {showPrintModal && (
        <MedicalPrintView
          date={date}
          reports={printReports}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Dynamic Version Changelog Manager Modal */}
      <VersionManageModal
        isOpen={showVersionManageModal}
        onClose={() => setShowVersionManageModal(false)}
      />

      {/* Move Report Date Modal */}
      <MoveReportModal
        isOpen={dashboardMoveModal.isOpen}
        onClose={() => setDashboardMoveModal(prev => ({ ...prev, isOpen: false }))}
        departmentCode={dashboardMoveModal.departmentCode}
        departmentName={dashboardMoveModal.departmentName}
        currentDate={dashboardMoveModal.currentDate}
        doctorName={dashboardMoveModal.doctorName}
        nurseName={dashboardMoveModal.nurseName}
        onSuccess={() => {
          fetchStatus();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
