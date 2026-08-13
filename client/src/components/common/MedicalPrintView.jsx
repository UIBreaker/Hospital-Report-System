import React from 'react';
import { FaPrint, FaTimes, FaFilePdf, FaAmbulance, FaHeartbeat, FaProcedures, FaHospital } from 'react-icons/fa';

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

  return (
    <div className="medical-print-modal-backdrop" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      padding: '1.5rem 0'
    }}>
      {/* Control bar (hidden during print) */}
      <div className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '0.75rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        maxWidth: '900px',
        width: '95%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
          <FaHospital style={{ color: '#60A5FA', fontSize: '1.25rem' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>
              MẪU XUẤT BẢN BÁO CÁO GIAO BAN CHUẨN Y TẾ
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
              Định dạng chuẩn A4 phục vụ in ấn và lưu trữ hồ sơ bệnh viện
            </span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          style={{
            backgroundColor: '#22C55E', color: '#FFFFFF',
            border: 'none', padding: '0.6rem 1.4rem',
            borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)'
          }}
        >
          <FaPrint /> In Báo Cáo (Ctrl + P)
        </button>

        <button
          onClick={onClose}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1rem',
            borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
          }}
        >
          <FaTimes /> Đóng
        </button>
      </div>

      {/* A4 Paper Canvas */}
      <div className="printable-medical-document" style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
        borderRadius: '4px',
        padding: '20mm 15mm 20mm 20mm',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '13pt',
        lineHeight: 1.35,
        boxSizing: 'border-box'
      }}>
        {/* Document Header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
          <tbody>
            <tr style={{ verticalAlign: 'top' }}>
              <td style={{ width: '45%', textAlign: 'center' }}>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  SỞ Y TẾ BÌNH PHƯỚC
                </div>
                <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>
                  TTYT KHU VỰC BÌNH LONG
                </div>
                <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                  Phòng Kế Hoạch - Nghiệp Vụ
                </div>
                <div style={{ width: '80px', height: '1px', backgroundColor: '#000', margin: '4px auto 0' }}></div>
              </td>
              <td style={{ width: '55%', textAlign: 'center' }}>
                <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ width: '120px', height: '1px', backgroundColor: '#000', margin: '4px auto 0' }}></div>
                <div style={{ fontSize: '11pt', fontStyle: 'italic', marginTop: '6px' }}>
                  {printDateStr}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Document Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
          <div style={{ fontSize: '12pt', fontWeight: 'bold', fontStyle: 'italic' }}>
            ({formattedDateStr})
          </div>
        </div>

        {/* Section I: Hành chính ca trực */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
            I. TÌNH HÌNH HÀNH CHÍNH & NHÂN SỰ CA TRỰC CÁC KHOA PHÒNG
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                <th style={{ border: '1px solid #000', padding: '6px 4px', width: '35px' }}>STT</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left', width: '190px' }}>Khoa / Phòng</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Bác Sĩ Trực Chính</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Điều Dưỡng Trực</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Trực Thêm Giờ / Tăng Cường</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', width: '80px' }}>Phòng</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report, idx) => {
                const deptName = DEPARTMENT_NAMES[report.department_code] || report.department_name || report.department_code;
                const overtime = report.overtime_staff && Array.isArray(report.overtime_staff) && report.overtime_staff.length > 0
                  ? report.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ')
                  : '—';

                return (
                  <tr key={report.id || idx}>
                    <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px 8px', fontWeight: 'bold' }}>{deptName}</td>
                    <td style={{ border: '1px solid #000', padding: '5px 8px' }}>{report.doctor_name || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '5px 8px' }}>{report.nurse_name || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '5px 8px', fontSize: '10pt' }}>{overtime}</td>
                    <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: '10pt' }}>{report.room || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section II: Bệnh nhân phẫu thuật (Bệnh mổ) */}
        {allSurgeryCases.length > 0 && (
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
              II. DANH SÁCH BỆNH NHÂN PHẪU THUẬT (BỆNH MỔ) ({allSurgeryCases.length} ca)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '30px' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '120px' }}>Họ Tên / Năm Sinh</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '100px' }}>Khoa / Giờ Vào</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Chẩn Đoán Trước Mổ</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Lệnh Mổ / Hội Chẩn</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Chẩn Đoán Sau Mổ</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '120px' }}>Hiện Tại</th>
                </tr>
              </thead>
              <tbody>
                {allSurgeryCases.map((sc, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <strong>{sc.patient_name || sc.patientName}</strong>
                      <div style={{ fontSize: '9.5pt', color: '#4B5563' }}>NS: {sc.birth_year || sc.birthYear || sc.age || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#6B7280' }}>{sc.address}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>{sc.departmentName}</strong></div>
                      <div>{sc.admission_time || sc.admissionTime || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{sc.consultation_order || sc.consultationOrder || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '9.5pt' }}>{sc.current_status || sc.currentStatus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section III: Bệnh nhân tử vong */}
        {allDeathCases.length > 0 && (
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#DC2626' }}>
              III. BÁO CÁO BỆNH NHÂN TỬ VONG ({allDeathCases.length} trường hợp)
            </h2>
            {allDeathCases.map((dc, i) => (
              <div key={i} style={{ border: '1.5px solid #000', padding: '10px 14px', marginBottom: '8px', fontSize: '11pt', backgroundColor: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #999', paddingBottom: '4px', marginBottom: '6px' }}>
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
          <div style={{ marginBottom: '1.25rem', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: '#0F2C59' }}>
              IV. DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN CẤP CỨU ({allTransferCases.length} ca)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '30px' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '140px' }}>Họ Tên / Địa Chỉ</th>
                  <th style={{ border: '1px solid #000', padding: '5px', width: '90px' }}>Khoa / Giờ Vào</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Lý Do & Cận Lâm Sàng</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Chẩn Đoán & Xử Trí</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Diễn Biến / Hội Chẩn</th>
                </tr>
              </thead>
              <tbody>
                {allTransferCases.map((tc, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <strong>{tc.patient_name || tc.patientName}</strong>
                      <div style={{ fontSize: '9.5pt', color: '#4B5563' }}>Tuổi: {tc.age || '—'}</div>
                      <div style={{ fontSize: '9pt', color: '#6B7280' }}>{tc.address}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '9.5pt' }}>
                      <div><strong>{tc.departmentName}</strong></div>
                      <div>{tc.admission_time || tc.admissionTime || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                      {tc.clinical_tests || tc.clinicalTests ? <div style={{ fontSize: '9.5pt', color: '#374151' }}>CLS: {tc.clinical_tests || tc.clinicalTests}</div> : null}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <div><strong>CĐ:</strong> {tc.diagnosis || '—'}</div>
                      <div style={{ fontSize: '9.5pt', color: '#374151' }}><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '9.5pt' }}>
                      {tc.progress_notes || tc.progressNotes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section V: Chữ ký bàn giao & phê duyệt */}
        <div style={{ marginTop: '2rem', pageBreakInside: 'avoid' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top' }}>
                <td style={{ width: '33.3%' }}>
                  <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    BÁC SĨ TRỰC GIAO BAN
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '75px' }}></div>
                </td>
                <td style={{ width: '33.3%' }}>
                  <div style={{ fontSize: '11.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    TRƯỞNG PHÒNG KH-NV
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '75px' }}></div>
                </td>
                <td style={{ width: '33.3%' }}>
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
