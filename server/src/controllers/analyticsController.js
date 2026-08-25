const pool = require('../config/db');

const parseMetricNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    const first = parseFloat(parts[0].trim());
    return isNaN(first) ? 0 : first;
  }
  const parsed = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const extractDepartmentPatientCount = (rawData, deptCode = '') => {
  if (!rawData || typeof rawData !== 'object') return 0;
  const code = (deptCode || '').toLowerCase();

  // 1. HSCC - TNT
  if (code.includes('hscc') || (rawData.hscc && rawData.tnt)) {
    const hsccKham = parseMetricNum(rawData.hscc && (rawData.hscc.tongSoKham || rawData.hscc.tongSo || rawData.hscc.benhMoi));
    const tntKham = parseMetricNum(rawData.tnt && (rawData.tnt.tongSoKham || rawData.tnt.tnt_ctdk || rawData.tnt.ctdk || rawData.tnt.tnt_benhMoi));
    const pk21Kham = parseMetricNum(rawData.pk21 && (rawData.pk21.pk21_tongSo || rawData.pk21.pk21_tongSoKham || rawData.pk21.tongSo || rawData.pk21.pk21_ngoaiTru));
    const sum = hsccKham + tntKham + pk21Kham;
    if (sum > 0) return sum;
  }

  // 2. LCK (Liên Chuyên Khoa)
  if (code.includes('lck') || rawData.tong4ck_tongSo !== undefined || rawData.tmh_tongSo !== undefined) {
    if (rawData.tong4ck_tongSo) return parseMetricNum(rawData.tong4ck_tongSo);
    const sum = parseMetricNum(rawData.tmh_tongSo) + parseMetricNum(rawData.mat_tongSo) + parseMetricNum(rawData.rhm_noi_tongSo) + parseMetricNum(rawData.daLieu_tongSo) + parseMetricNum(rawData.nhapVien_tongSo);
    if (sum > 0) return sum;
  }

  // 3. CDHA (Chẩn Đoán Hình Ảnh)
  if (code.includes('cdha') || Array.isArray(rawData.techniques)) {
    if (Array.isArray(rawData.techniques) && rawData.techniques.length > 0) {
      return rawData.techniques.reduce((acc, t) => acc + parseMetricNum(t && t.tongSo), 0);
    }
    if (rawData.tongSo) return parseMetricNum(rawData.tongSo);
  }

  // 4. XN (Xét Nghiệm)
  if (code.includes('xn') || rawData.tongXetNghiem) {
    return parseMetricNum(rawData.tongSo || rawData.tongXetNghiem);
  }

  // 5. GMHS (Gây Mê Hồi Sức)
  if (code.includes('gmhs') || rawData.tongSoCaMo) {
    return parseMetricNum(rawData.tongSoCaMo || rawData.soCaGayMe || 0);
  }

  // 6. Khoa Nhi
  if (code.includes('nhi')) {
    const pk = parseMetricNum(rawData.pk || rawData.tongSoKham || rawData.soCaKham);
    const bm = parseMetricNum(rawData.benhMoi || rawData.benhMoi_cc || rawData.benhMoi_pk);
    return pk > 0 ? pk : bm;
  }

  // 7. Khoa Sản
  if (code.includes('san')) {
    const tk = parseMetricNum(rawData.tongSoKham || rawData.soCaKham);
    const bm = parseMetricNum(rawData.benhMoi || rawData.sanhThuong);
    return tk > 0 ? tk : bm;
  }

  // 8. Các khoa lâm sàng khác (Nội, Nhiễm, Ngoại TH, CTCH, YHCT-PHCN)
  const directKham = parseMetricNum(rawData.tongSoKham || rawData.soCaKham || rawData.tongSo || rawData.tong_so || rawData.tongSoCa);
  if (directKham > 0) return directKham;

  return parseMetricNum(rawData.benhMoi || 0);
};

