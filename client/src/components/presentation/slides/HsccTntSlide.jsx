import React from 'react';
import { FaHospital } from 'react-icons/fa';

// Helper to format number into 2-digit padded string (e.g. 8 -> '08')
const formatValueBadge = (val) => {
  if (val === null || val === undefined || val === '') return '00';
  const str = String(val).trim();
  if (/^\d+$/.test(str) && str.length === 1) {
    return `0${str}`;
  }
  return str;
};

// Helper for color-coded badge styling matching DepartmentSlide
const getBadgeStyle = (category = '') => {
  switch (category) {
    case 'purple': // Bệnh cũ, Hiện còn
      return { bg: '#FAF5FF', color: '#7C3AED', border: '#DDD6FE' };
    case 'blue': // Bệnh mới
      return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
    case 'green': // Xuất viện
      return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
    case 'amber': // Chuyển viện, Chuyển khoa
      return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    case 'red': // Tử vong
      return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
    default:
      return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
  }
};

const HsccTntSlide = ({ slide, isFullscreen = true }) => {
  const deptName = slide.deptName || 'HỒI SỨC CẤP CỨU – THẬN NHÂN TẠO';
  const report = slide.report || {};
  const formData = slide.formData || (typeof report.report_data === 'string' ? JSON.parse(report.report_data || '{}') : report.report_data) || {};

  const hscc = formData.hscc || {};
  const tnt = formData.tnt || {};
  const pk21 = formData.pk21 || {};

  // Calculate Tong So Kham
  const rawTongKham = hscc.tongSoKham || formData.tongSoKham || hscc.tongSo || '';
  const tongSoKhamDisplay = rawTongKham !== '' ? formatValueBadge(rawTongKham) : '—';

  // Sizing definitions for high-impact projector display
  const FONT_TH = isFullscreen ? '1.25rem' : '1.02rem';
  const FONT_ROW_HEADER = isFullscreen ? '1.65rem' : '1.35rem';
  const FONT_METRIC = isFullscreen ? '1.75rem' : '1.35rem';
  const FONT_NOTE = isFullscreen ? '1.42rem' : '1.15rem';
  const PAD_TH = isFullscreen ? '0.75rem 0.5rem' : '0.5rem 0.35rem';
  const PAD_TD = isFullscreen ? '0.7rem 0.5rem' : '0.45rem 0.35rem';

  const renderBadge = (val, category) => {
    if (val === null || val === undefined || val === '' || val === '-') {
      return (
        <span style={{
          color: '#94A3B8',
          fontWeight: '700',
          fontSize: isFullscreen ? '1.5rem' : '1.2rem'
        }}>
          —
        </span>
      );
    }

    const badgeStyle = getBadgeStyle(category);
    return (
      <span style={{
        backgroundColor: badgeStyle.bg,
        color: badgeStyle.color,
        border: `1.5px solid ${badgeStyle.border}`,
        padding: isFullscreen ? '0.35rem 0.8rem' : '0.22rem 0.55rem',
        borderRadius: '10px',
        fontWeight: '900',
        fontSize: FONT_METRIC,
        fontFamily: "'Roboto Mono', monospace",
        display: 'inline-block',
        minWidth: isFullscreen ? '54px' : '42px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        {formatValueBadge(val)}
      </span>
    );
  };

  const renderNoteItem = (label, val, isAlert = false) => {
    const isSpecialAlert = isAlert && Number(val) > 0;
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: FONT_NOTE,
        lineHeight: isFullscreen ? 1.4 : 1.3,
        color: '#1E293B'
      }}>
        <span style={{ color: '#334155', fontWeight: '800' }}>• {label}:</span>
        <span style={{
          fontWeight: '900',
          color: isSpecialAlert ? '#DC2626' : '#0F2C59',
          fontFamily: "'Roboto Mono', monospace",
          fontSize: isFullscreen ? '1.45rem' : '1.18rem'
        }}>
          {formatValueBadge(val)}
        </span>
      </div>
    );
  };

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8'
          }}>
            <FaHospital />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: isFullscreen ? '1.45rem' : '1.15rem',
              fontWeight: '900',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#FFFFFF'
            }}>
              {deptName}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.2rem'
            }}>
              <span style={{
                fontSize: isFullscreen ? '0.78rem' : '0.7rem',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                padding: '0.15rem 0.65rem',
                borderRadius: '20px',
                fontWeight: '800',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                HSCC • THẬN NHÂN TẠO • PHÒNG KHÁM 21
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

      {/* 2. Prominent Tong So Kham Banner (Image 3 design) */}
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
          fontSize: isFullscreen ? '1.55rem' : '1.25rem',
          fontWeight: '900',
          color: '#0F2C59',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span>TỔNG SỐ KHÁM:</span>
          <span style={{
            color: '#1D4ED8',
            backgroundColor: '#DBEAFE',
            padding: '0.15rem 0.85rem',
            borderRadius: '8px',
            border: '1.5px solid #93C5FD',
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: '900'
          }}>
            {tongSoKhamDisplay}
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
          📊 Báo cáo tổng hợp số liệu ca trực
        </div>
      </div>

      {/* 3. Comprehensive Medical Table (Image 3 layout) */}
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
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #CBD5E1',
          boxShadow: '0 4px 18px rgba(15, 44, 89, 0.05)',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
              <th style={{ padding: PAD_TH, width: '13%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                ĐƠN VỊ
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Bệnh cũ
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Bệnh mới
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Xuất viện
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Chuyển viện
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Chuyển khoa
              </th>
              <th style={{ padding: PAD_TH, width: '9%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH, borderRight: '1.5px solid rgba(255,255,255,0.2)' }}>
                Hiện còn
              </th>
              <th style={{ padding: PAD_TH, width: '33%', textAlign: 'center', fontWeight: '800', fontSize: FONT_TH }}>
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ROW 1: HSCC */}
            <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1.5px solid #CBD5E1' }}>
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                fontWeight: '900',
                color: '#FFFFFF',
                fontSize: FONT_ROW_HEADER,
                backgroundColor: '#1E3A8A',
                borderRight: '1.5px solid #CBD5E1',
                verticalAlign: 'middle'
              }}>
                HSCC
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(hscc.benhCu, 'purple')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(hscc.benhMoi, 'blue')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(hscc.xuatVien, 'green')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(hscc.chuyenVien, 'amber')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(hscc.chuyenKhoa, 'amber')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1.5px solid #CBD5E1' }}>
                {renderBadge(hscc.hienCon, 'purple')}
              </td>
              <td style={{
                padding: isFullscreen ? '0.7rem 1.2rem' : '0.5rem 0.8rem',
                textAlign: 'left',
                verticalAlign: 'middle',
                backgroundColor: '#F8FAFC'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: isFullscreen ? '0.2rem 1.2rem' : '0.15rem 0.8rem'
                }}>
                  {renderNoteItem('Tử vong', hscc.tuVong, true)}
                  {renderNoteItem('Tiểu phẫu', hscc.tieuPhau)}
                  {renderNoteItem('Kê toa', hscc.keToa)}
                  {renderNoteItem('Bó bột', hscc.boBot)}
                  {renderNoteItem('Ngoại trú', hscc.ngoaiTru)}
                  {renderNoteItem('CC ngoài viện', hscc.ccNgoaiVien)}
                  {renderNoteItem('Truyền máu', hscc.truyenMau)}
                  {renderNoteItem('Trốn viện', hscc.tronVien !== undefined && hscc.tronVien !== '' ? hscc.tronVien : '00')}
                </div>
              </td>
            </tr>

            {/* ROW 2: TNT */}
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #CBD5E1' }}>
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                fontWeight: '900',
                color: '#FFFFFF',
                fontSize: FONT_ROW_HEADER,
                backgroundColor: '#1E3A8A',
                borderRight: '1.5px solid #CBD5E1',
                verticalAlign: 'middle'
              }}>
                TNT
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(tnt.tnt_benhCu || tnt.benhCu, 'purple')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(tnt.tnt_benhMoi || tnt.benhMoi, 'blue')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge(tnt.tnt_xuatVien || tnt.xuatVien, 'green')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {(tnt.tnt_chuyenVien && tnt.tnt_chuyenVien !== '0' && tnt.tnt_chuyenVien !== '00' && tnt.tnt_chuyenVien !== '-')
                  ? renderBadge(tnt.tnt_chuyenVien, 'amber')
                  : renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {(tnt.tnt_chuyenKhoa && tnt.tnt_chuyenKhoa !== '0' && tnt.tnt_chuyenKhoa !== '00' && tnt.tnt_chuyenKhoa !== '-')
                  ? renderBadge(tnt.tnt_chuyenKhoa, 'amber')
                  : renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1.5px solid #CBD5E1' }}>
                {renderBadge(tnt.tnt_hienCon || tnt.hienCon, 'purple')}
              </td>
              <td style={{
                padding: isFullscreen ? '0.7rem 1.2rem' : '0.5rem 0.8rem',
                textAlign: 'left',
                verticalAlign: 'middle',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isFullscreen ? '0.45rem' : '0.3rem'
                }}>
                  {renderNoteItem('CTĐK', tnt.tnt_ctdk || tnt.ctdk)}
                  {renderNoteItem('Nội trú', tnt.tnt_noiTru || tnt.noiTru)}
                </div>
              </td>
            </tr>

            {/* ROW 3: PK 21 */}
            <tr style={{ backgroundColor: '#FFFFFF' }}>
              <td style={{
                padding: PAD_TD,
                textAlign: 'center',
                fontWeight: '900',
                color: '#FFFFFF',
                fontSize: FONT_ROW_HEADER,
                backgroundColor: '#1E3A8A',
                borderRight: '1.5px solid #CBD5E1',
                verticalAlign: 'middle'
              }}>
                PK 21
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {(pk21.pk21_chuyenVien && pk21.pk21_chuyenVien !== '0' && pk21.pk21_chuyenVien !== '-')
                  ? renderBadge(pk21.pk21_chuyenVien, 'amber')
                  : renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #E2E8F0' }}>
                {renderBadge('-', 'neutral')}
              </td>
              <td style={{ padding: PAD_TD, textAlign: 'center', verticalAlign: 'middle', borderRight: '1.5px solid #CBD5E1' }}>
                {renderBadge('-', 'neutral')}
              </td>
              <td style={{
                padding: isFullscreen ? '0.7rem 1.2rem' : '0.5rem 0.8rem',
                textAlign: 'left',
                verticalAlign: 'middle',
                backgroundColor: '#F8FAFC'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isFullscreen ? '0.45rem' : '0.3rem'
                }}>
                  {renderNoteItem('Tổng số', pk21.pk21_tongSo || pk21.pk21_tongSoKham || pk21.tongSo)}
                  {renderNoteItem('Nhập viện', pk21.pk21_nhapVien || pk21.nhapVien)}
                  {pk21.pk21_ngoaiTru && renderNoteItem('Ngoại trú', pk21.pk21_ngoaiTru)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HsccTntSlide;
