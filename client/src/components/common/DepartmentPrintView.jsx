import React, { useState } from 'react';
import { FaPrint, FaTimes, FaFilePdf, FaSpinner, FaDownload, FaHospital, FaUserMd, FaUserNurse } from 'react-icons/fa';

// Từ điển chuẩn hóa toàn bộ mã biến y tế sang tiếng Việt có dấu chuẩn Bộ Y Tế
const VIETNAMESE_DICTIONARY = {
  // --- Khoa Liên Chuyên Khoa (LCK) ---
  tmh_tongSo: 'Tai Mũi Họng (Tổng khám)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'Răng Hàm Mặt (Tổng khám)',
  rhm_noi_thuThuat: 'Răng Hàm Mặt (Thủ thuật)',
  rhm_noiTru: 'Răng Hàm Mặt nội trú',
  rhm_ngoaiTru: 'Răng Hàm Mặt ngoại trú',
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
  pk21_tongSo: 'Tổng số khám (PK21)',
  pk21_tongSoKham: 'Tổng số khám (PK21)',
  pk21_ngoaiTru: 'Ngoại trú (PK21)',
  pk21_nhapVien: 'Nhập viện (PK21)',
  pk21_chuyenVien: 'Chuyển viện (PK21)',
  nhapVien: 'Nhập viện',

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

const translateFieldKey = (key, parentKey = '') => {
  if (!key) return '';
  if (VIETNAMESE_DICTIONARY[key]) return VIETNAMESE_DICTIONARY[key];

  const combinedKey = parentKey ? `${parentKey}_${key}` : key;
  if (VIETNAMESE_DICTIONARY[combinedKey]) return VIETNAMESE_DICTIONARY[combinedKey];

  let formatted = key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();

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

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return dateStr;
};

const DepartmentPrintView = ({
  reportDate = '',
  departmentName = '',
  departmentCode = '',
  doctorName = '',
  nurseName = '',
  overtimeStaff = [],
  room = '',
  shiftTime = '',
  formData = {},
  transferCases = [],
  surgeryCases = [],
  deathCases = [],
  criticalCases = [],
  onClose
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Xử lý ngày tháng định dạng chuẩn
  const dateStr = reportDate || new Date().toISOString().slice(0, 10);
  const formattedDateVN = formatDateDDMMYYYY(dateStr);
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
  const fullDateVN = isNaN(dateObj.getTime()) ? formattedDateVN : `${dayName}, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
  
  const now = new Date();
  const printDateStr = `Bình Long, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  const cleanDeptName = departmentName
    .replace(/Khoa\s*/gi, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.printable-department-document');
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
        margin: [8, 8, 8, 8],
        filename: `BaoCaoGiaoBan_${cleanDeptName}_${formattedDateVN}.pdf`,
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

  // Phân tích metrics từ formData
  const renderDepartmentMetrics = () => {
    const rawData = typeof formData === 'string' ? JSON.parse(formData || '{}') : (formData || {});
    const sections = [];
    const generalMetrics = [];
    const notes = [];

    Object.entries(rawData).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || k === '_id') return;

      if (k === 'themGio' || k === 'tinhHinhChung' || k === 'ghiChu' || k === 'dienBien') {
        notes.push({ label: translateFieldKey(k), value: String(v) });
        return;
      }

      if (typeof v === 'object' && !Array.isArray(v)) {
        const subGroupTitle = translateFieldKey(k);
        const subItems = [];
        Object.entries(v).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '' && subK !== '_id') {
            subItems.push({
              label: translateFieldKey(subK, k),
              value: String(subV)
            });
          }
        });
        if (subItems.length > 0) {
          sections.push({ title: subGroupTitle, items: subItems });
        }
      } else if (Array.isArray(v)) {
        if (v.length > 0 && typeof v[0] === 'object') {
          const listItems = [];
          v.forEach((item) => {
            if (item && item.name) {
              listItems.push({
                label: item.name,
                value: `Tổng: ${item.tongSo || 0} | BHYT: ${item.baoHiem || 0} | Nội trú: ${item.noiTru || 0}`
              });
            }
          });
          if (listItems.length > 0) {
            sections.push({ title: translateFieldKey(k), items: listItems });
          }
        }
      } else {
        generalMetrics.push({
          label: translateFieldKey(k),
          value: String(v)
        });
      }
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Số liệu chung */}
        {generalMetrics.length > 0 && (
          <div style={{
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '8px 10px',
            backgroundColor: '#F8FAFC'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '6px'
            }}>
              {generalMetrics.map((m, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  padding: '4px 8px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '8.5pt'
                }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>{m.label}:</span>
                  <strong style={{ color: '#0F2C59', fontSize: '9pt' }}>{m.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Các khối chuyên môn con (nếu có: LCK, HSCC_TNT, YHCT, ...) */}
        {sections.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: sections.length > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>
            {sections.map((sec, sIdx) => (
              <div key={sIdx} style={{
                border: '1px solid #CBD5E1',
                borderLeft: '4px solid #0284C7',
                borderRadius: '4px',
                padding: '8px 10px',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{
                  fontWeight: '700',
                  color: '#0369A1',
                  borderBottom: '1px solid #E2E8F0',
                  paddingBottom: '3px',
                  marginBottom: '6px',
                  fontSize: '9pt',
                  textTransform: 'uppercase'
                }}>
                  ❖ {sec.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {sec.items.map((it, itIdx) => (
                    <div key={itIdx} style={{
                      backgroundColor: '#F0F9FF',
                      padding: '3px 6px',
                      border: '1px solid #BAE6FD',
                      borderRadius: '2px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '8pt'
                    }}>
                      <span style={{ color: '#0369A1' }}>{it.label}:</span>
                      <strong style={{ color: '#0C4A6E' }}>{it.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ghi chú & Diễn biến */}
        {notes.length > 0 && (
          <div style={{
            marginTop: '4px',
            padding: '6px 10px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderLeft: '4px solid #D97706',
            borderRadius: '4px',
            fontSize: '8.5pt',
            color: '#92400E'
          }}>
            {notes.map((n, nIdx) => (
              <div key={nIdx} style={{ marginBottom: nIdx < notes.length - 1 ? '4px' : 0 }}>
                <strong>📌 {n.label}:</strong> {n.value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="department-print-modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      overflowY: 'auto',
      padding: '1.5rem 1rem 5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      {/* CSS Nhúng Chuyên Dụng In Ấn */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 8mm;
        }

        @media print {
          body {
            background-color: #FFFFFF !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, .department-print-modal-backdrop {
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
            position: static !important;
            overflow: visible !important;
          }
          .printable-department-document {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }

        .dept-card, .patient-card, .patient-case-box, tr, .report-section-box, .pdf-avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        h1, h2, h3, h4, .table-title, thead {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }

        table.pdf-table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: auto !important;
          margin-bottom: 6px !important;
        }

        table.pdf-table thead {
          display: table-header-group !important;
        }

        table.pdf-table tbody tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        table.pdf-table th, table.pdf-table td {
          height: auto !important;
          padding: 4px 6px !important;
          vertical-align: middle !important;
          word-wrap: break-word !important;
        }
      `}</style>

      {/* Thanh Điều Khiển Nổi Bật (Không in) */}
      <div className="no-print" style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '210mm',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <FaFilePdf style={{ fontSize: '1.4rem', color: '#38BDF8' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '0.3px' }}>
              PHIẾU BÁO CÁO GIAO BAN — KHOA {departmentName.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#93C5FD' }}>
              Ngày báo cáo: <strong>{formattedDateVN}</strong> ({dayName})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: downloadingPdf ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {downloadingPdf ? (
              <>
                <FaSpinner className="spin" /> Đang tạo PDF...
              </>
            ) : (
              <>
                <FaDownload /> Tải File PDF
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <FaPrint /> In Trực Tiếp
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <FaTimes /> Đóng
            </button>
          )}
        </div>
      </div>

      {/* TÀI LIỆU Y TẾ IN ẤN CHUẨN A4 */}
      <div className="printable-department-document" style={{
        width: '100%',
        maxWidth: '210mm',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        padding: '12mm 14mm',
        boxSizing: 'border-box',
        borderRadius: '8px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.4)',
        fontFamily: "'Times New Roman', 'Arial', serif",
        fontSize: '9.5pt',
        lineHeight: 1.35
      }}>
        {/* 1. QUỐC HIỆU / TIÊU NGỮ & ĐƠN VỊ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', borderBottom: '1.5px solid #000000', paddingBottom: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '8.5pt', textTransform: 'uppercase', color: '#1E3A8A' }}>SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI</div>
            <div style={{ fontSize: '9.5pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>TTYT KHU VỰC BÌNH LONG</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#0284C7', textTransform: 'uppercase', marginTop: '2px' }}>
              KHOA: {departmentName.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style={{ fontSize: '8.5pt', fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
            <div style={{ fontSize: '8pt', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>{printDateStr}</div>
          </div>
        </div>

        {/* 2. TIÊU ĐỀ CHÍNH BÁO CÁO */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '13pt',
            fontWeight: 'bold',
            color: '#0F2C59',
            textTransform: 'uppercase',
            margin: '0 0 3px 0',
            letterSpacing: '0.5px'
          }}>
            PHIẾU BÁO CÁO GIAO BAN CHUYÊN MÔN
          </h2>
          <div style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#334155' }}>
            Ngày báo cáo: <strong>{fullDateVN}</strong>
          </div>
        </div>

        {/* 3. KHUNG THÔNG TIN CA TRỰC */}
        <div style={{
          border: '1px solid #94A3B8',
          backgroundColor: '#F8FAFC',
          borderRadius: '4px',
          padding: '6px 10px',
          marginBottom: '12px',
          fontSize: '8.5pt',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px'
        }}>
          <div>
            <strong>👨‍⚕️ Bác sĩ trực:</strong> <span style={{ color: '#1E40AF', fontWeight: '700' }}>{doctorName || '—'}</span>
          </div>
          <div>
            <strong>👩‍⚕️ Điều dưỡng trực:</strong> <span style={{ color: '#065F46', fontWeight: '700' }}>{nurseName || '—'}</span>
          </div>
          <div>
            <strong>🏥 Phòng trực:</strong> {room || '—'} {shiftTime ? `| ⏱️ Ca: ${shiftTime}` : ''}
          </div>
          <div>
            <strong>⏰ Tăng cường:</strong> {overtimeStaff && overtimeStaff.length > 0 ? (
              <span style={{ color: '#92400E', fontWeight: '600' }}>
                {overtimeStaff.map(o => `${o.staffName} (${o.time})`).join(', ')}
              </span>
            ) : 'Không'}
          </div>
        </div>

        {/* =========================================================================
            PHẦN I: BẢNG SỐ LIỆU HOẠT ĐỘNG CHUYÊN MÔN
        ========================================================================= */}
        <div className="report-section-box pdf-avoid-break" style={{ marginBottom: '12px' }}>
          <div className="table-title" style={{
            fontSize: '9.5pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#0F2C59',
            borderBottom: '1.5px solid #0F2C59',
            paddingBottom: '2px',
            marginBottom: '6px'
          }}>
            I. HOẠT ĐỘNG CHUYÊN MÔN TẠI KHOA
          </div>
          {renderDepartmentMetrics()}
        </div>

        {/* =========================================================================
            PHẦN II: DANH SÁCH BỆNH NHÂN PHẪU THUẬT (MỔ)
        ========================================================================= */}
        {surgeryCases && surgeryCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '12px' }}>
            <div className="table-title" style={{
              fontSize: '9.5pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0369A1',
              borderBottom: '1.5px solid #0369A1',
              paddingBottom: '2px',
              marginBottom: '6px'
            }}>
              II. DANH SÁCH BỆNH NHÂN PHẪU THUẬT (MỔ) ({surgeryCases.length} ca)
            </div>
            <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#E0F2FE', textAlign: 'center', color: '#0369A1', fontWeight: 'bold' }}>
                  <th style={{ width: '4%' }}>STT</th>
                  <th style={{ width: '18%' }}>Họ Tên / Tuổi / Đ/C</th>
                  <th style={{ width: '12%' }}>Giờ Vào / Lý Do</th>
                  <th style={{ width: '22%' }}>Lâm Sàng & Cận Lâm Sàng</th>
                  <th style={{ width: '18%' }}>Chẩn Đoán Trước Mổ</th>
                  <th style={{ width: '16%' }}>Lệnh Mổ & CĐ Sau Mổ</th>
                  <th style={{ width: '10%' }}>Hiện Tại</th>
                </tr>
              </thead>
              <tbody>
                {surgeryCases.map((sc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>
                      <strong>{sc.patient_name || sc.patientName}</strong>
                      <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(sc.birth_year || sc.birthYear || sc.age)}</div>
                      <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{sc.address}</div>
                    </td>
                    <td style={{ fontSize: '7.8pt' }}>
                      <div><strong>{sc.admission_time || sc.admissionTime || '—'}</strong></div>
                      <div>{sc.reason || '—'}</div>
                    </td>
                    <td>
                      {sc.clinical_symptoms || sc.clinicalSymptoms ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151', marginBottom: '2px' }}>
                          <strong>LS:</strong> {sc.clinical_symptoms || sc.clinicalSymptoms}
                        </div>
                      ) : null}
                      {sc.clinical_tests || sc.clinicalTests ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151' }}>
                          <strong>CLS:</strong> {sc.clinical_tests || sc.clinicalTests}
                        </div>
                      ) : null}
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
          </div>
        )}

        {/* =========================================================================
            PHẦN III: DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN
        ========================================================================= */}
        {transferCases && transferCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '12px' }}>
            <div className="table-title" style={{
              fontSize: '9.5pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#D97706',
              borderBottom: '1.5px solid #D97706',
              paddingBottom: '2px',
              marginBottom: '6px'
            }}>
              III. DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN ({transferCases.length} ca)
            </div>
            <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#FEF3C7', textAlign: 'center', color: '#92400E', fontWeight: 'bold' }}>
                  <th style={{ width: '4%' }}>STT</th>
                  <th style={{ width: '20%' }}>Họ Tên / Tuổi / Địa Chỉ</th>
                  <th style={{ width: '14%' }}>Giờ Vào / Lý Do</th>
                  <th style={{ width: '22%' }}>Lâm Sàng & Cận Lâm Sàng</th>
                  <th style={{ width: '20%' }}>Chẩn Đoán & Xử Trí</th>
                  <th style={{ width: '20%' }}>Diễn Biến Chuyển Viện</th>
                </tr>
              </thead>
              <tbody>
                {transferCases.map((tc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>
                      <strong>{tc.patient_name || tc.patientName}</strong>
                      <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(tc.age)}</div>
                      <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{tc.address}</div>
                    </td>
                    <td style={{ fontSize: '7.8pt' }}>
                      <div><strong>{tc.admission_time || tc.admissionTime || '—'}</strong></div>
                      <div>{tc.reason || '—'}</div>
                    </td>
                    <td>
                      {tc.clinical_symptoms || tc.clinicalSymptoms ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151', marginBottom: '2px' }}>
                          <strong>LS:</strong> {tc.clinical_symptoms || tc.clinicalSymptoms}
                        </div>
                      ) : null}
                      {tc.clinical_tests || tc.clinicalTests ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151' }}>
                          <strong>CLS:</strong> {tc.clinical_tests || tc.clinicalTests}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>
                      <div style={{ fontSize: '7.8pt', color: '#374151' }}><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                    </td>
                    <td style={{ fontSize: '7.8pt' }}>{tc.progress_notes || tc.progressNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            PHẦN IV: DANH SÁCH BỆNH NHÂN NẶNG THEO DÕI
        ========================================================================= */}
        {criticalCases && criticalCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '12px' }}>
            <div className="table-title" style={{
              fontSize: '9.5pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#7C3AED',
              borderBottom: '1.5px solid #7C3AED',
              paddingBottom: '2px',
              marginBottom: '6px'
            }}>
              IV. DANH SÁCH BỆNH NHÂN NẶNG CẦN THEO DÕI ({criticalCases.length} ca)
            </div>
            <table className="pdf-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '8pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#EDE9FE', textAlign: 'center', color: '#5B21B6', fontWeight: 'bold' }}>
                  <th style={{ width: '4%' }}>STT</th>
                  <th style={{ width: '18%' }}>Họ Tên / Tuổi / Đ/C</th>
                  <th style={{ width: '12%' }}>Giờ Vào / Tiền Sử</th>
                  <th style={{ width: '22%' }}>Lâm Sàng, Sinh Hiệu & CLS</th>
                  <th style={{ width: '24%' }}>Chẩn Đoán & Diễn Biến</th>
                  <th style={{ width: '20%' }}>Xử Trí & Hướng Tiếp</th>
                </tr>
              </thead>
              <tbody>
                {criticalCases.map((cc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAF5FF' }}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>
                      <strong>{cc.patient_name || cc.patientName}</strong>
                      <div style={{ fontSize: '7.5pt', color: '#4B5563' }}>{formatPatientAge(cc.age)}</div>
                      <div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{cc.address}</div>
                    </td>
                    <td style={{ fontSize: '7.8pt' }}>
                      <div><strong>{cc.admission_time || cc.admissionTime || '—'}</strong></div>
                      <div>{cc.medical_history || cc.medicalHistory || '—'}</div>
                    </td>
                    <td>
                      {cc.clinical_symptoms || cc.clinicalSymptoms ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151', marginBottom: '2px' }}>
                          <strong>LS:</strong> {cc.clinical_symptoms || cc.clinicalSymptoms}
                        </div>
                      ) : null}
                      {cc.clinical_tests || cc.clinicalTests ? (
                        <div style={{ fontSize: '7.8pt', color: '#374151' }}>
                          <strong>CLS:</strong> {cc.clinical_tests || cc.clinicalTests}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div><strong>CĐ:</strong> {cc.diagnosis || '—'}</div>
                      <div style={{ fontSize: '7.8pt', color: '#4B5563' }}>{cc.condition_summary || cc.conditionSummary || '—'}</div>
                    </td>
                    <td style={{ fontSize: '7.8pt' }}>
                      <div><strong>Xử trí:</strong> {cc.treatment || '—'}</div>
                      {cc.notes ? <div style={{ color: '#6B21A8', fontStyle: 'italic' }}>📌 {cc.notes}</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            PHẦN V: HỒ SƠ BỆNH NHÂN TỬ VONG
        ========================================================================= */}
        {deathCases && deathCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '12px' }}>
            <div className="table-title" style={{
              fontSize: '9.5pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#DC2626',
              borderBottom: '1.5px solid #DC2626',
              paddingBottom: '2px',
              marginBottom: '6px'
            }}>
              V. HỒ SƠ BỆNH NHÂN TỬ VONG ({deathCases.length} trường hợp)
            </div>
            {deathCases.map((dc, i) => (
              <div key={i} className="patient-card patient-case-box" style={{
                border: '1px solid #DC2626',
                borderRadius: '4px',
                padding: '6px 10px',
                marginBottom: '6px',
                fontSize: '8.5pt',
                backgroundColor: '#FEF2F2'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #DC2626', paddingBottom: '3px', marginBottom: '4px' }}>
                  <span><strong style={{ color: '#991B1B' }}>Ca tử vong #{i + 1}: {dc.patient_name || dc.patientName}</strong> ({formatPatientAge(dc.age)}) — {dc.address}</span>
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>Giờ vào: {dc.admission_time || dc.admissionTime || '—'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                  <div><strong>- Tình trạng lúc vào viện:</strong> {dc.admission_status || dc.admissionStatus || '—'}</div>
                  <div><strong>- Tiền sử bệnh:</strong> {dc.medical_history || dc.medicalHistory || '—'}</div>
                  {dc.clinical_symptoms || dc.clinicalSymptoms ? <div><strong>- Lâm sàng & Sinh hiệu:</strong> {dc.clinical_symptoms || dc.clinicalSymptoms}</div> : null}
                  <div><strong>- Cận lâm sàng / ECG:</strong> {dc.clinical_tests || dc.clinicalTests || '—'}</div>
                  <div><strong>- Chẩn đoán tử vong:</strong> <strong style={{ color: '#DC2626' }}>{dc.diagnosis || '—'}</strong></div>
                  <div><strong>- Quá trình xử trí cấp cứu:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                  <div><strong>- Kết quả & Kết luận:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            PHẦN VI: CHỮ KÝ XÁC NHẬN & PHÊ DUYỆT BÀN GIAO
        ========================================================================= */}
        <div className="pdf-avoid-break" style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #000000',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          textAlign: 'center',
          fontSize: '9pt'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>ĐIỀU DƯỠNG TRỰC</div>
            <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', marginBottom: '35px' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ fontWeight: 'bold', color: '#065F46' }}>{nurseName || '—'}</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>BÁC SĨ TRỰC</div>
            <div style={{ fontStyle: 'italic', fontSize: '8pt', color: '#64748B', marginBottom: '35px' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ fontWeight: 'bold', color: '#1E40AF' }}>{doctorName || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPrintView;
