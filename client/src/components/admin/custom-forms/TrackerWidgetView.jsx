import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaArrowLeft, 
  FaSpinner, 
  FaUsers, 
  FaClock, 
  FaHospital, 
  FaSync,
  FaFileExcel
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';

const TrackerWidgetView = ({ formCode, onBack }) => {
  const [trackerData, setTrackerData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchTracker = async (d) => {
    setLoading(true);
    try {
      const res = await customFormService.getTrackerData(formCode, { date: d || selectedDate });
      if (res && res.success) {
        setTrackerData(res);
      }
    } catch (err) {
      console.error('Error fetching tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formCode) fetchTracker(selectedDate);
  }, [formCode, selectedDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1rem 1.4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59' }}>
              📊 Theo Dõi Tự Động: {trackerData?.form?.title || 'Data Tracker'}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Tổng hợp thời gian thực nhân sự trực thêm giờ & tăng cường của 12 khoa phòng giao ban.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px'
          }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.85rem' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#1E40AF', outline: 'none' }}
            />
          </div>

          <button
            type="button"
            onClick={() => fetchTracker(selectedDate)}
            disabled={loading}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FaSync className={loading ? 'spinner' : ''} /> Cập nhật
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {trackerData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB', padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>TỔNG NHÂN SỰ TĂNG CƯỜNG</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.2rem' }}>
              {trackerData.total_overtime_staff || 0} người
            </div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981', padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>SỐ KHOA CÓ TĂNG CƯỜNG</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669', marginTop: '0.2rem' }}>
              {new Set((trackerData.data || []).map(d => d.department_code)).size} khoa
            </div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '4px solid #7C3AED', padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>KHOA ĐÃ NỘP BÁO CÁO</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#7C3AED', marginTop: '0.2rem' }}>
              {trackerData.total_departments_reported || 0}/12 khoa
            </div>
          </div>
        </div>
      )}

      {/* Detail Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2rem', color: '#2563EB', marginBottom: '0.65rem' }} />
            <div>Đang tổng hợp dữ liệu tracker...</div>
          </div>
        ) : !trackerData || !trackerData.data || trackerData.data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
            <FaUsers style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '0.65rem' }} />
            <p>Không có nhân sự trực thêm giờ / tăng cường nào được ghi nhận trong ngày {selectedDate}.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>NHÂN SỰ TĂNG CƯỜNG</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>THỜI GIAN TRỰC</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>BÁC SĨ TRỰC CHÍNH</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>ĐIỀU DƯỠNG TRỰC</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>PHÒNG</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.data.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F2C59' }}>
                      {item.department_name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#D97706' }}>
                      👤 {item.staff_name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E40AF' }}>
                      ⏰ {item.time}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {item.doctor_name || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {item.nurse_name || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>
                      {item.room || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackerWidgetView;
