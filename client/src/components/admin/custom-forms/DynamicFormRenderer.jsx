import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
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
  FaStar,
  FaStethoscope,
  FaSignature,
  FaImage,
  FaPaperclip,
  FaCalculator,
  FaThermometerHalf,
  FaMoneyBillWave,
  FaPercentage,
  FaInfoCircle,
  FaExclamationCircle,
  FaEraser,
  FaSearch,
  FaTags,
  FaToggleOn,
  FaToggleOff,
  FaArrowRight,
  FaUserMd,
  FaUserNurse
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import staffService from '../../../services/staffService';
import { AuthContext } from '../../../contexts/AuthContext';
import MedicalLoader from '../../common/MedicalLoader';
import EmbeddedTrackerField from './EmbeddedTrackerField';

// Standard Hospital ICD-10 List
const COMMON_ICD10_LIST = [
  { code: 'I10', name: 'Bệnh tăng huyết áp vô căn (nguyên phát)' },
  { code: 'E11', name: 'Bệnh đái tháo đường không phụ thuộc insulin (Type 2)' },
  { code: 'E10', name: 'Bệnh đái tháo đường phụ thuộc insulin (Type 1)' },
  { code: 'J44', name: 'Bệnh phổi tắc nghẽn mạn tính khác (COPD)' },
  { code: 'J45', name: 'Bệnh hen (Hen phế quản)' },
  { code: 'K29', name: 'Viêm dạ dày và tá tràng' },
  { code: 'K21', name: 'Bệnh trào ngược dạ dày - thực quản (GERD)' },
  { code: 'I20', name: 'Cơn đau thắt ngực' },
  { code: 'I21', name: 'Nhồi máu cơ tim cấp' },
  { code: 'I63', name: 'Nhồi máu não (Đột quỵ thiếu máu cục bộ)' },
  { code: 'N18', name: 'Bệnh thận mạn' },
  { code: 'M17', name: 'Thoái hóa khớp gối' },
  { code: 'M54', name: 'Đau lưng / Đau thần kinh tọa' },
  { code: 'A09', name: 'Bệnh tiêu chảy và viêm dạ dày - ruột do nhiễm khuẩn' },
  { code: 'A90', name: 'Sốt xuất huyết Dengue' },
  { code: 'B18', name: 'Viêm gan virus mạn tính' },
  { code: 'J00', name: 'Viêm mũi họng cấp (Cảm thường)' },
  { code: 'J02', name: 'Viêm họng cấp' },
  { code: 'J18', name: 'Viêm phổi, không đặc hiệu' },
  { code: 'J20', name: 'Viêm phế quản cấp' },
  { code: 'S06', name: 'Chấn thương trong sọ' },
  { code: 'S52', name: 'Gãy xương cẳng tay' },
  { code: 'S72', name: 'Gãy xương đùi' },
  { code: 'S82', name: 'Gãy xương cẳng chân' },
  { code: 'O80', name: 'Đẻ thường một thai' },
  { code: 'O82', name: 'Đẻ mổ một thai' }
];

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
    for (let i = 0; i < 110; i++) {
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
        if (elapsed > 2000) p.opacity = Math.max(0, p.opacity - 0.015);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < 4000) animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}
    />
  );
};

// Signature Pad Component
const SignaturePad = ({ value, onChange, themeColor = '#2563EB' }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2C59';

    if (value && value.startsWith('data:image')) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1.5px dashed #CBD5E1', padding: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FaSignature style={{ color: themeColor }} /> Ký tay trực tiếp trên khung dưới đây:
        </span>
        <button
          type="button"
          onClick={handleClear}
          style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <FaEraser /> Xóa chữ ký
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={130}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ width: '100%', height: '130px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'crosshair', touchAction: 'none' }}
      />
    </div>
  );
};

