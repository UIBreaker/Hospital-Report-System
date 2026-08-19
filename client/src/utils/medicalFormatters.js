/**
 * Central Medical Formatters & Utility Functions
 * TTYT Khu Vực Bình Long
 */
import { FIELD_LABELS } from '../constants/medicalDictionary';

export const getLabel = (key) => {
  return FIELD_LABELS[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
};

export const translateFieldKey = (key, parentKey = '') => {
  if (!key) return '';
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const combinedKey = parentKey ? `${parentKey}_${key}` : key;
  if (FIELD_LABELS[combinedKey]) return FIELD_LABELS[combinedKey];
  return getLabel(key);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return dateStr;
};

export const formatPatientAge = (ageVal) => {
  if (!ageVal) return '—';
  const str = String(ageVal).trim();
  if (/^\d{4}$/.test(str)) return `SN: ${str}`;
  const clean = str.replace(/tuổi/gi, '').replace(/,/g, '').replace(/\./g, '').trim();
  return clean ? `${clean} tuổi` : '—';
};

export const normalizeImages = (imgData) => {
  if (!imgData) return [];
  if (Array.isArray(imgData)) return imgData.filter(Boolean);
  if (typeof imgData === 'string') {
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [imgData];
    } catch {
      return [imgData];
    }
  }
  return [];
};

export const getMetricStyle = (key, value) => {
  const numVal = Number(value);
  const isPositive = !isNaN(numVal) && numVal > 0;
  const kLower = (key || '').toLowerCase();

  // Highlight mortality
  if (kLower.includes('tuvong') || kLower.includes('tu_vong') || kLower.includes('tử vong')) {
    return isPositive
      ? { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626', label: '#991B1B', badge: '🚨 TỬ VONG' }
      : { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', label: '#B91C1C', badge: '' };
  }

  // Highlight total summary
  if (key === 'tongSoKham_tongCong' || key === 'tong4ck_tongSo') {
    return { bg: '#DBEAFE', border: '#1D4ED8', text: '#1E3A8A', label: '#1E40AF', badge: '⭐ TỔNG CỘNG' };
  }

  // Transfer
  if (kLower.includes('chuyenvien') || kLower.includes('chuyen_vien')) {
    return isPositive
      ? { bg: '#FEF3C7', border: '#D97706', text: '#B45309', label: '#92400E' }
      : { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B', label: '#475569' };
  }

  // Admission / New cases / Totals
  if (kLower.includes('benhmoi') || kLower.includes('tongso') || kLower.includes('tong_so') || kLower.includes('tongsoca') || kLower.includes('tong4ck')) {
    return { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', label: '#1E40AF' };
  }

  // Discharges
  if (kLower.includes('xuatvien') || kLower.includes('xuat_vien') || kLower.includes('xinxuatvien') || key === 'xuat') {
    return { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', label: '#166534' };
  }

  // Currently admitted / In-hospital
  if (kLower.includes('hiencon') || kLower.includes('hien_con') || kLower.includes('hienco') || kLower.includes('hien_co')) {
    return { bg: '#FAF5FF', border: '#A855F7', text: '#7E22CE', label: '#6B21A8' };
  }

  return { bg: '#FFFFFF', border: '#E2E8F0', text: '#0F2C59', label: '#334155' };
};
