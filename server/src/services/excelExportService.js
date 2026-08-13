const ExcelJS = require('exceljs');

const DEPARTMENT_ORDER = [
  'lck',
  'xn',
  'cdha',
  'hscc_tnt',
  'noi',
  'nhi',
  'nhiem',
  'san',
  'yhct_phcn',
  'ngoai_th',
  'ctch',
  'gmhs'
];

const DEPARTMENT_MAP = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét nghiệm',
  cdha: 'Chẩn đoán hình ảnh',
  hscc_tnt: 'Hồi sức cấp cứu – Thận nhân tạo',
  noi: 'Khoa Nội',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Sản',
  yhct_phcn: 'Y học cổ truyền – Phục hồi chức năng',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Gây mê Hồi sức'
};

// Hàm định dạng ngày DD/MM/YYYY
const formatDateVi = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Border chuẩn
const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

const headerBorder = {
  top: { style: 'medium', color: { argb: 'FF0F2C59' } },
  left: { style: 'thin', color: { argb: 'FF475569' } },
  bottom: { style: 'medium', color: { argb: 'FF0F2C59' } },
  right: { style: 'thin', color: { argb: 'FF475569' } }
};

const totalBorder = {
  top: { style: 'thin', color: { argb: 'FF0F2C59' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'double', color: { argb: 'FF0F2C59' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

/**
 * Tạo file Excel Báo cáo tổng hợp toàn viện
 * @param {string} date - Ngày báo cáo YYYY-MM-DD
 * @param {Array} deptUsers - Danh sách user khoa
 * @param {Array} detailedReports - Danh sách báo cáo chi tiết kèm sub-records
 */
const generateHospitalExcelReport = async (date, deptUsers = [], detailedReports = []) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nguyễn Vũ Nhật Nam - Phòng KHNV';
  workbook.created = new Date();
  workbook.properties.date1904 = false;

  const formattedDate = formatDateVi(date);

  // Tạo map báo cáo theo mã khoa
  const reportMap = {};
  detailedReports.forEach(r => {
    reportMap[r.department_code] = r;
  });

  // Tạo danh sách 12 khoa theo thứ tự chuẩn
  const orderedDepartments = DEPARTMENT_ORDER.map(code => {
    const user = deptUsers.find(u => u.department_code === code);
    const report = reportMap[code];
    return {
      departmentCode: code,
      departmentName: DEPARTMENT_MAP[code] || user?.department_name || code,
      report: report || null,
      isSubmitted: !!report
    };
  });

  // Thống kê tổng quan
  const totalDepts = orderedDepartments.length;
  const submittedCount = orderedDepartments.filter(d => d.isSubmitted).length;
  const notSubmittedCount = totalDepts - submittedCount;
  
  let totalTransfers = 0;
  let totalSurgeries = 0;
  let totalDeaths = 0;

  detailedReports.forEach(r => {
    totalTransfers += (r.transferCases?.length || 0);
    totalSurgeries += (r.surgeryCases?.length || 0);
    totalDeaths += (r.deathCases?.length || 0);
  });

  // =========================================================================
  // SHEET 1: TỔNG HỢP TOÀN VIỆN
  // =========================================================================
  const ws1 = workbook.addWorksheet('Tổng Hợp Toàn Viện', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Tiêu đề đầu trang
  ws1.mergeCells('A1:M1');
  ws1.getCell('A1').value = 'SỞ Y TẾ TỈNH BÌNH PHƯỚC — TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG';
  ws1.getCell('A1').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
  ws1.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

  ws1.mergeCells('A2:M2');
  ws1.getCell('A2').value = `BẢNG TỔNG HỢP BÁO CÁO GIAO BAN TOÀN VIỆN NGÀY ${formattedDate}`;
  ws1.getCell('A2').font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FF0F2C59' } };
  ws1.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(2).height = 28;

  ws1.mergeCells('A3:M3');
  ws1.getCell('A3').value = `Đơn vị tổng hợp: Phòng Kế Hoạch - Nghiệp Vụ | Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`;
  ws1.getCell('A3').font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
  ws1.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

  // Khối KPI Cards tóm tắt
  ws1.mergeCells('A5:C5');
  ws1.getCell('A5').value = `TỔNG SỐ KHOA: ${totalDepts}`;
  ws1.getCell('A5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
  ws1.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  ws1.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('A5').border = thinBorder;

  ws1.mergeCells('D5:E5');
  ws1.getCell('D5').value = `ĐÃ NỘP: ${submittedCount}/${totalDepts}`;
  ws1.getCell('D5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF166534' } };
  ws1.getCell('D5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
  ws1.getCell('D5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('D5').border = thinBorder;

  ws1.mergeCells('F5:G5');
  ws1.getCell('F5').value = `CHƯA NỘP: ${notSubmittedCount}`;
  ws1.getCell('F5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF92400E' } };
  ws1.getCell('F5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCE8' } };
  ws1.getCell('F5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('F5').border = thinBorder;

  ws1.mergeCells('H5:I5');
  ws1.getCell('H5').value = `CHUYỂN VIỆN: ${totalTransfers} CA`;
  ws1.getCell('H5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB45309' } };
  ws1.getCell('H5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  ws1.getCell('H5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('H5').border = thinBorder;

  ws1.mergeCells('J5:K5');
  ws1.getCell('J5').value = `CA PHẪU THUẬT: ${totalSurgeries} CA`;
  ws1.getCell('J5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0369A1' } };
  ws1.getCell('J5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
  ws1.getCell('J5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('J5').border = thinBorder;

  ws1.mergeCells('L5:M5');
  ws1.getCell('L5').value = `TỬ VONG: ${totalDeaths} CA`;
  ws1.getCell('L5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
  ws1.getCell('L5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
  ws1.getCell('L5').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('L5').border = thinBorder;

  // Header Bảng tổng hợp (Dòng 7)
  const headers1 = [
    'STT',
    'Khoa / Phòng',
    'Trạng Thái',
    'Bác Sĩ Trực Chính',
    'Điều Dưỡng Trực Ca',
    'Tổng Khám',
    'Bệnh Cũ',
    'Bệnh Mới',
    'Xuất Viện',
    'Chuyển Viện (ca)',
    'Phẫu Thuật (ca)',
    'Tử Vong (ca)',
    'Diễn Biến & Ghi Chú Đặc Biệt'
  ];

  const headerRow1 = ws1.addRow(headers1);
  headerRow1.height = 28;
  headerRow1.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F2C59' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });

  // Freeze Panes dưới dòng 7
  ws1.views = [{ state: 'frozen', xSplit: 0, ySplit: 7, activeCell: 'A8' }];

  // Thêm dữ liệu từng khoa
  let sumKham = 0;
  let sumBenhCu = 0;
  let sumBenhMoi = 0;
  let sumXuatVien = 0;

  orderedDepartments.forEach((dept, index) => {
    const r = dept.report;
    const rd = r?.report_data || {};
    const hscc = rd.hscc || {};

    // Trích xuất số liệu
    const tongKham = Number(hscc.tongSoKham || rd.tongSoKham || rd.tongSo || rd.tongSoLuot || rd.tongSoCa || 0);
    const benhCu = Number(hscc.benhCu || rd.benhCu || 0);
    const benhMoi = Number(hscc.benhMoi || rd.benhMoi || 0);
    const xuatVien = Number(hscc.xuatVien || rd.xuatVien || 0);
    const chuyenVienCount = r ? (r.transferCases?.length || 0) : 0;
    const surgeryCount = r ? (r.surgeryCases?.length || Number(rd.tongSoCaMo) || 0) : 0;
    const deathCount = r ? (r.deathCases?.length || Number(rd.tuVong) || Number(hscc.tuVong) || 0) : 0;

    sumKham += tongKham;
    sumBenhCu += benhCu;
    sumBenhMoi += benhMoi;
    sumXuatVien += xuatVien;

    // Ghi chú
    let note = '';
    if (rd.ghiChu) note += rd.ghiChu + ' ';
    if (rd.dienBien) note += rd.dienBien + ' ';
    if (rd.themGio) note += 'Trực thêm giờ: ' + rd.themGio + ' ';
    if (r?.overtime_staff && r.overtime_staff.length > 0) {
      note += 'Tăng cường: ' + r.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ');
    }

    const rowData = [
      index + 1,
      dept.departmentName,
      dept.isSubmitted ? 'Đã nộp' : 'Chưa nộp',
      r?.doctor_name || '—',
      r?.nurse_name || '—',
      dept.isSubmitted ? tongKham : '—',
      dept.isSubmitted ? benhCu : '—',
      dept.isSubmitted ? benhMoi : '—',
      dept.isSubmitted ? xuatVien : '—',
      dept.isSubmitted ? chuyenVienCount : '—',
      dept.isSubmitted ? surgeryCount : '—',
      dept.isSubmitted ? deathCount : '—',
      note.trim() || '—'
    ];

    const dataRow = ws1.addRow(rowData);
    dataRow.height = 22;

    const isEven = index % 2 === 0;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      };

      // Alignment
      if (colNumber === 1 || colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F2C59' } };
      } else if (colNumber >= 6 && colNumber <= 12) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (typeof cell.value === 'number') {
          cell.numFmt = '#,##0';
        }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Trạng thái highlight
      if (colNumber === 3) {
        if (dept.isSubmitted) {
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF15803D' } };
        } else {
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFDC2626' } };
        }
      }

      // Tử vong highlight nếu > 0
      if (colNumber === 12 && typeof cell.value === 'number' && cell.value > 0) {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
      }
    });
  });

  // Dòng TỔNG CỘNG
  const totalRowData = [
    '',
    'TỔNG CỘNG TOÀN VIỆN',
    `${submittedCount}/${totalDepts} khoa`,
    '—',
    '—',
    sumKham,
    sumBenhCu,
    sumBenhMoi,
    sumXuatVien,
    totalTransfers,
    totalSurgeries,
    totalDeaths,
    ''
  ];

  const totalRow = ws1.addRow(totalRowData);
  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F2C59' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = totalBorder;
    if (colNumber === 2) {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (colNumber >= 6 && colNumber <= 12) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0';
      }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // Thiết lập độ rộng cột cho Sheet 1
  ws1.columns = [
    { width: 6 },   // STT
    { width: 32 },  // Khoa phòng
    { width: 14 },  // Trạng thái
    { width: 22 },  // BS trực chính
    { width: 28 },  // ĐD trực ca
    { width: 13 },  // Tổng khám
    { width: 11 },  // Bệnh cũ
    { width: 11 },  // Bệnh mới
    { width: 12 },  // Xuất viện
    { width: 16 },  // Chuyển viện
    { width: 16 },  // Ca mổ
    { width: 14 },  // Tử vong
    { width: 36 }   // Ghi chú
  ];

  // =========================================================================
  // SHEET 2: CHI TIẾT CA TRỰC HÀNH CHÍNH & NHÂN SỰ
  // =========================================================================
  const ws2 = workbook.addWorksheet('Chi Tiết Ca Trực', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  ws2.mergeCells('A1:J1');
  ws2.getCell('A1').value = `DANH SÁCH CHI TIẾT CA TRỰC HÀNH CHÍNH & NHÂN SỰ TĂNG CƯỜNG — NGÀY ${formattedDate}`;
  ws2.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E40AF' } };
  ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  ws2.getRow(1).height = 26;

  const headers2 = [
    'STT',
    'Mã Khoa',
    'Tên Khoa / Phòng',
    'Ngày Trực Giao Ban',
    'Bác Sĩ Trực Chính',
    'Điều Dưỡng Trực Ca',
    'Nhân Sự Trực Thêm Giờ / Tăng Cường',
    'Phòng / Buồng Trực',
    'Thời Gian Ca Trực',
    'Trạng Thái Nộp'
  ];

  const headerRow2 = ws2.addRow(headers2);
  headerRow2.height = 28;
  headerRow2.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });

  ws2.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activeCell: 'A3' }];

  orderedDepartments.forEach((dept, idx) => {
    const r = dept.report;
    const overtimeStr = (r?.overtime_staff && Array.isArray(r.overtime_staff) && r.overtime_staff.length > 0)
      ? r.overtime_staff.map(ot => `${ot.staffName || 'Nhân viên'} (${ot.time || '—'})`).join('\n')
      : '—';

    const rowData = [
      idx + 1,
      dept.departmentCode.toUpperCase(),
      dept.departmentName,
      formattedDate,
      r?.doctor_name || '—',
      r?.nurse_name || '—',
      overtimeStr,
      r?.room || '—',
      r?.shift_time || '—',
      dept.isSubmitted ? 'Đã nộp báo cáo' : 'Chưa nộp'
    ];

    const dataRow = ws2.addRow(rowData);
    dataRow.height = overtimeStr.includes('\n') ? 36 : 22;

    const isEven = idx % 2 === 0;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      };

      if (colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 9 || colNumber === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      if (colNumber === 3) {
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F2C59' } };
      }

      if (colNumber === 10) {
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: dept.isSubmitted ? 'FF15803D' : 'FFDC2626' } };
      }
    });
  });

  ws2.columns = [
    { width: 6 },   // STT
    { width: 12 },  // Mã khoa
    { width: 32 },  // Tên khoa
    { width: 16 },  // Ngày trực
    { width: 24 },  // BS trực chính
    { width: 30 },  // ĐD trực ca
    { width: 36 },  // Tăng cường
    { width: 20 },  // Phòng buồng
    { width: 18 },  // Thời gian trực
    { width: 18 }   // Trạng thái
  ];

  // =========================================================================
  // SHEET 3: CHI TIẾT BỆNH LÝ (CHUYỂN VIỆN, CA MỔ, TỬ VONG)
  // =========================================================================
  const ws3 = workbook.addWorksheet('Chi Tiết Bệnh Lý', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  let currentRowIndex = 1;

  // --- MỤC A: BỆNH CHUYỂN VIỆN ---
  ws3.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `🚑 I. DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN (${totalTransfers} CA)`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; // Amber
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const transferHeaders = [
    'STT',
    'Khoa Chuyển',
    'Họ Tên / Tuổi / Địa Chỉ',
    'Giờ Vào Viện',
    'Lý Do Vào Viện',
    'Cận Lâm Sàng / X-Quang',
    'Chẩn Đoán',
    'Xử Trí Cấp Cứu Ban Đầu',
    'Diễn Biến / Lý Do Chuyển Viện'
  ];

  const tHeaderRow = ws3.addRow(transferHeaders);
  tHeaderRow.height = 24;
  tHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF78350F' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let tCount = 0;
  orderedDepartments.forEach(dept => {
    const tCases = dept.report?.transferCases || [];
    tCases.forEach(tc => {
      tCount++;
      const row = ws3.addRow([
        tCount,
        dept.departmentName,
        tc.patient_name || tc.patientName || '—',
        tc.admission_time || tc.admissionTime || '—',
        tc.reason || '—',
        tc.clinical_tests || tc.clinicalTests || '—',
        tc.diagnosis || '—',
        tc.initial_treatment || tc.initialTreatment || '—',
        tc.progress_notes || tc.progressNotes || '—'
      ]);
      row.height = 28;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = thinBorder;
        if (colNumber === 1) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F2C59' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (tCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh nhân chuyển viện trong ngày.', '', '', '', '', '', '', '']);
    ws3.mergeCells(`B${currentRowIndex}:I${currentRowIndex}`);
    emptyRow.getCell(2).font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
    emptyRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    currentRowIndex++;
  }

  // Cách 1 dòng
  ws3.addRow([]);
  currentRowIndex++;

  // --- MỤC B: BỆNH PHẪU THUẬT (MỔ) ---
  ws3.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `🔪 II. DANH SÁCH BỆNH NHÂN PHẪU THUẬT (MỔ) (${totalSurgeries} CA)`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }; // Blue
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const surgeryHeaders = [
    'STT',
    'Khoa Thực Hiện',
    'Họ Và Tên Bệnh Nhân',
    'Năm Sinh / Tuổi',
    'Địa Chỉ',
    'Giờ Vào Viện',
    'Lý Do Nhập Viện',
    'Chẩn Đoán Trước Mổ',
    'Nội Dung Hội Chẩn / Lệnh Mổ',
    'Chẩn Đoán Sau Mổ',
    'Tình Trạng Hậu Phẫu Hiện Tại'
  ];

  const sHeaderRow = ws3.addRow(surgeryHeaders);
  sHeaderRow.height = 24;
  sHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0369A1' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let sCount = 0;
  orderedDepartments.forEach(dept => {
    const sCases = dept.report?.surgeryCases || [];
    sCases.forEach(sc => {
      sCount++;
      const row = ws3.addRow([
        sCount,
        dept.departmentName,
        sc.patient_name || sc.patientName || '—',
        sc.birth_year || sc.birthYear || sc.age || '—',
        sc.address || '—',
        sc.admission_time || sc.admissionTime || '—',
        sc.reason || '—',
        sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—',
        sc.consultation_order || sc.consultationOrder || '—',
        sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—',
        sc.current_status || sc.currentStatus || '—'
      ]);
      row.height = 28;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = thinBorder;
        if (colNumber === 1 || colNumber === 4 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0369A1' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (sCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh nhân phẫu thuật trong ngày.', '', '', '', '', '', '', '', '', '']);
    ws3.mergeCells(`B${currentRowIndex}:K${currentRowIndex}`);
    emptyRow.getCell(2).font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
    emptyRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    currentRowIndex++;
  }

  // Cách 1 dòng
  ws3.addRow([]);
  currentRowIndex++;

  // --- MỤC C: BỆNH NHÂN TỬ VONG (CẢNH BÁO ĐỎ) ---
  ws3.mergeCells(`A${currentRowIndex}:M${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `🚨 III. HỒ SƠ BỆNH NHÂN TỬ VONG (${totalDeaths} CA) — BÁO CÁO KHẨN`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const deathHeaders = [
    'STT',
    'Khoa Phòng',
    'Họ Tên Bệnh Nhân',
    'Tuổi',
    'Địa Chỉ',
    'Giờ Vào Viện',
    'Lý Do Vào Viện',
    'Tình Trạng Lúc Vào Khoa',
    'Tiền Sử Bệnh',
    'Cận Lâm Sàng / ECG',
    'Chẩn Đoán Tử Vong',
    'Xử Trí Cấp Cứu',
    'Kết Quả & Hướng Xử Lý'
  ];

  const dHeaderRow = ws3.addRow(deathHeaders);
  dHeaderRow.height = 24;
  dHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let dCount = 0;
  orderedDepartments.forEach(dept => {
    const dCases = dept.report?.deathCases || [];
    dCases.forEach(dc => {
      dCount++;
      const row = ws3.addRow([
        dCount,
        dept.departmentName,
        dc.patient_name || dc.patientName || '—',
        dc.age || '—',
        dc.address || '—',
        dc.admission_time || dc.admissionTime || '—',
        dc.reason || '—',
        dc.admission_status || dc.admissionStatus || '—',
        dc.medical_history || dc.medicalHistory || '—',
        dc.clinical_tests || dc.clinicalTests || '—',
        dc.diagnosis || '—',
        dc.emergency_treatment || dc.emergencyTreatment || '—',
        dc.final_outcome || dc.finalOutcome || '—'
      ]);
      row.height = 32;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = thinBorder;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        if (colNumber === 1 || colNumber === 4 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF991B1B' } };
        } else if (colNumber === 11) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFDC2626' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (dCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh nhân tử vong trong ngày.', '', '', '', '', '', '', '', '', '', '', '']);
    ws3.mergeCells(`B${currentRowIndex}:M${currentRowIndex}`);
    emptyRow.getCell(2).font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
    emptyRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    currentRowIndex++;
  }

  ws3.columns = [
    { width: 6 },   // STT
    { width: 28 },  // Khoa
    { width: 26 },  // Tên BN
    { width: 10 },  // Tuổi
    { width: 22 },  // Địa chỉ
    { width: 18 },  // Giờ vào
    { width: 22 },  // Lý do
    { width: 26 },  // Tình trạng vào
    { width: 24 },  // Tiền sử
    { width: 26 },  // CLS
    { width: 28 },  // Chẩn đoán
    { width: 28 },  // Xử trí
    { width: 28 }   // Kết quả
  ];

  return workbook;
};

module.exports = { generateHospitalExcelReport };
