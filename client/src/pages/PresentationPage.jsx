import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaAmbulance, FaSignOutAlt, FaHome } from 'react-icons/fa';
import reportService from '../services/reportService';

const DEPARTMENT_DISPLAY_NAMES = {
  hscc_tnt: 'HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO',
  cdha: 'CHẨN ĐOÁN HÌNH ẢNH',
  yhct_phcn: 'Y HỌC CỔ TRUYỀN – PHCN',
  ngoai_th: 'NGOẠI TỔNG HỢP',
  ctch: 'CHẤN THƯƠNG CHỈNH HÌNH',
  nhi: 'NHI',
  nhiem: 'NHIỄM',
  gmhs: 'GÂY MÊ HỒI SỨC',
  san: 'SẢN',
  xn: 'XÉT NGHIỆM',
  noi: 'NỘI',
};

// Vietnamese label map for presentation display
const FIELD_LABELS = {
  // Common
  benhCu: 'Bệnh cũ', benhMoi: 'Bệnh mới', benhXuat: 'Bệnh xuất',
  benhChuyenVien: 'Bệnh chuyển viện', benhChuyenKhoa: 'Bệnh chuyển khoa',
  hienCon: 'Hiện còn', hienCo: 'Hiện còn', tuVong: 'Tử vong',
  xuatVien: 'Xuất viện', chuyenVien: 'Chuyển viện', chuyenKhoa: 'Chuyển khoa',
  tongSoKham: 'Tổng số khám', hauPhau: 'Hậu phẫu',
  // Sản
  sanhThuong: 'Sanh thường', sanhHut: 'Sanh hút', choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm', chuyenVienNgoaiTru: 'Chuyển viện ngoại trú',
  // HSCC specific
  keToa: 'Kê toa', ngoaiTru: 'Ngoại trú', truyenMau: 'Truyền máu',
  tieuPhau: 'Tiểu phẫu', boBot: 'Bó bột', ccNgoaiVien: 'Cấp cứu ngoại viện',
  // TNT
  tnt_benhCu: 'Bệnh cũ (TNT)', tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)', tnt_chuyenVien: 'Chuyển viện (TNT)',
  tnt_chuyenKhoa: 'Chuyển khoa (TNT)', tnt_hienCon: 'Hiện còn (TNT)',
  tnt_ctdk: 'Chạy thận định kỳ', tnt_noiTru: 'Nội trú (TNT)',
  // PK21
  pk21_benhCu: 'Bệnh cũ (PK21)', pk21_benhMoi: 'Bệnh mới (PK21)',
  pk21_xuatVien: 'Xuất viện (PK21)', pk21_hienCon: 'Hiện còn (PK21)',
  pk21_tongSo: 'Tổng số (PK21)', pk21_ngoaiTru: 'Ngoại trú (PK21)',
  // YHCT
  noiTru: 'Nội trú', dieuTriPhcn: 'Điều trị PHCN', phcn_benhCu: 'Bệnh cũ (PHCN)',
  phcn_benhMoi: 'Bệnh mới (PHCN)', phcn_xuatVien: 'Xuất viện (PHCN)',
  phcn_hienCon: 'Hiện còn (PHCN)',
  // CTCH / NTH
  daiPhau: 'Đại phẫu', trungPhau: 'Trung phẫu',
  hauPhauNghiNgo: 'Hậu phẫu nghi ngờ',
  // Nội
  benhCu_noi: 'Bệnh cũ', benhMoi_noi: 'Bệnh mới',
  // GMHS
  phauThuat: 'Phẫu thuật', gayTe: 'Gây tê', gayMe: 'Gây mê',
  gayMeNghinh: 'Gây mê nghỉnh',
};

