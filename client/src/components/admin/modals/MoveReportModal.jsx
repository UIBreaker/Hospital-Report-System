import React, { useState, useEffect } from 'react';
import { 
  FaExchangeAlt, 
  FaTimes, 
  FaCalendarAlt, 
  FaHospital, 
  FaUserMd, 
  FaUserNurse, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaLock, 
  FaSpinner,
  FaShieldAlt
} from 'react-icons/fa';
import reportService from '../../../services/reportService';

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const MoveReportModal = ({
  isOpen,
  onClose,
  departmentCode,
  departmentName,
  currentDate,
  doctorName,
  nurseName,
  onSuccess
}) => {
  const [targetDate, setTargetDate] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // { canMove: boolean, reason: string, isExisting: boolean, isLocked: boolean }
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetDate('');
      setCheckResult(null);
      setErrorMsg('');
      setConfirmed(false);
    }
  }, [isOpen]);

  // Debounced check whenever targetDate changes
  useEffect(() => {
    if (!targetDate || !departmentCode) {
      setCheckResult(null);
      return;
    }

    if (targetDate === currentDate) {
      setCheckResult({
        canMove: false,
        isExisting: true,
        isLocked: false,
        reason: 'Ngày đích trùng với ngày hiện tại của báo cáo.'
      });
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setChecking(true);
      setErrorMsg('');
      try {
        const res = await reportService.checkTargetDate(departmentCode, targetDate);
        if (isMounted && res && res.success) {
          setCheckResult(res);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.response?.data?.error || 'Không thể kiểm tra ngày đích.');
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [targetDate, departmentCode, currentDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetDate || !checkResult?.canMove || !confirmed) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await reportService.moveReportDate({
        departmentCode,
        fromDate: currentDate,
        toDate: targetDate
      });

      if (res && res.success) {
        if (onSuccess) onSuccess(targetDate);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Có lỗi xảy ra khi chuyển ngày báo cáo.');
    } finally {
      setSubmitting(false);
    }
  };

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
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 25px 60px -15px rgba(15, 44, 89, 0.35)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
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
              color: '#60A5FA'
            }}>
              <FaExchangeAlt />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.2px' }}>
                Chuyển Ngày Báo Cáo
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#BFDBFE' }}>
                Hỗ trợ dời báo cáo khi khoa nộp nhầm ngày trực
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Source Report Info Box */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F2C59', fontWeight: '900', fontSize: '0.95rem' }}>
              <FaHospital style={{ color: '#2563EB' }} /> {departmentName || departmentCode}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FaCalendarAlt style={{ color: '#DC2626' }} /> Ngày hiện tại: <strong style={{ color: '#0F2C59' }}>{formatDateDDMMYYYY(currentDate)}</strong>
              </span>
              {(doctorName || nurseName) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaUserMd style={{ color: '#16A34A' }} /> {doctorName || ''} {nurseName ? `• ${nurseName}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Target Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.45rem' }}>
              📅 Chọn Ngày Mới (Ngày Cần Chuyển Đến): <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
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

          {/* Live Status Checker Card */}
          {checking && (
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#1D4ED8',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              <FaSpinner className="fa-spin" /> Đang kiểm tra tính khả dụng của ngày {formatDateDDMMYYYY(targetDate)}...
            </div>
          )}

          {!checking && checkResult && (
            <div style={{
              backgroundColor: checkResult.canMove ? '#F0FDF4' : (checkResult.isLocked ? '#FFFBEB' : '#FEF2F2'),
              border: `1.5px solid ${checkResult.canMove ? '#86EFAC' : (checkResult.isLocked ? '#FDE68A' : '#FECDD3')}`,
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              {checkResult.canMove ? (
                <FaCheckCircle style={{ color: '#16A34A', fontSize: '1.15rem', marginTop: '2px', flexShrink: 0 }} />
              ) : checkResult.isLocked ? (
                <FaLock style={{ color: '#D97706', fontSize: '1.15rem', marginTop: '2px', flexShrink: 0 }} />
              ) : (
                <FaExclamationTriangle style={{ color: '#DC2626', fontSize: '1.15rem', marginTop: '2px', flexShrink: 0 }} />
              )}
              <div>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: '800',
                  color: checkResult.canMove ? '#15803D' : (checkResult.isLocked ? '#B45309' : '#B91C1C')
                }}>
                  {checkResult.canMove ? 'ĐỦ ĐIỀU KIỆN CHUYỂN BÁO CÁO' : 'KHÔNG THỂ CHUYỂN SANG NGÀY NÀY'}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: checkResult.canMove ? '#166534' : (checkResult.isLocked ? '#92400E' : '#991B1B'),
                  marginTop: '2px',
                  lineHeight: 1.4
                }}>
                  {checkResult.reason}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Safety Notice & Checkbox */}
          {checkResult?.canMove && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                <FaShieldAlt style={{ color: '#2563EB' }} /> Bảo toàn dữ liệu: Toàn bộ số liệu & ca bệnh con sẽ được dời sang ngày mới.
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#0F2C59', fontWeight: '800', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Tôi xác nhận chuyển báo cáo từ ngày {formatDateDDMMYYYY(currentDate)} sang ngày {formatDateDDMMYYYY(targetDate)}.
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={!targetDate || !checkResult?.canMove || !confirmed || submitting}
              style={{
                padding: '0.6rem 1.3rem',
                borderRadius: '10px',
                border: 'none',
                background: (!targetDate || !checkResult?.canMove || !confirmed || submitting)
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: (!targetDate || !checkResult?.canMove || !confirmed || submitting) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: (!targetDate || !checkResult?.canMove || !confirmed || submitting) ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              {submitting ? (
                <><FaSpinner className="fa-spin" /> Đang chuyển dữ liệu...</>
              ) : (
                <><FaExchangeAlt /> Xác Nhận Chuyển Ngày</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveReportModal;
