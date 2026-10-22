import React from 'react';
import { OVERVIEW_COLUMNS, SUPPORT_COLUMNS, SUPPORT_DEPARTMENT_CODES, totalDepartmentOverview } from '../../../utils/departmentOverview';
import './DepartmentOverviewSlide.css';

const DepartmentOverviewSlide = ({ slide }) => {
  const { rows = [], dailyIntakeTotal = null, dailyIntakeBreakdown = [] } = slide;
  const clinicalRows = rows.filter(row => !SUPPORT_DEPARTMENT_CODES.includes(row.code));
  const supportRows = rows.filter(row => SUPPORT_DEPARTMENT_CODES.includes(row.code));
  const totals = totalDepartmentOverview(clinicalRows);
  const supportTotals = totalDepartmentOverview(supportRows, SUPPORT_COLUMNS);
  const extraSources = dailyIntakeBreakdown.filter(group => ['admission', 'other'].includes(group.kind));
  const sourceText = source => {
    const label = { noi: 'Nội', nhiem: 'Nhiễm', ctch: 'CTCH', lck: 'LCK', san: 'Sản', nhi: 'Nhi', ngoai_th: 'Ngoại TH', yhct_phcn: 'YHCT', gmhs: 'GMHS' }[source.deptCode] || source.label;
    return `${label} ${source.value.toLocaleString('vi-VN')}`;
  };
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

      <section className="department-overview__formula" aria-label="Cách tính tổng khám và tiếp nhận toàn ngày">
        <div className="department-overview__formula-steps">
          {dailyIntakeBreakdown.map((group, index) => (
            <React.Fragment key={group.kind}>
              {index > 0 && <span className="department-overview__operator" aria-hidden="true">+</span>}
              <div className={`department-overview__term tone-${group.tone}`} title={group.sources.map(sourceText).join(' + ')}>
                {renderValue(group.value, group)}
                <span>{group.kind === 'other' ? 'Khác' : group.label}{group.kind === 'admission' ? '*' : ''}</span>
              </div>
            </React.Fragment>
          ))}
          {dailyIntakeBreakdown.length > 0 && <span className="department-overview__operator" aria-hidden="true">=</span>}
          <div className="department-overview__term department-overview__result" aria-label="Tổng khám và tiếp nhận toàn ngày">
            {renderValue(dailyIntakeTotal, OVERVIEW_COLUMNS[0])}
            <span>Tổng/ngày</span>
          </div>
        </div>
        <div className="department-overview__formula-sources">
          {extraSources.map(group => <span key={group.kind}><b>{group.kind === 'admission' ? '* Bệnh mới thay số khám' : 'Khác'}:</b> {group.sources.map(sourceText).join(' + ')}</span>)}
          <span>Khám/tiếp nhận: lượt, không phải số người.</span>
        </div>
      </section>
    </section>
  );
};

export default DepartmentOverviewSlide;
