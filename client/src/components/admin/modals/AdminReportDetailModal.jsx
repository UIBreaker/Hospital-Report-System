import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaUserMd,
  FaCalendarAlt,
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaSpinner,
  FaLock,
  FaUnlockAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSkullCrossbones,
  FaCheck,
  FaClock,
  FaDoorOpen,
  FaUserNurse,
  FaUserPlus,
  FaMapMarkerAlt
} from 'react-icons/fa';
import CaseImageUploader from '../../common/CaseImageUploader';
import ReportDataViewer from '../common/ReportDataViewer';

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
} from '../../forms/departments';

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
  gmhs: GayMeHoiSucForm
};

const formatPatientAge = (val) => {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}$/.test(s)) return `SN: ${s}`;
  if (/^\d+$/.test(s)) return `${s} tuổi`;
  return s;
};

const AdminReportDetailModal = ({
  isOpen,
  onClose,
  modalDept,
  date,
  editHeader = {},
  setEditHeader,
  editReportData = {},
  setEditReportData,
  editTransferCases = [],
  setEditTransferCases,
  editSurgeryCases = [],
  setEditSurgeryCases,
  editDeathCases = [],
  setEditDeathCases,
  editCriticalCases = [],
  setEditCriticalCases,
  hasReport = false,
  isEditing = false,
  setIsEditing,
  loadingReport = false,
  saving = false,
  saveSuccess = '',
  modalReportLocked = false,
  togglingModalLock = false,
  handleToggleModalLock,
  showDeleteConfirm = false,
  setShowDeleteConfirm,
  deleting = false,
  handleDeleteReport,
  handleSaveReport,
  handleDataChange,
  handleAddTransferCase,
  handleTransferCaseChange,
  handleRemoveTransferCase,
  handleAddSurgeryCase,
  handleSurgeryCaseChange,
  handleRemoveSurgeryCase,
  handleAddDeathCase,
  handleDeathCaseChange,
  handleRemoveDeathCase,
  handleAddCriticalCase,
  handleCriticalCaseChange,
  handleRemoveCriticalCase
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Overtime staff handlers for Admin
  const handleAddOvertime = () => {
    const current = Array.isArray(editHeader?.overtimeStaff) ? editHeader.overtimeStaff : [];
    setEditHeader({
      ...editHeader,
      overtimeStaff: [
        ...current,
        { id: `ot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, staffName: '', time: '' }
      ]
    });
  };

  const handleOvertimeChange = (idx, field, val) => {
    const current = Array.isArray(editHeader?.overtimeStaff) ? [...editHeader.overtimeStaff] : [];
    current[idx] = { ...current[idx], [field]: val };
    setEditHeader({
      ...editHeader,
      overtimeStaff: current
    });
  };

  const handleRemoveOvertime = (idx) => {
    const current = Array.isArray(editHeader?.overtimeStaff) ? editHeader.overtimeStaff.filter((_, i) => i !== idx) : [];
    setEditHeader({
      ...editHeader,
      overtimeStaff: current
    });
  };

  if (!isOpen || !modalDept) return null;

  const DeptFormComponent = DEPARTMENT_FORMS[modalDept.departmentCode];

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 44, 89, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '1240px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: '#0F2C59',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                {modalDept.departmentName}
              </h2>
              {hasReport && (
                <span
                  style={{
                    backgroundColor: modalReportLocked ? '#FEF3C7' : '#DCFCE7',
                    color: modalReportLocked ? '#92400E' : '#166534',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {modalReportLocked ? <><FaLock size={10} /> Đã khóa sổ</> : <><FaUnlockAlt size={10} /> Đang mở</>}
                </span>
              )}
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#93C5FD' }}>
              Ngày báo cáo: <strong>{editHeader?.reportDate || date}</strong> • Mã khoa: <strong>{modalDept.departmentCode}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {hasReport && (
              <>
                {/* Lock/Unlock button */}
                <button
                  className="btn btn-sm"
                  onClick={handleToggleModalLock}
                  disabled={togglingModalLock}
                  style={{
                    backgroundColor: modalReportLocked ? '#059669' : '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  {togglingModalLock ? (
                    <FaSpinner className="spinner" />
                  ) : modalReportLocked ? (
                    <><FaUnlockAlt /> Mở khóa cho khoa</>
                  ) : (
                    <><FaLock /> Khóa sổ</>
                  )}
                </button>

                {/* Edit / Save toggle button */}
                {!isEditing ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontWeight: '700' }}
                  >
                    <FaEdit /> Sửa số liệu
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveReport}
                      disabled={saving}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontWeight: '700', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none' }}
                    >
                      {saving ? <FaSpinner className="spinner" /> : <FaSave />} Lưu thay đổi
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      style={{ padding: '0.45rem 0.85rem' }}
                    >
                      Hủy
                    </button>
                  </>
                )}

                {/* Delete button */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ padding: '0.45rem 0.75rem' }}
                  title="Xóa báo cáo"
                >
                  <FaTrash />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#93C5FD',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#F8FAFC'
          }}
        >
          {saveSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck /> {saveSuccess}
            </div>
          )}

          {loadingReport ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--brand-blue)' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} />
              <p style={{ fontWeight: '600' }}>Đang tải dữ liệu chi tiết báo cáo...</p>
            </div>
          ) : !hasReport && !isEditing ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px dashed #CBD5E1' }}>
              <FaCalendarAlt style={{ fontSize: '3rem', color: '#94A3B8', marginBottom: '1rem' }} />
              <h4 style={{ color: '#1E293B', fontWeight: '800', marginBottom: '0.5rem' }}>
                Khoa chưa có báo cáo ngày {date}
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Hiện tại chưa có dữ liệu báo cáo giao ban nào được gửi từ khoa phòng này cho ngày đã chọn.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
              >
                <FaPlus /> Nhập Báo Cáo Thay Khoa
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Shift info section */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  <FaUserMd /> THÔNG TIN TUA TRỰC & NHÂN SỰ
                </h4>

                {/* Core Shift Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                      Bác sĩ trực chính
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHeader?.doctorName || ''}
                        onChange={(e) => setEditHeader({ ...editHeader, doctorName: e.target.value })}
                        className="form-control"
                        placeholder="Nhập tên BS trực..."
                        style={{ width: '100%', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <div style={{ fontWeight: '700', color: '#0F2C59', fontSize: '0.95rem' }}>
                        {editHeader?.doctorName || '—'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                      Điều dưỡng trực
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHeader?.nurseName || ''}
                        onChange={(e) => setEditHeader({ ...editHeader, nurseName: e.target.value })}
                        className="form-control"
                        placeholder="Nhập tên ĐD trực..."
                        style={{ width: '100%', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <div style={{ fontWeight: '700', color: '#0F2C59', fontSize: '0.95rem' }}>
                        {editHeader?.nurseName || '—'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                      Phòng / Vị trí trực
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHeader?.room || ''}
                        onChange={(e) => setEditHeader({ ...editHeader, room: e.target.value })}
                        className="form-control"
                        placeholder="Phòng trực..."
                        style={{ width: '100%', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <div style={{ color: '#475569', fontSize: '0.95rem' }}>
                        {editHeader?.room || '—'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                      Ca / Thời gian trực
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHeader?.shiftTime || ''}
                        onChange={(e) => setEditHeader({ ...editHeader, shiftTime: e.target.value })}
                        className="form-control"
                        placeholder="VD: 24/24, 07:00 - 07:00..."
                        style={{ width: '100%', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <div style={{ color: '#475569', fontSize: '0.95rem' }}>
                        {editHeader?.shiftTime || '24/24'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Overtime / Reinforced Staff Section */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaClock style={{ color: '#D97706' }} /> NHÂN SỰ TRỰC THÊM GIỜ / TĂNG CƯỜNG ({(editHeader?.overtimeStaff || []).length})
                    </label>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddOvertime}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.3rem 0.75rem', backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A', fontWeight: '700' }}
                      >
                        <FaPlus /> Thêm nhân sự tăng cường
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      {(editHeader?.overtimeStaff || []).length === 0 ? (
                        <p style={{ color: '#94A3B8', fontSize: '0.84rem', fontStyle: 'italic', margin: 0, padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                          Chưa có nhân sự trực thêm giờ (Bấm nút <strong>"+ Thêm nhân sự tăng cường"</strong> nếu ca trực có nhân sự hỗ trợ thêm).
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {(editHeader?.overtimeStaff || []).map((ot, otIdx) => (
                            <div
                              key={ot.id || otIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1fr auto',
                                gap: '0.65rem',
                                alignItems: 'center',
                                backgroundColor: '#FFFDF5',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #FDE68A'
                              }}
                            >
                              <div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nhập họ và tên nhân sự tăng cường..."
                                  value={ot.staffName || ot.name || ''}
                                  onChange={(e) => handleOvertimeChange(otIdx, 'staffName', e.target.value)}
                                  style={{ width: '100%', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div style={{ position: 'relative' }}>
                                <FaClock style={{ position: 'absolute', top: '50%', left: '0.65rem', transform: 'translateY(-50%)', color: '#B45309', fontSize: '0.8rem' }} />
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Thời gian: VD 17h - 21h, 4h MRT..."
                                  value={ot.time || ''}
                                  onChange={(e) => handleOvertimeChange(otIdx, 'time', e.target.value)}
                                  style={{ width: '100%', paddingLeft: '1.85rem', fontSize: '0.85rem' }}
                                />
                              </div>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveOvertime(otIdx)}
                                style={{ padding: '0.35rem 0.55rem', height: '36px', borderRadius: '6px' }}
                                title="Xóa nhân sự này"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <small style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
                        💡 Ghi nhận các Bác sĩ, Điều dưỡng trực tăng cường hoặc làm thêm giờ ngoài ca trực chính.
                      </small>
                    </div>
                  ) : (
                    <div>
                      {(editHeader?.overtimeStaff || []).length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                          {(editHeader?.overtimeStaff || []).map((ot, otIdx) => (
                            <div
                              key={otIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#FFFDF5',
                                border: '1px solid #FDE68A',
                                borderLeft: '4px solid #D97706',
                                borderRadius: '8px',
                                padding: '0.5rem 0.85rem'
                              }}
                            >
                              <div style={{ fontWeight: '700', color: '#0F2C59', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <FaUserPlus style={{ color: '#D97706' }} /> {ot.staffName || ot.name || '—'}
                              </div>
                              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                                ⏰ {ot.time || 'Tăng cường'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                          Không có nhân sự trực thêm giờ / tăng cường.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Department specific data */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  📊 SỐ LIỆU CHUYÊN MÔN HOẠT ĐỘNG
                </h4>

                {isEditing && DeptFormComponent ? (
                  <DeptFormComponent
                    formData={editReportData || {}}
                    setFormData={setEditReportData}
                    data={editReportData || {}}
                    onChange={handleDataChange}
                    doctorName={editHeader?.doctorName}
                    nurseName={editHeader?.nurseName}
                    transferCases={editTransferCases}
                    setTransferCases={setEditTransferCases}
                    surgeryCases={editSurgeryCases}
                    setSurgeryCases={setEditSurgeryCases}
                    deathCases={editDeathCases}
                    setDeathCases={setEditDeathCases}
                    criticalCases={editCriticalCases}
                    setCriticalCases={setEditCriticalCases}
                  />
                ) : (
                  <ReportDataViewer data={editReportData} />
                )}
              </div>

              {/* ================= SPECIAL CASES ================= */}

              {/* 1. Transfer Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', borderLeft: '5px solid #B45309' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #FDE68A', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#B45309', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaAmbulance /> CA CHUYỂN VIỆN ({editTransferCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddTransferCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}
                    >
                      <FaPlus /> Thêm ca chuyển viện
                    </button>
                  )}
                </div>

                {editTransferCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca chuyển viện.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {editTransferCases.map((c, idx) => {
                      const pName = c.patientName || c.patient_name || '';
                      const ageFormatted = formatPatientAge(c.age);
                      const admTime = c.admissionTime || c.admission_time || '';
                      const reason = c.reason || '';
                      const clinical = c.clinicalSymptoms || c.clinical_symptoms || '';
                      const tests = c.clinicalTests || c.clinical_tests || '';
                      const diag = c.diagnosis || '';
                      const initTreat = c.initialTreatment || c.initial_treatment || '';
                      const prog = c.progressNotes || c.progress_notes || '';

                      return (
                        <div key={c._id || c.id || idx} style={{ padding: '1.25rem', border: '1.5px solid #FDE68A', borderRadius: '10px', backgroundColor: '#FFFDF5', boxShadow: '0 2px 8px rgba(217,119,6,0.06)' }}>
                          {/* Case Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #FEF3C7', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: '#D97706', color: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontWeight: '900', color: '#92400E', fontSize: '1.05rem', textTransform: 'uppercase' }}>
                                {pName || 'BỆNH NHÂN CHƯA ĐẶT TÊN'}
                              </span>
                              {ageFormatted && (
                                <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #FDE68A' }}>
                                  {ageFormatted}
                                </span>
                              )}
                              {c.address && (
                                <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaMapMarkerAlt size={11} /> {c.address}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {admTime && (
                                <span style={{ color: '#B45309', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#FEF3C7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                  ⏰ Vào: {admTime}
                                </span>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveTransferCase(idx)}
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                  title="Xóa ca chuyển viện này"
                                >
                                  <FaTrash /> Xóa ca
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Case Body */}
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Row 1: Demographics */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Họ và tên BN *</label>
                                  <input type="text" placeholder="VD: Nguyễn Văn A" value={pName} onChange={(e) => handleTransferCaseChange(idx, 'patientName', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Tuổi / Năm sinh</label>
                                  <input type="text" placeholder="VD: 45 hoặc 1979" value={c.age || ''} onChange={(e) => handleTransferCaseChange(idx, 'age', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Địa chỉ</label>
                                  <input type="text" placeholder="Xã/Phường, Huyện/TP..." value={c.address || ''} onChange={(e) => handleTransferCaseChange(idx, 'address', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Giờ vào viện / tiếp nhận</label>
                                  <input type="text" placeholder="VD: 08:30 hoặc 14:15" value={admTime} onChange={(e) => handleTransferCaseChange(idx, 'admissionTime', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                              </div>

                              {/* Row 2: Reasons & Clinical */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Lý do vào viện / chuyển viện</label>
                                  <textarea rows={2} placeholder="Nhập lý do vào viện..." value={reason} onChange={(e) => handleTransferCaseChange(idx, 'reason', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Lâm sàng & Triệu chứng</label>
                                  <textarea rows={2} placeholder="Sinh hiệu, tri giác, triệu chứng lâm sàng..." value={clinical} onChange={(e) => handleTransferCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Cận lâm sàng & CLS / XN</label>
                                  <textarea rows={2} placeholder="X-quang, CT, Siêu âm, Xét nghiệm..." value={tests} onChange={(e) => handleTransferCaseChange(idx, 'clinicalTests', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 3: Diagnosis & Treatment */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Chẩn đoán xác định *</label>
                                  <textarea rows={2} placeholder="Nhập chẩn đoán xác định..." value={diag} onChange={(e) => handleTransferCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Xử trí ban đầu</label>
                                  <textarea rows={2} placeholder="Thuốc, dịch truyền, đặt ống, cố định..." value={initTreat} onChange={(e) => handleTransferCaseChange(idx, 'initialTreatment', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '0.2rem' }}>Diễn biến chuyển viện</label>
                                  <textarea rows={2} placeholder="Tình trạng trên đường chuyển, bàn giao..." value={prog} onChange={(e) => handleTransferCaseChange(idx, 'progressNotes', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 4: Image Uploader */}
                              <div style={{ marginTop: '0.25rem' }}>
                                <CaseImageUploader
                                  images={c.images || []}
                                  onChange={(imgs) => handleTransferCaseChange(idx, 'images', imgs)}
                                  theme="amber"
                                  patientName={pName}
                                  readOnly={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {/* Diagnosis Box */}
                              <div style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', borderLeft: '5px solid #D97706', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', marginBottom: '2px' }}>🏥 Chẩn Đoán Xác Định:</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#78350F' }}>{diag || '—'}</div>
                              </div>

                              {/* Medical Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>⏰ Lý do vào viện & Chuyển:</div>
                                  <div style={{ color: '#0F172A', fontWeight: '600' }}>{reason || '—'}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>💊 Xử trí ban đầu:</div>
                                  <div style={{ color: '#1E293B', backgroundColor: '#F8FAFC', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>{initTreat || '—'}</div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>🩺 Lâm sàng & Triệu chứng:</div>
                                  <div style={{ color: '#0F172A' }}>{clinical || '—'}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>🔬 Cận lâm sàng & CLS / XN:</div>
                                  <div style={{ color: '#334155' }}>{tests || '—'}</div>
                                </div>
                              </div>

                              {/* Progress Notes */}
                              {prog && (
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                                  <div style={{ fontWeight: '700', color: '#92400E', marginBottom: '0.2rem' }}>📝 Diễn biến quá trình chuyển viện:</div>
                                  <div style={{ color: '#334155' }}>{prog}</div>
                                </div>
                              )}

                              {/* Readonly Images */}
                              <CaseImageUploader
                                images={c.images || []}
                                theme="amber"
                                patientName={pName}
                                readOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Surgery Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', borderLeft: '5px solid #1D4ED8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #BFDBFE', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E40AF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaProcedures /> CA PHẪU THUẬT / THỦ THUẬT ({editSurgeryCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddSurgeryCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' }}
                    >
                      <FaPlus /> Thêm ca phẫu thuật
                    </button>
                  )}
                </div>

                {editSurgeryCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca phẫu thuật.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {editSurgeryCases.map((sc, idx) => {
                      const pName = sc.patientName || sc.patient_name || '';
                      const ageFormatted = formatPatientAge(sc.birthYear || sc.birth_year || sc.age);
                      const admTime = sc.admissionTime || sc.admission_time || '';
                      const reason = sc.reason || '';
                      const clinical = sc.clinicalSymptoms || sc.clinical_symptoms || '';
                      const tests = sc.clinicalTests || sc.clinical_tests || '';
                      const preDiag = sc.preoperativeDiagnosis || sc.preoperative_diagnosis || '';
                      const order = sc.consultationOrder || sc.consultation_order || '';
                      const postDiag = sc.postoperativeDiagnosis || sc.postoperative_diagnosis || '';
                      const status = sc.currentStatus || sc.current_status || '';

                      return (
                        <div key={sc._id || sc.id || idx} style={{ padding: '1.25rem', border: '1.5px solid #BFDBFE', borderRadius: '10px', backgroundColor: '#F8FAFF', boxShadow: '0 2px 8px rgba(30,64,175,0.06)' }}>
                          {/* Case Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #DBEAFE', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: '#1D4ED8', color: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontWeight: '900', color: '#1E3A8A', fontSize: '1.05rem', textTransform: 'uppercase' }}>
                                {pName || 'BỆNH NHÂN CHƯA ĐẶT TÊN'}
                              </span>
                              {ageFormatted && (
                                <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #BFDBFE' }}>
                                  {ageFormatted}
                                </span>
                              )}
                              {sc.address && (
                                <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaMapMarkerAlt size={11} /> {sc.address}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {admTime && (
                                <span style={{ color: '#1E40AF', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#DBEAFE', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                  ⏰ Vào: {admTime}
                                </span>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveSurgeryCase(idx)}
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                  title="Xóa ca phẫu thuật này"
                                >
                                  <FaTrash /> Xóa ca
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Case Body */}
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Row 1: Demographics */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Họ và tên BN *</label>
                                  <input type="text" placeholder="VD: Trần Văn B" value={pName} onChange={(e) => handleSurgeryCaseChange(idx, 'patientName', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Năm sinh / Tuổi</label>
                                  <input type="text" placeholder="VD: 1985 hoặc 41" value={sc.birthYear || sc.birth_year || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'birthYear', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Địa chỉ</label>
                                  <input type="text" placeholder="Địa chỉ bệnh nhân..." value={sc.address || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'address', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Giờ vào viện</label>
                                  <input type="text" placeholder="VD: 10:20" value={admTime} onChange={(e) => handleSurgeryCaseChange(idx, 'admissionTime', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                              </div>

                              {/* Row 2: Reasons & Clinical */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Giờ vào / Lý do vào viện</label>
                                  <textarea rows={2} placeholder="Lý do vào mổ..." value={reason} onChange={(e) => handleSurgeryCaseChange(idx, 'reason', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Lâm sàng & Triệu chứng</label>
                                  <textarea rows={2} placeholder="Khám lâm sàng, tiền mê..." value={clinical} onChange={(e) => handleSurgeryCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Cận lâm sàng & CLS / XN</label>
                                  <textarea rows={2} placeholder="CLS, Xquang, siêu âm, ECG..." value={tests} onChange={(e) => handleSurgeryCaseChange(idx, 'clinicalTests', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 3: Surgical Diagnosis & Plan */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Chẩn đoán trước mổ *</label>
                                  <textarea rows={2} placeholder="Chẩn đoán trước phẫu thuật..." value={preDiag} onChange={(e) => handleSurgeryCaseChange(idx, 'preoperativeDiagnosis', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Lệnh mổ / Hội chẩn</label>
                                  <textarea rows={2} placeholder="Lệnh mổ cấp cứu/chương trình..." value={order} onChange={(e) => handleSurgeryCaseChange(idx, 'consultationOrder', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Chẩn đoán & Phương pháp sau mổ</label>
                                  <textarea rows={2} placeholder="Chẩn đoán sau mổ & phương pháp..." value={postDiag} onChange={(e) => handleSurgeryCaseChange(idx, 'postoperativeDiagnosis', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 4: Status */}
                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', display: 'block', marginBottom: '0.2rem' }}>Tình trạng hiện tại / Hậu phẫu</label>
                                <input type="text" placeholder="VD: Tỉnh, sinh hiệu ổn định, theo dõi hồi tỉnh..." value={status} onChange={(e) => handleSurgeryCaseChange(idx, 'currentStatus', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                              </div>

                              {/* Row 5: Image Uploader */}
                              <div style={{ marginTop: '0.25rem' }}>
                                <CaseImageUploader
                                  images={sc.images || []}
                                  onChange={(imgs) => handleSurgeryCaseChange(idx, 'images', imgs)}
                                  theme="blue"
                                  patientName={pName}
                                  readOnly={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {/* Pre/Post Op Diagnosis Box */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderLeft: '5px solid #2563EB', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase', marginBottom: '2px' }}>🔪 Chẩn Đoán Trước Mổ:</div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#1E3A8A' }}>{preDiag || '—'}</div>
                                </div>
                                <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0', borderLeft: '5px solid #16A34A', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '2px' }}>✅ Sau Mổ & Phương Pháp:</div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#14532D' }}>{postDiag || '—'}</div>
                                </div>
                              </div>

                              {/* Medical Details */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>📋 Lệnh mổ / Hội chẩn:</div>
                                  <div style={{ color: '#0F172A', fontWeight: '600' }}>{order || '—'}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>⏰ Giờ vào / Lý do:</div>
                                  <div style={{ color: '#334155' }}>{reason || '—'}</div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>🩺 Lâm sàng & CLS:</div>
                                  <div style={{ color: '#0F172A' }}>{clinical ? `LS: ${clinical}` : ''} {tests ? ` | CLS: ${tests}` : ''} {!clinical && !tests ? '—' : ''}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>🏥 Tình trạng hiện tại:</div>
                                  <div style={{ color: '#1E40AF', fontWeight: '700', backgroundColor: '#EFF6FF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>{status || '—'}</div>
                                </div>
                              </div>

                              {/* Readonly Images */}
                              <CaseImageUploader
                                images={sc.images || []}
                                theme="blue"
                                patientName={pName}
                                readOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Death Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', borderLeft: '5px solid #DC2626' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #FECACA', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#991B1B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaSkullCrossbones /> CA TỬ VONG ({editDeathCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddDeathCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' }}
                    >
                      <FaPlus /> Thêm ca tử vong
                    </button>
                  )}
                </div>

                {editDeathCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca tử vong.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {editDeathCases.map((dc, idx) => {
                      const pName = dc.patientName || dc.patient_name || '';
                      const ageFormatted = formatPatientAge(dc.age);
                      const admTime = dc.admissionTime || dc.admission_time || '';
                      const admStatus = dc.admissionStatus || dc.admission_status || '';
                      const history = dc.medicalHistory || dc.medical_history || '';
                      const clinical = dc.clinicalSymptoms || dc.clinical_symptoms || '';
                      const tests = dc.clinicalTests || dc.clinical_tests || '';
                      const diag = dc.diagnosis || '';
                      const emerg = dc.emergencyTreatment || dc.emergency_treatment || '';
                      const outcome = dc.finalOutcome || dc.final_outcome || '';

                      return (
                        <div key={dc._id || dc.id || idx} style={{ padding: '1.25rem', border: '1.5px solid #FECACA', borderRadius: '10px', backgroundColor: '#FFF5F5', boxShadow: '0 2px 8px rgba(220,38,38,0.06)' }}>
                          {/* Case Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #FEE2E2', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: '#DC2626', color: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontWeight: '900', color: '#7F1D1D', fontSize: '1.05rem', textTransform: 'uppercase' }}>
                                {pName || 'BỆNH NHÂN CHƯA ĐẶT TÊN'}
                              </span>
                              {ageFormatted && (
                                <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #FECACA' }}>
                                  {ageFormatted}
                                </span>
                              )}
                              {dc.address && (
                                <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaMapMarkerAlt size={11} /> {dc.address}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {admTime && (
                                <span style={{ color: '#991B1B', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#FEE2E2', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                  ⏰ Vào: {admTime}
                                </span>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveDeathCase(idx)}
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                  title="Xóa ca tử vong này"
                                >
                                  <FaTrash /> Xóa ca
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Case Body */}
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Row 1: Demographics */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Họ và tên BN *</label>
                                  <input type="text" placeholder="Họ và tên..." value={pName} onChange={(e) => handleDeathCaseChange(idx, 'patientName', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Tuổi</label>
                                  <input type="text" placeholder="Tuổi..." value={dc.age || ''} onChange={(e) => handleDeathCaseChange(idx, 'age', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Địa chỉ</label>
                                  <input type="text" placeholder="Địa chỉ..." value={dc.address || ''} onChange={(e) => handleDeathCaseChange(idx, 'address', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Giờ vào viện</label>
                                  <input type="text" placeholder="Giờ vào..." value={admTime} onChange={(e) => handleDeathCaseChange(idx, 'admissionTime', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                              </div>

                              {/* Row 2: Status & History */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Tình trạng lúc vào viện</label>
                                  <textarea rows={2} placeholder="Hôn mê, ngưng tim ngưng thở..." value={admStatus} onChange={(e) => handleDeathCaseChange(idx, 'admissionStatus', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Tiền sử bệnh lý</label>
                                  <textarea rows={2} placeholder="Tiền căn THA, ĐTĐ, COPD..." value={history} onChange={(e) => handleDeathCaseChange(idx, 'medicalHistory', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Lâm sàng, Sinh hiệu & CLS</label>
                                  <textarea rows={2} placeholder="Mạch, HA, ECG, xét nghiệm..." value={clinical || tests} onChange={(e) => handleDeathCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 3: Diagnosis & Treatment */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Chẩn đoán tử vong *</label>
                                  <textarea rows={2} placeholder="Nguyên nhân / Chẩn đoán tử vong..." value={diag} onChange={(e) => handleDeathCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Xử trí cấp cứu hồi sức</label>
                                  <textarea rows={2} placeholder="Ép tim, sốc điện, Adrenalin..." value={emerg} onChange={(e) => handleDeathCaseChange(idx, 'emergencyTreatment', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B', display: 'block', marginBottom: '0.2rem' }}>Kết quả & Kết luận</label>
                                  <textarea rows={2} placeholder="Tử vong lúc mấy giờ, bàn giao..." value={outcome} onChange={(e) => handleDeathCaseChange(idx, 'finalOutcome', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 4: Image Uploader */}
                              <div style={{ marginTop: '0.25rem' }}>
                                <CaseImageUploader
                                  images={dc.images || []}
                                  onChange={(imgs) => handleDeathCaseChange(idx, 'images', imgs)}
                                  theme="red"
                                  patientName={pName}
                                  readOnly={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {/* Death Diagnosis Box */}
                              <div style={{ backgroundColor: '#FEE2E2', border: '1.5px solid #FECACA', borderLeft: '5px solid #DC2626', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', marginBottom: '2px' }}>☠️ Chẩn Đoán Tử Vong:</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#7F1D1D' }}>{diag || '—'}</div>
                              </div>

                              {/* Medical Details */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>🩺 Tình trạng lúc vào & Tiền sử:</div>
                                  <div style={{ color: '#0F172A' }}>{admStatus ? `Vào: ${admStatus}` : ''} {history ? ` | Tiền sử: ${history}` : ''} {!admStatus && !history ? '—' : ''}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>⚡ Xử trí cấp cứu:</div>
                                  <div style={{ color: '#991B1B', fontWeight: '600' }}>{emerg || '—'}</div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>🔬 Lâm sàng & Cận lâm sàng:</div>
                                  <div style={{ color: '#0F172A' }}>{clinical ? `LS: ${clinical}` : ''} {tests ? ` | CLS: ${tests}` : ''} {!clinical && !tests ? '—' : ''}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>📌 Kết luận & Kết quả:</div>
                                  <div style={{ color: '#334155', fontWeight: '600' }}>{outcome || '—'}</div>
                                </div>
                              </div>

                              {/* Readonly Images */}
                              <CaseImageUploader
                                images={dc.images || []}
                                theme="red"
                                patientName={pName}
                                readOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Critical Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', borderLeft: '5px solid #6D28D9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #DDD6FE', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#6D28D9', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaHeartbeat /> CA NẶNG / XIN VỀ / THEO DÕI TIẾP ({editCriticalCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddCriticalCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#DDD6FE' }}
                    >
                      <FaPlus /> Thêm ca nặng
                    </button>
                  )}
                </div>

                {editCriticalCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca nặng / theo dõi tiếp.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {editCriticalCases.map((cc, idx) => {
                      const pName = cc.patientName || cc.patient_name || '';
                      const ageFormatted = formatPatientAge(cc.age);
                      const admTime = cc.admissionTime || cc.admission_time || '';
                      const history = cc.medicalHistory || cc.medical_history || '';
                      const clinical = cc.clinicalSymptoms || cc.clinical_symptoms || '';
                      const tests = cc.clinicalTests || cc.clinical_tests || '';
                      const diag = cc.diagnosis || '';
                      const summary = cc.conditionSummary || cc.condition_summary || '';
                      const treat = cc.treatment || '';
                      const notes = cc.notes || '';

                      return (
                        <div key={cc._id || cc.id || idx} style={{ padding: '1.25rem', border: '1.5px solid #DDD6FE', borderRadius: '10px', backgroundColor: '#FAF5FF', boxShadow: '0 2px 8px rgba(109,40,217,0.06)' }}>
                          {/* Case Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #EDE9FE', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: '#6D28D9', color: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontWeight: '900', color: '#5B21B6', fontSize: '1.05rem', textTransform: 'uppercase' }}>
                                {pName || 'BỆNH NHÂN CHƯA ĐẶT TÊN'}
                              </span>
                              {ageFormatted && (
                                <span style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #DDD6FE' }}>
                                  {ageFormatted}
                                </span>
                              )}
                              {cc.address && (
                                <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaMapMarkerAlt size={11} /> {cc.address}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {admTime && (
                                <span style={{ color: '#6D28D9', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#EDE9FE', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                  ⏰ Vào: {admTime}
                                </span>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveCriticalCase(idx)}
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                  title="Xóa ca bệnh nặng này"
                                >
                                  <FaTrash /> Xóa ca
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Case Body */}
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Row 1: Demographics */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Họ và tên BN *</label>
                                  <input type="text" placeholder="Họ và tên..." value={pName} onChange={(e) => handleCriticalCaseChange(idx, 'patientName', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Tuổi / Năm sinh</label>
                                  <input type="text" placeholder="Tuổi..." value={cc.age || ''} onChange={(e) => handleCriticalCaseChange(idx, 'age', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Địa chỉ</label>
                                  <input type="text" placeholder="Địa chỉ..." value={cc.address || ''} onChange={(e) => handleCriticalCaseChange(idx, 'address', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Giờ vào viện</label>
                                  <input type="text" placeholder="Giờ vào..." value={admTime} onChange={(e) => handleCriticalCaseChange(idx, 'admissionTime', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                                </div>
                              </div>

                              {/* Row 2: History & Clinical */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Tiền sử bệnh lý</label>
                                  <textarea rows={2} placeholder="Tiền căn nội/ngoại khoa..." value={history} onChange={(e) => handleCriticalCaseChange(idx, 'medicalHistory', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Lâm sàng & Sinh hiệu</label>
                                  <textarea rows={2} placeholder="Mạch, HA, SpO2, tri giác..." value={clinical} onChange={(e) => handleCriticalCaseChange(idx, 'clinicalSymptoms', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Cận lâm sàng & CLS / XN</label>
                                  <textarea rows={2} placeholder="Khí máu, X-quang, CT, XN máu..." value={tests} onChange={(e) => handleCriticalCaseChange(idx, 'clinicalTests', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 3: Diagnosis & Treatment */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Chẩn đoán xác định *</label>
                                  <textarea rows={2} placeholder="Chẩn đoán bệnh..." value={diag} onChange={(e) => handleCriticalCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Diễn biến & Tóm tắt bệnh cảnh</label>
                                  <textarea rows={2} placeholder="Diễn biến trong ca trực..." value={summary} onChange={(e) => handleCriticalCaseChange(idx, 'conditionSummary', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Xử trí điều trị</label>
                                  <textarea rows={2} placeholder="Thở máy, vận mạch, kháng sinh..." value={treat} onChange={(e) => handleCriticalCaseChange(idx, 'treatment', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                                </div>
                              </div>

                              {/* Row 4: Notes */}
                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Ghi chú bàn giao tua sau theo dõi</label>
                                <input type="text" placeholder="Bàn giao theo dõi tiếp, dặn dò..." value={notes} onChange={(e) => handleCriticalCaseChange(idx, 'notes', e.target.value)} className="form-control" style={{ width: '100%', fontSize: '0.85rem' }} />
                              </div>

                              {/* Row 5: Image Uploader */}
                              <div style={{ marginTop: '0.25rem' }}>
                                <CaseImageUploader
                                  images={cc.images || []}
                                  onChange={(imgs) => handleCriticalCaseChange(idx, 'images', imgs)}
                                  theme="purple"
                                  patientName={pName}
                                  readOnly={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {/* Critical Diagnosis Box */}
                              <div style={{ backgroundColor: '#EDE9FE', border: '1.5px solid #DDD6FE', borderLeft: '5px solid #6D28D9', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5B21B6', textTransform: 'uppercase', marginBottom: '2px' }}>⚡ Chẩn Đoán Xác Định:</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#4C1D95' }}>{diag || '—'}</div>
                              </div>

                              {/* Medical Details */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>🩺 Tiền sử & Lâm sàng:</div>
                                  <div style={{ color: '#0F172A' }}>{history ? `Tiền sử: ${history}` : ''} {clinical ? ` | LS: ${clinical}` : ''} {!history && !clinical ? '—' : ''}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>🔬 Cận lâm sàng & CLS:</div>
                                  <div style={{ color: '#334155' }}>{tests || '—'}</div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>📊 Diễn biến bệnh cảnh:</div>
                                  <div style={{ color: '#0F172A', fontWeight: '600' }}>{summary || '—'}</div>
                                  <div style={{ fontWeight: '700', color: '#475569', marginTop: '0.5rem', marginBottom: '0.2rem' }}>💊 Xử trí điều trị:</div>
                                  <div style={{ color: '#6D28D9', fontWeight: '600', backgroundColor: '#FAF5FF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #DDD6FE' }}>{treat || '—'}</div>
                                </div>
                              </div>

                              {/* Handover Notes */}
                              {notes && (
                                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                                  <div style={{ fontWeight: '700', color: '#6D28D9', marginBottom: '0.2rem' }}>📌 Ghi chú bàn giao tua sau:</div>
                                  <div style={{ color: '#334155' }}>{notes}</div>
                                </div>
                              )}

                              {/* Readonly Images */}
                              <CaseImageUploader
                                images={cc.images || []}
                                theme="purple"
                                patientName={pName}
                                readOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          {isEditing && (
            <button
              className="btn btn-primary"
              onClick={handleSaveReport}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
            >
              {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Báo Cáo</>}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
            <FaExclamationTriangle style={{ fontSize: '3rem', color: 'var(--brand-red)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '0.5rem' }}>
              Xác Nhận Xóa Báo Cáo?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Bạn có chắc chắn muốn xóa vĩnh viễn báo cáo của khoa <strong>{modalDept.departmentName}</strong> ngày <strong>{date}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-danger"
                onClick={handleDeleteReport}
                disabled={deleting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
              >
                {deleting ? <><FaSpinner className="spinner" /> Đang xóa...</> : <><FaTrash /> Xác nhận xóa</>}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
};

export default AdminReportDetailModal;
