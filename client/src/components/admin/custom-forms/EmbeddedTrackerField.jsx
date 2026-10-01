import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaHeartbeat,
  FaProcedures,
  FaTable,
  FaCalendarAlt,
  FaClock,
  FaHospital,
  FaUserMd,
  FaAmbulance,
  FaSync,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaStethoscope,
  FaNotesMedical,
  FaUserNurse,
  FaCheckCircle,
  FaSkullCrossbones,
  FaExclamationTriangle,
  FaFileExcel,
  FaPrint,
  FaThLarge,
  FaList,
  FaFilter,
  FaLayerGroup
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';

const formatDateVN = (dStr) => {
  if (!dStr) return '';
  const p = String(dStr).split('-');
  if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
  return dStr;
};

const formatPatientAge = (val) => {
  if (!val) return '—';
  const s = String(val).trim();
  if (/^\d{4}$/.test(s)) return `SN: ${s}`;
  if (/^\d+$/.test(s)) return `${s} tuổi`;
  return s;
};

const parseOvertimeTimeAndReason = (raw) => {
  if (!raw || raw === '—') return { time: '—', reason: '—' };
  const str = String(raw).trim();
  const colonMatch = str.match(/^([0-9hg\s\-\(\):]+?):\s*(.+)$/i);
  if (colonMatch && colonMatch[2].length > 2) {
    return { time: colonMatch[1].trim(), reason: colonMatch[2].trim() };
  }
  const spaceMatch = str.match(/^(\d+[\s]*(?:h|giờ|g)(?:\s*\([^\)]+\))?)\s+(.+)$/i);
  if (spaceMatch && spaceMatch[2].length > 2) {
    return { time: spaceMatch[1].trim(), reason: spaceMatch[2].trim() };
  }
  return { time: str, reason: '—' };
};

