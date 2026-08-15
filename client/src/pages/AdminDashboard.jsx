import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaTv, 
  FaPrint,
  FaFileExcel,
  FaFilePdf,
  FaDownload,
  FaChevronDown,
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaSync, 
  FaEdit, 
  FaSave, 
  FaEye, 
  FaPlus, 
  FaTrash, 
  FaAmbulance, 
  FaExclamationTriangle, 
  FaDatabase, 
  FaTable, 
  FaServer, 
  FaHdd, 
  FaLayerGroup, 
  FaInfoCircle, 
  FaUsers, 
  FaUserMd, 
  FaUserNurse, 
  FaSearch, 
  FaFilter, 
  FaIdCard, 
  FaVenusMars, 
  FaClock,
  FaHeartbeat,
  FaProcedures,
  FaUserShield,
  FaKey,
  FaLock,
  FaUnlockAlt,
  FaCopy,
  FaDice,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import reportService from '../services/reportService';
import staffService from '../services/staffService';
import accountService from '../services/accountService';
import { generateAndDownloadHospitalExcel } from '../services/excelExportService';
import MedicalPrintView from '../components/common/MedicalPrintView';
import CaseImageUploader from '../components/common/CaseImageUploader';
import Footer from '../components/common/Footer';
import { Button, Badge, Modal, Notice, Skeleton, EmptyState, TableWrapper, Table, Tabs, Card, FormField } from '../components/ui';

import {
  HoiSucCapCuuForm,
  ChuanDoanHinhAnhForm,
  YHocCoTruyenForm,
  NgoaiTongHopForm,
  ChanThuongChinhHinhForm,
  NhiForm,
  NhiemForm,
  GayMeHoiSucForm,
  SanForm,
  XetNghiemForm,
  NoiForm,
  LienChuyenKhoaForm
} from '../components/forms/departments';

const DEPARTMENT_FORMS = {
  lck: LienChuyenKhoaForm,
  xn: XetNghiemForm,
  cdha: ChuanDoanHinhAnhForm,
  hscc_tnt: HoiSucCapCuuForm,
  noi: NoiForm,
  nhi: NhiForm,
  nhiem: NhiemForm,
  san: SanForm,
  yhct_phcn: YHocCoTruyenForm,
  ngoai_th: NgoaiTongHopForm,
  ctch: ChanThuongChinhHinhForm,
  gmhs: GayMeHoiSucForm,
};

const FIELD_LABELS = {
  tongSoKham: 'Tổng số khám',
  benhCu: 'Bệnh cũ',
  benhMoi: 'Bệnh mới',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  thoMay: 'Thở máy',
  cpap: 'Thở CPAP',
  oxy: 'Thở Oxy',
  phauThuat: 'Phẫu thuật',
  thuThuat: 'Thủ thuật',
  sinhThuong: 'Sinh thường',
  moDe: 'Mổ đẻ',
  capCuu: 'Cấp cứu',
  chanDoan: 'Chẩn đoán',
  ghiChu: 'Ghi chú',
  noiDung: 'Nội dung',
  dienBien: 'Diễn biến',
  soCaChayThan: 'Số ca chạy thận',
  soCaLocMau: 'Số ca lọc máu',
  bsTrucTNT: 'BS trực TNT',
  bsSieuAm: 'BS trực Siêu âm',
  bsXquangCT: 'BS trực Xquang – CT Scan',
  themGio: 'Ghi chú trực thêm giờ',
  nhanSu: 'Thành phần nhân sự ca trực',
  techniques: 'Thống kê kỹ thuật Chẩn đoán hình ảnh',
  tongSoCaMo: 'Tổng số ca mổ',
  cc_ctch: 'Mổ CC - Chấn thương chỉnh hình',
  cc_ngoaiTH: 'Mổ CC - Ngoại tổng hợp',
  cc_san: 'Mổ CC - Sản khoa',
  ct_ctch: 'Mổ CT - Chấn thương chỉnh hình',
  ct_ngoaiTH: 'Mổ CT - Ngoại tổng hợp',
  ct_san: 'Mổ CT - Sản khoa',
  tongSo: 'Tổng số lượt',
  baoHiem: 'Bảo hiểm y tế (BHYT)',
  noiTru: 'Bệnh nhân nội trú',
  ngoaiTru: 'Bệnh nhân ngoại trú',
  tongSoSieuAm: 'Tổng số siêu âm',
  tongSoXquang: 'Tổng số X-quang',
  tongSoCT: 'Tổng số CT Scanner',
  tongSoXetNghiem: 'Tổng số xét nghiệm',
  huyetHoc: 'Huyết học',
  sinhHoa: 'Sinh hóa',
  viSinh: 'Vi sinh',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  khamNgoaiTru: 'Khám ngoại trú',
  dieuTriNoiTru: 'Điều trị nội trú',
  chamCuu: 'Châm cứu',
  xoaBop: 'Xoa bóp / Bấm huyệt',
  vatLyTriLieu: 'Vật lý trị liệu',
  soCaMo: 'Số ca mổ',
  soCaGayMe: 'Số ca gây mê',
  soCaTienMe: 'Số ca tiền mê',
  soCaHoiTinh: 'Số ca hồi tỉnh'
};

const SECTION_LABELS = {
  hscc: 'Khối Hồi Sức Cấp Cứu (HSCC)',
  tnt: 'Khối Thận Nhân Tạo (TNT)',
  pk21: 'Phòng Khám 21 (Cấp Cứu Ngoại Viện)',
  mat: 'Chuyên Khoa Mắt',
  tmh: 'Chuyên Khoa Tai Mũi Họng',
  rhm: 'Chuyên Khoa Răng Hàm Mặt',
  khuA: 'Khu A',
  khuB: 'Khu B',
  noiA: 'Khu Nội Tổng Hợp',
  noiB: 'Khu Nội Tim Mạch'
};

