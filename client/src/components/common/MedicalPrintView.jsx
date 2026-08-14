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
  noi: 'Khoa Nội',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Sản',
  yhct_phcn: 'Y học cổ truyền – PHCN',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Gây mê Hồi sức',
};

const MedicalPrintView = ({ date, reports = [], onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Sort reports by official sequence
  const sortedReports = [...reports].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
    const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
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
        margin: [8, 8, 8, 8],
        filename: `Bao_Cao_Giao_Ban_${date}.pdf`,
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
      backgroundColor: '#0B132B', // 100% Solid Dark Navy Background (No Transparency / No Blur)
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
              MẪU XUẤT BẢN BÁO CÁO GIAO BAN CHUẨN Y TẾ
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
              Định dạng chuẩn A4 chính quy phục vụ in ấn và lưu trữ hồ sơ bệnh viện
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
              <><FaFilePdf style={{ fontSize: '1.05rem' }} /> Tải Về File PDF</>
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
        padding: '30mm 20mm',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '13pt',
        lineHeight: 1.4,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        marginBottom: '4rem'
      }}>
        {/* Document Header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <tbody>
            <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
              <td style={{ width: '45%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000' }}>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  SỞ Y TẾ BÌNH PHƯỚC
                </div>
                <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>
                  TTYT KHU VỰC BÌNH LONG
                </div>
                <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                  Phòng Kế Hoạch - Nghiệp Vụ
                </div>
                <div style={{ width: '80px', height: '1px', backgroundColor: '#000000', margin: '4px auto 0' }}></div>
              </td>
              <td style={{ width: '55%', textAlign: 'center', backgroundColor: '#FFFFFF', color: '#000000' }}>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ width: '120px', height: '1px', backgroundColor: '#000000', margin: '4px auto 0' }}></div>
                <div style={{ fontSize: '11pt', fontStyle: 'italic', marginTop: '6px' }}>
                  {printDateStr}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Document Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', backgroundColor: '#FFFFFF' }}>
          <h1 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
            color: '#0F2C59',
            letterSpacing: '0.5px'
          }}>
            BÁO CÁO GIAO BAN TRỰC BỆNH VIỆN
          </h1>
          <div style={{ fontSize: '12pt', fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }}>
            ({formattedDateStr})
          </div>
        </div>

        {/* Section I: Hành chính ca trực */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
            I. TÌNH HÌNH HÀNH CHÍNH & NHÂN SỰ CA TRỰC CÁC KHOA PHÒNG
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '11pt', backgroundColor: '#FFFFFF' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center', color: '#000000' }}>
                <th style={{ border: '1px solid #000000', padding: '6px 4px', width: '35px', backgroundColor: '#F3F4F6' }}>STT</th>
                <th style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'left', width: '190px', backgroundColor: '#F3F4F6' }}>Khoa / Phòng</th>
                <th style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'left', backgroundColor: '#F3F4F6' }}>Bác Sĩ Trực Chính</th>
                <th style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'left', backgroundColor: '#F3F4F6' }}>Điều Dưỡng Trực</th>
                <th style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'left', backgroundColor: '#F3F4F6' }}>Trực Thêm Giờ / Tăng Cường</th>
                <th style={{ border: '1px solid #000000', padding: '6px 4px', width: '80px', backgroundColor: '#F3F4F6' }}>Phòng</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report, idx) => {
                const deptName = DEPARTMENT_NAMES[report.department_code] || report.department_name || report.department_code;
                const overtime = report.overtime_staff && Array.isArray(report.overtime_staff) && report.overtime_staff.length > 0
                  ? report.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ')
                  : '—';

                return (
                  <tr key={report.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px 8px', fontWeight: 'bold' }}>{deptName}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px 8px' }}>{report.doctor_name || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px 8px' }}>{report.nurse_name || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px 8px', fontSize: '10pt' }}>{overtime}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center', fontSize: '10pt' }}>{report.room || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section II: Bệnh nhân phẫu thuật (Bệnh mổ) */}
        {allSurgeryCases.length > 0 && (
          <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
              II. DANH SÁCH BỆNH NHÂN PHẪU THUẬT (BỆNH MỔ) ({allSurgeryCases.length} ca)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '10.5pt', backgroundColor: '#FFFFFF' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center', color: '#000000' }}>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '30px', backgroundColor: '#F3F4F6' }}>STT</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '130px', backgroundColor: '#F3F4F6' }}>Họ Tên / Năm Sinh</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '110px', backgroundColor: '#F3F4F6' }}>Khoa / Giờ Vào</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Chẩn Đoán Trước Mổ</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Lệnh Mổ / Hội Chẩn</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Chẩn Đoán Sau Mổ</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '120px', backgroundColor: '#F3F4F6' }}>Hiện Tại</th>
                </tr>
              </thead>
              <tbody>
                {allSurgeryCases.map((sc, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      <strong>{sc.patient_name || sc.patientName}</strong>
                      <div style={{ fontSize: '9.5pt', color: '#374151' }}>NS: {sc.birth_year || sc.birthYear || sc.age || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#4B5563' }}>{sc.address}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>{sc.departmentName}</strong></div>
                      <div>{sc.admission_time || sc.admissionTime || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>{sc.consultation_order || sc.consultationOrder || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>{sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>{sc.current_status || sc.currentStatus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section III: Bệnh nhân tử vong */}
        {allDeathCases.length > 0 && (
          <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#DC2626' }}>
              III. BÁO CÁO BỆNH NHÂN TỬ VONG ({allDeathCases.length} trường hợp)
            </h2>
            {allDeathCases.map((dc, i) => (
              <div key={i} style={{ border: '1.5px solid #000000', padding: '10px 14px', marginBottom: '8px', fontSize: '11pt', backgroundColor: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #666', paddingBottom: '4px', marginBottom: '6px' }}>
                  <span><strong>Ca tử vong #{i + 1}: {dc.patient_name || dc.patientName}</strong> ({dc.age} tuổi) — {dc.address}</span>
                  <span><strong>Khoa:</strong> {dc.departmentName}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                  <div><strong>- Thời gian vào viện:</strong> {dc.admission_time || dc.admissionTime || '—'} | <strong>Lý do:</strong> {dc.reason || '—'}</div>
                  <div><strong>- Tình trạng lúc vào khoa:</strong> {dc.admission_status || dc.admissionStatus || '—'}</div>
                  <div><strong>- Tiền sử bệnh:</strong> {dc.medical_history || dc.medicalHistory || '—'}</div>
                  <div><strong>- Cận lâm sàng / ECG:</strong> {dc.clinical_tests || dc.clinicalTests || '—'}</div>
                  <div><strong>- Chẩn đoán tử vong:</strong> <strong style={{ color: '#DC2626' }}>{dc.diagnosis || '—'}</strong></div>
                  <div><strong>- Quá trình xử trí cấp cứu:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                  <div><strong>- Kết quả & Hướng xử lý:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section IV: Bệnh nhân chuyển viện */}
        {allTransferCases.length > 0 && (
          <div style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
              IV. DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN CẤP CỨU ({allTransferCases.length} ca)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '10.5pt', backgroundColor: '#FFFFFF' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center', color: '#000000' }}>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '30px', backgroundColor: '#F3F4F6' }}>STT</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '150px', backgroundColor: '#F3F4F6' }}>Họ Tên / Địa Chỉ</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', width: '110px', backgroundColor: '#F3F4F6' }}>Khoa / Giờ Vào</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Lý Do & Cận Lâm Sàng</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Chẩn Đoán & Xử Trí</th>
                  <th style={{ border: '1px solid #000000', padding: '5px', backgroundColor: '#F3F4F6' }}>Diễn Biến / Hội Chẩn</th>
                </tr>
              </thead>
              <tbody>
                {allTransferCases.map((tc, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      <strong>{tc.patient_name || tc.patientName}</strong>
                      <div style={{ fontSize: '9.5pt', color: '#374151' }}>Tuổi: {tc.age || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#4B5563' }}>{tc.address}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>{tc.departmentName}</strong></div>
                      <div>{tc.admission_time || tc.admissionTime || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                      {tc.clinical_tests || tc.clinicalTests ? <div style={{ fontSize: '9.5pt', color: '#1F2937' }}><strong>CLS:</strong> {tc.clinical_tests || tc.clinicalTests}</div> : null}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      <div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>
                      <div style={{ fontSize: '9.5pt', color: '#1F2937' }}><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      {tc.progress_notes || tc.progressNotes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section V: Danh sách bệnh nhân nặng theo dõi (nếu có) */}
        {allCriticalCases.length > 0 && (
          <div style={{ marginTop: '1.5rem', pageBreakInside: 'avoid' }}>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem', color: '#5B21B6' }}>
              V. DANH SÁCH BỆNH NHÂN NẶNG THEO DÕI ({allCriticalCases.length} ca)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3E8FF', color: '#5B21B6', fontWeight: 'bold', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #000000', padding: '6px', width: '35px' }}>STT</th>
                  <th style={{ border: '1px solid #000000', padding: '6px', width: '150px' }}>Họ Tên / Tuổi / Đ/C</th>
                  <th style={{ border: '1px solid #000000', padding: '6px', width: '120px' }}>Khoa / Giờ Vào (VV)</th>
                  <th style={{ border: '1px solid #000000', padding: '6px', width: '120px' }}>Tiền Căn / Chẩn Đoán</th>
                  <th style={{ border: '1px solid #000000', padding: '6px' }}>Tình Trạng & Diễn Biến</th>
                  <th style={{ border: '1px solid #000000', padding: '6px', width: '140px' }}>Xử Trí & Hướng Tiếp</th>
                </tr>
              </thead>
              <tbody>
                {allCriticalCases.map((cc, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAF5FF' }}>
                    <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      <strong>{cc.patient_name || cc.patientName}</strong>
                      <div style={{ fontSize: '9.5pt', color: '#374151' }}>Tuổi: {cc.age || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#4B5563' }}>{cc.address}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>{cc.departmentName}</strong></div>
                      <div>{cc.admission_time || cc.admissionTime || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>
                      {cc.medical_history || cc.medicalHistory ? <div style={{ fontSize: '9pt', color: '#4B5563' }}><strong>TC:</strong> {cc.medical_history || cc.medicalHistory}</div> : null}
                      <div><strong style={{ color: '#5B21B6' }}>CĐ:</strong> {cc.diagnosis || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      {cc.condition_summary || cc.conditionSummary || '—'}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>Xử trí:</strong> {cc.treatment || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#4B5563', marginTop: '2px' }}><em>{cc.notes || 'Bàn giao tua sau theo dõi tiếp'}</em></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section VI: Chữ ký bàn giao & phê duyệt */}
        <div style={{ marginTop: '2.5rem', pageBreakInside: 'avoid', backgroundColor: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top', backgroundColor: '#FFFFFF' }}>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    BÁC SĨ TRỰC GIAO BAN
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '75px' }}></div>
                </td>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    TRƯỞNG PHÒNG KH-NV
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '75px' }}></div>
                </td>
                <td style={{ width: '33.3%', backgroundColor: '#FFFFFF', color: '#000000' }}>
                  <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    BAN GIÁM ĐỐC
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký, đóng dấu và ghi rõ họ tên)</div>
                  <div style={{ height: '75px' }}></div>
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
