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
  FaUserNurse
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
          maxWidth: '1200px',
          maxHeight: '92vh',
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
                color: '#FFFFFF',
                fontSize: '1.4rem',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.85
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#F8FAFC' }}>
          {saveSuccess && (
            <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck /> {saveSuccess}
            </div>
          )}

          {loadingReport ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Đang tải chi tiết số liệu báo cáo...
              </p>
            </div>
          ) : !hasReport && !isEditing ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <FaExclamationTriangle style={{ fontSize: '3rem', color: '#D97706', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--brand-blue)', marginBottom: '0.5rem' }}>
                Khoa Chưa Nộp Báo Cáo
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                Khoa <strong>{modalDept.departmentName}</strong> chưa gửi báo cáo giao ban cho ngày <strong>{date}</strong>.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
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
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#B91C1C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaAmbulance /> CA CHUYỂN VIỆN ({editTransferCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddTransferCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                    >
                      <FaPlus /> Thêm ca chuyển viện
                    </button>
                  )}
                </div>

                {editTransferCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca chuyển viện.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editTransferCases.map((c, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FEF2F2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.9rem' }}>Ca #{idx + 1}: {c.patientName || 'Chưa đặt tên'}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveTransferCase(idx)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                            <input type="text" placeholder="Họ và tên BN" value={c.patientName || ''} onChange={(e) => handleTransferCaseChange(idx, 'patientName', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Tuổi" value={c.age || ''} onChange={(e) => handleTransferCaseChange(idx, 'age', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Địa chỉ" value={c.address || ''} onChange={(e) => handleTransferCaseChange(idx, 'address', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Chẩn đoán" value={c.diagnosis || ''} onChange={(e) => handleTransferCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Lý do chuyển" value={c.reason || ''} onChange={(e) => handleTransferCaseChange(idx, 'reason', e.target.value)} className="form-control" />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            <div><strong>Tuổi:</strong> {c.age || '—'}</div>
                            <div><strong>Địa chỉ:</strong> {c.address || '—'}</div>
                            <div><strong>Chẩn đoán:</strong> {c.diagnosis || '—'}</div>
                            <div><strong>Lý do chuyển:</strong> {c.reason || '—'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Surgery Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E40AF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaProcedures /> CA PHẪU THUẬT / THỦ THUẬT ({editSurgeryCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddSurgeryCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                    >
                      <FaPlus /> Thêm ca mổ
                    </button>
                  )}
                </div>

                {editSurgeryCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca phẫu thuật.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editSurgeryCases.map((c, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#EFF6FF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '800', color: '#1E40AF', fontSize: '0.9rem' }}>Ca #{idx + 1}: {c.patientName || 'Chưa đặt tên'}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveSurgeryCase(idx)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                            <input type="text" placeholder="Họ và tên BN" value={c.patientName || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'patientName', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Năm sinh" value={c.birthYear || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'birthYear', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Chẩn đoán trước mổ" value={c.preoperativeDiagnosis || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'preoperativeDiagnosis', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Phương pháp PT" value={c.postoperativeDiagnosis || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'postoperativeDiagnosis', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Tình trạng hiện tại" value={c.currentStatus || ''} onChange={(e) => handleSurgeryCaseChange(idx, 'currentStatus', e.target.value)} className="form-control" />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            <div><strong>Năm sinh:</strong> {c.birthYear || '—'}</div>
                            <div><strong>Chẩn đoán:</strong> {c.preoperativeDiagnosis || '—'}</div>
                            <div><strong>Phương pháp:</strong> {c.postoperativeDiagnosis || '—'}</div>
                            <div><strong>Tình trạng:</strong> {c.currentStatus || '—'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Death Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaSkullCrossbones /> CA TỬ VONG ({editDeathCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddDeathCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                    >
                      <FaPlus /> Thêm ca tử vong
                    </button>
                  )}
                </div>

                {editDeathCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca tử vong.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editDeathCases.map((c, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F3F4F6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '800', color: '#1F2937', fontSize: '0.9rem' }}>Ca #{idx + 1}: {c.patientName || 'Chưa đặt tên'}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveDeathCase(idx)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                            <input type="text" placeholder="Họ và tên BN" value={c.patientName || ''} onChange={(e) => handleDeathCaseChange(idx, 'patientName', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Tuổi" value={c.age || ''} onChange={(e) => handleDeathCaseChange(idx, 'age', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Chẩn đoán" value={c.diagnosis || ''} onChange={(e) => handleDeathCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Diễn biến / Xử trí" value={c.emergencyTreatment || ''} onChange={(e) => handleDeathCaseChange(idx, 'emergencyTreatment', e.target.value)} className="form-control" />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            <div><strong>Tuổi:</strong> {c.age || '—'}</div>
                            <div><strong>Chẩn đoán:</strong> {c.diagnosis || '—'}</div>
                            <div><strong>Xử trí:</strong> {c.emergencyTreatment || '—'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Critical Cases */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#D97706', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaHeartbeat /> CA NẶNG / XIN VỀ / THEO DÕI TIẾP ({editCriticalCases.length})
                  </h4>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddCriticalCase}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                    >
                      <FaPlus /> Thêm ca nặng
                    </button>
                  )}
                </div>

                {editCriticalCases.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Không có ca nặng / theo dõi tiếp.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editCriticalCases.map((c, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FEF3C7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '800', color: '#92400E', fontSize: '0.9rem' }}>Ca #{idx + 1}: {c.patientName || 'Chưa đặt tên'}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveCriticalCase(idx)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                            <input type="text" placeholder="Họ và tên BN" value={c.patientName || ''} onChange={(e) => handleCriticalCaseChange(idx, 'patientName', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Tuổi" value={c.age || ''} onChange={(e) => handleCriticalCaseChange(idx, 'age', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Chẩn đoán" value={c.diagnosis || ''} onChange={(e) => handleCriticalCaseChange(idx, 'diagnosis', e.target.value)} className="form-control" />
                            <input type="text" placeholder="Diễn biến / Xử trí" value={c.conditionSummary || c.treatment || ''} onChange={(e) => handleCriticalCaseChange(idx, 'conditionSummary', e.target.value)} className="form-control" />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            <div><strong>Tuổi:</strong> {c.age || '—'}</div>
                            <div><strong>Chẩn đoán:</strong> {c.diagnosis || '—'}</div>
                            <div><strong>Diễn biến:</strong> {c.conditionSummary || c.treatment || '—'}</div>
                          </div>
                        )}
                      </div>
                    ))}
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

  return mounted ? createPortal(modalContent, document.body) : modalContent;
};

export default AdminReportDetailModal;
