import api from './api';

// Fallback constant in case of offline/network issues
export const DEFAULT_V2_CHANGELOG = {
  version: '2.0.0',
  title: 'NHẬT KÝ PHIÊN BẢN v2.0.0',
  release_date: 'Tháng 08/2026',
  author: 'Nguyễn Vũ Nhật Nam (Phòng KHNV)',
  is_major: true,
  summary: 'Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp! Toàn bộ hệ thống giao ban đã được nâng cấp toàn diện từ nền tảng v1.37.5 lên v2.0.0.',
  sections: [
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
  ]
};

export const changelogService = {
  // Public endpoint
  getLatestChangelog: async () => {
    try {
      const res = await api.get('/system/changelog/latest');
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return DEFAULT_V2_CHANGELOG;
    } catch (err) {
      console.warn('Lỗi tải nhật ký phiên bản từ API, sử dụng dữ liệu mặc định:', err);
      return DEFAULT_V2_CHANGELOG;
    }
  },

  // Admin endpoint
  getChangelogHistory: async () => {
    const res = await api.get('/admin/changelog/history');
    return res.data;
  },

  // Admin endpoint
  publishChangelog: async (data) => {
    const res = await api.post('/admin/changelog', data);
    return res.data;
  },

  // Admin endpoint
  deleteChangelog: async (id) => {
    const res = await api.delete(`/admin/changelog/${id}`);
    return res.data;
  }
};

export default changelogService;
