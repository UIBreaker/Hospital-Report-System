const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

const rawStaffList = [
  { stt: 0, name: 'Nguyễn Hoàng Ân', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 1, name: 'Nguyễn Hữu Long', position: 'Bác Sỹ', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 2, name: 'Nguyễn Văn Phú', position: 'Bác Sỹ', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 3, name: 'Bùi Văn Tùng', position: 'Bác Sỹ', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 4, name: 'Hoàng Vương', position: 'Bác Sỹ', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 5, name: 'Lê Văn Đại', position: 'Bác Sỹ', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 6, name: 'Văn Công Quý', position: 'Bác Sỹ', dept: 'Khoa Truyền nhiễm' },
  { stt: 7, name: 'Nguyễn Thị Minh Ngọc', position: 'Bác Sỹ', dept: 'Khoa Truyền nhiễm' },
  { stt: 8, name: 'Hồ Thị Quyên', position: 'Bác Sỹ', dept: 'Khoa Truyền nhiễm' },
  { stt: 9, name: 'Nguyễn Văn Nguyên', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 10, name: 'Lương Đình Thắng', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 11, name: 'Phạm Hoàng Sơn', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 12, name: 'Nguyễn Hữu Tại', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 13, name: 'Nguyễn Thị Như Anh', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 14, name: 'Trần Ngọc Ẩn', position: 'Bác Sỹ', dept: 'Khoa Liên chuyên khoa' },
  { stt: 15, name: 'Đinh Thị Kim Châu', position: 'Bác Sỹ', dept: 'Khoa Nội tổng hợp' },
  { stt: 16, name: 'Võ Thị Bích Vân', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 17, name: 'Trần Quốc Anh', position: 'Bác Sỹ', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 18, name: 'Ngô Tuấn Kiệt', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 19, name: 'Phạm Thanh Tùng', position: 'Bác Sỹ', dept: 'Khoa Nhi' },
  { stt: 20, name: 'Nguyễn Thị Huyền Trang', position: 'Bác Sỹ', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 21, name: 'Nguyễn Thị Kiều Loan', position: 'Bác Sỹ', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 22, name: 'Võ Thị Hà', position: 'Bác Sỹ', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 23, name: 'Phạm Thị Khởi', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 24, name: 'Trần Thị Hường', position: 'Bác Sỹ', dept: 'Nội tổng hợp' },
  { stt: 25, name: 'Lâm Xuân Cường', position: 'Bác Sỹ', dept: 'Nội tổng hợp' },
  { stt: 26, name: 'Trần Tuấn Kiệt', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 27, name: 'Tạ Trọng Nghĩa', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 28, name: 'Lương Thị Châu', position: 'Bác Sỹ', dept: 'Khoa Nhi' },
  { stt: 29, name: 'Hồ Thanh Bình', position: 'Bác Sỹ', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 30, name: 'Lê Thị Thảo', position: 'Bác Sỹ', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 31, name: 'Đinh Thị Thủy', position: 'Bác Sỹ', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 32, name: 'Nguyễn Anh Tuấn', position: 'Bác Sỹ', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 33, name: 'Lâm Duy Phong', position: 'Bác Sỹ', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 34, name: 'Nguyễn Tuân', position: 'Bác Sỹ', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 35, name: 'Nguyễn Đăng Điệp', position: 'Bác Sỹ', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 36, name: 'Điểu Công', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 37, name: 'Cao Thị Minh Hạnh', position: 'Bác Sỹ', dept: 'Khoa Nhi' },
  { stt: 38, name: 'Nguyễn Lê Ngọc Huyền', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 39, name: 'Lê Văn Thiện', position: 'Bác Sỹ', dept: 'Khoa Nội tổng hợp' },
  { stt: 40, name: 'Nguyễn Mạnh Cường', position: 'Bác Sỹ', dept: 'Khoa Nội tổng hợp' },
  { stt: 41, name: 'Nguyễn Đồng Hảo', position: 'Bác Sỹ', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 42, name: 'Ngọc Thị Kim Ngân', position: 'Bác Sỹ', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 43, name: 'Ngô Thị Thanh Thảo', position: 'Bác Sỹ', dept: 'Khoa Nhi' },
  { stt: 44, name: 'Đào Thị Kim Ngân', position: 'Bác Sỹ', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 45, name: 'Trương Thị Ty', position: 'Bác Sỹ', dept: 'Khoa Nội tổng hợp' },
  { stt: 46, name: 'Mai Huyền Trang Thanh', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 47, name: 'Lý Thị An', position: 'Bác Sỹ', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 48, name: 'Thông Thị Thanh', position: 'Bác Sỹ', dept: 'Khoa Nhi' },
  { stt: 49, name: 'Đỗ Thạch Đức', position: 'Bác Sỹ', dept: 'Nội tổng hợp' },
  { stt: 50, name: 'Nguyễn Thị Tuyết Sang', position: 'Bác Sỹ', dept: 'Khoa Nội tổng hợp' },
  { stt: 51, name: 'Đàm Xuân Phước', position: 'Bác Sỹ', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 52, name: 'Đặng Thu Huyền', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 53, name: 'Trần Thị Thu Vân', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 54, name: 'Trần Văn Liệu', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 55, name: 'Nguyễn Thị Quỳnh Nhi', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 56, name: 'Dương Thị Thảo Sương', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 57, name: 'Lê Hoàng Trúc Linh', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 58, name: 'Hứa Thị Tâm Bình', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 59, name: 'Nguyễn Thùy Dương', position: 'Dược sĩ', dept: 'Khoa Dược - Trang thiết bị - Vật tư y tế' },
  { stt: 60, name: 'Lê Thị Phượng', position: 'Điều dưỡng', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 61, name: 'Nguyễn Thị Minh Phương', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 62, name: 'Phan Thị Thùy Dung', position: 'Điều dưỡng', dept: 'Khoa Khám bệnh' },
  { stt: 63, name: 'Nguyễn Thị Vân', position: 'Điều dưỡng', dept: 'Khoa Khám bệnh' },
  { stt: 64, name: 'Võ Thị Phượng', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 65, name: 'Lê Thị Loan', position: 'Điều dưỡng', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 66, name: 'Vũ Đình Phương', position: 'Điều dưỡng', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 67, name: 'Lê Thị Thúy Trinh', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 68, name: 'Dương Thị Yến', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 69, name: 'Roulter Njri', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 70, name: 'Hoàng Thị Mến', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 71, name: 'Lê Thị Như Hà', position: 'Điều dưỡng', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 72, name: 'Nguyễn Lương Cường', position: 'Điều dưỡng', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 73, name: 'Lê Thị Hiền', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 74, name: 'Lê Thị Liệu', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 75, name: 'Nguyễn Thị Lền', position: 'Điều dưỡng', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 76, name: 'Đinh Lê Lan Chi', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 77, name: 'Hoàng Thị Thanh Hải', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 78, name: 'Lê Thị Trang', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 79, name: 'Lê Thị Hoa', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 80, name: 'Lê Thị Thúy Ngoan', position: 'Điều dưỡng', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 81, name: 'Hoàng Thị Chung', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 82, name: 'Phạm Thị Hiền', position: 'Điều dưỡng', dept: 'Khoa Ngoại Tổng Hợp' },
  { stt: 83, name: 'Nguyễn Thị Mỹ Duyên', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 84, name: 'Ngô Thị Tuyết Trinh', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 85, name: 'Phạm Thị Hằng', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 86, name: 'Nguyễn Thị Bắc Giang', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 87, name: 'Đoàn Thị Ngọc Tú', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 88, name: 'Đoàn Thị Thanh Tuyền', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 89, name: 'Lê Thị Ninh', position: 'Điều dưỡng', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 90, name: 'Lê Bá Thắng', position: 'Điều dưỡng', dept: 'Khoa Ngoại Tổng Hợp' },
  { stt: 91, name: 'Phạm Thị Thảo Ngân', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 92, name: 'Nguyễn Thị An Vy', position: 'Điều dưỡng', dept: 'Khoa Khám bệnh' },
  { stt: 93, name: 'Nguyễn Thị Thanh', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 94, name: 'Nguyễn Thị Xuân Diệu', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 95, name: 'Nguyễn Thị Anh Thư', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 96, name: 'Trần Thị Liên', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 97, name: 'Tô Khắc Thuần', position: 'Điều dưỡng', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 98, name: 'Phạm Ngọc Mai', position: 'Điều dưỡng', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 99, name: 'Tô Thị Ngọc Hân', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 100, name: 'Nguyễn Trần Trúc Linh', position: 'Điều dưỡng', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 101, name: 'Hoàng Nữ Mộng Linh', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 102, name: 'Kiều Thị Tuyền', position: 'Điều dưỡng', dept: 'Khoa Phẫu thuật, gây mê hồi sức' },
  { stt: 103, name: 'Đỗ Đức Tường', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' },
  { stt: 104, name: 'Đoàn Thị Hằng', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 105, name: 'Thân Thị Trang', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 106, name: 'Lương Thúy Hiền', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 107, name: 'Nguyễn Ngọc Xinh', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 108, name: 'Võ Thị Thanh Hương', position: 'Điều dưỡng', dept: 'Khoa Truyền nhiễm' },
  { stt: 109, name: 'Nguyễn Thị Sáu', position: 'Điều dưỡng', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 110, name: 'Trần Thị Mỹ Loan', position: 'Điều dưỡng', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 111, name: 'Doãn Thị Hường', position: 'Điều dưỡng', dept: 'Khoa Nhi' },
  { stt: 112, name: 'Hoàng Thị Thùy Dương', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 113, name: 'Phạm Thị Bích Hồng', position: 'Điều dưỡng', dept: 'Khoa Nội tổng hợp' },
  { stt: 114, name: 'Đào Thị Hoàng Anh', position: 'Điều dưỡng', dept: 'Khoa Ngoại tổng hợp' },
  { stt: 115, name: 'Phan Văn Điển', position: 'Kỹ Thuật viên', dept: 'Khoa Chấn thương chỉnh hình' },
  { stt: 116, name: 'Phạm Cao Ngọc Minh Tâm', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 117, name: 'Bùi Thị Thúy Mỵ', position: 'Nữ Hộ sinh', dept: 'Khoa Khám bệnh' },
  { stt: 118, name: 'Lê Thị Kim Hằng', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 119, name: 'Phạm Quốc Quỳnh Như', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 120, name: 'Lưu Thị Anh Thư', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 121, name: 'Phạm Thị Ánh Việt', position: 'Nữ Hộ sinh', dept: 'Khoa Ngoại Tổng Hợp' },
  { stt: 122, name: 'Lê Thị Ngọc Hà', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 123, name: 'Phạm Vũ Thùy Trang', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 124, name: 'Dương Thị Hiếu', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 125, name: 'Võ Thị Hồng Hạnh', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 126, name: 'Lê Thị Bích Hằng', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 127, name: 'Đào Thị Thu Hương', position: 'Nữ Hộ sinh', dept: 'Khoa Xét nghiệm' },
  { stt: 128, name: 'Lê Thị Ngọc Hương', position: 'Nữ Hộ sinh', dept: 'Khoa Ngoại Tổng Hợp' },
  { stt: 129, name: 'Nguyễn Thị Phượng', position: 'Nữ Hộ sinh', dept: 'Khoa Khám bệnh' },
  { stt: 130, name: 'Nguyễn Thị Thu', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 131, name: 'Trần Thị Phiến', position: 'Nữ Hộ sinh', dept: 'Khoa Khám bệnh' },
  { stt: 132, name: 'Nguyễn Thị Kim Lan', position: 'Nữ Hộ sinh', dept: 'Khoa Khám bệnh' },
  { stt: 133, name: 'Phạm Thị Xuân Trang', position: 'Nữ Hộ sinh', dept: 'Khoa Chăm sóc sức khoẻ sinh sản' },
  { stt: 134, name: 'Lê Đình Mạnh', position: 'Y sỹ', dept: 'Khoa Khám bệnh' },
  { stt: 135, name: 'Nguyễn Phi Phong', position: 'Y sỹ', dept: 'Khoa Khám bệnh' },
  { stt: 136, name: 'Lê Thị Hương', position: 'Y sỹ', dept: 'Khoa Khám bệnh' },
  { stt: 137, name: 'Phạm Trung Hải', position: 'Y sỹ', dept: 'Khoa Chẩn đoán hình ảnh' },
  { stt: 138, name: 'Lê Thị Hảo', position: 'Điều dưỡng', dept: 'Khoa Hồi sức cấp cứu' }
];

const deptToCode = (deptStr) => {
  const s = deptStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s.includes('gay me') || s.includes('phau thuat') || s.includes('gmhs')) return 'gmhs';
  if (s.includes('hoi suc') || s.includes('hscc')) return 'hscc_tnt';
  if (s.includes('chan thuong') || s.includes('ctch')) return 'ctch';
  if (s.includes('nhiem')) return 'nhiem';
  if (s.includes('lien chuyen') || s.includes('lck')) return 'lck';
  if (s.includes('ngoai')) return 'ngoai_th';
  if (s.includes('noi')) return 'noi';
  if (s.includes('nhi')) return 'nhi';
  if (s.includes('sinh san') || s.includes('san')) return 'san';
  if (s.includes('chan doan') || s.includes('hinh anh') || s.includes('cdha')) return 'cdha';
  if (s.includes('xet nghiem') || s.includes('xn')) return 'xn';
  if (s.includes('duoc')) return 'duoc';
  if (s.includes('kham benh') || s.includes('kham')) return 'kham_benh';
  if (s.includes('co truyen') || s.includes('phcn')) return 'yhct_phcn';
  return 'noi';
};

