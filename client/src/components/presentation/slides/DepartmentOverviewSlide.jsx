import React from 'react';
import { FaHospital, FaCalculator } from 'react-icons/fa';
import { formatDate } from '../../../utils/medicalFormatters';
import { OVERVIEW_COLUMNS, totalDepartmentOverview } from '../../../utils/departmentOverview';
import './DepartmentOverviewSlide.css';

const UNIT_NAMES = {
  lck: 'Liên CK', xn: 'Xét nghiệm', cdha: 'CĐHA',
  hscc_tnt: 'HSCC – TNT', noi: 'Nội', nhi: 'Nhi', nhiem: 'Nhiễm',
  san: 'Sản', yhct_phcn: 'YHCT – PHCN', ngoai_th: 'Ngoại TH',
  ctch: 'CTCH', gmhs: 'Gây mê hồi sức',
};

const DepartmentOverviewSlide = ({ slide }) => {
  const { rows = [], selectedDate } = slide;
  const submittedCount = rows.filter(row => row.submitted).length;
  const totals = totalDepartmentOverview(rows);
  const groups = [rows.slice(0, 6), rows.slice(6)];
  const renderValue = (value, column) => value === null ? (
    <span className="department-overview__missing" aria-label="Chưa có số liệu">—</span>
  ) : (
    <span className={`department-overview__badge tone-${column.tone}${value === 0 ? ' is-zero' : ''}${column.key === 'tuVong' && value > 0 ? ' is-alert' : ''}`}>
      {value.toLocaleString('vi-VN')}
    </span>
  );

  return (
    <section className="department-overview" aria-labelledby="department-overview-title">
      <header className="department-overview__header anim-header-drop">
        <div className="department-overview__heading">
          <FaHospital aria-hidden="true" />
          <div>
            <h2 id="department-overview-title">TỔNG QUAN 12 KHOA</h2>
            <p>THỐNG KÊ BỆNH NHÂN TRONG CA TRỰC</p>
          </div>
        </div>
        <div className="department-overview__date">
          <strong>{formatDate(selectedDate)}</strong>
          <span><i className="department-overview__status" /> <b>{submittedCount}/12</b> khoa đã nộp</span>
        </div>
      </header>

      <div className="department-overview__panels">
        {groups.map((group, groupIndex) => (
          <div className="department-overview__table-wrap" key={groupIndex}>
            <table aria-label={`Số liệu bệnh nhân các khoa ${groupIndex * 6 + 1} đến ${groupIndex * 6 + group.length}`}>
              <colgroup><col style={{ width: '25%' }} />{OVERVIEW_COLUMNS.map(column => <col key={column.key} />)}</colgroup>
              <thead>
                <tr>
                  <th scope="col">ĐƠN VỊ</th>
                  {OVERVIEW_COLUMNS.map(column => <th key={column.key} scope="col" className={`column-${column.key}`}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {group.map((row, index) => (
                  <tr key={row.code}>
                    <th scope="row" aria-label={row.name} title={`${row.name} · ${row.submitted ? 'Đã nộp' : 'Chưa nộp'} báo cáo`}>
                      <span className="department-overview__unit">
                        <span className={`department-overview__order${row.submitted ? '' : ' is-pending'}`} aria-label={row.submitted ? 'Đã nộp' : 'Chưa nộp'}>{String(groupIndex * 6 + index + 1).padStart(2, '0')}</span>
                        <span>{UNIT_NAMES[row.code] || row.name}</span>
                      </span>
                    </th>
                    {OVERVIEW_COLUMNS.map(column => <td key={column.key} className={`column-${column.key}`}>{renderValue(row.metrics[column.key], column)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <section className="department-overview__totals" aria-label="Tổng cộng số liệu đã báo cáo của 12 khoa">
        <div className="department-overview__totals-heading"><FaCalculator aria-hidden="true" /> TỔNG CỘNG 12 KHOA <span>Cộng theo từng chỉ số đã báo cáo</span></div>
        <dl>
          {OVERVIEW_COLUMNS.map(column => (
            <div key={column.key} className={`department-overview__total tone-${column.tone}`}>
              <dt>{column.label}</dt>
              <dd>{renderValue(totals[column.key], column)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <footer className="department-overview__footer">
        <span>— Chưa có số liệu · Số 0: không phát sinh · STT vàng: chưa nộp</span>
        <span>HSCC–TNT: 2 khối · YHCT–PHCN: nội trú · GMHS: hồi tỉnh</span>
      </footer>
    </section>
  );
};

export default DepartmentOverviewSlide;