const DEPARTMENT_NAMES = {
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét Nghiệm',
  cdha: 'Khoa Chẩn Đoán Hình Ảnh',
  hscc_tnt: 'Khoa Hồi Sức Cấp Cứu - TNT',
  noi: 'Khoa Nội',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Sản',
  yhct_phcn: 'Khoa YHCT - PHCN',
  ngoai_th: 'Khoa Ngoại Tổng Hợp',
  ctch: 'Khoa Chấn Thương Chỉnh Hình',
  gmhs: 'Khoa Gây Mê Hồi Sức'
};

const computeComparison = (currentVal, prevVal) => {
  const cur = Number(currentVal) || 0;
  const prev = Number(prevVal) || 0;
  const diff = cur - prev;
  let percent = 0;
  if (prev > 0) {
    percent = Number(((diff / prev) * 100).toFixed(1));
  } else if (cur > 0) {
    percent = 100;
  } else {
    percent = 0;
  }

  let trend = 'equal';
  if (diff > 0) trend = 'up';
  else if (diff < 0) trend = 'down';

  return {
    current: cur,
    previous: prev,
    diff,
    percent,
    trend
  };
};

const getHospitalAnalytics = async (req, res, next) => {
  try {
    const range = req.query.range || 'day';
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    // 1. Query all reports & clinical cases
    const [reports] = await pool.query(
      'SELECT r.id, r.department_code, r.report_date, r.report_data, r.doctor_name, r.nurse_name, r.status, u.department_name ' +
      'FROM reports r ' +
      'LEFT JOIN users u ON r.department_code = u.department_code ' +
      'ORDER BY r.report_date ASC, r.department_code ASC'
    );

    const reportIds = reports.map(r => r.id);
    let transferCounts = {}, surgeryCounts = {}, deathCounts = {}, criticalCounts = {};

    if (reportIds.length > 0) {
      const placeholders = reportIds.map(() => '?').join(',');
      const [
        [tcRows],
        [scRows],
        [dcRows],
        [ccRows]
      ] = await Promise.all([
        pool.query('SELECT report_id, COUNT(*) as cnt FROM transfer_cases WHERE report_id IN (' + placeholders + ') GROUP BY report_id', reportIds),
        pool.query('SELECT report_id, COUNT(*) as cnt FROM surgery_cases WHERE report_id IN (' + placeholders + ') GROUP BY report_id', reportIds),
        pool.query('SELECT report_id, COUNT(*) as cnt FROM death_cases WHERE report_id IN (' + placeholders + ') GROUP BY report_id', reportIds),
        pool.query('SELECT report_id, COUNT(*) as cnt FROM critical_cases WHERE report_id IN (' + placeholders + ') GROUP BY report_id', reportIds)
      ]);

      (tcRows || []).forEach(r => { transferCounts[r.report_id] = r.cnt; });
      (scRows || []).forEach(r => { surgeryCounts[r.report_id] = r.cnt; });
      (dcRows || []).forEach(r => { deathCounts[r.report_id] = r.cnt; });
      (ccRows || []).forEach(r => { criticalCounts[r.report_id] = r.cnt; });
    }

    // Group reports by date
    const reportsByDate = new Map();
    reports.forEach(r => {
      const dStr = r.report_date;
      if (!reportsByDate.has(dStr)) reportsByDate.set(dStr, []);
      const rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data || '{}') : (r.report_data || {});
      const transferCnt = transferCounts[r.id] || 0;
      const surgeryCnt = surgeryCounts[r.id] || 0;
      const deathCnt = deathCounts[r.id] || 0;
      const criticalCnt = criticalCounts[r.id] || 0;

      reportsByDate.get(dStr).push({
        ...r,
        rawData,
        transferCnt,
        surgeryCnt,
        deathCnt,
        criticalCnt
      });
    });

    const aggregateDayData = (deptReports = []) => {
      let tongSoKham = 0, benhCu = 0, benhMoi = 0, xuatVien = 0;
      let chuyenVien = 0, phauThuat = 0, benhNang = 0, tuVong = 0, hienCon = 0;
      const deptBreakdown = [];

      deptReports.forEach(r => {
        const raw = r.rawData || {};
        const dKham = extractDepartmentPatientCount(raw, r.department_code);
        const dBenhCu = parseMetricNum(raw.benhCu || (raw.hscc && raw.hscc.benhCu) || (raw.tnt && raw.tnt.tnt_benhCu) || 0);
        const dBenhMoi = parseMetricNum(raw.benhMoi || (raw.hscc && raw.hscc.benhMoi) || (raw.tnt && raw.tnt.tnt_benhMoi) || 0);
        const dXuatVien = parseMetricNum(raw.xuatVien || (raw.hscc && raw.hscc.xuatVien) || (raw.tnt && raw.tnt.tnt_xuatVien) || 0);
        const dChuyenVien = r.transferCnt || parseMetricNum(raw.chuyenVien || (raw.hscc && raw.hscc.chuyenVien) || (raw.tnt && raw.tnt.tnt_chuyenVien) || 0);
        const dPhauThuat = r.surgeryCnt || parseMetricNum(raw.tongSoCaMo || raw.phauThuat || 0);
        const dBenhNang = r.criticalCnt || 0;
        const dTuVong = r.deathCnt || parseMetricNum(raw.tuVong || (raw.hscc && raw.hscc.tuVong) || 0);
        const dHienCon = parseMetricNum(raw.hienCon || raw.hienCo || (raw.hscc && raw.hscc.hienCon) || (raw.tnt && raw.tnt.tnt_hienCon) || 0);

        tongSoKham += dKham;
        benhCu += dBenhCu;
        benhMoi += dBenhMoi;
        xuatVien += dXuatVien;
        chuyenVien += dChuyenVien;
        phauThuat += dPhauThuat;
        benhNang += dBenhNang;
        tuVong += dTuVong;
        hienCon += dHienCon;

        deptBreakdown.push({
          departmentCode: r.department_code,
          departmentName: r.department_name || DEPARTMENT_NAMES[r.department_code] || r.department_code,
          tongSoKham: dKham,
          benhCu: dBenhCu,
          benhMoi: dBenhMoi,
          xuatVien: dXuatVien,
          chuyenVien: dChuyenVien,
          phauThuat: dPhauThuat,
          benhNang: dBenhNang,
          tuVong: dTuVong,
          hienCon: dHienCon,
          doctorName: r.doctor_name,
          nurseName: r.nurse_name
        });
      });

      return {
        submittedDeptsCount: deptReports.length,
        tongSoKham,
        benhCu,
        benhMoi,
        xuatVien,
        chuyenVien,
        phauThuat,
        benhNang,
        tuVong,
        hienCon,
        deptBreakdown
      };
    };

    const allRecordedDates = Array.from(reportsByDate.keys()).sort();
    
    const targetDateObj = new Date(targetDate + 'T00:00:00');
    const prevCalendarDateObj = new Date(targetDateObj);
    prevCalendarDateObj.setDate(prevCalendarDateObj.getDate() - 1);
    const prevCalendarDateStr = prevCalendarDateObj.toISOString().split('T')[0];

    let prevDateToCompare = prevCalendarDateStr;
    if (!reportsByDate.has(prevCalendarDateStr)) {
      const datesBefore = allRecordedDates.filter(d => d < targetDate);
      if (datesBefore.length > 0) {
        prevDateToCompare = datesBefore[datesBefore.length - 1];
      }
    }

    const currentDayAgg = aggregateDayData(reportsByDate.get(targetDate) || []);
    const prevDayAgg = aggregateDayData(reportsByDate.get(prevDateToCompare) || []);

    const comparison = {
      targetDate,
      previousDate: prevDateToCompare,
      tongSoKham: computeComparison(currentDayAgg.tongSoKham, prevDayAgg.tongSoKham),
      benhMoi: computeComparison(currentDayAgg.benhMoi, prevDayAgg.benhMoi),
      benhCu: computeComparison(currentDayAgg.benhCu, prevDayAgg.benhCu),
      xuatVien: computeComparison(currentDayAgg.xuatVien, prevDayAgg.xuatVien),
      chuyenVien: computeComparison(currentDayAgg.chuyenVien, prevDayAgg.chuyenVien),
      phauThuat: computeComparison(currentDayAgg.phauThuat, prevDayAgg.phauThuat),
      benhNang: computeComparison(currentDayAgg.benhNang, prevDayAgg.benhNang),
      tuVong: computeComparison(currentDayAgg.tuVong, prevDayAgg.tuVong),
      hienCon: computeComparison(currentDayAgg.hienCon, prevDayAgg.hienCon),
      submittedCount: currentDayAgg.submittedDeptsCount
    };

    let timeSeries = [];

    if (range === 'day') {
      const daysCount = 14;
      const seriesDates = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(targetDateObj);
        d.setDate(d.getDate() - i);
        seriesDates.push(d.toISOString().split('T')[0]);
      }

      timeSeries = seriesDates.map(dStr => {
        const agg = aggregateDayData(reportsByDate.get(dStr) || []);
        const dObj = new Date(dStr + 'T00:00:00');
        const dayLabel = dObj.getDate() + '/' + (dObj.getMonth() + 1);
        return {
          date: dStr,
          label: dayLabel,
          fullLabel: 'Ngày ' + dObj.getDate() + '/' + (dObj.getMonth() + 1) + '/' + dObj.getFullYear(),
          isCurrent: dStr === targetDate,
          ...agg
        };
      });
    } else if (range === 'month') {
      const year = targetDateObj.getFullYear();
      timeSeries = Array.from({ length: 12 }, (_, mIdx) => {
        const monthNum = mIdx + 1;
        const monthKey = year + '-' + String(monthNum).padStart(2, '0');
        const matchingReports = [];
        reports.forEach(r => {
          if (r.report_date && r.report_date.startsWith(monthKey)) {
            const rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data || '{}') : (r.report_data || {});
            matchingReports.push({
              ...r,
              rawData,
              transferCnt: transferCounts[r.id] || 0,
              surgeryCnt: surgeryCounts[r.id] || 0,
              deathCnt: deathCounts[r.id] || 0,
              criticalCnt: criticalCounts[r.id] || 0
            });
          }
        });

        const agg = aggregateDayData(matchingReports);
        return {
          date: monthKey,
          label: 'T' + monthNum,
          fullLabel: 'Tháng ' + monthNum + '/' + year,
          isCurrent: targetDate.startsWith(monthKey),
          ...agg
        };
      });
    } else if (range === 'year') {
      const currentYear = targetDateObj.getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
      timeSeries = years.map(y => {
        const yKey = String(y);
        const matchingReports = [];
        reports.forEach(r => {
          if (r.report_date && r.report_date.startsWith(yKey)) {
            const rawData = typeof r.report_data === 'string' ? JSON.parse(r.report_data || '{}') : (r.report_data || {});
            matchingReports.push({
              ...r,
              rawData,
              transferCnt: transferCounts[r.id] || 0,
              surgeryCnt: surgeryCounts[r.id] || 0,
              deathCnt: deathCounts[r.id] || 0,
              criticalCnt: criticalCounts[r.id] || 0
            });
          }
        });

        const agg = aggregateDayData(matchingReports);
        return {
          date: yKey,
          label: 'Năm ' + y,
          fullLabel: 'Năm ' + y,
          isCurrent: y === currentYear,
          ...agg
        };
      });
    }

    res.json({
      success: true,
      data: {
        range,
        targetDate,
        comparison,
        timeSeries,
        departmentBreakdown: currentDayAgg.deptBreakdown,
        allRecordedDates
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHospitalAnalytics };