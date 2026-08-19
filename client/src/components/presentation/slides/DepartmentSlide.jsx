import React from 'react';
import { getMetricStyle } from '../../../utils/medicalFormatters';

const DepartmentSlide = ({ slide, isFullscreen }) => {
  const { deptName, report = {}, sections = [] } = slide;
  const theme = slide.theme || { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

  // Calculate dynamic dimensions based on section count and items count
  const metricSections = sections.filter(s => !s.type && s.items);
  const totalMetricsCount = metricSections.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const metricSectionsCount = metricSections.length;

  const getCardDimensions = () => {
    if (totalMetricsCount <= 6) {
      return {
        padding: isFullscreen ? '1.1rem 1.4rem' : '0.85rem 1.1rem',
        minHeight: isFullscreen ? '78px' : '62px',
        labelSize: isFullscreen ? '1.25rem' : '1rem',
        valueSize: isFullscreen ? '2.4rem' : '1.8rem',
        badgeSize: '0.8rem',
        gap: isFullscreen ? '1rem' : '0.75rem',
        sectionHeaderMb: isFullscreen ? '0.65rem' : '0.45rem',
        sectionHeaderPad: isFullscreen ? '0.5rem 1rem' : '0.35rem 0.8rem',
        sectionHeaderFont: isFullscreen ? '1.25rem' : '1.02rem'
      };
    }
    if (totalMetricsCount <= 12) {
      return {
        padding: isFullscreen ? '0.85rem 1.15rem' : '0.65rem 0.9rem',
        minHeight: isFullscreen ? '65px' : '52px',
        labelSize: isFullscreen ? '1.12rem' : '0.92rem',
        valueSize: isFullscreen ? '2.1rem' : '1.6rem',
        badgeSize: '0.75rem',
        gap: isFullscreen ? '0.8rem' : '0.55rem',
        sectionHeaderMb: isFullscreen ? '0.5rem' : '0.35rem',
        sectionHeaderPad: isFullscreen ? '0.4rem 0.9rem' : '0.28rem 0.7rem',
        sectionHeaderFont: isFullscreen ? '1.18rem' : '0.95rem'
      };
    }
    return {
      padding: isFullscreen ? '0.65rem 0.95rem' : '0.45rem 0.7rem',
      minHeight: isFullscreen ? '52px' : '42px',
      labelSize: isFullscreen ? '1rem' : '0.82rem',
      valueSize: isFullscreen ? '1.85rem' : '1.4rem',
      badgeSize: '0.7rem',
      gap: isFullscreen ? '0.6rem' : '0.4rem',
      sectionHeaderMb: isFullscreen ? '0.4rem' : '0.25rem',
      sectionHeaderPad: isFullscreen ? '0.3rem 0.75rem' : '0.2rem 0.6rem',
      sectionHeaderFont: isFullscreen ? '1.08rem' : '0.86rem'
    };
  };

  const dims = getCardDimensions();

  // Automatic grid columns calculation (6 columns on row 1 for clean hospital admission/discharge alignment)
  const getGridCols = (itemCount) => {
    if (metricSectionsCount === 1) {
      if (itemCount <= 4) return `repeat(${itemCount}, 1fr)`;
      if (itemCount <= 6) return 'repeat(6, 1fr)';
      if (itemCount <= 8) return 'repeat(4, 1fr)';
      if (itemCount <= 12) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
      return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
    }
    if (itemCount <= 2) return `repeat(${itemCount}, 1fr)`;
    if (itemCount === 3) return 'repeat(3, 1fr)';
    if (itemCount === 4) return 'repeat(4, 1fr)';
    if (itemCount === 5) return 'repeat(5, 1fr)';
    if (itemCount === 6) return 'repeat(6, 1fr)';
    if (itemCount <= 8) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)';
    if (itemCount <= 12) return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(6, 1fr)';
    return isFullscreen ? 'repeat(6, 1fr)' : 'repeat(6, 1fr)';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.45rem' }}>
      {/* 1. Header: Department Name */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '0.35rem', borderBottom: `2px solid ${theme.border || '#E2E8F0'}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            fontSize: isFullscreen ? '1.7rem' : '1.35rem', width: isFullscreen ? '42px' : '34px',
            height: isFullscreen ? '42px' : '34px', borderRadius: '10px',
            backgroundColor: theme.bg || '#EFF6FF', border: `1.5px solid ${theme.border || '#BFDBFE'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {theme.icon || '🏥'}
          </div>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.85rem' : '0.72rem', fontWeight: '800', color: theme.main || '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BÁO CÁO CA TRỰC KHOA PHÒNG
            </div>
            <h2 style={{ fontSize: isFullscreen ? '2.1rem' : '1.65rem', fontWeight: '900', color: '#0F2C59', margin: 0, lineHeight: 1.15 }}>
              {deptName}
            </h2>
          </div>
        </div>

        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '44px' : '34px', height: isFullscreen ? '44px' : '34px', flexShrink: 0 }} />
      </div>

      {/* 2. Staff Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
        backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '8px',
        padding: isFullscreen ? '0.45rem 1rem' : '0.35rem 0.75rem', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {report.doctor_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#EFF6FF', padding: '0.22rem 0.65rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '0.85rem' }}>👨‍⚕️</span>
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#1E40AF', fontWeight: '700' }}>
              BS trực: <strong style={{ color: '#0F2C59' }}>{report.doctor_name}</strong>
            </span>
          </div>
        )}
        {report.report_data?.bsTrucTNT && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#F0FDFA', padding: '0.22rem 0.65rem', borderRadius: '6px', border: '1px solid #99F6E4' }}>
            <span style={{ fontSize: '0.85rem' }}>🩺</span>
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#0F766E', fontWeight: '700' }}>
              BS trực TNT: <strong style={{ color: '#115E59' }}>{report.report_data.bsTrucTNT}</strong>
            </span>
          </div>
        )}
        {report.nurse_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#F0FDF4', padding: '0.22rem 0.65rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '0.85rem' }}>👩‍⚕️</span>
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#166534', fontWeight: '700' }}>
              Điều dưỡng: <strong style={{ color: '#14532D' }}>{report.nurse_name}</strong>
            </span>
          </div>
        )}
        {report.overtime_staff && report.overtime_staff.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFFBEB', padding: '0.22rem 0.65rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '0.85rem' }}>⏰</span>
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#92400E', fontWeight: '700' }}>
              Tăng cường: <strong style={{ color: '#78350F' }}>{report.overtime_staff.map(o => `${o.staffName} (${o.time})`).join('; ')}</strong>
            </span>
          </div>
        )}
        {report.room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FAF5FF', padding: '0.22rem 0.65rem', borderRadius: '6px', border: '1px solid #DDD6FE', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.85rem' }}>🚪</span>
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#6B21A8', fontWeight: '800' }}>Phòng: {report.room}</span>
          </div>
        )}
      </div>

      {/* 3. Main Metrics Container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: dims.gap,
        flex: 1, minHeight: 0, justifyContent: totalMetricsCount <= 4 ? 'center' : 'flex-start',
        overflowY: 'auto'
      }}>
        {sections.map((section, sIdx) => {
          // Personnel Banner
          if (section.type === 'personnel') {
            return (
              <div key={sIdx} style={{ backgroundColor: '#F8FAFC', border: '2px solid #CBD5E1', borderLeft: '7px solid #0F2C59', borderRadius: '10px', padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: isFullscreen ? '1.4rem' : '1.15rem' }}>👥</span>
                <div>
                  <div style={{ fontSize: isFullscreen ? '0.95rem' : '0.8rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>{section.title}</div>
                  <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.05rem', fontWeight: '700', color: '#0F2C59' }}>{section.value}</div>
                </div>
              </div>
            );
          }

          // Note / Diễn biến thêm giờ
          if (section.type === 'note') {
            return (
              <div key={sIdx} style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderLeft: '6px solid #D97706', borderRadius: '10px', padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                  <span style={{ fontSize: isFullscreen ? '1.2rem' : '1rem' }}>📝</span>
                  <span style={{ fontSize: isFullscreen ? '1.05rem' : '0.88rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>{section.title}</span>
                </div>
                <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.05rem', fontWeight: '600', color: '#78350F', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{section.value}</div>
              </div>
            );
          }

          // Techniques Table for CDHA
          if (section.tableType === 'techniques' && section.tableRows) {
            return (
              <div key={sIdx}>
                <div style={{ fontSize: dims.sectionHeaderFont, fontWeight: '800', color: '#0F2C59', backgroundColor: '#EFF6FF', padding: dims.sectionHeaderPad, borderRadius: '8px', borderLeft: '5px solid #2563EB', marginBottom: dims.sectionHeaderMb, textTransform: 'uppercase' }}>
                  {section.title}
                </div>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                      <th style={{ padding: isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem', textAlign: 'left', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.9rem' }}>KỸ THUẬT</th>
                      <th style={{ padding: isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.9rem' }}>TỔNG SỐ</th>
                      <th style={{ padding: isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.9rem' }}>BẢO HIỂM</th>
                      <th style={{ padding: isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.9rem' }}>NỘI TRÚ</th>
                      <th style={{ padding: isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem', textAlign: 'center', fontWeight: '800', fontSize: isFullscreen ? '1.05rem' : '0.9rem' }}>NGOẠI TRÚ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableRows.map((tech, tIdx) => (
                      <tr key={tIdx} style={{ backgroundColor: tIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem', fontWeight: '800', color: '#0F2C59', fontSize: isFullscreen ? '1.1rem' : '0.95rem' }}>{tech.name}</td>
                        <td style={{ padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem', textAlign: 'center', fontWeight: '900', color: '#1E40AF', fontSize: isFullscreen ? '1.35rem' : '1.15rem', fontFamily: "'Roboto Mono', monospace" }}>
                          <span style={{ backgroundColor: '#EFF6FF', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>{tech.tongSo || '0'}</span>
                        </td>
                        <td style={{ padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem', textAlign: 'center', fontWeight: '800', color: '#059669', fontSize: isFullscreen ? '1.2rem' : '1.02rem', fontFamily: "'Roboto Mono', monospace" }}>{tech.baoHiem || '0'}</td>
                        <td style={{ padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontFamily: "'Roboto Mono', monospace" }}>{tech.noiTru || '0'}</td>
                        <td style={{ padding: isFullscreen ? '0.7rem 1rem' : '0.5rem 0.8rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: isFullscreen ? '1.1rem' : '0.95rem', fontFamily: "'Roboto Mono', monospace" }}>{tech.ngoaiTru || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Metrics Cards Grid View
          return (
            <div key={sIdx}>
              {section.title && (
                <div style={{
                  fontSize: dims.sectionHeaderFont, fontWeight: '800', color: '#0F2C59',
                  backgroundColor: '#EFF6FF', padding: dims.sectionHeaderPad, borderRadius: '8px',
                  borderLeft: '5px solid #2563EB', marginBottom: dims.sectionHeaderMb,
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {section.title}
                </div>
              )}

              {section.items && (
                <div style={{ display: 'grid', gridTemplateColumns: getGridCols(section.items.length), gap: dims.gap }}>
                  {section.items.map((item, iIdx) => {
                    const style = getMetricStyle(item.key, item.value);
                    return (
                      <div
                        key={iIdx}
                        style={{
                          backgroundColor: style.bg, border: `2px solid ${style.border}`,
                          borderRadius: '10px', padding: dims.padding,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', minHeight: dims.minHeight
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingRight: '0.4rem' }}>
                          <span style={{ fontSize: dims.labelSize, fontWeight: '700', color: style.label, lineHeight: 1.25 }}>
                            {item.label}
                          </span>
                          {style.badge && (
                            <span style={{ fontSize: dims.badgeSize, fontWeight: '800', color: style.text }}>
                              {style.badge}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: dims.valueSize, fontWeight: '900',
                          color: style.text, fontFamily: "'Roboto Mono', monospace", flexShrink: 0
                        }}>
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentSlide;
