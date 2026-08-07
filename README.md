# 🏥 Hệ Thống Báo Cáo Giao Ban Bệnh Viện Bình Long

Hệ thống ứng dụng web chuyên biệt phục vụ công tác báo cáo giao ban hằng ngày cho các khoa phòng và KHNV Bệnh Viện Bình Long. 

Ứng dụng cho phép các bác sĩ trực thuộc 10 khoa phòng chuyên môn nhập liệu biểu mẫu động (Dynamic Form), quản lý chi tiết các ca chuyển viện, đồng thời hỗ trợ KHNV theo dõi tiến độ nộp báo cáo và trình chiếu giao ban toàn màn hình trong các buổi họp.

---

## 🚀 Công Nghệ Sử Dụng

### Frontend
- **ReactJS 18** (Vite)
- **React Router DOM v6** (Điều hướng SPA)
- **Vanilla CSS3** (Custom Design System, Glassmorphism, Micro-animations)
- **React Icons** (FontAwesome & Medical Icons)

### Backend
- **Node.js** & **Express.js**
- **MySQL / MariaDB** (Cài đặt qua XAMPP)
- **MySQL2 / Promise** (Connection pooling với chuẩn `utf8mb4`)
- **JSON Web Token (JWT)** & **Bcrypt.js** (Xác thực & Bảo mật)

---

## ✨ Các Tính Năng Nổi Bật

1. **🔐 Đăng Nhập Phân Quyền:**
   - Phân quyền rõ ràng giữa **Tài khoản Khoa phòng** và **KHNV (Admin)**.
   - Quản lý phiên làm việc bằng JWT Token an toàn.

2. **📋 Biểu Mẫu Báo Cáo Chuyên Môn Động (Dynamic Form):**
   - **Quy trình 2 bước**: Nhập thông tin hành chính ca trực (Bác sĩ trực, phòng, giờ trực) → Tải đúng biểu mẫu chuyên môn riêng cho từng khoa.
   - Thiết kế riêng biệt cho 10 khoa: *Hồi sức cấp cứu - Thận nhân tạo, Chẩn đoán hình ảnh, Y học cổ truyền - PHCN, Ngoại tổng hợp, Chấn thương chỉnh hình, Nhi, Nhiễm, Gây mê Hồi sức, Sản, Xét nghiệm*.

3. **🚑 Quản Lý Ca Chuyển Viện Linh Hoạt:**
   - Cho phép thêm/xóa từng ca bệnh chuyển viện động bằng nút `+ Thêm Ca Chuyển Viện`.
   - Mỗi ca chuyển viện hỗ trợ điền đầy đủ các thông tin: *Họ tên, tuổi, địa chỉ, giờ vào viện, lý do vào, kết quả cận lâm sàng, chẩn đoán, xử trí ban đầu, diễn biến hội chẩn*.

4. **📊 Bảng Theo Dõi Ban Giám Đốc (Admin Dashboard):**
   - Theo dõi trạng thái nộp báo cáo theo ngày của tất cả 10 khoa phòng.
   - Thống kê trực quan: Tổng số khoa, Số khoa đã nộp, Số khoa chưa nộp.

5. **📽️ Chế Độ Trình Chiếu Giao Ban (Presentation Mode):**
   - Tự động tổng hợp dữ liệu các khoa và các ca chuyển viện thành từng Slide báo cáo chuyên nghiệp.
   - Hỗ trợ chế độ toàn màn hình (Fullscreen - phím `F`), chuyển Slide bằng bàn phím (Mũi tên / Spacebar) và tính năng in báo cáo.

---

## 📂 Cấu Trúc Thư Mục

