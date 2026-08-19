/**
 * Central Medical Dictionary & Constants for Hospital Report System
 * TTYT Khu Vực Bình Long
 * Single Source of Truth (SSOT)
 */

export const DEPARTMENT_ORDER = [
  'lck',       // 1. Liên chuyên khoa
  'xn',        // 2. Xét nghiệm
  'cdha',      // 3. CĐHA (Chẩn đoán hình ảnh)
  'hscc_tnt',  // 4. HSCC (Hồi sức cấp cứu)
  'noi',       // 5. Nội
  'nhi',       // 6. Nhi
  'nhiem',     // 7. Nhiễm
  'san',       // 8. Sản
  'yhct_phcn', // 9. YHCT (Y học cổ truyền)
  'ngoai_th',  // 10. Ngoại tổng hợp
  'ctch',      // 11. CTCH (Chấn thương chỉnh hình)
  'gmhs'       // 12. Gây mê
];

export const DEPARTMENT_NAMES = {
  hscc_tnt: 'Hồi Sức Cấp Cứu – Thận Nhân Tạo',
  ngoai_th: 'Khoa Ngoại Tổng Hợp',
  ctch: 'Khoa Chấn Thương Chỉnh Hình',
  san: 'Khoa Sản',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  noi: 'Khoa Nội',
  yhct_phcn: 'Y Học Cổ Truyền – Phục Hồi Chức Năng',
  lck: 'Khoa Liên Chuyên Khoa (4CK)',
  xn: 'Khoa Xét Nghiệm',
  cdha: 'Khoa Chẩn Đoán Hình Ảnh',
  gmhs: 'Khoa Gây Mê Hồi Sức'
};

