/**
 * Department Report Data Parser
 * Converts diverse department form data into structured sections for presentation & print.
 * TTYT Khu Vực Bình Long
 */
import { getLabel } from './medicalFormatters';

export const parseDepartmentSections = (reportData, deptCode = '') => {
  if (!reportData) return [];
  let data;
  try {
    data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
  } catch (e) {
    return [];
  }

  const sections = [];
  const normalizedDept = (deptCode || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

  // ================= 0. KHOA LIÊN CHUYÊN KHOA (LCK) =================
  if (normalizedDept === 'lck' || data.tmh_tongSo !== undefined || data.tong4ck_tongSo !== undefined) {
    const sumMetrics = [];
    if (data.tong4ck_tongSo !== undefined && data.tong4ck_tongSo !== '') {
      sumMetrics.push({ key: 'tong4ck_tongSo', label: 'TỔNG SỐ 4 CHUYÊN KHOA (TMH + Mắt + Răng Hàm Mặt + Da liễu)', value: String(data.tong4ck_tongSo) });
    }
    if (data.tong4ck_thuThuat !== undefined && data.tong4ck_thuThuat !== '') {
      sumMetrics.push({ key: 'tong4ck_thuThuat', label: 'TỔNG THỦ THUẬT 4 CHUYÊN KHOA', value: String(data.tong4ck_thuThuat) });
    }
    if (sumMetrics.length > 0) {
      sections.push({
        title: '📊 TỔNG QUAN 4 CHUYÊN KHOA (4CK)',
        items: sumMetrics
      });
    }

    const detailMetrics = [];
    if (data.tmh_tongSo !== undefined && data.tmh_tongSo !== '') detailMetrics.push({ key: 'tmh_tongSo', label: 'Tai Mũi Họng (Tổng số)', value: String(data.tmh_tongSo) });
    if (data.tmh_thuThuat !== undefined && data.tmh_thuThuat !== '') detailMetrics.push({ key: 'tmh_thuThuat', label: 'Tai Mũi Họng (Thủ thuật)', value: String(data.tmh_thuThuat) });
    if (data.mat_tongSo !== undefined && data.mat_tongSo !== '') detailMetrics.push({ key: 'mat_tongSo', label: 'Mắt (Tổng số)', value: String(data.mat_tongSo) });
    if (data.mat_thuThuat !== undefined && data.mat_thuThuat !== '') detailMetrics.push({ key: 'mat_thuThuat', label: 'Mắt (Thủ thuật)', value: String(data.mat_thuThuat) });
    if (data.rhm_noi_tongSo !== undefined && data.rhm_noi_tongSo !== '') detailMetrics.push({ key: 'rhm_noi_tongSo', label: 'Răng Hàm Mặt (Tổng số)', value: String(data.rhm_noi_tongSo) });
    if (data.rhm_noi_thuThuat !== undefined && data.rhm_noi_thuThuat !== '') detailMetrics.push({ key: 'rhm_noi_thuThuat', label: 'Răng Hàm Mặt (Thủ thuật)', value: String(data.rhm_noi_thuThuat) });
    if (data.daLieu_tongSo !== undefined && data.daLieu_tongSo !== '') detailMetrics.push({ key: 'daLieu_tongSo', label: 'Da Liễu (Tổng số)', value: String(data.daLieu_tongSo) });
    if (data.nhapVien_tongSo !== undefined && data.nhapVien_tongSo !== '') detailMetrics.push({ key: 'nhapVien_tongSo', label: 'Nhập viện', value: String(data.nhapVien_tongSo) });
    if (data.chuyenVien_tongSo !== undefined && data.chuyenVien_tongSo !== '') detailMetrics.push({ key: 'chuyenVien_tongSo', label: 'Chuyển viện', value: String(data.chuyenVien_tongSo) });

    if (detailMetrics.length > 0) {
      sections.push({
        title: '📋 CHI TIẾT THEO TỪNG PHÒNG CHUYÊN KHOA',
        items: detailMetrics
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ THÊM GIỜ & DIỄN BIẾN CA TRỰC',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 1. GÂY MÊ HỒI SỨC (GMHS) =================
  if (normalizedDept === 'gmhs' || data.nhanSu !== undefined || data.tongSoCaMo !== undefined || data.cc_ctch !== undefined) {
    if (data.nhanSu) {
      sections.push({
        type: 'personnel',
        title: 'THÀNH PHẦN NHÂN SỰ CA TRỰC',
        value: data.nhanSu
      });
    }

    const gmhsItems = [];
    if (data.tongSoCaMo !== undefined && data.tongSoCaMo !== '') {
      gmhsItems.push({ key: 'tongSoCaMo', label: 'Tổng số ca mổ (Cấp cứu + Kế hoạch)', value: String(data.tongSoCaMo) });
    }
    if (data.hienCon !== undefined && data.hienCon !== '') {
      gmhsItems.push({ key: 'hienCon', label: 'Hiện còn theo dõi tại Hồi tỉnh', value: String(data.hienCon) });
    }
    if (data.cc_ngoaiTH !== undefined && data.cc_ngoaiTH !== '') gmhsItems.push({ key: 'cc_ngoaiTH', label: 'Mổ cấp cứu (Ngoại tổng hợp)', value: String(data.cc_ngoaiTH) });
    if (data.cc_ctch !== undefined && data.cc_ctch !== '') gmhsItems.push({ key: 'cc_ctch', label: 'Mổ cấp cứu (CTCH)', value: String(data.cc_ctch) });
    if (data.cc_san !== undefined && data.cc_san !== '') gmhsItems.push({ key: 'cc_san', label: 'Mổ cấp cứu (Sản khoa)', value: String(data.cc_san) });
    if (data.ct_ngoaiTH !== undefined && data.ct_ngoaiTH !== '') gmhsItems.push({ key: 'ct_ngoaiTH', label: 'Mổ kế hoạch (Ngoại tổng hợp)', value: String(data.ct_ngoaiTH) });
    if (data.ct_ctch !== undefined && data.ct_ctch !== '') gmhsItems.push({ key: 'ct_ctch', label: 'Mổ kế hoạch (CTCH)', value: String(data.ct_ctch) });
    if (data.ct_san !== undefined && data.ct_san !== '') gmhsItems.push({ key: 'ct_san', label: 'Mổ kế hoạch (Sản khoa)', value: String(data.ct_san) });
    if (data.moKhac !== undefined && data.moKhac !== '') gmhsItems.push({ key: 'moKhac', label: 'Mổ khác', value: String(data.moKhac) });
    if (data.soCaGiamDau !== undefined && data.soCaGiamDau !== '') gmhsItems.push({ key: 'soCaGiamDau', label: 'Ca giảm đau', value: String(data.soCaGiamDau) });

    if (gmhsItems.length > 0) {
      sections.push({
        title: 'THỐNG KÊ CA PHẪU THUẬT & HỒI TỈNH',
        items: gmhsItems
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ THÊM GIỜ & DIỄN BIẾN MỔ',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 2. XÉT NGHIỆM (XN) =================
  if (normalizedDept === 'xn' || (data.tongSo !== undefined && (data.baoHiem !== undefined || data.noiTru !== undefined) && !data.techniques)) {
    const xnMetrics = [];
    if (data.tongSo !== undefined && data.tongSo !== '') xnMetrics.push({ key: 'tongSo', label: 'Tổng số lượt xét nghiệm', value: String(data.tongSo) });
    if (data.baoHiem !== undefined && data.baoHiem !== '') xnMetrics.push({ key: 'baoHiem', label: 'Bảo hiểm y tế (BHYT)', value: String(data.baoHiem) });
    if (data.noiTru !== undefined && data.noiTru !== '') xnMetrics.push({ key: 'noiTru', label: 'Bệnh nhân Nội trú', value: String(data.noiTru) });
    if (data.ngoaiTru !== undefined && data.ngoaiTru !== '') xnMetrics.push({ key: 'ngoaiTru', label: 'Bệnh nhân Ngoại trú', value: String(data.ngoaiTru) });

    if (xnMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ XÉT NGHIỆM THỰC HIỆN',
        items: xnMetrics
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ THÊM GIỜ & CA TRỰC',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 3. HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO (HSCC_TNT) =================
  if (normalizedDept === 'hscc_tnt' || (data.hscc && data.tnt)) {
    // 1. TỔNG SỐ KHÁM (Bóc tách riêng ra bên ngoài ở vị trí đầu tiên)
    const tongKhamItems = [];
    const hsccKham = data.hscc?.tongSoKham || data.hscc?.tongSo || '';
    const tntKham = data.tnt?.tongSoKham || data.tnt?.tongSo || data.tnt?.tnt_ctdk || data.tnt?.ctdk || '';
    const pk21Kham = data.pk21?.pk21_tongSo || data.pk21?.pk21_tongSoKham || data.pk21?.tongSo || '';

    if (hsccKham !== '') {
      tongKhamItems.push({ key: 'tongSoKham_hscc', label: 'Khám Cấp cứu (HSCC)', value: String(hsccKham) });
    }
    if (tntKham !== '') {
      tongKhamItems.push({ key: 'tongSoKham_tnt', label: 'Khám / Chạy thận (TNT)', value: String(tntKham) });
    }
    if (pk21Kham !== '') {
      tongKhamItems.push({ key: 'tongSoKham_pk21', label: 'Khám Phòng Khám 21', value: String(pk21Kham) });
    }

    const validNums = [hsccKham, tntKham, pk21Kham].map(v => Number(v)).filter(n => !isNaN(n) && n > 0);
    if (validNums.length >= 2) {
      const sumAll = validNums.reduce((a, b) => a + b, 0);
      tongKhamItems.unshift({ key: 'tongSoKham_tongCong', label: 'TỔNG SỐ KHÁM TOÀN KHOA', value: String(sumAll) });
    }

    if (tongKhamItems.length > 0) {
      sections.push({
        title: '📊 TỔNG SỐ KHÁM (HSCC • TNT • PK 21)',
        items: tongKhamItems
      });
    }

    // 2. KHỐI HỒI SỨC CẤP CỨU (HSCC)
    if (data.hscc && typeof data.hscc === 'object') {
      const hsccItems = [];
      const hsccKeyOrder = [
        'benhCu', 'benhMoi', 'xuatVien', 'chuyenVien', 'chuyenKhoa', 'hienCon',
        'tuVong', 'keToa', 'ngoaiTru', 'truyenMau', 'tieuPhau', 'boBot', 'ccNgoaiVien'
      ];

      const hsccKeys = Object.keys(data.hscc).filter(k => 
        k !== '_id' && 
        k !== 'tongSoKham' && 
        k !== 'tongSo' && 
        data.hscc[k] !== null && 
        data.hscc[k] !== undefined && 
        data.hscc[k] !== ''
      );
      hsccKeys.sort((a, b) => {
        const idxA = hsccKeyOrder.indexOf(a);
        const idxB = hsccKeyOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      hsccKeys.forEach(k => {
        hsccItems.push({ key: k, label: getLabel(k), value: String(data.hscc[k]) });
      });

      if (hsccItems.length > 0) {
        sections.push({
          title: 'KHỐI HỒI SỨC CẤP CỨU (HSCC)',
          items: hsccItems
        });
      }
    }

    // 3. KHỐI THẬN NHÂN TẠO (TNT)
    if (data.tnt && typeof data.tnt === 'object') {
      const tntItems = [];
      const tntKeyOrder = [
        'tnt_benhCu', 'benhCu',
        'tnt_benhMoi', 'benhMoi',
        'tnt_xuatVien', 'xuatVien',
        'tnt_chuyenVien', 'chuyenVien',
        'tnt_chuyenKhoa', 'chuyenKhoa',
        'tnt_hienCon', 'hienCon',
        'tnt_ctdk', 'ctdk',
        'tnt_noiTru', 'noiTru',
        'tnt_tuVong', 'tuVong'
      ];

      const tntKeys = Object.keys(data.tnt).filter(k => 
        k !== '_id' && 
        k !== 'tongSoKham' && 
        data.tnt[k] !== null && 
        data.tnt[k] !== undefined && 
        data.tnt[k] !== ''
      );
      tntKeys.sort((a, b) => {
        const idxA = tntKeyOrder.indexOf(a);
        const idxB = tntKeyOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      tntKeys.forEach(k => {
        tntItems.push({ key: k, label: getLabel(k), value: String(data.tnt[k]) });
      });

      if (tntItems.length > 0) {
        sections.push({
          title: 'KHỐI THẬN NHÂN TẠO (TNT)',
          items: tntItems
        });
      }
    }

    // 4. PHÒNG KHÁM 21 (PK 21)
    if (data.pk21 && typeof data.pk21 === 'object') {
      const pkItems = [];
      const pkKeyOrder = ['pk21_ngoaiTru', 'pk21_nhapVien', 'pk21_chuyenVien'];
      const pkKeys = Object.keys(data.pk21).filter(k => 
        k !== '_id' && 
        k !== 'pk21_tongSo' && 
        k !== 'pk21_tongSoKham' && 
        k !== 'tongSo' &&
        data.pk21[k] !== null && 
        data.pk21[k] !== undefined && 
        data.pk21[k] !== ''
      );
      pkKeys.sort((a, b) => {
        const idxA = pkKeyOrder.indexOf(a);
        const idxB = pkKeyOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
      pkKeys.forEach(k => {
        pkItems.push({ key: k, label: getLabel(k), value: String(data.pk21[k]) });
      });
      if (pkItems.length > 0) {
        sections.push({
          title: 'PHÒNG KHÁM 21 (PK 21)',
          items: pkItems
        });
      }
    }

    // 5. Ghi chú thêm giờ
    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ THÊM GIỜ & DIỄN BIẾN',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 4. KHOA NHIỄM (NHIEM) =================
  if (normalizedDept === 'nhiem' || data.chuyenKhoaSan !== undefined || data.xinXuatVien !== undefined) {
    if (data.dieuDuongTruc) {
      sections.push({
        type: 'personnel',
        title: 'ĐIỀU DƯỠNG TRỰC CA',
        value: data.dieuDuongTruc
      });
    }

    const nhiemMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') nhiemMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') nhiemMetrics.push({ key: 'benhMoi', label: 'Bệnh mới nhập viện', value: String(data.benhMoi) });
    if (data.hienCon !== undefined && data.hienCon !== '') nhiemMetrics.push({ key: 'hienCon', label: 'Hiện còn điều trị', value: String(data.hienCon) });
    if (data.chuyenVien !== undefined && data.chuyenVien !== '') nhiemMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(data.chuyenVien) });
    if (data.xinXuatVien !== undefined && data.xinXuatVien !== '') nhiemMetrics.push({ key: 'xinXuatVien', label: 'Xin xuất viện', value: String(data.xinXuatVien) });
    if (data.chuyenKhoaSan !== undefined && data.chuyenKhoaSan !== '') nhiemMetrics.push({ key: 'chuyenKhoaSan', label: 'Chuyển khoa Sản', value: String(data.chuyenKhoaSan) });

    if (nhiemMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ BỆNH NHÂN KHOA NHIỄM',
        items: nhiemMetrics
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'DIỄN BIẾN THÊM GIỜ',
        value: data.themGio
      });
    }

    if (data.tinhHinhChung) {
      sections.push({
        type: 'note',
        title: 'TÌNH HÌNH CHUNG CA TRỰC',
        value: data.tinhHinhChung
      });
    }

    return sections;
  }

  // ================= 5. CHẨN ĐOÁN HÌNH ẢNH (CDHA) =================
  if (data.techniques && Array.isArray(data.techniques)) {
    const docItems = [];
    if (data.bsSieuAm) docItems.push({ key: 'bsSieuAm', label: 'BS trực Siêu âm', value: String(data.bsSieuAm) });
    if (data.bsXquangCT) docItems.push({ key: 'bsXquangCT', label: 'BS trực Xquang – CT Scan', value: String(data.bsXquangCT) });
    if (docItems.length > 0) {
      sections.push({
        type: 'personnel',
        title: 'PHÂN CÔNG BÁC SĨ TRỰC CHUYÊN KHOA',
        value: docItems.map(d => `${d.label}: ${d.value}`).join(' | ')
      });
    }

    const validRows = data.techniques.filter(t => t && (t.tongSo || t.baoHiem || t.noiTru || t.ngoaiTru || t.name));
    if (validRows.length > 0) {
      sections.push({
        title: 'THỐNG KÊ KỸ THUẬT CHẨN ĐOÁN HÌNH ẢNH',
        tableType: 'techniques',
        tableRows: validRows
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'THÊM GIỜ & GHI CHÚ',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 6. UNIVERSAL / MULTI-BLOCK PARSER =================
  const topKeys = Object.keys(data).filter(k => k !== '_id');
  const hasNestedObjects = topKeys.some(k => data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]));

  const priorityOrder = ['hscc', 'tnt', 'pk21', 'noiTru', 'ngoaiTru', 'keToa', 'khamBenh', 'dieuTri'];
  topKeys.sort((a, b) => {
    const idxA = priorityOrder.indexOf(a);
    const idxB = priorityOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const noteKeys = ['themGio', 'tinhHinhChung', 'ghiChu', 'hienConGhiChu', 'hienCoGhiChu', 'chuyenVienTT', 'nhanSu', 'dieuDuongTruc'];

  if (hasNestedObjects) {
    topKeys.forEach(k => {
      const val = data[k];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        let sectionTitle = getLabel(k);
        if (k === 'hscc') sectionTitle = 'KHỐI HỒI SỨC CẤP CỨU (HSCC)';
        if (k === 'tnt') sectionTitle = 'KHỐI THẬN NHÂN TẠO (TNT)';
        if (k === 'pk21') sectionTitle = 'PHÒNG KHÁM 21';
        if (k === 'noiTru') sectionTitle = 'ĐIỀU TRỊ NỘI TRÚ';
        if (k === 'ngoaiTru') sectionTitle = 'ĐIỀU TRỊ NGOẠI TRÚ';
        if (k === 'keToa') sectionTitle = 'KÊ TOA & BHYT';

        const items = [];
        Object.entries(val).forEach(([subK, subV]) => {
          if (subV !== null && subV !== undefined && subV !== '' && subK !== '_id') {
            items.push({ key: subK, label: getLabel(subK), value: String(subV) });
          }
        });
        if (items.length > 0) {
          sections.push({ title: sectionTitle, items });
        }
      } else if (val !== null && val !== undefined && val !== '' && !Array.isArray(val)) {
        if (noteKeys.includes(k)) {
          sections.push({
            type: k === 'nhanSu' || k === 'dieuDuongTruc' ? 'personnel' : 'note',
            title: getLabel(k),
            value: String(val)
          });
        } else {
          let mainSec = sections.find(s => s.title === 'THÔNG TIN CHUNG' && !s.type);
          if (!mainSec) {
            mainSec = { title: 'THÔNG TIN CHUNG', items: [] };
            sections.unshift(mainSec);
          }
          mainSec.items.push({ key: k, label: getLabel(k), value: String(val) });
        }
      }
    });
  } else {
    // Flat object
    const items = [];
    const notes = [];

    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && k !== '_id' && !Array.isArray(v)) {
        if (noteKeys.includes(k) || (typeof v === 'string' && (v.length > 25 || v.includes('\n')))) {
          notes.push({
            type: k === 'nhanSu' || k === 'dieuDuongTruc' ? 'personnel' : 'note',
            title: getLabel(k),
            value: String(v)
          });
        } else {
          items.push({ key: k, label: getLabel(k), value: String(v) });
        }
      }
    });

    if (items.length > 0) {
      sections.push({ title: 'CHỈ SỐ BÁO CÁO TRONG CA TRỰC', items });
    }

    notes.forEach(n => sections.push(n));
  }

  return sections;
};
