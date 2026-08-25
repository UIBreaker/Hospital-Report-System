import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaClipboardList, 
  FaCalendarAlt, 
  FaArrowLeft, 
  FaFileExcel, 
  FaPrint, 
  FaTimes, 
  FaEye, 
  FaHospital,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaSync,
  FaSearch,
  FaThLarge,
  FaTable,
  FaList,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaFileAlt,
  FaFilter,
  FaChartBar,
  FaLayerGroup
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import MedicalLoader from '../../common/MedicalLoader';

const DynamicFormSubmissions = ({ formCode, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [formMeta, setFormMeta] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // viewMode: 'grid' (Bảng mở rộng toàn bộ cột dữ liệu) | 'cards' (Thẻ thông minh mở rộng) | 'compact' (Bảng tổng quan thu gọn)
  const [viewMode, setViewMode] = useState('grid');
  
  // For cards view: expandedCardIds set
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());
  const [allExpanded, setAllExpanded] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await customFormService.getFormSubmissions(formCode, selectedDate ? { date: selectedDate } : {});
      if (res && res.success) {
        setSubmissions(res.data || []);
        setFormMeta(res.form);
        // By default expand all cards
        if (res.data && res.data.length > 0) {
          setExpandedCardIds(new Set(res.data.map(s => s.id)));
          setAllExpanded(true);
        }
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

  // Schema fields (excluding section headers)
  const schemaFields = useMemo(() => {
    if (!formMeta || !Array.isArray(formMeta.schema_json)) return [];
    return formMeta.schema_json.filter(f => f.type !== 'section');
  }, [formMeta]);

  // Helper to get field label
  const getFieldLabel = (key) => {
    const field = schemaFields.find(f => f.key === key);
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

  // Distinct departments
  const departmentsList = useMemo(() => {
    const set = new Set();
    submissions.forEach(s => {
      const name = s.department_name || (s.department_code === 'personal' ? 'Tài khoản cá nhân' : s.department_code);
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      // Dept filter
      if (selectedDept !== 'all') {
        const dName = s.department_name || (s.department_code === 'personal' ? 'Tài khoản cá nhân' : s.department_code);
        if (dName !== selectedDept) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const inMeta = (s.submitted_by_user || '').toLowerCase().includes(term) ||
                     (s.user_full_name || '').toLowerCase().includes(term) ||
                     (s.department_name || '').toLowerCase().includes(term) ||
                     (s.submission_date || '').includes(term);

      if (inMeta) return true;

      // Search in submission_data
      const dataVals = Object.values(s.submission_data || {}).map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ').toLowerCase();
      return dataVals.includes(term);
    });
  }, [submissions, selectedDept, searchTerm]);

  // Toggle card expansion
  const toggleCard = (id) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAllCards = () => {
    if (allExpanded) {
      setExpandedCardIds(new Set());
      setAllExpanded(false);
    } else {
      setExpandedCardIds(new Set(submissions.map(s => s.id)));
      setAllExpanded(true);
    }
  };

  // KPI Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = submissions.filter(s => s.submission_date === todayStr).length;
  const uniqueSubmitters = new Set(submissions.map(s => s.submitted_by_user)).size;

  // Export to Excel / CSV with BOM
  const handleExportExcel = () => {
    if (!filteredSubmissions.length) {
      alert('Không có dữ liệu bản ghi để xuất file.');
      return;
    }

    const headers = [
      'STT',
      'Ngày Báo Cáo',
      'Khoa / Đơn Vị',
      'Người Nộp',
      'Tên Đăng Nhập',
      ...schemaFields.map(f => f.label || f.key),
      'Thời Gian Gửi'
    ];

    const rows = filteredSubmissions.map((s, idx) => [
      idx + 1,
      formatDateVN(s.submission_date),
      s.department_name || (s.department_code === 'personal' ? 'Tài khoản cá nhân' : s.department_code),
      s.user_full_name || s.submitted_by_user,
      s.submitted_by_user,
      ...schemaFields.map(f => {
        const val = s.submission_data?.[f.key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }),
      new Date(s.created_at).toLocaleString('vi-VN')
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCao_${formMeta?.code || formCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const themeColor = formMeta?.theme_color || '#2563EB';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        borderLeft: `6px solid ${themeColor}`,
        padding: '1.25rem 1.75rem',
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
            onClick={onBack}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.55rem 0.95rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800' }}>
                DANH SÁCH BẢN GHI
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', fontWeight: '700' }}>
                /{formCode}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}>
              {formMeta?.title || formCode}
            </h2>
          </div>
        </div>

        {/* View Mode Selector & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '12px',
            padding: '3px',
            border: '1px solid #CBD5E1'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#2563EB' : '#64748B',
                border: viewMode === 'grid' ? '1px solid #E2E8F0' : 'none',
                borderRadius: '9px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
              title="Bung tất cả các cột dữ liệu ra bảng lớn"
            >
              <FaTable /> Bảng Chi Tiết
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#2563EB' : '#64748B',
                border: viewMode === 'cards' ? '1px solid #E2E8F0' : 'none',
                borderRadius: '9px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
              title="Xem dưới dạng thẻ thông minh mở rộng"
            >
              <FaThLarge /> Thẻ Mở Rộng
            </button>

            <button
              type="button"
              onClick={() => setViewMode('compact')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: viewMode === 'compact' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'compact' ? '#2563EB' : '#64748B',
                border: viewMode === 'compact' ? '1px solid #E2E8F0' : 'none',
                borderRadius: '9px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'compact' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
              title="Xem bảng rút gọn hành chính"
            >
              <FaList /> Thu Gọn
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.5rem 0.95rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
            title="Xuất danh sách sang file Excel / CSV đầy đủ các cột"
          >
            <FaFileExcel /> Xuất Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="In danh sách dữ liệu"
          >
            <FaPrint /> In
          </button>

          <button
            type="button"
            onClick={fetchSubmissions}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#0F2C59'
            }}
            title="Làm mới dữ liệu"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.4rem',
          boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaClipboardList />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>TỔNG BẢN GHI</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F2C59', lineHeight: 1.1 }}>{submissions.length}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.4rem',
          boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaCalendarAlt />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BẢN GHI HÔM NAY</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#16A34A', lineHeight: 1.1 }}>{todayCount}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.4rem',
          boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaUsers />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>NGƯỜI THAM GIA NỘP</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#D97706', lineHeight: 1.1 }}>{uniqueSubmitters}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.4rem',
          boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaLayerGroup />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>SỐ TRƯỜNG DỮ LIỆU</div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#7E22CE', lineHeight: 1.1 }}>{schemaFields.length}</div>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & FILTERS */}
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
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.03)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <FaSearch style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, họ tên, số liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.3rem',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.86rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          {departmentsList.length > 1 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontWeight: '700',
                color: '#0F2C59',
                backgroundColor: '#F8FAFC',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">-- Tất cả đơn vị / khoa ({departmentsList.length}) --</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* Date Picker Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px'
          }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.85rem' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: '800', color: '#1E40AF', outline: 'none', fontSize: '0.86rem', cursor: 'pointer' }}
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
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              Xem tất cả ngày
            </button>
          )}

          {viewMode === 'cards' && filteredSubmissions.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAllCards}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                color: '#0F2C59',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {allExpanded ? <><FaChevronUp /> Thu gọn tất cả</> : <><FaChevronDown /> Bung mở tất cả</>}
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN DATA DISPLAY */}
      {loading ? (
        <MedicalLoader 
          text="Đang nạp dữ liệu các bản ghi..." 
          subtext="TTYT Khu Vực Bình Long • CSDL Báo Cáo Chuyên Môn"
          minHeight="320px"
        />
      ) : filteredSubmissions.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px dashed #CBD5E1',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          color: '#64748B'
        }}>
          <FaClipboardList style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '0.75rem' }} />
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#0F2C59' }}>
            {selectedDate ? `Chưa Có Bản Ghi Nào Trong Ngày ${formatDateVN(selectedDate)}` : 'Chưa Có Bản Ghi Nào Phù Hợp'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
            {selectedDate ? 'Hãy thử chọn ngày khác hoặc bấm "Xem tất cả ngày".' : 'Các dữ liệu nộp từ thành viên hoặc khoa phòng sẽ được lưu trữ tự động tại đây.'}
          </p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* MODE 1: BẢNG DỮ LIỆU MỞ RỘNG TOÀN BỘ CỘT CHUYÊN MÔN     */}
          {/* ======================================================== */}
          {viewMode === 'grid' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(15, 44, 89, 0.05)'
            }}>
              <div style={{ overflowX: 'auto', maxHeight: '72vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF', borderBottom: '2px solid #1E3A8A' }}>
                      <th style={{ padding: '0.85rem 1rem', width: '50px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '800', backgroundColor: '#1E3A8A' }}>NGÀY BÁO CÁO</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>KHOA / ĐƠN VỊ</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>NGƯỜI NỘP</th>

                      {/* DYNAMIC FIELD COLUMNS */}
                      {schemaFields.map(field => (
                        <th key={field.id || field.key} style={{ padding: '0.85rem 1.1rem', fontWeight: '800', backgroundColor: '#172554', color: '#93C5FD', letterSpacing: '0.3px' }}>
                          {field.label}
                        </th>
                      ))}

                      <th style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>THỜI ĐIỂM GỬI</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: '800' }}>CHI TIẾT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'}
                      >
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748B', fontWeight: '800' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#1E40AF', backgroundColor: 'rgba(239, 246, 255, 0.5)' }}>
                          {formatDateVN(sub.submission_date)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#0F2C59' }}>
                          {sub.department_name || (sub.department_code === 'personal' ? '👤 Tài khoản cá nhân' : sub.department_code)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '600' }}>
                          {sub.user_full_name ? `${sub.user_full_name} (@${sub.submitted_by_user})` : `@${sub.submitted_by_user}`}
                        </td>

                        {/* RENDER FIELD VALUES */}
                        {schemaFields.map(field => {
                          const rawVal = sub.submission_data?.[field.key];
                          let displayVal = '—';

                          if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                            if (typeof rawVal === 'boolean') {
                              displayVal = rawVal ? '✓ Có' : '✗ Không';
                            } else if (Array.isArray(rawVal)) {
                              displayVal = `${rawVal.length} dòng`;
                            } else if (typeof rawVal === 'object') {
                              displayVal = JSON.stringify(rawVal);
                            } else {
                              displayVal = String(rawVal);
                            }
                          }

                          return (
                            <td key={field.id || field.key} style={{ padding: '0.85rem 1.1rem', color: '#0F2C59', fontWeight: '600' }}>
                              <span style={{
                                backgroundColor: displayVal !== '—' ? '#F1F5F9' : 'transparent',
                                padding: displayVal !== '—' ? '0.2rem 0.55rem' : '0',
                                borderRadius: '6px',
                                border: displayVal !== '—' ? '1px solid #E2E8F0' : 'none'
                              }}>
                                {displayVal}
                              </span>
                            </td>
                          );
                        })}

                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                          {new Date(sub.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1.5px solid #BFDBFE',
                              borderRadius: '8px',
                              padding: '0.35rem 0.75rem',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <FaEye /> Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: THẺ BENTO THÔNG MINH MỞ RỘNG TỪNG BẢN GHI      */}
          {/* ======================================================== */}
          {viewMode === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredSubmissions.map((sub, idx) => {
                const isExpanded = expandedCardIds.has(sub.id);

                return (
                  <div
                    key={sub.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1.5px solid #E2E8F0',
                      borderLeft: `6px solid ${themeColor}`,
                      boxShadow: '0 6px 20px rgba(15, 44, 89, 0.05)',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Card Header Bar */}
                    <div
                      onClick={() => toggleCard(sub.id)}
                      style={{
                        padding: '1.1rem 1.6rem',
                        backgroundColor: '#F8FAFC',
                        borderBottom: isExpanded ? '1.5px solid #E2E8F0' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        flexWrap: 'wrap',
                        gap: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          backgroundColor: '#0F2C59',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '0.85rem'
                        }}>
                          #{idx + 1}
                        </span>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F2C59' }}>
                              {sub.user_full_name ? `${sub.user_full_name} (@${sub.submitted_by_user})` : `@${sub.submitted_by_user}`}
                            </span>
                            <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800' }}>
                              {sub.department_name || (sub.department_code === 'personal' ? '👤 Tài khoản cá nhân' : sub.department_code)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                            Ngày báo cáo: <strong style={{ color: '#1E40AF' }}>{formatDateVN(sub.submission_date)}</strong> • Gửi lúc: {new Date(sub.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(sub);
                          }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            color: '#0F2C59',
                            cursor: 'pointer'
                          }}
                        >
                          <FaEye /> Modal
                        </button>
                        <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Field Data Grid */}
                    {isExpanded && (
                      <div style={{ padding: '1.4rem 1.6rem', backgroundColor: '#FFFFFF' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '1rem'
                        }}>
                          {schemaFields.map(field => {
                            const val = sub.submission_data?.[field.key];
                            return (
                              <div
                                key={field.id || field.key}
                                style={{
                                  backgroundColor: '#F8FAFC',
                                  borderRadius: '14px',
                                  border: '1px solid #E2E8F0',
                                  padding: '0.95rem 1.15rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '0.35rem'
                                }}
                              >
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                  {field.label}
                                </div>
                                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0F2C59', lineHeight: 1.4 }}>
                                  {val !== undefined && val !== null && val !== '' ? (
                                    typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
                                  ) : (
                                    <span style={{ color: '#94A3B8', fontWeight: 'normal', fontStyle: 'italic' }}>Chưa nhập</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 3: BẢNG TỔNG QUAN HÀNH CHÍNH THU GỌN               */}
          {/* ======================================================== */}
          {viewMode === 'compact' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
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
                    {filteredSubmissions.map((sub, idx) => (
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
            </div>
          )}
        </>
      )}

      {/* 5. SUBMISSION DETAIL MODAL */}
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
