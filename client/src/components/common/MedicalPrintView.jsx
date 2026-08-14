import React, { useState } from 'react';
import { FaPrint, FaTimes, FaHospital, FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa';

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

const FIELD_LABELS = {
  // LCK
  tmh_tongSo: 'TMH (Tổng khám)',
  tmh_thuThuat: 'TMH (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'RHM + Nội (Tổng khám)',
  rhm_noi_thuThuat: 'RHM + Nội (Thủ thuật)',
  daLieu_tongSo: 'Da liễu (Tổng khám)',
  tong4ck_tongSo: 'Tổng 4 chuyên khoa',
  tong4ck_thuThuat: 'Tổng thủ thuật 4CK',

  // Common
  tongSoKham: 'Tổng khám',
  benhCu: 'Bệnh cũ',
  benhMoi: 'Bệnh mới',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  baoHiem: 'BHYT',
  noiTru: 'Nội trú',
  ngoaiTru: 'Ngoại trú',
  tongSo: 'Tổng số',

  // XN
  tongXetNghiem: 'Tổng XN thực hiện',
  sinhHoa: 'Sinh hóa',
  huyetHoc: 'Huyết học',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  viSinh: 'Vi sinh',
  mienDich: 'Miễn dịch',

  // CDHA
  tongSoSieuAm: 'Tổng siêu âm',
  tongSoXquang: 'Tổng X-quang',
  tongSoCT: 'Tổng CT Scanner',

  // HSCC - TNT
  tnt_benhCu: 'Bệnh cũ (TNT)',
  tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)',
  tnt_hienCon: 'Hiện còn (TNT)',
  thoMay: 'Thở máy',
  cpap: 'Thở CPAP',
  thoOxy: 'Thở Oxy',
  ctdk: 'Chạy thận định kỳ',

  // San
  sanhThuong: 'Sanh thường',
  sanhHut: 'Sanh hút',
  moLayThai: 'Mổ lấy thai',
  moDe: 'Mổ đẻ',
  choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm sản',

  // GMHS
  tongSoCaMo: 'Tổng số ca mổ',
  cc_ctch: 'Mổ CC - CTCH',
  cc_ngoaiTH: 'Mổ CC - Ngoại TH',
  cc_san: 'Mổ CC - Sản',
  ct_ctch: 'Mổ CT - CTCH',
  ct_ngoaiTH: 'Mổ CT - Ngoại TH',
  ct_san: 'Mổ CT - Sản',
  soCaGayMe: 'Số ca gây mê',
  soCaHoiTinh: 'Số ca hồi tỉnh'
};

const formatPatientAge = (ageVal) => {
  if (!ageVal) return '';
  const str = String(ageVal).trim();
  const clean = str.replace(/tuổi/gi, '').replace(/,/g, '').replace(/\./g, '').trim();
  return clean ? `${clean} tuổi` : '';
};

