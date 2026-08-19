import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaAmbulance, FaArrowLeft, FaSearchPlus, FaSearchMinus, FaHeartbeat, FaProcedures, FaExclamationTriangle, FaFilePowerpoint, FaImages } from 'react-icons/fa';
import reportService from '../services/reportService';
import { exportPresentationToPowerPoint } from '../services/powerpointExportService';
import ImageLightboxModal from '../components/common/ImageLightboxModal';
import { normalizeImages } from '../utils/imageUtils';

const DEPARTMENT_DISPLAY_NAMES = {
  lck: 'KHOA LIÊN CHUYÊN KHOA',
  xn: 'XÉT NGHIỆM',
  cdha: 'CHẨN ĐOÁN HÌNH ẢNH',
  hscc_tnt: 'HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO',
  noi: 'KHOA NỘI',
  nhi: 'NHI',
  nhiem: 'NHIỄM',
  san: 'SẢN',
  yhct_phcn: 'Y HỌC CỔ TRUYỀN – PHCN',
  ngoai_th: 'NGOẠI TỔNG HỢP',
  ctch: 'CHẤN THƯƠNG CHỈNH HÌNH',
  gmhs: 'GÂY MÊ HỒI SỨC',
};

// Vietnamese label map for presentation display
const FIELD_LABELS = {
  // Khoa Liên Chuyên Khoa
  tmh_tongSo: 'Tai Mũi Họng (Tổng số khám)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng số khám)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'Răng Hàm Mặt (Tổng số khám)',
  rhm_noi_thuThuat: 'Răng Hàm Mặt (Thủ thuật)',
  daLieu_tongSo: 'Da liễu (Tổng số khám)',
  nhapVien_tongSo: 'Số ca nhập viện',
  chuyenVien_tongSo: 'Số ca chuyển viện',
  tong4ck_tongSo: 'TỔNG SỐ 4 CHUYÊN KHOA',
  tong4ck_thuThuat: 'TỔNG THỦ THUẬT 4CK',

  // Common metrics
  benhCu: 'Bệnh cũ (Đang điều trị)', benhMoi: 'Bệnh mới nhập viện', benhXuat: 'Bệnh xuất viện',
  benhChuyenVien: 'Bệnh chuyển viện', benhChuyenKhoa: 'Bệnh chuyển khoa',
  hienCon: 'Hiện còn điều trị', hienCo: 'Hiện có tại khoa', tuVong: 'Tử vong',
  xuatVien: 'Xuất viện', xuat: 'Xuất viện', chuyenVien: 'Chuyển viện', chuyenKhoa: 'Chuyển khoa',
  tongSoKham: 'Tổng số lượt khám', hauPhau: 'Hậu phẫu',
  tongSo: 'Tổng số lượt thực hiện', baoHiem: 'Bảo hiểm y tế (BHYT)',
  noiTru: 'Bệnh nhân Nội trú', ngoaiTru: 'Bệnh nhân Ngoại trú',

  // Khoa Sản
  sanhThuong: 'Sanh thường', sanhHut: 'Sanh hút', choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm', chuyenVienNgoaiTru: 'Chuyển viện ngoại trú', moLayThai: 'Mổ lấy thai',

  // HSCC - TNT - PK21
  tongSoKham_tongCong: 'TỔNG SỐ KHÁM TOÀN KHOA',
  tongSoKham_hscc: 'Khám Cấp cứu (HSCC)',
  tongSoKham_tnt: 'Khám / Chạy thận (TNT)',
  tongSoKham_pk21: 'Khám Phòng Khám 21',
  keToa: 'Kê toa', truyenMau: 'Truyền máu', tieuPhau: 'Tiểu phẫu', boBot: 'Bó bột',
  ccNgoaiVien: 'Cấp cứu ngoại viện', bsTrucTNT: 'Bác sĩ trực TNT',
  tnt_benhCu: 'Bệnh cũ (TNT)', tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)', tnt_chuyenVien: 'Chuyển viện (TNT)',
  tnt_chuyenKhoa: 'Chuyển khoa (TNT)', tnt_hienCon: 'Hiện còn (TNT)',
  tnt_ctdk: 'Chạy thận định kỳ', tnt_noiTru: 'Nội trú (TNT)',
  pk21_tongSo: 'Tổng số khám (PK21)', pk21_tongSoKham: 'Tổng số khám (PK21)',
  pk21_ngoaiTru: 'Ngoại trú (PK21)', pk21_nhapVien: 'Nhập viện (PK21)',
  pk21_chuyenVien: 'Chuyển viện (PK21)',

  // YHCT - PHCN
  dieuTriPhcn: 'Điều trị PHCN', phcn_benhCu: 'Bệnh cũ (PHCN)',
  phcn_benhMoi: 'Bệnh mới (PHCN)', phcn_xuatVien: 'Xuất viện (PHCN)',
  phcn_hienCon: 'Hiện còn (PHCN)',

  // Ngoại TH / CTCH / GMHS
  daiPhau: 'Đại phẫu', trungPhau: 'Trung phẫu',
  hauPhauNghiNgo: 'Hậu phẫu nghi ngờ', chuyenVienTT: 'Chuyển viện tuyến trên',
  tongSoCaMo: 'Tổng số ca phẫu thuật (Mổ)',
  cc_ctch: 'Chấn thương chỉnh hình', cc_ngoaiTH: 'Ngoại tổng hợp', cc_san: 'Sản khoa',
  ct_ctch: 'Chấn thương chỉnh hình', ct_ngoaiTH: 'Ngoại tổng hợp', ct_san: 'Sản khoa',
  phauThuat: 'Phẫu thuật', gayTe: 'Gây tê', gayMe: 'Gây mê',

  // Khoa Nhi
  benhMoi_pk: 'Bệnh mới (Phòng khám)', benhMoi_cc: 'Bệnh mới (Cấp cứu)',

  // Khoa Nhiễm
  chuyenKhoaSan: 'Chuyển khoa Sản', xinXuatVien: 'Xin xuất viện',

  // Khoa Xét Nghiệm / CĐHA
  tongXetNghiem: 'Tổng số xét nghiệm', sinhHoa: 'Sinh hóa', huyetHoc: 'Huyết học',
  dongMau: 'Đông máu', nuocTieu: 'Nước tiểu', mienDich: 'Miễn dịch',
  xQuang: 'X-Quang', ctScanner: 'CT-Scanner', dienTim: 'Điện tim',

  // Personnel & Notes
  nhanSu: 'Thành phần nhân sự ca trực',
  dieuDuongTruc: 'Điều dưỡng trực ca',
  themGio: 'Diễn biến thêm giờ / Ca trực',
  tinhHinhChung: 'Tình hình chung ca trực',
  hienCoGhiChu: 'Ghi chú hiện có',
  hienConGhiChu: 'Ghi chú hiện còn',
};

