import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaUserMd, FaUserNurse, FaSearch, FaTimes, FaCheck, FaChevronDown, FaIdCard, FaPlus } from 'react-icons/fa';

/**
 * Modern Searchable Staff Combobox
 * - Gõ số thứ tự (1, 2, 3...) hoặc gõ tên (An, Kiệt...) để tìm kiếm nhanh
 * - Hiển thị giao diện trực quan với huy hiệu Bác sĩ / Điều dưỡng / Chứng chỉ
 * - Tự động tách nhóm thông minh (Ưu tiên Bác sĩ cho ô Bác sĩ, Điều dưỡng cho ô Điều dưỡng)
 * - Cho phép nhập tên ngoài viện tự do
 */
const StaffSelectCombobox = ({
  label,
  required = false,
  placeholder = 'Tìm theo số (1, 2...) hoặc gõ họ tên...',
  value = '',
  onChange,
  doctors = [],
  nurses = [],
  allStaff = [],
  type = 'doctor', // 'doctor' | 'nurse' | 'all'
  icon = null,
  loading = false,
  helpText = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Chuẩn hóa danh sách hiển thị có số thứ tự
  const formattedItems = useMemo(() => {
    let list = [];
    if (type === 'doctor') {
      // Ưu tiên bác sĩ lên đầu, sau đó đến nhân sự khác
      const docList = doctors.length > 0 ? doctors : allStaff.filter(s => (s.position || '').toLowerCase().includes('bác sĩ'));
      const otherList = nurses.length > 0 ? nurses : allStaff.filter(s => !(s.position || '').toLowerCase().includes('bác sĩ'));
      list = [
        ...docList.map(s => ({ ...s, isPrimaryRole: true })),
        ...otherList.filter(o => !docList.some(d => d.id === o.id)).map(s => ({ ...s, isPrimaryRole: false }))
      ];
    } else if (type === 'nurse') {
      // Ưu tiên điều dưỡng lên đầu, sau đó đến bác sĩ/nhân sự khác
      const nurList = nurses.length > 0 ? nurses : allStaff.filter(s => (s.position || '').toLowerCase().includes('điều dưỡng'));
      const otherList = doctors.length > 0 ? doctors : allStaff.filter(s => !(s.position || '').toLowerCase().includes('điều dưỡng'));
      list = [
        ...nurList.map(s => ({ ...s, isPrimaryRole: true })),
        ...otherList.filter(o => !nurList.some(d => d.id === o.id)).map(s => ({ ...s, isPrimaryRole: false }))
      ];
    } else {
      list = (allStaff.length > 0 ? allStaff : [...doctors, ...nurses]).map(s => ({ ...s, isPrimaryRole: true }));
    }

    return list.map((s, idx) => ({
      index: idx + 1,
      id: s.id,
      name: s.full_name,
      position: s.position || (type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'),
      certificate: s.certificate || '',
      gender: s.gender || '',
      isPrimaryRole: s.isPrimaryRole
    }));
  }, [doctors, nurses, allStaff, type]);

  // Lọc danh sách theo từ khóa tìm kiếm (tìm theo số thứ tự hoặc tên hoặc chức vụ hoặc CCHN)
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return formattedItems;

    // Nếu gõ số nguyên (VD: "1", "12")
    if (/^\d+$/.test(term)) {
      const num = parseInt(term, 10);
      return formattedItems.filter(item => item.index === num || String(item.index).startsWith(term));
    }

    // Gõ chữ cái hoặc ký tự
    return formattedItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const posMatch = item.position.toLowerCase().includes(term);
      const certMatch = item.certificate.toLowerCase().includes(term);
      const indexMatch = String(item.index) === term;
      return nameMatch || posMatch || certMatch || indexMatch;
    });
  }, [formattedItems, searchTerm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (staffName) => {
    onChange(staffName);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  // Tìm thông tin của nhân sự đang được chọn
  const selectedStaffObj = useMemo(() => {
    if (!value) return null;
    return formattedItems.find(s => s.name === value) || null;
  }, [formattedItems, value]);

  const isDoctorRole = (pos = '') => pos.toLowerCase().includes('bác sĩ') || pos.toLowerCase().includes('bs');

  return (
    <div className="staff-combobox-wrapper" ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#1E293B' }}>
          <span>
            {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
          </span>
          {loading && <span style={{ fontSize: '0.75rem', color: '#2563EB' }}>Đang nạp danh sách...</span>}
        </label>
      )}

      {/* Main Input Box */}
      <div
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: isOpen ? '2px solid #2563EB' : '1.5px solid #CBD5E1',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          minHeight: '44px',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
          cursor: 'text',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Role Icon */}
        <div style={{ color: type === 'doctor' ? '#2563EB' : '#059669', marginRight: '0.6rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
          {icon ? icon : (type === 'doctor' ? <FaUserMd /> : <FaUserNurse />)}
        </div>

        {/* Display selected staff badge or input */}
        {value && !isOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
            <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.95rem' }}>
              {value}
            </span>
            {selectedStaffObj && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: isDoctorRole(selectedStaffObj.position) ? '#EFF6FF' : '#F0FDF4',
                color: isDoctorRole(selectedStaffObj.position) ? '#1D4ED8' : '#15803D',
                border: isDoctorRole(selectedStaffObj.position) ? '1px solid #BFDBFE' : '1px solid #BBF7D0'
              }}>
                {selectedStaffObj.position}
              </span>
            )}
            {selectedStaffObj?.certificate && (
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'none', md: 'inline' }}>
                ({selectedStaffObj.certificate})
              </span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder={value ? value : placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems.length > 0) {
                  handleSelect(filteredItems[0].name);
                } else if (searchTerm.trim()) {
                  handleSelect(searchTerm.trim());
                }
              } else if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '0',
              margin: '0',
              fontSize: '0.92rem',
              backgroundColor: 'transparent',
              color: '#0F172A'
            }}
          />
        )}

        {/* Action icons right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '0.65rem'
              }}
              title="Xóa lựa chọn"
            >
              <FaTimes />
            </button>
          )}
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', pointerEvents: 'none' }}>
            <FaChevronDown style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </div>
        </div>
      </div>

      {helpText && (
        <small style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
          {helpText}
        </small>
      )}

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            zIndex: 9999,
            maxHeight: '290px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          {/* Header count info */}
          <div style={{
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Danh sách nhân sự khoa ({filteredItems.length})</span>
            <span style={{ color: '#2563EB', textTransform: 'none', fontWeight: '500' }}>Gõ số hoặc tên</span>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>Không tìm thấy nhân sự phù hợp với "<strong>{searchTerm}</strong>"</p>
              {searchTerm.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelect(searchTerm.trim())}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FaPlus /> Sử dụng tên: "<strong>{searchTerm.trim()}</strong>"
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              {filteredItems.map((item) => {
                const isSelected = value === item.name;
                const isDoc = isDoctorRole(item.position);

                return (
                  <div
                    key={item.id || item.index}
                    onClick={() => handleSelect(item.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                      gap: '0.65rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    {/* Index Circle Badge */}
                    <div style={{
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#2563EB' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.index}
                    </div>

                    {/* Staff Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                          {item.name}
                        </span>

                        {/* Role Pill */}
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: isDoc ? '#DBEAFE' : '#DCFCE7',
                          color: isDoc ? '#1E40AF' : '#166534'
                        }}>
                          {isDoc ? '👨‍⚕️ ' : '👩‍⚕️ '} {item.position}
                        </span>
                      </div>

                      {/* Certificate code */}
                      {item.certificate ? (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaIdCard style={{ fontSize: '0.7rem' }} /> CCHN: {item.certificate}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                          Chưa cập nhật CCHN
                        </div>
                      )}
                    </div>

                    {/* Check icon if selected */}
                    {isSelected && (
                      <div style={{ color: '#2563EB', fontSize: '0.85rem' }}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Option to use custom typed text if not matched */}
              {searchTerm.trim() && !filteredItems.some(i => i.name.toLowerCase() === searchTerm.trim().toLowerCase()) && (
                <div
                  onClick={() => handleSelect(searchTerm.trim())}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderTop: '1px solid #E2E8F0',
                    marginTop: '4px',
                    color: '#2563EB',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <FaPlus /> Nhập tên ngoài danh sách: "<strong>{searchTerm.trim()}</strong>"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffSelectCombobox;
