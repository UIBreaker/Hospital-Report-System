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
  rhm_noi_tongSo: 'RHM + Nội (Tổng số khám)',
  rhm_noi_thuThuat: 'RHM + Nội (Thủ thuật)',
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
  keToa: 'Kê toa', truyenMau: 'Truyền máu', tieuPhau: 'Tiểu phẫu', boBot: 'Bó bột',
  ccNgoaiVien: 'Cấp cứu ngoại viện', bsTrucTNT: 'Bác sĩ trực TNT',
  tnt_benhCu: 'Bệnh cũ (TNT)', tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)', tnt_chuyenVien: 'Chuyển viện (TNT)',
  tnt_chuyenKhoa: 'Chuyển khoa (TNT)', tnt_hienCon: 'Hiện còn (TNT)',
  tnt_ctdk: 'Chạy thận định kỳ', tnt_noiTru: 'Nội trú (TNT)',
  pk21_benhCu: 'Bệnh cũ (PK21)', pk21_benhMoi: 'Bệnh mới (PK21)',
  pk21_xuatVien: 'Xuất viện (PK21)', pk21_hienCon: 'Hiện còn (PK21)',
  pk21_tongSo: 'Tổng số khám (PK21)', pk21_ngoaiTru: 'Ngoại trú (PK21)',

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
      sumMetrics.push({ key: 'tong4ck_tongSo', label: 'TỔNG SỐ 4 CHUYÊN KHOA (TMH + Mắt + RHM/Nội + Da liễu)', value: String(data.tong4ck_tongSo) });
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
    if (data.rhm_noi_tongSo !== undefined && data.rhm_noi_tongSo !== '') detailMetrics.push({ key: 'rhm_noi_tongSo', label: '🦷 RHM + Nội (Tổng số)', value: String(data.rhm_noi_tongSo) });
    if (data.rhm_noi_thuThuat !== undefined && data.rhm_noi_thuThuat !== '') detailMetrics.push({ key: 'rhm_noi_thuThuat', label: '🦷 RHM + Nội (Thủ thuật)', value: String(data.rhm_noi_thuThuat) });
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

    // Hero metrics: Tổng số ca mổ & Hiện còn hồi tỉnh
    const overviewItems = [];
    if (data.tongSoCaMo !== undefined && data.tongSoCaMo !== '') {
      overviewItems.push({ key: 'tongSoCaMo', label: 'Tổng số ca mổ (Cấp cứu + Kế hoạch)', value: String(data.tongSoCaMo) });
    }
    if (data.hienCon !== undefined && data.hienCon !== '') {
      overviewItems.push({ key: 'hienCon', label: 'Bệnh nhân hiện còn theo dõi tại Hồi tỉnh', value: String(data.hienCon) });
    }
    if (overviewItems.length > 0) {
      sections.push({
        title: 'TỔNG QUAN PHẪU THUẬT & HỒI TỈNH',
        items: overviewItems
      });
    }

    // Emergency surgeries (Mổ cấp cứu)
    const ccItems = [];
    if (data.cc_ctch !== undefined && data.cc_ctch !== '') ccItems.push({ key: 'cc_ctch', label: 'Chấn thương chỉnh hình', value: String(data.cc_ctch) });
    if (data.cc_ngoaiTH !== undefined && data.cc_ngoaiTH !== '') ccItems.push({ key: 'cc_ngoaiTH', label: 'Ngoại tổng hợp', value: String(data.cc_ngoaiTH) });
    if (data.cc_san !== undefined && data.cc_san !== '') ccItems.push({ key: 'cc_san', label: 'Sản khoa', value: String(data.cc_san) });
    if (ccItems.length > 0) {
      sections.push({
        title: '🚨 MỔ CẤP CỨU',
        items: ccItems
      });
    }

    // Planned surgeries (Mổ chương trình)
    const ctItems = [];
    if (data.ct_ctch !== undefined && data.ct_ctch !== '') ctItems.push({ key: 'ct_ctch', label: 'Chấn thương chỉnh hình', value: String(data.ct_ctch) });
    if (data.ct_ngoaiTH !== undefined && data.ct_ngoaiTH !== '') ctItems.push({ key: 'ct_ngoaiTH', label: 'Ngoại tổng hợp', value: String(data.ct_ngoaiTH) });
    if (data.ct_san !== undefined && data.ct_san !== '') ctItems.push({ key: 'ct_san', label: 'Sản khoa', value: String(data.ct_san) });
    if (ctItems.length > 0) {
      sections.push({
        title: '📅 MỔ CHƯƠNG TRÌNH (KẾ HOẠCH)',
        items: ctItems
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
    // 1. Phân công bác sĩ trực TNT (nếu có)
    if (data.bsTrucTNT) {
      sections.push({
        type: 'personnel',
        title: 'BÁC SĨ TRỰC THẬN NHÂN TẠO (TNT)',
        value: String(data.bsTrucTNT)
      });
    }

    // 2. KHỐI HỒI SỨC CẤP CỨU (HSCC) — ƯU TIÊN BÁO CÁO TRƯỚC
    if (data.hscc && typeof data.hscc === 'object') {
      const hsccItems = [];
      const hsccKeyOrder = [
        'tongSoKham', 'benhCu', 'benhMoi', 'xuatVien', 'chuyenVien', 'chuyenKhoa', 'hienCon',
        'tuVong', 'keToa', 'ngoaiTru', 'tieuPhau', 'boBot', 'truyenMau', 'ccNgoaiVien'
      ];

      const hsccKeys = Object.keys(data.hscc).filter(k => k !== '_id' && data.hscc[k] !== null && data.hscc[k] !== undefined && data.hscc[k] !== '');
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

    // 3. KHỐI THẬN NHÂN TẠO (TNT) — BÁO CÁO SAU
    if (data.tnt && typeof data.tnt === 'object') {
      const tntItems = [];
      const tntKeyOrder = [
        'tnt_ctdk', 'tnt_benhCu', 'tnt_benhMoi', 'tnt_xuatVien', 'tnt_chuyenVien', 'tnt_chuyenKhoa', 'tnt_noiTru', 'tnt_hienCon'
      ];

      const tntKeys = Object.keys(data.tnt).filter(k => k !== '_id' && data.tnt[k] !== null && data.tnt[k] !== undefined && data.tnt[k] !== '');
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

    // 4. PHÒNG KHÁM 21 (nếu có)
    if (data.pk21 && typeof data.pk21 === 'object') {
      const pkItems = [];
      Object.entries(data.pk21).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && k !== '_id') {
          pkItems.push({ key: k, label: getLabel(k), value: String(v) });
        }
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

const PresentationPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100%, 1.15 = 115%, 1.3 = 130%

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

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

  const handleNext = () => { if (currentSlide < slides.length - 1) setCurrentSlide(p => p + 1); };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide(p => p - 1); };

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
      style={{
        display: 'flex', height: '100vh', width: '100vw',
        backgroundColor: '#071224', color: '#1E293B',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ===================== SIDEBAR ===================== */}
      {!isFullscreen && (
        <div className="no-print" style={{
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
            {slides.map((s, i) => {
              const isActive = currentSlide === i;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', position: 'relative' }}>

        {/* Slide Canvas Stage - Optimized to fit 100% viewport without scrollbars */}
        <div 
          ref={scrollContainerRef}
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
          <div style={{
            width: '100%',
            maxWidth: isFullscreen ? '1600px' : '1280px',
            height: isFullscreen ? 'calc(100vh - 85px)' : 'calc(100vh - 125px)',
            maxHeight: isFullscreen ? 'calc(100vh - 85px)' : 'calc(100vh - 125px)',
            margin: '0 auto',
            backgroundColor: '#FFFFFF', color: '#1E293B',
            borderRadius: '18px',
            padding: isFullscreen ? '1.4rem 2.2rem' : '1.15rem 1.65rem',
            boxShadow: '0 20px 45px -10px rgba(0,0,0,0.35)',
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zoom: fontScale,
            WebkitZoom: fontScale,
          }}>
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
                : 'linear-gradient(90deg, #1E40AF, #3B82F6, #0D9488)'
            }} />

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
                      if (totalMetricsCount <= 14) {
                        return {
                          padding: isFullscreen ? '0.68rem 1.1rem' : '0.52rem 0.85rem',
                          minHeight: isFullscreen ? '68px' : '56px',
                          labelSize: isFullscreen ? '1.02rem' : '0.85rem',
                          valueSize: isFullscreen ? '2rem' : '1.55rem',
                          badgeSize: '0.72rem',
                          gap: isFullscreen ? '0.75rem' : '0.55rem',
                          sectionHeaderMb: isFullscreen ? '0.55rem' : '0.4rem',
                          sectionHeaderPad: isFullscreen ? '0.4rem 0.9rem' : '0.3rem 0.75rem',
                          sectionHeaderFont: isFullscreen ? '1.1rem' : '0.9rem'
                        };
                      }
                      // Khoa nhiều chỉ số (HSCC - TNT: 16-18 items)
                      return {
                        padding: isFullscreen ? '0.52rem 0.9rem' : '0.38rem 0.68rem',
                        minHeight: isFullscreen ? '56px' : '46px',
                        labelSize: isFullscreen ? '0.94rem' : '0.78rem',
                        valueSize: isFullscreen ? '1.8rem' : '1.38rem',
                        badgeSize: '0.68rem',
                        gap: isFullscreen ? '0.6rem' : '0.45rem',
                        sectionHeaderMb: isFullscreen ? '0.45rem' : '0.32rem',
                        sectionHeaderPad: isFullscreen ? '0.35rem 0.85rem' : '0.25rem 0.65rem',
                        sectionHeaderFont: isFullscreen ? '1.05rem' : '0.86rem'
                      };
                    };

                    const dims = getCardDimensions();

                    // Tính số cột tự động cho từng khối để vừa khít 100% chiều ngang, không để lại khoảng trống bên phải
                    const getGridCols = (itemCount) => {
                      if (metricSectionsCount === 1) {
                        if (itemCount === 9) return isFullscreen ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)';
                        if (itemCount === 10) return isFullscreen ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)';
                        if (itemCount <= 4) return `repeat(${itemCount}, 1fr)`;
                        if (itemCount <= 6) return 'repeat(3, 1fr)';
                        if (itemCount <= 8) return 'repeat(4, 1fr)';
                        return isFullscreen ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)';
                      }

                      // Đa khối (LCK, YHCT, HSCC_TNT)
                      if (itemCount <= 2) return `repeat(${itemCount}, 1fr)`;
                      if (itemCount === 3) return 'repeat(3, 1fr)';
                      if (itemCount === 4) return 'repeat(4, 1fr)';
                      if (itemCount === 6) return 'repeat(3, 1fr)';
                      if (itemCount <= 8) return 'repeat(4, 1fr)';
                      if (itemCount <= 12) return isFullscreen ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)';
                      return isFullscreen ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)';
                    };

                    return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: dims.gap,
                      flex: 1,
                      justifyContent: totalMetricsCount <= 4 ? 'center' : 'flex-start',
                      paddingTop: '0.25rem'
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

            {/* ==================== 3. TRANSFER CASE SLIDE (PART 1: TIẾP NHẬN & XỬ TRÍ) ==================== */}
            {slide.type === 'transfer' && (() => {
              const caseImages = normalizeImages(slide.transferCase.images);
              const ageFormatted = formatPatientAge(slide.transferCase.age);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Emergency Header - Amber / Gold Theme */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '0.85rem',
                    borderBottom: '4px solid #D97706'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: isFullscreen ? '58px' : '46px', height: isFullscreen ? '58px' : '46px',
                        borderRadius: '50%', backgroundColor: '#FEF3C7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 16px rgba(217, 119, 6, 0.25)', flexShrink: 0
                      }}>
                        <FaAmbulance style={{ fontSize: isFullscreen ? '1.8rem' : '1.4rem', color: '#D97706' }} />
                      </div>
                      <div>
                        <div style={{
                          fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                          color: '#B45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px'
                        }}>
                          🚑 {slide.deptName} • CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 1: TIẾP NHẬN)
                        </div>
                        <h2 style={{
                          fontSize: isFullscreen ? '2rem' : '1.5rem',
                          color: '#92400E', fontWeight: '900', margin: 0, lineHeight: 1.15
                        }}>
                          TIẾP NHẬN BỆNH NHÂN CHUYỂN VIỆN
                        </h2>
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '55px' : '42px', height: isFullscreen ? '55px' : '42px' }} />
                  </div>

                  {/* Patient Name Banner */}
                  {(slide.transferCase.patient_name || slide.transferCase.patientName) && (
                    <div style={{
                      backgroundColor: '#FFFBEB', borderRadius: '12px',
                      border: '1.5px solid #FDE68A',
                      borderLeft: '6px solid #D97706',
                      padding: isFullscreen ? '0.8rem 1.4rem' : '0.65rem 1rem',
                      marginBottom: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      boxShadow: '0 2px 8px rgba(217,119,6,0.06)'
                    }}>
                      <span style={{ fontSize: isFullscreen ? '1.6rem' : '1.3rem' }}>👤</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: '900',
                          fontSize: isFullscreen ? '1.5rem' : '1.2rem',
                          color: '#92400E'
                        }}>
                          {slide.transferCase.patient_name || slide.transferCase.patientName}
                        </span>
                        {ageFormatted && (
                          <span style={{
                            backgroundColor: '#FEF3C7', color: '#92400E',
                            padding: '0.2rem 0.65rem', borderRadius: '6px',
                            fontWeight: '700', fontSize: isFullscreen ? '1rem' : '0.85rem'
                          }}>
                            {ageFormatted}
                          </span>
                        )}
                        {slide.transferCase.address && (
                          <span style={{ color: '#78350F', fontSize: isFullscreen ? '1.05rem' : '0.9rem', fontWeight: '600' }}>
                            • {slide.transferCase.address}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2-Column Structured Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr',
                    gap: '1rem',
                    flex: 1
                  }}>
                    {/* Left Column: Hành chính & Vào viện */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      borderLeft: '6px solid #D97706',
                      padding: isFullscreen ? '1.15rem 1.4rem' : '0.9rem 1.15rem',
                      display: 'flex', flexDirection: 'column', gap: '0.65rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.1rem' : '0.95rem',
                        fontWeight: '800', color: '#B45309',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #FDE68A', paddingBottom: '0.35rem'
                      }}>
                        ⏰ TIẾP NHẬN & LÝ DO VÀO
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><strong>Giờ vào viện:</strong> <span style={{ fontWeight: '700', color: '#D97706' }}>{slide.transferCase.admission_time || slide.transferCase.admissionTime || '—'}</span></div>
                        <div><strong>Lý do vào viện:</strong> <span style={{ color: '#0F172A', fontWeight: '600' }}>{slide.transferCase.reason || '—'}</span></div>
                        <div><strong>Xử trí ban đầu:</strong> <div style={{ color: '#1E293B', fontWeight: '600', marginTop: '2px', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>{slide.transferCase.initial_treatment || slide.transferCase.initialTreatment || '—'}</div></div>
                      </div>
                    </div>

                    {/* Right Column: Chẩn đoán & Cận lâm sàng */}
                    <div style={{
                      backgroundColor: '#FFFBEB',
                      borderRadius: '12px',
                      border: '1.5px solid #FDE68A',
                      borderLeft: '6px solid #B45309',
                      padding: isFullscreen ? '1.15rem 1.4rem' : '0.9rem 1.15rem',
                      display: 'flex', flexDirection: 'column', gap: '0.65rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.1rem' : '0.95rem',
                        fontWeight: '800', color: '#92400E',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #FDE68A', paddingBottom: '0.35rem'
                      }}>
                        🔬 KHÁM LÂM SÀNG & CẬN LÂM SÀNG
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ backgroundColor: '#FEF3C7', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                          <strong style={{ color: '#92400E' }}>Chẩn đoán xác định:</strong>
                          <div style={{ color: '#B45309', fontWeight: '800', fontSize: isFullscreen ? '1.2rem' : '1.05rem', marginTop: '2px' }}>
                            {slide.transferCase.diagnosis || '—'}
                          </div>
                        </div>
                        {(slide.transferCase.clinical_symptoms || slide.transferCase.clinicalSymptoms) && (
                          <div>
                            <strong>Lâm sàng / Triệu chứng khám:</strong>
                            <div style={{ color: '#1E293B', fontWeight: '600', marginTop: '2px' }}>{slide.transferCase.clinical_symptoms || slide.transferCase.clinicalSymptoms}</div>
                          </div>
                        )}
                        <div>
                          <strong>Cận lâm sàng / X-Quang / XN:</strong>
                          <div style={{ color: '#1E293B', fontWeight: '600', marginTop: '2px' }}>{slide.transferCase.clinical_tests || slide.transferCase.clinicalTests || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Image Slide Notification Badge */}
                  {caseImages.length > 0 && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FEF3C7',
                      border: '1.5px dashed #D97706',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#92400E', fontWeight: '700',
                      fontSize: isFullscreen ? '0.92rem' : '0.82rem'
                    }}>
                      <span>📷 Ca bệnh này có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
                      <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 4. TRANSFER CASE SLIDE (PART 2: DIỄN BIẾN & TÌNH TRẠNG CHUYỂN) ==================== */}
            {slide.type === 'transfer_progress' && (() => {
              const caseImages = normalizeImages(slide.transferCase.images);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '0.85rem',
                    borderBottom: '4px solid #D97706'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: isFullscreen ? '58px' : '46px', height: isFullscreen ? '58px' : '46px',
                        borderRadius: '50%', backgroundColor: '#FEF3C7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 16px rgba(217, 119, 6, 0.25)', flexShrink: 0
                      }}>
                        <span style={{ fontSize: isFullscreen ? '1.8rem' : '1.4rem' }}>📝</span>
                      </div>
                      <div>
                        <div style={{
                          fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                          color: '#B45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px'
                        }}>
                          🚑 {slide.deptName} • CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 2: DIỄN BIẾN)
                        </div>
                        <h2 style={{
                          fontSize: isFullscreen ? '2rem' : '1.5rem',
                          color: '#92400E', fontWeight: '900', margin: 0, lineHeight: 1.15
                        }}>
                          DIỄN BIẾN • HỘI CHẨN • TÌNH TRẠNG CHUYỂN
                        </h2>
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '55px' : '42px', height: isFullscreen ? '55px' : '42px' }} />
                  </div>

                  {/* Patient Summary Quick Bar */}
                  <div style={{
                    backgroundColor: '#EFF6FF', borderRadius: '10px',
                    border: '1.5px solid #BFDBFE',
                    borderLeft: '5px solid #2563EB',
                    padding: isFullscreen ? '0.65rem 1.2rem' : '0.55rem 0.9rem',
                    marginBottom: '0.85rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: isFullscreen ? '1.15rem' : '0.95rem', fontWeight: '800', color: '#1E40AF' }}>
                      👤 Bệnh nhân: <span style={{ color: '#0F2C59' }}>{slide.transferCase.patient_name || slide.transferCase.patientName || 'Bệnh nhân'}</span>
                    </div>
                    {slide.transferCase.diagnosis && (
                      <div style={{ fontSize: isFullscreen ? '1.05rem' : '0.9rem', fontWeight: '700', color: '#92400E' }}>
                        🏥 Chẩn đoán: <span style={{ color: '#78350F' }}>{slide.transferCase.diagnosis}</span>
                      </div>
                    )}
                  </div>

                  {/* Full-width Dedicated Progress Notes Big Box */}
                  <div style={{
                    flex: 1,
                    backgroundColor: '#FFFBEB',
                    borderRadius: '14px',
                    border: '2px solid #FDE68A',
                    borderLeft: '8px solid #D97706',
                    padding: isFullscreen ? '1.4rem 1.8rem' : '1.1rem 1.4rem',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: isFullscreen ? '1.2rem' : '1rem',
                      fontWeight: '900', color: '#92400E',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '1.5px solid #FDE68A', paddingBottom: '0.5rem'
                    }}>
                      <span>📋</span>
                      <span>NỘI DUNG DIỄN BIẾN, HỘI CHẨN & TÌNH TRẠNG CHUYỂN VIỆN:</span>
                    </div>

                    <div style={{
                      fontSize: isFullscreen ? '1.35rem' : '1.12rem',
                      lineHeight: '1.7',
                      color: '#0F172A',
                      fontWeight: '600',
                      whiteSpace: 'pre-wrap',
                      flex: 1
                    }}>
                      {slide.transferCase.progress_notes ? (
                        slide.transferCase.progress_notes
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                          (Không có ghi chú diễn biến bổ sung cho ca bệnh này)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Next Image Slide Notification Badge */}
                  {caseImages.length > 0 && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FEF3C7',
                      border: '1.5px dashed #D97706',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#92400E', fontWeight: '700',
                      fontSize: isFullscreen ? '0.92rem' : '0.82rem'
                    }}>
                      <span>📷 Ca bệnh này có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
                      <span style={{ fontStyle: 'italic', color: '#B45309' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 5. SURGERY CASE SLIDE ==================== */}
            {slide.type === 'surgery' && (() => {
              const caseImages = normalizeImages(slide.surgeryCase.images);
              const ageFormatted = formatPatientAge(slide.surgeryCase.birth_year || slide.surgeryCase.birthYear || slide.surgeryCase.age);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Header Banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '0.85rem',
                    borderBottom: '4px solid #0284C7'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                        fontWeight: '800', color: '#0369A1',
                        textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '0.2rem'
                      }}>
                        BÁO CÁO PHẪU THUẬT (BỆNH MỔ) • {slide.deptName}
                      </div>
                      <div style={{
                        fontSize: isFullscreen ? '2.1rem' : '1.55rem',
                        fontWeight: '900', color: '#0F2C59',
                        display: 'flex', alignItems: 'center', gap: '0.6rem'
                      }}>
                        <FaProcedures style={{ color: '#0284C7' }} />
                        Ca Mổ #{slide.caseIndex} / {slide.totalCases}
                      </div>
                    </div>

                    <div style={{
                      padding: '0.4rem 1rem', backgroundColor: '#E0F2FE',
                      borderRadius: '999px', border: '1.5px solid #BAE6FD',
                      fontSize: isFullscreen ? '1rem' : '0.85rem',
                      fontWeight: '800', color: '#0369A1'
                    }}>
                      🔪 Phẫu thuật trong ca trực
                    </div>
                  </div>

                  {/* 2-Column Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: '1.1rem',
                    flex: 1
                  }}>
                    {/* Left Column: Thông tin hành chính & vào viện */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '14px',
                      border: '1.5px solid #E2E8F0',
                      borderLeft: '6px solid #0284C7',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.65rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#0369A1',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #BAE6FD', paddingBottom: '0.35rem'
                      }}>
                        👤 HÀNH CHÍNH & LÝ DO VÀO VIỆN
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        <div><strong>Họ và tên:</strong> <span style={{ color: '#0369A1', fontWeight: '800', fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>{slide.surgeryCase.patient_name || slide.surgeryCase.patientName || '—'}</span></div>
                        <div><strong>Năm sinh / Tuổi:</strong> {ageFormatted || '—'}</div>
                        <div><strong>Địa chỉ:</strong> {slide.surgeryCase.address || '—'}</div>
                        <div><strong>Thời gian vào viện:</strong> <span style={{ fontWeight: '700' }}>{slide.surgeryCase.admission_time || slide.surgeryCase.admissionTime || '—'}</span></div>
                        <div><strong>Lý do nhập viện:</strong> <span style={{ color: '#DC2626', fontWeight: '700' }}>{slide.surgeryCase.reason || '—'}</span></div>
                      </div>
                    </div>

                    {/* Right Column: Chuyên môn mổ */}
                    <div style={{
                      backgroundColor: '#F0F9FF',
                      borderRadius: '14px',
                      border: '1.5px solid #BAE6FD',
                      borderLeft: '6px solid #0369A1',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.65rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#0369A1',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #BAE6FD', paddingBottom: '0.35rem'
                      }}>
                        📋 QUÁ TRÌNH PHẪU THUẬT & HẬU PHẪU
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        {(slide.surgeryCase.clinical_symptoms || slide.surgeryCase.clinicalSymptoms) && (
                          <div>
                            <strong>Lâm sàng / Triệu chứng khám:</strong>
                            <div style={{ color: '#0369A1', fontWeight: '600' }}>{slide.surgeryCase.clinical_symptoms || slide.surgeryCase.clinicalSymptoms}</div>
                          </div>
                        )}
                        {(slide.surgeryCase.clinical_tests || slide.surgeryCase.clinicalTests) && (
                          <div>
                            <strong>Cận lâm sàng / SA / XQ / XN:</strong>
                            <div style={{ color: '#1E293B' }}>{slide.surgeryCase.clinical_tests || slide.surgeryCase.clinicalTests}</div>
                          </div>
                        )}
                        <div>
                          <strong>Chẩn đoán trước mổ:</strong>
                          <div style={{ color: '#0369A1', fontWeight: '700' }}>{slide.surgeryCase.preoperative_diagnosis || slide.surgeryCase.preoperativeDiagnosis || '—'}</div>
                        </div>
                        <div>
                          <strong>Lệnh mổ / Hội chẩn:</strong>
                          <div style={{ color: '#1E293B' }}>{slide.surgeryCase.consultation_order || slide.surgeryCase.consultationOrder || '—'}</div>
                        </div>
                        <div>
                          <strong>Chẩn đoán sau mổ:</strong>
                          <div style={{ color: '#166534', fontWeight: '700' }}>{slide.surgeryCase.postoperative_diagnosis || slide.surgeryCase.postoperativeDiagnosis || '—'}</div>
                        </div>
                        <div>
                          <strong>Tình trạng hiện tại:</strong>
                          <div style={{ color: '#0F172A', fontWeight: '600', backgroundColor: '#FFFFFF', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
                            {slide.surgeryCase.current_status || slide.surgeryCase.currentStatus || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Image Slide Notification Badge */}
                  {caseImages.length > 0 && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#E0F2FE',
                      border: '1.5px dashed #0284C7',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#0369A1', fontWeight: '700',
                      fontSize: isFullscreen ? '0.92rem' : '0.82rem'
                    }}>
                      <span>📷 Ca mổ này có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
                      <span style={{ fontStyle: 'italic' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 6. DEATH CASE SLIDE ==================== */}
            {slide.type === 'death' && (() => {
              const caseImages = normalizeImages(slide.deathCase.images);
              const ageFormatted = formatPatientAge(slide.deathCase.age);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Header Banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '0.85rem',
                    borderBottom: '4px solid #DC2626'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                        fontWeight: '800', color: '#991B1B',
                        textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '0.2rem'
                      }}>
                        BÁO CÁO BỆNH NHÂN TỬ VONG • {slide.deptName}
                      </div>
                      <div style={{
                        fontSize: isFullscreen ? '2.1rem' : '1.55rem',
                        fontWeight: '900', color: '#DC2626',
                        display: 'flex', alignItems: 'center', gap: '0.6rem'
                      }}>
                        <FaExclamationTriangle style={{ color: '#DC2626' }} />
                        Hồ Sơ Tử Vong #{slide.caseIndex} / {slide.totalCases}
                      </div>
                    </div>

                    <div style={{
                      padding: '0.4rem 1rem', backgroundColor: '#FEE2E2',
                      borderRadius: '999px', border: '1.5px solid #F87171',
                      fontSize: isFullscreen ? '1rem' : '0.85rem',
                      fontWeight: '900', color: '#991B1B',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      <FaHeartbeat /> CẢNH BÁO TỬ VONG
                    </div>
                  </div>

                  {/* 2-Column Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: '1.1rem',
                    flex: 1
                  }}>
                    {/* Left Column: Tiếp nhận & Tình trạng vào viện */}
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      borderRadius: '14px',
                      border: '1.5px solid #FECACA',
                      borderLeft: '6px solid #DC2626',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.55rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#991B1B',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #FECACA', paddingBottom: '0.35rem'
                      }}>
                        👤 HÀNH CHÍNH & TÌNH TRẠNG LÚC VÀO
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        <div><strong>Họ và tên:</strong> <span style={{ color: '#991B1B', fontWeight: '800', fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>{slide.deathCase.patient_name || slide.deathCase.patientName || '—'}</span></div>
                        <div><strong>Tuổi / Năm sinh:</strong> {ageFormatted || '—'} • <strong>Địa chỉ:</strong> {slide.deathCase.address || '—'}</div>
                        <div><strong>Thời gian vào viện:</strong> <span style={{ fontWeight: '700' }}>{slide.deathCase.admission_time || slide.deathCase.admissionTime || '—'}</span></div>
                        <div><strong>Lý do vào viện:</strong> {slide.deathCase.reason || '—'}</div>
                        <div><strong>Tình trạng lúc vào khoa:</strong> <div style={{ color: '#7F1D1D', fontWeight: '600' }}>{slide.deathCase.admission_status || slide.deathCase.admissionStatus || '—'}</div></div>
                        <div><strong>Tiền sử bệnh:</strong> {slide.deathCase.medical_history || slide.deathCase.medicalHistory || '—'}</div>
                      </div>
                    </div>

                    {/* Right Column: Chẩn đoán & Xử trí hồi sinh */}
                    <div style={{
                      backgroundColor: '#FFF1F2',
                      borderRadius: '14px',
                      border: '1.5px solid #FECDD3',
                      borderLeft: '6px solid #E11D48',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.55rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#9F1239',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #FECDD3', paddingBottom: '0.35rem'
                      }}>
                        ⚡ CHẨN ĐOÁN & HỒI SỨC CẤP CỨU
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        <div style={{ backgroundColor: '#FEE2E2', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                          <strong style={{ color: '#991B1B' }}>Chẩn đoán tử vong:</strong>
                          <div style={{ color: '#DC2626', fontWeight: '800', fontSize: isFullscreen ? '1.2rem' : '1.05rem', marginTop: '2px' }}>
                            {slide.deathCase.diagnosis || '—'}
                          </div>
                        </div>
                        {(slide.deathCase.clinical_symptoms || slide.deathCase.clinicalSymptoms) && (
                          <div>
                            <strong>Lâm sàng / Triệu chứng lúc cấp cứu:</strong>
                            <div style={{ color: '#991B1B', fontWeight: '600' }}>{slide.deathCase.clinical_symptoms || slide.deathCase.clinicalSymptoms}</div>
                          </div>
                        )}
                        <div>
                          <strong>Cận lâm sàng / ECG:</strong>
                          <div style={{ color: '#334155' }}>{slide.deathCase.clinical_tests || slide.deathCase.clinicalTests || '—'}</div>
                        </div>
                        <div>
                          <strong>Xử trí cấp cứu:</strong>
                          <div style={{ color: '#0F172A', fontWeight: '600' }}>{slide.deathCase.emergency_treatment || slide.deathCase.emergencyTreatment || '—'}</div>
                        </div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <strong>Kết quả & Hướng xử lý:</strong>
                          <div style={{ color: '#1E293B', fontWeight: '700' }}>{slide.deathCase.final_outcome || slide.deathCase.finalOutcome || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Image Slide Notification Badge */}
                  {caseImages.length > 0 && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FEE2E2',
                      border: '1.5px dashed #DC2626',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#991B1B', fontWeight: '700',
                      fontSize: isFullscreen ? '0.92rem' : '0.82rem'
                    }}>
                      <span>📷 Hồ sơ tử vong có <strong>{caseImages.length} hình ảnh minh họa</strong></span>
                      <span style={{ fontStyle: 'italic' }}>(Xem ở Slide tiếp theo ➔)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 7. CRITICAL CASE SLIDE (PURPLE THEME) ==================== */}
            {slide.type === 'critical' && (() => {
              const caseImages = normalizeImages(slide.criticalCase.images);
              const ageFormatted = formatPatientAge(slide.criticalCase.age);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {/* Header Banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.85rem', marginBottom: '0.85rem',
                    borderBottom: '4px solid #7C3AED'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '0.95rem' : '0.8rem',
                        fontWeight: '800', color: '#6D28D9',
                        textTransform: 'uppercase', letterSpacing: '1.2px'
                      }}>
                        ⚡ {slide.deptName} • CA BỆNH NẶNG THEO DÕI {slide.caseIndex}/{slide.totalCases}
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.2rem' : '1.65rem',
                        color: '#4C1D95', fontWeight: '900', margin: 0, lineHeight: 1.15
                      }}>
                        {slide.criticalCase.patient_name || slide.criticalCase.patientName || 'BỆNH NHÂN NẶNG'}
                      </h2>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '60px' : '45px', height: isFullscreen ? '60px' : '45px' }} />
                  </div>

                  {/* 2-Column Split Layout */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.35fr',
                    gap: '1.1rem',
                    flex: 1
                  }}>
                    {/* Left Column: Hành chính & Tiền căn */}
                    <div style={{
                      backgroundColor: '#FAF5FF',
                      borderRadius: '14px',
                      border: '1.5px solid #DDD6FE',
                      borderLeft: '6px solid #7C3AED',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.55rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#5B21B6',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #DDD6FE', paddingBottom: '0.35rem'
                      }}>
                        👤 HÀNH CHÍNH & VÀO VIỆN
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        <div>
                          <strong>Họ và tên BN:</strong>{' '}
                          <span style={{ color: '#5B21B6', fontWeight: '800', fontSize: isFullscreen ? '1.3rem' : '1.1rem' }}>
                            {slide.criticalCase.patient_name || slide.criticalCase.patientName || '—'}
                          </span>
                        </div>
                        <div>
                          <strong>Tuổi / Năm sinh:</strong> {ageFormatted || '—'}
                        </div>
                        <div>
                          <strong>Địa chỉ / Phường xã:</strong> {slide.criticalCase.address || '—'}
                        </div>
                        <div>
                          <strong>Thời gian vào viện (VV):</strong>{' '}
                          <span style={{ fontWeight: '700', color: '#6D28D9' }}>
                            {slide.criticalCase.admission_time || slide.criticalCase.admissionTime || '—'}
                          </span>
                        </div>
                        <div style={{ backgroundColor: '#EDE9FE', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DDD6FE', marginTop: '2px' }}>
                          <strong style={{ color: '#5B21B6' }}>Tiền căn bệnh:</strong>
                          <div style={{ color: '#3B0764', fontWeight: '600', marginTop: '2px' }}>
                            {slide.criticalCase.medical_history || slide.criticalCase.medicalHistory || 'Chưa ghi nhận tiền căn đặc biệt'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Chẩn đoán, Tình trạng & Xử trí */}
                    <div style={{
                      backgroundColor: '#F5F3FF',
                      borderRadius: '14px',
                      border: '1.5px solid #DDD6FE',
                      borderLeft: '6px solid #8B5CF6',
                      padding: isFullscreen ? '1.25rem 1.5rem' : '0.95rem 1.2rem',
                      display: 'flex', flexDirection: 'column', gap: '0.55rem'
                    }}>
                      <div style={{
                        fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                        fontWeight: '900', color: '#6D28D9',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #DDD6FE', paddingBottom: '0.35rem'
                      }}>
                        📋 CHẨN ĐOÁN, DIỄN BIẾN & ĐIỀU TRỊ
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>
                        {/* Chẩn đoán Box */}
                        <div style={{ backgroundColor: '#EDE9FE', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #C4B5FD' }}>
                          <strong style={{ color: '#5B21B6' }}>Chẩn đoán bệnh:</strong>
                          <div style={{ color: '#6D28D9', fontWeight: '800', fontSize: isFullscreen ? '1.2rem' : '1.05rem', marginTop: '2px' }}>
                            {slide.criticalCase.diagnosis || '—'}
                          </div>
                        </div>

                        {(slide.criticalCase.clinical_symptoms || slide.criticalCase.clinicalSymptoms) && (
                          <div>
                            <strong>Lâm sàng / Triệu chứng khám:</strong>
                            <div style={{ color: '#5B21B6', fontWeight: '600' }}>{slide.criticalCase.clinical_symptoms || slide.criticalCase.clinicalSymptoms}</div>
                          </div>
                        )}

                        {(slide.criticalCase.clinical_tests || slide.criticalCase.clinicalTests) && (
                          <div>
                            <strong>Cận lâm sàng / X-Quang / XN:</strong>
                            <div style={{ color: '#1E1B4B' }}>{slide.criticalCase.clinical_tests || slide.criticalCase.clinicalTests}</div>
                          </div>
                        )}

                        {/* Tình trạng & Diễn biến */}
                        <div>
                          <strong>Tình trạng bệnh & Diễn biến:</strong>
                          <div style={{
                            color: '#0F172A',
                            fontWeight: '600',
                            backgroundColor: '#FFFFFF',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {slide.criticalCase.condition_summary || slide.criticalCase.conditionSummary || 'Chưa có ghi nhận diễn biến'}
                          </div>
                        </div>

                        {/* Xử trí */}
                        <div>
                          <strong>Xử trí điều trị:</strong>
                          <div style={{ color: '#1E1B4B', fontWeight: '600' }}>
                            {slide.criticalCase.treatment || '—'}
                          </div>
                        </div>

                        {/* Hướng tiếp theo */}
                        <div style={{ backgroundColor: '#FAF5FF', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px dashed #A78BFA' }}>
                          <strong style={{ color: '#6D28D9' }}>Hướng tiếp theo:</strong>
                          <div style={{ color: '#4C1D95', fontWeight: '700', marginTop: '2px' }}>
                            {slide.criticalCase.notes || 'Bàn giao tua sau theo dõi tiếp'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Image Slide Notification Badge */}
                  {caseImages.length > 0 && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FAF5FF',
                      border: '1.5px dashed #7C3AED',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#6D28D9', fontWeight: '700',
                      fontSize: isFullscreen ? '0.92rem' : '0.82rem'
                    }}>
                      <span>📷 Ca bệnh này có <strong>{caseImages.length} hình ảnh minh họa lâm sàng</strong></span>
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
                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.6)',
                        cursor: 'zoom-in',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => handleOpenLightbox([slide.image], 0, `${slide.caseItem.patient_name || slide.caseItem.patientName || 'Bệnh nhân'} - Ảnh ${slide.imgIndex}/${slide.totalImages}`)}
                      title="Nhấp để phóng to toàn màn hình (HD Lightbox)"
                    />

                    {/* Caption & Full-screen trigger */}
                    <div style={{
                      marginTop: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      maxWidth: '900px',
                      color: '#94A3B8',
                      fontSize: isFullscreen ? '0.95rem' : '0.82rem'
                    }}>
                      <span>
                        📷 Ảnh minh họa #{slide.imgIndex} / {slide.totalImages}
                      </span>

                      <button
                        onClick={() => handleOpenLightbox([slide.image], 0, `${slide.caseItem.patient_name || slide.caseItem.patientName || 'Bệnh nhân'} - Ảnh ${slide.imgIndex}/${slide.totalImages}`)}
                        style={{
                          backgroundColor: slide.themeColor,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem 0.85rem',
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                      >
                        <FaExpand /> Phóng to toàn màn hình (HD Lightbox)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                onClick={() => setFontScale(p => Math.max(0.8, Number((p - 0.2).toFixed(1))))}
                title="Thu nhỏ chữ"
                style={{
                  background: '#334155', color: '#F1F5F9', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700'
                }}
              >
                <FaSearchMinus /> Giảm
              </button>
              <button
                onClick={() => setFontScale(1)}
                title="Đặt lại cỡ chữ mặc định (100%)"
                style={{
                  background: fontScale === 1 ? '#0F172A' : '#2563EB',
                  color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.6rem', cursor: 'pointer', borderRadius: '6px',
                  fontSize: '0.85rem', fontWeight: '800'
                }}
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                onClick={() => setFontScale(p => Math.min(1.8, Number((p + 0.2).toFixed(1))))}
                title="Phóng to chữ"
                style={{
                  background: '#2563EB', color: '#FFFFFF', border: 'none',
                  padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.85rem', fontWeight: '700',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.4)'
                }}
              >
                <FaSearchPlus /> Phóng to
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