const normalizePos = (posStr) => {
  const s = posStr.trim().toLowerCase();
  if (s.includes('bác') || s.includes('bac')) return 'Bác sĩ';
  if (s.includes('dược') || s.includes('duoc')) return 'Dược sĩ';
  if (s.includes('điều') || s.includes('dieu')) return 'Điều dưỡng';
  if (s.includes('hộ sinh') || s.includes('ho sinh')) return 'Hộ sinh';
  if (s.includes('kỹ thuật') || s.includes('ky thuat')) return 'Kỹ thuật viên';
  if (s.includes('y sỹ') || s.includes('y sĩ') || s.includes('y sy') || s.includes('y si')) return 'Y sĩ';
  return posStr.trim();
};

async function syncStaff() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  const [dbStaff] = await pool.execute('SELECT * FROM staff_members');
  console.log('Current DB staff count before sync:', dbStaff.length);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const item of rawStaffList) {
    const targetName = item.name.trim();
    const targetDept = deptToCode(item.dept);
    const targetPos = normalizePos(item.position);

    const found = dbStaff.find(s => s.full_name.trim().toLowerCase() === targetName.toLowerCase());

    if (found) {
      if (found.position !== targetPos || found.department !== targetDept) {
        await pool.execute(
          'UPDATE staff_members SET position = ?, department = ? WHERE id = ?',
          [targetPos, targetDept, found.id]
        );
        updatedCount++;
        console.log(`UPDATED ID ${found.id} (${targetName}): ${found.position} -> ${targetPos}, ${found.department} -> ${targetDept}`);
      }
    } else {
      const [res] = await pool.execute(
        'INSERT INTO staff_members (full_name, position, department, gender) VALUES (?, ?, ?, ?)',
        [targetName, targetPos, targetDept, targetPos === 'Hộ sinh' ? 'Nữ' : 'Nam']
      );
      insertedCount++;
      console.log(`INSERTED (${targetName}) as ${targetPos} in ${targetDept} with ID ${res.insertId}`);
    }
  }

  const [finalDbStaff] = await pool.execute('SELECT COUNT(*) as total FROM staff_members');
  console.log(`SYNC FINISHED: ${updatedCount} updated, ${insertedCount} inserted. Final total in DB: ${finalDbStaff[0].total}`);

  await pool.end();
}

syncStaff().catch(console.error);
