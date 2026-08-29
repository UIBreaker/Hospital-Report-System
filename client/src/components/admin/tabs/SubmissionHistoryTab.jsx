import React, { useState, useEffect, useMemo } from 'react';
import {
  FaHistory,
  FaCalendarAlt,
  FaHospital,
  FaUserMd,
  FaUserNurse,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaEye,
  FaLock,
  FaUnlock,
  FaFileAlt,
  FaDownload,
  FaFileExcel,
  FaTimes,
  FaSync,
  FaUser,
  FaEdit,
  FaProcedures,
  FaAmbulance,
  FaHeartbeat,
  FaCross,
  FaLayerGroup,
  FaWpforms
} from 'react-icons/fa';
import submissionHistoryService from '../../../services/submissionHistoryService';
import MedicalLoader from '../../common/MedicalLoader';
import CountUpNumber from '../../common/CountUpNumber';

const parseUtcDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val).trim();
  if (!s) return null;
  // If MySQL format "YYYY-MM-DD HH:mm:ss" or ISO without timezone indicator, treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
    return new Date(s.replace(' ', 'T') + 'Z');
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatTimeVN = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = parseUtcDate(dateInput);
    if (!d) return String(dateInput);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} — ${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
};

const getRelativeTimeVN = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = parseUtcDate(dateInput);
    if (!d) return '';
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Vừa nộp';
    if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
    return formatDateVN(d.toISOString().split('T')[0]);
  } catch {
    return '';
  }
};

