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
  FaFileExcel,
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaSkullCrossbones,
  FaNotesMedical,
  FaUserInjured,
  FaCheckCircle,
  FaBed,
  FaVials,
  FaMicroscope
} from 'react-icons/fa';
import customFormService from '../../../services/customFormService';
import MedicalLoader from '../../common/MedicalLoader';

const TrackerWidgetView = ({ formCode, onBack, isEmbedded = false }) => {
  const [trackerData, setTrackerData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [activeCaseTab, setActiveCaseTab] = useState('all'); // for clinical_cases: 'all' | 'transfer' | 'surgery' | 'critical' | 'death'

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

  const source = trackerData?.source || 'overtime_staff';
  const themeColor = trackerData?.form?.theme_color || '#2563EB';

  const formatDateVN = (dStr) => {
    if (!dStr) return '';
    const p = String(dStr).split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };

  const handleShiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newStr = d.toISOString().split('T')[0];
    setSelectedDate(newStr);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1.1rem 1.5rem',
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
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
              📊 Theo Dõi Tự Động: {trackerData?.form?.title || 'Data Tracker'}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              {source === 'overtime_staff' && 'Tổng hợp thời gian thực nhân sự trực thêm giờ & tăng cường của 12 khoa phòng giao ban.'}
              {source === 'clinical_cases' && 'Tổng hợp toàn bộ 4 loại ca bệnh (Chuyển viện, Phẫu thuật, Bệnh nặng, Tử vong) toàn viện.'}
              {source === 'examination_metrics' && 'Bảng điều khiển tổng hợp lượt khám & điều trị nội trú, ngoại trú 12 khoa giao ban.'}
            </p>
          </div>
        </div>

        {/* Date Selector and Refresh Button */}
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
            <FaSync className={loading ? 'spinner' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          color: '#64748B',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <FaSpinner className="spinner" style={{ fontSize: '2rem', color: '#2563EB', marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontWeight: '700' }}>Đang tổng hợp dữ liệu thời gian thực từ 12 khoa phòng...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. VIEW CHO NGUỒN: OVERTIME STAFF (NHÂN SỰ TRỰC THÊM GIỜ) */}
          {/* ========================================================================= */}
          {source === 'overtime_staff' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tổng Nhân Sự Tăng Cường</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F2C59', marginTop: '0.2rem' }}>
                    {trackerData?.total_overtime_staff || 0} <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#64748B' }}>người</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '6px solid #10B981', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Số Khoa Có Tăng Cường</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F2C59', marginTop: '0.2rem' }}>
                    {new Set((trackerData?.data || []).map(d => d.department_code)).size} <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#64748B' }}>/ 12 khoa</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', borderLeft: '6px solid #7C3AED', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Ngày Báo Cáo</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.35rem' }}>
                    {formatDateVN(selectedDate)}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0F2C59' }}>
                    📋 Danh Sách Cán Bộ Trực Tăng Cường & Thêm Giờ ({trackerData?.data?.length || 0} lượt)
                  </span>
                </div>

                {(!trackerData?.data || trackerData.data.length === 0) ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                    ☕ Ngày {formatDateVN(selectedDate)} không có khoa nào ghi nhận nhân sự trực thêm giờ/tăng cường.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                          <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>NHÂN SỰ TĂNG CƯỜNG</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>THỜI GIAN TRỰC</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>PHÒNG / VỊ TRÍ</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>BÁC SĨ TRỰC CA</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>ĐIỀU DƯỠNG TRỰC CA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trackerData.data.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>{idx + 1}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#1E40AF' }}>{row.department_name}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F2C59' }}>{row.staff_name}</td>
                            <td style={{ padding: '0.75rem 1rem' }}><span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700' }}>⏰ {row.time}</span></td>
                            <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.room || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '600' }}>{row.doctor_name || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '600' }}>{row.nurse_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. VIEW CHO NGUỒN: CLINICAL CASES (TỔNG HỢP 4 LOẠI CA BỆNH TOÀN VIỆN) */}
          {/* ========================================================================= */}
          {source === 'clinical_cases' && (() => {
            const summary = trackerData?.summary || {};
            const cases = trackerData?.data || {};
            const transferList = cases.transferCases || [];
            const surgeryList = cases.surgeryCases || [];
            const criticalList = cases.criticalCases || [];
            const deathList = cases.deathCases || [];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 4 Summary KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div
                    onClick={() => setActiveCaseTab('transfer')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: `1.5px solid ${activeCaseTab === 'transfer' ? '#D97706' : '#E2E8F0'}`,
                      borderLeft: '6px solid #D97706',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      boxShadow: activeCaseTab === 'transfer' ? '0 4px 15px rgba(217, 119, 6, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '800', textTransform: 'uppercase' }}>Bệnh Chuyển Viện</span>
                      <FaAmbulance style={{ color: '#D97706', fontSize: '1.2rem' }} />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#B45309', marginTop: '0.2rem' }}>
                      {summary.total_transfer || 0} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>ca</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveCaseTab('surgery')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: `1.5px solid ${activeCaseTab === 'surgery' ? '#1D4ED8' : '#E2E8F0'}`,
                      borderLeft: '6px solid #1D4ED8',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      boxShadow: activeCaseTab === 'surgery' ? '0 4px 15px rgba(29, 78, 216, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: '800', textTransform: 'uppercase' }}>Ca Phẫu Thuật</span>
                      <FaProcedures style={{ color: '#1D4ED8', fontSize: '1.2rem' }} />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1D4ED8', marginTop: '0.2rem' }}>
                      {summary.total_surgery || 0} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>ca</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveCaseTab('critical')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: `1.5px solid ${activeCaseTab === 'critical' ? '#7C3AED' : '#E2E8F0'}`,
                      borderLeft: '6px solid #7C3AED',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      boxShadow: activeCaseTab === 'critical' ? '0 4px 15px rgba(124, 58, 237, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#5B21B6', fontWeight: '800', textTransform: 'uppercase' }}>Bệnh Nặng Theo Dõi</span>
                      <FaHeartbeat style={{ color: '#7C3AED', fontSize: '1.2rem' }} />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7C3AED', marginTop: '0.2rem' }}>
                      {summary.total_critical || 0} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>ca</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveCaseTab('death')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: `1.5px solid ${activeCaseTab === 'death' ? '#DC2626' : '#E2E8F0'}`,
                      borderLeft: '6px solid #DC2626',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      boxShadow: activeCaseTab === 'death' ? '0 4px 15px rgba(220, 38, 38, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase' }}>Hồ Sơ Tử Vong</span>
                      <FaSkullCrossbones style={{ color: '#DC2626', fontSize: '1.2rem' }} />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#DC2626', marginTop: '0.2rem' }}>
                      {summary.total_death || 0} <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>ca</span>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `Tất Cả Ca Bệnh (${summary.total_cases || 0})` },
                    { key: 'transfer', label: `Chuyển Viện (${transferList.length})` },
                    { key: 'surgery', label: `Phẫu Thuật (${surgeryList.length})` },
                    { key: 'critical', label: `Bệnh Nặng (${criticalList.length})` },
                    { key: 'death', label: `Tử Vong (${deathList.length})` }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveCaseTab(t.key)}
                      style={{
                        backgroundColor: activeCaseTab === t.key ? '#0F2C59' : '#FFFFFF',
                        color: activeCaseTab === t.key ? '#FFFFFF' : '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '0.45rem 0.85rem',
                        fontWeight: activeCaseTab === t.key ? '800' : '600',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Detailed Cards for Selected Case Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Transfer Cases */}
                  {(activeCaseTab === 'all' || activeCaseTab === 'transfer') && transferList.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#B45309', fontSize: '0.96rem', fontWeight: '800' }}>
                        🚑 Danh Sách Bệnh Nhân Chuyển Viện ({transferList.length} ca)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                        {transferList.map((c, i) => (
                          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #FDE68A', borderLeft: '5px solid #D97706', borderRadius: '12px', padding: '0.9rem 1.1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <strong style={{ fontSize: '0.96rem', color: '#0F2C59' }}>{c.patient_name || c.patientName}</strong>
                              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>{c.department_name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                              Tuổi: <strong>{c.age || '—'}</strong> | Vào viện: <strong>{c.admission_time || c.admissionTime || '—'}</strong> | Đ/C: {c.address || '—'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                              <div><strong>Lý do:</strong> {c.reason || '—'}</div>
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#B45309', fontWeight: '700' }}>{c.diagnosis || '—'}</span></div>
                              <div><strong>Xử trí:</strong> {c.initial_treatment || c.initialTreatment || '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Surgery Cases */}
                  {(activeCaseTab === 'all' || activeCaseTab === 'surgery') && surgeryList.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1D4ED8', fontSize: '0.96rem', fontWeight: '800' }}>
                        🩺 Danh Sách Ca Phẫu Thuật ({surgeryList.length} ca)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                        {surgeryList.map((c, i) => (
                          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #BFDBFE', borderLeft: '5px solid #1D4ED8', borderRadius: '12px', padding: '0.9rem 1.1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <strong style={{ fontSize: '0.96rem', color: '#0F2C59' }}>{c.patient_name || c.patientName}</strong>
                              <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>{c.department_name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                              Năm sinh: <strong>{c.birth_year || c.birthYear || '—'}</strong> | Giờ vào: <strong>{c.admission_time || c.admissionTime || '—'}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                              <div><strong>CĐ trước mổ:</strong> {c.preoperative_diagnosis || c.preoperativeDiagnosis || '—'}</div>
                              <div><strong>Lệnh mổ / CĐ sau mổ:</strong> <span style={{ color: '#1D4ED8', fontWeight: '700' }}>{c.postoperative_diagnosis || c.postoperativeDiagnosis || c.consultation_order || '—'}</span></div>
                              <div><strong>Hiện tại:</strong> {c.current_status || c.currentStatus || '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critical Cases */}
                  {(activeCaseTab === 'all' || activeCaseTab === 'critical') && criticalList.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#7C3AED', fontSize: '0.96rem', fontWeight: '800' }}>
                        💓 Danh Sách Bệnh Nhân Nặng Cần Theo Dõi ({criticalList.length} ca)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                        {criticalList.map((c, i) => (
                          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #DDD6FE', borderLeft: '5px solid #7C3AED', borderRadius: '12px', padding: '0.9rem 1.1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <strong style={{ fontSize: '0.96rem', color: '#0F2C59' }}>{c.patient_name || c.patientName}</strong>
                              <span style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>{c.department_name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                              Tuổi: <strong>{c.age || '—'}</strong> | Vào: <strong>{c.admission_time || c.admissionTime || '—'}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                              <div><strong>Chẩn đoán:</strong> <span style={{ color: '#7C3AED', fontWeight: '700' }}>{c.diagnosis || '—'}</span></div>
                              <div><strong>Diễn biến:</strong> {c.condition_summary || c.conditionSummary || '—'}</div>
                              <div><strong>Xử trí:</strong> {c.treatment || '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Death Cases */}
                  {(activeCaseTab === 'all' || activeCaseTab === 'death') && deathList.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#DC2626', fontSize: '0.96rem', fontWeight: '800' }}>
                        ⚠️ Hồ Sơ Bệnh Nhân Tử Vong ({deathList.length} ca)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                        {deathList.map((c, i) => (
                          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #FECACA', borderLeft: '5px solid #DC2626', borderRadius: '12px', padding: '0.9rem 1.1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <strong style={{ fontSize: '0.96rem', color: '#991B1B' }}>{c.patient_name || c.patientName}</strong>
                              <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>{c.department_name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                              Tuổi: <strong>{c.age || '—'}</strong> | Vào: <strong>{c.admission_time || c.admissionTime || '—'}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                              <div><strong>Chẩn đoán tử vong:</strong> <span style={{ color: '#DC2626', fontWeight: '800' }}>{c.diagnosis || '—'}</span></div>
                              <div><strong>Cấp cứu & Xử trí:</strong> {c.emergency_treatment || c.emergencyTreatment || '—'}</div>
                              <div><strong>Kết luận:</strong> {c.final_outcome || c.finalOutcome || '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {summary.total_cases === 0 && (
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                      🏥 Ngày {formatDateVN(selectedDate)} chưa ghi nhận ca bệnh lâm sàng nào từ 12 khoa giao ban.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* 3. VIEW CHO NGUỒN: EXAMINATION METRICS (THỐNG KÊ LƯỢT KHÁM & ĐIỀU TRỊ) */}
          {/* ========================================================================= */}
          {source === 'examination_metrics' && (() => {
            const summary = trackerData?.summary || {};
            const deptList = trackerData?.data || [];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Hospital Wide Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #2563EB', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tổng Số Khám</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.2rem' }}>{summary.total_kham || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #059669', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Bệnh Mới Nhập Viện</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#065F46', marginTop: '0.2rem' }}>{summary.total_benh_moi || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #0891B2', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Bệnh Cũ</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0E7490', marginTop: '0.2rem' }}>{summary.total_benh_cu || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #10B981', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Xuất Viện</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#047857', marginTop: '0.2rem' }}>{summary.total_xuat_vien || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #D97706', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Chuyển Viện</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#B45309', marginTop: '0.2rem' }}>{summary.total_chuyen_vien || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #7C3AED', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Hiện Còn Điều Trị</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#6D28D9', marginTop: '0.2rem' }}>{summary.total_hien_con || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #1E3A8A', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tổng Số Ca Mổ</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1E3A8A', marginTop: '0.2rem' }}>{summary.total_ca_mo || 0}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '5px solid #DC2626', padding: '0.9rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tử Vong</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#B91C1C', marginTop: '0.2rem' }}>{summary.total_tu_vong || 0}</div>
                  </div>
                </div>

                {/* Detailed Department Breakdown Table */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0F2C59' }}>
                      📊 Bảng Chi Tiết Số Liệu Khám & Điều Trị 12 Khoa Phòng ({deptList.length} khoa đã nộp)
                    </span>
                  </div>

                  {deptList.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                      Chưa có dữ liệu báo cáo nào cho ngày {formatDateVN(selectedDate)}.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                            <th style={{ padding: '0.75rem 1rem', width: '40px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>TỔNG KHÁM</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>BỆNH CŨ</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>BỆNH MỚI</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>XUẤT VIỆN</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>CHUYỂN VIỆN</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>HIỆN CÒN</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>CA MỔ</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800' }}>TỬ VONG</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptList.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>{i + 1}</td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#1E40AF' }}>{d.department_name}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800', color: '#0F2C59' }}>{d.kham || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', color: '#475569' }}>{d.benh_cu || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '700', color: '#065F46' }}>{d.benh_moi || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', color: '#047857' }}>{d.xuat_vien || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '700', color: '#B45309' }}>{d.chuyen_vien || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800', color: '#6D28D9' }}>{d.hien_con || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '700', color: '#1D4ED8' }}>{d.ca_mo || '—'}</td>
                              <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: '800', color: d.tu_vong > 0 ? '#DC2626' : '#94A3B8' }}>{d.tu_vong || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default TrackerWidgetView;
