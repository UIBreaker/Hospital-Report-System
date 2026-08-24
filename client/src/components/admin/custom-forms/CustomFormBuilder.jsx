import React, { useState } from 'react';
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
  FaArrowLeft
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';

const THEME_OPTIONS = [
  { color: '#2563EB', label: 'Xanh Dương Y Tế (Mặc định)' },
  { color: '#059669', label: 'Xanh Lục Bảo (Sức khỏe)' },
  { color: '#7C3AED', label: 'Tím Thần Kinh & Hồi Sức' },
  { color: '#D97706', label: 'Cam Hổ Phách (Cảnh báo)' },
  { color: '#DC2626', label: 'Đỏ Cấp Cứu (Khẩn cấp)' },
  { color: '#0891B2', label: 'Xanh Ngọc Cyan (Chuẩn đoán)' }
];

const FIELD_TYPES = [
  { type: 'text', label: 'Văn bản ngắn' },
  { type: 'textarea', label: 'Văn bản nhiều dòng (Ghi chú)' },
  { type: 'number', label: 'Số lượng / Chỉ số đo' },
  { type: 'date', label: 'Ngày tháng' },
  { type: 'time', label: 'Thời gian (Giờ:Phút)' },
  { type: 'select', label: 'Danh sách chọn (Dropdown)' },
  { type: 'checkbox', label: 'Hộp kiểm (Checkbox)' },
  { type: 'table', label: 'Bảng con lồng nhau (Sub-table)' }
];

