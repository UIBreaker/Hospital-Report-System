import React, { useState, useEffect } from 'react';
import { 
  FaClipboardList, 
  FaCalendarAlt, 
  FaArrowLeft, 
  FaSpinner, 
  FaFileExcel, 
  FaPrint, 
  FaTimes, 
  FaEye, 
  FaHospital,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaSync
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';

const DynamicFormSubmissions = ({ formCode, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [formMeta, setFormMeta] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await customFormService.getFormSubmissions(formCode, selectedDate ? { date: selectedDate } : {});
      if (res && res.success) {
        setSubmissions(res.data || []);
        setFormMeta(res.form);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formCode) fetchSubmissions();
  }, [formCode, selectedDate]);

  // Helper to get field label
  const getFieldLabel = (key) => {
    if (!formMeta || !Array.isArray(formMeta.schema_json)) return key;
    const field = formMeta.schema_json.find(f => f.key === key);
    return field?.label || key;
  };

  const formatDateVN = (dStr) => {
    if (!dStr) return '—';
    const parts = String(dStr).split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Header Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1.1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '9px',
              padding: '0.5rem 0.85rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#334155'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
              Danh Sách Báo Cáo: {formMeta?.title || formCode}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
              Mã biểu mẫu: <strong style={{ color: '#0F2C59' }}>{formCode}</strong> • Tổng số <strong>{submissions.length}</strong> bản ghi được ghi nhận.
            </p>
          </div>
        </div>

        {/* Date Filter & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            padding: '0.4rem 0.85rem',
            borderRadius: '10px'
          }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.85rem' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#1E40AF', outline: 'none', fontSize: '0.86rem', cursor: 'pointer' }}
            />
          </div>

          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              Xem tất cả ngày
            </button>
          )}

          <button
            type="button"
            onClick={fetchSubmissions}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#334155'
            }}
            title="Làm mới dữ liệu"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2.2rem', color: '#2563EB', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: '700' }}>Đang tải dữ liệu các bản ghi đã nộp...</div>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748B' }}>
            <FaClipboardList style={{ fontSize: '2.8rem', color: '#CBD5E1', marginBottom: '0.75rem' }} />
            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: '800', color: '#0F2C59' }}>
              {selectedDate ? `Chưa Có Bản Ghi Nào Trong Ngày ${formatDateVN(selectedDate)}` : 'Chưa Có Bản Ghi Nào Được Nộp'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
              {selectedDate ? 'Hãy thử chọn ngày khác hoặc bấm "Xem tất cả ngày".' : 'Các dữ liệu nộp từ thành viên hoặc khoa phòng sẽ được lưu trữ tự động tại đây.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '50px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>NGÀY BÁO CÁO</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>KHOA / ĐƠN VỊ</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>NGƯỜI NỘP</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>THỜI ĐIỂM GỬI</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: '800' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                    }}
                  >
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center', color: '#64748B', fontWeight: '700' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: '800', color: '#1E40AF' }}>
                      {formatDateVN(sub.submission_date)}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: '700', color: '#0F2C59' }}>
                      {sub.department_name || (sub.department_code === 'personal' ? '👤 Tài khoản cá nhân' : sub.department_code)}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#334155', fontWeight: '600' }}>
                      {sub.user_full_name ? `${sub.user_full_name} (@${sub.submitted_by_user})` : `@${sub.submitted_by_user}`}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {new Date(sub.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(sub)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1.5px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.4rem 0.85rem',
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <FaEye /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
              padding: '1.3rem 1.6rem',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900' }}>
                  Chi Tiết Báo Cáo — Ngày {formatDateVN(selectedSubmission.submission_date)}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#93C5FD', fontWeight: '600' }}>
                  Đơn vị: {selectedSubmission.department_name || selectedSubmission.department_code} • Người nộp: {selectedSubmission.user_full_name || selectedSubmission.submitted_by_user}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(selectedSubmission.submission_data || {}).map(([k, v]) => (
                  <div key={k} style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.3px' }}>
                      {getFieldLabel(k)}
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: '700', color: '#0F2C59', lineHeight: 1.45 }}>
                      {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v || '—')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.6rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.6rem 1.5rem',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFormSubmissions;
