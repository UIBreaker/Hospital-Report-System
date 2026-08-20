import React from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaEdit, 
  FaLock, 
  FaSpinner, 
  FaUserMd, 
  FaUserNurse,
  FaNotesMedical,
  FaAmbulance,
  FaProcedures
} from 'react-icons/fa';
import { Notice } from '../../ui';

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

const ReportsTab = ({
  statusList = [],
  loading = false,
  error = '',
  onClearError,
  onOpenDetailModal
}) => {
  const totalCount = statusList.length;
  const submittedCount = statusList.filter((s) => s.status === 'submitted').length;
  const unsubmittedCount = totalCount - submittedCount;
  const percentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const sortedList = [...statusList].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
    const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  return (
    <div className="animate-fade-in">
      {/* Stats Summary Grid */}
      <div
        className="admin-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderLeft: '5px solid var(--brand-blue)',
            borderRadius: '14px',
            padding: '1.25rem'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--brand-blue)' }}>
            {totalCount}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '0.25rem'
            }}
          >
            Tổng số khoa phòng
          </div>
        </div>

        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderLeft: '5px solid #16A34A',
            borderRadius: '14px',
            padding: '1.25rem'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16A34A' }}>
            {submittedCount}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: '#16A34A',
              fontSize: '0.82rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '0.25rem'
            }}
          >
            Đã nộp ({percentage}%)
          </div>
        </div>

        <div
          className="card admin-stats-card"
          style={{
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderLeft: '5px solid #D97706',
            borderRadius: '14px',
            padding: '1.25rem'
          }}
        >
          <div className="stats-num" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#D97706' }}>
            {unsubmittedCount}
          </div>
          <div
            className="stats-lbl"
            style={{
              color: '#D97706',
              fontSize: '0.82rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '0.25rem'
            }}
          >
            Chưa nộp báo cáo
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Notice tone="warning" onClose={onClearError}>
            {error}
          </Notice>
        </div>
      )}

      {/* Department Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Đang tải dữ liệu báo cáo...</p>
        </div>
      ) : (
        <div
          className="admin-dept-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {sortedList.map((dept, index) => {
            const isSubmitted = dept.status === 'submitted';
            const totalCases = (dept.transferCasesCount || 0) + 
              (dept.surgeryCasesCount || 0) + 
              (dept.deathCasesCount || 0) + 
              (dept.criticalCasesCount || 0);

            return (
              <div
                key={dept.departmentCode}
                className="card"
                onClick={() => onOpenDetailModal && onOpenDetailModal(dept)}
                style={{
                  borderLeft: `5px solid ${isSubmitted ? 'var(--brand-green)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animationDelay: `${index * 0.04}s`,
                  animation: 'slideUp 0.3s ease-out forwards',
                  position: 'relative',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.65rem'
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        color: 'var(--primary)',
                        lineHeight: 1.3,
                        margin: 0
                      }}
                    >
                      {dept.departmentName}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.35rem',
                        alignItems: 'center',
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                      }}
                    >
                      {dept.isLocked && (
                        <span
                          style={{
                            backgroundColor: '#FFF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <FaLock size={10} /> Khóa sổ
                        </span>
                      )}
                      {isSubmitted ? (
                        <span
                          className="badge badge-success"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                        >
                          <FaCheck size={10} /> Đã nộp
                        </span>
                      ) : (
                        <span
                          className="badge badge-warning"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                        >
                          <FaTimes size={10} /> Chưa nộp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Staff & Shift info */}
                  {isSubmitted && (
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {dept.doctorName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaUserMd style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
                          <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>BS: {dept.doctorName}</span>
                        </div>
                      )}
                      {dept.nurseName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaUserNurse style={{ color: '#D97706', flexShrink: 0 }} />
                          <span>ĐD: {dept.nurseName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Info / Cases Count */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ color: totalCases > 0 ? 'var(--brand-blue)' : 'var(--text-muted)', fontWeight: totalCases > 0 ? '700' : '500' }}>
                    {totalCases > 0 ? `${totalCases} ca đặc biệt` : 'Không có ca đặc biệt'}
                  </span>
                  <span style={{ color: 'var(--brand-blue)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <FaEye size={11} /> Chi tiết
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