const pool = require('../config/db');

// Default initial changelog for v2.0.0
const DEFAULT_V2_SECTIONS = [
  {
    iconName: 'FaMicrophoneAlt',
    iconColor: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: '🎙️ Giao Ban Tự Động Giọng Đọc AI & Đổi Slide Thông Minh',
    badge: 'Đột phá v2.0',
    badgeBg: '#D97706',
    items: [
      'Trợ lý AI tự động thuyết minh toàn bộ báo cáo và chi tiết từng ca bệnh bằng giọng đọc tiếng Việt truyền cảm, tự nhiên.',
      'Phát âm chuẩn xác 100% các thuật ngữ Y khoa chuyên ngành (ICD-10, CPR, CLS, SpO2, chỉ số sinh hiệu, chẩn đoán xác định...).',
      'Tự động chuyển tiếp slide khi đọc xong từng khoa phòng và từng ca bệnh.',
      'Phím tắt tiện lợi: Phím Space (Tạm dừng/Đọc tiếp), phím R (Đọc lại slide), phím mũi tên chuyển slide linh hoạt.',
      'Tự động ẩn thanh điều khiển sau 2 giây không rê chuột để giữ trọn không gian hội trường sạch sẽ và tập trung.'
    ]
  },
  {
    iconName: 'FaTv',
    iconColor: '#0284C7',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: '🖥️ Màn Hình Trình Chiếu Giao Ban 4K & Auto-Scale Font',
    badge: 'Đại tu giao diện',
    badgeBg: '#0284C7',
    items: [
      'Tái thiết kế toàn bộ 5 loại slide ca bệnh (Chuyển viện, Phẫu thuật, Tử vong, Bệnh nặng, Ảnh CLS) với thanh thông tin bệnh nhân nằm ngang và lưới chuyên môn to rõ.',
      'Công nghệ Auto-Scale Font tự động co giãn kích thước chữ vừa khít màn hình — không bao giờ bị tràn slide hay mất chữ trên màn hình LED lớn.',
      'Bổ sung Slide giới thiệu trang trọng mở đầu từng khoa và Slide Bế Mạc Tri Ân ở cuối phiên giao ban.',
      'Hiệu ứng số nhảy Slot Machine công nghệ cao ở Slide bìa mang phong cách hiện đại.'
    ]
  },
  {
    iconName: 'FaChartLine',
    iconColor: '#7C3AED',
    bg: '#FAF5FF',
    border: '#DDD6FE',
    title: '📊 Admin Dashboard Mượt Mà & Số Nhảy Shimmer "Bùng Nổ"',
    badge: 'Trải nghiệm đỉnh cao',
    badgeBg: '#7C3AED',
    items: [
      'Hiệu ứng số nhảy gia tốc (CountUp) sống động trên cả 6 phân hệ quản trị (Báo cáo, Biểu đồ phân tích, Lịch sử nộp, Biểu mẫu, Nhân sự, CSDL).',
      'Dải ánh sáng quét Shimmer Skeleton mượt mà khi tải hoặc lọc dữ liệu, loại bỏ cảm giác chờ đợi hay chớp giật.',
      'Nhận diện trực quan tức thì: Khoa Đã Nộp (Xanh ngọc rực rỡ) vs Khoa Chưa Nộp (Đỏ cam cảnh báo kèm viền 7px nổi bật).',
      'Sidebar đóng/mở chuẩn Physics cubic-bezier siêu êm ái, chuyển tab không độ trễ.'
    ]
  },
  {
    iconName: 'FaWpforms',
    iconColor: '#059669',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: '📝 Hệ Thống Biểu Mẫu Động (Dynamic Form Builder) Cho 12 Khoa',
    badge: 'Linh hoạt',
    badgeBg: '#059669',
    items: [
      'Quản trị viên tự do thêm/sửa/xóa các trường số liệu cho từng khoa phòng trực tiếp trên giao diện mà không cần can thiệp mã nguồn.',
      'Hỗ trợ đầy đủ các khối chuyên khoa: Hồi Sức Cấp Cứu, Thận Nhân Tạo, Phòng Khám 21, Ca Phẫu Thuật, Ca Chuyển Viện.',
      'Tích hợp công cụ tính toán tự động (Tracker Widget) và phím tắt "lorem + Enter" tạo dữ liệu mẫu kiểm thử tức thì.'
    ]
  },
  {
    iconName: 'FaFilePdf',
    iconColor: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    title: '📄 Phiếu Báo Cáo Giao Ban Chuẩn A4 Quốc Gia & Tải PDF',
    badge: 'Chuẩn Bộ Y Tế',
    badgeBg: '#DC2626',
    items: [
      'Tạo bản in chuẩn hóa mẫu báo cáo giao ban chuyên môn bệnh viện cho từng khoa và toàn viện theo quy định Bộ Y Tế.',
      'In ấn 1 chạm hoặc tải file PDF chất lượng cao, tự động phân trang và canh lề A4 hoàn hảo.'
    ]
  },
  {
    iconName: 'FaShieldAlt',
    iconColor: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    title: '🔒 CSDL Đám Mây Mã Hóa SSL 256-Bit & Trợ Lý AI 24/7',
    badge: 'An toàn bảo mật',
    badgeBg: '#4F46E5',
    items: [
      'Cơ sở dữ liệu đám mây Aiven MySQL mã hóa SSL 256-bit an toàn, bảo vệ dữ liệu bệnh nhân và ca trực 24/7.',
      'Trợ lý AI thông minh sẵn sàng hỗ trợ điền nhanh thông tin đăng nhập các khoa phòng và hướng dẫn sử dụng.'
    ]
  }
];

