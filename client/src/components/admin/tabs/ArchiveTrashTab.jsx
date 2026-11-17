import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaCalendarAlt, FaUndo, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import archiveTrashService from '../../../services/archiveTrashService';
import './archiveTrash.css';

const displayDate = date => date.split('-').reverse().join('/');

const ArchiveTrashTab = () => {
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [youngAcknowledged, setYoungAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await archiveTrashService.getTrash();
      setDays(response.data || []);
    } catch (err) { setError(err.response?.data?.error || 'Không thể tải Thùng Rác Dữ liệu.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = date => setSelected(current => current.includes(date) ? current.filter(item => item !== date) : [...current, date]);

  const showPreview = async () => {
    if (!selected.length || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await archiveTrashService.previewDelete(selected);
      setPreview(response.data);
      setConfirmation('');
      setYoungAcknowledged(false);
    } catch (err) { setError(err.response?.data?.error || 'Không thể kiểm tra dữ liệu trước khi xóa.'); }
    finally { setBusy(false); }
  };

  const deleteSelected = async () => {
    if (!preview || confirmation !== 'XOA DU LIEU' || (preview.youngerDates.length && !youngAcknowledged) || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await archiveTrashService.deleteSelected(preview.dates, preview.digest, confirmation);
      setNotice(`Đã xóa ${result.deleted.reportCount} phiếu báo cáo thuộc ${result.deleted.dates.length} ngày đã xác nhận.`);
      setSelected([]);
      setPreview(null);
      await load();
    } catch (err) {
      setPreview(null);
      setError(err.response?.data?.error || 'Không thể xóa. Vui lòng xem lại danh sách.');
    } finally { setBusy(false); }
  };

  const restore = async date => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await archiveTrashService.restoreFromTrash(date);
      setSelected(current => current.filter(item => item !== date));
      setNotice(`Đã đưa ngày ${displayDate(date)} trở lại Kho Lưu Trữ.`);
      await load();
    } catch (err) { setError(err.response?.data?.error || 'Không thể khôi phục ngày báo cáo.'); }
    finally { setBusy(false); }
  };

  return <div className="archive-trash-page">
    <div className="archive-trash-hero">
      <div className="archive-trash-hero-icon"><FaTrashAlt /></div>
      <div><h1>Thùng Rác Dữ liệu</h1><p>Báo cáo quá 365 ngày tự xuất hiện tại đây. Dữ liệu chỉ bị xóa khi admin xác nhận.</p></div>
      <button type="button" onClick={load} disabled={loading}><FaSync /> Làm mới</button>
    </div>
    <div className="archive-trash-note"><FaCalendarAlt /> Tuổi thọ tính từ ngày báo cáo, ngày đầu tiên là 1 ngày. Ngày thứ 366 tự chuyển vào Thùng Rác.</div>
    {notice && <div className="archive-trash-success" role="status">{notice}</div>}
    {error && <div className="archive-trash-error" role="alert">{error}</div>}
    <div className="archive-trash-toolbar">
      <div><strong>{days.length} ngày trong Thùng Rác</strong><span>{selected.length} ngày đã chọn</span></div>
      <button type="button" className="danger" onClick={showPreview} disabled={!selected.length || busy}>Xem trước và xóa dữ liệu</button>
    </div>
    {loading ? <div className="archive-trash-empty">Đang tải danh sách...</div> : days.length === 0 ? <div className="archive-trash-empty">Thùng Rác hiện trống.</div> :
      <div className="archive-trash-list">{days.map(day => <label key={day.date} className={`archive-trash-row ${selected.includes(day.date) ? 'selected' : ''}`}>
        <input type="checkbox" checked={selected.includes(day.date)} onChange={() => toggle(day.date)} aria-label={`Chọn báo cáo ngày ${displayDate(day.date)}`} />
        <div className="archive-trash-row-main"><strong>Báo cáo ngày {displayDate(day.date)}</strong><span>{day.reportCount} phiếu khoa · Tuổi thọ {day.ageDays} ngày</span></div>
        <span className={`archive-trash-tag ${day.reason === 'manual' ? 'manual' : ''}`}>{day.reason === 'manual' ? 'Chuyển thủ công' : 'Quá 365 ngày'}</span>
        {day.reason === 'manual' && <button type="button" onClick={event => { event.preventDefault(); restore(day.date); }} disabled={busy}><FaUndo /> Khôi phục</button>}
      </label>)}</div>}

    {preview && <div className="archive-trash-overlay" role="presentation" onMouseDown={() => setPreview(null)}>
      <div className="archive-trash-dialog wide" role="dialog" aria-modal="true" aria-labelledby="trash-delete-title" onMouseDown={event => event.stopPropagation()}>
        <div className="archive-trash-dialog-icon danger"><FaExclamationTriangle /></div>
        <h2 id="trash-delete-title">Kiểm tra dữ liệu trước khi xóa vĩnh viễn</h2>
        <p>Thao tác này không thể hoàn tác. Những báo cáo và dữ liệu ca bệnh dưới đây sẽ bị xóa khỏi hệ thống.</p>
        <div className="archive-trash-preview-list">{preview.dates.map(date => <div key={date}><strong>{displayDate(date)}</strong><span>Tuổi thọ {days.find(item => item.date === date)?.ageDays || '—'} ngày</span></div>)}</div>
        <div className="archive-trash-counts">
          <span><strong>{preview.reports.length}</strong> phiếu khoa</span>
          <span><strong>{preview.counts.transfer_cases}</strong> ca chuyển viện</span>
          <span><strong>{preview.counts.surgery_cases}</strong> ca phẫu thuật</span>
          <span><strong>{preview.counts.death_cases}</strong> ca tử vong</span>
          <span><strong>{preview.counts.critical_cases}</strong> ca bệnh nặng</span>
          <span><strong>{preview.counts.custom_form_submissions}</strong> biểu mẫu tùy chỉnh</span>
          <span><strong>{preview.counts.report_audit_logs}</strong> nhật ký báo cáo</span>
        </div>
        <details><summary>Xem chính xác từng phiếu khoa sẽ xóa</summary><div className="archive-trash-reports">{preview.reports.map(report => <div key={report.id}>{displayDate(report.date)} · {report.departmentCode} · Phiếu #{report.id}{report.locked ? ' · Đã khóa sổ' : ''}</div>)}</div></details>
        {preview.youngerDates.length > 0 && <div className="archive-trash-young">
          <strong><FaExclamationTriangle /> Cảnh báo: báo cáo chưa quá 365 ngày</strong>
          <p>{preview.youngerDates.map(displayDate).join(', ')}. Hãy kiểm tra kỹ vì đây là dữ liệu trong thời hạn lưu trữ.</p>
          <label><input type="checkbox" checked={youngAcknowledged} onChange={event => setYoungAcknowledged(event.target.checked)} /> Tôi đã kiểm tra và vẫn muốn xóa các ngày chưa quá 365 ngày.</label>
        </div>}
        <label className="archive-trash-confirm-label">Nhập <strong>XOA DU LIEU</strong> để xác nhận<input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" /></label>
        <div className="archive-trash-dialog-actions"><button type="button" onClick={() => setPreview(null)}>Hủy</button><button type="button" className="danger" onClick={deleteSelected} disabled={busy || confirmation !== 'XOA DU LIEU' || (preview.youngerDates.length > 0 && !youngAcknowledged)}>{busy ? 'Đang xử lý...' : `Xóa vĩnh viễn ${preview.dates.length} ngày`}</button></div>
      </div>
    </div>}
  </div>;
};

export default ArchiveTrashTab;
