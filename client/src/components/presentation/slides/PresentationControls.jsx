import React from 'react';
import {
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress,
  FaFilePowerpoint, FaTimes, FaSearchPlus, FaSearchMinus, FaUndo
} from 'react-icons/fa';

const PresentationControls = ({
  currentSlide,
  totalSlides,
  fontScale,
  isFullscreen,
  exportingPptx,
  onPrev,
  onNext,
  onFontScaleChange,
  onResetFontScale,
  onToggleFullscreen,
  onExportPptx,
  onClose
}) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: '#0F2C59', color: '#FFFFFF',
      padding: isFullscreen ? '0.55rem 1.4rem' : '0.45rem 1rem',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      zIndex: 100, flexShrink: 0, gap: '0.8rem', flexWrap: 'wrap'
    }}>
      {/* Left: Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          style={{
            backgroundColor: currentSlide === 0 ? 'rgba(255,255,255,0.1)' : '#2563EB',
            color: '#FFFFFF', border: 'none', borderRadius: '8px',
            padding: '0.45rem 0.9rem', fontWeight: '800', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem',
            opacity: currentSlide === 0 ? 0.4 : 1, transition: 'all 0.15s ease'
          }}
        >
          <FaChevronLeft /> <span>Trước</span>
        </button>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.9rem',
          borderRadius: '8px', fontWeight: '800', fontSize: '0.92rem',
          fontFamily: "'Roboto Mono', monospace", border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {currentSlide + 1} / {totalSlides}
        </div>

        <button
          onClick={onNext}
          disabled={currentSlide >= totalSlides - 1}
          style={{
            backgroundColor: currentSlide >= totalSlides - 1 ? 'rgba(255,255,255,0.1)' : '#2563EB',
            color: '#FFFFFF', border: 'none', borderRadius: '8px',
            padding: '0.45rem 0.9rem', fontWeight: '800', cursor: currentSlide >= totalSlides - 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem',
            opacity: currentSlide >= totalSlides - 1 ? 0.4 : 1, transition: 'all 0.15s ease'
          }}
        >
          <span>Tiếp</span> <FaChevronRight />
        </button>
      </div>

      {/* Middle: Font Zoom Engine (A- / 100% / A+) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.25rem 0.55rem',
        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.18)'
      }}>
        <button
          onClick={() => onFontScaleChange(-0.05)}
          disabled={fontScale <= 0.75}
          title="Thu nhỏ chữ (A-)"
          style={{
            backgroundColor: fontScale <= 0.75 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
            color: '#FFFFFF', border: 'none', borderRadius: '6px',
            padding: '0.35rem 0.65rem', fontWeight: '800', cursor: fontScale <= 0.75 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem'
          }}
        >
          <FaSearchMinus /> <span>A-</span>
        </button>

        <button
          onClick={onResetFontScale}
          title="Đặt lại 100%"
          style={{
            backgroundColor: fontScale === 1 ? '#0284C7' : 'rgba(255,255,255,0.15)',
            color: '#FFFFFF', border: 'none', borderRadius: '6px',
            padding: '0.35rem 0.75rem', fontWeight: '800', cursor: 'pointer',
            fontSize: '0.82rem', fontFamily: "'Roboto Mono', monospace"
          }}
        >
          {Math.round(fontScale * 100)}%
        </button>

        <button
          onClick={() => onFontScaleChange(0.05)}
          disabled={fontScale >= 2.0}
          title="Phóng to chữ (A+)"
          style={{
            backgroundColor: fontScale >= 2.0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
            color: '#FFFFFF', border: 'none', borderRadius: '6px',
            padding: '0.35rem 0.65rem', fontWeight: '800', cursor: fontScale >= 2.0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem'
          }}
        >
          <FaSearchPlus /> <span>A+</span>
        </button>
      </div>

      {/* Right: Actions (PPTX, Fullscreen, Close) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onExportPptx}
          disabled={exportingPptx}
          title="Xuất file trình chiếu PowerPoint (.pptx)"
          style={{
            backgroundColor: '#D97706', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.45rem 0.9rem', fontWeight: '800',
            cursor: exportingPptx ? 'not-allowed' : 'pointer', display: 'flex',
            alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem'
          }}
        >
          <FaFilePowerpoint />
          <span>{exportingPptx ? 'Đang xuất...' : 'Xuất PowerPoint'}</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Chiếu toàn màn hình'}
          style={{
            backgroundColor: '#059669', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.45rem 0.9rem', fontWeight: '800',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem',
            fontSize: '0.86rem'
          }}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
          <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            title="Thoát trình chiếu"
            style={{
              backgroundColor: 'rgba(239,68,68,0.2)', color: '#FCA5A5',
              border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '8px',
              padding: '0.45rem 0.8rem', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem'
            }}
          >
            <FaTimes /> <span>Đóng</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PresentationControls;
