import React, { useState, useRef } from 'react';
import { 
  FaCamera, 
  FaFileUpload, 
  FaTrash, 
  FaEye, 
  FaSpinner, 
  FaImage,
  FaPlus 
} from 'react-icons/fa';
import { processImageFiles, normalizeImages } from '../../utils/imageUtils';
import ImageLightboxModal from './ImageLightboxModal';

const THEME_STYLES = {
  amber: {
    border: '#FDE68A',
    bg: '#FFFBEB',
    primary: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    btnBg: '#FEF3C7',
    btnText: '#B45309'
  },
  blue: {
    border: '#BAE6FD',
    bg: '#F0F9FF',
    primary: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    btnBg: '#E0F2FE',
    btnText: '#0284C7'
  },
  red: {
    border: '#FECACA',
    bg: '#FEF2F2',
    primary: '#DC2626',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    btnBg: '#FEE2E2',
    btnText: '#DC2626'
  },
  purple: {
    border: '#DDD6FE',
    bg: '#F5F3FF',
    primary: '#7C3AED',
    badgeBg: '#EDE9FE',
    badgeText: '#6D28D9',
    btnBg: '#EDE9FE',
    btnText: '#7C3AED'
  }
};

const CaseImageUploader = ({ 
  images = [], 
  onChange, 
  theme = 'blue',
  patientName = '',
  readOnly = false 
}) => {
  const [processing, setProcessing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.blue;
  const imageList = normalizeImages(images);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    try {
      const processed = await processImageFiles(files);
      const updated = [...imageList, ...processed];
      onChange(updated);
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
      alert('Không thể xử lý hình ảnh. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    const updated = imageList.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleOpenLightbox = (index, e) => {
    e?.stopPropagation();
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="case-image-uploader" style={{ marginTop: '0.85rem' }}>
      {/* Header Label */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <label style={{ 
          fontSize: '0.85rem', 
          fontWeight: '700', 
          color: currentTheme.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          margin: 0
        }}>
          <FaImage />
          Hình ảnh minh họa (X-Quang, CT, Vết mổ, ECG, Lâm sàng...)
          {imageList.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: currentTheme.badgeBg,
              color: currentTheme.badgeText,
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontWeight: '800'
            }}>
              {imageList.length} ảnh
            </span>
          )}
        </label>

        {/* Upload Buttons */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {/* File Dialog button */}
            <button
              type="button"
              disabled={processing}
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: currentTheme.btnBg,
                color: currentTheme.btnText,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              {processing ? <FaSpinner className="spinner" /> : <FaFileUpload />}
              Chọn ảnh từ máy
            </button>

            {/* Mobile Camera Direct Button */}
            <button
              type="button"
              disabled={processing}
              onClick={() => cameraInputRef.current?.click()}
              title="Chụp ảnh trực tiếp từ Camera điện thoại"
              style={{
                backgroundColor: '#FFFFFF',
                color: currentTheme.btnText,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FaCamera /> Chụp ảnh
            </button>

            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              style={{ display: 'none' }}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        )}
      </div>

      {/* Image Thumbnails Strip & Drop Area */}
      {imageList.length === 0 ? (
        !readOnly && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '1rem',
              border: `2px dashed ${currentTheme.border}`,
              backgroundColor: currentTheme.bg,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = currentTheme.primary}
            onMouseOut={(e) => e.currentTarget.style.borderColor = currentTheme.border}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <FaImage style={{ fontSize: '1.4rem', color: currentTheme.primary, opacity: 0.6 }} />
              <FaCamera style={{ fontSize: '1.2rem', color: currentTheme.primary, opacity: 0.6 }} />
            </div>
            <span>Nhấn vào đây để tải lên ảnh hoặc chụp ảnh trực tiếp từ camera</span>
          </div>
        )
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem',
          backgroundColor: currentTheme.bg,
          borderRadius: '8px',
          border: `1px solid ${currentTheme.border}`
        }}>
          {imageList.map((img, idx) => {
            const url = typeof img === 'string' ? img : img?.url;
            const name = typeof img === 'object' ? (img?.name || `Ảnh ${idx + 1}`) : `Ảnh ${idx + 1}`;
            const size = typeof img === 'object' ? img?.size : '';

            return (
              <div
                key={idx}
                onClick={(e) => handleOpenLightbox(idx, e)}
                style={{
                  position: 'relative',
                  width: '110px',
                  height: '95px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Nhấp để phóng to toàn màn hình (Lightbox)"
              >
                {/* Image element */}
                <img
                  src={url}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '70px',
                    objectFit: 'cover'
                  }}
                />

                {/* Footer caption */}
                <div style={{
                  padding: '2px 4px',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  backgroundColor: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {size ? `${size}` : name}
                </div>

                {/* Hover Eye Overlay Icon */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '70px',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  opacity: 0,
                  transition: 'opacity 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0}
                >
                  <FaEye style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                </div>

                {/* Delete button */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(idx, e)}
                    title="Xóa ảnh này"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      zIndex: 5
                    }}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add more button */}
          {!readOnly && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '110px',
                height: '95px',
                borderRadius: '8px',
                border: `2px dashed ${currentTheme.border}`,
                backgroundColor: '#FFFFFF',
                color: currentTheme.primary,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '700',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
            >
              <FaPlus style={{ fontSize: '1.1rem' }} />
              Thêm ảnh
            </button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={imageList}
        initialIndex={lightboxIndex}
        title={patientName ? `Ảnh bệnh nhân: ${patientName}` : 'Hình ảnh y khoa'}
        subtitle="Chế độ trình chiếu ảnh chất lượng cao"
      />
    </div>
  );
};

export default CaseImageUploader;
