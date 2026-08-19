import React, { useState } from 'react';
import { FaPrint, FaTimes, FaFilePdf, FaSpinner, FaDownload } from 'react-icons/fa';

const VIETNAMESE_DICTIONARY = {
  tmh_tongSo: 'Tai Mũi Họng (Tổng khám)', tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng khám)', mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'Răng Hàm Mặt (Tổng khám)', rhm_noi_thuThuat: 'Răng Hàm Mặt (Thủ thuật)',
  rhm_noiTru: 'Răng Hàm Mặt nội trú', rhm_ngoaiTru: 'Răng Hàm Mặt ngoại trú',
  daLieu_tongSo: 'Da liễu (Tổng khám)', tong4ck_tongSo: 'Tổng 4 chuyên khoa',
  tong4ck_thuThuat: 'Tổng thủ thuật 4CK', nhapVien_tongSo: 'Nhập viện', chuyenVien_tongSo: 'Chuyển viện',
  tongSoKham: 'Tổng số khám', benhCu: 'Bệnh cũ', benhMoi: 'Bệnh mới nhập viện',
  xuatVien: 'Xuất viện', chuyenVien: 'Chuyển viện', chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn điều trị', hienCo: 'Hiện có tại khoa', tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về', baoHiem: 'BHYT', bhyt: 'BHYT', dichVu: 'Dịch vụ',
  noiTru: 'Nội trú', ngoaiTru: 'Ngoại trú', keToa: 'Kê toa', tongSo: 'Tổng số',
  tongSoKhamBenh: 'Tổng khám bệnh', soCaKham: 'Số ca khám',
  tongXetNghiem: 'Tổng XN thực hiện', sinhHoa: 'Sinh hóa', huyetHoc: 'Huyết học',
  dongMau: 'Đông máu', nuocTieu: 'Nước tiểu', viSinh: 'Vi sinh', mienDich: 'Miễn dịch',
  tongSoSieuAm: 'Tổng siêu âm', tongSoXquang: 'Tổng X-quang', tongSoCT: 'Tổng CT Scanner',
  bsSieuAm: 'BS trực Siêu âm', bsXquangCT: 'BS trực Xquang - CT',
  tnt_ctdk: 'Chạy thận định kỳ (CTĐK)', ctdk: 'Chạy thận định kỳ',
  tnt_benhCu: 'Bệnh cũ (TNT)', tnt_benhMoi: 'Bệnh mới (TNT)', tnt_xuatVien: 'Xuất viện (TNT)',
  tnt_chuyenVien: 'Chuyển viện (TNT)', tnt_chuyenKhoa: 'Chuyển khoa (TNT)',
  tnt_noiTru: 'Thận nhân tạo nội trú', tnt_hienCon: 'Hiện còn (TNT)',
  tieuPhau: 'Tiểu phẫu', boBot: 'Bó bột', truyenMau: 'Truyền máu',
  ccNgoaiVien: 'Cấp cứu ngoài viện', thoMay: 'Thở máy', cpap: 'Thở CPAP',
  thoOxy: 'Thở Oxy', bsTrucTNT: 'Bác sĩ trực TNT',
  pk21_tongSo: 'Tổng số khám (PK21)', pk21_tongSoKham: 'Tổng số khám (PK21)',
  pk21_ngoaiTru: 'Ngoại trú (PK21)', pk21_nhapVien: 'Nhập viện (PK21)',
  pk21_chuyenVien: 'Chuyển viện (PK21)', nhapVien: 'Nhập viện',
  sanhThuong: 'Sanh thường', sanhHut: 'Sanh hút / Giúp sinh', moLayThai: 'Mổ lấy thai',
  moDe: 'Mổ đẻ', choSanh: 'Chờ sanh', sieuAm: 'Siêu âm sản', hauPhau: 'Hậu phẫu',
  chuyenVienNgoaiTru: 'Chuyển viện ngoại trú', duoi6Thang: 'Trẻ dưới 6 tháng',
  duoi5Tuoi: 'Trẻ dưới 5 tuổi', chuyenKhoaSan: 'Chuyển khoa Sản', xinXuatVien: 'Xin xuất viện',
  tongSoCaMo: 'Tổng số ca mổ', cc_ctch: 'Mổ cấp cứu - CTCH', cc_ngoaiTH: 'Mổ cấp cứu - Ngoại TH',
  cc_san: 'Mổ cấp cứu - Sản khoa', ct_ctch: 'Mổ kế hoạch - CTCH',
  ct_ngoaiTH: 'Mổ kế hoạch - Ngoại TH', ct_san: 'Mổ kế hoạch - Sản khoa',
  moKhac: 'Mổ khác', soCaGiamDau: 'Ca giảm đau sau mổ', soCaGayMe: 'Số ca gây mê',
  soCaHoiTinh: 'Số ca theo dõi hồi tỉnh', chamCuu: 'Châm cứu',
  xoaBop: 'Xoa bóp bấm huyệt', vatLyTriLieu: 'Vật lý trị liệu', phcn: 'Phục hồi chức năng',
  nhanSu: 'Thành phần nhân sự', dieuDuongTruc: 'Điều dưỡng trực ca',
  themGio: 'Ghi chú thêm giờ / Diễn biến', tinhHinhChung: 'Tình hình chung ca trực',
  ghiChu: 'Ghi chú', hienConGhiChu: 'Ghi chú hiện còn', chuyenVienTT: 'Chuyển viện tuyến trên'
};

