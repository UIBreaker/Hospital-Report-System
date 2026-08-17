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

// Bộ từ điển ánh xạ toàn bộ trường dữ liệu chuyên môn sang Tiếng Việt có dấu chuẩn y tế
const FIELD_LABELS = {
  // LCK
  tmh_tongSo: 'Tai Mũi Họng (Tổng số khám)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng số khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'RHM + Nội (Tổng số khám)',
  rhm_noi_thuThuat: 'RHM + Nội (Thủ thuật)',
  daLieu_tongSo: 'Da liễu (Tổng số khám)',
  nhapVien_tongSo: 'Số ca nhập viện',
  chuyenVien_tongSo: 'Số ca chuyển viện',
  tong4ck_tongSo: 'TỔNG SỐ 4 CHUYÊN KHOA',
  tong4ck_thuThuat: 'TỔNG THỦ THUẬT 4CK',

  // Chỉ số chung
  tongSoKham: 'Tổng số lượt khám',
  tongSo: 'Tổng số thực hiện',
  tongSoLuot: 'Tổng số lượt',
  tongSoCa: 'Tổng số ca',
  benhCu: 'Bệnh cũ (Đang điều trị)',
  benhMoi: 'Bệnh mới (Nhập viện)',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn điều trị',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  baoHiem: 'Bảo hiểm y tế (BHYT)',
  noiTru: 'Bệnh nhân nội trú',
  ngoaiTru: 'Bệnh nhân ngoại trú',

  // Xét nghiệm
  tongXetNghiem: 'Tổng số xét nghiệm thực hiện',
  sinhHoa: 'Xét nghiệm Sinh hóa',
  huyetHoc: 'Xét nghiệm Huyết học',
  dongMau: 'Xét nghiệm Đông máu',
  nuocTieu: 'Xét nghiệm Nước tiểu',
  viSinh: 'Xét nghiệm Vi sinh',
  mienDich: 'Xét nghiệm Miễn dịch',

  // HSCC - TNT - PK21
  thoMay: 'Thở máy xâm lấn / Không xâm lấn',
  thoOxy: 'Thở oxy qua gọng kính / Mask',
  cpap: 'Thở CPAP',
  ctdk: 'Chạy thận định kỳ (Chu kỳ)',
  bsTrucTNT: 'Bác sĩ trực Thận nhân tạo',
  keToa: 'Kê toa phòng khám',
  truyenMau: 'Truyền máu / Chế phẩm máu',
  tieuPhau: 'Tiểu phẫu cấp cứu',
  boBot: 'Bó bột / Bất động xương',
  ccNgoaiVien: 'Cấp cứu ngoại viện (115)',

  // Khoa Sản
  sanhThuong: 'Sanh thường',
  sanhHut: 'Sanh hút (Giúp sanh)',
  moLayThai: 'Mổ lấy thai (Mổ đẻ)',
  moDe: 'Mổ đẻ',
  choSanh: 'Theo dõi chờ sanh',
  sieuAm: 'Siêu âm sản phụ khoa',
  chuyenVienNgoaiTru: 'Chuyển viện ngoại trú',

  // Khoa Nhi
  benhMoi_pk: 'Bệnh mới (Từ Phòng khám)',
  benhMoi_cc: 'Bệnh mới (Từ Cấp cứu)',
  soSinh: 'Bệnh nhi sơ sinh',

  // Khoa Nhiễm
  sotXuatHuyet: 'Sốt xuất huyết Dengue',
  tayChanMieng: 'Bệnh Tay chân miệng',
  chuyenKhoaSan: 'Chuyển khoa Sản',
  xinXuatVien: 'Xin về / Trốn viện',

  // YHCT - PHCN
  khamNgoaiTru: 'Khám ngoại trú YHCT',
  dieuTriNoiTru: 'Điều trị nội trú YHCT',
  chamCuu: 'Châm cứu',
  xoaBop: 'Xoa bóp / Bấm huyệt',
  vatLyTriLieu: 'Vật lý trị liệu / Phục hồi chức năng',

  // Ngoại TH / CTCH
  daiPhau: 'Đại phẫu',
  trungPhau: 'Trung phẫu',
  hauPhau: 'Hậu phẫu theo dõi',
  khamCapCuu: 'Khám cấp cứu ngoại khoa',
  nepBatDong: 'Nẹp bất động',
  moKetHopXuong: 'Phẫu thuật kết hợp xương',

  // GMHS
  nhanSu: 'Thành phần nhân sự ca trực',
  tongSoCaMo: 'Tổng số ca mổ (Cấp cứu + Kế hoạch)',
  cc_ctch: 'Mổ cấp cứu - Chấn thương chỉnh hình',
  cc_ngoaiTH: 'Mổ cấp cứu - Ngoại tổng hợp',
  cc_san: 'Mổ cấp cứu - Sản khoa',
  ct_ctch: 'Mổ kế hoạch - Chấn thương chỉnh hình',
  ct_ngoaiTH: 'Mổ kế hoạch - Ngoại tổng hợp',
  ct_san: 'Mổ kế hoạch - Sản khoa',
  gayMe: 'Gây mê toàn thân',
  gayTe: 'Gây tê tủy sống / Gây tê vùng',
  soCaHoiTinh: 'Bệnh nhân hồi tỉnh theo dõi',

  // Khác
  themGio: 'Trực thêm giờ / Ghi chú ca trực',
  ghiChu: 'Ghi chú khoa phòng',
  dienBien: 'Diễn biến ca trực'
};