const SubmissionHistoryTab = ({ onViewReportDetail, onPrintReport }) => {
  // Sub-Tab: 'shift_reports' (12 Khoa) | 'custom_forms' (Biểu Mẫu Tùy Chỉnh)
  const [subTab, setSubTab] = useState('shift_reports');

  // Common Date Filter
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [filterDate, setFilterDate] = useState(yesterday);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);

  // Search & Filter State
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFormCode, setSelectedFormCode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Data State
  const [loading, setLoading] = useState(true);
  const [shiftData, setShiftData] = useState({ history: [], matrix12Depts: [], summary: null });
  const [customData, setCustomData] = useState({ history: [], formsList: [], summary: null });

  // Detail Modal for Custom Form Submissions
  const [viewingCustomSubmission, setViewingCustomSubmission] = useState(null);

  // Fetch Shift Reports History
  const fetchShiftHistory = async () => {
    setLoading(true);
    try {
      const params = {
        departmentCode: selectedDept,
        searchTerm: searchTerm.trim(),
        status: selectedStatus
      };
      if (useDateRange) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.date = filterDate;
      }

      const res = await submissionHistoryService.getShiftReportHistory(params);
      if (res && res.success) {
        setShiftData(res.data);
      }
    } catch (err) {
      console.error('Error loading shift reports history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Custom Forms History
  const fetchCustomHistory = async () => {
    setLoading(true);
    try {
      const params = {
        formCode: selectedFormCode,
        departmentCode: selectedDept,
        searchTerm: searchTerm.trim()
      };
      if (useDateRange) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.date = filterDate;
      }

      const res = await submissionHistoryService.getCustomFormsHistory(params);
      if (res && res.success) {
        setCustomData(res.data);
      }
    } catch (err) {
      console.error('Error loading custom forms history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'shift_reports') {
      fetchShiftHistory();
    } else {
      fetchCustomHistory();
    }
  }, [subTab, filterDate, useDateRange, startDate, endDate, selectedDept, selectedStatus, selectedFormCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (subTab === 'shift_reports') fetchShiftHistory();
    else fetchCustomHistory();
  };

  // Render Preset / Avatar Helper
  const renderAvatarThumb = (avatarUrl, name = '', size = 28) => {
    if (!avatarUrl) {
      return (
        <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${size * 0.45}px`, flexShrink: 0 }}>
          <FaUser />
        </div>
      );
    }
    if (avatarUrl.startsWith('preset_')) {
      const icons = {
        preset_doc_m: '👨‍⚕️',
        preset_doc_f: '👩‍⚕️',
        preset_nurse_m: '🧑‍⚕️',
        preset_nurse_f: '👩‍⚕️',
        preset_surgeon: '😷',
        preset_admin: '🏛️',
        preset_tech: '🔬',
        preset_hospital: '🏥'
      };
      return (
        <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${size * 0.6}px`, flexShrink: 0 }}>
          {icons[avatarUrl] || '👨‍⚕️'}
        </div>
      );
    }
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #CBD5E1' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP SUB-TAB SWITCHER */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #E2E8F0',
        padding: '8px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)'
      }}>
        <button
          type="button"
          onClick={() => setSubTab('shift_reports')}
          style={{
            flex: 1,
            backgroundColor: subTab === 'shift_reports' ? '#0F2C59' : 'transparent',
            color: subTab === 'shift_reports' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            fontWeight: '900',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            boxShadow: subTab === 'shift_reports' ? '0 6px 20px rgba(15, 44, 89, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FaHospital style={{ color: subTab === 'shift_reports' ? '#38BDF8' : '#2563EB', fontSize: '1.15rem' }} />
          🏥 1. LỊCH SỬ GIAO BAN 12 KHOA PHÒNG
        </button>

        <button
          type="button"
          onClick={() => setSubTab('custom_forms')}
          style={{
            flex: 1,
            backgroundColor: subTab === 'custom_forms' ? '#0F2C59' : 'transparent',
            color: subTab === 'custom_forms' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            fontWeight: '900',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            boxShadow: subTab === 'custom_forms' ? '0 6px 20px rgba(15, 44, 89, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FaWpforms style={{ color: subTab === 'custom_forms' ? '#38BDF8' : '#10B981', fontSize: '1.15rem' }} />
          📝 2. LỊCH SỬ BIỂU MẪU TÙY CHỈNH (CUSTOM FORMS)
        </button>
      </div>

      {/* 2. FILTER CONTROLS BAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #E2E8F0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Date Picker Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setUseDateRange(false)}
                style={{
                  backgroundColor: !useDateRange ? '#FFFFFF' : 'transparent',
                  color: !useDateRange ? '#0F2C59' : '#64748B',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: !useDateRange ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                1 Ngày Cố Định
              </button>
              <button
                type="button"
                onClick={() => setUseDateRange(true)}
                style={{
                  backgroundColor: useDateRange ? '#FFFFFF' : 'transparent',
                  color: useDateRange ? '#0F2C59' : '#64748B',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: useDateRange ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Khoảng Ngày
              </button>
            </div>

            {!useDateRange ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59' }}>Ngày:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '9px',
                    border: '1.5px solid #CBD5E1',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    color: '#0F2C59'
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59' }}>Từ:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontWeight: '700', fontSize: '0.86rem' }}
                />
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59' }}>Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontWeight: '700', fontSize: '0.86rem' }}
                />
              </div>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.45rem', flex: 1, maxWidth: '380px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={subTab === 'shift_reports' ? "Tìm theo Bác sĩ, ĐD, Tên khoa..." : "Tìm theo người nộp, @username, form..."}
                style={{
                  width: '100%',
                  padding: '0.48rem 0.75rem 0.48rem 2rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.48rem 0.95rem',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Tìm
            </button>
          </form>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={subTab === 'shift_reports' ? fetchShiftHistory : fetchCustomHistory}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              borderRadius: '10px',
              padding: '0.48rem 0.85rem',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaSync /> Làm mới
          </button>
        </div>

        {/* Sub-Filters specific to each sub-tab */}
        {subTab === 'custom_forms' && customData.formsList?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59' }}>Chọn Mẫu Biểu Mẫu:</span>
            <select
              value={selectedFormCode}
              onChange={(e) => setSelectedFormCode(e.target.value)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontWeight: '700',
                fontSize: '0.84rem',
                color: '#0F2C59',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="all">❖ Tất Cả Biểu Mẫu ({customData.formsList.length})</option>
              {customData.formsList.map(f => (
                <option key={f.id} value={f.code}>
                  {f.title} ({f.total_submissions || 0} bản ghi)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LỊCH SỬ GIAO BAN 12 KHOA PHÒNG                                */}
      {/* ========================================================================= */}
      {subTab === 'shift_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 12-Department Status Matrix for Selected Date */}
          {!useDateRange && shiftData.matrix12Depts?.length > 0 && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FaCalendarAlt style={{ color: '#2563EB', fontSize: '1.1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0F2C59' }}>
                    Tiến Độ Nộp Ca Trực Ngày {formatDateVN(filterDate)} (12 Khoa)
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.8rem' }}>
                    🟢 Đã nộp: <CountUpNumber value={shiftData.summary?.totalSubmitted || 0} duration={800} />/12
                  </span>
                  <span style={{ backgroundColor: shiftData.summary?.totalPending > 0 ? '#FEE2E2' : '#F1F5F9', color: shiftData.summary?.totalPending > 0 ? '#DC2626' : '#64748B', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.8rem' }}>
                    🔴 Chưa nộp: <CountUpNumber value={shiftData.summary?.totalPending || 0} duration={800} />
                  </span>
                </div>
              </div>

              {/* 12 Badges Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '0.75rem 0.95rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="analytics-shimmer" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                      <div className="analytics-shimmer" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {shiftData.matrix12Depts.map(dept => (
                    <div
                      key={dept.departmentCode}
                      style={{
                        backgroundColor: dept.isSubmitted ? '#F0FDF4' : '#FFF1F2',
                        border: `1.5px solid ${dept.isSubmitted ? '#86EFAC' : '#FECDD3'}`,
                        borderRadius: '14px',
                        padding: '0.75rem 0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '900', color: dept.isSubmitted ? '#166534' : '#9F1239' }}>
                          {dept.departmentName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: dept.isSubmitted ? '#15803D' : '#BE123C', marginTop: '2px' }}>
                          {dept.isSubmitted ? (
                            <>🕒 {formatTimeVN(dept.submittedAt).split('—')[0]} • {dept.doctorName || 'Đã nộp'}</>
                          ) : (
                            '⚠️ Chưa có báo cáo'
                          )}
                        </div>
                      </div>
                      {dept.isSubmitted && dept.isLocked && (
                        <span title="Đã khóa sổ" style={{ color: '#D97706', fontSize: '0.85rem' }}><FaLock /></span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shift Reports Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59' }}>
                DANH SÁCH LỊCH SỬ NỘP BÁO CÁO GIAO BAN (<CountUpNumber value={shiftData.history?.length || 0} duration={800} /> bản ghi)
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                Mỗi khoa nộp 1 báo cáo chuyên môn cho mỗi ngày trực
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="analytics-shimmer" style={{ width: '20%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '25%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '15%', height: '14px', borderRadius: '4px' }} />
                    <div className="analytics-shimmer" style={{ width: '15%', height: '14px', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : shiftData.history?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                <FaHospital style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>Không tìm thấy báo cáo ca trực nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', color: '#0F2C59', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', width: '22%' }}>Thời Gian Nộp</th>
                      <th style={{ padding: '0.75rem 1rem', width: '25%' }}>Khoa Phòng & Kíp Trực</th>
                      <th style={{ padding: '0.75rem 1rem', width: '15%' }}>Ngày Ca Trực</th>
                      <th style={{ padding: '0.75rem 1rem', width: '18%' }}>Ca Bệnh Đã Ghi Nhận</th>
                      <th style={{ padding: '0.75rem 1rem', width: '10%' }}>Trạng Thái</th>
                      <th style={{ padding: '0.75rem 1rem', width: '10%', textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftData.history.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        {/* 1. Time */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.88rem' }}>
                            {formatTimeVN(item.createdAt)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                            <FaClock style={{ color: '#2563EB' }} /> {getRelativeTimeVN(item.createdAt)}
                          </div>
                        </td>

                        {/* 2. Dept & Staff */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '900', color: '#1E40AF', fontSize: '0.92rem' }}>
                            {item.departmentName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '2px' }}>
                            <strong>BS:</strong> {item.doctorName || '—'} {item.nurseName ? `• ĐD: ${item.nurseName}` : ''}
                          </div>
                        </td>

                        {/* 3. Shift Date */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem' }}>
                            {formatDateVN(item.reportDate)}
                          </span>
                        </td>

                        {/* 4. Cases */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {item.caseCounts.surgery > 0 && <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>🔪 {item.caseCounts.surgery} mổ</span>}
                            {item.caseCounts.transfer > 0 && <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>🚑 {item.caseCounts.transfer} chuyển</span>}
                            {item.caseCounts.critical > 0 && <span style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>⚠️ {item.caseCounts.critical} nặng</span>}
                            {item.caseCounts.death > 0 && <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>⚰️ {item.caseCounts.death} tử vong</span>}
                            {item.caseCounts.total === 0 && <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Không có ca bệnh</span>}
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {item.isLocked ? (
                              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaLock /> Đã khóa
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaCheckCircle /> Đã nộp
                              </span>
                            )}
                            {item.editCount > 0 ? (
                              <span style={{ backgroundColor: '#FEF9C3', color: '#854D0E', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                                Sửa {item.editCount} lần
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                Bản gốc (Chưa sửa)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Action */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => onViewReportDetail && onViewReportDetail(item.departmentCode, item.reportDate)}
                              style={{
                                backgroundColor: '#2563EB',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.35rem 0.65rem',
                                fontWeight: '800',
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              title="Xem chi tiết báo cáo ca trực"
                            >
                              <FaEye /> Xem
                            </button>
                            <button
                              type="button"
                              onClick={() => onPrintReport && onPrintReport(item.departmentCode, item.reportDate)}
                              style={{
                                backgroundColor: '#F1F5F9',
                                color: '#0F2C59',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '0.35rem 0.55rem',
                                fontSize: '0.76rem',
                                cursor: 'pointer'
                              }}
                              title="In phiếu báo cáo giao ban"
                            >
                              🖨️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: LỊCH SỬ BIỂU MẪU TÙY CHỈNH (CUSTOM FORMS)                      */}
      {/* ========================================================================= */}
      {subTab === 'custom_forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 14px rgba(15,44,89,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                <FaWpforms />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>TỔNG BẢN GHI THEO BỘ LỌC</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F2C59' }}>{customData.summary?.totalSubmissions || 0}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 14px rgba(15,44,89,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                <FaCalendarAlt />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>NỘP TRONG HÔM NAY</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563EB' }}>{customData.summary?.todaySubmissionsCount || 0}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 14px rgba(15,44,89,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                <FaLayerGroup />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>MẪU BIỂU MẪU ĐANG CHẠY</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#D97706' }}>{customData.summary?.totalFormsActive || 0}</div>
              </div>
            </div>
          </div>

          {/* Custom Forms Log Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59' }}>
                DÒNG THỜI GIAN CÁC BẢN GHI BIỂU MẪU TÙY CHỈNH ({customData.history?.length || 0} bản ghi)
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                Ghi nhận theo thời gian thực từ các cán bộ / khoa phòng
              </span>
            </div>

            {loading ? (
              <MedicalLoader text="Đang tải lịch sử biểu mẫu..." minHeight="240px" />
            ) : customData.history?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                <FaWpforms style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>Chưa có bản ghi biểu mẫu tùy chỉnh nào theo bộ lọc.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', color: '#0F2C59', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', width: '22%' }}>Thời Gian Nộp</th>
                      <th style={{ padding: '0.75rem 1rem', width: '28%' }}>Tên Biểu Mẫu</th>
                      <th style={{ padding: '0.75rem 1rem', width: '25%' }}>Người Nộp & Khoa Phòng</th>
                      <th style={{ padding: '0.75rem 1rem', width: '13%' }}>Ngày Báo Cáo</th>
                      <th style={{ padding: '0.75rem 1rem', width: '12%', textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customData.history.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        {/* 1. Time */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.88rem' }}>
                            {formatTimeVN(sub.created_at)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                            <FaClock style={{ color: '#10B981' }} /> {getRelativeTimeVN(sub.created_at)}
                          </div>
                        </td>

                        {/* 2. Form Title & Code */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '900', color: '#0F2C59', fontSize: '0.92rem' }}>
                            {sub.form_title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#2563EB', fontWeight: '700' }}>
                              /{sub.form_code}
                            </span>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem' }}>
                              {sub.form_type === 'tracker' ? 'Data Tracker' : 'Phiếu Nhập'}
                            </span>
                          </div>
                        </td>

                        {/* 3. Submitter */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {renderAvatarThumb(sub.avatar_url, sub.submitted_by_name, 30)}
                            <div>
                              <div style={{ fontWeight: '800', color: '#0F2C59' }}>
                                {sub.submitted_by_name || sub.submitted_by_user}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                @{sub.submitted_by_user} {sub.department_name ? `• ${sub.department_name}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Report Date */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem' }}>
                            {formatDateVN(sub.submission_date)}
                          </span>
                        </td>

                        {/* 5. Action */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setViewingCustomSubmission(sub)}
                            style={{
                              backgroundColor: '#10B981',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.4rem 0.8rem',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            <FaEye /> Xem Bản Ghi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM CHI TIẾT BẢN GHI CUSTOM FORM SUBMISSION                       */}
      {/* ========================================================================= */}
      {viewingCustomSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0F2C59' }}>
                  {viewingCustomSubmission.form_title}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Mã form: <strong>/{viewingCustomSubmission.form_code}</strong> • Nộp lúc: {formatTimeVN(viewingCustomSubmission.created_at)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingCustomSubmission(null)}
                style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Submitter Info Card */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {renderAvatarThumb(viewingCustomSubmission.avatar_url, viewingCustomSubmission.submitted_by_name, 34)}
                <div>
                  <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.9rem' }}>
                    {viewingCustomSubmission.submitted_by_name} (@{viewingCustomSubmission.submitted_by_user})
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    {viewingCustomSubmission.department_name || 'Tài khoản cá nhân'}
                  </div>
                </div>
              </div>
              <span style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem' }}>
                Ngày: {formatDateVN(viewingCustomSubmission.submission_date)}
              </span>
            </div>

            {/* Form Data Fields */}
            <div>
              <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.92rem', fontWeight: '800', color: '#0F2C59' }}>
                Dữ Liệu Đã Điền Trong Bản Ghi:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(() => {
                  let parsed = {};
                  try {
                    parsed = typeof viewingCustomSubmission.submission_data === 'string'
                      ? JSON.parse(viewingCustomSubmission.submission_data)
                      : viewingCustomSubmission.submission_data;
                  } catch {
                    parsed = {};
                  }

                  const entries = Object.entries(parsed || {}).filter(([k]) => k !== '_id');
                  if (entries.length === 0) {
                    return <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>Không có dữ liệu chi tiết.</div>;
                  }

                  return entries.map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase' }}>
                        {key}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#0F2C59', fontWeight: '600' }}>
                        {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val || '—')}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setViewingCustomSubmission(null)}
                style={{
                  backgroundColor: '#0F2C59',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.6rem 1.5rem',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer'
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

export default SubmissionHistoryTab;
