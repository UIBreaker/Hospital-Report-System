import React, { useState, useEffect } from 'react';
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
  FaUserShield,
  FaLayerGroup
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import systemUserService from '../../../services/systemUserService';

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

const HEADER_ICONS = [
  { key: 'form', label: 'Biểu mẫu', icon: FaWpforms },
  { key: 'notes', label: 'Hồ sơ bệnh án', icon: FaNotesMedical },
  { key: 'heart', label: 'Sinh hiệu', icon: FaHeartbeat },
  { key: 'stethoscope', label: 'Khám bệnh', icon: FaStethoscope },
  { key: 'doctor', label: 'Bác sĩ', icon: FaUserMd },
  { key: 'hospital', label: 'Bệnh viện', icon: FaHospital },
  { key: 'shield', label: 'Bảo mật', icon: FaShieldAlt },
  { key: 'ambulance', label: 'Cấp cứu', icon: FaAmbulance },
  { key: 'procedures', label: 'Điều trị', icon: FaProcedures },
  { key: 'chart', label: 'Thống kê', icon: FaChartLine }
];

const FIELD_TYPES = [
  { type: 'text', label: 'Văn bản ngắn', icon: FaFont, defaultWidth: '50%' },
  { type: 'textarea', label: 'Ghi chú nhiều dòng', icon: FaFont, defaultWidth: '100%' },
  { type: 'number', label: 'Số lượng / Chỉ số', icon: FaSortNumericDown, defaultWidth: '50%' },
  { type: 'date', label: 'Ngày tháng', icon: FaCalendarAlt, defaultWidth: '50%' },
  { type: 'time', label: 'Thời gian (Giờ:Phút)', icon: FaClock, defaultWidth: '50%' },
  { type: 'select', label: 'Danh sách chọn (Dropdown)', icon: FaListUl, defaultWidth: '50%' },
  { type: 'checkbox', label: 'Hộp kiểm (Checkbox)', icon: FaCheckSquare, defaultWidth: '50%' },
  { type: 'table', label: 'Bảng con lồng nhau (Sub-table)', icon: FaTable, defaultWidth: '100%' },
  { type: 'section', label: 'Tiêu đề phân đoạn (Section)', icon: FaHeading, defaultWidth: '100%' }
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

const CustomFormBuilder = ({ initialForm, onCancel, onSaved }) => {
  const isEditing = Boolean(initialForm?.id);

  // Tab State: 'general' | 'fields' | 'tracker' | 'permissions'
  const [activeTab, setActiveTab] = useState('general');

  // Form Basic Info (Enhanced Customization)
  const [code, setCode] = useState(initialForm?.code || '');
  const [title, setTitle] = useState(initialForm?.title || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [formType, setFormType] = useState(initialForm?.form_type || 'input');
  const [themeColor, setThemeColor] = useState(initialForm?.theme_color || '#2563EB');
  const [headerIcon, setHeaderIcon] = useState(initialForm?.header_icon || 'form');
  const [density, setDensity] = useState(initialForm?.density || 'normal'); // 'compact' | 'normal' | 'spacious'
  const [cardStyle, setCardStyle] = useState(initialForm?.card_style || 'rounded'); // 'rounded' | 'shadow' | 'left_accent'
  const [isActive, setIsActive] = useState(initialForm?.is_active !== undefined ? Boolean(initialForm.is_active) : true);

  // Fields Array with Drag & Drop
  const [fields, setFields] = useState(() => {
    if (Array.isArray(initialForm?.schema_json) && initialForm.schema_json.length > 0) {
      return initialForm.schema_json;
    }
    return [
      { id: 'f_1', key: 'ghi_chu_tong_hop', label: 'Ghi chú tổng hợp ca trực', type: 'textarea', required: false, gridWidth: '100%', placeholder: 'Nhập nội dung ghi chú...' }
    ];
  });

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showLiveGridPreview, setShowLiveGridPreview] = useState(true);

  // Tracker Config (3 robust sources)
  const [trackerSource, setTrackerSource] = useState(initialForm?.tracker_config?.source || 'overtime_staff');
  const [refreshInterval, setRefreshInterval] = useState(initialForm?.tracker_config?.refresh_interval || 'realtime');

  // Permissions Array
  const [permissions, setPermissions] = useState(() => {
    if (Array.isArray(initialForm?.permissions) && initialForm.permissions.length > 0) {
      return initialForm.permissions;
    }
    return [{ target_type: 'all', target_value: 'all', permission: 'edit' }];
  });

  // Accounts List for User-Specific Permissions
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Accounts for user-specific permissions
  useEffect(() => {
    const loadAllAccounts = async () => {
      setLoadingAccounts(true);
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
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAllAccounts();
  }, []);

  // Auto-generate slug from title if new form
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && (!code || code === '')) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s_]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 30);
      setCode(autoSlug);
    }
  };

  // Drag & Drop handlers for field reordering
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
    const [movedField] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedField);
    setFields(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveField = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFields(updated);
  };

  const duplicateField = (index) => {
    const f = fields[index];
    const newField = {
      ...f,
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      key: `${f.key}_copy`,
      label: `${f.label} (Bản sao)`
    };
    const updated = [...fields];
    updated.splice(index + 1, 0, newField);
    setFields(updated);
  };

  // Add Field
  const addField = (type = 'text') => {
    const meta = FIELD_TYPES.find(t => t.type === type) || { defaultWidth: '50%' };
    const newId = `f_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const newField = {
      id: newId,
      key: type === 'section' ? `section_${fields.length + 1}` : `field_${fields.length + 1}`,
      label: type === 'section' ? `PHÂN ĐOẠN ${fields.length + 1}` : `Trường nhập liệu ${fields.length + 1}`,
      type,
      required: type !== 'section' && false,
      gridWidth: meta.defaultWidth,
      placeholder: '',
      helpText: '',
      options: type === 'select' ? ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3'] : undefined,
      columns: type === 'table' ? [
        { id: 'c1', key: 'col_1', label: 'Cột 1', type: 'text' },
        { id: 'c2', key: 'col_2', label: 'Cột 2', type: 'text' }
      ] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateFieldProp = (index, prop, val) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [prop]: val };
    setFields(updated);
  };

  const removeField = (index) => {
    if (fields.length <= 1) {
      alert('Biểu mẫu cần có ít nhất 1 trường dữ liệu.');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  // Sub-table columns helper
  const addTableColumn = (fieldIndex) => {
    const field = fields[fieldIndex];
    const cols = field.columns || [];
    const newCol = {
      id: `c_${Date.now()}_${cols.length + 1}`,
      key: `col_${cols.length + 1}`,
      label: `Cột ${cols.length + 1}`,
      type: 'text'
    };
    updateFieldProp(fieldIndex, 'columns', [...cols, newCol]);
  };

  const removeTableColumn = (fieldIndex, colIndex) => {
    const field = fields[fieldIndex];
    const cols = (field.columns || []).filter((_, i) => i !== colIndex);
    updateFieldProp(fieldIndex, 'columns', cols);
  };

  const updateTableColumn = (fieldIndex, colIndex, prop, val) => {
    const field = fields[fieldIndex];
    const cols = [...(field.columns || [])];
    cols[colIndex] = { ...cols[colIndex], [prop]: val };
    updateFieldProp(fieldIndex, 'columns', cols);
  };

  // Permissions helpers
  const addPermission = () => {
    setPermissions([...permissions, { target_type: 'department', target_value: 'lck', permission: 'edit' }]);
  };

  const updatePermission = (index, prop, val) => {
    const updated = [...permissions];
    updated[index] = { ...updated[index], [prop]: val };
    if (prop === 'target_type') {
      if (val === 'all') updated[index].target_value = 'all';
      else if (val === 'department') updated[index].target_value = 'lck';
      else if (val === 'role') updated[index].target_value = 'staff';
      else if (val === 'user') updated[index].target_value = availableAccounts[0]?.username || 'Khnv';
    }
    setPermissions(updated);
  };

  const removePermission = (index) => {
    if (permissions.length <= 1) {
      alert('Cần có ít nhất 1 quy tắc phân quyền truy cập.');
      return;
    }
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  // Submit Save Form
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

    if (fields.length === 0 && formType === 'input') {
      setErrorMsg('Vui lòng thêm ít nhất 1 trường dữ liệu cho biểu mẫu nhập liệu.');
      setActiveTab('fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: code.trim(),
        title: title.trim(),
        description: description.trim(),
        form_type: formType,
        theme_color: themeColor,
        header_icon: headerIcon,
        density,
        card_style: cardStyle,
        is_active: isActive,
        schema_json: fields,
        tracker_config: {
          source: trackerSource,
          refresh_interval: refreshInterval
        },
        permissions
      };

      if (isEditing) {
        await customFormService.updateForm(initialForm.id, payload);
      } else {
        await customFormService.createForm(payload);
      }

      if (onSaved) onSaved();
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Lỗi khi lưu biểu mẫu.'));
    } finally {
      setSaving(false);
    }
  };

  const selectedThemeObj = THEME_OPTIONS.find(t => t.color === themeColor) || THEME_OPTIONS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Action Ribbon */}
      <div style={{
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.1rem 1.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaWpforms style={{ color: '#38BDF8' }} />
              {isEditing ? `Chỉnh Sửa Biểu Mẫu: ${initialForm.title}` : 'Thiết Kế Biểu Mẫu Mới (Dynamic Form Builder)'}
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#93C5FD' }}>
              Tùy biến trường dữ liệu kéo thả, cấu hình Data Tracker tự động và phân quyền truy cập chi tiết.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9px',
              padding: '0.55rem 1.1rem',
              fontWeight: '700',
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              padding: '0.55rem 1.4rem',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> Lưu Cấu Hình Form</>}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {Boolean(errorMsg) && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #FECACA',
          color: '#DC2626',
          padding: '0.85rem 1.2rem',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '0.88rem'
        }}>
          ⚠️ {typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi biểu mẫu')}
        </div>
      )}

      {/* Main Tab Bar Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px 14px 0 0',
        padding: '0.5rem 1rem 0 1rem',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'general', label: '1. Thông tin chung & Giao diện', icon: FaPalette },
          { key: 'fields', label: `2. Thiết kế trường dữ liệu (${fields.length})`, icon: FaListUl },
          { key: 'tracker', label: '3. Widget Data Tracker', icon: FaChartLine },
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
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon style={{ color: isActiveTab ? '#2563EB' : '#94A3B8' }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0 0 16px 16px',
        border: '1px solid #E2E8F0',
        borderTop: 'none',
        padding: '1.6rem 1.8rem',
        boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)'
      }}>

        {/* ========================================================================= */}
        {/* TAB 1: THÔNG TIN CHUNG & TÙY BIẾN GIAO DIỆN CAO CẤP */}
        {/* ========================================================================= */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  TÊN BIỂU MẪU (TITLE) *
                </label>
                <input
                  type="text"
                  placeholder="VD: Phiếu Khám Sức Khỏe Định Kỳ 2026..."
                  value={title}
                  onChange={handleTitleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  MÃ ĐỊNH DANH SLUG (CODE) *
                </label>
                <input
                  type="text"
                  placeholder="VD: ksk_2026, kham_benh_ngoai_vien..."
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  disabled={isEditing}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    color: isEditing ? '#64748B' : '#2563EB',
                    backgroundColor: isEditing ? '#F8FAFC' : '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                MÔ TẢ & HƯỚNG DẪN NHẬP LIỆU (BANNER SUBTITLE)
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả mục đích và hướng dẫn các khoa phòng điền thông tin biểu mẫu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.88rem',
                  color: '#334155',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Form Type & Visual Customization */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  KIỂU BIỂU MẪU (FORM TYPE)
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    color: '#0F2C59',
                    outline: 'none'
                  }}
                >
                  <option value="input">📝 Form Nhập Liệu Báo Cáo (Input Form)</option>
                  <option value="tracker">📊 Form Theo Dõi Số Liệu Tự Động (Data Tracker Widget)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  MÀU SẮC CHỦ ĐẠO (THEME COLOR)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                        boxShadow: themeColor === opt.color ? '0 0 0 2px #38BDF8' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                      title={opt.label}
                    >
                      {themeColor === opt.color && <FaCheckCircle size={14} />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer', background: 'none' }}
                    title="Chọn màu tùy biến khác"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Header Icon & Layout Density */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  BIỂU TƯỢNG TIÊU ĐỀ (HEADER ICON)
                </label>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {HEADER_ICONS.map(ic => {
                    const IconComp = ic.icon;
                    const isSelected = headerIcon === ic.key;
                    return (
                      <button
                        key={ic.key}
                        type="button"
                        onClick={() => setHeaderIcon(ic.key)}
                        style={{
                          backgroundColor: isSelected ? themeColor : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          border: `1.5px solid ${isSelected ? themeColor : '#CBD5E1'}`,
                          borderRadius: '8px',
                          padding: '0.45rem 0.65rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: isSelected ? '700' : '600'
                        }}
                        title={ic.label}
                      >
                        <IconComp />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  MẬT ĐỘ BỐ CỤC (DENSITY)
                </label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    color: '#0F2C59',
                    outline: 'none'
                  }}
                >
                  <option value="compact">Gọn gàng (Compact - Thích hợp form nhiều chỉ số)</option>
                  <option value="normal">Tiêu chuẩn (Standard - Cân đối y tế)</option>
                  <option value="spacious">Rộng rãi (Spacious - Chữ to, thoáng)</option>
                </select>
              </div>
            </div>

            {/* Active Toggle */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <label htmlFor="activeToggle" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F2C59', cursor: 'pointer' }}>
                Kích hoạt biểu mẫu này (Cho phép các khoa phòng và tài khoản được phân quyền nhìn thấy và nhập dữ liệu)
              </label>
            </div>

            {/* Realtime Live Preview Box */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                👁️ XEM TRƯỚC GIAO DIỆN HEADER (LIVE PREVIEW)
              </div>
              <div style={{
                backgroundColor: selectedThemeObj.bg,
                border: `2px solid ${selectedThemeObj.border}`,
                borderLeft: `8px solid ${themeColor}`,
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: themeColor,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}>
                    {(() => {
                      const FoundIcon = HEADER_ICONS.find(i => i.key === headerIcon)?.icon || FaWpforms;
                      return <FoundIcon />;
                    })()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0F2C59' }}>
                      {title || 'Tiêu Đề Biểu Mẫu Mẫu'}
                    </h3>
                    <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: themeColor, fontWeight: '800' }}>
                      MÃ BIỂU MẪU: /{code || 'slug_code'}
                    </div>
                  </div>
                </div>
                {description && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: THIẾT KẾ TRƯỜNG DỮ LIỆU (DRAG & DROP + VISUAL GRID POSITIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'fields' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Toolbar Buttons for Adding Field Types */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.55rem' }}>
                ➕ THÊM TRƯỜNG DỮ LIỆU MỚI (BẤM VÀO ĐỂ THÊM VÀO FORM):
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {FIELD_TYPES.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <button
                      key={ft.type}
                      type="button"
                      onClick={() => addField(ft.type)}
                      style={{
                        backgroundColor: ft.type === 'section' ? '#EFF6FF' : '#F8FAFC',
                        color: ft.type === 'section' ? '#1D4ED8' : '#334155',
                        border: `1.5px solid ${ft.type === 'section' ? '#93C5FD' : '#E2E8F0'}`,
                        borderRadius: '9px',
                        padding: '0.45rem 0.8rem',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = ft.type === 'section' ? '#93C5FD' : '#E2E8F0'}
                    >
                      <Icon style={{ color: ft.type === 'section' ? '#2563EB' : '#64748B' }} />
                      + {ft.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reorder and Preview Control Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              color: '#475569'
            }}>
              <div>
                🖐️ <strong>Kéo & thả biểu tượng bên trái</strong> hoặc dùng nút ▲ / ▼ để sắp xếp thứ tự các trường.
              </div>
              <button
                type="button"
                onClick={() => setShowLiveGridPreview(!showLiveGridPreview)}
                style={{
                  backgroundColor: showLiveGridPreview ? '#2563EB' : '#FFFFFF',
                  color: showLiveGridPreview ? '#FFFFFF' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {showLiveGridPreview ? <><FaEye /> Đang hiện Preview Bố Cục</> : <><FaEyeSlash /> Xem Trước Bố Cục Lưới</>}
              </button>
            </div>

            {/* List of Draggable Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {fields.map((field, idx) => {
                const isSection = field.type === 'section';
                const isDragging = draggedIndex === idx;

                return (
                  <div
                    key={field.id || idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: isSection ? '#F8FAFC' : '#FFFFFF',
                      border: `1.5px solid ${isDragging ? '#2563EB' : isSection ? '#BFDBFE' : '#E2E8F0'}`,
                      borderLeft: `6px solid ${isSection ? '#2563EB' : themeColor}`,
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      opacity: isDragging ? 0.45 : 1,
                      boxShadow: isDragging ? '0 8px 25px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'border 0.15s ease'
                    }}
                  >
                    {/* Header Row of Field Card */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {/* Drag Handle */}
                        <div
                          style={{
                            cursor: 'grab',
                            color: '#94A3B8',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px 4px'
                          }}
                          title="Kéo thả để sắp xếp vị trí"
                        >
                          <FaGripVertical />
                        </div>

                        {/* Order Number & Type Badge */}
                        <span style={{
                          backgroundColor: isSection ? '#DBEAFE' : '#EFF6FF',
                          color: isSection ? '#1E40AF' : '#1D4ED8',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '0.74rem',
                          textTransform: 'uppercase'
                        }}>
                          #{idx + 1} • {FIELD_TYPES.find(t => t.type === field.type)?.label || field.type}
                        </span>
                      </div>

                      {/* Card Action Buttons (Move Up, Move Down, Duplicate, Delete) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'up')}
                          disabled={idx === 0}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            color: idx === 0 ? '#CBD5E1' : '#475569'
                          }}
                          title="Di chuyển lên"
                        >
                          <FaArrowUp />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveField(idx, 'down')}
                          disabled={idx === fields.length - 1}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: idx === fields.length - 1 ? 'not-allowed' : 'pointer',
                            color: idx === fields.length - 1 ? '#CBD5E1' : '#475569'
                          }}
                          title="Di chuyển xuống"
                        >
                          <FaArrowDown />
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateField(idx)}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: '#2563EB'
                          }}
                          title="Nhân bản trường này"
                        >
                          <FaCopy />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: '#DC2626',
                            fontWeight: '700'
                          }}
                          title="Xóa trường này"
                        >
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Inputs Row for Field Configuration */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      {/* Label */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                          Tiêu đề hiển thị (Label) *
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFieldProp(idx, 'label', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            color: '#0F2C59',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Key */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                          Mã trường (Key JSON)
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateFieldProp(idx, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.86rem',
                            fontFamily: 'monospace',
                            color: '#2563EB',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Type Select */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                          Loại dữ liệu
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateFieldProp(idx, 'type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.86rem',
                            color: '#0F2C59',
                            fontWeight: '600'
                          }}
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.type} value={ft.type}>{ft.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Column Grid Width Layout */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                          Độ rộng cột bố cục (Grid Width)
                        </label>
                        <select
                          value={field.gridWidth || '100%'}
                          onChange={(e) => updateFieldProp(idx, 'gridWidth', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.86rem',
                            color: '#0F2C59',
                            fontWeight: '700'
                          }}
                        >
                          <option value="100%">Toàn hàng (100% - 1 Cột)</option>
                          <option value="75%">3/4 Hàng (75%)</option>
                          <option value="50%">Nửa hàng (50% - 2 Cột cạnh nhau)</option>
                          <option value="33.33%">1/3 Hàng (33% - 3 Cột cạnh nhau)</option>
                          <option value="25%">1/4 Hàng (25% - 4 Cột cạnh nhau)</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Options for Select or Table */}
                    {field.type === 'select' && (
                      <div style={{ marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.65rem', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                          Các giá trị lựa chọn (Phân cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          value={Array.isArray(field.options) ? field.options.join(', ') : ''}
                          onChange={(e) => updateFieldProp(idx, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="VD: Bình thường, Nghi ngờ, Bất thường"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    )}

                    {field.type === 'table' && (
                      <div style={{ marginTop: '0.75rem', backgroundColor: '#EFF6FF', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase' }}>
                            Các cột của Bảng con ({field.columns?.length || 0} cột)
                          </span>
                          <button
                            type="button"
                            onClick={() => addTableColumn(idx)}
                            style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            + Thêm Cột
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {(field.columns || []).map((col, cIdx) => (
                            <div key={col.id || cIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#FFFFFF', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                              <input
                                type="text"
                                value={col.label}
                                onChange={(e) => updateTableColumn(idx, cIdx, 'label', e.target.value)}
                                style={{ width: '90px', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.2rem 0.35rem', fontSize: '0.78rem', fontWeight: '700' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeTableColumn(idx, cIdx)}
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.75rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Placeholder & Required Row */}
                    {!isSection && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                        <input
                          type="text"
                          placeholder="Placeholder gợi ý khi nhập..."
                          value={field.placeholder || ''}
                          onChange={(e) => updateFieldProp(idx, 'placeholder', e.target.value)}
                          style={{ width: '60%', padding: '0.35rem 0.55rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: '800', color: '#334155', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(field.required)}
                            onChange={(e) => updateFieldProp(idx, 'required', e.target.checked)}
                            style={{ accentColor: '#DC2626' }}
                          />
                          Bắt buộc điền (Required)
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LIVE GRID LAYOUT PREVIEW */}
            {showLiveGridPreview && (
              <div style={{ marginTop: '1.5rem', backgroundColor: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F2C59', fontWeight: '800', fontSize: '0.9rem' }}>
                  <FaColumns style={{ color: '#2563EB' }} />
                  XEM TRƯỚC BỐ CỤC LƯỚI RESPONSIVE (LIVE GRID PREVIEW)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {fields.map((f, i) => {
                    const widthPercent = f.gridWidth || '100%';
                    if (f.type === 'section') {
                      return (
                        <div key={i} style={{ width: '100%', padding: '0.5rem 0', borderBottom: `2px solid ${themeColor}`, marginTop: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: themeColor, fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase' }}>
                            ❖ {f.label}
                          </h4>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={i}
                        style={{
                          width: `calc(${widthPercent} - 0.75rem)`,
                          minWidth: '220px',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '0.75rem 0.9rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                          {f.label} {f.required && <span style={{ color: '#DC2626' }}>*</span>}
                        </div>
                        <div style={{ height: f.type === 'textarea' ? '60px' : '34px', backgroundColor: '#F1F5F9', borderRadius: '6px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', padding: '0 0.55rem', fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                          {f.placeholder || `[${FIELD_TYPES.find(t => t.type === f.type)?.label || f.type}]`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CẤU HÌNH WIDGET DATA TRACKER (3 NGUỒN TỰ ĐỘNG CHUẨN) */}
        {/* ========================================================================= */}
        {activeTab === 'tracker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: '900', color: '#0F2C59' }}>
                Cấu Hình Nguồn Dữ Liệu Tự Động (Data Tracker Sources)
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
                Hệ thống tự động đồng bộ và hiển thị dữ liệu trực tiếp từ 12 khoa phòng mà không cần người dùng phải nộp tay lại.
              </p>
            </div>

            {/* 3 Interactive Source Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                {
                  id: 'overtime_staff',
                  title: '1. Nhân Sự Trực Tăng Cường & Thêm Giờ',
                  desc: 'Tự động gom danh sách Bác sĩ, Điều dưỡng trực thêm giờ từ trường "overtime_staff" của 12 khoa giao ban.',
                  icon: FaUsers,
                  color: '#2563EB',
                  badge: 'Đang hoạt động tốt'
                },
                {
                  id: 'clinical_cases',
                  title: '2. Thống Kê Tổng Hợp 4 Loại Ca Bệnh',
                  desc: 'Tự động tổng hợp dữ liệu chi tiết của 4 bảng ca bệnh: Bệnh Chuyển Viện, Ca Phẫu Thuật, Ca Tử Vong, Bệnh Nặng Cần Theo Dõi.',
                  icon: FaHospital,
                  color: '#D97706',
                  badge: 'Đã kích hoạt'
                },
                {
                  id: 'examination_metrics',
                  title: '3. Thống Kê Lượt Khám & Điều Trị Toàn Viện',
                  desc: 'Tự động bóc tách số liệu chuyên môn: Tổng số khám, Bệnh cũ, Bệnh mới, Xuất viện, Chuyển viện, Hiện còn, Tử vong từ 12 khoa.',
                  icon: FaChartLine,
                  color: '#059669',
                  badge: 'Đã kích hoạt'
                }
              ].map(src => {
                const Icon = src.icon;
                const isSelected = trackerSource === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setTrackerSource(src.id)}
                    style={{
                      border: `2px solid ${isSelected ? src.color : '#E2E8F0'}`,
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F8FAFF' : '#FFFFFF',
                      boxShadow: isSelected ? `0 6px 20px rgba(37, 99, 235, 0.12)` : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: isSelected ? src.color : '#F1F5F9', color: isSelected ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <Icon />
                      </div>
                      <span style={{ backgroundColor: isSelected ? '#DCFCE7' : '#F1F5F9', color: isSelected ? '#166534' : '#64748B', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                        {src.badge}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.96rem', fontWeight: '900', color: isSelected ? src.color : '#0F2C59' }}>
                      {src.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.45 }}>
                      {src.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Refresh Rate Setting */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem 1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem' }}>
                TẦN SUẤT LÀM MỚI DỮ LIỆU TỰ ĐỘNG (REFRESH INTERVAL)
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                style={{ width: '100%', maxWidth: '380px', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: '700', color: '#0F2C59' }}
              >
                <option value="realtime">Thời gian thực (Mỗi khi có khoa nộp mới)</option>
                <option value="30s">Tự động cập nhật mỗi 30 giây</option>
                <option value="60s">Tự động cập nhật mỗi 1 phút</option>
                <option value="manual">Chỉ cập nhật khi bấm nút Làm mới</option>
              </select>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PHÂN QUYỀN TRUY CẬP (ĐÃ BỎ & NHẬP LIỆU, CHỌN ĐƯỢC CẢ USER MỞ RỘNG) */}
        {/* ========================================================================= */}
        {activeTab === 'permissions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '900', color: '#0F2C59' }}>
                  Phân Quyền Truy Cập
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  Quy định các Khoa/Phòng hoặc Tài khoản cụ thể (bao gồm cả nhân viên mở rộng) được phép truy cập biểu mẫu này.
                </p>
              </div>

              <button
                type="button"
                onClick={addPermission}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.95rem',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <FaPlus /> Thêm Phân Quyền
              </button>
            </div>

            {/* Permission Rules Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {permissions.map((perm, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '0.9rem 1.1rem',
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2fr 1fr auto',
                    gap: '0.75rem',
                    alignItems: 'center'
                  }}
                >
                  {/* Scope Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Phạm vi áp dụng
                    </label>
                    <select
                      value={perm.target_type}
                      onChange={(e) => updatePermission(pIdx, 'target_type', e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700', color: '#0F2C59' }}
                    >
                      <option value="all">🌐 Tất cả tài khoản (Toàn viện)</option>
                      <option value="department">🏢 Theo Khoa / Phòng</option>
                      <option value="role">🛡️ Theo Vai trò hệ thống</option>
                      <option value="user">👤 Tài khoản người dùng cụ thể</option>
                    </select>
                  </div>

                  {/* Target Value Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Đối tượng chỉ định
                    </label>
                    {perm.target_type === 'all' && (
                      <div style={{ padding: '0.45rem 0.65rem', backgroundColor: '#E2E8F0', borderRadius: '8px', fontSize: '0.84rem', fontWeight: '700', color: '#334155' }}>
                        Toàn bộ cán bộ nhân viên bệnh viện
                      </div>
                    )}

                    {perm.target_type === 'department' && (
                      <select
                        value={perm.target_value}
                        onChange={(e) => updatePermission(pIdx, 'target_value', e.target.value)}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700', color: '#1E40AF' }}
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    )}

                    {perm.target_type === 'role' && (
                      <select
                        value={perm.target_value}
                        onChange={(e) => updatePermission(pIdx, 'target_value', e.target.value)}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700', color: '#0F2C59' }}
                      >
                        <option value="admin">Quản Trị Viên (Admin)</option>
                        <option value="department">Tài khoản Khoa Phòng (12 khoa)</option>
                        <option value="staff">Nhân viên y tế mở rộng (Staff)</option>
                      </select>
                    )}

                    {perm.target_type === 'user' && (
                      <select
                        value={perm.target_value}
                        onChange={(e) => updatePermission(pIdx, 'target_value', e.target.value)}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1.5px solid #2563EB', fontSize: '0.84rem', fontWeight: '700', color: '#0F2C59' }}
                      >
                        <optgroup label="👑 Tài Khoản Cốt Lõi (13 Khoa/Phòng + Admin)">
                          {availableAccounts.filter(a => a.type === 'core').map(a => (
                            <option key={a.id} value={a.username}>
                              {a.name} (@{a.username})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="👤 Tài Khoản Nhân Viên Mở Rộng (system_users)">
                          {availableAccounts.filter(a => a.type === 'system').map(a => (
                            <option key={a.id} value={a.username}>
                              {a.name} (@{a.username}) — {a.dept}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    )}
                  </div>

                  {/* Access Level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Quyền hạn
                    </label>
                    <select
                      value={perm.permission}
                      onChange={(e) => updatePermission(pIdx, 'permission', e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700', color: '#065F46' }}
                    >
                      <option value="edit">✏️ Toàn quyền (Xem & Nhập báo cáo)</option>
                      <option value="view">👁️ Chỉ xem dữ liệu</option>
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => removePermission(pIdx)}
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        borderRadius: '8px',
                        padding: '0.45rem 0.65rem',
                        cursor: 'pointer',
                        marginTop: '1.1rem'
                      }}
                      title="Xóa phân quyền này"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomFormBuilder;