```
hospital-report-system/
├── database/
│   ├── schema.sql                   # Khởi tạo CSDL & các bảng (utf8mb4)
│   └── seed.sql                     # Dữ liệu tài khoản mẫu
│
├── server/                          # Backend Node.js & Express
│   ├── .env                         # Biến môi trường
│   ├── .env.example                 # File mẫu cấu hình .env
│   ├── server.js                    # Entry point backend
│   └── src/
│       ├── app.js                   # Cấu hình Express app & Middleware
│       ├── config/db.js             # Kết nối MySQL Pool (utf8mb4)
│       ├── controllers/             # Xử lý logic business
│       │   ├── authController.js
│       │   ├── reportController.js
│       │   └── adminController.js
│       ├── middleware/
│       │   ├── auth.js              # Middleware xác thực JWT & Admin
│       │   └── errorHandler.js
│       └── routes/                  # Định tuyến API
│           ├── authRoutes.js
│           ├── reportRoutes.js
│           └── adminRoutes.js
│
└── client/                          # Frontend React (Vite)
    ├── index.html                   # HTML Entry Point
    ├── vite.config.js               # Cấu hình Vite & Proxy API
    └── src/
        ├── main.jsx                 # React Entry Point
        ├── App.jsx                  # Main Router
        ├── index.css                # Custom CSS Design System
        ├── contexts/
        │   └── AuthContext.jsx      # Quản lý trạng thái xác thực
        ├── services/                # Kết nối API Axios
        │   ├── api.js
        │   ├── authService.js
        │   └── reportService.js
        ├── components/
        │   ├── common/ProtectedRoute.jsx
        │   └── forms/
        │       ├── TransferCaseForm.jsx       # Component nhập ca chuyển viện
        │       └── departments/               # 10 Form chuyên môn các khoa
        └── pages/
            ├── LoginPage.jsx        # Trang đăng nhập
            ├── ReportPage.jsx       # Trang nhập báo cáo khoa
            ├── AdminDashboard.jsx    # Trang tổng hợp KHNV
            └── PresentationPage.jsx  # Trang trình chiếu giao ban
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 📋 Yêu Cầu Tiền Đề
- Node.js (v16.x trở lên) & npm
- XAMPP (chứa Apache & MySQL / MariaDB)

---

### Bước 1: Khởi Động Database (XAMPP MySQL)
1. Mở **XAMPP Control Panel** và nhấn **Start** tại mục **MySQL**.
2. Mở trình duyệt truy cập `http://localhost/phpmyadmin`.
3. Vào tab **SQL** và chạy lần lượt 2 file SQL trong thư mục `database/`:
   - Chạy nội dung file `database/schema.sql` để tạo CSDL `hospital_report`.
   - Chạy nội dung file `database/seed.sql` để khởi tạo 11 tài khoản mặc định.

> 💡 *Lưu ý: Database được thiết lập chuẩn `utf8mb4` hỗ trợ đầy đủ tiếng Việt có dấu.*

---

### Bước 2: Cấu Hình & Chạy Backend Server
1. Mở terminal và di chuyển vào thư mục `server`:
   ```bash
   cd server
   ```
2. Cài đặt các gói phụ thuộc (dependencies):
   ```bash
   npm install
   ```
3. Khởi tạo file `.env` (nếu chưa có, copy từ `.env.example`):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=hospital_report
   JWT_SECRET=hospital_report_secret_key_2026
   PORT=3001
   ```
4. Khởi chạy Backend Server:
   ```bash
   npm run dev
   ```
   Backend sẽ lắng nghe tại: `http://localhost:3001`

---

### Bước 3: Cấu Hình & Chạy Frontend (Vite React)
1. Mở một cửa sổ terminal mới và di chuyển vào thư mục `client`:
   ```bash
   cd client
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng Frontend:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: **`http://localhost:5173`**

---

## 🔑 Danh Sách Tài Khoản Đăng Nhập Mặc Định

Mật khẩu chung cho tất cả các tài khoản là: **`123`**

| STT | Khoa Phòng / Vai Trò | Tên Đăng Nhập | Mật Khẩu | Vai Trò |
|-----|----------------------|---------------|----------|---------|
| 1 | Hồi sức cấp cứu – Thận nhân tạo | `hscctnt.bvbl` | `123` | Khoa phòng |
| 2 | Chẩn đoán hình ảnh | `cdha.bvbl` | `123` | Khoa phòng |
| 3 | Y học cổ truyền – PHCN | `yhctphcn.bvbl` | `123` | Khoa phòng |
| 4 | Ngoại tổng hợp | `nth.bvbl` | `123` | Khoa phòng |
| 5 | Chấn thương chỉnh hình | `ctch.bvbl` | `123` | Khoa phòng |
| 6 | Nhi | `nhi.bvbl` | `123` | Khoa phòng |
| 7 | Nhiễm | `nhiem.bvbl` | `123` | Khoa phòng |
| 8 | Gây mê Hồi sức | `gmhs.bvbl` | `123` | Khoa phòng |
| 9 | Sản | `san.bvbl` | `123` | Khoa phòng |
| 10 | Xét nghiệm | `xn.bvbl` | `123` | Khoa phòng |
| **11** | **Ban Giám đốc** | **`admin`** | **`123`** | **Ban Giám đốc** |

---

## 🔌 Danh Sách API Endpoints

### 🔐 Auth (`/api/auth`)
- `POST /api/auth/login` - Đăng nhập tài khoản
- `GET /api/auth/me` - Lấy thông tin tài khoản đang đăng nhập (yêu cầu Token)

### 📋 Reports (`/api/reports`)
- `POST /api/reports` - Tạo mới hoặc cập nhật báo cáo khoa
- `GET /api/reports/:departmentCode/:date` - Lấy báo cáo của khoa theo ngày

### 📊 Admin (`/api/admin`)
- `GET /api/admin/departments/:date` - Lấy trạng thái nộp báo cáo của 10 khoa
- `GET /api/admin/presentation/:date` - Lấy toàn bộ dữ liệu báo cáo & ca chuyển viện phục vụ trình chiếu

---

## 📝 Giấy Phép (License)
Dự án được phát triển riêng cho **Bệnh Viện Bình Long**.
