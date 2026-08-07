import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaHospitalAlt, FaAmbulance } from 'react-icons/fa';
import reportService from '../services/reportService';

const DEPARTMENT_DISPLAY_NAMES = {
  hscc_tnt: 'KHOA HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO',
  cdha: 'KHOA CHẨN ĐOÁN HÌNH ẢNH',
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
        items.push(<h4 key={prefix + key} style={{ marginTop: '1rem', color: '#0F2C59', fontWeight: '700', fontSize: '1.05rem', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '0.25rem' }}>{key.toUpperCase()}</h4>);
        renderObj(value, prefix + key + '.');
      } else if (value !== '' && value !== null && value !== undefined) {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, s => s.toUpperCase());
        items.push(
          <div key={prefix + key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#475569', fontWeight: '500', fontSize: '0.95rem' }}>{label}:</span>
            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#0F2C59' }}>{String(value)}</span>
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B192C', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="spinner" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#388E3C' }} />
          <p>Đang tải dữ liệu trình chiếu giao ban...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0B192C', color: 'white' }}>
      {/* Sidebar */}
      <div className="no-print" style={{ width: '270px', backgroundColor: '#1E293B', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px' }} />
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF' }}>TRÌNH CHIẾU GIAO BAN</h2>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{slides.length} slide khả dụng</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.75rem',
                marginBottom: '3px',
                backgroundColor: currentSlide === i ? '#1E40AF' : 'transparent',
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
              <span style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: currentSlide === i ? 'rgba(255,255,255,0.25)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, fontWeight: '700' }}>
                {i + 1}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: currentSlide === i ? '600' : 'normal' }}>
                {s.type === 'transfer' ? '🚑 ' : ''}{s.title.length > 26 ? s.title.substring(0, 26) + '...' : s.title}
              </span>
            </button>
          ))}
        </div>
        <div style={{ padding: '0.75rem', borderTop: '1px solid #334155', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: '0.55rem', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
            <FaPrint /> In Báo Cáo
          </button>
          <button onClick={toggleFullscreen} style={{ padding: '0.55rem 0.75rem', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Toàn màn hình (F)">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '1100px', 
            minHeight: '520px',
            backgroundColor: '#FFFFFF', 
            color: '#1E293B', 
            borderRadius: '16px',
            padding: '3rem 4rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            animation: 'fadeIn 0.3s ease-out',
            position: 'relative'
          }}>
            {/* Title Slide */}
            {slide.type === 'title' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '420px' }}>
                <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 8px 30px rgba(15,44,89,0.15)', marginBottom: '1.5rem' }}>
                  <img src="/logo.png" alt="Logo TTYT Bình Long" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#D32F2F', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                </h3>
                <h1 style={{ fontSize: '3.5rem', color: '#0F2C59', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                  BÁO CÁO GIAO BAN
                </h1>
                <div style={{ fontSize: '1.25rem', color: '#334155', fontWeight: '600', padding: '0.75rem 2.5rem', backgroundColor: '#EFF6FF', borderRadius: '999px', border: '1px solid #DBEAFE' }}>
                  📅 {formatDate(date)}
                </div>
                {reports.length > 0 && (
                  <p style={{ marginTop: '2rem', color: '#64748B', fontSize: '0.95rem' }}>
                    Tổng số <strong>{reports.length} khoa phòng</strong> đã hoàn thành báo cáo giao ban
                  </p>
                )}
              </div>
            )}

            {/* Department Slide */}
            {slide.type === 'department' && (
              <div>
                <div style={{ borderBottom: '3px solid #0F2C59', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', color: '#0F2C59', fontWeight: '800' }}>{slide.title}</h2>
                    <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                      Bác sĩ trực chính: <strong style={{ color: '#0F2C59' }}>{slide.report.doctor_name}</strong>
                      {slide.report.room && <> | Phòng: <strong>{slide.report.room}</strong></>}
                      {slide.report.shift_time && <> | Ca trực: <strong>{slide.report.shift_time}</strong></>}
                    </p>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px' }} />
                </div>
                <div style={{ columns: '2', gap: '2.5rem' }}>
                  {renderReportData(slide.report.report_data)}
                </div>
              </div>
            )}

            {/* Transfer Case Slide */}
            {slide.type === 'transfer' && (
              <div>
                <div style={{ borderBottom: '3px solid #D32F2F', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaAmbulance style={{ fontSize: '2.2rem', color: '#D32F2F' }} />
                    <div>
                      <h2 style={{ fontSize: '1.8rem', color: '#D32F2F', fontWeight: '800' }}>BỆNH CHUYỂN VIỆN</h2>
                      <p style={{ color: '#475569', fontSize: '0.9rem' }}>Ca {slide.caseIndex}/{slide.totalCases} — {slide.title.split(' - ')[1]}</p>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {slide.transferCase.patient_name && (
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F2C59', padding: '0.8rem 1.2rem', backgroundColor: '#FEF3C7', borderRadius: '8px', borderLeft: '4px solid #D97706' }}>
                      👤 {slide.transferCase.patient_name}
                      {slide.transferCase.age && <span style={{ fontWeight: '500', color: '#92400E' }}> — {slide.transferCase.age}</span>}
                      {slide.transferCase.address && <span style={{ fontWeight: '500', color: '#92400E' }}> — {slide.transferCase.address}</span>}
                    </div>
                  )}
                  {[
                    { label: '⏰ Giờ/ngày vào viện', value: slide.transferCase.admission_time },
                    { label: '📋 Lý do vào viện', value: slide.transferCase.reason },
                    { label: '🔬 Cận lâm sàng / X-Quang / XN', value: slide.transferCase.clinical_tests },
                    { label: '🏥 Chẩn đoán', value: slide.transferCase.diagnosis },
                    { label: '💊 Xử trí ban đầu', value: slide.transferCase.initial_treatment },
                    { label: '📝 Diễn biến / Hội chẩn / Tình trạng lúc chuyển', value: slide.transferCase.progress_notes },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', borderRadius: '8px', borderLeft: '3px solid #D32F2F' }}>
                      <div style={{ fontWeight: '700', color: '#D32F2F', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{item.label}</div>
                      <div style={{ color: '#1E293B', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="no-print" style={{ padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', borderTop: '1px solid #334155' }}>
          <button onClick={handlePrev} disabled={currentSlide === 0} style={{ padding: '0.5rem 1.5rem', background: currentSlide === 0 ? 'transparent' : '#334155', color: currentSlide === 0 ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentSlide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
            <FaChevronLeft /> Trước
          </button>
          <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
            Slide <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{currentSlide + 1}</span> / {slides.length}
          </div>
          <button onClick={handleNext} disabled={currentSlide === slides.length - 1} style={{ padding: '0.5rem 1.5rem', background: currentSlide === slides.length - 1 ? 'transparent' : '#1E40AF', color: currentSlide === slides.length - 1 ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
            Tiếp <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;
