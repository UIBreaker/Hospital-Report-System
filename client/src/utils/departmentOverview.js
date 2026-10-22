import { DEPARTMENT_ORDER, DEPARTMENT_NAMES } from '../constants/medicalDictionary.js';

export const OVERVIEW_COLUMNS = [
  { key: 'tongSoKham', label: 'Tổng số khám bệnh', tone: 'blue' },
  { key: 'ngoaiTru', label: 'Ngoại trú', tone: 'blue' },
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

// Examination forms may save total/BHYT; only the first number is the total.
const readExaminations = (...values) => {
  for (const value of values) {
    const count = readCount(value);
    if (count !== null) return count;
    if (typeof value === 'string' && /^\s*\d+\s*\/\s*\d+\s*$/.test(value)) return Number(value.split('/')[0].trim());
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
  tongSoKham: readExaminations(data[`${prefix}tongSoKham`], data.tongSoKhamBenh, data.soCaKham),
  ngoaiTru: readCount(data[`${prefix}ngoaiTru`]),
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
    const hscc = readMetrics(data.hscc || {});
    const tnt = readMetrics(data.tnt || {}, 'tnt_');
    metrics = Object.fromEntries(OVERVIEW_COLUMNS.map(({ key }) => [
      key, sumCounts(hscc[key], tnt[key]) ?? metrics[key],
    ]));
    metrics.tongSoKham = sumCounts(
      hscc.tongSoKham,
      readExaminations(data.tnt?.tnt_tongSoKham, data.tnt?.tongSoKham, data.tnt?.tnt_ctdk, data.tnt?.ctdk),
      readExaminations(data.pk21?.pk21_tongSo, data.pk21?.pk21_tongSoKham, data.pk21?.tongSo),
    ) ?? metrics.tongSoKham;
    metrics.ngoaiTru = sumCounts(hscc.ngoaiTru, tnt.ngoaiTru, readCount(data.pk21?.pk21_ngoaiTru)) ?? metrics.ngoaiTru;
  } else if (code === 'yhct_phcn') {
    metrics = {
      ...readMetrics(data.noiTru || {}),
      tongSoKham: metrics.tongSoKham,
      ngoaiTru: readCount(data.ngoaiTru?.hienCon, data.ngoaiTru),
    };
  } else if (code === 'nhi') {
    metrics.benhMoi = sumCounts(readCount(data.benhMoi_cc), readCount(data.benhMoi_pk)) ?? metrics.benhMoi;
    metrics.tongSoKham = readExaminations(data.pk, metrics.tongSoKham);
  } else if (code === 'lck') {
    metrics.tongSoKham = readExaminations(data.tong4ck_tongSo, metrics.tongSoKham) ?? sumCounts(
      readCount(data.tmh_tongSo), readCount(data.mat_tongSo), readCount(data.rhm_noi_tongSo), readCount(data.daLieu_tongSo),
    );
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
