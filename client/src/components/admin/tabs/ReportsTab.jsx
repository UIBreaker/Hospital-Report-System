import React from 'react';
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
  FaNotesMedical
} from 'react-icons/fa';
import { Notice } from '../../ui';
import MedicalLoader from '../../common/MedicalLoader';

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
  const totalCount = statusList.length || 12;
  const submittedCount = statusList.filter((s) => s.status === 'submitted').length;
  const unsubmittedCount = totalCount - submittedCount;
  const percentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const sortedList = [...statusList].sort((a, b) => {
    const idxA = DEPARTMENT_ORDER.indexOf(a.departmentCode);
    const idxB = DEPARTMENT_ORDER.indexOf(b.departmentCode);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Top Summary Stat Cards Grid (3 Cards) */}
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
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #3B82F6',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaHospital />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F2C59', lineHeight: '1.1' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              TỔNG SỐ KHOA PHÒNG
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Báo cáo trong tháng
            </div>
          </div>
        </div>

        {/* Card 2: Submitted */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #10B981',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaCheckCircle />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', lineHeight: '1.1' }}>
              {submittedCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              ĐÃ NỘP ({percentage}%)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Hoàn thành đúng hạn
            </div>
          </div>
        </div>

        {/* Card 3: Not Submitted */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          borderLeft: '4px solid #F59E0B',
          boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <FaClock />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#D97706', lineHeight: '1.1' }}>
              {unsubmittedCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
              CHƯA NỘP BÁO CÁO
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              {unsubmittedCount > 0 ? 'Cần nhắc nhở' : 'Tất cả đã nộp đủ'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '0.5rem' }}>
          <Notice tone="warning" onClose={onClearError}>
            {error}
          </Notice>
        </div>
      )}

      {/* 3. 12 Department Cards Grid (4 Columns x 3 Rows) */}
      {loading ? (
        <MedicalLoader
          text="Đang tải dữ liệu báo cáo 12 khoa phòng..."
          subtext="Hệ thống đang đồng bộ trạng thái nộp báo cáo từ máy chủ"
          minHeight="340px"
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1rem'
        }}>
          {sortedList.map((dept, index) => {
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
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem 1.15rem',
                  boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(15, 44, 89, 0.1)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 44, 89, 0.04)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
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
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        <DeptIcon />
                      </div>

                      <h3 style={{
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        color: '#0F2C59',
                        lineHeight: '1.25',
                        margin: 0,
                        wordBreak: 'break-word'
                      }}>
                        {dept.departmentName}
                      </h3>
                    </div>

                    {/* Right: Badges */}
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
                      {dept.isLocked && (
                        <span style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          padding: '0.12rem 0.45rem',
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
                          color: '#065F46',
                          border: '1px solid #BBF7D0',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <FaCheck size={9} /> Đã nộp
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#F1F5F9',
                          color: '#64748B',
                          border: '1px solid #CBD5E1',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <FaTimes size={9} /> Chưa nộp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Doctor Information */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#334155',
                    marginTop: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <FaUserMd style={{ color: '#0284C7', fontSize: '0.82rem', flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', color: dept.doctorName ? '#0F2C59' : '#94A3B8' }}>
                      BS: {dept.doctorName || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Clinical Cases Summary + Detail Action */}
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.45rem',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <span style={{
                    color: totalCases > 0 ? '#B45309' : '#94A3B8',
                    fontWeight: totalCases > 0 ? '700' : '500'
                  }}>
                    {totalCases > 0 ? `${totalCases} ca đặc biệt` : 'Không có ca đặc biệt'}
                  </span>

                  <span style={{
                    color: '#0284C7',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
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