const getDeptBadgeStyle = (deptName) => {
  const name = (deptName || '').toLowerCase();
  if (name.includes('hồi sức') || name.includes('cấp cứu') || name.includes('hscc') || name.includes('thận')) {
    return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '⚡' };
  }
  if (name.includes('ngoại') || name.includes('phẫu')) {
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', icon: '🔪' };
  }
  if (name.includes('nhiễm')) {
    return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', icon: '🦠' };
  }
  if (name.includes('chấn thương') || name.includes('ctch')) {
    return { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', icon: '🦴' };
  }
  if (name.includes('nhi')) {
    return { bg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D', icon: '👶' };
  }
  if (name.includes('hình ảnh') || name.includes('cdha') || name.includes('x-quang')) {
    return { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8', icon: '🔬' };
  }
  if (name.includes('sản')) {
    return { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', icon: '🤰' };
  }
  return { bg: '#F1F5F9', border: '#CBD5E1', text: '#334155', icon: '🏢' };
};

const EmbeddedTrackerField = ({
  field,
  themeColor = '#2563EB',
  currentDate,
  currentUserDept
}) => {
  const [targetDate, setTargetDate] = useState(() => currentDate || new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseTab, setActiveCaseTab] = useState(field.caseFilter || 'all');
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [overtimeViewMode, setOvertimeViewMode] = useState('table'); // 'table' | 'grouped' | 'cards'
  const [selectedOvertimeDept, setSelectedOvertimeDept] = useState('all');

  const handleExportOvertimeExcel = (staffList, dateStr) => {
    if (!staffList || staffList.length === 0) {
      alert('Không có dữ liệu cán bộ thêm giờ để xuất file.');
      return;
    }
    const headers = ['STT', 'Khoa / Phòng', 'Họ Tên Cán Bộ', 'Thời Gian / Số Giờ', 'Nội Dung / Lý Do Tăng Cường', 'Bác Sĩ Trực Ca', 'Phòng', 'Ngày Báo Cáo'];
    const rows = staffList.map((s, idx) => {
      const { time, reason } = parseOvertimeTimeAndReason(s.time);
      return [
        idx + 1,
        s.department_name || s.department_code || '',
        s.staff_name || '',
        time || '',
        reason !== '—' ? reason : '',
        s.doctor_name || '',
        s.room !== '—' ? s.room : '',
        formatDateVN(dateStr)
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DanhSach_CanBoThemGio_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync date if parent date changes
  useEffect(() => {
    if (currentDate) {
      setTargetDate(currentDate);
    }
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let deptCode = 'all';
      if (field.dataScope === 'current_dept') deptCode = currentUserDept || 'all';
      else if (field.dataScope === 'specific_dept') deptCode = field.specificDept || 'lck';

      const res = await customFormService.getUniversalTrackerFeed({
        source: field.trackerSource || field.type,
        date: targetDate,
        department_code: deptCode,
        form_code: field.linkedFormCode
      });

      if (res && res.success) {
        setData(res);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Error loading tracker widget feed:', err);
      setErrorMsg('Không thể tải dữ liệu theo dõi thời gian thực.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [field.type, field.trackerSource, field.dataScope, field.specificDept, field.linkedFormCode, targetDate]);

  const handleShiftDate = (days) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + days);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setTargetDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: `1.5px solid ${themeColor}33`,
      boxShadow: '0 4px 20px rgba(15, 44, 89, 0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. TOP TRACKER HEADER BAR */}
      <div style={{
        background: `linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)`,
        padding: '0.85rem 1.25rem',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1rem'
          }}>
            {field.type === 'tracker_overtime' && <FaUsers />}
            {field.type === 'tracker_clinical_stats' && <FaHeartbeat />}
            {field.type === 'tracker_clinical_cases' && <FaProcedures />}
            {field.type === 'tracker_linked_form' && <FaTable />}
          </span>
          <div>
            <div style={{ fontWeight: '900', fontSize: '0.95rem', letterSpacing: '0.3px' }}>
              {field.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#93C5FD', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Nguồn: {field.dataScope === 'all' ? 'Toàn viện' : field.dataScope === 'current_dept' ? 'Khoa hiện tại' : `Khoa ${field.specificDept}`}</span>
              {field.helpText && <span>• {field.helpText}</span>}
            </div>
          </div>
        </div>

        {/* Date Filter Controls */}
        {field.allowDateFilter !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.6rem', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: '800', padding: '0.2rem 0.4rem' }}
              title="Ngày trước"
            >
              ◀
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: '800' }}>
              <FaCalendarAlt style={{ color: '#38BDF8' }} />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: '800', padding: '0.2rem 0.4rem' }}
              title="Ngày sau"
            >
              ▶
            </button>

            <button
              type="button"
              onClick={handleSetToday}
              style={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer',
                marginLeft: '0.2rem'
              }}
            >
              Hôm nay
            </button>

            <button
              type="button"
              onClick={fetchData}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.2rem' }}
              title="Làm mới dữ liệu"
            >
              <FaSync className={loading ? 'fa-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* 2. BODY CONTENT */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <FaSync className="fa-spin" style={{ fontSize: '1.5rem', color: themeColor }} />
            <span style={{ fontSize: '0.86rem', fontWeight: '700' }}>Đang nạp dữ liệu theo dõi trực tiếp...</span>
          </div>
        ) : errorMsg ? (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.85rem 1rem', color: '#DC2626', fontSize: '0.84rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaExclamationTriangle /> {errorMsg}
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* A. TRACKER: OVERTIME STAFF (CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ)           */}
            {/* ========================================================================= */}
            {field.type === 'tracker_overtime' && (() => {
              const staffList = Array.isArray(data?.data) ? data.data : [];

              // Map departments and counts for fast synthesis
              const deptsMap = {};
              staffList.forEach(s => {
                const dName = s.department_name || s.department_code || 'Khác';
                deptsMap[dName] = (deptsMap[dName] || 0) + 1;
              });
              const deptEntries = Object.entries(deptsMap).sort((a, b) => b[1] - a[1]);

              // Filtered list by search and department filter
              const filtered = staffList.filter(s => {
                const dName = s.department_name || s.department_code || 'Khác';
                if (selectedOvertimeDept !== 'all' && dName !== selectedOvertimeDept) return false;
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (s.staff_name || '').toLowerCase().includes(q) ||
                  (s.department_name || '').toLowerCase().includes(q) ||
                  (s.doctor_name || '').toLowerCase().includes(q) ||
                  (s.time || '').toLowerCase().includes(q) ||
                  (s.room || '').toLowerCase().includes(q);
              });

              // Group by department for grouped view
              const groupedByDept = {};
              filtered.forEach(s => {
                const dName = s.department_name || s.department_code || 'Khác';
                if (!groupedByDept[dName]) groupedByDept[dName] = [];
                groupedByDept[dName].push(s);
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* 1. TOP EXECUTIVE BAR: METRICS, VIEW MODES & ACTIONS */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '0.75rem 1rem'
                  }}>
                    {/* Left: Summary Metrics */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <FaUsers style={{ color: '#2563EB' }} /> Tổng: <strong>{staffList.length} cán bộ</strong>
                      </span>

                      <span style={{
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#065F46',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <FaHospital style={{ color: '#10B981' }} /> <strong>{deptEntries.length} khoa phòng</strong>
                      </span>

                      <span style={{
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        color: '#92400E',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <FaCalendarAlt style={{ color: '#D97706' }} /> Ngày {formatDateVN(targetDate)}
                      </span>
                    </div>

                    {/* Right: View Mode Toggle & Excel / Print */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* View Switcher */}
                      <div style={{
                        display: 'flex',
                        backgroundColor: '#E2E8F0',
                        padding: '3px',
                        borderRadius: '10px',
                        gap: '2px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setOvertimeViewMode('table')}
                          style={{
                            backgroundColor: overtimeViewMode === 'table' ? '#0F2C59' : 'transparent',
                            color: overtimeViewMode === 'table' ? '#FFFFFF' : '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Chế độ Bảng Tổng Hợp Chi Tiết (Khuyên dùng)"
                        >
                          <FaTable /> Bảng Tổng Hợp
                        </button>

                        <button
                          type="button"
                          onClick={() => setOvertimeViewMode('grouped')}
                          style={{
                            backgroundColor: overtimeViewMode === 'grouped' ? '#0F2C59' : 'transparent',
                            color: overtimeViewMode === 'grouped' ? '#FFFFFF' : '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Gom nhóm danh sách theo từng Khoa/Phòng"
                        >
                          <FaLayerGroup /> Theo Khoa
                        </button>

                        <button
                          type="button"
                          onClick={() => setOvertimeViewMode('cards')}
                          style={{
                            backgroundColor: overtimeViewMode === 'cards' ? '#0F2C59' : 'transparent',
                            color: overtimeViewMode === 'cards' ? '#FFFFFF' : '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Hiển thị dạng thẻ lưới trực quan"
                        >
                          <FaThLarge /> Dạng Thẻ
                        </button>
                      </div>

                      {/* Export Excel */}
                      <button
                        type="button"
                        onClick={() => handleExportOvertimeExcel(filtered, targetDate)}
                        style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                        }}
                        title="Xuất bảng Excel cán bộ thêm giờ ngày hiện tại"
                      >
                        <FaFileExcel /> Xuất Excel
                      </button>

                      {/* Print */}
                      <button
                        type="button"
                        onClick={() => window.print()}
                        style={{
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="In danh sách cán bộ thêm giờ"
                      >
                        <FaPrint /> In
                      </button>
                    </div>
                  </div>

                  {/* 2. SEARCH & DEPARTMENT FILTER CHIPS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {/* Search Input */}
                      <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                        <FaSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }} />
                        <input
                          type="text"
                          placeholder="Tìm cán bộ, khoa, lý do, bác sĩ..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                            borderRadius: '10px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.82rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: '#FFFFFF'
                          }}
                        />
                      </div>

                      {searchQuery && (
                        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>
                          Tìm thấy: <strong style={{ color: '#2563EB' }}>{filtered.length}</strong> / {staffList.length} cán bộ
                        </div>
                      )}
                    </div>

                    {/* Department Filter Chips */}
                    {deptEntries.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
                          <FaFilter style={{ color: '#2563EB' }} /> Lọc Khoa:
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedOvertimeDept('all')}
                          style={{
                            backgroundColor: selectedOvertimeDept === 'all' ? '#0F2C59' : '#FFFFFF',
                            color: selectedOvertimeDept === 'all' ? '#FFFFFF' : '#334155',
                            border: selectedOvertimeDept === 'all' ? '1.5px solid #0F2C59' : '1px solid #CBD5E1',
                            borderRadius: '20px',
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.76rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Tất cả ({staffList.length})
                        </button>

                        {deptEntries.map(([dName, count]) => {
                          const badge = getDeptBadgeStyle(dName);
                          const isSelected = selectedOvertimeDept === dName;
                          return (
                            <button
                              key={dName}
                              type="button"
                              onClick={() => setSelectedOvertimeDept(isSelected ? 'all' : dName)}
                              style={{
                                backgroundColor: isSelected ? badge.text : badge.bg,
                                color: isSelected ? '#FFFFFF' : badge.text,
                                border: `1.5px solid ${badge.border}`,
                                borderRadius: '20px',
                                padding: '0.2rem 0.65rem',
                                fontSize: '0.76rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{badge.icon}</span>
                              <span>{dName}</span>
                              <span style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                                color: isSelected ? '#FFFFFF' : badge.text,
                                padding: '0 5px',
                                borderRadius: '10px',
                                fontSize: '0.7rem'
                              }}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. MAIN DATA RENDERING */}
                  {filtered.length === 0 ? (
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '16px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      color: '#64748B'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☕</div>
                      <div style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0F2C59' }}>
                        Không có cán bộ trực tăng cường hoặc thêm giờ nào
                      </div>
                      <div style={{ fontSize: '0.84rem', marginTop: '0.25rem' }}>
                        {selectedOvertimeDept !== 'all' ? `Tại khoa "${selectedOvertimeDept}" vào ngày ${formatDateVN(targetDate)}.` : `Trong ngày ${formatDateVN(targetDate)}.`}
                      </div>
                    </div>
                  ) : overtimeViewMode === 'table' ? (
                    /* ----------------------------------------------------------------- */
                    /* VIEW MODE 1: EXECUTIVE TABLE VIEW (DEFAULT - DỄ NHÌN, DỄ TỔNG HỢP)  */
                    /* ----------------------------------------------------------------- */
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid #E2E8F0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
                    }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                          <thead>
                            <tr style={{
                              background: 'linear-gradient(135deg, #0F2C59 0%, #1E3A8A 100%)',
                              color: '#FFFFFF'
                            }}>
                              <th style={{ padding: '0.85rem 0.75rem', width: '48px', textAlign: 'center', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>STT</th>
                              <th style={{ padding: '0.85rem 1rem', width: '22%', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>KHOA / PHÒNG</th>
                              <th style={{ padding: '0.85rem 1rem', width: '20%', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>CÁN BỘ TĂNG CƯỜNG</th>
                              <th style={{ padding: '0.85rem 1rem', width: '14%', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>THỜI GIAN</th>
                              <th style={{ padding: '0.85rem 1rem', width: '24%', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>NỘI DUNG / LÝ DO TĂNG CƯỜNG</th>
                              <th style={{ padding: '0.85rem 1rem', width: '13%', fontWeight: '800', borderRight: '1px solid rgba(255,255,255,0.1)' }}>BÁC SĨ TRỰC</th>
                              <th style={{ padding: '0.85rem 0.75rem', width: '7%', textAlign: 'center', fontWeight: '800' }}>PHÒNG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((s, idx) => {
                              const badge = getDeptBadgeStyle(s.department_name);
                              const parsed = parseOvertimeTimeAndReason(s.time);
                              const isEven = idx % 2 === 0;
                              return (
                                <tr
                                  key={idx}
                                  style={{
                                    borderBottom: '1px solid #E2E8F0',
                                    backgroundColor: isEven ? '#FFFFFF' : '#F8FAFC',
                                    transition: 'background-color 0.15s ease'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEven ? '#FFFFFF' : '#F8FAFC'}
                                >
                                  {/* STT */}
                                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: '800', color: '#64748B' }}>
                                    {idx + 1}
                                  </td>

                                  {/* Khoa/Phòng */}
                                  <td style={{ padding: '0.85rem 1rem' }}>
                                    <span style={{
                                      backgroundColor: badge.bg,
                                      color: badge.text,
                                      border: `1px solid ${badge.border}`,
                                      borderRadius: '8px',
                                      padding: '0.3rem 0.65rem',
                                      fontSize: '0.78rem',
                                      fontWeight: '800',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem'
                                    }}>
                                      <span>{badge.icon}</span>
                                      <span>{s.department_name || s.department_code}</span>
                                    </span>
                                  </td>

                                  {/* Họ Tên Cán Bộ */}
                                  <td style={{ padding: '0.85rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                      <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: '#EFF6FF',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.78rem',
                                        flexShrink: 0
                                      }}>
                                        <FaUserMd />
                                      </div>
                                      <strong style={{ fontSize: '0.94rem', color: '#0F2C59' }}>
                                        {s.staff_name}
                                      </strong>
                                    </div>
                                  </td>

                                  {/* Thời Gian / Số Giờ */}
                                  <td style={{ padding: '0.85rem 1rem' }}>
                                    <span style={{
                                      backgroundColor: '#FEF3C7',
                                      color: '#92400E',
                                      border: '1px solid #FDE68A',
                                      borderRadius: '8px',
                                      padding: '0.3rem 0.65rem',
                                      fontSize: '0.82rem',
                                      fontWeight: '800',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      <FaClock style={{ fontSize: '0.75rem', color: '#D97706' }} />
                                      {parsed.time}
                                    </span>
                                  </td>

                                  {/* Nội Dung / Lý Do Tăng Cường */}
                                  <td style={{ padding: '0.85rem 1rem' }}>
                                    {parsed.reason && parsed.reason !== '—' ? (
                                      <div style={{
                                        color: '#1E293B',
                                        fontWeight: '600',
                                        lineHeight: 1.4,
                                        backgroundColor: '#F1F5F9',
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0'
                                      }}>
                                        {parsed.reason}
                                      </div>
                                    ) : (
                                      <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                        (Trực tăng cường thường quy ca trực)
                                      </span>
                                    )}
                                  </td>

                                  {/* Bác Sĩ Trực Ca */}
                                  <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '700' }}>
                                    {s.doctor_name || '—'}
                                  </td>

                                  {/* Phòng */}
                                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                    {s.room !== '—' && s.room ? s.room : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : overtimeViewMode === 'grouped' ? (
                    /* ----------------------------------------------------------------- */
                    /* VIEW MODE 2: GROUPED BY DEPARTMENT (GOM NHÓM THEO KHOA/PHÒNG)     */
                    /* ----------------------------------------------------------------- */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {Object.entries(groupedByDept).map(([dName, dStaffList]) => {
                        const badge = getDeptBadgeStyle(dName);
                        return (
                          <div
                            key={dName}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '16px',
                              border: `1.5px solid ${badge.border}`,
                              borderLeft: `6px solid ${badge.text}`,
                              boxShadow: '0 3px 12px rgba(15, 44, 89, 0.04)',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Department Card Header */}
                            <div style={{
                              backgroundColor: badge.bg,
                              padding: '0.75rem 1.25rem',
                              borderBottom: `1px solid ${badge.border}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
                                <span style={{ fontWeight: '900', color: badge.text, fontSize: '0.96rem', textTransform: 'uppercase' }}>
                                  {dName}
                                </span>
                                <span style={{
                                  backgroundColor: '#FFFFFF',
                                  color: badge.text,
                                  fontWeight: '800',
                                  fontSize: '0.74rem',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '20px',
                                  border: `1px solid ${badge.border}`
                                }}>
                                  {dStaffList.length} cán bộ
                                </span>
                              </div>

                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                BS trực ca: <strong style={{ color: '#0F2C59' }}>{dStaffList[0]?.doctor_name || '—'}</strong>
                              </div>
                            </div>

                            {/* Department Staff Rows */}
                            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {dStaffList.map((s, sIdx) => {
                                const parsed = parseOvertimeTimeAndReason(s.time);
                                return (
                                  <div
                                    key={sIdx}
                                    style={{
                                      backgroundColor: '#F8FAFC',
                                      borderRadius: '12px',
                                      border: '1px solid #E2E8F0',
                                      padding: '0.75rem 1rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                      gap: '0.75rem'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: '#EFF6FF',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem'
                                      }}>
                                        <FaUserMd />
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: '900', fontSize: '0.94rem', color: '#0F2C59' }}>
                                          {s.staff_name}
                                        </div>
                                        {parsed.reason && parsed.reason !== '—' && (
                                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                                            📝 {parsed.reason}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                      <span style={{
                                        backgroundColor: '#FEF3C7',
                                        color: '#92400E',
                                        border: '1px solid #FDE68A',
                                        borderRadius: '8px',
                                        padding: '0.3rem 0.65rem',
                                        fontSize: '0.82rem',
                                        fontWeight: '800'
                                      }}>
                                        ⏰ {parsed.time}
                                      </span>

                                      {s.room && s.room !== '—' && (
                                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                                          Phòng: {s.room}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ----------------------------------------------------------------- */
                    /* VIEW MODE 3: MODERN GRID CARDS VIEW (THẺ LƯỚI TRỰC QUAN HIỆN ĐẠI)  */
                    /* ----------------------------------------------------------------- */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.85rem' }}>
                      {filtered.map((s, sIdx) => {
                        const badge = getDeptBadgeStyle(s.department_name);
                        const parsed = parseOvertimeTimeAndReason(s.time);
                        return (
                          <div
                            key={sIdx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid #E2E8F0',
                              borderLeft: `5px solid ${badge.text}`,
                              borderRadius: '14px',
                              padding: '0.9rem 1.1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.55rem',
                              boxShadow: '0 3px 10px rgba(15, 44, 89, 0.04)',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 44, 89, 0.08)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(15, 44, 89, 0.04)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{
                                backgroundColor: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`,
                                borderRadius: '6px',
                                padding: '0.2rem 0.55rem',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                <span>{badge.icon}</span>
                                <span>{s.department_name || s.department_code}</span>
                              </span>

                              <span style={{
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FDE68A',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '800'
                              }}>
                                ⏰ {parsed.time}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.15rem' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                flexShrink: 0
                              }}>
                                <FaUserMd />
                              </div>
                              <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59' }}>
                                {s.staff_name}
                              </span>
                            </div>

                            {parsed.reason && parsed.reason !== '—' && (
                              <div style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                padding: '0.4rem 0.6rem',
                                fontSize: '0.8rem',
                                color: '#334155',
                                fontWeight: '600',
                                lineHeight: 1.35
                              }}>
                                📝 {parsed.reason}
                              </div>
                            )}

                            <div style={{
                              fontSize: '0.76rem',
                              color: '#64748B',
                              display: 'flex',
                              justifyContent: 'space-between',
                              borderTop: '1px solid #F1F5F9',
                              paddingTop: '0.45rem',
                              marginTop: 'auto'
                            }}>
                              <span>BS trực: <strong style={{ color: '#334155' }}>{s.doctor_name || '—'}</strong></span>
                              <span>Phòng: <strong style={{ color: '#334155' }}>{s.room || '—'}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* B. TRACKER: CLINICAL STATS (THỐNG KÊ 4 LOẠI CA BỆNH)                      */}
            {/* ========================================================================= */}
            {field.type === 'tracker_clinical_stats' && (() => {
              const summary = data?.summary || { total_cases: 0, total_transfer: 0, total_surgery: 0, total_death: 0, total_critical: 0 };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    
                    {/* 1. Transfer */}
                    <div style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderLeft: '5px solid #D97706', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        <FaAmbulance />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>Chuyển Viện</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#78350F', lineHeight: 1.1 }}>{summary.total_transfer} <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ca</span></div>
                      </div>
                    </div>

                    {/* 2. Surgery */}
                    <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderLeft: '5px solid #2563EB', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        <FaProcedures />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase' }}>Phẫu Thuật</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E3A8A', lineHeight: 1.1 }}>{summary.total_surgery} <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ca</span></div>
                      </div>
                    </div>

                    {/* 3. Critical */}
                    <div style={{ backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE', borderLeft: '5px solid #7C3AED', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        <FaHeartbeat />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#5B21B6', textTransform: 'uppercase' }}>Bệnh Nặng Theo Dõi</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4C1D95', lineHeight: 1.1 }}>{summary.total_critical} <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ca</span></div>
                      </div>
                    </div>

                    {/* 4. Death */}
                    <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderLeft: '5px solid #DC2626', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        <FaSkullCrossbones />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase' }}>Tử Vong</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#7F1D1D', lineHeight: 1.1 }}>{summary.total_death} <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ca</span></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* C. TRACKER: CLINICAL CASES TABLE & EXPANDABLE DETAILS                    */}
            {/* ========================================================================= */}
            {field.type === 'tracker_clinical_cases' && (() => {
              const allCases = data?.data || { transferCases: [], surgeryCases: [], deathCases: [], criticalCases: [] };
              
              const transferList = (allCases.transferCases || []).map(c => ({ ...c, _caseType: 'transfer', _typeLabel: 'Chuyển viện', _badgeColor: '#D97706', _badgeBg: '#FEF3C7' }));
              const surgeryList = (allCases.surgeryCases || []).map(c => ({ ...c, _caseType: 'surgery', _typeLabel: 'Phẫu thuật', _badgeColor: '#2563EB', _badgeBg: '#DBEAFE' }));
              const criticalList = (allCases.criticalCases || []).map(c => ({ ...c, _caseType: 'critical', _typeLabel: 'Bệnh nặng', _badgeColor: '#7C3AED', _badgeBg: '#EDE9FE' }));
              const deathList = (allCases.deathCases || []).map(c => ({ ...c, _caseType: 'death', _typeLabel: 'Tử vong', _badgeColor: '#DC2626', _badgeBg: '#FEE2E2' }));

              let combined = [];
              if (activeCaseTab === 'all') combined = [...transferList, ...surgeryList, ...criticalList, ...deathList];
              else if (activeCaseTab === 'transfer') combined = transferList;
              else if (activeCaseTab === 'surgery') combined = surgeryList;
              else if (activeCaseTab === 'critical') combined = criticalList;
              else if (activeCaseTab === 'death') combined = deathList;

              const filtered = combined.filter(c => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (c.patient_name || c.patientName || '').toLowerCase().includes(q) ||
                  (c.diagnosis || '').toLowerCase().includes(q) ||
                  (c.department_name || '').toLowerCase().includes(q) ||
                  (c.address || '').toLowerCase().includes(q);
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Tabs & Search Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `Tất cả (${transferList.length + surgeryList.length + criticalList.length + deathList.length})` },
                        { id: 'transfer', label: `🚑 Chuyển (${transferList.length})` },
                        { id: 'surgery', label: `🔪 Mổ (${surgeryList.length})` },
                        { id: 'critical', label: `⚠️ Nặng (${criticalList.length})` },
                        { id: 'death', label: `⚰️ Tử vong (${deathList.length})` }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveCaseTab(tab.id)}
                          style={{
                            backgroundColor: activeCaseTab === tab.id ? '#0F2C59' : '#F1F5F9',
                            color: activeCaseTab === tab.id ? '#FFFFFF' : '#475569',
                            border: '1px solid ' + (activeCaseTab === tab.id ? '#0F2C59' : '#CBD5E1'),
                            borderRadius: '8px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ minWidth: '220px', position: 'relative' }}>
                      <FaSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.78rem' }} />
                      <input
                        type="text"
                        placeholder="Tìm bệnh nhân, chẩn đoán..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem 0.65rem 0.4rem 2rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.84rem' }}>
                      Không có ca bệnh nào thuộc nhóm này trong ngày {formatDateVN(targetDate)}.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {filtered.map((c, idx) => {
                        const isExpanded = expandedCaseId === `${c._caseType}_${c.id || idx}`;
                        const patientName = c.patient_name || c.patientName || 'Bệnh nhân';
                        const ageStr = formatPatientAge(c.birth_year || c.birthYear || c.age);

                        return (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: `1.5px solid ${isExpanded ? c._badgeColor : '#E2E8F0'}`,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Card Header Summary */}
                            <div
                              onClick={() => setExpandedCaseId(isExpanded ? null : `${c._caseType}_${c.id || idx}`)}
                              style={{
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                gap: '0.75rem',
                                flexWrap: 'wrap',
                                backgroundColor: isExpanded ? `${c._badgeBg}88` : '#FFFFFF'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
                                <span style={{
                                  backgroundColor: c._badgeBg,
                                  color: c._badgeColor,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: '800',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {c._typeLabel}
                                </span>

                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59' }}>
                                    {patientName} {ageStr && <span style={{ color: '#64748B', fontWeight: '700', fontSize: '0.82rem' }}>({ageStr})</span>}
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <span>🏢 {c.department_name}</span>
                                    {c.address && <span>• 📍 {c.address}</span>}
                                    {(c.admission_time || c.admissionTime) && <span>• ⏰ Vào: {c.admission_time || c.admissionTime}</span>}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ textAlign: 'right', maxWidth: '320px' }}>
                                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E40AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.diagnosis || c.preoperative_diagnosis || c.preoperativeDiagnosis || 'Chưa có chẩn đoán'}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>
                                    {c.current_status || c.currentStatus || c.final_outcome || 'Đang theo dõi'}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#64748B',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Clinical Box */}
                            {isExpanded && (
                              <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                                  {/* Col 1 */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                    <div><strong style={{ color: '#0F2C59' }}>Lý do vào viện:</strong> <span style={{ color: '#334155' }}>{c.reason || c.admission_status || c.admissionStatus || '—'}</span></div>
                                    <div><strong style={{ color: '#0F2C59' }}>Tiền sử bệnh:</strong> <span style={{ color: '#334155' }}>{c.medical_history || c.medicalHistory || '—'}</span></div>
                                    <div><strong style={{ color: '#0F2C59' }}>Lâm sàng & Sinh hiệu:</strong> <span style={{ color: '#334155' }}>{c.clinical_symptoms || c.clinicalSymptoms || '—'}</span></div>
                                    <div><strong style={{ color: '#0F2C59' }}>Cận lâm sàng / X-Quang / XN:</strong> <span style={{ color: '#334155' }}>{c.clinical_tests || c.clinicalTests || '—'}</span></div>
                                  </div>

                                  {/* Col 2 */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                    <div><strong style={{ color: '#0F2C59' }}>Chẩn đoán xác định:</strong> <span style={{ color: '#2563EB', fontWeight: '800' }}>{c.diagnosis || c.preoperative_diagnosis || c.preoperativeDiagnosis || '—'}</span></div>
                                    {c.postoperative_diagnosis && <div><strong style={{ color: '#0F2C59' }}>Chẩn đoán sau mổ:</strong> <span style={{ color: '#16A34A', fontWeight: '700' }}>{c.postoperative_diagnosis}</span></div>}
                                    <div><strong style={{ color: '#0F2C59' }}>Xử trí & Điều trị:</strong> <span style={{ color: '#334155' }}>{c.initial_treatment || c.initialTreatment || c.emergency_treatment || c.emergencyTreatment || c.treatment || c.consultation_order || c.consultationOrder || '—'}</span></div>
                                    <div><strong style={{ color: '#0F2C59' }}>Diễn biến / Ghi chú:</strong> <span style={{ color: '#334155' }}>{c.progress_notes || c.progressNotes || c.condition_summary || c.conditionSummary || c.final_outcome || c.notes || '—'}</span></div>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* D. TRACKER: LINKED FORM SUBMISSIONS                                       */}
            {/* ========================================================================= */}
            {field.type === 'tracker_linked_form' && (() => {
              const submissions = Array.isArray(data?.data) ? data.data : [];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F2C59' }}>
                    Biểu mẫu: <strong>{data?.form?.title || field.linkedFormCode || 'Biểu mẫu liên kết'}</strong> ({submissions.length} bản ghi ngày {formatDateVN(targetDate)})
                  </div>

                  {submissions.length === 0 ? (
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.84rem' }}>
                      Chưa có bản ghi nào được nộp cho biểu mẫu này vào ngày {formatDateVN(targetDate)}.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                            <th style={{ padding: '0.6rem 0.75rem', color: '#0F2C59', fontWeight: '800' }}>STT</th>
                            <th style={{ padding: '0.6rem 0.75rem', color: '#0F2C59', fontWeight: '800' }}>Người nộp / Khoa</th>
                            <th style={{ padding: '0.6rem 0.75rem', color: '#0F2C59', fontWeight: '800' }}>Thời gian gửi</th>
                            <th style={{ padding: '0.6rem 0.75rem', color: '#0F2C59', fontWeight: '800' }}>Dữ liệu bản ghi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((sub, sIdx) => (
                            <tr key={sIdx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: sIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: '800' }}>{sIdx + 1}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <div style={{ fontWeight: '800', color: '#0F2C59' }}>{sub.user_full_name || sub.submitted_by_user}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{sub.department_name}</div>
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', color: '#64748B' }}>
                                {new Date(sub.created_at).toLocaleTimeString('vi-VN')}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  {Object.entries(sub.submission_data || {}).slice(0, 4).map(([k, v], vIdx) => (
                                    <span key={vIdx} style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.74rem' }}>
                                      <strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

          </>
        )}

      </div>

    </div>
  );
};

export default EmbeddedTrackerField;
