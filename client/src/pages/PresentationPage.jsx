import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaHospitalAlt, FaAmbulance } from 'react-icons/fa';
import reportService from '../services/reportService';

const DEPARTMENT_DISPLAY_NAMES = {
  hscc_tnt: 'KHOA HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO',
  cdha: 'KHOA CHUẨN ĐOÁN HÌNH ẢNH',
  yhct_phcn: 'KHOA Y HỌC CỔ TRUYỀN – PHCN',
  ngoai_th: 'KHOA NGOẠI TỔNG HỢP',
  ctch: 'KHOA CHẤN THƯƠNG CHỈNH HÌNH',
  nhi: 'KHOA NHI',
  nhiem: 'KHOA NHIỄM',
  gmhs: 'KHOA GÂY MÊ HỒI SỨC',
  san: 'KHOA SẢN',
  xn: 'KHOA XÉT NGHIỆM',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const renderReportData = (reportData) => {
  if (!reportData) return null;
  const data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
  
  const items = [];
  const renderObj = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        items.push(<h4 key={prefix + key} style={{ marginTop: '1rem', color: '#1E40AF', fontWeight: '600', fontSize: '1.1rem' }}>{key.toUpperCase()}</h4>);
        renderObj(value, prefix + key + '.');
      } else if (value !== '' && value !== null && value !== undefined) {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, s => s.toUpperCase());
        items.push(
          <div key={prefix + key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ color: '#475569', fontWeight: '500' }}>{label}:</span>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1E293B' }}>{String(value)}</span>
          </div>
        );
      }
    });
  };
  renderObj(data);
  return items;
};

const PresentationPage = () => {
  const { date } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Build slides from data
  const slides = [];
  
  // Slide 0: Title slide
  slides.push({ type: 'title', title: 'BÁO CÁO GIAO BAN' });
  
  // Slides for each department
  reports.forEach(report => {
    const deptName = DEPARTMENT_DISPLAY_NAMES[report.department_code] || report.department_name || report.department_code;
    slides.push({
      type: 'department',
      title: deptName,
      report: report,
    });
    
    // Transfer case slides
    if (report.transferCases && report.transferCases.length > 0) {
      report.transferCases.forEach((tc, idx) => {
        slides.push({
          type: 'transfer',
          title: `BỆNH CHUYỂN VIỆN - ${deptName}`,
          transferCase: tc,
          caseIndex: idx + 1,
          totalCases: report.transferCases.length,
        });
      });
    }
  });

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="spinner" style={{ fontSize: '3rem', marginBottom: '1rem' }} />
          <p>Đang tải dữ liệu trình chiếu...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      {/* Sidebar */}
      <div className="no-print" style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #334155' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaHospitalAlt /> Danh sách Slide
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>{slides.length} slide</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                marginBottom: '2px',
                backgroundColor: currentSlide === i ? '#3b82f6' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: currentSlide === i ? 'rgba(255,255,255,0.2)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.type === 'transfer' ? '🚑 ' : ''}{s.title.length > 28 ? s.title.substring(0, 28) + '...' : s.title}
              </span>
            </button>
          ))}
        </div>
        <div style={{ padding: '0.75rem', borderTop: '1px solid #334155', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <FaPrint /> In
          </button>
          <button onClick={toggleFullscreen} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '1100px', 
            minHeight: '500px',
            backgroundColor: 'white', 
            color: '#1E293B', 
            borderRadius: '12px',
            padding: '3rem 4rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            {/* Title Slide */}
            {slide.type === 'title' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '400px' }}>
                <FaHospitalAlt style={{ fontSize: '4rem', color: '#1E40AF', marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '3.5rem', color: '#1E40AF', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>BÁO CÁO GIAO BAN</h1>
                <h2 style={{ fontSize: '1.8rem', color: '#7C3AED', fontWeight: '600', marginBottom: '2rem' }}>Bệnh Viện Bình Long</h2>
                <div style={{ fontSize: '1.3rem', color: '#64748B', fontWeight: '500', padding: '0.75rem 2rem', backgroundColor: '#F0F4F8', borderRadius: '8px' }}>
                  📅 {formatDate(date)}
                </div>
                {reports.length > 0 && (
                  <p style={{ marginTop: '1.5rem', color: '#94A3B8' }}>
                    {reports.length} khoa đã nộp báo cáo
                  </p>
                )}
              </div>
            )}

            {/* Department Slide */}
            {slide.type === 'department' && (
              <div>
                <div style={{ borderBottom: '3px solid #1E40AF', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.8rem', color: '#1E40AF', fontWeight: '800' }}>{slide.title}</h2>
                  <p style={{ color: '#64748B', marginTop: '0.25rem' }}>
                    BS trực: <strong style={{ color: '#1E293B' }}>{slide.report.doctor_name}</strong>
                    {slide.report.room && <> | Phòng: <strong>{slide.report.room}</strong></>}
                  </p>
                </div>
                <div style={{ columns: '2', gap: '2rem' }}>
                  {renderReportData(slide.report.report_data)}
                </div>
              </div>
            )}

            {/* Transfer Case Slide */}
            {slide.type === 'transfer' && (
              <div>
                <div style={{ borderBottom: '3px solid #DC2626', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaAmbulance style={{ fontSize: '2rem', color: '#DC2626' }} />
                  <div>
                    <h2 style={{ fontSize: '1.8rem', color: '#DC2626', fontWeight: '800' }}>BỆNH CHUYỂN VIỆN</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Ca {slide.caseIndex}/{slide.totalCases} — {slide.title.split(' - ')[1]}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {slide.transferCase.patient_name && (
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1E293B', padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                      👤 {slide.transferCase.patient_name}
                      {slide.transferCase.age && <span style={{ fontWeight: '400', color: '#92400E' }}> — {slide.transferCase.age} tuổi</span>}
                      {slide.transferCase.address && <span style={{ fontWeight: '400', color: '#92400E' }}> — {slide.transferCase.address}</span>}
                    </div>
                  )}
                  {[
                    { label: '⏰ Giờ vào viện', value: slide.transferCase.admission_time },
                    { label: '📋 Lý do vào viện', value: slide.transferCase.reason },
                    { label: '🔬 Cận lâm sàng', value: slide.transferCase.clinical_tests },
                    { label: '🏥 Chẩn đoán', value: slide.transferCase.diagnosis },
                    { label: '💊 Xử trí ban đầu', value: slide.transferCase.initial_treatment },
                    { label: '📝 Diễn biến / Hội chẩn', value: slide.transferCase.progress_notes },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: idx % 2 === 0 ? '#F8FAFC' : 'white', borderRadius: '6px', borderLeft: '3px solid #DC2626' }}>
                      <div style={{ fontWeight: '600', color: '#DC2626', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{item.label}</div>
                      <div style={{ color: '#1E293B', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="no-print" style={{ padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
          <button onClick={handlePrev} disabled={currentSlide === 0} style={{ padding: '0.5rem 1.5rem', background: currentSlide === 0 ? 'transparent' : '#334155', color: currentSlide === 0 ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentSlide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <FaChevronLeft /> Trước
          </button>
          <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
            <span style={{ color: 'white', fontWeight: '600' }}>{currentSlide + 1}</span> / {slides.length}
          </div>
          <button onClick={handleNext} disabled={currentSlide === slides.length - 1} style={{ padding: '0.5rem 1.5rem', background: currentSlide === slides.length - 1 ? 'transparent' : '#3b82f6', color: currentSlide === slides.length - 1 ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            Tiếp <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;
