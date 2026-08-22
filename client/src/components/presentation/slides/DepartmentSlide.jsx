import React from 'react';
import { getMetricStyle } from '../../../utils/medicalFormatters';
import { parseDepartmentSections } from '../../../utils/departmentSectionParser';
import { FaUserMd, FaUserNurse, FaClock, FaDoorOpen, FaHospital } from 'react-icons/fa';

const DepartmentSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng';
  const report = slide.report || {};
  const doctorName = slide.doctorName || report.doctor_name || '';
  const nurseName = slide.nurseName || report.nurse_name || '';
  const overtimeStaff = slide.overtimeStaff || report.overtime_staff || [];
  const room = slide.room || report.room || '';
  const formData = slide.formData || (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : report.report_data) || {};
  const theme = slide.theme || { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

  // Parse sections if not already provided or if empty
  const sections = (slide.sections && slide.sections.length > 0)
    ? slide.sections
    : parseDepartmentSections(formData, slide.deptCode || report.department_code);

  // If still empty but formData has keys, build generic metric section as fallback
  let finalSections = [...sections];
  if (finalSections.length === 0 && formData && Object.keys(formData).length > 0) {
    const fallbackItems = [];
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && typeof v !== 'object') {
        fallbackItems.push({
          key: k,
          label: k.replace(/_/g, ' ').toUpperCase(),
          value: String(v)
        });
      }
    });
    if (fallbackItems.length > 0) {
      finalSections.push({
        title: '📊 THỐNG KÊ HOẠT ĐỘNG CHUYÊN MÔN',
        items: fallbackItems
      });
    }
  }

  // Calculate dynamic dimensions based on section count and items count
  const metricSections = finalSections.filter(s => !s.type && s.items);
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

  // Automatic grid columns calculation
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

  const safeOvertime = Array.isArray(overtimeStaff)
    ? overtimeStaff
    : (typeof overtimeStaff === 'string' ? (() => { try { return JSON.parse(overtimeStaff); } catch { return []; } })() : []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.55rem' }}>
      {/* 1. Header: Department Name */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '0.45rem', borderBottom: `2px solid ${theme.border || '#E2E8F0'}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: isFullscreen ? '1.75rem' : '1.35rem',
            width: isFullscreen ? '44px' : '36px',
            height: isFullscreen ? '44px' : '36px',
            borderRadius: '10px',
            backgroundColor: theme.bg || '#EFF6FF',
            border: `1.5px solid ${theme.border || '#BFDBFE'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {theme.icon || '🏥'}
          </div>
          <div>
            <div style={{ fontSize: isFullscreen ? '0.88rem' : '0.75rem', fontWeight: '800', color: theme.main || '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BÁO CÁO CA TRỰC KHOA PHÒNG
            </div>
            <h2 style={{ fontSize: isFullscreen ? '2.2rem' : '1.7rem', fontWeight: '900', color: '#0F2C59', margin: 0, lineHeight: 1.15 }}>
              {deptName}
            </h2>
          </div>
        </div>

        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '46px' : '36px', height: isFullscreen ? '46px' : '36px', flexShrink: 0 }} />
      </div>

      {/* 2. Staff Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap',
        backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px',
        padding: isFullscreen ? '0.5rem 1.1rem' : '0.4rem 0.85rem', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {doctorName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
            <FaUserMd style={{ color: '#2563EB' }} />
            <span style={{ fontSize: isFullscreen ? '1rem' : '0.86rem', color: '#1E40AF', fontWeight: '700' }}>
              BS trực: <strong style={{ color: '#0F2C59' }}>{doctorName}</strong>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
            <FaUserMd style={{ color: '#64748B' }} />
            <span style={{ fontSize: isFullscreen ? '1rem' : '0.86rem', color: '#64748B', fontWeight: '600' }}>
              BS trực: <em>Chưa cập nhật</em>
            </span>
          </div>
        )}

        {nurseName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0FDF4', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
            <FaUserNurse style={{ color: '#16A34A' }} />
            <span style={{ fontSize: isFullscreen ? '1rem' : '0.86rem', color: '#166534', fontWeight: '700' }}>
              Điều dưỡng: <strong style={{ color: '#14532D' }}>{nurseName}</strong>
            </span>
          </div>
        )}

        {safeOvertime.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFBEB', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
            <FaClock style={{ color: '#D97706' }} />
            <span style={{ fontSize: isFullscreen ? '1rem' : '0.86rem', color: '#92400E', fontWeight: '700' }}>
              Tăng cường: <strong style={{ color: '#78350F' }}>{safeOvertime.map(o => `${o.staffName || ''} (${o.time || ''})`).filter(s => s.trim() !== '()').join('; ')}</strong>
            </span>
          </div>
        )}

        {room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FAF5FF', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #DDD6FE', marginLeft: 'auto' }}>
            <FaDoorOpen style={{ color: '#9333EA' }} />
            <span style={{ fontSize: isFullscreen ? '1rem' : '0.86rem', color: '#6B21A8', fontWeight: '800' }}>Phòng: {room}</span>
          </div>
        )}
      </div>

      {/* 3. Main Metrics Container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: dims.gap,
        flex: 1, minHeight: 0, justifyContent: totalMetricsCount <= 4 ? 'center' : 'flex-start',
        overflowY: 'auto'
      }}>
        {finalSections.length > 0 ? (
          finalSections.map((section, sIdx) => {
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
          })
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem 2rem', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '2px dashed #CBD5E1',
            margin: 'auto 0'
          }}>
            <FaHospital style={{ fontSize: '3rem', color: '#94A3B8', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
              Khoa phòng chưa cập nhật số liệu thống kê ca trực
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
              Bác sĩ trực: <strong>{doctorName || 'Chưa phân công'}</strong> &nbsp;|&nbsp; Điều dưỡng: <strong>{nurseName || 'Chưa phân công'}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSlide;