export const DEPARTMENT_THEMES = {
  hscc_tnt: { main: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: '🚨' },
  ngoai_th: { main: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', icon: '🩺' },
  ctch:     { main: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '🦴' },
  san:      { main: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', icon: '👶' },
  nhi:      { main: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: '🧸' },
  nhiem:    { main: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '🦠' },
  noi:      { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' },
  yhct_phcn:{ main: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: '🌿' },
  lck:      { main: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE', icon: '👁️' },
  xn:       { main: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', icon: '🧪' },
  cdha:     { main: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', icon: '🩻' },
  gmhs:     { main: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5', icon: '💉' }
};

export const FIELD_LABELS = {
  // Core admission & discharge flow (Bộ Y tế)
  benhCu: 'Bệnh cũ (Đang điều trị)',
  benhMoi: 'Bệnh mới nhập viện',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn điều trị',
  hienCo: 'Hiện có tại khoa',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',

  // General statistics
  tongSo: 'Tổng số',
  tongSoKham: 'Tổng số lượt khám',
  tongSoKhamBenh: 'Tổng khám bệnh',
  soCaKham: 'Số ca khám',
  baoHiem: 'Bảo hiểm y tế (BHYT)',
  bhyt: 'BHYT',
  dichVu: 'Dịch vụ',
  noiTru: 'Nội trú',
  ngoaiTru: 'Ngoại trú',

  // Overview exam metrics for HSCC - TNT - PK21
  tongSoKham_tongCong: 'TỔNG SỐ KHÁM TOÀN KHOA',
  tongSoKham_hscc: 'Khám Cấp cứu (HSCC)',
  tongSoKham_tnt: 'Khám / Chạy thận (TNT)',
  tongSoKham_pk21: 'Khám Phòng Khám 21',

  // 4 Chuyên Khoa (LCK)
  tmh_tongSo: 'Tai Mũi Họng (Tổng số)',
  tmh_thuThuat: 'Tai Mũi Họng (Thủ thuật)',
  mat_tongSo: 'Mắt (Tổng số)',
  mat_thuThuat: 'Mắt (Thủ thuật)',
  rhm_noi_tongSo: 'Răng Hàm Mặt (Tổng số)',
  rhm_noi_thuThuat: 'Răng Hàm Mặt (Thủ thuật)',
  rhm_noiTru: 'RHM nội trú',
  rhm_ngoaiTru: 'RHM ngoại trú',
  daLieu_tongSo: 'Da Liễu (Tổng số)',
  tong4ck_tongSo: 'Tổng 4 chuyên khoa',
  tong4ck_thuThuat: 'Tổng thủ thuật 4CK',
  nhapVien_tongSo: 'Nhập viện (4CK)',
  chuyenVien_tongSo: 'Chuyển viện (4CK)',

  // Khoa Sản
  sanhThuong: 'Sanh thường',
  sanhHut: 'Sanh hút / Giúp sinh',
  moDe: 'Mổ đẻ',
  choSanh: 'Chờ sanh',
  sieuAm: 'Siêu âm sản',
  hauPhau: 'Hậu phẫu',
  chuyenVienNgoaiTru: 'Chuyển viện ngoại trú',
  moLayThai: 'Mổ lấy thai',

  // HSCC - TNT - PK21 details
  keToa: 'Kê toa',
  truyenMau: 'Truyền máu',
  tieuPhau: 'Tiểu phẫu',
  boBot: 'Bó bột',
  ccNgoaiVien: 'Cấp cứu ngoài viện',
  bsTrucTNT: 'Bác sĩ trực TNT',
  tnt_benhCu: 'Bệnh cũ (TNT)',
  tnt_benhMoi: 'Bệnh mới (TNT)',
  tnt_xuatVien: 'Xuất viện (TNT)',
  tnt_chuyenVien: 'Chuyển viện (TNT)',
  tnt_chuyenKhoa: 'Chuyển khoa (TNT)',
  tnt_hienCon: 'Hiện còn (TNT)',
  tnt_ctdk: 'Chạy thận định kỳ',
  tnt_noiTru: 'Nội trú (TNT)',
  pk21_tongSo: 'Tổng số khám (PK21)',
  pk21_tongSoKham: 'Tổng số khám (PK21)',
  pk21_ngoaiTru: 'Ngoại trú (PK21)',
  pk21_nhapVien: 'Nhập viện (PK21)',
  pk21_chuyenVien: 'Chuyển viện (PK21)',

  // YHCT - PHCN
  dieuTriPhcn: 'Điều trị PHCN',
  phcn_benhCu: 'Bệnh cũ (PHCN)',
  phcn_benhMoi: 'Bệnh mới (PHCN)',
  phcn_xuatVien: 'Xuất viện (PHCN)',
  phcn_hienCon: 'Hiện còn (PHCN)',

  // Ngoại TH / CTCH / GMHS
  daiPhau: 'Đại phẫu',
  trungPhau: 'Trung phẫu',
  hauPhauNghiNgo: 'Hậu phẫu nghi ngờ',
  chuyenVienTT: 'Chuyển viện tuyến trên',
  tongSoCaMo: 'Tổng số ca phẫu thuật (Mổ)',
  cc_ctch: 'Chấn thương chỉnh hình',
  cc_ngoaiTH: 'Ngoại tổng hợp',
  cc_san: 'Sản khoa',
  ct_ctch: 'Chấn thương chỉnh hình',
  ct_ngoaiTH: 'Ngoại tổng hợp',
  ct_san: 'Sản khoa',
  phauThuat: 'Phẫu thuật',
  gayTe: 'Gây tê',
  gayMe: 'Gây mê',

  // Khoa Nhi
  benhMoi_pk: 'Bệnh mới (Phòng khám)',
  benhMoi_cc: 'Bệnh mới (Cấp cứu)',

  // Khoa Nhiễm
  chuyenKhoaSan: 'Chuyển khoa Sản',
  xinXuatVien: 'Xin xuất viện',

  // Khoa Xét Nghiệm / CĐHA
  tongXetNghiem: 'Tổng số xét nghiệm',
  sinhHoa: 'Sinh hóa',
  huyetHoc: 'Huyết học',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  mienDich: 'Miễn dịch',
  xQuang: 'X-Quang',
  ctScanner: 'CT-Scanner',
  dienTim: 'Điện tim',

  // Personnel & Notes
  nhanSu: 'Thành phần nhân sự ca trực',
  dieuDuongTruc: 'Điều dưỡng trực ca',
  themGio: 'Diễn biến thêm giờ / Ca trực',
  tinhHinhChung: 'Tình hình chung ca trực',
  hienCoGhiChu: 'Ghi chú hiện có',
  hienConGhiChu: 'Ghi chú hiện còn'
};

export const CORE_KEY_ORDER = [
  'benhCu', 'tnt_benhCu', 'phcn_benhCu',
  'benhMoi', 'tnt_benhMoi', 'phcn_benhMoi', 'benhMoi_pk', 'benhMoi_cc',
  'xuatVien', 'tnt_xuatVien', 'phcn_xuatVien', 'xinXuatVien', 'xuat',
  'chuyenVien', 'tnt_chuyenVien', 'chuyenVienTT',
  'chuyenKhoa', 'tnt_chuyenKhoa', 'chuyenKhoaSan',
  'hienCon', 'tnt_hienCon', 'phcn_hienCon', 'hienCo',
  'tuVong', 'tnt_tuVong',
  'tnt_ctdk', 'ctdk',
  'tnt_noiTru', 'noiTru',
  'ngoaiTru',
  'keToa',
  'tongSoKham', 'tongSo', 'tongSoKhamBenh', 'soCaKham',
  'truyenMau', 'tnt_truyenMau',
  'tieuPhau', 'boBot', 'ccNgoaiVien'
];

export const SECTION_PRIORITY = ['hscc', 'tnt', 'pk21', 'noiTru', 'ngoaiTru', 'keToa', 'khamBenh', 'dieuTri'];