// Component hiển thị dữ liệu chuyên môn dạng cây & bảng trực quan cho tất cả các khoa
const ReportDataViewer = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
        Chưa có số liệu chuyên môn được nhập từ khoa phòng.
      </div>
    );
  }

  const flatFields = [];
  const nestedSections = [];
  const arrayTables = [];
  const noteFields = [];

  Object.entries(data).forEach(([key, val]) => {
    if (val === null || val === undefined || val === '') return;

    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        arrayTables.push({ key, val });
      } else {
        flatFields.push({ key, val: val.join(', ') });
      }
    } else if (typeof val === 'object') {
      nestedSections.push({ key, val });
    } else if (typeof val === 'string' && val.length > 40) {
      noteFields.push({ key, val });
    } else {
      flatFields.push({ key, val });
    }
  });

  if (flatFields.length === 0 && nestedSections.length === 0 && arrayTables.length === 0 && noteFields.length === 0) {
    return (
      <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
        Chưa có số liệu chuyên môn được nhập từ khoa phòng.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Các trường chỉ số & bác sĩ trực phòng */}
      {flatFields.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {flatFields.map(({ key, val }) => (
            <div key={key} style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: '600', marginBottom: '0.2rem' }}>
                {FIELD_LABELS[key] || key}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F2C59' }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Các bảng kỹ thuật chuyên ngành (như Chẩn đoán hình ảnh techniques) */}
      {arrayTables.map(({ key, val }) => (
        <div key={key} style={{ padding: '1rem 1.25rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD', overflowX: 'auto' }}>
          <h5 style={{ margin: '0 0 0.75rem 0', color: '#0369A1', fontWeight: '800', fontSize: '0.95rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            📊 {FIELD_LABELS[key] || (key === 'techniques' ? 'Thống Kê Kỹ Thuật Chẩn Đoán Hình Ảnh' : key)}
          </h5>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF', borderRadius: '6px', overflow: 'hidden', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#E0F2FE', color: '#0369A1', borderBottom: '2px solid #BAE6FD' }}>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: '700' }}>Kỹ thuật / Hạng mục</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Tổng số</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Bảo hiểm (BHYT)</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Nội trú</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Ngoại trú</th>
              </tr>
            </thead>
            <tbody>
              {val.map((item, idx) => (
                <tr key={item.name || idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#0F2C59' }}>{item.name || `Mục ${idx + 1}`}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '800', color: '#0284C7' }}>{item.tongSo !== '' && item.tongSo !== undefined ? item.tongSo : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.baoHiem !== '' && item.baoHiem !== undefined ? item.baoHiem : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.noiTru !== '' && item.noiTru !== undefined ? item.noiTru : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.ngoaiTru !== '' && item.ngoaiTru !== undefined ? item.ngoaiTru : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* 3. Các khối chuyên khoa lồng nhau (hscc, tnt, pk21, mat, tmh, rhm...) */}
      {nestedSections.map(({ key, val }) => {
        const title = SECTION_LABELS[key] || `Khối / Phần: ${key.toUpperCase()}`;
        const subFields = Object.entries(val).filter(([_, v]) => v !== null && v !== undefined && v !== '');

        if (subFields.length === 0) return null;

        return (
          <div key={key} style={{ padding: '0.85rem 1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <h5 style={{ margin: '0 0 0.65rem 0', color: '#166534', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              {title}
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem' }}>
              {subFields.map(([subKey, subVal]) => (
                <div key={subKey} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>
                    {FIELD_LABELS[subKey] || subKey}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15803D' }}>
                    {String(subVal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 4. Các trường ghi chú dài */}
      {noteFields.map(({ key, val }) => (
        <div key={key} style={{ padding: '0.85rem 1rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
          <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            📝 {FIELD_LABELS[key] || key}
          </span>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {val}
          </p>
        </div>
      ))}
    </div>
  );
};

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
  'gmhs',
  'duoc',
  'kham_benh'
];

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Tab State: 'reports' | 'staff' | 'database'
  const [activeTab, setActiveTab] = useState('reports');

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------------------------------
  // STAFF MANAGEMENT STATE
  // -------------------------------------------------------------------------
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('all');
  const [staffPosFilter, setStaffPosFilter] = useState('all');

  // Staff Add/Edit Modal State
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    full_name: '',
    position: 'Bác sĩ',
    department: 'lck',
    certificate: '',
    gender: 'Nam'
  });
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffActionMsg, setStaffActionMsg] = useState({ type: '', text: '' });
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(false);

  // -------------------------------------------------------------------------
  // ACCOUNTS MANAGEMENT STATE
  // -------------------------------------------------------------------------
  const [accountsList, setAccountsList] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState('all');
  const [accountActionMsg, setAccountActionMsg] = useState({ type: '', text: '' });
  const [copiedAccount, setCopiedAccount] = useState('');

  // Password Modal State
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdAccount, setPwdAccount] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);

  // Edit/Add Account Modal State
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [accFormData, setAccFormData] = useState({
    username: '',
    department_name: '',
    department_code: 'lck',
    role: 'department',
    password: ''
  });
  const [savingAccount, setSavingAccount] = useState(false);

  // -------------------------------------------------------------------------
  // DATABASE & PAYLOAD STATS STATE
  // -------------------------------------------------------------------------
  const [dbStats, setDbStats] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbError, setDbError] = useState('');
  const [lastDbUpdate, setLastDbUpdate] = useState('');

  // Daily Payload Size Analysis State
  const [payloadDate, setPayloadDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [payloadData, setPayloadData] = useState(null);
  const [loadingPayload, setLoadingPayload] = useState(false);
  const [payloadError, setPayloadError] = useState('');

  // -------------------------------------------------------------------------
  // REPORT DETAIL MODAL STATE
  // -------------------------------------------------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Editable Form Data inside Modal
  const [editHeader, setEditHeader] = useState({ 
    doctorName: '', 
    nurseName: '', 
    overtimeStaff: [], 
    room: '', 
    shiftTime: '' 
  });
  const [editReportData, setEditReportData] = useState({});
  const [editTransferCases, setEditTransferCases] = useState([]);
  const [editSurgeryCases, setEditSurgeryCases] = useState([]);
  const [editDeathCases, setEditDeathCases] = useState([]);
  const [editCriticalCases, setEditCriticalCases] = useState([]);
  const [hasReport, setHasReport] = useState(false);

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printReports, setPrintReports] = useState([]);
  const [loadingPrint, setLoadingPrint] = useState(false);

  // -------------------------------------------------------------------------
  // FETCH FUNCTIONS
  // -------------------------------------------------------------------------
  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportService.getDepartmentStatus(date);
      setStatusList(response.data || []);
    } catch (err) {
      setError('Không thể tải trạng thái báo cáo.');
      setStatusList(DEPARTMENT_ORDER.map(code => ({
        departmentCode: code,
        departmentName: DEPARTMENT_MAP[code] || code,
        status: 'not_submitted'
      })));
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError('');
    try {
      const params = {};
      if (staffDeptFilter !== 'all') params.department = staffDeptFilter;
      if (staffPosFilter !== 'all') params.position = staffPosFilter;
      if (staffSearch.trim()) params.search = staffSearch.trim();

      const res = await staffService.getAllStaff(params);
      if (res.success) {
        setStaffList(res.data || []);
      }
    } catch (err) {
      setStaffError('Không thể tải danh sách nhân sự.');
    } finally {
      setLoadingStaff(false);
    }
  };

  const fetchDatabaseStats = async () => {
    setLoadingDb(true);
    setDbError('');
    try {
      const response = await reportService.getDatabaseStats();
      if (response && response.data) {
        setDbStats(response.data);
        setLastDbUpdate(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      setDbError(err.response?.data?.error || 'Không thể tải thông tin dung lượng database.');
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchPayloadStats = async (targetDate) => {
    const dateToUse = targetDate || payloadDate;
    setLoadingPayload(true);
    setPayloadError('');
    try {
      const res = await reportService.getReportsPayloadSize(dateToUse);
      if (res && res.data) {
        setPayloadData(res.data);
      }
    } catch (err) {
      setPayloadError(err.response?.data?.error || 'Không thể tải thống kê dung lượng báo cáo theo ngày.');
    } finally {
      setLoadingPayload(false);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError('');
    try {
      const res = await accountService.getAllAccounts();
      if (res && res.data) {
        setAccountsList(res.data);
      }
    } catch (err) {
      setAccountsError(err.response?.data?.error || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchStatus();
    } else if (activeTab === 'staff') {
      fetchStaff();
    } else if (activeTab === 'database') {
      fetchDatabaseStats();
      fetchPayloadStats(payloadDate);
    } else if (activeTab === 'accounts') {
      fetchAccounts();
    }
  }, [date, activeTab, staffDeptFilter, staffPosFilter]);

  // -------------------------------------------------------------------------
  // ACCOUNT ACTIONS
  // -------------------------------------------------------------------------
  const handleOpenChangePassword = (account) => {
    setPwdAccount(account);
    setNewPassword('');
    setShowNewPassword(true);
    setAccountActionMsg({ type: '', text: '' });
    setPwdModalOpen(true);
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await accountService.updatePassword(pwdAccount.id, newPassword);
      setAccountActionMsg({ type: 'success', text: res.message || 'Đã cập nhật mật khẩu thành công!' });
      setPwdModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert('Lỗi cập nhật mật khẩu: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleQuickResetPassword = async (account) => {
    if (!window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu của tài khoản "${account.username}" (${account.department_name}) về "123"?`)) {
      return;
    }
    try {
      const res = await accountService.resetPassword(account.id, '123');
      setAccountActionMsg({ type: 'success', text: res.message || `Đã đặt lại mật khẩu về "123" cho "${account.username}"!` });
      fetchAccounts();
    } catch (err) {
      alert('Lỗi khi đặt lại mật khẩu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenAddAccount = () => {
    setEditingAccountId(null);
    setAccFormData({
      username: '',
      department_name: '',
      department_code: 'lck',
      role: 'department',
      password: '123'
    });
    setAccountActionMsg({ type: '', text: '' });
    setAccModalOpen(true);
  };

  const handleOpenEditAccount = (acc) => {
    setEditingAccountId(acc.id);
    setAccFormData({
      username: acc.username,
      department_name: acc.department_name,
      department_code: acc.department_code,
      role: acc.role,
      password: ''
    });
    setAccountActionMsg({ type: '', text: '' });
    setAccModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!accFormData.username.trim() || !accFormData.department_name.trim()) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và tên khoa phòng');
      return;
    }
    setSavingAccount(true);
    try {
      if (editingAccountId) {
        await accountService.updateAccount(editingAccountId, accFormData);
        setAccountActionMsg({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      } else {
        await accountService.createAccount(accFormData);
        setAccountActionMsg({ type: 'success', text: 'Thêm tài khoản mới thành công!' });
      }
      setAccModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingAccount(false);
    }
  };

  const handleCopyAccount = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(''), 2000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  // -------------------------------------------------------------------------
  // STAFF ACTIONS
  // -------------------------------------------------------------------------
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffFormData({
      full_name: '',
      position: 'Bác sĩ',
      department: 'lck',
      certificate: '',
      gender: 'Nam'
    });
    setStaffActionMsg({ type: '', text: '' });
    setStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setStaffFormData({
      full_name: staff.full_name,
      position: staff.position || 'Bác sĩ',
      department: staff.department || 'lck',
      certificate: staff.certificate || '',
      gender: staff.gender || 'Nam'
    });
    setStaffActionMsg({ type: '', text: '' });
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffFormData.full_name.trim()) {
      setStaffActionMsg({ type: 'error', text: 'Vui lòng nhập họ và tên nhân sự.' });
      return;
    }

    setSavingStaff(true);
    setStaffActionMsg({ type: '', text: '' });
    try {
      if (editingStaffId) {
        await staffService.updateStaff(editingStaffId, staffFormData);
        setStaffActionMsg({ type: 'success', text: 'Cập nhật thông tin nhân sự thành công!' });
      } else {
        await staffService.createStaff(staffFormData);
        setStaffActionMsg({ type: 'success', text: 'Thêm nhân sự mới thành công!' });
      }
      setTimeout(() => {
        setStaffModalOpen(false);
        fetchStaff();
      }, 700);
    } catch (err) {
      setStaffActionMsg({ type: 'error', text: err.response?.data?.error || 'Có lỗi xảy ra khi lưu nhân sự.' });
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaffConfirm = async () => {
    if (!staffToDelete) return;
    setDeletingStaff(true);
    try {
      await staffService.deleteStaff(staffToDelete.id);
      setStaffToDelete(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa nhân sự');
    } finally {
      setDeletingStaff(false);
    }
  };

  // -------------------------------------------------------------------------
  // REPORT DETAIL MODAL HANDLERS
  // -------------------------------------------------------------------------
  const handlePresentation = () => {
    navigate(`/presentation/${date}`);
  };

  const handleOpenPrint = async () => {
    setLoadingPrint(true);
    try {
      const res = await reportService.getPresentationData(date);
      if (res.success) {
        setPrintReports(res.data || []);
        setShowPrintModal(true);
      }
    } catch (err) {
      alert('Không thể tải dữ liệu in báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingPrint(false);
    }
  };

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    setExportDropdownOpen(false);
    setExportingExcel(true);
    try {
      // 1. Fetch live full details/presentation data
      const res = await reportService.getPresentationData(date);
      const reports = (res && res.data) ? res.data : [];

      // 2. Generate with exceljs in browser (3 Sheets, beautiful formatting)
      await generateAndDownloadHospitalExcel(date, reports, statusList);
    } catch (err) {
      console.warn('Client Excel generation failed, falling back to server export:', err);
      try {
        const response = await reportService.exportHospitalReportExcel(date);
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `Bao_Cao_Giao_Ban_Tong_Hop_${date}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (fallbackErr) {
        alert('Không thể xuất file Excel: ' + (fallbackErr.response?.data?.error || fallbackErr.message || err.message || 'Lỗi hệ thống'));
      }
    } finally {
      setExportingExcel(false);
    }
  };

  const handleOpenDetailModal = async (dept) => {
    setModalDept(dept);
    setModalOpen(true);
    setLoadingReport(true);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setSaveSuccess('');
    try {
      const res = await reportService.getReport(dept.departmentCode, date);
      const report = res.data;
      if (report) {
        setHasReport(true);
        let overtime = report.overtime_staff;
        if (typeof overtime === 'string') {
          try { overtime = JSON.parse(overtime); } catch (e) { overtime = []; }
        }
        setEditHeader({
          reportDate: report.report_date ? report.report_date.split('T')[0] : date,
          doctorName: report.doctor_name || '',
          nurseName: report.nurse_name || '',
          overtimeStaff: Array.isArray(overtime) ? overtime : [],
          room: report.room || '',
          shiftTime: report.shift_time || ''
        });
        const parsedData = typeof report.report_data === 'string' ? JSON.parse(report.report_data) : (report.report_data || {});
        setEditReportData(parsedData);
        setEditTransferCases(report.transferCases || []);
        setEditSurgeryCases(report.surgeryCases || []);
        setEditDeathCases(report.deathCases || []);
        setEditCriticalCases(report.criticalCases || []);
      } else {
        setHasReport(false);
        setEditHeader({ reportDate: date, doctorName: '', nurseName: '', overtimeStaff: [], room: '', shiftTime: '' });
        setEditReportData({});
        setEditTransferCases([]);
        setEditSurgeryCases([]);
        setEditDeathCases([]);
        setEditCriticalCases([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết báo cáo:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSaveReport = async () => {
    setSaving(true);
    setSaveSuccess('');
    try {
      const targetDate = editHeader.reportDate || date;
      await reportService.createOrUpdateReport({
        departmentCode: modalDept.departmentCode,
        reportDate: targetDate,
        doctorName: editHeader.doctorName,
        nurseName: editHeader.nurseName,
        overtimeStaff: editHeader.overtimeStaff,
        room: editHeader.room,
        shiftTime: editHeader.shiftTime,
        reportData: editReportData,
        transferCases: editTransferCases,
        surgeryCases: editSurgeryCases,
        deathCases: editDeathCases,
        criticalCases: editCriticalCases
      });

      // Nếu Admin đổi ngày báo cáo so với ngày đang xem, xóa bản ghi ở ngày cũ để tránh trùng lặp
      if (targetDate !== date && hasReport) {
        try {
          await reportService.deleteReport(modalDept.departmentCode, date);
        } catch (delErr) {
          console.warn('Không thể xóa bản ghi cũ khi đổi ngày:', delErr);
        }
      }

      setSaveSuccess(`Đã lưu thay đổi báo cáo thành công (Ngày báo cáo: ${targetDate})!`);
      setIsEditing(false);
      setHasReport(true);
      fetchStatus();
    } catch (err) {
      alert('Lỗi khi lưu báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    setDeleting(true);
    try {
      await reportService.deleteReport(modalDept.departmentCode, date);
      setModalOpen(false);
      fetchStatus();
    } catch (err) {
      alert('Lỗi khi xóa báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDataChange = (key, value) => {
    setEditReportData(prev => ({ ...prev, [key]: value }));
  };

  // Transfer cases helpers
  const handleTransferCaseChange = (idx, field, value) => {
    const updated = [...editTransferCases];
    updated[idx][field] = value;
    setEditTransferCases(updated);
  };

  const handleAddTransferCase = () => {
    setEditTransferCases([
      ...editTransferCases,
      {
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        reason: '',
        clinicalSymptoms: '',
        clinical_symptoms: '',
        clinicalTests: '',
        diagnosis: '',
        initialTreatment: '',
        progressNotes: ''
      }
    ]);
  };

  const handleRemoveTransferCase = (idx) => {
    setEditTransferCases(editTransferCases.filter((_, i) => i !== idx));
  };

  // Surgery cases helpers
  const handleSurgeryCaseChange = (idx, field, value) => {
    const updated = [...editSurgeryCases];
    updated[idx][field] = value;
    setEditSurgeryCases(updated);
  };

  const handleAddSurgeryCase = () => {
    setEditSurgeryCases([
      ...editSurgeryCases,
      {
        patientName: '',
        birthYear: '',
        address: '',
        admissionTime: '',
        reason: '',
        clinicalSymptoms: '',
        clinical_symptoms: '',
        clinicalTests: '',
        clinical_tests: '',
        preoperativeDiagnosis: '',
        consultationOrder: '',
        postoperativeDiagnosis: '',
        currentStatus: ''
      }
    ]);
  };

  const handleRemoveSurgeryCase = (idx) => {
    setEditSurgeryCases(editSurgeryCases.filter((_, i) => i !== idx));
  };

  // Death cases helpers
  const handleDeathCaseChange = (idx, field, value) => {
    const updated = [...editDeathCases];
    updated[idx][field] = value;
    setEditDeathCases(updated);
  };

  const handleAddDeathCase = () => {
    setEditDeathCases([
      ...editDeathCases,
      {
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        reason: '',
        admissionStatus: '',
        clinicalSymptoms: '',
        clinical_symptoms: '',
        medicalHistory: '',
        clinicalTests: '',
        diagnosis: '',
        emergencyTreatment: '',
        finalOutcome: ''
      }
    ]);
  };

  const handleRemoveDeathCase = (idx) => {
    setEditDeathCases(editDeathCases.filter((_, i) => i !== idx));
  };

  // Critical cases helpers
  const handleCriticalCaseChange = (idx, field, value) => {
    const updated = [...editCriticalCases];
    updated[idx][field] = value;
    setEditCriticalCases(updated);
  };

  const handleAddCriticalCase = () => {
    setEditCriticalCases([
      ...editCriticalCases,
      {
        patientName: '',
        age: '',
        address: '',
        admissionTime: '',
        medicalHistory: '',
        clinicalSymptoms: '',
        clinical_symptoms: '',
        clinicalTests: '',
        clinical_tests: '',
        diagnosis: '',
        conditionSummary: '',
        treatment: '',
        notes: 'Bàn giao tua sau theo dõi tiếp'
      }
    ]);
  };

  const handleRemoveCriticalCase = (idx) => {
    setEditCriticalCases(editCriticalCases.filter((_, i) => i !== idx));
  };

  // -------------------------------------------------------------------------
  // STATS COUNTERS
  // -------------------------------------------------------------------------
  const totalCount = statusList.length;
  const submittedCount = statusList.filter(s => s.status === 'submitted').length;

  const totalStaffCount = staffList.length;
  const doctorCount = staffList.filter(s => s.position === 'Bác sĩ' || s.position?.toLowerCase().includes('bác sĩ')).length;
  const nurseCount = staffList.filter(s => s.position !== 'Bác sĩ' && !s.position?.toLowerCase().includes('bác sĩ')).length;

  return (
    <div className="admin-container admin-dashboard-wrapper app-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Header Card */}
      <header className="card admin-header" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 60, overflow: 'visible' }}>
        <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img" style={{ width: '48px', height: '48px' }} />
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--brand-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h4>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-blue)', fontWeight: '800' }}>
              Bảng Điều Khiển — Phòng Kế Hoạch Nghiệp Vụ
            </h2>
          </div>
        </div>

        <div className="admin-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {activeTab === 'reports' && (
            <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <FaCalendarAlt style={{ color: 'var(--brand-blue)' }} />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '600', color: 'var(--text-dark)' }}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <>
              {/* Dropdown Xuất Báo Cáo */}
              <div style={{ position: 'relative', display: 'inline-block', zIndex: 70 }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)} 
                  disabled={exportingExcel || loadingPrint} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    backgroundColor: '#0F2C59',
                    color: '#FFFFFF', 
                    borderColor: '#1E3A8A',
                    boxShadow: '0 2px 8px rgba(15, 44, 89, 0.25)',
                    fontWeight: '700'
                  }}
                  title="Tùy chọn xuất báo cáo tổng hợp toàn viện"
                >
                  {exportingExcel ? (
                    <><FaSpinner className="spinner" /> Đang tạo Excel...</>
                  ) : loadingPrint ? (
                    <><FaSpinner className="spinner" /> Đang nạp PDF...</>
                  ) : (
                    <>
                      <FaDownload style={{ fontSize: '0.95rem', color: '#60A5FA' }} />
                      <span>Xuất Báo Cáo</span>
                      <FaChevronDown style={{ fontSize: '0.75rem', marginLeft: '0.2rem', transition: 'transform 0.2s', transform: exportDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                    </>
                  )}
                </button>

                {exportDropdownOpen && (
                  <>
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                      onClick={() => setExportDropdownOpen(false)} 
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 12px 35px rgba(15, 44, 89, 0.22), 0 0 0 1px rgba(0,0,0,0.08)',
                        zIndex: 999,
                        minWidth: '260px',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={handleExportExcel}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.85rem 1.1rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.92rem',
                          color: '#1E293B'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDF4'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          backgroundColor: '#DCFCE7', color: '#15803D',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', flexShrink: 0
                        }}>
                          <FaFileExcel />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#15803D' }}>Xuất Báo Cáo Excel (.xlsx)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>3 Sheet: Tổng hợp, Chi tiết khoa, Bệnh lý</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setExportDropdownOpen(false);
                          handleOpenPrint();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.85rem 1.1rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.92rem',
                          color: '#1E293B'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          backgroundColor: '#FEE2E2', color: '#DC2626',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', flexShrink: 0
                        }}>
                          <FaFilePdf />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#DC2626' }}>Xuất Báo Cáo Y Tế PDF (.pdf)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Chuẩn A4 3 phần & In trực tiếp</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button className="btn btn-primary" onClick={handlePresentation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaTv /> Trình Chiếu Giao Ban
              </button>
            </>
          )}

          <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'reports', label: 'Báo Cáo Giao Ban', icon: <FaLayerGroup /> },
            { id: 'staff', label: 'Quản Lý Nhân Sự', icon: <FaUsers />, badge: totalStaffCount },
            { id: 'database', label: 'Quản Lý Database', icon: <FaDatabase /> },
            { id: 'accounts', label: 'Quản Lý Tài Khoản', icon: <FaUserShield />, badge: accountsList.length },
          ]}
        />
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BÁO CÁO GIAO BAN                                       */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          {/* Stats Summary Grid */}
          <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="card admin-stats-card" style={{ textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid var(--brand-blue)', borderRadius: '14px', padding: '1.25rem' }}>
              <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--brand-blue)' }}>{totalCount}</div>
              <div className="stats-lbl" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>Tổng số khoa phòng</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #16A34A', borderRadius: '14px', padding: '1.25rem' }}>
              <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16A34A' }}>{submittedCount}</div>
              <div className="stats-lbl" style={{ color: '#16A34A', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>Đã nộp ({totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0}%)</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #D97706', borderRadius: '14px', padding: '1.25rem' }}>
              <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#D97706' }}>{totalCount - submittedCount}</div>
              <div className="stats-lbl" style={{ color: '#D97706', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>Chưa nộp báo cáo</div>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1.25rem' }}>
              <Notice tone="warning" onClose={() => setError('')}>
                {error}
              </Notice>
            </div>
          )}

          {/* Department Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu báo cáo...</p>
            </div>
          ) : (
            <div className="admin-dept-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {[...statusList].sort((a, b) => {
                const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
                const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
                return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
              }).map((dept, index) => {
                const isSubmitted = dept.status === 'submitted';
                return (
                  <div 
                    key={dept.departmentCode} 
                    className="card"
                    onClick={() => handleOpenDetailModal(dept)}
                    style={{ 
                      borderLeft: `5px solid ${isSubmitted ? 'var(--brand-green)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      animationDelay: `${index * 0.04}s`,
                      animation: 'slideUp 0.3s ease-out forwards',
                      opacity: 0,
                      position: 'relative',
                      padding: '1.1rem 1.25rem'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)', lineHeight: 1.3 }}>{dept.departmentName}</h3>
                      {isSubmitted ? 
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                          <FaCheck size={10} /> Đã nộp
                        </span> : 
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                          <FaTimes size={10} /> Chưa nộp
                        </span>
                      }
                    </div>
                    
                    {isSubmitted ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {dept.doctorName && <p style={{ marginBottom: '0.5rem' }}>👨‍⚕️ <strong>Bác sĩ trực:</strong> {dept.doctorName}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ color: 'var(--brand-green)', fontWeight: '600', fontSize: '0.8rem' }}>✓ Đã nộp báo cáo</span>
                          <span className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                            <FaEye /> Xem / Sửa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có báo cáo</span>
                        <span className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                          <FaEdit /> Nhập hộ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: QUẢN LÝ NHÂN SỰ                                         */}
      {/* ============================================================ */}
      {activeTab === 'staff' && (
        <div className="animate-fade-in">
          {/* Staff Summary Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{totalStaffCount}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tổng nhân sự</div>
                </div>
                <FaUsers style={{ fontSize: '2rem', color: 'var(--brand-blue)', opacity: 0.6 }} />
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065F46' }}>{doctorCount}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#047857', textTransform: 'uppercase' }}>Bác sĩ</div>
                </div>
                <FaUserMd style={{ fontSize: '2rem', color: '#10B981', opacity: 0.6 }} />
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderLeft: '4px solid #D97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400E' }}>{nurseCount}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#B45309', textTransform: 'uppercase' }}>Điều dưỡng / KTV</div>
                </div>
                <FaUserNurse style={{ fontSize: '2rem', color: '#D97706', opacity: 0.6 }} />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-blue)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUsers style={{ color: 'var(--brand-blue)' }} /> Danh Mục Nhân Sự Khoa Phòng
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Quản lý danh sách y bác sĩ và điều dưỡng phân quyền theo 12 khoa phòng toàn viện.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleOpenAddStaff}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.25rem' }}
                >
                  <FaPlus /> Thêm Nhân Viên Mới
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={fetchStaff} 
                  disabled={loadingStaff}
                  title="Làm mới danh sách"
                >
                  <FaSync className={loadingStaff ? 'spinner' : ''} />
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc số CCHN..." 
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStaff()}
                  style={{ paddingLeft: '2.2rem', width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Department Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <select 
                  value={staffDeptFilter}
                  onChange={(e) => setStaffDeptFilter(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="all">🏥 Tất cả khoa phòng (12 khoa)</option>
                  {DEPARTMENT_ORDER.map(code => (
                    <option key={code} value={code}>
                      {DEPARTMENT_MAP[code] || code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position Filter */}
              <div>
                <select 
                  value={staffPosFilter}
                  onChange={(e) => setStaffPosFilter(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="all">👨‍⚕️ Tất cả chức danh</option>
                  <option value="Bác sĩ">Bác sĩ</option>
                  <option value="Điều dưỡng">Điều dưỡng</option>
                  <option value="Hộ sinh">Hộ sinh</option>
                  <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                  <option value="Dược sĩ">Dược sĩ</option>
                  <option value="Y sĩ">Y sĩ</option>
                </select>
              </div>
            </div>
          </div>

          {staffError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              ❌ {staffError}
            </div>
          )}

          {/* Staff Table Card */}
          <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', overflowX: 'auto' }}>
            {loadingStaff ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Đang tải danh sách nhân sự...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaUsers style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                <p>Không tìm thấy nhân sự nào khớp với điều kiện lọc.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', width: '50px' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Họ Và Tên</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Chức Danh</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Khoa Phòng</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Số CCHN</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Giới Tính</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff, idx) => (
                    <tr 
                      key={staff.id}
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--brand-blue)' }}>
                        {staff.position === 'Bác sĩ' ? '👨‍⚕️ ' : '👩‍⚕️ '}
                        {staff.full_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{ 
                          backgroundColor: staff.position === 'Bác sĩ' ? '#DBEAFE' : '#FEF3C7',
                          color: staff.position === 'Bác sĩ' ? '#1E40AF' : '#92400E'
                        }}>
                          {staff.position}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '600' }}>
                        {DEPARTMENT_MAP[staff.department] || staff.department}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {staff.certificate || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        {staff.gender || 'Nam'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditStaff(staff)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            title="Chỉnh sửa"
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => setStaffToDelete(staff)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            title="Xóa nhân sự"
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: QUẢN LÝ DATABASE & DUNG LƯỢNG AIVEN                    */}
      {/* ============================================================ */}
      {activeTab === 'database' && (
        <div className="animate-fade-in">
          {/* Controls & Title Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-blue)', fontSize: '1.3rem' }}>
                <FaDatabase />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-blue)', fontWeight: '800', margin: 0 }}>
                  Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu Aiven
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Giám sát dung lượng ổ đĩa vật lý Cloud Aiven và đo lường kích thước dữ liệu báo cáo phát sinh theo từng khoa phòng.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {lastDbUpdate && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  🕒 Cập nhật: <strong>{lastDbUpdate}</strong>
                </span>
              )}
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => {
                  fetchDatabaseStats();
                  fetchPayloadStats(payloadDate);
                }} 
                disabled={loadingDb || loadingPayload}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem' }}
              >
                <FaSync className={loadingDb || loadingPayload ? 'spinner' : ''} /> {loadingDb || loadingPayload ? 'Đang tải...' : 'Làm Mới Dữ Liệu'}
              </button>
            </div>
          </div>

          {dbError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ❌ <strong>Lỗi kết nối cơ sở dữ liệu:</strong> {dbError}
            </div>
          )}

          {loadingDb && !dbStats ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang truy vấn thông số ổ đĩa vật lý máy chủ Aiven...</p>
            </div>
          ) : dbStats ? (
            <>
              {/* ============================================================ */}
              {/* 1. WIDGET DUNG LƯỢNG Ổ ĐĨA VẬT LÝ AIVEN (PHYSICAL STORAGE)    */}
              {/* ============================================================ */}
              {(() => {
                const physical = dbStats.physicalStorage || {
                  usedMb: 304.0,
                  totalMb: 1024.0,
                  freeMb: 720.0,
                  usagePercentage: 29.7,
                  statusLevel: 'safe',
                  statusText: 'An toàn (Đang hoạt động ổn định)',
                  breakdown: {
                    hospitalDataMb: 0.405,
                    tablespacesMb: 76.16,
                    systemTablesMb: 7.86,
                    baseRuntimeMb: 220.0
                  }
                };

                const isDanger = physical.statusLevel === 'danger' || physical.usagePercentage >= 85;
                const isWarning = physical.statusLevel === 'warning' || (physical.usagePercentage >= 70 && physical.usagePercentage < 85);

                const statusColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
                const statusBg = isDanger ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4';
                const statusBorder = isDanger ? '#FCA5A5' : isWarning ? '#FDE68A' : '#BBF7D0';
                const statusText = isDanger ? '#991B1B' : isWarning ? '#92400E' : '#065F46';

                const progressGradient = isDanger
                  ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                  : isWarning
                  ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                  : 'linear-gradient(90deg, #10B981, #059669)';

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {/* Metric 1: Aiven Physical Storage & Status Progress Bar */}
                    <div className="card" style={{ padding: '1.35rem 1.5rem', background: statusBg, borderLeft: `5px solid ${statusColor}`, borderTop: `1px solid ${statusBorder}`, borderRight: `1px solid ${statusBorder}`, borderBottom: `1px solid ${statusBorder}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: statusText, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaHdd style={{ color: statusColor, fontSize: '1.1rem' }} /> Dung Lượng Ổ Đĩa Aiven (Physical Storage)
                        </span>
                        <span className="badge" style={{
                          backgroundColor: isDanger ? '#FEE2E2' : isWarning ? '#FEF3C7' : '#DCFCE7',
                          color: statusText,
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '12px'
                        }}>
                          {isDanger ? '🚨 Nguy Hiểm (> 85%)' : isWarning ? '⚠️ Cảnh Báo (70-85%)' : '✓ An Toàn (< 70%)'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '2.1rem', fontWeight: '900', color: statusText, fontFamily: 'monospace' }}>
                          {physical.usedMb} <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>MB</span>
                        </span>
                        <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>
                          / {physical.totalMb} MB <span style={{ fontSize: '0.8rem', color: '#64748B' }}>(1.0 GB Gói Aiven)</span>
                        </span>
                      </div>
                      
                      {/* Dynamic Progress Bar */}
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                        <div style={{
                          width: `${Math.min(physical.usagePercentage, 100)}%`,
                          height: '100%',
                          background: progressGradient,
                          borderRadius: '999px',
                          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#475569' }}>
                        <span>Đã dùng: <strong>{physical.usagePercentage}%</strong></span>
                        <span>Còn trống: <strong style={{ color: statusColor }}>{physical.freeMb} MB</strong> ({Math.max(0, (100 - physical.usagePercentage)).toFixed(1)}%)</span>
                      </div>
                    </div>

                    {/* Metric 2: Hospital Data Core */}
                    <div className="card" style={{ padding: '1.35rem 1.5rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '5px solid var(--brand-blue)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaDatabase style={{ color: 'var(--brand-blue)' }} /> Cơ Sở Dữ Liệu Chuyên Môn
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                          ✓ Online SSL
                        </span>
                      </div>

                      <div style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--brand-blue)', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
                        {dbStats.databaseName}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#1E40AF', lineHeight: '1.5' }}>
                        <div>📁 Dữ liệu thuần bệnh viện: <strong>{dbStats.totalDataSizeMb || 0.405} MB</strong></div>
                        <div>📊 Tổng cộng: <strong>{dbStats.totalRows} bản ghi</strong> trên <strong>{dbStats.tablesCount} bảng</strong></div>
                      </div>
                    </div>

                    {/* Metric 3: Storage Breakdown */}
                    <div className="card" style={{ padding: '1.35rem 1.5rem', background: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)', borderLeft: '5px solid #8B5CF6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaLayerGroup style={{ color: '#8B5CF6' }} /> Phân Bổ Dung Lượng Máy Chủ
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: '700' }}>
                          Aiven MySQL 8.0
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#5B21B6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🏥 Báo cáo & Ca bệnh viện:</span>
                          <strong>{physical.breakdown?.hospitalDataMb || 0.4} MB</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>⚙️ Bảng hệ thống (MySQL/Sys):</span>
                          <strong>{physical.breakdown?.systemTablesMb || 7.8} MB</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🔄 Tablespaces & Undo/Redo Logs:</span>
                          <strong>{physical.breakdown?.tablespacesMb || 76.1} MB</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🖥️ Aiven Host Runtime Base:</span>
                          <strong>{physical.breakdown?.baseRuntimeMb || 220.0} MB</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ============================================================ */}
              {/* 2. TÍNH NĂNG ĐO DUNG LƯỢNG BÁO CÁO THEO NGÀY CỦA TỪNG KHOA    */}
              {/* ============================================================ */}
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', marginBottom: '1.5rem' }}>
                {/* Header & Date Picker Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--brand-blue)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaCalendarAlt style={{ color: 'var(--brand-blue-light)' }} /> Đo Dung Lượng Báo Cáo Theo Ngày Của Từng Khoa
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                      Phân tích kích thước byte của văn bản và hình ảnh lâm sàng đính kèm phát sinh theo từng khoa phòng.
                    </p>
                  </div>

                  {/* Date Selector Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1E40AF' }}>Ngày xem:</label>
                      <input 
                        type="date" 
                        value={payloadDate} 
                        onChange={(e) => {
                          setPayloadDate(e.target.value);
                          fetchPayloadStats(e.target.value);
                        }}
                        style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#1E40AF', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}
                      />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setPayloadDate(today);
                        fetchPayloadStats(today);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    >
                      Hôm nay
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yStr = yesterday.toISOString().split('T')[0];
                        setPayloadDate(yStr);
                        fetchPayloadStats(yStr);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    >
                      Hôm qua
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => fetchPayloadStats(payloadDate)}
                      disabled={loadingPayload}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Làm mới dung lượng ngày"
                    >
                      <FaSync className={loadingPayload ? 'spinner' : ''} />
                    </button>
                  </div>
                </div>

                {payloadError && (
                  <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    ⚠️ {payloadError}
                  </div>
                )}

                {loadingPayload && !payloadData ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Đang tính toán dung lượng báo cáo ngày {payloadDate}...</p>
                  </div>
                ) : payloadData ? (
                  <>
                    {/* Summary KPI Mini-Cards Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>📦 Tổng phát sinh ngày</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59', marginTop: '0.2rem' }}>
                          {payloadData.grandTotalKb} KB <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B' }}>({payloadData.grandTotalMb} MB)</span>
                        </div>
                      </div>

                      <div style={{ padding: '0.85rem 1rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' }}>📝 Dung lượng Văn Bản</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.2rem' }}>
                          {payloadData.grandTotalTextKb} KB
                        </div>
                      </div>

                      <div style={{ padding: '0.85rem 1rem', backgroundColor: '#FAF5FF', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6D28D9', textTransform: 'uppercase' }}>🖼️ Dung lượng Hình Ảnh</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#6D28D9', marginTop: '0.2rem' }}>
                          {payloadData.grandTotalImageKb} KB
                        </div>
                      </div>

                      <div style={{ padding: '0.85rem 1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', textTransform: 'uppercase' }}>🏥 Tiến độ nộp báo cáo</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803D', marginTop: '0.2rem' }}>
                          {payloadData.submittedCount} / {payloadData.totalDepartmentsCount} khoa
                        </div>
                      </div>
                    </div>

                    {/* Department Payload Breakdown Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', width: '40px' }}>#</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Khoa / Phòng</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'center' }}>Trạng Thái</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'center' }}>Bản Ghi Lâm Sàng</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'center' }}>Hình Ảnh</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'right' }}>Văn Bản</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'right' }}>Hình Ảnh</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'right' }}>Tổng Dung Lượng</th>
                            <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', width: '150px' }}>Tỷ Lệ Trong Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payloadData.departments.map((dept, idx) => {
                            const hasLargePayload = dept.totalKb > 100;
                            const hasMediumPayload = dept.totalKb > 10;

                            return (
                              <tr 
                                key={dept.departmentCode}
                                style={{ 
                                  borderBottom: '1px solid #F1F5F9',
                                  backgroundColor: !dept.submitted ? '#FAFAFA' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                                }}
                              >
                                <td style={{ padding: '0.75rem 0.85rem', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                                <td style={{ padding: '0.75rem 0.85rem' }}>
                                  <div style={{ fontWeight: '700', color: dept.submitted ? 'var(--brand-blue)' : '#64748B' }}>
                                    {dept.departmentName}
                                  </div>
                                  {dept.submitted && dept.doctorName && (
                                    <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                                      👨‍⚕️ BS. {dept.doctorName}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                                  {dept.submitted ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                                      ✓ Đã nộp
                                    </span>
                                  ) : (
                                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', backgroundColor: '#E2E8F0', color: '#64748B' }}>
                                      Chưa nộp
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                                  {dept.submitted ? (
                                    <span style={{ fontWeight: dept.totalCasesCount > 0 ? '700' : '400', color: dept.totalCasesCount > 0 ? '#1E40AF' : '#94A3B8' }}>
                                      {dept.totalCasesCount > 0 ? (
                                        <span title={`Chuyển viện: ${dept.transferCasesCount} • Mổ: ${dept.surgeryCasesCount} • Tử vong: ${dept.deathCasesCount} • Nặng: ${dept.criticalCasesCount}`}>
                                          {dept.totalCasesCount} ca
                                        </span>
                                      ) : '0 ca'}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                                  {dept.imagesCount > 0 ? (
                                    <span className="badge" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', fontWeight: '800', fontSize: '0.75rem' }}>
                                      🖼️ {dept.imagesCount} ảnh
                                    </span>
                                  ) : dept.submitted ? (
                                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>0</span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: '#475569' }}>
                                  {dept.submitted ? `${dept.textKb} KB` : '0 KB'}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: dept.imageKb > 0 ? '#7C3AED' : '#94A3B8', fontWeight: dept.imageKb > 0 ? '700' : '400' }}>
                                  {dept.submitted ? `${dept.imageKb} KB` : '0 KB'}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                                  {dept.submitted ? (
                                    <span className="badge" style={{
                                      backgroundColor: hasLargePayload ? '#FEE2E2' : hasMediumPayload ? '#FEF3C7' : '#DBEAFE',
                                      color: hasLargePayload ? '#991B1B' : hasMediumPayload ? '#92400E' : '#1E40AF',
                                      fontWeight: '800',
                                      fontSize: '0.82rem',
                                      padding: '0.25rem 0.6rem'
                                    }}>
                                      {dept.totalKb >= 1024 ? `${dept.totalMb} MB` : `${dept.totalKb} KB`}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>0 KB</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.75rem 0.85rem' }}>
                                  {dept.submitted && dept.percentage > 0 ? (
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                                        <span>{dept.percentage}%</span>
                                      </div>
                                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{
                                          width: `${Math.min(dept.percentage, 100)}%`,
                                          height: '100%',
                                          backgroundColor: hasLargePayload ? '#EF4444' : hasMediumPayload ? '#F59E0B' : '#3B82F6',
                                          borderRadius: '999px'
                                        }} />
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}
              </div>

              {/* ============================================================ */}
              {/* 3. DANH SÁCH CHI TIẾT CÁC BẢNG DỮ LIỆU CSDL                   */}
              {/* ============================================================ */}
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--brand-blue)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTable style={{ color: 'var(--brand-blue-light)' }} /> Danh Sách Chi Tiết Các Bảng Dữ Liệu
                </h4>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', width: '50px' }}>#</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Tên Bảng</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Mô Tả Chức Năng</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Số Dòng (Rows)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Dữ Liệu (Data)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Chỉ Mục (Index)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Tổng Dung Lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbStats.tables.map((table, idx) => {
                      const desc = {
                        users: 'Tài khoản đăng nhập & phân quyền cán bộ/khoa phòng',
                        reports: 'Báo cáo số liệu giao ban hàng ngày của 12 khoa phòng',
                        transfer_cases: 'Hồ sơ chi tiết các ca bệnh nhân chuyển viện cấp cứu',
                        surgery_cases: 'Hồ sơ chi tiết các ca bệnh nhân phẫu thuật mổ',
                        death_cases: 'Hồ sơ chi tiết các ca bệnh nhân tử vong',
                        critical_cases: 'Hồ sơ chi tiết các ca bệnh nhân nặng theo dõi',
                        staff_members: 'Danh mục y bác sĩ, điều dưỡng các khoa phòng toàn viện'
                      }[table.tableName] || 'Bảng dữ liệu hệ thống';

                      return (
                        <tr 
                          key={table.tableName}
                          style={{ 
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ 
                              fontFamily: 'monospace', 
                              fontWeight: '700', 
                              backgroundColor: '#F1F5F9', 
                              padding: '0.25rem 0.55rem', 
                              borderRadius: '4px',
                              color: 'var(--brand-blue)'
                            }}>
                              {table.tableName}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                            {desc}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '600', color: '#475569' }}>
                            {Number(table.rowsCount).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748B' }}>
                            {table.dataSizeKb} KB
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748B' }}>
                            {table.indexSizeKb} KB
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '800', color: '#0F2C59' }}>
                            <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                              {table.sizeMb} MB
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: QUẢN LÝ TÀI KHOẢN KHOA PHÒNG                           */}
      {/* ============================================================ */}
      {activeTab === 'accounts' && (
        <div className="animate-fade-in">
          {/* Stats Summary Grid */}
          <div className="admin-stats-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{accountsList.length}</div>
              <div className="stats-lbl" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số tài khoản</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '4px solid var(--brand-green)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-green)' }}>
                {accountsList.filter(a => a.role === 'department').length}
              </div>
              <div className="stats-lbl" style={{ color: 'var(--brand-green)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tài khoản Khoa/Phòng</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FAF5FF, #E9D5FF)', borderLeft: '4px solid #7C3AED' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#7C3AED' }}>
                {accountsList.filter(a => a.role === 'admin').length}
              </div>
              <div className="stats-lbl" style={{ color: '#7C3AED', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quản trị viên (KHNV)</div>
            </div>
          </div>

          {/* Action Message Banner */}
          {accountActionMsg.text && (
            <div style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              backgroundColor: accountActionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
              color: accountActionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span>{accountActionMsg.type === 'error' ? '⚠️ ' : '✓ '}{accountActionMsg.text}</span>
              <button 
                onClick={() => setAccountActionMsg({ type: '', text: '' })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <FaSearch style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm theo tên khoa, username..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.4rem', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.55rem 0.75rem 0.55rem 2.4rem', fontSize: '0.9rem' }}
                />
              </div>

              <select
                value={accountRoleFilter}
                onChange={(e) => setAccountRoleFilter(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="department">Khoa phòng</option>
                <option value="admin">Quản trị viên</option>
              </select>

              <button
                onClick={fetchAccounts}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Tải lại danh sách tài khoản"
              >
                <FaSync /> Làm mới
              </button>
            </div>

            <button
              onClick={handleOpenAddAccount}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
            >
              <FaPlus /> Thêm Tài Khoản Mới
            </button>
          </div>

          {/* Accounts Table Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {loadingAccounts ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải danh sách tài khoản...</p>
              </div>
            ) : accountsError ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                ⚠️ {accountsError}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '0.9rem 1rem', width: '50px', textAlign: 'center' }}>STT</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Khoa / Phòng</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Tên Đăng Nhập (Username)</th>
                      <th style={{ padding: '0.9rem 1rem', width: '140px', textAlign: 'center' }}>Vai Trò</th>
                      <th style={{ padding: '0.9rem 1rem', width: '280px', textAlign: 'center' }}>Quản Lý Mật Khẩu & Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsList
                      .filter(acc => {
                        if (accountRoleFilter !== 'all' && acc.role !== accountRoleFilter) return false;
                        if (!accountSearch.trim()) return true;
                        const q = accountSearch.toLowerCase();
                        return (
                          (acc.username && acc.username.toLowerCase().includes(q)) ||
                          (acc.department_name && acc.department_name.toLowerCase().includes(q)) ||
                          (acc.department_code && acc.department_code.toLowerCase().includes(q))
                        );
                      })
                      .map((acc, index) => {
                        const isAdmin = acc.role === 'admin';
                        return (
                          <tr
                            key={acc.id}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'; }}
                          >
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: '700', color: isAdmin ? '#7C3AED' : '#0F2C59' }}>
                                {isAdmin ? '🛡️ ' : '🏥 '}{acc.department_name}
                              </div>
                              {acc.department_code && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#64748B',
                                  backgroundColor: '#E2E8F0',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  Mã: {acc.department_code}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  fontFamily: 'monospace',
                                  fontWeight: '800',
                                  fontSize: '0.98rem',
                                  backgroundColor: '#F1F5F9',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  color: '#0F2C59'
                                }}>
                                  {acc.username}
                                </span>
                                <button
                                  onClick={() => handleCopyAccount(acc.username, `user_${acc.id}`)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: copiedAccount === `user_${acc.id}` ? 'var(--brand-green)' : '#94A3B8',
                                    padding: '0.25rem',
                                    display: 'flex', alignItems: 'center'
                                  }}
                                  title="Copy tên đăng nhập"
                                >
                                  {copiedAccount === `user_${acc.id}` ? <FaCheckCircle style={{ color: '#16A34A' }} /> : <FaCopy />}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              {isAdmin ? (
                                <span className="badge" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD', padding: '0.35rem 0.65rem' }}>
                                  🛡️ Quản Trị Viên
                                </span>
                              ) : (
                                <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '0.35rem 0.65rem' }}>
                                  🏥 Khoa Phòng
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleOpenChangePassword(acc)}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: '#0F2C59',
                                    color: '#FFFFFF',
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    borderRadius: '5px'
                                  }}
                                  title="Đổi mật khẩu cho tài khoản này"
                                >
                                  <FaKey style={{ color: '#FDE047' }} /> Đổi Mật Khẩu
                                </button>

                                <button
                                  onClick={() => handleQuickResetPassword(acc)}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.35rem 0.55rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '5px'
                                  }}
                                  title="Đặt lại mật khẩu nhanh về '123'"
                                >
                                  <FaUnlockAlt /> Reset (123)
                                </button>

                                <button
                                  onClick={() => handleOpenEditAccount(acc)}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.35rem 0.55rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '5px'
                                  }}
                                  title="Chỉnh sửa thông tin tài khoản"
                                >
                                  <FaEdit /> Sửa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ĐỔI MẬT KHẨU TÀI KHOẢN (CHANGE PASSWORD MODAL)         */}
      {/* ============================================================ */}
      {pwdModalOpen && pwdAccount && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', borderRadius: '12px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#0F2C59',
              color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaKey style={{ color: '#FDE047' }} /> Đổi Mật Khẩu Tài Khoản
              </h3>
              <button onClick={() => setPwdModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Account Info Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex', flexDirection: 'column', gap: '0.35rem'
              }}>
                <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Khoa / Phòng: <strong style={{ color: '#0F2C59', fontSize: '0.95rem' }}>{pwdAccount.department_name}</strong>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Tên đăng nhập: <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#2563EB', fontSize: '1.05rem', backgroundColor: '#DBEAFE', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{pwdAccount.username}</span>
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label style={{ fontWeight: '700', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mật khẩu mới <span style={{ color: 'var(--brand-red)' }}>*</span></span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 'normal' }}>(Có thể nhập tùy ý)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', top: '50%', left: '0.9rem', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.8rem 0.7rem 2.5rem',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1rem',
                      fontWeight: '700',
                      fontFamily: showNewPassword ? 'monospace' : 'inherit'
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      top: '50%', right: '0.65rem',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: '0.4rem'
                    }}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Quick Password Presets */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  ⚡ Gợi ý mật khẩu nhanh:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setNewPassword('123')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F1F5F9',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#0F2C59'
                    }}
                  >
                    123 (Mặc định)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPassword('bvbl@2026')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F1F5F9',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#0F2C59'
                    }}
                  >
                    bvbl@2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPassword(`${pwdAccount.username}@123`)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F1F5F9',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#0F2C59'
                    }}
                  >
                    {pwdAccount.username}@123
                  </button>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      border: '1px solid #DDD6FE',
                      backgroundColor: '#FAF5FF',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#7C3AED',
                      display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}
                  >
                    <FaDice /> Tạo ngẫu nhiên
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPwdModalOpen(false)}
                  disabled={savingPassword}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSavePassword}
                  disabled={savingPassword || !newPassword.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', padding: '0.65rem 1.25rem' }}
                >
                  {savingPassword ? <><FaSpinner className="spinner" /> Đang cập nhật...</> : <><FaSave /> Cập Nhật Mật Khẩu</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: THÊM / SỬA THÔNG TIN TÀI KHOẢN                        */}
      {/* ============================================================ */}
      {accModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '520px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', borderRadius: '12px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#0F2C59',
              color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaUserShield /> {editingAccountId ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Mới Tài Khoản Khoa Phòng'}
              </h3>
              <button onClick={() => setAccModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveAccount} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Tên Khoa / Phòng <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                <input
                  type="text"
                  placeholder="VD: Khoa Nội tổng hợp, Phòng Kế Hoạch..."
                  value={accFormData.department_name}
                  onChange={(e) => setAccFormData({ ...accFormData, department_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Tên Đăng Nhập (Username) <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="VD: noi.bvbl, khnv..."
                    value={accFormData.username}
                    onChange={(e) => setAccFormData({ ...accFormData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Mã Khoa (Dept Code) <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="VD: noi, nhi, san..."
                    value={accFormData.department_code}
                    onChange={(e) => setAccFormData({ ...accFormData, department_code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Vai Trò (Role)</label>
                  <select
                    value={accFormData.role}
                    onChange={(e) => setAccFormData({ ...accFormData, role: e.target.value })}
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <option value="department">Khoa phòng</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>
                    {editingAccountId ? 'Mật khẩu mới (Nếu muốn đổi)' : 'Mật khẩu khởi tạo'}
                  </label>
                  <input
                    type="text"
                    placeholder={editingAccountId ? 'Để trống nếu giữ nguyên' : 'VD: 123'}
                    value={accFormData.password}
                    onChange={(e) => setAccFormData({ ...accFormData, password: e.target.value })}
                    required={!editingAccountId}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAccModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingAccount} style={{ fontWeight: '700' }}>
                  {savingAccount ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Tài Khoản</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {staffModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--brand-blue)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaUsers /> {editingStaffId ? 'Chỉnh Sửa Nhân Sự' : 'Thêm Mới Nhân Sự'}
              </h3>
              <button onClick={() => setStaffModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {staffActionMsg.text && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  backgroundColor: staffActionMsg.type === 'error' ? 'var(--danger-light)' : 'var(--brand-green-subtle)',
                  color: staffActionMsg.type === 'error' ? 'var(--danger)' : 'var(--brand-green)'
                }}>
                  {staffActionMsg.text}
                </div>
              )}

              <div className="form-group">
                <label>Họ và Tên Nhân Sự <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="VD: BS. Nguyễn Văn A..."
                  value={staffFormData.full_name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, full_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Chức Danh / Vị Trí <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                  <select 
                    value={staffFormData.position}
                    onChange={(e) => setStaffFormData({ ...staffFormData, position: e.target.value })}
                  >
                    <option value="Bác sĩ">Bác sĩ</option>
                    <option value="Điều dưỡng">Điều dưỡng</option>
                    <option value="Hộ sinh">Hộ sinh</option>
                    <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                    <option value="Dược sĩ">Dược sĩ</option>
                    <option value="Y sĩ">Y sĩ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Giới Tính</label>
                  <select 
                    value={staffFormData.gender}
                    onChange={(e) => setStaffFormData({ ...staffFormData, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Khoa Phòng Làm Việc <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                <select 
                  value={staffFormData.department}
                  onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                >
                  {DEPARTMENT_ORDER.map(code => (
                    <option key={code} value={code}>
                      {DEPARTMENT_MAP[code] || code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Số Chứng Chỉ Hành Nghề (CCHN)</label>
                <input 
                  type="text" 
                  placeholder="VD: CCHN-001234/BL"
                  value={staffFormData.certificate}
                  onChange={(e) => setStaffFormData({ ...staffFormData, certificate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStaffModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingStaff}>
                  {savingStaff ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Nhân Sự</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: XÁC NHẬN XÓA NHÂN SỰ                                   */}
      {/* ============================================================ */}
      {staffToDelete && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem' }}>
            <FaExclamationTriangle style={{ fontSize: '3rem', color: 'var(--brand-red)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '0.5rem' }}>
              Xác Nhận Xóa Nhân Sự?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Bạn có chắc chắn muốn xóa nhân sự <strong>"{staffToDelete.full_name}"</strong> thuộc khoa <strong>{DEPARTMENT_MAP[staffToDelete.department] || staffToDelete.department}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-danger" onClick={handleDeleteStaffConfirm} disabled={deletingStaff}>
                {deletingStaff ? <><FaSpinner className="spinner" /> Đang xóa...</> : <><FaTrash /> Xác nhận xóa</>}
              </button>
              <button className="btn btn-secondary" onClick={() => setStaffToDelete(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: XEM / SỬA / XÓA BÁO CÁO GIAO BAN                      */}
      {/* ============================================================ */}
      {modalOpen && modalDept && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--brand-blue)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px' }} />
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                    {modalDept.departmentName}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#DBEAFE', margin: '0.2rem 0 0 0' }}>
                    Báo cáo giao ban ngày: <strong>{editHeader.reportDate || date}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {loadingReport ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Đang tải thông tin báo cáo...</p>
                </div>
              ) : (
                <div>
                  {saveSuccess && (
                    <div style={{ backgroundColor: 'var(--brand-green-subtle)', color: 'var(--brand-green)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: '600' }}>
                      ✅ {saveSuccess}
                    </div>
                  )}

                  {/* Section 1: Thông tin ca trực */}
                  <div className="sub-section" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--brand-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaUserMd /> Thông Tin Ca Trực
                    </h4>
                    {!hasReport && !isEditing && (
                      <div style={{
                        padding: '0.85rem 1.25rem',
                        backgroundColor: '#FFFBEB',
                        border: '1.5px solid #FDE68A',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div style={{ color: '#92400E', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                          <span>Khoa <strong>{modalDept?.departmentName}</strong> chưa nộp báo cáo cho ngày <strong>{editHeader.reportDate || date}</strong>.</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsEditing(true)}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <FaEdit /> Nhập báo cáo hộ khoa
                        </button>
                      </div>
                    )}

                    {isEditing ? (
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Admin chỉnh ngày báo cáo */}
                        <div className="form-group full-width" style={{ gridColumn: '1 / -1', backgroundColor: '#EFF6FF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                          <label style={{ color: '#1E40AF', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                            <FaCalendarAlt /> Ngày Báo Cáo Giao Ban (Admin có thể sửa ngày)
                          </label>
                          <input 
                            type="date" 
                            value={editHeader.reportDate || date} 
                            onChange={(e) => setEditHeader({...editHeader, reportDate: e.target.value})} 
                            style={{ fontWeight: '700', color: '#1E40AF', width: '100%' }}
                          />
                          <small style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '4px', display: 'block' }}>
                            💡 Gợi ý: Nếu khoa nộp nhầm ngày, Admin chọn lại ngày chuẩn tại đây để tự động dời báo cáo.
                          </small>
                        </div>

                        <div className="form-group">
                          <label>Bác sĩ trực chính</label>
                          <input 
                            type="text" 
                            value={editHeader.doctorName} 
                            onChange={(e) => setEditHeader({...editHeader, doctorName: e.target.value})} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Điều dưỡng trực ca</label>
                          <input 
                            type="text" 
                            value={editHeader.nurseName} 
                            onChange={(e) => setEditHeader({...editHeader, nurseName: e.target.value})} 
                            placeholder="VD: ĐD. An, ĐD. Thanh"
                          />
                        </div>
                        <div className="form-group">
                          <label>Phòng / Buồng</label>
                          <input 
                            type="text" 
                            value={editHeader.room} 
                            onChange={(e) => setEditHeader({...editHeader, room: e.target.value})} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Thời gian trực</label>
                          <input 
                            type="text" 
                            value={editHeader.shiftTime} 
                            onChange={(e) => setEditHeader({...editHeader, shiftTime: e.target.value})} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div><strong>📅 Ngày báo cáo:</strong> <p style={{ color: 'var(--brand-blue)', fontWeight: '700', margin: '0.25rem 0 0 0' }}>{editHeader.reportDate || date}</p></div>
                        <div><strong>👨‍⚕️ Bác sĩ trực chính:</strong> <p style={{ color: 'var(--brand-blue)', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{editHeader.doctorName || '—'}</p></div>
                        <div><strong>👩‍⚕️ Điều dưỡng trực:</strong> <p style={{ color: 'var(--brand-blue)', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{editHeader.nurseName || '—'}</p></div>
                        <div><strong>Phòng / Buồng:</strong> <p style={{ margin: '0.25rem 0 0 0' }}>{editHeader.room || '—'}</p></div>
                        <div><strong>Thời gian trực:</strong> <p style={{ margin: '0.25rem 0 0 0' }}>{editHeader.shiftTime || '—'}</p></div>
                      </div>
                    )}

                    {/* Nhân sự thêm giờ display */}
                    {editHeader.overtimeStaff && editHeader.overtimeStaff.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <strong>⏰ Nhân sự trực thêm giờ:</strong>
                        <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                          {editHeader.overtimeStaff.map((ot, i) => (
                            <li key={i}>{ot.staffName} — <em>{ot.time}</em></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Dữ liệu chuyên môn */}
                  <div className="sub-section" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--brand-blue)', marginBottom: '1rem' }}>
                      📊 Dữ Liệu Báo Cáo Chuyên Môn
                    </h4>
                    {isEditing ? (
                      <div>
                        {(() => {
                          const DeptFormComponent = modalDept ? DEPARTMENT_FORMS[modalDept.departmentCode] : null;
                          if (DeptFormComponent) {
                            return (
                              <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                                <DeptFormComponent
                                  doctorName={editHeader.doctorName}
                                  formData={editReportData}
                                  setFormData={setEditReportData}
                                  transferCases={editTransferCases}
                                  setTransferCases={setEditTransferCases}
                                />
                              </div>
                            );
                          }
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                              {Object.entries(editReportData).map(([key, val]) => {
                                if (typeof val === 'object' && val !== null) return null;
                                return (
                                  <div key={key} className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>{FIELD_LABELS[key] || key}</label>
                                    <input 
                                      type="text" 
                                      value={val === null || val === undefined ? '' : String(val)} 
                                      onChange={(e) => handleDataChange(key, e.target.value)} 
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <ReportDataViewer data={editReportData} />
                    )}
                  </div>

                  {/* Section 3: Bệnh nhân chuyển viện */}
                  <div className="sub-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', color: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FaAmbulance /> Bệnh Chuyển Viện ({editTransferCases.length} ca)
                      </h4>
                      {isEditing && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddTransferCase}>
                          <FaPlus /> Thêm ca chuyển
                        </button>
                      )}
                    </div>

                    {editTransferCases.length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Không có ca chuyển viện.</p>
                    ) : (
                      editTransferCases.map((tc, idx) => (
                        <div key={idx} className="sub-section" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--brand-red)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ color: 'var(--brand-red)', fontWeight: '700', margin: 0 }}>
                              Ca #{idx + 1} {tc.patient_name || tc.patientName ? `— ${tc.patient_name || tc.patientName}` : ''}
                            </h5>
                            {isEditing && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveTransferCase(idx)}>
                                <FaTrash /> Xóa
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Họ và tên bệnh nhân</label>
                                <input type="text" value={tc.patientName || tc.patient_name || ''} onChange={(e) => handleTransferCaseChange(idx, 'patientName', e.target.value)} placeholder="VD: Nguyễn Văn A" />
                              </div>
                              <div className="form-group">
                                <label>Tuổi / Năm sinh</label>
                                <input type="text" value={tc.age || ''} onChange={(e) => handleTransferCaseChange(idx, 'age', e.target.value)} placeholder="VD: 45 tuổi" />
                              </div>
                              <div className="form-group full-width">
                                <label>Địa chỉ thường trú</label>
                                <input type="text" value={tc.address || ''} onChange={(e) => handleTransferCaseChange(idx, 'address', e.target.value)} placeholder="VD: P. An Lộc, Bình Long, Bình Phước" />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện</label>
                                <input type="text" value={tc.admissionTime || tc.admission_time || ''} onChange={(e) => handleTransferCaseChange(idx, 'admissionTime', e.target.value)} placeholder="08:30 ngày 14/08/2026" />
                              </div>
                              <div className="form-group full-width">
                                <label>Lý do vào viện</label>
                                <input type="text" value={tc.reason || ''} onChange={(e) => handleTransferCaseChange(idx, 'reason', e.target.value)} placeholder="Lý do..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Lâm sàng / Triệu chứng khám / Sinh hiệu</label>
                                <textarea value={tc.clinicalSymptoms || tc.clinical_symptoms || ''} onChange={(e) => handleTransferCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="note-field" rows={2} placeholder="Tri giác, sinh hiệu, khám lâm sàng..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / XN / X-Quang</label>
                                <textarea value={tc.clinicalTests || tc.clinical_tests || ''} onChange={(e) => handleTransferCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" rows={2} placeholder="Kết quả CLS..." />
                              </div>
                              <div className="form-group full-width">
                                <label style={{ color: '#B45309', fontWeight: '700' }}>Chẩn đoán xác định</label>
                                <input type="text" value={tc.diagnosis || ''} onChange={(e) => handleTransferCaseChange(idx, 'diagnosis', e.target.value)} placeholder="Chẩn đoán..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Xử trí ban đầu</label>
                                <textarea value={tc.initialTreatment || tc.initial_treatment || ''} onChange={(e) => handleTransferCaseChange(idx, 'initialTreatment', e.target.value)} className="note-field" rows={2} placeholder="Thuốc, dịch truyền..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Diễn biến / Hội chẩn / Tình trạng chuyển</label>
                                <textarea value={tc.progressNotes || tc.progress_notes || ''} onChange={(e) => handleTransferCaseChange(idx, 'progressNotes', e.target.value)} className="note-field" rows={2} placeholder="Diễn biến..." />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {tc.patient_name || tc.patientName || '—'}{tc.age ? ` (${tc.age} tuổi)` : ''}</div>
                              {tc.address && <div><strong>Địa chỉ:</strong> {tc.address}</div>}
                              <div><strong>Giờ vào:</strong> {tc.admission_time || tc.admissionTime || '—'}</div>
                              <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                              {tc.clinical_symptoms || tc.clinicalSymptoms ? <div><strong>Lâm sàng:</strong> {tc.clinical_symptoms || tc.clinicalSymptoms}</div> : null}
                              {tc.clinical_tests || tc.clinicalTests ? <div><strong>Cận lâm sàng:</strong> {tc.clinical_tests || tc.clinicalTests}</div> : null}
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#B45309', fontWeight: '600' }}>{tc.diagnosis || '—'}</span></div>
                              <div><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                              {tc.progress_notes || tc.progressNotes ? <div><strong>Diễn biến / Hội chẩn:</strong> {tc.progress_notes || tc.progressNotes}</div> : null}
                            </div>
                          )}
                          <CaseImageUploader
                            images={tc.images}
                            onChange={(newImgs) => handleTransferCaseChange(idx, 'images', newImgs)}
                            theme="amber"
                            patientName={tc.patientName || tc.patient_name}
                            readOnly={!isEditing}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section 4: Bệnh phẫu thuật (Bệnh mổ) */}
                  <div className="sub-section" style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FaProcedures /> Bệnh Phẫu Thuật (Mổ) ({editSurgeryCases.length} ca)
                      </h4>
                      {isEditing && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSurgeryCase} style={{ backgroundColor: '#E0F2FE', color: '#0369A1', borderColor: '#BAE6FD' }}>
                          <FaPlus /> Thêm ca mổ
                        </button>
                      )}
                    </div>

                    {editSurgeryCases.length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Không có ca phẫu thuật.</p>
                    ) : (
                      editSurgeryCases.map((sc, idx) => (
                        <div key={idx} className="sub-section" style={{ marginBottom: '1rem', borderLeft: '3px solid #0284C7' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ color: '#0369A1', fontWeight: '700', margin: 0 }}>
                              Ca Mổ #{idx + 1} {sc.patient_name || sc.patientName ? `— ${sc.patient_name || sc.patientName}` : ''}
                            </h5>
                            {isEditing && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveSurgeryCase(idx)}>
                                <FaTrash /> Xóa
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Họ tên</label>
                                <input type="text" value={sc.patientName || sc.patient_name || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'patientName', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Năm sinh / Tuổi</label>
                                <input type="text" value={sc.birthYear || sc.birth_year || sc.age || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'birthYear', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện</label>
                                <input type="text" value={sc.admissionTime || sc.admission_time || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'admissionTime', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lâm sàng / Triệu chứng / Sinh hiệu</label>
                                <textarea rows={2} value={sc.clinicalSymptoms || sc.clinical_symptoms || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="note-field" placeholder="Khám thực thể, phản ứng thành bụng, sinh hiệu..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / X-Quang / Siêu âm / XN</label>
                                <textarea rows={2} value={sc.clinicalTests || sc.clinical_tests || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" placeholder="Kết quả SA, XQ, CT, xét nghiệm..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán trước mổ</label>
                                <input type="text" value={sc.preoperativeDiagnosis || sc.preoperative_diagnosis || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'preoperativeDiagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lệnh mổ / Hội chẩn</label>
                                <input type="text" value={sc.consultationOrder || sc.consultation_order || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'consultationOrder', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán sau mổ</label>
                                <input type="text" value={sc.postoperativeDiagnosis || sc.postoperative_diagnosis || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'postoperativeDiagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Tình trạng hiện tại</label>
                                <input type="text" value={sc.currentStatus || sc.current_status || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'currentStatus', e.target.value)} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {sc.patient_name || sc.patientName || '—'} ({sc.birth_year || sc.birthYear || sc.age || '—'})</div>
                              <div><strong>Giờ vào:</strong> {sc.admission_time || sc.admissionTime || '—'}</div>
                              {sc.clinical_symptoms || sc.clinicalSymptoms ? <div><strong>Lâm sàng:</strong> {sc.clinical_symptoms || sc.clinicalSymptoms}</div> : null}
                              {sc.clinical_tests || sc.clinicalTests ? <div><strong>Cận lâm sàng:</strong> {sc.clinical_tests || sc.clinicalTests}</div> : null}
                              <div><strong>CĐ trước mổ:</strong> {sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</div>
                              <div><strong>Lệnh mổ:</strong> {sc.consultation_order || sc.consultationOrder || '—'}</div>
                              <div><strong>CĐ sau mổ:</strong> {sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</div>
                              <div><strong>Hiện tại:</strong> {sc.current_status || sc.currentStatus || '—'}</div>
                            </div>
                          )}
                          <CaseImageUploader
                            images={sc.images}
                            onChange={(newImgs) => handleSurgeryCaseChange(idx, 'images', newImgs)}
                            theme="blue"
                            patientName={sc.patientName || sc.patient_name}
                            readOnly={!isEditing}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section 5: Bệnh tử vong */}
                  <div className="sub-section" style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FaHeartbeat /> Bệnh Nhân Tử Vong ({editDeathCases.length} ca)
                      </h4>
                      {isEditing && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleAddDeathCase} style={{ backgroundColor: '#DC2626' }}>
                          <FaPlus /> Thêm ca tử vong
                        </button>
                      )}
                    </div>

                    {editDeathCases.length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Không có ca tử vong.</p>
                    ) : (
                      editDeathCases.map((dc, idx) => (
                        <div key={idx} className="sub-section" style={{ marginBottom: '1rem', borderLeft: '3px solid #DC2626', backgroundColor: '#FEF2F2' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ color: '#991B1B', fontWeight: '700', margin: 0 }}>
                              Hồ Sơ Tử Vong #{idx + 1} {dc.patient_name || dc.patientName ? `— ${dc.patient_name || dc.patientName}` : ''}
                            </h5>
                            {isEditing && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveDeathCase(idx)}>
                                <FaTrash /> Xóa
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Họ tên</label>
                                <input type="text" value={dc.patientName || dc.patient_name || ''} onChange={(e) => handleDeathCaseChange(idx, 'patientName', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Tuổi</label>
                                <input type="text" value={dc.age || ''} onChange={(e) => handleDeathCaseChange(idx, 'age', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện</label>
                                <input type="text" value={dc.admissionTime || dc.admission_time || ''} onChange={(e) => handleDeathCaseChange(idx, 'admissionTime', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Tình trạng lúc vào khoa</label>
                                <textarea rows={2} value={dc.admissionStatus || dc.admission_status || ''} onChange={(e) => handleDeathCaseChange(idx, 'admissionStatus', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Tiền sử bệnh</label>
                                <textarea rows={2} value={dc.medicalHistory || dc.medical_history || ''} onChange={(e) => handleDeathCaseChange(idx, 'medicalHistory', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lâm sàng / Triệu chứng khám / Sinh hiệu</label>
                                <textarea rows={2} value={dc.clinicalSymptoms || dc.clinical_symptoms || ''} onChange={(e) => handleDeathCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="note-field" placeholder="Tri giác, sinh hiệu, khám lúc cấp cứu..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / ECG</label>
                                <textarea rows={2} value={dc.clinicalTests || dc.clinical_tests || ''} onChange={(e) => handleDeathCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán</label>
                                <input type="text" value={dc.diagnosis || ''} onChange={(e) => handleDeathCaseChange(idx, 'diagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Xử trí cấp cứu</label>
                                <textarea rows={2} value={dc.emergencyTreatment || dc.emergency_treatment || ''} onChange={(e) => handleDeathCaseChange(idx, 'emergencyTreatment', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Kết quả & Hướng xử lý</label>
                                <textarea rows={2} value={dc.finalOutcome || dc.final_outcome || ''} onChange={(e) => handleDeathCaseChange(idx, 'finalOutcome', e.target.value)} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {dc.patient_name || dc.patientName || '—'} ({dc.age || '—'} tuổi)</div>
                              <div><strong>Giờ vào:</strong> {dc.admission_time || dc.admissionTime || '—'} | <strong>Lý do:</strong> {dc.reason || '—'}</div>
                              {dc.clinical_symptoms || dc.clinicalSymptoms ? <div><strong>Lâm sàng:</strong> {dc.clinical_symptoms || dc.clinicalSymptoms}</div> : null}
                              {dc.clinical_tests || dc.clinicalTests ? <div><strong>Cận lâm sàng:</strong> {dc.clinical_tests || dc.clinicalTests}</div> : null}
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#DC2626', fontWeight: 'bold' }}>{dc.diagnosis || '—'}</span></div>
                              <div><strong>Xử trí:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                              <div><strong>Kết quả:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                            </div>
                          )}
                          <CaseImageUploader
                            images={dc.images}
                            onChange={(newImgs) => handleDeathCaseChange(idx, 'images', newImgs)}
                            theme="red"
                            patientName={dc.patientName || dc.patient_name}
                            readOnly={!isEditing}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section 6: Bệnh nhân nặng theo dõi */}
                  <div className="sub-section" style={{ marginTop: '1.5rem', borderLeft: '3px solid #7C3AED' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FaHeartbeat style={{ color: '#7C3AED' }} /> Bệnh Nhân Nặng Theo Dõi ({editCriticalCases.length} ca)
                      </h4>
                      {isEditing && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCriticalCase} style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#DDD6FE' }}>
                          <FaPlus /> Thêm ca nặng
                        </button>
                      )}
                    </div>

                    {editCriticalCases.length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Không có ca bệnh nhân nặng theo dõi.</p>
                    ) : (
                      editCriticalCases.map((cc, idx) => (
                        <div key={idx} className="sub-section" style={{ marginBottom: '1rem', borderLeft: '3px solid #7C3AED', backgroundColor: '#FAF5FF' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ color: '#5B21B6', fontWeight: '700', margin: 0 }}>
                              Ca Nặng #{idx + 1} {cc.patient_name || cc.patientName ? `— ${cc.patient_name || cc.patientName}` : ''}
                            </h5>
                            {isEditing && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveCriticalCase(idx)}>
                                <FaTrash /> Xóa
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Họ và tên bệnh nhân</label>
                                <input type="text" value={cc.patientName || cc.patient_name || ''} onChange={(e) => handleCriticalCaseChange(idx, 'patientName', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Tuổi / Năm sinh</label>
                                <input type="text" value={cc.age || ''} onChange={(e) => handleCriticalCaseChange(idx, 'age', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện (VV)</label>
                                <input type="text" value={cc.admissionTime || cc.admission_time || ''} onChange={(e) => handleCriticalCaseChange(idx, 'admissionTime', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Địa chỉ / Phường xã</label>
                                <input type="text" value={cc.address || ''} onChange={(e) => handleCriticalCaseChange(idx, 'address', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Tiền căn</label>
                                <input type="text" value={cc.medicalHistory || cc.medical_history || ''} onChange={(e) => handleCriticalCaseChange(idx, 'medicalHistory', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lâm sàng / Triệu chứng / Sinh hiệu lúc vào</label>
                                <textarea rows={2} value={cc.clinicalSymptoms || cc.clinical_symptoms || ''} onChange={(e) => handleCriticalCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="note-field" placeholder="Tri giác, sinh hiệu..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / X-Quang / ECG / Xét nghiệm</label>
                                <textarea rows={2} value={cc.clinicalTests || cc.clinical_tests || ''} onChange={(e) => handleCriticalCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" placeholder="Kết quả CLS..." />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán</label>
                                <input type="text" value={cc.diagnosis || ''} onChange={(e) => handleCriticalCaseChange(idx, 'diagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Tình trạng bệnh & Diễn biến (Giao ban & Trong ngày)</label>
                                <textarea rows={3} value={cc.conditionSummary || cc.condition_summary || ''} onChange={(e) => handleCriticalCaseChange(idx, 'conditionSummary', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Xử trí điều trị</label>
                                <input type="text" value={cc.treatment || ''} onChange={(e) => handleCriticalCaseChange(idx, 'treatment', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Hướng tiếp theo / Ghi chú</label>
                                <input type="text" value={cc.notes !== undefined ? cc.notes : 'Bàn giao tua sau theo dõi tiếp'} onChange={(e) => handleCriticalCaseChange(idx, 'notes', e.target.value)} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {cc.patient_name || cc.patientName || '—'}{cc.age ? ` (${cc.age} tuổi)` : ''}{cc.address ? ` - ${cc.address}` : ''}</div>
                              <div><strong>Giờ vào:</strong> {cc.admission_time || cc.admissionTime || '—'} | <strong>Tiền căn:</strong> {cc.medical_history || cc.medicalHistory || 'Không'}</div>
                              {cc.clinical_symptoms || cc.clinicalSymptoms ? <div><strong>Lâm sàng:</strong> {cc.clinical_symptoms || cc.clinicalSymptoms}</div> : null}
                              {cc.clinical_tests || cc.clinicalTests ? <div><strong>Cận lâm sàng:</strong> {cc.clinical_tests || cc.clinicalTests}</div> : null}
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#6D28D9', fontWeight: 'bold' }}>{cc.diagnosis || '—'}</span></div>
                              <div><strong>Tình trạng & Diễn biến:</strong> {cc.condition_summary || cc.conditionSummary || '—'}</div>
                              <div><strong>Xử trí:</strong> {cc.treatment || '—'}</div>
                              <div><strong>Hướng tiếp theo:</strong> {cc.notes || 'Bàn giao tua sau theo dõi tiếp'}</div>
                            </div>
                          )}
                          <CaseImageUploader
                            images={cc.images}
                            onChange={(newImgs) => handleCriticalCaseChange(idx, 'images', newImgs)}
                            theme="purple"
                            patientName={cc.patientName || cc.patient_name}
                            readOnly={!isEditing}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                {hasReport && (
                  !showDeleteConfirm ? (
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <FaTrash /> Xóa Báo Cáo (Trở về Chưa Nộp)
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '600' }}>
                        ⚠️ Chắc chắn xóa?
                      </span>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={handleDeleteReport}
                        disabled={deleting}
                      >
                        {deleting ? <FaSpinner className="spinner" /> : 'Xác nhận xóa'}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Hủy
                      </button>
                    </div>
                  )
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {isEditing ? (
                  <>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSaveReport} disabled={saving}>
                      {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Thay Đổi</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                      <FaEdit /> {hasReport ? 'Chỉnh Sửa Báo Cáo' : 'Nhập Hộ Báo Cáo'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setModalOpen(false)}>Đóng</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Print Report Modal View */}
      {showPrintModal && (
        <MedicalPrintView
          date={date}
          reports={printReports}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Hospital System Footer Section */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
