import React, { useState, useEffect } from 'react';
import {
  FaDatabase,
  FaSync,
  FaSpinner,
  FaHdd,
  FaLayerGroup,
  FaCalendarAlt,
  FaTable,
  FaFileAlt,
  FaImage,
  FaChartPie
} from 'react-icons/fa';
import reportService from '../../../services/reportService';

const DatabaseTab = ({ date }) => {
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [dbError, setDbError] = useState('');
  const [lastDbUpdate, setLastDbUpdate] = useState('');

  // Daily payload stats
  const [payloadDate, setPayloadDate] = useState(() => date || new Date().toISOString().split('T')[0]);
  const [payloadData, setPayloadData] = useState(null);
  const [loadingPayload, setLoadingPayload] = useState(false);
  const [payloadError, setPayloadError] = useState('');

  useEffect(() => {
    if (date) {
      setPayloadDate(date);
    }
  }, [date]);

  const fetchDatabaseStats = async () => {
    setLoadingDb(true);
    setDbError('');
    try {
      const res = await reportService.getDatabaseStats();
      if (res && res.success) {
        setDbStats(res.data);
        setLastDbUpdate(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      setDbError(err.response?.data?.error || err.message || 'Lỗi khi tải thông số database');
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchPayloadStats = async (targetDate) => {
    const d = targetDate || payloadDate;
    setLoadingPayload(true);
    setPayloadError('');
    try {
      const res = await reportService.getReportsPayloadSize(d);
      if (res && res.success) {
        setPayloadData(res.data);
      }
    } catch (err) {
      setPayloadError(err.response?.data?.error || err.message || 'Lỗi khi tính dung lượng báo cáo');
    } finally {
      setLoadingPayload(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
    fetchPayloadStats(payloadDate);
  }, []);

  const handleDateChange = (newDate) => {
    setPayloadDate(newDate);
    fetchPayloadStats(newDate);
  };

  return (
    <div className="animate-fade-in">
      {/* Controls & Title Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#FFFFFF',
          borderRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-blue)',
              fontSize: '1.3rem'
            }}
          >
            <FaDatabase />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-blue)', fontWeight: '800', margin: 0 }}>
              Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Giám sát dung lượng CSDL và đo lường kích thước dữ liệu báo cáo phát sinh theo từng khoa phòng.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastDbUpdate && (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                backgroundColor: '#F8FAFC',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}
            >
              🔎 Cập nhật: <strong>{lastDbUpdate}</strong>
            </span>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              fetchDatabaseStats();
              fetchPayloadStats(payloadDate);
            }}
            disabled={loadingDb || loadingPayload}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', fontWeight: '700' }}
          >
            <FaSync className={loadingDb || loadingPayload ? 'spinner' : ''} />
            {loadingDb || loadingPayload ? 'Đang tải...' : 'Làm Mới Dữ Liệu'}
          </button>
        </div>
      </div>

      {dbError && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          ⚠️ <strong>Lỗi kết nối cơ sở dữ liệu:</strong> {dbError}
        </div>
      )}

      {/* ==================== 1. DATABASE METRICS OVERVIEW ==================== */}
      {loadingDb && !dbStats ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#FFFFFF', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Đang truy vấn thông số cơ sở dữ liệu...</p>
        </div>
      ) : dbStats ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              borderLeft: '4px solid #3B82F6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                  Tổng Dung Lượng CSDL
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.2rem' }}>
                  {dbStats.total_size || dbStats.database_size || 'N/A'}
                </div>
              </div>
              <FaHdd style={{ fontSize: '2rem', color: '#3B82F6', opacity: 0.6 }} />
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              borderLeft: '4px solid #8B5CF6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                  Tổng Số Bản Ghi Báo Cáo
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#6D28D9', marginTop: '0.2rem' }}>
                  {dbStats.total_reports || dbStats.reports_count || 'N/A'}
                </div>
              </div>
              <FaFileAlt style={{ fontSize: '2rem', color: '#8B5CF6', opacity: 0.6 }} />
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              borderLeft: '4px solid #10B981'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                  Trạng Thái Kết Nối
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803D', marginTop: '0.2rem' }}>
                  {dbStats.status || 'Hoạt động tốt'}
                </div>
              </div>
              <FaLayerGroup style={{ fontSize: '2rem', color: '#10B981', opacity: 0.6 }} />
            </div>
          </div>
        </div>
      ) : null}

      {/* ==================== 2. DAILY PAYLOAD BREAKDOWN ==================== */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--brand-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartPie /> Dung Lượng Dữ Liệu Báo Cáo Theo Ngày
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Chi tiết kích thước văn bản và ảnh đính kèm của từng khoa phòng.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#EFF6FF',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #BFDBFE'
              }}
            >
              <FaCalendarAlt style={{ color: '#1E40AF', fontSize: '0.85rem' }} />
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1E40AF' }}>Ngày:</label>
              <input
                type="date"
                value={payloadDate}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: '700',
                  color: '#1E40AF',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {payloadError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {payloadError}
          </div>
        )}

        {loadingPayload ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--brand-blue)' }} />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Đang tính toán dung lượng báo cáo...</p>
          </div>
        ) : !payloadData || !payloadData.departments || payloadData.departments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FaTable style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>Chưa có dữ liệu dung lượng báo cáo cho ngày {payloadDate}.</p>
          </div>
        ) : (
          <>
            {/* Payload summary bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
                backgroundColor: '#F8FAFC',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>TỔNG DUNG LƯỢNG NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.15rem' }}>
                  {payloadData.totalDaySize || `${payloadData.totalKb || 0} KB`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>DUNG LƯỢNG VĂN BẢN</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#475569', marginTop: '0.15rem' }}>
                  {payloadData.totalTextKb ? `${payloadData.totalTextKb} KB` : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>DUNG LƯỢNG HÌNH ẢNH</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7C3AED', marginTop: '0.15rem' }}>
                  {payloadData.totalImageKb ? `${payloadData.totalImageKb} KB` : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>SỐ KHOA ĐÃ NỘP</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803D', marginTop: '0.15rem' }}>
                  {payloadData.submittedCount || 0}/{payloadData.departments.length}
                </div>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.85rem', width: '45px', textAlign: 'center' }}>STT</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Khoa / Phòng</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Ca Đặc Biệt</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Text (KB)</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Hình Ảnh (KB)</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Tổng (KB)</th>
                    <th style={{ padding: '0.75rem 0.85rem', width: '160px' }}>Tỷ Trọng (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {payloadData.departments.map((dept, idx) => {
                    const totalDeptKb = dept.totalKb || 0;
                    const hasLargePayload = totalDeptKb > 500;
                    const hasMediumPayload = totalDeptKb > 100;
                    const pct = dept.percentage || 0;

                    return (
                      <tr
                        key={dept.departmentCode || idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: !dept.submitted
                            ? '#FAFAFA'
                            : idx % 2 === 0
                            ? '#FFFFFF'
                            : '#F8FAFC'
                        }}
                      >
                        <td style={{ padding: '0.75rem 0.85rem', color: '#94A3B8', fontWeight: '600', textAlign: 'center' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <div style={{ fontWeight: '700', color: dept.submitted ? 'var(--brand-blue)' : '#64748B' }}>
                            {dept.departmentName}
                          </div>
                          {dept.submitted && dept.doctorName && (
                            <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                              BS: {dept.doctorName}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                          {dept.submitted ? (
                            <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                              ✓ Đã nộp
                            </span>
                          ) : (
                            <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', backgroundColor: '#E2E8F0', color: '#64748B' }}>
                              Chưa nộp
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                          {dept.submitted ? (
                            <span style={{ fontWeight: dept.totalCasesCount > 0 ? '700' : '400', color: dept.totalCasesCount > 0 ? '#1E40AF' : '#94A3B8' }}>
                              {dept.totalCasesCount > 0 ? `${dept.totalCasesCount} ca` : '0 ca'}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: '#475569' }}>
                          {dept.submitted ? `${dept.textKb || 0} KB` : '0 KB'}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: (dept.imageKb || 0) > 0 ? '#7C3AED' : '#94A3B8', fontWeight: (dept.imageKb || 0) > 0 ? '700' : '400' }}>
                          {dept.submitted ? `${dept.imageKb || 0} KB` : '0 KB'}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                          {dept.submitted ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: hasLargePayload ? '#FEE2E2' : hasMediumPayload ? '#FEF3C7' : '#DBEAFE',
                                color: hasLargePayload ? '#991B1B' : hasMediumPayload ? '#92400E' : '#1E40AF',
                                fontWeight: '800',
                                fontSize: '0.82rem',
                                padding: '0.25rem 0.6rem'
                              }}
                            >
                              {totalDeptKb >= 1024 ? `${(totalDeptKb / 1024).toFixed(1)} MB` : `${totalDeptKb} KB`}
                            </span>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>0 KB</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          {dept.submitted && pct > 0 ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px', color: '#64748B' }}>
                                <span>{pct}%</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(pct, 100)}%`,
                                    backgroundColor: hasLargePayload ? '#EF4444' : hasMediumPayload ? '#F59E0B' : '#3B82F6',
                                    borderRadius: '3px'
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseTab;