const getLabel = (key) => {
  return FIELD_LABELS[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Improved: renders a flat list of key-value pairs from nested report data
const renderReportData = (reportData, isFS) => {
  if (!reportData) return null;
  const data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;

  const rows = [];
  const fontSize = isFS ? '1.1rem' : '0.9rem';
  const valueFontSize = isFS ? '1.2rem' : '1rem';

  const processSection = (obj, sectionLabel = null) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return;

    // Check if this is a nested group
    const hasNestedObjects = entries.some(([, v]) => v && typeof v === 'object' && !Array.isArray(v));

    if (sectionLabel && hasNestedObjects) {
      rows.push(
        <div key={`section_${sectionLabel}`} style={{
          gridColumn: '1 / -1',
          marginTop: isFS ? '1.5rem' : '1rem',
          paddingBottom: '0.4rem',
          borderBottom: '2px solid #E2E8F0',
          fontSize: isFS ? '1.1rem' : '0.85rem',
          fontWeight: '800',
          color: '#0F2C59',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {sectionLabel}
        </div>
      );
    }

    entries.forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || key === '_id') return;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        processSection(value, getLabel(key));
      } else if (Array.isArray(value)) {
        // Skip arrays (transfer cases handled separately)
      } else {
        rows.push(
          <div key={key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isFS ? '0.7rem 0.9rem' : '0.5rem 0.75rem',
            borderBottom: '1px solid #F1F5F9',
            borderRadius: '6px',
            backgroundColor: rows.length % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
            breakInside: 'avoid'
          }}>
            <span style={{ color: '#475569', fontWeight: '500', fontSize }}>{getLabel(key)}</span>
            <span style={{ fontWeight: '800', fontSize: valueFontSize, color: '#0F2C59', marginLeft: '1rem' }}>
              {String(value)}
            </span>
          </div>
        );
      }
    });
  };

  processSection(data);
  return rows;
};

