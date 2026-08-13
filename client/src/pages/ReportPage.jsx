import React, { useState, useEffect, useContext } from 'react';
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
    customDoctor: '',
    selectedNurse: '',
    customNurse: '',
    overtimeStaff: [], // Danh sách: [{ id, staffName, customName, time }]
    room: '',
    shiftTime: ''
  });

  const [formData, setFormData] = useState({});
  const [transferCases, setTransferCases] = useState([]);

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

  // Tính toán tên bác sĩ và điều dưỡng thực tế
  const finalDoctorName = headerData.selectedDoctor === '__CUSTOM__' 
    ? headerData.customDoctor.trim() 
    : headerData.selectedDoctor;

  const finalNurseName = headerData.selectedNurse === '__CUSTOM__'
    ? headerData.customNurse.trim()
    : headerData.selectedNurse;

  const handleNext = () => {
    if (finalDoctorName) {
      setStep(2);
    }
  };

  // Thêm dòng nhân sự tăng cường thêm giờ
  const handleAddOvertimeStaff = () => {
    setHeaderData({
      ...headerData,
      overtimeStaff: [
        ...headerData.overtimeStaff,
        { id: Date.now(), staffName: '', customName: '', time: '' }
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
        staffName: item.staffName === '__CUSTOM__' ? item.customName.trim() : item.staffName,
        time: item.time.trim()
      }))
      .filter(item => item.staffName || item.time);

    try {
      await reportService.createOrUpdateReport({
        departmentCode: user.departmentCode,
        reportDate: headerData.reportDate,
        doctorName: finalDoctorName,
        nurseName: finalNurseName || null,
        overtimeStaff: formattedOvertime.length > 0 ? formattedOvertime : null,
        room: headerData.room,
        shiftTime: headerData.shiftTime,
        reportData: formData,
        transferCases: transferCases,
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
                setHeaderData({
                  ...headerData, 
                  selectedDoctor: '', 
                  customDoctor: '', 
                  selectedNurse: '', 
                  customNurse: '', 
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

            {/* 2. Bác sĩ trực chính (Dropdown) */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tên Bác sĩ trực chính <span style={{ color: 'var(--brand-red)' }}>*</span></span>
                {loadingStaff && <span style={{ fontSize: '0.75rem', color: 'var(--brand-blue)' }}><FaSpinner className="spinner" /> Đang tải nhân sự...</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <FaUserMd style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select
                  value={headerData.selectedDoctor}
                  onChange={(e) => setHeaderData({ ...headerData, selectedDoctor: e.target.value })}
                  style={{ paddingLeft: '2.6rem', width: '100%' }}
                >
                  <option value="">-- Chọn Bác sĩ trực chính --</option>
                  {staffList.doctors.map(doc => (
                    <option key={doc.id} value={doc.full_name}>
                      👨‍⚕️ {doc.full_name} {doc.certificate ? `(${doc.certificate})` : ''}
                    </option>
                  ))}
                  {/* Trường hợp các nhân sự khác trong khoa cũng có thể trực */}
                  {staffList.nurses.length > 0 && (
                    <optgroup label="Nhân sự khác trong khoa">
                      {staffList.nurses.map(s => (
                        <option key={s.id} value={s.full_name}>
                          {s.full_name} ({s.position})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__CUSTOM__">✏️ Nhập tên Bác sĩ khác...</option>
                </select>
              </div>

              {headerData.selectedDoctor === '__CUSTOM__' && (
                <div style={{ marginTop: '0.65rem' }}>
                  <input 
                    type="text" 
                    placeholder="Nhập họ tên Bác sĩ trực chính..."
                    value={headerData.customDoctor}
                    onChange={(e) => setHeaderData({...headerData, customDoctor: e.target.value})}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 3. Điều dưỡng trực chính (Dropdown) */}
            <div className="form-group">
              <label>Điều dưỡng trực chính (Tùy chọn)</label>
              <div style={{ position: 'relative' }}>
                <FaUserNurse style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select
                  value={headerData.selectedNurse}
                  onChange={(e) => setHeaderData({ ...headerData, selectedNurse: e.target.value })}
                  style={{ paddingLeft: '2.6rem', width: '100%' }}
                >
                  <option value="">-- Chọn Điều dưỡng trực (Không bắt buộc) --</option>
                  {staffList.nurses.map(nur => (
                    <option key={nur.id} value={nur.full_name}>
                      👩‍⚕️ {nur.full_name} ({nur.position}{nur.certificate ? ` - ${nur.certificate}` : ''})
                    </option>
                  ))}
                  {staffList.doctors.length > 0 && (
                    <optgroup label="Bác sĩ trong khoa">
                      {staffList.doctors.map(d => (
                        <option key={d.id} value={d.full_name}>
                          {d.full_name} ({d.position})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__CUSTOM__">✏️ Nhập tên Điều dưỡng khác...</option>
                </select>
              </div>

              {headerData.selectedNurse === '__CUSTOM__' && (
                <div style={{ marginTop: '0.65rem' }}>
                  <input 
                    type="text" 
                    placeholder="Nhập họ tên Điều dưỡng trực..."
                    value={headerData.customNurse}
                    onChange={(e) => setHeaderData({...headerData, customNurse: e.target.value})}
                    autoFocus
                  />
                </div>
              )}
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
                        gridTemplateColumns: '1fr 1fr auto', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      {/* Chọn nhân sự */}
                      <div>
                        <select
                          value={ot.staffName}
                          onChange={(e) => handleOvertimeChange(idx, 'staffName', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem' }}
                        >
                          <option value="">-- Chọn nhân sự --</option>
                          {staffList.allStaff.map(s => (
                            <option key={s.id} value={s.full_name}>
                              {s.full_name} ({s.position})
                            </option>
                          ))}
                          <option value="__CUSTOM__">✏️ Nhập tên khác...</option>
                        </select>
                        {ot.staffName === '__CUSTOM__' && (
                          <input
                            type="text"
                            placeholder="Nhập tên nhân sự..."
                            value={ot.customName || ''}
                            onChange={(e) => handleOvertimeChange(idx, 'customName', e.target.value)}
                            style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}
                          />
                        )}
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
              disabled={!finalDoctorName}
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
              <div>👨‍⚕️ <strong>Bác sĩ trực:</strong> {finalDoctorName}</div>
              {finalNurseName && <div>👩‍⚕️ <strong>Điều dưỡng:</strong> {finalNurseName}</div>}
              {headerData.overtimeStaff.length > 0 && (
                <div>
                  ⏰ <strong>Tăng cường:</strong> {headerData.overtimeStaff.map(s => `${s.staffName === '__CUSTOM__' ? s.customName : s.staffName} (${s.time})`).join(', ')}
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
                doctorName={finalDoctorName}
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
