import React from 'react';
import { FaHospital, FaChild } from 'react-icons/fa';

// Helper to format number into 2-digit padded string (e.g. 5 -> '05', 0 -> '00')
const formatValueBadge = (val) => {
  if (val === null || val === undefined || val === '') return '00';
  const str = String(val).trim();
  if (/^\d+$/.test(str) && str.length === 1) {
    return `0${str}`;
  }
  return str;
};

// Helper to parse line-by-line or comma-separated notes for 'Hiện có' (e.g. Sxh: 05, TCM: 01)
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

  const chuyenVal = formData.chuyenVien !== undefined && formData.chuyenVien !== '' ? formatValueBadge(formData.chuyenVien) : '00';
  const xuatVal = formatValueBadge(formData.xuat !== undefined ? formData.xuat : (formData.xuatVien !== undefined ? formData.xuatVien : 0));
  
  const hienCoNumber = formatValueBadge(formData.hienCo !== undefined ? formData.hienCo : (formData.hienCon !== undefined ? formData.hienCon : 0));
  const hienCoNotes = parseHienCoNotes(formData.hienCoGhiChu);

  const pkVal = formData.pk !== undefined && String(formData.pk).trim() !== '' ? String(formData.pk).trim() : '—';
  const pkNote = formData.pkGhiChu ? String(formData.pkGhiChu).trim() : '';

  const extraNote = formData.themGio || formData.tinhHinhChung || '';

  // Sizing definitions matching hospital presentation system standards
  const FONT_HEADER_TITLE = isFullscreen ? '1.5rem' : '1.2rem';
  const FONT_TH = isFullscreen ? '1.3rem' : '1.05rem';
  const FONT_METRIC = isFullscreen ? '2.8rem' : '2.1rem';
  const FONT_SUB_METRIC = isFullscreen ? '1.85rem' : '1.45rem';
  const FONT_TAG = isFullscreen ? '1.35rem' : '1.05rem';
  const PAD_TH = isFullscreen ? '0.85rem 0.5rem' : '0.6rem 0.35rem';
  const PAD_TD = isFullscreen ? '1.1rem 0.6rem' : '0.8rem 0.4rem';

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
      gap: isFullscreen ? '0.75rem' : '0.5rem',
      overflow: 'hidden'
    }}>
      {/* 1. Top Header Banner - Consistent Hospital Theme */}
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
                fontSize: isFullscreen ? '0.78rem' : '0.7rem',
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

      {/* 2. Executive Summary Bar - Consistent with HSCC-TNT Slide */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isFullscreen ? '0.55rem 1.4rem' : '0.4rem 0.9rem',
        backgroundColor: '#EFF6FF',
        borderRadius: '10px',
        border: '1.5px solid #BFDBFE',
        borderLeft: '7px solid #2563EB',
        boxShadow: '0 3px 10px rgba(37, 99, 235, 0.08)',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: isFullscreen ? '1.45rem' : '1.18rem',
          fontWeight: '900',
          color: '#0F2C59',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span>HIỆN CÓ TẠI KHOA:</span>
          <span style={{
            color: '#7C3AED',
            backgroundColor: '#FAF5FF',
            padding: '0.15rem 0.85rem',
            borderRadius: '8px',
            border: '1.5px solid #DDD6FE',
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: '900'
          }}>
            {hienCoNumber} BN
          </span>
        </div>
        <div style={{
          fontSize: isFullscreen ? '0.92rem' : '0.8rem',
          fontWeight: '700',
          color: '#1E40AF',
          backgroundColor: '#FFFFFF',
          padding: '0.25rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid #BFDBFE'
        }}>
          📊 Báo cáo số liệu ca trực Khoa Nhi
        </div>
      </div>

      {/* 3. Medical Grid Table - Synchronized with System Design */}
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
          boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
          tableLayout: 'fixed'
        }}>
          {/* Header Row: 6 Columns with Standard Navy Background & White Bold Text */}
          <thead>
            <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
              <th style={{
                padding: PAD_TH,
                width: '16%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH,
                borderRight: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                BỆNH CŨ
              </th>
              <th style={{
                padding: PAD_TH,
                width: '18%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH,
                borderRight: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                BỆNH MỚI
              </th>
              <th style={{
                padding: PAD_TH,
                width: '13%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH,
                borderRight: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                CHUYỂN
              </th>
              <th style={{
                padding: PAD_TH,
                width: '13%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH,
                borderRight: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                XUẤT
              </th>
              <th style={{
                padding: PAD_TH,
                width: '24%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH,
                borderRight: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                HIỆN CÓ
              </th>
              <th style={{
                padding: PAD_TH,
                width: '16%',
                textAlign: 'center',
                fontWeight: '800',
                fontSize: FONT_TH
              }}>
                PK
              </th>
            </tr>
          </thead>

          {/* Data Row with Color-Coded Presentation Cards */}
          <tbody>
            <tr style={{ backgroundColor: '#FFFFFF' }}>
              {/* Col 1: Bệnh cũ (Purple Card) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #E2E8F0',
                backgroundColor: '#FAF5FF'
              }}>
                <span style={{
                  backgroundColor: '#FAF5FF',
                  color: '#7C3AED',
                  border: '2px solid #DDD6FE',
                  padding: isFullscreen ? '0.6rem 1.4rem' : '0.45rem 1.0rem',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: FONT_METRIC,
                  fontFamily: "'Roboto Mono', monospace",
                  display: 'inline-block',
                  boxShadow: '0 3px 10px rgba(124, 58, 237, 0.08)'
                }}>
                  {benhCuVal}
                </span>
              </td>

              {/* Col 2: Bệnh mới (Blue Card - CC & PK stacked) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC'
              }}>
                {hasSubBenhMoi ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isFullscreen ? '0.55rem' : '0.35rem'
                  }}>
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      border: '1.5px solid #BFDBFE',
                      padding: isFullscreen ? '0.35rem 1.0rem' : '0.25rem 0.75rem',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: FONT_SUB_METRIC,
                      fontFamily: "'Roboto Mono', monospace",
                      display: 'inline-block',
                      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.06)'
                    }}>
                      CC: {ccVal}
                    </span>
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      border: '1.5px solid #BFDBFE',
                      padding: isFullscreen ? '0.35rem 1.0rem' : '0.25rem 0.75rem',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: FONT_SUB_METRIC,
                      fontFamily: "'Roboto Mono', monospace",
                      display: 'inline-block',
                      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.06)'
                    }}>
                      PK: {pkMoiVal}
                    </span>
                  </div>
                ) : (
                  <span style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    border: '2px solid #BFDBFE',
                    padding: isFullscreen ? '0.6rem 1.4rem' : '0.45rem 1.0rem',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: FONT_METRIC,
                    fontFamily: "'Roboto Mono', monospace",
                    display: 'inline-block',
                    boxShadow: '0 3px 10px rgba(30, 64, 175, 0.08)'
                  }}>
                    {benhMoiFlatVal}
                  </span>
                )}
              </td>

              {/* Col 3: Chuyển (Amber Card) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #E2E8F0',
                backgroundColor: '#FFFBEB'
              }}>
                <span style={{
                  backgroundColor: '#FFFBEB',
                  color: Number(chuyenVal) > 0 ? '#D97706' : '#92400E',
                  border: '2px solid #FDE68A',
                  padding: isFullscreen ? '0.6rem 1.4rem' : '0.45rem 1.0rem',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: FONT_METRIC,
                  fontFamily: "'Roboto Mono', monospace",
                  display: 'inline-block',
                  boxShadow: '0 3px 10px rgba(217, 119, 6, 0.08)'
                }}>
                  {chuyenVal}
                </span>
              </td>

              {/* Col 4: Xuất (Green Card) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #E2E8F0',
                backgroundColor: '#ECFDF5'
              }}>
                <span style={{
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  border: '2px solid #A7F3D0',
                  padding: isFullscreen ? '0.6rem 1.4rem' : '0.45rem 1.0rem',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: FONT_METRIC,
                  fontFamily: "'Roboto Mono', monospace",
                  display: 'inline-block',
                  boxShadow: '0 3px 10px rgba(5, 150, 105, 0.08)'
                }}>
                  {xuatVal}
                </span>
              </td>

              {/* Col 5: Hiện có (Purple Card + Disease Breakdown Pills) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                borderRight: '1.5px solid #E2E8F0',
                backgroundColor: '#FAF5FF'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFullscreen ? '0.5rem' : '0.35rem'
                }}>
                  <span style={{
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    border: '2px solid #DDD6FE',
                    padding: isFullscreen ? '0.45rem 1.4rem' : '0.35rem 1.0rem',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: FONT_METRIC,
                    fontFamily: "'Roboto Mono', monospace",
                    display: 'inline-block',
                    boxShadow: '0 3px 10px rgba(124, 58, 237, 0.08)'
                  }}>
                    {hienCoNumber}
                  </span>
                  {hienCoNotes.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      alignItems: 'center',
                      marginTop: '0.2rem'
                    }}>
                      {hienCoNotes.map((note, nIdx) => (
                        <span key={nIdx} style={{
                          backgroundColor: '#FFFFFF',
                          color: '#4C1D95',
                          border: '1.5px solid #DDD6FE',
                          padding: '0.2rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: FONT_TAG,
                          fontWeight: '800',
                          fontFamily: "'Roboto Mono', monospace",
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                        }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              {/* Col 6: PK (Sky Blue Card) */}
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                verticalAlign: 'middle',
                backgroundColor: '#F0F9FF'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFullscreen ? '0.45rem' : '0.3rem'
                }}>
                  <span style={{
                    backgroundColor: '#F0F9FF',
                    color: '#0284C7',
                    border: '2px solid #BAE6FD',
                    padding: isFullscreen ? '0.5rem 1.2rem' : '0.35rem 0.9rem',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: isFullscreen ? '2.5rem' : '1.9rem',
                    fontFamily: "'Roboto Mono', monospace",
                    display: 'inline-block',
                    boxShadow: '0 3px 10px rgba(2, 132, 199, 0.08)'
                  }}>
                    {pkVal}
                  </span>
                  {pkNote && (
                    <span style={{
                      backgroundColor: '#FFFFFF',
                      color: '#0369A1',
                      border: '1.5px solid #BAE6FD',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: isFullscreen ? '1.15rem' : '0.92rem',
                      fontWeight: '800'
                    }}>
                      {pkNote}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Extra Notes Card (if present) */}
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
          <span style={{ fontSize: isFullscreen ? '1.4rem' : '1.15rem' }}>📌</span>
          <span style={{ fontSize: isFullscreen ? '1.32rem' : '1.05rem', fontWeight: '700', color: '#92400E' }}>
            <strong>Ghi chú ca trực:</strong> {extraNote}
          </span>
        </div>
      )}
    </div>
  );
};

export default KhoaNhiSlide;
