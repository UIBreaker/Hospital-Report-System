import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft, FaChevronRight, FaTimes, FaExpand, FaCompress,
  FaFilePowerpoint, FaSpinner, FaSearchPlus, FaSearchMinus,
  FaArrowLeft, FaBed, FaAmbulance, FaProcedures, FaSkullCrossbones,
  FaHeartbeat, FaImages, FaHospital
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { exportPresentationToPowerPoint } from '../services/powerpointExportService';
import ImageLightboxModal from '../components/common/ImageLightboxModal';

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

    sortedReports.forEach(report => {
      const deptName = DEPARTMENT_NAMES[report.department_code] || report.department_name || report.department_code;
      const theme = DEPARTMENT_THEMES[report.department_code] || { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

      // 1. Department Overview Slide
      s.push({
        type: 'department',
        title: deptName,
        deptName,
        report,
        theme,
        sections: parseDepartmentSections(report.report_data, report.department_code)
      });

      // 2. Surgery Cases Slides
      if (report.surgeryCases && report.surgeryCases.length > 0) {
        report.surgeryCases.forEach((sc, idx) => {
          s.push({
            type: 'surgery',
            title: `CA PHẪU THUẬT – ${deptName}`,
            surgeryCase: sc,
            caseIndex: idx + 1,
            totalCases: report.surgeryCases.length,
            deptName,
            report
          });

          // Dedicated slide for each attached clinical photo
          const scImgs = normalizeImages(sc.images);
          scImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'Phẫu Thuật',
              title: `HÌNH ẢNH CA PHẪU THUẬT – ${deptName}`,
              caseItem: sc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.surgeryCases.length,
              imgIndex: imgIdx + 1,
              totalImages: scImgs.length,
              themeColor: '#0284C7',
              deptName,
              report
            });
          });
        });
      }

      // 3. Death / Mortality Cases Slides
      if (report.deathCases && report.deathCases.length > 0) {
        report.deathCases.forEach((dc, idx) => {
          s.push({
            type: 'death',
            title: `BÁO CÁO TỬ VONG – ${deptName}`,
            deathCase: dc,
            caseIndex: idx + 1,
            totalCases: report.deathCases.length,
            deptName,
            report
          });

          const dcImgs = normalizeImages(dc.images);
          dcImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'Tử Vong',
              title: `HÌNH ẢNH HỒ SƠ TỬ VONG – ${deptName}`,
              caseItem: dc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.deathCases.length,
              imgIndex: imgIdx + 1,
              totalImages: dcImgs.length,
              themeColor: '#DC2626',
              deptName,
              report
            });
          });
        });
      }

      // 4. Transfer Cases Slides (Part 1 + Part 2 + Image Slides)
      if (report.transferCases && report.transferCases.length > 0) {
        report.transferCases.forEach((tc, idx) => {
          s.push({
            type: 'transfer',
            part: 1,
            title: `CA CHUYỂN VIỆN – ${deptName}`,
            transferCase: tc,
            caseIndex: idx + 1,
            totalCases: report.transferCases.length,
            deptName,
            report
          });

          s.push({
            type: 'transfer_progress',
            part: 2,
            title: `DIỄN BIẾN CHUYỂN VIỆN – ${deptName}`,
            transferCase: tc,
            caseIndex: idx + 1,
            totalCases: report.transferCases.length,
            deptName,
            report
          });

          const tcImgs = normalizeImages(tc.images);
          tcImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'Chuyển Viện',
              title: `HÌNH ẢNH CA CHUYỂN VIỆN – ${deptName}`,
              caseItem: tc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.transferCases.length,
              imgIndex: imgIdx + 1,
              totalImages: tcImgs.length,
              themeColor: '#D97706',
              deptName,
              report
            });
          });
        });
      }

      // 5. Critical Monitored Cases Slides
      if (report.criticalCases && report.criticalCases.length > 0) {
        report.criticalCases.forEach((cc, idx) => {
          s.push({
            type: 'critical',
            title: `BỆNH NẶNG THEO DÕI – ${deptName}`,
            criticalCase: cc,
            caseIndex: idx + 1,
            totalCases: report.criticalCases.length,
            deptName,
            report
          });

          const ccImgs = normalizeImages(cc.images);
          ccImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'Bệnh Nặng',
              title: `HÌNH ẢNH BỆNH NẶNG – ${deptName}`,
              caseItem: cc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.criticalCases.length,
              imgIndex: imgIdx + 1,
              totalImages: ccImgs.length,
              themeColor: '#7C3AED',
              deptName,
              report
            });
          });
        });
      }
    });

    return s;
  }, [reports]);

  // Navigation handlers
  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) return; // Disable slide keys when lightbox is open

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Home') {
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        setCurrentSlide(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, isFullscreen, lightboxOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleExportPowerPoint = async () => {
    setExportingPptx(true);
    try {
      await exportPresentationToPowerPoint(slides, date, reports);
    } catch (err) {
      console.error('PowerPoint export failed:', err);
      alert('Không thể xuất file PowerPoint: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setExportingPptx(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A1223',
        color: '#FFFFFF', gap: '1rem'
      }}>
        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#38BDF8' }} />
        <div style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>
          Đang nạp dữ liệu trình chiếu giao ban...
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];
  const progressPct = slides.length > 1 ? (currentSlide / (slides.length - 1)) * 100 : 100;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw', height: '100vh',
        backgroundColor: '#0A1223', color: '#F8FAFC',
        display: 'flex', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* ===================== 1. LEFT SIDEBAR (THUMBNAILS) ===================== */}
      {!isFullscreen && (
        <div style={{
          width: '280px', backgroundColor: '#0F172A', borderRight: '1px solid #1E293B',
          display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '1rem', borderBottom: '1px solid #1E293B',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                backgroundColor: 'transparent', border: '1px solid #334155',
                color: '#94A3B8', borderRadius: '8px', padding: '0.4rem 0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.82rem', fontWeight: '700'
              }}
            >
              <FaArrowLeft /> Quản trị
            </button>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38BDF8' }}>
              {slides.length} SLIDES
            </div>
          </div>

          {/* Sidebar Slides List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.65rem' }}>
            {slides.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={idx}
                  ref={isActive ? activeThumbRef : null}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    padding: '0.65rem 0.85rem', marginBottom: '0.45rem',
                    borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: isActive ? '#1D4ED8' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isActive ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '900',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    width: '24px', textAlign: 'right', flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: '700',
                      color: isActive ? '#FFFFFF' : '#CBD5E1',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {s.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== 2. MAIN PRESENTATION STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Slide Viewport Canvas (16:9 Aspect Ratio Container) */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isFullscreen ? '0.75rem' : '1rem', overflow: 'hidden', minHeight: 0
        }}>
          <div style={{
            width: '100%', height: '100%', maxWidth: isFullscreen ? '100%' : '1720px',
            backgroundColor: '#FFFFFF', color: '#0F172A',
            borderRadius: isFullscreen ? '12px' : '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            padding: isFullscreen ? '1.2rem 1.6rem' : '1.4rem 1.8rem',
            boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative'
          }}>
            {/* Dynamic Scaled Slide Content Container */}
            <div
              ref={scrollContainerRef}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
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
          padding: '0 1.5rem', height: '62px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#0F172A', borderTop: '1px solid #1E293B',
          position: 'relative', flexShrink: 0
        }}>
          {/* Top Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#1E293B' }}>
            <div style={{ height: '100%', backgroundColor: '#38BDF8', width: `${progressPct}%`, transition: 'width 0.2s ease' }} />
          </div>

          {/* Left: Previous button */}
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            style={{
              padding: '0.55rem 1.4rem',
              backgroundColor: currentSlide === 0 ? 'transparent' : '#1E293B',
              color: currentSlide === 0 ? '#475569' : '#F8FAFC',
              border: `1px solid ${currentSlide === 0 ? 'transparent' : '#334155'}`,
              borderRadius: '8px', cursor: currentSlide === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.92rem', fontWeight: '800', transition: 'all 0.15s'
            }}
          >
            <FaChevronLeft /> Slide trước
          </button>

          {/* Center: Slide indicator + Font Zoom + PPTX Export + Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.92rem' }}>
              <span>Slide</span>
              <span style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '0.18rem 0.65rem', borderRadius: '6px', fontWeight: '900', fontSize: '1.05rem', fontFamily: "'Roboto Mono', monospace" }}>
                {currentSlide + 1}
              </span>
              <span>/ {slides.length}</span>
            </div>

            {/* Font Zoom Controls (A- / 100% / A+) */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '3px 6px', gap: '4px' }}>
              <button
                onClick={() => setFontScale(p => Math.max(0.75, Number((p - 0.15).toFixed(2))))}
                disabled={fontScale <= 0.75}
                title="Thu nhỏ chữ (A-)"
                style={{ background: '#334155', color: '#F1F5F9', border: 'none', padding: '0.3rem 0.65rem', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: '800' }}
              >
                <FaSearchMinus /> A-
              </button>
              <button
                onClick={() => setFontScale(1)}
                title="Đặt lại cỡ chữ mặc định (100%)"
                style={{ background: fontScale === 1 ? '#0F172A' : '#2563EB', color: '#FFFFFF', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800', fontFamily: "'Roboto Mono', monospace" }}
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                onClick={() => setFontScale(p => Math.min(2.0, Number((p + 0.15).toFixed(2))))}
                disabled={fontScale >= 2.0}
                title="Phóng to chữ (A+)"
                style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '0.3rem 0.65rem', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(37,99,235,0.4)' }}
              >
                <FaSearchPlus /> A+
              </button>
            </div>

            {/* Export PowerPoint */}
            <button
              onClick={handleExportPowerPoint}
              disabled={exportingPptx}
              title="Xuất toàn bộ slide ra file Microsoft PowerPoint (.pptx)"
              style={{ backgroundColor: exportingPptx ? '#92400E' : '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.45rem 0.9rem', cursor: exportingPptx ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)' }}
            >
              {exportingPptx ? <><FaSpinner className="spinner" /> Tạo PPTX...</> : <><FaFilePowerpoint /> Xuất PPTX</>}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{ backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid #334155', borderRadius: '8px', padding: '0.45rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '800' }}
            >
              {isFullscreen ? <><FaCompress /> Thu nhỏ</> : <><FaExpand /> Toàn màn hình</>}
            </button>
          </div>

          {/* Right: Next button */}
          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            style={{
              padding: '0.55rem 1.6rem',
              backgroundColor: currentSlide === slides.length - 1 ? 'transparent' : '#2563EB',
              color: currentSlide === slides.length - 1 ? '#475569' : '#FFFFFF',
              border: `1px solid ${currentSlide === slides.length - 1 ? 'transparent' : '#3B82F6'}`,
              borderRadius: '8px', cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.92rem', fontWeight: '800',
              boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s'
            }}
          >
            Slide tiếp <FaChevronRight />
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
