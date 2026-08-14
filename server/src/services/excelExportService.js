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

// Hàm ép kiểu số an toàn tuyệt đối, chống lỗi NaN
const safeNum = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

// Định dạng Borders
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
  // SHEET 1: TongHopToanVien
  // =========================================================================
  const ws1 = workbook.addWorksheet('TongHopToanVien', {
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

    // Trích xuất số liệu an toàn tuyệt đối (Không bao giờ xảy ra NaN)
    const tongKham = safeNum(hscc.tongSoKham || rd.tongSoKham || rd.tongSo || rd.tongSoLuot || rd.tongSoCa || rd.tong4ck_tongSo || rd.tongXetNghiem || 0);
    const benhCu = safeNum(hscc.benhCu || rd.benhCu || 0);
    const benhMoi = safeNum(hscc.benhMoi || rd.benhMoi || 0);
    const xuatVien = safeNum(hscc.xuatVien || rd.xuatVien || 0);
    const chuyenVienCount = r ? (r.transferCases?.length || safeNum(rd.chuyenVien) || safeNum(rd.chuyenVien_tongSo) || safeNum(hscc.chuyenVien) || 0) : 0;
    const surgeryCount = r ? (r.surgeryCases?.length || safeNum(rd.tongSoCaMo) || safeNum(rd.daiPhau) + safeNum(rd.trungPhau) || 0) : 0;
    const deathCount = r ? (r.deathCases?.length || safeNum(rd.tuVong) || safeNum(hscc.tuVong) || 0) : 0;

    sumKham += tongKham;
    sumBenhCu += benhCu;
    sumBenhMoi += benhMoi;
    sumXuatVien += xuatVien;

    // Ghi chú & Tăng cường
    let note = '';
    if (rd.ghiChu) note += rd.ghiChu + ' ';
    if (rd.dienBien) note += rd.dienBien + ' ';
    if (rd.themGio) note += 'Trực thêm giờ: ' + rd.themGio + ' ';
    if (r?.overtime_staff && Array.isArray(r.overtime_staff) && r.overtime_staff.length > 0) {
      note += 'Tăng cường: ' + r.overtime_staff.map(ot => `${ot.staffName || 'Cán bộ'} (${ot.time || '—'})`).join(', ');
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

  // Thiết lập độ rộng cột chuẩn cho Sheet 1
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
  // SHEET 2: ChiTietCacKhoa (DỮ LIỆU CHI TIẾT 12 KHOA PHÒNG)
  // =========================================================================
  const ws2 = workbook.addWorksheet('ChiTietCacKhoa', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Freeze Panes ở dòng 2
  ws2.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activeCell: 'A3' }];

  ws2.mergeCells('A1:G1');
  ws2.getCell('A1').value = `CHI TIẾT TOÀN BỘ DỮ LIỆU BÁO CÁO FORM 12 KHOA PHÒNG — NGÀY ${formattedDate}`;
  ws2.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F2C59' } };
  ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  ws2.getRow(1).height = 28;

  const headers2 = [
    'STT',
    'Tên Khoa / Phòng',
    'Hạng Mục Báo Cáo',
    'Thông Tin / Chỉ Số Chi Tiết',
    'Giá Trị Số Liệu',
    'Đơn Vị / Phân Loại',
    'Ghi Chú & Diễn Biến'
  ];

  const headerRow2 = ws2.addRow(headers2);
  headerRow2.height = 26;
  headerRow2.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });

  let detailRowIndex = 0;

  orderedDepartments.forEach((dept, deptIdx) => {
    const r = dept.report;
    const rd = r?.report_data || {};
    detailRowIndex++;

    // Banner Header của từng khoa
    const deptTitleRow = ws2.addRow([
      `${deptIdx + 1}`,
      dept.departmentName.toUpperCase(),
      dept.isSubmitted ? 'TRẠNG THÁI: ĐÃ NỘP BÁO CÁO' : 'TRẠNG THÁI: CHƯA NỘP',
      `Bác sĩ trực: ${r?.doctor_name || '—'} | Điều dưỡng: ${r?.nurse_name || '—'}`,
      `Phòng: ${r?.room || '—'} | Khung giờ: ${r?.shift_time || '—'}`,
      '',
      ''
    ]);
    deptTitleRow.height = 24;
    deptTitleRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: dept.isSubmitted ? 'FFFFFFFF' : 'FFFEE2E2' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: dept.isSubmitted ? 'FF0F2C59' : 'FF991B1B' } };
      cell.border = headerBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    if (!dept.isSubmitted) {
      const emptyRow = ws2.addRow([
        '',
        dept.departmentName,
        'Chưa có dữ liệu',
        'Khoa phòng chưa gửi báo cáo giao ban trong ngày này.',
        '—',
        '—',
        '—'
      ]);
      emptyRow.height = 20;
      emptyRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      return;
    }

    // 1. Dòng Hành chính & Tăng cường
    if (r.overtime_staff && Array.isArray(r.overtime_staff) && r.overtime_staff.length > 0) {
      r.overtime_staff.forEach((ot, otIdx) => {
        const otRow = ws2.addRow([
          '',
          dept.departmentName,
          'Nhân sự tăng cường / Thêm giờ',
          ot.staffName || 'Nhân viên',
          ot.time || '—',
          'Tăng cường',
          ot.notes || '—'
        ]);
        otRow.height = 20;
        otRow.eachCell(c => { c.font = { name: 'Arial', size: 9 }; c.border = thinBorder; });
      });
    }

    // 2. Dữ liệu chuyên môn Form
    const addMetric = (category, name, value, unit = 'Lượt/Ca', note = '') => {
      if (value === undefined || value === null || value === '') return;
      const row = ws2.addRow([
        '',
        dept.departmentName,
        category,
        name,
        typeof value === 'number' ? value : String(value),
        unit,
        note
      ]);
      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = thinBorder;
        if (colNum === 5 && typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    };

    // Parse chuyên biệt theo từng khoa
    const code = dept.departmentCode;

    if (code === 'lck') {
      addMetric('Liên Chuyên Khoa', 'TỔNG SỐ 4 CHUYÊN KHOA', safeNum(rd.tong4ck_tongSo), 'Lượt');
      addMetric('Liên Chuyên Khoa', 'TỔNG THỦ THUẬT 4CK', safeNum(rd.tong4ck_thuThuat), 'Thủ thuật');
      addMetric('Tai Mũi Họng', 'Khám Tai Mũi Họng', safeNum(rd.tmh_tongSo), 'Lượt');
      addMetric('Tai Mũi Họng', 'Thủ thuật Tai Mũi Họng', safeNum(rd.tmh_thuThuat), 'Thủ thuật');
      addMetric('Mắt', 'Khám Mắt', safeNum(rd.mat_tongSo), 'Lượt');
      addMetric('Mắt', 'Thủ thuật Mắt', safeNum(rd.mat_thuThuat), 'Thủ thuật');
      addMetric('Răng Hàm Mặt + Nội', 'Khám RHM + Nội', safeNum(rd.rhm_noi_tongSo), 'Lượt');
      addMetric('Răng Hàm Mặt + Nội', 'Thủ thuật RHM + Nội', safeNum(rd.rhm_noi_thuThuat), 'Thủ thuật');
      addMetric('Da Liễu', 'Khám Da Liễu', safeNum(rd.daLieu_tongSo), 'Lượt');
      addMetric('Chuyển khoa / Nhập viện', 'Số ca nhập viện', safeNum(rd.nhapVien_tongSo), 'Ca');
      addMetric('Chuyển viện', 'Số ca chuyển viện', safeNum(rd.chuyenVien_tongSo), 'Ca');
    } else if (code === 'xn') {
      addMetric('Xét Nghiệm', 'Tổng số xét nghiệm thực hiện', safeNum(rd.tongXetNghiem || rd.tongSo), 'Mẫu');
      addMetric('Xét Nghiệm', 'Bảo hiểm y tế (BHYT)', safeNum(rd.baoHiem), 'Mẫu');
      addMetric('Xét Nghiệm', 'Bệnh nhân nội trú', safeNum(rd.noiTru), 'Mẫu');
      addMetric('Xét Nghiệm', 'Bệnh nhân ngoại trú', safeNum(rd.ngoaiTru), 'Mẫu');
      addMetric('Sinh Hóa', 'Xét nghiệm Sinh Hóa', safeNum(rd.sinhHoa), 'Mẫu');
      addMetric('Huyết Học', 'Xét nghiệm Huyết Học', safeNum(rd.huyetHoc), 'Mẫu');
      addMetric('Đông Máu', 'Xét nghiệm Đông Máu', safeNum(rd.dongMau), 'Mẫu');
      addMetric('Nước Tiểu', 'Xét nghiệm Nước Tiểu', safeNum(rd.nuocTieu), 'Mẫu');
      addMetric('Vi Sinh', 'Xét nghiệm Vi Sinh', safeNum(rd.viSinh), 'Mẫu');
      addMetric('Miễn Dịch', 'Xét nghiệm Miễn Dịch', safeNum(rd.mienDich), 'Mẫu');
    } else if (code === 'cdha') {
      if (Array.isArray(rd.techniques) && rd.techniques.length > 0) {
        rd.techniques.forEach(t => {
          addMetric('Kỹ thuật CĐHA', `${t.name || 'Kỹ thuật'} (Tổng số)`, safeNum(t.tongSo), 'Lượt', `BHYT: ${safeNum(t.baoHiem)} | Nội trú: ${safeNum(t.noiTru)} | Ngoại trú: ${safeNum(t.ngoaiTru)}`);
        });
      } else {
        addMetric('Chẩn Đoán Hình Ảnh', 'X-Quang', safeNum(rd.xQuang), 'Lượt');
        addMetric('Chẩn Đoán Hình Ảnh', 'CT-Scanner', safeNum(rd.ctScanner), 'Lượt');
        addMetric('Chẩn Đoán Hình Ảnh', 'Siêu âm', safeNum(rd.sieuAm), 'Lượt');
        addMetric('Chẩn Đoán Hình Ảnh', 'Điện tim (ECG)', safeNum(rd.dienTim), 'Lượt');
        addMetric('Chẩn Đoán Hình Ảnh', 'Nội soi', safeNum(rd.noiSoi), 'Lượt');
      }
    } else if (code === 'hscc_tnt') {
      const h = rd.hscc || {};
      addMetric('Khối HSCC', 'Tổng số khám Cấp cứu', safeNum(h.tongSoKham), 'Lượt');
      addMetric('Khối HSCC', 'Bệnh cũ đang điều trị', safeNum(h.benhCu), 'Người');
      addMetric('Khối HSCC', 'Bệnh mới vào', safeNum(h.benhMoi), 'Người');
      addMetric('Khối HSCC', 'Xuất viện', safeNum(h.xuatVien), 'Người');
      addMetric('Khối HSCC', 'Chuyển khoa', safeNum(h.chuyenKhoa), 'Người');
      addMetric('Khối HSCC', 'Chuyển viện', safeNum(h.chuyenVien), 'Người');
      addMetric('Khối HSCC', 'Hiện còn điều trị', safeNum(h.hienCon), 'Người');
      addMetric('Khối HSCC', 'Thở máy', safeNum(h.thoMay), 'Người');
      addMetric('Khối HSCC', 'Thở oxy', safeNum(h.thoOxy), 'Người');
      addMetric('Khối HSCC', 'CPAP', safeNum(h.cpap), 'Người');
      addMetric('Khối HSCC', 'Tử vong', safeNum(h.tuVong), 'Người');

      const tnt = rd.tnt || {};
      addMetric('Khối Thận Nhân Tạo', 'Bệnh cũ', safeNum(tnt.benhCu), 'Người');
      addMetric('Khối Thận Nhân Tạo', 'Bệnh mới', safeNum(tnt.benhMoi), 'Người');
      addMetric('Khối Thận Nhân Tạo', 'Chạy thận định kỳ', safeNum(tnt.ctdk), 'Lượt');
      addMetric('Khối Thận Nhân Tạo', 'Nội trú TNT', safeNum(tnt.noiTru), 'Người');
      addMetric('Khối Thận Nhân Tạo', 'Hiện còn TNT', safeNum(tnt.hienCon), 'Người');

      const pk = rd.pk21 || {};
      addMetric('Phòng Khám 21', 'Tổng số khám PK21', safeNum(pk.tongSo), 'Lượt');
      addMetric('Phòng Khám 21', 'Kê toa', safeNum(pk.keToa), 'Toa');
      addMetric('Phòng Khám 21', 'Truyền máu', safeNum(pk.truyenMau), 'Ca');
      addMetric('Phòng Khám 21', 'Tiểu phẫu', safeNum(pk.tieuPhau), 'Ca');
      addMetric('Phòng Khám 21', 'Bó bột', safeNum(pk.boBot), 'Ca');
      addMetric('Phòng Khám 21', 'Cấp cứu ngoại viện', safeNum(pk.ccNgoaiVien), 'Ca');
    } else if (code === 'noi') {
      addMetric('Khoa Nội', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('Khoa Nội', 'Bệnh mới', safeNum(rd.benhMoi), 'Người');
      addMetric('Khoa Nội', 'Tổng số khám', safeNum(rd.tongSoKham), 'Lượt');
      addMetric('Khoa Nội', 'Xuất viện', safeNum(rd.xuatVien), 'Người');
      addMetric('Khoa Nội', 'Chuyển khoa', safeNum(rd.chuyenKhoa), 'Người');
      addMetric('Khoa Nội', 'Chuyển viện', safeNum(rd.chuyenVien), 'Người');
      addMetric('Khoa Nội', 'Hiện còn điều trị', safeNum(rd.hienCon), 'Người');
      addMetric('Khoa Nội', 'Tử vong', safeNum(rd.tuVong), 'Người');
    } else if (code === 'nhi') {
      addMetric('Khoa Nhi', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('Khoa Nhi', 'Bệnh mới (Phòng khám)', safeNum(rd.benhMoi_pk), 'Bé');
      addMetric('Khoa Nhi', 'Bệnh mới (Cấp cứu)', safeNum(rd.benhMoi_cc), 'Bé');
      addMetric('Khoa Nhi', 'Sơ sinh', safeNum(rd.soSinh), 'Bé');
      addMetric('Khoa Nhi', 'Xuất viện', safeNum(rd.xuatVien), 'Bé');
      addMetric('Khoa Nhi', 'Chuyển viện', safeNum(rd.chuyenVien), 'Bé');
      addMetric('Khoa Nhi', 'Hiện còn điều trị', safeNum(rd.hienCon), 'Bé');
      addMetric('Khoa Nhi', 'Tử vong', safeNum(rd.tuVong), 'Bé');
    } else if (code === 'nhiem') {
      addMetric('Khoa Nhiễm', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('Khoa Nhiễm', 'Bệnh mới', safeNum(rd.benhMoi), 'Người');
      addMetric('Khoa Nhiễm', 'Sốt xuất huyết', safeNum(rd.sotXuatHuyet), 'Người');
      addMetric('Khoa Nhiễm', 'Tay chân miệng', safeNum(rd.tayChanMieng), 'Người');
      addMetric('Khoa Nhiễm', 'Xuất viện', safeNum(rd.xuatVien), 'Người');
      addMetric('Khoa Nhiễm', 'Chuyển viện', safeNum(rd.chuyenVien), 'Người');
      addMetric('Khoa Nhiễm', 'Chuyển khoa Sản', safeNum(rd.chuyenKhoaSan), 'Người');
      addMetric('Khoa Nhiễm', 'Xin xuất viện', safeNum(rd.xinXuatVien), 'Người');
      addMetric('Khoa Nhiễm', 'Hiện còn điều trị', safeNum(rd.hienCon), 'Người');
      addMetric('Khoa Nhiễm', 'Tử vong', safeNum(rd.tuVong), 'Người');
    } else if (code === 'san') {
      addMetric('Khoa Sản', 'Bệnh cũ', safeNum(rd.benhCu), 'Sản phụ');
      addMetric('Khoa Sản', 'Bệnh mới', safeNum(rd.benhMoi), 'Sản phụ');
      addMetric('Khoa Sản', 'Sanh thường', safeNum(rd.sanhThuong), 'Ca');
      addMetric('Khoa Sản', 'Sanh hút', safeNum(rd.sanhHut), 'Ca');
      addMetric('Khoa Sản', 'Mổ đẻ (Mổ lấy thai)', safeNum(rd.moLayThai), 'Ca');
      addMetric('Khoa Sản', 'Chờ sanh', safeNum(rd.choSanh), 'Sản phụ');
      addMetric('Khoa Sản', 'Siêu âm sản', safeNum(rd.sieuAm), 'Lượt');
      addMetric('Khoa Sản', 'Xuất viện', safeNum(rd.xuatVien), 'Sản phụ');
      addMetric('Khoa Sản', 'Chuyển viện nội trú', safeNum(rd.chuyenVien), 'Sản phụ');
      addMetric('Khoa Sản', 'Chuyển viện ngoại trú', safeNum(rd.chuyenVienNgoaiTru), 'Sản phụ');
      addMetric('Khoa Sản', 'Hiện còn', safeNum(rd.hienCon), 'Sản phụ');
    } else if (code === 'yhct_phcn') {
      addMetric('YHCT & PHCN', 'Khám ngoại trú', safeNum(rd.khamNgoaiTru), 'Lượt');
      addMetric('YHCT & PHCN', 'Điều trị nội trú', safeNum(rd.dieuTriNoiTru), 'Người');
      addMetric('YHCT & PHCN', 'Kê toa', safeNum(rd.keToa), 'Toa');
      addMetric('YHCT & PHCN', 'Châm cứu', safeNum(rd.chamCuu), 'Lượt');
      addMetric('YHCT & PHCN', 'Xoa bóp / Bấm huyệt', safeNum(rd.xoaBop), 'Lượt');
      addMetric('YHCT & PHCN', 'Vật lý trị liệu', safeNum(rd.vatLyTriLieu), 'Lượt');
      addMetric('YHCT & PHCN', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('YHCT & PHCN', 'Bệnh mới', safeNum(rd.benhMoi), 'Người');
      addMetric('YHCT & PHCN', 'Xuất viện', safeNum(rd.xuatVien), 'Người');
      addMetric('YHCT & PHCN', 'Hiện còn', safeNum(rd.hienCon), 'Người');
    } else if (code === 'ngoai_th') {
      addMetric('Ngoại Tổng Hợp', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('Ngoại Tổng Hợp', 'Bệnh mới', safeNum(rd.benhMoi), 'Người');
      addMetric('Ngoại Tổng Hợp', 'Khám cấp cứu', safeNum(rd.khamCapCuu), 'Lượt');
      addMetric('Ngoại Tổng Hợp', 'Đại phẫu', safeNum(rd.daiPhau), 'Ca');
      addMetric('Ngoại Tổng Hợp', 'Trung phẫu', safeNum(rd.trungPhau), 'Ca');
      addMetric('Ngoại Tổng Hợp', 'Tiểu phẫu', safeNum(rd.tieuPhau), 'Ca');
      addMetric('Ngoại Tổng Hợp', 'Hậu phẫu theo dõi', safeNum(rd.hauPhau), 'Người');
      addMetric('Ngoại Tổng Hợp', 'Xuất viện', safeNum(rd.xuatVien), 'Người');
      addMetric('Ngoại Tổng Hợp', 'Chuyển viện', safeNum(rd.chuyenVien), 'Người');
      addMetric('Ngoại Tổng Hợp', 'Hiện còn', safeNum(rd.hienCon), 'Người');
    } else if (code === 'ctch') {
      addMetric('Chấn Thương Chỉnh Hình', 'Bệnh cũ', safeNum(rd.benhCu), 'Người');
      addMetric('Chấn Thương Chỉnh Hình', 'Bệnh mới', safeNum(rd.benhMoi), 'Người');
      addMetric('Chấn Thương Chỉnh Hình', 'Tổng số khám', safeNum(rd.tongSoKham), 'Lượt');
      addMetric('Chấn Thương Chỉnh Hình', 'Bó bột', safeNum(rd.boBot), 'Ca');
      addMetric('Chấn Thương Chỉnh Hình', 'Nẹp bất động', safeNum(rd.nepBatDong), 'Ca');
      addMetric('Chấn Thương Chỉnh Hình', 'Mổ kết hợp xương', safeNum(rd.moKetHopXuong), 'Ca');
      addMetric('Chấn Thương Chỉnh Hình', 'Hậu phẫu', safeNum(rd.hauPhau), 'Người');
      addMetric('Chấn Thương Chỉnh Hình', 'Xuất viện', safeNum(rd.xuatVien), 'Người');
      addMetric('Chấn Thương Chỉnh Hình', 'Chuyển viện', safeNum(rd.chuyenVien), 'Người');
      addMetric('Chấn Thương Chỉnh Hình', 'Hiện còn', safeNum(rd.hienCon), 'Người');
    } else if (code === 'gmhs') {
      addMetric('Gây Mê Hồi Sức', 'Nhân sự ca trực GMHS', rd.nhanSu || '—', 'Kíp trực');
      addMetric('Gây Mê Hồi Sức', 'Tổng số ca mổ', safeNum(rd.tongSoCaMo), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ cấp cứu - CTCH', safeNum(rd.cc_ctch), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ cấp cứu - Ngoại TH', safeNum(rd.cc_ngoaiTH), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ cấp cứu - Sản', safeNum(rd.cc_san), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ chương trình - CTCH', safeNum(rd.ct_ctch), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ chương trình - Ngoại TH', safeNum(rd.ct_ngoaiTH), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Mổ chương trình - Sản', safeNum(rd.ct_san), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Gây mê', safeNum(rd.gayMe), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Gây tê', safeNum(rd.gayTe), 'Ca');
      addMetric('Gây Mê Hồi Sức', 'Bệnh nhân hồi tỉnh theo dõi', safeNum(rd.hienCon), 'Người');
    }

    // 3. Ghi chú & Diễn biến
    if (rd.themGio) addMetric('Diễn Biến', 'Trực thêm giờ', rd.themGio, 'Ghi chú');
    if (rd.ghiChu) addMetric('Ghi Chú', 'Ghi chú khoa phòng', rd.ghiChu, 'Ghi chú');
    if (rd.dienBien) addMetric('Diễn Biến', 'Diễn biến ca trực', rd.dienBien, 'Ghi chú');
  });

  // Tự động căn chỉnh độ rộng cột cho Sheet 2
  ws2.columns = [
    { width: 6 },   // STT
    { width: 32 },  // Tên Khoa
    { width: 24 },  // Hạng Mục
    { width: 36 },  // Chỉ Số Chi Tiết
    { width: 16 },  // Giá Trị
    { width: 16 },  // Đơn Vị
    { width: 40 }   // Ghi Chú
  ];

  // =========================================================================
  // SHEET 3: ChiTietBenhLy (CHUYỂN VIỆN, CA MỔ, TỬ VONG)
  // =========================================================================
  const ws3 = workbook.addWorksheet('ChiTietBenhLy', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  ws3.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activeCell: 'A3' }];

  ws3.mergeCells('A1:I1');
  ws3.getCell('A1').value = `BẢNG TỔNG HỢP CHI TIẾT CA CHUYỂN VIỆN, CA MỔ VÀ TỬ VONG — NGÀY ${formattedDate}`;
  ws3.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F2C59' } };
  ws3.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(1).height = 28;

  let currentRowIndex = 2;

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
      const patientInfo = `${tc.patient_name || tc.patientName || '—'}${tc.age ? ` (${tc.age} tuổi)` : ''}${tc.address ? `\nĐịa chỉ: ${tc.address}` : ''}`;
      const row = ws3.addRow([
        tCount,
        dept.departmentName,
        patientInfo,
        tc.admission_time || tc.admissionTime || '—',
        tc.reason || '—',
        tc.clinical_tests || tc.clinicalTests || '—',
        tc.diagnosis || '—',
        tc.initial_treatment || tc.initialTreatment || '—',
        tc.progress_notes || tc.progressNotes || '—'
      ]);
      row.height = 36;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9.5 };
        cell.border = thinBorder;
        if (colNum === 1 || colNum === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNum === 3 || colNum === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF92400E' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (tCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh nhân chuyển viện nào trong ngày.', '', '', '', '', '', '', '']);
    emptyRow.height = 22;
    emptyRow.eachCell(c => { c.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } }; c.border = thinBorder; });
    currentRowIndex++;
  }

  // Cách 1 dòng
  ws3.addRow([]);
  currentRowIndex++;

  // --- MỤC B: BỆNH PHẪU THUẬT (MỔ) ---
  ws3.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `🔪 II. DANH SÁCH BỆNH NHÂN PHẪU THUẬT / CA MỔ (${totalSurgeries} CA)`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }; // Ocean Blue
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const surgeryHeaders = [
    'STT',
    'Khoa Mổ',
    'Họ Tên / Năm Sinh / Địa Chỉ',
    'Giờ Vào Viện',
    'Lý Do Vào Viện',
    'Chẩn Đoán Trước Mổ',
    'Lệnh Mổ / Hội Chẩn',
    'Chẩn Đoán Sau Mổ',
    'Tình Trạng Hậu Phẫu Hiện Tại'
  ];

  const sHeaderRow = ws3.addRow(surgeryHeaders);
  sHeaderRow.height = 24;
  sHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0369A1' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let sCount = 0;
  orderedDepartments.forEach(dept => {
    const sCases = dept.report?.surgeryCases || [];
    sCases.forEach(sc => {
      sCount++;
      const patientInfo = `${sc.patient_name || sc.patientName || '—'}${sc.birth_year || sc.birthYear ? ` (${sc.birth_year || sc.birthYear})` : ''}${sc.address ? `\nĐịa chỉ: ${sc.address}` : ''}`;
      const row = ws3.addRow([
        sCount,
        dept.departmentName,
        patientInfo,
        sc.admission_time || sc.admissionTime || '—',
        sc.reason || '—',
        sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—',
        sc.consultation_order || sc.consultationOrder || '—',
        sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—',
        sc.current_status || sc.currentStatus || '—'
      ]);
      row.height = 36;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9.5 };
        cell.border = thinBorder;
        if (colNum === 1 || colNum === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNum === 3 || colNum === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0369A1' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (sCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh phẫu thuật nào trong ngày.', '', '', '', '', '', '', '']);
    emptyRow.height = 22;
    emptyRow.eachCell(c => { c.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } }; c.border = thinBorder; });
    currentRowIndex++;
  }

  // Cách 1 dòng
  ws3.addRow([]);
  currentRowIndex++;

  // --- MỤC C: BỆNH TỬ VONG ---
  ws3.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `🚨 III. DANH SÁCH BỆNH NHÂN TỬ VONG (${totalDeaths} CA)`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const deathHeaders = [
    'STT',
    'Khoa Báo Cáo',
    'Họ Tên / Tuổi / Địa Chỉ',
    'Giờ Vào Viện',
    'Tình Trạng Lúc Vào Viện',
    'Tiền Sử & Cận Lâm Sàng / ECG',
    'Chẩn Đoán Tử Vong',
    'Xử Trí Cấp Cứu Hồi Sức (CPR)',
    'Kết Quả & Hướng Giải Quyết'
  ];

  const dHeaderRow = ws3.addRow(deathHeaders);
  dHeaderRow.height = 24;
  dHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let dCount = 0;
  orderedDepartments.forEach(dept => {
    const dCases = dept.report?.deathCases || [];
    dCases.forEach(dc => {
      dCount++;
      const patientInfo = `${dc.patient_name || dc.patientName || '—'}${dc.age ? ` (${dc.age} tuổi)` : ''}${dc.address ? `\nĐịa chỉ: ${dc.address}` : ''}`;
      const row = ws3.addRow([
        dCount,
        dept.departmentName,
        patientInfo,
        dc.admission_time || dc.admissionTime || '—',
        dc.admission_status || dc.admissionStatus || dc.reason || '—',
        `${dc.medical_history || dc.medicalHistory ? `Tiền sử: ${dc.medical_history || dc.medicalHistory}\n` : ''}${dc.clinical_tests || dc.clinicalTests || ''}`.trim() || '—',
        dc.diagnosis || '—',
        dc.emergency_treatment || dc.emergencyTreatment || dc.initial_treatment || '—',
        dc.final_outcome || dc.finalOutcome || '—'
      ]);
      row.height = 42;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9.5 };
        cell.border = thinBorder;
        if (colNum === 1 || colNum === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNum === 3 || colNum === 7) {
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
    const emptyRow = ws3.addRow(['', 'Không có ca tử vong nào trong ngày.', '', '', '', '', '', '', '']);
    emptyRow.height = 22;
    emptyRow.eachCell(c => { c.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF64748B' } }; c.border = thinBorder; });
    currentRowIndex++;
  }

  // Thiết lập độ rộng cột cho Sheet 3
  ws3.columns = [
    { width: 6 },   // STT
    { width: 26 },  // Khoa
    { width: 28 },  // Họ tên BN
    { width: 14 },  // Giờ vào
    { width: 24 },  // Lý do / Tình trạng vào
    { width: 30 },  // Cận lâm sàng / Tiền sử
    { width: 30 },  // Chẩn đoán
    { width: 32 },  // Xử trí
    { width: 32 }   // Diễn biến / Kết quả
  ];

  return workbook;
};

module.exports = { generateHospitalExcelReport };
