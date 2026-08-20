import axios from 'axios';
import { compressImageFile } from '../utils/imageUtils';

/**
 * Cloudinary & Hybrid Medical Image Upload Service
 * Supports Direct Cloud Upload (Primary) and High-Compression Canvas Fallback (Zero-Fail Safety Net)
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rcokvkdu';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hospital_reports';

/**
 * Upload single medical image to Cloud Storage
 * @param {File} file - Image file
 * @param {Function} onProgress - Progress callback (pct: number) => void
 * @returns {Promise<{id: string, url: string, name: string, size: string, isCloud: boolean}>}
 */
export const uploadSingleMedicalImage = async (file, onProgress = null) => {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Tệp không phải là hình ảnh hợp lệ');
  }

  // 1. Client-side Pre-compression (Reduces network payload by ~80% before upload)
  let compressedBase64;
  try {
    compressedBase64 = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: 'image/jpeg'
    });
  } catch (compErr) {
    console.warn('Canvas compression fallback to raw file:', compErr);
  }

  // 2. Attempt Cloudinary Direct Upload if preset is configured
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      // If we compressed to Base64, upload the data URL directly
      formData.append('file', compressedBase64 || file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'hospital_reports/cases');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percent);
            }
          },
          timeout: 25000 // 25s timeout
        }
      );

      if (response.data && response.data.secure_url) {
        const cloudUrl = response.data.secure_url;
        const bytes = response.data.bytes || (compressedBase64 ? compressedBase64.length * 0.75 : file.size);
        return {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          url: cloudUrl,
          name: file.name,
          size: `${Math.round(bytes / 1024)} KB`,
          isCloud: true,
          timestamp: new Date().toISOString()
        };
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload unavailable or failed, falling back to local compressed data:', cloudErr.message);
    }
  }

  // 3. Resilient Fallback: If Cloudinary fails or is offline, use compressed Base64
  const fallbackUrl = compressedBase64 || await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 });
  return {
    id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    url: fallbackUrl,
    name: file.name,
    size: `${Math.round(fallbackUrl.length * 0.75 / 1024)} KB`,
    isCloud: false,
    timestamp: new Date().toISOString()
  };
};

/**
 * Upload multiple medical image files sequentially with progress reporting
 * @param {FileList|Array<File>} files
 * @param {Function} onProgressTotal - (pct: number, currentIndex: number, total: number) => void
 * @returns {Promise<Array<Object>>}
 */
export const uploadMultipleMedicalImages = async (files, onProgressTotal = null) => {
  const fileArray = Array.from(files).filter(f => f.type && f.type.startsWith('image/'));
  const results = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    try {
      const uploadedItem = await uploadSingleMedicalImage(file, (singlePct) => {
        if (onProgressTotal) {
          const overallPct = Math.round(((i + singlePct / 100) / fileArray.length) * 100);
          onProgressTotal(overallPct, i + 1, fileArray.length);
        }
      });
      results.push(uploadedItem);
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', file.name, err);
    }
  }

  if (onProgressTotal) {
    onProgressTotal(100, fileArray.length, fileArray.length);
  }

  return results;
};