const MedicalPrintView = ({ date, reports = [], onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Sort reports by official sequence
  const sortedReports = [...reports].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
    const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  const reportMap = {};
  sortedReports.forEach(r => {
    reportMap[r.department_code] = r;
  });

  // Collect all surgery cases across departments
  const allSurgeryCases = [];
  // Collect all death cases across departments
  const allDeathCases = [];
  // Collect all transfer cases across departments
  const allTransferCases = [];
  // Collect all critical monitoring cases across departments
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

  // Calculate totals for summary table
  let sumKham = 0, sumCu = 0, sumMoi = 0, sumXuat = 0, sumChuyen = 0, sumMo = 0, sumTuVong = 0;
  DEPARTMENT_ORDER.forEach(code => {
    const report = reportMap[code];
    if (!report) return;
    const repData = typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {});
    sumKham += parseInt(repData.tongSoKham || repData.tongSo || repData.tmh_tongSo || 0, 10) || 0;
    sumCu += parseInt(repData.benhCu || repData.tnt_benhCu || 0, 10) || 0;
    sumMoi += parseInt(repData.benhMoi || repData.tnt_benhMoi || 0, 10) || 0;
    sumXuat += parseInt(repData.xuatVien || repData.tnt_xuatVien || 0, 10) || 0;
    sumChuyen += parseInt(repData.chuyenVien || repData.tnt_chuyenVien || 0, 10) || (report.transferCases?.length || 0);
    sumMo += parseInt(repData.tongSoCaMo || 0, 10) || (report.surgeryCases?.length || 0);
    sumTuVong += parseInt(repData.tuVong || 0, 10) || (report.deathCases?.length || 0);
  });

  // Format date for display
  const dateObj = new Date(date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
  const formattedDateStr = `${dayName}, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
  const now = new Date();
  const printDateStr = `Bình Long, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

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
        margin: [6, 6, 6, 6],
        filename: `Bao_Cao_Giao_Ban_Chi_Tiet_${date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#FFFFFF' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed, fallback to print:', err);
      alert('Không thể tạo file PDF tự động. Trình duyệt sẽ mở cửa sổ In để bạn chọn "Lưu dưới dạng PDF" (Save as PDF).');
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
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
        maxWidth: '960px',
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

      {/* A4 Paper Canvas - 100% Solid Pure White */}
      <div className="printable-medical-document" style={{
        width: '100%',
        maxWidth: '960px',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        borderRadius: '6px',
        padding: '25mm 18mm',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '12pt',
        lineHeight: 1.35,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        marginBottom: '4rem'
      }}>
        {/* Document Header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', backgroundColor: '#FFFFFF' }}>
          <tbody>
            <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
              <td style={{ width: '45%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000' }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  SỞ Y TẾ BÌNH PHƯỚC
                </div>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>
                  TTYT KHU VỰC BÌNH LONG
                </div>
                <div style={{ fontSize: '10.5pt', fontStyle: 'italic' }}>
                  Phòng Kế Hoạch - Nghiệp Vụ
                </div>
                <div style={{ width: '80px', height: '1px', backgroundColor: '#000000', margin: '4px auto 0' }}></div>
              </td>
              <td style={{ width: '55%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000' }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ width: '120px', height: '1px', backgroundColor: '#000000', margin: '4px auto 0' }}></div>
                <div style={{ fontSize: '10.5pt', fontStyle: 'italic', marginTop: '5px' }}>
                  {printDateStr}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Document Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <h1 style={{
            fontSize: '15pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            margin: '0 0 3px 0',
            color: '#0F2C59',
            letterSpacing: '0.5px'
          }}>
            BÁO CÁO GIAO BAN BỆNH VIỆN
          </h1>
          <div style={{ fontSize: '11.5pt', fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }}>
            ({formattedDateStr})
          </div>
        </div>

        {/* =========================================================================
            PHẦN 1: BÌA & BẢNG TỔNG HỢP SỐ LIỆU GIAO BAN TOÀN VIỆN
        ========================================================================= */}
        <div style={{ marginBottom: '1.75rem', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '3px' }}>
            PHẦN I: TỔNG HỢP SỐ LIỆU GIAO BAN TOÀN VIỆN ({sortedReports.length}/12 Khoa)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '10pt', backgroundColor: '#FFFFFF' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'center', color: '#000000', fontWeight: 'bold' }}>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '25px' }}>STT</th>
                <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'left', width: '160px' }}>Khoa / Phòng</th>
                <th style={{ border: '1px solid #000000', padding: '5px 4px', width: '60px' }}>Trạng Thái</th>
                <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'left' }}>Bác Sĩ Trực</th>
                <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'left' }}>Điều Dưỡng</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Khám</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Cũ</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Mới</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Xuất</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Chuyển</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Mổ</th>
                <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '38px' }}>Tử Vong</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENT_ORDER.map((code, idx) => {
                const report = reportMap[code];
                const deptName = DEPARTMENT_NAMES[code] || code;
                const isSubmitted = !!report;
                const repData = report ? (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {})) : {};

                let kham = parseInt(repData.tongSoKham || repData.tongSo || repData.tmh_tongSo || 0, 10) || 0;
                let cu = parseInt(repData.benhCu || repData.tnt_benhCu || 0, 10) || 0;
                let moi = parseInt(repData.benhMoi || repData.tnt_benhMoi || 0, 10) || 0;
                let xuat = parseInt(repData.xuatVien || repData.tnt_xuatVien || 0, 10) || 0;
                let chuyen = parseInt(repData.chuyenVien || repData.tnt_chuyenVien || 0, 10) || (report?.transferCases?.length || 0);
                let mo = parseInt(repData.tongSoCaMo || 0, 10) || (report?.surgeryCases?.length || 0);
                let tuVong = parseInt(repData.tuVong || 0, 10) || (report?.deathCases?.length || 0);

                return (
                  <tr key={code} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px', fontWeight: 'bold' }}>{deptName}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center', fontSize: '9pt', color: isSubmitted ? '#16A34A' : '#DC2626', fontWeight: 'bold' }}>
                      {isSubmitted ? 'Đã nộp' : 'Chưa'}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px' }}>{report?.doctor_name || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px' }}>{report?.nurse_name || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{kham || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{cu || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{moi || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{xuat || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{chuyen || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center' }}>{mo || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 2px', textAlign: 'center', fontWeight: tuVong > 0 ? 'bold' : 'normal', color: tuVong > 0 ? '#DC2626' : '#000' }}>
                      {tuVong || '0'}
                    </td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr style={{ backgroundColor: '#EFF6FF', fontWeight: 'bold' }}>
                <td colSpan={2} style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'center' }}>TỔNG CỘNG TOÀN VIỆN</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sortedReports.length}/12</td>
                <td colSpan={2} style={{ border: '1px solid #000000', padding: '5px 6px' }}></td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumKham}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumCu}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumMoi}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumXuat}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumChuyen}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center' }}>{sumMo}</td>
                <td style={{ border: '1px solid #000000', padding: '5px 2px', textAlign: 'center', color: sumTuVong > 0 ? '#DC2626' : '#000' }}>{sumTuVong}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            PHẦN 2: DỮ LIỆU BÁO CÁO CHUYÊN MÔN TỪNG KHOA PHÒNG
        ========================================================================= */}
        <div style={{ marginBottom: '1.75rem', pageBreakBefore: 'auto', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '3px' }}>
            PHẦN II: DỮ LIỆU BÁO CÁO CHUYÊN MÔN CHI TIẾT TỪNG KHOA PHÒNG
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {sortedReports.map((report) => {
              const deptName = DEPARTMENT_NAMES[report.department_code] || report.department_name || report.department_code;
              const repData = typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {});

              const metrics = [];
              Object.entries(repData).forEach(([k, v]) => {
                if (v === null || v === undefined || v === '') return;
                if (typeof v === 'object' && !Array.isArray(v)) {
                  Object.entries(v).forEach(([subK, subV]) => {
                    if (subV !== null && subV !== undefined && subV !== '') {
                      metrics.push({ label: `${FIELD_LABELS[subK] || subK} (${k.toUpperCase()})`, value: String(subV) });
                    }
                  });
                } else if (Array.isArray(v)) {
                  if (v.length > 0 && typeof v[0] === 'object') {
                    v.forEach((item) => {
                      metrics.push({ label: item.name, value: `${item.tongSo || 0} (BHYT: ${item.baoHiem || 0})` });
                    });
                  }
                } else {
                  metrics.push({ label: FIELD_LABELS[k] || k, value: String(v) });
                }
              });

              return (
                <div key={report.id || report.department_code} style={{ border: '1px solid #94A3B8', borderRadius: '4px', padding: '6px 8px', fontSize: '9.5pt', pageBreakInside: 'avoid', backgroundColor: '#FAFAFA' }}>
                  <div style={{ fontWeight: 'bold', color: '#1E3A8A', borderBottom: '1px dashed #CBD5E1', paddingBottom: '3px', marginBottom: '4px', fontSize: '10pt' }}>
                    🏥 {deptName}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#475569', marginBottom: '4px' }}>
                    <strong>BS:</strong> {report.doctor_name || '—'} | <strong>ĐD:</strong> {report.nurse_name || '—'} {report.room ? `| Phòng: ${report.room}` : ''}
                  </div>
                  {metrics.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '9pt' }}>
                      {metrics.slice(0, 10).map((m, mIdx) => (
                        <div key={mIdx} style={{ backgroundColor: '#FFFFFF', padding: '2px 4px', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                          <span style={{ color: '#475569' }}>{m.label}: </span>
                          <strong style={{ color: '#0F2C59' }}>{m.value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94A3B8', fontSize: '8.5pt' }}>Không có chỉ số chuyên môn phụ</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            PHẦN 3: BÁO CÁO CÁC CA BỆNH CHI TIẾT
        ========================================================================= */}
        <div style={{ marginBottom: '1.75rem', pageBreakBefore: 'auto', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#0F2C59', borderBottom: '1.5px solid #0F2C59', paddingBottom: '3px' }}>
            PHẦN III: BÁO CÁO CHI TIẾT CÁC CA BỆNH ĐẶC BIỆT
          </h2>

          {/* 1. Ca Phẫu Thuật (Mổ) */}
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0', color: '#0369A1' }}>
              1. Danh sách bệnh nhân phẫu thuật (Mổ) ({allSurgeryCases.length} ca)
            </h3>
            {allSurgeryCases.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '9.5pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#E0F2FE', textAlign: 'center', color: '#0369A1', fontWeight: 'bold' }}>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '25px' }}>STT</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '120px' }}>Họ Tên / Tuổi</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '100px' }}>Khoa / Giờ Vào</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Chẩn Đoán Trước Mổ</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Lệnh Mổ / Hội Chẩn</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Chẩn Đoán Sau Mổ</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '100px' }}>Hiện Tại</th>
                  </tr>
                </thead>
                <tbody>
                  {allSurgeryCases.map((sc, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        <strong>{sc.patient_name || sc.patientName}</strong>
                        <div style={{ fontSize: '8.5pt', color: '#4B5563' }}>{formatPatientAge(sc.birth_year || sc.birthYear || sc.age)}</div>
                        <div style={{ fontSize: '8.5pt', color: '#6B7280' }}>{sc.address}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        <div><strong>{sc.departmentName}</strong></div>
                        <div>{sc.admission_time || sc.admissionTime || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>{sc.consultation_order || sc.consultationOrder || '—'}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>{sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>{sc.current_status || sc.currentStatus || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#64748B', padding: '4px 0' }}>Không phát sinh ca phẫu thuật trong ngày.</div>
            )}
          </div>

          {/* 2. Ca Chuyển Viện */}
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0', color: '#D97706' }}>
              2. Danh sách bệnh nhân chuyển viện cấp cứu ({allTransferCases.length} ca)
            </h3>
            {allTransferCases.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '9.5pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FEF3C7', textAlign: 'center', color: '#92400E', fontWeight: 'bold' }}>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '25px' }}>STT</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '130px' }}>Họ Tên / Địa Chỉ</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '100px' }}>Khoa / Giờ Vào</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Lý Do & Cận Lâm Sàng</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Chẩn Đoán & Xử Trí</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Diễn Biến Chuyển</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransferCases.map((tc, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        <strong>{tc.patient_name || tc.patientName}</strong>
                        <div style={{ fontSize: '8.5pt', color: '#4B5563' }}>{formatPatientAge(tc.age)}</div>
                        <div style={{ fontSize: '8.5pt', color: '#6B7280' }}>{tc.address}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        <div><strong>{tc.departmentName}</strong></div>
                        <div>{tc.admission_time || tc.admissionTime || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                        {tc.clinical_tests || tc.clinicalTests ? <div style={{ fontSize: '8.5pt', color: '#374151' }}><strong>CLS:</strong> {tc.clinical_tests || tc.clinicalTests}</div> : null}
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        <div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>
                        <div style={{ fontSize: '8.5pt', color: '#374151' }}><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        {tc.progress_notes || tc.progressNotes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#64748B', padding: '4px 0' }}>Không phát sinh ca chuyển viện trong ngày.</div>
            )}
          </div>

          {/* 3. Ca Tử Vong */}
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0', color: '#DC2626' }}>
              3. Hồ sơ bệnh nhân tử vong ({allDeathCases.length} trường hợp)
            </h3>
            {allDeathCases.length > 0 ? (
              allDeathCases.map((dc, i) => (
                <div key={i} style={{ border: '1.5px solid #000000', padding: '8px 12px', marginBottom: '6px', fontSize: '10pt', backgroundColor: '#FEF2F2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #DC2626', paddingBottom: '3px', marginBottom: '5px' }}>
                    <span><strong style={{ color: '#991B1B' }}>Ca tử vong #{i + 1}: {dc.patient_name || dc.patientName}</strong> ({formatPatientAge(dc.age)}) — {dc.address}</span>
                    <span><strong>Khoa:</strong> {dc.departmentName}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3px' }}>
                    <div><strong>- Giờ vào viện:</strong> {dc.admission_time || dc.admissionTime || '—'} | <strong>Lý do:</strong> {dc.reason || '—'}</div>
                    <div><strong>- Tình trạng lúc vào:</strong> {dc.admission_status || dc.admissionStatus || '—'}</div>
                    <div><strong>- Tiền sử bệnh:</strong> {dc.medical_history || dc.medicalHistory || '—'}</div>
                    <div><strong>- Cận lâm sàng / ECG:</strong> {dc.clinical_tests || dc.clinicalTests || '—'}</div>
                    <div><strong>- Chẩn đoán tử vong:</strong> <strong style={{ color: '#DC2626' }}>{dc.diagnosis || '—'}</strong></div>
                    <div><strong>- Quá trình xử trí cấp cứu:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                    <div><strong>- Kết quả & Kết luận:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#64748B', padding: '4px 0' }}>Không có trường hợp tử vong trong ngày.</div>
            )}
          </div>

          {/* 4. Ca Bệnh Nặng Cần Theo Dõi */}
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0', color: '#7C3AED' }}>
              4. Danh sách bệnh nhân nặng cần theo dõi ({allCriticalCases.length} ca)
            </h3>
            {allCriticalCases.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '9.5pt', backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#EDE9FE', textAlign: 'center', color: '#5B21B6', fontWeight: 'bold' }}>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '25px' }}>STT</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '130px' }}>Họ Tên / Tuổi / Đ/C</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '100px' }}>Khoa / Giờ Vào</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '120px' }}>Tiền Căn / Chẩn Đoán</th>
                    <th style={{ border: '1px solid #000000', padding: '4px' }}>Tình Trạng & Diễn Biến</th>
                    <th style={{ border: '1px solid #000000', padding: '4px', width: '120px' }}>Xử Trí & Hướng Tiếp</th>
                  </tr>
                </thead>
                <tbody>
                  {allCriticalCases.map((cc, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAF5FF' }}>
                      <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        <strong>{cc.patient_name || cc.patientName}</strong>
                        <div style={{ fontSize: '8.5pt', color: '#4B5563' }}>{formatPatientAge(cc.age)}</div>
                        <div style={{ fontSize: '8.5pt', color: '#6B7280' }}>{cc.address}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        <div><strong>{cc.departmentName}</strong></div>
                        <div>{cc.admission_time || cc.admissionTime || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px' }}>
                        {cc.medical_history || cc.medicalHistory ? <div style={{ fontSize: '8.5pt', color: '#4B5563' }}><strong>TC:</strong> {cc.medical_history || cc.medicalHistory}</div> : null}
                        <div><strong style={{ color: '#5B21B6' }}>CĐ:</strong> {cc.diagnosis || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        {cc.condition_summary || cc.conditionSummary || '—'}
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '4px', fontSize: '9pt' }}>
                        <div><strong>Xử trí:</strong> {cc.treatment || '—'}</div>
                        <div style={{ fontSize: '8.5pt', color: '#4B5563', marginTop: '2px' }}><em>{cc.notes || 'Bàn giao tua sau theo dõi tiếp'}</em></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#64748B', padding: '4px 0' }}>Không có ca bệnh nặng theo dõi trong ngày.</div>
            )}
          </div>
        </div>

        {/* Section Chữ ký bàn giao & phê duyệt */}
        <div style={{ marginTop: '2rem', pageBreakInside: 'avoid', backgroundColor: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    BÁC SĨ TRỰC GIAO BAN
                  </div>
                  <div style={{ fontSize: '9.5pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '70px' }}></div>
                </td>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    TRƯỞNG PHÒNG KH-NV
                  </div>
                  <div style={{ fontSize: '9.5pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '70px' }}></div>
                </td>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    BAN GIÁM ĐỐC
                  </div>
                  <div style={{ fontSize: '9.5pt', fontStyle: 'italic' }}>(Ký, đóng dấu và ghi rõ họ tên)</div>
                  <div style={{ height: '70px' }}></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicalPrintView;
