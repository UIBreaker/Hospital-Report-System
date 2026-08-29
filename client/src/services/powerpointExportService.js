import pptxgen from 'pptxgenjs';

// Format Vietnamese date
const formatDateVi = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPatientAge = (val) => {
  if (!val) return '—';
  const s = String(val).trim();
  if (/^\d{4}$/.test(s)) return `SN: ${s}`;
  if (/^\d+$/.test(s)) return `${s} tuổi`;
  return s;
};

// Safe helper to convert image URL to base64 for PPTX embedding
const getSafeImageData = async (imgObj) => {
  if (!imgObj) return null;
  const url = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.data || '');
  if (!url) return null;
  if (url.startsWith('data:image')) {
    return { data: url };
  }
  try {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    const res = await fetch(fullUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (base64) return { data: base64 };
  } catch (e) {
    console.warn('PPTX Export: Cannot convert image to base64, using path fallback:', e);
  }
  return { path: url };
};

/**
 * Xuất toàn bộ danh sách slide giao ban ra file PowerPoint (.pptx)
 * @param {Array} slides - Mảng danh sách slide thực tế đang render
 * @param {string} date - Ngày báo cáo YYYY-MM-DD
 * @param {Array} reports - Danh sách dữ liệu báo cáo 12 khoa
 */