const translateFieldKey = (key, parentKey = '') => {
  if (!key) return '';
  if (VIETNAMESE_DICTIONARY[key]) return VIETNAMESE_DICTIONARY[key];
  const combinedKey = parentKey ? `${parentKey}_${key}` : key;
  if (VIETNAMESE_DICTIONARY[combinedKey]) return VIETNAMESE_DICTIONARY[combinedKey];
  let formatted = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  const wordMap = {
    'tong so': 'Tổng số', 'benh cu': 'Bệnh cũ', 'benh moi': 'Bệnh mới',
    'xuat vien': 'Xuất viện', 'chuyen vien': 'Chuyển viện', 'chuyen khoa': 'Chuyển khoa',
    'hien con': 'Hiện còn', 'hien co': 'Hiện có', 'tu vong': 'Tử vong',
    'noi tru': 'Nội trú', 'ngoai tru': 'Ngoại trú', 'bao hiem': 'BHYT',
    'ke toa': 'Kê toa', 'tnt': 'TNT', 'hscc': 'HSCC', 'ctch': 'CTCH',
    'rhm': 'RHM', 'tmh': 'TMH', 'pk': 'Phòng khám', 'sieu am': 'Siêu âm', 'xquang': 'X-Quang'
  };
  Object.entries(wordMap).forEach(([en, vi]) => { formatted = formatted.replace(new RegExp(en, 'gi'), vi); });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatPatientAge = (val) => {
  if (!val) return '—';
  const s = String(val).trim();
  if (/^\d{4}$/.test(s)) return `SN: ${s}`;
  if (/^\d+$/.test(s)) return `${s} tuổi`;
  return s;
};

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2,'0')}-${m.padStart(2,'0')}-${y}`;
  }
  return dateStr;
};

const CELL = { border: '1px solid #000', padding: '5px 7px', verticalAlign: 'middle', fontSize: '8.5pt', lineHeight: '1.5', wordBreak: 'break-word', boxSizing: 'border-box' };
const CELL_CENTER = { ...CELL, textAlign: 'center', verticalAlign: 'middle' };
const TH = { border: '1px solid #000', padding: '6px 7px', textAlign: 'center', fontSize: '8.5pt', fontWeight: 'bold', backgroundColor: '#D9E8FB', color: '#0F2C59', verticalAlign: 'middle', lineHeight: '1.4', boxSizing: 'border-box' };

const DepartmentPrintView = ({
  reportDate = '', departmentName = '', departmentCode = '',
  doctorName = '', nurseName = '', overtimeStaff = [],
  room = '', shiftTime = '', formData = {},
  transferCases = [], surgeryCases = [], deathCases = [], criticalCases = [],
  onClose
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const safeArr = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
    return [];
  };
  const safeOvertime = safeArr(overtimeStaff);
  const safeSurgeryCases = safeArr(surgeryCases);
  const safeTransferCases = safeArr(transferCases);
  const safeCriticalCases = safeArr(criticalCases);
  const safeDeathCases = safeArr(deathCases);

  const dateStr = reportDate || new Date().toISOString().slice(0, 10);
  const formattedDateVN = formatDateDDMMYYYY(dateStr);
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
  const fullDateVN = isNaN(dateObj.getTime()) ? formattedDateVN
    : `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
  const now = new Date();
  const printDateStr = `Bình Long, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const cleanDeptName = departmentName.replace(/Khoa\s*/gi, '').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.printable-department-document');
    if (!element) return;
    setDownloadingPdf(true);
    try {
      let html2pdfModule;
      try {
        const mod = await import('html2pdf.js');
        html2pdfModule = mod.default || mod;
      } catch {
        if (window.html2pdf) { html2pdfModule = window.html2pdf; }
        else {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = resolve; script.onerror = () => reject(new Error('Load fail'));
            document.head.appendChild(script);
          });
          html2pdfModule = window.html2pdf;
        }
      }
      const opt = {
        margin: [10, 10, 10, 10], // Lề 10mm chuẩn A4
        filename: `BaoCaoGiaoBan_${cleanDeptName}_${formattedDateVN}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.5, // Nâng scale lên 2.5 để chữ sắc nét chuẩn in ấn, không bị vỡ hạt
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 1024 // Giữ chiều rộng ảo cố định để layout không bị bóp méo
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF failed:', err);
      alert('Không thể tạo PDF. Trình duyệt sẽ mở hộp thoại In.');
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const buildMetrics = () => {
    const rawData = typeof formData === 'string' ? JSON.parse(formData || '{}') : (formData || {});
    const sections = [], generalMetrics = [], notes = [];
    Object.entries(rawData).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || k === '_id') return;
      if (k === 'themGio' || k === 'tinhHinhChung' || k === 'ghiChu' || k === 'dienBien') {
        notes.push({ label: translateFieldKey(k), value: String(v) }); return;
      }
      if (typeof v === 'object' && !Array.isArray(v)) {
        const subItems = [];
        Object.entries(v).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '' && subK !== '_id')
            subItems.push({ label: translateFieldKey(subK, k), value: String(subV) });
        });
        if (subItems.length > 0) sections.push({ title: translateFieldKey(k), items: subItems });
      } else if (Array.isArray(v)) {
        if (v.length > 0 && typeof v[0] === 'object') {
          const listItems = [];
          v.forEach(item => { if (item && item.name) listItems.push({ label: item.name, value: `Tổng: ${item.tongSo || 0} | BHYT: ${item.baoHiem || 0} | NT: ${item.noiTru || 0}` }); });
          if (listItems.length > 0) sections.push({ title: translateFieldKey(k), items: listItems });
        }
      } else {
        generalMetrics.push({ label: translateFieldKey(k), value: String(v) });
      }
    });
    return { generalMetrics, sections, notes };
  };

  const { generalMetrics, sections, notes } = buildMetrics();
  const TABLE_STYLE = { width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '8pt', tableLayout: 'auto', marginBottom: '0' };
  const SECTION_HEADER_STYLE = (bg, color) => ({ ...CELL, backgroundColor: bg, fontWeight: '700', color, textAlign: 'center', textTransform: 'uppercase', fontSize: '8pt' });

  const render2ColRows = (items, evenBg, oddBg) => {
    return Array.from({ length: Math.ceil(items.length / 2) }, (_, rowIdx) => {
      const left = items[rowIdx * 2];
      const right = items[rowIdx * 2 + 1];
      return (
        <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? evenBg : oddBg }}>
          <td style={{ ...CELL, width: '35%', color: '#1e293b' }}>{left.label}:</td>
          <td style={{ ...CELL, width: '15%', textAlign: 'center', fontWeight: '700', color: '#0F2C59' }}>{left.value}</td>
          {right ? (
            <><td style={{ ...CELL, width: '35%', color: '#1e293b' }}>{right.label}:</td><td style={{ ...CELL, width: '15%', textAlign: 'center', fontWeight: '700', color: '#0F2C59' }}>{right.value}</td></>
          ) : (
            <><td style={{ ...CELL, width: '35%' }}></td><td style={{ ...CELL, width: '15%' }}></td></>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="department-print-modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(10, 18, 35, 0.88)', backdropFilter: 'blur(6px)',
      zIndex: 99999, overflowY: 'auto', padding: '1rem 1rem 4rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box'
    }}>
      <style>{`
        @page { size: A4 portrait; margin: 10mm 10mm; }
        @media print {
          body { background: #fff !important; color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, .department-print-modal-backdrop { background: none !important; padding: 0 !important; margin: 0 !important; position: static !important; overflow: visible !important; }
          .printable-department-document { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
        }
        .dept-card, .patient-card, .patient-case-box, tr, .report-section-box, .pdf-avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
        h1, h2, h3, h4, .table-title, thead { page-break-after: avoid !important; break-after: avoid !important; }
        table.pdf-table { border-collapse: collapse !important; width: 100% !important; margin-bottom: 0 !important; }
        table.pdf-table thead { display: table-header-group !important; }
        table.pdf-table tbody tr { page-break-inside: avoid !important; break-inside: avoid !important; }
        table.pdf-table th, table.pdf-table td { height: auto !important; word-wrap: break-word !important; word-break: break-word !important; }
      `}</style>

      {/* Control Bar */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, backgroundColor: '#0F2C59', color: '#fff',
        padding: '0.6rem 1.2rem', borderRadius: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', maxWidth: '210mm', marginBottom: '1rem',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaFilePdf style={{ fontSize: '1.2rem', color: '#38BDF8' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>BÁO CÁO GIAO BAN — {departmentName.toUpperCase()}</div>
            <div style={{ fontSize: '0.72rem', color: '#93C5FD' }}>Ngày: <strong>{formattedDateVN}</strong> ({dayName})</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleDownloadPDF} disabled={downloadingPdf} style={{ backgroundColor: '#0284C7', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.42rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: downloadingPdf ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
            {downloadingPdf ? <><FaSpinner /> Đang tạo...</> : <><FaDownload /> Tải PDF</>}
          </button>
          <button onClick={handlePrint} style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.42rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
            <FaPrint /> In ấn
          </button>
          {onClose && (
            <button onClick={onClose} style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '7px', padding: '0.42rem 0.7rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.32rem' }}>
              <FaTimes /> Đóng
            </button>
          )}
        </div>
      </div>

      {/* A4 Document */}
      <div className="printable-department-document" style={{
        width: '100%', maxWidth: '210mm', backgroundColor: '#FFFFFF', color: '#000',
        padding: '0', boxSizing: 'border-box',
        borderRadius: '6px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        fontFamily: "'Times New Roman', 'Arial', serif", fontSize: '9.5pt', lineHeight: 1.55
      }}>

        {/* Header: State + Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#1E3A8A', fontWeight: '600' }}>Sở Y Tế Thành Phố Đồng Nai</div>
            <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>TTYT Khu Vực Bình Long</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#0284C7', borderBottom: '1px solid #0284C7', display: 'inline-block', marginTop: '2px' }}>
              Khoa: {departmentName}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
            <div style={{ fontSize: '8.5pt', fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
            <div style={{ fontSize: '8pt', fontStyle: 'italic', marginTop: '3px', color: '#374151' }}>{printDateStr}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '12.5pt', fontWeight: 'bold', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phiếu Báo Cáo Giao Ban Chuyên Môn</div>
          <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#374151', marginTop: '2px' }}>{fullDateVN}</div>
        </div>

        {/* Shift Info Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #0F2C59', marginBottom: '8px' }}>
          <tbody>
            <tr style={{ backgroundColor: '#DBEAFE' }}>
              <td colSpan={4} style={{ ...CELL, fontWeight: 'bold', fontSize: '8.5pt', color: '#0F2C59', textAlign: 'center', textTransform: 'uppercase', padding: '4px 6px', borderBottom: '1px solid #0F2C59' }}>Thông Tin Ca Trực</td>
            </tr>
            <tr>
              <td style={{ ...CELL, fontWeight: '700', backgroundColor: '#F8FAFF', width: '22%', color: '#1E3A8A' }}>Bác sĩ trực:</td>
              <td style={{ ...CELL, fontWeight: '700', color: '#1D4ED8', width: '28%' }}>{doctorName || '—'}</td>
              <td style={{ ...CELL, fontWeight: '700', backgroundColor: '#F8FAFF', width: '22%', color: '#065F46' }}>Điều dưỡng trực:</td>
              <td style={{ ...CELL, fontWeight: '700', color: '#065F46', width: '28%' }}>{nurseName || '—'}</td>
            </tr>
            <tr>
              <td style={{ ...CELL, fontWeight: '700', backgroundColor: '#F8FAFF', color: '#374151' }}>Phòng / Ca trực:</td>
              <td style={{ ...CELL }}>{room ? `${room}${shiftTime ? ` | ${shiftTime}` : ''}` : (shiftTime || '—')}</td>
              <td style={{ ...CELL, fontWeight: '700', backgroundColor: '#F8FAFF', color: '#374151' }}>Tăng cường:</td>
              <td style={{ ...CELL }}>{safeOvertime.length > 0 ? safeOvertime.map(o => `${o?.staffName || ''} (${o?.time || ''})`).filter(s => s.trim() !== '()').join('; ') : 'Không'}</td>
            </tr>
          </tbody>
        </table>

        {/* Section I: Metrics */}
        <div className="report-section-box pdf-avoid-break" style={{ marginBottom: '8px' }}>
          <div style={{ backgroundColor: '#1E3A8A', color: '#fff', padding: '3px 8px', fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3px', borderRadius: '2px 2px 0 0' }}>
            I. Hoạt Động Chuyên Môn Tại Khoa
          </div>
          {generalMetrics.length > 0 && (
            <table style={TABLE_STYLE} className="pdf-table">
              <tbody>{render2ColRows(generalMetrics, '#FFFFFF', '#F8FAFC')}</tbody>
            </table>
          )}
          {sections.length > 0 && (
            <table style={{ ...TABLE_STYLE, marginTop: generalMetrics.length > 0 ? '4px' : '0' }} className="pdf-table">
              <tbody>
                {sections.map((sec, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr><td colSpan={4} style={SECTION_HEADER_STYLE('#EFF6FF', '#1E40AF')}>❖ {sec.title}</td></tr>
                    {render2ColRows(sec.items, '#F8FBFF', '#FFFFFF')}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {notes.length > 0 && (
            <table style={{ ...TABLE_STYLE, marginTop: '4px' }} className="pdf-table">
              <tbody>
                {notes.map((n, nIdx) => (
                  <tr key={nIdx} style={{ backgroundColor: '#FFFBEB' }}>
                    <td style={{ ...CELL, width: '22%', fontWeight: '700', color: '#92400E', whiteSpace: 'nowrap' }}>📌 {n.label}:</td>
                    <td style={{ ...CELL, color: '#78350F' }}>{n.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {generalMetrics.length === 0 && sections.length === 0 && notes.length === 0 && (
            <div style={{ padding: '6px 8px', fontSize: '8pt', color: '#64748B', fontStyle: 'italic', border: '1px solid #E2E8F0' }}>Không có dữ liệu số liệu chuyên môn.</div>
          )}
        </div>

        {/* Section II: Surgery Cases */}
        {safeSurgeryCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#1D4ED8', color: '#fff', padding: '3px 8px', fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '2px 2px 0 0' }}>II. Danh Sách Ca Phẫu Thuật ({safeSurgeryCases.length} ca)</div>
            <table style={TABLE_STYLE} className="pdf-table">
              <thead>
                <tr style={{ backgroundColor: '#DBEAFE' }}>
                  <th style={{ ...TH, width: '4%' }}>STT</th>
                  <th style={{ ...TH, width: '16%' }}>Họ tên / Tuổi / Đ/C</th>
                  <th style={{ ...TH, width: '10%' }}>Giờ vào / Lý do</th>
                  <th style={{ ...TH, width: '24%' }}>Lâm sàng & Cận lâm sàng</th>
                  <th style={{ ...TH, width: '18%' }}>Chẩn đoán trước mổ</th>
                  <th style={{ ...TH, width: '18%' }}>Lệnh mổ & CĐ sau mổ</th>
                  <th style={{ ...TH, width: '10%' }}>Hiện tại</th>
                </tr>
              </thead>
              <tbody>
                {safeSurgeryCases.map((sc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#F0F7FF' }}>
                    <td style={CELL_CENTER}>{i + 1}</td>
                    <td style={CELL}><strong>{sc.patient_name || sc.patientName || '—'}</strong><div style={{ fontSize: '7.5pt', color: '#374151' }}>{formatPatientAge(sc.birth_year || sc.birthYear || sc.age)}</div><div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{sc.address}</div></td>
                    <td style={CELL}><strong>{sc.admission_time || sc.admissionTime || '—'}</strong><div style={{ fontSize: '7.5pt' }}>{sc.reason}</div></td>
                    <td style={CELL}>{(sc.clinical_symptoms || sc.clinicalSymptoms) && <div><strong>LS:</strong> {sc.clinical_symptoms || sc.clinicalSymptoms}</div>}{(sc.clinical_tests || sc.clinicalTests) && <div style={{ marginTop: '2px' }}><strong>CLS:</strong> {sc.clinical_tests || sc.clinicalTests}</div>}</td>
                    <td style={CELL}>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</td>
                    <td style={CELL}>{(sc.consultation_order || sc.consultationOrder) && <div><strong>Lệnh:</strong> {sc.consultation_order || sc.consultationOrder}</div>}{(sc.postoperative_diagnosis || sc.postoperativeDiagnosis) && <div style={{ marginTop: '2px' }}><strong>Sau mổ:</strong> {sc.postoperative_diagnosis || sc.postoperativeDiagnosis}</div>}</td>
                    <td style={CELL}>{sc.current_status || sc.currentStatus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section III: Transfer Cases */}
        {safeTransferCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#B45309', color: '#fff', padding: '3px 8px', fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '2px 2px 0 0' }}>III. Danh Sách Ca Chuyển Viện ({safeTransferCases.length} ca)</div>
            <table style={TABLE_STYLE} className="pdf-table">
              <thead>
                <tr style={{ backgroundColor: '#FEF3C7' }}>
                  <th style={{ ...TH, width: '4%', backgroundColor: '#FEF3C7', color: '#92400E' }}>STT</th>
                  <th style={{ ...TH, width: '18%', backgroundColor: '#FEF3C7', color: '#92400E' }}>Họ tên / Tuổi / Đ/C</th>
                  <th style={{ ...TH, width: '11%', backgroundColor: '#FEF3C7', color: '#92400E' }}>Giờ vào / Lý do</th>
                  <th style={{ ...TH, width: '25%', backgroundColor: '#FEF3C7', color: '#92400E' }}>Lâm sàng & Cận lâm sàng</th>
                  <th style={{ ...TH, width: '21%', backgroundColor: '#FEF3C7', color: '#92400E' }}>Chẩn đoán & Xử trí</th>
                  <th style={{ ...TH, width: '21%', backgroundColor: '#FEF3C7', color: '#92400E' }}>Diễn biến chuyển viện</th>
                </tr>
              </thead>
              <tbody>
                {safeTransferCases.map((tc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FFFBF0' }}>
                    <td style={CELL_CENTER}>{i + 1}</td>
                    <td style={CELL}><strong>{tc.patient_name || tc.patientName || '—'}</strong><div style={{ fontSize: '7.5pt', color: '#374151' }}>{formatPatientAge(tc.age)}</div><div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{tc.address}</div></td>
                    <td style={CELL}><strong>{tc.admission_time || tc.admissionTime || '—'}</strong><div style={{ fontSize: '7.5pt' }}>{tc.reason}</div></td>
                    <td style={CELL}>{(tc.clinical_symptoms || tc.clinicalSymptoms) && <div><strong>LS:</strong> {tc.clinical_symptoms || tc.clinicalSymptoms}</div>}{(tc.clinical_tests || tc.clinicalTests) && <div style={{ marginTop: '2px' }}><strong>CLS:</strong> {tc.clinical_tests || tc.clinicalTests}</div>}</td>
                    <td style={CELL}><div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>{(tc.initial_treatment || tc.initialTreatment) && <div style={{ marginTop: '2px' }}><strong>XT:</strong> {tc.initial_treatment || tc.initialTreatment}</div>}</td>
                    <td style={CELL}>{tc.progress_notes || tc.progressNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section IV: Critical Cases */}
        {safeCriticalCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#6D28D9', color: '#fff', padding: '3px 8px', fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '2px 2px 0 0' }}>IV. Bệnh Nhân Nặng Cần Theo Dõi ({safeCriticalCases.length} ca)</div>
            <table style={TABLE_STYLE} className="pdf-table">
              <thead>
                <tr style={{ backgroundColor: '#EDE9FE' }}>
                  <th style={{ ...TH, width: '4%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>STT</th>
                  <th style={{ ...TH, width: '16%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>Họ tên / Tuổi / Đ/C</th>
                  <th style={{ ...TH, width: '11%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>Giờ vào / Tiền sử</th>
                  <th style={{ ...TH, width: '24%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>Lâm sàng, Sinh hiệu & CLS</th>
                  <th style={{ ...TH, width: '24%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>Chẩn đoán & Diễn biến</th>
                  <th style={{ ...TH, width: '21%', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>Xử trí & Bàn giao</th>
                </tr>
              </thead>
              <tbody>
                {safeCriticalCases.map((cc, i) => (
                  <tr key={i} className="patient-card" style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAF5FF' }}>
                    <td style={CELL_CENTER}>{i + 1}</td>
                    <td style={CELL}><strong>{cc.patient_name || cc.patientName || '—'}</strong><div style={{ fontSize: '7.5pt', color: '#374151' }}>{formatPatientAge(cc.age)}</div><div style={{ fontSize: '7.5pt', color: '#6B7280' }}>{cc.address}</div></td>
                    <td style={CELL}><strong>{cc.admission_time || cc.admissionTime || '—'}</strong><div style={{ fontSize: '7.5pt' }}>{cc.medical_history || cc.medicalHistory}</div></td>
                    <td style={CELL}>{(cc.clinical_symptoms || cc.clinicalSymptoms) && <div><strong>LS:</strong> {cc.clinical_symptoms || cc.clinicalSymptoms}</div>}{(cc.clinical_tests || cc.clinicalTests) && <div style={{ marginTop: '2px' }}><strong>CLS:</strong> {cc.clinical_tests || cc.clinicalTests}</div>}</td>
                    <td style={CELL}><div><strong>CĐ:</strong> {cc.diagnosis || '—'}</div>{(cc.condition_summary || cc.conditionSummary) && <div style={{ marginTop: '2px', fontSize: '7.5pt', color: '#4B5563' }}>{cc.condition_summary || cc.conditionSummary}</div>}</td>
                    <td style={CELL}><div><strong>XT:</strong> {cc.treatment || '—'}</div>{cc.notes && <div style={{ marginTop: '2px', color: '#5B21B6', fontSize: '7.5pt' }}>📌 {cc.notes}</div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section V: Death Cases */}
        {safeDeathCases.length > 0 && (
          <div className="report-section-box" style={{ marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#DC2626', color: '#fff', padding: '3px 8px', fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '2px 2px 0 0' }}>V. Hồ Sơ Bệnh Nhân Tử Vong ({safeDeathCases.length} trường hợp)</div>
            {safeDeathCases.map((dc, i) => (
              <table key={i} style={{ ...TABLE_STYLE, marginBottom: i < safeDeathCases.length - 1 ? '4px' : '0' }} className="pdf-table patient-case-box">
                <thead>
                  <tr style={{ backgroundColor: '#FEE2E2' }}>
                    <th colSpan={2} style={{ ...TH, backgroundColor: '#FEE2E2', color: '#991B1B', textAlign: 'left' }}>Ca tử vong #{i + 1}: <strong>{dc.patient_name || dc.patientName || '—'}</strong> ({formatPatientAge(dc.age)}) — {dc.address} | Giờ vào: {dc.admission_time || dc.admissionTime || '—'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Tình trạng lúc vào viện', dc.admission_status || dc.admissionStatus],
                    ['Tiền sử bệnh', dc.medical_history || dc.medicalHistory],
                    ...(dc.clinical_symptoms || dc.clinicalSymptoms ? [['Lâm sàng & Sinh hiệu', dc.clinical_symptoms || dc.clinicalSymptoms]] : []),
                    ['Cận lâm sàng / ECG', dc.clinical_tests || dc.clinicalTests],
                    ['Chẩn đoán tử vong', dc.diagnosis],
                    ['Xử trí cấp cứu', dc.emergency_treatment || dc.emergencyTreatment],
                    ['Kết quả & Kết luận', dc.final_outcome || dc.finalOutcome],
                  ].map(([label, val], rIdx) => (
                    <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? '#FFF7F7' : '#FFFFFF' }}>
                      <td style={{ ...CELL, width: '25%', fontWeight: '700', backgroundColor: '#FFF5F5', color: label === 'Chẩn đoán tử vong' ? '#991B1B' : '#7F1D1D', whiteSpace: 'nowrap' }}>{label}:</td>
                      <td style={{ ...CELL, fontWeight: label === 'Chẩn đoán tử vong' ? '700' : 'normal', color: label === 'Chẩn đoán tử vong' ? '#B91C1C' : '#111827' }}>{val || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        )}

        {/* Signature Block */}
        <table className="pdf-avoid-break" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginTop: '10px' }}>
          <tbody>
            <tr style={{ backgroundColor: '#F1F5F9' }}>
              <td style={{ ...CELL, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8.5pt', color: '#065F46', width: '50%', borderRight: '1px solid #000' }}>Điều Dưỡng Trực</td>
              <td style={{ ...CELL, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8.5pt', color: '#1E40AF', width: '50%' }}>Bác Sĩ Trực</td>
            </tr>
            <tr>
              <td style={{ ...CELL, textAlign: 'center', fontSize: '7.5pt', color: '#64748B', fontStyle: 'italic', height: '40px', borderRight: '1px solid #000' }}>(Ký và ghi rõ họ tên)</td>
              <td style={{ ...CELL, textAlign: 'center', fontSize: '7.5pt', color: '#64748B', fontStyle: 'italic', height: '40px' }}>(Ký và ghi rõ họ tên)</td>
            </tr>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <td style={{ ...CELL, textAlign: 'center', fontWeight: 'bold', color: '#065F46', fontSize: '8.5pt', borderRight: '1px solid #000', paddingBottom: '6px' }}>{nurseName || '___________________________'}</td>
              <td style={{ ...CELL, textAlign: 'center', fontWeight: 'bold', color: '#1E40AF', fontSize: '8.5pt', paddingBottom: '6px' }}>{doctorName || '___________________________'}</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default DepartmentPrintView;