const getLabel = (key) => {
  return FIELD_LABELS[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Clean and format patient age (avoids duplicate "tuổi, tuổi" and trailing punctuation)
const formatPatientAge = (ageVal) => {
  if (!ageVal) return '';
  const str = String(ageVal).trim();
  const clean = str.replace(/tuổi/gi, '').replace(/,/g, '').replace(/\./g, '').trim();
  return clean ? `${clean} tuổi` : '';
};


// Classify metric severity for smart visual styling
const getMetricStyle = (key, value) => {
  const numVal = Number(value);
  const isPositive = !isNaN(numVal) && numVal > 0;

  // Highlight all mortality (Tử vong) in alert red
  if (key.toLowerCase().includes('tuvong') || key.toLowerCase().includes('tu_vong') || key.toLowerCase().includes('tử vong')) {
    return isPositive
      ? { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626', label: '#991B1B', badge: '🚨 TỬ VONG' }
      : { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', label: '#B91C1C', badge: '' };
  }
  if (key.toLowerCase().includes('chuyenvien') || key.toLowerCase().includes('chuyen_vien')) {
    return isPositive
      ? { bg: '#FEF3C7', border: '#D97706', text: '#B45309', label: '#92400E' }
      : { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B', label: '#475569' };
  }
  if (key === 'tongSoKham_tongCong' || key === 'tong4ck_tongSo') {
    return { bg: '#DBEAFE', border: '#1D4ED8', text: '#1E3A8A', label: '#1E40AF', badge: '⭐ TỔNG CỘNG' };
  }
  if (key.toLowerCase().includes('benhmoi') || key.toLowerCase().includes('tongso') || key.toLowerCase().includes('tong_so') || key.toLowerCase().includes('tongsoca') || key.toLowerCase().includes('tong4ck')) {
    return { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', label: '#1E40AF' };
  }
  if (key.toLowerCase().includes('xuatvien') || key.toLowerCase().includes('xuat_vien') || key.toLowerCase().includes('xinxuatvien') || key === 'xuat') {
    return { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', label: '#166534' };
  }
  if (key.toLowerCase().includes('hiencon') || key.toLowerCase().includes('hien_con') || key.toLowerCase().includes('hienco') || key.toLowerCase().includes('hien_co')) {
    return { bg: '#FAF5FF', border: '#A855F7', text: '#7E22CE', label: '#6B21A8' };
  }
  return { bg: '#FFFFFF', border: '#E2E8F0', text: '#0F2C59', label: '#334155' };
};

// Parse structured sections from any department data
const parseDepartmentSections = (reportData, deptCode = '') => {
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
    // Top summary: TỔNG SỐ 4 CHUYÊN KHOA
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

    // Detail by specialties
    const detailMetrics = [];
    if (data.tmh_tongSo !== undefined && data.tmh_tongSo !== '') detailMetrics.push({ key: 'tmh_tongSo', label: '👂 Tai Mũi Họng (Tổng số)', value: String(data.tmh_tongSo) });
    if (data.tmh_thuThuat !== undefined && data.tmh_thuThuat !== '') detailMetrics.push({ key: 'tmh_thuThuat', label: '👂 Tai Mũi Họng (Thủ thuật)', value: String(data.tmh_thuThuat) });
    if (data.mat_tongSo !== undefined && data.mat_tongSo !== '') detailMetrics.push({ key: 'mat_tongSo', label: '👁️ Mắt (Tổng số)', value: String(data.mat_tongSo) });
    if (data.mat_thuThuat !== undefined && data.mat_thuThuat !== '') detailMetrics.push({ key: 'mat_thuThuat', label: '👁️ Mắt (Thủ thuật)', value: String(data.mat_thuThuat) });
    if (data.rhm_noi_tongSo !== undefined && data.rhm_noi_tongSo !== '') detailMetrics.push({ key: 'rhm_noi_tongSo', label: '🦷 Răng Hàm Mặt (Tổng số)', value: String(data.rhm_noi_tongSo) });
    if (data.rhm_noi_thuThuat !== undefined && data.rhm_noi_thuThuat !== '') detailMetrics.push({ key: 'rhm_noi_thuThuat', label: '🦷 Răng Hàm Mặt (Thủ thuật)', value: String(data.rhm_noi_thuThuat) });
    if (data.daLieu_tongSo !== undefined && data.daLieu_tongSo !== '') detailMetrics.push({ key: 'daLieu_tongSo', label: '🩺 Da Liễu (Tổng số)', value: String(data.daLieu_tongSo) });
    if (data.nhapVien_tongSo !== undefined && data.nhapVien_tongSo !== '') detailMetrics.push({ key: 'nhapVien_tongSo', label: '🏥 Nhập viện', value: String(data.nhapVien_tongSo) });
    if (data.chuyenVien_tongSo !== undefined && data.chuyenVien_tongSo !== '') detailMetrics.push({ key: 'chuyenVien_tongSo', label: '🚑 Chuyển viện', value: String(data.chuyenVien_tongSo) });

    if (detailMetrics.length > 0) {
      sections.push({
        title: '📋 CHI TIẾT THEO TỪNG PHÒNG CHUYÊN KHOA',
        items: detailMetrics
      });
    }

    if (data.themGio) {
      sections.push({
        type: 'note',
        title: '📝 GHI CHÚ THÊM GIỜ & DIỄN BIẾN CA TRỰC',
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

    // Tự động tính tổng cộng toàn khoa nếu có ít nhất 2 khối có số liệu
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

    // 2. KHỐI HỒI SỨC CẤP CỨU (HSCC) — Bố cục chuẩn: Bệnh cũ -> Bệnh mới -> Xuất viện -> Chuyển viện -> Chuyển khoa -> Hiện còn
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

    // 3. KHỐI THẬN NHÂN TẠO (TNT) — Bố cục chuẩn: Bệnh cũ -> Bệnh mới -> Xuất viện -> Chuyển viện -> Chuyển khoa -> Hiện còn
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

  // Đảm bảo thứ tự ưu tiên các khối khi duyệt tự động (HSCC luôn đứng trước TNT)
  const SECTION_PRIORITY = ['hscc', 'tnt', 'pk21', 'noiTru', 'ngoaiTru', 'keToa', 'khamBenh', 'dieuTri'];
  topKeys.sort((a, b) => {
    const idxA = SECTION_PRIORITY.indexOf(a);
    const idxB = SECTION_PRIORITY.indexOf(b);
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

// Slide Image Gallery Helper for high-visibility clinical presentation
const SlideImageGallery = ({ images, patientName, themeColor = '#2563EB', onOpen }) => {
  const norm = normalizeImages(images);
  if (norm.length === 0) return null;

  return (
    <div style={{
      marginTop: '1.25rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      border: `2px solid ${themeColor}33`,
      borderLeft: `8px solid ${themeColor}`,
      padding: '1rem 1.25rem',
      boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: themeColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaImages style={{ fontSize: '1.2rem' }} />
          <span>HÌNH ẢNH Y KHOA MINH HỌA ({norm.length} ảnh)</span>
        </div>
        <button
          onClick={() => onOpen(norm, 0, patientName ? `Ảnh bệnh nhân: ${patientName}` : 'Hình ảnh y khoa')}
          style={{
            backgroundColor: themeColor,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0.4rem 0.9rem',
            fontSize: '0.85rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <FaExpand /> Phóng to trình chiếu (HD Lightbox)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {norm.map((img, idx) => {
          const url = typeof img === 'string' ? img : img.url;
          const name = typeof img === 'object' ? (img.name || `Ảnh ${idx + 1}`) : `Ảnh ${idx + 1}`;
          return (
            <div
              key={idx}
              onClick={() => onOpen(norm, idx, patientName ? `Ảnh bệnh nhân: ${patientName}` : 'Hình ảnh y khoa')}
              style={{
                position: 'relative',
                width: '140px',
                height: '105px',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                flexShrink: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: '#0F172A'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
              }}
              title="Nhấp để phóng to toàn màn hình"
            >
              <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                textAlign: 'center',
                padding: '3px 4px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}>
                <FaExpand style={{ fontSize: '0.65rem' }} /> #{idx + 1} Phóng to
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100% default standard presentation scale

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const activeThumbRef = useRef(null);

  const handleOpenLightbox = (images, index = 0, title = 'Hình ảnh y khoa') => {
    const norm = normalizeImages(images);
    if (norm.length > 0) {
      setLightboxImages(norm);
      setLightboxIndex(index);
      setLightboxTitle(title);
      setLightboxOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await reportService.getPresentationData(date);
        setReports(response.data || []);
      } catch (err) {
        console.error('Failed to load presentation data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // Smooth scroll active slide into view in sidebar
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentSlide]);

  // Reset scroll container to top whenever slide changes (Fixed scroll stuck bug)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSlide]);

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

  // Build slides with official 12-department order & split transfer case slides
  const slides = useMemo(() => {
    const s = [{ type: 'title', title: 'BÁO CÁO GIAO BAN' }];

    // Sort reports strictly according to the 12-department sequence
    const sortedReports = [...reports].sort((a, b) => {
      const idxA = DEPARTMENT_ORDER.indexOf(a.department_code);
      const idxB = DEPARTMENT_ORDER.indexOf(b.department_code);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    sortedReports.forEach(report => {
      const deptName = DEPARTMENT_DISPLAY_NAMES[report.department_code] || report.department_name || report.department_code;
      s.push({ type: 'department', title: deptName, report });

      // Slide Ca Phẫu Thuật (Bệnh Mổ)
      if (report.surgeryCases && report.surgeryCases.length > 0) {
        report.surgeryCases.forEach((sc, idx) => {
          s.push({
            type: 'surgery',
            title: `CA PHẪU THUẬT – ${deptName}`,
            surgeryCase: sc,
            caseIndex: idx + 1,
            totalCases: report.surgeryCases.length,
            deptName,
            report
          });

          // Tạo riêng mỗi ảnh đính kèm thành 1 slide trình chiếu riêng biệt
          const scImgs = normalizeImages(sc.images);
          scImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'surgery',
              title: `HÌNH ẢNH CA PHẪU THUẬT – ${deptName}`,
              caseItem: sc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.surgeryCases.length,
              imgIndex: imgIdx + 1,
              totalImages: scImgs.length,
              themeColor: '#0284C7',
              deptName,
              report
            });
          });
        });
      }

      // Slide Ca Tử Vong (Cảnh Báo Đỏ)
      if (report.deathCases && report.deathCases.length > 0) {
        report.deathCases.forEach((dc, idx) => {
          s.push({
            type: 'death',
            title: `BÁO CÁO TỬ VONG – ${deptName}`,
            deathCase: dc,
            caseIndex: idx + 1,
            totalCases: report.deathCases.length,
            deptName,
            report
          });

          // Tạo riêng mỗi ảnh đính kèm thành 1 slide trình chiếu riêng biệt
          const dcImgs = normalizeImages(dc.images);
          dcImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'death',
              title: `HÌNH ẢNH HỒ SƠ TỬ VONG – ${deptName}`,
              caseItem: dc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.deathCases.length,
              imgIndex: imgIdx + 1,
              totalImages: dcImgs.length,
              themeColor: '#DC2626',
              deptName,
              report
            });
          });
        });
      }

      // Slide Ca Chuyển Viện (Phần 1 & Phần 2 + Slide Từng Ảnh Riêng)
      if (report.transferCases && report.transferCases.length > 0) {
        report.transferCases.forEach((tc, idx) => {
          // Slide Part 1: Tiếp nhận, lâm sàng & xử trí ban đầu
          s.push({
            type: 'transfer',
            part: 1,
            title: `CA CHUYỂN VIỆN – ${deptName}`,
            transferCase: tc,
            caseIndex: idx + 1,
            totalCases: report.transferCases.length,
            deptName,
            report,
          });

          // Slide Part 2: Tách riêng Diễn biến, Hội chẩn & Tình trạng lúc chuyển viện
          s.push({
            type: 'transfer_progress',
            part: 2,
            title: `DIỄN BIẾN CHUYỂN VIỆN – ${deptName}`,
            transferCase: tc,
            caseIndex: idx + 1,
            totalCases: report.transferCases.length,
            deptName,
            report,
          });

          // Tạo riêng mỗi ảnh đính kèm thành 1 slide trình chiếu riêng biệt
          const tcImgs = normalizeImages(tc.images);
          tcImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'transfer',
              title: `HÌNH ẢNH CA CHUYỂN VIỆN – ${deptName}`,
              caseItem: tc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.transferCases.length,
              imgIndex: imgIdx + 1,
              totalImages: tcImgs.length,
              themeColor: '#D97706',
              deptName,
              report
            });
          });
        });
      }

      // Slide Ca Bệnh Nặng Theo Dõi (Deep Purple Theme + Slide Từng Ảnh Riêng)
      if (report.criticalCases && report.criticalCases.length > 0) {
        report.criticalCases.forEach((cc, idx) => {
          s.push({
            type: 'critical',
            title: `BỆNH NẶNG THEO DÕI – ${deptName}`,
            criticalCase: cc,
            caseIndex: idx + 1,
            totalCases: report.criticalCases.length,
            deptName,
            report
          });

          // Tạo riêng mỗi ảnh đính kèm thành 1 slide trình chiếu riêng biệt
          const ccImgs = normalizeImages(cc.images);
          ccImgs.forEach((img, imgIdx) => {
            s.push({
              type: 'case_image',
              caseType: 'critical',
              title: `HÌNH ẢNH BỆNH NẶNG – ${deptName}`,
              caseItem: cc,
              image: img,
              caseIndex: idx + 1,
              totalCases: report.criticalCases.length,
              imgIndex: imgIdx + 1,
              totalImages: ccImgs.length,
              themeColor: '#7C3AED',
              deptName,
              report
            });
          });
        });
      }
    });
    return s;
  }, [reports]);

  const lastNavTimeRef = useRef(0);

  const handleNext = () => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 60) return;
    lastNavTimeRef.current = now;
    if (currentSlide < slides.length - 1) {
      setSlideDirection('next');
      setCurrentSlide(p => p + 1);
    }
  };

  const handlePrev = () => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 60) return;
    lastNavTimeRef.current = now;
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(p => p - 1);
    }
  };

  const handleGoToSlide = (idx) => {
    if (idx === currentSlide) return;
    setSlideDirection(idx > currentSlide ? 'next' : 'prev');
    setCurrentSlide(idx);
  };

  const [exportingPptx, setExportingPptx] = useState(false);

  const handleExportPowerPoint = async () => {
    setExportingPptx(true);
    try {
      await exportPresentationToPowerPoint(slides, date, reports);
    } catch (err) {
      console.error('PowerPoint Export Error:', err);
      alert('Không thể xuất file PowerPoint: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setExportingPptx(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleExit = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    navigate('/admin');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'Escape' && !document.fullscreenElement) handleExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B192C', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="spinner" style={{ fontSize: '3.5rem', marginBottom: '1.25rem', color: '#3B82F6' }} />
          <p style={{ fontSize: '1.3rem', fontWeight: '600', opacity: 0.9 }}>Đang tải dữ liệu trình chiếu giao ban...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];
  const progressPct = slides.length > 1 ? (currentSlide / (slides.length - 1)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="presentation-shell"
      style={{
        display: 'flex', height: '100vh', width: '100vw',
        backgroundColor: '#071224', color: '#1E293B',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ===================== SIDEBAR ===================== */}
      {!isFullscreen && (
        <div className="no-print presentation-sidebar" style={{
          width: '280px', backgroundColor: '#0F172A',
          borderRight: '1px solid #1E293B',
          display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          {/* Sidebar top action bar */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #1E293B' }}>
            <button
              onClick={handleExit}
              style={{
                width: '100%', padding: '0.65rem 1rem',
                backgroundColor: '#1E293B', color: '#F8FAFC',
                border: '1px solid #334155', borderRadius: '8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                fontSize: '0.9rem', fontWeight: '700', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
            >
              <FaArrowLeft /> Về Bảng Điều Khiển
            </button>
          </div>

          {/* Sidebar header info */}
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '38px', height: '38px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px' }}>TRÌNH CHIẾU GIAO BAN</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{slides.length} slide • {date}</div>
            </div>
          </div>

          {/* Slide list */}
          <div className="pres-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
            {slides.map((s, i) => {
              const isActive = currentSlide === i;
              return (
                <button
                  key={i}
                  ref={isActive ? activeThumbRef : null}
                  onClick={() => handleGoToSlide(i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '0.65rem 0.85rem', marginBottom: '4px',
                    backgroundColor: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1E293B'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: '800'
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {s.type === 'title' ? '🏥 Trang bìa giao ban'
                      : s.type === 'surgery' ? `🔪 Mổ (Ca ${s.caseIndex} - ${s.deptName})`
                      : s.type === 'death' ? `🚨 Tử Vong (Ca ${s.caseIndex} - ${s.deptName})`
                      : s.type === 'critical' ? `⚡ Nặng (Ca ${s.caseIndex} - ${s.deptName})`
                      : s.type === 'transfer' ? `🚑 CV (Ca ${s.caseIndex} - P1: Tiếp nhận)`
                      : s.type === 'transfer_progress' ? `📝 CV (Ca ${s.caseIndex} - P2: Diễn biến)`
                      : `📋 ${s.title}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar footer tools */}
          <div style={{ padding: '0.85rem 0.9rem', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#0B132B' }}>
            <button
              onClick={handleExportPowerPoint}
              disabled={exportingPptx}
              title="Xuất toàn bộ các slide trình chiếu ra file Microsoft PowerPoint (.pptx)"
              style={{
                width: '100%', padding: '0.6rem 0.8rem',
                backgroundColor: exportingPptx ? '#92400E' : '#D97706', color: '#FFFFFF',
                border: 'none', borderRadius: '6px', cursor: exportingPptx ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
              }}
            >
              {exportingPptx ? <><FaSpinner className="spinner" /> Đang tạo PowerPoint...</> : <><FaFilePowerpoint /> 📥 Xuất file PowerPoint</>}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>
                Slide {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={toggleFullscreen}
                title="Toàn màn hình (Phím F)"
                style={{
                  padding: '0.45rem 0.85rem', backgroundColor: '#2563EB', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: '700'
                }}
              >
                <FaExpand /> Toàn màn hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MAIN STAGE ===================== */}
      <div className="presentation-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', position: 'relative' }}>

        {/* Top Floating Progress Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 30 }}>
          <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#3B82F6', transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 10px #60A5FA' }} />
        </div>

        {/* Slide Canvas Stage - Permanently mounted White Canvas to eliminate unmount flashing */}
        <div 
          ref={scrollContainerRef}
          className="slide-stage-wrapper"
          style={{
            flex: 1,
            overflowY: 'hidden',
            overflowX: 'hidden',
            padding: isFullscreen ? '0.75rem 1.25rem' : '0.65rem 1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="presentation-canvas"
            style={{
              width: '100%',
              maxWidth: isFullscreen ? '1600px' : '1280px',
              height: isFullscreen ? 'calc(100vh - 85px)' : 'calc(100vh - 125px)',
              maxHeight: isFullscreen ? 'calc(100vh - 85px)' : 'calc(100vh - 125px)',
              margin: '0 auto',
              backgroundColor: '#FFFFFF', color: '#1E293B',
              borderRadius: '18px',
              padding: isFullscreen ? '1.4rem 2.2rem' : '1.15rem 1.65rem',
              boxShadow: '0 20px 45px -10px rgba(0,0,0,0.35)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxSizing: 'border-box',
              overflow: 'hidden',
              zoom: fontScale,
              WebkitZoom: fontScale,
            }}
          >
            {/* Top decorative gradient line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
              background: slide.type === 'title'
                ? 'linear-gradient(90deg, #0F2C59, #D97706, #0284C7, #DC2626)'
                : (slide.type === 'transfer' || slide.type === 'transfer_progress')
                ? 'linear-gradient(90deg, #D97706, #F59E0B, #EA580C)'
                : slide.type === 'death'
                ? 'linear-gradient(90deg, #DC2626, #991B1B, #B91C1C)'
                : slide.type === 'surgery'
                ? 'linear-gradient(90deg, #0284C7, #0369A1, #38BDF8)'
                : 'linear-gradient(90deg, #1E40AF, #3B82F6, #0D9488)',
              transition: 'background 0.3s ease'
            }} />

            {/* Inner Content with seamless cross-fade and gentle 10px translate */}
            <div
              key={currentSlide}
              className={`slide-inner-content ${slideDirection === 'next' ? 'slide-content-next' : 'slide-content-prev'}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                minHeight: 0
              }}
            >
            {/* ==================== 1. TITLE SLIDE ==================== */}
            {slide.type === 'title' && (() => {
              const totalSubmitted = reports.length;
              const totalTransfers = reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0);
              const totalSurgeries = reports.reduce((sum, r) => sum + (r.surgeryCases?.length || 0), 0);
              const totalDeaths = reports.reduce((sum, r) => sum + (r.deathCases?.length || 0), 0);

              return (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  padding: '2rem 1rem', gap: '1.75rem'
                }}>
                  <div style={{
                    width: isFullscreen ? '140px' : '110px',
                    height: isFullscreen ? '140px' : '110px',
                    borderRadius: '50%', backgroundColor: '#FFF',
                    boxShadow: '0 20px 45px rgba(15,44,89,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
                  }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: isFullscreen ? '1.3rem' : '1.05rem',
                      color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                      letterSpacing: '2.5px', marginBottom: '0.5rem'
                    }}>
                      TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                    </div>
                    <h1 style={{
                      fontSize: isFullscreen ? '4rem' : '3rem',
                      color: '#0F2C59', fontWeight: '900', margin: '0 0 1rem',
                      letterSpacing: '-1.5px', lineHeight: 1.15
                    }}>
                      BÁO CÁO GIAO BAN
                    </h1>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                      fontSize: isFullscreen ? '1.5rem' : '1.2rem',
                      color: '#1E293B', fontWeight: '800',
                      padding: '0.75rem 2.5rem',
                      backgroundColor: '#EFF6FF', borderRadius: '999px',
                      border: '2px solid #BFDBFE',
                      boxShadow: '0 4px 15px rgba(59,130,246,0.12)'
                    }}>
                      📅 {formatDate(date)}
                    </div>
                  </div>

                  {/* Toàn bộ 4 nhóm chỉ số KPI nổi bật toàn viện */}
                  {reports.length > 0 && (
                    <div style={{
                      display: 'flex', gap: '1.25rem', marginTop: '1rem',
                      flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px'
                    }}>
                      {/* Box 1: Khoa phòng đã nộp */}
                      <div style={{
                        backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE',
                        borderRadius: '16px', padding: '1.25rem 1.75rem', flex: '1 1 200px', minWidth: '180px',
                        boxShadow: '0 4px 15px rgba(30, 64, 175, 0.08)'
                      }}>
                        <div style={{ fontSize: isFullscreen ? '3rem' : '2.3rem', fontWeight: '900', color: '#1E40AF', lineHeight: 1 }}>
                          {totalSubmitted}
                        </div>
                        <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.8rem', color: '#1E3A8A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.5rem' }}>
                          Khoa phòng đã nộp
                        </div>
                      </div>

                      {/* Box 2: Ca chuyển viện (Màu Hổ Phách/Cam) */}
                      <div style={{
                        backgroundColor: '#FFFBEB', border: '2px solid #FDE68A',
                        borderRadius: '16px', padding: '1.25rem 1.75rem', flex: '1 1 200px', minWidth: '180px',
                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.08)'
                      }}>
                        <div style={{ fontSize: isFullscreen ? '3rem' : '2.3rem', fontWeight: '900', color: '#D97706', lineHeight: 1 }}>
                          {totalTransfers}
                        </div>
                        <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.8rem', color: '#92400E', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.5rem' }}>
                          Ca chuyển viện
                        </div>
                      </div>

                      {/* Box 3: Ca phẫu thuật (mổ) (Màu Xanh Biển) */}
                      <div style={{
                        backgroundColor: '#F0F9FF', border: '2px solid #BAE6FD',
                        borderRadius: '16px', padding: '1.25rem 1.75rem', flex: '1 1 200px', minWidth: '180px',
                        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.08)'
                      }}>
                        <div style={{ fontSize: isFullscreen ? '3rem' : '2.3rem', fontWeight: '900', color: '#0284C7', lineHeight: 1 }}>
                          {totalSurgeries}
                        </div>
                        <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.8rem', color: '#0369A1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.5rem' }}>
                          Ca phẫu thuật (mổ)
                        </div>
                      </div>

                      {/* Box 4: Ca tử vong (Màu Đỏ Cảnh Báo) */}
                      <div style={{
                        backgroundColor: '#FEF2F2', border: '2px solid #FECACA',
                        borderRadius: '16px', padding: '1.25rem 1.75rem', flex: '1 1 200px', minWidth: '180px',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.08)'
                      }}>
                        <div style={{ fontSize: isFullscreen ? '3rem' : '2.3rem', fontWeight: '900', color: '#DC2626', lineHeight: 1 }}>
                          {totalDeaths}
                        </div>
                        <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.8rem', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.5rem' }}>
                          Hồ sơ tử vong
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 2. DEPARTMENT SLIDE ==================== */}
            {slide.type === 'department' && (() => {
              const sections = parseDepartmentSections(slide.report.report_data, slide.report.department_code);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Department top banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '1rem',
                    borderBottom: '3px solid #1E40AF'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                        color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                        letterSpacing: '1.5px', marginBottom: '0.2rem'
                      }}>
                        TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.3rem' : '1.75rem',
                        color: '#0F2C59', fontWeight: '900', margin: 0, lineHeight: 1.15
                      }}>
                        {slide.title}
                      </h2>
                      <div style={{
                        marginTop: '0.5rem',
                        display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: '#EFF6FF', color: '#1E40AF',
                          padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '700',
                          fontSize: isFullscreen ? '1.05rem' : '0.88rem', border: '1px solid #BFDBFE'
                        }}>
                          👨‍⚕️ Bác sĩ trực: <strong>{slide.report.doctor_name}</strong>
                        </span>

                        {(slide.report.report_data?.bsTrucTNT || slide.report.report_data?.tnt?.bsTrucTNT || slide.report.bs_truc_tnt) && (
                          <span style={{
                            backgroundColor: '#EEF2FF', color: '#4338CA',
                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '700',
                            fontSize: isFullscreen ? '1.05rem' : '0.88rem', border: '1px solid #C7D2FE'
                          }}>
                            🩺 BS trực TNT: <strong>{slide.report.report_data?.bsTrucTNT || slide.report.report_data?.tnt?.bsTrucTNT || slide.report.bs_truc_tnt}</strong>
                          </span>
                        )}

                        {slide.report.nurse_name && (
                          <span style={{
                            backgroundColor: '#F0FDF4', color: '#065F46',
                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '700',
                            fontSize: isFullscreen ? '1.05rem' : '0.88rem', border: '1px solid #BBF7D0'
                          }}>
                            👩‍⚕️ Điều dưỡng: <strong>{slide.report.nurse_name}</strong>
                          </span>
                        )}

                        {slide.report.overtime_staff && Array.isArray(slide.report.overtime_staff) && slide.report.overtime_staff.length > 0 && (
                          <span style={{
                            backgroundColor: '#FEF3C7', color: '#92400E',
                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '700',
                            fontSize: isFullscreen ? '0.95rem' : '0.82rem', border: '1px solid #FDE68A'
                          }}>
                            ⏰ Tăng cường: <strong>{slide.report.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ')}</strong>
                          </span>
                        )}

                        {slide.report.room && (
                          <span style={{
                            backgroundColor: '#F1F5F9', color: '#334155',
                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '0.95rem' : '0.82rem'
                          }}>
                            🏥 Phòng: <strong>{slide.report.room}</strong>
                          </span>
                        )}
                        {slide.report.shift_time && (
                          <span style={{
                            backgroundColor: '#F8FAFC', color: '#475569',
                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '0.95rem' : '0.82rem', border: '1px solid #CBD5E1'
                          }}>
                            ⏱️ Ca: <strong>{slide.report.shift_time}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '65px' : '50px', height: isFullscreen ? '65px' : '50px', flexShrink: 0 }} />
                  </div>

                  {/* Section & Metric Grid */}
                  {sections.length > 0 ? (() => {
                    const totalMetricsCount = sections.reduce((acc, s) => acc + (s.items ? s.items.length : 0), 0);
                    const metricSectionsCount = sections.filter(s => s.items).length;

                    // Tính toán kích thước thẻ card tự động theo số lượng chỉ số
                    const getCardDimensions = () => {
                      if (metricSectionsCount >= 3 || totalMetricsCount >= 14) {
                        return {
                          padding: isFullscreen ? '0.45rem 0.85rem' : '0.32rem 0.65rem',
                          minHeight: isFullscreen ? '48px' : '38px',
                          labelSize: isFullscreen ? '0.94rem' : '0.78rem',
                          valueSize: isFullscreen ? '1.75rem' : '1.32rem',
                          badgeSize: '0.68rem',
                          gap: isFullscreen ? '0.5rem' : '0.35rem',
                          sectionHeaderMb: isFullscreen ? '0.32rem' : '0.2rem',
                          sectionHeaderPad: isFullscreen ? '0.25rem 0.75rem' : '0.18rem 0.55rem',
                          sectionHeaderFont: isFullscreen ? '1.05rem' : '0.85rem'
                        };
                      }
                      if (totalMetricsCount <= 6) {
                        return {
                          padding: isFullscreen ? '1.1rem 1.5rem' : '0.85rem 1.25rem',
                          minHeight: isFullscreen ? '88px' : '74px',
                          labelSize: isFullscreen ? '1.2rem' : '1rem',
                          valueSize: isFullscreen ? '2.5rem' : '1.95rem',
                          badgeSize: '0.8rem',
                          gap: isFullscreen ? '1rem' : '0.75rem',
                          sectionHeaderMb: isFullscreen ? '0.75rem' : '0.55rem',
                          sectionHeaderPad: isFullscreen ? '0.5rem 1.1rem' : '0.38rem 0.85rem',
                          sectionHeaderFont: isFullscreen ? '1.2rem' : '1rem'
                        };
                      }
                      if (totalMetricsCount <= 10) {
                        return {
                          padding: isFullscreen ? '0.85rem 1.3rem' : '0.68rem 1.05rem',
                          minHeight: isFullscreen ? '78px' : '65px',
                          labelSize: isFullscreen ? '1.1rem' : '0.92rem',
                          valueSize: isFullscreen ? '2.3rem' : '1.75rem',
                          badgeSize: '0.75rem',
                          gap: isFullscreen ? '0.85rem' : '0.65rem',
                          sectionHeaderMb: isFullscreen ? '0.65rem' : '0.48rem',
                          sectionHeaderPad: isFullscreen ? '0.45rem 1rem' : '0.35rem 0.8rem',
                          sectionHeaderFont: isFullscreen ? '1.15rem' : '0.95rem'
                        };
                      }
                      // 11 - 13 items
                      return {
                        padding: isFullscreen ? '0.65rem 1.05rem' : '0.48rem 0.8rem',
                        minHeight: isFullscreen ? '60px' : '48px',
                        labelSize: isFullscreen ? '1rem' : '0.82rem',
                        valueSize: isFullscreen ? '1.95rem' : '1.45rem',
                        badgeSize: '0.7rem',
                        gap: isFullscreen ? '0.65rem' : '0.45rem',
                        sectionHeaderMb: isFullscreen ? '0.45rem' : '0.3rem',
                        sectionHeaderPad: isFullscreen ? '0.32rem 0.8rem' : '0.22rem 0.65rem',
                        sectionHeaderFont: isFullscreen ? '1.1rem' : '0.88rem'
                      };
                    };

                    const dims = getCardDimensions();

                    // Tính số cột tự động cho từng khối để vừa khít 100% chiều ngang, theo chuẩn 6 chỉ số trên 1 hàng
                    const getGridCols = (itemCount) => {
                      if (metricSectionsCount === 1) {
                        if (itemCount <= 4) return `repeat(${itemCount}, 1fr)`;
                        if (itemCount <= 6) return 'repeat(6, 1fr)';
                        if (itemCount <= 8) return 'repeat(4, 1fr)';
                        if (itemCount <= 12) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
                        return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
                      }

                      // Đa khối (LCK, YHCT, HSCC_TNT)
                      if (itemCount <= 2) return `repeat(${itemCount}, 1fr)`;
                      if (itemCount === 3) return 'repeat(3, 1fr)';
                      if (itemCount === 4) return 'repeat(4, 1fr)';
                      if (itemCount === 5) return 'repeat(5, 1fr)';
                      if (itemCount === 6) return 'repeat(6, 1fr)';
                      if (itemCount <= 8) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
                      if (itemCount <= 12) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(6, 1fr)';
                      return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(6, 1fr)';
                    };

                    return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: dims.gap,
                      flex: 1,
                      justifyContent: totalMetricsCount <= 4 ? 'center' : 'flex-start',
                      paddingTop: '0.15rem',
                      overflowY: 'auto'
                    }}>
                      {sections.map((section, sIdx) => {
                        // 1. PERSONNEL BANNER VIEW
                        if (section.type === 'personnel') {
                          return (
                            <div key={sIdx} style={{
                              backgroundColor: '#F8FAFC',
                              border: '2px solid #CBD5E1',
                              borderLeft: '8px solid #0F2C59',
                              borderRadius: '14px',
                              padding: isFullscreen ? '1.25rem 1.75rem' : '0.9rem 1.3rem',
                              boxShadow: '0 4px 12px rgba(15, 44, 89, 0.05)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '1.2rem',
                            }}>
                              <div style={{
                                width: isFullscreen ? '48px' : '38px',
                                height: isFullscreen ? '48px' : '38px',
                                borderRadius: '10px',
                                backgroundColor: '#EFF6FF',
                                color: '#1E40AF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: isFullscreen ? '1.5rem' : '1.2rem',
                                flexShrink: 0
                              }}>
                                👥
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                                  fontWeight: '800',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  marginBottom: '4px'
                                }}>
                                  {section.title}
                                </div>
                                <div style={{
                                  fontSize: isFullscreen ? '1.4rem' : '1.15rem',
                                  fontWeight: '700',
                                  color: '#0F2C59',
                                  lineHeight: 1.5,
                                  whiteSpace: 'pre-line'
                                }}>
                                  {section.value}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // 2. NOTE / REMARK VIEW
                        if (section.type === 'note') {
                          return (
                            <div key={sIdx} style={{
                              backgroundColor: '#FFFBEB',
                              border: '2px solid #FDE68A',
                              borderLeft: '8px solid #D97706',
                              borderRadius: '14px',
                              padding: isFullscreen ? '1.25rem 1.75rem' : '0.9rem 1.3rem',
                              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>📝</span>
                                <span style={{
                                  fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                                  fontWeight: '800',
                                  color: '#92400E',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {section.title}
                                </span>
                              </div>
                              <div style={{
                                fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                                fontWeight: '600',
                                color: '#78350F',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line',
                                paddingLeft: isFullscreen ? '1.9rem' : '1.6rem'
                              }}>
                                {section.value}
                              </div>
                            </div>
                          );
                        }

                        // 3. TABLE TYPE (TECHNIQUES) VIEW
                        if (section.tableType === 'techniques' && section.tableRows) {
                          return (
                            <div key={sIdx}>
                              <div style={{
                                fontSize: dims.sectionHeaderFont,
                                fontWeight: '800', color: '#0F2C59',
                                backgroundColor: '#EFF6FF',
                                padding: dims.sectionHeaderPad, borderRadius: '8px',
                                borderLeft: '5px solid #2563EB',
                                marginBottom: dims.sectionHeaderMb, textTransform: 'uppercase', letterSpacing: '0.5px'
                              }}>
                                {section.title}
                              </div>
                              <div style={{ overflowX: 'auto', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                <table style={{
                                  width: '100%',
                                  borderCollapse: 'separate',
                                  borderSpacing: '0',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                                  border: '1.5px solid #CBD5E1'
                                }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                                      <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'left', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>KỸ THUẬT</th>
                                      <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>TỔNG SỐ</th>
                                      <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>BẢO HIỂM</th>
                                      <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>NỘI TRÚ</th>
                                      <th style={{ padding: isFullscreen ? '0.9rem 1.4rem' : '0.75rem 1rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.95rem', letterSpacing: '0.5px' }}>NGOẠI TRÚ</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.tableRows.map((tech, tIdx) => (
                                      <tr 
                                        key={tIdx} 
                                        style={{ 
                                          backgroundColor: tIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                          borderBottom: '1px solid #E2E8F0'
                                        }}
                                      >
                                        <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', fontWeight: '800', color: '#0F2C59', borderBottom: '1px solid #E2E8F0', fontSize: isFullscreen ? '1.2rem' : '1rem' }}>
                                          {tech.name}
                                        </td>
                                        <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '900', color: '#1E40AF', fontSize: isFullscreen ? '1.45rem' : '1.2rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                          <span style={{ backgroundColor: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                                            {tech.tongSo || '0'}
                                          </span>
                                        </td>
                                        <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '800', color: '#059669', fontSize: isFullscreen ? '1.3rem' : '1.1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                          {tech.baoHiem || '0'}
                                        </td>
                                        <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.2rem' : '1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                          {tech.noiTru || '0'}
                                        </td>
                                        <td style={{ padding: isFullscreen ? '0.85rem 1.4rem' : '0.65rem 1rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.2rem' : '1rem', borderBottom: '1px solid #E2E8F0', fontFamily: "'Roboto Mono', monospace" }}>
                                          {tech.ngoaiTru || '0'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        }

                        // 4. METRICS CARDS GRID VIEW
                        return (
                          <div key={sIdx}>
                            {/* Section Title Header */}
                            {section.title && (
                              <div style={{
                                fontSize: dims.sectionHeaderFont,
                                fontWeight: '800', color: '#0F2C59',
                                backgroundColor: '#EFF6FF',
                                padding: dims.sectionHeaderPad,
                                borderRadius: '8px',
                                borderLeft: '5px solid #2563EB',
                                marginBottom: dims.sectionHeaderMb,
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                              }}>
                                {section.title}
                              </div>
                            )}

                            {section.items && (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: getGridCols(section.items.length),
                                gap: dims.gap
                              }}>
                                {section.items.map((item, iIdx) => {
                                  const style = getMetricStyle(item.key, item.value);
                                  return (
                                    <div
                                      key={iIdx}
                                      style={{
                                        backgroundColor: style.bg,
                                        border: `2px solid ${style.border}`,
                                        borderRadius: '12px',
                                        padding: dims.padding,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        transition: 'transform 0.15s',
                                        minHeight: dims.minHeight
                                      }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingRight: '0.5rem' }}>
                                        <span style={{
                                          fontSize: dims.labelSize,
                                          fontWeight: '700', color: style.label,
                                          lineHeight: 1.3
                                        }}>
                                          {item.label}
                                        </span>
                                        {style.badge && (
                                          <span style={{ fontSize: dims.badgeSize, fontWeight: '800', color: '#DC2626' }}>
                                            {style.badge}
                                          </span>
                                        )}
                                      </div>
                                      <span style={{
                                        fontSize: dims.valueSize,
                                        fontWeight: '900', color: style.text,
                                        fontFamily: "'Roboto Mono', monospace",
                                        flexShrink: 0
                                      }}>
                                        {item.value}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    );
                  })() : (
                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '1.4rem', paddingTop: '4rem' }}>
                      Không có số liệu báo cáo nào trong ca trực
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 3. TRANSFER CASE SLIDE (PART 1: TIẾP NHẬN) ==================== */}
            {slide.type === 'transfer' && (() => {
              const tc = slide.transferCase;
              const caseImages = normalizeImages(tc.images);
              const ageFormatted = formatPatientAge(tc.age);
              const contentLength = [
                tc.reason || '',
                tc.initial_treatment || tc.initialTreatment || '',
                tc.clinical_symptoms || tc.clinicalSymptoms || '',
                tc.clinical_tests || tc.clinicalTests || '',
                tc.diagnosis || '',
              ].join('').length;
              const af = ((cl) => {
                if (cl < 180) return { 
                  bodySize: isFullscreen ? '1.45rem' : '1.25rem', 
                  diagSize: isFullscreen ? '1.85rem' : '1.6rem',
                  hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
                  lineH: '1.8', gap: isFullscreen ? '1.1rem' : '0.85rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
                };
                if (cl < 400) return { 
                  bodySize: isFullscreen ? '1.3rem' : '1.15rem', 
                  diagSize: isFullscreen ? '1.7rem' : '1.48rem',
                  hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
                  lineH: '1.7', gap: isFullscreen ? '0.9rem' : '0.7rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
                };
                if (cl < 700) return { 
                  bodySize: isFullscreen ? '1.18rem' : '1.05rem', 
                  diagSize: isFullscreen ? '1.55rem' : '1.35rem',
                  hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
                  lineH: '1.62', gap: isFullscreen ? '0.75rem' : '0.58rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
                };
                return { 
                  bodySize: isFullscreen ? '1.05rem' : '0.95rem', 
                  diagSize: isFullscreen ? '1.4rem' : '1.22rem',
                  hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
                  lineH: '1.52', gap: isFullscreen ? '0.6rem' : '0.45rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
                };
              })(contentLength);
              const AMBER = { main: '#D97706', dark: '#92400E', light: '#FFFBEB', border: '#FDE68A', soft: '#FEF3C7' };
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
                  {/* Slide type label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaAmbulance style={{ color: AMBER.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
                      {slide.deptName} &nbsp;•&nbsp; CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 1: TIẾP NHẬN)
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
                  </div>

                  {/* Patient header bar */}
                  <div style={{
                    backgroundColor: AMBER.soft, border: `2px solid ${AMBER.border}`,
                    borderLeft: `8px solid ${AMBER.main}`, borderRadius: '12px',
                    padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
                    flexShrink: 0, boxShadow: '0 4px 14px rgba(217,119,6,0.15)'
                  }}>
                    <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                      {tc.patient_name || tc.patientName || 'BỆNH NHÂN CHUYỂN VIỆN'}
                    </span>
                    {ageFormatted && <span style={{ backgroundColor: AMBER.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(217,119,6,0.3)' }}>{ageFormatted}</span>}
                    {tc.address && <span style={{ color: AMBER.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {tc.address}</span>}
                    {(tc.admission_time || tc.admissionTime) && <span style={{ color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Giờ vào: <strong>{tc.admission_time || tc.admissionTime}</strong></span>}
                  </div>

                  {/* Medical grid — 2 columns with full height distribution */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
                    {/* Col 1: Lý do + Xử trí */}
                    <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `6px solid ${AMBER.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(217,119,6,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
                        ⏰ LÝ DO & XỬ TRÍ BAN ĐẦU
                      </div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div>
                          <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lý do vào viện:</span>
                          <div style={{ color: '#0F172A', fontWeight: '600' }}>{tc.reason || '—'}</div>
                        </div>
                        <div>
                          <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Xử trí ban đầu:</span>
                          <div style={{ color: '#1E293B', fontWeight: '600', backgroundColor: '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            {tc.initial_treatment || tc.initialTreatment || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: CLS + Chẩn đoán */}
                    <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `6px solid #B45309`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(217,119,6,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>
                        🔬 LÂM SÀNG, CẬN LÂM SÀNG & CHẨN ĐOÁN
                      </div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        {/* Chẩn đoán highlight lớn */}
                        <div style={{ backgroundColor: AMBER.soft, border: `2px solid ${AMBER.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(217,119,6,0.12)' }}>
                          <span style={{ fontWeight: '900', color: AMBER.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🏥 CHẨN ĐOÁN XÁC ĐỊNH:
                          </span>
                          <span style={{ color: '#92400E', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>
                            {tc.diagnosis || '—'}
                          </span>
                        </div>
                        {(tc.clinical_symptoms || tc.clinicalSymptoms) && (
                          <div>
                            <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Lâm sàng / Triệu chứng khám:</span>
                            <div style={{ color: '#0F172A', fontWeight: '600' }}>{tc.clinical_symptoms || tc.clinicalSymptoms}</div>
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '2px' }}>Cận lâm sàng / X-Quang / XN:</span>
                          <div style={{ color: '#334155', fontWeight: '600' }}>{tc.clinical_tests || tc.clinicalTests || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: image badge */}
                  {caseImages.length > 0 && (
                    <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: AMBER.soft, border: `2px dashed ${AMBER.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
                      <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
                      <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 4. TRANSFER CASE SLIDE (PART 2: DIỄN BIẾN & TÌNH TRẠNG CHUYỂN) ==================== */}
            {slide.type === 'transfer_progress' && (() => {
              const tc = slide.transferCase;
              const caseImages = normalizeImages(tc.images);
              const progText = tc.progress_notes || '';
              const contentLength = progText.length + (tc.diagnosis || '').length;
              const af = ((cl) => {
                if (cl < 200) return { bodySize: isFullscreen ? '1.5rem' : '1.3rem', lineH: '1.85' };
                if (cl < 450) return { bodySize: isFullscreen ? '1.35rem' : '1.18rem', lineH: '1.75' };
                if (cl < 750) return { bodySize: isFullscreen ? '1.2rem' : '1.08rem', lineH: '1.65' };
                return { bodySize: isFullscreen ? '1.05rem' : '0.95rem', lineH: '1.55' };
              })(contentLength);
              const AMBER = { main: '#D97706', dark: '#92400E', light: '#FFFBEB', border: '#FDE68A', soft: '#FEF3C7' };
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
                  {/* Slide type label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>📝</span>
                      {slide.deptName} &nbsp;•&nbsp; CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 2: DIỄN BIẾN)
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
                  </div>

                  {/* Patient summary bar */}
                  <div style={{ backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE', borderLeft: '7px solid #2563EB', borderRadius: '10px', padding: isFullscreen ? '0.65rem 1.3rem' : '0.45rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0, boxShadow: '0 3px 10px rgba(37,99,235,0.08)' }}>
                    <div style={{ fontSize: isFullscreen ? '1.4rem' : '1.18rem', fontWeight: '900', color: '#0F2C59' }}>
                      👤 {tc.patient_name || tc.patientName || 'Bệnh nhân chuyển viện'}
                    </div>
                    {tc.diagnosis && <div style={{ fontSize: isFullscreen ? '1.15rem' : '0.98rem', fontWeight: '800', color: AMBER.dark }}>🏥 CĐ: <span style={{ color: '#92400E' }}>{tc.diagnosis}</span></div>}
                  </div>

                  {/* Full-width progress notes with large text and relaxed spacing */}
                  <div style={{ flex: 1, minHeight: 0, backgroundColor: '#FFFBEB', borderRadius: '12px', border: `2px solid ${AMBER.border}`, borderLeft: `7px solid ${AMBER.main}`, padding: isFullscreen ? '1.2rem 1.6rem' : '0.9rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', boxShadow: '0 4px 16px rgba(217,119,6,0.08)', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isFullscreen ? '1.2rem' : '1.05rem', fontWeight: '900', color: AMBER.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2px solid ${AMBER.border}`, paddingBottom: '0.45rem', flexShrink: 0 }}>
                      <span>📋</span><span>NỘI DUNG DIỄN BIẾN, HỘI CHẨN & TÌNH TRẠNG CHUYỂN VIỆN:</span>
                    </div>
                    <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, color: '#0F172A', fontWeight: '600', whiteSpace: 'pre-wrap', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {progText || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '1.2rem' }}>(Không có ghi chú diễn biến bổ sung cho ca bệnh này)</span>}
                    </div>
                  </div>

                  {caseImages.length > 0 && (
                    <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: AMBER.soft, border: `2px dashed ${AMBER.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: AMBER.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
                      <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
                      <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 5. SURGERY CASE SLIDE ==================== */}
            {slide.type === 'surgery' && (() => {
              const sc = slide.surgeryCase;
              const caseImages = normalizeImages(sc.images);
              const ageFormatted = formatPatientAge(sc.birth_year || sc.birthYear || sc.age);
              const contentLength = [
                sc.clinical_symptoms || sc.clinicalSymptoms || '',
                sc.clinical_tests || sc.clinicalTests || '',
                sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '',
                sc.consultation_order || sc.consultationOrder || '',
                sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '',
                sc.current_status || sc.currentStatus || '',
              ].join('').length;
              const af = ((cl) => {
                if (cl < 200) return { 
                  bodySize: isFullscreen ? '1.45rem' : '1.25rem', 
                  diagSize: isFullscreen ? '1.85rem' : '1.6rem',
                  hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
                  lineH: '1.8', gap: isFullscreen ? '1.1rem' : '0.85rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
                };
                if (cl < 450) return { 
                  bodySize: isFullscreen ? '1.3rem' : '1.15rem', 
                  diagSize: isFullscreen ? '1.7rem' : '1.48rem',
                  hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
                  lineH: '1.7', gap: isFullscreen ? '0.9rem' : '0.7rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
                };
                if (cl < 750) return { 
                  bodySize: isFullscreen ? '1.18rem' : '1.05rem', 
                  diagSize: isFullscreen ? '1.55rem' : '1.35rem',
                  hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
                  lineH: '1.62', gap: isFullscreen ? '0.75rem' : '0.58rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
                };
                return { 
                  bodySize: isFullscreen ? '1.05rem' : '0.95rem', 
                  diagSize: isFullscreen ? '1.4rem' : '1.22rem',
                  hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
                  lineH: '1.52', gap: isFullscreen ? '0.6rem' : '0.45rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
                };
              })(contentLength);
              const BLUE = { main: '#0284C7', dark: '#0369A1', light: '#F0F9FF', border: '#BAE6FD', soft: '#E0F2FE' };
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
                  {/* Slide type label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: BLUE.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaProcedures style={{ color: BLUE.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
                      BÁO CÁO PHẪU THUẬT — {slide.deptName} &nbsp;•&nbsp; Ca Mổ #{slide.caseIndex}/{slide.totalCases}
                    </div>
                    <div style={{ padding: '0.35rem 0.9rem', backgroundColor: BLUE.soft, borderRadius: '999px', border: `2px solid ${BLUE.border}`, fontSize: isFullscreen ? '0.92rem' : '0.8rem', fontWeight: '800', color: BLUE.dark }}>🔪 Phẫu thuật ca trực</div>
                  </div>

                  {/* Patient header bar */}
                  <div style={{ backgroundColor: BLUE.soft, border: `2px solid ${BLUE.border}`, borderLeft: `8px solid ${BLUE.main}`, borderRadius: '12px', padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(2,132,199,0.12)' }}>
                    <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>{sc.patient_name || sc.patientName || 'BỆNH NHÂN PHẪU THUẬT'}</span>
                    {ageFormatted && <span style={{ backgroundColor: BLUE.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(2,132,199,0.3)' }}>{ageFormatted}</span>}
                    {sc.address && <span style={{ color: BLUE.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {sc.address}</span>}
                    {(sc.admission_time || sc.admissionTime) && <span style={{ color: BLUE.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{sc.admission_time || sc.admissionTime}</strong></span>}
                    {sc.reason && <span style={{ color: '#DC2626', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.92rem' }}>• {sc.reason}</span>}
                  </div>

                  {/* Medical grid — 3 columns with full vertical expansion */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
                    {/* Col 1: LS & CLS */}
                    <div style={{ backgroundColor: BLUE.light, borderRadius: '12px', border: `2px solid ${BLUE.border}`, borderLeft: `6px solid ${BLUE.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(2,132,199,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: BLUE.dark, textTransform: 'uppercase', borderBottom: `2px solid ${BLUE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>🔬 LÂM SÀNG & CẬN LÂM SÀNG</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        {(sc.clinical_symptoms || sc.clinicalSymptoms) ? (
                          <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Lâm sàng:</span><div style={{ color: '#0369A1', fontWeight: '600' }}>{sc.clinical_symptoms || sc.clinicalSymptoms}</div></div>
                        ) : <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>Không ghi nhận triệu chứng đặc biệt</div>}
                        {(sc.clinical_tests || sc.clinicalTests) && (
                          <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Cận lâm sàng / SA / XQ / XN:</span><div style={{ color: '#1E293B', fontWeight: '600' }}>{sc.clinical_tests || sc.clinicalTests}</div></div>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Chẩn đoán + Lệnh mổ */}
                    <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', border: '2px solid #BFDBFE', borderLeft: '6px solid #1D4ED8', padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(29,78,216,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#1E40AF', textTransform: 'uppercase', borderBottom: '2px solid #BFDBFE', paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>📋 CHẨN ĐOÁN & LỆNH MỔ</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div style={{ backgroundColor: BLUE.soft, border: `2px solid ${BLUE.main}`, borderRadius: '10px', padding: '0.65rem 0.95rem', boxShadow: '0 3px 10px rgba(2,132,199,0.12)' }}>
                          <span style={{ fontWeight: '900', color: BLUE.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>CHẨN ĐOÁN TRƯỚC MỔ:</span>
                          <span style={{ color: '#0F2C59', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>{sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</span>
                        </div>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Lệnh mổ / Hội chẩn:</span><div style={{ color: '#1E293B', fontWeight: '600' }}>{sc.consultation_order || sc.consultationOrder || '—'}</div></div>
                      </div>
                    </div>

                    {/* Col 3: Sau mổ + Tình trạng */}
                    <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', border: '2px solid #BBF7D0', borderLeft: '6px solid #16A34A', padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(22,163,74,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#15803D', textTransform: 'uppercase', borderBottom: '2px solid #BBF7D0', paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>✅ SAU MỔ & TÌNH TRẠNG</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div style={{ backgroundColor: '#DCFCE7', border: '2px solid #86EFAC', borderRadius: '10px', padding: '0.65rem 0.95rem' }}>
                          <span style={{ fontWeight: '900', color: '#166534', fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>CHẨN ĐOÁN SAU MỔ:</span>
                          <span style={{ color: '#14532D', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>{sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</span>
                        </div>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Tình trạng hiện tại:</span><div style={{ color: '#0F172A', fontWeight: '600', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #BBF7D0' }}>{sc.current_status || sc.currentStatus || '—'}</div></div>
                      </div>
                    </div>
                  </div>

                  {caseImages.length > 0 && (
                    <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: BLUE.soft, border: `2px dashed ${BLUE.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: BLUE.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
                      <span>📷 Ca mổ có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
                      <span style={{ fontStyle: 'italic' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 6. DEATH CASE SLIDE ==================== */}
            {slide.type === 'death' && (() => {
              const dc = slide.deathCase;
              const caseImages = normalizeImages(dc.images);
              const ageFormatted = formatPatientAge(dc.age);
              const contentLength = [
                dc.admission_status || dc.admissionStatus || '',
                dc.medical_history || dc.medicalHistory || '',
                dc.clinical_symptoms || dc.clinicalSymptoms || '',
                dc.clinical_tests || dc.clinicalTests || '',
                dc.diagnosis || '',
                dc.emergency_treatment || dc.emergencyTreatment || '',
                dc.final_outcome || dc.finalOutcome || '',
              ].join('').length;
              const af = ((cl) => {
                if (cl < 200) return { 
                  bodySize: isFullscreen ? '1.45rem' : '1.25rem', 
                  diagSize: isFullscreen ? '1.85rem' : '1.6rem',
                  hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
                  lineH: '1.8', gap: isFullscreen ? '1.1rem' : '0.85rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
                };
                if (cl < 450) return { 
                  bodySize: isFullscreen ? '1.3rem' : '1.15rem', 
                  diagSize: isFullscreen ? '1.7rem' : '1.48rem',
                  hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
                  lineH: '1.7', gap: isFullscreen ? '0.9rem' : '0.7rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
                };
                if (cl < 750) return { 
                  bodySize: isFullscreen ? '1.18rem' : '1.05rem', 
                  diagSize: isFullscreen ? '1.55rem' : '1.35rem',
                  hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
                  lineH: '1.62', gap: isFullscreen ? '0.75rem' : '0.58rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
                };
                return { 
                  bodySize: isFullscreen ? '1.05rem' : '0.95rem', 
                  diagSize: isFullscreen ? '1.4rem' : '1.22rem',
                  hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
                  lineH: '1.52', gap: isFullscreen ? '0.6rem' : '0.45rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
                };
              })(contentLength);
              const RED = { main: '#DC2626', dark: '#991B1B', light: '#FEF2F2', border: '#FECACA', soft: '#FEE2E2' };
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
                  {/* Slide type label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: RED.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaExclamationTriangle style={{ color: RED.main, fontSize: isFullscreen ? '1.3rem' : '1.1rem' }} />
                      BÁO CÁO TỬ VONG — {slide.deptName} &nbsp;•&nbsp; Hồ Sơ #{slide.caseIndex}/{slide.totalCases}
                    </div>
                    <div style={{ padding: '0.35rem 0.9rem', backgroundColor: RED.soft, borderRadius: '999px', border: `2px solid ${RED.border}`, fontSize: isFullscreen ? '0.92rem' : '0.8rem', fontWeight: '900', color: RED.dark, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FaHeartbeat style={{ color: RED.main }} /> CẢNH BÁO TỬ VONG
                    </div>
                  </div>

                  {/* Patient header bar */}
                  <div style={{ backgroundColor: RED.soft, border: `2px solid ${RED.border}`, borderLeft: `8px solid ${RED.main}`, borderRadius: '12px', padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(220,38,38,0.15)' }}>
                    <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: RED.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>{dc.patient_name || dc.patientName || 'BỆNH NHÂN TỬ VONG'}</span>
                    {ageFormatted && <span style={{ backgroundColor: RED.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}>{ageFormatted}</span>}
                    {dc.address && <span style={{ color: RED.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {dc.address}</span>}
                    {(dc.admission_time || dc.admissionTime) && <span style={{ color: RED.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{dc.admission_time || dc.admissionTime}</strong></span>}
                  </div>

                  {/* Medical grid — 3 columns with full vertical expansion */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
                    {/* Col 1: Tình trạng + Tiền sử */}
                    <div style={{ backgroundColor: RED.light, borderRadius: '12px', border: `2px solid ${RED.border}`, borderLeft: `6px solid ${RED.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(220,38,38,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: RED.dark, textTransform: 'uppercase', borderBottom: `2px solid ${RED.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>👤 TIẾP NHẬN & TIỀN SỬ</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Lý do vào viện:</span><div style={{ color: '#0F172A', fontWeight: '600' }}>{dc.reason || '—'}</div></div>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Tình trạng lúc vào:</span><div style={{ color: '#7F1D1D', fontWeight: '700' }}>{dc.admission_status || dc.admissionStatus || '—'}</div></div>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Tiền sử bệnh:</span><div style={{ color: '#374151', fontWeight: '600' }}>{dc.medical_history || dc.medicalHistory || '—'}</div></div>
                      </div>
                    </div>

                    {/* Col 2: Chẩn đoán + LS/CLS — HIGHLIGHT */}
                    <div style={{ backgroundColor: '#FFF1F2', borderRadius: '12px', border: '2px solid #FECDD3', borderLeft: '6px solid #E11D48', padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(225,29,72,0.08)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#9F1239', textTransform: 'uppercase', borderBottom: '2px solid #FECDD3', paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>⚡ CHẨN ĐOÁN & LÂM SÀNG</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div style={{ backgroundColor: RED.soft, border: `2.5px solid ${RED.main}`, borderRadius: '10px', padding: '0.7rem 1rem', boxShadow: '0 4px 14px rgba(220,38,38,0.18)' }}>
                          <span style={{ fontWeight: '900', color: RED.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚨 CHẨN ĐOÁN TỬ VONG:</span>
                          <span style={{ color: RED.main, fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>{dc.diagnosis || '—'}</span>
                        </div>
                        {(dc.clinical_symptoms || dc.clinicalSymptoms) && (
                          <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Lâm sàng / Triệu chứng CCC:</span><div style={{ color: RED.dark, fontWeight: '600' }}>{dc.clinical_symptoms || dc.clinicalSymptoms}</div></div>
                        )}
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Cận lâm sàng / ECG:</span><div style={{ color: '#334155', fontWeight: '600' }}>{dc.clinical_tests || dc.clinicalTests || '—'}</div></div>
                      </div>
                    </div>

                    {/* Col 3: Xử trí CCC + Kết quả */}
                    <div style={{ backgroundColor: RED.light, borderRadius: '12px', border: `2px solid ${RED.border}`, borderLeft: `6px solid #B91C1C`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(185,28,28,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: RED.dark, textTransform: 'uppercase', borderBottom: `2px solid ${RED.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>🏥 XỬ TRÍ & KẾT QUẢ</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Xử trí cấp cứu hồi sức:</span><div style={{ color: '#0F172A', fontWeight: '600' }}>{dc.emergency_treatment || dc.emergencyTreatment || '—'}</div></div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', marginTop: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                          <span style={{ fontWeight: '900', color: RED.dark, display: 'block', marginBottom: '2px' }}>Kết quả & Hướng xử lý:</span>
                          <div style={{ color: '#1E293B', fontWeight: '800' }}>{dc.final_outcome || dc.finalOutcome || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {caseImages.length > 0 && (
                    <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: RED.soft, border: `2px dashed ${RED.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: RED.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
                      <span>📷 Hồ sơ tử vong có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
                      <span style={{ fontStyle: 'italic' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 7. CRITICAL CASE SLIDE (PURPLE THEME) ==================== */}
            {slide.type === 'critical' && (() => {
              const cc = slide.criticalCase;
              const caseImages = normalizeImages(cc.images);
              const ageFormatted = formatPatientAge(cc.age);
              const contentLength = [
                cc.medical_history || cc.medicalHistory || '',
                cc.clinical_symptoms || cc.clinicalSymptoms || '',
                cc.clinical_tests || cc.clinicalTests || '',
                cc.diagnosis || '',
                cc.condition_summary || cc.conditionSummary || '',
                cc.treatment || '',
                cc.notes || '',
              ].join('').length;
              const af = ((cl) => {
                if (cl < 200) return { 
                  bodySize: isFullscreen ? '1.45rem' : '1.25rem', 
                  diagSize: isFullscreen ? '1.85rem' : '1.6rem',
                  hdrSize: isFullscreen ? '1.25rem' : '1.1rem',
                  lineH: '1.8', gap: isFullscreen ? '1.1rem' : '0.85rem', pad: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem' 
                };
                if (cl < 450) return { 
                  bodySize: isFullscreen ? '1.3rem' : '1.15rem', 
                  diagSize: isFullscreen ? '1.7rem' : '1.48rem',
                  hdrSize: isFullscreen ? '1.18rem' : '1.05rem',
                  lineH: '1.7', gap: isFullscreen ? '0.9rem' : '0.7rem', pad: isFullscreen ? '0.95rem 1.25rem' : '0.75rem 0.95rem' 
                };
                if (cl < 750) return { 
                  bodySize: isFullscreen ? '1.18rem' : '1.05rem', 
                  diagSize: isFullscreen ? '1.55rem' : '1.35rem',
                  hdrSize: isFullscreen ? '1.1rem' : '0.98rem',
                  lineH: '1.62', gap: isFullscreen ? '0.75rem' : '0.58rem', pad: isFullscreen ? '0.85rem 1.1rem' : '0.65rem 0.85rem' 
                };
                return { 
                  bodySize: isFullscreen ? '1.05rem' : '0.95rem', 
                  diagSize: isFullscreen ? '1.4rem' : '1.22rem',
                  hdrSize: isFullscreen ? '1.02rem' : '0.92rem',
                  lineH: '1.52', gap: isFullscreen ? '0.6rem' : '0.45rem', pad: isFullscreen ? '0.7rem 0.95rem' : '0.55rem 0.75rem' 
                };
              })(contentLength);
              const PURPLE = { main: '#7C3AED', dark: '#5B21B6', light: '#FAF5FF', border: '#DDD6FE', soft: '#EDE9FE' };
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
                  {/* Slide type label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800', color: PURPLE.dark, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>⚡</span>
                      {slide.deptName} &nbsp;•&nbsp; BỆNH NẶNG THEO DÕI {slide.caseIndex}/{slide.totalCases}
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
                  </div>

                  {/* Patient header bar */}
                  <div style={{ backgroundColor: PURPLE.soft, border: `2px solid ${PURPLE.border}`, borderLeft: `8px solid ${PURPLE.main}`, borderRadius: '12px', padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.12)' }}>
                    <span style={{ fontSize: isFullscreen ? '1.85rem' : '1.5rem', fontWeight: '900', color: PURPLE.dark, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>{cc.patient_name || cc.patientName || 'BỆNH NHÂN NẶNG'}</span>
                    {ageFormatted && <span style={{ backgroundColor: PURPLE.main, color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: isFullscreen ? '1.15rem' : '0.98rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(124,58,237,0.3)' }}>{ageFormatted}</span>}
                    {cc.address && <span style={{ color: PURPLE.dark, fontWeight: '700', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>📍 {cc.address}</span>}
                    {(cc.admission_time || cc.admissionTime) && <span style={{ color: PURPLE.dark, fontWeight: '800', fontSize: isFullscreen ? '1.1rem' : '0.95rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>⏰ Vào: <strong>{cc.admission_time || cc.admissionTime}</strong></span>}
                  </div>

                  {/* Medical grid — 3 columns with full vertical expansion */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '0.65rem', flex: 1, minHeight: 0 }}>
                    {/* Col 1: Tiền căn + LS/CLS */}
                    <div style={{ backgroundColor: PURPLE.light, borderRadius: '12px', border: `2px solid ${PURPLE.border}`, borderLeft: `6px solid ${PURPLE.main}`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(124,58,237,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: PURPLE.dark, textTransform: 'uppercase', borderBottom: `2px solid ${PURPLE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>📋 TIỀN CĂN & LÂM SÀNG</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div style={{ backgroundColor: PURPLE.soft, border: `1.5px solid ${PURPLE.border}`, borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                          <span style={{ fontWeight: '800', color: PURPLE.dark, display: 'block', marginBottom: '2px' }}>Tiền căn bệnh:</span>
                          <div style={{ color: '#3B0764', fontWeight: '600' }}>{cc.medical_history || cc.medicalHistory || 'Chưa ghi nhận tiền căn đặc biệt'}</div>
                        </div>
                        {(cc.clinical_symptoms || cc.clinicalSymptoms) && (
                          <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Lâm sàng / Triệu chứng:</span><div style={{ color: PURPLE.dark, fontWeight: '600' }}>{cc.clinical_symptoms || cc.clinicalSymptoms}</div></div>
                        )}
                        {(cc.clinical_tests || cc.clinicalTests) && (
                          <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Cận lâm sàng / X-Quang / XN:</span><div style={{ color: '#1E1B4B', fontWeight: '600' }}>{cc.clinical_tests || cc.clinicalTests}</div></div>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Chẩn đoán HIGHLIGHT */}
                    <div style={{ backgroundColor: '#F5F3FF', borderRadius: '12px', border: `2px solid ${PURPLE.border}`, borderLeft: `8px solid #8B5CF6`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', boxShadow: '0 3px 12px rgba(139,92,246,0.08)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#6D28D9', textTransform: 'uppercase', borderBottom: `2px solid ${PURPLE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>⚡ CHẨN ĐOÁN & DIỄN BIẾN</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div style={{ backgroundColor: PURPLE.soft, border: `2.5px solid ${PURPLE.main}`, borderRadius: '10px', padding: '0.7rem 1rem', boxShadow: '0 4px 14px rgba(124,58,237,0.15)' }}>
                          <span style={{ fontWeight: '900', color: PURPLE.dark, fontSize: isFullscreen ? '1.05rem' : '0.9rem', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CHẨN ĐOÁN XÁC ĐỊNH:</span>
                          <span style={{ color: '#6D28D9', fontWeight: '900', fontSize: af.diagSize, display: 'block', lineHeight: '1.3' }}>{cc.diagnosis || '—'}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Tình trạng & Diễn biến:</span>
                          <div style={{ color: '#0F172A', fontWeight: '600', backgroundColor: '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', whiteSpace: 'pre-wrap', lineHeight: af.lineH, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            {cc.condition_summary || cc.conditionSummary || 'Chưa có ghi nhận diễn biến'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Xử trí + Hướng tiếp theo */}
                    <div style={{ backgroundColor: PURPLE.light, borderRadius: '12px', border: `2px solid ${PURPLE.border}`, borderLeft: `6px solid #A78BFA`, padding: af.pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 3px 12px rgba(167,139,250,0.06)', overflowY: 'auto' }}>
                      <div style={{ fontSize: af.hdrSize, fontWeight: '900', color: '#5B21B6', textTransform: 'uppercase', borderBottom: `2px solid ${PURPLE.border}`, paddingBottom: '0.35rem', flexShrink: 0, marginBottom: '0.4rem' }}>💊 XỬ TRÍ & HƯỚNG TIẾP THEO</div>
                      <div style={{ fontSize: af.bodySize, lineHeight: af.lineH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: af.gap }}>
                        <div><span style={{ fontWeight: '800', display: 'block', marginBottom: '2px' }}>Xử trí điều trị:</span><div style={{ color: '#1E1B4B', fontWeight: '600' }}>{cc.treatment || '—'}</div></div>
                        <div style={{ backgroundColor: PURPLE.soft, padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px dashed #A78BFA', marginTop: '4px' }}>
                          <span style={{ fontWeight: '900', color: '#6D28D9', display: 'block', marginBottom: '2px' }}>Hướng tiếp theo:</span>
                          <div style={{ color: '#4C1D95', fontWeight: '800' }}>{cc.notes || 'Bàn giao tua sau theo dõi tiếp'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {caseImages.length > 0 && (
                    <div style={{ padding: isFullscreen ? '0.5rem 1rem' : '0.38rem 0.8rem', backgroundColor: PURPLE.soft, border: `2px dashed ${PURPLE.main}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: PURPLE.dark, fontWeight: '800', fontSize: isFullscreen ? '0.98rem' : '0.85rem', flexShrink: 0 }}>
                      <span>📷 Ca bệnh có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
                      <span style={{ fontStyle: 'italic' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}


            {/* ==================== 8. DEDICATED FULL-SCREEN IMAGE SLIDE ==================== */}
            {slide.type === 'case_image' && (() => {
              const ageFormatted = formatPatientAge(slide.caseItem.age || slide.caseItem.birth_year || slide.caseItem.birthYear);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Header Banner with Category Theme */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.75rem', marginBottom: '0.75rem',
                    borderBottom: `4px solid ${slide.themeColor || '#2563EB'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: isFullscreen ? '52px' : '40px', height: isFullscreen ? '52px' : '40px',
                        borderRadius: '50%',
                        backgroundColor: `${slide.themeColor}20`,
                        color: slide.themeColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isFullscreen ? '1.5rem' : '1.2rem',
                        boxShadow: `0 4px 12px ${slide.themeColor}30`, flexShrink: 0
                      }}>
                        <FaImages />
                      </div>
                      <div>
                        <div style={{
                          fontSize: isFullscreen ? '0.9rem' : '0.78rem',
                          color: slide.themeColor,
                          fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px'
                        }}>
                          {slide.deptName} • {
                            slide.caseType === 'surgery' ? 'CA PHẪU THUẬT' :
                            slide.caseType === 'death' ? 'HỒ SƠ TỬ VONG' :
                            slide.caseType === 'transfer' ? 'CA CHUYỂN VIỆN' : 'BỆNH NẶNG THEO DÕI'
                          } #{slide.caseIndex}/{slide.totalCases}
                        </div>
                        <h2 style={{
                          fontSize: isFullscreen ? '1.9rem' : '1.45rem',
                          color: '#0F2C59', fontWeight: '900', margin: 0, lineHeight: 1.15
                        }}>
                          HÌNH ẢNH MINH HỌA #{slide.imgIndex} / {slide.totalImages}
                        </h2>
                      </div>
                    </div>

                    {/* Patient Quick Badge */}
                    <div style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: `1.5px solid ${slide.themeColor}44`,
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ fontSize: isFullscreen ? '1rem' : '0.88rem', fontWeight: '800', color: '#0F2C59' }}>
                        👤 {slide.caseItem.patient_name || slide.caseItem.patientName || 'Bệnh nhân'}
                        {ageFormatted ? ` (${ageFormatted})` : ''}
                      </div>
                      {slide.caseItem.diagnosis && (
                        <div style={{ fontSize: isFullscreen ? '0.95rem' : '0.82rem', fontWeight: '700', color: slide.themeColor }}>
                          • CĐ: {slide.caseItem.diagnosis}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Large Image Presentation Stage */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0F172A',
                    borderRadius: '14px',
                    border: '2px solid #334155',
                    padding: '0.85rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                    maxHeight: isFullscreen ? 'calc(100vh - 215px)' : 'calc(100vh - 245px)'
                  }}>
                    {/* The Image */}
                    <img
                      src={typeof slide.image === 'string' ? slide.image : slide.image.url}
                      alt={typeof slide.image === 'object' ? slide.image.name : 'Hình ảnh y khoa'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: isFullscreen ? 'calc(100vh - 280px)' : 'calc(100vh - 310px)',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.6)'
                      }}
                    />

                    {/* Caption */}
                    <div style={{
                      marginTop: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: '900px',
                      color: '#94A3B8',
                      fontSize: isFullscreen ? '0.95rem' : '0.82rem'
                    }}>
                      <span>
                        📷 Ảnh minh họa #{slide.imgIndex} / {slide.totalImages}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>

        {/* ===================== BOTTOM NAVIGATION BAR ===================== */}
        <div className="no-print" style={{
          padding: '0 2rem',
          height: '65px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#0F172A',
          borderTop: '1px solid #1E293B',
          position: 'relative',
          flexShrink: 0
        }}>
          {/* Top Progress bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            backgroundColor: '#1E293B'
          }}>
            <div style={{
              height: '100%', backgroundColor: '#3B82F6',
              width: `${progressPct}%`, transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Left: Previous button */}
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            style={{
              padding: '0.65rem 1.75rem',
              backgroundColor: currentSlide === 0 ? 'transparent' : '#1E293B',
              color: currentSlide === 0 ? '#475569' : '#F8FAFC',
              border: `1px solid ${currentSlide === 0 ? 'transparent' : '#334155'}`,
              borderRadius: '8px',
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '1rem', fontWeight: '700', transition: 'all 0.15s'
            }}
          >
            <FaChevronLeft /> Slide trước
          </button>

          {/* Center: Slide indicator + Font Zoom + Fullscreen Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '1rem' }}>
              <span>Slide</span>
              <span style={{
                backgroundColor: '#2563EB', color: '#FFFFFF',
                padding: '0.2rem 0.75rem', borderRadius: '6px',
                fontWeight: '900', fontSize: '1.15rem'
              }}>
                {currentSlide + 1}
              </span>
              <span>/ {slides.length}</span>
            </div>

            {/* Font Zoom Controls */}
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: '#1E293B', border: '1px solid #334155',
              borderRadius: '8px', padding: '3px 6px', gap: '4px'
            }}>
              <button
                onClick={() => setFontScale(p => Math.max(0.75, Number((p - 0.15).toFixed(2))))}
                title="Thu nhỏ chữ (A-)"
                style={{
                  background: '#334155', color: '#F1F5F9', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700'
                }}
              >
                <FaSearchMinus /> A-
              </button>
              <button
                onClick={() => setFontScale(1)}
                title="Đặt lại cỡ chữ mặc định (100%)"
                style={{
                  background: fontScale === 1 ? '#0F172A' : '#2563EB',
                  color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.65rem', cursor: 'pointer', borderRadius: '6px',
                  fontSize: '0.85rem', fontWeight: '800'
                }}
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                onClick={() => setFontScale(p => Math.min(2.0, Number((p + 0.15).toFixed(2))))}
                title="Phóng to chữ (A+)"
                style={{
                  background: '#2563EB', color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.4)'
                }}
              >
                <FaSearchPlus /> A+
              </button>
            </div>

            {/* Export PowerPoint in bottom bar */}
            <button
              onClick={handleExportPowerPoint}
              disabled={exportingPptx}
              title="Xuất toàn bộ slide ra file Microsoft PowerPoint (.pptx)"
              style={{
                backgroundColor: exportingPptx ? '#92400E' : '#D97706', color: '#FFFFFF',
                border: 'none', borderRadius: '8px',
                padding: '0.45rem 0.95rem', cursor: exportingPptx ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                fontSize: '0.85rem', fontWeight: '700',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)'
              }}
            >
              {exportingPptx ? <><FaSpinner className="spinner" /> Tạo PPTX...</> : <><FaFilePowerpoint /> Xuất PPTX</>}
            </button>

            {/* Fullscreen Button in bottom bar */}
            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: '#1E293B', color: '#38BDF8',
                border: '1px solid #334155', borderRadius: '8px',
                padding: '0.45rem 0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: '700'
              }}
            >
              {isFullscreen ? <><FaCompress /> Thu nhỏ</> : <><FaExpand /> Toàn màn hình</>}
            </button>
          </div>

          {/* Right: Next button */}
          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            style={{
              padding: '0.65rem 2rem',
              backgroundColor: currentSlide === slides.length - 1 ? 'transparent' : '#2563EB',
              color: currentSlide === slides.length - 1 ? '#475569' : '#FFFFFF',
              border: `1px solid ${currentSlide === slides.length - 1 ? 'transparent' : '#3B82F6'}`,
              borderRadius: '8px',
              cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '1rem', fontWeight: '700',
              boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s'
            }}
          >
            Slide tiếp <FaChevronRight />
          </button>
        </div>

        {/* Full-screen HD Image Lightbox Modal */}
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle}
          subtitle="Trình chiếu hình ảnh y khoa độ phân giải cao"
        />
      </div>
    </div>
  );
};

export default PresentationPage;
