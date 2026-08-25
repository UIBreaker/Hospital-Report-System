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
    const tableRows = [
      { name: 'Tai Mũi Họng (TMH)', tongSo: data.tmh_tongSo || '0', thuThuat: data.tmh_thuThuat || '0', nhapVien: data.nhapVien_tongSo || '0', chuyenVien: data.chuyenVien_tongSo || '0' },
      { name: 'Mắt', tongSo: data.mat_tongSo || '0', thuThuat: data.mat_thuThuat || '0', nhapVien: '0', chuyenVien: '0' },
      { name: 'Răng Hàm Mặt (RHM)', tongSo: data.rhm_noi_tongSo || '0', thuThuat: data.rhm_noi_thuThuat || '0', nhapVien: data.rhm_noiTru || '0', chuyenVien: data.rhm_ngoaiTru || '0' },
      { name: 'Da Liễu', tongSo: data.daLieu_tongSo || '0', thuThuat: '0', nhapVien: '0', chuyenVien: '0' },
    ];

    if (data.tong4ck_tongSo || data.tong4ck_thuThuat) {
      tableRows.push({
        name: '⭐ TỔNG 4 CHUYÊN KHOA',
        tongSo: data.tong4ck_tongSo || '0',
        thuThuat: data.tong4ck_thuThuat || '0',
        nhapVien: data.nhapVien_tongSo || '0',
        chuyenVien: data.chuyenVien_tongSo || '0',
        isTotal: true
      });
    }

    sections.push({
      title: 'THỐNG KÊ HOẠT ĐỘNG 4 CHUYÊN KHOA (TMH - MẮT - RHM - DA LIỄU)',
      tableType: 'custom_table',
      headers: ['CHUYÊN KHOA', 'TỔNG SỐ KHÁM', 'THỦ THUẬT', 'NHẬP VIỆN', 'CHUYỂN VIỆN'],
      rowKeys: ['name', 'tongSo', 'thuThuat', 'nhapVien', 'chuyenVien'],
      tableRows
    });

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'THÊM GIỜ & GHI CHÚ',
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

    const tableRows = [
      { name: 'Ngoại Tổng Hợp', cc: data.cc_ngoaiTH || '0', ct: data.ct_ngoaiTH || '0', tong: String((Number(data.cc_ngoaiTH)||0) + (Number(data.ct_ngoaiTH)||0)) },
      { name: 'Chấn Thương Chỉnh Hình (CTCH)', cc: data.cc_ctch || '0', ct: data.ct_ctch || '0', tong: String((Number(data.cc_ctch)||0) + (Number(data.ct_ctch)||0)) },
      { name: 'Sản Khoa', cc: data.cc_san || '0', ct: data.ct_san || '0', tong: String((Number(data.cc_san)||0) + (Number(data.ct_san)||0)) },
      { name: 'Mổ Khác / Giảm Đau Sau Mổ', cc: data.moKhac || '0', ct: data.soCaGiamDau || '0', tong: String((Number(data.moKhac)||0) + (Number(data.soCaGiamDau)||0)) },
      { name: '⭐ TỔNG CA MỔ / HIỆN CÒN HỒI TỈNH', cc: '—', ct: '—', tong: data.tongSoCaMo || '0', isTotal: true }
    ];

    sections.push({
      title: 'THỐNG KÊ CA PHẪU THUẬT & THEO DÕI HỒI TỈNH',
      tableType: 'custom_table',
      headers: ['CHUYÊN KHOA PHẪU THUẬT', 'MỔ CẤP CỨU', 'MỔ KẾ HOẠCH', 'TỔNG SỐ CA'],
      rowKeys: ['name', 'cc', 'ct', 'tong'],
      tableRows
    });

    if (data.hienCon) {
      sections.push({
        type: 'note',
        title: 'HIỆN CÒN THEO DÕI TẠI HỒI TỈNH',
        value: String(data.hienCon) + ' ca'
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

  // ================= 2. XÉT NGHIỆM (XN) =================
  if (normalizedDept === 'xn' || (data.tongSo !== undefined && (data.baoHiem !== undefined || data.noiTru !== undefined) && !data.techniques)) {
    const tableRows = [
      { name: 'Xét Nghiệm Tổng Quát (Sinh hóa, Huyết học, Vi sinh...)', tongSo: data.tongSo || '0', baoHiem: data.baoHiem || '0', noiTru: data.noiTru || '0', ngoaiTru: data.ngoaiTru || '0' }
    ];

    sections.push({
      title: 'THỐNG KÊ XÉT NGHIỆM THỰC HIỆN',
      tableType: 'techniques',
      headers: ['LOẠI XÉT NGHIỆM', 'TỔNG SỐ LƯỢT', 'BẢO HIỂM (BHYT)', 'NỘI TRÚ', 'NGOẠI TRÚ'],
      tableRows
    });

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'THÊM GIỜ & GHI CHÚ',
        value: data.themGio
      });
    }

    return sections;
  }

  // ================= 3. HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO (HSCC_TNT) =================
  if (normalizedDept === 'hscc_tnt' || (data.hscc && data.tnt)) {
    // 1. TỔNG SỐ KHÁM
    const tongKhamItems = [];
    const hsccKham = data.hscc?.tongSoKham || data.hscc?.tongSo || '';
    const tntKham = data.tnt?.tongSoKham || data.tnt?.tongSo || data.tnt?.tnt_ctdk || data.tnt?.ctdk || '';
    const pk21Kham = data.pk21?.pk21_tongSo || data.pk21?.pk21_tongSoKham || data.pk21?.tongSo || '';

    if (hsccKham !== '') tongKhamItems.push({ key: 'tongSoKham_hscc', label: 'Khám Cấp cứu (HSCC)', value: String(hsccKham) });
    if (tntKham !== '') tongKhamItems.push({ key: 'tongSoKham_tnt', label: 'Khám / Chạy thận (TNT)', value: String(tntKham) });
    if (pk21Kham !== '') tongKhamItems.push({ key: 'tongSoKham_pk21', label: 'Khám Phòng Khám 21', value: String(pk21Kham) });

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
        title: 'THÊM GIỜ & GHI CHÚ',
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
    if (data.xuatVien !== undefined && data.xuatVien !== '') nhiemMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(data.xuatVien) });
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
        title: 'THÊM GIỜ & GHI CHÚ',
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
