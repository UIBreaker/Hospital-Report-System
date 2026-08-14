import pptxgen from 'pptxgenjs';

// Format Vietnamese date
const formatDateVi = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * Xuất toàn bộ danh sách slide động ra file PowerPoint (.pptx)
 * @param {Array} slides - Mảng danh sách slide thực tế đang render
 * @param {string} date - Ngày báo cáo YYYY-MM-DD
 * @param {Array} reports - Danh sách dữ liệu báo cáo
 */
export const exportPresentationToPowerPoint = async (slides = [], date = '', reports = []) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = 'Nguyễn Vũ Nhật Nam - Phòng KHNV';
  pptx.company = 'TTYT Khu Vực Bình Long';
  pptx.title = `Báo Cáo Giao Ban Bệnh Viện - ${date}`;

  const formattedDate = formatDateVi(date);

  // Thống kê nhanh toàn viện
  const totalSubmitted = reports.length;
  const totalTransfers = reports.reduce((sum, r) => sum + (r.transferCases?.length || 0), 0);
  const totalSurgeries = reports.reduce((sum, r) => sum + (r.surgeryCases?.length || 0), 0);
  const totalDeaths = reports.reduce((sum, r) => sum + (r.deathCases?.length || 0), 0);

  // Lặp qua từng slide động trong mảng slides
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();

    // Thiết lập màu nền slide trắng tinh khiết
    slide.background = { color: 'FFFFFF' };

    // =========================================================================
    // 1. TRANG BÌA (TITLE SLIDE)
    // =========================================================================
    if (s.type === 'title') {
      // Dải trang trí trên cùng 4 màu y tế
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 2.5, h: 0.08, fill: { color: '0F2C59' }, line: { color: '0F2C59' } });
      slide.addShape(pptx.ShapeType.rect, { x: 2.5, y: 0, w: 2.5, h: 0.08, fill: { color: 'D97706' }, line: { color: 'D97706' } });
      slide.addShape(pptx.ShapeType.rect, { x: 5.0, y: 0, w: 2.5, h: 0.08, fill: { color: '0284C7' }, line: { color: '0284C7' } });
      slide.addShape(pptx.ShapeType.rect, { x: 7.5, y: 0, w: 2.5, h: 0.08, fill: { color: 'DC2626' }, line: { color: 'DC2626' } });

      // Tên cơ quan
      slide.addText('SỞ Y TẾ TỈNH BÌNH PHƯỚC — TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG', {
        x: 0.5, y: 0.6, w: 9.0, h: 0.4,
        fontSize: 13, bold: true, color: 'DC2626', align: 'center', fontFace: 'Arial'
      });

      // Tiêu đề chính
      slide.addText('BÁO CÁO GIAO BAN BỆNH VIỆN', {
        x: 0.5, y: 1.05, w: 9.0, h: 0.8,
        fontSize: 30, bold: true, color: '0F2C59', align: 'center', fontFace: 'Arial'
      });

      // Ngày giao ban (Pill Box)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 2.75, y: 1.95, w: 4.5, h: 0.45,
        fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1.5 }, rectRadius: 0.2
      });
      slide.addText(`📅 ${formattedDate}`, {
        x: 2.75, y: 1.95, w: 4.5, h: 0.45,
        fontSize: 13, bold: true, color: '1E40AF', align: 'center', fontFace: 'Arial'
      });

      // 4 Khối KPI Cards Tóm Tắt Toàn Viện
      const cardY = 2.8;
      const cardW = 2.05;
      const cardH = 1.6;
      const cardGap = 0.25;
      const startX = 0.5;

      // Card 1: Khoa đã nộp (Blue)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: startX, y: cardY, w: cardW, h: cardH,
        fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1.5 }, rectRadius: 0.15
      });
      slide.addText(String(totalSubmitted), {
        x: startX, y: cardY + 0.15, w: cardW, h: 0.7,
        fontSize: 28, bold: true, color: '1E40AF', align: 'center', fontFace: 'Arial'
      });
      slide.addText('KHOA PHÒNG ĐÃ NỘP', {
        x: startX, y: cardY + 0.85, w: cardW, h: 0.5,
        fontSize: 9.5, bold: true, color: '1E3A8A', align: 'center', fontFace: 'Arial'
      });

      // Card 2: Ca chuyển viện (Amber)
      const c2X = startX + cardW + cardGap;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: c2X, y: cardY, w: cardW, h: cardH,
        fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 1.5 }, rectRadius: 0.15
      });
      slide.addText(String(totalTransfers), {
        x: c2X, y: cardY + 0.15, w: cardW, h: 0.7,
        fontSize: 28, bold: true, color: 'D97706', align: 'center', fontFace: 'Arial'
      });
      slide.addText('CA CHUYỂN VIỆN', {
        x: c2X, y: cardY + 0.85, w: cardW, h: 0.5,
        fontSize: 9.5, bold: true, color: '92400E', align: 'center', fontFace: 'Arial'
      });

      // Card 3: Ca phẫu thuật (Ocean Blue)
      const c3X = c2X + cardW + cardGap;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: c3X, y: cardY, w: cardW, h: cardH,
        fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1.5 }, rectRadius: 0.15
      });
      slide.addText(String(totalSurgeries), {
        x: c3X, y: cardY + 0.15, w: cardW, h: 0.7,
        fontSize: 28, bold: true, color: '0284C7', align: 'center', fontFace: 'Arial'
      });
      slide.addText('CA PHẪU THUẬT (MỔ)', {
        x: c3X, y: cardY + 0.85, w: cardW, h: 0.5,
        fontSize: 9.5, bold: true, color: '0369A1', align: 'center', fontFace: 'Arial'
      });

      // Card 4: Hồ sơ tử vong (Red)
      const c4X = c3X + cardW + cardGap;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: c4X, y: cardY, w: cardW, h: cardH,
        fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1.5 }, rectRadius: 0.15
      });
      slide.addText(String(totalDeaths), {
        x: c4X, y: cardY + 0.15, w: cardW, h: 0.7,
        fontSize: 28, bold: true, color: 'DC2626', align: 'center', fontFace: 'Arial'
      });
      slide.addText('HỒ SƠ TỬ VONG', {
        x: c4X, y: cardY + 0.85, w: cardW, h: 0.5,
        fontSize: 9.5, bold: true, color: '991B1B', align: 'center', fontFace: 'Arial'
      });

      // Footer
      slide.addText(`Hệ thống Báo cáo Giao ban Điện tử • Slide ${i + 1}/${slides.length}`, {
        x: 0.5, y: 5.1, w: 9.0, h: 0.3,
        fontSize: 9, italic: true, color: '94A3B8', align: 'center', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 2. SLIDE KHOA / PHÒNG (DEPARTMENT SLIDE)
    // =========================================================================
    else if (s.type === 'department') {
      const report = s.report || {};
      const deptName = s.title || report.department_name || 'KHOA PHÒNG';
      const rd = report.report_data || {};

      // Top Header Banner
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: '0F2C59' }, line: { color: '0F2C59' }
      });
      slide.addText(`🏥 BÁO CÁO GIAO BAN: ${deptName}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 16, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Thông tin hành chính ca trực
      const adminText = `BS trực: ${report.doctor_name || '—'}  |  ĐD trực: ${report.nurse_name || '—'}  |  Phòng: ${report.room || '—'}  |  Khung giờ: ${report.shift_time || '—'}`;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.82, w: 9.0, h: 0.38,
        fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.08
      });
      slide.addText(adminText, {
        x: 0.6, y: 0.84, w: 8.8, h: 0.34,
        fontSize: 9.5, bold: true, color: '334155', align: 'left', fontFace: 'Arial'
      });

      // Xây dựng bảng số liệu chuyên môn
      const tableRows = [];
      tableRows.push([
        { text: 'Chỉ Số Chuyên Môn Báo Cáo', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'left' } },
        { text: 'Số Lượng', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'center' } },
        { text: 'Đơn Vị', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'center' } },
        { text: 'Ghi Chú & Phân Loại', options: { bold: true, color: 'FFFFFF', fill: { color: '1E40AF' }, fontSize: 10, align: 'left' } }
      ]);

      // Trích xuất các chỉ tiêu thực tế
      const code = report.department_code;
      if (code === 'cdha' && Array.isArray(rd.techniques) && rd.techniques.length > 0) {
        rd.techniques.forEach(t => {
          tableRows.push([
            { text: t.name || 'Kỹ thuật', options: { fontSize: 9.5, bold: true, color: '0F2C59' } },
            { text: String(t.tongSo || 0), options: { fontSize: 9.5, bold: true, align: 'center', color: '1E40AF' } },
            { text: 'Lượt', options: { fontSize: 9, align: 'center', color: '64748B' } },
            { text: `BHYT: ${t.baoHiem || 0} | Nội trú: ${t.noiTru || 0} | Ngoại trú: ${t.ngoaiTru || 0}`, options: { fontSize: 9, color: '475569' } }
          ]);
        });
      } else if (code === 'hscc_tnt') {
        const h = rd.hscc || {};
        const tnt = rd.tnt || {};
        const pk = rd.pk21 || {};
        if (h.tongSoKham !== undefined) tableRows.push([{ text: 'HSCC: Tổng khám cấp cứu', options: { fontSize: 9.5 } }, { text: String(h.tongSoKham), options: { fontSize: 9.5, bold: true, align: 'center' } }, { text: 'Lượt', options: { fontSize: 9, align: 'center' } }, { text: `Thở máy: ${h.thoMay || 0} | Oxy: ${h.thoOxy || 0}`, options: { fontSize: 9 } }]);
        if (h.hienCon !== undefined) tableRows.push([{ text: 'HSCC: Hiện còn điều trị', options: { fontSize: 9.5, bold: true, color: '1E40AF' } }, { text: String(h.hienCon), options: { fontSize: 9.5, bold: true, align: 'center', color: '1E40AF' } }, { text: 'Người', options: { fontSize: 9, align: 'center' } }, { text: `Bệnh cũ: ${h.benhCu || 0} | Bệnh mới: ${h.benhMoi || 0}`, options: { fontSize: 9 } }]);
        if (tnt.ctdk !== undefined) tableRows.push([{ text: 'TNT: Chạy thận chu kỳ', options: { fontSize: 9.5 } }, { text: String(tnt.ctdk), options: { fontSize: 9.5, bold: true, align: 'center' } }, { text: 'Lượt', options: { fontSize: 9, align: 'center' } }, { text: `Hiện còn TNT: ${tnt.hienCon || 0}`, options: { fontSize: 9 } }]);
        if (pk.tongSo !== undefined) tableRows.push([{ text: 'PK21: Khám cấp cứu ngoại viện', options: { fontSize: 9.5 } }, { text: String(pk.tongSo), options: { fontSize: 9.5, bold: true, align: 'center' } }, { text: 'Lượt', options: { fontSize: 9, align: 'center' } }, { text: `Tiểu phẫu: ${pk.tieuPhau || 0} | Bó bột: ${pk.boBot || 0}`, options: { fontSize: 9 } }]);
      } else {
        Object.keys(rd).forEach(k => {
          if (['ghiChu', 'dienBien', 'themGio', 'techniques', 'hscc', 'tnt', 'pk21'].includes(k)) return;
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

      // Giới hạn hiển thị tối đa 8 dòng đẹp mắt
      const displayRows = tableRows.slice(0, 8);

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
        slide.addShape(pptxgen.ShapeType.roundRect, {
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
    // 3. SLIDE CA CHUYỂN VIỆN (PART 1: TIẾP NHẬN & XỬ TRÍ)
    // =========================================================================
    else if (s.type === 'transfer') {
      const tc = s.transferCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';

      // Header Banner (Amber Theme)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: 'D97706' }, line: { color: 'D97706' }
      });
      slide.addText(`🚑 ${deptName.toUpperCase()} • CA CHUYỂN VIỆN #${s.caseIndex}/${s.totalCases} (PHẦN 1: TIẾP NHẬN)`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Patient Name Banner
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.85, w: 9.0, h: 0.55,
        fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 2 }, rectRadius: 0.1
      });
      slide.addText(`👤 BỆNH NHÂN: ${tc.patient_name || tc.patientName || '—'}  |  Tuổi: ${tc.age || '—'}  |  Địa chỉ: ${tc.address || '—'}`, {
        x: 0.65, y: 0.88, w: 8.7, h: 0.48,
        fontSize: 12.5, bold: true, color: '92400E', fontFace: 'Arial'
      });

      // Bảng thông tin chi tiết lâm sàng
      const clinicalTable = [
        [
          { text: 'Hạng Mục Tiếp Nhận & Lâm Sàng', options: { bold: true, color: '78350F', fill: { color: 'FEF3C7' }, fontSize: 10 } },
          { text: 'Nội Dung Chi Tiết', options: { bold: true, color: '78350F', fill: { color: 'FEF3C7' }, fontSize: 10 } }
        ],
        [{ text: '⏰ Thời gian vào viện', options: { fontSize: 9.5, bold: true } }, { text: tc.admission_time || tc.admissionTime || '—', options: { fontSize: 9.5 } }],
        [{ text: '📋 Lý do vào viện', options: { fontSize: 9.5, bold: true } }, { text: tc.reason || '—', options: { fontSize: 9.5 } }],
        [{ text: '🔬 Cận lâm sàng / X-Quang', options: { fontSize: 9.5, bold: true } }, { text: tc.clinical_tests || tc.clinicalTests || '—', options: { fontSize: 9.5 } }],
        [{ text: '🏥 Chẩn đoán xác định', options: { fontSize: 10, bold: true, color: '92400E', fill: { color: 'FFFBEB' } } }, { text: tc.diagnosis || '—', options: { fontSize: 10, bold: true, color: '92400E', fill: { color: 'FFFBEB' } } }],
        [{ text: '💊 Xử trí cấp cứu ban đầu', options: { fontSize: 9.5, bold: true } }, { text: tc.initial_treatment || tc.initialTreatment || '—', options: { fontSize: 9.5 } }]
      ];

      slide.addTable(clinicalTable, {
        x: 0.5, y: 1.55, w: 9.0,
        colW: [2.8, 6.2],
        rowH: 0.45,
        border: { type: 'solid', pt: 0.5, color: 'FDE68A' }
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Ca Chuyển Viện • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 4. SLIDE CA CHUYỂN VIỆN (PART 2: DIỄN BIẾN & HỘI CHẨN)
    // =========================================================================
    else if (s.type === 'transfer_progress') {
      const tc = s.transferCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';

      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: 'D97706' }, line: { color: 'D97706' }
      });
      slide.addText(`📝 ${deptName.toUpperCase()} • CA CHUYỂN VIỆN #${s.caseIndex}/${s.totalCases} (PHẦN 2: DIỄN BIẾN & HỘI CHẨN)`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 14.5, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Quick bar
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.85, w: 9.0, h: 0.45,
        fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1.5 }, rectRadius: 0.08
      });
      slide.addText(`👤 Bệnh nhân: ${tc.patient_name || tc.patientName || '—'}  |  Chẩn đoán: ${tc.diagnosis || '—'}`, {
        x: 0.65, y: 0.88, w: 8.7, h: 0.38,
        fontSize: 11, bold: true, color: '1E40AF', fontFace: 'Arial'
      });

      // Big Box Diễn biến & Tình trạng chuyển viện
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 1.45, w: 9.0, h: 3.5,
        fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 2 }, rectRadius: 0.12
      });
      slide.addText('📋 NỘI DUNG DIỄN BIẾN, HỘI CHẨN & TÌNH TRẠNG CHUYỂN VIỆN:', {
        x: 0.7, y: 1.6, w: 8.6, h: 0.35,
        fontSize: 12, bold: true, color: '92400E', fontFace: 'Arial'
      });
      slide.addText(tc.progress_notes || tc.progressNotes || '(Không có ghi chú diễn biến bổ sung)', {
        x: 0.7, y: 2.0, w: 8.6, h: 2.75,
        fontSize: 12, color: '0F172A', fontFace: 'Arial', valign: 'top'
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Diễn biến chuyển viện • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 5. SLIDE CA PHẪU THUẬT (MỔ)
    // =========================================================================
    else if (s.type === 'surgery') {
      const sc = s.surgeryCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';

      // Header Banner (Ocean Blue)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: '0284C7' }, line: { color: '0284C7' }
      });
      slide.addText(`🔪 BÁO CÁO PHẪU THUẬT (CA MỔ) • ${deptName.toUpperCase()} • Ca #${s.caseIndex}/${s.totalCases}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column Card: Hành chính
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & VÀO VIỆN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '0369A1', fontFace: 'Arial'
      });
      const leftText = `Họ và tên: ${sc.patient_name || sc.patientName || '—'}\n\nNăm sinh / Tuổi: ${sc.birth_year || sc.birthYear || sc.age || '—'}\n\nĐịa chỉ: ${sc.address || '—'}\n\nGiờ vào viện: ${sc.admission_time || sc.admissionTime || '—'}\n\nLý do vào viện: ${sc.reason || '—'}`;
      slide.addText(leftText, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10.5, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column Card: Quá trình mổ
      slide.addShape(pptx.ShapeType.roundRect, {
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
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 6. SLIDE CA TỬ VONG (RED ALERT)
    // =========================================================================
    else if (s.type === 'death') {
      const dc = s.deathCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';

      // Header Banner (Red Alert)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: 'DC2626' }, line: { color: 'DC2626' }
      });
      slide.addText(`🚨 BÁO CÁO BỆNH NHÂN TỬ VONG • ${deptName.toUpperCase()} • Hồ Sơ #${s.caseIndex}/${s.totalCases}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column: Tình trạng lúc vào
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & LÚC VÀO VIỆN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '991B1B', fontFace: 'Arial'
      });
      const leftDeath = `Họ và tên: ${dc.patient_name || dc.patientName || '—'}\n\nTuổi: ${dc.age || '—'}  |  Địa chỉ: ${dc.address || '—'}\n\nGiờ vào viện: ${dc.admission_time || dc.admissionTime || '—'}\n\nLý do vào viện: ${dc.reason || '—'}\n\nTình trạng lúc vào: ${dc.admission_status || dc.admissionStatus || '—'}\n\nTiền sử: ${dc.medical_history || dc.medicalHistory || '—'}`;
      slide.addText(leftDeath, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column: Chẩn đoán & Hồi sức cấp cứu
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.15, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('⚡ CHẨN ĐOÁN & CẤP CỨU HỒI SINH (CPR)', {
        x: 5.35, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '9F1239', fontFace: 'Arial'
      });
      const rightDeath = `Cận lâm sàng / ECG:\n${dc.clinical_tests || dc.clinicalTests || '—'}\n\nChẩn đoán tử vong:\n${dc.diagnosis || '—'}\n\nXử trí hồi sinh cấp cứu (CPR):\n${dc.emergency_treatment || dc.emergencyTreatment || dc.initial_treatment || '—'}\n\nKết quả & Hướng giải quyết:\n${dc.final_outcome || dc.finalOutcome || '—'}`;
      slide.addText(rightDeath, {
        x: 5.35, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10, color: '0F172A', fontFace: 'Arial', valign: 'top'
      });

      slide.addText(`Slide ${i + 1}/${slides.length} • Hồ sơ tử vong • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 7. SLIDE CA BỆNH NẶNG THEO DÕI (PURPLE THEME)
    // =========================================================================
    else if (s.type === 'critical') {
      const cc = s.criticalCase || {};
      const deptName = s.deptName || 'KHOA PHÒNG';

      // Header Banner (Purple Theme)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.7,
        fill: { color: '7C3AED' }, line: { color: '7C3AED' }
      });
      slide.addText(`⚡ BÁO CÁO BỆNH NHÂN NẶNG THEO DÕI • ${deptName.toUpperCase()} • Ca #${s.caseIndex}/${s.totalCases}`, {
        x: 0.5, y: 0.1, w: 9.0, h: 0.5,
        fontSize: 15, bold: true, color: 'FFFFFF', align: 'left', fontFace: 'Arial'
      });

      // Left Column: Hành chính & Tiền căn
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 0.9, w: 4.35, h: 4.0,
        fill: { color: 'FAF5FF' }, line: { color: 'DDD6FE', width: 1.5 }, rectRadius: 0.1
      });
      slide.addText('👤 HÀNH CHÍNH & VÀO VIỆN', {
        x: 0.7, y: 1.05, w: 3.95, h: 0.35,
        fontSize: 12, bold: true, color: '5B21B6', fontFace: 'Arial'
      });
      const leftCritical = `Họ và tên BN: ${cc.patient_name || cc.patientName || '—'}\n\nTuổi / Năm sinh: ${cc.age || '—'}\n\nĐịa chỉ: ${cc.address || '—'}\n\nThời gian vào viện (VV): ${cc.admission_time || cc.admissionTime || '—'}\n\nTiền căn bệnh: ${cc.medical_history || cc.medicalHistory || 'Chưa ghi nhận tiền căn đặc biệt'}`;
      slide.addText(leftCritical, {
        x: 0.7, y: 1.45, w: 3.95, h: 3.2,
        fontSize: 10.5, color: '1E293B', fontFace: 'Arial', valign: 'top'
      });

      // Right Column: Chẩn đoán, Diễn biến & Điều trị
      slide.addShape(pptx.ShapeType.roundRect, {
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

      slide.addText(`Slide ${i + 1}/${slides.length} • Bệnh nhân nặng theo dõi • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }

    // =========================================================================
    // 8. SLIDE HÌNH ẢNH MINH HỌA CA BỆNH (DEDICATED FULL SLIDE IMAGE)
    // =========================================================================
    if (s.type === 'case_image') {
      const themeHex = s.themeColor ? s.themeColor.replace('#', '') : '2563EB';
      const typeLabel = s.caseType === 'surgery' ? 'CA PHẪU THUẬT' :
                        s.caseType === 'death' ? 'HỒ SƠ TỬ VONG' :
                        s.caseType === 'transfer' ? 'CA CHUYỂN VIỆN' : 'BỆNH NẶNG THEO DÕI';

      // Top Border Bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.08,
        fill: { color: themeHex }, line: { color: themeHex }
      });

      // Top Header Title
      slide.addText(`🖼️ ${s.deptName} • ${typeLabel} #${s.caseIndex} • ẢNH ${s.imgIndex}/${s.totalImages}`, {
        x: 0.5, y: 0.18, w: 5.5, h: 0.35,
        fontSize: 11.5, bold: true, color: themeHex, fontFace: 'Arial'
      });

      // Patient Info Right
      const patInfo = `👤 ${s.caseItem.patient_name || s.caseItem.patientName || 'Bệnh nhân'}${s.caseItem.age ? ` (${s.caseItem.age}t)` : ''}${s.caseItem.diagnosis ? ` • CĐ: ${s.caseItem.diagnosis}` : ''}`;
      slide.addText(patInfo, {
        x: 4.5, y: 0.18, w: 5.0, h: 0.35,
        fontSize: 10.5, bold: true, color: '0F2C59', align: 'right', fontFace: 'Arial'
      });

      // Embed Image
      const imgObj = s.image;
      const imgData = typeof imgObj === 'string' ? imgObj : imgObj.url;
      if (imgData) {
        try {
          slide.addImage({
            data: imgData,
            x: 0.5,
            y: 0.65,
            w: 9.0,
            h: 4.4,
            sizing: { type: 'contain' }
          });
        } catch (imgErr) {
          console.warn('Lỗi chèn ảnh vào slide PPTX:', imgErr);
        }
      }

      slide.addText(`Slide ${i + 1}/${slides.length} • Hình ảnh y khoa minh họa • ${date}`, {
        x: 0.5, y: 5.15, w: 9.0, h: 0.25,
        fontSize: 8.5, italic: true, color: '94A3B8', align: 'right', fontFace: 'Arial'
      });
    }
  }

  // Xuất file PowerPoint
  const fileName = `Trinh_Chieu_Giao_Ban_${date}.pptx`;
  await pptx.writeFile({ fileName });
};
