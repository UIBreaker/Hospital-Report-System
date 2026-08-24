import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaWpforms, 
  FaSave, 
  FaArrowLeft, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';

const DynamicFormRenderer = ({ formCode, onBack }) => {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const activeCode = formCode || paramCode;

  const [formMeta, setFormMeta] = useState(null);
  const [formData, setFormData] = useState({});
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchMeta = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await customFormService.getFormByCode(activeCode);
        if (res && res.success) {
          setFormMeta(res.data);
          // Init fields
          const initVals = {};
          (res.data?.schema_json || []).forEach(f => {
            if (f.type === 'table') {
              initVals[f.key] = [];
            } else {
              initVals[f.key] = '';
            }
          });
          setFormData(initVals);
        }
      } catch (err) {
        const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
        setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Lỗi khi tải thông tin biểu mẫu.'));
      } finally {
        setLoading(false);
      }
    };

    if (activeCode) fetchMeta();
  }, [activeCode]);

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Sub-table row helpers
  const handleAddTableRow = (tableKey, columns) => {
    const newRow = {};
    columns.forEach(col => { newRow[col.key] = ''; });
    setFormData(prev => ({
      ...prev,
      [tableKey]: [...(prev[tableKey] || []), newRow]
    }));
  };

  const handleTableRowChange = (tableKey, rIdx, colKey, val) => {
    setFormData(prev => {
      const rows = [...(prev[tableKey] || [])];
      rows[rIdx] = { ...rows[rIdx], [colKey]: val };
      return { ...prev, [tableKey]: rows };
    });
  };

  const handleRemoveTableRow = (tableKey, rIdx) => {
    setFormData(prev => ({
      ...prev,
      [tableKey]: (prev[tableKey] || []).filter((_, i) => i !== rIdx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    const missingRequired = [];
    (formMeta?.schema_json || []).forEach(f => {
      if (f.required && !formData[f.key]) {
        missingRequired.push(f.label);
      }
    });

    if (missingRequired.length > 0) {
      setErrorMsg(`Vui lòng điền các trường bắt buộc: ${missingRequired.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await customFormService.submitFormData(activeCode, {
        submission_date: submissionDate,
        submission_data: formData
      });

      if (res && res.success) {
        setSuccessMsg('Nộp báo cáo thành công! Dữ liệu đã được lưu trữ an toàn trên hệ thống.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Không thể nộp báo cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  const themeColor = formMeta?.theme_color || '#2563EB';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#2563EB', marginBottom: '1rem' }} />
        <div>Đang nạp cấu hình biểu mẫu...</div>
      </div>
    );
  }

  if (!formMeta) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#DC2626' }}>
        <h3>Không tìm thấy biểu mẫu yêu cầu!</h3>
        <button onClick={onBack || (() => navigate(-1))} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        borderLeft: `6px solid ${themeColor}`,
        padding: '1.25rem 1.65rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 15px rgba(15, 44, 89, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
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
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}>
              {formMeta.title}
            </h2>
            {formMeta.description && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                {formMeta.description}
              </p>
            )}
          </div>
        </div>

        {/* Date Selector Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          padding: '0.35rem 0.75rem',
          borderRadius: '8px'
        }}>
          <FaCalendarAlt style={{ color: themeColor }} />
          <input
            type="date"
            value={submissionDate}
            onChange={(e) => setSubmissionDate(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#1E40AF', outline: 'none' }}
          />
        </div>
      </div>

      {successMsg ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <FaCheckCircle style={{ fontSize: '3.8rem', color: '#10B981', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
            Nộp Báo Cáo Thành Công!
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '1.8rem' }}>
            {successMsg}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('');
                setFormData({});
              }}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.65rem 1.5rem',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Nộp Thêm Bản Ghi Mới
            </button>
            <button
              type="button"
              onClick={onBack || (() => navigate(-1))}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.65rem 1.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Quay Lại
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '2rem 2.2rem',
          boxShadow: '0 4px 20px rgba(15, 44, 89, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '0.85rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaExclamationTriangle /> {typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi biểu mẫu')}
            </div>
          )}

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.2rem' }}>
            {(formMeta.schema_json || []).map((field, idx) => {
              const colSpan = field.gridWidth === '33.3%' ? 4 : field.gridWidth === '50%' ? 6 : 12;

              return (
                <div key={field.id || idx} style={{ gridColumn: `span ${colSpan}` }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    color: '#0F2C59',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {field.label} {field.required && <span style={{ color: '#DC2626' }}>*</span>}
                  </label>

                  {/* Field Input Render by Type */}
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder || 'Nhập nội dung...'}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder || '0'}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: '#0F2C59',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required={field.required}
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required={field.required}
                    />
                  ) : field.type === 'time' ? (
                    <input
                      type="time"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        color: '#0F2C59',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required={field.required}
                    >
                      <option value="">-- Chọn giá trị --</option>
                      {(field.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                      <input
                        type="checkbox"
                        id={`chk_${field.key}`}
                        checked={Boolean(formData[field.key])}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor={`chk_${field.key}`} style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F2C59', cursor: 'pointer' }}>
                        Xác nhận {field.label}
                      </label>
                    </div>
                  ) : field.type === 'table' ? (
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      overflowX: 'auto'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#EFF6FF', color: '#0F2C59' }}>
                            <th style={{ padding: '0.55rem', width: '40px', textAlign: 'center' }}>STT</th>
                            {(field.columns || [{ key: 'col1', label: 'Cột 1' }]).map(col => (
                              <th key={col.key} style={{ padding: '0.55rem', textAlign: 'left', fontWeight: '800' }}>{col.label}</th>
                            ))}
                            <th style={{ padding: '0.55rem', width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData[field.key] || []).map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                              <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748B' }}>{rIdx + 1}</td>
                              {(field.columns || [{ key: 'col1', label: 'Cột 1' }]).map(col => (
                                <td key={col.key} style={{ padding: '0.45rem' }}>
                                  <input
                                    type={col.type || 'text'}
                                    value={row[col.key] || ''}
                                    onChange={(e) => handleTableRowChange(field.key, rIdx, col.key, e.target.value)}
                                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                                  />
                                </td>
                              ))}
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTableRow(field.key, rIdx)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                >
                                  <FaTrash size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        onClick={() => handleAddTableRow(field.key, field.columns || [{ key: 'col1', label: 'Cột 1' }])}
                        style={{
                          marginTop: '0.65rem',
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.4rem 0.85rem',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <FaPlus size={10} /> Thêm dòng
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder || 'Nhập dữ liệu...'}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required={field.required}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: themeColor,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2.2rem',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)'
              }}
            >
              {submitting ? <><FaSpinner className="spinner" /> Đang gửi báo cáo...</> : <><FaSave /> Nộp Báo Cáo</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DynamicFormRenderer;
