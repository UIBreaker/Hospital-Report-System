import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import reportService from '../../services/reportService';
import './ReportCalendar.css';

const pad = value => String(value).padStart(2, '0');
const formatDate = date => date ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}` : 'Chưa có báo cáo';
const statusFor = entry => {
  if (entry?.storageStatus === 'deleted') return { key: 'deleted', label: 'Đã xóa dữ liệu' };
  if (entry?.storageStatus === 'trash') return { key: 'trash', label: 'Trong Thùng Rác Dữ Liệu' };
  if (!entry?.submittedCount) return { key: 'empty', label: 'Chưa có báo cáo' };
  if (entry.lockedCount === entry.submittedCount) return { key: 'locked', label: 'Đã khóa sổ toàn viện' };
  if (entry.lockedCount) return { key: 'partial', label: 'Khóa một phần' };
  return { key: 'unlocked', label: 'Chưa khóa sổ toàn viện' };
};

const ReportCalendar = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value.slice(0, 7));
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setError(false);
    reportService.getReportCalendar(viewMonth)
      .then(result => { if (active) setCalendar(result.data); })
      .catch(() => { if (active) { setCalendar(null); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, viewMonth]);

  const [year, month] = viewMonth.split('-').map(Number);
  const firstDay = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const entries = new Map((calendar?.month === viewMonth ? calendar.days : []).map(day => [day.date, day]));
  const currentEntry = entries.get(value);
  const currentStatus = statusFor(currentEntry);
  const changeMonth = delta => {
    const next = new Date(year, month - 1 + delta, 1);
    setViewMonth(`${next.getFullYear()}-${pad(next.getMonth() + 1)}`);
  };

  return (
    <div className="report-calendar" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="report-calendar-trigger admin-header-action"
        aria-label={`Ngày giao ban ${formatDate(value)}. Mở lịch trạng thái báo cáo`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => { if (!open) setViewMonth(value.slice(0, 7)); setOpen(!open); }}
      >
        <FaCalendarAlt aria-hidden="true" />
        <span><small>Ngày giao ban</small><strong>{formatDate(value)}</strong></span>
        <span className="report-calendar-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="report-calendar-popover" role="dialog" aria-label="Chọn ngày và xem trạng thái báo cáo">
          <div className="report-calendar-topline">
            <div><span>LỊCH BÁO CÁO</span><strong>Chọn ngày giao ban</strong></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng lịch">×</button>
          </div>
          <div className="report-calendar-latest">
            <span>Đã có báo cáo đến ngày</span>
            <strong>{loading ? 'Đang tải…' : error ? 'Không tải được' : formatDate(calendar?.latestReportDate)}</strong>
          </div>
          <div className="report-calendar-navigation">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Tháng trước"><FaChevronLeft /></button>
            <strong className="report-calendar-month-title">Tháng {month} năm {year}</strong>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Tháng sau"><FaChevronRight /></button>
          </div>
          <div className="report-calendar-pickers">
            <label>Tháng
              <select aria-label="Chọn tháng" value={month} onChange={event => setViewMonth(`${year}-${pad(Number(event.target.value))}`)}>
                {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>)}
              </select>
            </label>
            <label>Năm
              <select aria-label="Chọn năm" value={year} onChange={event => setViewMonth(`${event.target.value}-${pad(month)}`)}>
                {Array.from({ length: 131 }, (_, index) => 2000 + index).map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="report-calendar-weekdays" aria-hidden="true">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day}>{day}</span>)}</div>
          <div className="report-calendar-days" aria-busy={loading}>
            {Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = `${viewMonth}-${pad(index + 1)}`;
              const entry = entries.get(date);
              const status = statusFor(entry);
              return (
                <button key={date} type="button" className={`report-calendar-day is-${status.key}${date === value ? ' is-selected' : ''}`}
                  aria-label={`${formatDate(date)}: ${status.label}${entry?.storageStatus === 'deleted' ? `, ${entry.deletedReportCount} phiếu đã xóa` : `, ${entry?.submittedCount || 0}/12 khoa đã nộp`}${entry?.lockedCount ? `, ${entry.lockedCount} báo cáo đã khóa` : ''}`}
                  aria-pressed={date === value}
                  disabled={status.key === 'deleted'}
                  onClick={() => { onChange(date); setOpen(false); triggerRef.current?.focus(); }}>
                  <span>{index + 1}</span><small><i aria-hidden="true" />{status.key === 'trash' ? 'Thùng rác' : status.key === 'deleted' ? 'Đã xóa' : entry?.submittedCount ? `${entry.submittedCount}/12` : ''}</small>
                </button>
              );
            })}
          </div>
          {error && <p className="report-calendar-error" role="alert">Không tải được trạng thái ngày. Bạn vẫn có thể chọn ngày.</p>}
          <div className="report-calendar-selected">Ngày chọn: <strong>{formatDate(value)}</strong>{value.slice(0, 7) === viewMonth && !loading && !error && <span> · {currentEntry?.submittedCount || 0}/12 khoa · {currentStatus.label}</span>}</div>
          <div className="report-calendar-legend">
            <span className="is-unlocked">Chưa khóa</span><span className="is-partial">Khóa một phần</span><span className="is-locked">Đã khóa</span><span className="is-trash">Thùng rác</span><span className="is-deleted">Đã xóa</span><span className="is-empty">Chưa báo cáo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCalendar;
