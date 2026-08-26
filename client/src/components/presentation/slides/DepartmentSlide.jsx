import React from 'react';
import { getMetricStyle, formatPatientAge } from '../../../utils/medicalFormatters';
import { parseDepartmentSections } from '../../../utils/departmentSectionParser';
import { FaUserMd, FaUserNurse, FaClock, FaDoorOpen, FaHospital, FaAmbulance, FaProcedures, FaSkullCrossbones, FaHeartbeat } from 'react-icons/fa';

// Helper to format number into 2-digit padded string (e.g. 8 -> '08') if appropriate
const formatValueBadge = (val) => {
  if (val === null || val === undefined || val === '') return '00';
  const str = String(val).trim();
  if (/^\d+$/.test(str) && str.length === 1) {
    return `0${str}`;
  }
  return str;
};

// Helper to get badge style for values in tables
const getValueBadgeStyle = (key = '', val = '') => {
  const k = key.toLowerCase();
  const v = String(val).trim();

  if (k.includes('xuat') || k.includes('baohiem') || k.includes('bhyt')) {
    return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' }; // Green
  }
  if (k.includes('tong') || k.includes('moi') || k.includes('kham')) {
    return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' }; // Blue
  }
  if (k.includes('cu') || k.includes('hiencon') || k.includes('hienco')) {
    return { bg: '#FAF5FF', color: '#7C3AED', border: '#DDD6FE' }; // Purple
  }
  if (k.includes('chuyen') || k.includes('ketoa') || k.includes('thuthuat') || k.includes('ctdk')) {
    return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' }; // Amber
  }
  if (k.includes('tuvong') || k.includes('nang') || (v !== '0' && v !== '00' && k.includes('tuvong'))) {
    return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }; // Red
  }

  return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
};

const DepartmentSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng';
  const subTitle = slide.subTitle || '';
  const report = slide.report || {};
  const doctorName = slide.doctorName || report.doctor_name || '';
  const nurseName = slide.nurseName || report.nurse_name || '';
  const overtimeStaff = slide.overtimeStaff || report.overtime_staff || [];
  const room = slide.room || report.room || '';
  const formData = slide.formData || (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : report.report_data) || {};
  const theme = slide.theme || { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

  const safeArray = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const transferCases = safeArray(slide.transferCases || report.transferCases || report.transfer_cases);
  const surgeryCases = safeArray(slide.surgeryCases || report.surgeryCases || report.surgery_cases);
  const deathCases = safeArray(slide.deathCases || report.deathCases || report.death_cases);
  const criticalCases = safeArray(slide.criticalCases || report.criticalCases || report.critical_cases);
  const totalCasesCount = transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length;

  // Parse sections
  const sections = (slide.sections && slide.sections.length > 0)
    ? slide.sections
    : parseDepartmentSections(formData, slide.deptCode || report.department_code);

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

  const safeOvertime = Array.isArray(overtimeStaff)
    ? overtimeStaff
    : (typeof overtimeStaff === 'string' ? (() => { try { return JSON.parse(overtimeStaff); } catch { return []; } })() : []);

  // Large-scale auto font scaling for high impact
  const isSingleSection = finalSections.length === 1;
  const FONT_SECTION_HEADER = isFullscreen ? (isSingleSection ? '1.25rem' : '1.12rem') : '0.98rem';
  const FONT_TH = isFullscreen ? (isSingleSection ? '1.15rem' : '1.02rem') : '0.88rem';
  const FONT_TD_LABEL = isFullscreen ? (isSingleSection ? '1.22rem' : '1.1rem') : '0.92rem';
  const FONT_BADGE = isFullscreen ? (isSingleSection ? '1.5rem' : '1.3rem') : '1.12rem';
  const PAD_TH = isFullscreen ? (isSingleSection ? '0.85rem 1.15rem' : '0.7rem 0.95rem') : '0.5rem 0.75rem';
  const PAD_TD = isFullscreen ? (isSingleSection ? '0.75rem 1.15rem' : '0.6rem 0.95rem') : '0.45rem 0.7rem';

  // Render a Universal Medical Table for any list of items
  const renderItemTable = (section, sIdx) => {
    const items = section.items || [];
    if (items.length === 0) return null;

    const isPaired2Col = items.length >= 6;

    if (isPaired2Col) {
      // Split items into 2 columns
      const half = Math.ceil(items.length / 2);
      const rows = [];
      for (let i = 0; i < half; i++) {
        rows.push({
          left: items[i],
          leftIdx: i + 1,
          right: items[i + half] || null,
          rightIdx: i + half + 1
        });
      }

      return (
        <div key={sIdx} style={{ marginBottom: '0.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {section.title && !subTitle && (
            <div style={{
              fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
              backgroundColor: '#EFF6FF', padding: '0.4rem 0.95rem', borderRadius: '8px',
              borderLeft: '5.5px solid #2563EB', marginBottom: '0.45rem',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {section.title}
            </div>
          )}

          <table style={{
            width: '100%', borderCollapse: 'separate', borderSpacing: 0,
            borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #CBD5E1',
            boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
            flex: 1
          }}>
            <thead>
              <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                <th style={{ padding: PAD_TH, textAlign: 'center', width: '5%', fontWeight: '800', fontSize: FONT_TH }}>STT</th>
                <th style={{ padding: PAD_TH, textAlign: 'left', width: '30%', fontWeight: '800', fontSize: FONT_TH }}>CHỈ SỐ BÁO CÁO</th>
                <th style={{ padding: PAD_TH, textAlign: 'center', width: '15%', fontWeight: '800', fontSize: FONT_TH }}>SỐ LƯỢNG</th>
                <th style={{ padding: PAD_TH, textAlign: 'center', width: '5%', fontWeight: '800', fontSize: FONT_TH, borderLeft: '1.5px solid rgba(255,255,255,0.2)' }}>STT</th>
                <th style={{ padding: PAD_TH, textAlign: 'left', width: '30%', fontWeight: '800', fontSize: FONT_TH }}>CHỈ SỐ BÁO CÁO</th>
                <th style={{ padding: PAD_TH, textAlign: 'center', width: '15%', fontWeight: '800', fontSize: FONT_TH }}>SỐ LƯỢNG</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => {
                const lStyle = getValueBadgeStyle(row.left.key, row.left.value);
                const rStyle = row.right ? getValueBadgeStyle(row.right.key, row.right.value) : null;

                return (
                  <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {/* Left item */}
                    <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: '#64748B', fontSize: FONT_TD_LABEL }}>
                      {row.leftIdx}
                    </td>
                    <td style={{ padding: PAD_TD, fontWeight: '800', color: '#0F2C59', fontSize: FONT_TD_LABEL }}>
                      {row.left.label}
                    </td>
                    <td style={{ padding: PAD_TD, textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: lStyle.bg,
                        color: lStyle.color,
                        border: `1.5px solid ${lStyle.border}`,
                        padding: '0.2rem 0.95rem',
                        borderRadius: '10px',
                        fontWeight: '900',
                        fontSize: FONT_BADGE,
                        fontFamily: "'Roboto Mono', monospace",
                        display: 'inline-block',
                        minWidth: '48px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}>
                        {formatValueBadge(row.left.value)}
                      </span>
                    </td>

                    {/* Right item */}
                    <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: '#64748B', fontSize: FONT_TD_LABEL, borderLeft: '1.5px solid #E2E8F0' }}>
                      {row.right ? row.rightIdx : ''}
                    </td>
                    <td style={{ padding: PAD_TD, fontWeight: '800', color: '#0F2C59', fontSize: FONT_TD_LABEL }}>
                      {row.right ? row.right.label : ''}
                    </td>
                    <td style={{ padding: PAD_TD, textAlign: 'center' }}>
                      {row.right ? (
                        <span style={{
                          backgroundColor: rStyle.bg,
                          color: rStyle.color,
                          border: `1.5px solid ${rStyle.border}`,
                          padding: '0.2rem 0.95rem',
                          borderRadius: '10px',
                          fontWeight: '900',
                          fontSize: FONT_BADGE,
                          fontFamily: "'Roboto Mono', monospace",
                          display: 'inline-block',
                          minWidth: '48px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          {formatValueBadge(row.right.value)}
                        </span>
                      ) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Full-Width Single-Column Table
    return (
      <div key={sIdx} style={{ marginBottom: '0.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {section.title && !subTitle && (
          <div style={{
            fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
            backgroundColor: '#EFF6FF', padding: '0.4rem 0.95rem', borderRadius: '8px',
            borderLeft: '5.5px solid #2563EB', marginBottom: '0.45rem',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {section.title}
          </div>
        )}

        <table style={{
          width: '100%', borderCollapse: 'separate', borderSpacing: 0,
          borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #CBD5E1',
          boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
          flex: 1
        }}>
          <thead>
            <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
              <th style={{ padding: PAD_TH, textAlign: 'center', width: '8%', fontWeight: '800', fontSize: FONT_TH }}>STT</th>
              <th style={{ padding: PAD_TH, textAlign: 'left', width: '52%', fontWeight: '800', fontSize: FONT_TH }}>CHỈ TIÊU / HOẠT ĐỘNG CHUYÊN MÔN</th>
              <th style={{ padding: PAD_TH, textAlign: 'center', width: '22%', fontWeight: '800', fontSize: FONT_TH }}>SỐ LƯỢNG / BÁO CÁO</th>
              <th style={{ padding: PAD_TH, textAlign: 'center', width: '18%', fontWeight: '800', fontSize: FONT_TH }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, iIdx) => {
              const style = getValueBadgeStyle(item.key, item.value);

              return (
                <tr key={iIdx} style={{ backgroundColor: iIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: '#64748B', fontSize: FONT_TD_LABEL }}>
                    {iIdx + 1}
                  </td>
                  <td style={{ padding: PAD_TD, fontWeight: '800', color: '#0F2C59', fontSize: FONT_TD_LABEL }}>
                    {item.label}
                  </td>
                  <td style={{ padding: PAD_TD, textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: style.bg,
                      color: style.color,
                      border: `1.5px solid ${style.border}`,
                      padding: '0.25rem 1.15rem',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: FONT_BADGE,
                      fontFamily: "'Roboto Mono', monospace",
                      display: 'inline-block',
                      minWidth: '58px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      {formatValueBadge(item.value)}
                    </span>
                  </td>
                  <td style={{ padding: PAD_TD, textAlign: 'center', fontSize: isFullscreen ? '1.05rem' : '0.88rem', fontWeight: '700', color: '#10B981' }}>
                    ✓ Đã ghi nhận
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: isFullscreen ? '0.65rem' : '0.45rem' }}>
      
      {/* 1. Header: Executive Department Name & Sub-Title Banner */}
      <div 
        className="anim-header-drop"
        style={{
          backgroundColor: '#0F2C59',
          borderRadius: '14px',
          padding: isFullscreen ? '0.7rem 1.3rem' : '0.5rem 0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(15, 44, 89, 0.25)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '0.95rem' : '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: isFullscreen ? '1.95rem' : '1.5rem',
            fontWeight: '900',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem'
          }}>
            <FaHospital style={{ color: '#38BDF8', fontSize: isFullscreen ? '1.8rem' : '1.35rem' }} />
            <span>{deptName}</span>
          </div>

          {subTitle ? (
            <div style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              padding: isFullscreen ? '0.35rem 1rem' : '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: isFullscreen ? '1.12rem' : '0.9rem',
              fontWeight: '900',
              letterSpacing: '0.5px',
              border: '1.5px solid #38BDF8',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)'
            }}>
              {subTitle}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              padding: isFullscreen ? '0.35rem 0.95rem' : '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: isFullscreen ? '1.05rem' : '0.85rem',
              fontWeight: '900',
              letterSpacing: '0.5px'
            }}>
              BÁO CÁO CA TRỰC KHOA PHÒNG
            </div>
          )}
        </div>

        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '44px' : '34px', height: isFullscreen ? '44px' : '34px', objectFit: 'contain', flexShrink: 0 }} />
      </div>

      {/* 2. Staff Banner */}
      <div 
        className="anim-info-pop anim-delay-1"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap',
          backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px',
          padding: isFullscreen ? '0.4rem 0.95rem' : '0.3rem 0.75rem', flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        {doctorName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
            <FaUserMd style={{ color: '#2563EB' }} />
            <span style={{ fontSize: isFullscreen ? '0.94rem' : '0.82rem', color: '#1E40AF', fontWeight: '700' }}>
              BS trực: <strong style={{ color: '#0F2C59' }}>{doctorName}</strong>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '0.2rem 0.65rem', borderRadius: '6px' }}>
            <FaUserMd style={{ color: '#64748B' }} />
            <span style={{ fontSize: isFullscreen ? '0.94rem' : '0.82rem', color: '#64748B', fontWeight: '600' }}>
              BS trực: <em>Chưa cập nhật</em>
            </span>
          </div>
        )}

        {nurseName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0FDF4', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
            <FaUserNurse style={{ color: '#16A34A' }} />
            <span style={{ fontSize: isFullscreen ? '0.94rem' : '0.82rem', color: '#166534', fontWeight: '700' }}>
              Điều dưỡng: <strong style={{ color: '#14532D' }}>{nurseName}</strong>
            </span>
          </div>
        )}

        {safeOvertime.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFF7ED', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
            <FaClock style={{ color: '#D97706' }} />
            <span style={{ fontSize: isFullscreen ? '0.94rem' : '0.82rem', color: '#92400E', fontWeight: '700' }}>
              Tăng cường: <strong style={{ color: '#78350F' }}>{safeOvertime.map(o => `${o.staffName || ''} (${o.time || ''})`).filter(s => s.trim() !== '()').join('; ')}</strong>
            </span>
          </div>
        )}

        {room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FAF5FF', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #DDD6FE', marginLeft: 'auto' }}>
            <FaDoorOpen style={{ color: '#9333EA' }} />
            <span style={{ fontSize: isFullscreen ? '0.94rem' : '0.82rem', color: '#6B21A8', fontWeight: '800' }}>Phòng: {room}</span>
          </div>
        )}
      </div>

      {/* 3. Main Tables Container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.55rem',
        flex: 1, minHeight: 0, justifyContent: 'flex-start',
        overflowY: 'auto'
      }}>
        {finalSections.length > 0 ? (
          finalSections.map((sec, idx) => {
            // Note section
            if (sec.type === 'note' || sec.type === 'personnel') {
              return (
                <div key={idx} className="anim-info-pop anim-delay-2" style={{
                  backgroundColor: sec.type === 'personnel' ? '#EFF6FF' : '#FFFBEB',
                  border: `1.5px solid ${sec.type === 'personnel' ? '#BFDBFE' : '#FDE68A'}`,
                  borderRadius: '12px',
                  padding: isFullscreen ? '0.75rem 1.15rem' : '0.55rem 0.85rem'
                }}>
                  <div style={{
                    fontSize: isFullscreen ? '0.95rem' : '0.82rem',
                    fontWeight: '800',
                    color: sec.type === 'personnel' ? '#1E40AF' : '#92400E',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase'
                  }}>
                    📌 {sec.title}
                  </div>
                  <div style={{ fontSize: isFullscreen ? '1.05rem' : '0.92rem', color: '#1E293B', fontWeight: '600', lineHeight: 1.4 }}>
                    {sec.value}
                  </div>
                </div>
              );
            }

            // Custom table (like GMHS, LCK, Techniques, or Standard Items)
            if (sec.tableType === 'custom_table' || sec.tableType === 'techniques') {
              const headers = sec.headers || [];
              const rows = sec.tableRows || [];
              const rowKeys = sec.rowKeys || [];

              return (
                <div key={idx} className="anim-info-pop anim-delay-2" style={{ marginBottom: '0.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {sec.title && !subTitle && (
                    <div style={{
                      fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
                      backgroundColor: '#EFF6FF', padding: '0.4rem 0.95rem', borderRadius: '8px',
                      borderLeft: '5.5px solid #2563EB', marginBottom: '0.45rem',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {sec.title}
                    </div>
                  )}

                  <table style={{
                    width: '100%', borderCollapse: 'separate', borderSpacing: 0,
                    borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #CBD5E1',
                    boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
                    flex: 1
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                        <th style={{ padding: PAD_TH, textAlign: 'center', width: '6%', fontWeight: '800', fontSize: FONT_TH }}>STT</th>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} style={{
                            padding: PAD_TH,
                            textAlign: hIdx === 0 ? 'left' : 'center',
                            fontWeight: '800',
                            fontSize: FONT_TH
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rIdx) => {
                        const isTotal = row.isTotal;
                        return (
                          <tr key={rIdx} style={{
                            backgroundColor: isTotal ? '#EFF6FF' : (rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'),
                            fontWeight: isTotal ? '900' : 'normal',
                            borderBottom: '1px solid #E2E8F0'
                          }}>
                            <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: isTotal ? '#1E40AF' : '#64748B', fontSize: FONT_TD_LABEL }}>
                              {rIdx + 1}
                            </td>
                            {rowKeys.map((k, kIdx) => {
                              const val = row[k] !== undefined ? row[k] : '—';
                              const isFirst = kIdx === 0;

                              return (
                                <td key={kIdx} style={{
                                  padding: PAD_TD,
                                  textAlign: isFirst ? 'left' : 'center',
                                  fontWeight: (isFirst || isTotal) ? '800' : '700',
                                  color: isTotal ? '#1E40AF' : '#0F2C59',
                                  fontSize: FONT_TD_LABEL
                                }}>
                                  {!isFirst && val !== '—' ? (
                                    <span style={{
                                      backgroundColor: isTotal ? '#DBEAFE' : '#EFF6FF',
                                      color: '#1E40AF',
                                      border: '1.5px solid #BFDBFE',
                                      padding: '0.2rem 0.85rem',
                                      borderRadius: '8px',
                                      fontWeight: '900',
                                      fontSize: FONT_BADGE,
                                      fontFamily: "'Roboto Mono', monospace",
                                      display: 'inline-block',
                                      minWidth: '42px'
                                    }}>
                                      {formatValueBadge(val)}
                                    </span>
                                  ) : (
                                    val
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Standard item list
            return renderItemTable(sec, idx);
          })
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
            fontStyle: 'italic',
            fontSize: '1.1rem'
          }}>
            Chưa có dữ liệu số liệu báo cáo cho khoa này.
          </div>
        )}
      </div>

    </div>
  );
};

export default DepartmentSlide;
