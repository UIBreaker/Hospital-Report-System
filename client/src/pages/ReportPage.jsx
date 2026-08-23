import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaUserMd, 
  FaUserNurse, 
  FaChevronRight, 
  FaChevronLeft,
  FaSignOutAlt, 
  FaSpinner, 
  FaPaperPlane, 
  FaCheckCircle, 
  FaPlus, 
  FaTrash, 
  FaClock, 
  FaUsers,
  FaFilePdf,
  FaDownload,
  FaNotesMedical,
  FaCheck,
  FaLock,
  FaHospital,
  FaEdit,
  FaExclamationCircle
} from 'react-icons/fa';
import reportService from '../services/reportService';
import staffService from '../services/staffService';
import { Button, Modal, Notice, Badge, Card, FormField, Stepper } from '../components/ui';

import HoiSucCapCuuForm from '../components/forms/departments/HoiSucCapCuuForm';
import ChuanDoanHinhAnhForm from '../components/forms/departments/ChuanDoanHinhAnhForm';
import YHocCoTruyenForm from '../components/forms/departments/YHocCoTruyenForm';
import NgoaiTongHopForm from '../components/forms/departments/NgoaiTongHopForm';
import ChanThuongChinhHinhForm from '../components/forms/departments/ChanThuongChinhHinhForm';
import NhiForm from '../components/forms/departments/NhiForm';
import NhiemForm from '../components/forms/departments/NhiemForm';
import GayMeHoiSucForm from '../components/forms/departments/GayMeHoiSucForm';
import SanForm from '../components/forms/departments/SanForm';
import XetNghiemForm from '../components/forms/departments/XetNghiemForm';
import NoiForm from '../components/forms/departments/NoiForm';
import LienChuyenKhoaForm from '../components/forms/departments/LienChuyenKhoaForm';
import SurgeryCaseForm from '../components/forms/SurgeryCaseForm';
import DeathCaseForm from '../components/forms/DeathCaseForm';
import CriticalCaseForm from '../components/forms/CriticalCaseForm';
import StaffSelectCombobox from '../components/common/StaffSelectCombobox';
import DepartmentPrintView from '../components/common/DepartmentPrintView';
import Footer from '../components/common/Footer';
import MedicalLoader from '../components/common/MedicalLoader';

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return dateStr;
};

const DEPARTMENT_FORMS = {
  lck: LienChuyenKhoaForm,
  xn: XetNghiemForm,
  cdha: ChuanDoanHinhAnhForm,
  hscc_tnt: HoiSucCapCuuForm,
  noi: NoiForm,
  nhi: NhiForm,
  nhiem: NhiemForm,
  san: SanForm,
  yhct_phcn: YHocCoTruyenForm,
  ngoai_th: NgoaiTongHopForm,
  ctch: ChanThuongChinhHinhForm,
  gmhs: GayMeHoiSucForm,
};

// Helper: Trích xuất tên sạch của nhân sự (bỏ số thứ tự và chức vụ trong datalist)
const extractCleanStaffName = (inputVal, allStaff = []) => {
  if (!inputVal || typeof inputVal !== 'string') return '';
  const trimmed = inputVal.trim();
  if (!trimmed) return '';

  // Khớp mẫu: "1. Lý Thị An - Bác sĩ (3939/BP-CCHN)" hoặc "1. Lý Thị An (3939/BP-CCHN)"
  const match = trimmed.match(/^\d+\.\s*([^\-(]+?)(?:\s*-\s*[^\(]+)?(?:\s*\([^)]*\))?$/);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }

  // Khớp trực tiếp với danh sách nhân sự nếu có tên trong database
  const found = allStaff.find(s => 
    trimmed.includes(s.full_name) || s.full_name.toLowerCase() === trimmed.toLowerCase()
  );
  if (found) return found.full_name;

  // Trường hợp nhập có số thứ tự đơn giản "1. Lý Thị An"
  const simple = trimmed.replace(/^\d+\.\s*/, '').trim();
  return simple || trimmed;
};

const ReportPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Danh sách nhân sự của khoa
  const [staffList, setStaffList] = useState({
    doctors: [],
    nurses: [],
    allStaff: []
  });
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = yesterday.toISOString().split('T')[0];

  const [headerData, setHeaderData] = useState({
    reportDate: formattedYesterday,
    selectedDoctors: [''], // Hỗ trợ nhiều Bác sĩ trực
    selectedDoctor: '',
    selectedNurses: [''], // Hỗ trợ nhiều điều dưỡng trực
    overtimeStaff: [], // Danh sách: [{ id, staffName, time }]
    room: '',
    shiftTime: ''
  });

  const [formData, setFormData] = useState({});
  const [transferCases, setTransferCases] = useState([]);
  const [surgeryCases, setSurgeryCases] = useState([]);
  const [deathCases, setDeathCases] = useState([]);
  const [criticalCases, setCriticalCases] = useState([]);
  const [loadingExistingReport, setLoadingExistingReport] = useState(false);
  const [existingReportLoaded, setExistingReportLoaded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState({ lockedAt: null, lockedBy: null });

  // Fetch danh sách nhân sự của khoa khi đăng nhập
  useEffect(() => {
    const fetchStaff = async () => {
      if (!user?.departmentCode) return;
      setLoadingStaff(true);
      try {
        const res = await staffService.getStaffByDepartment(user.departmentCode);
        if (res.success) {
          setStaffList({
            doctors: res.doctors || [],
            nurses: res.nurses || [],
            allStaff: res.allStaff || []
          });
        }
      } catch (err) {
        console.error('Không thể tải danh sách nhân sự khoa:', err);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [user?.departmentCode]);

  // Tự động tải lại toàn bộ dữ liệu báo cáo đã nộp của khoa theo ngày được chọn
  useEffect(() => {
    let isMounted = true;
    const fetchExistingReport = async () => {
      if (!user?.departmentCode || !headerData.reportDate) return;
      setLoadingExistingReport(true);
      try {
        const res = await reportService.getReport(user.departmentCode, headerData.reportDate);
        if (!isMounted) return;

        if (res?.data) {
          const report = res.data;
          let overtime = report.overtime_staff;
          if (typeof overtime === 'string') {
            try { overtime = JSON.parse(overtime); } catch (e) { overtime = []; }
          }

          // Parse danh sách bác sĩ nếu lưu dạng chuỗi phân cách bởi dấu phẩy
          let doctors = [''];
          if (report.doctor_name) {
            const splitDocs = report.doctor_name.split(',').map(s => s.trim()).filter(Boolean);
            if (splitDocs.length > 0) {
              doctors = splitDocs;
            }
          }

          // Parse danh sách điều dưỡng nếu lưu dạng chuỗi phân cách bởi dấu phẩy
          let nurses = [''];
          if (report.nurse_name) {
            const splitNurses = report.nurse_name.split(',').map(s => s.trim()).filter(Boolean);
            if (splitNurses.length > 0) {
              nurses = splitNurses;
            }
          }

          setHeaderData(prev => ({
            ...prev,
            selectedDoctors: doctors,
            selectedDoctor: doctors[0] || '',
            selectedNurses: nurses,
            overtimeStaff: Array.isArray(overtime) ? overtime : [],
            room: report.room || '',
            shiftTime: report.shift_time || ''
          }));

          const parsedData = typeof report.report_data === 'string' 
            ? JSON.parse(report.report_data) 
            : (report.report_data || {});
          
          const normalizedTransfers = (report.transferCases || []).map((tc, idx) => ({
            ...tc,
            _id: tc._id || tc.id || `tc_${Date.now()}_${idx}`,
            patientName: tc.patientName || tc.patient_name || '',
            patient_name: tc.patientName || tc.patient_name || '',
            age: tc.age || '',
            address: tc.address || '',
            admissionTime: tc.admissionTime || tc.admission_time || '',
            admission_time: tc.admissionTime || tc.admission_time || '',
            reason: tc.reason || '',
            clinicalSymptoms: tc.clinicalSymptoms || tc.clinical_symptoms || '',
            clinical_symptoms: tc.clinicalSymptoms || tc.clinical_symptoms || '',
            clinicalTests: tc.clinicalTests || tc.clinical_tests || '',
            clinical_tests: tc.clinicalTests || tc.clinical_tests || '',
            diagnosis: tc.diagnosis || '',
            initialTreatment: tc.initialTreatment || tc.initial_treatment || '',
            initial_treatment: tc.initialTreatment || tc.initial_treatment || '',
            progressNotes: tc.progressNotes || tc.progress_notes || '',
            progress_notes: tc.progressNotes || tc.progress_notes || '',
            images: tc.images || []
          }));

          const normalizedSurgeries = (report.surgeryCases || []).map((sc, idx) => ({
            ...sc,
            _id: sc._id || sc.id || `sc_${Date.now()}_${idx}`,
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
            images: sc.images || []
          }));

          const normalizedDeaths = (report.deathCases || []).map((dc, idx) => ({
            ...dc,
            _id: dc._id || dc.id || `dc_${Date.now()}_${idx}`,
            patientName: dc.patientName || dc.patient_name || '',
            patient_name: dc.patientName || dc.patient_name || '',
            age: dc.age || '',
            address: dc.address || '',
            admissionTime: dc.admissionTime || dc.admission_time || '',
            admission_time: dc.admissionTime || dc.admission_time || '',
            reason: dc.reason || '',
            admissionStatus: dc.admissionStatus || dc.admission_status || '',
            admission_status: dc.admissionStatus || dc.admission_status || '',
            medicalHistory: dc.medicalHistory || dc.medical_history || '',
            medical_history: dc.medicalHistory || dc.medical_history || '',
            clinicalSymptoms: dc.clinicalSymptoms || dc.clinical_symptoms || '',
            clinical_symptoms: dc.clinicalSymptoms || dc.clinical_symptoms || '',
            clinicalTests: dc.clinicalTests || dc.clinical_tests || '',
            clinical_tests: dc.clinicalTests || dc.clinical_tests || '',
            diagnosis: dc.diagnosis || '',
            emergencyTreatment: dc.emergencyTreatment || dc.emergency_treatment || '',
            emergency_treatment: dc.emergencyTreatment || dc.emergency_treatment || '',
            finalOutcome: dc.finalOutcome || dc.final_outcome || '',
            final_outcome: dc.finalOutcome || dc.final_outcome || '',
            images: dc.images || []
          }));

          const normalizedCriticals = (report.criticalCases || []).map((cc, idx) => ({
            ...cc,
            _id: cc._id || cc.id || `cc_${Date.now()}_${idx}`,
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
            notes: cc.notes !== undefined ? cc.notes : 'Bàn giao tua sau theo dõi tiếp',
            images: cc.images || []
          }));

          setFormData(parsedData);
          setTransferCases(normalizedTransfers);
          setSurgeryCases(normalizedSurgeries);
          setDeathCases(normalizedDeaths);
          setCriticalCases(normalizedCriticals);
          setExistingReportLoaded(true);
          setIsLocked(Boolean(Number(report.is_locked) === 1));
          setLockInfo({ lockedAt: report.locked_at, lockedBy: report.locked_by });
        } else {
          setExistingReportLoaded(false);
          setIsLocked(false);
          setLockInfo({ lockedAt: null, lockedBy: null });
          setFormData({});
          setTransferCases([]);
          setSurgeryCases([]);
          setDeathCases([]);
          setCriticalCases([]);
          setHeaderData(prev => ({
            ...prev,
            selectedDoctors: [''],
            selectedDoctor: '',
            selectedNurses: [''],
            overtimeStaff: [],
            room: '',
            shiftTime: ''
          }));
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra báo cáo cũ:', err);
      } finally {
        if (isMounted) setLoadingExistingReport(false);
      }
    };

    fetchExistingReport();
    return () => { isMounted = false; };
  }, [user?.departmentCode, headerData.reportDate]);

  // Tạo danh sách datalist có số thứ tự tự động cho Bác sĩ
  const doctorOptions = useMemo(() => {
    const docs = staffList.doctors || [];
    const others = (staffList.nurses || []).filter(n => !docs.some(d => d.id === n.id));
    const list = [...docs, ...others];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Bác sĩ'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tạo danh sách datalist có số thứ tự tự động cho Điều dưỡng
  const nurseOptions = useMemo(() => {
    const nurs = staffList.nurses || [];
    const others = (staffList.doctors || []).filter(d => !nurs.some(n => n.id === d.id));
    const list = [...nurs, ...others];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Điều dưỡng'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tạo danh sách datalist toàn bộ nhân sự khoa cho Trực thêm giờ
  const allStaffOptions = useMemo(() => {
    const list = staffList.allStaff || [];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Nhân viên'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tính toán tên bác sĩ và điều dưỡng thực tế (chuẩn hóa tên sạch)
  const cleanDoctorNames = (headerData.selectedDoctors || [headerData.selectedDoctor || ''])
    .map(d => extractCleanStaffName(d, staffList.allStaff))
    .filter(Boolean);
  const finalDoctorNameStr = cleanDoctorNames.join(', ');
  const cleanDoctorName = cleanDoctorNames[0] || '';

  const cleanNurseNames = (headerData.selectedNurses || [])
    .map(n => extractCleanStaffName(n, staffList.allStaff))
    .filter(Boolean);
  const finalNurseNameStr = cleanNurseNames.join(', ');

  const handleNext = () => {
    if (cleanDoctorNames.length > 0) {
      setStep(2);
    }
  };

  // Thêm dòng Bác sĩ trực
  const handleAddDoctor = () => {
    setHeaderData({
      ...headerData,
      selectedDoctors: [...(headerData.selectedDoctors || ['']), '']
    });
  };

  // Cập nhật Bác sĩ trực
  const handleDoctorChange = (index, value) => {
    const updated = [...(headerData.selectedDoctors || [''])];
    updated[index] = value;
    setHeaderData({ 
      ...headerData, 
      selectedDoctors: updated,
      selectedDoctor: updated[0] || ''
    });
  };

  // Xóa Bác sĩ trực
  const handleRemoveDoctor = (index) => {
    const updated = (headerData.selectedDoctors || ['']).filter((_, i) => i !== index);
    const finalDocs = updated.length > 0 ? updated : [''];
    setHeaderData({
      ...headerData,
      selectedDoctors: finalDocs,
      selectedDoctor: finalDocs[0] || ''
    });
  };

  // Thêm dòng điều dưỡng trực
  const handleAddNurse = () => {
    setHeaderData({
      ...headerData,
      selectedNurses: [...(headerData.selectedNurses || ['']), '']
    });
  };

  // Cập nhật điều dưỡng trực
  const handleNurseChange = (index, value) => {
    const updated = [...(headerData.selectedNurses || [''])];
    updated[index] = value;
    setHeaderData({ ...headerData, selectedNurses: updated });
  };

  // Xóa điều dưỡng trực
  const handleRemoveNurse = (index) => {
    const updated = (headerData.selectedNurses || []).filter((_, i) => i !== index);
    setHeaderData({
      ...headerData,
      selectedNurses: updated.length > 0 ? updated : ['']
    });
  };

  // Thêm dòng nhân sự tăng cường thêm giờ
  const handleAddOvertimeStaff = () => {
    setHeaderData({
      ...headerData,
      overtimeStaff: [
        ...(headerData.overtimeStaff || []),
        { id: Date.now(), staffName: '', time: '' }
      ]
    });
  };

  // Cập nhật dòng nhân sự tăng cường
  const handleOvertimeChange = (index, field, value) => {
    const updated = [...(headerData.overtimeStaff || [])];
    if (updated[index]) {
      updated[index][field] = value;
    }
    setHeaderData({ ...headerData, overtimeStaff: updated });
  };

  // Xóa dòng nhân sự tăng cường
  const handleRemoveOvertimeStaff = (index) => {
    const updated = (headerData.overtimeStaff || []).filter((_, i) => i !== index);
    setHeaderData({ ...headerData, overtimeStaff: updated });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    // Chuẩn hóa danh sách nhân sự thêm giờ
    const formattedOvertime = (headerData.overtimeStaff || [])
      .map(item => ({
        staffName: extractCleanStaffName(item?.staffName, staffList.allStaff),
        time: (item?.time || '').trim()
      }))
      .filter(item => item.staffName || item.time);

    try {
      await reportService.createOrUpdateReport({
        departmentCode: user.departmentCode,
        reportDate: headerData.reportDate,
        doctorName: finalDoctorNameStr || cleanDoctorName,
        nurseName: finalNurseNameStr || null,
        overtimeStaff: formattedOvertime.length > 0 ? formattedOvertime : null,
        room: headerData.room,
        shiftTime: headerData.shiftTime,
        reportData: formData,
        transferCases: transferCases,
        surgeryCases: surgeryCases,
        deathCases: deathCases,
        criticalCases: criticalCases
      });
      setSubmitted(true);
      setShowConfirm(false);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const FormComponent = DEPARTMENT_FORMS[user?.departmentCode];

  if (submitted) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card animate-fade-in" style={{ maxWidth: '620px', margin: '3.5rem auto', textAlign: 'center', padding: '3rem 2.5rem', borderRadius: '16px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <FaCheckCircle style={{ fontSize: '4.2rem', color: 'var(--brand-green)', marginBottom: '1.25rem' }} />
          <h2 style={{ marginBottom: '0.85rem', color: 'var(--brand-green)', fontSize: '1.75rem', fontWeight: '800' }}>Gửi Báo Cáo Thành Công!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.25rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Báo cáo giao ban ngày <strong>{formatDateDDMMYYYY(headerData.reportDate)}</strong> của khoa <strong>{user?.departmentName}</strong> đã được ghi nhận vào hệ thống.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn"
              onClick={() => setShowPdfModal(true)}
              style={{ backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              <FaFilePdf style={{ fontSize: '1.15rem' }} /> 📄 Xuất File PDF
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => { 
                setSubmitted(false); 
                setStep(1); 
                setFormData({}); 
                setTransferCases([]); 
                setSurgeryCases([]);
                setDeathCases([]);
                setCriticalCases([]);
                setHeaderData({
                  ...headerData, 
                  selectedDoctors: [''],
                  selectedDoctor: '', 
                  selectedNurses: [''], 
                  overtimeStaff: [], 
                  room: '', 
                  shiftTime: ''
                }); 
              }}
            >
              Tạo báo cáo mới
            </button>
            <button className="btn btn-secondary" onClick={logout}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Modal Xem & Xuất File PDF Chuyên Môn */}
        {showPdfModal && (
          <DepartmentPrintView
            reportDate={headerData.reportDate}
            departmentName={user?.departmentName || ''}
            departmentCode={user?.departmentCode || ''}
            doctorName={finalDoctorNameStr || cleanDoctorName}
            nurseName={finalNurseNameStr}
            overtimeStaff={headerData.overtimeStaff || []}
            room={headerData.room || ''}
            shiftTime={headerData.shiftTime || ''}
            formData={formData}
            transferCases={transferCases}
            surgeryCases={surgeryCases}
            deathCases={deathCases}
            criticalCases={criticalCases}
            onClose={() => setShowPdfModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="report-page-wrapper app-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 1rem 4rem' }}>
      
      {/* 1. Brand Header Navbar (Synchronized with Admin Header) */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left Side: Hospital Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/logo.png" 
            alt="Logo TTYT Bình Long" 
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(15, 44, 89, 0.15)',
              flexShrink: 0
            }} 
          />
          <div>
            <h1 style={{
              fontSize: '1.05rem',
              fontWeight: '900',
              color: '#0F2C59',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h1>
            <p style={{
              fontSize: '0.8rem',
              color: '#64748B',
              margin: '2px 0 0 0',
              fontWeight: '500'
            }}>
              Hệ Thống Báo Cáo Giao Ban Ca Trực Khoa Phòng
            </p>
          </div>
        </div>

        {/* Right Side: Department Badge & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Department Name Badge */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            padding: '0.45rem 0.9rem',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <FaHospital /> {user?.departmentName || 'Khoa Phòng'}
          </div>

          {/* Quick PDF Button if loaded */}
          {existingReportLoaded && (
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              style={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s'
              }}
              title="Xuất file PDF báo cáo của ngày này"
            >
              <FaFilePdf /> Xuất PDF
            </button>
          )}

          {/* Logout Button */}
          <button 
            type="button"
            onClick={logout} 
            style={{
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s'
            }}
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* 2. Lock Notification Banner */}
      {isLocked && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1.5px solid #F59E0B',
          borderLeft: '6px solid #D97706',
          borderRadius: '12px',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.12)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🔒</span>
            <div>
              <h4 style={{ margin: 0, color: '#92400E', fontSize: '0.96rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Báo Cáo Đã Khóa Sổ Giao Ban (Chế độ xem chỉ đọc)
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', color: '#B45309', fontSize: '0.84rem', lineHeight: 1.4 }}>
                Báo cáo ngày <strong>{formatDateDDMMYYYY(headerData.reportDate)}</strong> đã khóa sổ (sau 08:30 sáng hoặc do Ban Giám Đốc/Admin khóa). Mọi số liệu được bảo lưu pháp lý. Nếu cần chỉnh sửa, vui lòng liên hệ <strong>Phòng Kế Hoạch Nghiệp Vụ (Admin)</strong> để mở khóa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}
          >
            <FaFilePdf /> Xuất File PDF
          </button>
        </div>
      )}

      {/* 3. Modern Stepper Workflow Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Step Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '0.35rem',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
          gap: '0.35rem'
        }}>
          {/* Step 1 Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.86rem',
              transition: 'all 0.2s',
              background: step === 1 
                ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' 
                : '#FFFFFF',
              color: step === 1 ? '#FFFFFF' : '#64748B',
              boxShadow: step === 1 ? '0 3px 10px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <FaUserMd style={{ fontSize: '1rem' }} />
            <span>1. Hành Chính Ca Trực</span>
            {step > 1 && (
              <span style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#15803D', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.72rem' }}>
                ✓
              </span>
            )}
          </button>

          {/* Step 2 Button */}
          <button
            type="button"
            onClick={() => { if (cleanDoctorName) setStep(2); }}
            disabled={!cleanDoctorName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              cursor: cleanDoctorName ? 'pointer' : 'not-allowed',
              fontWeight: '800',
              fontSize: '0.86rem',
              transition: 'all 0.2s',
              background: step === 2 
                ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' 
                : '#FFFFFF',
              color: step === 2 ? '#FFFFFF' : (cleanDoctorName ? '#64748B' : '#CBD5E1'),
              boxShadow: step === 2 ? '0 3px 10px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <FaNotesMedical style={{ fontSize: '1rem' }} />
            <span>2. Số Liệu & Ca Bệnh</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isLocked && (
            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              🔒 Đã Khóa Sổ
            </span>
          )}
          <span style={{
            backgroundColor: existingReportLoaded ? '#EFF6FF' : '#FFFBEB',
            color: existingReportLoaded ? '#1E40AF' : '#B45309',
            border: `1px solid ${existingReportLoaded ? '#BFDBFE' : '#FDE68A'}`,
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: existingReportLoaded ? '#2563EB' : '#F59E0B' }} />
            {existingReportLoaded ? 'Đã có báo cáo' : 'Bản nháp chưa gửi'}
          </span>
        </div>
      </div>

      {/* 4. STEP 1: HÀNH CHÍNH CA TRỰC */}
      {step === 1 ? (
        <div className="animate-fade-in" style={{
          maxWidth: '720px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.75rem 2rem',
          boxShadow: '0 4px 20px rgba(15, 44, 89, 0.04)'
        }}>
          {/* Card Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #EFF6FF',
            paddingBottom: '0.85rem'
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: '900',
              color: '#0F2C59',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaUserMd style={{ color: '#2563EB' }} />
              Thông Tin Hành Chính Ca Trực
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
              Bước 1 / 2
            </span>
          </div>
          
          {/* Notice: Status of current selected date */}
          <div style={{ marginBottom: '1.5rem' }}>
            {loadingExistingReport ? (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#1E40AF',
                fontSize: '0.88rem'
              }}>
                <FaSpinner className="spinner" />
                <span>Đang kiểm tra dữ liệu ngày <strong>{formatDateDDMMYYYY(headerData.reportDate)}</strong>...</span>
              </div>
            ) : existingReportLoaded ? (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '12px',
                padding: '0.95rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#166534', fontWeight: '700', fontSize: '0.9rem' }}>
                  <FaCheckCircle style={{ color: '#16A34A', fontSize: '1.1rem' }} />
                  <span>Đã nạp dữ liệu báo cáo ngày {formatDateDDMMYYYY(headerData.reportDate)}</span>
                </div>
                <p style={{ margin: 0, color: '#15803D', fontSize: '0.84rem', lineHeight: '1.5' }}>
                  Toàn bộ thông tin ca trực và số liệu chuyên môn đã nộp trước đó đã được tải sẵn. Bạn có thể tiếp tục chỉnh sửa hoặc nộp bổ sung.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(true)}
                    style={{
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <FaFilePdf /> Xuất File PDF
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '0.85rem 1.15rem',
                color: '#1E40AF',
                fontSize: '0.86rem',
                lineHeight: '1.5'
              }}>
                💡 <strong>Ngày {formatDateDDMMYYYY(headerData.reportDate)} chưa có báo cáo:</strong> Vui lòng chọn Bác sĩ, Điều dưỡng trực và bấm <em>"Tiếp tục nhập số liệu chuyên môn"</em> để hoàn tất nộp giao ban.
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', marginBottom: '2rem' }}>
            
            {/* 1. Ngày báo cáo */}
            <div className="form-group">
              <label style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.88rem', marginBottom: '0.35rem', display: 'block' }}>
                Ngày báo cáo <span style={{ color: '#DC2626' }}>*</span> <span style={{ fontWeight: 'normal', color: '#64748B', fontSize: '0.8rem' }}>(Chọn đúng ngày trực giao ban)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FaCalendarAlt style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#2563EB', zIndex: 1 }} />
                <input 
                  type="date" 
                  value={headerData.reportDate}
                  onChange={(e) => setHeaderData({...headerData, reportDate: e.target.value})}
                  style={{
                    paddingLeft: '2.8rem',
                    height: '46px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* 2. Bác sĩ trực ca */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaUserMd style={{ color: '#2563EB' }} /> Bác sĩ trực ca ({cleanDoctorNames.length || 0}) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddDoctor}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    border: '1px solid #BFDBFE',
                    borderRadius: '7px',
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <FaPlus /> Thêm Bác sĩ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(headerData.selectedDoctors || ['']).map((docVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <StaffSelectCombobox
                        placeholder={idx === 0 ? "Gõ số (1, 2...) hoặc tên Bác sĩ trực chính..." : `Gõ số hoặc tên Bác sĩ ${idx + 1}...`}
                        value={docVal}
                        onChange={(val) => handleDoctorChange(idx, val)}
                        doctors={staffList.doctors}
                        nurses={staffList.nurses}
                        allStaff={staffList.allStaff}
                        type="doctor"
                        loading={loadingStaff}
                      />
                    </div>
                    {(headerData.selectedDoctors || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoctor(idx)}
                        style={{
                          padding: '0.45rem 0.65rem',
                          height: '44px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FFF5F5',
                          color: '#DC2626',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Xóa Bác sĩ này"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <small style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                💡 Gợi ý: Bấm nút <strong>"+ Thêm Bác sĩ"</strong> nếu ca trực có từ 2 Bác sĩ trở lên.
              </small>
            </div>

            {/* 3. Điều dưỡng trực ca */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaUserNurse style={{ color: '#059669' }} /> Điều dưỡng trực ca ({(headerData.selectedNurses || []).length || 0})
                </label>
                <button
                  type="button"
                  onClick={handleAddNurse}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    border: '1px solid #BBF7D0',
                    borderRadius: '7px',
                    color: '#166534',
                    backgroundColor: '#F0FDF4',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <FaPlus /> Thêm điều dưỡng
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(headerData.selectedNurses || ['']).map((nurseVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <StaffSelectCombobox
                        placeholder={idx === 0 ? "Gõ số (1, 2...) hoặc tên Điều dưỡng 1..." : `Gõ số hoặc tên Điều dưỡng ${idx + 1}...`}
                        value={nurseVal}
                        onChange={(val) => handleNurseChange(idx, val)}
                        doctors={staffList.doctors}
                        nurses={staffList.nurses}
                        allStaff={staffList.allStaff}
                        type="nurse"
                        loading={loadingStaff}
                      />
                    </div>
                    {(headerData.selectedNurses || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNurse(idx)}
                        style={{
                          padding: '0.45rem 0.65rem',
                          height: '44px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FFF5F5',
                          color: '#DC2626',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Xóa điều dưỡng này"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <small style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                💡 Gợi ý: Bấm nút <strong>"+ Thêm điều dưỡng"</strong> nếu ca trực có từ 2 điều dưỡng trở lên.
              </small>
            </div>

            {/* 4. Nhân sự trực thêm giờ / Tăng cường */}
            <div style={{
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.15rem',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ margin: 0, fontWeight: '700', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}>
                  <FaClock style={{ color: '#D97706' }} /> Nhân sự trực thêm giờ / Tăng cường ({(headerData.overtimeStaff || []).length})
                </label>
                <button
                  type="button"
                  onClick={handleAddOvertimeStaff}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '7px',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <FaPlus /> Thêm tăng cường
                </button>
              </div>

              {(headerData.overtimeStaff || []).length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.84rem', fontStyle: 'italic', margin: 0 }}>
                  Chưa có nhân sự trực thêm giờ (Bấm nút trên nếu ca trực có nhân sự tăng cường).
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(headerData.overtimeStaff || []).map((ot, idx) => (
                    <div 
                      key={ot.id || idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.4fr 1fr auto', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      <div>
                        <StaffSelectCombobox
                          placeholder="Gõ số (1, 2...) hoặc tên..."
                          value={ot.staffName}
                          onChange={(val) => handleOvertimeChange(idx, 'staffName', val)}
                          doctors={staffList.doctors}
                          nurses={staffList.nurses}
                          allStaff={staffList.allStaff}
                          type="all"
                        />
                      </div>

                      <div>
                        <div style={{ position: 'relative' }}>
                          <FaClock style={{ position: 'absolute', top: '50%', left: '0.6rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }} />
                          <input
                            type="text"
                            placeholder="VD: 17h - 21h"
                            value={ot.time}
                            onChange={(e) => handleOvertimeChange(idx, 'time', e.target.value)}
                            style={{ paddingLeft: '1.8rem', fontSize: '0.85rem', height: '40px', borderRadius: '8px' }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOvertimeStaff(idx)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          height: '40px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FFF5F5',
                          color: '#DC2626',
                          cursor: 'pointer'
                        }}
                        title="Xóa nhân sự này"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Phòng buồng & Thời gian trực */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.88rem', marginBottom: '0.35rem', display: 'block' }}>Phòng / Buồng trực <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>(Tùy chọn)</span></label>
                <input 
                  type="text" 
                  placeholder="VD: Phòng cấp cứu"
                  value={headerData.room || ''}
                  onChange={(e) => setHeaderData({...headerData, room: e.target.value})}
                  style={{ height: '44px', borderRadius: '8px' }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.88rem', marginBottom: '0.35rem', display: 'block' }}>Thời gian trực <span style={{ fontWeight: 'normal', color: '#94A3B8' }}>(Tùy chọn)</span></label>
                <input 
                  type="text" 
                  placeholder="VD: 07h00 - 07h00 (24/24)"
                  value={headerData.shiftTime || ''}
                  onChange={(e) => setHeaderData({...headerData, shiftTime: e.target.value})}
                  style={{ height: '44px', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
            <button 
              type="button"
              onClick={handleNext}
              disabled={cleanDoctorNames.length === 0}
              style={{
                background: cleanDoctorNames.length === 0 
                  ? '#CBD5E1' 
                  : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem 2.25rem',
                fontSize: '1rem',
                fontWeight: '800',
                borderRadius: '10px',
                cursor: cleanDoctorNames.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: cleanDoctorNames.length === 0 ? 'none' : '0 6px 20px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Tiếp tục nhập số liệu chuyên môn <FaChevronRight />
            </button>
          </div>
        </div>
      ) : (
        /* 5. STEP 2: SỐ LIỆU CHUYÊN MÔN & CA BỆNH */
        <div className="animate-slide-up">
          {/* Top Sticky/Summary Bar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            borderLeft: '5px solid #2563EB',
            padding: '0.9rem 1.4rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#334155' }}>
              <div>📅 <strong>Ngày:</strong> {formatDateDDMMYYYY(headerData.reportDate)}</div>
              <div>👨‍⚕️ <strong>Bác sĩ ({cleanDoctorNames.length}):</strong> <span style={{ color: '#1E40AF', fontWeight: '700' }}>{finalDoctorNameStr || cleanDoctorName}</span></div>
              {finalNurseNameStr && <div>👩‍⚕️ <strong>Điều dưỡng:</strong> <span style={{ color: '#065F46', fontWeight: '700' }}>{finalNurseNameStr}</span></div>}
              {(headerData.overtimeStaff || []).length > 0 && (
                <div>
                  ⏰ <strong>Tăng cường:</strong> {(headerData.overtimeStaff || []).map(s => `${extractCleanStaffName(s.staffName, staffList.allStaff)} (${s.time})`).join(', ')}
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => setStep(1)}
              style={{
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FaEdit /> Sửa hành chính
            </button>
          </div>

          {/* Dynamic Department Form Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 44, 89, 0.04)'
          }}>
            {FormComponent ? (
              <FormComponent 
                reportDate={headerData.reportDate}
                doctorName={finalDoctorNameStr || cleanDoctorName}
                room={headerData.room}
                shiftTime={headerData.shiftTime}
                formData={formData}
                setFormData={setFormData}
                transferCases={transferCases}
                setTransferCases={setTransferCases}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', fontStyle: 'italic' }}>
                Không tìm thấy biểu mẫu cho khoa: {user?.departmentCode}
              </div>
            )}

            {/* Module Bệnh Phẫu Thuật (Bệnh Mổ) */}
            <SurgeryCaseForm surgeryCases={surgeryCases} setSurgeryCases={setSurgeryCases} />

            {/* Module Bệnh Tử Vong */}
            <DeathCaseForm deathCases={deathCases} setDeathCases={setDeathCases} />

            {/* Module Bệnh Nặng Theo Dõi */}
            <CriticalCaseForm 
              criticalCases={criticalCases} 
              setCriticalCases={setCriticalCases} 
              departmentName={user?.departmentName}
              reportDate={headerData.reportDate}
            />
          </div>

          {/* Submit Error Notice */}
          {submitError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '0.85rem 1.15rem',
              color: '#991B1B',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaExclamationCircle />
                <span>{submitError}</span>
              </div>
              <button type="button" onClick={() => setSubmitError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem 0 2.5rem',
            flexWrap: 'wrap'
          }}>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#475569',
                border: '1.5px solid #CBD5E1',
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: '700',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <FaChevronLeft /> Quay lại Bước 1
            </button>

            {/* Preview PDF */}
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              style={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem 1.65rem',
                fontSize: '0.95rem',
                fontWeight: '700',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
              }}
            >
              <FaFilePdf /> Xem trước & Xuất PDF
            </button>

            {/* Main Submit Button */}
            {isLocked ? (
              <button 
                type="button"
                disabled
                style={{
                  backgroundColor: '#94A3B8',
                  color: '#FFFFFF',
                  padding: '0.85rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: '800',
                  borderRadius: '10px',
                  cursor: 'not-allowed',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔒 Báo Cáo Đã Khóa Sổ (Chỉ Đọc)
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => setShowConfirm(true)}
                style={{
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  color: '#FFFFFF',
                  padding: '0.85rem 2.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                <FaCheckCircle style={{ fontSize: '1.15rem' }} /> NỘP BÁO CÁO GIAO BAN
              </button>
            )}
          </div>

          {/* Confirm Submission Modal */}
          <Modal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            title="Xác Nhận Nộp Báo Cáo Giao Ban"
            description={`Khoa: ${user?.departmentName} • Ngày báo cáo: ${formatDateDDMMYYYY(headerData.reportDate)}`}
            footer={(
              <>
                <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={submitting}>
                  Hủy Bỏ
                </Button>
                <Button variant="success" loading={submitting} onClick={handleSubmit}>
                  ✅ Đồng Ý & Nộp Báo Cáo
                </Button>
              </>
            )}
          >
            <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.85rem' }}>
                Báo cáo của khoa sẽ được lưu vào hệ thống dữ liệu toàn viện và đưa vào <strong>Trình Chiếu Giao Ban Sáng</strong> phục vụ Ban Giám Đốc.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                <div>👨‍⚕️ <strong>Bác sĩ trực:</strong> {finalDoctorNameStr || cleanDoctorName}</div>
                {cleanNurseNames.length > 0 && <div style={{ marginTop: '3px' }}>👩‍⚕️ <strong>Điều dưỡng:</strong> {cleanNurseNames.join(', ')}</div>}
                <div style={{ marginTop: '3px' }}>📋 <strong>Số ca lâm sàng:</strong> {transferCases.length} chuyển viện • {surgeryCases.length} ca mổ • {deathCases.length} tử vong • {criticalCases.length} bệnh nặng</div>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Modal Xem & Xuất File PDF Chuyên Môn */}
      {showPdfModal && (
        <DepartmentPrintView
          reportDate={headerData.reportDate}
          departmentName={user?.departmentName || ''}
          departmentCode={user?.departmentCode || ''}
          doctorName={finalDoctorNameStr || cleanDoctorName}
          nurseName={finalNurseNameStr}
          overtimeStaff={headerData.overtimeStaff || []}
          room={headerData.room || ''}
          shiftTime={headerData.shiftTime || ''}
          formData={formData}
          transferCases={transferCases}
          surgeryCases={surgeryCases}
          deathCases={deathCases}
          criticalCases={criticalCases}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Hospital System Footer Section */}
      <Footer />
    </div>
  );
};

export default ReportPage;