// =========================================================================
// STAFF SELECTOR COMPONENT (BÁC SĨ / ĐIỀU DƯỠNG FIELD)
// =========================================================================
const StaffSelectorField = ({ field, value, onChange, currentUserDept, themeColor = '#2563EB' }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      try {
        const res = await staffService.getAllStaff();
        const rawList = res?.data || (Array.isArray(res) ? res : []);
        setStaffList(rawList);
      } catch (err) {
        console.warn('Could not load staff list:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter staff based on field settings
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const sDept = s.department || s.department_code || '';
      const sName = s.full_name || s.name || s.username || '';
      const pos = (s.position || '').toLowerCase();

      // 1. Department filter
      if (field.staffScope === 'specific_dept' && field.specificDept) {
        if (sDept !== field.specificDept) return false;
      } else if (field.staffScope === 'current_dept' && currentUserDept) {
        if (sDept !== currentUserDept) return false;
      }

      // 2. Role filter
      const isDoc = pos.includes('bác sĩ') || pos.includes('bs') || pos.includes('truong khoa') || pos.includes('phó khoa');
      if (field.staffRole === 'doctor' && !isDoc) return false;
      if (field.staffRole === 'nurse' && isDoc) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = sName.toLowerCase().includes(q);
        const inPos = pos.includes(q);
        const inDept = (s.department_name || sDept).toLowerCase().includes(q);
        if (!inName && !inPos && !inDept) return false;
      }

      return true;
    });
  }, [staffList, field, currentUserDept, searchQuery]);

  const isMulti = field.selectionMode === 'multiple';
  const selectedArray = isMulti ? (Array.isArray(value) ? value : (value ? [value] : [])) : [];

  const handleSelectOne = (staff) => {
    const sName = staff.full_name || staff.name || staff.username || '';
    const staffLabel = staff.position ? (sName + ' (' + staff.position + ')') : sName;
    if (isMulti) {
      if (!selectedArray.includes(staffLabel)) {
        onChange([...selectedArray, staffLabel]);
      }
    } else {
      onChange(staffLabel);
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(selectedArray.filter(t => t !== tagToRemove));
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selection Display Box */}
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '0.45rem 0.75rem',
          borderRadius: '10px',
          border: '1.5px solid ' + (isDropdownOpen ? themeColor : '#CBD5E1'),
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: isDropdownOpen ? '0 0 0 3px ' + themeColor + '22' : 'none'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', flex: 1 }}>
          {isMulti ? (
            selectedArray.length === 0 ? (
              <span style={{ color: '#94A3B8', fontSize: '0.86rem' }}>{field.placeholder || 'Chọn danh sách bác sĩ / điều dưỡng...'}</span>
            ) : (
              selectedArray.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '20px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaUserMd style={{ fontSize: '0.72rem' }} /> {tag}
                  <FaTimes style={{ cursor: 'pointer', color: '#EF4444' }} onClick={() => handleRemoveTag(tag)} />
                </span>
              ))
            )
          ) : (
            value ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: '800', color: '#0F2C59' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <FaUserMd />
                </span>
                <span>{value}</span>
              </div>
            ) : (
              <span style={{ color: '#94A3B8', fontSize: '0.86rem' }}>{field.placeholder || 'Chọn bác sĩ hoặc điều dưỡng...'}</span>
            )
          )}
        </div>

        <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
          {isDropdownOpen ? '▲' : '▼'}
        </div>
      </div>

      {/* Dropdown Options Popup */}
      {isDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxHeight: '280px',
          overflowY: 'auto',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          {/* Search box inside dropdown */}
          <div style={{ position: 'sticky', top: 0, backgroundColor: '#FFFFFF', paddingBottom: '0.35rem', zIndex: 2 }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo tên bác sĩ, chức danh, khoa phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
              Đang tải danh sách nhân sự...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
              Không tìm thấy nhân sự phù hợp bộ lọc.
            </div>
          ) : (
            filteredStaff.map(s => {
              const sName = s.full_name || s.name || s.username || 'Cán bộ';
              const pos = (s.position || '').toLowerCase();
              const isDoc = pos.includes('bác sĩ') || pos.includes('bs');
              const fullLabel = s.position ? (sName + ' (' + s.position + ')') : sName;
              const isSelected = isMulti ? selectedArray.includes(fullLabel) : value === fullLabel;

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectOne(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: '1px solid ' + (isSelected ? '#BFDBFE' : '#F1F5F9'),
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#EFF6FF' : '#F8FAFC'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isDoc ? '#DBEAFE' : '#DCFCE7',
                      color: isDoc ? '#1D4ED8' : '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {isDoc ? <FaUserMd /> : <FaUserNurse />}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F2C59' }}>
                        {sName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.35rem', marginTop: '1px' }}>
                        <span style={{ fontWeight: '700', color: isDoc ? '#1D4ED8' : '#15803D' }}>{s.position || 'Nhân viên'}</span>
                        <span>•</span>
                        <span>{s.department_name || s.department || 'Bệnh viện'}</span>
                        {s.certificate && <span>• CCHN: {s.certificate}</span>}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span style={{ color: '#2563EB', fontWeight: '900', fontSize: '0.82rem' }}>✓ Đã chọn</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const DynamicFormRenderer = ({ formCode, initialMeta, onBack }) => {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const activeCode = formCode || paramCode;

  const [formMeta, setFormMeta] = useState(initialMeta || null);
  const [formData, setFormData] = useState({});
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(!initialMeta);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedDataSummary, setSubmittedDataSummary] = useState(null);

  const fetchMeta = async () => {
    if (initialMeta) {
      setFormMeta(initialMeta);
      initFormFields(initialMeta);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await customFormService.getFormByCode(activeCode);
      if (res && res.success) {
        setFormMeta(res.data);
        initFormFields(res.data);
      }
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Lỗi khi tải thông tin biểu mẫu.'));
    } finally {
      setLoading(false);
    }
  };

  const initFormFields = (meta) => {
    const initVals = {};
    (meta?.schema_json || []).forEach(f => {
      if (f.type === 'table') initVals[f.key] = [];
      else if (f.type === 'multi_checkbox' || f.type === 'multi_select') initVals[f.key] = [];
      else if (f.type === 'staff_selector' && f.selectionMode === 'multiple') initVals[f.key] = [];
      else if (f.type === 'checkbox' || f.type === 'toggle') initVals[f.key] = false;
      else if (f.type === 'percentage') initVals[f.key] = 50;
      else if (f.type === 'rating') initVals[f.key] = 0;
      else initVals[f.key] = f.defaultValue || '';
    });
    setFormData(initVals);
  };

  useEffect(() => {
    if (initialMeta) {
      setFormMeta(initialMeta);
      initFormFields(initialMeta);
      setLoading(false);
    } else if (activeCode) {
      fetchMeta();
    }
  }, [activeCode, initialMeta]);

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Evaluate Formulas in Realtime
  useEffect(() => {
    if (!formMeta || !Array.isArray(formMeta.schema_json)) return;

    formMeta.schema_json.forEach(field => {
      if (field.type === 'formula' && field.formula) {
        try {
          let expr = field.formula;
          Object.entries(formData).forEach(([k, v]) => {
            const numVal = parseFloat(v) || 0;
            expr = expr.split('{' + k + '}').join(numVal);
          });
          if (/^[0-9+\-*/().\s]+$/.test(expr)) {
            // eslint-disable-next-line no-eval
            const result = Function('"use strict"; return (' + expr + ')')();
            if (!isNaN(result) && isFinite(result)) {
              const formatted = Number.isInteger(result) ? result : result.toFixed(2);
              if (formData[field.key] !== String(formatted)) {
                setFormData(prev => ({ ...prev, [field.key]: String(formatted) }));
              }
            }
          }
        } catch (e) {
          // Ignore syntax errors
        }
      }
    });
  }, [formData, formMeta]);

  // Sub-table helpers
  const handleAddTableRow = (tableKey, columns) => {
    const newRow = {};
    columns.forEach(col => { newRow[col.key] = ''; });
    setFormData(prev => ({ ...prev, [tableKey]: [...(prev[tableKey] || []), newRow] }));
  };

  const handleTableRowChange = (tableKey, rIdx, colKey, val) => {
    setFormData(prev => {
      const rows = [...(prev[tableKey] || [])];
      rows[rIdx] = { ...rows[rIdx], [colKey]: val };
      return { ...prev, [tableKey]: rows };
    });
  };

  const handleRemoveTableRow = (tableKey, rIdx) => {
    setFormData(prev => ({ ...prev, [tableKey]: (prev[tableKey] || []).filter((_, i) => i !== rIdx) }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If initialMeta (Preview Mode) -> simulate success
    if (initialMeta) {
      setSubmittedDataSummary({
        submissionDate,
        formData: { ...formData },
        timestamp: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN')
      });
      setSubmitted(true);
      return;
    }

    const missingRequired = [];
    (formMeta?.schema_json || []).forEach(f => {
      if (f.required && (formData[f.key] === undefined || formData[f.key] === null || formData[f.key] === '')) {
        missingRequired.push(f.label);
      }
    });

    if (missingRequired.length > 0) {
      setErrorMsg('Vui lòng điền các trường bắt buộc: ' + missingRequired.join(', '));
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (formMeta) initFormFields(formMeta);
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
      <div style={{ maxWidth: '600px', margin: '3rem auto', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
        <FaExclamationTriangle style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F2C59', fontSize: '1.25rem', fontWeight: '800' }}>Không Tìm Thấy Biểu Mẫu</h3>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>Biểu mẫu không tồn tại hoặc bạn chưa được cấp quyền truy cập.</p>
        <button type="button" onClick={onBack || (() => navigate(-1))} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem', fontWeight: '700', cursor: 'pointer' }}>
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
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 25px 60px rgba(15, 44, 89, 0.12)', padding: '3rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, ' + themeColor + ', #10B981, #06B6D4, ' + themeColor + ')' }} />
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1.25rem auto', boxShadow: '0 8px 30px rgba(22, 163, 74, 0.25)', border: '3px solid #86EFAC' }}>
            <FaCheck />
          </div>
          <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.35rem 1.1rem', borderRadius: '30px', fontWeight: '800', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✓ Ghi Nhận Thành Công
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F2C59', margin: '0.85rem 0 0.35rem 0' }}>Đã Nộp Báo Cáo Biểu Mẫu!</h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0 0 1.75rem 0', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            Bản ghi báo cáo <strong>{formMeta.title}</strong> cho ngày <strong>{submittedDataSummary?.submissionDate}</strong> đã được lưu trữ an toàn trên CSDL y tế.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleResetForNew} style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '0.75rem 1.4rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus /> Nộp Thêm Bản Ghi Mới
            </button>
            <button type="button" onClick={onBack || (() => navigate(-1))} style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '0.75rem 1.6rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>
              <FaArrowLeft /> Quay Lại Cổng Biểu Mẫu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN FORM FILL VIEW (28 PRO FIELD TYPES)
  // ==========================================
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Header Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid ' + themeColor, padding: '1.4rem 1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(15, 44, 89, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button type="button" onClick={onBack || (() => navigate(-1))} style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.5rem 0.85rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800' }}>
                FORM NHẬP LIỆU
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>/{formMeta.code}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}>{formMeta.title}</h2>
            {formMeta.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>{formMeta.description}</p>}
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', padding: '0.45rem 0.95rem', borderRadius: '12px' }}>
          <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.9rem' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E40AF' }}>NGÀY BÁO CÁO:</span>
          <input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: '800', color: '#1E40AF', outline: 'none', fontSize: '0.88rem', cursor: 'pointer' }} />
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '0.85rem 1.2rem', color: '#DC2626', fontSize: '0.86rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaExclamationTriangle /> {typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi nộp biểu mẫu')}
        </div>
      )}

      {/* Main Dynamic Form Card */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem 2.2rem', boxShadow: '0 10px 30px rgba(15, 44, 89, 0.05)', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        
        {/* 12-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
          {(formMeta?.schema_json || []).map((field, idx) => {
            const widthMap = { '100%': 12, '75%': 9, '50%': 6, '33.33%': 4, '25%': 3 };
            const colSpan = widthMap[field.gridWidth] || 12;

            // SECTION HEADER
            if (field.type === 'section') {
              return (
                <div key={field.id || idx} style={{ gridColumn: 'span 12', borderBottom: '2px solid ' + themeColor, paddingBottom: '0.5rem', marginTop: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ❖ {field.label}
                  </h4>
                </div>
              );
            }

            // CALLOUT ALERT
            if (field.type === 'callout') {
              const calloutStyles = {
                info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: FaInfoCircle },
                warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: FaExclamationTriangle },
                success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', icon: FaCheckCircle },
                danger: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: FaExclamationCircle }
              };
              const style = calloutStyles[field.calloutType || 'info'];
              const IconComp = style.icon;

              return (
                <div key={field.id || idx} style={{ gridColumn: 'span 12', backgroundColor: style.bg, border: '1.5px solid ' + style.border, borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <IconComp style={{ color: style.color, fontSize: '1.25rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '800', color: style.color, fontSize: '0.88rem' }}>{field.label}</div>
                    {field.placeholder && <div style={{ fontSize: '0.82rem', color: style.color, opacity: 0.9, marginTop: '2px' }}>{field.placeholder}</div>}
                  </div>
                </div>
              );
            }

            // DATA TRACKER LIVE WIDGETS
            if (field.type && field.type.startsWith('tracker_')) {
              return (
                <div key={field.id || idx} style={{ gridColumn: 'span 12', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
                  <EmbeddedTrackerField
                    field={field}
                    themeColor={themeColor}
                    currentDate={submissionDate}
                    currentUserDept={user?.department_code}
                  />
                </div>
              );
            }

            return (
              <div key={field.id || idx} style={{ gridColumn: 'span ' + colSpan }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>

                {/* 1. STAFF SELECTOR (BÁC SĨ / ĐIỀU DƯỠNG) */}
                {field.type === 'staff_selector' && (
                  <StaffSelectorField
                    field={field}
                    value={formData[field.key]}
                    onChange={(val) => handleFieldChange(field.key, val)}
                    currentUserDept={user?.department_code}
                    themeColor={themeColor}
                  />
                )}

                {/* 2. TEXT / EMAIL / PHONE */}
                {['text', 'email', 'phone'].includes(field.type) && (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type}
                    placeholder={field.placeholder || ('Nhập ' + field.label.toLowerCase() + '...')}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    readOnly={field.readOnly}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', backgroundColor: field.readOnly ? '#F1F5F9' : '#F8FAFC', color: '#0F2C59', fontWeight: '600', boxSizing: 'border-box' }}
                  />
                )}

                {/* 3. TEXTAREA */}
                {field.type === 'textarea' && (
                  <textarea
                    rows={field.rows || 3}
                    placeholder={field.placeholder || ('Nhập ' + field.label.toLowerCase() + '...')}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    readOnly={field.readOnly}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '500', boxSizing: 'border-box', lineHeight: '1.45', resize: 'vertical' }}
                  />
                )}

                {/* 4. NUMBER / DECIMAL */}
                {['number', 'decimal'].includes(field.type) && (
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type="number"
                      step={field.type === 'decimal' ? '0.1' : '1'}
                      placeholder={field.placeholder || '0'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      required={field.required}
                      readOnly={field.readOnly}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                    {field.unit && (
                      <span style={{ position: 'absolute', right: '0.85rem', color: '#64748B', fontSize: '0.8rem', fontWeight: '700', pointerEvents: 'none' }}>
                        {field.unit}
                      </span>
                    )}
                  </div>
                )}

                {/* 5. CURRENCY VNĐ */}
                {field.type === 'currency' && (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="0"
                      value={formData[field.key] ? String(formData[field.key]).replace(/B(?=(d{3})+(?!d))/g, '.') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/./g, '').replace(/[^0-9]/g, '');
                        handleFieldChange(field.key, raw);
                      }}
                      required={field.required}
                      style={{ width: '100%', padding: '0.7rem 3rem 0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.92rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '800', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#10B981', fontWeight: '800', fontSize: '0.82rem' }}>
                      VNĐ
                    </span>
                  </div>
                )}

                {/* 6. FORMULA (AUTO CALCULATED) */}
                {field.type === 'formula' && (
                  <div style={{ backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.82rem', color: '#7C3AED', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaCalculator /> Tự động tính:
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#6B21A8' }}>
                      {formData[field.key] || '0'}
                    </span>
                  </div>
                )}

                {/* 7. PERCENTAGE SLIDER */}
                {field.type === 'percentage' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#F8FAFC', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData[field.key] !== undefined ? formData[field.key] : 50}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{ flex: 1, accentColor: themeColor, cursor: 'pointer' }}
                    />
                    <span style={{ backgroundColor: themeColor, color: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: '900', fontSize: '0.84rem' }}>
                      {formData[field.key] || 50}%
                    </span>
                  </div>
                )}

                {/* 8. ICD-10 SEARCH COMBOBOX */}
                {field.type === 'icd10' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Gõ mã hoặc tên bệnh (VD: I10, E11, Hen phế quản...)"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      required={field.required}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '2px' }}>
                      {COMMON_ICD10_LIST.slice(0, 5).map(icd => (
                        <button
                          key={icd.code}
                          type="button"
                          onClick={() => handleFieldChange(field.key, icd.code + ' - ' + icd.name)}
                          style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.74rem', fontWeight: '700', color: '#1E40AF', cursor: 'pointer' }}
                        >
                          +{icd.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. SINGLE CHECKBOX / TOGGLE */}
                {['checkbox', 'toggle'].includes(field.type) && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.5rem 0' }}>
                    {field.type === 'toggle' ? (
                      <div
                        onClick={() => handleFieldChange(field.key, !formData[field.key])}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '24px',
                          backgroundColor: formData[field.key] ? '#10B981' : '#CBD5E1',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '3px',
                          left: formData[field.key] ? '23px' : '3px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={Boolean(formData[field.key])}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: themeColor }}
                      />
                    )}
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155' }}>
                      {field.placeholder || field.label}
                    </span>
                  </label>
                )}

                {/* 10. MULTI-CHECKBOX */}
                {field.type === 'multi_checkbox' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    {(field.options || []).map((opt, oIdx) => {
                      const optVal = typeof opt === 'string' ? opt : opt.value;
                      const isChecked = (formData[field.key] || []).includes(optVal);
                      return (
                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid ' + (isChecked ? '#93C5FD' : '#CBD5E1') }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const curr = formData[field.key] || [];
                              const next = e.target.checked ? [...curr, optVal] : curr.filter(v => v !== optVal);
                              handleFieldChange(field.key, next);
                            }}
                            style={{ accentColor: themeColor }}
                          />
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isChecked ? '#1E40AF' : '#334155' }}>
                            {typeof opt === 'string' ? opt : opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 11. RADIO GROUP */}
                {field.type === 'radio' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    {(field.options || []).map((opt, oIdx) => {
                      const optVal = typeof opt === 'string' ? opt : opt.value;
                      const isSelected = formData[field.key] === optVal;
                      return (
                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1.5px solid ' + (isSelected ? themeColor : '#CBD5E1') }}>
                          <input
                            type="radio"
                            name={field.key}
                            value={optVal}
                            checked={isSelected}
                            onChange={() => handleFieldChange(field.key, optVal)}
                            style={{ accentColor: themeColor }}
                          />
                          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isSelected ? '#1E40AF' : '#334155' }}>
                            {typeof opt === 'string' ? opt : opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 12. SELECT DROPDOWN */}
                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '600', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    <option value="">-- Chọn {field.label} --</option>
                    {(field.options || []).map((opt, oIdx) => (
                      <option key={oIdx} value={typeof opt === 'string' ? opt : opt.value}>
                        {typeof opt === 'string' ? opt : opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* 13. MULTI-SELECT TAGS */}
                {field.type === 'multi_select' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    {(field.options || []).map((opt, oIdx) => {
                      const optVal = typeof opt === 'string' ? opt : opt.value;
                      const isSelected = (formData[field.key] || []).includes(optVal);
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            const curr = formData[field.key] || [];
                            const next = isSelected ? curr.filter(v => v !== optVal) : [...curr, optVal];
                            handleFieldChange(field.key, next);
                          }}
                          style={{
                            backgroundColor: isSelected ? themeColor : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            border: '1px solid ' + (isSelected ? themeColor : '#CBD5E1'),
                            borderRadius: '20px',
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <FaTags /> {typeof opt === 'string' ? opt : opt.label} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 14. DATE / TIME / DATETIME */}
                {['date', 'time', 'datetime'].includes(field.type) && (
                  <input
                    type={field.type === 'datetime' ? 'datetime-local' : field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#0F2C59', fontWeight: '600', boxSizing: 'border-box' }}
                  />
                )}

                {/* 15. RATING / VAS PAIN SCALE */}
                {field.type === 'rating' && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, field.ratingMax || 5).map((num) => {
                        const isChosen = Number(formData[field.key]) >= num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleFieldChange(field.key, num)}
                            style={{
                              backgroundColor: isChosen ? '#F59E0B' : '#FFFFFF',
                              color: isChosen ? '#FFFFFF' : '#64748B',
                              border: '1.5px solid ' + (isChosen ? '#F59E0B' : '#CBD5E1'),
                              borderRadius: '8px',
                              width: '38px',
                              height: '38px',
                              fontSize: '0.9rem',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px'
                            }}
                          >
                            <FaStar size={12} /> {num}
                          </button>
                        );
                      })}
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F2C59', marginLeft: '0.5rem' }}>
                        Điểm: <strong>{formData[field.key] || 0}</strong> / {field.ratingMax || 5}
                      </span>
                    </div>
                  </div>
                )}

                {/* 16. SIGNATURE PAD */}
                {field.type === 'signature' && (
                  <SignaturePad
                    value={formData[field.key] || ''}
                    onChange={(dataUrl) => handleFieldChange(field.key, dataUrl)}
                    themeColor={themeColor}
                  />
                )}

                {/* 17. IMAGE / FILE UPLOAD */}
                {['image', 'file'].includes(field.type) && (
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1.5px dashed #CBD5E1', padding: '1rem', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder={field.type === 'image' ? 'Dán link ảnh cận lâm sàng hoặc URL...' : 'Dán đường dẫn tài liệu đính kèm...'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                    {field.type === 'image' && formData[field.key] && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img src={formData[field.key]} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                      </div>
                    )}
                  </div>
                )}

                {/* 18. SUB-TABLE REPEATER */}
                {field.type === 'table' && (
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59' }}>
                        Danh sách dòng ({((formData[field.key] || []).length)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddTableRow(field.key, field.columns || [])}
                        style={{ backgroundColor: themeColor, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
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
                                style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
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

                {/* Help text */}
                {field.helpText && (
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    {field.helpText}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Submit Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', borderTop: '1.5px solid #F1F5F9', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onBack || (() => navigate(-1))} style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '0.8rem 1.5rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'linear-gradient(135deg, ' + themeColor + ' 0%, #10B981 100%)',
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
              boxShadow: '0 6px 18px ' + themeColor + '40'
            }}
          >
            {submitting ? <><FaPaperPlane className="spinner" /> Đang lưu trữ dữ liệu...</> : <><FaCheck /> Nộp & Ghi Nhận Báo Cáo <FaArrowRight /></>}
          </button>
        </div>

      </form>
    </div>
  );
};

export default DynamicFormRenderer;
