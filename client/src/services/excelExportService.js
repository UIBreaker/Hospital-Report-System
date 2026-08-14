import ExcelJS from 'exceljs';

const DEPARTMENT_ORDER = [
  'lck', 'xn', 'cdha', 'hscc_tnt', 'noi', 'nhi',
  'nhiem', 'san', 'yhct_phcn', 'ngoai_th', 'ctch', 'gmhs'
];

const DEPARTMENT_MAP = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét nghiệm',
  cdha: 'Chẩn đoán hình ảnh',
  hscc_tnt: 'Hồi sức cấp cứu – Thận nhân tạo',
  noi: 'Khoa Nội tổng hợp',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Truyền nhiễm',
  san: 'Khoa Sản (CSSK Sinh sản)',
  yhct_phcn: 'Y học cổ truyền – Phục hồi chức năng',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Phẫu thuật, gây mê hồi sức',
  duoc: 'Khoa Dược - Trang thiết bị - VTYT',
  kham_benh: 'Khoa Khám bệnh'
};

const FIELD_LABELS = {
  // LCK
  tmh_tongSo: 'Tai Mũi Họng (Tổng khám)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'RHM + Nội (Tổng khám)',
  rhm_noi_thuThuat: 'RHM + Nội (Thủ thuật)',
  daLieu_tongSo: 'Da liễu (Tổng khám)',
  nhapVien_tongSo: 'Số ca nhập viện',
  chuyenVien_tongSo: 'Số ca chuyển viện',
  tong4ck_tongSo: 'TỔNG SỐ 4 CHUYÊN KHOA',
  tong4ck_thuThuat: 'TỔNG THỦ THUẬT 4CK',

  // Common
  tongSoKham: 'Tổng số khám',
  benhCu: 'Bệnh cũ (Đang điều trị)',
  benhMoi: 'Bệnh mới nhập viện',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn điều trị',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  baoHiem: 'Bảo hiểm y tế (BHYT)',
  noiTru: 'Bệnh nhân nội trú',
  ngoaiTru: 'Bệnh nhân ngoại trú',
  tongSo: 'Tổng số',

  // XN
  tongXetNghiem: 'Tổng số xét nghiệm',
  sinhHoa: 'Sinh hóa',
  huyetHoc: 'Huyết học',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  viSinh: 'Vi sinh',
  mienDich: 'Miễn dịch',

  // CDHA
  tongSoSieuAm: 'Tổng số siêu âm',
  tongSoXquang: 'Tổng số X-quang',
  tongSoCT: 'Tổng số CT Scanner',

  // HSCC - TNT
  tnt_benhCu: 'Bệnh cũ (TNT)',
  tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)',
  tnt_hienCon: 'Hiện còn (TNT)',
  thoMay: 'Thở máy',
  cpap: 'Thở CPAP',
  thoOxy: 'Thở Oxy',
  ctdk: 'Chạy thận định kỳ',
  bsTrucTNT: 'BS trực TNT',

  // San
  sanhThuong: 'Sanh thường',
  sanhHut: 'Sanh hút',
  moLayThai: 'Mổ lấy thai',
  moDe: 'Mổ đẻ',
  choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm sản',

  // GMHS / Ngoai / CTCH
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

// Style helper: apply thin border to range of cells
const applyBorders = (worksheet, startRow, endRow, startCol, endCol) => {
  for (let r = startRow; r <= endRow; r++) {
    const row = worksheet.getRow(r);
    for (let c = startCol; c <= endCol; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    }
  }
};

/**
 * Generate complete Excel Workbook with 3 Sheets and download it in the browser
 */
