import React, { useState, useEffect, useMemo } from 'react';
import {
  FaWpforms,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaChartLine,
  FaShieldAlt,
  FaPalette,
  FaListUl,
  FaCog,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaGripVertical,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaColumns,
  FaHeading,
  FaFont,
  FaCalendarAlt,
  FaClock,
  FaSortNumericDown,
  FaCheckSquare,
  FaTable,
  FaUsers,
  FaUserMd,
  FaStethoscope,
  FaHeartbeat,
  FaHospital,
  FaAmbulance,
  FaNotesMedical,
  FaProcedures,
  FaLayerGroup,
  FaDotCircle,
  FaToggleOn,
  FaToggleOff,
  FaTags,
  FaAlignLeft,
  FaEnvelope,
  FaPhone,
  FaThermometerHalf,
  FaMoneyBillWave,
  FaCalculator,
  FaPercentage,
  FaCalendarDay,
  FaStar,
  FaImage,
  FaPaperclip,
  FaSignature,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSlidersH,
  FaEdit,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaDesktop,
  FaMobileAlt,
  FaUserNurse
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import systemUserService from '../../../services/systemUserService';
import DynamicFormRenderer from './DynamicFormRenderer';

// 8 Theme Color Presets
const THEME_OPTIONS = [
  { color: '#2563EB', label: 'Xanh Dương Y Tế', bg: '#EFF6FF', border: '#BFDBFE' },
  { color: '#059669', label: 'Xanh Lục Bảo', bg: '#ECFDF5', border: '#A7F3D0' },
  { color: '#7C3AED', label: 'Tím Hoàng Gia', bg: '#F5F3FF', border: '#DDD6FE' },
  { color: '#D97706', label: 'Cam Hổ Phách', bg: '#FFFBEB', border: '#FDE68A' },
  { color: '#DC2626', label: 'Đỏ Cấp Cứu', bg: '#FEF2F2', border: '#FECACA' },
  { color: '#0891B2', label: 'Xanh Cyan Biển Sâu', bg: '#ECFEFF', border: '#A5F3FC' },
  { color: '#0D9488', label: 'Xanh Mòng Két', bg: '#F0FDFA', border: '#99F6E4' },
  { color: '#DB2777', label: 'Hồng Y Tế Nữ Hộ Sinh', bg: '#FDF2F8', border: '#FBCFE8' }
];

const DEPARTMENTS = [
  { code: 'lck', name: 'Khoa Liên Chuyên Khoa' },
  { code: 'xn', name: 'Khoa Xét nghiệm' },
  { code: 'cdha', name: 'Khoa Chẩn đoán hình ảnh' },
  { code: 'hscc_tnt', name: 'Khoa Hồi sức cấp cứu - Thận nhân tạo' },
  { code: 'noi', name: 'Khoa Nội' },
  { code: 'nhi', name: 'Khoa Nhi' },
  { code: 'nhiem', name: 'Khoa Nhiễm' },
  { code: 'san', name: 'Khoa Sản' },
  { code: 'yhct_phcn', name: 'Khoa Y học cổ truyền - Phục hồi chức năng' },
  { code: 'ngoai_th', name: 'Khoa Ngoại tổng hợp' },
  { code: 'ctch', name: 'Khoa Chấn thương chỉnh hình' },
  { code: 'gmhs', name: 'Khoa Gây mê Hồi sức' }
];

// =========================================================================
// 6 ENTERPRISE FIELD CATEGORIES (28 PRO FIELD TYPES WITH STAFF SELECTOR)
// =========================================================================
const FIELD_CATEGORIES = [
  {
    id: 'choice',
    name: '1. Lựa chọn & Hộp kiểm (Choice & Checkboxes)',
    icon: FaCheckSquare,
    badgeColor: '#10B981',
    fields: [
      { type: 'checkbox', label: 'Hộp kiểm đơn (Checkbox)', icon: FaCheckSquare, defaultWidth: '50%', placeholder: 'Tôi xác nhận nội dung này' },
      { type: 'multi_checkbox', label: 'Nhóm nhiều hộp kiểm (Multi-Checkbox)', icon: FaListUl, defaultWidth: '100%', options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C'] },
      { type: 'radio', label: 'Nút chọn 1 (Radio Group)', icon: FaDotCircle, defaultWidth: '100%', options: ['Phương án 1', 'Phương án 2', 'Phương án 3'] },
      { type: 'toggle', label: 'Công tắc Bật/Tắt (Toggle Switch)', icon: FaToggleOn, defaultWidth: '50%', placeholder: 'Kích hoạt / Bật' },
      { type: 'select', label: 'Danh sách chọn Dropdown', icon: FaListUl, defaultWidth: '50%', options: ['Mục 1', 'Mục 2', 'Mục 3'] },
      { type: 'multi_select', label: 'Thẻ chọn nhiều (Multi-Select Tags)', icon: FaTags, defaultWidth: '100%', options: ['Thẻ A', 'Thẻ B', 'Thẻ C'] }
    ]
  },
  {
    id: 'text',
    name: '2. Văn bản & Nhận diện (Text & Identity)',
    icon: FaFont,
    badgeColor: '#2563EB',
    fields: [
      { type: 'text', label: 'Văn bản ngắn', icon: FaFont, defaultWidth: '50%', placeholder: 'Nhập nội dung ngắn...' },
      { type: 'textarea', label: 'Ghi chú nhiều dòng', icon: FaAlignLeft, defaultWidth: '100%', placeholder: 'Nhập mô tả / ghi chú chi tiết...' },
      { type: 'staff_selector', label: 'Chọn Bác sĩ / Điều dưỡng (Nhân sự)', icon: FaUserMd, defaultWidth: '50%', placeholder: 'Chọn bác sĩ hoặc điều dưỡng...', staffScope: 'all', staffRole: 'all', selectionMode: 'single', specificDept: 'lck' },
      { type: 'email', label: 'Email', icon: FaEnvelope, defaultWidth: '50%', placeholder: 'ten@benhvien.vn' },
      { type: 'phone', label: 'Số điện thoại', icon: FaPhone, defaultWidth: '50%', placeholder: '09xx xxx xxx' },
      { type: 'icd10', label: 'Tìm kiếm mã bệnh ICD-10', icon: FaStethoscope, defaultWidth: '100%', placeholder: 'Gõ mã hoặc tên bệnh (VD: I10 - Tăng huyết áp, E11 - Đái tháo đường...)' }
    ]
  },
  {
    id: 'number',
    name: '3. Số liệu & Tính toán (Number & Formulas)',
    icon: FaCalculator,
    badgeColor: '#7C3AED',
    fields: [
      { type: 'number', label: 'Số nguyên', icon: FaSortNumericDown, defaultWidth: '50%', placeholder: '0' },
      { type: 'decimal', label: 'Số thập phân / Chỉ số sinh tồn', icon: FaThermometerHalf, defaultWidth: '50%', placeholder: '0.0', unit: 'mmHg' },
      { type: 'currency', label: 'Tiền tệ VNĐ', icon: FaMoneyBillWave, defaultWidth: '50%', placeholder: '0 VNĐ' },
      { type: 'formula', label: 'Ô Công thức tính toán', icon: FaCalculator, defaultWidth: '50%', formula: '', placeholder: 'Tự động tính toán theo công thức' },
      { type: 'percentage', label: 'Tỷ lệ % / Progress', icon: FaPercentage, defaultWidth: '50%', placeholder: '50%' }
    ]
  },
  {
    id: 'datetime',
    name: '4. Thời gian & Đánh giá (Date, Time & Ratings)',
    icon: FaCalendarAlt,
    badgeColor: '#D97706',
    fields: [
      { type: 'date', label: 'Ngày tháng', icon: FaCalendarAlt, defaultWidth: '50%' },
      { type: 'time', label: 'Giờ:Phút', icon: FaClock, defaultWidth: '50%' },
      { type: 'datetime', label: 'Ngày & Giờ', icon: FaCalendarDay, defaultWidth: '50%' },
      { type: 'rating', label: 'Thang đo điểm số (Rating / VAS 1-10)', icon: FaStar, defaultWidth: '50%', ratingMax: 5, ratingType: 'star' }
    ]
  },
  {
    id: 'media',
    name: '5. Đa phương tiện & Chữ ký (Media & Signatures)',
    icon: FaSignature,
    badgeColor: '#DB2777',
    fields: [
      { type: 'image', label: 'Ảnh cận lâm sàng (Cloudinary)', icon: FaImage, defaultWidth: '100%' },
      { type: 'file', label: 'Đính kèm File PDF/Doc', icon: FaPaperclip, defaultWidth: '100%' },
      { type: 'signature', label: 'Chữ ký số / Ký tay', icon: FaSignature, defaultWidth: '100%' }
    ]
  },
  {
    id: 'layout',
    name: '6. Bố cục & Nhóm (Layout & Structure)',
    icon: FaLayerGroup,
    badgeColor: '#0D9488',
    fields: [
      { type: 'table', label: 'Bảng con lồng nhau (Sub-table)', icon: FaTable, defaultWidth: '100%', columns: [{ id: 'c1', key: 'col_1', label: 'Cột 1', type: 'text' }, { id: 'c2', key: 'col_2', label: 'Cột 2', type: 'text' }] },
      { type: 'section', label: 'Tiêu đề phân đoạn (Section)', icon: FaHeading, defaultWidth: '100%' },
      { type: 'grid_container', label: 'Chia khung 2/3 cột (Grid)', icon: FaColumns, defaultWidth: '100%' },
      { type: 'callout', label: 'Khối cảnh báo/Hướng dẫn (Callout)', icon: FaExclamationCircle, defaultWidth: '100%', calloutType: 'info', placeholder: 'Thông điệp lưu ý / hướng dẫn y tế cho người điền...' }
    ]
  }
];

// Flat field meta lookup
const ALL_FIELD_TYPES = FIELD_CATEGORIES.flatMap(cat => cat.fields);

const getFieldMeta = (type) => {
  return ALL_FIELD_TYPES.find(f => f.type === type) || { label: type, icon: FaFont, defaultWidth: '50%' };
};

const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 32);
};