// Helper to ensure table exists
let isTableInitialized = false;
const ensureTableExists = async () => {
  if (isTableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_changelogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        release_date VARCHAR(50) NOT NULL,
        author VARCHAR(100) DEFAULT 'Nguyễn Vũ Nhật Nam (KHNV)',
        is_major TINYINT(1) DEFAULT 1,
        summary TEXT,
        sections_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if initial row exists
    const [rows] = await pool.query(`SELECT id FROM system_changelogs LIMIT 1`);
    if (rows.length === 0) {
      await pool.query(`
        INSERT INTO system_changelogs (version, title, release_date, author, is_major, summary, sections_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        '2.0.0',
        'NHẬT KÝ PHIÊN BẢN v2.0.0',
        'Tháng 08/2026',
        'Nguyễn Vũ Nhật Nam (Phòng KHNV)',
        1,
        'Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp! Toàn bộ hệ thống giao ban đã được nâng cấp toàn diện từ nền tảng v1.37.5 lên v2.0.0.',
        JSON.stringify(DEFAULT_V2_SECTIONS)
      ]);
    }
    isTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring system_changelogs table exists:', err);
  }
};

/**
 * Public Endpoint: GET /api/system/changelog/latest
 * Get latest active changelog for Login Page and Modal
 */
exports.getLatestChangelog = async (req, res) => {
  try {
    await ensureTableExists();
    const [rows] = await pool.query(`
      SELECT id, version, title, release_date, author, is_major, summary, sections_json, created_at
      FROM system_changelogs
      ORDER BY id DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          version: '2.0.0',
          title: 'NHẬT KÝ PHIÊN BẢN v2.0.0',
          release_date: 'Tháng 08/2026',
          author: 'Nguyễn Vũ Nhật Nam (Phòng KHNV)',
          is_major: 1,
          summary: 'Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp!',
          sections: DEFAULT_V2_SECTIONS
        }
      });
    }

    const row = rows[0];
    let sections = DEFAULT_V2_SECTIONS;
    try {
      sections = JSON.parse(row.sections_json);
    } catch (e) {
      console.warn('Failed to parse sections_json:', e);
    }

    return res.json({
      success: true,
      data: {
        id: row.id,
        version: row.version,
        title: row.title,
        release_date: row.release_date,
        author: row.author,
        is_major: Boolean(row.is_major),
        summary: row.summary,
        sections,
        created_at: row.created_at
      }
    });
  } catch (err) {
    console.error('getLatestChangelog error:', err);
    return res.json({
      success: true,
      data: {
        version: '2.0.0',
        title: 'NHẬT KÝ PHIÊN BẢN v2.0.0',
        release_date: 'Tháng 08/2026',
        author: 'Nguyễn Vũ Nhật Nam (Phòng KHNV)',
        is_major: true,
        summary: 'Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp!',
        sections: DEFAULT_V2_SECTIONS
      }
    });
  }
};

/**
 * Admin Endpoint: GET /api/admin/changelog/history
 */
exports.getChangelogHistory = async (req, res) => {
  try {
    await ensureTableExists();
    const [rows] = await pool.query(`
      SELECT id, version, title, release_date, author, is_major, summary, sections_json, created_at
      FROM system_changelogs
      ORDER BY id DESC
      LIMIT 20
    `);

    const formatted = rows.map(r => {
      let sections = [];
      try { sections = JSON.parse(r.sections_json); } catch (e) {}
      return {
        id: r.id,
        version: r.version,
        title: r.title,
        release_date: r.release_date,
        author: r.author,
        is_major: Boolean(r.is_major),
        summary: r.summary,
        sections,
        created_at: r.created_at
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('getChangelogHistory error:', err);
    return res.status(500).json({ success: false, error: 'Không thể lấy lịch sử phiên bản.' });
  }
};

/**
 * Admin Endpoint: POST /api/admin/changelog
 * Create / publish a new changelog
 */
exports.publishChangelog = async (req, res) => {
  try {
    await ensureTableExists();
    const { version, title, release_date, author, is_major, summary, sections } = req.body;

    if (!version || !title) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập số phiên bản và tiêu đề cập nhật.' });
    }

    const sectionsJson = JSON.stringify(Array.isArray(sections) ? sections : DEFAULT_V2_SECTIONS);
    const isMajorVal = is_major ? 1 : 0;
    const authorVal = author || 'Nguyễn Vũ Nhật Nam (Phòng KHNV)';
    const releaseDateVal = release_date || new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

    const [result] = await pool.query(`
      INSERT INTO system_changelogs (version, title, release_date, author, is_major, summary, sections_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      version.trim(),
      title.trim(),
      releaseDateVal,
      authorVal,
      isMajorVal,
      summary || '',
      sectionsJson
    ]);

    return res.json({
      success: true,
      message: `Đã công bố thành công phiên bản ${version}!`,
      data: {
        id: result.insertId,
        version,
        title,
        release_date: releaseDateVal,
        author: authorVal,
        is_major: Boolean(isMajorVal),
        summary,
        sections: Array.isArray(sections) ? sections : DEFAULT_V2_SECTIONS
      }
    });
  } catch (err) {
    console.error('publishChangelog error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi lưu phiên bản cập nhật.' });
  }
};

/**
 * Admin Endpoint: DELETE /api/admin/changelog/:id
 * Delete a specific changelog record
 */
exports.deleteChangelog = async (req, res) => {
  try {
    await ensureTableExists();
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM system_changelogs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bản ghi phiên bản cần xóa.' });
    }

    return res.json({
      success: true,
      message: 'Đã xóa bản ghi phiên bản khỏi CSDL thành công!'
    });
  } catch (err) {
    console.error('deleteChangelog error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi xóa bản ghi phiên bản.' });
  }
};
