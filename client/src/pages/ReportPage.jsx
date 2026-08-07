import React, { useState, useContext, Suspense } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FaCalendarAlt, FaUserMd, FaChevronRight, FaHospitalAlt, FaSignOutAlt, FaSpinner, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import reportService from '../services/reportService';

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

const DEPARTMENT_FORMS = {
  hscc_tnt: HoiSucCapCuuForm,
  cdha: ChuanDoanHinhAnhForm,
  yhct_phcn: YHocCoTruyenForm,
  ngoai_th: NgoaiTongHopForm,
  ctch: ChanThuongChinhHinhForm,
  nhi: NhiForm,
  nhiem: NhiemForm,
  gmhs: GayMeHoiSucForm,
  san: SanForm,
  xn: XetNghiemForm,
};

const ReportPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = yesterday.toISOString().split('T')[0];

  const [headerData, setHeaderData] = useState({
    reportDate: formattedYesterday,
    doctorName: '',
    room: '',
    shiftTime: ''
  });

  const [formData, setFormData] = useState({});
  const [transferCases, setTransferCases] = useState([]);

  const handleNext = () => {
    if (headerData.doctorName.trim()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await reportService.createOrUpdateReport({
        departmentCode: user.departmentCode,
        reportDate: headerData.reportDate,
        doctorName: headerData.doctorName,
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
          <FaCheckCircle style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Gửi báo cáo thành công!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Báo cáo ngày {headerData.reportDate} của {user?.departmentName} đã được ghi nhận.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(1); setFormData({}); setTransferCases([]); setHeaderData({...headerData, doctorName: '', room: '', shiftTime: ''}); }}>
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
            <FaHospitalAlt size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Xin chào, {user?.departmentName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Báo cáo giao ban hằng ngày</p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          <FaSignOutAlt /> Đăng xuất
        </button>
      </header>

      {step === 1 ? (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '1rem', color: 'var(--primary)' }}>
            <FaUserMd style={{ marginRight: '0.5rem' }} />
            Thông tin ca trực
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Ngày báo cáo</label>
              <div style={{ position: 'relative' }}>
                <FaCalendarAlt style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <input 
                  type="date" 
                  value={headerData.reportDate}
                  onChange={(e) => setHeaderData({...headerData, reportDate: e.target.value})}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bác sĩ trực chính <span style={{color: 'var(--danger)'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <FaUserMd style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <input 
                  type="text" 
                  placeholder="Nhập tên bác sĩ trực..."
                  value={headerData.doctorName}
                  onChange={(e) => setHeaderData({...headerData, doctorName: e.target.value})}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phòng/Buồng</label>
                <input 
                  type="text" 
                  placeholder="VD: Phòng cấp cứu"
                  value={headerData.room}
                  onChange={(e) => setHeaderData({...headerData, room: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Thời gian trực</label>
                <input 
                  type="text" 
                  placeholder="VD: 7h - 19h"
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
              disabled={!headerData.doctorName.trim()}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              Tiếp tục <FaChevronRight />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-slide-up">
          {/* Header summary bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div><strong>📅 Ngày:</strong> {headerData.reportDate}</div>
              <div><strong>👨‍⚕️ Bác sĩ:</strong> {headerData.doctorName}</div>
              {headerData.room && <div><strong>🏥 Phòng:</strong> {headerData.room}</div>}
              {headerData.shiftTime && <div><strong>⏰ Giờ trực:</strong> {headerData.shiftTime}</div>}
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => setStep(1)}>
              ✏️ Chỉnh sửa
            </button>
          </div>

          {/* Dynamic department form */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {FormComponent ? (
              <FormComponent 
                reportDate={headerData.reportDate}
                doctorName={headerData.doctorName}
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
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              ❌ {submitError}
            </div>
          )}

          {/* Submit button */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 2rem' }}>
            {!showConfirm ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowConfirm(true)}
                style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}
              >
                <FaPaperPlane /> Gửi Báo Cáo
              </button>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px', border: '2px solid var(--warning)' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '500' }}>
                  ⚠️ Xác nhận gửi báo cáo ngày {headerData.reportDate}?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