const DEPARTMENTS = [
  { code: 'all', name: 'Tất cả khoa phòng' },
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

  // Form Basic Info
  const [code, setCode] = useState(initialForm?.code || '');
  const [title, setTitle] = useState(initialForm?.title || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [formType, setFormType] = useState(initialForm?.form_type || 'input');
  const [themeColor, setThemeColor] = useState(initialForm?.theme_color || '#2563EB');
  const [isActive, setIsActive] = useState(initialForm?.is_active !== undefined ? Boolean(initialForm.is_active) : true);

  // Fields Array
  const [fields, setFields] = useState(() => {
    if (Array.isArray(initialForm?.schema_json) && initialForm.schema_json.length > 0) {
      return initialForm.schema_json;
    }
    return [
      { id: 'f_1', key: 'ghi_chu_chung', label: 'Ghi chú tổng hợp', type: 'textarea', required: false, gridWidth: '100%' }
    ];
  });

  // Tracker Config
  const [trackerSource, setTrackerSource] = useState(initialForm?.tracker_config?.source || 'overtime_staff');

  // Permissions Array
  const [permissions, setPermissions] = useState(() => {
    if (Array.isArray(initialForm?.permissions) && initialForm.permissions.length > 0) {
      return initialForm.permissions;
    }
    return [{ target_type: 'all', target_value: 'all', permission: 'edit' }];
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Field Management
  const addField = (type = 'text') => {
    const newId = `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newField = {
      id: newId,
      key: `field_${fields.length + 1}`,
      label: `Trường mới ${fields.length + 1}`,
      type,
      required: false,
      placeholder: '',
      gridWidth: '100%',
      options: type === 'select' ? ['Lựa chọn 1', 'Lựa chọn 2'] : undefined,
      columns: type === 'table' ? [
        { key: 'col1', label: 'Cột 1', type: 'text' },
        { key: 'col2', label: 'Cột 2', type: 'number' }
      ] : undefined
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (idx, updates) => {
    setFields(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const removeField = (idx) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  // Permission Management
  const addPermission = () => {
    setPermissions(prev => [...prev, { target_type: 'department', target_value: 'lck', permission: 'edit' }]);
  };

  const updatePermission = (idx, updates) => {
    setPermissions(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const removePermission = (idx) => {
    setPermissions(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Save
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập Tên biểu mẫu.');
      setActiveTab('general');
      return;
    }

    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập Mã biểu mẫu.');
      setActiveTab('general');
      return;
    }

    if (fields.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất 1 trường dữ liệu cho biểu mẫu.');
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
        is_active: isActive,
        schema_json: fields,
        tracker_config: formType === 'tracker' ? { source: trackerSource } : null,
        permissions
      };

      let res;
      if (isEditing) {
        res = await customFormService.updateForm(initialForm.id, payload);
      } else {
        res = await customFormService.createForm(payload);
      }

      if (res && res.success) {
        if (onSaved) onSaved(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Lỗi khi lưu biểu mẫu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 20px rgba(15, 44, 89, 0.06)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0F2C59',
        borderBottom: `4px solid ${themeColor}`,
        padding: '1.25rem 1.65rem',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: '700',
              fontSize: '0.8rem'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>
              {isEditing ? `Chỉnh Sửa Biểu Mẫu: ${title}` : 'Thiết Kế Biểu Mẫu Tùy Chỉnh Mới'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#93C5FD' }}>
              Cấu hình các trường dữ liệu, giao diện responsive và phân quyền người dùng
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '0.55rem 1.15rem',
              fontWeight: '700',
              fontSize: '0.84rem',
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
              borderRadius: '8px',
              padding: '0.55rem 1.4rem',
              fontWeight: '800',
              fontSize: '0.86rem',
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

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        padding: '0 1.5rem',
        gap: '0.5rem'
      }}>
        {[
          { key: 'general', label: '1. Thông tin chung & Giao diện', icon: <FaPalette /> },
          { key: 'fields', label: `2. Thiết kế trường dữ liệu (${fields.length})`, icon: <FaListUl /> },
          { key: 'tracker', label: '3. Widget Data Tracker', icon: <FaChartLine /> },
          { key: 'permissions', label: `4. Phân quyền truy cập (${permissions.length})`, icon: <FaShieldAlt /> }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.85rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab.key ? `3px solid ${themeColor}` : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? '#0F2C59' : '#64748B',
              fontWeight: activeTab === tab.key ? '800' : '600',
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div style={{ margin: '1rem 1.65rem 0', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '10px', fontSize: '0.86rem', fontWeight: '600' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Body Content */}
      <div style={{ padding: '1.65rem' }}>
        {/* ================= TAB 1: GENERAL ================= */}
        {activeTab === 'general' && (
          <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Tên biểu mẫu *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Báo Cáo Trực Tăng Cường & Bàn Giao Thiết Bị"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.95rem',
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Mã định danh slug (Code) *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isEditing}
                  placeholder="Viết liền không dấu (VD: overtime_tracker)"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    color: '#0F2C59',
                    backgroundColor: isEditing ? '#F1F5F9' : '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Mô tả hướng dẫn nhập liệu
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả mục đích và hướng dẫn các khoa phòng điền form này..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.95rem',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Kiểu biểu mẫu (Form Type)
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    color: '#0F2C59',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="input">📝 Form Nhập Liệu Chuẩn (Input Form)</option>
                  <option value="tracker">📊 Form Theo Dõi Số Liệu Tự Động (Data Tracker)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Màu sắc chủ đạo (Theme Color)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <select
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      color: '#0F2C59',
                      outline: 'none'
                    }}
                  >
                    {THEME_OPTIONS.map(opt => (
                      <option key={opt.color} value={opt.color}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActiveToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isActiveToggle" style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F2C59', cursor: 'pointer' }}>
                Kích hoạt biểu mẫu này (Cho phép nhân viên nhìn thấy và nộp dữ liệu)
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FIELDS DESIGNER ================= */}
        {activeTab === 'fields' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F2C59' }}>
                  Danh Sách Các Trường Nhập Liệu
                </h4>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Thêm bớt, sắp xếp và tùy biến loại dữ liệu hiển thị trên form.
                </p>
              </div>

              {/* Add Field Dropdown */}
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {FIELD_TYPES.map(ft => (
                  <button
                    key={ft.type}
                    type="button"
                    onClick={() => addField(ft.type)}
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '0.38rem 0.75rem',
                      fontWeight: '700',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <FaPlus size={9} /> {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {fields.map((field, idx) => (
                <div
                  key={field.id || idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderLeft: `5px solid ${themeColor}`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase' }}>
                      Trường #{idx + 1}: <strong style={{ color: themeColor }}>{field.type}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FaTrash size={11} /> Xóa trường
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Tiêu đề hiển thị (Label)
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: '700', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Mã trường (Key JSON)
                      </label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => updateField(idx, { key: e.target.value.replace(/\s+/g, '_') })}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Loại dữ liệu
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, { type: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        {FIELD_TYPES.map(ft => (
                          <option key={ft.type} value={ft.type}>{ft.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Độ rộng cột
                      </label>
                      <select
                        value={field.gridWidth || '100%'}
                        onChange={(e) => updateField(idx, { gridWidth: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        <option value="100%">Toàn hàng (100%)</option>
                        <option value="50%">Nửa hàng (50%)</option>
                        <option value="33.3%">Một phần ba (33%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Specific Options for Select type */}
                  {field.type === 'select' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Danh sách các lựa chọn (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(field.options) ? field.options.join(', ') : ''}
                        onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Ví dụ: Đạt yêu cầu, Không đạt, Cần bổ sung"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id={`req_${idx}`}
                      checked={Boolean(field.required)}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor={`req_${idx}`} style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F2C59', cursor: 'pointer' }}>
                      Bắt buộc phải điền (Required)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TRACKER ================= */}
        {activeTab === 'tracker' && (
          <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '800', color: '#0F2C59' }}>
                Cấu Hình Widget Theo Dõi Tự Động (Data Tracker)
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>
                Tự động thu thập và đồng bộ số liệu từ 12 khoa phòng theo thời gian thực mà không cần người dùng nhập tay lại.
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Nguồn dữ liệu tự động (Data Source)
              </label>
              <select
                value={trackerSource}
                onChange={(e) => setTrackerSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#0F2C59',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="overtime_staff">👥 Nhân sự trực thêm giờ / tăng cường 12 khoa phòng (từ reports.overtime_staff)</option>
                <option value="clinical_cases">🏥 Thống kê tổng hợp 4 loại ca bệnh (Chuyển viện, Mổ, Tử vong, Nặng)</option>
                <option value="general_metrics">📊 Thống kê lượt khám & điều trị nội trú / ngoại trú toàn viện</option>
              </select>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PERMISSIONS ================= */}
        {activeTab === 'permissions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '800', color: '#0F2C59' }}>
                  Phân Quyền Truy Cập & Nhập Liệu
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  Quy định khoa phòng hoặc tài khoản nào được phép nhìn thấy và nộp báo cáo theo form này.
                </p>
              </div>

              <button
                type="button"
                onClick={addPermission}
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <FaPlus size={10} /> Thêm Phân Quyền
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {permissions.map((perm, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.85rem 1.15rem',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.5fr 1.2fr 40px',
                    gap: '0.75rem',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', marginBottom: '0.2rem' }}>
                      Phạm vi
                    </label>
                    <select
                      value={perm.target_type}
                      onChange={(e) => updatePermission(idx, { target_type: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                    >
                      <option value="all">Tất cả khoa phòng</option>
                      <option value="department">Khoa phòng cụ thể</option>
                      <option value="role">Theo vai trò</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', marginBottom: '0.2rem' }}>
                      Đối tượng
                    </label>
                    {perm.target_type === 'department' ? (
                      <select
                        value={perm.target_value}
                        onChange={(e) => updatePermission(idx, { target_value: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                      >
                        {DEPARTMENTS.filter(d => d.code !== 'all').map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    ) : perm.target_type === 'role' ? (
                      <select
                        value={perm.target_value}
                        onChange={(e) => updatePermission(idx, { target_value: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                      >
                        <option value="department">Tài khoản Trưởng khoa / Bác sĩ</option>
                        <option value="staff">Nhân viên mở rộng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F2C59' }}>Áp dụng toàn viện</span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', marginBottom: '0.2rem' }}>
                      Quyền hạn
                    </label>
                    <select
                      value={perm.permission}
                      onChange={(e) => updatePermission(idx, { permission: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '700' }}
                    >
                      <option value="edit">✏️ Được phép Nhập & Sửa</option>
                      <option value="view">👁️ Chỉ Xem (View Only)</option>
                    </select>
                  </div>

                  <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => removePermission(idx)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
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
