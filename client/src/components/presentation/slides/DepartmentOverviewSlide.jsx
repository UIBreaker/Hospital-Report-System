import React from 'react';
import { FaHospital } from 'react-icons/fa';
import { formatDate } from '../../../utils/medicalFormatters';
import { OVERVIEW_COLUMNS } from '../../../utils/departmentOverview';
import './DepartmentOverviewSlide.css';

const DepartmentOverviewSlide = ({ slide }) => {
  const { rows = [], selectedDate } = slide;
  const submittedCount = rows.filter(row => row.submitted).length;

  return (
    <section className="department-overview" aria-labelledby="department-overview-title">
      <header className="department-overview__header anim-header-drop">
        <div className="department-overview__heading">
          <FaHospital aria-hidden="true" />
          <div>
            <p>BÁO CÁO GIAO BAN TOÀN VIỆN</p>
            <h2 id="department-overview-title">TỔNG QUAN 12 KHOA</h2>
          </div>
        </div>
        <div className="department-overview__date">
          <strong>{formatDate(selectedDate)}</strong>
          <span>Đã nộp <b>{submittedCount}/12</b> khoa</span>
        </div>
      </header>

      <div className="department-overview__table-wrap">
        <table aria-label="Số liệu bệnh nhân của 12 khoa trong ca trực">
          <colgroup>
            <col style={{ width: '29%' }} />
            {OVERVIEW_COLUMNS.map(column => <col key={column.key} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">ĐƠN VỊ</th>
              {OVERVIEW_COLUMNS.map(column => <th key={column.key} scope="col">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.code}>
                <th scope="row" title={row.submitted ? row.name : `${row.name} — Chưa nộp báo cáo`}>
                  <span className="department-overview__unit">
                    <span className={`department-overview__status${row.submitted ? ' is-submitted' : ''}`} aria-label={row.submitted ? 'Đã nộp báo cáo' : 'Chưa nộp báo cáo'} />
                    <span>{row.name}</span>
                  </span>
                </th>
                {OVERVIEW_COLUMNS.map(column => {
                  const value = row.metrics[column.key];
                  return (
                    <td key={column.key}>
                      {value === null ? (
                        <span className="department-overview__missing" aria-label="Chưa có số liệu">—</span>
                      ) : (
                        <span className={`department-overview__badge tone-${column.tone}`}>
                          {String(value).padStart(2, '0')}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="department-overview__footer">
        <span><i className="department-overview__status is-submitted" /> Đã nộp <i className="department-overview__status" /> Chưa nộp · <b>—</b> Chưa có số liệu</span>
        <span>HSCC–TNT: cộng 2 khối · YHCT–PHCN: nội trú · GMHS: hiện còn hồi tỉnh</span>
      </footer>
    </section>
  );
};

export default DepartmentOverviewSlide;
