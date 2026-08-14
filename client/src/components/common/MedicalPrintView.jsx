import React, { useState } from 'react';
import { FaPrint, FaTimes, FaHospital, FaFilePdf, FaSpinner } from 'react-icons/fa';

const DEPARTMENT_ORDER = [
  'lck', 'xn', 'cdha', 'hscc_tnt', 'noi', 'nhi',
  'nhiem', 'san', 'yhct_phcn', 'ngoai_th', 'ctch', 'gmhs'
];

const DEPARTMENT_NAMES = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét nghiệm',
  cdha: 'Chẩn đoán hình ảnh',
  hscc_tnt: 'Hồi sức cấp cứu – Thận nhân tạo',
  noi: 'Khoa Nội tổng hợp',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Truyền nhiễm',
  san: 'Khoa Sản (CSSK Sinh sản)',
  yhct_phcn: 'Y học cổ truyền – PHCN',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Phẫu thuật, gây mê hồi sức'
};

// Từ điển chuẩn hóa toàn bộ mã biến y tế sang tiếng Việt có dấu chuẩn Bộ Y Tế
const VIETNAMESE_DICTIONARY = {
  // --- Khoa Liên Chuyên Khoa (LCK) ---
  tmh_tongSo: 'Tai Mũi Họng (Tổng khám)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'Răng Hàm Mặt + Nội (Tổng khám)',
  rhm_noi_thuThuat: 'Răng Hàm Mặt + Nội (Thủ thuật)',
  rhm_noiTru: 'RHM nội trú',
  rhm_ngoaiTru: 'RHM ngoại trú',
  daLieu_tongSo: 'Da liễu (Tổng khám)',
  tong4ck_tongSo: 'Tổng 4 chuyên khoa',
  tong4ck_thuThuat: 'Tổng thủ thuật 4CK',
  nhapVien_tongSo: 'Nhập viện',
  chuyenVien_tongSo: 'Chuyển viện',

  // --- Các chỉ số dùng chung toàn viện ---
  tongSoKham: 'Tổng số khám',
  benhCu: 'Bệnh cũ',
  benhMoi: 'Bệnh mới nhập viện',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn điều trị',
  hienCo: 'Hiện có tại khoa',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  baoHiem: 'BHYT',
  bhyt: 'BHYT',
  dichVu: 'Dịch vụ',
  noiTru: 'Nội trú',
  ngoaiTru: 'Ngoại trú',
  keToa: 'Kê toa',
  tongSo: 'Tổng số',
  tongSoKhamBenh: 'Tổng khám bệnh',
  soCaKham: 'Số ca khám',

  // --- Khoa Xét Nghiệm (XN) ---
  tongXetNghiem: 'Tổng XN thực hiện',
  sinhHoa: 'Sinh hóa',
  huyetHoc: 'Huyết học',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  viSinh: 'Vi sinh',
  mienDich: 'Miễn dịch',

  // --- Chẩn Đoán Hình Ảnh (CDHA) ---
  tongSoSieuAm: 'Tổng siêu âm',
  tongSoXquang: 'Tổng X-quang',
  tongSoCT: 'Tổng CT Scanner',
  bsSieuAm: 'BS trực Siêu âm',
  bsXquangCT: 'BS trực Xquang - CT',

  // --- Khoa HSCC – TNT ---
  tnt_ctdk: 'Chạy thận định kỳ (CTĐK)',
  ctdk: 'Chạy thận định kỳ',
  tnt_benhCu: 'Bệnh cũ (TNT)',
  tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)',
  tnt_chuyenVien: 'Chuyển viện (TNT)',
  tnt_chuyenKhoa: 'Chuyển khoa (TNT)',
  tnt_noiTru: 'Thận nhân tạo nội trú',
  tnt_hienCon: 'Hiện còn (TNT)',
  tieuPhau: 'Tiểu phẫu',
  boBot: 'Bó bột',
  truyenMau: 'Truyền máu',
  ccNgoaiVien: 'Cấp cứu ngoài viện',
  thoMay: 'Thở máy',
  cpap: 'Thở CPAP',
  thoOxy: 'Thở Oxy',
  bsTrucTNT: 'Bác sĩ trực TNT',

  // --- Khoa Sản ---
  sanhThuong: 'Sanh thường',
  sanhHut: 'Sanh hút / Giúp sinh',
  moLayThai: 'Mổ lấy thai',
  moDe: 'Mổ đẻ',
  choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm sản',
  hauPhau: 'Hậu phẫu',
  chuyenVienNgoaiTru: 'Chuyển viện ngoại trú',

  // --- Khoa Nhi & Nhiễm ---
  duoi6Thang: 'Trẻ dưới 6 tháng',
  duoi5Tuoi: 'Trẻ dưới 5 tuổi',
  chuyenKhoaSan: 'Chuyển khoa Sản',
  xinXuatVien: 'Xin xuất viện',

  // --- Gây Mê Hồi Sức (GMHS) ---
  tongSoCaMo: 'Tổng số ca mổ',
  cc_ctch: 'Mổ cấp cứu - CTCH',
  cc_ngoaiTH: 'Mổ cấp cứu - Ngoại TH',
  cc_san: 'Mổ cấp cứu - Sản khoa',
  ct_ctch: 'Mổ kế hoạch - CTCH',
  ct_ngoaiTH: 'Mổ kế hoạch - Ngoại TH',
  ct_san: 'Mổ kế hoạch - Sản khoa',
  moKhac: 'Mổ khác',
  soCaGiamDau: 'Ca giảm đau sau mổ',
  soCaGayMe: 'Số ca gây mê',
  soCaHoiTinh: 'Số ca theo dõi hồi tỉnh',

  // --- Y Học Cổ Truyền - PHCN ---
  chamCuu: 'Châm cứu',
  xoaBop: 'Xoa bóp bấm huyệt',
  vatLyTriLieu: 'Vật lý trị liệu',
  phcn: 'Phục hồi chức năng',

  // --- Ghi chú, nhân sự ---
  nhanSu: 'Thành phần nhân sự',
  dieuDuongTruc: 'Điều dưỡng trực ca',
  themGio: 'Ghi chú thêm giờ / Diễn biến',
  tinhHinhChung: 'Tình hình chung ca trực',
  ghiChu: 'Ghi chú',
  hienConGhiChu: 'Ghi chú hiện còn',
  chuyenVienTT: 'Chuyển viện tuyến trên'
};

