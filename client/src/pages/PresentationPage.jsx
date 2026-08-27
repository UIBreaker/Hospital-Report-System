import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress,
  FaFilePowerpoint, FaSpinner, FaSearchPlus, FaSearchMinus,
  FaArrowLeft, FaFileAlt, FaUserMd, FaListUl, FaTimes, FaBars,
  FaHospital, FaAmbulance, FaProcedures, FaHeartbeat, FaSkullCrossbones,
  FaClipboardList, FaDoorOpen, FaHandHoldingHeart
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { exportPresentationToPowerPoint } from '../services/powerpointExportService';
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [fontScale, setFontScale] = useState(1);
  const [exportingPptx, setExportingPptx] = useState(false);

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

  const handleExportPowerPoint = async () => {
    try {
      setExportingPptx(true);
      await exportPresentationToPowerPoint(slides, date || 'today');
    } catch (err) {
      console.error('Failed to export PPTX', err);
      alert('Không thể xuất PowerPoint. Vui lòng thử lại.');
    } finally {
      setExportingPptx(false);
    }
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

          {/* Drawer Sidebar */}
          <aside style={{
            position: 'relative',
            width: '340px',
            maxWidth: '85vw',
            height: '100%',
            backgroundColor: '#0F2C59',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.2rem',
            boxSizing: 'border-box',
            zIndex: 10,
            boxShadow: '8px 0 30px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Top: Header & Return to Admin Button */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.5px' }}>
                      DANH SÁCH SLIDE
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#93C5FD' }}>
                      Tổng số: {slides.length} slide
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
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
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
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A8A'}
              >
                <FaArrowLeft /> QUAY LẠI BẢNG ĐIỀU KHIỂN
              </button>

              {/* Scrollable Slide Thumbnails List */}
              <div style={{
                maxHeight: 'calc(100vh - 210px)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                paddingRight: '2px'
              }}>
                {slides.map((s, idx) => {
                  const isActive = idx === currentSlide;
                  
                  let slideIcon = <FaFileAlt />;
                  if (s.type === 'title') slideIcon = <FaHospital style={{ color: '#38BDF8' }} />;
                  else if (s.type === 'dept_intro') slideIcon = <FaHospital style={{ color: '#FDE047' }} />;
                  else if (s.type === 'clinical_overview') slideIcon = <FaClipboardList style={{ color: '#34D399' }} />;
                  else if (s.type?.includes('transfer')) slideIcon = <FaAmbulance style={{ color: '#F59E0B' }} />;
                  else if (s.type?.includes('surgery')) slideIcon = <FaProcedures style={{ color: '#38BDF8' }} />;
                  else if (s.type?.includes('critical')) slideIcon = <FaHeartbeat style={{ color: '#A855F7' }} />;
                  else if (s.type?.includes('death')) slideIcon = <FaSkullCrossbones style={{ color: '#EF4444' }} />;
                  else if (s.type === 'closing') slideIcon = <FaHandHoldingHeart style={{ color: '#F43F5E' }} />;

                  return (
                    <button
                      key={idx}
                      type="button"
                      ref={isActive ? activeThumbRef : null}
                      onClick={() => {
                        setSlideDirection(idx >= currentSlide ? 'next' : 'prev');
                        setCurrentSlide(idx);
                        setShowSidebar(false);
                      }}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#2563EB' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none',
                        color: isActive ? '#FFFFFF' : '#94A3B8'
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
                          e.currentTarget.style.color = '#94A3B8';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', flexShrink: 0, opacity: isActive ? 1 : 0.8 }}>
                        {slideIcon}
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: '900', flexShrink: 0, minWidth: '18px' }}>
                        {idx + 1}.
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: isActive ? '800' : '600',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Navigation Tip */}
            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.72rem',
              color: '#93C5FD'
            }}>
              💡 Dùng phím ⬅️ ➡️ hoặc Space để chuyển slide nhanh.
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
          {/* Floating Action Controls (Slide List & AI Voice Narrator) */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1.25rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            opacity: (aiVoiceActive && !showControls) ? 0 : 1,
            pointerEvents: (aiVoiceActive && !showControls) ? 'none' : 'auto',
            transform: (aiVoiceActive && !showControls) ? 'translateY(-12px)' : 'translateY(0)',
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

          {/* Left: Previous button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              style={{
                backgroundColor: currentSlide === 0 ? '#F1F5F9' : '#0F2C59',
                border: 'none',
                color: currentSlide === 0 ? '#94A3B8' : '#FFFFFF',
                borderRadius: '8px',
                padding: '0.45rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: currentSlide === 0 ? 'none' : '0 2px 8px rgba(15, 44, 89, 0.2)'
              }}
            >
              <FaChevronLeft /> Trước (⬅)
            </button>
          </div>

          {/* Center: Slide Counter & Font Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '20px',
              padding: '0.3rem 1rem',
              color: '#1E40AF',
              fontWeight: '900',
              fontSize: '0.9rem'
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

          {/* Right: Next & Fullscreen / Export Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleExportPowerPoint}
              disabled={exportingPptx}
              style={{
                backgroundColor: '#D97706',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.42rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: exportingPptx ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
              }}
              title="Xuất file trình chiếu PowerPoint PPTX"
            >
              {exportingPptx ? <><FaSpinner className="spinner" /> Đang xuất...</> : <><FaFilePowerpoint /> Xuất PPTX</>}
            </button>

            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1.5px solid #CBD5E1',
                color: '#1E293B',
                borderRadius: '8px',
                padding: '0.42rem 0.85rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Toàn màn hình (F11 hoặc F)"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>

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
                boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.3)'
              }}
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
