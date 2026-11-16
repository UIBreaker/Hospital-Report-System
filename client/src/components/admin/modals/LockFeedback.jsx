import React, { useEffect, useState } from 'react';
import './LockFeedback.css';

export const LockIcon = ({ locked, size = 46 }) => (
  <span className={`security-lock-icon${locked ? ' is-locked' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
    <svg viewBox="0 0 36 40" width="58%" height="63%">
      <path className="security-lock-shackle" d="M9 19v-7a9 9 0 0 1 18 0v7" />
      <rect x="5" y="18" width="26" height="20" rx="5" fill="white" />
      <circle cx="18" cy="26" r="2.5" fill={locked ? '#20cca5' : '#f43f5e'} />
      <path d="M18 28v4" stroke={locked ? '#20cca5' : '#f43f5e'} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </span>
);

const LockFeedback = ({ targetType, targetName, willLock, date, departments, onClose }) => {
  const [step, setStep] = useState(0);
  const isAll = targetType === 'all';
  const total = isAll ? departments.length : 1;
  const complete = isAll ? step >= total : step >= 2;
  const submittedCount = departments.filter(dept => dept.submitted).length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStep(isAll ? total : 2);
      return;
    }
    if (!isAll) {
      const start = setTimeout(() => setStep(1), 100);
      const finish = setTimeout(() => setStep(2), 550);
      return () => { clearTimeout(start); clearTimeout(finish); };
    }
    const timer = setInterval(() => setStep(current => {
      if (current >= total) {
        clearInterval(timer);
        return current;
      }
      return current + 1;
    }), 190);
    return () => clearInterval(timer);
  }, [isAll, total]);

  const [year, month, day] = date.split('-');
  const dateLabel = `${Number(day)}/${Number(month)}/${year}`;

  return (
    <div className="security-lock-backdrop" role="dialog" aria-modal="true" aria-label={willLock ? 'Kết quả khóa sổ' : 'Kết quả mở khóa sổ'}>
      <div className={`security-lock-panel${isAll ? ' security-lock-panel-wide' : ''}`}>
        <div className="security-lock-heading">
          <div className={`security-lock-hero${complete ? ' is-complete' : ''}`}>
            <LockIcon locked={isAll ? complete : willLock ? step > 0 : step === 0} size={80} />
          </div>
          <span className="security-lock-eyebrow">BẢO MẬT BÁO CÁO GIAO BAN</span>
          <h2>{isAll ? (complete ? 'Đã khóa sổ toàn viện' : 'Đang khóa sổ từng khoa') : complete ? (willLock ? 'Đã khóa sổ thành công' : 'Đã mở khóa sổ') : (willLock ? 'Đang khóa sổ' : 'Đang mở khóa sổ')}</h2>
          <p>{isAll ? `${submittedCount} báo cáo đã nộp · Ngày ${dateLabel}` : `${targetName} · Ngày ${dateLabel}`}</p>
        </div>

        {isAll && (
          <>
            <div className="security-lock-progress-heading"><span>Tiến trình 12 khoa/phòng</span><strong>{String(step).padStart(2, '0')}/{String(total).padStart(2, '0')}</strong></div>
            <div className="security-lock-progress" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={total} aria-label="Tiến trình hiển thị khóa sổ">
              <span style={{ width: `${total ? step / total * 100 : 100}%` }} />
            </div>
            <p className="security-lock-progress-label" aria-live="polite">{complete ? 'Đã hoàn tất. Các khoa chưa nộp báo cáo không bị khóa.' : `Đang hiển thị khoa ${step + 1}/${total}`}</p>
            <div className="security-lock-grid">
              {departments.map((dept, index) => (
                <div className={`security-lock-department${step > index && dept.submitted ? ' is-done' : ''}${step === index && dept.submitted ? ' is-current' : ''}`} key={dept.code}>
                  {dept.submitted ? <LockIcon locked={step > index} size={42} /> : <span className="security-lock-empty" aria-hidden="true">—</span>}
                  <div><strong>{index + 1}. {dept.name}</strong><small>{!dept.submitted ? 'Chưa có báo cáo' : step > index ? 'Đã khóa sổ' : 'Đang chờ'}</small></div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="security-lock-footer">
          <span>{isAll ? 'Chỉ báo cáo đã nộp được khóa sổ.' : willLock ? 'Cần mở khóa trước khi sửa, chuyển ngày hoặc xóa.' : 'Báo cáo đã sẵn sàng để cập nhật.'}</span>
          <button type="button" className="security-lock-primary" disabled={!complete} onClick={onClose}>Hoàn tất</button>
        </div>
      </div>
    </div>
  );
};

export default LockFeedback;
