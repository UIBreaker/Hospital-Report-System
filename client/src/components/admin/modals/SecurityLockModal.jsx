import React from 'react';
import LockFeedback, { LockIcon } from './LockFeedback';

const SecurityLockModal = ({
  isOpen = false,
  mode = 'confirm',
  targetType = 'all',
  targetName = 'Toàn Viện',
  departments = [],
  date = '',
  willLock = true,
  onConfirm,
  onCancel,
  onClose,
  loading = false
}) => {
  if (!isOpen) return null;
  if (mode === 'animating') {
    return <LockFeedback targetType={targetType} targetName={targetName} departments={departments} date={date} willLock={willLock} onClose={onClose} />;
  }

  const [year, month, day] = date.split('-');
  const dateLabel = `${Number(day)}/${Number(month)}/${year}`;

  return (
    <div className="security-lock-backdrop" role="dialog" aria-modal="true" aria-label={willLock ? 'Xác nhận khóa sổ' : 'Xác nhận mở khóa sổ'}>
      <div className="security-lock-panel">
        <div className="security-lock-hero"><LockIcon locked={!willLock} size={72} /></div>
        <span className="security-lock-eyebrow">XÁC NHẬN THAO TÁC</span>
        <h2>{willLock ? (targetType === 'all' ? 'Khóa sổ toàn viện?' : `Khóa sổ ${targetName}?`) : `Mở khóa sổ ${targetName}?`}</h2>
        <p className="security-lock-date">Ngày giao ban {dateLabel}</p>
        <p className="security-lock-note">
          {willLock
            ? 'Sau khi khóa, báo cáo không thể sửa số liệu, chuyển ngày hoặc xóa. Muốn thao tác lại, hãy mở khóa trong chi tiết khoa.'
            : 'Sau khi mở khóa, báo cáo của khoa này có thể được sửa, chuyển ngày hoặc xóa.'}
        </p>
        <div className="security-lock-actions">
          <button type="button" className="security-lock-secondary" onClick={onCancel} disabled={loading}>Hủy</button>
          <button type="button" className="security-lock-primary" onClick={onConfirm} disabled={loading}>{loading ? 'Đang xử lý...' : willLock ? 'Khóa sổ' : 'Mở khóa'}</button>
        </div>
      </div>
    </div>
  );
};

export default SecurityLockModal;
