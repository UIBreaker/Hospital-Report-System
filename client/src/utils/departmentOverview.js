import { DEPARTMENT_ORDER, DEPARTMENT_NAMES } from '../constants/medicalDictionary.js';

export const OVERVIEW_COLUMNS = [
  { key: 'benhCu', label: 'Bệnh cũ', tone: 'purple' },
  { key: 'benhMoi', label: 'Bệnh mới', tone: 'blue' },
  { key: 'xuatVien', label: 'Xuất viện', tone: 'green' },
  { key: 'chuyenVien', label: 'Chuyển viện', tone: 'amber' },
  { key: 'chuyenKhoa', label: 'Chuyển khoa', tone: 'amber' },
  { key: 'hienCon', label: 'Hiện còn', tone: 'purple' },
  { key: 'tuVong', label: 'Tử vong', tone: 'red' },
];

const readCount = (...values) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim());
  }
  return null;
};

const sumCounts = (...values) => {
  const counts = values.filter(value => value !== null);
  return counts.length ? counts.reduce((sum, value) => sum + value, 0) : null;
};

export const totalDepartmentOverview = (rows = []) => Object.fromEntries(
  OVERVIEW_COLUMNS.map(({ key }) => [
    key, sumCounts(...rows.map(row => row.metrics[key]).filter(value => Number.isFinite(value))),
  ]),
);

const readMetrics = (data = {}, prefix = '') => ({
  benhCu: readCount(data[`${prefix}benhCu`]),
  benhMoi: readCount(data[`${prefix}benhMoi`]),
  xuatVien: readCount(data[`${prefix}xuatVien`], data.benhXuat, data.xuat),
  chuyenVien: readCount(data[`${prefix}chuyenVien`], data.benhChuyenVien),
  chuyenKhoa: readCount(data[`${prefix}chuyenKhoa`], data.benhChuyenKhoa, data.chuyenKhoaSan),
  hienCon: readCount(data[`${prefix}hienCon`], data.hienCo),
  tuVong: readCount(data[`${prefix}tuVong`]),
});

// Only project saved report values; never recalculate or write patient balances.
export const buildDepartmentOverview = (reports = []) => DEPARTMENT_ORDER.map(code => {
  const report = reports.find(item => item.department_code === code);
  let data = report?.report_data || {};
  try {
    if (typeof data === 'string') data = JSON.parse(data);
  } catch {
    data = {};
  }
  if (!data || typeof data !== 'object') data = {};

  let metrics = readMetrics(data);
  if (code === 'hscc_tnt') {
    const hscc = readMetrics(data.hscc);
    const tnt = readMetrics(data.tnt, 'tnt_');
    metrics = Object.fromEntries(OVERVIEW_COLUMNS.map(({ key }) => [
      key, sumCounts(hscc[key], tnt[key]) ?? metrics[key],
    ]));
  } else if (code === 'yhct_phcn') {
    metrics = readMetrics(data.noiTru);
  } else if (code === 'nhi') {
    metrics.benhMoi = sumCounts(readCount(data.benhMoi_cc), readCount(data.benhMoi_pk)) ?? metrics.benhMoi;
  } else if (code === 'lck') {
    metrics.benhMoi = readCount(data.nhapVien_tongSo, metrics.benhMoi);
    metrics.chuyenVien = readCount(data.chuyenVien_tongSo, metrics.chuyenVien);
  }

  for (const [key, snakeKey, camelKey] of [
    ['chuyenVien', 'transfer_cases', 'transferCases'],
    ['tuVong', 'death_cases', 'deathCases'],
  ]) {
    let cases = report?.[snakeKey] ?? data[snakeKey] ?? data[camelKey];
    try {
      if (typeof cases === 'string') cases = JSON.parse(cases);
    } catch {
      cases = null;
    }
    if (metrics[key] === null && Array.isArray(cases) && cases.length > 0) metrics[key] = cases.length;
  }

  return { code, name: DEPARTMENT_NAMES[code], submitted: Boolean(report), metrics };
});