// Table-based rendering for a cleaner look in presentation
const renderReportTable = (reportData, isFS) => {
  if (!reportData) return null;
  const data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;

  const rows = [];
  const fontSize = isFS ? '1.15rem' : '0.95rem';

  const processObj = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || key === '_id') return;
      if (Array.isArray(value)) return;

      if (value && typeof value === 'object') {
        const sLabel = getLabel(key);
        rows.push({ type: 'header', label: sLabel, key: prefix + key });
        processObj(value, prefix + key + '_');
      } else {
        rows.push({ type: 'row', label: getLabel(key), value: String(value), key: prefix + key });
      }
    });
  };

  processObj(data);

  // Group into pairs for 2-column display
  const dataRows = rows.filter(r => r.type === 'row');
  const headerRows = rows.filter(r => r.type === 'header');

  return { dataRows, headerRows, all: rows };
};

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

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

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // Build slides
  const slides = [{ type: 'title', title: 'BÁO CÁO GIAO BAN' }];
  reports.forEach(report => {
    const deptName = DEPARTMENT_DISPLAY_NAMES[report.department_code] || report.department_name || report.department_code;
    slides.push({ type: 'department', title: deptName, report });
    if (report.transferCases && report.transferCases.length > 0) {
      report.transferCases.forEach((tc, idx) => {
        slides.push({
          type: 'transfer',
          title: `CA CHUYỂN VIỆN – ${deptName}`,
          transferCase: tc,
          caseIndex: idx + 1,
          totalCases: report.transferCases.length,
          deptName,
        });
      });
    }
  });

  const handleNext = () => { if (currentSlide < slides.length - 1) setCurrentSlide(p => p + 1); };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide(p => p - 1); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleExit = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    navigate('/admin');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
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
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Đang tải dữ liệu trình chiếu...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];
  const progressPct = slides.length > 1 ? (currentSlide / (slides.length - 1)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', height: '100vh', width: '100vw',
        backgroundColor: '#0B192C', color: 'white',
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* ===================== SIDEBAR ===================== */}
      {!isFullscreen && (
        <div className="no-print" style={{
          width: '260px', backgroundColor: '#111827',
          borderRight: '1px solid #1F2937',
          display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '34px', height: '34px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FFF' }}>TRÌNH CHIẾU GIAO BAN</div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{slides.length} slide • {date}</div>
            </div>
          </div>

          {/* Slide list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '0.55rem 0.75rem', marginBottom: '2px',
                  backgroundColor: currentSlide === i ? '#1E40AF' : 'transparent',
                  color: currentSlide === i ? '#FFF' : '#9CA3AF',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: currentSlide === i ? '700' : '400',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{
                  width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                  backgroundColor: currentSlide === i ? 'rgba(255,255,255,0.2)' : '#1F2937',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: '700'
                }}>
                  {i + 1}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.type === 'title' ? '🏥 Trang bìa'
                    : s.type === 'transfer' ? `🚑 ${s.deptName ? s.deptName.substring(0, 16) : 'Ca chuyển viện'}`
                    : `📋 Khoa ${s.title.length > 16 ? s.title.substring(0, 16) + '…' : s.title}`}
                </span>
              </button>
            ))}
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid #1F2937', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                flex: 1, padding: '0.55rem', backgroundColor: '#1F2937', color: '#D1D5DB',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                fontSize: '0.78rem', fontWeight: '600'
              }}
            >
              <FaPrint /> In báo cáo
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toàn màn hình (F)"
              style={{ padding: '0.55rem 0.75rem', backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <FaExpand />
            </button>
            <button
              onClick={handleExit}
              title="Thoát"
              style={{ padding: '0.55rem 0.75rem', backgroundColor: '#1F2937', color: '#9CA3AF', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <FaHome />
            </button>
          </div>
        </div>
      )}

      {/* ===================== MAIN STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', position: 'relative' }}>

        {/* Fullscreen floating controls */}
        {isFullscreen && (
          <div style={{
            position: 'absolute', top: '1.25rem', right: '1.5rem',
            zIndex: 1000, display: 'flex', gap: '0.6rem', opacity: 0.9
          }}>
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(15, 44, 89, 0.85)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(8px)'
              }}
            >
              <FaCompress /> Thu Nhỏ
            </button>
            <button
              onClick={handleExit}
              style={{
                background: 'rgba(15, 44, 89, 0.85)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(8px)'
              }}
            >
              <FaSignOutAlt /> Thoát
            </button>
          </div>
        )}

        {/* Slide Canvas */}
        <div style={{
          flex: 1, padding: isFullscreen ? '2.5rem 3.5rem' : '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto'
        }}>
          <div style={{
            width: '100%',
            maxWidth: isFullscreen ? '1500px' : '1100px',
            minHeight: isFullscreen ? '80vh' : '500px',
            backgroundColor: '#FFFFFF', color: '#1E293B',
            borderRadius: '20px',
            padding: isFullscreen ? '3.5rem 5rem' : '2.5rem 3.5rem',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7)',
            animation: 'fadeIn 0.25s ease-out',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
              background: slide.type === 'title'
                ? 'linear-gradient(90deg, #0F2C59, #D32F2F, #2E7D32)'
                : slide.type === 'transfer'
                ? 'linear-gradient(90deg, #D32F2F, #B71C1C)'
                : 'linear-gradient(90deg, #0F2C59, #1565C0)'
            }} />

            {/* ========= TITLE SLIDE ========= */}
            {slide.type === 'title' && (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                minHeight: isFullscreen ? '560px' : '440px', gap: '1.5rem'
              }}>
                <div style={{
                  width: isFullscreen ? '140px' : '110px',
                  height: isFullscreen ? '140px' : '110px',
                  borderRadius: '50%', backgroundColor: '#FFF',
                  boxShadow: '0 15px 50px rgba(15,44,89,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
                }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: isFullscreen ? '1.2rem' : '0.9rem',
                    color: '#D32F2F', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '2px', marginBottom: '0.5rem'
                  }}>
                    TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                  </div>
                  <h1 style={{
                    fontSize: isFullscreen ? '4rem' : '3rem',
                    color: '#0F2C59', fontWeight: '900', margin: '0 0 1rem',
                    letterSpacing: '-2px', lineHeight: 1.1
                  }}>
                    BÁO CÁO GIAO BAN
                  </h1>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: isFullscreen ? '1.4rem' : '1.1rem',
                    color: '#334155', fontWeight: '700',
                    padding: '0.8rem 2.5rem',
                    backgroundColor: '#EFF6FF', borderRadius: '999px',
                    border: '2px solid #DBEAFE'
                  }}>
                    📅 {formatDate(date)}
                  </div>
                </div>
                {reports.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '2rem', marginTop: '1rem',
                    flexWrap: 'wrap', justifyContent: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isFullscreen ? '2.5rem' : '2rem', fontWeight: '900', color: '#0F2C59' }}>
                        {reports.length}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Khoa đã nộp
                      </div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#E2E8F0' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isFullscreen ? '2.5rem' : '2rem', fontWeight: '900', color: '#2E7D32' }}>
                        {reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0)}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Ca chuyển viện
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========= DEPARTMENT SLIDE ========= */}
            {slide.type === 'department' && (() => {
              const { dataRows } = renderReportTable(slide.report.report_data, isFullscreen);
              return (
                <div style={{ flex: 1 }}>
                  {/* Department header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    paddingBottom: '1.25rem', marginBottom: isFullscreen ? '2rem' : '1.25rem',
                    borderBottom: '4px solid #0F2C59'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '0.85rem' : '0.7rem',
                        color: '#D32F2F', fontWeight: '700', textTransform: 'uppercase',
                        letterSpacing: '1.5px', marginBottom: '0.35rem'
                      }}>
                        TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                      </div>
                      <h2 style={{ fontSize: isFullscreen ? '2.2rem' : '1.7rem', color: '#0F2C59', fontWeight: '900', margin: 0 }}>
                        KHOA {slide.title}
                      </h2>
                      <div style={{ marginTop: '0.5rem', fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#475569', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span>👨‍⚕️ Bác sĩ trực: <strong style={{ color: '#0F2C59' }}>{slide.report.doctor_name}</strong></span>
                        {slide.report.room && <span>🏥 Phòng: <strong>{slide.report.room}</strong></span>}
                        {slide.report.shift_time && <span>⏰ Ca: <strong>{slide.report.shift_time}</strong></span>}
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '70px' : '50px', height: isFullscreen ? '70px' : '50px', flexShrink: 0 }} />
                  </div>

                  {/* Data grid */}
                  {dataRows && dataRows.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: isFullscreen ? '0.65rem 2.5rem' : '0.45rem 2rem'
                    }}>
                      {dataRows.map((row, i) => (
                        <div key={row.key} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem',
                          backgroundColor: i % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                          borderRadius: '8px',
                          borderLeft: '3px solid #DBEAFE'
                        }}>
                          <span style={{ color: '#475569', fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '500' }}>
                            {row.label}
                          </span>
                          <span style={{ color: '#0F2C59', fontWeight: '900', fontSize: isFullscreen ? '1.3rem' : '1.05rem', marginLeft: '0.75rem' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: isFullscreen ? '1.2rem' : '1rem', paddingTop: '2rem' }}>
                      Không có dữ liệu số liệu
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ========= TRANSFER CASE SLIDE ========= */}
            {slide.type === 'transfer' && (
              <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: isFullscreen ? '1.5rem' : '1.25rem',
                  borderBottom: '4px solid #D32F2F'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: isFullscreen ? '60px' : '48px', height: isFullscreen ? '60px' : '48px',
                      borderRadius: '50%', backgroundColor: '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FaAmbulance style={{ fontSize: isFullscreen ? '1.8rem' : '1.4rem', color: '#D32F2F' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: isFullscreen ? '0.85rem' : '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Khoa {slide.deptName} • Ca {slide.caseIndex}/{slide.totalCases}
                      </div>
                      <h2 style={{ fontSize: isFullscreen ? '2rem' : '1.6rem', color: '#D32F2F', fontWeight: '900', margin: 0 }}>
                        BỆNH CHUYỂN VIỆN
                      </h2>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '60px' : '45px', height: isFullscreen ? '60px' : '45px' }} />
                </div>

                {/* Patient info banner */}
                {slide.transferCase.patient_name && (
                  <div style={{
                    backgroundColor: '#FEF3C7', borderRadius: '12px',
                    borderLeft: '5px solid #D97706',
                    padding: isFullscreen ? '1.1rem 1.5rem' : '0.8rem 1.2rem',
                    marginBottom: isFullscreen ? '1.25rem' : '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                  }}>
                    <span style={{ fontSize: isFullscreen ? '1.6rem' : '1.3rem' }}>👤</span>
                    <span style={{ fontWeight: '800', fontSize: isFullscreen ? '1.4rem' : '1.1rem', color: '#92400E' }}>
                      {slide.transferCase.patient_name}
                    </span>
                  </div>
                )}

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.75rem' : '0.6rem' }}>
                  {[
                    { icon: '⏰', label: 'Giờ / Ngày vào viện', value: slide.transferCase.admission_time },
                    { icon: '📋', label: 'Lý do vào viện', value: slide.transferCase.reason },
                    { icon: '🔬', label: 'Cận lâm sàng / X-Quang / Xét nghiệm', value: slide.transferCase.clinical_tests },
                    { icon: '🏥', label: 'Chẩn đoán', value: slide.transferCase.diagnosis },
                    { icon: '💊', label: 'Xử trí ban đầu', value: slide.transferCase.initial_treatment },
                    { icon: '📝', label: 'Diễn biến / Hội chẩn / Tình trạng lúc chuyển', value: slide.transferCase.progress_notes },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.9rem',
                      backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '8px', borderLeft: '4px solid #D32F2F'
                    }}>
                      <span style={{ fontSize: isFullscreen ? '1.1rem' : '0.9rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#D32F2F', fontSize: isFullscreen ? '0.85rem' : '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.15rem' }}>
                          {item.label}
                        </div>
                        <div style={{ color: '#1E293B', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: isFullscreen ? '1.1rem' : '0.9rem', fontWeight: '500' }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== BOTTOM CONTROL BAR ===================== */}
        <div className="no-print" style={{
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: isFullscreen ? 'rgba(11,25,44,0.95)' : '#111827',
          borderTop: '1px solid #1F2937',
          position: 'relative'
        }}>
          {/* Progress bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            backgroundColor: '#1F2937'
          }}>
            <div style={{
              height: '100%', backgroundColor: '#1D4ED8',
              width: `${progressPct}%`, transition: 'width 0.3s ease'
            }} />
          </div>

          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            style={{
              padding: '0.5rem 1.5rem',
              background: currentSlide === 0 ? 'transparent' : '#1F2937',
              color: currentSlide === 0 ? '#374151' : '#D1D5DB',
              border: 'none', borderRadius: '6px',
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.9rem', fontWeight: '600'
            }}
          >
            <FaChevronLeft /> Trước
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#9CA3AF', fontSize: '0.85rem' }}>
            <span>
              Slide <strong style={{ color: 'white', fontSize: '1rem' }}>{currentSlide + 1}</strong>
              <span style={{ color: '#6B7280' }}> / {slides.length}</span>
            </span>
            {!isFullscreen && (
              <button
                onClick={handleExit}
                style={{
                  padding: '0.3rem 0.8rem', backgroundColor: '#1F2937',
                  color: '#9CA3AF', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.78rem', fontWeight: '600'
                }}
              >
                <FaSignOutAlt /> Thoát Trình Chiếu
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            style={{
              padding: '0.5rem 1.5rem',
              background: currentSlide === slides.length - 1 ? 'transparent' : '#1D4ED8',
              color: currentSlide === slides.length - 1 ? '#374151' : 'white',
              border: 'none', borderRadius: '6px',
              cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.9rem', fontWeight: '600'
            }}
          >
            Tiếp <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;
