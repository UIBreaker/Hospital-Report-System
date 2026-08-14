import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaTv, 
  FaPrint,
  FaFileExcel,
  FaDownload,
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
  FaProcedures
} from 'react-icons/fa';
import reportService from '../services/reportService';
import staffService from '../services/staffService';
import MedicalPrintView from '../components/common/MedicalPrintView';

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
  noi: 'Khoa Nội',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Sản',
  yhct_phcn: 'Y học cổ truyền – Phục hồi chức năng',
  ngoai_th: 'Ngoại tổng hợp',
  ctch: 'Chấn thương chỉnh hình',
  gmhs: 'Gây mê Hồi sức',
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
  'gmhs'
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
  // DATABASE STATS STATE
  // -------------------------------------------------------------------------
  const [dbStats, setDbStats] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbError, setDbError] = useState('');
  const [lastDbUpdate, setLastDbUpdate] = useState('');

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

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchStatus();
    } else if (activeTab === 'staff') {
      fetchStaff();
    } else if (activeTab === 'database') {
      fetchDatabaseStats();
    }
  }, [date, activeTab, staffDeptFilter, staffPosFilter]);

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

  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await reportService.exportHospitalReportExcel(date);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Bao_Cao_Giao_Ban_Toan_Vien_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Không thể xuất file Excel: ' + (err.response?.data?.error || err.message || 'Lỗi hệ thống'));
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
      } else {
        setHasReport(false);
        setEditHeader({ reportDate: date, doctorName: '', nurseName: '', overtimeStaff: [], room: '', shiftTime: '' });
        setEditReportData({});
        setEditTransferCases([]);
        setEditSurgeryCases([]);
        setEditDeathCases([]);
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
        deathCases: editDeathCases
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

  // -------------------------------------------------------------------------
  // STATS COUNTERS
  // -------------------------------------------------------------------------
  const totalCount = statusList.length;
  const submittedCount = statusList.filter(s => s.status === 'submitted').length;

  const totalStaffCount = staffList.length;
  const doctorCount = staffList.filter(s => s.position === 'Bác sĩ' || s.position?.toLowerCase().includes('bác sĩ')).length;
  const nurseCount = staffList.filter(s => s.position !== 'Bác sĩ' && !s.position?.toLowerCase().includes('bác sĩ')).length;

  return (
    <div className="admin-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Header Card */}
      <header className="card admin-header" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', flexWrap: 'wrap', gap: '1rem' }}>
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
              <button 
                className="btn btn-secondary" 
                onClick={handleExportExcel} 
                disabled={exportingExcel} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: '#107C41', // Microsoft Excel Green
                  color: '#FFFFFF', 
                  borderColor: '#0B5C30',
                  boxShadow: '0 2px 6px rgba(16, 124, 65, 0.25)',
                  fontWeight: '700'
                }}
                title="Xuất file Excel tổng hợp toàn viện gồm 3 Sheet: Tổng hợp, Chi tiết Ca trực, Chi tiết Bệnh lý"
              >
                {exportingExcel ? (
                  <><FaSpinner className="spinner" /> Đang tạo Excel...</>
                ) : (
                  <><FaFileExcel style={{ fontSize: '1.05rem' }} /> Xuất Báo Cáo Excel</>
                )}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handleOpenPrint} 
                disabled={loadingPrint} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: '#059669', 
                  color: '#FFFFFF', 
                  borderColor: '#047857' 
                }}
              >
                <FaPrint /> {loadingPrint ? <><FaSpinner className="spinner" /> Đang nạp...</> : 'Xuất / In Báo Cáo Y Tế'}
              </button>

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
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'reports' ? 'var(--brand-blue)' : '#F1F5F9',
            color: activeTab === 'reports' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(15, 44, 89, 0.2)' : 'none'
          }}
        >
          <FaLayerGroup /> Báo Cáo Giao Ban
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'staff' ? 'var(--brand-blue)' : '#F1F5F9',
            color: activeTab === 'staff' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'staff' ? '0 4px 12px rgba(15, 44, 89, 0.2)' : 'none'
          }}
        >
          <FaUsers /> Quản Lý Nhân Sự ({totalStaffCount})
        </button>
        
        <button
          onClick={() => setActiveTab('database')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'database' ? 'var(--brand-blue)' : '#F1F5F9',
            color: activeTab === 'database' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'database' ? '0 4px 12px rgba(15, 44, 89, 0.2)' : 'none'
          }}
        >
          <FaDatabase /> Quản Lý Database
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BÁO CÁO GIAO BAN                                       */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          {/* Stats Summary Grid */}
          <div className="admin-stats-grid">
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{totalCount}</div>
              <div className="stats-lbl" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số khoa</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '4px solid var(--brand-green)' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-green)' }}>{submittedCount}</div>
              <div className="stats-lbl" style={{ color: 'var(--brand-green)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đã nộp</div>
            </div>
            <div className="card admin-stats-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderLeft: '4px solid #D97706' }}>
              <div className="stats-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#92400E' }}>{totalCount - submittedCount}</div>
              <div className="stats-lbl" style={{ color: '#92400E', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chưa nộp</div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--warning-light)', color: '#92400E', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
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
      {/* TAB 3: QUẢN LÝ DATABASE                                       */}
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
                  Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Giám sát dung lượng lưu trữ, cấu trúc bảng và tài nguyên hệ thống theo thời gian thực.
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
                onClick={fetchDatabaseStats} 
                disabled={loadingDb}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem' }}
              >
                <FaSync className={loadingDb ? 'spinner' : ''} /> {loadingDb ? 'Đang tải...' : 'Làm Mới Dữ Liệu'}
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
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang truy vấn thông tin dung lượng database...</p>
            </div>
          ) : dbStats ? (
            <>
              {/* Top Overview Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Metric 1: Total Storage & Progress Bar */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderLeft: '4px solid #10B981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tổng dung lượng đã dùng
                    </span>
                    <FaHdd style={{ color: '#10B981', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065F46' }}>
                      {dbStats.totalSizeMb} <span style={{ fontSize: '1rem', fontWeight: '600' }}>MB</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#047857' }}>
                      / {dbStats.maxLimitMb} MB ({dbStats.usagePercentage}% giới hạn)
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(dbStats.usagePercentage, 1)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981, #059669)',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                </div>

                {/* Metric 2: Tables & Records Count */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cấu trúc & Bản ghi
                    </span>
                    <FaTable style={{ color: 'var(--brand-blue)', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '0.2rem' }}>
                    {dbStats.tablesCount} <span style={{ fontSize: '1rem', fontWeight: '600' }}>bảng dữ liệu</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                    Ước tính khoảng <strong>{dbStats.totalRows}</strong> bản ghi tổng cộng
                  </div>
                </div>

                {/* Metric 3: Database Name & Status */}
                <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)', borderLeft: '4px solid #8B5CF6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cơ sở dữ liệu
                    </span>
                    <FaServer style={{ color: '#8B5CF6', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#5B21B6', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
                    {dbStats.databaseName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                      ✓ Kết Nối Sẵn Sàng (Online)
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Details Card */}
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
      {/* MODAL: THÊM / SỬA NHÂN VIÊN                                   */}
      {/* ============================================================ */}
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
                                <label>Tên / Tuổi / ĐC</label>
                                <input type="text" value={tc.patientName || tc.patient_name || ''} onChange={(e) => handleTransferCaseChange(idx, 'patientName', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Giờ vào viện</label>
                                <input type="text" value={tc.admissionTime || tc.admission_time || ''} onChange={(e) => handleTransferCaseChange(idx, 'admissionTime', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Lý do vào viện</label>
                                <input type="text" value={tc.reason || ''} onChange={(e) => handleTransferCaseChange(idx, 'reason', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Cận lâm sàng / XN</label>
                                <textarea value={tc.clinicalTests || tc.clinical_tests || ''} onChange={(e) => handleTransferCaseChange(idx, 'clinicalTests', e.target.value)} className="note-field" rows={2} />
                              </div>
                              <div className="form-group full-width">
                                <label>Chẩn đoán</label>
                                <input type="text" value={tc.diagnosis || ''} onChange={(e) => handleTransferCaseChange(idx, 'diagnosis', e.target.value)} />
                              </div>
                              <div className="form-group full-width">
                                <label>Xử trí ban đầu</label>
                                <textarea value={tc.initialTreatment || tc.initial_treatment || ''} onChange={(e) => handleTransferCaseChange(idx, 'initialTreatment', e.target.value)} className="note-field" rows={2} />
                              </div>
                              <div className="form-group full-width">
                                <label>Diễn biến / Hội chẩn</label>
                                <textarea value={tc.progressNotes || tc.progress_notes || ''} onChange={(e) => handleTransferCaseChange(idx, 'progressNotes', e.target.value)} className="note-field" rows={2} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div><strong>Bệnh nhân:</strong> {tc.patient_name || tc.patientName || '—'}</div>
                              <div><strong>Giờ vào:</strong> {tc.admission_time || tc.admissionTime || '—'}</div>
                              <div><strong>Lý do:</strong> {tc.reason || '—'}</div>
                              <div><strong>Chẩn đoán:</strong> {tc.diagnosis || '—'}</div>
                              <div><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                            </div>
                          )}
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
                                <label>Địa chỉ</label>
                                <input type="text" value={sc.address || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'address', e.target.value)} />
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
                              <div><strong>CĐ trước mổ:</strong> {sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}</div>
                              <div><strong>Lệnh mổ:</strong> {sc.consultation_order || sc.consultationOrder || '—'}</div>
                              <div><strong>CĐ sau mổ:</strong> {sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}</div>
                              <div><strong>Hiện tại:</strong> {sc.current_status || sc.currentStatus || '—'}</div>
                            </div>
                          )}
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
                                <label>Cận lâm sàng / ECG</label>
                                <textarea rows={2} value={dc.clinicalTests || dc.clinical_tests || ''} onChange={(e) => handleDeathCaseChange(idx, 'clinicalTests', e.target.value)} />
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
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#DC2626', fontWeight: 'bold' }}>{dc.diagnosis || '—'}</span></div>
                              <div><strong>Xử trí:</strong> {dc.emergency_treatment || dc.emergencyTreatment || '—'}</div>
                              <div><strong>Kết quả:</strong> {dc.final_outcome || dc.finalOutcome || '—'}</div>
                            </div>
                          )}
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
                      <FaEdit /> Chỉnh Sửa Báo Cáo
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
    </div>
  );
};

export default AdminDashboard;
