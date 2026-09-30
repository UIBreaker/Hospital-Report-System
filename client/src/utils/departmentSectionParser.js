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
    const sumTongSo = data.tong4ck_tongSo || String((Number(data.tmh_tongSo)||0) + (Number(data.mat_tongSo)||0) + (Number(data.rhm_noi_tongSo)||0) + (Number(data.daLieu_tongSo)||0));
    const sumThuThuat = data.tong4ck_thuThuat || String((Number(data.tmh_thuThuat)||0) + (Number(data.mat_thuThuat)||0) + (Number(data.rhm_noi_thuThuat)||0));
    const sumNhapVien = data.nhapVien_tongSo || '0';
    const sumChuyenVien = data.chuyenVien_tongSo || '0';

    const tableRows = [
      {
        name: '⭐ TỔNG 4 CHUYÊN KHOA',
        tongSo: sumTongSo,
        thuThuat: sumThuThuat,
        nhapVien: sumNhapVien,
        chuyenVien: sumChuyenVien,
        isTotal: true
      },
      { name: 'Tai Mũi Họng (TMH)', tongSo: data.tmh_tongSo || '0', thuThuat: data.tmh_thuThuat || '0', nhapVien: data.nhapVien_tongSo || '0', chuyenVien: data.chuyenVien_tongSo || '0' },
      { name: 'Mắt', tongSo: data.mat_tongSo || '0', thuThuat: data.mat_thuThuat || '0', nhapVien: '0', chuyenVien: '0' },
      { name: 'Răng Hàm Mặt (RHM)', tongSo: data.rhm_noi_tongSo || '0', thuThuat: data.rhm_noi_thuThuat || '0', nhapVien: data.rhm_noiTru || '0', chuyenVien: data.rhm_ngoaiTru || '0' },
      { name: 'Da Liễu', tongSo: data.daLieu_tongSo || '0', thuThuat: '0', nhapVien: '0', chuyenVien: '0' }
    ];

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
      { name: '⭐ TỔNG CA MỔ / HIỆN CÒN HỒI TỈNH', cc: '—', ct: '—', tong: data.tongSoCaMo || '0', isTotal: true },
      { name: 'Ngoại Tổng Hợp', cc: data.cc_ngoaiTH || '0', ct: data.ct_ngoaiTH || '0', tong: String((Number(data.cc_ngoaiTH)||0) + (Number(data.ct_ngoaiTH)||0)) },
      { name: 'Chấn Thương Chỉnh Hình (CTCH)', cc: data.cc_ctch || '0', ct: data.ct_ctch || '0', tong: String((Number(data.cc_ctch)||0) + (Number(data.ct_ctch)||0)) },
      { name: 'Sản Khoa', cc: data.cc_san || '0', ct: data.ct_san || '0', tong: String((Number(data.cc_san)||0) + (Number(data.ct_san)||0)) },
      { name: 'Mổ Khác / Giảm Đau Sau Mổ', cc: data.moKhac || '0', ct: data.soCaGiamDau || '0', tong: String((Number(data.moKhac)||0) + (Number(data.soCaGiamDau)||0)) }
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
      {
        name: 'Xét Nghiệm Tổng Quát (Sinh hóa, Huyết học, Vi sinh...)',
        tongSo: data.tongSo !== undefined && data.tongSo !== '' ? String(data.tongSo) : '0',
        baoHiem: data.baoHiem !== undefined && data.baoHiem !== '' ? String(data.baoHiem) : '0',
        noiTru: data.noiTru !== undefined && data.noiTru !== '' ? String(data.noiTru) : '0',
        ngoaiTru: data.ngoaiTru !== undefined && data.ngoaiTru !== '' ? String(data.ngoaiTru) : '0'
      }
    ];

    sections.push({
      title: 'THỐNG KÊ XÉT NGHIỆM THỰC HIỆN',
      tableType: 'techniques',
      headers: ['LOẠI XÉT NGHIỆM', 'TỔNG SỐ LƯỢT', 'BẢO HIỂM (BHYT)', 'NỘI TRÚ', 'NGOẠI TRÚ'],
      rowKeys: ['name', 'tongSo', 'baoHiem', 'noiTru', 'ngoaiTru'],
      tableRows
    });

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: 'THÊM GIỜ & GHI CHÚ',
        value: data.themGio
      });
    }

    if (data.truyenMau || data.noiDungTruyenMau) {
      sections.push({
        type: 'blood_transfusion',
        title: 'NỘI DUNG TRUYỀN MÁU',
        value: data.truyenMau || data.noiDungTruyenMau
      });
    }

    return sections;
  }

  // ================= 3. CHẨN ĐOÁN HÌNH ẢNH (CDHA) =================
  if (normalizedDept === 'cdha' || (data.techniques && Array.isArray(data.techniques))) {
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

    const defaultTechNames = ['CT Scan', 'Xquang', 'Siêu âm', 'Nội soi', 'ECG', 'HHK'];
    const rawTechs = Array.isArray(data.techniques) ? data.techniques : [];
    
    // Normalize technique rows
    const tableRows = defaultTechNames.map(name => {
      const match = rawTechs.find(t => t && t.name && t.name.toLowerCase().trim() === name.toLowerCase().trim());
      return {
        name,
        tongSo: match?.tongSo !== undefined && match.tongSo !== '' ? String(match.tongSo) : '0',
        baoHiem: match?.baoHiem !== undefined && match.baoHiem !== '' ? String(match.baoHiem) : '0',
        noiTru: match?.noiTru !== undefined && match.noiTru !== '' ? String(match.noiTru) : '0',
        ngoaiTru: match?.ngoaiTru !== undefined && match.ngoaiTru !== '' ? String(match.ngoaiTru) : '0'
      };
    });

    // Add total row at the VERY TOP (index 0)
    const sumTongSo = tableRows.reduce((sum, r) => sum + (Number(r.tongSo) || 0), 0);
    const sumBHYT = tableRows.reduce((sum, r) => sum + (Number(r.baoHiem) || 0), 0);
    const sumNoiTru = tableRows.reduce((sum, r) => sum + (Number(r.noiTru) || 0), 0);
    const sumNgoaiTru = tableRows.reduce((sum, r) => sum + (Number(r.ngoaiTru) || 0), 0);

    tableRows.unshift({
      name: '⭐ TỔNG CỘNG CÁC KỸ THUẬT CDHA',
      tongSo: String(sumTongSo),
      baoHiem: String(sumBHYT),
      noiTru: String(sumNoiTru),
      ngoaiTru: String(sumNgoaiTru),
      isTotal: true
    });

    sections.push({
      title: 'THỐNG KÊ KỸ THUẬT CHẨN ĐOÁN HÌNH ẢNH',
      tableType: 'techniques',
      headers: ['KỸ THUẬT', 'TỔNG SỐ', 'BẢO HIỂM (BHYT)', 'NỘI TRÚ', 'NGOẠI TRÚ'],
      rowKeys: ['name', 'tongSo', 'baoHiem', 'noiTru', 'ngoaiTru'],
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

  // ================= 4. HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO (HSCC_TNT) =================
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

  // ================= 5. KHOA NHIỄM (NHIEM) =================
  // Thứ tự: bệnh cũ -> bệnh mới -> xuất viện -> chuyển viện -> chuyển khoa -> hiện còn điều trị
  if (normalizedDept === 'nhiem' || data.chuyenKhoaSan !== undefined || (data.xinXuatVien !== undefined && !data.hauPhau && !data.choSanh && !data.sanhThuong)) {
    if (data.dieuDuongTruc) {
      sections.push({
        type: 'personnel',
        title: 'ĐIỀU DƯỠNG TRỰC CA',
        value: data.dieuDuongTruc
      });
    }

    const nhiemMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') nhiemMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') nhiemMetrics.push({ key: 'benhMoi', label: 'Bệnh mới', value: String(data.benhMoi) });
    const xv = data.xuatVien !== undefined && data.xuatVien !== '' ? data.xuatVien : data.xinXuatVien;
    if (xv !== undefined && xv !== '') nhiemMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(xv) });
    if (data.chuyenVien !== undefined && data.chuyenVien !== '') nhiemMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(data.chuyenVien) });
    const ck = data.chuyenKhoa !== undefined && data.chuyenKhoa !== '' ? data.chuyenKhoa : data.chuyenKhoaSan;
    if (ck !== undefined && ck !== '') nhiemMetrics.push({ key: 'chuyenKhoa', label: 'Chuyển khoa', value: String(ck) });
    if (data.hienCon !== undefined && data.hienCon !== '') nhiemMetrics.push({ key: 'hienCon', label: 'Hiện còn điều trị', value: String(data.hienCon) });
    if (data.xuatVien !== undefined && data.xuatVien !== '' && data.xinXuatVien !== undefined && data.xinXuatVien !== '') {
      nhiemMetrics.push({ key: 'xinXuatVien', label: 'Xin xuất viện', value: String(data.xinXuatVien) });
    }

    if (nhiemMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ BỆNH NHÂN KHOA NHIỄM',
        items: nhiemMetrics
      });
    }

    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.1. KHOA NỘI (NOI) =================
  // Thứ tự: bệnh cũ -> bệnh mới -> xuất viện -> chuyển viện -> hiện còn
  if (normalizedDept === 'noi' || (normalizedDept.includes('noi') && !normalizedDept.includes('yhct') && !normalizedDept.includes('tru') && !normalizedDept.includes('lck') && !normalizedDept.includes('ngoai'))) {
    const noiMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') noiMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') noiMetrics.push({ key: 'benhMoi', label: 'Bệnh mới', value: String(data.benhMoi) });
    const xv = data.xuatVien !== undefined && data.xuatVien !== '' ? data.xuatVien : data.benhXuat;
    if (xv !== undefined && xv !== '') noiMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(xv) });
    const cv = data.chuyenVien !== undefined && data.chuyenVien !== '' ? data.chuyenVien : data.benhChuyenVien;
    if (cv !== undefined && cv !== '') noiMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(cv) });
    const hc = data.hienCon !== undefined && data.hienCon !== '' ? data.hienCon : data.hienCo;
    if (hc !== undefined && hc !== '') noiMetrics.push({ key: 'hienCon', label: 'Hiện còn', value: String(hc) });
    if (data.chuyenKhoa !== undefined && data.chuyenKhoa !== '') noiMetrics.push({ key: 'chuyenKhoa', label: 'Chuyển khoa', value: String(data.chuyenKhoa) });

    if (noiMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ HOẠT ĐỘNG KHOA NỘI',
        items: noiMetrics
      });
    }

    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.2. KHOA SẢN (SAN) =================
  // Thứ tự: bệnh cũ -> bệnh mới -> xuất viện -> chuyển viện -> hiện còn
  if (normalizedDept === 'san' || data.choSanh !== undefined || data.sanhThuong !== undefined || data.sanhHut !== undefined) {
    const sanMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') sanMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') sanMetrics.push({ key: 'benhMoi', label: 'Bệnh mới', value: String(data.benhMoi) });
    const xv = data.benhXuat !== undefined && data.benhXuat !== '' ? data.benhXuat : data.xuatVien;
    if (xv !== undefined && xv !== '') sanMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(xv) });
    const cv = data.benhChuyenVien !== undefined && data.benhChuyenVien !== '' ? data.benhChuyenVien : data.chuyenVien;
    if (cv !== undefined && cv !== '') sanMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(cv) });
    const hc = data.hienCo !== undefined && data.hienCo !== '' ? data.hienCo : data.hienCon;
    if (hc !== undefined && hc !== '') sanMetrics.push({ key: 'hienCon', label: 'Hiện còn', value: String(hc) });
    if (data.benhChuyenKhoa !== undefined && data.benhChuyenKhoa !== '') sanMetrics.push({ key: 'benhChuyenKhoa', label: 'Chuyển khoa', value: String(data.benhChuyenKhoa) });

    if (sanMetrics.length > 0) {
      sections.push({
        title: 'CHỈ SỐ NỘI TRÚ CHUNG',
        items: sanMetrics
      });
    }

    const sanDacThu = [];
    if (data.hauPhau !== undefined && data.hauPhau !== '') sanDacThu.push({ key: 'hauPhau', label: 'Hậu phẫu', value: String(data.hauPhau) });
    if (data.tongSoKham !== undefined && data.tongSoKham !== '') sanDacThu.push({ key: 'tongSoKham', label: 'Tổng số khám', value: String(data.tongSoKham) });
    if (data.sanhThuong !== undefined && data.sanhThuong !== '') sanDacThu.push({ key: 'sanhThuong', label: 'Sanh thường', value: String(data.sanhThuong) });
    if (data.sanhHut !== undefined && data.sanhHut !== '') sanDacThu.push({ key: 'sanhHut', label: 'Sanh hút / Giúp sinh', value: String(data.sanhHut) });
    if (data.choSanh !== undefined && data.choSanh !== '') sanDacThu.push({ key: 'choSanh', label: 'Chờ sanh', value: String(data.choSanh) });
    if (data.sieuAm !== undefined && data.sieuAm !== '') sanDacThu.push({ key: 'sieuAm', label: 'Siêu âm sản', value: String(data.sieuAm) });
    if (data.datThaoVong !== undefined && data.datThaoVong !== '') sanDacThu.push({ key: 'datThaoVong', label: 'Đặt và tháo vòng', value: String(data.datThaoVong) });
    if (data.chuyenVienNgoaiTru !== undefined && data.chuyenVienNgoaiTru !== '') sanDacThu.push({ key: 'chuyenVienNgoaiTru', label: 'Chuyển viện ngoại trú', value: String(data.chuyenVienNgoaiTru) });

    if (sanDacThu.length > 0) {
      sections.push({
        title: 'CHỈ SỐ SẢN KHOA ĐẶC THÙ',
        items: sanDacThu
      });
    }

    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.3. KHOA NHI (NHI) =================
  // Thứ tự: bệnh cũ -> bệnh mới (cấp cứu) -> bệnh mới (phòng khám) -> xuất viện -> PK -> Hiện có tại khoa
  if (normalizedDept === 'nhi' || data.benhMoi_cc !== undefined || data.benhMoi_pk !== undefined) {
    const nhiMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') nhiMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi_cc !== undefined && data.benhMoi_cc !== '') nhiMetrics.push({ key: 'benhMoi_cc', label: 'Bệnh mới (Cấp cứu)', value: String(data.benhMoi_cc) });
    if (data.benhMoi_pk !== undefined && data.benhMoi_pk !== '') nhiMetrics.push({ key: 'benhMoi_pk', label: 'Bệnh mới (Phòng khám)', value: String(data.benhMoi_pk) });
    const xv = data.xuat !== undefined && data.xuat !== '' ? data.xuat : data.xuatVien;
    if (xv !== undefined && xv !== '') nhiMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(xv) });
    if (data.pk !== undefined && data.pk !== '') {
      nhiMetrics.push({ key: 'pk', label: 'PK', value: String(data.pk) });
    }
    const hc = data.hienCo !== undefined && data.hienCo !== '' ? data.hienCo : data.hienCon;
    if (hc !== undefined && hc !== '') {
      nhiMetrics.push({ key: 'hienCo', label: 'Hiện có tại khoa', value: String(hc) });
    }
    if (data.chuyenVien !== undefined && data.chuyenVien !== '') nhiMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(data.chuyenVien) });

    if (nhiMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ HOẠT ĐỘNG KHOA NHI',
        items: nhiMetrics
      });
    }

    if (data.hienCoGhiChu) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ HIỆN CÓ TẠI KHOA',
        value: data.hienCoGhiChu
      });
    }
    if (data.pkGhiChu) {
      sections.push({
        type: 'note',
        title: 'GHI CHÚ PHÒNG KHÁM (PK)',
        value: data.pkGhiChu
      });
    }
    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.4. KHOA CHẤN THƯƠNG CHỈNH HÌNH (CTCH) =================
  // Thứ tự: bệnh cũ -> bệnh mới -> xuất viện -> chuyển viện -> hiện còn
  if (normalizedDept.includes('ctch')) {
    const ctchMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') ctchMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') ctchMetrics.push({ key: 'benhMoi', label: 'Bệnh mới', value: String(data.benhMoi) });
    const xv = data.benhXuat !== undefined && data.benhXuat !== '' ? data.benhXuat : data.xuatVien;
    if (xv !== undefined && xv !== '') ctchMetrics.push({ key: 'xuatVien', label: 'Xuất viện', value: String(xv) });
    const cv = data.benhChuyenVien !== undefined && data.benhChuyenVien !== '' ? data.benhChuyenVien : data.chuyenVien;
    if (cv !== undefined && cv !== '') ctchMetrics.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(cv) });
    const hc = data.hienCon !== undefined && data.hienCon !== '' ? data.hienCon : data.hienCo;
    if (hc !== undefined && hc !== '') ctchMetrics.push({ key: 'hienCon', label: 'Hiện còn', value: String(hc) });
    const ck = data.benhChuyenKhoa !== undefined && data.benhChuyenKhoa !== '' ? data.benhChuyenKhoa : data.chuyenKhoa;
    if (ck !== undefined && ck !== '') ctchMetrics.push({ key: 'benhChuyenKhoa', label: 'Chuyển khoa', value: String(ck) });
    if (data.tuVong !== undefined && data.tuVong !== '') ctchMetrics.push({ key: 'tuVong', label: 'Tử vong', value: String(data.tuVong) });

    if (ctchMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ BỆNH NHÂN NỘI TRÚ CTCH',
        items: ctchMetrics
      });
    }

    if (data.hienConGhiChu) sections.push({ type: 'note', title: 'GHI CHÚ HIỆN CÒN', value: data.hienConGhiChu });
    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.5. KHOA NGOẠI TỔNG HỢP (NGOAI_TH) =================
  // Thứ tự: bệnh cũ -> bệnh mới -> hậu phẫu -> bệnh xuất -> bệnh chuyển khoa -> bệnh chuyển viện -> tử vong -> hiện còn điều trị
  if (normalizedDept.includes('ngoai') && !normalizedDept.includes('yhct')) {
    const ngoaiMetrics = [];
    if (data.benhCu !== undefined && data.benhCu !== '') ngoaiMetrics.push({ key: 'benhCu', label: 'Bệnh cũ', value: String(data.benhCu) });
    if (data.benhMoi !== undefined && data.benhMoi !== '') ngoaiMetrics.push({ key: 'benhMoi', label: 'Bệnh mới', value: String(data.benhMoi) });
    if (data.hauPhau !== undefined && data.hauPhau !== '') ngoaiMetrics.push({ key: 'hauPhau', label: 'Hậu phẫu', value: String(data.hauPhau) });
    const xv = data.benhXuat !== undefined && data.benhXuat !== '' ? data.benhXuat : data.xuatVien;
    if (xv !== undefined && xv !== '') ngoaiMetrics.push({ key: 'benhXuat', label: 'Bệnh xuất', value: String(xv) });
    const ck = data.benhChuyenKhoa !== undefined && data.benhChuyenKhoa !== '' ? data.benhChuyenKhoa : data.chuyenKhoa;
    if (ck !== undefined && ck !== '') ngoaiMetrics.push({ key: 'benhChuyenKhoa', label: 'Bệnh chuyển khoa', value: String(ck) });
    const cv = data.benhChuyenVien !== undefined && data.benhChuyenVien !== '' ? data.benhChuyenVien : data.chuyenVien;
    if (cv !== undefined && cv !== '') ngoaiMetrics.push({ key: 'benhChuyenVien', label: 'Bệnh chuyển viện', value: String(cv) });
    if (data.tuVong !== undefined && data.tuVong !== '') ngoaiMetrics.push({ key: 'tuVong', label: 'Tử vong', value: String(data.tuVong) });
    const hc = data.hienCon !== undefined && data.hienCon !== '' ? data.hienCon : data.hienCo;
    if (hc !== undefined && hc !== '') ngoaiMetrics.push({ key: 'hienCon', label: 'Hiện còn điều trị', value: String(hc) });
    if (data.tongSoKham !== undefined && data.tongSoKham !== '') ngoaiMetrics.push({ key: 'tongSoKham', label: 'Tổng số khám bệnh', value: String(data.tongSoKham) });

    if (ngoaiMetrics.length > 0) {
      sections.push({
        title: 'THỐNG KÊ HOẠT ĐỘNG KHOA NGOẠI TỔNG HỢP',
        items: ngoaiMetrics
      });
    }

    if (data.themGio) sections.push({ type: 'note', title: 'THÊM GIỜ & GHI CHÚ', value: data.themGio });
    if (data.tinhHinhChung) sections.push({ type: 'note', title: 'TÌNH HÌNH CHUNG CA TRỰC', value: data.tinhHinhChung });
    return sections;
  }

  // ================= 5.5. Y HỌC CỔ TRUYỀN – PHỤC HỒI CHỨC NĂNG (YHCT_PHCN) =================
  if (normalizedDept === 'yhct_phcn' || (data.noiTru && data.ngoaiTru && data.keToa)) {
    // 1. Khối Điều Trị Nội Trú
    if (data.noiTru && typeof data.noiTru === 'object') {
      const noiTruItems = [];
      if (data.noiTru.benhCu !== undefined && data.noiTru.benhCu !== '') noiTruItems.push({ key: 'benhCu', label: 'Bệnh cũ điều trị', value: String(data.noiTru.benhCu) });
      if (data.noiTru.benhMoi !== undefined && data.noiTru.benhMoi !== '') noiTruItems.push({ key: 'benhMoi', label: 'Bệnh mới nhập viện', value: String(data.noiTru.benhMoi) });
      if ((data.noiTru.xuat || data.noiTru.xuatVien) !== undefined && (data.noiTru.xuat || data.noiTru.xuatVien) !== '') noiTruItems.push({ key: 'xuatVien', label: 'Xuất viện', value: String(data.noiTru.xuat || data.noiTru.xuatVien) });
      if (data.noiTru.hienCon !== undefined && data.noiTru.hienCon !== '') noiTruItems.push({ key: 'hienCon', label: 'Hiện còn nội trú', value: String(data.noiTru.hienCon) });
      if (data.noiTru.chuyenVien !== undefined && data.noiTru.chuyenVien !== '') noiTruItems.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(data.noiTru.chuyenVien) });
      if (data.noiTru.tuVong !== undefined && data.noiTru.tuVong !== '') noiTruItems.push({ key: 'tuVong', label: 'Tử vong', value: String(data.noiTru.tuVong) });

      if (noiTruItems.length > 0) {
        sections.push({
          title: 'KHỐI ĐIỀU TRỊ NỘI TRÚ',
          items: noiTruItems
        });
      }
    }

    // 2. Khối Điều Trị Ngoại Trú
    if (data.ngoaiTru && typeof data.ngoaiTru === 'object') {
      const ngoaiTruItems = [];
      if (data.ngoaiTru.benhCu !== undefined && data.ngoaiTru.benhCu !== '') ngoaiTruItems.push({ key: 'benhCu', label: 'Bệnh cũ điều trị', value: String(data.ngoaiTru.benhCu) });
      if (data.ngoaiTru.benhMoi !== undefined && data.ngoaiTru.benhMoi !== '') ngoaiTruItems.push({ key: 'benhMoi', label: 'Bệnh mới tiếp nhận', value: String(data.ngoaiTru.benhMoi) });
      if ((data.ngoaiTru.xuat || data.ngoaiTru.xuatVien) !== undefined && (data.ngoaiTru.xuat || data.ngoaiTru.xuatVien) !== '') ngoaiTruItems.push({ key: 'xuatVien', label: 'Hoàn thành điều trị', value: String(data.ngoaiTru.xuat || data.ngoaiTru.xuatVien) });
      if (data.ngoaiTru.hienCon !== undefined && data.ngoaiTru.hienCon !== '') ngoaiTruItems.push({ key: 'hienCon', label: 'Hiện còn ngoại trú', value: String(data.ngoaiTru.hienCon) });
      if (data.ngoaiTru.chuyenVien !== undefined && data.ngoaiTru.chuyenVien !== '') ngoaiTruItems.push({ key: 'chuyenVien', label: 'Chuyển viện', value: String(data.ngoaiTru.chuyenVien) });

      if (ngoaiTruItems.length > 0) {
        sections.push({
          title: 'KHỐI ĐIỀU TRỊ NGOẠI TRÚ',
          items: ngoaiTruItems
        });
      }
    }

    // 3. Khối Kê Toa & BHYT
    if (data.keToa && typeof data.keToa === 'object') {
      const keToaItems = [];
      if (data.keToa.tongSo !== undefined && data.keToa.tongSo !== '') keToaItems.push({ key: 'tongSo', label: 'Tổng số lượt kê toa (TS)', value: String(data.keToa.tongSo) });
      if (data.keToa.bhyt !== undefined && data.keToa.bhyt !== '') keToaItems.push({ key: 'bhyt', label: 'Kê toa Bảo hiểm y tế (BHYT)', value: String(data.keToa.bhyt) });
      if (data.keToa.dichVu !== undefined && data.keToa.dichVu !== '') keToaItems.push({ key: 'dichVu', label: 'Kê toa Dịch vụ / Viện phí', value: String(data.keToa.dichVu) });

      if (keToaItems.length > 0) {
        sections.push({
          title: 'KÊ TOA & BẢO HIỂM Y TẾ',
          items: keToaItems
        });
      }
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

  const noteKeys = ['themGio', 'tinhHinhChung', 'ghiChu', 'hienConGhiChu', 'hienCoGhiChu', 'chuyenVienTT', 'nhanSu', 'dieuDuongTruc', 'truyenMau', 'noiDungTruyenMau'];

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