// Hàm dịch label tự động nếu chưa có trong từ điển
const getLabelVi = (key) => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
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
 * Tạo file Excel Báo cáo tổng hợp toàn viện đa Sheet
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
  let totalCriticalCases = 0;

  detailedReports.forEach(r => {
    totalTransfers += (r.transferCases?.length || 0);
    totalSurgeries += (r.surgeryCases?.length || 0);
    totalDeaths += (r.deathCases?.length || 0);
    totalCriticalCases += (r.criticalCases?.length || 0);
  });

  // =========================================================================
  // SHEET 1: TongHopToanVien (BẢNG TỔNG HỢP TOÀN VIỆN CHUẨN)
  // =========================================================================
  const ws1 = workbook.addWorksheet('TongHopToanVien', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Tiêu đề đầu trang
  ws1.mergeCells('A1:M1');
  ws1.getCell('A1').value = 'SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI — TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG';
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

  let sumKham = 0;
  let sumBenhCu = 0;
  let sumBenhMoi = 0;
  let sumXuatVien = 0;

  orderedDepartments.forEach((dept, index) => {
    const r = dept.report;
    const rd = r?.report_data || {};
    const hscc = rd.hscc || {};

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

      if (colNumber === 3) {
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: dept.isSubmitted ? 'FF15803D' : 'FFDC2626' } };
      }

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
  // SHEET 2: ChiTietChuyenMonKhoa (DỮ LIỆU ĐỘNG LINH HOẠT TỪNG KHOA)
  // =========================================================================
  const ws2 = workbook.addWorksheet('ChiTietChuyenMonKhoa', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  ws2.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activeCell: 'A3' }];

  ws2.mergeCells('A1:G1');
  ws2.getCell('A1').value = `CHI TIẾT TOÀN BỘ DỮ LIỆU BÁO CÁO CHUYÊN MÔN THEO TỪNG KHOA PHÒNG — NGÀY ${formattedDate}`;
  ws2.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F2C59' } };
  ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  ws2.getRow(1).height = 28;

  const headers2 = [
    'STT',
    'Khoa / Phòng',
    'Phân Nhóm / Dịch Vụ',
    'Chỉ Số Báo Cáo Chuyên Môn',
    'Số Lượng Thực Tế',
    'Đơn Vị Tính',
    'Ghi Chú & Diễn Biến Kèm Theo'
  ];

  const headerRow2 = ws2.addRow(headers2);
  headerRow2.height = 26;
  headerRow2.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });

  orderedDepartments.forEach((dept, deptIdx) => {
    const r = dept.report;
    const rd = r?.report_data || {};

    // Banner Header của từng khoa
    const deptTitleRow = ws2.addRow([
      `${deptIdx + 1}`,
      dept.departmentName.toUpperCase(),
      dept.isSubmitted ? 'ĐÃ NỘP BÁO CÁO' : 'CHƯA NỘP',
      `Bác sĩ trực: ${r?.doctor_name || '—'} | Điều dưỡng: ${r?.nurse_name || '—'}`,
      `Phòng trực: ${r?.room || '—'} | Thời gian: ${r?.shift_time || '—'}`,
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
      // Cách dòng nhỏ
      ws2.addRow([]);
      return;
    }

    // 1. Dòng Nhân sự tăng cường (nếu có)
    if (r.overtime_staff && Array.isArray(r.overtime_staff) && r.overtime_staff.length > 0) {
      r.overtime_staff.forEach((ot) => {
        const otRow = ws2.addRow([
          '',
          dept.departmentName,
          'Nhân sự tăng cường',
          ot.staffName || 'Nhân viên',
          ot.time || '—',
          'Khung giờ',
          ot.notes || 'Trực tăng cường'
        ]);
        otRow.height = 20;
        otRow.eachCell(c => { c.font = { name: 'Arial', size: 9 }; c.border = thinBorder; });
      });
    }

    // Hàm helper thêm dòng chỉ số chuyên môn
    const addMetric = (group, name, value, unit = 'Lượt/Ca', note = '') => {
      if (value === undefined || value === null || value === '') return;
      const row = ws2.addRow([
        '',
        dept.departmentName,
        group,
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

    // ================= DỮ LIỆU ĐỘNG THEO TỪNG KHOA =================
    const code = dept.departmentCode;

    if (code === 'cdha') {
      // Khoa Chẩn đoán hình ảnh: Xử lý mảng techniques hoặc các trường phẳng
      if (Array.isArray(rd.techniques) && rd.techniques.length > 0) {
        rd.techniques.forEach((t, tIdx) => {
          addMetric(
            'Kỹ thuật CĐHA',
            t.name || `Kỹ thuật #${tIdx + 1}`,
            safeNum(t.tongSo),
            'Lượt thực hiện',
            `BHYT: ${safeNum(t.baoHiem)} | Nội trú: ${safeNum(t.noiTru)} | Ngoại trú: ${safeNum(t.ngoaiTru)}`
          );
        });
      }
      if (rd.bsSieuAm) addMetric('Phân công BS', 'BS trực Siêu âm', rd.bsSieuAm, 'Nhân sự');
      if (rd.bsXquangCT) addMetric('Phân công BS', 'BS trực X-Quang / CT', rd.bsXquangCT, 'Nhân sự');
    } else if (code === 'hscc_tnt') {
      // Khoa HSCC - TNT: Gồm 3 khối lồng nhau
      const h = rd.hscc || {};
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Tổng số lượt khám cấp cứu', safeNum(h.tongSoKham), 'Lượt');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Bệnh cũ đang điều trị', safeNum(h.benhCu), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Bệnh mới vào khoa', safeNum(h.benhMoi), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Thở máy', safeNum(h.thoMay), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Thở Oxy', safeNum(h.thoOxy), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Thở CPAP', safeNum(h.cpap), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Xuất viện', safeNum(h.xuatVien), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Chuyển khoa', safeNum(h.chuyenKhoa), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Chuyển viện', safeNum(h.chuyenVien), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Hiện còn điều trị tại HSCC', safeNum(h.hienCon), 'Người');
      addMetric('Khối Hồi Sức Cấp Cứu (HSCC)', 'Tử vong', safeNum(h.tuVong), 'Người');

      const tnt = rd.tnt || {};
      addMetric('Khối Thận Nhân Tạo (TNT)', 'Bệnh cũ', safeNum(tnt.benhCu), 'Người');
      addMetric('Khối Thận Nhân Tạo (TNT)', 'Bệnh mới', safeNum(tnt.benhMoi), 'Người');
      addMetric('Khối Thận Nhân Tạo (TNT)', 'Số ca chạy thận định kỳ', safeNum(tnt.ctdk), 'Lượt');
      addMetric('Khối Thận Nhân Tạo (TNT)', 'Bệnh nhân nội trú TNT', safeNum(tnt.noiTru), 'Người');
      addMetric('Khối Thận Nhân Tạo (TNT)', 'Hiện còn TNT', safeNum(tnt.hienCon), 'Người');
      if (tnt.bsTrucTNT) addMetric('Khối Thận Nhân Tạo (TNT)', 'BS trực Thận nhân tạo', tnt.bsTrucTNT, 'Nhân sự');

      const pk = rd.pk21 || {};
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Tổng số khám PK21', safeNum(pk.tongSo), 'Lượt');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Kê toa phòng khám', safeNum(pk.keToa), 'Toa');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Truyền máu', safeNum(pk.truyenMau), 'Ca');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Tiểu phẫu', safeNum(pk.tieuPhau), 'Ca');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Bó bột', safeNum(pk.boBot), 'Ca');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Cấp cứu ngoại viện (115)', safeNum(pk.ccNgoaiVien), 'Ca');
      addMetric('Phòng Khám 21 (Cấp cứu ngoại viện)', 'Hiện còn PK21', safeNum(pk.hienCon), 'Người');
    } else {
      // Duyệt qua TẤT CẢ các keys trong report_data của khoa
      const processedKeys = new Set();

      // Nhóm 1: Các chỉ số số học hoặc text trực tiếp
      Object.keys(rd).forEach((k) => {
        if (['ghiChu', 'dienBien', 'themGio', 'techniques', 'hscc', 'tnt', 'pk21'].includes(k)) return;
        const val = rd[k];
        if (typeof val === 'object' && val !== null) {
          // Object con lồng nhau
          Object.keys(val).forEach(subK => {
            const subVal = val[subK];
            if (subVal !== undefined && subVal !== null && subVal !== '') {
              addMetric(getLabelVi(k), getLabelVi(subK), typeof subVal === 'number' || !isNaN(Number(subVal)) ? safeNum(subVal) : subVal, 'Chỉ số');
            }
          });
        } else if (val !== undefined && val !== null && val !== '') {
          addMetric('Chỉ tiêu chuyên môn', getLabelVi(k), typeof val === 'number' || !isNaN(Number(val)) ? safeNum(val) : val, 'Chỉ số');
        }
        processedKeys.add(k);
      });
    }

    // 3. Ghi chú & Diễn biến
    if (rd.themGio) addMetric('Diễn Biến Ca Trực', 'Ghi chú trực thêm giờ', rd.themGio, 'Ghi chú');
    if (rd.ghiChu) addMetric('Ghi Chú Khoa Phòng', 'Nội dung ghi chú', rd.ghiChu, 'Ghi chú');
    if (rd.dienBien) addMetric('Diễn Biến Ca Trực', 'Diễn biến bệnh phòng', rd.dienBien, 'Ghi chú');

    // 4. Danh sách ca bệnh lâm sàng nếu khoa có
    const tCases = r.transferCases || [];
    if (tCases.length > 0) {
      tCases.forEach((tc, cIdx) => {
        addMetric(
          '🚑 Ca Chuyển Viện',
          `Ca #${cIdx + 1}: ${tc.patient_name || tc.patientName || 'Bệnh nhân'} (${tc.age || '—'} tuổi)`,
          `Vào: ${tc.admission_time || tc.admissionTime || '—'}`,
          'Chuyển viện',
          `Chẩn đoán: ${tc.diagnosis || '—'} | Xử trí: ${tc.initial_treatment || tc.initialTreatment || '—'} | Diễn biến: ${tc.progress_notes || tc.progressNotes || '—'}`
        );
      });
    }

    const sCases = r.surgeryCases || [];
    if (sCases.length > 0) {
      sCases.forEach((sc, cIdx) => {
        addMetric(
          '🔪 Ca Phẫu Thuật (Mổ)',
          `Ca #${cIdx + 1}: ${sc.patient_name || sc.patientName || 'Bệnh nhân'} (${sc.birth_year || sc.birthYear || '—'})`,
          `Vào: ${sc.admission_time || sc.admissionTime || '—'}`,
          'Phẫu thuật',
          `CĐ trước mổ: ${sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'} | CĐ sau mổ: ${sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'} | Tình trạng: ${sc.current_status || sc.currentStatus || '—'}`
        );
      });
    }

    const dCases = r.deathCases || [];
    if (dCases.length > 0) {
      dCases.forEach((dc, cIdx) => {
        addMetric(
          '🚨 Ca Tử Vong',
          `Ca #${cIdx + 1}: ${dc.patient_name || dc.patientName || 'Bệnh nhân'} (${dc.age || '—'} tuổi)`,
          `Vào: ${dc.admission_time || dc.admissionTime || '—'}`,
          'Tử vong',
          `Chẩn đoán tử vong: ${dc.diagnosis || '—'} | CPR: ${dc.emergency_treatment || dc.emergencyTreatment || '—'} | Kết quả: ${dc.final_outcome || dc.finalOutcome || '—'}`
        );
      });
    }

    // Cách 1 dòng giữa các khoa
    ws2.addRow([]);
  });

  ws2.columns = [
    { width: 6 },   // STT
    { width: 32 },  // Tên Khoa
    { width: 28 },  // Phân Nhóm
    { width: 38 },  // Chỉ Số Chuyên Môn
    { width: 18 },  // Số Lượng
    { width: 16 },  // Đơn Vị
    { width: 45 }   // Ghi Chú & Diễn Biến
  ];

  // =========================================================================
  // SHEET 3: ChiTietBenhLy (TỔNG HỢP CHUYỂN VIỆN, CA MỔ, TỬ VONG TOÀN VIỆN)
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

  // Cách 1 dòng
  ws3.addRow([]);
  currentRowIndex++;

  // --- MỤC IV: BỆNH NHÂN NẶNG THEO DÕI ---
  ws3.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
  ws3.getCell(`A${currentRowIndex}`).value = `⚡ IV. DANH SÁCH BỆNH NHÂN NẶNG THEO DÕI (${totalCriticalCases} CA)`;
  ws3.getCell(`A${currentRowIndex}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getCell(`A${currentRowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } }; // Purple
  ws3.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
  ws3.getRow(currentRowIndex).height = 26;
  currentRowIndex++;

  const criticalHeaders = [
    'STT',
    'Khoa Báo Cáo',
    'Họ Tên / Tuổi / Địa Chỉ',
    'Thời Gian Vào Viện (VV)',
    'Tiền Căn Bệnh',
    'Chẩn Đoán',
    'Tình Trạng & Diễn Biến (Giao Ban & Trong Ngày)',
    'Xử Trí Điều Trị',
    'Hướng Tiếp Theo / Ghi Chú'
  ];

  const cHeaderRow = ws3.addRow(criticalHeaders);
  cHeaderRow.height = 24;
  cHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF5B21B6' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = headerBorder;
  });
  currentRowIndex++;

  let cCount = 0;
  orderedDepartments.forEach(dept => {
    const cCases = dept.report?.criticalCases || [];
    cCases.forEach(cc => {
      cCount++;
      const patientInfo = `${cc.patient_name || cc.patientName || '—'}${cc.age ? ` (${cc.age} tuổi)` : ''}${cc.address ? `\nĐịa chỉ: ${cc.address}` : ''}`;
      const row = ws3.addRow([
        cCount,
        dept.departmentName,
        patientInfo,
        cc.admission_time || cc.admissionTime || '—',
        cc.medical_history || cc.medicalHistory || '—',
        cc.diagnosis || '—',
        cc.condition_summary || cc.conditionSummary || '—',
        cc.treatment || '—',
        cc.notes || 'Bàn giao tua sau theo dõi tiếp'
      ]);
      row.height = 42;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9.5 };
        cell.border = thinBorder;
        if (colNum === 1 || colNum === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNum === 3 || colNum === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF6D28D9' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      currentRowIndex++;
    });
  });

  if (cCount === 0) {
    const emptyRow = ws3.addRow(['', 'Không có ca bệnh nhân nặng theo dõi nào trong ngày.', '', '', '', '', '', '', '']);
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
    { width: 24 },  // Lý do / Tình trạng vào / Tiền căn
    { width: 30 },  // Cận lâm sàng / Tiền sử / Chẩn đoán
    { width: 32 },  // Chẩn đoán / Tình trạng diễn biến
    { width: 32 },  // Xử trí
    { width: 32 }   // Diễn biến / Kết quả / Hướng tiếp theo
  ];

  return workbook;
};

module.exports = { generateHospitalExcelReport };
