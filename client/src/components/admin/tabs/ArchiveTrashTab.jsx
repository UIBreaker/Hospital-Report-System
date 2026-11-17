import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaCalendarAlt, FaUndo, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import archiveTrashService from '../../../services/archiveTrashService';
import ArchiveFolderCard from './ArchiveFolderCard';
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
  const [datePage, setDatePage] = useState(0);
  const [reportPage, setReportPage] = useState(0);

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
      setDatePage(0);
      setReportPage(0);
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
      <div><h1>Thùng Rác Dữ Liệu</h1><p>Quản lý hồ sơ lưu trữ theo ngày. Dữ liệu chỉ bị xóa khi admin kiểm tra và xác nhận.</p></div>
      <button type="button" onClick={load} disabled={loading}><FaSync /> Làm mới</button>
    </div>
    <div className="archive-trash-note"><FaCalendarAlt /> Tuổi thọ tính từ ngày báo cáo, ngày đầu tiên là 1 ngày. Ngày thứ 366 tự chuyển vào Thùng Rác.</div>
    {notice && <div className="archive-trash-success" role="status">{notice}</div>}
    {error && <div className="archive-trash-error" role="alert">{error}</div>}
    <div className="archive-trash-toolbar">
      <div><strong>{days.length} thư mục trong Thùng Rác</strong><span>{selected.length} ngày đã chọn</span></div>
      <button type="button" className="danger" onClick={showPreview} disabled={!selected.length || busy}>Xem trước và xóa dữ liệu</button>
    </div>
    {loading ? <div className="archive-trash-empty">Đang tải danh sách...</div> : days.length === 0 ? <div className="archive-trash-empty">Thùng Rác hiện trống.</div> :
      <div className="archive-trash-list">{days.map(day => <ArchiveFolderCard
        key={day.date}
        variant="trash"
        type="day"
        title={`Ngày ${displayDate(day.date)}`}
        subTitle={`${day.reportCount}/12 Khoa`}
        counterNumber={String(day.reportCount).padStart(2, '0')}
        counterLabel="PHIẾU KHOA"
        colorTheme="purple"
        statusLabel={day.reason === 'manual' ? 'Chuyển thủ công' : 'Quá 365 ngày'}
        selected={selected.includes(day.date)}
        onSelect={() => toggle(day.date)}
        stats={{ ageDays: day.ageDays, submittedCount: day.reportCount, isFullySubmitted: day.reportCount >= 12, surgeries: day.surgeries, transfers: day.transfers }}
        secondaryAction={{ label: <><FaUndo /> Hoàn tác</>, onClick: () => restore(day.date) }}
      />)}</div>}

    {preview && <div className="archive-trash-overlay" role="presentation" onMouseDown={() => setPreview(null)}>
      <div className="archive-trash-dialog wide archive-trash-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="trash-delete-title" onMouseDown={event => event.stopPropagation()}>
        <div className="archive-trash-delete-header">
          <div className="archive-trash-dialog-icon danger"><FaExclamationTriangle /></div>
          <div><h2 id="trash-delete-title">Xác nhận xóa dữ liệu vĩnh viễn</h2><p>Kiểm tra đúng ngày và phiếu khoa trước khi tiếp tục. Thao tác này không thể hoàn tác.</p></div>
        </div>
        <div className="archive-trash-delete-grid">
          <section className="archive-trash-delete-panel" aria-label="Danh sách sẽ xóa">
            <div className="archive-trash-panel-heading"><strong>{preview.dates.length} ngày báo cáo</strong><span>Danh sách chính xác sẽ xóa</span></div>
            <div className="archive-trash-preview-list">{preview.dates.slice(datePage * 5, datePage * 5 + 5).map(date => <div key={date}><strong>{displayDate(date)}</strong><span>{days.find(item => item.date === date)?.ageDays || '—'} ngày tuổi thọ</span></div>)}</div>
            {preview.dates.length > 5 && <div className="archive-trash-pages"><button type="button" disabled={datePage === 0} onClick={() => setDatePage(page => page - 1)}>Trước</button><span>{datePage + 1}/{Math.ceil(preview.dates.length / 5)}</span><button type="button" disabled={(datePage + 1) * 5 >= preview.dates.length} onClick={() => setDatePage(page => page + 1)}>Sau</button></div>}
            <div className="archive-trash-panel-heading reports-heading"><strong>{preview.reports.length} phiếu khoa</strong><span>Mã phiếu và khoa</span></div>
            <div className="archive-trash-reports">{preview.reports.slice(reportPage * 6, reportPage * 6 + 6).map(report => <div key={report.id}><span>{displayDate(report.date)} · Khoa {report.departmentCode}</span><strong>#{report.id}{report.locked ? ' · Đã khóa' : ''}</strong></div>)}</div>
            {preview.reports.length > 6 && <div className="archive-trash-pages"><button type="button" disabled={reportPage === 0} onClick={() => setReportPage(page => page - 1)}>Trước</button><span>{reportPage + 1}/{Math.ceil(preview.reports.length / 6)}</span><button type="button" disabled={(reportPage + 1) * 6 >= preview.reports.length} onClick={() => setReportPage(page => page + 1)}>Sau</button></div>}
          </section>
          <section className="archive-trash-delete-panel" aria-label="Phạm vi và xác nhận">
            <div className="archive-trash-panel-heading"><strong>Dữ liệu liên quan</strong><span>Cùng các ngày đã chọn</span></div>
            <div className="archive-trash-counts">
              <span><strong>{preview.counts.transfer_cases}</strong> ca chuyển viện</span>
              <span><strong>{preview.counts.surgery_cases}</strong> ca phẫu thuật</span>
              <span><strong>{preview.counts.death_cases}</strong> ca tử vong</span>
              <span><strong>{preview.counts.critical_cases}</strong> ca bệnh nặng</span>
              <span><strong>{preview.counts.custom_form_submissions}</strong> biểu mẫu tùy chỉnh</span>
              <span><strong>{preview.counts.report_audit_logs}</strong> nhật ký báo cáo</span>
            </div>
            {preview.youngerDates.length > 0 && <div className="archive-trash-young">
              <strong><FaExclamationTriangle /> Trong thời hạn lưu trữ</strong>
              <p>{preview.youngerDates.map(displayDate).join(', ')} chưa quá 365 ngày. Hãy kiểm tra kỹ trước khi xóa.</p>
              <label className="archive-trash-young-confirm"><input type="checkbox" checked={youngAcknowledged} onChange={event => setYoungAcknowledged(event.target.checked)} /><span>Tôi đã kiểm tra và vẫn muốn xóa những ngày này.</span></label>
            </div>}
            <label className="archive-trash-confirm-label">Nhập <strong>XOA DU LIEU</strong> để xác nhận<input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" placeholder="XOA DU LIEU" /></label>
          </section>
        </div>
        <div className="archive-trash-dialog-actions"><button type="button" onClick={() => setPreview(null)}>Hủy</button><button type="button" className="danger" onClick={deleteSelected} disabled={busy || confirmation !== 'XOA DU LIEU' || (preview.youngerDates.length > 0 && !youngAcknowledged)}>{busy ? 'Đang xử lý...' : `Xóa vĩnh viễn ${preview.dates.length} ngày`}</button></div>
      </div>
    </div>}
  </div>;
};

export default ArchiveTrashTab;
