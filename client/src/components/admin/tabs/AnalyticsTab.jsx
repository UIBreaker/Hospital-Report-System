import React, { useState, useEffect, useMemo } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaHospital,
  FaAmbulance,
  FaProcedures,
  FaHeartbeat,
  FaSkullCrossbones,
  FaUserCheck,
  FaDoorOpen,
  FaSyncAlt,
  FaInfoCircle,
  FaFileExcel
} from 'react-icons/fa';
import reportService from '../../../services/reportService';
import { formatDate } from '../../../utils/medicalFormatters';

const AnalyticsTab = ({ initialDate = '' }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [range, setRange] = useState('day'); // 'day' | 'month' | 'year'
  const [activeMetricFilter, setActiveMetricFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getHospitalAnalytics(range, selectedDate);
      if (res && res.success && res.data) {
        setAnalyticsData(res.data);
      } else {
        setError('Không thể nạp dữ liệu thống kê.');
      }
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.response?.data?.error || err.message || 'Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDate, range]);

  const comparison = analyticsData?.comparison || {};
  const timeSeries = analyticsData?.timeSeries || [];
  const departmentBreakdown = analyticsData?.departmentBreakdown || [];

  // Render trend badge
  const renderTrendBadge = (item, reverseColor = false) => {
    if (!item) return null;
    const { diff, percent, trend } = item;
    let isGood = trend === 'up';
    if (reverseColor) isGood = trend === 'down';

    let bg = '#F1F5F9', color = '#64748B', Icon = FaMinus;
    if (trend === 'up') {
      bg = isGood ? '#DCFCE7' : '#FEE2E2';
      color = isGood ? '#16A34A' : '#DC2626';
      Icon = FaArrowUp;
    } else if (trend === 'down') {
      bg = isGood ? '#DCFCE7' : '#FEF3C7';
      color = isGood ? '#16A34A' : '#D97706';
      Icon = FaArrowDown;
    }

    const sign = diff > 0 ? '+' : '';
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '999px',
        backgroundColor: bg,
        color: color,
        fontSize: '0.74rem',
        fontWeight: '800'
      }}>
        <Icon style={{ fontSize: '0.65rem' }} />
        <span>{sign}{diff} ({sign}{percent}%)</span>
      </div>
    );
  };

  // KPI Cards configuration
  const kpiCards = useMemo(() => [
    {
      key: 'tongSoKham',
      label: 'TỔNG CA KHÁM & TIẾP NHẬN',
      subLabel: 'Toàn viện trong ngày',
      comp: comparison.tongSoKham,
      icon: <FaHospital />,
      color: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      reverse: false
    },
    {
      key: 'benhMoi',
      label: 'BỆNH MỚI NHẬP VIỆN',
      subLabel: 'Tiếp nhận vào các khoa',
      comp: comparison.benhMoi,
      icon: <FaUserCheck />,
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      reverse: false
    },
    {
      key: 'xuatVien',
      label: 'BỆNH NHÂN XUẤT VIỆN',
      subLabel: 'Ra viện & khỏi bệnh',
      comp: comparison.xuatVien,
      icon: <FaDoorOpen />,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      reverse: false
    },
    {
      key: 'chuyenVien',
      label: 'CA BỆNH CHUYỂN VIỆN',
      subLabel: 'Chuyển tuyến & chuyên khoa',
      comp: comparison.chuyenVien,
      icon: <FaAmbulance />,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      reverse: true
    },
    {
      key: 'phauThuat',
      label: 'CA PHẪU THUẬT / MỔ',
      subLabel: 'Cấp cứu & mổ kế hoạch',
      comp: comparison.phauThuat,
      icon: <FaProcedures />,
      color: '#0891B2',
      bg: '#ECFEFF',
      border: '#A5F3FC',
      reverse: false
    },
    {
      key: 'benhNang',
      label: 'BỆNH NẶNG THEO DÕI',
      subLabel: 'Ca bệnh nặng bàn giao',
      comp: comparison.benhNang,
      icon: <FaHeartbeat />,
      color: '#7C3AED',
      bg: '#FAF5FF',
      border: '#DDD6FE',
      reverse: true
    },
    {
      key: 'tuVong',
      label: 'HỒ SƠ TỬ VONG / NẶNG VỀ',
      subLabel: 'Tử vong & tiên lượng nặng',
      comp: comparison.tuVong,
      icon: <FaSkullCrossbones />,
      color: (comparison.tuVong?.current > 0) ? '#DC2626' : '#64748B',
      bg: (comparison.tuVong?.current > 0) ? '#FEF2F2' : '#F8FAFC',
      border: (comparison.tuVong?.current > 0) ? '#FECACA' : '#E2E8F0',
      reverse: true
    },
    {
      key: 'hienCon',
      label: 'HIỆN CÒN NẰM VIỆN',
      subLabel: 'Tổng bệnh nhân nội trú',
      comp: comparison.hienCon,
      icon: <FaHospital />,
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      reverse: false
    }
  ], [comparison]);

  // SVG Chart Dimensions & Computations
  const chartMetrics = useMemo(() => {
    if (timeSeries.length === 0) return { maxVal: 10, points: [] };

    const getVal = (pt, key) => {
      if (key === 'tongSoKham') return pt.tongSoKham || 0;
      if (key === 'benhMoi') return pt.benhMoi || 0;
      if (key === 'xuatVien') return pt.xuatVien || 0;
      if (key === 'chuyenVien') return pt.chuyenVien || 0;
      if (key === 'phauThuat') return pt.phauThuat || 0;
      if (key === 'benhNang') return pt.benhNang || 0;
      if (key === 'tuVong') return pt.tuVong || 0;
      return (pt.tongSoKham || 0);
    };

    let max = 10;
    timeSeries.forEach(pt => {
      if (activeMetricFilter === 'all') {
        const m = Math.max(pt.tongSoKham || 0, pt.benhMoi || 0, pt.xuatVien || 0, pt.chuyenVien || 0, pt.phauThuat || 0);
        if (m > max) max = m;
      } else {
        const v = getVal(pt, activeMetricFilter);
        if (v > max) max = v;
      }
    });

    // Add 15% headroom
    const maxVal = Math.ceil(max * 1.15) || 10;
    return { maxVal };
  }, [timeSeries, activeMetricFilter]);

  // SVG coordinates
  const width = 850;
  const height = 300;
  const padLeft = 55;
  const padRight = 25;
  const padTop = 30;
  const padBottom = 45;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getCoords = (val, idx, total) => {
    const x = padLeft + (idx / Math.max(total - 1, 1)) * plotW;
    const y = padTop + plotH - (val / chartMetrics.maxVal) * plotH;
    return { x, y };
  };

  const buildSvgPath = (metricKey) => {
    if (timeSeries.length === 0) return '';
    return timeSeries.map((pt, i) => {
      const val = pt[metricKey] || 0;
      const { x, y } = getCoords(val, i, timeSeries.length);
      return (i === 0 ? 'M' : 'L') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  };

  const buildAreaPath = (metricKey) => {
    if (timeSeries.length === 0) return '';
    const linePart = buildSvgPath(metricKey);
    const lastCoord = getCoords(timeSeries[timeSeries.length - 1][metricKey] || 0, timeSeries.length - 1, timeSeries.length);
    const firstCoord = getCoords(timeSeries[0][metricKey] || 0, 0, timeSeries.length);
    const bottomY = padTop + plotH;
    return linePart + ' L ' + lastCoord.x.toFixed(1) + ' ' + bottomY + ' L ' + firstCoord.x.toFixed(1) + ' ' + bottomY + ' Z';
  };

  // Sorted departments for bar chart
  const sortedDepts = useMemo(() => {
    return [...departmentBreakdown].sort((a, b) => (b.tongSoKham || 0) - (a.tongSoKham || 0));
  }, [departmentBreakdown]);

  const maxDeptKham = useMemo(() => {
    return Math.max(...sortedDepts.map(d => d.tongSoKham || 0), 10);
  }, [sortedDepts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ================= 1. HEADER TOOLBAR ================= */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <FaChartLine />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59', margin: 0 }}>
                BÁO CÁO THỐNG KÊ & PHÂN TÍCH TOÀN VIỆN
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                Đánh giá trực quan số liệu, tỷ lệ tăng trưởng so với hôm trước, theo dõi theo ngày, tháng, năm
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Date Picker + Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Range Selector Switch */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1'
          }}>
            <button
              type="button"
              onClick={() => setRange('day')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: range === 'day' ? '#2563EB' : 'transparent',
                color: range === 'day' ? '#FFFFFF' : '#475569',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Theo Ngày
            </button>
            <button
              type="button"
              onClick={() => setRange('month')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: range === 'month' ? '#2563EB' : 'transparent',
                color: range === 'month' ? '#FFFFFF' : '#475569',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Theo Tháng
            </button>
            <button
              type="button"
              onClick={() => setRange('year')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: range === 'year' ? '#2563EB' : 'transparent',
                color: range === 'year' ? '#FFFFFF' : '#475569',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Theo Năm
            </button>
          </div>

          {/* Reference Date Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Mốc ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontWeight: '700',
                color: '#0F2C59',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              padding: '0.45rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Làm mới dữ liệu thống kê"
          >
            <FaSyncAlt className={loading ? 'fa-spin' : ''} /> Làm Mới
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #FECACA',
          color: '#B91C1C',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: '700'
        }}>
          {error}
        </div>
      )}

      {/* ================= 2. TOP 8 KPI CARDS WITH DAY-OVER-DAY TRENDS ================= */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem'
        }}>
          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📌 CHỈ SỐ HOẠT ĐỘNG CHUYÊN MÔN TOÀN VIỆN ({formatDate(selectedDate)})
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
            So sánh trực quan với ngày: <strong>{formatDate(comparison.previousDate)}</strong>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {kpiCards.map((card) => (
            <div
              key={card.key}
              style={{
                backgroundColor: card.bg,
                border: '1.5px solid ' + card.border,
                borderTop: '5px solid ' + card.color,
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                boxShadow: '0 4px 12px rgba(15, 44, 89, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '135px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: '900', color: card.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                    {card.subLabel}
                  </div>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  {card.icon}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.65rem' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: card.color,
                  fontFamily: "'Roboto Mono', monospace",
                  lineHeight: 1
                }}>
                  {card.comp?.current ?? 0}
                </div>
                <div>
                  {renderTrendBadge(card.comp, card.reverse)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 3. CHARTS GRID (2 COLUMNS) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem' }}>
        
        {/* Chart 1: Time Series Trend Chart */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaChartLine style={{ color: '#2563EB' }} /> BIỂU ĐỒ XU HƯỚNG {range === 'day' ? 'THEO NGÀY' : (range === 'month' ? '12 THÁNG TRONG NĂM' : 'THEO NĂM')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Theo dõi biến động lượt khám, tiếp nhận và điều trị qua các mốc thời gian
              </div>
            </div>

            {/* Filter metrics pill */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'tongSoKham', label: 'Khám' },
                { key: 'benhMoi', label: 'Nhập viện' },
                { key: 'xuatVien', label: 'Xuất viện' },
                { key: 'chuyenVien', label: 'Chuyển viện' },
                { key: 'phauThuat', label: 'Phẫu thuật' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveMetricFilter(f.key)}
                  style={{
                    padding: '0.22rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (activeMetricFilter === f.key ? '#2563EB' : '#E2E8F0'),
                    backgroundColor: activeMetricFilter === f.key ? '#EFF6FF' : '#FFFFFF',
                    color: activeMetricFilter === f.key ? '#1D4ED8' : '#64748B',
                    fontWeight: '700',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Area/Line Chart */}
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox={'0 0 ' + width + ' ' + height} style={{ width: '100%', height: 'auto', minWidth: '550px' }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines (5 horizontal levels) */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padTop + plotH * (1 - pct);
                const val = Math.round(chartMetrics.maxVal * pct);
                return (
                  <g key={i}>
                    <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#F1F5F9" strokeWidth="1.5" />
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#94A3B8">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve (Lượt Khám) */}
              {(activeMetricFilter === 'all' || activeMetricFilter === 'tongSoKham') && (
                <>
                  <path d={buildAreaPath('tongSoKham')} fill="url(#blueGrad)" />
                  <path d={buildSvgPath('tongSoKham')} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}

              {/* Area Under Curve (Nhập Viện) */}
              {(activeMetricFilter === 'all' || activeMetricFilter === 'benhMoi') && (
                <>
                  <path d={buildAreaPath('benhMoi')} fill="url(#greenGrad)" />
                  <path d={buildSvgPath('benhMoi')} fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}

              {/* Curve (Phẫu thuật) */}
              {(activeMetricFilter === 'all' || activeMetricFilter === 'phauThuat') && (
                <path d={buildSvgPath('phauThuat')} fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Interactive Data Points & Vertical Highlights */}
              {timeSeries.map((pt, i) => {
                const { x, y } = getCoords(pt.tongSoKham || 0, i, timeSeries.length);
                const isCur = pt.isCurrent;
                return (
                  <g key={i} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
                    {isCur && (
                      <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isCur ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#2563EB"
                      strokeWidth={isCur ? 3 : 2}
                    />
                    {/* X-axis label */}
                    <text
                      x={x}
                      y={height - 15}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isCur ? '900' : '600'}
                      fill={isCur ? '#1E40AF' : '#64748B'}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                backgroundColor: 'rgba(15, 44, 89, 0.92)',
                color: '#FFFFFF',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <div style={{ fontWeight: '800', color: '#93C5FD', marginBottom: '2px' }}>
                  {hoveredPoint.fullLabel}
                </div>
                <div>Tổng khám: <strong>{hoveredPoint.tongSoKham} ca</strong></div>
                <div>Nhập viện: <strong>{hoveredPoint.benhMoi} ca</strong> | Xuất viện: <strong>{hoveredPoint.xuatVien} ca</strong></div>
                <div>Chuyển viện: <strong>{hoveredPoint.chuyenVien} ca</strong> | Phẫu thuật: <strong>{hoveredPoint.phauThuat} ca</strong></div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.76rem', fontWeight: '700' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1E40AF' }}>
              <div style={{ width: '12px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
              <span>Tổng Khám</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669' }}>
              <div style={{ width: '12px', height: '4px', backgroundColor: '#059669', borderRadius: '2px' }} />
              <span>Nhập Viện</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0891B2' }}>
              <div style={{ width: '12px', height: '4px', backgroundColor: '#0891B2', borderRadius: '2px' }} />
              <span>Phẫu Thuật</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Department Patient Volume Bar Distribution */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <FaChartBar style={{ color: '#059669' }} /> PHÂN BỔ THEO KHOA PHÒNG
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem' }}>
              Số lượng bệnh nhân khám & phục vụ ngày {formatDate(selectedDate)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
            {sortedDepts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', padding: '2rem 0' }}>
                Chưa có báo cáo khoa phòng cho ngày này
              </div>
            ) : (
              sortedDepts.map((d, i) => {
                const pct = Math.min(Math.round(((d.tongSoKham || 0) / maxDeptKham) * 100), 100);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: '700' }}>
                      <span style={{ color: '#1E293B' }}>{d.departmentName}</span>
                      <span style={{ color: '#1E40AF', fontWeight: '900' }}>{d.tongSoKham} ca</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: pct + '%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.74rem',
            color: '#64748B',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Đã nộp: <strong>{departmentBreakdown.length}/12 Khoa</strong></span>
            <span>Tổng khám: <strong>{comparison.tongSoKham?.current || 0} ca</strong></span>
          </div>
        </div>

      </div>

      {/* ================= 4. COMPARATIVE MATRIX TABLE ================= */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', textTransform: 'uppercase' }}>
              📋 BẢNG THỐNG KÊ CHI TIẾT CÁC MỐC THỜI GIAN
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Tổng hợp chi tiết lượt khám, nhập viện, xuất viện, ca mổ, chuyển viện và bệnh nặng
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Mốc Thời Gian</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Khoa Nộp</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Tổng Khám</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Bệnh Mới</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Xuất Viện</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Chuyển Viện</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Phẫu Thuật</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Bệnh Nặng</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Tử Vong</th>
              </tr>
            </thead>
            <tbody>
              {timeSeries.map((row, idx) => {
                const isCur = row.isCurrent;
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isCur ? '#EFF6FF' : (idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'),
                      borderBottom: '1px solid #E2E8F0',
                      fontWeight: isCur ? '800' : '500'
                    }}
                  >
                    <td style={{ padding: '0.6rem 0.85rem', color: isCur ? '#1E40AF' : '#1E293B' }}>
                      {row.fullLabel} {isCur && <span style={{ backgroundColor: '#2563EB', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>Đang chọn</span>}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#059669', fontWeight: '800' }}>
                      {row.submittedDeptsCount}/12
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#1E40AF', fontWeight: '800', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {row.tongSoKham}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#0284C7', fontWeight: '700', fontFamily: 'monospace' }}>
                      {row.benhMoi}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#16A34A', fontWeight: '700', fontFamily: 'monospace' }}>
                      {row.xuatVien}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#D97706', fontWeight: '700', fontFamily: 'monospace' }}>
                      {row.chuyenVien}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#0891B2', fontWeight: '700', fontFamily: 'monospace' }}>
                      {row.phauThuat}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: '#7C3AED', fontWeight: '700', fontFamily: 'monospace' }}>
                      {row.benhNang}
                    </td>
                    <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center', color: row.tuVong > 0 ? '#DC2626' : '#64748B', fontWeight: '800', fontFamily: 'monospace' }}>
                      {row.tuVong}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsTab;