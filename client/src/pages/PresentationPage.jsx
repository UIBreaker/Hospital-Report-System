import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaAmbulance, FaArrowLeft, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
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
  noi: 'KHOA NỘI',
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
  sieuAm: 'Siêu âm', chuyenVienNgoaiTru: 'Chuyển viện ngoại trú', moLayThai: 'Mổ lấy thai',
  // HSCC specific
  keToa: 'Kê toa', ngoaiTru: 'Ngoại trú', truyenMau: 'Truyền máu',
  tieuPhau: 'Tiểu phẫu', boBot: 'Bó bột', ccNgoaiVien: 'Cấp cứu ngoại viện',
  bsTrucTNT: 'Bác sĩ trực TNT',
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
  // Xét nghiệm / CĐHA
  tongXetNghiem: 'Tổng số xét nghiệm', sinhHoa: 'Sinh hóa', huyetHoc: 'Huyết học',
  dongMau: 'Đông máu', nuocTieu: 'Nước tiểu', mienDich: 'Miễn dịch',
  xQuang: 'X-Quang', ctScanner: 'CT-Scanner', dienTim: 'Điện tim',
};

const getLabel = (key) => {
  return FIELD_LABELS[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Classify metric severity for smart visual styling
const getMetricStyle = (key, value) => {
  const numVal = Number(value);
  const isPositive = !isNaN(numVal) && numVal > 0;

  if (key.toLowerCase().includes('tuvong') || key.toLowerCase().includes('tu_vong')) {
    return isPositive
      ? { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', label: '#B91C1C', badge: '⚠️ Chú ý' }
      : { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B', label: '#475569' };
  }
  if (key.toLowerCase().includes('chuyenvien') || key.toLowerCase().includes('chuyen_vien')) {
    return isPositive
      ? { bg: '#FEF3C7', border: '#D97706', text: '#B45309', label: '#92400E' }
      : { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B', label: '#475569' };
  }
  if (key.toLowerCase().includes('benhmoi') || key.toLowerCase().includes('tongso') || key.toLowerCase().includes('tong_so')) {
    return { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', label: '#1E40AF' };
  }
  if (key.toLowerCase().includes('xuatvien') || key.toLowerCase().includes('xuat_vien')) {
    return { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', label: '#166534' };
  }
  if (key.toLowerCase().includes('hiencon') || key.toLowerCase().includes('hien_con')) {
    return { bg: '#FAF5FF', border: '#A855F7', text: '#7E22CE', label: '#6B21A8' };
  }
  return { bg: '#FFFFFF', border: '#E2E8F0', text: '#0F2C59', label: '#334155' };
};

// Parse structured sections from any department data
const parseDepartmentSections = (reportData) => {
  if (!reportData) return [];
  let data;
  try {
    data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
  } catch (e) {
    return [];
  }

  const sections = [];

  // Special handling for Chẩn đoán hình ảnh (techniques table)
  if (data.techniques && Array.isArray(data.techniques)) {
    const docItems = [];
    if (data.bsSieuAm) docItems.push({ key: 'bsSieuAm', label: 'BS trực Siêu âm', value: String(data.bsSieuAm) });
    if (data.bsXquangCT) docItems.push({ key: 'bsXquangCT', label: 'BS trực Xquang – CT', value: String(data.bsXquangCT) });
    if (docItems.length > 0) {
      sections.push({ title: 'PHÂN CÔNG BÁC SĨ TRỰC', items: docItems });
    }

    const validRows = data.techniques.filter(t => t && (t.tongSo || t.baoHiem || t.noiTru || t.ngoaiTru || t.name));
    if (validRows.length > 0) {
      sections.push({
        title: 'THỐNG KÊ KỸ THUẬT CHẨN ĐOÁN HÌNH ẢNH',
        tableType: 'techniques',
        tableRows: validRows
      });
    }

    if (data.themGio) {
      sections.push({
        title: 'THÊM GIỜ & GHI CHÚ',
        items: [{ key: 'themGio', label: 'Ghi chú thêm giờ', value: String(data.themGio) }]
      });
    }

    return sections;
  }

  // Check if data is divided into named groups (e.g. hscc, tnt, pk21)
  const topKeys = Object.keys(data).filter(k => k !== '_id');
  const hasNestedObjects = topKeys.some(k => data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]));

  if (hasNestedObjects) {
    topKeys.forEach(k => {
      const val = data[k];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        let sectionTitle = getLabel(k);
        if (k === 'hscc') sectionTitle = 'KHỐI HỒI SỨC CẤP CỨU (HSCC)';
        if (k === 'tnt') sectionTitle = 'KHỐI THẬN NHÂN TẠO (TNT)';
        if (k === 'pk21') sectionTitle = 'PHÒNG KHÁM 21';
        if (k === 'noiTru') sectionTitle = 'ĐIỀU TRỊ NỘI TRÚ';
        if (k === 'ngoaiTru') sectionTitle = 'ĐIỀU TRỊ NGOẠI TRÚ';
        if (k === 'keToa') sectionTitle = 'KÊ TOA & BHYT';

        const items = [];
        Object.entries(val).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '' && subK !== '_id') {
            items.push({ key: subK, label: getLabel(subK), value: String(subV) });
          }
        });
        if (items.length > 0) {
          sections.push({ title: sectionTitle, items });
        }
      } else if (val !== null && val !== undefined && val !== '' && !Array.isArray(val)) {
        // Flat item in top level
        let mainSec = sections.find(s => s.title === 'THÔNG TIN CHUNG');
        if (!mainSec) {
          mainSec = { title: 'THÔNG TIN CHUNG', items: [] };
          sections.unshift(mainSec);
        }
        mainSec.items.push({ key: k, label: getLabel(k), value: String(val) });
      }
    });
  } else {
    // Flat object
    const items = [];
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && k !== '_id' && !Array.isArray(v)) {
        items.push({ key: k, label: getLabel(k), value: String(v) });
      }
    });
    if (items.length > 0) {
      sections.push({ title: 'CHỈ SỐ BÁO CÁO TRONG CA TRỰC', items });
    }
  }

  return sections;
};

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100%, 1.15 = 115%, 1.3 = 130%

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
  const slides = useMemo(() => {
    const s = [{ type: 'title', title: 'BÁO CÁO GIAO BAN' }];
    reports.forEach(report => {
      const deptName = DEPARTMENT_DISPLAY_NAMES[report.department_code] || report.department_name || report.department_code;
      s.push({ type: 'department', title: deptName, report });
      if (report.transferCases && report.transferCases.length > 0) {
        report.transferCases.forEach((tc, idx) => {
          s.push({
            type: 'transfer',
            title: `CA CHUYỂN VIỆN – ${deptName}`,
            transferCase: tc,
            caseIndex: idx + 1,
            totalCases: report.transferCases.length,
            deptName,
            report,
          });
        });
      }
    });
    return s;
  }, [reports]);

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
      if (e.key === 'Escape' && !document.fullscreenElement) handleExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B192C', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="spinner" style={{ fontSize: '3.5rem', marginBottom: '1.25rem', color: '#3B82F6' }} />
          <p style={{ fontSize: '1.3rem', fontWeight: '600', opacity: 0.9 }}>Đang tải dữ liệu trình chiếu giao ban...</p>
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
        backgroundColor: '#071224', color: '#1E293B',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ===================== SIDEBAR ===================== */}
      {!isFullscreen && (
        <div className="no-print" style={{
          width: '280px', backgroundColor: '#0F172A',
          borderRight: '1px solid #1E293B',
          display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          {/* Sidebar top action bar */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #1E293B' }}>
            <button
              onClick={handleExit}
              style={{
                width: '100%', padding: '0.65rem 1rem',
                backgroundColor: '#1E293B', color: '#F8FAFC',
                border: '1px solid #334155', borderRadius: '8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                fontSize: '0.9rem', fontWeight: '700', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
            >
              <FaArrowLeft /> Về Bảng Điều Khiển
            </button>
          </div>

          {/* Sidebar header info */}
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '38px', height: '38px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px' }}>TRÌNH CHIẾU GIAO BAN</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{slides.length} slide • {date}</div>
            </div>
          </div>

          {/* Slide list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
            {slides.map((s, i) => {
              const isActive = currentSlide === i;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '0.65rem 0.85rem', marginBottom: '4px',
                    backgroundColor: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1E293B'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: '800'
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {s.type === 'title' ? '🏥 Trang bìa giao ban'
                      : s.type === 'transfer' ? `🚑 Chuyển viện: ${s.deptName ? s.deptName.replace('KHOA ', '') : ''} (Ca ${s.caseIndex})`
                      : `📋 ${s.title}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar footer tools */}
          <div style={{ padding: '0.85rem', borderTop: '1px solid #1E293B', display: 'flex', gap: '0.5rem', backgroundColor: '#0B132B' }}>
            <button
              onClick={() => window.print()}
              style={{
                flex: 1, padding: '0.6rem', backgroundColor: '#1E293B', color: '#E2E8F0',
                border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                fontSize: '0.8rem', fontWeight: '600'
              }}
            >
              <FaPrint /> In Báo Cáo
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toàn màn hình (F)"
              style={{
                padding: '0.6rem 0.9rem', backgroundColor: '#2563EB', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <FaExpand />
            </button>
          </div>
        </div>
      )}

      {/* ===================== MAIN STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', position: 'relative' }}>

        {/* Slide Canvas Scroll Container - FIXED TOP CLIPPING */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isFullscreen ? '2rem 3rem 4rem' : '1.5rem 2rem 3rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '100%',
            maxWidth: isFullscreen ? '1560px' : '1200px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF', color: '#1E293B',
            borderRadius: '20px',
            padding: isFullscreen ? '3rem 4rem' : '2.2rem 3rem',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.25s ease-out',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            zoom: fontScale,
            WebkitZoom: fontScale,
          }}>
            {/* Top decorative gradient line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
              background: slide.type === 'title'
                ? 'linear-gradient(90deg, #0F2C59, #D32F2F, #2E7D32)'
                : slide.type === 'transfer'
                ? 'linear-gradient(90deg, #DC2626, #EA580C)'
                : 'linear-gradient(90deg, #1E40AF, #3B82F6, #0D9488)'
            }} />

            {/* ==================== 1. TITLE SLIDE ==================== */}
            {slide.type === 'title' && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                padding: '2.5rem 1rem', gap: '2rem'
              }}>
                <div style={{
                  width: isFullscreen ? '150px' : '120px',
                  height: isFullscreen ? '150px' : '120px',
                  borderRadius: '50%', backgroundColor: '#FFF',
                  boxShadow: '0 20px 45px rgba(15,44,89,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
                }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                    color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '2.5px', marginBottom: '0.6rem'
                  }}>
                    TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                  </div>
                  <h1 style={{
                    fontSize: isFullscreen ? '4.2rem' : '3.2rem',
                    color: '#0F2C59', fontWeight: '900', margin: '0 0 1.25rem',
                    letterSpacing: '-1.5px', lineHeight: 1.15
                  }}>
                    BÁO CÁO GIAO BAN
                  </h1>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    fontSize: isFullscreen ? '1.6rem' : '1.25rem',
                    color: '#1E293B', fontWeight: '800',
                    padding: '0.85rem 2.75rem',
                    backgroundColor: '#EFF6FF', borderRadius: '999px',
                    border: '2px solid #BFDBFE',
                    boxShadow: '0 4px 15px rgba(59,130,246,0.12)'
                  }}>
                    📅 {formatDate(date)}
                  </div>
                </div>

                {reports.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '2.5rem', marginTop: '1.5rem',
                    flexWrap: 'wrap', justifyContent: 'center'
                  }}>
                    <div style={{
                      backgroundColor: '#F8FAFC', border: '2px solid #E2E8F0',
                      borderRadius: '16px', padding: '1.25rem 2.5rem', minWidth: '200px'
                    }}>
                      <div style={{ fontSize: isFullscreen ? '3.2rem' : '2.4rem', fontWeight: '900', color: '#1E40AF', lineHeight: 1 }}>
                        {reports.length}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem' }}>
                        Khoa phòng đã nộp
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#FEF2F2', border: '2px solid #FECACA',
                      borderRadius: '16px', padding: '1.25rem 2.5rem', minWidth: '200px'
                    }}>
                      <div style={{ fontSize: isFullscreen ? '3.2rem' : '2.4rem', fontWeight: '900', color: '#DC2626', lineHeight: 1 }}>
                        {reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0)}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#991B1B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem' }}>
                        Ca chuyển viện
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 2. DEPARTMENT SLIDE ==================== */}
            {slide.type === 'department' && (() => {
              const sections = parseDepartmentSections(slide.report.report_data);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Department top banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '1.5rem', marginBottom: '1.75rem',
                    borderBottom: '4px solid #1E40AF'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '1rem' : '0.85rem',
                        color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                        letterSpacing: '2px', marginBottom: '0.35rem'
                      }}>
                        TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.8rem' : '2.1rem',
                        color: '#0F2C59', fontWeight: '900', margin: 0, lineHeight: 1.2
                      }}>
                        {slide.title}
                      </h2>
                      <div style={{
                        marginTop: '0.75rem',
                        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: '#EFF6FF', color: '#1E40AF',
                          padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '700',
                          fontSize: isFullscreen ? '1.15rem' : '0.95rem', border: '1px solid #BFDBFE'
                        }}>
                          👨‍⚕️ Bác sĩ trực: <strong>{slide.report.doctor_name}</strong>
                        </span>
                        {slide.report.room && (
                          <span style={{
                            backgroundColor: '#F1F5F9', color: '#334155',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '1.05rem' : '0.9rem'
                          }}>
                            🏥 Phòng: <strong>{slide.report.room}</strong>
                          </span>
                        )}
                        {slide.report.shift_time && (
                          <span style={{
                            backgroundColor: '#FEF3C7', color: '#92400E',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '1.05rem' : '0.9rem', border: '1px solid #FDE68A'
                          }}>
                            ⏰ Ca: <strong>{slide.report.shift_time}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '80px' : '60px', height: isFullscreen ? '80px' : '60px', flexShrink: 0 }} />
                  </div>

                  {/* Section & Metric Grid */}
                  {sections.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                      {sections.map((section, sIdx) => (
                        <div key={sIdx}>
                          {/* Section Title Header */}
                          {sections.length > 1 && (
                            <div style={{
                              fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                              fontWeight: '800', color: '#0F2C59',
                              backgroundColor: '#EFF6FF',
                              padding: '0.6rem 1.2rem', borderRadius: '8px',
                              borderLeft: '5px solid #2563EB',
                              marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                              {section.title}
                            </div>
                          )}

                          {/* Table Type Presentation View (Chẩn đoán hình ảnh) */}
                          {section.tableType === 'techniques' && section.tableRows ? (
                            <div style={{ overflowX: 'auto', marginTop: '0.5rem', marginBottom: '1rem' }}>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'separate',
                                borderSpacing: '0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                                border: '1.5px solid #CBD5E1'
                              }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                                    <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'left', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>KỸ THUẬT</th>
                                    <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>TỔNG SỐ</th>
                                    <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>BẢO HIỂM</th>
                                    <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>NỘI TRÚ</th>
                                    <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>NGOẠI TRÚ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.tableRows.map((tech, tIdx) => (
                                    <tr 
                                      key={tIdx} 
                                      style={{ 
                                        backgroundColor: tIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                        borderBottom: '1px solid #E2E8F0'
                                      }}
                                    >
                                      <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', fontWeight: '800', color: '#0F2C59', borderBottom: '1px solid #E2E8F0', fontSize: isFullscreen ? '1.2rem' : '1rem' }}>
                                        {tech.name}
                                      </td>
                                      <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '900', color: '#1E40AF', fontSize: isFullscreen ? '1.45rem' : '1.2rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                        <span style={{ backgroundColor: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                                          {tech.tongSo || '0'}
                                        </span>
                                      </td>
                                      <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '800', color: '#059669', fontSize: isFullscreen ? '1.3rem' : '1.1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                        {tech.baoHiem || '0'}
                                      </td>
                                      <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.2rem' : '1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                        {tech.noiTru || '0'}
                                      </td>
                                      <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.2rem' : '1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                        {tech.ngoaiTru || '0'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : section.items ? (
                            /* Metric Cards Grid */
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: isFullscreen
                                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                                : 'repeat(auto-fill, minmax(240px, 1fr))',
                              gap: isFullscreen ? '1.1rem' : '0.85rem'
                            }}>
                              {section.items.map((item, iIdx) => {
                                const style = getMetricStyle(item.key, item.value);
                                return (
                                  <div
                                    key={iIdx}
                                    style={{
                                      backgroundColor: style.bg,
                                      border: `2px solid ${style.border}`,
                                      borderRadius: '12px',
                                      padding: isFullscreen ? '1rem 1.4rem' : '0.75rem 1.1rem',
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                      transition: 'transform 0.15s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <span style={{
                                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                                        fontWeight: '700', color: style.label
                                      }}>
                                        {item.label}
                                      </span>
                                      {style.badge && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#DC2626' }}>
                                          {style.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{
                                      fontSize: isFullscreen ? '2.4rem' : '1.8rem',
                                      fontWeight: '900', color: style.text,
                                      fontFamily: "'Roboto Mono', monospace",
                                      marginLeft: '1rem'
                                    }}>
                                      {item.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '1.4rem', paddingTop: '4rem' }}>
                      Không có số liệu báo cáo nào trong ca trực
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 3. TRANSFER CASE SLIDE ==================== */}
            {slide.type === 'transfer' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Emergency Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: '1.5rem',
                  borderBottom: '4px solid #DC2626'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: isFullscreen ? '70px' : '56px', height: isFullscreen ? '70px' : '56px',
                      borderRadius: '50%', backgroundColor: '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)'
                    }}>
                      <FaAmbulance style={{ fontSize: isFullscreen ? '2.4rem' : '1.8rem', color: '#DC2626' }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                        color: '#991B1B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px'
                      }}>
                        🚑 {slide.deptName} • CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases}
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.4rem' : '1.8rem',
                        color: '#DC2626', fontWeight: '900', margin: 0, lineHeight: 1.15
                      }}>
                        THÔNG TIN BỆNH NHÂN CHUYỂN VIỆN
                      </h2>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '70px' : '50px', height: isFullscreen ? '70px' : '50px' }} />
                </div>

                {/* Patient Name Banner */}
                {slide.transferCase.patient_name && (
                  <div style={{
                    backgroundColor: '#FEF2F2', borderRadius: '16px',
                    border: '2px solid #FCA5A5',
                    borderLeft: '8px solid #DC2626',
                    padding: isFullscreen ? '1.25rem 2rem' : '0.9rem 1.4rem',
                    marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 4px 15px rgba(220,38,38,0.08)'
                  }}>
                    <span style={{ fontSize: isFullscreen ? '2.2rem' : '1.6rem' }}>👤</span>
                    <div>
                      <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.75rem', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Họ tên • Tuổi • Địa chỉ bệnh nhân:
                      </div>
                      <div style={{
                        fontWeight: '900',
                        fontSize: isFullscreen ? '1.85rem' : '1.4rem',
                        color: '#991B1B', lineHeight: 1.3
                      }}>
                        {slide.transferCase.patient_name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Details Structured Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isFullscreen ? '1rem' : '0.75rem' }}>
                  {[
                    { icon: '⏰', label: 'Giờ / Ngày vào viện', value: slide.transferCase.admission_time, highlight: false },
                    { icon: '📋', label: 'Lý do vào viện', value: slide.transferCase.reason, highlight: false },
                    { icon: '🔬', label: 'Cận lâm sàng / X-Quang / Xét nghiệm', value: slide.transferCase.clinical_tests, highlight: false },
                    { icon: '🏥', label: 'Chẩn đoán xác định', value: slide.transferCase.diagnosis, highlight: true },
                    { icon: '💊', label: 'Xử trí ban đầu', value: slide.transferCase.initial_treatment, highlight: false },
                    { icon: '📝', label: 'Diễn biến / Hội chẩn / Tình trạng lúc chuyển', value: slide.transferCase.progress_notes, highlight: true },
                  ].filter(item => item.value).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: item.highlight ? '#FEF3C7' : '#F8FAFC',
                        borderRadius: '12px',
                        border: `1.5px solid ${item.highlight ? '#FCD34D' : '#E2E8F0'}`,
                        borderLeft: `6px solid ${item.highlight ? '#D97706' : '#3B82F6'}`,
                        padding: isFullscreen ? '1rem 1.5rem' : '0.75rem 1.1rem',
                        display: 'flex', gap: '1rem', alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: isFullscreen ? '1.5rem' : '1.2rem', marginTop: '2px' }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '800',
                          color: item.highlight ? '#92400E' : '#1E40AF',
                          fontSize: isFullscreen ? '1.05rem' : '0.9rem',
                          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem'
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          color: '#0F172A',
                          lineHeight: '1.6', whiteSpace: 'pre-wrap',
                          fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                          fontWeight: '600'
                        }}>
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

        {/* ===================== BOTTOM NAVIGATION BAR ===================== */}
        <div className="no-print" style={{
          padding: '0 2rem',
          height: '65px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#0F172A',
          borderTop: '1px solid #1E293B',
          position: 'relative',
          flexShrink: 0
        }}>
          {/* Top Progress bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            backgroundColor: '#1E293B'
          }}>
            <div style={{
              height: '100%', backgroundColor: '#3B82F6',
              width: `${progressPct}%`, transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Left: Previous button */}
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            style={{
              padding: '0.65rem 1.75rem',
              backgroundColor: currentSlide === 0 ? 'transparent' : '#1E293B',
              color: currentSlide === 0 ? '#475569' : '#F8FAFC',
              border: `1px solid ${currentSlide === 0 ? 'transparent' : '#334155'}`,
              borderRadius: '8px',
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '1rem', fontWeight: '700', transition: 'all 0.15s'
            }}
          >
            <FaChevronLeft /> Slide trước
          </button>

          {/* Center: Slide indicator + Font Zoom + Fullscreen Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '1rem' }}>
              <span>Slide</span>
              <span style={{
                backgroundColor: '#2563EB', color: '#FFFFFF',
                padding: '0.2rem 0.75rem', borderRadius: '6px',
                fontWeight: '900', fontSize: '1.15rem'
              }}>
                {currentSlide + 1}
              </span>
              <span>/ {slides.length}</span>
            </div>

            {/* Font Zoom Controls */}
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: '#1E293B', border: '1px solid #334155',
              borderRadius: '8px', padding: '3px 6px', gap: '4px'
            }}>
              <button
                onClick={() => setFontScale(p => Math.max(0.8, Number((p - 0.2).toFixed(1))))}
                title="Thu nhỏ chữ"
                style={{
                  background: '#334155', color: '#F1F5F9', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700'
                }}
              >
                <FaSearchMinus /> Giảm
              </button>
              <button
                onClick={() => setFontScale(1)}
                title="Đặt lại cỡ chữ mặc định (100%)"
                style={{
                  background: fontScale === 1 ? '#0F172A' : '#2563EB',
                  color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.6rem', cursor: 'pointer', borderRadius: '6px',
                  fontSize: '0.85rem', fontWeight: '800'
                }}
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                onClick={() => setFontScale(p => Math.min(1.8, Number((p + 0.2).toFixed(1))))}
                title="Phóng to chữ"
                style={{
                  background: '#2563EB', color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.4)'
                }}
              >
                <FaSearchPlus /> Phóng to
              </button>
            </div>

            {/* Fullscreen Button in bottom bar */}
            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: '#1E293B', color: '#38BDF8',
                border: '1px solid #334155', borderRadius: '8px',
                padding: '0.45rem 0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: '700'
              }}
            >
              {isFullscreen ? <><FaCompress /> Thu nhỏ</> : <><FaExpand /> Toàn màn hình</>}
            </button>
          </div>

          {/* Right: Next button */}
          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            style={{
              padding: '0.65rem 2rem',
              backgroundColor: currentSlide === slides.length - 1 ? 'transparent' : '#2563EB',
              color: currentSlide === slides.length - 1 ? '#475569' : '#FFFFFF',
              border: `1px solid ${currentSlide === slides.length - 1 ? 'transparent' : '#3B82F6'}`,
              borderRadius: '8px',
              cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '1rem', fontWeight: '700',
              boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s'
            }}
          >
            Slide tiếp <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;
