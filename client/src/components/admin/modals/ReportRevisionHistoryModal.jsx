import React from 'react';
import { 
  FaHistory, 
  FaTimes, 
  FaCalendarAlt, 
  FaHospital, 
  FaUserMd, 
  FaClock, 
  FaEdit, 
  FaCheckCircle, 
  FaExchangeAlt,
  FaFileAlt
} from 'react-icons/fa';

const parseUtcDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
    return new Date(s.replace(' ', 'T') + 'Z');
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const formatFullDateTimeVN = (dateInput) => {
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
    return `${hours}:${minutes}:${seconds} — Ngày ${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
};

const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const ReportRevisionHistoryModal = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen || !report) return null;

  const revisionLogs = report.revisionLogs || [];
  const editLogs = revisionLogs.filter(l => l.actionType === 'UPDATE' || l.actionType === 'MOVE');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.2rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '620px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(15, 44, 89, 0.35)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#FCD34D'
            }}>
              <FaHistory />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.2px' }}>
                Lịch Sử Nộp & Chỉnh Sửa Báo Cáo
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#BFDBFE' }}>
                Chi tiết các mốc ngày giờ nộp bản gốc và các lần sửa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Report Overview Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontWeight: '900', color: '#0F2C59', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaHospital style={{ color: '#2563EB' }} /> {report.departmentName}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
              Ca trực ngày: <strong style={{ color: '#1E40AF' }}>{formatDateVN(report.reportDate)}</strong>
              {report.doctorName && <> • BS: <strong>{report.doctorName}</strong></>}
              {report.nurseName && <> • ĐD: <strong>{report.nurseName}</strong></>}
            </div>
          </div>
          <div>
            <span style={{
              backgroundColor: report.editCount > 0 ? '#FEF9C3' : '#DCFCE7',
              color: report.editCount > 0 ? '#854D0E' : '#15803D',
              border: `1px solid ${report.editCount > 0 ? '#FDE047' : '#86EFAC'}`,
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '800'
            }}>
              {report.editCount > 0 ? `Đã sửa ${report.editCount} lần` : 'Bản gốc (Chưa chỉnh sửa)'}
            </span>
          </div>
        </div>

        {/* Timeline Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Milestone 1: Original Submission */}
          <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              border: '2px solid #22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A',
              fontSize: '1rem',
              flexShrink: 0,
              zIndex: 2
            }}>
              <FaCheckCircle />
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '12px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span style={{
                  backgroundColor: '#22C55E',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}>
                  LẦN 1: NỘP BẢN GỐC
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#166534' }}>
                  🕒 {formatFullDateTimeVN(report.createdAt)}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#14532D', marginTop: '0.45rem', lineHeight: 1.4 }}>
                Khoa đã hoàn tất nộp báo cáo ban đầu lên Cổng giao ban.
                {report.doctorName && <div>Bác sĩ trực: <strong>{report.doctorName}</strong> {report.nurseName ? `• Điều dưỡng: ${report.nurseName}` : ''}</div>}
              </div>
            </div>
          </div>

          {/* Revisions from Audit Logs */}
          {editLogs.map((log, index) => {
            const isMove = log.changesSummary?.includes('CHUYỂN NGÀY BÁO CÁO');
            return (
              <div key={log.id || index} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isMove ? '#EFF6FF' : '#FEF3C7',
                  border: `2px solid ${isMove ? '#3B82F6' : '#F59E0B'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isMove ? '#2563EB' : '#D97706',
                  fontSize: '0.95rem',
                  flexShrink: 0,
                  zIndex: 2
                }}>
                  {isMove ? <FaExchangeAlt /> : <FaEdit />}
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: isMove ? '#F0F7FF' : '#FFFBEB',
                  border: `1.5px solid ${isMove ? '#BFDBFE' : '#FDE68A'}`,
                  borderRadius: '12px',
                  padding: '0.85rem 1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span style={{
                      backgroundColor: isMove ? '#2563EB' : '#D97706',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {isMove ? 'CHUYỂN NGÀY BÁO CÁO' : `LẦN SỬA #${index + 1}`}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isMove ? '#1E40AF' : '#92400E' }}>
                      🕒 {formatFullDateTimeVN(log.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: isMove ? '#1E3A8A' : '#78350F', marginTop: '0.45rem', lineHeight: 1.4 }}>
                    {log.changesSummary || (log.doctorName ? `Cập nhật chỉnh sửa báo cáo bởi ${log.doctorName}` : 'Cập nhật lại số liệu chuyên môn.')}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fallback if editCount > 0 but no detailed audit rows */}
          {editLogs.length === 0 && report.editCount > 0 && (
            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                fontSize: '0.95rem',
                flexShrink: 0
              }}>
                <FaEdit />
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FDE68A',
                borderRadius: '12px',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ backgroundColor: '#D97706', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                    BẢN CẬP NHẬT GẦN NHẤT
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400E' }}>
                    🕒 {formatFullDateTimeVN(report.updatedAt)}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#78350F', marginTop: '0.45rem' }}>
                  Báo cáo đã trải qua {report.editCount} lần chỉnh sửa số liệu.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.9rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#0F2C59',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportRevisionHistoryModal;