export const exportPresentationToPowerPoint = async (slides = [], date = '', reports = []) => {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('Danh sách slide trống, không thể xuất PowerPoint.');
  }

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = 'TTYT Khu Vực Bình Long';
  pptx.company = 'Sở Y Tế Thành Phố Đồng Nai - TTYT Khu Vực Bình Long';
  pptx.title = `Báo Cáo Giao Ban Bệnh Viện - ${date}`;

  const formattedDate = formatDateVi(date);

  // Thống kê nhanh toàn viện từ summary slide hoặc từ reports
  const titleSlide = slides.find(s => s.type === 'title');
  const summaryData = titleSlide?.summary || {};

  const totalKham = summaryData.tongSoKham ?? reports.reduce((sum, r) => sum + (Number(r.report_data?.tongSoKham || r.report_data?.soCaKham) || 0), 0);
  const totalTransfers = summaryData.chuyenVien ?? reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0);
  const totalSurgeries = summaryData.phauThuat ?? reports.reduce((sum, r) => sum + (r.surgeryCases?.length || 0), 0);
  const totalCriticals = summaryData.benhNang ?? reports.reduce((sum, r) => sum + (r.criticalCases?.length || 0), 0);
  const totalDeaths = summaryData.tuVong ?? reports.reduce((sum, r) => sum + (r.deathCases?.length || 0), 0);

  // Lặp qua từng slide trong danh sách
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // =========================================================================
    // 1. TRANG BÌA (TITLE SLIDE)
    // =========================================================================
    if (s.type === 'title') {
      // Dải trang trí trên cùng 4 màu y tế
      slide.addShape('rect', { x: 0, y: 0, w: 2.5, h: 0.08, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });
      slide.addShape('rect', { x: 2.5, y: 0, w: 2.5, h: 0.08, fill: { color: 'D97706' }, line: { color: 'D97706' } });
      slide.addShape('rect', { x: 5.0, y: 0, w: 2.5, h: 0.08, fill: { color: '0284C7' }, line: { color: '0284C7' } });
      slide.addShape('rect', { x: 7.5, y: 0, w: 2.5, h: 0.08, fill: { color: 'DC2626' }, line: { color: 'DC2626' } });

      // Tên cơ quan
      slide.addText('SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI — TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG', {
        x: 0.5, y: 0.55, w: 9.0, h: 0.4,
        fontSize: 13, bold: true, color: 'DC2626', align: 'center', fontFace: 'Arial'
      });

      // Tiêu đề chính
      slide.addText('BÁO CÁO GIAO BAN CHUYÊN MÔN', {
        x: 0.5, y: 1.0, w: 9.0, h: 0.75,
        fontSize: 28, bold: true, color: '0F2C59', align: 'center', fontFace: 'Arial'
      });

      // Ngày giao ban (Pill Box)
      slide.addShape('roundRect', {
        x: 2.5, y: 1.85, w: 5.0, h: 0.45,
        fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1.5 }, rectRadius: 0.2
      });
      slide.addText(`📅 ${formattedDate}`, {
        x: 2.5, y: 1.85, w: 5.0, h: 0.45,
        fontSize: 12.5, bold: true, color: '1E40AF', align: 'center', fontFace: 'Arial'
      });

      // 5 Khối KPI Cards Tóm Tắt Toàn Viện
      const cardY = 2.65;
      const cardW = 1.65;
      const cardH = 1.65;
      const cardGap = 0.2;
      const startX = 0.45;

      const kpis = [
        { label: 'TỔNG CA KHÁM', val: totalKham, color: '1E40AF', bg: 'EFF6FF', border: 'BFDBFE' },
        { label: 'CHUYỂN VIỆN', val: totalTransfers, color: 'D97706', bg: 'FFFBEB', border: 'FDE68A' },
        { label: 'PHẪU THUẬT', val: totalSurgeries, color: '0284C7', bg: 'F0F9FF', border: 'BAE6FD' },
        { label: 'BỆNH NẶNG', val: totalCriticals, color: '7C3AED', bg: 'FAF5FF', border: 'DDD6FE' },
        { label: 'TỬ VONG / NẶNG', val: totalDeaths, color: 'DC2626', bg: 'FEF2F2', border: 'FECACA' }
      ];

      kpis.forEach((kpi, kIdx) => {
        const curX = startX + kIdx * (cardW + cardGap);
        slide.addShape('roundRect', {
          x: curX, y: cardY, w: cardW, h: cardH,
          fill: { color: kpi.bg }, line: { color: kpi.border, width: 1.5 }, rectRadius: 0.15
        });
        slide.addText(String(kpi.val), {
          x: curX, y: cardY + 0.18, w: cardW, h: 0.65,
          fontSize: 26, bold: true, color: kpi.color, align: 'center', fontFace: 'Arial'
        });
        slide.addText(kpi.label, {
          x: curX, y: cardY + 0.85, w: cardW, h: 0.55,
          fontSize: 8.5, bold: true, color: kpi.color, align: 'center', fontFace: 'Arial'
        });
      });

      // Footer
      slide.addText(`Hệ thống Báo cáo Giao ban Bệnh viện Bình Long • Slide ${i + 1}/${slides.length}`, {
        x: 0.5, y: 5.1, w: 9.0, h: 0.3,
        fontSize: 9, italic: true, color: '94A3B8', align: 'center', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 2. SLIDE KHOA / PHÒNG (DEPARTMENT SLIDE)
    // =========================================================================
    else if (s.type === 'department') {
      const deptName = s.title || s.deptName || 'KHOA PHÒNG';
      const sections = s.sections || [];
      const rd = s.formData || {};

      // Top Header Banner
      slide.addShape('rect', {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: '0F2C59' }, line: { color: '0F2C59' }
      });
      slide.addText(`🏥 BÁO CÁO GIAO BAN: ${deptName.toUpperCase()}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Thông tin hành chính ca trực
      const adminText = `BS trực: ${s.doctorName || '—'}  |  ĐD trực: ${s.nurseName || '—'}  |  Phòng: ${s.room || '—'}  |  Khung giờ: ${s.shiftTime || '24/24'}`;
      slide.addShape('roundRect', {
        x: 0.5, y: 0.82, w: 9.0, h: 0.38,
        fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.08
      });
      slide.addText(adminText, {
        x: 0.6, y: 0.84, w: 8.8, h: 0.34,
        fontSize: 9.5, bold: true, color: '334155', align: 'left', fontFace: 'Arial'
      });

      // Xây dựng bảng số liệu chuyên môn
      const tableRows = [
        [
          { text: 'Chỉ Số Chuyên Môn Báo Cáo', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'left' } },
          { text: 'Số Lượng', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'center' } },
          { text: 'Đơn Vị', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'center' } },
          { text: 'Ghi Chú & Phân Loại', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'left' } }
        ]
      ];

      // Đọc các section số liệu
      if (sections.length > 0) {
        sections.forEach(sec => {
          if (Array.isArray(sec.rows)) {
            sec.rows.forEach(r => {
              tableRows.push([
                { text: r.label || 'Chỉ số', options: { fontSize: 9.5, color: '0F2C59', bold: true } },
                { text: String(r.value || 0), options: { fontSize: 9.5, bold: true, align: 'center', color: '1E40AF' } },
                { text: r.unit || 'Lượt', options: { fontSize: 9, align: 'center', color: '64748B' } },
                { text: r.note || '—', options: { fontSize: 9, color: '475569' } }
              ]);
            });
          }
        });
      } else {
        Object.keys(rd).forEach(k => {
          if (['ghiChu', 'dienBien', 'themGio', 'techniques', 'hscc', 'tnt', 'pk21', '_id'].includes(k)) return;
          const val = rd[k];
          if (typeof val !== 'object' && val !== undefined && val !== null && val !== '') {
            tableRows.push([
              { text: String(k).replace(/([A-Z])/g, ' $1').replace(/_/g, ' '), options: { fontSize: 9.5, color: '0F2C59' } },
              { text: String(val), options: { fontSize: 9.5, bold: true, align: 'center', color: '1E40AF' } },
              { text: 'Chỉ số', options: { fontSize: 9, align: 'center', color: '64748B' } },
              { text: '—', options: { fontSize: 9, color: '94A3B8' } }
            ]);
          }
        });
      }

      // Giới hạn hiển thị tối đa 8 dòng
      const displayRows = tableRows.length > 1 ? tableRows.slice(0, 9) : [
        tableRows[0],
        [{ text: 'Chưa có số liệu chuyên môn chi tiết', options: { fontSize: 9.5, italic: true } }, { text: '0', options: { align: 'center' } }, { text: '—', options: { align: 'center' } }, { text: '—', options: {} }]
      ];

      slide.addTable(displayRows, {
        x: 0.5, y: 1.3, w: 9.0,
        colW: [3.5, 1.2, 1.0, 3.3],
        rowH: 0.32,
        border: { type: 'solid', pt: 0.5, color: 'CBD5E1' }
      });

      // Box Ghi chú & Diễn biến phía dưới
      let noteContent = '';
      if (rd.themGio) noteContent += `Trực thêm giờ: ${rd.themGio}. `;
      if (rd.ghiChu) noteContent += `Ghi chú: ${rd.ghiChu}. `;
      if (rd.dienBien) noteContent += `Diễn biến: ${rd.dienBien}. `;

      if (noteContent) {
        slide.addShape('roundRect', {
          x: 0.5, y: 4.3, w: 9.0, h: 0.7,
          fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 1 }, rectRadius: 0.08
        });
        slide.addText(`📝 ${noteContent}`, {
          x: 0.6, y: 4.32, w: 8.8, h: 0.65,
          fontSize: 9.5, color: '92400E', fontFace: 'Arial'
        });
      }

      slide.addText(`Slide ${i + 1}/${slides.length} • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 3. SLIDE TỔNG HỢP CA LÂM SÀNG TẠI KHOA (CLINICAL OVERVIEW)
    // =========================================================================
    else if (s.type === 'clinical_overview') {
      const deptName = s.deptName || 'KHOA';
      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });
      slide.addText(`🩺 TỔNG HỢP CÁC CA BỆNH ĐẶC BIỆT • ${deptName.toUpperCase()}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      const overviewTable = [
        [
          { text: 'Loại Ca Bệnh', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10 } },
          { text: 'Số Lượng', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'center' } },
          { text: 'Danh Sách Bệnh Nhân & Chẩn Đoán', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10 } }
        ],
        [
          { text: '🚑 Ca Chuyển Viện', options: { bold: true, color: '92400E', fill: { color: 'FEF3C7' } } },
          { text: String(s.transferCases?.length || 0), options: { bold: true, align: 'center', color: '92400E', fill: { color: 'FEF3C7' } } },
          { text: s.transferCases?.map(tc => `${tc.patient_name || tc.patientName || 'BN'} (${tc.diagnosis || 'CĐ'})`).join('; ') || 'Không có', options: {} }
        ],
        [
          { text: '🔪 Ca Phẫu Thuật (Mổ)', options: { bold: true, color: '0369A1', fill: { color: 'F0F9FF' } } },
          { text: String(s.surgeryCases?.length || 0), options: { bold: true, align: 'center', color: '0369A1', fill: { color: 'F0F9FF' } } },
          { text: s.surgeryCases?.map(sc => `${sc.patient_name || sc.patientName || 'BN'} (${sc.preoperative_diagnosis || sc.preoperativeDiagnosis || 'CĐ'})`).join('; ') || 'Không có', options: {} }
        ],
        [
          { text: '⚠️ Bệnh Nặng Cần Theo Dõi', options: { bold: true, color: '6D28D9', fill: { color: 'FAF5FF' } } },
          { text: String(s.criticalCases?.length || 0), options: { bold: true, align: 'center', color: '6D28D9', fill: { color: 'FAF5FF' } } },
          { text: s.criticalCases?.map(cc => `${cc.patient_name || cc.patientName || 'BN'} (${cc.diagnosis || 'CĐ'})`).join('; ') || 'Không có', options: {} }
        ],
        [
          { text: '⚰️ Hồ Sơ Tử Vong', options: { bold: true, color: '991B1B', fill: { color: 'FEF2F2' } } },
          { text: String(s.deathCases?.length || 0), options: { bold: true, align: 'center', color: '991B1B', fill: { color: 'FEF2F2' } } },
          { text: s.deathCases?.map(dc => `${dc.patient_name || dc.patientName || 'BN'} (${dc.diagnosis || 'CĐ'})`).join('; ') || 'Không có', options: {} }
        ]
      ];

      slide.addTable(overviewTable, {
        x: 0.5, y: 1.1, w: 9.0,
        colW: [2.5, 1.2, 5.3],
        rowH: 0.65,
        border: { type: 'solid', pt: 0.5, color: 'CBD5E1' }
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Tổng hợp lâm sàng • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 4. SLIDE CA CHUYỂN VIỆN (TRANSFER)
    // =========================================================================
    else if (s.type === 'transfer' || s.type === 'transfer_clinical' || s.type === 'transfer_progress') {
      const tc = s.transferCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';
      const partLabel = s.type === 'transfer_clinical' ? 'PHẦN 2: LÂM SÀNG & CLS' :
                        s.type === 'transfer_progress' ? 'PHẦN 3: DIỄN BIẾN & HỘI CHẨN' : 'PHẦN 1: TIẾP NHẬN & XỬ TRÍ';

      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: 'D97706' }, line: { color: 'D97706' } });
      slide.addText(`🚑 ${deptName.toUpperCase()} • CA CHUYỂN VIỆN #${s.caseIndex}/${s.totalCases} (${partLabel})`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 14, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Patient Name Banner
      slide.addShape('roundRect', {
        x: 0.5, y: 0.85, w: 9.0, h: 0.52,
        fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 2 }, rectRadius: 0.1
      });
      slide.addText(`👤 BỆNH NHÂN: ${tc.patient_name || tc.patientName || '—'}  |  ${formatPatientAge(tc.age)}  |  📍 ${tc.address || '—'}  |  ⏰ Vào: ${tc.admission_time || tc.admissionTime || '—'}`, {
        x: 0.65, y: 0.88, w: 8.7, h: 0.45,
        fontSize: 11.5, bold: true, color: '92400E', fontFace: 'Arial'
      });

      if (s.type === 'transfer_progress') {
        slide.addShape('roundRect', { x: 0.5, y: 1.5, w: 9.0, h: 3.45, fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 1.5 }, rectRadius: 0.1 });
        slide.addText('📋 DIỄN BIẾN, HỘI CHẨN & QUÁ TRÌNH CHUYỂN TUYẾN:', { x: 0.7, y: 1.65, w: 8.6, h: 0.35, fontSize: 12, bold: true, color: '92400E', fontFace: 'Arial' });
        slide.addText(tc.progress_notes || tc.progressNotes || '(Không có ghi chú diễn biến bổ sung)', { x: 0.7, y: 2.1, w: 8.6, h: 2.6, fontSize: 11.5, color: '0F172A', fontFace: 'Arial', valign: 'top' });
      } else {
        const clinicalTable = [
          [
            { text: 'Hạng Mục Khám & Tiếp Nhận', options: { bold: true, color: '78350F', fill: { color: 'FEF3C7' }, fontSize: 10 } },
            { text: 'Nội Dung Chi Tiết Ca Bệnh', options: { bold: true, color: '78350F', fill: { color: 'FEF3C7' }, fontSize: 10 } }
          ],
          [{ text: '📋 Lý do vào viện', options: { fontSize: 9.5, bold: true } }, { text: tc.reason || '—', options: { fontSize: 9.5 } }],
          [{ text: '🏥 Chẩn đoán xác định', options: { fontSize: 10, bold: true, color: '92400E', fill: { color: 'FFFBEB' } } }, { text: tc.diagnosis || '—', options: { fontSize: 10, bold: true, color: '92400E', fill: { color: 'FFFBEB' } } }],
          [{ text: '🩺 Triệu chứng lâm sàng', options: { fontSize: 9.5, bold: true } }, { text: tc.clinical_symptoms || tc.clinicalSymptoms || '—', options: { fontSize: 9.5 } }],
          [{ text: '🔬 Cận lâm sàng / X-Quang', options: { fontSize: 9.5, bold: true } }, { text: tc.clinical_tests || tc.clinicalTests || '—', options: { fontSize: 9.5 } }],
          [{ text: '💊 Xử trí ban đầu', options: { fontSize: 9.5, bold: true } }, { text: tc.initial_treatment || tc.initialTreatment || '—', options: { fontSize: 9.5 } }]
        ];

        slide.addTable(clinicalTable, {
          x: 0.5, y: 1.5, w: 9.0,
          colW: [2.8, 6.2],
          rowH: 0.55,
          border: { type: 'solid', pt: 0.5, color: 'FDE68A' }
        });
      }

      slide.addText(`Slide ${i + 1}/${slides.length} • Ca Chuyển Viện • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 5. SLIDE CA PHẪU THUẬT (SURGERY)
    // =========================================================================
    else if (s.type === 'surgery' || s.type === 'surgery_clinical') {
      const sc = s.surgeryCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';
      const partLabel = s.type === 'surgery_clinical' ? 'PHẦN 2: LÂM SÀNG & CLS' : 'PHẦN 1: CHẨN ĐOÁN & LỆNH MỔ';

      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '0284C7' }, line: { color: '0284C7' } });
      slide.addText(`🔪 BÁO CÁO PHẪU THUẬT • ${deptName.toUpperCase()} • Ca #${s.caseIndex}/${s.totalCases} (${partLabel})`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 14.5, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column Card: Hành chính
      slide.addShape('roundRect', {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & TIẾP NHẬN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '0369A1', fontFace: 'Arial'
      });
      const leftText = `Họ và tên: ${sc.patient_name || sc.patientName || '—'}\n\nTuổi: ${formatPatientAge(sc.birth_year || sc.birthYear || sc.age)}\n\nĐịa chỉ: ${sc.address || '—'}\n\nGiờ vào viện: ${sc.admission_time || sc.admissionTime || '—'}\n\nLý do vào viện: ${sc.reason || '—'}`;
      slide.addText(leftText, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10.5, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column Card: Quá trình mổ
      slide.addShape('roundRect', {
        x: 5.15, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('📋 QUÁ TRÌNH MỔ & HẬU PHẪU', {
        x: 5.35, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '0369A1', fontFace: 'Arial'
      });
      const rightText = `CĐ trước mổ:\n${sc.preoperative_diagnosis || sc.preoperativeDiagnosis || '—'}\n\nLệnh mổ / Hội chẩn:\n${sc.consultation_order || sc.consultationOrder || '—'}\n\nCĐ sau mổ:\n${sc.postoperative_diagnosis || sc.postoperativeDiagnosis || '—'}\n\nTình trạng hậu phẫu:\n${sc.current_status || sc.currentStatus || '—'}`;
      slide.addText(rightText, {
        x: 5.35, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10.5, color: '0F172A', fontFace: 'Arial', valign: 'top'
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Báo cáo phẫu thuật • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 6. SLIDE CA TỬ VONG (DEATH)
    // =========================================================================
    else if (s.type === 'death' || s.type === 'death_clinical') {
      const dc = s.deathCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';
      const partLabel = s.type === 'death_clinical' ? 'PHẦN 2: LÂM SÀNG & TIỀN SỬ' : 'PHẦN 1: CHẨN ĐOÁN & CẤP CỨU';

      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: 'DC2626' }, line: { color: 'DC2626' } });
      slide.addText(`🚨 HỒ SƠ BỆNH NHÂN TỬ VONG • ${deptName.toUpperCase()} • Hồ Sơ #${s.caseIndex}/${s.totalCases} (${partLabel})`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 14, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column: Tình trạng lúc vào
      slide.addShape('roundRect', {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & VÀO VIỆN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '991B1B', fontFace: 'Arial'
      });
      const leftDeath = `Họ và tên: ${dc.patient_name || dc.patientName || '—'}\n\nTuổi: ${formatPatientAge(dc.age)}  |  Địa chỉ: ${dc.address || '—'}\n\nGiờ vào viện: ${dc.admission_time || dc.admissionTime || '—'}\n\nLý do vào viện: ${dc.reason || '—'}\n\nTình trạng lúc vào: ${dc.admission_status || dc.admissionStatus || '—'}\n\nTiền sử bệnh: ${dc.medical_history || dc.medicalHistory || '—'}`;
      slide.addText(leftDeath, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column: Chẩn đoán & Hồi sức cấp cứu
      slide.addShape('roundRect', {
        x: 5.15, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('⚡ CHẨN ĐOÁN & CẤP CỨU HỒI SINH (CPR)', {
        x: 5.35, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '9F1239', fontFace: 'Arial'
      });
      const rightDeath = `Cận lâm sàng / ECG:\n${dc.clinical_tests || dc.clinicalTests || '—'}\n\nChẩn đoán tử vong:\n${dc.diagnosis || '—'}\n\nXử trí hồi sinh cấp cứu (CPR):\n${dc.emergency_treatment || dc.emergencyTreatment || dc.initial_treatment || '—'}\n\nKết quả & Kết luận:\n${dc.final_outcome || dc.finalOutcome || '—'}`;
      slide.addText(rightDeath, {
        x: 5.35, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10, color: '0F172A', fontFace: 'Arial', valign: 'top'
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Hồ sơ tử vong • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 7. SLIDE CA BỆNH NẶNG THEO DÕI (CRITICAL)
    // =========================================================================
    else if (s.type === 'critical' || s.type === 'critical_clinical') {
      const cc = s.criticalCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';
      const partLabel = s.type === 'critical_clinical' ? 'PHẦN 2: LÂM SÀNG & CLS' : 'PHẦN 1: CHẨN ĐOÁN & DIỄN BIẾN';

      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '7C3AED' }, line: { color: '7C3AED' } });
      slide.addText(`⚡ BỆNH NHÂN NẶNG THEO DÕI • ${deptName.toUpperCase()} • Ca #${s.caseIndex}/${s.totalCases} (${partLabel})`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 14, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column: Hành chính & Tiền căn
      slide.addShape('roundRect', {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FAF5FF' }, line: { color: 'DDD6FE', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & VÀO VIỆN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '5B21B6', fontFace: 'Arial'
      });
      const leftCritical = `Họ và tên BN: ${cc.patient_name || cc.patientName || '—'}\n\nTuổi: ${formatPatientAge(cc.age)}\n\nĐịa chỉ: ${cc.address || '—'}\n\nGiờ vào viện: ${cc.admission_time || cc.admissionTime || '—'}\n\nTiền căn bệnh: ${cc.medical_history || cc.medicalHistory || 'Chưa ghi nhận tiền căn đặc biệt'}`;
      slide.addText(leftCritical, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10.5, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column: Chẩn đoán, Diễn biến & Điều trị
      slide.addShape('roundRect', {
        x: 5.15, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'F5F3FF' }, line: { color: 'DDD6FE', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('📋 CHẨN ĐOÁN, DIỄN BIẾN & ĐIỀU TRỊ', {
        x: 5.35, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '6D28D9', fontFace: 'Arial'
      });
      const rightCritical = `Chẩn đoán:\n${cc.diagnosis || '—'}\n\nTình trạng & Diễn biến:\n${cc.condition_summary || cc.conditionSummary || '—'}\n\nXử trí điều trị:\n${cc.treatment || '—'}\n\nHướng tiếp theo:\n${cc.notes || 'Bàn giao tua sau theo dõi tiếp'}`;
      slide.addText(rightCritical, {
        x: 5.35, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10, color: '0F172A', fontFace: 'Arial', valign: 'top'
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Bệnh nhân nặng • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 8. SLIDE HÌNH ẢNH MINH HỌA CA BỆNH (CASE IMAGE)
    // =========================================================================
    else if (s.type === 'case_image') {
      const typeLabel = s.caseType === 'surgery' ? 'CA PHẪU THUẬT' :
                        s.caseType === 'death' ? 'HỒ SƠ TỬ VONG' :
                        s.caseType === 'transfer' ? 'CA CHUYỂN VIỆN' : 'BỆNH NẶNG THEO DÕI';

      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: '2563EB' }, line: { color: '2563EB' } });

      const patName = s.caseItem?.patient_name || s.caseItem?.patientName || 'Bệnh nhân';
      slide.addText(`🖼️ ${s.deptName || 'KHOA'} • ${typeLabel} #${s.imgIndex || 1} • ẢNH BỆNH NHÂN ${patName.toUpperCase()}`, {
        x: 0.5, y: 0.15, w: 9.0, h: 0.4,
        fontSize: 12, bold: true, color: '0F2C59', fontFace: 'Arial'
      });

      // Embed Image Safely
      const imgPayload = await getSafeImageData(s.image);
      if (imgPayload) {
        try {
          slide.addImage({
            ...imgPayload,
            x: 0.5,
            y: 0.65,
            w: 9.0,
            h: 4.4,
            sizing: { type: 'contain' }
          });
        } catch (imgErr) {
          console.warn('Lỗi chèn ảnh vào slide PPTX:', imgErr);
          slide.addText('⚠️ Không thể tải hình ảnh này', { x: 0.5, y: 2.5, w: 9.0, h: 0.5, align: 'center', color: '94A3B8' });
        }
      }

      slide.addText(`Slide ${i + 1}/${slides.length} • Hình ảnh y khoa minh họa • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 9. SLIDE TỔNG HỢP TOÀN VIỆN (SUMMARY)
    // =========================================================================
    else if (s.type === 'summary') {
      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });
      slide.addText('📊 TỔNG HỢP HOẠT ĐỘNG CHUYÊN MÔN TOÀN VIỆN', {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      const summaryTable = [
        [
          { text: 'Chỉ Tiêu Toàn Viện', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 11 } },
          { text: 'Số Lượng', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 11, align: 'center' } },
          { text: 'Đơn Vị', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 11, align: 'center' } },
          { text: 'Ghi Chú Đánh Giá', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 11 } }
        ],
        [{ text: '🏥 Tổng số lượt khám & tiếp nhận', options: { bold: true } }, { text: String(totalKham), options: { bold: true, align: 'center', color: '1E40AF' } }, { text: 'Lượt', options: { align: 'center' } }, { text: 'Toàn viện trong ngày trực', options: {} }],
        [{ text: '🚑 Số ca bệnh chuyển viện', options: { bold: true } }, { text: String(totalTransfers), options: { bold: true, align: 'center', color: 'D97706' } }, { text: 'Ca', options: { align: 'center' } }, { text: 'Chuyển tuyến trên & chuyên khoa', options: {} }],
        [{ text: '🔪 Số ca phẫu thuật / mổ', options: { bold: true } }, { text: String(totalSurgeries), options: { bold: true, align: 'center', color: '0284C7' } }, { text: 'Ca', options: { align: 'center' } }, { text: 'Mổ cấp cứu & mổ phiên', options: {} }],
        [{ text: '⚡ Bệnh nhân nặng cần theo dõi', options: { bold: true } }, { text: String(totalCriticals), options: { bold: true, align: 'center', color: '7C3AED' } }, { text: 'Bệnh nhân', options: { align: 'center' } }, { text: 'Bàn giao ca sau tiếp tục theo dõi', options: {} }],
        [{ text: '⚰️ Hồ sơ tử vong / Nặng xin về', options: { bold: true } }, { text: String(totalDeaths), options: { bold: true, align: 'center', color: 'DC2626' } }, { text: 'Trường hợp', options: { align: 'center' } }, { text: 'Kiểm thảo tử vong theo quy định', options: {} }]
      ];

      slide.addTable(summaryTable, {
        x: 0.5, y: 1.1, w: 9.0,
        colW: [3.5, 1.3, 1.2, 3.0],
        rowH: 0.6,
        border: { type: 'solid', pt: 0.5, color: 'CBD5E1' }
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Báo cáo tổng hợp • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 10. SLIDE BẾ MẠC & CẢM ƠN (CLOSING)
    // =========================================================================
    else if (s.type === 'closing') {
      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });

      slide.addText('XIN TRÂN TRỌNG CẢM ƠN', {
        x: 0.5, y: 1.6, w: 9.0, h: 0.8,
        fontSize: 32, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
      });

      slide.addText('Kính chúc Quý Ban Giám Đốc và toàn thể Cán bộ, Nhân viên Y tế\nmột ngày làm việc hiệu quả và thành công!', {
        x: 0.5, y: 2.5, w: 9.0, h: 0.8,
        fontSize: 14, color: '93C5FD', align: 'center', fontFace: 'Arial'
      });

      slide.addText(`TTYT KHU VỰC BÌNH LONG • ${formattedDate}`, {
        x: 0.5, y: 4.8, w: 9.0, h: 0.4,
        fontSize: 10, bold: true, color: '60A5FA', align: 'center', fontFace: 'Arial'
      });
    }

    // Default fallback for any other custom slide
    else {
      slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });
      slide.addText(s.title || 'BÁO CÁO GIAO BAN', {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });
      slide.addText(`Nội dung slide giao ban • ${date}`, {
        x: 0.5, y: 2.0, w: 9.0, h: 1.0,
        fontSize: 14, color: '334155', align: 'center', fontFace: 'Arial'
      });
      slide.addText(`Slide ${i + 1}/${slides.length}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25, fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }
  }

  // Tải file PowerPoint
  const fileName = `Trinh_Chieu_Giao_Ban_${date || 'TTYT_Binh_Long'}.pptx`;
  await pptx.writeFile({ fileName });
};
