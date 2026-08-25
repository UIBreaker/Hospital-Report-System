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
  if (k.includes('chuyen') || k.includes('ketoa') || k.includes('thuthuat')) {
    return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' }; // Amber
  }
  if (k.includes('tuvong') || k.includes('nang') || (v !== '0' && v !== '00' && k.includes('tuvong'))) {
    return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }; // Red
  }

  return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
};

const DepartmentSlide = ({ slide, isFullscreen }) => {
  const deptName = slide.deptName || slide.title || 'Khoa Phòng';
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

  // Sizing constants for presentation
  const FONT_SECTION_HEADER = isFullscreen ? '1.15rem' : '0.98rem';
  const FONT_TH = isFullscreen ? '1.05rem' : '0.9rem';
  const FONT_TD_LABEL = isFullscreen ? '1.12rem' : '0.95rem';
  const FONT_BADGE = isFullscreen ? '1.35rem' : '1.15rem';
  const PAD_TH = isFullscreen ? '0.75rem 1rem' : '0.55rem 0.8rem';
  const PAD_TD = isFullscreen ? '0.65rem 1rem' : '0.48rem 0.75rem';

  // Render a Universal Medical Table for any list of items (matching Image 1)
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
        <div key={sIdx} style={{ marginBottom: '0.4rem' }}>
          {section.title && (
            <div style={{
              fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
              backgroundColor: '#EFF6FF', padding: '0.35rem 0.85rem', borderRadius: '8px',
              borderLeft: '5px solid #2563EB', marginBottom: '0.35rem',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {section.title}
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)' }}>
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
                        padding: '0.15rem 0.75rem',
                        borderRadius: '8px',
                        fontWeight: '900',
                        fontSize: FONT_BADGE,
                        fontFamily: "'Roboto Mono', monospace",
                        display: 'inline-block',
                        minWidth: '42px'
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
                          padding: '0.15rem 0.75rem',
                          borderRadius: '8px',
                          fontWeight: '900',
                          fontSize: FONT_BADGE,
                          fontFamily: "'Roboto Mono', monospace",
                          display: 'inline-block',
                          minWidth: '42px'
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

    // Full-Width Single-Column Table (for 1 to 5 items like Khoa Nội, Tổng Số Khám...)
    return (
      <div key={sIdx} style={{ marginBottom: '0.4rem' }}>
        {section.title && (
          <div style={{
            fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
            backgroundColor: '#EFF6FF', padding: '0.35rem 0.85rem', borderRadius: '8px',
            borderLeft: '5px solid #2563EB', marginBottom: '0.35rem',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {section.title}
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)' }}>
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
                      padding: '0.2rem 0.95rem',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontSize: FONT_BADGE,
                      fontFamily: "'Roboto Mono', monospace",
                      display: 'inline-block',
                      minWidth: '50px'
                    }}>
                      {formatValueBadge(item.value)}
                    </span>
                  </td>
                  <td style={{ padding: PAD_TD, textAlign: 'center', fontSize: '0.88rem', fontWeight: '700', color: '#10B981' }}>
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: isFullscreen ? '0.75rem' : '0.55rem' }}>
      
      {/* 1. Header: Executive Department Name Banner */}
      <div style={{
        backgroundColor: '#0F2C59',
        borderRadius: '14px',
        padding: isFullscreen ? '0.75rem 1.4rem' : '0.55rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(15, 44, 89, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '1.1rem' : '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: isFullscreen ? '2.1rem' : '1.65rem',
            fontWeight: '900',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <FaHospital style={{ color: '#38BDF8', fontSize: isFullscreen ? '2rem' : '1.5rem' }} />
            <span>{deptName}</span>
          </div>
          <div style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            padding: isFullscreen ? '0.35rem 0.95rem' : '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: isFullscreen ? '1.15rem' : '0.95rem',
            fontWeight: '900',
            letterSpacing: '0.5px'
          }}>
            BÁO CÁO CA TRỰC KHOA PHÒNG
          </div>
        </div>

        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', objectFit: 'contain', flexShrink: 0 }} />
      </div>

      {/* 2. Staff Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap',
        backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px',
        padding: isFullscreen ? '0.45rem 1rem' : '0.35rem 0.8rem', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {doctorName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', padding: '0.22rem 0.7rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
            <FaUserMd style={{ color: '#2563EB' }} />
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#1E40AF', fontWeight: '700' }}>
              BS trực: <strong style={{ color: '#0F2C59' }}>{doctorName}</strong>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '0.22rem 0.7rem', borderRadius: '6px' }}>
            <FaUserMd style={{ color: '#64748B' }} />
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#64748B', fontWeight: '600' }}>
              BS trực: <em>Chưa cập nhật</em>
            </span>
          </div>
        )}

        {nurseName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0FDF4', padding: '0.22rem 0.7rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
            <FaUserNurse style={{ color: '#16A34A' }} />
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#166534', fontWeight: '700' }}>
              Điều dưỡng: <strong style={{ color: '#14532D' }}>{nurseName}</strong>
            </span>
          </div>
        )}

        {safeOvertime.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFBEB', padding: '0.22rem 0.7rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
            <FaClock style={{ color: '#D97706' }} />
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#92400E', fontWeight: '700' }}>
              Tăng cường: <strong style={{ color: '#78350F' }}>{safeOvertime.map(o => `${o.staffName || ''} (${o.time || ''})`).filter(s => s.trim() !== '()').join('; ')}</strong>
            </span>
          </div>
        )}

        {room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FAF5FF', padding: '0.22rem 0.7rem', borderRadius: '6px', border: '1px solid #DDD6FE', marginLeft: 'auto' }}>
            <FaDoorOpen style={{ color: '#9333EA' }} />
            <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', color: '#6B21A8', fontWeight: '800' }}>Phòng: {room}</span>
          </div>
        )}
      </div>

      {/* 3. Main Tables & Case Container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.65rem',
        flex: 1, minHeight: 0, justifyContent: 'flex-start',
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

            // Note / Diễn biến thêm giờ (Callout box)
            if (section.type === 'note') {
              return (
                <div key={sIdx} style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderLeft: '6px solid #D97706', borderRadius: '10px', padding: isFullscreen ? '0.85rem 1.25rem' : '0.65rem 0.95rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: isFullscreen ? '1.2rem' : '1rem' }}>📝</span>
                    <span style={{ fontSize: isFullscreen ? '1.05rem' : '0.88rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>{section.title}</span>
                  </div>
                  <div style={{ fontSize: isFullscreen ? '1.25rem' : '1.05rem', fontWeight: '700', color: '#78350F', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{section.value}</div>
                </div>
              );
            }

            // Techniques Table for CDHA / XN (5 columns like Image 1)
            if (section.tableType === 'techniques' && section.tableRows) {
              const headers = section.headers || ['KỸ THUẬT', 'TỔNG SỐ', 'BẢO HIỂM', 'NỘI TRÚ', 'NGOẠI TRÚ'];

              return (
                <div key={sIdx}>
                  <div style={{ fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59', backgroundColor: '#EFF6FF', padding: '0.35rem 0.85rem', borderRadius: '8px', borderLeft: '5px solid #2563EB', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    {section.title}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                        <th style={{ padding: PAD_TH, textAlign: 'left', width: '32%', fontWeight: '800', fontSize: FONT_TH }}>{headers[0]}</th>
                        <th style={{ padding: PAD_TH, textAlign: 'center', width: '17%', fontWeight: '800', fontSize: FONT_TH }}>{headers[1]}</th>
                        <th style={{ padding: PAD_TH, textAlign: 'center', width: '17%', fontWeight: '800', fontSize: FONT_TH }}>{headers[2]}</th>
                        <th style={{ padding: PAD_TH, textAlign: 'center', width: '17%', fontWeight: '800', fontSize: FONT_TH }}>{headers[3]}</th>
                        <th style={{ padding: PAD_TH, textAlign: 'center', width: '17%', fontWeight: '800', fontSize: FONT_TH }}>{headers[4]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.tableRows.map((tech, tIdx) => (
                        <tr key={tIdx} style={{ backgroundColor: tIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: PAD_TD, fontWeight: '800', color: '#0F2C59', fontSize: FONT_TD_LABEL }}>{tech.name}</td>
                          <td style={{ padding: PAD_TD, textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1.5px solid #BFDBFE', padding: '0.15rem 0.75rem', borderRadius: '8px', fontWeight: '900', fontSize: FONT_BADGE, fontFamily: "'Roboto Mono', monospace", display: 'inline-block', minWidth: '42px' }}>
                              {formatValueBadge(tech.tongSo)}
                            </span>
                          </td>
                          <td style={{ padding: PAD_TD, textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1.5px solid #A7F3D0', padding: '0.15rem 0.75rem', borderRadius: '8px', fontWeight: '900', fontSize: FONT_BADGE, fontFamily: "'Roboto Mono', monospace", display: 'inline-block', minWidth: '42px' }}>
                              {formatValueBadge(tech.baoHiem)}
                            </span>
                          </td>
                          <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: '#334155', fontSize: FONT_TD_LABEL, fontFamily: "'Roboto Mono', monospace" }}>
                            {formatValueBadge(tech.noiTru)}
                          </td>
                          <td style={{ padding: PAD_TD, textAlign: 'center', fontWeight: '800', color: '#334155', fontSize: FONT_TD_LABEL, fontFamily: "'Roboto Mono', monospace" }}>
                            {formatValueBadge(tech.ngoaiTru)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Custom multi-column table (LCK, GMHS...)
            if (section.tableType === 'custom_table' && section.tableRows) {
              const headers = section.headers || [];
              const keys = section.rowKeys || [];

              return (
                <div key={sIdx}>
                  <div style={{ fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59', backgroundColor: '#EFF6FF', padding: '0.35rem 0.85rem', borderRadius: '8px', borderLeft: '5px solid #2563EB', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    {section.title}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 4px 16px rgba(15, 44, 89, 0.04)' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} style={{ padding: PAD_TH, textAlign: hIdx === 0 ? 'left' : 'center', fontWeight: '800', fontSize: FONT_TH }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.tableRows.map((row, rIdx) => {
                        const isTotalRow = row.isTotal;

                        return (
                          <tr key={rIdx} style={{ backgroundColor: isTotalRow ? '#EFF6FF' : (rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'), borderBottom: '1px solid #E2E8F0', borderTop: isTotalRow ? '2px solid #2563EB' : 'none' }}>
                            {keys.map((k, kIdx) => {
                              const cellVal = row[k];
                              if (kIdx === 0) {
                                return (
                                  <td key={kIdx} style={{ padding: PAD_TD, fontWeight: isTotalRow ? '900' : '800', color: isTotalRow ? '#1E40AF' : '#0F2C59', fontSize: FONT_TD_LABEL }}>
                                    {cellVal}
                                  </td>
                                );
                              }

                              const isHighlighted = kIdx === 1 || isTotalRow;
                              const badgeStyle = isHighlighted
                                ? { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' }
                                : { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };

                              return (
                                <td key={kIdx} style={{ padding: PAD_TD, textAlign: 'center' }}>
                                  {cellVal === '—' ? (
                                    <span style={{ color: '#94A3B8', fontWeight: '700' }}>—</span>
                                  ) : (
                                    <span style={{
                                      backgroundColor: badgeStyle.bg,
                                      color: badgeStyle.color,
                                      border: `1.5px solid ${badgeStyle.border}`,
                                      padding: '0.15rem 0.75rem',
                                      borderRadius: '8px',
                                      fontWeight: '900',
                                      fontSize: FONT_BADGE,
                                      fontFamily: "'Roboto Mono', monospace",
                                      display: 'inline-block',
                                      minWidth: '42px'
                                    }}>
                                      {formatValueBadge(cellVal)}
                                    </span>
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

            // Universal Medical Data Table for all metric lists (Khoa Nội, Khoa Nhi, HSCC, Sản, etc.)
            return renderItemTable(section, sIdx);
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

        {/* 4. Clinical Cases Section on Department Overview Slide */}
        {totalCasesCount > 0 && (
          <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              fontSize: FONT_SECTION_HEADER, fontWeight: '900', color: '#0F2C59',
              backgroundColor: '#F1F5F9', padding: '0.35rem 0.85rem', borderRadius: '8px',
              borderLeft: '5px solid #0F2C59', textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span>🏥 CÁC CA BỆNH LÂM SÀNG TẠI KHOA ({totalCasesCount} ca)</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748B', textTransform: 'none' }}>
                (Chi tiết từng ca trình chiếu ở các slide tiếp theo ➔)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.55rem' }}>
              {/* Transfer Cases */}
              {transferCases.map((tc, idx) => (
                <div key={`tc_${idx}`} style={{
                  backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderLeft: '5px solid #D97706',
                  borderRadius: '10px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(217,119,6,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaAmbulance style={{ color: '#D97706' }} /> CHUYỂN VIỆN #{idx + 1}
                    </span>
                    {tc.admission_time || tc.admissionTime ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B45309' }}>
                        ⏰ {tc.admission_time || tc.admissionTime}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: '900', color: '#92400E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {tc.patient_name || tc.patientName || 'Bệnh nhân'} {formatPatientAge(tc.age) ? `(${formatPatientAge(tc.age)})` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78350F', marginTop: '2px', fontWeight: '600' }}>
                    <strong>CĐ:</strong> {tc.diagnosis || tc.reason || '—'}
                  </div>
                </div>
              ))}

              {/* Surgery Cases */}
              {surgeryCases.map((sc, idx) => (
                <div key={`sc_${idx}`} style={{
                  backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD', borderLeft: '5px solid #0284C7',
                  borderRadius: '10px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(2,132,199,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0369A1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaProcedures style={{ color: '#0284C7' }} /> PHẪU THUẬT #{idx + 1}
                    </span>
                    {sc.admission_time || sc.admissionTime ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284C7' }}>
                        ⏰ {sc.admission_time || sc.admissionTime}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: '900', color: '#0369A1', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {sc.patient_name || sc.patientName || 'Bệnh nhân'} {formatPatientAge(sc.birth_year || sc.birthYear || sc.age) ? `(${formatPatientAge(sc.birth_year || sc.birthYear || sc.age)})` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0C4A6E', marginTop: '2px', fontWeight: '600' }}>
                    <strong>CĐ trước mổ:</strong> {sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}
                  </div>
                </div>
              ))}

              {/* Critical Cases */}
              {criticalCases.map((cc, idx) => (
                <div key={`cc_${idx}`} style={{
                  backgroundColor: '#FAF5FF', border: '1.5px solid #DDD6FE', borderLeft: '5px solid #7C3AED',
                  borderRadius: '10px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(124,58,237,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5B21B6', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaHeartbeat style={{ color: '#7C3AED' }} /> BỆNH NẶNG #{idx + 1}
                    </span>
                    {cc.admission_time || cc.admissionTime ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7C3AED' }}>
                        ⏰ {cc.admission_time || cc.admissionTime}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: '900', color: '#5B21B6', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {cc.patient_name || cc.patientName || 'Bệnh nhân'} {formatPatientAge(cc.age) ? `(${formatPatientAge(cc.age)})` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4C1D95', marginTop: '2px', fontWeight: '600' }}>
                    <strong>CĐ:</strong> {cc.diagnosis || cc.condition_summary || cc.conditionSummary || '—'}
                  </div>
                </div>
              ))}

              {/* Death Cases */}
              {deathCases.map((dc, idx) => (
                <div key={`dc_${idx}`} style={{
                  backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderLeft: '5px solid #DC2626',
                  borderRadius: '10px', padding: '0.6rem 0.85rem', boxShadow: '0 2px 6px rgba(220,38,38,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaSkullCrossbones style={{ color: '#DC2626' }} /> TỬ VONG #{idx + 1}
                    </span>
                    {dc.admission_time || dc.admissionTime ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626' }}>
                        ⏰ {dc.admission_time || dc.admissionTime}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: '900', color: '#991B1B', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {dc.patient_name || dc.patientName || 'Bệnh nhân'} {formatPatientAge(dc.age) ? `(${formatPatientAge(dc.age)})` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7F1D1D', marginTop: '2px', fontWeight: '700' }}>
                    <strong>CĐ:</strong> {dc.diagnosis || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSlide;
