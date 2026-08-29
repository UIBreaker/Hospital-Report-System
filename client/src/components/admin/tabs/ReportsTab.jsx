import React, { useState } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaLock, 
  FaSpinner, 
  FaUserMd, 
  FaProcedures,
  FaFlask,
  FaCamera,
  FaHeartbeat,
  FaBaby,
  FaBiohazard,
  FaFemale,
  FaSpa,
  FaStethoscope,
  FaBone,
  FaSyringe,
  FaHospital,
  FaCheckCircle,
  FaClock,
  FaNotesMedical,
  FaFilter,
  FaExclamationTriangle,
  FaBolt
} from 'react-icons/fa';
import { Notice } from '../../ui';
import MedicalLoader from '../../common/MedicalLoader';
import CountUpNumber from '../../common/CountUpNumber';

const DEPARTMENT_ORDER = [
  'lck',
  'xn',
  'cdha',
  'hscc_tnt',
  'noi',
  'nhi',
  'nhiem',
  'san',
  'yhct_phcn',
  'ngoai_th',
  'ctch',
  'gmhs',
  'duoc',
  'kham_benh'
];

const DEPT_ICONS = {
  lck: FaProcedures,
  xn: FaFlask,
  cdha: FaCamera,
  hscc_tnt: FaHeartbeat,
  noi: FaUserMd,
  nhi: FaBaby,
  nhiem: FaBiohazard,
  san: FaFemale,
  yhct_phcn: FaSpa,
  ngoai_th: FaStethoscope,
  ctch: FaBone,
  gmhs: FaSyringe
};

