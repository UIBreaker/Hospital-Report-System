import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExpand, FaCompress, FaPrint, FaChevronLeft, FaChevronRight, FaSpinner, FaAmbulance, FaArrowLeft, FaSearchPlus, FaSearchMinus, FaHeartbeat, FaProcedures, FaExclamationTriangle } from 'react-icons/fa';
import reportService from '../services/reportService';

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

  // ================= 3. KHOA NHIỄM (NHIEM) =================
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

  // ================= 4. CHẨN ĐOÁN HÌNH ẢNH (CDHA) =================
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

  // ================= 5. UNIVERSAL / MULTI-BLOCK PARSER =================
  const topKeys = Object.keys(data).filter(k => k !== '_id');
  const hasNestedObjects = topKeys.some(k => data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]));

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100%, 1.15 = 115%, 1.3 = 130%

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
        });
      }

      // Slide Ca Chuyển Viện (Phần 1 & Phần 2)
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
        });
      }
    });
    return s;
  }, [reports]);

  const handleNext = () => { if (currentSlide < slides.length - 1) setCurrentSlide(p => p + 1); };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide(p => p - 1); };

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
                      : s.type === 'transfer' ? `🚑 CV (Ca ${s.caseIndex} - P1: Tiếp nhận)`
                      : s.type === 'transfer_progress' ? `📝 CV (Ca ${s.caseIndex} - P2: Diễn biến)`
                      : `📋 ${s.title}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar footer tools */}
          <div style={{ padding: '0.85rem', borderTop: '1px solid #1E293B', display: 'flex', gap: '0.5rem', backgroundColor: '#0B132B' }}>
            <button
              onClick={() => window.print()}
              style={{
                flex: 1, padding: '0.6rem', backgroundColor: '#1E293B', color: '#E2E8F0',
                border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                fontSize: '0.8rem', fontWeight: '600'
              }}
            >
              <FaPrint /> In Báo Cáo
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toàn màn hình (F)"
              style={{
                padding: '0.6rem 0.9rem', backgroundColor: '#2563EB', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <FaExpand />
            </button>
          </div>
        </div>
      )}

      {/* ===================== MAIN STAGE ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', position: 'relative' }}>

        {/* Slide Canvas Scroll Container - FIXED TOP CLIPPING & AUTO SCROLL RESET */}
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isFullscreen ? '2rem 3rem 4rem' : '1.5rem 2rem 3rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: isFullscreen ? '1560px' : '1200px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF', color: '#1E293B',
            borderRadius: '20px',
            padding: isFullscreen ? '3rem 4rem' : '2.2rem 3rem',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.25s ease-out',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            zoom: fontScale,
            WebkitZoom: fontScale,
          }}>
            {/* Top decorative gradient line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
              background: slide.type === 'title'
                ? 'linear-gradient(90deg, #0F2C59, #D32F2F, #2E7D32)'
                : slide.type === 'transfer'
                ? 'linear-gradient(90deg, #DC2626, #EA580C)'
                : 'linear-gradient(90deg, #1E40AF, #3B82F6, #0D9488)'
            }} />

            {/* ==================== 1. TITLE SLIDE ==================== */}
            {slide.type === 'title' && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                padding: '2.5rem 1rem', gap: '2rem'
              }}>
                <div style={{
                  width: isFullscreen ? '150px' : '120px',
                  height: isFullscreen ? '150px' : '120px',
                  borderRadius: '50%', backgroundColor: '#FFF',
                  boxShadow: '0 20px 45px rgba(15,44,89,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
                }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                    color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '2.5px', marginBottom: '0.6rem'
                  }}>
                    TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                  </div>
                  <h1 style={{
                    fontSize: isFullscreen ? '4.2rem' : '3.2rem',
                    color: '#0F2C59', fontWeight: '900', margin: '0 0 1.25rem',
                    letterSpacing: '-1.5px', lineHeight: 1.15
                  }}>
                    BÁO CÁO GIAO BAN
                  </h1>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    fontSize: isFullscreen ? '1.6rem' : '1.25rem',
                    color: '#1E293B', fontWeight: '800',
                    padding: '0.85rem 2.75rem',
                    backgroundColor: '#EFF6FF', borderRadius: '999px',
                    border: '2px solid #BFDBFE',
                    boxShadow: '0 4px 15px rgba(59,130,246,0.12)'
                  }}>
                    📅 {formatDate(date)}
                  </div>
                </div>

                {reports.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '2.5rem', marginTop: '1.5rem',
                    flexWrap: 'wrap', justifyContent: 'center'
                  }}>
                    <div style={{
                      backgroundColor: '#F8FAFC', border: '2px solid #E2E8F0',
                      borderRadius: '16px', padding: '1.25rem 2.5rem', minWidth: '200px'
                    }}>
                      <div style={{ fontSize: isFullscreen ? '3.2rem' : '2.4rem', fontWeight: '900', color: '#1E40AF', lineHeight: 1 }}>
                        {reports.length}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem' }}>
                        Khoa phòng đã nộp
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#FEF2F2', border: '2px solid #FECACA',
                      borderRadius: '16px', padding: '1.25rem 2.5rem', minWidth: '200px'
                    }}>
                      <div style={{ fontSize: isFullscreen ? '3.2rem' : '2.4rem', fontWeight: '900', color: '#DC2626', lineHeight: 1 }}>
                        {reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0)}
                      </div>
                      <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#991B1B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem' }}>
                        Ca chuyển viện
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 2. DEPARTMENT SLIDE ==================== */}
            {slide.type === 'department' && (() => {
              const sections = parseDepartmentSections(slide.report.report_data, slide.report.department_code);
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Department top banner */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '1.5rem', marginBottom: '1.75rem',
                    borderBottom: '4px solid #1E40AF'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '1rem' : '0.85rem',
                        color: '#DC2626', fontWeight: '800', textTransform: 'uppercase',
                        letterSpacing: '2px', marginBottom: '0.35rem'
                      }}>
                        TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.8rem' : '2.1rem',
                        color: '#0F2C59', fontWeight: '900', margin: 0, lineHeight: 1.2
                      }}>
                        {slide.title}
                      </h2>
                      <div style={{
                        marginTop: '0.75rem',
                        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: '#EFF6FF', color: '#1E40AF',
                          padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '700',
                          fontSize: isFullscreen ? '1.15rem' : '0.95rem', border: '1px solid #BFDBFE'
                        }}>
                          👨‍⚕️ Bác sĩ trực: <strong>{slide.report.doctor_name}</strong>
                        </span>

                        {slide.report.nurse_name && (
                          <span style={{
                            backgroundColor: '#F0FDF4', color: '#065F46',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '700',
                            fontSize: isFullscreen ? '1.15rem' : '0.95rem', border: '1px solid #BBF7D0'
                          }}>
                            👩‍⚕️ Điều dưỡng: <strong>{slide.report.nurse_name}</strong>
                          </span>
                        )}

                        {slide.report.overtime_staff && Array.isArray(slide.report.overtime_staff) && slide.report.overtime_staff.length > 0 && (
                          <span style={{
                            backgroundColor: '#FEF3C7', color: '#92400E',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '700',
                            fontSize: isFullscreen ? '1.05rem' : '0.9rem', border: '1px solid #FDE68A'
                          }}>
                            ⏰ Tăng cường: <strong>{slide.report.overtime_staff.map(ot => `${ot.staffName} (${ot.time})`).join(', ')}</strong>
                          </span>
                        )}

                        {slide.report.room && (
                          <span style={{
                            backgroundColor: '#F1F5F9', color: '#334155',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '1.05rem' : '0.9rem'
                          }}>
                            🏥 Phòng: <strong>{slide.report.room}</strong>
                          </span>
                        )}
                        {slide.report.shift_time && (
                          <span style={{
                            backgroundColor: '#F8FAFC', color: '#475569',
                            padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: '600',
                            fontSize: isFullscreen ? '1.05rem' : '0.9rem', border: '1px solid #CBD5E1'
                          }}>
                            ⏱️ Ca: <strong>{slide.report.shift_time}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '80px' : '60px', height: isFullscreen ? '80px' : '60px', flexShrink: 0 }} />
                  </div>

                  {/* Section & Metric Grid */}
                  {sections.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                                fontWeight: '800', color: '#0F2C59',
                                backgroundColor: '#EFF6FF',
                                padding: '0.6rem 1.2rem', borderRadius: '8px',
                                borderLeft: '5px solid #2563EB',
                                marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px'
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
                                fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                                fontWeight: '800', color: '#0F2C59',
                                backgroundColor: '#EFF6FF',
                                padding: '0.6rem 1.2rem', borderRadius: '8px',
                                borderLeft: '5px solid #2563EB',
                                marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px'
                              }}>
                                {section.title}
                              </div>
                            )}

                            {section.items && (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: isFullscreen
                                  ? 'repeat(auto-fit, minmax(280px, 1fr))'
                                  : 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: isFullscreen ? '1.1rem' : '0.85rem'
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
                                        padding: isFullscreen ? '1rem 1.4rem' : '0.75rem 1.1rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        transition: 'transform 0.15s',
                                        minHeight: isFullscreen ? '90px' : '75px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingRight: '0.5rem' }}>
                                        <span style={{
                                          fontSize: isFullscreen ? '1.15rem' : '0.95rem',
                                          fontWeight: '700', color: style.label,
                                          lineHeight: 1.3
                                        }}>
                                          {item.label}
                                        </span>
                                        {style.badge && (
                                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#DC2626' }}>
                                            {style.badge}
                                          </span>
                                        )}
                                      </div>
                                      <span style={{
                                        fontSize: isFullscreen ? '2.4rem' : '1.8rem',
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
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '1.4rem', paddingTop: '4rem' }}>
                      Không có số liệu báo cáo nào trong ca trực
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ==================== 3. TRANSFER CASE SLIDE (PART 1: TIẾP NHẬN & XỬ TRÍ) ==================== */}
            {slide.type === 'transfer' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Emergency Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: '1.5rem',
                  borderBottom: '4px solid #DC2626'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: isFullscreen ? '70px' : '56px', height: isFullscreen ? '70px' : '56px',
                      borderRadius: '50%', backgroundColor: '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)'
                    }}>
                      <FaAmbulance style={{ fontSize: isFullscreen ? '2.4rem' : '1.8rem', color: '#DC2626' }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                        color: '#991B1B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px'
                      }}>
                        🚑 {slide.deptName} • CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 1: TIẾP NHẬN & XỬ TRÍ)
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.4rem' : '1.8rem',
                        color: '#DC2626', fontWeight: '900', margin: 0, lineHeight: 1.15
                      }}>
                        THÔNG TIN TIẾP NHẬN BỆNH NHÂN CHUYỂN VIỆN
                      </h2>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '70px' : '50px', height: isFullscreen ? '70px' : '50px' }} />
                </div>

                {/* Patient Name Banner */}
                {slide.transferCase.patient_name && (
                  <div style={{
                    backgroundColor: '#FEF2F2', borderRadius: '16px',
                    border: '2px solid #FCA5A5',
                    borderLeft: '8px solid #DC2626',
                    padding: isFullscreen ? '1.25rem 2rem' : '0.9rem 1.4rem',
                    marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 4px 15px rgba(220,38,38,0.08)'
                  }}>
                    <span style={{ fontSize: isFullscreen ? '2.2rem' : '1.6rem' }}>👤</span>
                    <div>
                      <div style={{ fontSize: isFullscreen ? '0.9rem' : '0.75rem', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Họ tên • Tuổi • Địa chỉ bệnh nhân:
                      </div>
                      <div style={{
                        fontWeight: '900',
                        fontSize: isFullscreen ? '1.85rem' : '1.4rem',
                        color: '#991B1B', lineHeight: 1.3
                      }}>
                        {slide.transferCase.patient_name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Details Structured Grid (Excluding progress_notes which is on Part 2) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isFullscreen ? '1.1rem' : '0.85rem' }}>
                  {[
                    { icon: '⏰', label: 'Giờ / Ngày vào viện', value: slide.transferCase.admission_time, highlight: false },
                    { icon: '📋', label: 'Lý do vào viện', value: slide.transferCase.reason, highlight: false },
                    { icon: '🔬', label: 'Cận lâm sàng / X-Quang / Xét nghiệm', value: slide.transferCase.clinical_tests, highlight: false },
                    { icon: '🏥', label: 'Chẩn đoán xác định', value: slide.transferCase.diagnosis, highlight: true },
                    { icon: '💊', label: 'Xử trí ban đầu', value: slide.transferCase.initial_treatment, highlight: false },
                  ].filter(item => item.value).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: item.highlight ? '#FEF3C7' : '#F8FAFC',
                        borderRadius: '12px',
                        border: `1.5px solid ${item.highlight ? '#FCD34D' : '#E2E8F0'}`,
                        borderLeft: `6px solid ${item.highlight ? '#D97706' : '#3B82F6'}`,
                        padding: isFullscreen ? '1rem 1.5rem' : '0.8rem 1.2rem',
                        display: 'flex', gap: '1rem', alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: isFullscreen ? '1.5rem' : '1.2rem', marginTop: '2px' }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '800',
                          color: item.highlight ? '#92400E' : '#1E40AF',
                          fontSize: isFullscreen ? '1.05rem' : '0.9rem',
                          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem'
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          color: '#0F172A',
                          lineHeight: '1.6', whiteSpace: 'pre-wrap',
                          fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                          fontWeight: '600'
                        }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== 4. TRANSFER CASE SLIDE (PART 2: DIỄN BIẾN & TÌNH TRẠNG CHUYỂN) ==================== */}
            {slide.type === 'transfer_progress' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: '1.5rem',
                  borderBottom: '4px solid #D97706'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: isFullscreen ? '70px' : '56px', height: isFullscreen ? '70px' : '56px',
                      borderRadius: '50%', backgroundColor: '#FEF3C7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(217, 119, 6, 0.25)'
                    }}>
                      <span style={{ fontSize: isFullscreen ? '2.4rem' : '1.8rem' }}>📝</span>
                    </div>
                    <div>
                      <div style={{
                        fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                        color: '#B45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px'
                      }}>
                        🚑 {slide.deptName} • CA CHUYỂN VIỆN {slide.caseIndex}/{slide.totalCases} (PHẦN 2: DIỄN BIẾN & HỘI CHẨN)
                      </div>
                      <h2 style={{
                        fontSize: isFullscreen ? '2.4rem' : '1.8rem',
                        color: '#92400E', fontWeight: '900', margin: 0, lineHeight: 1.15
                      }}>
                        DIỄN BIẾN • HỘI CHẨN • TÌNH TRẠNG LÚC CHUYỂN
                      </h2>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '70px' : '50px', height: isFullscreen ? '70px' : '50px' }} />
                </div>

                {/* Patient Summary Quick Bar */}
                <div style={{
                  backgroundColor: '#EFF6FF', borderRadius: '12px',
                  border: '1.5px solid #BFDBFE',
                  borderLeft: '6px solid #2563EB',
                  padding: isFullscreen ? '0.9rem 1.5rem' : '0.75rem 1.1rem',
                  marginBottom: '1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'
                }}>
                  <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.05rem', fontWeight: '800', color: '#1E40AF' }}>
                    👤 Bệnh nhân: <span style={{ color: '#0F2C59' }}>{slide.transferCase.patient_name || 'Bệnh nhân'}</span>
                  </div>
                  {slide.transferCase.diagnosis && (
                    <div style={{ fontSize: isFullscreen ? '1.15rem' : '0.95rem', fontWeight: '700', color: '#92400E' }}>
                      🏥 Chẩn đoán: <span style={{ color: '#78350F' }}>{slide.transferCase.diagnosis}</span>
                    </div>
                  )}
                </div>

                {/* Full-width Dedicated Progress Notes Big Box */}
                <div style={{
                  flex: 1,
                  backgroundColor: '#FFFBEB',
                  borderRadius: '16px',
                  border: '2px solid #FDE68A',
                  borderLeft: '10px solid #D97706',
                  padding: isFullscreen ? '2rem 2.5rem' : '1.5rem 2rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  boxShadow: '0 8px 30px rgba(217, 119, 6, 0.1)'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: isFullscreen ? '1.35rem' : '1.1rem',
                    fontWeight: '900', color: '#92400E',
                    textTransform: 'uppercase', letterSpacing: '0.75px',
                    borderBottom: '2px solid #FDE68A', paddingBottom: '0.75rem'
                  }}>
                    <span>📋</span>
                    <span>NỘI DUNG DIỄN BIẾN, HỘI CHẨN & TÌNH TRẠNG CHUYỂN VIỆN:</span>
                  </div>

                  <div style={{
                    fontSize: isFullscreen ? '1.5rem' : '1.25rem',
                    lineHeight: '1.8',
                    color: '#0F172A',
                    fontWeight: '600',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto'
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
              </div>
            )}

            {/* ==================== 5. SURGERY CASE SLIDE ==================== */}
            {slide.type === 'surgery' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header Banner */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: '1.5rem',
                  borderBottom: '4px solid #0284C7'
                }}>
                  <div>
                    <div style={{
                      fontSize: isFullscreen ? '1rem' : '0.85rem',
                      fontWeight: '800', color: '#0369A1',
                      textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.3rem'
                    }}>
                      BÁO CÁO PHẪU THUẬT (BỆNH MỔ) • {slide.deptName}
                    </div>
                    <div style={{
                      fontSize: isFullscreen ? '2.5rem' : '1.85rem',
                      fontWeight: '900', color: '#0F2C59',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <FaProcedures style={{ color: '#0284C7' }} />
                      Ca Mổ #{slide.caseIndex} / {slide.totalCases}
                    </div>
                  </div>

                  <div style={{
                    padding: '0.5rem 1.25rem', backgroundColor: '#E0F2FE',
                    borderRadius: '999px', border: '1.5px solid #BAE6FD',
                    fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                    fontWeight: '800', color: '#0369A1'
                  }}>
                    🔪 Phẫu thuật trong ca trực
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '1.5rem',
                  flex: 1
                }}>
                  {/* Left Column: Thông tin hành chính & vào viện */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1.5px solid #E2E8F0',
                    borderLeft: '8px solid #0284C7',
                    padding: isFullscreen ? '1.75rem 2rem' : '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                      fontWeight: '900', color: '#0369A1',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '2px solid #BAE6FD', paddingBottom: '0.5rem'
                    }}>
                      👤 HÀNH CHÍNH & LÝ DO VÀO VIỆN
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: isFullscreen ? '1.2rem' : '1.05rem' }}>
                      <div><strong>Họ và tên:</strong> <span style={{ color: '#0369A1', fontWeight: '800', fontSize: isFullscreen ? '1.35rem' : '1.15rem' }}>{slide.surgeryCase.patient_name || slide.surgeryCase.patientName || '—'}</span></div>
                      <div><strong>Năm sinh / Tuổi:</strong> {slide.surgeryCase.birth_year || slide.surgeryCase.birthYear || slide.surgeryCase.age || '—'}</div>
                      <div><strong>Địa chỉ:</strong> {slide.surgeryCase.address || '—'}</div>
                      <div><strong>Thời gian vào viện:</strong> <span style={{ fontWeight: '700' }}>{slide.surgeryCase.admission_time || slide.surgeryCase.admissionTime || '—'}</span></div>
                      <div><strong>Lý do nhập viện:</strong> <span style={{ color: '#DC2626', fontWeight: '700' }}>{slide.surgeryCase.reason || '—'}</span></div>
                    </div>
                  </div>

                  {/* Right Column: Chuyên môn mổ */}
                  <div style={{
                    backgroundColor: '#F0F9FF',
                    borderRadius: '16px',
                    border: '1.5px solid #BAE6FD',
                    borderLeft: '8px solid #0369A1',
                    padding: isFullscreen ? '1.75rem 2rem' : '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                      fontWeight: '900', color: '#0369A1',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '2px solid #BAE6FD', paddingBottom: '0.5rem'
                    }}>
                      📋 QUÁ TRÌNH PHẪU THUẬT & HẬU PHẪU
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: isFullscreen ? '1.2rem' : '1.05rem' }}>
                      <div>
                        <strong>Chẩn đoán trước mổ:</strong>
                        <div style={{ color: '#0369A1', fontWeight: '700', marginTop: '2px' }}>{slide.surgeryCase.preoperative_diagnosis || slide.surgeryCase.preoperativeDiagnosis || '—'}</div>
                      </div>
                      <div>
                        <strong>Lệnh mổ / Hội chẩn:</strong>
                        <div style={{ color: '#1E293B', marginTop: '2px' }}>{slide.surgeryCase.consultation_order || slide.surgeryCase.consultationOrder || '—'}</div>
                      </div>
                      <div>
                        <strong>Chẩn đoán sau mổ:</strong>
                        <div style={{ color: '#166534', fontWeight: '700', marginTop: '2px' }}>{slide.surgeryCase.postoperative_diagnosis || slide.surgeryCase.postoperativeDiagnosis || '—'}</div>
                      </div>
                      <div>
                        <strong>Tình trạng hiện tại:</strong>
                        <div style={{ color: '#0F172A', fontWeight: '600', marginTop: '2px', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                          {slide.surgeryCase.current_status || slide.surgeryCase.currentStatus || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 6. DEATH CASE SLIDE ==================== */}
            {slide.type === 'death' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header Banner */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '1.25rem', marginBottom: '1.5rem',
                  borderBottom: '4px solid #DC2626'
                }}>
                  <div>
                    <div style={{
                      fontSize: isFullscreen ? '1rem' : '0.85rem',
                      fontWeight: '800', color: '#991B1B',
                      textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.3rem'
                    }}>
                      BÁO CÁO BỆNH NHÂN TỬ VONG • {slide.deptName}
                    </div>
                    <div style={{
                      fontSize: isFullscreen ? '2.5rem' : '1.85rem',
                      fontWeight: '900', color: '#DC2626',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <FaExclamationTriangle style={{ color: '#DC2626' }} />
                      Hồ Sơ Tử Vong #{slide.caseIndex} / {slide.totalCases}
                    </div>
                  </div>

                  <div style={{
                    padding: '0.5rem 1.25rem', backgroundColor: '#FEE2E2',
                    borderRadius: '999px', border: '2px solid #F87171',
                    fontSize: isFullscreen ? '1.1rem' : '0.9rem',
                    fontWeight: '900', color: '#991B1B',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <FaHeartbeat /> CẢNH BÁO TỬ VONG
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '1.5rem',
                  flex: 1
                }}>
                  {/* Left Column: Tiếp nhận & Tình trạng vào viện */}
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: '16px',
                    border: '1.5px solid #FECACA',
                    borderLeft: '8px solid #DC2626',
                    padding: isFullscreen ? '1.75rem 2rem' : '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.85rem'
                  }}>
                    <div style={{
                      fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                      fontWeight: '900', color: '#991B1B',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '2px solid #FECACA', paddingBottom: '0.5rem'
                    }}>
                      👤 HÀNH CHÍNH & TÌNH TRẠNG LÚC VÀO
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: isFullscreen ? '1.15rem' : '1rem' }}>
                      <div><strong>Họ và tên:</strong> <span style={{ color: '#991B1B', fontWeight: '800', fontSize: isFullscreen ? '1.35rem' : '1.15rem' }}>{slide.deathCase.patient_name || slide.deathCase.patientName || '—'}</span></div>
                      <div><strong>Tuổi / Năm sinh:</strong> {slide.deathCase.age || '—'} • <strong>Địa chỉ:</strong> {slide.deathCase.address || '—'}</div>
                      <div><strong>Thời gian vào viện:</strong> <span style={{ fontWeight: '700' }}>{slide.deathCase.admission_time || slide.deathCase.admissionTime || '—'}</span></div>
                      <div><strong>Lý do vào viện:</strong> {slide.deathCase.reason || '—'}</div>
                      <div><strong>Tình trạng lúc vào khoa:</strong> <div style={{ color: '#7F1D1D', fontWeight: '600' }}>{slide.deathCase.admission_status || slide.deathCase.admissionStatus || '—'}</div></div>
                      <div><strong>Tiền sử bệnh:</strong> {slide.deathCase.medical_history || slide.deathCase.medicalHistory || '—'}</div>
                    </div>
                  </div>

                  {/* Right Column: Chẩn đoán & Xử trí hồi sinh */}
                  <div style={{
                    backgroundColor: '#FFF1F2',
                    borderRadius: '16px',
                    border: '1.5px solid #FECDD3',
                    borderLeft: '8px solid #E11D48',
                    padding: isFullscreen ? '1.75rem 2rem' : '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.85rem'
                  }}>
                    <div style={{
                      fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                      fontWeight: '900', color: '#9F1239',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '2px solid #FECDD3', paddingBottom: '0.5rem'
                    }}>
                      ⚡ CHẨN ĐOÁN & HỒI SỨC CẤP CỨU
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: isFullscreen ? '1.15rem' : '1rem' }}>
                      <div>
                        <strong>Cận lâm sàng / ECG:</strong>
                        <div style={{ color: '#334155' }}>{slide.deathCase.clinical_tests || slide.deathCase.clinicalTests || '—'}</div>
                      </div>
                      <div style={{ backgroundColor: '#FEE2E2', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                        <strong style={{ color: '#991B1B' }}>Chẩn đoán tử vong:</strong>
                        <div style={{ color: '#DC2626', fontWeight: '800', fontSize: isFullscreen ? '1.25rem' : '1.1rem', marginTop: '2px' }}>
                          {slide.deathCase.diagnosis || '—'}
                        </div>
                      </div>
                      <div>
                        <strong>Xử trí cấp cứu:</strong>
                        <div style={{ color: '#0F172A', fontWeight: '600' }}>{slide.deathCase.emergency_treatment || slide.deathCase.emergencyTreatment || '—'}</div>
                      </div>
                      <div style={{ backgroundColor: '#FFFFFF', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <strong>Kết quả & Hướng xử lý:</strong>
                        <div style={{ color: '#1E293B', fontWeight: '700' }}>{slide.deathCase.final_outcome || slide.deathCase.finalOutcome || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      </div>
    </div>
  );
};

export default PresentationPage;
