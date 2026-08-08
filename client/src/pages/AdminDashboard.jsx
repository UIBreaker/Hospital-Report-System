import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaCalendarAlt, FaSignOutAlt, FaTv, FaCheck, FaTimes, FaSpinner, FaSync, FaEdit, FaSave, FaEye, FaPlus, FaTrash, FaAmbulance, FaExclamationTriangle } from 'react-icons/fa';
import reportService from '../services/reportService';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for View & Edit & Delete Report
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Editable Form Data inside Modal
  const [editHeader, setEditHeader] = useState({ doctorName: '', room: '', shiftTime: '' });
  const [editReportData, setEditReportData] = useState({});
  const [editTransferCases, setEditTransferCases] = useState([]);
  const [hasReport, setHasReport] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportService.getDepartmentStatus(date);
      setStatusList(response.data || []);
    } catch (err) {
      setError('Không thể tải trạng thái báo cáo.');
      setStatusList([
        { departmentCode: 'hscc_tnt', departmentName: 'Hồi sức cấp cứu – Thận nhân tạo', status: 'not_submitted' },
        { departmentCode: 'cdha', departmentName: 'Chẩn đoán hình ảnh', status: 'not_submitted' },
        { departmentCode: 'yhct_phcn', departmentName: 'Y học cổ truyền – Phục hồi chức năng', status: 'not_submitted' },
        { departmentCode: 'ngoai_th', departmentName: 'Ngoại tổng hợp', status: 'not_submitted' },
        { departmentCode: 'ctch', departmentName: 'Chấn thương chỉnh hình', status: 'not_submitted' },
        { departmentCode: 'nhi', departmentName: 'Nhi', status: 'not_submitted' },
        { departmentCode: 'nhiem', departmentName: 'Nhiễm', status: 'not_submitted' },
        { departmentCode: 'gmhs', departmentName: 'Gây mê Hồi sức', status: 'not_submitted' },
        { departmentCode: 'san', departmentName: 'Sản', status: 'not_submitted' },
        { departmentCode: 'xn', departmentName: 'Xét nghiệm', status: 'not_submitted' },
        { departmentCode: 'noi', departmentName: 'Khoa Nội', status: 'not_submitted' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [date]);

  const handlePresentation = () => {
    navigate(`/presentation/${date}`);
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
        setEditHeader({
          doctorName: report.doctor_name || '',
          room: report.room || '',
          shiftTime: report.shift_time || ''
        });
        const parsedData = typeof report.report_data === 'string' ? JSON.parse(report.report_data) : (report.report_data || {});
        setEditReportData(parsedData);
        setEditTransferCases(report.transferCases || []);
      } else {
        setHasReport(false);
        setEditHeader({ doctorName: '', room: '', shiftTime: '' });
        setEditReportData({});
        setEditTransferCases([]);
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
      await reportService.createOrUpdateReport({
        departmentCode: modalDept.departmentCode,
        reportDate: date,
        doctorName: editHeader.doctorName,
        room: editHeader.room,
        shiftTime: editHeader.shiftTime,
        reportData: editReportData,
        transferCases: editTransferCases
      });
      setSaveSuccess('Đã lưu thay đổi báo cáo thành công!');
      setIsEditing(false);
      setHasReport(true);
      fetchStatus();
    } catch (err) {
      alert('Không thể lưu báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    setDeleting(true);
    try {
      await reportService.deleteReport(modalDept.departmentCode, date);
      setModalOpen(false);
      setShowDeleteConfirm(false);
      fetchStatus();
    } catch (err) {
      alert('Không thể xóa báo cáo: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleReportDataChange = (path, val) => {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(editReportData));
    let curr = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = val;
    setEditReportData(newData);
  };

  const handleAddTransferCase = () => {
    setEditTransferCases([
      ...editTransferCases,
      { patientName: '', age: '', address: '', admissionTime: '', reason: '', clinicalTests: '', diagnosis: '', initialTreatment: '', progressNotes: '' }
    ]);
  };

  const handleRemoveTransferCase = (index) => {
    setEditTransferCases(editTransferCases.filter((_, i) => i !== index));
  };

  const handleTransferCaseChange = (index, field, val) => {
    const newCases = [...editTransferCases];
    newCases[index] = { ...newCases[index], [field]: val };
    setEditTransferCases(newCases);
  };

  const submittedCount = statusList.filter(s => s.status === 'submitted').length;
  const totalCount = statusList.length;

  const renderEditableFields = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return null;
    return Object.entries(obj).map(([key, value]) => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={fieldPath} style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
            <h4 style={{ color: 'var(--brand-blue)', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase' }}>{key}</h4>
            <div className="form-grid" style={{ marginTop: '0.5rem' }}>
              {renderEditableFields(value, fieldPath)}
            </div>
          </div>
        );
      }
      return (
        <div key={fieldPath} className="form-group">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase())}
          </label>
          {isEditing ? (
            <input 
              type="text" 
              value={value ?? ''} 
              onChange={(e) => handleReportDataChange(fieldPath, e.target.value)} 
            />
          ) : (
            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
              {String(value ?? '-')}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Brand Header */}
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img" />
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--brand-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h4>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--brand-blue)', fontWeight: '800' }}>
              KHNV — Bảng Theo Dõi Báo Cáo Giao Ban
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
            <FaCalendarAlt color="var(--brand-blue-light)" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', outline: 'none', padding: 0, width: 'auto', background: 'transparent', fontWeight: '600', color: 'var(--brand-blue)' }}
            />
          </div>
          <button className="btn btn-ghost" onClick={fetchStatus} title="Làm mới dữ liệu">
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handlePresentation}>
            <FaTv /> Trình Chiếu Giao Ban
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{totalCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>Tổng số khoa phòng</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '4px solid var(--brand-green)' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-green)' }}>{submittedCount}</div>
          <div style={{ color: 'var(--brand-green)', fontSize: '0.875rem', fontWeight: '600' }}>Đã nộp báo cáo</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#92400E' }}>{totalCount - submittedCount}</div>
          <div style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: '600' }}>Chưa nộp báo cáo</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {statusList.map((dept, index) => {
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
                  position: 'relative'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>{dept.departmentName}</h3>
                  {isSubmitted ? 
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FaCheck size={10} /> Đã nộp
                    </span> : 
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FaTimes size={10} /> Chưa nộp
                    </span>
                  }
                </div>
                
                {isSubmitted ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {dept.doctorName && <p><strong>Bác sĩ trực:</strong> {dept.doctorName}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      <span style={{ color: 'var(--brand-green)', fontWeight: '600', fontSize: '0.8rem' }}>✓ Đã nhận báo cáo</span>
                      <span className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        <FaEye /> Xem / Sửa
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có báo cáo</span>
                    <span className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      <FaEdit /> Nhập hộ
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: VIEW, EDIT & DELETE REPORT DETAILS */}
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
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px' }} />
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>
                    {modalDept.departmentName}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#DBEAFE' }}>
                    Báo cáo giao ban ngày {date}
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

                  {/* Confirmation banner for deleting report */}
                  {showDeleteConfirm && (
                    <div style={{ backgroundColor: 'var(--danger-light)', border: '1.5px solid var(--brand-red)', color: 'var(--brand-red)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>
                        <FaExclamationTriangle size={20} /> Xác nhận xóa toàn bộ báo cáo này?
                      </div>
                      <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#991B1B' }}>
                        Thao tác này sẽ xóa báo cáo ngày {date} của khoa <strong>{modalDept.departmentName}</strong> và đưa trạng thái về <strong>"Chưa nộp"</strong>. Không thể hoàn tác.
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteReport} disabled={deleting}>
                          {deleting ? <><FaSpinner className="spinner" /> Đang xóa...</> : <>✅ Có, Xóa Ngay</>}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header Form */}
                  <div className="form-section" style={{ marginBottom: '1rem' }}>
                    <h4 className="section-title">THÔNG TIN CA TRỰC</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Bác sĩ trực chính</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.doctorName} onChange={(e) => setEditHeader({...editHeader, doctorName: e.target.value})} placeholder="Tên bác sĩ trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--brand-blue)' }}>
                            {editHeader.doctorName || 'Chưa nhập'}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Phòng / Buồng</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.room} onChange={(e) => setEditHeader({...editHeader, room: e.target.value})} placeholder="Phòng trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
                            {editHeader.room || '-'}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Thời gian trực</label>
                        {isEditing ? (
                          <input type="text" value={editHeader.shiftTime} onChange={(e) => setEditHeader({...editHeader, shiftTime: e.target.value})} placeholder="Giờ trực" />
                        ) : (
                          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
                            {editHeader.shiftTime || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Report Data Section */}
                  <div className="form-section" style={{ marginBottom: '1rem' }}>
                    <h4 className="section-title">DỮ LIỆU BÁO CÁO CHUYÊN MÔN</h4>
                    {Object.keys(editReportData).length === 0 ? (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có dữ liệu chuyên môn.</p>
                    ) : (
                      <div className="form-grid">
                        {renderEditableFields(editReportData)}
                      </div>
                    )}
                  </div>

                  {/* Transfer Cases Section */}
                  <div className="form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: 'var(--brand-red)' }}>
                        <FaAmbulance /> BỆNH CHUYỂN VIỆN ({editTransferCases.length} ca)
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
                            <h5 style={{ color: 'var(--brand-red)', fontWeight: '700' }}>Ca #{idx + 1} {tc.patient_name || tc.patientName ? `— ${tc.patient_name || tc.patientName}` : ''}</h5>
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
                              <div><strong>Bệnh nhân:</strong> {tc.patient_name || tc.patientName || '-'}</div>
                              <div><strong>Giờ vào:</strong> {tc.admission_time || tc.admissionTime || '-'}</div>
                              <div><strong>Lý do:</strong> {tc.reason || '-'}</div>
                              <div><strong>Chẩn đoán:</strong> {tc.diagnosis || '-'}</div>
                              <div><strong>Xử trí:</strong> {tc.initial_treatment || tc.initialTreatment || '-'}</div>
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
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {!isEditing ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Chỉnh Sửa Báo Cáo
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                    Hủy Chỉnh Sửa
                  </button>
                )}

                {hasReport && !showDeleteConfirm && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash /> Xóa Báo Cáo (Trở về Chưa Nộp)
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Đóng
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-primary" onClick={handleSaveReport} disabled={saving}>
                    {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Thay Đổi</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
