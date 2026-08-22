import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress,
  FaFilePowerpoint, FaSpinner, FaSearchPlus, FaSearchMinus,
  FaArrowLeft, FaFileAlt, FaUserMd
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
import DepartmentSlide from '../components/presentation/slides/DepartmentSlide';
import TransferSlide from '../components/presentation/slides/TransferSlide';
import SurgerySlide from '../components/presentation/slides/SurgerySlide';
import DeathSlide from '../components/presentation/slides/DeathSlide';
import CriticalSlide from '../components/presentation/slides/CriticalSlide';
import FullScreenImageSlide from '../components/presentation/slides/FullScreenImageSlide';
import SummarySlide from '../components/presentation/slides/SummarySlide';

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeThumbRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100% default scale
  const [exportingPptx, setExportingPptx] = useState(false);

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

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

  // Smooth scroll active slide into view in sidebar
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentSlide]);

  // Reset scroll container to top whenever slide changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSlide]);

  // Build slides with official department order & specialized case slides
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
    let totalChuyenVien = 0, totalPhauThuat = 0, totalHienCon = 0, totalTuVong = 0;

    sortedReports.forEach((r) => {
      const rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data || '{}') : (r.report_data || {});
      const deptName = r.department_name || DEPARTMENT_NAMES[r.department_code] || r.department_code;
      const theme = DEPARTMENT_THEMES[r.department_code] || {
        main: '#0284C7', light: '#EFF6FF', dark: '#0C4A6E', border: '#BAE6FD', text: '#0369A1'
      };

      // Comprehensive extraction supporting camelCase, snake_case, and JSON sub-fields
      const rawTransfers = safeCaseArray(r.transferCases || r.transfer_cases || rawData.transferCases || rawData.transfer_cases);
      const rawSurgeries = safeCaseArray(r.surgeryCases || r.surgery_cases || rawData.surgeryCases || rawData.surgery_cases);
      const rawDeaths = safeCaseArray(r.deathCases || r.death_cases || rawData.deathCases || rawData.death_cases);
      const rawCriticals = safeCaseArray(r.criticalCases || r.critical_cases || rawData.criticalCases || rawData.critical_cases);

      const transferCases = rawTransfers.map(c => ({
        ...c,
        patientName: c.patientName || c.patient_name || '',
        patient_name: c.patientName || c.patient_name || '',
        admissionTime: c.admissionTime || c.admission_time || '',
        admission_time: c.admissionTime || c.admission_time || '',
        clinicalSymptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinical_symptoms: c.clinicalSymptoms || c.clinical_symptoms || '',
        clinicalTests: c.clinicalTests || c.clinical_tests || '',
        clinical_tests: c.clinicalTests || c.clinical_tests || '',
        initialTreatment: c.initialTreatment || c.initial_treatment || '',
        initial_treatment: c.initialTreatment || c.initial_treatment || '',
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

      // Accumulate totals for hospital-wide summary slide
      totalKham += Number(rawData.tongSoKham || rawData.tongSo || rawData.soCaKham || 0);
      totalBenhCu += Number(rawData.benhCu || 0);
      totalBenhMoi += Number(rawData.benhMoi || 0);
      totalXuatVien += Number(rawData.xuatVien || 0);
      totalChuyenVien += transferCases.length || Number(rawData.chuyenVien || 0);
      totalPhauThuat += surgeryCases.length || Number(rawData.tongSoCaMo || rawData.phauThuat || 0);
      totalTuVong += deathCases.length || Number(rawData.tuVong || 0);
      totalHienCon += criticalCases.length || Number(rawData.hienCon || 0);

      // 1. Department Overview Slide
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

      // 2. Transfer Case Slides (Part 1: Reception, Part 2: Progress, Dedicated Image Slides)
      transferCases.forEach((tc, tcIdx) => {
        s.push({
          type: 'transfer',
          title: `CA CHUYỂN VIỆN ${tcIdx + 1} – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          transferCase: tc,
          caseIndex: tcIdx + 1,
          totalCases: transferCases.length
        });

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

        const tcImages = normalizeImages(tc.images);
        tcImages.forEach((img, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA CHUYỂN VIỆN ${tcIdx + 1} (${imgIdx + 1}/${tcImages.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            category: 'transfer',
            caseItem: tc,
            caseIndex: tcIdx + 1,
            totalCases: transferCases.length,
            image: img,
            imgIndex: imgIdx,
            totalImages: tcImages.length
          });
        });
      });

      // 3. Surgery Case Slides
      surgeryCases.forEach((sc, scIdx) => {
        s.push({
          type: 'surgery',
          title: `CA PHẪU THUẬT ${scIdx + 1} – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          surgeryCase: sc,
          caseIndex: scIdx + 1,
          totalCases: surgeryCases.length
        });

        const scImages = normalizeImages(sc.images);
        scImages.forEach((img, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA MỔ ${scIdx + 1} (${imgIdx + 1}/${scImages.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            category: 'surgery',
            caseItem: sc,
            caseIndex: scIdx + 1,
            totalCases: surgeryCases.length,
            image: img,
            imgIndex: imgIdx,
            totalImages: scImages.length
          });
        });
      });

      // 4. Mortality / Death Case Slides
      deathCases.forEach((dc, dcIdx) => {
        s.push({
          type: 'death',
          title: `CA TỬ VONG ${dcIdx + 1} – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          deathCase: dc,
          caseIndex: dcIdx + 1,
          totalCases: deathCases.length
        });

        const dcImages = normalizeImages(dc.images);
        dcImages.forEach((img, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH CA TỬ VONG ${dcIdx + 1} (${imgIdx + 1}/${dcImages.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            category: 'death',
            caseItem: dc,
            caseIndex: dcIdx + 1,
            totalCases: deathCases.length,
            image: img,
            imgIndex: imgIdx,
            totalImages: dcImages.length
          });
        });
      });

      // 5. Critical Care Case Slides
      criticalCases.forEach((cc, ccIdx) => {
        s.push({
          type: 'critical',
          title: `BỆNH NẶNG THEO DÕI ${ccIdx + 1} – ${deptName}`,
          deptCode: r.department_code,
          deptName,
          criticalCase: cc,
          caseIndex: ccIdx + 1,
          totalCases: criticalCases.length
        });

        const ccImages = normalizeImages(cc.images);
        ccImages.forEach((img, imgIdx) => {
          s.push({
            type: 'case_image',
            title: `HÌNH ẢNH BỆNH NẶNG ${ccIdx + 1} (${imgIdx + 1}/${ccImages.length}) – ${deptName}`,
            deptCode: r.department_code,
            deptName,
            category: 'critical',
            caseItem: cc,
            caseIndex: ccIdx + 1,
            totalCases: criticalCases.length,
            image: img,
            imgIndex: imgIdx,
            totalImages: ccImages.length
          });
        });
      });
    });

    // 6. Hospital-Wide Summary Slide at the End
    if (sortedReports.length > 0) {
      s.push({
        type: 'summary',
        title: 'TỔNG HỢP TOÀN VIỆN',
        summary: {
          tongSoKham: totalKham,
          benhCu: totalBenhCu,
          benhMoi: totalBenhMoi,
          xuatVien: totalXuatVien,
          chuyenVien: totalChuyenVien,
          phauThuat: totalPhauThuat,
          hienCon: totalHienCon,
          tuVong: totalTuVong
        },
        totalDepts: 12,
        submittedCount: sortedReports.length,
        selectedDate: date
      });
    }

    return s;
  }, [reports]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) return; // Prevent slide navigation when lightbox is open
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, lightboxOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleNext = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const handlePrev = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Export to PowerPoint
  const handleExportPowerPoint = async () => {
    if (exportingPptx) return;
    setExportingPptx(true);
    try {
      await exportPresentationToPowerPoint(date, reports);
    } catch (err) {
      console.error('Error exporting presentation to PowerPoint:', err);
      alert('Không thể tạo file PowerPoint: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setExportingPptx(false);
    }
  };

  if (loading) {
    return (
      <MedicalLoader
        fullScreen={true}
        dark={true}
        text={`Đang nạp slide giao ban ngày ${formatDate(date)}...`}
        subtext="TTYT Khu Vực Bình Long • Phiên Họp Giao Ban Chuyên Môn"
      />
    );
  }

  const slide = slides[currentSlide] || slides[0];
  const progressPct = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#F1F5F9',
        color: '#0F172A',
        display: 'flex',
        overflow: 'hidden',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      {/* ===================== 1. LEFT SIDEBAR (Dark Navy Gradient) ===================== */}
      {!isFullscreen && (
        <aside style={{
          width: '240px',
          minWidth: '240px',
          background: 'linear-gradient(180deg, #0A192F 0%, #0F2C59 55%, #0A2540 100%)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem 0.85rem',
          height: '100vh',
          boxSizing: 'border-box',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.12)',
          zIndex: 100,
          flexShrink: 0
        }}>
          {/* Top Section */}
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
            {/* Header: Logo + Agency Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#93C5FD', textTransform: 'uppercase', lineHeight: '1.2' }}>
                  SỞ Y TẾ BÌNH PHƯỚC
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.2', marginTop: '1px' }}>
                  TTYT KHU VỰC BÌNH LONG
                </div>
              </div>
            </div>

            {/* Back Button & Slides Counter Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              marginBottom: '0.85rem'
            }}>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  padding: '0.38rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#CBD5E1';
                }}
              >
                <FaArrowLeft size={10} /> Quản trị
              </button>

              <div style={{ fontSize: '0.78rem', fontWeight: '900', color: '#38BDF8', letterSpacing: '0.5px' }}>
                {slides.length} SLIDES
              </div>
            </div>

            {/* Sidebar Slides List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              paddingRight: '2px'
            }}>
              {slides.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    ref={isActive ? activeThumbRef : null}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      padding: '0.6rem 0.75rem',
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
                    <FaFileAlt style={{ fontSize: '0.85rem', flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: '900', flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
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

          {/* Bottom: User Profile Widget */}
          <div style={{
            padding: '0.65rem 0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              color: '#0F2C59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0
            }}>
              <FaUserMd />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: '#93C5FD' }}>Xin chào,</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Quản trị hệ thống</div>
            </div>
          </div>
        </aside>
      )}

      {/* ===================== 2. MAIN PRESENTATION STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        
        {/* Slide Viewport Canvas Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isFullscreen ? '0.75rem' : '1.25rem',
          overflow: 'hidden',
          minHeight: 0
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            maxWidth: isFullscreen ? '100%' : '1720px',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(15, 44, 89, 0.08)',
            padding: isFullscreen ? '1.25rem 1.75rem' : '1.5rem 2rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Dynamic Scaled Slide Content Container */}
            <div
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
                <TitleSlide selectedDate={date} reportsCount={reports.length} isFullscreen={isFullscreen} />
              )}

              {/* 2. Department Overview Slide */}
              {slide.type === 'department' && (
                <DepartmentSlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 3. Transfer Case Slide (Part 1 & Part 2) */}
              {(slide.type === 'transfer' || slide.type === 'transfer_progress') && (
                <TransferSlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 4. Surgery Case Slide */}
              {slide.type === 'surgery' && (
                <SurgerySlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 5. Mortality / Death Case Slide */}
              {slide.type === 'death' && (
                <DeathSlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 6. Critical Care Monitored Case Slide */}
              {slide.type === 'critical' && (
                <CriticalSlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 6.5 Hospital-Wide Summary Slide */}
              {slide.type === 'summary' && (
                <SummarySlide slide={slide} isFullscreen={isFullscreen} />
              )}

              {/* 7. Dedicated Full-Screen Clinical Image Slide */}
              {slide.type === 'case_image' && (
                <FullScreenImageSlide
                  slide={{
                    ...slide,
                    imageUrl: typeof slide.image === 'string' ? slide.image : slide.image?.url,
                    patientName: slide.caseItem?.patient_name || slide.caseItem?.patientName,
                    imageIndex: slide.imgIndex
                  }}
                  isFullscreen={isFullscreen}
                  onOpenLightbox={imgUrl => handleOpenLightbox([imgUrl], 0, slide.title)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ===================== 3. BOTTOM CONTROL BAR ===================== */}
        <div style={{
          padding: '0 1.5rem',
          height: '62px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 -2px 10px rgba(15, 44, 89, 0.04)'
        }}>
          {/* Top Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#E2E8F0' }}>
            <div style={{ height: '100%', backgroundColor: '#2563EB', width: `${progressPct}%`, transition: 'width 0.2s ease' }} />
          </div>

          {/* Left: Previous button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            style={{
              padding: '0.45rem 1.15rem',
              backgroundColor: currentSlide === 0 ? '#F8FAFC' : '#FFFFFF',
              color: currentSlide === 0 ? '#94A3B8' : '#334155',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.86rem',
              fontWeight: '700',
              transition: 'all 0.15s'
            }}
          >
            <FaChevronLeft size={10} /> Slide trước
          </button>

          {/* Center: Slide indicator + Font Zoom + PPTX Export + Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Slide Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.86rem', fontWeight: '600' }}>
              <span>Slide</span>
              <span style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                fontWeight: '900',
                fontSize: '0.95rem'
              }}>
                {currentSlide + 1}
              </span>
              <span>/ {slides.length}</span>
            </div>

            {/* Font Zoom Controls (A- / 100% / A+) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              padding: '2px 4px',
              gap: '3px'
            }}>
              <button
                type="button"
                onClick={() => setFontScale(p => Math.max(0.75, Number((p - 0.15).toFixed(2))))}
                disabled={fontScale <= 0.75}
                title="Thu nhỏ chữ (A-)"
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.78rem',
                  fontWeight: '800'
                }}
              >
                <FaSearchMinus size={10} /> A-
              </button>
              <button
                type="button"
                onClick={() => setFontScale(1)}
                title="Đặt lại cỡ chữ mặc định (100%)"
                style={{
                  background: fontScale === 1 ? '#E2E8F0' : '#2563EB',
                  color: fontScale === 1 ? '#0F2C59' : '#FFFFFF',
                  border: 'none',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '800'
                }}
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setFontScale(p => Math.min(2.0, Number((p + 0.15).toFixed(2))))}
                disabled={fontScale >= 2.0}
                title="Phóng to chữ (A+)"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
                }}
              >
                <FaSearchPlus size={10} /> A+
              </button>
            </div>

            {/* Export PowerPoint Button */}
            <button
              type="button"
              onClick={handleExportPowerPoint}
              disabled={exportingPptx}
              title="Xuất toàn bộ slide ra file Microsoft PowerPoint (.pptx)"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.9rem',
                cursor: exportingPptx ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              {exportingPptx ? <><FaSpinner className="spinner" /> Tạo PPTX...</> : <><FaFilePowerpoint /> Xuất PPTX</>}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}
            >
              {isFullscreen ? <><FaCompress /> Thu nhỏ</> : <><FaExpand /> Toàn màn hình</>}
            </button>
          </div>

          {/* Right: Next button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            style={{
              padding: '0.45rem 1.35rem',
              backgroundColor: currentSlide === slides.length - 1 ? '#E2E8F0' : '#2563EB',
              color: currentSlide === slides.length - 1 ? '#94A3B8' : '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.86rem',
              fontWeight: '800',
              boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.15s'
            }}
          >
            Slide tiếp <FaChevronRight size={10} />
          </button>
        </div>

        {/* Full-screen HD Image Lightbox Modal */}
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle}
          subtitle="Trình chiếu hình ảnh y khoa độ phân giải cao"
        />
      </div>
    </div>
  );
};

export default PresentationPage;
