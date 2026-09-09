import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress,
  FaSpinner, FaSearchPlus, FaSearchMinus,
  FaArrowLeft, FaFileAlt, FaUserMd, FaListUl, FaTimes, FaBars,
  FaHospital, FaAmbulance, FaProcedures, FaHeartbeat, FaSkullCrossbones,
  FaClipboardList, FaDoorOpen, FaHandHoldingHeart,
  FaChevronDown, FaChevronUp, FaSearch
} from 'react-icons/fa';
import reportService from '../services/reportService';
import ImageLightboxModal from '../components/common/ImageLightboxModal';
import MedicalLoader from '../components/common/MedicalLoader';

// Shared Constants & Formatters
import { DEPARTMENT_ORDER, DEPARTMENT_NAMES, DEPARTMENT_THEMES } from '../constants/medicalDictionary';
import { normalizeImages, formatDate } from '../utils/medicalFormatters';
import { parseDepartmentSections } from '../utils/departmentSectionParser';

// Modular Slide Components
import TitleSlide from '../components/presentation/slides/TitleSlide';
import DepartmentIntroSlide from '../components/presentation/slides/DepartmentIntroSlide';
import DepartmentSlide from '../components/presentation/slides/DepartmentSlide';
import ClinicalCasesOverviewSlide from '../components/presentation/slides/ClinicalCasesOverviewSlide';
import TransferSlide from '../components/presentation/slides/TransferSlide';
import SurgerySlide from '../components/presentation/slides/SurgerySlide';
import DeathSlide from '../components/presentation/slides/DeathSlide';
import CriticalSlide from '../components/presentation/slides/CriticalSlide';
import FullScreenImageSlide from '../components/presentation/slides/FullScreenImageSlide';
import SummarySlide from '../components/presentation/slides/SummarySlide';
import ClosingSlide from '../components/presentation/slides/ClosingSlide';
import CinematicNetflixIntro from '../components/presentation/CinematicNetflixIntro';

// AI Voice Narrator & Synchronizer
import AIVoicePresenterControl from '../components/presentation/AIVoicePresenterControl';
import voiceNarrationService from '../services/voiceNarrationService';
import generateSlideNarrationScript from '../services/slideScriptGenerator';

const parseMetricNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    const first = parseFloat(parts[0].trim());
    return isNaN(first) ? 0 : first;
  }
  const parsed = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const extractDepartmentPatientCount = (rawData, deptCode = '') => {
  if (!rawData || typeof rawData !== 'object') return 0;
  const code = (deptCode || '').toLowerCase();

  // 1. HSCC - TNT
  if (code.includes('hscc') || (rawData.hscc && rawData.tnt)) {
    const hsccKham = parseMetricNum(rawData.hscc?.tongSoKham || rawData.hscc?.tongSo || rawData.hscc?.benhMoi);
    const tntKham = parseMetricNum(rawData.tnt?.tongSoKham || rawData.tnt?.tnt_ctdk || rawData.tnt?.ctdk || rawData.tnt?.tnt_benhMoi);
    const pk21Kham = parseMetricNum(rawData.pk21?.pk21_tongSo || rawData.pk21?.pk21_tongSoKham || rawData.pk21?.tongSo || rawData.pk21?.pk21_ngoaiTru);
    const sum = hsccKham + tntKham + pk21Kham;
    if (sum > 0) return sum;
  }

  // 2. LCK (Liên Chuyên Khoa)
  if (code.includes('lck') || rawData.tong4ck_tongSo !== undefined || rawData.tmh_tongSo !== undefined) {
    if (rawData.tong4ck_tongSo) return parseMetricNum(rawData.tong4ck_tongSo);
    const sum = parseMetricNum(rawData.tmh_tongSo) + parseMetricNum(rawData.mat_tongSo) + parseMetricNum(rawData.rhm_noi_tongSo) + parseMetricNum(rawData.daLieu_tongSo) + parseMetricNum(rawData.nhapVien_tongSo);
    if (sum > 0) return sum;
  }

  // 3. CDHA (Chẩn Đoán Hình Ảnh)
  if (code.includes('cdha') || Array.isArray(rawData.techniques)) {
    if (Array.isArray(rawData.techniques) && rawData.techniques.length > 0) {
      return rawData.techniques.reduce((acc, t) => acc + parseMetricNum(t?.tongSo), 0);
    }
    if (rawData.tongSo) return parseMetricNum(rawData.tongSo);
  }

  // 4. XN (Xét Nghiệm)
  if (code.includes('xn') || rawData.tongXetNghiem) {
    return parseMetricNum(rawData.tongSo || rawData.tongXetNghiem);
  }

  // 5. GMHS (Gây Mê Hồi Sức)
  if (code.includes('gmhs') || rawData.tongSoCaMo) {
    return parseMetricNum(rawData.tongSoCaMo || rawData.soCaGayMe || 0);
  }

  // 6. Khoa Nhi
  if (code.includes('nhi')) {
    const pk = parseMetricNum(rawData.pk || rawData.tongSoKham || rawData.soCaKham);
    const bm = parseMetricNum(rawData.benhMoi || rawData.benhMoi_cc || rawData.benhMoi_pk);
    return pk > 0 ? pk : bm;
  }

  // 7. Khoa Sản
  if (code.includes('san')) {
    const tk = parseMetricNum(rawData.tongSoKham || rawData.soCaKham);
    const bm = parseMetricNum(rawData.benhMoi || rawData.sanhThuong);
    return tk > 0 ? tk : bm;
  }

  // 8. Các khoa lâm sàng khác (Nội, Nhiễm, Ngoại TH, CTCH, YHCT-PHCN)
  const directKham = parseMetricNum(rawData.tongSoKham || rawData.soCaKham || rawData.tongSo || rawData.tong_so || rawData.tongSoCa);
  if (directKham > 0) return directKham;

  return parseMetricNum(rawData.benhMoi || 0);
};

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeThumbRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState({});
  const [drawerSearch, setDrawerSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [fontScale, setFontScale] = useState(1);

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // AI Voice Narrator & Auto-Slide State
  const [aiVoiceActive, setAiVoiceActive] = useState(false);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [transitionDelay, setTransitionDelay] = useState(1500);
  const [currentScript, setCurrentScript] = useState('');
  const voiceTimeoutRef = useRef(null);

  // Dynamic Controls Visibility State (Auto-hide after 2s of inactivity when in AI voice mode)
  const [showControls, setShowControls] = useState(true);
  const controlsIdleTimerRef = useRef(null);

  // Top-left controls hover visibility state (Only show Slide List & AI Voice button when mouse hovers top-left corner)
  const [isTopLeftHovered, setIsTopLeftHovered] = useState(false);

  useEffect(() => {
    setIsTopLeftHovered(false);
  }, [currentSlide]);

  const registerUserActivity = () => {
    setShowControls(true);
    if (controlsIdleTimerRef.current) {
      clearTimeout(controlsIdleTimerRef.current);
    }
    if (aiVoiceActive) {
      controlsIdleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (aiVoiceActive) {
      registerUserActivity();
      const events = ['mousemove', 'mousedown', 'click', 'touchstart', 'keydown'];
      const onActivity = () => registerUserActivity();
      events.forEach(ev => window.addEventListener(ev, onActivity));
      return () => {
        events.forEach(ev => window.removeEventListener(ev, onActivity));
        if (controlsIdleTimerRef.current) clearTimeout(controlsIdleTimerRef.current);
      };
    } else {
      setShowControls(true);
      if (controlsIdleTimerRef.current) clearTimeout(controlsIdleTimerRef.current);
    }
  }, [aiVoiceActive]);

  const handleOpenLightbox = (images, index = 0, title = 'Hình ảnh y khoa') => {
    const norm = normalizeImages(images);
    if (norm.length > 0) {
      setLightboxImages(norm);
      setLightboxIndex(index);
      setLightboxTitle(title);
      setLightboxOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await reportService.getPresentationData(date);
        setReports(response.data || []);
      } catch (err) {
        console.error('Failed to load presentation data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // Smooth scroll active slide into view in sidebar drawer
  useEffect(() => {
    if (showSidebar) {
      activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentSlide, showSidebar]);

  // Reset scroll container to top whenever slide changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSlide]);

  // Build slides with official department order, intro, clinical cases, summary, and closing slides
  const slides = useMemo(() => {
    const s = [{ type: 'title', title: 'BÁO CÁO GIAO BAN' }];

    const sortedReports = [...reports].sort((a, b) => {
      const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
      const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

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

    let totalKham = 0, totalBenhCu = 0, totalBenhMoi = 0, totalXuatVien = 0;
    let totalChuyenVien = 0, totalPhauThuat = 0, totalBenhNang = 0, totalHienCon = 0, totalTuVong = 0;

    sortedReports.forEach(r => {
      const deptName = DEPARTMENT_NAMES[r.department_code] || r.department_code;
      const theme = DEPARTMENT_THEMES[r.department_code] || { primary: '#0F2C59', secondary: '#1E40AF', light: '#EFF6FF' };
      const rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data || '{}') : (r.report_data || {});

      const rawTransfers = safeCaseArray(r.transfer_cases || rawData.transfer_cases || rawData.transferCases);
      const rawSurgeries = safeCaseArray(r.surgery_cases || rawData.surgery_cases || rawData.surgeryCases);
      const rawDeaths = safeCaseArray(r.death_cases || rawData.death_cases || rawData.deathCases);
      const rawCriticals = safeCaseArray(r.critical_cases || rawData.critical_cases || rawData.criticalCases);

      const transferCases = rawTransfers.map(c => ({
        ...c,
        patientName: c.patientName || c.patient_name || '',
        patient_name: c.patientName || c.patient_name || '',
        admissionTime: c.admissionTime || c.admission_time || '',
        admission_time: c.admissionTime || c.admission_time || '',
        initialTreatment: c.initialTreatment || c.initial_treatment || '',
        initial_treatment: c.initialTreatment || c.initial_treatment || '',
        clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinicalTests: c.clinicalTests || c.clinical_tests || '',
        clinical_tests: c.clinicalTests || c.clinical_tests || '',
        progressNotes: c.progressNotes || c.progress_notes || '',
        progress_notes: c.progressNotes || c.progress_notes || '',
        images: normalizeImages(c.images || c.image_url || c.imageUrl)
      }));

      const surgeryCases = rawSurgeries.map(c => ({
        ...c,
        patientName: c.patientName || c.patient_name || '',
        patient_name: c.patientName || c.patient_name || '',
        birthYear: c.birthYear || c.birth_year || c.age || '',
        birth_year: c.birthYear || c.birth_year || c.age || '',
        admissionTime: c.admissionTime || c.admission_time || '',
        admission_time: c.admissionTime || c.admission_time || '',
        clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinicalTests: c.clinicalTests || c.clinical_tests || '',
        clinical_tests: c.clinicalTests || c.clinical_tests || '',
        preoperativeDiagnosis: c.preoperativeDiagnosis || c.preoperative_diagnosis || '',
        preoperative_diagnosis: c.preoperativeDiagnosis || c.preoperative_diagnosis || '',
        consultationOrder: c.consultationOrder || c.consultation_order || '',
        consultation_order: c.consultationOrder || c.consultation_order || '',
        postoperativeDiagnosis: c.postoperativeDiagnosis || c.postoperative_diagnosis || '',
        postoperative_diagnosis: c.postoperativeDiagnosis || c.postoperative_diagnosis || '',
        currentStatus: c.currentStatus || c.current_status || '',
        current_status: c.currentStatus || c.current_status || '',
        images: normalizeImages(c.images || c.image_url || c.imageUrl)
      }));

      const deathCases = rawDeaths.map(c => ({
        ...c,
        patientName: c.patientName || c.patient_name || '',
        patient_name: c.patientName || c.patient_name || '',
        admissionTime: c.admissionTime || c.admission_time || '',
        admission_time: c.admissionTime || c.admission_time || '',
        admissionStatus: c.admissionStatus || c.admission_status || '',
        admission_status: c.admissionStatus || c.admission_status || '',
        medicalHistory: c.medicalHistory || c.medical_history || '',
        medical_history: c.medicalHistory || c.medical_history || '',
        clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinicalTests: c.clinicalTests || c.clinical_tests || '',
        clinical_tests: c.clinicalTests || c.clinical_tests || '',
        emergencyTreatment: c.emergencyTreatment || c.emergency_treatment || '',
        emergency_treatment: c.emergencyTreatment || c.emergency_treatment || '',
        finalOutcome: c.finalOutcome || c.final_outcome || '',
        final_outcome: c.finalOutcome || c.final_outcome || '',
        images: normalizeImages(c.images || c.image_url || c.imageUrl)
      }));

      const criticalCases = rawCriticals.map(c => ({
        ...c,
        patientName: c.patientName || c.patient_name || '',
        patient_name: c.patientName || c.patient_name || '',
        admissionTime: c.admissionTime || c.admission_time || '',
        admission_time: c.admissionTime || c.admission_time || '',
        medicalHistory: c.medicalHistory || c.medical_history || '',
        medical_history: c.medicalHistory || c.medical_history || '',
        clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinicalTests: c.clinicalTests || c.clinical_tests || '',
        clinical_tests: c.clinicalTests || c.clinical_tests || '',
        conditionSummary: c.conditionSummary || c.condition_summary || '',
        condition_summary: c.conditionSummary || c.condition_summary || '',
        treatment: c.treatment || '',
        notes: c.notes || '',
        images: normalizeImages(c.images || c.image_url || c.imageUrl)
      }));

      // Accumulate totals for hospital-wide summary & title slide
      totalKham += extractDepartmentPatientCount(rawData, r.department_code);
      totalBenhCu += parseMetricNum(rawData.benhCu || rawData.hscc?.benhCu || rawData.tnt?.tnt_benhCu || 0);
      totalBenhMoi += parseMetricNum(rawData.benhMoi || rawData.hscc?.benhMoi || rawData.tnt?.tnt_benhMoi || 0);
      totalXuatVien += parseMetricNum(rawData.xuatVien || rawData.hscc?.xuatVien || rawData.tnt?.tnt_xuatVien || 0);
      totalChuyenVien += transferCases.length || parseMetricNum(rawData.chuyenVien || rawData.hscc?.chuyenVien || rawData.tnt?.tnt_chuyenVien || 0);
      totalPhauThuat += surgeryCases.length || parseMetricNum(rawData.tongSoCaMo || rawData.phauThuat || 0);
      totalTuVong += deathCases.length || parseMetricNum(rawData.tuVong || rawData.hscc?.tuVong || 0);
      totalBenhNang += criticalCases.length;
      totalHienCon += parseMetricNum(rawData.hienCon || rawData.hienCo || rawData.hscc?.hienCon || rawData.tnt?.tnt_hienCon || 0);

      // =========================================================================
      // 1. DEPARTMENT INTRO SLIDE (Mở đầu trang trọng, tinh gọn cho mỗi khoa)
      // =========================================================================
      s.push({
        type: 'dept_intro',
        title: `GIỚI THIỆU CA TRỰC — ${deptName}`,
        deptCode: r.department_code,
        deptName,
        theme,
        report: r,
        reportDate: date || r.report_date,
        doctorName: r.doctor_name,
        nurseName: r.nurse_name,
        overtimeStaff: r.overtime_staff,
        room: r.room,
        shiftTime: r.shift_time,
        formData: rawData,
        transferCases,
        surgeryCases,
        deathCases,
        criticalCases
      });

      // =========================================================================
      // 2. DEPARTMENT DATA SLIDES
      // Tách riêng các slide to rõ cho HSCC-TNT và YHCT-PHCN
      // =========================================================================
      const isHsccTnt = (r.department_code || '').toLowerCase() === 'hscc_tnt' || (rawData.hscc && rawData.tnt);
      const isYhctPhcn = (r.department_code || '').toLowerCase() === 'yhct_phcn' || (rawData.noiTru && rawData.ngoaiTru && rawData.keToa);

      if (isHsccTnt) {
        const hsccSections = parseDepartmentSections(rawData, r.department_code);
        
        // Slide 2.1: Tổng Số Khám (HSCC • TNT • PK 21)
        const secTongKham = hsccSections.find(sec => sec.title?.includes('TỔNG SỐ KHÁM'));
        if (secTongKham) {
          s.push({
            type: 'department',
            title: `${deptName} – TỔNG SỐ KHÁM`,
            subTitle: 'TỔNG SỐ KHÁM (HSCC • TNT • PHÒNG KHÁM 21)',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secTongKham],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.2: Khối Hồi Sức Cấp Cứu (HSCC)
        const secHSCC = hsccSections.find(sec => sec.title?.includes('HỒI SỨC CẤP CỨU'));
        if (secHSCC) {
          s.push({
            type: 'department',
            title: `${deptName} – KHỐI HỒI SỨC CẤP CỨU`,
            subTitle: 'KHỐI HỒI SỨC CẤP CỨU (HSCC)',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secHSCC],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.3: Khối Thận Nhân Tạo (TNT)
        const secTNT = hsccSections.find(sec => sec.title?.includes('THẬN NHÂN TẠO'));
        if (secTNT) {
          s.push({
            type: 'department',
            title: `${deptName} – KHỐI THẬN NHÂN TẠO`,
            subTitle: 'KHỐI THẬN NHÂN TẠO (TNT)',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secTNT],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.4: Ghi chú / Diễn biến thêm giờ (nếu có)
        const otherSections = hsccSections.filter(sec => 
          !sec.title?.includes('TỔNG SỐ KHÁM') &&
          !sec.title?.includes('HỒI SỨC CẤP CỨU') &&
          !sec.title?.includes('THẬN NHÂN TẠO')
        );
        if (otherSections.length > 0) {
          s.push({
            type: 'department',
            title: `${deptName} – GHI CHÚ & THÊM GIỜ`,
            subTitle: 'GHI CHÚ & THÊM GIỜ CA TRỰC',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: otherSections,
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }
      } else if (isYhctPhcn) {
        const yhctSections = parseDepartmentSections(rawData, r.department_code);

        // Slide 2.1: Điều Trị Nội Trú
        const secNoiTru = yhctSections.find(sec => sec.title?.includes('NỘI TRÚ'));
        if (secNoiTru) {
          s.push({
            type: 'department',
            title: `${deptName} – ĐIỀU TRỊ NỘI TRÚ`,
            subTitle: 'KHỐI ĐIỀU TRỊ NỘI TRÚ',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secNoiTru],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.2: Điều Trị Ngoại Trú
        const secNgoaiTru = yhctSections.find(sec => sec.title?.includes('NGOẠI TRÚ'));
        if (secNgoaiTru) {
          s.push({
            type: 'department',
            title: `${deptName} – ĐIỀU TRỊ NGOẠI TRÚ`,
            subTitle: 'KHỐI ĐIỀU TRỊ NGOẠI TRÚ',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secNgoaiTru],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.3: Kê Toa & BHYT
        const secKeToa = yhctSections.find(sec => sec.title?.includes('KÊ TOA'));
        if (secKeToa) {
          s.push({
            type: 'department',
            title: `${deptName} – KÊ TOA & BHYT`,
            subTitle: 'KÊ TOA & BẢO HIỂM Y TẾ (BHYT)',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: [secKeToa],
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }

        // Slide 2.4: Ghi chú / Thêm giờ (nếu có)
        const otherSections = yhctSections.filter(sec => 
          !sec.title?.includes('NỘI TRÚ') &&
          !sec.title?.includes('NGOẠI TRÚ') &&
          !sec.title?.includes('KÊ TOA')
        );
        if (otherSections.length > 0) {
          s.push({
            type: 'department',
            title: `${deptName} – GHI CHÚ & THÊM GIỜ`,
            subTitle: 'GHI CHÚ & THÊM GIỜ CA TRỰC',
            deptCode: r.department_code,
            deptName,
            theme,
            report: r,
            sections: otherSections,
            doctorName: r.doctor_name,
            nurseName: r.nurse_name,
            overtimeStaff: r.overtime_staff,
            room: r.room,
            shiftTime: r.shift_time,
            formData: rawData,
            transferCases,
            surgeryCases,
            deathCases,
            criticalCases
          });
        }
      } else {
        // Standard Department Slide
        const deptSections = parseDepartmentSections(rawData, r.department_code);
        s.push({
          type: 'department',
          title: deptName,
          deptCode: r.department_code,
          deptName,
          theme,
          report: r,
          sections: deptSections,
          doctorName: r.doctor_name,
          nurseName: r.nurse_name,
          overtimeStaff: r.overtime_staff,
          room: r.room,
          shiftTime: r.shift_time,
          formData: rawData,
          transferCases,
          surgeryCases,
          deathCases,
          criticalCases
        });
      }

      // =========================================================================
      // 3. CLINICAL CASES OVERVIEW SLIDE (CHỈ XUẤT HIỆN KHI KHOA CÓ CA LÂM SÀNG)
      // =========================================================================
      const hasClinicalCases = transferCases.length > 0 || surgeryCases.length > 0 || criticalCases.length > 0 || deathCases.length > 0;
      if (hasClinicalCases) {
        s.push({
          type: 'clinical_overview',
          title: `CÁC CA BỆNH LÂM SÀNG TẠI KHOA – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          transferCases,
          surgeryCases,
          criticalCases,
          deathCases,
          totalCases: transferCases.length + surgeryCases.length + criticalCases.length + deathCases.length
        });
      }

      // =========================================================================
      // 4. DETAILED CASE SLIDES (TRANSFER, SURGERY, DEATH, CRITICAL, IMAGES)
      // =========================================================================

      // 4.1 Transfer Case Slides
      transferCases.forEach((tc, tcIdx) => {
        s.push({
          type: 'transfer',
          title: `CA CHUYỂN VIỆN ${tcIdx + 1} (TIẾP NHẬN & XỬ TRÍ) – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          transferCase: tc,
          caseIndex: tcIdx + 1,
          totalCases: transferCases.length
        });

        if (tc.clinical_symptoms || tc.clinicalSymptoms || tc.clinical_tests || tc.clinicalTests) {
          s.push({
            type: 'transfer_clinical',
            title: `CA CHUYỂN VIỆN ${tcIdx + 1} (LÂM SÀNG & CLS) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            transferCase: tc,
            caseIndex: tcIdx + 1,
            totalCases: transferCases.length
          });
        }

        if (tc.progress_notes || tc.progressNotes) {
          s.push({
            type: 'transfer_progress',
            title: `DIỄN BIẾN CHUYỂN VIỆN ${tcIdx + 1} – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            transferCase: tc,
            caseIndex: tcIdx + 1,
            totalCases: transferCases.length
          });
        }

        const normImgs = normalizeImages(tc.images);
        normImgs.forEach((imgObj, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA CHUYỂN VIỆN ${tcIdx + 1} (${imgIdx + 1}/${normImgs.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            caseType: 'transfer',
            caseItem: tc,
            image: imgObj,
            imgIndex: imgIdx + 1,
            totalImages: normImgs.length
          });
        });
      });

      // 4.2 Surgery Case Slides
      surgeryCases.forEach((sc, scIdx) => {
        s.push({
          type: 'surgery',
          title: `CA PHẪU THUẬT ${scIdx + 1} (CHẨN ĐOÁN & LỆNH MỔ) – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          surgeryCase: sc,
          caseIndex: scIdx + 1,
          totalCases: surgeryCases.length
        });

        if (sc.clinical_symptoms || sc.clinicalSymptoms || sc.clinical_tests || sc.clinicalTests) {
          s.push({
            type: 'surgery_clinical',
            title: `CA PHẪU THUẬT ${scIdx + 1} (LÂM SÀNG & CLS) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            surgeryCase: sc,
            caseIndex: scIdx + 1,
            totalCases: surgeryCases.length
          });
        }

        const normImgs = normalizeImages(sc.images);
        normImgs.forEach((imgObj, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA PHẪU THUẬT ${scIdx + 1} (${imgIdx + 1}/${normImgs.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            caseType: 'surgery',
            caseItem: sc,
            image: imgObj,
            imgIndex: imgIdx + 1,
            totalImages: normImgs.length
          });
        });
      });

      // 4.3 Mortality / Death Case Slides
      deathCases.forEach((dc, dcIdx) => {
        s.push({
          type: 'death',
          title: `CA TỬ VONG ${dcIdx + 1} (CHẨN ĐOÁN & CẤP CỨU) – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          deathCase: dc,
          caseIndex: dcIdx + 1,
          totalCases: deathCases.length
        });

        if (dc.clinical_symptoms || dc.clinicalSymptoms || dc.clinical_tests || dc.clinicalTests || dc.medical_history || dc.medicalHistory) {
          s.push({
            type: 'death_clinical',
            title: `CA TỬ VONG ${dcIdx + 1} (TIỀN SỬ, LÂM SÀNG & ECG) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            deathCase: dc,
            caseIndex: dcIdx + 1,
            totalCases: deathCases.length
          });
        }

        const normImgs = normalizeImages(dc.images);
        normImgs.forEach((imgObj, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA TỬ VONG ${dcIdx + 1} (${imgIdx + 1}/${normImgs.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            caseType: 'death',
            caseItem: dc,
            image: imgObj,
            imgIndex: imgIdx + 1,
            totalImages: normImgs.length
          });
        });
      });

      // 4.4 Critical Care Case Slides
      criticalCases.forEach((cc, ccIdx) => {
        s.push({
          type: 'critical',
          title: `CA BỆNH NẶNG ${ccIdx + 1} (CHẨN ĐOÁN & XỬ TRÍ) – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          criticalCase: cc,
          caseIndex: ccIdx + 1,
          totalCases: criticalCases.length
        });

        if (cc.clinical_symptoms || cc.clinicalSymptoms || cc.clinical_tests || cc.clinicalTests || cc.medical_history || cc.medicalHistory) {
          s.push({
            type: 'critical_clinical',
            title: `CA BỆNH NẶNG ${ccIdx + 1} (LÂM SÀNG & XÉT NGHIỆM) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            criticalCase: cc,
            caseIndex: ccIdx + 1,
            totalCases: criticalCases.length
          });
        }

        const normImgs = normalizeImages(cc.images);
        normImgs.forEach((imgObj, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA BỆNH NẶNG ${ccIdx + 1} (${imgIdx + 1}/${normImgs.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            caseType: 'critical',
            caseItem: cc,
            image: imgObj,
            imgIndex: imgIdx + 1,
            totalImages: normImgs.length
          });
        });
      });
    });

    // Attach aggregated summary metrics to Slide 1 (Title Slide)
    const summaryData = {
      tongSoKham: totalKham,
      benhCu: totalBenhCu,
      benhMoi: totalBenhMoi,
      xuatVien: totalXuatVien,
      chuyenVien: totalChuyenVien,
      phauThuat: totalPhauThuat,
      benhNang: totalBenhNang,
      hienCon: totalHienCon,
      tuVong: totalTuVong
    };

    if (s.length > 0 && s[0].type === 'title') {
      s[0].summary = summaryData;
      s[0].reportsCount = sortedReports.length;
    }

    // 5. Hospital-Wide Summary Slide
    if (sortedReports.length > 0) {
      s.push({
        type: 'summary',
        title: 'TỔNG HỢP TOÀN VIỆN',
        summary: summaryData,
        totalDepts: 12,
        submittedCount: sortedReports.length,
        reports: sortedReports
      });
    }

    // 6. Final Farewell & Thank You Slide at the very end
    s.push({
      type: 'closing',
      title: 'BẾ MẠC & CẢM ƠN',
      selectedDate: date
    });

    return s;
  }, [reports, date]);

  const slide = slides[currentSlide] || slides[0] || { type: 'title', title: 'BÁO CÁO GIAO BAN' };

  // =========================================================================
  // 12 DEPARTMENTS ACCORDION SLIDE GROUPS LOGIC
  // =========================================================================
  const slideGroups = useMemo(() => {
    // 1. Intro Slide (Title Slide)
    const introSlide = slides.length > 0 && slides[0].type === 'title'
      ? { slide: slides[0], index: 0 }
      : null;

    // 2. 12 Official Departments (Strictly ordered by DEPARTMENT_ORDER)
    const deptGroups = DEPARTMENT_ORDER.map((code, orderIdx) => {
      const deptName = DEPARTMENT_NAMES[code] || code;
      const theme = DEPARTMENT_THEMES[code] || { main: '#0F2C59', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

      const deptSlides = [];
      slides.forEach((s, idx) => {
        if (s.deptCode === code) {
          deptSlides.push({ slide: s, index: idx });
        }
      });

      return {
        code,
        orderIdx: orderIdx + 1,
        name: deptName,
        theme,
        slides: deptSlides,
        isSubmitted: deptSlides.length > 0,
        hasActiveSlide: deptSlides.some(item => item.index === currentSlide),
        slideCount: deptSlides.length
      };
    });

    // 3. Catch any unexpected department code that submitted report
    const knownCodes = new Set(DEPARTMENT_ORDER);
    const extraMap = new Map();
    slides.forEach((s, idx) => {
      if (s.deptCode && !knownCodes.has(s.deptCode)) {
        if (!extraMap.has(s.deptCode)) extraMap.set(s.deptCode, []);
        extraMap.get(s.deptCode).push({ slide: s, index: idx });
      }
    });

    extraMap.forEach((extraSlides, extraCode) => {
      deptGroups.push({
        code: extraCode,
        orderIdx: deptGroups.length + 1,
        name: extraSlides[0]?.slide?.deptName || extraCode,
        theme: { main: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', icon: '📋' },
        slides: extraSlides,
        isSubmitted: true,
        hasActiveSlide: extraSlides.some(item => item.index === currentSlide),
        slideCount: extraSlides.length
      });
    });

    // 4. Ending Slides (Hospital-Wide Summary & Closing Slide)
    const endSlides = [];
    slides.forEach((s, idx) => {
      if (s.type === 'summary' || s.type === 'closing') {
        endSlides.push({ slide: s, index: idx });
      }
    });

    return { introSlide, deptGroups, endSlides };
  }, [slides, currentSlide]);

  // Auto-expand current active slide's department whenever currentSlide changes (Single focus mode)
  useEffect(() => {
    const activeSlide = slides[currentSlide];
    if (activeSlide && activeSlide.deptCode) {
      setExpandedDepts({ [activeSlide.deptCode]: true });
    }
  }, [currentSlide]);

  const toggleDept = (code) => {
    setExpandedDepts(prev => {
      const isAlreadyOpen = !!prev[code];
      if (isAlreadyOpen) {
        return {};
      }
      return { [code]: true };
    });
  };

  const expandAllDepts = () => {
    const all = {};
    slideGroups.deptGroups.forEach(g => {
      if (g.isSubmitted) all[g.code] = true;
    });
    setExpandedDepts(all);
  };

  const collapseAllDepts = () => {
    setExpandedDepts({});
  };

  const getSlideSubLabel = (s) => {
    switch (s.type) {
      case 'title':
        return 'Báo cáo giao ban toàn viện';
      case 'dept_intro':
        return 'Giới thiệu ca trực & Nhân sự';
      case 'department':
        return s.subTitle || s.title || 'Số liệu chuyên môn';
      case 'clinical_overview':
        return `Tổng hợp ca bệnh lâm sàng (${s.totalCases || 0} ca)`;
      case 'transfer': {
        const pName = s.transferCase?.patient_name || s.transferCase?.patientName;
        return `Ca chuyển viện ${s.caseIndex}${pName ? `: ${pName}` : ''} (Tiếp nhận)`;
      }
      case 'transfer_clinical':
        return `Ca chuyển viện ${s.caseIndex} (Lâm sàng & CLS)`;
      case 'transfer_progress':
        return `Ca chuyển viện ${s.caseIndex} (Diễn biến & Chuyển)`;
      case 'surgery': {
        const pName = s.surgeryCase?.patient_name || s.surgeryCase?.patientName;
        return `Ca phẫu thuật ${s.caseIndex}${pName ? `: ${pName}` : ''} (Lệnh mổ)`;
      }
      case 'surgery_clinical':
        return `Ca phẫu thuật ${s.caseIndex} (Lâm sàng & CLS)`;
      case 'critical': {
        const pName = s.criticalCase?.patient_name || s.criticalCase?.patientName;
        return `Ca bệnh nặng ${s.caseIndex}${pName ? `: ${pName}` : ''} (Xử trí)`;
      }
      case 'critical_clinical':
        return `Ca bệnh nặng ${s.caseIndex} (Lâm sàng & XN)`;
      case 'death': {
        const pName = s.deathCase?.patient_name || s.deathCase?.patientName;
        return `Ca tử vong ${s.caseIndex}${pName ? `: ${pName}` : ''} (Cấp cứu)`;
      }
      case 'death_clinical':
        return `Ca tử vong ${s.caseIndex} (Tiền sử & CLS)`;
      case 'case_image':
        return `Hình ảnh minh họa lâm sàng (${s.imgIndex}/${s.totalImages})`;
      case 'summary':
        return 'Tổng hợp số liệu toàn viện';
      case 'closing':
        return 'Bế mạc & Cảm ơn';
      default:
        return s.title || 'Slide';
    }
  };

  const getSlideIcon = (type) => {
    if (type === 'title') return <FaHospital style={{ color: '#38BDF8' }} />;
    if (type === 'dept_intro') return <FaUserMd style={{ color: '#FDE047' }} />;
    if (type === 'department') return <FaFileAlt style={{ color: '#93C5FD' }} />;
    if (type === 'clinical_overview') return <FaClipboardList style={{ color: '#34D399' }} />;
    if (type?.includes('transfer')) return <FaAmbulance style={{ color: '#F59E0B' }} />;
    if (type?.includes('surgery')) return <FaProcedures style={{ color: '#38BDF8' }} />;
    if (type?.includes('critical')) return <FaHeartbeat style={{ color: '#A855F7' }} />;
    if (type?.includes('death')) return <FaSkullCrossbones style={{ color: '#EF4444' }} />;
    if (type === 'case_image') return <span style={{ fontSize: '0.82rem' }}>🖼️</span>;
    if (type === 'summary') return <FaClipboardList style={{ color: '#38BDF8' }} />;
    if (type === 'closing') return <FaHandHoldingHeart style={{ color: '#F43F5E' }} />;
    return <FaFileAlt />;
  };

  // Next / Prev slide handlers with direction tracking
  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setSlideDirection('next');
      setCurrentSlide(prev => prev + 1);
    }
  };

  // Speak current slide when in AI Voice Mode
  const speakCurrentSlide = () => {
    if (!aiVoiceActive || slides.length === 0) return;
    const currentSlideObj = slides[currentSlide];
    if (!currentSlideObj) return;

    const script = generateSlideNarrationScript(currentSlideObj, {
      dateStr: date,
      slideIndex: currentSlide,
      totalSlides: slides.length
    });
    setCurrentScript(script);

    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }

    voiceNarrationService.speak(script, {
      onEnd: () => {
        if (autoAdvanceEnabled && currentSlide < slides.length - 1) {
          voiceTimeoutRef.current = setTimeout(() => {
            setSlideDirection('next');
            setCurrentSlide(prev => prev + 1);
          }, transitionDelay);
        }
      }
    });
  };

  // Trigger narration on slide change or when AI voice mode is toggled
  useEffect(() => {
    if (aiVoiceActive) {
      speakCurrentSlide();
    } else {
      voiceNarrationService.stop();
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    }
    return () => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, [currentSlide, aiVoiceActive, autoAdvanceEnabled, transitionDelay]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      voiceNarrationService.stop();
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard navigation & AI Voice Hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) return;

      // Space / P for Play/Pause in AI Voice Mode
      if (aiVoiceActive && (e.code === 'Space' || e.code === 'KeyP')) {
        e.preventDefault();
        if (voiceNarrationService.isPlaying && !voiceNarrationService.isPaused) {
          voiceNarrationService.pause();
        } else if (voiceNarrationService.isPaused) {
          voiceNarrationService.resume();
        } else {
          speakCurrentSlide();
        }
        return;
      }

      // R key to replay current slide narration
      if (aiVoiceActive && e.code === 'KeyR') {
        e.preventDefault();
        speakCurrentSlide();
        return;
      }

      if (e.code === 'ArrowRight' || (!aiVoiceActive && e.code === 'Space') || e.code === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.code === 'ArrowLeft' || e.code === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.code === 'Home') {
        e.preventDefault();
        setSlideDirection('prev');
        setCurrentSlide(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        setSlideDirection('next');
        setCurrentSlide(slides.length - 1);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM' || e.code === 'KeyS') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, lightboxOpen, aiVoiceActive]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const progressPct = slides.length > 1 ? (currentSlide / (slides.length - 1)) * 100 : 0;

  if (loading) {
    return (
      <MedicalLoader
        fullScreen={true}
        dark={true}
        text="Đang chuẩn bị phiên họp giao ban..."
        subtext={`SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT Khu Vực Bình Long • Ngày ${formatDate(date)}`}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* 1. Epic Cinematic Opening Title Animation */}
      {showIntro && (
        <CinematicNetflixIntro
          date={date}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Global Presentation Animation Styles */}
      <style>{`
        @keyframes slideNextIn {
          0% { opacity: 0; transform: translateX(18px) scale(0.99); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slidePrevIn {
          0% { opacity: 0; transform: translateX(-18px) scale(0.99); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .presentation-slide-next {
          animation: slideNextIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .presentation-slide-prev {
          animation: slidePrevIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* ===================== SIDEBAR DRAWER (Toggleable via M/S or Button) ===================== */}
      {showSidebar && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex'
        }}>
          {/* Backdrop */}
          <div
            onClick={() => setShowSidebar(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Drawer Sidebar with 12 Departments Accordion */}
          <aside style={{
            position: 'relative',
            width: '400px',
            maxWidth: '92vw',
            height: '100%',
            backgroundColor: '#0A192F',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.1rem 1rem',
            boxSizing: 'border-box',
            zIndex: 10,
            boxShadow: '10px 0 35px rgba(0, 0, 0, 0.55)'
          }}>
            {/* Top: Header, Return Button & Search / Quick Collapse Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.5px' }}>
                      DANH SÁCH 12 KHOA & SLIDE
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#93C5FD' }}>
                      Tổng số: <strong>{slides.length} slide</strong> • 12 Khoa chuyên môn
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  title="Đóng danh sách (Phím Esc, M hoặc S)"
                >
                  <FaTimes />
                </button>
              </div>

              {/* SAFE EXIT BUTTON (Inside Drawer) */}
              <button
                onClick={() => navigate('/admin')}
                style={{
                  width: '100%',
                  backgroundColor: '#1E3A8A',
                  border: '1.5px solid #3B82F6',
                  color: '#FFFFFF',
                  borderRadius: '9px',
                  padding: '0.55rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.65rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A8A'}
              >
                <FaArrowLeft /> QUAY LẠI BẢNG ĐIỀU KHIỂN
              </button>

              {/* Quick Search & Expand/Collapse All Toolbar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
                {/* Search input */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#93C5FD', fontSize: '0.75rem' }} />
                  <input
                    type="text"
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    placeholder="Tìm nhanh khoa hoặc slide..."
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '8px',
                      padding: '0.4rem 2rem 0.4rem 1.9rem',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {drawerSearch && (
                    <button
                      onClick={() => setDrawerSearch('')}
                      style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem'
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Expand / Collapse All Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: '700' }}>
                    📑 12 KHOA TRỰC
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={expandAllDepts}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#93C5FD',
                        borderRadius: '5px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                      title="Mở toàn bộ danh sách slide của 12 khoa"
                    >
                      Mở hết
                    </button>
                    <button
                      type="button"
                      onClick={collapseAllDepts}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#CBD5E1',
                        borderRadius: '5px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                      title="Thu gọn danh sách slide của tất cả khoa"
                    >
                      Thu gọn
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable 12 Departments Accordions List */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                paddingRight: '4px',
                paddingBottom: '0.5rem'
              }}>
                {/* 1. Mở Đầu (Title Slide) */}
                {slideGroups.introSlide && (() => {
                  const isTitleActive = currentSlide === 0;
                  const query = drawerSearch.trim().toLowerCase();
                  if (query && !'báo cáo giao ban toàn viện'.includes(query)) return null;

                  return (
                    <button
                      type="button"
                      ref={isTitleActive ? activeThumbRef : null}
                      onClick={() => {
                        setSlideDirection(currentSlide === 0 ? 'next' : 'prev');
                        setCurrentSlide(0);
                        setShowSidebar(false);
                      }}
                      style={{
                        flexShrink: 0,
                        width: '100%',
                        minHeight: '44px',
                        boxSizing: 'border-box',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isTitleActive ? '#2563EB' : 'rgba(255, 255, 255, 0.06)',
                        border: isTitleActive ? '1.5px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        textAlign: 'left',
                        boxShadow: isTitleActive ? '0 4px 12px rgba(37, 99, 235, 0.45)' : 'none',
                        color: isTitleActive ? '#FFFFFF' : '#E2E8F0',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isTitleActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isTitleActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.color = '#E2E8F0';
                        }
                      }}
                    >
                      <FaHospital style={{ color: '#38BDF8', fontSize: '0.95rem', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#93C5FD', minWidth: '18px' }}>#1</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: isTitleActive ? '900' : '700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        BÁO CÁO GIAO BAN TOÀN VIỆN
                      </span>
                    </button>
                  );
                })()}

                {/* 2. 12 Khoa Chuyên Môn (Accordions) */}
                {slideGroups.deptGroups.map((group) => {
                  const query = drawerSearch.trim().toLowerCase();
                  const matchesDept = !query || group.name.toLowerCase().includes(query);
                  const matchingSlides = !query
                    ? group.slides
                    : group.slides.filter(item => {
                        const label = getSlideSubLabel(item.slide).toLowerCase();
                        const title = (item.slide.title || '').toLowerCase();
                        return label.includes(query) || title.includes(query);
                      });
                  const isVisible = matchesDept || matchingSlides.length > 0;
                  if (!isVisible) return null;

                  const isExpanded = expandedDepts[group.code] || !!query;

                  return (
                    <div
                      key={group.code}
                      style={{
                        flexShrink: 0,
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: group.hasActiveSlide ? 'rgba(30, 58, 138, 0.45)' : 'rgba(255, 255, 255, 0.05)',
                        border: group.hasActiveSlide ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderLeft: group.hasActiveSlide ? '5px solid #38BDF8' : `5px solid ${group.theme?.main || '#3B82F6'}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Department Accordion Header */}
                      <div
                        onClick={() => group.isSubmitted && toggleDept(group.code)}
                        style={{
                          minHeight: '46px',
                          boxSizing: 'border-box',
                          padding: '0.55rem 0.8rem',
                          cursor: group.isSubmitted ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.45rem',
                          userSelect: 'none',
                          backgroundColor: group.hasActiveSlide ? 'rgba(56, 189, 248, 0.14)' : 'transparent'
                        }}
                        title={group.isSubmitted ? `Bấm để ${isExpanded ? 'thu gọn' : 'xổ ra'} slide khoa ${group.name}` : 'Khoa chưa nộp báo cáo'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                            {group.theme?.icon || '🏥'}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                              fontSize: '0.8rem',
                              fontWeight: group.hasActiveSlide ? '900' : '700',
                              color: group.hasActiveSlide ? '#38BDF8' : '#FFFFFF',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {group.orderIdx}. {group.name}
                            </div>
                            {group.hasActiveSlide && (
                              <div style={{ fontSize: '0.66rem', color: '#6EE7B7', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px' }}>
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                                Đang trình chiếu
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          {group.isSubmitted ? (
                            <span style={{
                              backgroundColor: group.hasActiveSlide ? '#2563EB' : 'rgba(255, 255, 255, 0.14)',
                              color: '#FFFFFF',
                              fontSize: '0.68rem',
                              fontWeight: '800',
                              padding: '0.14rem 0.5rem',
                              borderRadius: '10px'
                            }}>
                              {group.slideCount} slide
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.18)',
                              color: '#FCA5A5',
                              fontSize: '0.66rem',
                              fontWeight: '700',
                              padding: '0.14rem 0.45rem',
                              borderRadius: '8px'
                            }}>
                              Chưa nộp
                            </span>
                          )}
                          {group.isSubmitted && (
                            <FaChevronDown style={{
                              color: group.hasActiveSlide ? '#38BDF8' : '#94A3B8',
                              fontSize: '0.72rem',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }} />
                          )}
                        </div>
                      </div>

                      {/* Accordion Body: List of slides belonging to this department */}
                      {isExpanded && group.isSubmitted && (
                        <div style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '0.35rem 0.45rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          {matchingSlides.map((item) => {
                            const isActive = item.index === currentSlide;
                            const subLabel = getSlideSubLabel(item.slide);

                            return (
                              <button
                                key={item.index}
                                type="button"
                                ref={isActive ? activeThumbRef : null}
                                onClick={() => {
                                  setSlideDirection(item.index >= currentSlide ? 'next' : 'prev');
                                  setCurrentSlide(item.index);
                                  setShowSidebar(false);
                                }}
                                style={{
                                  flexShrink: 0,
                                  minHeight: '36px',
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  textAlign: 'left',
                                  boxShadow: isActive ? '0 3px 10px rgba(37, 99, 235, 0.45)' : 'none',
                                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#CBD5E1';
                                  }
                                }}
                                title={`Bấm để chuyển tới Slide #${item.index + 1}: ${subLabel}`}
                              >
                                <span style={{ fontSize: '0.82rem', flexShrink: 0, opacity: isActive ? 1 : 0.85 }}>
                                  {getSlideIcon(item.slide.type)}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '900',
                                  color: isActive ? '#FFFFFF' : '#94A3B8',
                                  minWidth: '24px',
                                  flexShrink: 0
                                }}>
                                  #{item.index + 1}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: isActive ? '800' : '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  flex: 1
                                }}>
                                  {subLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 3. Phần Bế Mạc & Tổng Kết (Closing Slides) */}
                {slideGroups.endSlides.map((item) => {
                  const isActive = item.index === currentSlide;
                  const subLabel = getSlideSubLabel(item.slide);
                  const query = drawerSearch.trim().toLowerCase();
                  if (query && !subLabel.toLowerCase().includes(query)) return null;

                  return (
                    <button
                      key={item.index}
                      type="button"
                      ref={isActive ? activeThumbRef : null}
                      onClick={() => {
                        setSlideDirection(item.index >= currentSlide ? 'next' : 'prev');
                        setCurrentSlide(item.index);
                        setShowSidebar(false);
                      }}
                      style={{
                        flexShrink: 0,
                        width: '100%',
                        minHeight: '44px',
                        boxSizing: 'border-box',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#2563EB' : 'rgba(255, 255, 255, 0.06)',
                        border: isActive ? '1.5px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        textAlign: 'left',
                        boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.45)' : 'none',
                        color: isActive ? '#FFFFFF' : '#E2E8F0',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.color = '#E2E8F0';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', flexShrink: 0 }}>
                        {getSlideIcon(item.slide.type)}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#93C5FD', minWidth: '18px' }}>
                        #{item.index + 1}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: isActive ? '900' : '700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Navigation Tip */}
            <div style={{
              marginTop: '0.8rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.7rem',
              color: '#93C5FD'
            }}>
              💡 Nhấp vào từng khoa để mở slide • Dùng phím ⬅️ ➡️ hoặc Space để chuyển slide.
            </div>
          </aside>
        </div>
      )}

      {/* ===================== TRUE EDGE-TO-EDGE FULL BLEED PRESENTATION STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', width: '100%', backgroundColor: '#FFFFFF' }}>
        
        {/* Full Bleed Slide Viewport Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          width: '100%',
          height: (aiVoiceActive && !showControls) ? '100vh' : 'calc(100vh - 54px)',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          padding: 0,
          transition: 'height 0.25s ease'
        }}>
          {/* Top-Left Hover Zone (Hotspot trigger for Slide List & AI Voice Narrator) */}
          <div
            onMouseEnter={() => setIsTopLeftHovered(true)}
            onMouseLeave={() => setIsTopLeftHovered(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              padding: '1rem 1.25rem 2rem 2rem',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              minWidth: '320px',
              minHeight: '70px',
              boxSizing: 'border-box'
            }}
          >
            {/* Floating Action Controls - only visible when mouse hovers over top-left corner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              opacity: isTopLeftHovered ? 1 : 0,
              pointerEvents: isTopLeftHovered ? 'auto' : 'none',
              transform: isTopLeftHovered ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease'
            }}>
              <button
                type="button"
                onClick={() => setShowSidebar(prev => !prev)}
                style={{
                  backgroundColor: 'rgba(15, 44, 89, 0.88)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '20px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 44, 89, 0.88)'}
                title="Mở danh sách slide (Phím M hoặc S)"
              >
                <FaListUl style={{ fontSize: '0.78rem' }} />
                <span>Danh sách ({slides.length})</span>
              </button>

              {/* AI Voice Presenter Control */}
              <AIVoicePresenterControl
                isActive={aiVoiceActive}
                onToggleActive={setAiVoiceActive}
                showControls={showControls}
                currentSlideIndex={currentSlide}
                totalSlides={slides.length}
                currentSlideTitle={slide.title}
                currentScript={currentScript}
                onNextSlide={handleNextSlide}
                onReplaySlide={speakCurrentSlide}
                autoAdvanceEnabled={autoAdvanceEnabled}
                onToggleAutoAdvance={setAutoAdvanceEnabled}
                transitionDelay={transitionDelay}
                onChangeTransitionDelay={setTransitionDelay}
              />
            </div>
          </div>

          {/* 100% Edge-to-Edge Slide Inner Container */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            borderRadius: '0px',
            border: 'none',
            boxShadow: 'none',
            padding: isFullscreen ? '1.2rem 2.2rem' : '1rem 1.6rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Dynamic Scaled Slide Content Container */}
            <div
              key={currentSlide}
              className={slideDirection === 'next' ? 'presentation-slide-next' : 'presentation-slide-prev'}
              ref={scrollContainerRef}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                transform: fontScale !== 1 ? `scale(${fontScale})` : 'none',
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease'
              }}
            >
              {/* 1. Title Slide */}
              {slide.type === 'title' && (
                <TitleSlide
                  selectedDate={date}
                  reportsCount={slide.reportsCount || reports.length}
                  summary={slide.summary || {}}
                  isFullscreen={true}
                />
              )}

              {/* 2. Department Intro Slide */}
              {slide.type === 'dept_intro' && (
                <DepartmentIntroSlide slide={slide} isFullscreen={true} />
              )}

              {/* 3. Department Data Overview Slide */}
              {slide.type === 'department' && (
                <DepartmentSlide slide={slide} isFullscreen={true} />
              )}

              {/* 4. Clinical Cases Overview Slide */}
              {slide.type === 'clinical_overview' && (
                <ClinicalCasesOverviewSlide slide={slide} isFullscreen={true} />
              )}

              {/* 5. Transfer Case Slide (Overview, Clinical & Progress) */}
              {(slide.type === 'transfer' || slide.type === 'transfer_clinical' || slide.type === 'transfer_progress') && (
                <TransferSlide slide={slide} isFullscreen={true} />
              )}

              {/* 6. Surgery Case Slide (Overview & Clinical) */}
              {(slide.type === 'surgery' || slide.type === 'surgery_clinical') && (
                <SurgerySlide slide={slide} isFullscreen={true} />
              )}

              {/* 7. Mortality / Death Case Slide (Overview & Clinical) */}
              {(slide.type === 'death' || slide.type === 'death_clinical') && (
                <DeathSlide slide={slide} isFullscreen={true} />
              )}

              {/* 8. Critical Care Monitored Case Slide (Overview & Clinical) */}
              {(slide.type === 'critical' || slide.type === 'critical_clinical') && (
                <CriticalSlide slide={slide} isFullscreen={true} />
              )}

              {/* 9. Hospital-Wide Summary Slide */}
              {slide.type === 'summary' && (
                <SummarySlide slide={slide} isFullscreen={true} />
              )}

              {/* 10. Dedicated Full-Screen Clinical Image Slide */}
              {slide.type === 'case_image' && (
                <FullScreenImageSlide
                  slide={{
                    ...slide,
                    imageUrl: typeof slide.image === 'string' ? slide.image : slide.image?.url,
                    patientName: slide.caseItem?.patient_name || slide.caseItem?.patientName,
                    imageIndex: slide.imgIndex
                  }}
                  isFullscreen={true}
                  onOpenLightbox={imgUrl => handleOpenLightbox([imgUrl], 0, slide.title)}
                />
              )}

              {/* 11. Final Closing & Thank You Slide */}
              {slide.type === 'closing' && (
                <ClosingSlide
                  selectedDate={date}
                  onRestart={() => {
                    setSlideDirection('prev');
                    setCurrentSlide(0);
                  }}
                  isFullscreen={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* ===================== SLEEK DOCKED CONTROL BAR ===================== */}
        <div style={{
          padding: (aiVoiceActive && !showControls) ? '0' : '0 1.5rem',
          height: (aiVoiceActive && !showControls) ? '0px' : '54px',
          minHeight: (aiVoiceActive && !showControls) ? '0px' : '54px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderTop: (aiVoiceActive && !showControls) ? 'none' : '1px solid #E2E8F0',
          position: 'relative',
          flexShrink: 0,
          boxShadow: (aiVoiceActive && !showControls) ? 'none' : '0 -2px 10px rgba(15, 44, 89, 0.04)',
          opacity: (aiVoiceActive && !showControls) ? 0 : 1,
          pointerEvents: (aiVoiceActive && !showControls) ? 'none' : 'auto',
          transform: (aiVoiceActive && !showControls) ? 'translateY(24px)' : 'translateY(0)',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Top Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#E2E8F0' }}>
            <div style={{ height: '100%', backgroundColor: '#2563EB', width: `${progressPct}%`, transition: 'width 0.2s ease' }} />
          </div>

          {/* Left: Quick Access to 12 Departments Drawer & Admin Return */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setShowSidebar(true)}
              style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                color: '#1D4ED8',
                borderRadius: '8px',
                padding: '0.42rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
                transition: 'all 0.15s ease'
              }}
              title="Mở danh sách slide 12 khoa (Phím M hoặc S)"
            >
              <FaListUl style={{ fontSize: '0.82rem' }} />
              <span>Danh sách 12 khoa ({slides.length})</span>
            </button>

            <button
              onClick={() => navigate('/admin')}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                borderRadius: '8px',
                padding: '0.42rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#0F2C59';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
              title="Quay lại bảng điều khiển quản trị"
            >
              <FaArrowLeft style={{ fontSize: '0.75rem' }} />
              <span>Bảng điều khiển</span>
            </button>
          </div>

          {/* Center: Slide Counter & Font Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '20px',
              padding: '0.3rem 0.95rem',
              color: '#1E40AF',
              fontWeight: '900',
              fontSize: '0.88rem'
            }}>
              Slide {currentSlide + 1} / {slides.length}
            </div>

            {/* Font Scale Adjusters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#F8FAFC', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setFontScale(prev => Math.max(0.8, +(prev - 0.05).toFixed(2)))}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px 4px', fontSize: '0.85rem' }}
                title="Thu nhỏ chữ"
              >
                <FaSearchMinus />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0F2C59', minWidth: '38px', textAlign: 'center' }}>
                {Math.round(fontScale * 100)}%
              </span>
              <button
                onClick={() => setFontScale(prev => Math.min(1.25, +(prev + 0.05).toFixed(2)))}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px 4px', fontSize: '0.85rem' }}
                title="Phóng to chữ"
              >
                <FaSearchPlus />
              </button>
            </div>
          </div>

          {/* Right: TOÀN MÀN HÌNH ➔ TRƯỚC ➔ SAU (TIẾP) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* 1. Toàn màn hình */}
            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: isFullscreen ? '#EFF6FF' : '#F1F5F9',
                border: isFullscreen ? '1.5px solid #93C5FD' : '1.5px solid #CBD5E1',
                color: isFullscreen ? '#1D4ED8' : '#1E293B',
                borderRadius: '8px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.86rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isFullscreen ? '0 2px 6px rgba(37, 99, 235, 0.15)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Toàn màn hình (Phím F hoặc F11)"
            >
              {isFullscreen ? <FaCompress style={{ color: '#2563EB' }} /> : <FaExpand style={{ color: '#0F2C59' }} />}
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>

            {/* 2. Trước (⬅) */}
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              style={{
                backgroundColor: currentSlide === 0 ? '#F1F5F9' : '#0F2C59',
                border: 'none',
                color: currentSlide === 0 ? '#94A3B8' : '#FFFFFF',
                borderRadius: '8px',
                padding: '0.45rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: currentSlide === 0 ? 'none' : '0 2px 8px rgba(15, 44, 89, 0.25)',
                transition: 'all 0.15s ease'
              }}
              title="Về slide trước (Phím mũi tên Trái)"
            >
              <FaChevronLeft /> Trước (⬅)
            </button>

            {/* 3. Sau / Tiếp (➔) */}
            <button
              onClick={handleNextSlide}
              disabled={currentSlide === slides.length - 1}
              style={{
                backgroundColor: currentSlide === slides.length - 1 ? '#F1F5F9' : '#10B981',
                border: 'none',
                color: currentSlide === slides.length - 1 ? '#94A3B8' : '#FFFFFF',
                borderRadius: '8px',
                padding: '0.45rem 1.35rem',
                fontSize: '0.88rem',
                fontWeight: '900',
                cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.15s ease'
              }}
              title="Sang slide sau (Phím mũi tên Phải hoặc Phím Space)"
            >
              Tiếp (➔) <FaChevronRight />
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox Modal for Clinical Images */}
      {lightboxOpen && (
        <ImageLightboxModal
          images={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default PresentationPage;
