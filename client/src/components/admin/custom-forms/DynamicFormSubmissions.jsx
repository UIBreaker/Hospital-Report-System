import React, { useState, useEffect, useMemo, useContext } from 'react';
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
  FaLayerGroup,
  FaUserMd,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaStethoscope,
  FaNotesMedical,
  FaFilePdf,
  FaRegFileAlt,
  FaCheck,
  FaSignature,
  FaTrash
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import { AuthContext } from '../../../contexts/AuthContext';
import MedicalLoader from '../../common/MedicalLoader';

const DynamicFormSubmissions = ({ formCode, onBack }) => {
  const { user } = useContext(AuthContext) || {};
  const [submissions, setSubmissions] = useState([]);
  const [formMeta, setFormMeta] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // viewMode: 'visual' (Xem Trực Quan chuyên sâu) | 'grid' (Bảng ma trận cột) | 'dossier' (Phiếu in báo cáo) | 'compact' (Bảng thu gọn)
  const [viewMode, setViewMode] = useState('visual');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await customFormService.getFormSubmissions(formCode, selectedDate ? { date: selectedDate } : {});
      if (res && res.success) {
        setSubmissions(res.data || []);
        setFormMeta(res.form);
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

  // Kiểm tra quyền xóa bản ghi (Chỉ người có quyền sửa / Admin / Người nộp mới được xóa)
  const canDeleteSubmission = (sub) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (sub && sub.submitted_by_user === user.username) return true;

    // Check permissions from formMeta
    const perms = formMeta?.permissions || [];
    if (perms.length === 0) return true; // default open

    return perms.some(p => {
      if (p.permission !== 'edit') return false;
      if (p.target_type === 'all') return true;
      if (p.target_type === 'user' && (p.target_value === user.username || p.target_value === user.departmentCode)) return true;
      return false;
    });
  };

  // Xóa bản ghi
  const handleDeleteSubmission = async (subId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi báo cáo này không?\n\nLưu ý: Dữ liệu sau khi xóa sẽ không thể phục hồi.')) {
      return;
    }
    try {
      const res = await customFormService.deleteFormSubmission(formCode, subId);
      if (res && res.success) {
        setSubmissions(prev => prev.filter(s => s.id !== subId));
        if (selectedSubmission?.id === subId) {
          setSelectedSubmission(null);
        }
      } else {
        alert(res?.error || 'Không thể xóa bản ghi.');
      }
    } catch (err) {
      console.error('Delete submission failed:', err);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa bản ghi.');
    }
  };

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

  // Automated Field Aggregations (for Visual Mode)
  const fieldAggregations = useMemo(() => {
    const aggs = {};
    schemaFields.forEach(field => {
      const freqMap = {};
      filteredSubmissions.forEach(s => {
        const val = s.submission_data?.[field.key];
        if (val !== undefined && val !== null && val !== '') {
          const strVal = String(val).trim();
          freqMap[strVal] = (freqMap[strVal] || 0) + 1;
        }
      });

      const entries = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        aggs[field.key] = {
          label: field.label,
          type: field.type,
          total: entries.reduce((acc, curr) => acc + curr[1], 0),
          topValues: entries.slice(0, 6)
        };
      }
    });
    return aggs;
  }, [schemaFields, filteredSubmissions]);

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

  // Helper colors for field badges in visual cards
  const BADGE_COLORS = [
    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: '#3B82F6' },
    { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', label: '#10B981' },
    { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: '#F59E0B' },
    { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8', label: '#A855F7' },
    { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', label: '#F43F5E' },
    { bg: '#F0FDFA', border: '#99F6E4', text: '#115E59', label: '#14B8A6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 1. TOP HEADER TOOLBAR */}
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
                HỒ SƠ BÁO CÁO TRỰC QUAN
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

        {/* 4 View Modes Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '14px',
            padding: '4px',
            border: '1px solid #CBD5E1',
            gap: '2px'
          }}>
            {/* 1. XEM TRỰC QUAN */}
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: viewMode === 'visual' ? '#0F2C59' : 'transparent',
                color: viewMode === 'visual' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'visual' ? '0 4px 12px rgba(15, 44, 89, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Xem bảng phân tích trực quan và toàn bộ thẻ hồ sơ chi tiết"
            >
              <FaChartBar style={{ color: viewMode === 'visual' ? '#38BDF8' : '#64748B' }} /> Xem Trực Quan
            </button>

            {/* 2. BẢNG MA TRẬN CỘT */}
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: viewMode === 'grid' ? '#0F2C59' : 'transparent',
                color: viewMode === 'grid' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(15, 44, 89, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Bảng dữ liệu đầy đủ tất cả các cột"
            >
              <FaTable style={{ color: viewMode === 'grid' ? '#38BDF8' : '#64748B' }} /> Bảng Dữ Liệu
            </button>

            {/* 3. PHIẾU BÁO CÁO IN */}
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: viewMode === 'dossier' ? '#0F2C59' : 'transparent',
                color: viewMode === 'dossier' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'dossier' ? '0 4px 12px rgba(15, 44, 89, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Định dạng phiếu giao ban tổng hợp in ấn chuẩn bệnh viện"
            >
              <FaRegFileAlt style={{ color: viewMode === 'dossier' ? '#38BDF8' : '#64748B' }} /> Phiếu Tổng Hợp
            </button>

            {/* 4. THU GỌN */}
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: viewMode === 'compact' ? '#0F2C59' : 'transparent',
                color: viewMode === 'compact' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: viewMode === 'compact' ? '0 4px 12px rgba(15, 44, 89, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Bảng hành chính rút gọn"
            >
              <FaList style={{ color: viewMode === 'compact' ? '#38BDF8' : '#64748B' }} /> Thu Gọn
            </button>
          </div>

          {/* Export Actions */}
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
            title="Xuất file Excel CSV"
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
            title="In ấn"
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
            title="Làm mới"
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
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.3rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FaClipboardList />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>TỔNG SỐ BẢN GHI</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F2C59' }}>{submissions.length}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.3rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FaCalendarAlt />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BẢN GHI HÔM NAY</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16A34A' }}>{todayCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.3rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FaUsers />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>NGƯỜI NỘP</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#D97706' }}>{uniqueSubmitters}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.3rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FaLayerGroup />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>SỐ CỘT DỮ LIỆU</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7E22CE' }}>{schemaFields.length}</div>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & DATE FILTER */}
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
            placeholder="Tìm kiếm nội dung, tên, xã phường..."
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
        </div>
      </div>

      {/* 4. MAIN VIEWS */}
      {loading ? (
        <MedicalLoader 
          text="Đang nạp dữ liệu trực quan..." 
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
          {/* ========================================================================= */}
          {/* MODE 1: CHẾ ĐỘ XEM TRỰC QUAN CHUYÊN SÂU (VISUAL DASHBOARD & CASE CARDS)   */}
          {/* ========================================================================= */}
          {viewMode === 'visual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Automated Visual Analytics Breakdown Bar */}
              {Object.keys(fieldAggregations).length > 0 && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #E2E8F0',
                  padding: '1.4rem 1.6rem',
                  boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                    <FaChartBar style={{ color: '#2563EB', fontSize: '1.1rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F2C59' }}>
                      Phân Tích & Thống Kê Nhanh Theo Các Trường Dữ Liệu
                    </h3>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {Object.entries(fieldAggregations).map(([key, agg], aIdx) => {
                      const color = BADGE_COLORS[aIdx % BADGE_COLORS.length];
                      return (
                        <div
                          key={key}
                          style={{
                            backgroundColor: color.bg,
                            border: `1px solid ${color.border}`,
                            borderRadius: '14px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: color.text, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              ❖ {agg.label}
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: '800', color: color.text, border: `1px solid ${color.border}` }}>
                              {agg.total} lượt nhập
                            </span>
                          </div>

                          {/* Top values pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {agg.topValues.map(([valName, count], vIdx) => (
                              <span
                                key={vIdx}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  color: '#0F2C59',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: '800',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                  border: '1px solid rgba(0,0,0,0.06)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                              >
                                {valName} <strong style={{ color: color.label, fontSize: '0.74rem' }}>({count})</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visual Dossier Cards List (Bung toàn bộ hồ sơ ra xem hàng ngang rộng rãi full-width 100%) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: '100%'
              }}>
                {filteredSubmissions.map((sub, idx) => {
                  // Find main title name if any (e.g. Tên, Họ và tên)
                  const primaryField = schemaFields[0];
                  const primaryVal = sub.submission_data?.[primaryField?.key] || `Bản Ghi #${idx + 1}`;

                  return (
                    <div
                      key={sub.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '24px',
                        border: '1.5px solid #E2E8F0',
                        boxShadow: '0 8px 25px rgba(15, 44, 89, 0.06)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Header Card Banner */}
                      <div style={{
                        background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
                        padding: '1.1rem 1.6rem',
                        color: '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '0.9rem'
                          }}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '1.18rem', fontWeight: '900', color: '#FFFFFF', lineHeight: 1.2 }}>
                              {String(primaryVal)}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#93C5FD', marginTop: '2px' }}>
                              {sub.user_full_name ? `${sub.user_full_name} (@${sub.submitted_by_user})` : `@${sub.submitted_by_user}`}
                            </div>
                          </div>
                        </div>

                        {/* Right: Date Badge & Delete Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            color: '#FFFFFF',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: '800'
                          }}>
                            {formatDateVN(sub.submission_date)}
                          </span>

                          {canDeleteSubmission(sub) && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSubmission(sub.id, e)}
                              style={{
                                backgroundColor: '#EF4444',
                                border: 'none',
                                color: '#FFFFFF',
                                borderRadius: '8px',
                                padding: '0.35rem 0.8rem',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                              title="Xóa bản ghi này"
                            >
                              <FaTrash size={11} /> Xóa bản ghi
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Content Grid (All fields fully expanded horizontally) */}
                      <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.85rem'
                        }}>
                          {schemaFields.map((field, fIdx) => {
                            const val = sub.submission_data?.[field.key];
                            const color = BADGE_COLORS[fIdx % BADGE_COLORS.length];

                            let displayVal = '—';
                            if (val !== undefined && val !== null && val !== '') {
                              if (typeof val === 'boolean') displayVal = val ? '✓ Có' : '✗ Không';
                              else if (Array.isArray(val)) displayVal = `${val.length} dòng dữ liệu`;
                              else if (typeof val === 'object') displayVal = JSON.stringify(val);
                              else displayVal = String(val);
                            }

                            return (
                              <div
                                key={field.id || field.key}
                                style={{
                                  backgroundColor: color.bg,
                                  border: `1.5px solid ${color.border}`,
                                  borderRadius: '12px',
                                  padding: '0.75rem 1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.3rem'
                                }}
                              >
                                <span style={{ fontSize: '0.74rem', fontWeight: '800', color: color.label, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                  {field.label}
                                </span>
                                <span style={{ fontSize: '0.98rem', fontWeight: '900', color: '#0F2C59', wordBreak: 'break-word', lineHeight: 1.35 }}>
                                  {displayVal}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div style={{
                        padding: '0.85rem 1.6rem',
                        backgroundColor: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                        color: '#64748B'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaHospital style={{ color: '#2563EB' }} /> {sub.department_name || (sub.department_code === 'personal' ? 'Tài khoản cá nhân' : sub.department_code)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaClock /> {new Date(sub.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: BẢNG MA TRẬN ĐẦY ĐỦ CÁC CỘT DỮ LIỆU (LARGE MATRIX TABLE)         */}
          {/* ========================================================================= */}
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
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(sub)}
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1.5px solid #BFDBFE',
                                borderRadius: '8px',
                                padding: '0.35rem 0.65rem',
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

                            {canDeleteSubmission(sub) && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1.5px solid #FECACA',
                                  borderRadius: '8px',
                                  padding: '0.35rem 0.6rem',
                                  fontWeight: '800',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title="Xóa bản ghi này"
                              >
                                <FaTrash size={11} /> Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: ĐỊNH DẠNG PHIẾU GIAO BAN IN ẤN CHUẨN Y TẾ (DOSSIER DOCUMENT)     */}
          {/* ========================================================================= */}
          {viewMode === 'dossier' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #0F2C59',
              padding: '2.5rem 2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              fontFamily: "'Times New Roman', Arial, serif"
            }}>
              {/* Official Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#1E3A8A', fontWeight: 'bold' }}>Sở Y Tế Thành Phố Đồng Nai</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#0F2C59' }}>TTYT Khu Vực Bình Long</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#2563EB', marginTop: '3px' }}>
                    Biểu Mẫu: {formMeta?.title || formCode}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                  <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>
                    Bình Long, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0F2C59', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>
                  Bảng Tổng Hợp Dữ Liệu Báo Cáo Chuyên Môn
                </h2>
                <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#475569' }}>
                  Tổng hợp {filteredSubmissions.length} bản ghi đã ghi nhận
                </div>
              </div>

              {/* Dossier Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#D9E8FB', color: '#0F2C59', borderBottom: '1px solid #000' }}>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', width: '40px' }}>STT</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>Ngày Báo Cáo</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>Đơn Vị</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>Người Nộp</th>
                    {schemaFields.map(f => (
                      <th key={f.id || f.key} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{f.label}</th>
                    ))}
                    <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>Thời Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((s, idx) => (
                    <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FBFF' }}>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{formatDateVN(s.submission_date)}</td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{s.department_name || (s.department_code === 'personal' ? 'Tài khoản cá nhân' : s.department_code)}</td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{s.user_full_name || s.submitted_by_user}</td>
                      {schemaFields.map(f => (
                        <td key={f.id || f.key} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                          {s.submission_data?.[f.key] !== undefined && s.submission_data?.[f.key] !== null ? String(s.submission_data[f.key]) : '—'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '0.8rem', textAlign: 'center' }}>
                        {new Date(s.created_at).toLocaleTimeString('vi-VN')} {formatDateVN(s.submission_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '2.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>Người Lập Bảng</div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ height: '60px' }}></div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Phòng Kế Hoạch Nghiệp Vụ</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>Lãnh Đạo Đơn Vị</div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>(Ký, đóng dấu)</div>
                  <div style={{ height: '60px' }}></div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Ban Giám Đốc</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 4: BẢNG HÀNH CHÍNH RÚT GỌN (COMPACT ADMINISTRATIVE TABLE)            */}
          {/* ========================================================================= */}
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
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(sub)}
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1.5px solid #BFDBFE',
                                borderRadius: '8px',
                                padding: '0.4rem 0.75rem',
                                fontWeight: '800',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <FaEye /> Xem
                            </button>

                            {canDeleteSubmission(sub) && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1.5px solid #FECACA',
                                  borderRadius: '8px',
                                  padding: '0.4rem 0.65rem',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title="Xóa bản ghi này"
                              >
                                <FaTrash size={11} /> Xóa
                              </button>
                            )}
                          </div>
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
            <div style={{ padding: '1rem 1.6rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                {canDeleteSubmission(selectedSubmission) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                    style={{
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1.5px solid #FECACA',
                      borderRadius: '10px',
                      padding: '0.55rem 1.1rem',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <FaTrash size={12} /> Xóa Bản Ghi Này
                  </button>
                )}
              </div>

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
