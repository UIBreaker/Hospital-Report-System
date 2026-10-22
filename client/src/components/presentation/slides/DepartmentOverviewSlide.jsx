import React from 'react';
import { OVERVIEW_COLUMNS, SUPPORT_COLUMNS, SUPPORT_DEPARTMENT_CODES, totalDepartmentOverview } from '../../../utils/departmentOverview';
import './DepartmentOverviewSlide.css';

const DepartmentOverviewSlide = ({ slide }) => {
  const { rows = [], dailyIntakeTotal = null } = slide;
  const clinicalRows = rows.filter(row => !SUPPORT_DEPARTMENT_CODES.includes(row.code));
  const supportRows = rows.filter(row => SUPPORT_DEPARTMENT_CODES.includes(row.code));
  const totals = totalDepartmentOverview(clinicalRows);
  const supportTotals = totalDepartmentOverview(supportRows, SUPPORT_COLUMNS);
  const unitName = row => ({
    yhct_phcn: 'YHCT – Phục hồi chức năng',
    lck: 'Liên chuyên khoa (4CK)',
  }[row.code] || row.name.replace(/^Khoa /, ''));
  const renderValue = (value, column, isTotal = false) => value === null ? (
    <span className="department-overview__missing" aria-label="Chưa có số liệu">—</span>
  ) : (
    <span className={`department-overview__badge tone-${column.tone}${value === 0 && !isTotal ? ' is-zero' : ''}${column.key === 'tuVong' && value > 0 ? ' is-alert' : ''}`}>
      {value.toLocaleString('vi-VN')}
    </span>
  );

  return (
    <section className="department-overview" aria-label="Báo cáo tổng quan ca trực toàn viện">
      <div className="department-overview__table-wrap department-overview__clinical">
        <table aria-label="Số liệu bệnh nhân của 12 khoa trong ca trực">
          <colgroup>
            <col style={{ width: '26%' }} />
            {OVERVIEW_COLUMNS.map(column => <col key={column.key} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">KHOA / ĐƠN VỊ</th>
              {OVERVIEW_COLUMNS.map(column => <th key={column.key} scope="col" className={`column-${column.key}`}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {clinicalRows.map(row => (
              <tr key={row.code}>
                <th scope="row" title={row.submitted ? row.name : `${row.name} — Chưa nộp báo cáo`}>
                  <span className="department-overview__unit">
                    <span>{unitName(row)}</span>
                  </span>
                </th>
                {OVERVIEW_COLUMNS.map(column => {
                  const value = row.metrics[column.key];
                  return (
                    <td key={column.key} className={`column-${column.key}`}>
                      {renderValue(value, column)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row"><span className="department-overview__sum" aria-hidden="true">Σ</span> TỔNG BẢNG 1</th>
              {OVERVIEW_COLUMNS.map(column => (
                <td key={column.key} className={`column-${column.key}`}>{renderValue(totals[column.key], column, true)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="department-overview__table-wrap department-overview__support">
        <table aria-label="Bảng 2: tổng số tiếp nhận của Xét nghiệm và Chẩn đoán hình ảnh">
          <colgroup><col style={{ width: '26%' }} />{SUPPORT_COLUMNS.map(column => <col key={column.key} />)}</colgroup>
          <thead><tr><th scope="col">CẬN LÂM SÀNG</th>{SUPPORT_COLUMNS.map(column => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {supportRows.map(row => (
              <tr key={row.code}>
                <th scope="row" title={row.submitted ? row.name : `${row.name} — Chưa nộp báo cáo`}>{unitName(row)}</th>
                {SUPPORT_COLUMNS.map(column => <td key={column.key}>{renderValue(row.metrics[column.key], column)}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot><tr><th scope="row">TỔNG CẬN LÂM SÀNG</th>{SUPPORT_COLUMNS.map(column => <td key={column.key}>{renderValue(supportTotals[column.key], column, true)}</td>)}</tr></tfoot>
        </table>
      </div>

      <div className="department-overview__daily" aria-label="Tổng số trong ngày">
        <div><span>TỔNG SỐ KHÁM BỆNH</span>{renderValue(totals.tongSoKham, OVERVIEW_COLUMNS[0])}</div>
        <div><span>TỔNG KHÁM / TIẾP NHẬN TOÀN NGÀY</span>{renderValue(dailyIntakeTotal, OVERVIEW_COLUMNS[0])}</div>
      </div>

      <footer className="department-overview__footer">
        <span><b>—</b> Chưa có số liệu · Lượt chạy thận được tính ở tiếp nhận, không phải khám bệnh.</span>
        <span>Khám/tiếp nhận toàn ngày: cùng cách tính slide mở đầu; không phải số khám bệnh.</span>
      </footer>
    </section>
  );
};

export default DepartmentOverviewSlide;
