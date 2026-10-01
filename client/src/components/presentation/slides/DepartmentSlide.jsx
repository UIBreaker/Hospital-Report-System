import React from 'react';
import { parseDepartmentSections } from '../../../utils/departmentSectionParser';
import { FaHospital, FaAmbulance, FaProcedures, FaSkullCrossbones, FaHeartbeat } from 'react-icons/fa';
import HsccTntSlide from './HsccTntSlide';
import KhoaNhiSlide from './KhoaNhiSlide';

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
  const formData = slide.formData || (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : report.report_data) || {};
  const theme = slide.theme || { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🏥' };

  // If this is HSCC - TNT and not an explicit note slide, render unified HsccTntSlide
  const isHsccTnt = (slide.deptCode || report.department_code || '').toLowerCase() === 'hscc_tnt' || (formData.hscc && formData.tnt);
  const isExplicitNoteSlide = slide.sections && slide.sections.length === 1 && (slide.sections[0].type === 'note' || slide.sections[0].title?.includes('GHI CHÚ'));
  if (isHsccTnt && !isExplicitNoteSlide) {
    return <HsccTntSlide slide={slide} isFullscreen={isFullscreen} />;
  }

  // If this is Khoa Nhi and not an explicit note slide, render unified KhoaNhiSlide (Image 2 design)
  const isNhi = (slide.deptCode || report.department_code || '').toLowerCase() === 'nhi' || (formData.benhMoi_cc !== undefined || formData.benhMoi_pk !== undefined);
  if (isNhi && !isExplicitNoteSlide) {
    return <KhoaNhiSlide slide={slide} isFullscreen={isFullscreen} />;
  }

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

  const noteSections = finalSections.filter(sec => sec.type === 'note' || sec.type === 'personnel' || sec.type === 'blood_transfusion');
  const tableSections = finalSections.filter(sec => sec.type !== 'note' && sec.type !== 'personnel' && sec.type !== 'blood_transfusion');
  const hasNotes = noteSections.length > 0;
  const hasTable = tableSections.length > 0;

  // Large-scale auto font scaling for high impact
  let maxRowCount = 0;
  tableSections.forEach(sec => {
    if (sec.tableRows) maxRowCount = Math.max(maxRowCount, sec.tableRows.length);
    else if (sec.items) {
      const isPaired = hasNotes ? (sec.items.length >= 4) : (sec.items.length >= 7);
      const count = isPaired ? Math.ceil(sec.items.length / 2) : sec.items.length;
      maxRowCount = Math.max(maxRowCount, count);
    }
  });

  // Tiered auto font and padding scaling for optimal screen utilization
  const isFewRows = maxRowCount <= 4;
  const isMediumRows = maxRowCount > 4 && maxRowCount <= 6;
  const isDenseTable = maxRowCount >= 7;

  const FONT_SECTION_HEADER = isFullscreen 
    ? (isFewRows ? '1.45rem' : isMediumRows ? '1.32rem' : '1.18rem')
    : (isFewRows ? '1.25rem' : isMediumRows ? '1.12rem' : '0.96rem');

  const FONT_TH = isFullscreen 
    ? (isFewRows ? '1.32rem' : isMediumRows ? '1.22rem' : '1.08rem')
    : (isFewRows ? '1.12rem' : isMediumRows ? '1.02rem' : '0.88rem');

  const FONT_TD_LABEL = isFullscreen 
    ? (isFewRows ? '1.65rem' : isMediumRows ? '1.45rem' : '1.2rem')
    : (isFewRows ? '1.38rem' : isMediumRows ? '1.22rem' : '0.98rem');

  const FONT_BADGE = isFullscreen 
    ? (isFewRows ? '2.1rem' : isMediumRows ? '1.85rem' : '1.45rem')
    : (isFewRows ? '1.75rem' : isMediumRows ? '1.5rem' : '1.18rem');

  const PAD_TH = isFullscreen 
    ? (isFewRows ? '1.1rem 1.6rem' : isMediumRows ? '0.9rem 1.4rem' : '0.65rem 1rem')
    : (isFewRows ? '0.8rem 1.25rem' : isMediumRows ? '0.6rem 0.95rem' : '0.45rem 0.75rem');

  const PAD_TD = isFullscreen 
    ? (isFewRows ? '1.1rem 1.6rem' : isMediumRows ? '0.8rem 1.4rem' : '0.55rem 1rem')
    : (isFewRows ? '0.85rem 1.25rem' : isMediumRows ? '0.6rem 0.95rem' : '0.38rem 0.75rem');

  const PAD_BADGE = isFullscreen
    ? (isFewRows ? '0.38rem 1.35rem' : '0.25rem 1.15rem')
    : (isFewRows ? '0.3rem 1.15rem' : '0.2rem 0.95rem');

  const BADGE_MIN_WIDTH = isFullscreen
    ? (isFewRows ? '68px' : '58px')
    : (isFewRows ? '58px' : '48px');

  const isSingleSection = finalSections.length === 1;

  // Render a Universal Medical Table for any list of items
  const renderItemTable = (section, sIdx) => {
    const items = section.items || [];
    if (items.length === 0) return null;

    const isPaired2Col = hasNotes ? (items.length >= 4) : (items.length >= 7);

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
        <div key={sIdx} style={{ marginBottom: hasNotes ? '0.25rem' : '0.4rem', flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto'), display: 'flex', flexDirection: 'column' }}>
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
            flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto')
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
                        padding: PAD_BADGE,
                        borderRadius: '10px',
                        fontWeight: '900',
                        fontSize: FONT_BADGE,
                        fontFamily: "'Roboto Mono', monospace",
                        display: 'inline-block',
                        minWidth: BADGE_MIN_WIDTH,
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
                          padding: PAD_BADGE,
                          borderRadius: '10px',
                          fontWeight: '900',
                          fontSize: FONT_BADGE,
                          fontFamily: "'Roboto Mono', monospace",
                          display: 'inline-block',
                          minWidth: BADGE_MIN_WIDTH,
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
      <div key={sIdx} style={{ marginBottom: hasNotes ? '0.25rem' : '0.4rem', flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto'), display: 'flex', flexDirection: 'column' }}>
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
          flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto')
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
                      padding: PAD_BADGE,
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: FONT_BADGE,
                      fontFamily: "'Roboto Mono', monospace",
                      display: 'inline-block',
                      minWidth: BADGE_MIN_WIDTH,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      {formatValueBadge(item.value)}
                    </span>
                  </td>
                  <td style={{ padding: PAD_TD, textAlign: 'center', fontSize: isFullscreen ? (isDenseTable ? '1.12rem' : '1.25rem') : (isDenseTable ? '0.92rem' : '1.02rem'), fontWeight: '700', color: '#10B981' }}>
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

      {/* 2. Main Tables & Notes Container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: isFullscreen ? '0.55rem' : '0.4rem',
        flex: 1, minHeight: 0, justifyContent: 'flex-start',
        overflowY: 'auto'
      }}>
        {tableSections.map((sec, idx) => {
          // Custom table (like GMHS, LCK, Techniques, or Standard Items)
          if (sec.tableType === 'custom_table' || sec.tableType === 'techniques') {
            const headers = sec.headers || [];
            const rows = sec.tableRows || [];
            const rowKeys = sec.rowKeys || [];

            return (
              <div key={idx} className="anim-info-pop anim-delay-2" style={{ marginBottom: hasNotes ? '0.25rem' : '0.4rem', flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto'), display: 'flex', flexDirection: 'column' }}>
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
                  flex: hasNotes ? '0 0 auto' : (isSingleSection ? 1 : '0 0 auto')
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
                                fontWeight: isTotal ? '900' : (isFirst ? '800' : '700'),
                                color: isTotal ? '#1E3A8A' : '#0F2C59',
                                fontSize: FONT_TD_LABEL
                              }}>
                                {!isFirst && val !== '—' ? (
                                  <span style={{
                                    backgroundColor: isTotal ? '#1E40AF' : '#EFF6FF',
                                    color: isTotal ? '#FFFFFF' : '#1E40AF',
                                    border: isTotal ? '1.5px solid #1D4ED8' : '1.5px solid #BFDBFE',
                                    padding: isFullscreen ? '0.22rem 0.95rem' : '0.15rem 0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '900',
                                    fontSize: FONT_BADGE,
                                    fontFamily: "'Roboto Mono', monospace",
                                    display: 'inline-block',
                                    minWidth: '42px',
                                    boxShadow: isTotal ? '0 2px 8px rgba(30, 64, 175, 0.25)' : 'none'
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
        })}

        {/* Note / Personnel / Blood Transfusion Cards */}
        {noteSections.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: noteSections.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
            gap: isFullscreen ? '0.65rem' : '0.45rem',
            flex: 1,
            minHeight: 0
          }}>
            {noteSections.map((sec, nIdx) => {
              const isBlood = sec.type === 'blood_transfusion';
              const isPersonnel = sec.type === 'personnel';

              return (
                <div key={nIdx} className="anim-info-pop anim-delay-2" style={{
                  backgroundColor: isBlood ? '#FEF2F2' : (isPersonnel ? '#EFF6FF' : '#FFFBEB'),
                  border: `2px solid ${isBlood ? '#FECACA' : (isPersonnel ? '#BFDBFE' : '#FDE68A')}`,
                  borderLeft: isBlood ? '7px solid #DC2626' : (isPersonnel ? '7px solid #2563EB' : '7px solid #D97706'),
                  borderRadius: '14px',
                  padding: isFullscreen ? '1.1rem 1.6rem' : '0.85rem 1.35rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)'
                }}>
                  <div style={{
                    fontSize: isFullscreen ? '1.35rem' : '1.15rem',
                    fontWeight: '900',
                    color: isBlood ? '#DC2626' : (isPersonnel ? '#1E40AF' : '#92400E'),
                    marginBottom: '0.45rem',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: isFullscreen ? '1.5rem' : '1.25rem' }}>{isBlood ? '🩸' : '📌'}</span>
                    <span>{sec.title}</span>
                  </div>
                  <div style={{
                    fontSize: isFullscreen ? '1.85rem' : '1.45rem',
                    color: isBlood ? '#7F1D1D' : '#1E293B',
                    fontWeight: '700',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {sec.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {finalSections.length === 0 && (
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
