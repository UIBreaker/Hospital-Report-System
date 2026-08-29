import React, { useState, useEffect } from 'react';
import { 
  FaWpforms, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaChartLine, 
  FaClipboardList, 
  FaSpinner, 
  FaSync, 
  FaLayerGroup,
  FaCheckCircle,
  FaFileAlt
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import CountUpNumber from '../../common/CountUpNumber';

const THEME_COLORS = {
  '#2563EB': 'Xanh Dương Y Tế',
  '#059669': 'Xanh Lục Bảo',
  '#7C3AED': 'Tím Thần Kinh',
  '#D97706': 'Cam Hổ Phách',
  '#DC2626': 'Đỏ Cấp Cứu',
  '#0891B2': 'Xanh Ngọc Cyan'
};

const CustomFormList = ({
  onSelectForm,
  onCreateForm,
  onEditForm,
  onViewTracker,
  onViewSubmissions
}) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customFormService.getAllForms();
      if (res && res.success) {
        setForms(res.data || []);
      }
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Lỗi khi tải danh sách biểu mẫu.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa biểu mẫu "${title}"?\nToàn bộ cấu hình và dữ liệu nộp liên quan sẽ bị xóa.`)) {
      return;
    }

    try {
      const res = await customFormService.deleteForm(id);
      if (res && res.success) {
        setForms(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      alert('Không thể xóa biểu mẫu: ' + (err.response?.data?.error || err.message));
    }
  };

  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.is_active).length;
  const trackerForms = forms.filter(f => f.form_type === 'tracker' || (Array.isArray(f.schema_json) && f.schema_json.some(field => field?.type === 'tracker'))).length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (Number(f.total_submissions) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Toolbar */}
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
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <FaWpforms />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F2C59' }}>
              Quản Trị Biểu Mẫu Tùy Chỉnh & Tracker
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Thiết kế form động linh hoạt, phân quyền nhập liệu và theo dõi số liệu chuyên môn tự động.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={fetchForms}
            disabled={loading}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.5rem 0.95rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaSync className={loading ? 'spinner' : ''} /> Làm mới
          </button>

          <button
            type="button"
            onClick={onCreateForm}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.15rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <FaPlus /> Tạo Biểu Mẫu Mới
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #2563EB', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1E40AF', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={totalForms} duration={800} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginTop: '4px' }}>TỔNG SỐ BIỂU MẪU</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #10B981', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16A34A', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={activeForms} duration={800} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#065F46', marginTop: '4px' }}>ĐANG HOẠT ĐỘNG</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #D97706', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#D97706', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={trackerForms} duration={800} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#92400E', marginTop: '4px' }}>BIỂU MẪU TRACKER</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '5px solid #7C3AED', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7C3AED', lineHeight: 1, fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={totalSubmissions} duration={900} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5B21B6', marginTop: '4px' }}>TỔNG LƯỢT NỘP</div>
          </div>
        </div>
      </div>

      {Boolean(error) && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '10px', fontSize: '0.86rem', fontWeight: '600' }}>
          ⚠️ {typeof error === 'string' ? error : (error?.message || 'Lỗi khi tải danh sách')}
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="analytics-shimmer" style={{ width: '40%', height: '18px', borderRadius: '6px' }} />
                <div className="analytics-shimmer" style={{ width: '25%', height: '18px', borderRadius: '999px' }} />
              </div>
              <div className="analytics-shimmer" style={{ width: '80%', height: '22px', borderRadius: '6px' }} />
              <div className="analytics-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
              <div className="analytics-shimmer" style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px dashed #CBD5E1',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}>
          <FaClipboardList style={{ fontSize: '3.2rem', color: '#94A3B8', marginBottom: '0.85rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F2C59', fontSize: '1.2rem', fontWeight: '800' }}>
            Chưa Có Biểu Mẫu Nào Được Tạo
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748B', fontSize: '0.88rem' }}>
            Bạn có thể tạo các biểu mẫu khảo sát, biên bản kiểm tra hoặc form theo dõi nhân sự tăng cường.
          </p>
          <button
            type="button"
            onClick={onCreateForm}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.5rem',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <FaPlus /> Bắt Đầu Thiết Kế Form Đầu Tiên
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {forms.map(form => {
            const themeColor = form.theme_color || '#2563EB';
            const hasTrackerField = Array.isArray(form.schema_json) && form.schema_json.some(f => f && f.type && (f.type.startsWith('tracker') || f.type === 'tracker'));
            const isTracker = form.form_type === 'tracker' || hasTrackerField;
            const fieldsCount = Array.isArray(form.schema_json) ? form.schema_json.length : 0;

            return (
              <div
                key={form.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  borderTop: `5px solid ${themeColor}`,
                  padding: '1.35rem',
                  boxShadow: '0 4px 14px rgba(15, 44, 89, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Badge Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{
                      backgroundColor: isTracker ? '#FEF3C7' : '#EFF6FF',
                      color: isTracker ? '#92400E' : '#1E40AF',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {isTracker ? <><FaChartLine /> Bảng Theo Dõi Tracker</> : <><FaFileAlt /> Form Nhập Liệu</>}
                    </span>

                    <span style={{
                      backgroundColor: form.is_active ? '#DCFCE7' : '#F1F5F9',
                      color: form.is_active ? '#166534' : '#64748B',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: '800'
                    }}>
                      {form.is_active ? '● Hoạt động' : '○ Tạm dừng'}
                    </span>
                  </div>

                  {/* Form Title & Slug */}
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.12rem', fontWeight: '800', color: '#0F2C59', lineHeight: 1.3 }}>
                    {form.title}
                  </h4>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', marginBottom: '0.65rem' }}>
                    Mã: <strong>{form.code}</strong>
                  </div>

                  {/* Description */}
                  {form.description && (
                    <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {form.description}
                    </p>
                  )}

                  {/* Stats Pill */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: '#64748B'
                  }}>
                    <span>Số trường: <strong style={{ color: '#0F2C59' }}>{fieldsCount}</strong></span>
                    <span>Đã nộp: <strong style={{ color: '#2563EB' }}>{form.total_submissions || 0} bản ghi</strong></span>
                  </div>
                </div>

                {/* Actions Footer: Nhập Form & Xem Dữ Liệu */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1.5px solid #F1F5F9',
                  paddingTop: '0.85rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {/* Left: Primary Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', flex: 1 }}>
                    {/* Button 1: Nhập Form (Nộp dữ liệu bình thường) */}
                    <button
                      type="button"
                      onClick={() => onSelectForm(form.code)}
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9px',
                        padding: '0.48rem 0.85rem',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                      title="Nhập và nộp dữ liệu báo cáo mới"
                    >
                      <FaEdit /> Nhập Form
                    </button>

                    {/* Button 2: Xem Dữ Liệu (Chỉ xem - Không sửa, nộp hay xóa) */}
                    <button
                      type="button"
                      onClick={() => isTracker && onViewTracker ? onViewTracker(form.code) : onViewSubmissions(form.code, true)}
                      style={{
                        backgroundColor: '#F8FAFC',
                        color: '#0F2C59',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '9px',
                        padding: '0.48rem 0.85rem',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      title="Chế độ xem dữ liệu (Chỉ đọc - Không sửa, nộp hoặc xóa)"
                    >
                      <FaEye style={{ color: '#2563EB' }} /> Xem Dữ Liệu ({form.total_submissions || 0})
                    </button>
                  </div>

                  {/* Right: Admin Tools (Edit Schema / Delete Form) */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => onEditForm(form)}
                      style={{
                        backgroundColor: '#F8FAFC',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '0.45rem 0.65rem',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      title="Cấu hình & Thiết kế lại trường biểu mẫu"
                    >
                      <FaWpforms />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(form.id, form.title, e)}
                      style={{
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        padding: '0.45rem 0.65rem',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      title="Xóa toàn bộ biểu mẫu"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomFormList;
