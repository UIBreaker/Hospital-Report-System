import React from 'react';
import { FaImage } from 'react-icons/fa';

const FullScreenImageSlide = ({ slide, isFullscreen, onOpenLightbox }) => {
  const { deptName, caseType, patientName, imageUrl, imageIndex = 1, totalImages = 1 } = slide;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100%',
      minHeight: 0, gap: '0.45rem', position: 'relative'
    }}>
      {/* Slide type header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          fontSize: isFullscreen ? '1rem' : '0.85rem', fontWeight: '800',
          color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <FaImage style={{ color: '#2563EB', fontSize: isFullscreen ? '1.25rem' : '1.05rem' }} />
          {deptName} &nbsp;•&nbsp; {caseType} — ẢNH {imageIndex}/{totalImages}
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: isFullscreen ? '48px' : '38px', height: isFullscreen ? '48px' : '38px', flexShrink: 0 }} />
      </div>

      {/* Patient Name Banner */}
      <div style={{
        backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE',
        borderLeft: '7px solid #2563EB', borderRadius: '10px',
        padding: isFullscreen ? '0.6rem 1.2rem' : '0.45rem 0.9rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.08)'
      }}>
        <span style={{ fontSize: isFullscreen ? '1.35rem' : '1.15rem', fontWeight: '900', color: '#0F2C59', textTransform: 'uppercase' }}>
          👤 BỆNH NHÂN: {patientName || 'Chưa có tên'}
        </span>
        <span style={{ fontSize: isFullscreen ? '0.98rem' : '0.85rem', fontWeight: '700', color: '#1D4ED8', backgroundColor: '#DBEAFE', padding: '0.2rem 0.65rem', borderRadius: '6px' }}>
          Hình {imageIndex}/{totalImages}
        </span>
      </div>

      {/* Main Image Container */}
      <div
        onClick={() => onOpenLightbox && onOpenLightbox(imageUrl)}
        style={{
          flex: 1, minHeight: 0, backgroundColor: '#0A1223',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'zoom-in', position: 'relative', border: '2px solid #1E293B',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
        }}
      >
        <img
          src={imageUrl}
          alt={`Minh họa ${imageIndex}`}
          style={{
            maxWidth: '100%', maxHeight: '100%',
            objectFit: 'contain', display: 'block'
          }}
        />
        <div style={{
          position: 'absolute', bottom: '12px', right: '14px',
          backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
          color: '#FFFFFF', padding: '0.35rem 0.8rem', borderRadius: '6px',
          fontSize: isFullscreen ? '0.9rem' : '0.78rem', fontWeight: '700',
          border: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'none'
        }}>
          🔍 Nhấp để phóng to toàn màn hình
        </div>
      </div>
    </div>
  );
};

export default FullScreenImageSlide;