const CustomFormBuilder = ({ initialForm, onCancel, onSaved }) => {
  const isEditing = Boolean(initialForm?.id);

  // Tab State: 'general' | 'fields' | 'permissions'
  const [activeTab, setActiveTab] = useState('fields');

  // Form Basic Info
  const [code, setCode] = useState(initialForm?.code || '');
  const [title, setTitle] = useState(initialForm?.title || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [formType, setFormType] = useState(initialForm?.form_type || 'input');
  const [themeColor, setThemeColor] = useState(initialForm?.theme_color || '#2563EB');
  const [headerIcon, setHeaderIcon] = useState(initialForm?.header_icon || 'form');
  const [density, setDensity] = useState(initialForm?.density || 'normal');
  const [isActive, setIsActive] = useState(initialForm?.is_active !== undefined ? Boolean(initialForm.is_active) : true);

  // Fields State
  const [fields, setFields] = useState(() => {
    if (Array.isArray(initialForm?.schema_json) && initialForm.schema_json.length > 0) {
      return initialForm.schema_json;
    }
    return [
      { id: 'f_1', key: 'ho_va_ten', label: 'Họ và tên bệnh nhân / người khám', type: 'text', required: true, gridWidth: '50%', placeholder: 'Nhập họ và tên...' },
      { id: 'f_2', key: 'bac_si_kham', label: 'Bác sĩ phụ trách khám', type: 'staff_selector', required: true, gridWidth: '50%', placeholder: 'Chọn bác sĩ...', staffScope: 'all', staffRole: 'doctor', selectionMode: 'single' },
      { id: 'f_3', key: 'ghi_chu', label: 'Ghi chú chuyên môn', type: 'textarea', required: false, gridWidth: '100%', placeholder: 'Nhập ghi chú...' }
    ];
  });

  // Active Category Accordion (Palette)
  const [openCategories, setOpenCategories] = useState(new Set(['choice', 'text', 'number', 'datetime', 'media', 'layout']));
  const [paletteSearch, setPaletteSearch] = useState('');

  // Selected Field for Drawer Settings
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);

  // Drag Reordering
  const [draggedIndex, setDraggedIndex] = useState(null);

  // LIVE PREVIEW MODAL STATE
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Permissions Array
  const [permissions, setPermissions] = useState(() => {
    if (Array.isArray(initialForm?.permissions) && initialForm.permissions.length > 0) {
      return initialForm.permissions;
    }
    return [{ target_type: 'all', target_value: 'all', permission: 'edit' }];
  });

  // Accounts List for User-Specific Permissions
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load Accounts for user permissions
  useEffect(() => {
    const loadAllAccounts = async () => {
      try {
        const [coreRes, sysRes] = await Promise.allSettled([
          customFormService.getCoreAccounts(),
          systemUserService.getAllSystemUsers()
        ]);

        const coreList = coreRes.status === 'fulfilled' && coreRes.value?.data ? coreRes.value.data : [];
        const sysList = sysRes.status === 'fulfilled' && sysRes.value?.data ? sysRes.value.data : [];

        const combined = [
          ...coreList.map(a => ({
            id: `core_${a.id}`,
            username: a.username,
            name: a.department_name || a.username,
            dept: a.department_code,
            type: 'core'
          })),
          ...sysList.map(u => ({
            id: `sys_${u.id}`,
            username: u.username,
            name: u.full_name,
            dept: u.department_name || u.department_code,
            type: 'system'
          }))
        ];

        setAvailableAccounts(combined);
      } catch (err) {
        console.warn('Could not load accounts list for permissions:', err);
      }
    };

    loadAllAccounts();
  }, []);

  // Handle ESC to close Preview Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPreviewModal) setShowPreviewModal(false);
        if (editingFieldIndex !== null) setEditingFieldIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreviewModal, editingFieldIndex]);

  const toggleCategory = (catId) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // Add field from Palette
  const handleAddField = (fieldTemplate) => {
    const newId = `f_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const newKey = fieldTemplate.type === 'section'
      ? `section_${fields.length + 1}`
      : `${slugify(fieldTemplate.label)}_${fields.length + 1}`;

    const newField = {
      id: newId,
      key: newKey,
      label: fieldTemplate.label,
      type: fieldTemplate.type,
      required: !['section', 'callout', 'grid_container'].includes(fieldTemplate.type) && false,
      gridWidth: fieldTemplate.defaultWidth || '50%',
      placeholder: fieldTemplate.placeholder || '',
      helpText: '',
      options: fieldTemplate.options ? [...fieldTemplate.options] : undefined,
      columns: fieldTemplate.columns ? fieldTemplate.columns.map(c => ({ ...c })) : undefined,
      ratingMax: fieldTemplate.ratingMax || (fieldTemplate.type === 'rating' ? 5 : undefined),
      ratingType: fieldTemplate.ratingType || (fieldTemplate.type === 'rating' ? 'star' : undefined),
      calloutType: fieldTemplate.calloutType || (fieldTemplate.type === 'callout' ? 'info' : undefined),
      unit: fieldTemplate.unit || '',
      // Staff selector config
      staffScope: fieldTemplate.staffScope || 'all',
      staffRole: fieldTemplate.staffRole || 'all',
      selectionMode: fieldTemplate.selectionMode || 'single',
      specificDept: fieldTemplate.specificDept || 'lck'
    };

    const newIndex = fields.length;
    setFields([...fields, newField]);
    setEditingFieldIndex(newIndex);
  };

  const updateFieldProp = (index, prop, val) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [prop]: val };
      return updated;
    });
  };

  const duplicateField = (index) => {
    const f = fields[index];
    const newField = {
      ...JSON.parse(JSON.stringify(f)),
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      key: `${f.key}_copy`,
      label: `${f.label} (Bản sao)`
    };
    const updated = [...fields];
    updated.splice(index + 1, 0, newField);
    setFields(updated);
    setEditingFieldIndex(index + 1);
  };

  const removeField = (index) => {
    if (fields.length <= 1) {
      alert('Biểu mẫu cần có ít nhất 1 trường dữ liệu.');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
    if (editingFieldIndex === index) setEditingFieldIndex(null);
    else if (editingFieldIndex > index) setEditingFieldIndex(editingFieldIndex - 1);
  };

  // Drag and Drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const updated = [...fields];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setFields(updated);
    setDraggedIndex(null);
    if (editingFieldIndex === draggedIndex) setEditingFieldIndex(targetIndex);
  };

  const moveField = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFields(updated);
    if (editingFieldIndex === index) setEditingFieldIndex(targetIdx);
  };

  // Save Form Handler
  const handleSave = async () => {
    setErrorMsg('');
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập Tên biểu mẫu.');
      setActiveTab('general');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập Mã định danh slug.');
      setActiveTab('general');
      return;
    }
    if (fields.length === 0) {
      setErrorMsg('Biểu mẫu cần có ít nhất 1 trường dữ liệu.');
      setActiveTab('fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        title,
        description,
        form_type: formType,
        theme_color: themeColor,
        header_icon: headerIcon,
        density,
        is_active: isActive,
        schema_json: fields,
        permissions
      };

      if (isEditing) {
        await customFormService.updateForm(initialForm.id, payload);
      } else {
        await customFormService.createForm(payload);
      }

      if (onSaved) onSaved();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Lỗi khi lưu biểu mẫu.');
    } finally {
      setSaving(false);
    }
  };

  const selectedThemeObj = THEME_OPTIONS.find(t => t.color === themeColor) || THEME_OPTIONS[0];
  const editingField = editingFieldIndex !== null ? fields[editingFieldIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Header Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '1.2rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(15, 44, 89, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.5rem 0.9rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#334155'
            }}
          >
            <FaArrowLeft /> Hủy bỏ
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800' }}>
                {isEditing ? 'CHỈNH SỬA BIỂU MẪU' : 'TẠO BIỂU MẪU MỚI'}
              </span>
              {code && <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', fontWeight: '700' }}>/{code}</span>}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}>
              {title || 'Biểu Mẫu Tùy Chỉnh Chuyên Nghiệp'}
            </h2>
          </div>
        </div>

        {/* Top Header Actions (Live Preview Modal & Save) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* NÚT MỞ LIVE PREVIEW MODAL */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            style={{
              backgroundColor: '#0F2C59',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.4rem',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.25)'
            }}
            title="Mở popup xem trước và kiểm tra giao diện tương tác thật"
          >
            <FaEye style={{ color: '#38BDF8' }} /> Xem Trước Bố Cục (Live Preview)
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, #10B981 100%)`,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.8rem',
              fontWeight: '900',
              fontSize: '0.92rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: `0 6px 18px ${themeColor}40`
            }}
          >
            {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu & Xuất Bản Biểu Mẫu</>}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '0.85rem 1.2rem', color: '#DC2626', fontSize: '0.86rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaExclamationTriangle /> {errorMsg}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px 16px 0 0',
        padding: '0.5rem 1rem 0 1rem',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'fields', label: `2. Thiết kế trường dữ liệu (${fields.length})`, icon: FaListUl },
          { key: 'general', label: '1. Thông tin chung & Giao diện', icon: FaPalette },
          { key: 'permissions', label: `4. Phân quyền truy cập (${permissions.length})`, icon: FaShieldAlt }
        ].map(t => {
          const Icon = t.icon;
          const isActiveTab = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                backgroundColor: isActiveTab ? '#EFF6FF' : 'transparent',
                color: isActiveTab ? '#2563EB' : '#64748B',
                border: 'none',
                borderBottom: isActiveTab ? '3px solid #2563EB' : '3px solid transparent',
                padding: '0.75rem 1.25rem',
                fontWeight: isActiveTab ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '8px 8px 0 0',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon style={{ color: isActiveTab ? '#2563EB' : '#94A3B8' }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: THIẾT KẾ TRƯỜNG DỮ LIỆU (ENTERPRISE FIELD PALETTE & CANVAS)       */}
      {/* ========================================================================= */}
      {activeTab === 'fields' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: 6-CATEGORY FIELD PALETTE (ACCORDION)            */}
          {/* ------------------------------------------------------------- */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '1.2rem',
            boxShadow: '0 4px 18px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            position: 'sticky',
            top: '80px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaLayerGroup style={{ color: '#2563EB' }} /> Bảng Công Cụ Thêm Trường
              </div>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '800' }}>
                28 loại
              </span>
            </div>

            {/* Quick Search in Palette */}
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', top: '50%', left: '0.65rem', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.75rem' }} />
              <input
                type="text"
                placeholder="Tìm nhanh loại trường..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.65rem 0.4rem 1.9rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.78rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 6 Category Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {FIELD_CATEGORIES.map(cat => {
                const isOpen = openCategories.has(cat.id);
                const matchingFields = cat.fields.filter(f => 
                  !paletteSearch || f.label.toLowerCase().includes(paletteSearch.toLowerCase()) || f.type.includes(paletteSearch.toLowerCase())
                );

                if (paletteSearch && matchingFields.length === 0) return null;

                const CatIcon = cat.icon;

                return (
                  <div key={cat.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                    {/* Category Header */}
                    <div
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        backgroundColor: '#F8FAFC',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderBottom: isOpen ? '1px solid #E2E8F0' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59' }}>
                        <CatIcon style={{ color: cat.badgeColor }} />
                        <span>{cat.name.split('(')[0]}</span>
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {/* Category Field Buttons */}
                    {isOpen && (
                      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF' }}>
                        {matchingFields.map(f => {
                          const FieldIcon = f.icon;
                          return (
                            <button
                              key={f.type}
                              type="button"
                              onClick={() => handleAddField(f)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '8px',
                                border: '1px solid #F1F5F9',
                                backgroundColor: f.type === 'staff_selector' ? '#EFF6FF' : '#FAFAFA',
                                color: f.type === 'staff_selector' ? '#1E40AF' : '#1E293B',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#EFF6FF';
                                e.currentTarget.style.borderColor = '#BFDBFE';
                                e.currentTarget.style.color = '#2563EB';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = f.type === 'staff_selector' ? '#EFF6FF' : '#FAFAFA';
                                e.currentTarget.style.borderColor = '#F1F5F9';
                                e.currentTarget.style.color = f.type === 'staff_selector' ? '#1E40AF' : '#1E293B';
                              }}
                              title={`Bấm để thêm trường ${f.label} vào form`}
                            >
                              <FieldIcon style={{ color: f.type === 'staff_selector' ? '#2563EB' : cat.badgeColor, fontSize: '0.9rem', flexShrink: 0 }} />
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</span>
                              <FaPlus style={{ fontSize: '0.65rem', color: '#94A3B8' }} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: MAIN FORM CANVAS & DRAGGABLE FIELD CARDS       */}
          {/* ------------------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Canvas Header Bar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '0.85rem 1.4rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                🖐️ <strong>Kéo thả biểu tượng</strong> để đổi vị trí • Bấm <strong>"⚙️ Cấu hình"</strong> để chỉnh sửa thuộc tính chi tiết.
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FaEye /> Xem Trước Bố Cục (Modal)
              </button>
            </div>

            {/* List of Draggable Field Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {fields.map((field, idx) => {
                const meta = getFieldMeta(field.type);
                const FieldIcon = meta.icon;
                const isSelected = editingFieldIndex === idx;
                const isSection = field.type === 'section';
                const isStaff = field.type === 'staff_selector';

                return (
                  <div
                    key={field.id || idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    style={{
                      backgroundColor: isSelected ? '#F0F9FF' : isStaff ? '#F8FAFF' : isSection ? '#F8FAFC' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#2563EB' : isSection ? '#BFDBFE' : '#E2E8F0'}`,
                      borderLeft: `6px solid ${isSelected ? '#2563EB' : isStaff ? '#0284C7' : isSection ? '#1D4ED8' : themeColor}`,
                      borderRadius: '16px',
                      padding: '1.1rem 1.4rem',
                      boxShadow: isSelected ? '0 8px 25px rgba(37, 99, 235, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setEditingFieldIndex(idx)}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ cursor: 'grab', color: '#94A3B8', fontSize: '1.1rem' }} title="Kéo thả để sắp xếp">
                          <FaGripVertical />
                        </div>
                        <span style={{
                          backgroundColor: isStaff ? '#E0F2FE' : '#EFF6FF',
                          color: isStaff ? '#0369A1' : '#1D4ED8',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <FieldIcon /> #{idx + 1} • {meta.label}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#64748B', fontWeight: '700' }}>
                          {'{' + field.key + '}'}
                        </span>
                        {field.required && (
                          <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.1rem 0.45rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900' }}>
                            Bắt buộc *
                          </span>
                        )}
                        {isStaff && (
                          <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.45rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                            {field.staffRole === 'doctor' ? '🩺 Chỉ Bác sĩ' : field.staffRole === 'nurse' ? '💉 Chỉ Điều dưỡng' : '👥 Toàn bộ chức danh'}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setEditingFieldIndex(idx)}
                          style={{
                            backgroundColor: isSelected ? '#2563EB' : '#F8FAFC',
                            color: isSelected ? '#FFFFFF' : '#0F2C59',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <FaCog /> Cấu hình
                        </button>

                        <button
                          type="button"
                          onClick={() => moveField(idx, 'up')}
                          disabled={idx === 0}
                          style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                          title="Lên"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'down')}
                          disabled={idx === fields.length - 1}
                          style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: idx === fields.length - 1 ? 'not-allowed' : 'pointer' }}
                          title="Xuống"
                        >
                          <FaArrowDown />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateField(idx)}
                          style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#2563EB' }}
                          title="Nhân bản"
                        >
                          <FaCopy />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#DC2626' }}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Field Content Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F2C59' }}>
                          {field.label}
                        </div>
                        {field.placeholder && (
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>
                            Gợi ý: "{field.placeholder}"
                          </div>
                        )}
                      </div>

                      {/* Width Badge */}
                      <span style={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        Độ rộng: {field.gridWidth || '50%'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: THÔNG TIN CHUNG & GIAO DIỆN                                        */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                TÊN BIỂU MẪU (TITLE) *
              </label>
              <input
                type="text"
                placeholder="VD: Phiếu Khám Sức Khỏe Định Kỳ..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing && !code) setCode(slugify(e.target.value));
                }}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.92rem', fontWeight: '700', color: '#0F2C59', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                MÃ ĐỊNH DANH SLUG (CODE) *
              </label>
              <input
                type="text"
                placeholder="VD: ksk_2026..."
                value={code}
                onChange={(e) => setCode(slugify(e.target.value))}
                disabled={isEditing}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: '700', color: isEditing ? '#64748B' : '#2563EB', backgroundColor: isEditing ? '#F8FAFC' : '#FFFFFF', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
              MÔ TẢ BIỂU MẪU & HƯỚNG DẪN
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả mục đích và hướng dẫn các khoa phòng điền thông tin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                MÀU SẮC CHỦ ĐẠO (THEME COLOR)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.color}
                    type="button"
                    onClick={() => setThemeColor(opt.color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: opt.color,
                      border: themeColor === opt.color ? '3px solid #0F2C59' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                    title={opt.label}
                  >
                    {themeColor === opt.color && <FaCheck size={12} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                TRẠNG THÁI KÍCH HOẠT
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem 0' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F2C59' }}>
                  Kích hoạt biểu mẫu này trên toàn hệ thống
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PHÂN QUYỀN TRUY CẬP                                                */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                Quy Tắc Phân Quyền Truy Cập & Nhập Liệu
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                Chỉ định chính xác tài khoản cá nhân, khoa phòng, hoặc toàn viện được phép truy cập
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPermissions([...permissions, { target_type: 'user', target_value: availableAccounts[0]?.username || 'Khnv', permission: 'edit' }])}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 1rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FaPlus /> Thêm Quy Tắc
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {permissions.map((perm, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <select
                  value={perm.target_type}
                  onChange={(e) => {
                    const updated = [...permissions];
                    updated[pIdx].target_type = e.target.value;
                    if (e.target.value === 'all') updated[pIdx].target_value = 'all';
                    else if (e.target.value === 'user') updated[pIdx].target_value = availableAccounts[0]?.username || 'Khnv';
                    else if (e.target.value === 'role') updated[pIdx].target_value = 'personal';
                    setPermissions(updated);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700' }}
                >
                  <option value="all">🌐 Toàn Viện (Tất cả tài khoản)</option>
                  <option value="user">👤 Chọn Cụ Thể Từng Tài Khoản</option>
                  <option value="role">👥 Nhóm Tài Khoản Cá Nhân / Mở Rộng</option>
                </select>

                {perm.target_type === 'user' && (
                  <select
                    value={perm.target_value}
                    onChange={(e) => {
                      const updated = [...permissions];
                      updated[pIdx].target_value = e.target.value;
                      setPermissions(updated);
                    }}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700' }}
                  >
                    {availableAccounts.map(acc => (
                      <option key={acc.id} value={acc.username}>
                        {acc.name} (@{acc.username}) — {acc.dept}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (permissions.length <= 1) {
                      alert('Cần có ít nhất 1 quy tắc.');
                      return;
                    }
                    setPermissions(permissions.filter((_, i) => i !== pIdx));
                  }}
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: 'pointer' }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIELD SETTINGS DRAWER / SLIDE-OVER MODAL                                  */}
      {/* ========================================================================= */}
      {editingField && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setEditingFieldIndex(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '580px',
              height: '100vh',
              backgroundColor: '#FFFFFF',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideLeft 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
              padding: '1.25rem 1.6rem',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                  CẤU HÌNH THUỘC TÍNH CHI TIẾT
                </span>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.2rem', fontWeight: '900' }}>
                  {editingField.label || 'Trường dữ liệu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFieldIndex(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div style={{ padding: '1.6rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Label & Slug */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                  TIÊU ĐỀ HIỂN THỊ (LABEL) *
                </label>
                <input
                  type="text"
                  value={editingField.label || ''}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    updateFieldProp(editingFieldIndex, 'label', newLabel);
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                  MÃ BIẾN NỘI BỘ (FIELD KEY / SLUG) *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingField.key || ''}
                    onChange={(e) => updateFieldProp(editingFieldIndex, 'key', slugify(e.target.value))}
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: '700', color: '#2563EB', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => updateFieldProp(editingFieldIndex, 'key', slugify(editingField.label))}
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.6rem 0.85rem', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    title="Tự động tạo mã từ tên nhãn"
                  >
                    Tạo Slug
                  </button>
                </div>
              </div>

              {/* 2. Grid Width Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                  ĐỘ RỘNG HIỂN THỊ (GRID WIDTH)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                  {[
                    { width: '100%', label: '100% (Toàn dòng)' },
                    { width: '75%', label: '75% (3/4)' },
                    { width: '50%', label: '50% (Nửa dòng)' },
                    { width: '33.33%', label: '33% (1/3)' },
                    { width: '25%', label: '25% (1/4)' }
                  ].map(w => (
                    <button
                      key={w.width}
                      type="button"
                      onClick={() => updateFieldProp(editingFieldIndex, 'gridWidth', w.width)}
                      style={{
                        backgroundColor: editingField.gridWidth === w.width ? '#0F2C59' : '#F8FAFC',
                        color: editingField.gridWidth === w.width ? '#FFFFFF' : '#334155',
                        border: `1.5px solid ${editingField.gridWidth === w.width ? '#0F2C59' : '#CBD5E1'}`,
                        borderRadius: '8px',
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {w.width}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. STAFF SELECTOR SPECIAL CONFIG */}
              {editingField.type === 'staff_selector' && (
                <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '14px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaUserMd /> CẤU HÌNH BỘ LỌC NHÂN SỰ (BÁC SĨ / ĐIỀU DƯỠNG)
                  </div>

                  {/* Staff Scope */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.3rem' }}>
                      1. PHẠM VI LỌC NHÂN SỰ (STAFF SCOPE)
                    </label>
                    <select
                      value={editingField.staffScope || 'all'}
                      onChange={(e) => updateFieldProp(editingFieldIndex, 'staffScope', e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #93C5FD', fontSize: '0.84rem', fontWeight: '700', color: '#0F2C59', outline: 'none' }}
                    >
                      <option value="all">🌐 Toàn Viện (Tất cả nhân sự bệnh viện)</option>
                      <option value="current_dept">🏥 Theo Khoa / Phòng của người đang nộp form</option>
                      <option value="specific_dept">🏢 Theo Khoa / Phòng chỉ định cụ thể</option>
                    </select>
                  </div>

                  {/* Specific Department Dropdown */}
                  {editingField.staffScope === 'specific_dept' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.3rem' }}>
                        CHỌN KHOA / PHÒNG CHỈ ĐỊNH:
                      </label>
                      <select
                        value={editingField.specificDept || 'lck'}
                        onChange={(e) => updateFieldProp(editingFieldIndex, 'specificDept', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #93C5FD', fontSize: '0.84rem', fontWeight: '700' }}
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Staff Role Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.3rem' }}>
                      2. LỌC THEO CHỨC DANH (STAFF ROLE)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                      {[
                        { role: 'all', label: '👥 Tất cả' },
                        { role: 'doctor', label: '🩺 Chỉ Bác sĩ' },
                        { role: 'nurse', label: '💉 Chỉ ĐD / KTV' }
                      ].map(r => (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => updateFieldProp(editingFieldIndex, 'staffRole', r.role)}
                          style={{
                            backgroundColor: editingField.staffRole === r.role ? '#1E40AF' : '#FFFFFF',
                            color: editingField.staffRole === r.role ? '#FFFFFF' : '#1E3A8A',
                            border: `1px solid ${editingField.staffRole === r.role ? '#1E40AF' : '#93C5FD'}`,
                            borderRadius: '8px',
                            padding: '0.4rem 0.2rem',
                            fontSize: '0.76rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selection Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.3rem' }}>
                      3. CHẾ ĐỘ CHỌN (SELECTION MODE)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => updateFieldProp(editingFieldIndex, 'selectionMode', 'single')}
                        style={{
                          backgroundColor: (editingField.selectionMode || 'single') === 'single' ? '#1E40AF' : '#FFFFFF',
                          color: (editingField.selectionMode || 'single') === 'single' ? '#FFFFFF' : '#1E3A8A',
                          border: `1px solid ${(editingField.selectionMode || 'single') === 'single' ? '#1E40AF' : '#93C5FD'}`,
                          borderRadius: '8px',
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        👤 Chọn 1 người (Single)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFieldProp(editingFieldIndex, 'selectionMode', 'multiple')}
                        style={{
                          backgroundColor: editingField.selectionMode === 'multiple' ? '#1E40AF' : '#FFFFFF',
                          color: editingField.selectionMode === 'multiple' ? '#FFFFFF' : '#1E3A8A',
                          border: `1px solid ${editingField.selectionMode === 'multiple' ? '#1E40AF' : '#93C5FD'}`,
                          borderRadius: '8px',
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        👥 Chọn nhiều người (Tags)
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* 4. Placeholder & Help text */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                  VĂN BẢN GỢI Ý (PLACEHOLDER)
                </label>
                <input
                  type="text"
                  value={editingField.placeholder || ''}
                  onChange={(e) => updateFieldProp(editingFieldIndex, 'placeholder', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                  HƯỚNG DẪN PHỤ (HELP TEXT)
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú nhỏ hướng dẫn phía dưới ô nhập..."
                  value={editingField.helpText || ''}
                  onChange={(e) => updateFieldProp(editingFieldIndex, 'helpText', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* 5. Constraints (Required / Readonly) */}
              <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingField.required)}
                    onChange={(e) => updateFieldProp(editingFieldIndex, 'required', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#EF4444', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59' }}>Bắt buộc nhập (*)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingField.readOnly)}
                    onChange={(e) => updateFieldProp(editingFieldIndex, 'readOnly', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59' }}>Chỉ đọc (Read-only)</span>
                </label>
              </div>

              {/* 6. Options Manager */}
              {['select', 'multi_select', 'radio', 'multi_checkbox'].includes(editingField.type) && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1.5px solid #CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F2C59' }}>
                      DANH SÁCH CÁC TÙY CHỌN (OPTIONS)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const opts = editingField.options || [];
                        updateFieldProp(editingFieldIndex, 'options', [...opts, `Tùy chọn ${opts.length + 1}`]);
                      }}
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      <FaPlus /> Thêm mục
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {(editingField.options || []).map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', width: '20px' }}>#{oIdx + 1}</span>
                        <input
                          type="text"
                          value={typeof opt === 'string' ? opt : (opt.label || '')}
                          onChange={(e) => {
                            const opts = [...(editingField.options || [])];
                            opts[oIdx] = e.target.value;
                            updateFieldProp(editingFieldIndex, 'options', opts);
                          }}
                          style={{ flex: 1, padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const opts = (editingField.options || []).filter((_, i) => i !== oIdx);
                            updateFieldProp(editingFieldIndex, 'options', opts);
                          }}
                          style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '0.4rem 0.55rem', cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Formula */}
              {editingField.type === 'formula' && (
                <div style={{ backgroundColor: '#F5F3FF', padding: '1rem', borderRadius: '14px', border: '1.5px solid #DDD6FE' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '900', color: '#6B21A8', marginBottom: '0.35rem' }}>
                    BIỂU THỨC CÔNG THỨC (FORMULA)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: {so_luong} * {don_gia}"
                    value={editingField.formula || ''}
                    onChange={(e) => updateFieldProp(editingFieldIndex, 'formula', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #C4B5FD', fontSize: '0.86rem', fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {fields.filter(f => f.key !== editingField.key && f.type === 'number').map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                          const curr = editingField.formula || '';
                          updateFieldProp(editingFieldIndex, 'formula', `${curr} {${f.key}} `);
                        }}
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid #C4B5FD', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.74rem', fontWeight: '800', color: '#6B21A8', cursor: 'pointer' }}
                      >
                        {'+{' + f.key + '}'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Callout */}
              {editingField.type === 'callout' && (
                <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '14px', border: '1.5px solid #FDE68A' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '900', color: '#92400E', marginBottom: '0.35rem' }}>
                    KIỂU CẢNH BÁO (CALLOUT TYPE)
                  </label>
                  <select
                    value={editingField.calloutType || 'info'}
                    onChange={(e) => updateFieldProp(editingFieldIndex, 'calloutType', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: '700' }}
                  >
                    <option value="info">ℹ️ Thông tin hướng dẫn (Xanh lam)</option>
                    <option value="warning">⚠️ Lưu ý cảnh báo (Vàng hổ phách)</option>
                    <option value="success">✅ Thành công / Chuẩn y tế (Xanh lá)</option>
                    <option value="danger">🚨 Nguy hiểm / Cấp cứu (Đỏ)</option>
                  </select>
                </div>
              )}

              {/* 9. Sub-table columns */}
              {editingField.type === 'table' && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1.5px solid #CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F2C59' }}>
                      CỘT CỦA BẢNG CON (SUB-TABLE COLUMNS)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cols = editingField.columns || [];
                        const newCol = { id: `c_${Date.now()}`, key: `col_${cols.length + 1}`, label: `Cột ${cols.length + 1}`, type: 'text' };
                        updateFieldProp(editingFieldIndex, 'columns', [...cols, newCol]);
                      }}
                      style={{ backgroundColor: '#0D9488', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      <FaPlus /> Thêm cột
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(editingField.columns || []).map((col, cIdx) => (
                      <div key={col.id || cIdx} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Tên cột"
                          value={col.label || ''}
                          onChange={(e) => {
                            const cols = [...(editingField.columns || [])];
                            cols[cIdx] = { ...cols[cIdx], label: e.target.value, key: slugify(e.target.value) };
                            updateFieldProp(editingFieldIndex, 'columns', cols);
                          }}
                          style={{ flex: 1, padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                        <select
                          value={col.type || 'text'}
                          onChange={(e) => {
                            const cols = [...(editingField.columns || [])];
                            cols[cIdx] = { ...cols[cIdx], type: e.target.value };
                            updateFieldProp(editingFieldIndex, 'columns', cols);
                          }}
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                        >
                          <option value="text">Chữ</option>
                          <option value="number">Số</option>
                          <option value="date">Ngày</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const cols = (editingField.columns || []).filter((_, i) => i !== cIdx);
                            updateFieldProp(editingFieldIndex, 'columns', cols);
                          }}
                          style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '0.4rem 0.55rem', cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1.25rem 1.6rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => setEditingFieldIndex(null)}
                style={{
                  backgroundColor: '#0F2C59',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.6rem',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 44, 89, 0.25)'
                }}
              >
                <FaCheck /> Hoàn Tất Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN LIVE PREVIEW MODAL (POPUP RESPONSIVE DEVICE SWITCHER)          */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {/* Top Preview Toolbar */}
          <div style={{
            width: '100%',
            maxWidth: previewDevice === 'mobile' ? '460px' : '960px',
            backgroundColor: '#0F2C59',
            borderRadius: '16px',
            padding: '0.75rem 1.4rem',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            transition: 'max-width 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: '900' }}>
                LIVE PREVIEW: {title || 'Biểu Mẫu'}
              </div>
            </div>

            {/* Device Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '3px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    backgroundColor: previewDevice === 'desktop' ? '#2563EB' : 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FaDesktop /> Màn Hình Máy Tính
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    backgroundColor: previewDevice === 'mobile' ? '#2563EB' : 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FaMobileAlt /> Điện Thoại / Tablet
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <FaTimes /> Đóng (Esc)
              </button>
            </div>
          </div>

          {/* Interactive Live Form Container */}
          <div style={{
            width: '100%',
            maxWidth: previewDevice === 'mobile' ? '460px' : '960px',
            transition: 'max-width 0.3s ease',
            marginBottom: '3rem'
          }}>
            <DynamicFormRenderer
              formCode={code}
              initialMeta={{
                title: title || 'Biểu Mẫu Xem Trước',
                code: code || 'preview_code',
                description: description || 'Mô tả xem trước giao diện thực tế.',
                theme_color: themeColor,
                schema_json: fields
              }}
              onBack={() => setShowPreviewModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomFormBuilder;
