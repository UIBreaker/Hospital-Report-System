import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaTimes, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaExpand, 
  FaCompress, 
  FaChevronLeft, 
  FaChevronRight, 
  FaRedo, 
  FaDownload,
  FaFileImage
} from 'react-icons/fa';

const ImageLightboxModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  title = 'Hình ảnh y khoa minh họa',
  subtitle = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
      setScale(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setScale(1);
      setRotation(0);
    }
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setScale(1);
      setRotation(0);
    }
  }, [images.length]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
      if (e.key === 'r' || e.key === 'R') handleRotate();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[currentIndex];
  const currentImgUrl = typeof currentImg === 'string' ? currentImg : currentImg?.url;
  const currentImgName = typeof currentImg === 'object' ? (currentImg?.name || `Ảnh ${currentIndex + 1}`) : `Ảnh ${currentIndex + 1}`;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 10, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Header Controls Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          zIndex: 10
        }}
      >
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFileImage />
            <span>{title}</span>
            {images.length > 1 && (
              <span style={{ 
                fontSize: '0.8rem', 
                backgroundColor: '#2563EB', 
                color: '#FFFFFF', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
              {subtitle} • {currentImgName}
            </div>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleZoomIn}
            title="Phóng to (+)"
            style={btnStyle}
          >
            <FaSearchPlus /> <span style={{ fontSize: '0.78rem' }}>+</span>
          </button>
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ (-)"
            style={btnStyle}
          >
            <FaSearchMinus /> <span style={{ fontSize: '0.78rem' }}>-</span>
          </button>
          <button
            onClick={handleResetZoom}
            title="Đặt lại kích thước (Phím 0)"
            style={{ ...btnStyle, fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleRotate}
            title="Xoay ảnh 90° (Phím R)"
            style={btnStyle}
          >
            <FaRedo />
          </button>
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình (Phím F)"}
            style={btnStyle}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            onClick={handleDownload}
            title="Tải ảnh gốc về máy"
            style={{ ...btnStyle, backgroundColor: '#0284C7' }}
          >
            <FaDownload /> <span style={{ fontSize: '0.78rem' }}>Tải</span>
          </button>
          <button
            onClick={onClose}
            title="Đóng xem ảnh (Esc)"
            style={{ ...btnStyle, backgroundColor: '#DC2626', marginLeft: '0.5rem' }}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '1.5rem'
        }}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              title="Ảnh trước (Phím mũi tên Trái)"
              style={{
                position: 'absolute',
                left: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.75)'; }}
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              title="Ảnh kế tiếp (Phím mũi tên Phải)"
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.75)'; }}
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Display Image with Scale and Rotation */}
        {currentImgUrl ? (
          <img
            src={currentImgUrl}
            alt={currentImgName}
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              objectFit: 'contain',
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              borderRadius: '8px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              cursor: scale > 1 ? 'grab' : 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div style={{ color: '#94A3B8', fontSize: '1rem', fontStyle: 'italic' }}>
            Không tìm thấy ảnh để hiển thị
          </div>
        )}
      </div>

      {/* Bottom Thumbnails Strip (If multiple images) */}
      {images.length > 1 && (
        <div
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.65rem',
            overflowX: 'auto',
            zIndex: 10
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const thumbUrl = typeof img === 'string' ? img : img?.url;
            const isSelected = idx === currentIndex;
            return (
              <img
                key={idx}
                src={thumbUrl}
                alt={`Thumb ${idx + 1}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setScale(1);
                  setRotation(0);
                }}
                style={{
                  width: '54px',
                  height: '42px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: isSelected ? '2.5px solid #3B82F6' : '1.5px solid rgba(255, 255, 255, 0.2)',
                  opacity: isSelected ? 1 : 0.6,
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>
      )}
    </div>,
    document.body
  );
};

const btnStyle = {
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  color: '#F8FAFC',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '6px',
  padding: '0.4rem 0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  transition: 'all 0.15s ease'
};

export default ImageLightboxModal;
