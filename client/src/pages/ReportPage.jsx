import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaExclamationCircle,
  FaDoorOpen,
  FaClipboardList,
  FaShieldAlt,
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa';
import reportService from '../services/reportService';
import staffService from '../services/staffService';
import { Button, Modal, Notice, Badge, Card, FormField } from '../components/ui';

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
import PersonalCustomFormsPortal from '../components/portal/PersonalCustomFormsPortal';
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

const getVietnameseFullDate = (dateStr) => {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  if (isNaN(dateObj.getTime())) return dateStr;
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[dateObj.getDay()];
  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  const y = dateObj.getFullYear();
  return `${dayName}, ngày ${d < 10 ? '0' + d : d} tháng ${m < 10 ? '0' + m : m} năm ${y}`;
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

// Confetti Particle Effect Component
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
    const particles = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 3 + (Math.random() - 0.5) * 100,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        gravity: 0.28,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let startTime = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < 4500) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

const ReportPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');
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

  // Kiểm tra và tự động nạp báo cáo cũ của ngày được chọn
  useEffect(() => {
    let isMounted = true;
    const fetchExistingReport = async () => {
      if (!user?.departmentCode || !headerData.reportDate) return;
      setLoadingExistingReport(true);
      try {
        const res = await reportService.getReport(user.departmentCode, headerData.reportDate);
        if (!isMounted) return;

        if (res && res.data) {
          const report = res.data;
          let parsedData = {};
          if (report.report_data) {
            try {
              parsedData = typeof report.report_data === 'string' ? JSON.parse(report.report_data) : report.report_data;
            } catch (e) {
              parsedData = {};
            }
          }

          let parsedOvertime = [];
          if (report.overtime_staff) {
            try {
              parsedOvertime = typeof report.overtime_staff === 'string' ? JSON.parse(report.overtime_staff) : report.overtime_staff;
            } catch (e) {
              parsedOvertime = [];
            }
          }

          const rawDocStr = report.doctor_name || '';
          const loadedDocs = rawDocStr.includes(',') 
            ? rawDocStr.split(',').map(s => s.trim()).filter(Boolean)
            : (rawDocStr ? [rawDocStr] : ['']);

          const rawNurseStr = report.nurse_name || '';
          const loadedNurses = rawNurseStr.includes(',')
            ? rawNurseStr.split(',').map(s => s.trim()).filter(Boolean)
            : (rawNurseStr ? [rawNurseStr] : ['']);

          setHeaderData(prev => ({
            ...prev,
            selectedDoctors: loadedDocs.length > 0 ? loadedDocs : [''],
            selectedDoctor: loadedDocs[0] || '',
            selectedNurses: loadedNurses.length > 0 ? loadedNurses : [''],
            overtimeStaff: Array.isArray(parsedOvertime) ? parsedOvertime : [],
            room: report.room || '',
            shiftTime: report.shift_time || ''
          }));

          const safeCaseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try {
                const p = JSON.parse(val);
                return Array.isArray(p) ? p : [];
              } catch {
                return [];
              }
            }
            return [];
          };

          const rawTransfers = safeCaseArray(report.transferCases || report.transfer_cases || parsedData.transferCases || parsedData.transfer_cases);
          const rawSurgeries = safeCaseArray(report.surgeryCases || report.surgery_cases || parsedData.surgeryCases || parsedData.surgery_cases);
          const rawDeaths = safeCaseArray(report.deathCases || report.death_cases || parsedData.deathCases || parsedData.death_cases);
          const rawCriticals = safeCaseArray(report.criticalCases || report.critical_cases || parsedData.criticalCases || parsedData.critical_cases);

          setFormData(parsedData);
          setTransferCases(rawTransfers);
          setSurgeryCases(rawSurgeries);
          setDeathCases(rawDeaths);
          setCriticalCases(rawCriticals);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      setSubmissionTimestamp(timeStr);
      setSubmitted(true);
      setShowConfirm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Personal Portal if logged in user is personal account
  if (user?.departmentCode === 'personal') {
    return <PersonalCustomFormsPortal />;
  }

  const FormComponent = DEPARTMENT_FORMS[user?.departmentCode];

  // ==========================================
  // SUCCESS SCREEN (NỘP BÁO CÁO THÀNH CÔNG)
  // ==========================================
  if (submitted) {
    return (
      <div style={{ padding: '2.5rem 1rem 4rem', maxWidth: '900px', margin: '0 auto', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ConfettiCanvas />

        <div className="animate-fade-in" style={{
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2.5rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(15, 44, 89, 0.12)',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Gradient Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #10B981, #06B6D4, #3B82F6, #10B981)'
          }} />

          {/* Animated SVG Checkmark Icon */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.2rem',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 30px rgba(22, 163, 74, 0.25)',
            border: '3px solid #86EFAC',
            animation: 'pulse 2s infinite'
          }}>
            <FaCheck />
          </div>

          <span style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '0.35rem 1.1rem',
            borderRadius: '30px',
            fontWeight: '800',
            fontSize: '0.85rem',
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.75rem'
          }}>
            <FaCheckCircle /> ĐÃ LƯU TRỮ VÀO HỆ THỐNG GIAO BAN TOÀN VIỆN
          </span>

          <h1 style={{
            margin: '0 0 0.5rem 0',
            color: '#0F2C59',
            fontSize: '2rem',
            fontWeight: '900',
            letterSpacing: '-0.5px'
          }}>
            Nộp Báo Cáo Ca Trực Thành Công!
          </h1>
          <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Số liệu chuyên môn ca trực của khoa <strong style={{ color: '#1E40AF' }}>{user?.departmentName}</strong> đã được đồng bộ vào hệ thống cơ sở dữ liệu và sẵn sàng trình chiếu phục vụ Ban Giám Đốc.
          </p>

          {/* Digital Receipt Card (Biên nhận điện tử) */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0.85rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaShieldAlt style={{ color: '#2563EB' }} /> BIÊN NHẬN BÁO CÁO ĐIỆN TỬ
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                ⏰ {submissionTimestamp || 'Vừa xong'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Khoa / Phòng:</span>
                <strong style={{ color: '#0F2C59', fontSize: '0.95rem' }}>{user?.departmentName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Ngày Trực Giao Ban:</span>
                <strong style={{ color: '#2563EB', fontSize: '0.95rem' }}>{formatDateDDMMYYYY(headerData.reportDate)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Bác Sĩ Trực Ca:</span>
                <strong style={{ color: '#1E40AF' }}>{finalDoctorNameStr || cleanDoctorName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Điều Dưỡng Trực:</span>
                <strong style={{ color: '#065F46' }}>{finalNurseNameStr || '—'}</strong>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #CBD5E1', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
              <span style={{ color: '#92400E', fontWeight: '700' }}>🚑 Chuyển viện: <strong>{transferCases.length}</strong> ca</span>
              <span style={{ color: '#0369A1', fontWeight: '700' }}>🔬 Phẫu thuật: <strong>{surgeryCases.length}</strong> ca</span>
              <span style={{ color: '#991B1B', fontWeight: '700' }}>🏥 Tử vong: <strong>{deathCases.length}</strong> ca</span>
              <span style={{ color: '#5B21B6', fontWeight: '700' }}>🩺 Nặng theo dõi: <strong>{criticalCases.length}</strong> ca</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => setShowPdfModal(true)}
              style={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem 1.65rem',
                fontSize: '1rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              <FaFilePdf style={{ fontSize: '1.2rem' }} /> XUẤT FILE PDF BÁO CÁO
            </button>
            <button 
              type="button"
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
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem 1.65rem',
                fontSize: '1rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <FaPlus /> TẠO BÁO CÁO MỚI
            </button>
            <button 
              type="button"
              onClick={logout} 
              style={{
                backgroundColor: '#FFFFFF',
                color: '#DC2626',
                border: '1.5px solid #FECACA',
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
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

  // ==========================================
  // MAIN FORM INTERFACE
  // ==========================================
  return (
    <div className="report-page-wrapper app-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 1rem 4rem' }}>
      
      {/* 1. Header Navbar */}
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
              width: '48px', 
              height: '48px', 
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(15, 44, 89, 0.15)',
              flexShrink: 0
            }} 
          />
          <div>
            <h1 style={{
              fontSize: '1.1rem',
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
              fontSize: '0.82rem',
              color: '#64748B',
              margin: '2px 0 0 0',
              fontWeight: '600'
            }}>
              Hệ Thống Báo Cáo Giao Ban Ca Trực Khoa Phòng
            </p>
          </div>
        </div>

        {/* Right Side: Department Badge, Profile & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Department Name Badge */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            color: '#1E40AF',
            padding: '0.45rem 0.95rem',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
          }}>
            <FaHospital style={{ color: '#2563EB', fontSize: '1rem' }} /> {user?.departmentName || 'Khoa Phòng'}
          </div>

          {/* User Profile Button */}
          <button 
            type="button"
            onClick={() => navigate('/profile')} 
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F2C59',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
            title="Xem và chỉnh sửa Hồ Sơ Cá Nhân & Chữ Ký Mẫu"
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', overflow: 'hidden' }}>
              {user?.avatar_url && !user.avatar_url.startsWith('preset_') ? (
                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaUserMd />
              )}
            </div>
            <span>Hồ Sơ</span>
          </button>

          {/* Logout Button */}
          <button 
            type="button"
            onClick={logout} 
            style={{
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              border: '1.5px solid #FECACA',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
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
          borderRadius: '14px',
          padding: '1rem 1.35rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.12)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>🔒</span>
            <div>
              <h4 style={{ margin: 0, color: '#92400E', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Báo Cáo Đã Khóa Sổ Giao Ban (Chế độ xem chỉ đọc)
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', color: '#B45309', fontSize: '0.86rem', lineHeight: 1.4 }}>
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
              padding: '0.55rem 1.2rem',
              fontSize: '0.88rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
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

      {/* 3. Modern Connected Stepper Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Step Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '0.4rem',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
          gap: '0.4rem'
        }}>
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 1.35rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: step === 1 
                ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' 
                : '#FFFFFF',
              color: step === 1 ? '#FFFFFF' : '#475569',
              boxShadow: step === 1 ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step === 1 ? '#FFFFFF' : '#EFF6FF',
              color: step === 1 ? '#2563EB' : '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: '900'
            }}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span>1. Thông Tin Hành Chính Ca Trực</span>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => { if (cleanDoctorName) setStep(2); }}
            disabled={!cleanDoctorName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 1.35rem',
              borderRadius: '12px',
              border: 'none',
              cursor: cleanDoctorName ? 'pointer' : 'not-allowed',
              fontWeight: '800',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: step === 2 
                ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' 
                : '#FFFFFF',
              color: step === 2 ? '#FFFFFF' : (cleanDoctorName ? '#475569' : '#94A3B8'),
              boxShadow: step === 2 ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step === 2 ? '#FFFFFF' : (cleanDoctorName ? '#EFF6FF' : '#F1F5F9'),
              color: step === 2 ? '#2563EB' : (cleanDoctorName ? '#1E40AF' : '#94A3B8'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: '900'
            }}>
              2
            </span>
            <span>2. Số Liệu Chuyên Môn & Ca Bệnh</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {isLocked && (
            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.35rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              🔒 Đã Khóa Sổ
            </span>
          )}
          <span style={{
            backgroundColor: existingReportLoaded ? '#EFF6FF' : '#FFFBEB',
            color: existingReportLoaded ? '#1E40AF' : '#B45309',
            border: `1.5px solid ${existingReportLoaded ? '#BFDBFE' : '#FDE68A'}`,
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontWeight: '800',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: existingReportLoaded ? '#2563EB' : '#F59E0B' }} />
            {existingReportLoaded ? 'Đã có báo cáo' : 'Bản nháp chưa gửi'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. STEP 1: HÀNH CHÍNH CA TRỰC (THIẾT KẾ RÕ RÀNG, HIỆN ĐẠI) */}
      {/* ======================================================== */}
      {step === 1 ? (
        <div className="animate-fade-in" style={{
          maxWidth: '780px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '2rem 2.25rem',
          boxShadow: '0 6px 24px rgba(15, 44, 89, 0.05)'
        }}>
          {/* Card Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            borderBottom: '2px solid #EFF6FF',
            paddingBottom: '1rem'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: '900',
                color: '#0F2C59',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <FaUserMd style={{ color: '#2563EB' }} />
                Thông Tin Hành Chính Ca Trực
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                Chọn ngày trực, thành phần Bác sĩ và Điều dưỡng để tiến hành nộp báo cáo
              </p>
            </div>
            <span style={{
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '800'
            }}>
              Bước 1 / 2
            </span>
          </div>
          
          {/* Status Notice of Selected Date */}
          <div style={{ marginBottom: '1.75rem' }}>
            {loadingExistingReport ? (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                color: '#1E40AF',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <FaSpinner className="spinner" />
                <span>Đang kiểm tra dữ liệu ngày <strong>{formatDateDDMMYYYY(headerData.reportDate)}</strong>...</span>
              </div>
            ) : existingReportLoaded ? (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#166534', fontWeight: '800', fontSize: '0.95rem' }}>
                  <FaCheckCircle style={{ color: '#16A34A', fontSize: '1.2rem' }} />
                  <span>Đã nạp dữ liệu báo cáo ngày {formatDateDDMMYYYY(headerData.reportDate)}</span>
                </div>
                <p style={{ margin: 0, color: '#15803D', fontSize: '0.86rem', lineHeight: '1.5' }}>
                  Toàn bộ thông tin ca trực và số liệu chuyên môn đã nộp trước đó đã được tải sẵn. Bạn có thể tiếp tục chỉnh sửa hoặc bấm <strong>"Tiếp tục nhập số liệu chuyên môn"</strong> để xem lại.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(true)}
                    style={{
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      borderRadius: '8px',
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
                border: '1.5px solid #BFDBFE',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                color: '#1E40AF',
                fontSize: '0.88rem',
                lineHeight: '1.5'
              }}>
                💡 <strong>Ngày {formatDateDDMMYYYY(headerData.reportDate)} chưa có báo cáo:</strong> Vui lòng chọn Bác sĩ, Điều dưỡng trực bên dưới và bấm <em>"Tiếp tục nhập số liệu chuyên môn ➔"</em> để nộp số liệu giao ban.
              </div>
            )}
          </div>

          {/* Form Fields Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* 1. Ngày báo cáo Card */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #2563EB',
              padding: '1.25rem'
            }}>
              <label style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.92rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaCalendarAlt style={{ color: '#2563EB' }} /> Ngày Trực Giao Ban <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
                  <input 
                    type="date" 
                    value={headerData.reportDate}
                    onChange={(e) => setHeaderData({...headerData, reportDate: e.target.value})}
                    style={{
                      height: '46px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      padding: '0.5rem 0.85rem'
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  📅 <span>{getVietnameseFullDate(headerData.reportDate)}</span>
                </div>
              </div>
            </div>

            {/* 2. Bác sĩ trực ca Card */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #2563EB',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ margin: 0, fontWeight: '800', fontSize: '0.92rem', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaUserMd style={{ color: '#2563EB' }} /> Bác Sĩ Trực Ca ({cleanDoctorNames.length || 0}) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddDoctor}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    padding: '0.35rem 0.85rem',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaPlus /> Thêm Bác sĩ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(headerData.selectedDoctors || ['']).map((docVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: '900',
                      flexShrink: 0
                    }}>
                      BS {idx + 1}
                    </div>
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
                          padding: '0.45rem 0.75rem',
                          height: '42px',
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
              <small style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
                💡 Gợi ý: Bấm nút <strong>"+ Thêm Bác sĩ"</strong> nếu ca trực có từ 2 Bác sĩ trở lên.
              </small>
            </div>

            {/* 3. Điều dưỡng trực ca Card */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #059669',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ margin: 0, fontWeight: '800', fontSize: '0.92rem', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaUserNurse style={{ color: '#059669' }} /> Điều Dưỡng Trực Ca ({(headerData.selectedNurses || []).length || 0})
                </label>
                <button
                  type="button"
                  onClick={handleAddNurse}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    padding: '0.35rem 0.85rem',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    color: '#166534',
                    backgroundColor: '#F0FDF4',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaPlus /> Thêm điều dưỡng
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(headerData.selectedNurses || ['']).map((nurseVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: '900',
                      flexShrink: 0
                    }}>
                      ĐD {idx + 1}
                    </div>
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
                          padding: '0.45rem 0.75rem',
                          height: '42px',
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
              <small style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
                💡 Gợi ý: Bấm nút <strong>"+ Thêm điều dưỡng"</strong> nếu ca trực có từ 2 điều dưỡng trở lên.
              </small>
            </div>

            {/* 4. Nhân sự trực thêm giờ / Tăng cường Card */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #D97706',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ margin: 0, fontWeight: '800', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem' }}>
                  <FaClock style={{ color: '#D97706' }} /> Nhân Sự Trực Thêm Giờ / Tăng Cường ({(headerData.overtimeStaff || []).length})
                </label>
                <button
                  type="button"
                  onClick={handleAddOvertimeStaff}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    padding: '0.35rem 0.85rem',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    backgroundColor: '#FFFBEB',
                    color: '#92400E',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <FaPlus /> Thêm tăng cường
                </button>
              </div>

              {(headerData.overtimeStaff || []).length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.86rem', fontStyle: 'italic', margin: 0 }}>
                  Chưa có nhân sự trực thêm giờ (Bấm nút trên nếu ca trực có nhân sự tăng cường ngoài giờ).
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(headerData.overtimeStaff || []).map((ot, idx) => (
                    <div 
                      key={ot.id || idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.4fr 1fr auto', 
                        gap: '0.6rem', 
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
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
                          <FaClock style={{ position: 'absolute', top: '50%', left: '0.65rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
                          <input
                            type="text"
                            placeholder="VD: 17h - 21h"
                            value={ot.time}
                            onChange={(e) => handleOvertimeChange(idx, 'time', e.target.value)}
                            style={{ paddingLeft: '1.9rem', fontSize: '0.88rem', height: '42px', borderRadius: '8px' }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOvertimeStaff(idx)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          height: '42px',
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
                <label style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaDoorOpen style={{ color: '#2563EB' }} /> Phòng / Buồng Trực <span style={{ fontWeight: 'normal', color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="VD: Phòng cấp cứu, Khu điều trị..."
                  value={headerData.room || ''}
                  onChange={(e) => setHeaderData({...headerData, room: e.target.value})}
                  style={{ height: '46px', borderRadius: '10px' }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaClock style={{ color: '#2563EB' }} /> Thời Gian Ca Trực <span style={{ fontWeight: 'normal', color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="VD: 07h00 - 07h00 (24/24)"
                  value={headerData.shiftTime || ''}
                  onChange={(e) => setHeaderData({...headerData, shiftTime: e.target.value})}
                  style={{ height: '46px', borderRadius: '10px' }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #F1F5F9', paddingTop: '1.5rem' }}>
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
                padding: '0.95rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: '900',
                borderRadius: '12px',
                cursor: cleanDoctorNames.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: cleanDoctorNames.length === 0 ? 'none' : '0 8px 24px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              Tiếp Tục Nhập Số Liệu Chuyên Môn <FaArrowRight />
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 5. STEP 2: SỐ LIỆU & CA BỆNH (BANNER KHOA RÕ RÀNG, CHUYÊN NGHIỆP) */
        /* ======================================================== */
        <div className="animate-slide-up">
          {/* Department Hero Banner */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #BFDBFE',
            padding: '1.25rem 1.75rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                flexShrink: 0
              }}>
                <FaClipboardList />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BIỂU MẪU BÁO CÁO GIAO BAN CHUYÊN MÔN
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59', margin: '2px 0 0 0' }}>
                  {user?.departmentName}
                </h2>
              </div>
            </div>

            {/* Shift Context Badges & Switch Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: '#334155',
                display: 'flex',
                gap: '0.85rem',
                flexWrap: 'wrap',
                fontWeight: '600'
              }}>
                <span>📅 <strong>Ngày:</strong> {formatDateDDMMYYYY(headerData.reportDate)}</span>
                <span>👨‍⚕️ <strong>BS:</strong> <span style={{ color: '#1E40AF' }}>{finalDoctorNameStr || cleanDoctorName}</span></span>
                {finalNurseNameStr && <span>👩‍⚕️ <strong>ĐD:</strong> <span style={{ color: '#065F46' }}>{finalNurseNameStr}</span></span>}
              </div>

              <button 
                type="button"
                onClick={() => setStep(1)}
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '10px',
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <FaEdit /> Sửa hành chính
              </button>
            </div>
          </div>

          {/* Dynamic Department Form Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 6px 24px rgba(15, 44, 89, 0.04)'
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
              border: '1.5px solid #FECACA',
              borderRadius: '12px',
              padding: '1rem 1.35rem',
              color: '#991B1B',
              fontSize: '0.92rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FaExclamationCircle style={{ fontSize: '1.2rem' }} />
                <span>{submitError}</span>
              </div>
              <button type="button" onClick={() => setSubmitError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          {/* Bottom Floating/Fixed Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem 0 3rem',
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
                padding: '0.95rem 1.65rem',
                fontSize: '1rem',
                fontWeight: '800',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
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
                padding: '0.95rem 1.85rem',
                fontSize: '1rem',
                fontWeight: '800',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <FaFilePdf style={{ fontSize: '1.15rem' }} /> Xem Trước & Xuất PDF
            </button>

            {/* Main Submit Button */}
            {isLocked ? (
              <button 
                type="button"
                disabled
                style={{
                  backgroundColor: '#94A3B8',
                  color: '#FFFFFF',
                  padding: '0.95rem 2.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '900',
                  borderRadius: '12px',
                  cursor: 'not-allowed',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem'
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
                  padding: '0.95rem 2.85rem',
                  fontSize: '1.1rem',
                  fontWeight: '900',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 8px 24px rgba(22, 163, 74, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <FaCheckCircle style={{ fontSize: '1.25rem' }} /> NỘP BÁO CÁO GIAO BAN NGAY
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
            <div style={{ fontSize: '0.94rem', color: '#334155', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.85rem' }}>
                Báo cáo của khoa sẽ được lưu vào hệ thống dữ liệu toàn viện và đưa vào <strong>Trình Chiếu Giao Ban Sáng</strong> phục vụ Ban Giám Đốc.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem' }}>
                <div>👨‍⚕️ <strong>Bác sĩ trực:</strong> {finalDoctorNameStr || cleanDoctorName}</div>
                {cleanNurseNames.length > 0 && <div style={{ marginTop: '4px' }}>👩‍⚕️ <strong>Điều dưỡng:</strong> {cleanNurseNames.join(', ')}</div>}
                <div style={{ marginTop: '4px' }}>📋 <strong>Số ca lâm sàng:</strong> {transferCases.length} chuyển viện • {surgeryCases.length} ca mổ • {deathCases.length} tử vong • {criticalCases.length} bệnh nặng</div>
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
