import { DEPARTMENT_NAMES } from '../constants/medicalDictionary.js';

const parseMetricNum = value => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const text = String(value).trim();
  const parsed = text.includes('/') ? parseFloat(text.split('/')[0].trim()) : parseFloat(text.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Preserve the existing intake rules, while retaining the source of every term.
export const getDepartmentIntakeBreakdown = (data, deptCode = '') => {
  if (!data || typeof data !== 'object') return [];
  const code = (deptCode || '').toLowerCase();
  const name = (DEPARTMENT_NAMES[code] || deptCode).replace(/^Khoa /, '');
  const choose = (object, fields) => {
    const field = fields.find(key => object?.[key]);
    return { field, value: parseMetricNum(field ? object[field] : 0) };
  };
  const item = (kind, value, label = name) => ({ kind, value, label, deptCode });
  const total = items => items.reduce((sum, entry) => sum + entry.value, 0);

  if (code.includes('hscc') || (data.hscc && data.tnt)) {
    const hscc = choose(data.hscc, ['tongSoKham', 'tongSo', 'benhMoi']);
    const tnt = choose(data.tnt, ['tongSoKham', 'tnt_ctdk', 'ctdk', 'tnt_benhMoi']);
    const pk21 = choose(data.pk21, ['pk21_tongSo', 'pk21_tongSoKham', 'tongSo', 'pk21_ngoaiTru']);
    const items = [
      item(hscc.field === 'benhMoi' ? 'admission' : 'exam', hscc.value, 'HSCC'),
      item(['tnt_ctdk', 'ctdk'].includes(tnt.field) ? 'dialysis' : tnt.field === 'tnt_benhMoi' ? 'admission' : 'exam', tnt.value, 'TNT'),
      item(pk21.field === 'pk21_ngoaiTru' ? 'other' : 'exam', pk21.value, 'PK21'),
    ];
    if (total(items) > 0) return items;
  }

  if (code.includes('lck') || data.tong4ck_tongSo !== undefined || data.tmh_tongSo !== undefined) {
    if (data.tong4ck_tongSo) return [item('exam', parseMetricNum(data.tong4ck_tongSo))];
    const items = [
      item('exam', ['tmh_tongSo', 'mat_tongSo', 'rhm_noi_tongSo', 'daLieu_tongSo'].reduce((sum, field) => sum + parseMetricNum(data[field]), 0)),
      item('admission', parseMetricNum(data.nhapVien_tongSo)),
    ];
    if (total(items) > 0) return items;
  }

  if (code.includes('cdha') || Array.isArray(data.techniques)) {
    if (Array.isArray(data.techniques) && data.techniques.length > 0) {
      return [item('support', data.techniques.reduce((sum, technique) => sum + parseMetricNum(technique?.tongSo), 0), 'CĐHA')];
    }
    if (data.tongSo) return [item('support', parseMetricNum(data.tongSo), 'CĐHA')];
  }
  if (code.includes('xn') || data.tongXetNghiem) {
    return [item('support', choose(data, ['tongSo', 'tongXetNghiem']).value, 'Xét nghiệm')];
  }
  if (code.includes('gmhs') || data.tongSoCaMo) {
    return [item('surgery', choose(data, ['tongSoCaMo', 'soCaGayMe']).value)];
  }
  if (code.includes('nhi')) {
    const exam = choose(data, ['pk', 'tongSoKham', 'soCaKham']);
    return [exam.value > 0 ? item('exam', exam.value) : item('admission', choose(data, ['benhMoi', 'benhMoi_cc', 'benhMoi_pk']).value)];
  }
  if (code.includes('san')) {
    const exam = choose(data, ['tongSoKham', 'soCaKham']);
    const admission = choose(data, ['benhMoi', 'sanhThuong']);
    return [exam.value > 0 ? item('exam', exam.value) : item(admission.field === 'sanhThuong' ? 'other' : 'admission', admission.value)];
  }
  const direct = choose(data, ['tongSoKham', 'soCaKham', 'tongSo', 'tong_so', 'tongSoCa']);
  if (direct.value > 0) return [item(['tongSoKham', 'soCaKham'].includes(direct.field) ? 'exam' : 'other', direct.value)];
  return [item('admission', parseMetricNum(data.benhMoi))];
};

export const groupDailyIntakeBreakdown = items => [
  ['exam', 'Khám bệnh', 'blue'],
  ['support', 'Cận lâm sàng', 'green'],
  ['dialysis', 'Chạy thận', 'purple'],
  ['admission', 'Bệnh mới', 'amber'],
  ['surgery', 'Phẫu thuật', 'blue'],
  ['other', 'Tiếp nhận khác', 'amber'],
].map(([kind, label, tone]) => {
  const sources = items.filter(item => item.kind === kind && item.value !== 0);
  return { kind, label, tone, sources, value: sources.reduce((sum, source) => sum + source.value, 0) };
}).filter(group => group.sources.length > 0);