const ReportsTab = ({
  statusList = [],
  loading = false,
  error = '',
  onClearError,
  onOpenDetailModal
}) => {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'submitted' | 'unsubmitted' | 'has_cases'

  const totalCount = statusList.length || 12;
  const submittedCount = statusList.filter((s) => s.status === 'submitted').length;
  const unsubmittedCount = totalCount - submittedCount;
  const percentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;
  
  const hasCasesCount = statusList.filter((s) => {
    const totalCases = (s.transferCasesCount || 0) + 
      (s.surgeryCasesCount || 0) + 
      (s.deathCasesCount || 0) + 
      (s.criticalCasesCount || 0);
    return totalCases > 0;
  }).length;

  const sortedList = [...statusList].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
    const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  const filteredList = sortedList.filter(dept => {
    const totalCases = (dept.transferCasesCount || 0) + 
      (dept.surgeryCasesCount || 0) + 
      (dept.deathCasesCount || 0) + 
      (dept.criticalCasesCount || 0);

    if (statusFilter === 'submitted') return dept.status === 'submitted';
    if (statusFilter === 'unsubmitted') return dept.status !== 'submitted';
    if (statusFilter === 'has_cases') return totalCases > 0;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Top Summary Stat Cards Grid (3 High-Contrast Dynamic Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Total Departments */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid #BFDBFE',
          borderLeft: '6px solid #2563EB',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => setStatusFilter('all')}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(37, 99, 235, 0.15)'
          }}>
            <FaHospital />
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F2C59', lineHeight: '1.1', fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={totalCount} duration={900} />
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.25rem' }}>
              TỔNG SỐ KHOA PHÒNG
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Báo cáo giao ban toàn viện
            </div>
          </div>
        </div>

        {/* Card 2: Submitted */}
        <div style={{
          backgroundColor: statusFilter === 'submitted' ? '#F0FDF4' : '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: statusFilter === 'submitted' ? '2px solid #10B981' : '1.5px solid #BBF7D0',
          borderLeft: '6px solid #10B981',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => setStatusFilter('submitted')}
        title="Nhấn để chỉ xem các khoa đã nộp"
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#DCFCE7',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.2)'
          }}>
            <FaCheckCircle />
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#10B981', lineHeight: '1.1', fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={submittedCount} duration={900} />
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.25rem' }}>
              ĐÃ NỘP (<CountUpNumber value={percentage} suffix="%" duration={900} />)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '0.1rem' }}>
              Hoàn thành đúng hạn
            </div>
          </div>
        </div>

        {/* Card 3: Not Submitted */}
        <div style={{
          backgroundColor: statusFilter === 'unsubmitted' ? '#FFF5F5' : '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: statusFilter === 'unsubmitted' ? '2px solid #EF4444' : '1.5px solid #FECACA',
          borderLeft: '6px solid #EF4444',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => setStatusFilter('unsubmitted')}
        title="Nhấn để chỉ xem các khoa chưa nộp"
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(239, 68, 68, 0.2)'
          }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#DC2626', lineHeight: '1.1', fontFamily: "'Roboto Mono', monospace" }}>
              <CountUpNumber value={unsubmittedCount} duration={900} />
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.25rem' }}>
              CHƯA NỘP BÁO CÁO
            </div>
            <div style={{ fontSize: '0.75rem', color: unsubmittedCount > 0 ? '#DC2626' : '#10B981', fontWeight: '700', marginTop: '0.1rem' }}>
              {unsubmittedCount > 0 ? '⚠️ Cần nhắc nhở ngay' : '✅ Tất cả đã nộp đủ'}
            </div>
          </div>
        </div>
      </div>

      {Boolean(error) && (
        <div style={{ marginBottom: '0.5rem' }}>
          <Notice tone="warning" onClose={onClearError}>
            {typeof error === 'string' ? error : (error?.message || 'Đã xảy ra lỗi')}
          </Notice>
        </div>
      )}

      {/* 2. Interactive Filter Chips Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        backgroundColor: '#FFFFFF',
        padding: '0.75rem 1.15rem',
        borderRadius: '12px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#0F2C59' }}>
          <FaFilter style={{ color: '#2563EB' }} />
          <span>TRẠNG THÁI NỘP BÁO CÁO:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'all' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: statusFilter === 'all' ? '#EFF6FF' : '#F8FAFC',
              color: statusFilter === 'all' ? '#1E40AF' : '#475569',
              fontWeight: statusFilter === 'all' ? '800' : '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📋 Tất Cả</span>
            <span style={{ backgroundColor: statusFilter === 'all' ? '#2563EB' : '#E2E8F0', color: statusFilter === 'all' ? '#fff' : '#64748B', padding: '0.08rem 0.45rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('submitted')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'submitted' ? '2px solid #10B981' : '1px solid #BBF7D0',
              backgroundColor: statusFilter === 'submitted' ? '#DCFCE7' : '#F0FDF4',
              color: '#065F46',
              fontWeight: statusFilter === 'submitted' ? '800' : '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: statusFilter === 'submitted' ? '0 2px 8px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🟢 Đã Nộp</span>
            <span style={{ backgroundColor: '#10B981', color: '#fff', padding: '0.08rem 0.45rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>
              {submittedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unsubmitted')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'unsubmitted' ? '2px solid #EF4444' : '1px solid #FECACA',
              backgroundColor: statusFilter === 'unsubmitted' ? '#FEE2E2' : '#FFF5F5',
              color: '#991B1B',
              fontWeight: statusFilter === 'unsubmitted' ? '800' : '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: statusFilter === 'unsubmitted' ? '0 2px 8px rgba(239, 68, 68, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔴 Chưa Nộp</span>
            <span style={{ backgroundColor: '#EF4444', color: '#fff', padding: '0.08rem 0.45rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>
              {unsubmittedCount}
            </span>
          </button>

          {hasCasesCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('has_cases')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: statusFilter === 'has_cases' ? '2px solid #D97706' : '1px solid #FDE68A',
                backgroundColor: statusFilter === 'has_cases' ? '#FEF3C7' : '#FFFBEB',
                color: '#92400E',
                fontWeight: statusFilter === 'has_cases' ? '800' : '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <FaBolt style={{ color: '#D97706' }} />
              <span>Có Ca Đặc Biệt</span>
              <span style={{ backgroundColor: '#D97706', color: '#fff', padding: '0.08rem 0.45rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800' }}>
                {hasCasesCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 12 Department Cards Grid (High-Contrast Visual Separation) */}
      {loading ? (
        <MedicalLoader
          text="Đang tải dữ liệu báo cáo 12 khoa phòng..."
          subtext="Hệ thống đang đồng bộ trạng thái nộp báo cáo từ máy chủ"
          minHeight="340px"
        />
      ) : filteredList.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1.5px dashed #CBD5E1',
          color: '#64748B'
        }}>
          <FaCheckCircle style={{ fontSize: '3rem', color: '#10B981', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59' }}>
            Không có khoa phòng nào ở trạng thái này
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              marginTop: '1rem',
              backgroundColor: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.2rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Xem tất cả các khoa
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))',
          gap: '1.15rem'
        }}>
          {filteredList.map((dept) => {
            const isSubmitted = dept.status === 'submitted';
            const totalCases = (dept.transferCasesCount || 0) + 
              (dept.surgeryCasesCount || 0) + 
              (dept.deathCasesCount || 0) + 
              (dept.criticalCasesCount || 0);

            const DeptIcon = DEPT_ICONS[dept.departmentCode] || FaHospital;

            return (
              <div
                key={dept.departmentCode}
                onClick={() => onOpenDetailModal && onOpenDetailModal(dept)}
                style={{
                  backgroundColor: isSubmitted ? '#FFFFFF' : '#FFFDFD',
                  backgroundImage: isSubmitted 
                    ? 'linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 60%)' 
                    : 'linear-gradient(145deg, #FFF5F5 0%, #FFFFFF 60%)',
                  borderRadius: '16px',
                  border: isSubmitted ? '1.5px solid #86EFAC' : '1.5px dashed #FCA5A5',
                  borderLeft: isSubmitted ? '7px solid #10B981' : '7px solid #EF4444',
                  padding: '1.15rem 1.25rem',
                  boxShadow: isSubmitted 
                    ? '0 4px 16px rgba(16, 185, 129, 0.08)' 
                    : '0 4px 16px rgba(239, 68, 68, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '150px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isSubmitted
                    ? '0 10px 30px rgba(16, 185, 129, 0.18)'
                    : '0 10px 30px rgba(239, 68, 68, 0.18)';
                  e.currentTarget.style.borderColor = isSubmitted ? '#22C55E' : '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isSubmitted
                    ? '0 4px 16px rgba(16, 185, 129, 0.08)'
                    : '0 4px 16px rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.borderColor = isSubmitted ? '#86EFAC' : '#FCA5A5';
                }}
              >
                <div>
                  {/* Top Row: Icon + Name + Badges */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    {/* Left: Department Icon + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: isSubmitted ? '#DCFCE7' : '#FEE2E2',
                        color: isSubmitted ? '#15803D' : '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0,
                        boxShadow: isSubmitted 
                          ? '0 2px 8px rgba(16, 185, 129, 0.2)' 
                          : '0 2px 8px rgba(239, 68, 68, 0.2)'
                      }}>
                        <DeptIcon />
                      </div>

                      <h3 style={{
                        fontWeight: '900',
                        fontSize: '0.92rem',
                        color: isSubmitted ? '#0F2C59' : '#991B1B',
                        lineHeight: '1.25',
                        margin: 0,
                        wordBreak: 'break-word'
                      }}>
                        {dept.departmentName}
                      </h3>
                    </div>

                    {/* Right: Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end', flexShrink: 0 }}>
                      {dept.isLocked && (
                        <span style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          padding: '0.12rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <FaLock size={9} /> Khóa sổ
                        </span>
                      )}

                      {isSubmitted ? (
                        <span style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          border: '1.5px solid #86EFAC',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                        }}>
                          <FaCheck size={10} /> ĐÃ NỘP
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          border: '1.5px solid #FCA5A5',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)'
                        }}>
                          <FaTimes size={10} /> CHƯA NỘP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Doctor Information */}
                  <div style={{
                    fontSize: '0.82rem',
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: isSubmitted ? 'rgba(255,255,255,0.7)' : 'rgba(254, 226, 226, 0.35)',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '8px',
                    border: isSubmitted ? '1px solid #E2E8F0' : '1px dashed #FECACA'
                  }}>
                    <FaUserMd style={{ color: isSubmitted ? '#0284C7' : '#EF4444', fontSize: '0.9rem', flexShrink: 0 }} />
                    <span style={{ 
                      fontWeight: isSubmitted ? '700' : '600', 
                      color: isSubmitted ? '#0F2C59' : '#DC2626',
                      fontStyle: dept.doctorName ? 'normal' : 'italic'
                    }}>
                      {dept.doctorName ? `BS: ${dept.doctorName}` : '⚠️ Chưa cập nhật nhân sự trực ca'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Clinical Cases Summary + Detail Action */}
                <div style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.5rem',
                  borderTop: isSubmitted ? '1px solid #DCFCE7' : '1px dashed #FECACA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.76rem'
                }}>
                  <span style={{
                    color: totalCases > 0 ? '#B45309' : (isSubmitted ? '#059669' : '#EF4444'),
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {totalCases > 0 ? (
                      <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
                        ⚡ {totalCases} ca đặc biệt
                      </span>
                    ) : (
                      isSubmitted ? '✓ Hoàn thành số liệu' : '⏳ Chưa có số liệu báo cáo'
                    )}
                  </span>

                  <span style={{
                    color: isSubmitted ? '#0284C7' : '#DC2626',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    backgroundColor: isSubmitted ? '#EFF6FF' : '#FEF2F2',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '8px'
                  }}>
                    <FaEye size={12} /> {isSubmitted ? 'Xem chi tiết' : 'Xem & Nộp'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
