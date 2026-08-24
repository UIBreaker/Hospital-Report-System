import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaWpforms, 
  FaSave, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaHospital,
  FaUser,
  FaClock,
  FaFileAlt,
  FaCheck,
  FaPaperPlane,
  FaClipboardList,
  FaArrowRight
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import MedicalLoader from '../../common/MedicalLoader';

// Confetti Particle Canvas
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 3 + (Math.random() - 0.5) * 100,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        gravity: 0.28,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let startTime = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < 4000) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

const DynamicFormRenderer = ({ formCode, onBack, onViewSubmissions }) => {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const activeCode = formCode || paramCode;

  const [formMeta, setFormMeta] = useState(null);
  const [formData, setFormData] = useState({});
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedDataSummary, setSubmittedDataSummary] = useState(null);

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

  useEffect(() => {
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
        setSubmittedDataSummary({
          submissionDate,
          formData: { ...formData },
          timestamp: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN')
        });
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Không thể nộp báo cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    const initVals = {};
    (formMeta?.schema_json || []).forEach(f => {
      if (f.type === 'table') {
        initVals[f.key] = [];
      } else {
        initVals[f.key] = '';
      }
    });
    setFormData(initVals);
    setSubmitted(false);
    setSubmittedDataSummary(null);
    setErrorMsg('');
  };

  const themeColor = formMeta?.theme_color || '#2563EB';

  if (loading) {
    return (
      <MedicalLoader 
        text="Đang nạp cấu hình biểu mẫu..." 
        subtext="TTYT Khu Vực Bình Long • Hệ Thống Biểu Mẫu Tùy Chỉnh"
        minHeight="420px"
      />
    );
  }

  if (!formMeta) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '3rem auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #E2E8F0'
      }}>
        <FaExclamationTriangle style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F2C59', fontSize: '1.25rem', fontWeight: '800' }}>
          Không Tìm Thấy Biểu Mẫu
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
          Biểu mẫu không tồn tại hoặc bạn chưa được cấp quyền truy cập.
        </p>
        <button
          type="button"
          onClick={onBack || (() => navigate(-1))}
          style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.5rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ==========================================
  // CELEBRATORY SUCCESS SCREEN
  // ==========================================
  if (submitted) {
    return (
      <div style={{ maxWidth: '840px', margin: '1rem auto 4rem auto', padding: '1rem' }}>
        <ConfettiCanvas />

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 60px rgba(15, 44, 89, 0.12)',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Color Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, ${themeColor}, #10B981, #06B6D4, ${themeColor})`
          }} />

          {/* Animated Checkmark Badge */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 8px 30px rgba(22, 163, 74, 0.25)',
            border: '3px solid #86EFAC'
          }}>
            <FaCheck />
          </div>

          <span style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '0.35rem 1.1rem',
            borderRadius: '30px',
            fontWeight: '800',
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            ✓ Ghi Nhận Thành Công
          </span>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '900',
            color: '#0F2C59',
            margin: '0.85rem 0 0.35rem 0'
          }}>
            Đã Nộp Báo Cáo Biểu Mẫu!
          </h2>

          <p style={{
            fontSize: '0.92rem',
            color: '#64748B',
            margin: '0 0 1.75rem 0',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Bản ghi báo cáo <strong>{formMeta.title}</strong> cho ngày <strong>{submittedDataSummary?.submissionDate}</strong> đã được lưu trữ an toàn trên CSDL y tế.
          </p>

          {/* Summary Box */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaHospital style={{ color: themeColor }} /> Thông tin tóm tắt bản ghi vừa gửi:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>BIỂU MẪU</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F2C59' }}>{formMeta.title}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>NGÀY BÁO CÁO</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1E40AF' }}>{submittedDataSummary?.submissionDate}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>THỜI ĐIỂM GHI NHẬN</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#059669' }}>{submittedDataSummary?.timestamp}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleResetForNew}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1.5px solid #CBD5E1',
                borderRadius: '12px',
                padding: '0.75rem 1.4rem',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaPlus /> Nộp Thêm Bản Ghi Mới
            </button>

            <button
              type="button"
              onClick={onBack || (() => navigate(-1))}
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.6rem',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FaArrowLeft /> Quay Lại Cổng Biểu Mẫu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN FORM FILL VIEW
  // ==========================================
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Header Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        borderLeft: `6px solid ${themeColor}`,
        padding: '1.4rem 1.8rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(15, 44, 89, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800' }}>
                FORM NHẬP LIỆU
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                /{formMeta.code}
              </span>
            </div>
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

        {/* Date Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          padding: '0.45rem 0.95rem',
          borderRadius: '12px'
        }}>
          <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.9rem' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E40AF' }}>NGÀY BÁO CÁO:</span>
          <input
            type="date"
            value={submissionDate}
            onChange={(e) => setSubmissionDate(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: '800',
              color: '#1E40AF',
              outline: 'none',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '0.85rem 1.2rem',
          color: '#DC2626',
          fontSize: '0.86rem',
          fontWeight: '700',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaExclamationTriangle /> {typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi nộp biểu mẫu')}
        </div>
      )}

      {/* Form Content Card */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '2rem 2.2rem',
        boxShadow: '0 10px 30px rgba(15, 44, 89, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem'
      }}>
        
        {/* Dynamic 12-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.25rem'
        }}>
          {(formMeta?.schema_json || []).map((field, idx) => {
            const widthMap = {
              '100%': 12,
              '75%': 9,
              '50%': 6,
              '33.33%': 4,
              '25%': 3
            };
            const colSpan = widthMap[field.gridWidth] || 12;

            // Section Header
            if (field.type === 'section') {
              return (
                <div key={field.id || idx} style={{ gridColumn: 'span 12', borderBottom: `2px solid ${themeColor}`, paddingBottom: '0.5rem', marginTop: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ❖ {field.label}
                  </h4>
                </div>
              );
            }

            return (
              <div key={field.id || idx} style={{ gridColumn: `span ${colSpan}` }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '0.35rem'
                }}>
                  {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>

                {/* Text / Email */}
                {['text', 'email', 'phone'].includes(field.type) && (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type}
                    placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColor;
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = `0 0 0 3px ${themeColor}22`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}

                {/* Number */}
                {field.type === 'number' && (
                  <input
                    type="number"
                    placeholder={field.placeholder || '0'}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColor;
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = `0 0 0 3px ${themeColor}22`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea
                    rows={field.rows || 3}
                    placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      lineHeight: '1.45',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColor;
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = `0 0 0 3px ${themeColor}22`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}

                {/* Select */}
                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Chọn {field.label} --</option>
                    {(field.options || []).map((opt, oIdx) => (
                      <option key={oIdx} value={typeof opt === 'string' ? opt : opt.value}>
                        {typeof opt === 'string' ? opt : opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#0F2C59',
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData[field.key])}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: themeColor }}
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
                      {field.placeholder || field.label}
                    </span>
                  </label>
                )}

                {/* Sub-Table Repeater */}
                {field.type === 'table' && (
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59' }}>
                        Danh sách các dòng ({((formData[field.key] || []).length)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddTableRow(field.key, field.columns || [])}
                        style={{
                          backgroundColor: themeColor,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <FaPlus /> Thêm dòng
                      </button>
                    </div>

                    {(formData[field.key] || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        Chưa có dòng nào. Bấm "Thêm dòng" ở trên để nhập dữ liệu.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(formData[field.key] || []).map((row, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', width: '22px', textAlign: 'center' }}>
                              #{rIdx + 1}
                            </span>
                            {(field.columns || []).map(col => (
                              <input
                                key={col.key}
                                type={col.type === 'number' ? 'number' : 'text'}
                                placeholder={col.label}
                                value={row[col.key] || ''}
                                onChange={(e) => handleTableRowChange(field.key, rIdx, col.key, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.84rem'
                                }}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => handleRemoveTableRow(field.key, rIdx)}
                              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '0.45rem 0.6rem', cursor: 'pointer' }}
                              title="Xóa dòng này"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Submit Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          borderTop: '1.5px solid #F1F5F9',
          paddingTop: '1.5rem',
          marginTop: '0.5rem'
        }}>
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '0.8rem 1.5rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, #10B981 100%)`,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.8rem 2.2rem',
              fontWeight: '900',
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: `0 6px 18px ${themeColor}40`,
              transition: 'all 0.2s ease',
              letterSpacing: '0.2px'
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 8px 22px ${themeColor}55`;
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 6px 18px ${themeColor}40`;
            }}
          >
            {submitting ? (
              <>
                <FaPaperPlane className="spinner" /> Đang lưu trữ dữ liệu...
              </>
            ) : (
              <>
                <FaCheck /> Nộp & Ghi Nhận Báo Cáo <FaArrowRight />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default DynamicFormRenderer;
