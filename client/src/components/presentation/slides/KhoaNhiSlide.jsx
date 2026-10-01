import React from 'react';
import { FaHospital, FaChild } from 'react-icons/fa';

// Helper to format number into 2-digit padded string (e.g. 3 -> '03', 0 -> '00')
const formatValueBadge = (val) => {
  if (val === null || val === undefined || val === '') return '00';
  const str = String(val).trim();
  if (/^\d+$/.test(str) && str.length === 1) {
    return `0${str}`;
  }
  return str;
};

// Helper to parse line-by-line or comma-separated notes for 'Hiện có' (e.g. Tcm 2, Sxh:01)
const parseHienCoNotes = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/[\n,;]+/)
    .map(t => t.trim())
    .filter(Boolean);
};

const KhoaNhiSlide = ({ slide = {}, isFullscreen = true }) => {
  const deptName = slide.deptName || 'KHOA NHI';
  const report = slide.report || {};
  const formData = slide.formData || (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : report.report_data) || {};

  // Extract metrics based on NhiForm fields
  const benhCuVal = formData.benhCu !== undefined && formData.benhCu !== '' ? formatValueBadge(formData.benhCu) : '00';
  
  const hasSubBenhMoi = (formData.benhMoi_cc !== undefined && formData.benhMoi_cc !== '') || 
                         (formData.benhMoi_pk !== undefined && formData.benhMoi_pk !== '');
  const ccVal = formatValueBadge(formData.benhMoi_cc || 0);
  const pkMoiVal = formatValueBadge(formData.benhMoi_pk || 0);
  const benhMoiFlatVal = formData.benhMoi !== undefined && formData.benhMoi !== '' ? formatValueBadge(formData.benhMoi) : '00';

  const chuyenVal = formData.chuyenVien !== undefined && formData.chuyenVien !== '' ? String(formData.chuyenVien).trim() : '0';
  const xuatVal = formatValueBadge(formData.xuat !== undefined ? formData.xuat : (formData.xuatVien !== undefined ? formData.xuatVien : 0));
  
  const hienCoNumber = formatValueBadge(formData.hienCo !== undefined ? formData.hienCo : (formData.hienCon !== undefined ? formData.hienCon : 0));
  const hienCoNotes = parseHienCoNotes(formData.hienCoGhiChu);

  const pkVal = formData.pk !== undefined && String(formData.pk).trim() !== '' ? String(formData.pk).trim() : '—';
  const pkNote = formData.pkGhiChu ? String(formData.pkGhiChu).trim() : '';

  const extraNote = formData.themGio || formData.tinhHinhChung || '';

  // Sizing definitions for high-visibility projector screen
  const FONT_HEADER_TITLE = isFullscreen ? '1.5rem' : '1.2rem';
  const FONT_COL_HEADER = isFullscreen ? '2.1rem' : '1.6rem';
  const FONT_MAIN_NUM = isFullscreen ? '3.4rem' : '2.5rem';
  const FONT_SUB_NUM = isFullscreen ? '2.1rem' : '1.6rem';
  const FONT_NOTE_ITEM = isFullscreen ? '1.85rem' : '1.35rem';
  const PAD_TH = isFullscreen ? '1.1rem 0.5rem' : '0.8rem 0.35rem';
  const PAD_TD = isFullscreen ? '1.4rem 0.75rem' : '1.0rem 0.5rem';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: isFullscreen ? '1.25rem 1.75rem' : '1rem',
      boxSizing: 'border-box',
      boxShadow: '0 8px 30px rgba(15, 44, 89, 0.08)',
      gap: isFullscreen ? '0.75rem' : '0.55rem',
      overflow: 'hidden'
    }}>
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isFullscreen ? '0.65rem 1.4rem' : '0.5rem 1rem',
        backgroundColor: '#0F2C59',
        borderRadius: '12px',
        color: '#FFFFFF',
        boxShadow: '0 4px 15px rgba(15, 44, 89, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            fontSize: isFullscreen ? '1.8rem' : '1.4rem',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaHospital />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: FONT_HEADER_TITLE,
              fontWeight: '900',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#FFFFFF'
            }}>
              {deptName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{
                fontSize: isFullscreen ? '0.8rem' : '0.7rem',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                padding: '0.15rem 0.65rem',
                borderRadius: '20px',
                fontWeight: '800',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <FaChild /> BÁO CÁO NỘI TRÚ & PHÒNG KHÁM NHI
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: isFullscreen ? '42px' : '34px',
              height: isFullscreen ? '42px' : '34px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* 2. Prominent Table Matching Image 2 Design */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '2px solid #CBD5E1',
          boxShadow: '0 6px 22px rgba(15, 44, 89, 0.06)',
          tableLayout: 'fixed'
        }}>
          {/* Header Row: 6 Columns with Bold Red Labels as requested */}
          <thead>
            <tr style={{ backgroundColor: '#FEF2F2', borderBottom: '2.5px solid #CBD5E1' }}>
              <th style={{
                padding: PAD_TH,
                width: '16%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                Bệnh cũ
              </th>
              <th style={{
                padding: PAD_TH,
                width: '18%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                Bệnh mới
              </th>
              <th style={{
                padding: PAD_TH,
                width: '13%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                Chuyển
              </th>
              <th style={{
                padding: PAD_TH,
                width: '13%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                Xuất
              </th>
              <th style={{
                padding: PAD_TH,
                width: '24%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                Hiện có
              </th>
              <th style={{
                padding: PAD_TH,
                width: '16%',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: FONT_COL_HEADER,
                color: '#DC2626'
              }}>
                PK
              </th>
            </tr>
          </thead>

          {/* Data Row */}
          <tbody>
            <tr style={{ backgroundColor: '#FFFFFF' }}>
              {/* Col 1: Bệnh cũ */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                <div style={{
                  fontSize: FONT_MAIN_NUM,
                  fontWeight: '900',
                  color: '#0F2C59',
                  fontFamily: "'Roboto Mono', monospace",
                  lineHeight: 1.1
                }}>
                  {benhCuVal}
                </div>
              </td>

              {/* Col 2: Bệnh mới (CC & PK stacked) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                {hasSubBenhMoi ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isFullscreen ? '0.5rem' : '0.35rem'
                  }}>
                    <div style={{
                      fontSize: FONT_SUB_NUM,
                      fontWeight: '900',
                      color: '#0F2C59',
                      fontFamily: "'Roboto Mono', monospace",
                      lineHeight: 1.1
                    }}>
                      CC:{ccVal}
                    </div>
                    <div style={{
                      fontSize: FONT_SUB_NUM,
                      fontWeight: '900',
                      color: '#0F2C59',
                      fontFamily: "'Roboto Mono', monospace",
                      lineHeight: 1.1
                    }}>
                      PK: {pkMoiVal}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: FONT_MAIN_NUM,
                    fontWeight: '900',
                    color: '#0F2C59',
                    fontFamily: "'Roboto Mono', monospace",
                    lineHeight: 1.1
                  }}>
                    {benhMoiFlatVal}
                  </div>
                )}
              </td>

              {/* Col 3: Chuyển */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                <div style={{
                  fontSize: FONT_MAIN_NUM,
                  fontWeight: '900',
                  color: Number(chuyenVal) > 0 ? '#D97706' : '#0F2C59',
                  fontFamily: "'Roboto Mono', monospace",
                  lineHeight: 1.1
                }}>
                  {chuyenVal}
                </div>
              </td>

              {/* Col 4: Xuất */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                <div style={{
                  fontSize: FONT_MAIN_NUM,
                  fontWeight: '900',
                  color: '#0F2C59',
                  fontFamily: "'Roboto Mono', monospace",
                  lineHeight: 1.1
                }}>
                  {xuatVal}
                </div>
              </td>

              {/* Col 5: Hiện có (Number + TCM / SXH notes below) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #CBD5E1'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFullscreen ? '0.4rem' : '0.25rem'
                }}>
                  <div style={{
                    fontSize: FONT_MAIN_NUM,
                    fontWeight: '900',
                    color: '#0F2C59',
                    fontFamily: "'Roboto Mono', monospace",
                    lineHeight: 1.1
                  }}>
                    {hienCoNumber}
                  </div>
                  {hienCoNotes.length > 0 && hienCoNotes.map((note, nIdx) => (
                    <div key={nIdx} style={{
                      fontSize: FONT_NOTE_ITEM,
                      fontWeight: '900',
                      color: '#0F2C59',
                      fontFamily: "'Roboto Mono', monospace",
                      lineHeight: 1.2
                    }}>
                      {note}
                    </div>
                  ))}
                </div>
              </td>

              {/* Col 6: PK */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFullscreen ? '0.4rem' : '0.25rem'
                }}>
                  <div style={{
                    fontSize: FONT_MAIN_NUM,
                    fontWeight: '900',
                    color: '#0F2C59',
                    fontFamily: "'Roboto Mono', monospace",
                    lineHeight: 1.1
                  }}>
                    {pkVal}
                  </div>
                  {pkNote && (
                    <div style={{
                      fontSize: isFullscreen ? '1.25rem' : '0.98rem',
                      fontWeight: '800',
                      color: '#64748B',
                      lineHeight: 1.2
                    }}>
                      {pkNote}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Extra Notes Card (if present) */}
      {extraNote && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderLeft: '6px solid #D97706',
          borderRadius: '10px',
          padding: isFullscreen ? '0.65rem 1.2rem' : '0.45rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexShrink: 0
        }}>
          <span style={{ fontSize: isFullscreen ? '1.2rem' : '1.0rem' }}>📌</span>
          <span style={{ fontSize: isFullscreen ? '1.12rem' : '0.92rem', fontWeight: '700', color: '#92400E' }}>
            <strong>Ghi chú ca trực:</strong> {extraNote}
          </span>
        </div>
      )}
    </div>
  );
};

export default KhoaNhiSlide;
