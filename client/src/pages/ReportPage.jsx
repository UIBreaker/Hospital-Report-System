import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaUserMd, 
  FaUserNurse, 
  FaChevronRight, 
  FaSignOutAlt, 
  FaSpinner, 
  FaPaperPlane, 
  FaCheckCircle, 
  FaPlus, 
  FaTrash, 
  FaClock, 
  FaUsers 
} from 'react-icons/fa';
import reportService from '../services/reportService';
import staffService from '../services/staffService';

import HoiSucCapCuuForm from '../components/forms/departments/HoiSucCapCuuForm';
import ChuanDoanHinhAnhForm from '../components/forms/departments/ChuanDoanHinhAnhForm';
import YHocCoTruyenForm from '../components/forms/departments/YHocCoTruyenForm';
import NgoaiTongHopForm from '../components/forms/departments/NgoaiTongHopForm';
import ChanThuongChinhHinhForm from '../components/forms/departments/ChanThuongChinhHinhForm';
import NhiForm from '../components/forms/departments/NhiForm';
import NhiemForm from '../components/forms/departments/NhiemForm';
import GayMeHoiSucForm from '../components/forms/departments/GayMeHoiSucForm';
import SanForm from '../components/forms/departments/SanForm';
import XetNghiemForm from '../components/forms/departments/XetNghiemForm';
import NoiForm from '../components/forms/departments/NoiForm';
import LienChuyenKhoaForm from '../components/forms/departments/LienChuyenKhoaForm';
import SurgeryCaseForm from '../components/forms/SurgeryCaseForm';
import DeathCaseForm from '../components/forms/DeathCaseForm';
import StaffSelectCombobox from '../components/common/StaffSelectCombobox';

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

// Helper: Trích xuất tên sạch của nhân sự (bỏ số thứ tự và chức vụ trong datalist)
const extractCleanStaffName = (inputVal, allStaff = []) => {
  if (!inputVal || typeof inputVal !== 'string') return '';
  const trimmed = inputVal.trim();
  if (!trimmed) return '';

  // Khớp mẫu: "1. Lý Thị An - Bác sĩ (3939/BP-CCHN)" hoặc "1. Lý Thị An (3939/BP-CCHN)"
  const match = trimmed.match(/^\d+\.\s*([^\-(]+?)(?:\s*-\s*[^\(]+)?(?:\s*\([^)]*\))?$/);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }

  // Khớp trực tiếp với danh sách nhân sự nếu có tên trong database
  const found = allStaff.find(s => 
    trimmed.includes(s.full_name) || s.full_name.toLowerCase() === trimmed.toLowerCase()
  );
  if (found) return found.full_name;

  // Trường hợp nhập có số thứ tự đơn giản "1. Lý Thị An"
  const simple = trimmed.replace(/^\d+\.\s*/, '').trim();
  return simple || trimmed;
};

const ReportPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Danh sách nhân sự của khoa
  const [staffList, setStaffList] = useState({
    doctors: [],
    nurses: [],
    allStaff: []
  });
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = yesterday.toISOString().split('T')[0];

  const [headerData, setHeaderData] = useState({
    reportDate: formattedYesterday,
    selectedDoctor: '',
    selectedNurses: [''], // Hỗ trợ nhiều điều dưỡng trực
    overtimeStaff: [], // Danh sách: [{ id, staffName, time }]
    room: '',
    shiftTime: ''
  });

  const [formData, setFormData] = useState({});
  const [transferCases, setTransferCases] = useState([]);
  const [surgeryCases, setSurgeryCases] = useState([]);
  const [deathCases, setDeathCases] = useState([]);
  const [loadingExistingReport, setLoadingExistingReport] = useState(false);
  const [existingReportLoaded, setExistingReportLoaded] = useState(false);

  // Fetch danh sách nhân sự của khoa khi đăng nhập
  useEffect(() => {
    const fetchStaff = async () => {
      if (!user?.departmentCode) return;
      setLoadingStaff(true);
      try {
        const res = await staffService.getStaffByDepartment(user.departmentCode);
        if (res.success) {
          setStaffList({
            doctors: res.doctors || [],
            nurses: res.nurses || [],
            allStaff: res.allStaff || []
          });
        }
      } catch (err) {
        console.error('Không thể tải danh sách nhân sự khoa:', err);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [user?.departmentCode]);

  // Tự động tải lại toàn bộ dữ liệu báo cáo đã nộp của khoa theo ngày được chọn
  useEffect(() => {
    let isMounted = true;
    const fetchExistingReport = async () => {
      if (!user?.departmentCode || !headerData.reportDate) return;
      setLoadingExistingReport(true);
      try {
        const res = await reportService.getReport(user.departmentCode, headerData.reportDate);
        if (!isMounted) return;

        if (res?.data) {
          const report = res.data;
          let overtime = report.overtime_staff;
          if (typeof overtime === 'string') {
            try { overtime = JSON.parse(overtime); } catch (e) { overtime = []; }
          }

          // Parse danh sách điều dưỡng nếu lưu dạng chuỗi phân cách bởi dấu phẩy
          let nurses = [''];
          if (report.nurse_name) {
            const splitNurses = report.nurse_name.split(',').map(s => s.trim()).filter(Boolean);
            if (splitNurses.length > 0) {
              nurses = splitNurses;
            }
          }

          setHeaderData(prev => ({
            ...prev,
            selectedDoctor: report.doctor_name || '',
            selectedNurses: nurses,
            overtimeStaff: Array.isArray(overtime) ? overtime : [],
            room: report.room || '',
            shiftTime: report.shift_time || ''
          }));

          const parsedData = typeof report.report_data === 'string' 
            ? JSON.parse(report.report_data) 
            : (report.report_data || {});
          
          setFormData(parsedData);
          setTransferCases(report.transferCases || []);
          setSurgeryCases(report.surgeryCases || []);
          setDeathCases(report.deathCases || []);
          setExistingReportLoaded(true);
        } else {
          // Ngày này chưa có báo cáo -> reset form về trống để nhập mới
          setExistingReportLoaded(false);
          setFormData({});
          setTransferCases([]);
          setSurgeryCases([]);
          setDeathCases([]);
          setHeaderData(prev => ({
            ...prev,
            selectedDoctor: '',
            selectedNurses: [''],
            overtimeStaff: [],
            room: '',
            shiftTime: ''
          }));
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra báo cáo cũ:', err);
      } finally {
        if (isMounted) setLoadingExistingReport(false);
      }
    };

    fetchExistingReport();
    return () => { isMounted = false; };
  }, [user?.departmentCode, headerData.reportDate]);

  // Tạo danh sách datalist có số thứ tự tự động cho Bác sĩ
  const doctorOptions = useMemo(() => {
    const docs = staffList.doctors || [];
    const others = (staffList.nurses || []).filter(n => !docs.some(d => d.id === n.id));
    const list = [...docs, ...others];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Bác sĩ'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tạo danh sách datalist có số thứ tự tự động cho Điều dưỡng
  const nurseOptions = useMemo(() => {
    const nurs = staffList.nurses || [];
    const others = (staffList.doctors || []).filter(d => !nurs.some(n => n.id === d.id));
    const list = [...nurs, ...others];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Điều dưỡng'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tạo danh sách datalist toàn bộ nhân sự khoa cho Trực thêm giờ
  const allStaffOptions = useMemo(() => {
    const list = staffList.allStaff || [];
    return list.map((s, idx) => ({
      value: `${idx + 1}. ${s.full_name} - ${s.position || 'Nhân viên'}${s.certificate ? ` (${s.certificate})` : ''}`,
      rawName: s.full_name
    }));
  }, [staffList]);

  // Tính toán tên bác sĩ và điều dưỡng thực tế (chuẩn hóa tên sạch)
  const cleanDoctorName = extractCleanStaffName(headerData.selectedDoctor, staffList.allStaff);
  const cleanNurseNames = headerData.selectedNurses
    .map(n => extractCleanStaffName(n, staffList.allStaff))
    .filter(Boolean);
  const finalNurseNameStr = cleanNurseNames.join(', ');

  const handleNext = () => {
    if (cleanDoctorName) {
      setStep(2);
    }
  };

  // Thêm dòng điều dưỡng trực
  const handleAddNurse = () => {
    setHeaderData({
      ...headerData,
      selectedNurses: [...headerData.selectedNurses, '']
    });
  };

  // Cập nhật điều dưỡng trực
  const handleNurseChange = (index, value) => {
    const updated = [...headerData.selectedNurses];
    updated[index] = value;
    setHeaderData({ ...headerData, selectedNurses: updated });
  };

  // Xóa điều dưỡng trực
  const handleRemoveNurse = (index) => {
    const updated = headerData.selectedNurses.filter((_, i) => i !== index);
    setHeaderData({
      ...headerData,
      selectedNurses: updated.length > 0 ? updated : ['']
    });
  };

  // Thêm dòng nhân sự tăng cường thêm giờ
  const handleAddOvertimeStaff = () => {
    setHeaderData({
      ...headerData,
      overtimeStaff: [
        ...headerData.overtimeStaff,
        { id: Date.now(), staffName: '', time: '' }
      ]
    });
  };

  // Cập nhật dòng nhân sự tăng cường
  const handleOvertimeChange = (index, field, value) => {
    const updated = [...headerData.overtimeStaff];
    updated[index][field] = value;
    setHeaderData({ ...headerData, overtimeStaff: updated });
  };

  // Xóa dòng nhân sự tăng cường
  const handleRemoveOvertimeStaff = (index) => {
    const updated = headerData.overtimeStaff.filter((_, i) => i !== index);
    setHeaderData({ ...headerData, overtimeStaff: updated });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    // Chuẩn hóa danh sách nhân sự thêm giờ
    const formattedOvertime = headerData.overtimeStaff
      .map(item => ({
        staffName: extractCleanStaffName(item.staffName, staffList.allStaff),
        time: (item.time || '').trim()
      }))
      .filter(item => item.staffName || item.time);

    try {
      await reportService.createOrUpdateReport({
        departmentCode: user.departmentCode,
        reportDate: headerData.reportDate,
        doctorName: cleanDoctorName,
        nurseName: finalNurseNameStr || null,
        overtimeStaff: formattedOvertime.length > 0 ? formattedOvertime : null,
        room: headerData.room,
        shiftTime: headerData.shiftTime,
        reportData: formData,
        transferCases: transferCases,
        surgeryCases: surgeryCases,
        deathCases: deathCases
      });
      setSubmitted(true);
      setShowConfirm(false);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const FormComponent = DEPARTMENT_FORMS[user?.departmentCode];

  if (submitted) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
          <FaCheckCircle style={{ fontSize: '4rem', color: 'var(--brand-green)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--brand-green)' }}>Gửi Báo Cáo Thành Công!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Báo cáo giao ban ngày <strong>{headerData.reportDate}</strong> của khoa <strong>{user?.departmentName}</strong> đã được ghi nhận vào hệ thống.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => { 
                setSubmitted(false); 
                setStep(1); 
                setFormData({}); 
                setTransferCases([]); 
                setSurgeryCases([]);
                setDeathCases([]);
                setHeaderData({
                  ...headerData, 
                  selectedDoctor: '', 
                  selectedNurses: [''], 
                  overtimeStaff: [], 
                  room: '', 
                  shiftTime: ''
                }); 
              }}
            >
              Tạo báo cáo mới
            </button>
            <button className="btn btn-secondary" onClick={logout}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Brand Header */}
      <header className="card report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem 1.5rem', background: '#FFFFFF' }}>
        <div className="report-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img" />
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--brand-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h4>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-blue)', fontWeight: '800' }}>
              {user?.departmentName}
            </h2>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </header>

      {step === 1 ? (
        <div className="card animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-lighter)', paddingBottom: '0.75rem', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserMd style={{ color: 'var(--brand-red)' }} />
            Thông Tin Hành Chính Ca Trực
          </h3>
          
          {/* Thông báo tải lại báo cáo cũ */}
          {loadingExistingReport ? (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
              <FaSpinner className="spinner" style={{ color: 'var(--brand-blue)' }} /> Đang kiểm tra dữ liệu ngày {headerData.reportDate}...
            </div>
          ) : existingReportLoaded ? (
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#1E40AF' }}>
              <FaCheckCircle style={{ color: '#2563EB', fontSize: '1.1rem', flexShrink: 0 }} />
              <div>
                <strong>Đã nạp dữ liệu báo cáo ngày {headerData.reportDate}:</strong> Toàn bộ thông tin ca trực và số liệu chuyên môn đã nộp trước đó đã được tải sẵn. Bạn có thể tiếp tục chỉnh sửa hoặc nộp bổ sung.
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* 1. Ngày báo cáo */}
            <div className="form-group">
              <label>Ngày báo cáo <span style={{ color: 'var(--brand-red)' }}>*</span> ( Lưu ý chọn đúng ngày trực giao ban )</label>
              <div style={{ position: 'relative' }}>
                <FaCalendarAlt style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <input 
                  type="date" 
                  value={headerData.reportDate}
                  onChange={(e) => setHeaderData({...headerData, reportDate: e.target.value})}
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            {/* 2. Bác sĩ trực chính (Combobox tìm kiếm thông minh cao cấp) */}
            <div className="form-group">
              <StaffSelectCombobox
                label="Tên Bác sĩ trực chính"
                required={true}
                placeholder="Gõ số (1, 2...) hoặc gõ tên Bác sĩ để chọn nhanh..."
                value={headerData.selectedDoctor}
                onChange={(val) => setHeaderData({ ...headerData, selectedDoctor: val })}
                doctors={staffList.doctors}
                nurses={staffList.nurses}
                allStaff={staffList.allStaff}
                type="doctor"
                loading={loadingStaff}
                helpText="💡 Gợi ý: Bấm số (1, 2...) hoặc gõ tên chữ cái để chọn nhanh bác sĩ trực."
              />
            </div>

            {/* 3. Điều dưỡng trực ca (Hỗ trợ nhiều điều dưỡng ca trực) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaUserNurse style={{ color: '#059669' }} /> Điều dưỡng trực ca ({cleanNurseNames.length || 0})
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddNurse}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderColor: '#BBF7D0', color: '#166534', backgroundColor: '#F0FDF4' }}
                >
                  <FaPlus /> Thêm điều dưỡng
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {headerData.selectedNurses.map((nurseVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <StaffSelectCombobox
                        placeholder={idx === 0 ? "Gõ số (1, 2...) hoặc tên Điều dưỡng 1..." : `Gõ số hoặc tên Điều dưỡng ${idx + 1}...`}
                        value={nurseVal}
                        onChange={(val) => handleNurseChange(idx, val)}
                        doctors={staffList.doctors}
                        nurses={staffList.nurses}
                        allStaff={staffList.allStaff}
                        type="nurse"
                        loading={loadingStaff}
                      />
                    </div>
                    {headerData.selectedNurses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNurse(idx)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.45rem 0.65rem', height: '44px', borderRadius: '8px', flexShrink: 0 }}
                        title="Xóa điều dưỡng này"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <small style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                💡 Gợi ý: Bấm nút <strong>"+ Thêm điều dưỡng"</strong> nếu ca trực có từ 2 điều dưỡng trở lên.
              </small>
            </div>

            {/* 4. Phần: Nhân sự trực thêm giờ / Tăng cường */}
            <div className="sub-section" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ margin: 0, fontWeight: '700', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaUsers style={{ color: '#D97706' }} /> Nhân Sự Trực Thêm Giờ / Tăng Cường
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddOvertimeStaff}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  <FaPlus /> Thêm nhân sự tăng cường
                </button>
              </div>

              {headerData.overtimeStaff.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                  Chưa có nhân sự trực thêm giờ (Bấm nút trên nếu ca trực có nhân sự tăng cường).
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {headerData.overtimeStaff.map((ot, idx) => (
                    <div 
                      key={ot.id || idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.4fr 1fr auto', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      {/* Chọn nhân sự với StaffSelectCombobox */}
                      <div>
                        <StaffSelectCombobox
                          placeholder="Gõ số (1, 2...) hoặc tên..."
                          value={ot.staffName}
                          onChange={(val) => handleOvertimeChange(idx, 'staffName', val)}
                          doctors={staffList.doctors}
                          nurses={staffList.nurses}
                          allStaff={staffList.allStaff}
                          type="all"
                        />
                      </div>

                      {/* Nhập thời gian trực thêm giờ */}
                      <div>
                        <div style={{ position: 'relative' }}>
                          <FaClock style={{ position: 'absolute', top: '50%', left: '0.6rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }} />
                          <input
                            type="text"
                            placeholder="VD: 17h - 21h hoặc 4h MRT"
                            value={ot.time}
                            onChange={(e) => handleOvertimeChange(idx, 'time', e.target.value)}
                            style={{ paddingLeft: '1.8rem', fontSize: '0.85rem', width: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Nút xóa dòng */}
                      <button
                        type="button"
                        onClick={() => handleRemoveOvertimeStaff(idx)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem 0.6rem', height: '36px' }}
                        title="Xóa nhân sự này"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Phòng buồng & Thời gian trực */}
            <div className="header-step-row" style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phòng / Buồng trực (Không bắt buộc)</label>
                <input 
                  type="text" 
                  placeholder="VD: Phòng cấp cứu"
                  value={headerData.room}
                  onChange={(e) => setHeaderData({...headerData, room: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Thời gian trực (Không bắt buộc)</label>
                <input 
                  type="text" 
                  placeholder="VD: 07h00 - 07h00"
                  value={headerData.shiftTime}
                  onChange={(e) => setHeaderData({...headerData, shiftTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!cleanDoctorName}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              Tiếp tục nhập báo cáo <FaChevronRight />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-slide-up">
          {/* Header summary bar */}
          <div className="card summary-bar" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #EFF6FF, #F8FAFC)', borderLeft: '4px solid var(--brand-blue)' }}>
            <div className="summary-bar-info" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <div>📅 <strong>Ngày báo cáo:</strong> {headerData.reportDate}</div>
              <div>👨‍⚕️ <strong>Bác sĩ trực:</strong> {cleanDoctorName}</div>
              {finalNurseNameStr && <div>👩‍⚕️ <strong>Điều dưỡng ({cleanNurseNames.length}):</strong> {finalNurseNameStr}</div>}
              {headerData.overtimeStaff.length > 0 && (
                <div>
                  ⏰ <strong>Tăng cường:</strong> {headerData.overtimeStaff.map(s => `${extractCleanStaffName(s.staffName, staffList.allStaff)} (${s.time})`).join(', ')}
                </div>
              )}
              {headerData.room && <div>🏥 <strong>Phòng:</strong> {headerData.room}</div>}
              {headerData.shiftTime && <div>⏱️ <strong>Ca trực:</strong> {headerData.shiftTime}</div>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>
              ✏️ Sửa thông tin ca trực
            </button>
          </div>

          {/* Dynamic department form */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {FormComponent ? (
              <FormComponent 
                reportDate={headerData.reportDate}
                doctorName={cleanDoctorName}
                room={headerData.room}
                shiftTime={headerData.shiftTime}
                formData={formData}
                setFormData={setFormData}
                transferCases={transferCases}
                setTransferCases={setTransferCases}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Không tìm thấy biểu mẫu cho khoa: {user?.departmentCode}
              </div>
            )}

            {/* Module Bệnh Phẫu Thuật (Bệnh Mổ) */}
            <SurgeryCaseForm surgeryCases={surgeryCases} setSurgeryCases={setSurgeryCases} />

            {/* Module Bệnh Tử Vong */}
            <DeathCaseForm deathCases={deathCases} setDeathCases={setDeathCases} />
          </div>

          {/* Submit error */}
          {submitError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ❌ {submitError}
            </div>
          )}

          {/* Submit button */}
          <div className="submit-area" style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 2rem' }}>
            {!showConfirm ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowConfirm(true)}
                style={{ fontSize: '1.1rem', padding: '0.9rem 3rem' }}
              >
                <FaPaperPlane /> Gửi Báo Cáo Giao Ban
              </button>
            ) : (
              <div className="card confirm-card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px', border: '2px solid var(--warning)', width: '100%' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>
                  ⚠️ Xác nhận gửi báo cáo ngày {headerData.reportDate} của khoa {user?.departmentName}?
                </p>
                <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    {submitting ? <><FaSpinner className="spinner" /> Đang gửi...</> : <>✅ Xác nhận gửi</>}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