// Hàm dịch mã trường tự động sang tiếng Việt
const translateFieldKey = (key, parentKey = '') => {
  if (!key) return '';
  if (VIETNAMESE_DICTIONARY[key]) return VIETNAMESE_DICTIONARY[key];

  // Thử tra cứu khi có prefix
  const combinedKey = parentKey ? `${parentKey}_${key}` : key;
  if (VIETNAMESE_DICTIONARY[combinedKey]) return VIETNAMESE_DICTIONARY[combinedKey];

  // Chuyển đổi camelCase / snake_case tự động
  let formatted = key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();

  // Từ điển ánh xạ từ phổ biến
  const wordMap = {
    'tong so': 'Tổng số',
    'benh cu': 'Bệnh cũ',
    'benh moi': 'Bệnh mới',
    'xuat vien': 'Xuất viện',
    'chuyen vien': 'Chuyển viện',
    'chuyen khoa': 'Chuyển khoa',
    'hien con': 'Hiện còn',
    'hien co': 'Hiện có',
    'tu vong': 'Tử vong',
    'noi tru': 'Nội trú',
    'ngoai tru': 'Ngoại trú',
    'bao hiem': 'BHYT',
    'ke toa': 'Kê toa',
    'tnt': 'TNT',
    'hscc': 'HSCC',
    'ctch': 'CTCH',
    'rhm': 'RHM',
    'tmh': 'TMH',
    'pk': 'Phòng khám',
    'sieu am': 'Siêu âm',
    'xquang': 'X-Quang'
  };

  Object.entries(wordMap).forEach(([en, vi]) => {
    formatted = formatted.replace(new RegExp(en, 'gi'), vi);
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatPatientAge = (ageVal) => {
  if (!ageVal) return '';
  const str = String(ageVal).trim();
  const clean = str.replace(/tuổi/gi, '').replace(/,/g, '').replace(/\./g, '').trim();
  return clean ? `${clean} tuổi` : '';
};

const MedicalPrintView = ({ date, reports = [], onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Sắp xếp báo cáo theo đúng thứ tự 12 khoa phòng chuẩn
  const sortedReports = [...reports].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
    const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  const reportMap = {};
  sortedReports.forEach(r => {
    reportMap[r.department_code] = r;
  });

  // Gom toàn bộ ca bệnh đặc biệt
  const allSurgeryCases = [];
  const allDeathCases = [];
  const allTransferCases = [];
  const allCriticalCases = [];

  sortedReports.forEach(report => {
    const deptName = DEPARTMENT_NAMES[report.department_code] || report.department_name || report.department_code;
    
    if (report.surgeryCases && Array.isArray(report.surgeryCases)) {
      report.surgeryCases.forEach(sc => {
        allSurgeryCases.push({ ...sc, departmentName: deptName });
      });
    }
    if (report.deathCases && Array.isArray(report.deathCases)) {
      report.deathCases.forEach(dc => {
        allDeathCases.push({ ...dc, departmentName: deptName });
      });
    }
    if (report.transferCases && Array.isArray(report.transferCases)) {
      report.transferCases.forEach(tc => {
        allTransferCases.push({ ...tc, departmentName: deptName });
      });
    }
    if (report.criticalCases && Array.isArray(report.criticalCases)) {
      report.criticalCases.forEach(cc => {
        allCriticalCases.push({ ...cc, departmentName: deptName });
      });
    }
  });

  // Tính tổng số liệu toàn viện
  let sumKham = 0, sumCu = 0, sumMoi = 0, sumXuat = 0, sumChuyen = 0, sumMo = 0, sumTuVong = 0;
  DEPARTMENT_ORDER.forEach(code => {
    const report = reportMap[code];
    if (!report) return;
    const repData = typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {});
    sumKham += parseInt(repData.tongSoKham || repData.tongSo || repData.tmh_tongSo || (repData.hscc?.tongSoKham) || 0, 10) || 0;
    sumCu += parseInt(repData.benhCu || repData.tnt_benhCu || (repData.hscc?.benhCu) || (repData.noiTru?.benhCu) || 0, 10) || 0;
    sumMoi += parseInt(repData.benhMoi || repData.tnt_benhMoi || (repData.hscc?.benhMoi) || (repData.noiTru?.benhMoi) || 0, 10) || 0;
    sumXuat += parseInt(repData.xuatVien || repData.tnt_xuatVien || (repData.hscc?.xuatVien) || (repData.noiTru?.xuatVien) || 0, 10) || 0;
    sumChuyen += parseInt(repData.chuyenVien || repData.tnt_chuyenVien || (repData.hscc?.chuyenVien) || 0, 10) || (report.transferCases?.length || 0);
    sumMo += parseInt(repData.tongSoCaMo || 0, 10) || (report.surgeryCases?.length || 0);
    sumTuVong += parseInt(repData.tuVong || (repData.hscc?.tuVong) || 0, 10) || (report.deathCases?.length || 0);
  });

  // Định dạng ngày hiển thị
  const dateObj = new Date(date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
  const formattedDateStr = `${dayName}, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
  const now = new Date();
  const printDateStr = `Bình Long, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  // Phân bổ 12 khoa thành 2 nhóm (6 khoa / trang) để ngắt trang hoàn hảo
  const deptsGroup1 = DEPARTMENT_ORDER.slice(0, 6);
  const deptsGroup2 = DEPARTMENT_ORDER.slice(6, 12);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.printable-medical-document');
    if (!element) return;
    setDownloadingPdf(true);

    try {
      let html2pdfModule;
      try {
        const mod = await import('html2pdf.js');
        html2pdfModule = mod.default || mod;
      } catch (importErr) {
        if (window.html2pdf) {
          html2pdfModule = window.html2pdf;
        } else {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Không thể tải thư viện html2pdf'));
            document.head.appendChild(script);
          });
          html2pdfModule = window.html2pdf;
        }
      }

      const opt = {
        margin: [10, 10, 10, 10], // Chuẩn lề 10mm đều 4 phía
        filename: `Bao_Cao_Giao_Ban_Y_Te_${date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#FFFFFF',
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { 
          mode: ['css', 'legacy'], 
          avoid: ['.dept-card', '.patient-card', '.patient-case-box', 'tr', 'thead', 'h1', 'h2', 'h3', 'h4', '.table-title', '.report-section-box', '.pdf-avoid-break'] 
        }
      };

      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed, fallback to print:', err);
      alert('Không thể tạo file PDF tự động. Trình duyệt sẽ mở hộp thoại In để bạn chọn "Lưu dưới dạng PDF" (Save as PDF).');
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Render card chuyên môn từng khoa
  const renderDeptCard = (code) => {
    const report = reportMap[code];
    const deptName = DEPARTMENT_NAMES[code] || code;
    const repData = report ? (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {})) : {};

    const metrics = [];
    const notes = [];

    // Duyệt dữ liệu và mapping nhãn
    Object.entries(repData).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || k === '_id') return;

      if (k === 'themGio' || k === 'tinhHinhChung' || k === 'ghiChu') {
        notes.push({ label: translateFieldKey(k), value: String(v) });
        return;
      }

      if (typeof v === 'object' && !Array.isArray(v)) {
        const subGroupTitle = translateFieldKey(k);
        Object.entries(v).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '' && subK !== '_id') {
            metrics.push({
              label: `${translateFieldKey(subK, k)} (${subGroupTitle})`,
              value: String(subV)
            });
          }
        });
      } else if (Array.isArray(v)) {
        if (v.length > 0 && typeof v[0] === 'object') {
          v.forEach((item) => {
            if (item && item.name) {
              metrics.push({
                label: item.name,
                value: `Tổng: ${item.tongSo || 0} | BHYT: ${item.baoHiem || 0} | Nội trú: ${item.noiTru || 0}`
              });
            }
          });
        }
      } else {
        metrics.push({
          label: translateFieldKey(k),
          value: String(v)
        });
      }
    });

    return (
      <div key={code} className="dept-card" style={{
        border: '1px solid #CBD5E1',
        borderLeft: '4px solid #1E3A8A',
        borderRadius: '4px',
        padding: '6px 8px',
        fontSize: '8.5pt',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        height: 'auto',
        minHeight: 'unset',
        marginBottom: '8px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#1E3A8A', borderBottom: '1px solid #E2E8F0', paddingBottom: '3px', marginBottom: '4px', fontSize: '9pt', display: 'flex', justifyContent: 'space-between' }}>
          <span>🏥 {deptName}</span>
          <span style={{ fontSize: '8pt', color: report ? '#16A34A' : '#DC2626', fontWeight: 'bold' }}>
            {report ? '✓ Đã nộp' : '✗ Chưa nộp'}
          </span>
        </div>

        <div style={{ fontSize: '8pt', color: '#334155', marginBottom: '4px', backgroundColor: '#F8FAFC', padding: '2px 5px', borderRadius: '3px' }}>
          <strong>BS trực:</strong> {report?.doctor_name || '—'} | <strong>ĐD trực:</strong> {report?.nurse_name || '—'} {report?.room ? `| P: ${report.room}` : ''}
          {report?.overtime_staff && report.overtime_staff.length > 0 && (
            <span> | <strong>Tăng cường:</strong> {report.overtime_staff.map(o => `${o.staffName} (${o.time})`).join(', ')}</span>
          )}
        </div>

        {metrics.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '8pt' }}>
            {metrics.map((m, mIdx) => (
              <div key={mIdx} style={{ backgroundColor: '#F8FAFC', padding: '2px 4px', border: '1px solid #E2E8F0', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569', paddingRight: '4px' }}>{m.label}:</span>
                <strong style={{ color: '#0F2C59', whiteSpace: 'nowrap' }}>{m.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontStyle: 'italic', color: '#94A3B8', fontSize: '8pt' }}>Chưa có số liệu chuyên môn chi tiết</div>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: '4px', paddingTop: '3px', borderTop: '1px dashed #CBD5E1', fontSize: '7.8pt', color: '#78350F' }}>
            {notes.map((n, nIdx) => (
              <div key={nIdx}>
                <strong>{n.label}:</strong> {n.value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="medical-print-modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0B132B',
      zIndex: 99999,
      overflowY: 'auto',
      padding: '1.5rem 1rem 5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Print Specific CSS Embedded */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm 10mm;
        }

        @media print {
          body {
            background-color: #FFFFFF !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, .medical-print-modal-backdrop {
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
            position: static !important;
            overflow: visible !important;
          }
          .printable-medical-document {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }

        /* 1. CHỐNG CẮT ĐÔI PHẦN TỬ */
        .dept-card, .patient-card, .patient-case-box, tr, .report-section-box, .pdf-avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        h1, h2, h3, h4, .table-title, thead {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }

        /* 2. TỰ ĐỘNG LẶP LẠI TIÊU ĐỀ BẢNG KHI SANG TRANG MỚI */
        table.pdf-table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: auto !important;
          margin-bottom: 8px !important;
        }

        table.pdf-table thead {
          display: table-header-group !important; /* Bắt buộc để lặp lại header */
        }

        table.pdf-table tfoot {
          display: table-footer-group !important;
        }

        table.pdf-table tbody tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        table.pdf-table th, table.pdf-table td {
          height: auto !important;
          min-height: 24px;
          padding: 4px 5px !important;
          vertical-align: middle !important;
          word-wrap: break-word !important;
          white-space: normal !important;
          line-height: 1.35 !important;
          overflow: visible !important;
          box-sizing: border-box !important;
          border: 1px solid #000000 !important;
        }

        /* Section Page Breaks */
        .pdf-page-section {
          page-break-after: always;
          break-after: page;
        }
      `}</style>

      {/* Control bar (hidden during print) */}
      <div className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '0.85rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        maxWidth: '840px',
        width: '100%',
        boxSizing: 'border-box',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
          <FaHospital style={{ color: '#60A5FA', fontSize: '1.4rem' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px' }}>
              XUẤT BẢN BÁO CÁO GIAO BAN Y TẾ
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
              Định dạng chuẩn A4 chính quy phục vụ in ấn và xuất file PDF
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#16A34A', color: '#FFFFFF',
              border: 'none', padding: '0.65rem 1.25rem',
              borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
            }}
            title="Mở hộp thoại in ấn A4 (hoặc bấm Ctrl+P)"
          >
            <FaPrint /> In Báo Cáo (Ctrl + P)
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            style={{
              backgroundColor: '#DC2626', color: '#FFFFFF',
              border: 'none', padding: '0.65rem 1.25rem',
              borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
            title="Tải trực tiếp file PDF chất lượng cao về máy tính"
          >
            {downloadingPdf ? (
              <><FaSpinner className="spinner" /> Đang tạo PDF...</>
            ) : (
              <><FaFilePdf style={{ fontSize: '1.05rem' }} /> Tải File PDF (.pdf)</>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)', padding: '0.65rem 1.1rem',
              borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
            }}
          >
            <FaTimes /> Đóng
          </button>
        </div>
      </div>

      {/* A4 Document Canvas */}
      <div className="printable-medical-document" style={{
        width: '100%',
        maxWidth: '840px',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        borderRadius: '6px',
        padding: '12mm 12mm',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '10.5pt',
        lineHeight: 1.35,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        marginBottom: '4rem'
      }}>
        {/* =========================================================================
            SECTION 1: TRANG BÌA & BẢNG TỔNG HỢP SỐ LIỆU TOÀN VIỆN (CỐ ĐỊNH TRANG 1)
        ========================================================================= */}
        <div className="pdf-page-section report-section-box" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Document Header */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.65rem', backgroundColor: '#FFFFFF' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
                <td style={{ width: '45%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000', border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    SỞ Y TẾ BÌNH PHƯỚC
                  </div>
                  <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>
                    TTYT KHU VỰC BÌNH LONG
                  </div>
                  <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>
                    Phòng Kế Hoạch - Nghiệp Vụ
                  </div>
                  <div style={{ width: '60px', height: '1px', backgroundColor: '#000000', margin: '3px auto 0' }}></div>
                </td>
                <td style={{ width: '55%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000', border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div style={{ width: '90px', height: '1px', backgroundColor: '#000000', margin: '3px auto 0' }}></div>
                  <div style={{ fontSize: '9pt', fontStyle: 'italic', marginTop: '3px' }}>
                    {printDateStr}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Document Title */}
          <div style={{ textAlign: 'center', marginBottom: '0.85rem', backgroundColor: '#FFFFFF' }}>
            <h1 className="table-title" style={{
              fontSize: '13.5pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              margin: '0 0 2px 0',
              color: '#0F2C59',
              letterSpacing: '0.5px'
            }}>
              BÁO CÁO GIAO BAN BỆNH VIỆN
            </h1>
            <div style={{ fontSize: '10pt', fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }}>
              ({formattedDateStr})
            </div>
          </div>

          {/* Section I Header */}
          <div className="table-title" style={{ fontSize: '10.5pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '2px' }}>
            PHẦN I: TỔNG HỢP SỐ LIỆU GIAO BAN TOÀN VIỆN ({sortedReports.length}/12 KHOA)
          </div>

          {/* Summary Table 12 Departments */}
          <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8.5pt', backgroundColor: '#FFFFFF', lineHeight: 1.3 }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'center', color: '#000000', fontWeight: 'bold' }}>
                <th style={{ width: '4%' }}>STT</th>
                <th style={{ width: '22%', textAlign: 'left' }}>Khoa / Phòng</th>
                <th style={{ width: '8%' }}>Trạng Thái</th>
                <th style={{ width: '16%', textAlign: 'left' }}>Bác Sĩ Trực</th>
                <th style={{ width: '16%', textAlign: 'left' }}>Điều Dưỡng</th>
                <th style={{ width: '5%' }}>Khám</th>
                <th style={{ width: '5%' }}>Cũ</th>
                <th style={{ width: '5%' }}>Mới</th>
                <th style={{ width: '5%' }}>Xuất</th>
                <th style={{ width: '5%' }}>Chuyển</th>
                <th style={{ width: '5%' }}>Mổ</th>
                <th style={{ width: '5%' }}>Tử Vong</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENT_ORDER.map((code, idx) => {
                const report = reportMap[code];
                const deptName = DEPARTMENT_NAMES[code] || code;
                const isSubmitted = !!report;
                const repData = report ? (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {})) : {};

                let kham = parseInt(repData.tongSoKham || repData.tongSo || repData.tmh_tongSo || (repData.hscc?.tongSoKham) || 0, 10) || 0;
                let cu = parseInt(repData.benhCu || repData.tnt_benhCu || (repData.hscc?.benhCu) || (repData.noiTru?.benhCu) || 0, 10) || 0;
                let moi = parseInt(repData.benhMoi || repData.tnt_benhMoi || (repData.hscc?.benhMoi) || (repData.noiTru?.benhMoi) || 0, 10) || 0;
                let xuat = parseInt(repData.xuatVien || repData.tnt_xuatVien || (repData.hscc?.xuatVien) || (repData.noiTru?.xuatVien) || 0, 10) || 0;
                let chuyen = parseInt(repData.chuyenVien || repData.tnt_chuyenVien || (repData.hscc?.chuyenVien) || 0, 10) || (report?.transferCases?.length || 0);
                let mo = parseInt(repData.tongSoCaMo || 0, 10) || (report?.surgeryCases?.length || 0);
                let tuVong = parseInt(repData.tuVong || (repData.hscc?.tuVong) || 0, 10) || (report?.deathCases?.length || 0);

                return (
                  <tr key={code} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold' }}>{deptName}</td>
                    <td style={{ textAlign: 'center', fontSize: '8pt', color: isSubmitted ? '#16A34A' : '#DC2626', fontWeight: 'bold' }}>
                      {isSubmitted ? 'Đã nộp' : 'Chưa'}
                    </td>
                    <td>{report?.doctor_name || '—'}</td>
                    <td>{report?.nurse_name || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{kham || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{cu || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{moi || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{xuat || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{chuyen || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{mo || '—'}</td>
                    <td style={{ textAlign: 'center', fontWeight: tuVong > 0 ? 'bold' : 'normal', color: tuVong > 0 ? '#DC2626' : '#000' }}>
                      {tuVong || '0'}
                    </td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr style={{ backgroundColor: '#EFF6FF', fontWeight: 'bold' }}>
                <td colSpan={2} style={{ textAlign: 'center' }}>TỔNG CỘNG TOÀN VIỆN</td>
                <td style={{ textAlign: 'center' }}>{sortedReports.length}/12</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'center' }}>{sumKham}</td>
                <td style={{ textAlign: 'center' }}>{sumCu}</td>
                <td style={{ textAlign: 'center' }}>{sumMoi}</td>
                <td style={{ textAlign: 'center' }}>{sumXuat}</td>
                <td style={{ textAlign: 'center' }}>{sumChuyen}</td>
                <td style={{ textAlign: 'center' }}>{sumMo}</td>
                <td style={{ textAlign: 'center', color: sumTuVong > 0 ? '#DC2626' : '#000' }}>{sumTuVong}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            SECTION 2: DỮ LIỆU BÁO CÁO CHUYÊN MÔN TỪNG KHOA (TRANG 2: NHÓM 1 - 6 KHOA)
        ========================================================================= */}
        <div className="pdf-page-section report-section-box" style={{ marginTop: '0.75rem' }}>
          <div className="table-title" style={{ fontSize: '10.5pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '2px' }}>
            PHẦN II: DỮ LIỆU BÁO CÁO CHUYÊN MÔN CHI TIẾT TỪNG KHOA PHÒNG (TRANG 1/2)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {deptsGroup1.map(code => renderDeptCard(code))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 (TIẾP): DỮ LIỆU BÁO CÁO CHUYÊN MÔN (TRANG 3: NHÓM 2 - 6 KHOA)
        ========================================================================= */}
        <div className="pdf-page-section report-section-box" style={{ marginTop: '0.75rem' }}>
          <div className="table-title" style={{ fontSize: '10.5pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '2px' }}>
            PHẦN II: DỮ LIỆU BÁO CÁO CHUYÊN MÔN CHI TIẾT TỪNG KHOA PHÒNG (TRANG 2/2)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {deptsGroup2.map(code => renderDeptCard(code))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: BÁO CÁO CÁC CA BỆNH ĐẶC BIỆT & CHỮ KÝ PHÊ DUYỆT
        ========================================================================= */}
        <div className="report-section-box" style={{ backgroundColor: '#FFFFFF', marginTop: '0.75rem' }}>
          <div className="table-title" style={{ fontSize: '10.5pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '2px' }}>
            PHẦN III: BÁO CÁO CHI TIẾT CÁC CA BỆNH ĐẶC BIỆT
          </div>

          {/* 1. Ca Phẫu Thuật (Mổ) */}
          <div className="report-section-box" style={{ marginBottom: '1.25rem' }}>
            <h4 className="table-title" style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#0369A1' }}>
              1. Danh sách bệnh nhân phẫu thuật (Mổ) ({allSurgeryCases.length} ca)
            </h4>
            {allSurgeryCases.length > 0 ? (
              <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#E0F2FE', textAlign: 'center', color: '#0369A1', fontWeight: 'bold' }}>
                    <th style={{ width: '4%' }}>STT</th>
                    <th style={{ width: '16%' }}>Họ Tên / Tuổi</th>
                    <th style={{ width: '14%' }}>Khoa / Giờ Vào</th>
                    <th style={{ width: '22%' }}>Lý Do, Lâm Sàng & CLS</th>
                    <th style={{ width: '16%' }}>Chẩn Đoán Trước Mổ</th>
                    <th style={{ width: '16%' }}>Lệnh Mổ & CĐ Sau Mổ</th>
                    <th style={{ width: '12%' }}>Hiện Tại</th>
                  </tr>
                </thead>
                <tbody>
                  {allSurgeryCases.map((sc, i) => (
                    <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <strong>{sc.patient_name || sc.patientName}</strong>
                        <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(sc.birth_year || sc.birthYear || sc.age)}</div>
                        <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{sc.address}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        <div><strong>{sc.departmentName}</strong></div>
                        <div>{sc.admission_time || sc.admissionTime || '—'}</div>
                      </td>
                      <td>
                        <div><strong>Lý do:</strong> {sc.reason || '—'}</div>
                        {sc.clinical_symptoms || sc.clinicalSymptoms ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>LS:</strong> {sc.clinical_symptoms || sc.clinicalSymptoms}</div> : null}
                        {sc.clinical_tests || sc.clinicalTests ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>CLS:</strong> {sc.clinical_tests || sc.clinicalTests}</div> : null}
                      </td>
                      <td>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</td>
                      <td>
                        <div><strong>Lệnh:</strong> {sc.consultation_order || sc.consultationOrder || '—'}</div>
                        <div><strong>Sau mổ:</strong> {sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>{sc.current_status || sc.currentStatus || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', padding: '3px 0' }}>Không phát sinh ca phẫu thuật trong ngày.</div>
            )}
          </div>

          {/* 2. Ca Chuyển Viện */}
          <div className="report-section-box" style={{ marginBottom: '1.25rem' }}>
            <h4 className="table-title" style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#D97706' }}>
              2. Danh sách bệnh nhân chuyển viện cấp cứu ({allTransferCases.length} ca)
            </h4>
            {allTransferCases.length > 0 ? (
              <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FEF3C7', textAlign: 'center', color: '#92400E', fontWeight: 'bold' }}>
                    <th style={{ width: '4%' }}>STT</th>
                    <th style={{ width: '18%' }}>Họ Tên / Địa Chỉ</th>
                    <th style={{ width: '14%' }}>Khoa / Giờ Vào</th>
                    <th style={{ width: '22%' }}>Lý Do, Lâm Sàng & CLS</th>
                    <th style={{ width: '20%' }}>Chẩn Đoán & Xử Trí</th>
                    <th style={{ width: '22%' }}>Diễn Biến Chuyển</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransferCases.map((tc, i) => (
                    <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <strong>{tc.patient_name || tc.patientName}</strong>
                        <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(tc.age)}</div>
                        <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{tc.address}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        <div><strong>{tc.departmentName}</strong></div>
                        <div>{tc.admission_time || tc.admissionTime || '—'}</div>
                      </td>
                      <td>
                        <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                        {tc.clinical_symptoms || tc.clinicalSymptoms ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>LS:</strong> {tc.clinical_symptoms || tc.clinicalSymptoms}</div> : null}
                        {tc.clinical_tests || tc.clinicalTests ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>CLS:</strong> {tc.clinical_tests || tc.clinicalTests}</div> : null}
                      </td>
                      <td>
                        <div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>
                        <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        {tc.progress_notes || tc.progressNotes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', padding: '3px 0' }}>Không phát sinh ca chuyển viện trong ngày.</div>
            )}
          </div>

          {/* 3. Ca Tử Vong */}
          <div className="report-section-box" style={{ marginBottom: '1.25rem' }}>
            <h4 className="table-title" style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#DC2626' }}>
              3. Hồ sơ bệnh nhân tử vong ({allDeathCases.length} trường hợp)
            </h4>
            {allDeathCases.length > 0 ? (
              allDeathCases.map((dc, i) => (
                <div key={i} className="patient-card patient-case-box" style={{ border: '1px solid #000000', padding: '6px 8px', marginBottom: '6px', fontSize: '8.5pt', backgroundColor: '#FEF2F2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #DC2626', paddingBottom: '2px', marginBottom: '3px' }}>
                    <span><strong style={{ color: '#991B1B' }}>Ca tử vong #{i + 1}: {dc.patient_name || dc.patientName}</strong> ({formatPatientAge(dc.age)}) — {dc.address}</span>
                    <span><strong>Khoa:</strong> {dc.departmentName}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                    <div><strong>- Giờ vào viện:</strong> {dc.admission_time || dc.admissionTime || '—'} | <strong>Lý do:</strong> {dc.reason || '—'}</div>
                    <div><strong>- Tình trạng lúc vào:</strong> {dc.admission_status || dc.admissionStatus || '—'}</div>
                    <div><strong>- Tiền sử bệnh:</strong> {dc.medical_history || dc.medicalHistory || '—'}</div>
                    {dc.clinical_symptoms || dc.clinicalSymptoms ? <div><strong>- Lâm sàng:</strong> {dc.clinical_symptoms || dc.clinicalSymptoms}</div> : null}
                    <div><strong>- Cận lâm sàng / ECG:</strong> {dc.clinical_tests || dc.clinicalTests || '—'}</div>
                    <div><strong>- Chẩn đoán tử vong:</strong> <strong style={{ color: '#DC2626' }}>{dc.diagnosis || '—'}</strong></div>
                    <div><strong>- Quá trình xử trí cấp cứu:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                    <div><strong>- Kết quả & Kết luận:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', padding: '3px 0' }}>Không có trường hợp tử vong trong ngày.</div>
            )}
          </div>

          {/* 4. Ca Bệnh Nặng Cần Theo Dõi */}
          <div className="report-section-box" style={{ marginBottom: '1.25rem' }}>
            <h4 className="table-title" style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#7C3AED' }}>
              4. Danh sách bệnh nhân nặng cần theo dõi ({allCriticalCases.length} ca)
            </h4>
            {allCriticalCases.length > 0 ? (
              <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#EDE9FE', textAlign: 'center', color: '#5B21B6', fontWeight: 'bold' }}>
                    <th style={{ width: '4%' }}>STT</th>
                    <th style={{ width: '16%' }}>Họ Tên / Tuổi / Đ/C</th>
                    <th style={{ width: '14%' }}>Khoa / Giờ Vào</th>
                    <th style={{ width: '20%' }}>Tiền Căn, Lâm Sàng & CĐ</th>
                    <th style={{ width: '26%' }}>Tình Trạng & Diễn Biến</th>
                    <th style={{ width: '20%' }}>Xử Trí & Hướng Tiếp</th>
                  </tr>
                </thead>
                <tbody>
                  {allCriticalCases.map((cc, i) => (
                    <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAF5FF' }}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <strong>{cc.patient_name || cc.patientName}</strong>
                        <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(cc.age)}</div>
                        <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{cc.address}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        <div><strong>{cc.departmentName}</strong></div>
                        <div>{cc.admission_time || cc.admissionTime || '—'}</div>
                      </td>
                      <td>
                        {cc.medical_history || cc.medicalHistory ? <div style={{ fontSize: '7.5pt', color: '#4B5563' }}><strong>TC:</strong> {cc.medical_history || cc.medicalHistory}</div> : null}
                        {cc.clinical_symptoms || cc.clinicalSymptoms ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>LS:</strong> {cc.clinical_symptoms || cc.clinicalSymptoms}</div> : null}
                        {cc.clinical_tests || cc.clinicalTests ? <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>CLS:</strong> {cc.clinical_tests || cc.clinicalTests}</div> : null}
                        <div><strong style={{ color: '#5B21B6' }}>CĐ:</strong> {cc.diagnosis || '—'}</div>
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        {cc.condition_summary || cc.conditionSummary || '—'}
                      </td>
                      <td style={{ fontSize: '7.8pt' }}>
                        <div><strong>Xử trí:</strong> {cc.treatment || '—'}</div>
                        <div style={{ fontSize: '7.5pt', color: '#4B5563', marginTop: '1px' }}><em>{cc.notes || 'Bàn giao tua sau theo dõi tiếp'}</em></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', padding: '3px 0' }}>Không có ca bệnh nặng theo dõi trong ngày.</div>
            )}
          </div>

          {/* Section Chữ ký bàn giao & phê duyệt */}
          <div className="pdf-avoid-break report-section-box" style={{ marginTop: '1.25rem', backgroundColor: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: '#FFFFFF', border: 'none' }}>
              <tbody>
                <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
                  <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000', border: 'none' }}>
                    <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      BÁC SĨ TRỰC GIAO BAN
                    </div>
                    <div style={{ fontSize: '8pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                    <div style={{ height: '48px' }}></div>
                  </td>
                  <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000', border: 'none' }}>
                    <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      TRƯỞNG PHÒNG KH-NV
                    </div>
                    <div style={{ fontSize: '8pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                    <div style={{ height: '48px' }}></div>
                  </td>
                  <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000', border: 'none' }}>
                    <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      BAN GIÁM ĐỐC
                    </div>
                    <div style={{ fontSize: '8pt', fontStyle: 'italic' }}>(Ký, đóng dấu và ghi rõ họ tên)</div>
                    <div style={{ height: '48px' }}></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalPrintView;
