/**
 * Utility functions for client-side medical image compression and processing
 */

/**
 * Compresses an image file client-side using HTML5 Canvas
 * @param {File} file - Original file from input
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Base64 data URL of compressed JPEG
 */
export const compressImageFile = (file, options = {}) => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Tệp không phải là hình ảnh hợp lệ'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể xử lý hình ảnh'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Processes multiple files selected from input or camera
 * @param {FileList|Array<File>} files 
 * @param {Object} options 
 * @returns {Promise<Array<{id: string, url: string, name: string, size: string}>>}
 */
export const processImageFiles = async (files, options = {}) => {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  const results = [];

  for (const file of fileArray) {
    try {
      const compressedUrl = await compressImageFile(file, options);
      results.push({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        url: compressedUrl,
        name: file.name,
        size: `${Math.round(compressedUrl.length * 0.75 / 1024)} KB`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Lỗi khi nén ảnh:', file.name, err);
    }
  }

  return results;
};

/**
 * Normalizes images field to always be an array of image objects / URLs
 * @param {any} images 
 * @returns {Array<Object>}
 */
export const normalizeImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map((img, idx) => {
      if (typeof img === 'string') {
        return { id: `img_${idx}`, url: img, name: `Ảnh minh họa ${idx + 1}` };
      }
      return img;
    });
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return normalizeImages(parsed);
    } catch (e) {
      return [{ id: 'img_0', url: images, name: 'Ảnh minh họa' }];
    }
  }
  return [];
};