export const generateAndDownloadHospitalExcel = async (date, detailedReports = [], statusList = []) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Trung Tâm Y Tế Khu Vực Bình Long';
  workbook.created = new Date();

  const sortedReports = [...detailedReports].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
    const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  const reportMap = {};
  sortedReports.forEach(r => {
    reportMap[r.department_code] = r;
  });

  // =========================================================================
  // SHEET 1: TỔNG HỢP TOÀN VIỆN
  // =========================================================================
  const wsSummary = workbook.addWorksheet('Tổng Hợp Toàn Viện', {
    views: [{ showGridLines: true }]
  });

  // Set explicit, well-proportioned column widths (no oversized columns)
  wsSummary.columns = [
    { key: 'stt', width: 6 },
    { key: 'khoa', width: 26 },
    { key: 'trangThai', width: 12 },
    { key: 'bsTruc', width: 18 },
    { key: 'ddTruc', width: 22 },
    { key: 'tongKham', width: 12 },
    { key: 'benhCu', width: 10 },
    { key: 'benhMoi', width: 10 },
    { key: 'xuatVien', width: 10 },
    { key: 'chuyenVien', width: 11 },
    { key: 'phauThuat', width: 11 },
    { key: 'tuVong', width: 10 },
    { key: 'ghiChu', width: 26 }
  ];

  // Header Title
  wsSummary.mergeCells('A1:M1');
  const title1 = wsSummary.getCell('A1');
  title1.value = 'SỞ Y TẾ TỈNH BÌNH PHƯỚC — TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG';
  title1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(1).height = 22;

  wsSummary.mergeCells('A2:M2');
  const title2 = wsSummary.getCell('A2');
  title2.value = `BẢNG TỔNG HỢP BÁO CÁO GIAO BAN TOÀN VIỆN (NGÀY: ${date})`;
  title2.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F2C59' } };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(2).height = 26;

  // Table Headers
  const headerRow1 = wsSummary.getRow(4);
  const headers = [
    'STT', 'Khoa / Phòng', 'Trạng Thái', 'Bác Sĩ Trực', 'Điều Dưỡng Trực',
    'Tổng Khám', 'Bệnh Cũ', 'Bệnh Mới', 'Xuất Viện', 'Chuyển Viện',
    'Phẫu Thuật', 'Tử Vong', 'Ghi Chú & Tăng Cường'
  ];
  headers.forEach((h, idx) => {
    const cell = headerRow1.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F2C59' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  headerRow1.height = 26;

  // Rows data
  let currentRow = 5;
  let sumKham = 0, sumCu = 0, sumMoi = 0, sumXuat = 0, sumChuyen = 0, sumMo = 0, sumTuVong = 0;

  DEPARTMENT_ORDER.forEach((code, idx) => {
    const report = reportMap[code];
    const deptName = DEPARTMENT_MAP[code] || code;
    const isSubmitted = !!report;

    const repData = report ? (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {})) : {};

    let kham = parseInt(repData.tongSoKham || repData.tongSo || repData.tmh_tongSo || 0, 10) || 0;
    let cu = parseInt(repData.benhCu || repData.tnt_benhCu || 0, 10) || 0;
    let moi = parseInt(repData.benhMoi || repData.tnt_benhMoi || 0, 10) || 0;
    let xuat = parseInt(repData.xuatVien || repData.tnt_xuatVien || 0, 10) || 0;
    let chuyen = parseInt(repData.chuyenVien || repData.tnt_chuyenVien || 0, 10) || (report?.transferCases?.length || 0);
    let mo = parseInt(repData.tongSoCaMo || 0, 10) || (report?.surgeryCases?.length || 0);
    let tuVong = parseInt(repData.tuVong || 0, 10) || (report?.deathCases?.length || 0);

    sumKham += kham;
    sumCu += cu;
    sumMoi += moi;
    sumXuat += xuat;
    sumChuyen += chuyen;
    sumMo += mo;
    sumTuVong += tuVong;

    let overtimeStr = '';
    if (report?.overtime_staff && Array.isArray(report.overtime_staff) && report.overtime_staff.length > 0) {
      overtimeStr = report.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ');
    }

    const row = wsSummary.getRow(currentRow);
    row.getCell(1).value = idx + 1;
    row.getCell(2).value = deptName;
    row.getCell(3).value = isSubmitted ? '✓ Đã nộp' : 'Chưa nộp';
    row.getCell(4).value = report?.doctor_name || '—';
    row.getCell(5).value = report?.nurse_name || '—';
    row.getCell(6).value = kham || '—';
    row.getCell(7).value = cu || '—';
    row.getCell(8).value = moi || '—';
    row.getCell(9).value = xuat || '—';
    row.getCell(10).value = chuyen || '—';
    row.getCell(11).value = mo || '—';
    row.getCell(12).value = tuVong > 0 ? `${tuVong} 🚨` : (tuVong || '0');
    row.getCell(13).value = overtimeStr || (report?.room ? `Phòng: ${report.room}` : '—');

    // Formatting
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { vertical: 'middle' };
    row.getCell(2).font = { bold: true };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).font = { bold: true, color: { argb: isSubmitted ? 'FF16A34A' : 'FFDC2626' } };
    row.getCell(4).alignment = { vertical: 'middle' };
    row.getCell(5).alignment = { vertical: 'middle' };
    for (let c = 6; c <= 12; c++) {
      row.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    row.getCell(13).alignment = { vertical: 'middle', wrapText: true };

    if (tuVong > 0) {
      row.getCell(12).font = { bold: true, color: { argb: 'FFDC2626' } };
      row.getCell(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    }

    row.height = 20;
    currentRow++;
  });

  // Total Summary Row
  const totalRow = wsSummary.getRow(currentRow);
  totalRow.getCell(1).value = '';
  totalRow.getCell(2).value = 'TỔNG CỘNG TOÀN VIỆN';
  totalRow.getCell(3).value = `${sortedReports.length}/${DEPARTMENT_ORDER.length} Khoa`;
  totalRow.getCell(4).value = '';
  totalRow.getCell(5).value = '';
  totalRow.getCell(6).value = sumKham;
  totalRow.getCell(7).value = sumCu;
  totalRow.getCell(8).value = sumMoi;
  totalRow.getCell(9).value = sumXuat;
  totalRow.getCell(10).value = sumChuyen;
  totalRow.getCell(11).value = sumMo;
  totalRow.getCell(12).value = sumTuVong;
  totalRow.getCell(13).value = '';

  for (let c = 1; c <= 13; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F2C59' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.alignment = { horizontal: c >= 6 && c <= 12 ? 'center' : (c === 3 ? 'center' : 'left'), vertical: 'middle' };
  }
  totalRow.height = 24;

  applyBorders(wsSummary, 4, currentRow, 1, 13);

  // =========================================================================
  // SHEET 2: BÁO CÁO CHUYÊN MÔN TỪNG KHOA
  // =========================================================================
  const wsDetails = workbook.addWorksheet('Chi Tiết Chuyên Môn Khoa', {
    views: [{ showGridLines: true }]
  });

  wsDetails.columns = [
    { key: 'stt', width: 6 },
    { key: 'noiDung', width: 32 },
    { key: 'giaTri', width: 16 },
    { key: 'phanNhom', width: 18 },
    { key: 'ghiChu', width: 30 }
  ];

  wsDetails.mergeCells('A1:E1');
  const dTitle = wsDetails.getCell('A1');
  dTitle.value = `CHI TIẾT SỐ LIỆU CHUYÊN MÔN TỪNG KHOA PHÒNG (NGÀY: ${date})`;
  dTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F2C59' } };
  dTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDetails.getRow(1).height = 26;

  let dRowIdx = 3;

  sortedReports.forEach((report) => {
    const deptName = DEPARTMENT_MAP[report.department_code] || report.department_name || report.department_code;
    const repData = typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : (report.report_data || {});

    // Dept Header
    wsDetails.mergeCells(`A${dRowIdx}:E${dRowIdx}`);
    const deptHeader = wsDetails.getCell(`A${dRowIdx}`);
    deptHeader.value = `🏥 ${deptName.toUpperCase()} • BS trực: ${report.doctor_name || '—'} | ĐD: ${report.nurse_name || '—'}${report.room ? ` | Phòng: ${report.room}` : ''}`;
    deptHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    deptHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    deptHeader.alignment = { vertical: 'middle', indent: 1 };
    wsDetails.getRow(dRowIdx).height = 22;
    dRowIdx++;

    // Sub-header for metrics
    const subHRow = wsDetails.getRow(dRowIdx);
    subHRow.getCell(1).value = 'STT';
    subHRow.getCell(2).value = 'Chỉ Số / Nội Dung Chuyên Môn';
    subHRow.getCell(3).value = 'Giá Trị / Số Lượng';
    subHRow.getCell(4).value = 'Phân Nhóm / Khu Vực';
    subHRow.getCell(5).value = 'Ghi Chú Bổ Sung';
    for (let c = 1; c <= 5; c++) {
      const cell = subHRow.getCell(c);
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.alignment = { horizontal: c === 1 || c === 3 ? 'center' : 'left', vertical: 'middle' };
    }
    subHRow.height = 20;
    const startMetricRow = dRowIdx;
    dRowIdx++;

    let metricCount = 1;

    Object.entries(repData).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;

      if (typeof v === 'object' && !Array.isArray(v)) {
        Object.entries(v).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '') {
            const r = wsDetails.getRow(dRowIdx);
            r.getCell(1).value = metricCount++;
            r.getCell(2).value = FIELD_LABELS[subK] || subK;
            r.getCell(3).value = String(subV);
            r.getCell(4).value = k.toUpperCase();
            r.getCell(5).value = '';
            r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(2).alignment = { vertical: 'middle' };
            r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(3).font = { bold: true, color: { argb: 'FF1E40AF' } };
            r.getCell(4).alignment = { vertical: 'middle' };
            r.height = 19;
            dRowIdx++;
          }
        });
      } else if (Array.isArray(v)) {
        if (v.length > 0 && typeof v[0] === 'object') {
          v.forEach((item, itemIdx) => {
            const r = wsDetails.getRow(dRowIdx);
            r.getCell(1).value = metricCount++;
            r.getCell(2).value = item.name || `Mục #${itemIdx + 1}`;
            r.getCell(3).value = item.tongSo || item.value || JSON.stringify(item);
            r.getCell(4).value = FIELD_LABELS[k] || k;
            r.getCell(5).value = item.baoHiem ? `BHYT: ${item.baoHiem}, Nội trú: ${item.noiTru || 0}` : '';
            r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(2).alignment = { vertical: 'middle' };
            r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(3).font = { bold: true };
            r.getCell(4).alignment = { vertical: 'middle' };
            r.getCell(5).alignment = { vertical: 'middle' };
            r.height = 19;
            dRowIdx++;
          });
        }
      } else {
        const r = wsDetails.getRow(dRowIdx);
        r.getCell(1).value = metricCount++;
        r.getCell(2).value = FIELD_LABELS[k] || k;
        r.getCell(3).value = String(v);
        r.getCell(4).value = 'Chung';
        r.getCell(5).value = '';
        r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        r.getCell(2).alignment = { vertical: 'middle' };
        r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        r.getCell(3).font = { bold: true, color: { argb: 'FF0F2C59' } };
        r.getCell(4).alignment = { vertical: 'middle' };
        r.height = 19;
        dRowIdx++;
      }
    });

    if (metricCount === 1) {
      const r = wsDetails.getRow(dRowIdx);
      r.getCell(1).value = '—';
      r.getCell(2).value = '(Chưa có số liệu chuyên môn chi tiết)';
      r.getCell(3).value = '—';
      r.height = 19;
      dRowIdx++;
    }

    applyBorders(wsDetails, startMetricRow, dRowIdx - 1, 1, 5);
    dRowIdx += 1;
  });

  // =========================================================================
  // SHEET 3: CHI TIẾT CÁC CA BỆNH (CHUYỂN VIỆN, MỔ, TỬ VONG, NẶNG)
  // =========================================================================
  const wsCases = workbook.addWorksheet('Chi Tiết Các Ca Bệnh', {
    views: [{ showGridLines: true }]
  });

  wsCases.columns = [
    { key: 'stt', width: 6 },
    { key: 'khoa', width: 20 },
    { key: 'hoTen', width: 18 },
    { key: 'tuoi', width: 11 },
    { key: 'diaChi', width: 20 },
    { key: 'gioVao', width: 14 },
    { key: 'chanDoan', width: 28 },
    { key: 'xuTri', width: 34 }
  ];

  wsCases.mergeCells('A1:H1');
  const cTitle = wsCases.getCell('A1');
  cTitle.value = `DANH SÁCH CHI TIẾT CÁC CA BỆNH ĐẶC BIỆT (NGÀY: ${date})`;
  cTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F2C59' } };
  cTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsCases.getRow(1).height = 26;

  let cRowIdx = 3;

  // ----------------- SECTION A: CA CHUYỂN VIỆN -----------------
  wsCases.mergeCells(`A${cRowIdx}:H${cRowIdx}`);
  const sAHeader = wsCases.getCell(`A${cRowIdx}`);
  sAHeader.value = '🚑 I. DANH SÁCH CA BỆNH CHUYỂN VIỆN';
  sAHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sAHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
  sAHeader.alignment = { vertical: 'middle', indent: 1 };
  wsCases.getRow(cRowIdx).height = 22;
  cRowIdx++;

  const tfHeaders = ['STT', 'Khoa Phòng', 'Họ Và Tên BN', 'Tuổi', 'Địa Chỉ', 'Giờ Vào', 'Lý Do, Lâm Sàng & CLS', 'Chẩn Đoán & Xử Trí Chuyển'];
  const tfHeaderRow = wsCases.getRow(cRowIdx);
  tfHeaders.forEach((h, idx) => {
    const cell = tfHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, size: 9, color: { argb: 'FF92400E' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  tfHeaderRow.height = 20;
  const startTfRow = cRowIdx;
  cRowIdx++;

  let tfCount = 1;
  sortedReports.forEach(report => {
    const deptName = DEPARTMENT_MAP[report.department_code] || report.department_name || report.department_code;
    (report.transferCases || []).forEach(tc => {
      const r = wsCases.getRow(cRowIdx);
      r.getCell(1).value = tfCount++;
      r.getCell(2).value = deptName;
      r.getCell(3).value = tc.patient_name || tc.patientName || '—';
      r.getCell(4).value = formatPatientAge(tc.age) || '—';
      r.getCell(5).value = tc.address || '—';
      r.getCell(6).value = tc.admission_time || tc.admissionTime || '—';
      r.getCell(7).value = `Lý do: ${tc.reason || '—'}\nLâm sàng: ${tc.clinical_symptoms || tc.clinicalSymptoms || '—'}\nCLS: ${tc.clinical_tests || tc.clinicalTests || '—'}`;
      r.getCell(8).value = `CĐ: ${tc.diagnosis || '—'}\nXử trí: ${tc.initial_treatment || tc.initialTreatment || '—'}\nDiễn biến: ${tc.progress_notes || tc.progressNotes || '—'}`;
      r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(2).alignment = { vertical: 'middle' };
      r.getCell(3).alignment = { vertical: 'middle' };
      r.getCell(3).font = { bold: true, color: { argb: 'FF92400E' } };
      r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(5).alignment = { vertical: 'middle' };
      r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(7).alignment = { vertical: 'middle', wrapText: true };
      r.getCell(8).alignment = { vertical: 'middle', wrapText: true };
      r.height = 42;
      cRowIdx++;
    });
  });

  if (tfCount === 1) {
    const r = wsCases.getRow(cRowIdx);
    r.getCell(1).value = '—';
    r.getCell(2).value = 'Không có ca chuyển viện trong ngày';
    r.height = 20;
    cRowIdx++;
  }
  applyBorders(wsCases, startTfRow, cRowIdx - 1, 1, 8);
  cRowIdx += 1;

  // ----------------- SECTION B: CA PHẪU THUẬT (MỔ) -----------------
  wsCases.mergeCells(`A${cRowIdx}:H${cRowIdx}`);
  const sBHeader = wsCases.getCell(`A${cRowIdx}`);
  sBHeader.value = '🔪 II. DANH SÁCH CA PHẪU THUẬT (MỔ)';
  sBHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sBHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
  sBHeader.alignment = { vertical: 'middle', indent: 1 };
  wsCases.getRow(cRowIdx).height = 22;
  cRowIdx++;

  const sgHeaders = ['STT', 'Khoa Phòng', 'Họ Và Tên BN', 'Năm Sinh / Tuổi', 'Địa Chỉ', 'Giờ Vào', 'Chẩn Đoán Trước / Sau Mổ', 'Lệnh Mổ & Tình Trạng Hiện Tại'];
  const sgHeaderRow = wsCases.getRow(cRowIdx);
  sgHeaders.forEach((h, idx) => {
    const cell = sgHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, size: 9, color: { argb: 'FF0369A1' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  sgHeaderRow.height = 20;
  const startSgRow = cRowIdx;
  cRowIdx++;

  let sgCount = 1;
  sortedReports.forEach(report => {
    const deptName = DEPARTMENT_MAP[report.department_code] || report.department_name || report.department_code;
    (report.surgeryCases || []).forEach(sc => {
      const r = wsCases.getRow(cRowIdx);
      r.getCell(1).value = sgCount++;
      r.getCell(2).value = deptName;
      r.getCell(3).value = sc.patient_name || sc.patientName || '—';
      r.getCell(4).value = formatPatientAge(sc.birth_year || sc.birthYear || sc.age) || '—';
      r.getCell(5).value = sc.address || '—';
      r.getCell(6).value = sc.admission_time || sc.admissionTime || '—';
      r.getCell(7).value = `Trước mổ: ${sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}\nSau mổ: ${sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}`;
      r.getCell(8).value = `Lệnh mổ: ${sc.consultation_order || sc.consultationOrder || '—'}\nHiện tại: ${sc.current_status || sc.currentStatus || '—'}`;
      r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(2).alignment = { vertical: 'middle' };
      r.getCell(3).alignment = { vertical: 'middle' };
      r.getCell(3).font = { bold: true, color: { argb: 'FF0369A1' } };
      r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(5).alignment = { vertical: 'middle' };
      r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(7).alignment = { vertical: 'middle', wrapText: true };
      r.getCell(8).alignment = { vertical: 'middle', wrapText: true };
      r.height = 32;
      cRowIdx++;
    });
  });

  if (sgCount === 1) {
    const r = wsCases.getRow(cRowIdx);
    r.getCell(1).value = '—';
    r.getCell(2).value = 'Không có ca mổ trong ngày';
    r.height = 20;
    cRowIdx++;
  }
  applyBorders(wsCases, startSgRow, cRowIdx - 1, 1, 8);
  cRowIdx += 1;

  // ----------------- SECTION C: CA TỬ VONG -----------------
  wsCases.mergeCells(`A${cRowIdx}:H${cRowIdx}`);
  const sCHeader = wsCases.getCell(`A${cRowIdx}`);
  sCHeader.value = '🚨 III. HỒ SƠ BỆNH NHÂN TỬ VONG';
  sCHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sCHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  sCHeader.alignment = { vertical: 'middle', indent: 1 };
  wsCases.getRow(cRowIdx).height = 22;
  cRowIdx++;

  const dtHeaders = ['STT', 'Khoa Phòng', 'Họ Và Tên BN', 'Tuổi', 'Địa Chỉ', 'Giờ Vào', 'Chẩn Đoán Tử Vong', 'Cấp Cứu & Kết Quả Xử Lý'];
  const dtHeaderRow = wsCases.getRow(cRowIdx);
  dtHeaders.forEach((h, idx) => {
    const cell = dtHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, size: 9, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  dtHeaderRow.height = 20;
  const startDtRow = cRowIdx;
  cRowIdx++;

  let dtCount = 1;
  sortedReports.forEach(report => {
    const deptName = DEPARTMENT_MAP[report.department_code] || report.department_name || report.department_code;
    (report.deathCases || []).forEach(dc => {
      const r = wsCases.getRow(cRowIdx);
      r.getCell(1).value = dtCount++;
      r.getCell(2).value = deptName;
      r.getCell(3).value = dc.patient_name || dc.patientName || '—';
      r.getCell(4).value = formatPatientAge(dc.age) || '—';
      r.getCell(5).value = dc.address || '—';
      r.getCell(6).value = dc.admission_time || dc.admissionTime || '—';
      r.getCell(7).value = dc.diagnosis || '—';
      r.getCell(8).value = `Xử trí: ${dc.emergency_treatment || dc.emergencyTreatment || '—'}\nKết quả: ${dc.final_outcome || dc.finalOutcome || '—'}`;
      r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(2).alignment = { vertical: 'middle' };
      r.getCell(3).alignment = { vertical: 'middle' };
      r.getCell(3).font = { bold: true, color: { argb: 'FFDC2626' } };
      r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(5).alignment = { vertical: 'middle' };
      r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(7).font = { bold: true, color: { argb: 'FFDC2626' } };
      r.getCell(7).alignment = { vertical: 'middle', wrapText: true };
      r.getCell(8).alignment = { vertical: 'middle', wrapText: true };
      r.height = 32;
      cRowIdx++;
    });
  });

  if (dtCount === 1) {
    const r = wsCases.getRow(cRowIdx);
    r.getCell(1).value = '—';
    r.getCell(2).value = 'Không có ca tử vong trong ngày';
    r.height = 20;
    cRowIdx++;
  }
  applyBorders(wsCases, startDtRow, cRowIdx - 1, 1, 8);
  cRowIdx += 1;

  // ----------------- SECTION D: CA BỆNH NẶNG THEO DÕI -----------------
  wsCases.mergeCells(`A${cRowIdx}:H${cRowIdx}`);
  const sDHeader = wsCases.getCell(`A${cRowIdx}`);
  sDHeader.value = '⚡ IV. DANH SÁCH BỆNH NHÂN NẶNG CẦN THEO DÕI';
  sDHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sDHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  sDHeader.alignment = { vertical: 'middle', indent: 1 };
  wsCases.getRow(cRowIdx).height = 22;
  cRowIdx++;

  const crHeaders = ['STT', 'Khoa Phòng', 'Họ Và Tên BN', 'Tuổi', 'Địa Chỉ', 'Giờ Vào', 'Chẩn Đoán & Diễn Biến', 'Xử Trí & Hướng Tiếp Theo'];
  const crHeaderRow = wsCases.getRow(cRowIdx);
  crHeaders.forEach((h, idx) => {
    const cell = crHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, size: 9, color: { argb: 'FF5B21B6' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDE9FE' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  crHeaderRow.height = 20;
  const startCrRow = cRowIdx;
  cRowIdx++;

  let crCount = 1;
  sortedReports.forEach(report => {
    const deptName = DEPARTMENT_MAP[report.department_code] || report.department_name || report.department_code;
    (report.criticalCases || []).forEach(cc => {
      const r = wsCases.getRow(cRowIdx);
      r.getCell(1).value = crCount++;
      r.getCell(2).value = deptName;
      r.getCell(3).value = cc.patient_name || cc.patientName || '—';
      r.getCell(4).value = formatPatientAge(cc.age) || '—';
      r.getCell(5).value = cc.address || '—';
      r.getCell(6).value = cc.admission_time || cc.admissionTime || '—';
      r.getCell(7).value = `Chẩn đoán: ${cc.diagnosis || '—'}\nDiễn biến: ${cc.condition_summary || cc.conditionSummary || '—'}`;
      r.getCell(8).value = `Xử trí: ${cc.treatment || '—'}\nHướng tiếp: ${cc.notes || 'Bàn giao tua sau theo dõi tiếp'}`;
      r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(2).alignment = { vertical: 'middle' };
      r.getCell(3).alignment = { vertical: 'middle' };
      r.getCell(3).font = { bold: true, color: { argb: 'FF6D28D9' } };
      r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(5).alignment = { vertical: 'middle' };
      r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(7).alignment = { vertical: 'middle', wrapText: true };
      r.getCell(8).alignment = { vertical: 'middle', wrapText: true };
      r.height = 32;
      cRowIdx++;
    });
  });

  if (crCount === 1) {
    const r = wsCases.getRow(cRowIdx);
    r.getCell(1).value = '—';
    r.getCell(2).value = 'Không có ca bệnh nặng theo dõi trong ngày';
    r.height = 20;
    cRowIdx++;
  }
  applyBorders(wsCases, startCrRow, cRowIdx - 1, 1, 8);

  // Write to buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const filename = `Bao_Cao_Giao_Ban_Tong_Hop_${date}.xlsx`;

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
