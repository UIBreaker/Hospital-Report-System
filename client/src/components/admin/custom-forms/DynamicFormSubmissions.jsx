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
  FaHospital 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1rem 1.4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59' }}>
              Danh Sách Báo Cáo Đã Nộp: {formMeta?.title || formCode}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Tổng số <strong>{submissions.length}</strong> bản ghi đã được ghi nhận.
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px'
          }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.85rem' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#1E40AF', outline: 'none' }}
            />
          </div>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2rem', color: '#2563EB', marginBottom: '0.65rem' }} />
            <div>Đang tải dữ liệu bản ghi...</div>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
            <FaClipboardList style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '0.65rem' }} />
            <p>Chưa có bản ghi nào được nộp cho biểu mẫu này.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>NGÀY BÁO CÁO</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>NGƯỜI NỘP</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>THỜI ĐIỂM NỘP</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '800' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#1E40AF' }}>
                      {sub.submission_date}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#0F2C59' }}>
                      {sub.department_code}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>
                      {sub.submitted_by_user}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.78rem' }}>
                      {new Date(sub.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(sub)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FaEye /> Chi tiết
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
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              backgroundColor: '#0F2C59',
              padding: '1.2rem 1.5rem',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Chi Tiết Báo Cáo Ngày {selectedSubmission.submission_date}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#93C5FD' }}>
                  Khoa: {selectedSubmission.department_code} • Người nộp: {selectedSubmission.submitted_by_user}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(selectedSubmission.submission_data || {}).map(([k, v]) => (
                  <div key={k} style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {k}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F2C59' }}>
                      {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v || '—')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: '700', cursor: 'pointer' }}
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
