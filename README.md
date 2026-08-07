# 🏥 Hệ Thống Báo Cáo Giao Ban Bệnh Viện Bình Long

![Logo TTYT Bình Long](client/public/logo.png)

Hệ thống ứng dụng web chuyên biệt phục vụ công tác báo cáo giao ban hằng ngày cho các khoa phòng chuyên môn và **Kế Hoạch Nghiệp Vụ (KHNV)** thuộc **Trung Tâm Y Tế Khu Vực Bình Long**.

Ứng dụng cho phép các bác sĩ thuộc **11 khoa phòng chuyên môn** nhập liệu biểu mẫu chuyên biệt (Dynamic Form), quản lý chi tiết các ca chuyển viện, đồng thời hỗ trợ KHNV theo dõi tiến độ nộp báo cáo, chỉnh sửa/xóa báo cáo, và trình chiếu giao ban toàn màn hình chuyên nghiệp trong các buổi họp.

---

## 🎨 Nhận Diện Thương Hiệu & Giao Diện (Brand Identity)

Hệ thống được thiết kế hoàn toàn dựa trên bộ nhận diện màu sắc chuẩn từ **Logo Trung Tâm Y Tế Khu Vực Bình Long**:
- **Navy Blue (`#0F2C59`)**: Thể hiện sự chuyên nghiệp, uy nghiêm và tin cậy của ngành Y tế.
- **Medical Red (`#D32F2F`)**: Màu chữ thập đỏ tượng trưng cho tinh thần Cấp cứu và Y đức.
- **Botanical Green (`#2E7D32`)**: Màu 3 mầm cây đại diện cho sự sống, sức khỏe và phục hồi.
- **Favicon & Logo**: Được tích hợp đồng bộ trên thanh địa chỉ trình duyệt, thẻ tab và tiêu đề các trang.

---

## ✨ Các Tính Năng Nổi Bật

### 1. 🔐 Đăng Nhập Phân Quyền & Bảo Mật
- Phân quyền chặt chẽ giữa **Tài khoản Khoa phòng** và **KHNV (Admin)**.
- Quản lý phiên đăng nhập an toàn bằng **JSON Web Token (JWT)** & mã hóa mật khẩu **Bcrypt**.

### 2. 📋 Biểu Mẫu Báo Cáo Chuyên Môn Động (Dynamic Form)
- **Quy trình 2 bước tiện lợi**:
  1. *Bước 1: Nhập thông tin hành chính ca trực* (Ngày trực mặc định ngày hôm qua, Tên Bác sĩ trực chính - bắt buộc, Buồng trực, Ca trực).
  2. *Bước 2: Tải biểu mẫu số liệu chuyên môn riêng biệt cho từng khoa*.
- **Hỗ trợ 11 Khoa Chuyên Môn**:
  1. **Khoa Nội (`noi.bvbl`)**: Tự động tính toán số liệu **Hiện còn** bằng công thức `Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa`.
  2. **Hồi sức cấp cứu – Thận nhân tạo (`hscctnt.bvbl`)**.
  3. **Chẩn đoán hình ảnh (`cdha.bvbl`)**.
  4. **Y học cổ truyền – PHCN (`yhctphcn.bvbl`)**.
  5. **Ngoại tổng hợp (`nth.bvbl`)**.
  6. **Chấn thương chỉnh hình (`ctch.bvbl`)**.
  7. **Nhi (`nhi.bvbl`)**.
  8. **Nhiễm (`nhiem.bvbl`)**.
  9. **Gây mê Hồi sức (`gmhs.bvbl`)**.
  10. **Sản (`san.bvbl`)**.
  11. **Xét nghiệm (`xn.bvbl`)**.

### 3. 🚑 Quản Lý Ca Chuyển Viện Linh Hoạt
- Thiết kế dạng danh sách động: Click **`+ Thêm Ca Chuyển Viện`** để bổ sung ca mới hoặc biểu tượng 🗑️ để xóa ca thừa.
- Điền đầy đủ thông tin bệnh nhân: *Họ tên, tuổi, địa chỉ, giờ vào viện, lý do vào, kết quả cận lâm sàng/X-quang, chẩn đoán, xử trí ban đầu, diễn biến hội chẩn*.

### 4. 📊 Bảng Theo Dõi KHNV (Admin Dashboard)
- **Tổng quan tiến độ**: Thống kê số lượng *Đã nộp / Chưa nộp* theo ngày được chọn.
- **Xem chi tiết & Chỉnh sửa**: Xem chi tiết báo cáo từng khoa và hỗ trợ chỉnh sửa nhanh số liệu trực tiếp.
- **Xóa báo cáo**: Tích hợp tính năng xóa báo cáo khoa để reset trạng thái về **"Chưa nộp"** khi cần nhập lại từ đầu.

### 5. 📽️ Chế Độ Trình Chiếu Giao Ban (Presentation Mode)
- **Slide chuyên nghiệp**: Tự động tổng hợp dữ liệu giao ban thành từng Slide trực quan (Trang tiêu đề, Slide từng khoa, Slide chi tiết từng ca chuyển viện).
- **Native Fullscreen API**: Phim tắt **`F`** hoặc nút *Toàn Màn Hình* phóng to chuẩn chuẩn HTML5, tự động ẩn thanh điều hướng và tự động định kích thước chữ giao ban.
- **Thao tác nhanh**: Chuyển slide bằng phím mũi tên `←` / `→` hoặc phím `Spacebar`, hỗ trợ In báo cáo trực tiếp.

---

## 🔑 Danh Sách Tài Khoản Đăng Nhập Mặc Định

> 💡 **Mật khẩu chung cho tất cả các tài khoản là:** **`123`**

| STT | Khoa Phòng / Đơn Vị | Mã Khoa | Tên Đăng Nhập | Mật Khẩu | Quyền Hạn |
|:---:|---------------------|:-------:|:-------------:|:--------:|:---------:|
| 1 | Khoa Nội | `noi` | **`noi.bvbl`** | `123` | Khoa phòng |
| 2 | Hồi sức cấp cứu – Thận nhân tạo | `hscc_tnt` | **`hscctnt.bvbl`** | `123` | Khoa phòng |
| 3 | Chẩn đoán hình ảnh | `cdha` | **`cdha.bvbl`** | `123` | Khoa phòng |
| 4 | Y học cổ truyền – PHCN | `yhct_phcn` | **`yhctphcn.bvbl`** | `123` | Khoa phòng |
| 5 | Ngoại tổng hợp | `ngoai_th` | **`nth.bvbl`** | `123` | Khoa phòng |
| 6 | Chấn thương chỉnh hình | `ctch` | **`ctch.bvbl`** | `123` | Khoa phòng |
| 7 | Nhi | `nhi` | **`nhi.bvbl`** | `123` | Khoa phòng |
| 8 | Nhiễm | `nhiem` | **`nhiem.bvbl`** | `123` | Khoa phòng |
| 9 | Gây mê Hồi sức | `gmhs` | **`gmhs.bvbl`** | `123` | Khoa phòng |
| 10 | Sản | `san` | **`san.bvbl`** | `123` | Khoa phòng |
| 11 | Xét nghiệm | `xn` | **`xn.bvbl`** | `123` | Khoa phòng |
| **12** | **Kế Hoạch Nghiệp Vụ (KHNV)** | `admin` | **`admin`** | **`123`** | **Quản trị (Admin)** |

---

## 💻 Công Nghệ & Thư Viện Sử Dụng

### Frontend
- **React 18** (Vite Bundler)
- **React Router DOM v6** (Điều hướng SPA)
- **Vanilla CSS3** (Custom Design System, Variable Palette, Micro-animations)
- **React Icons** (FontAwesome & Medical Icons)
- **Axios** (Kết nối API backend)

### Backend
- **Node.js & Express.js**
- **MySQL2 / Promise** (Connection Pooling với chuẩn `utf8mb4`)
- **JSON Web Token (JWT)** (Xác thực người dùng)
- **Bcrypt.js** (Mã hóa mật khẩu)
- **Dotenv** (Quản lý biến môi trường)

### Cơ Sở Dữ Liệu
- **MySQL / MariaDB** (Thông qua XAMPP)
- Bảng CSDL mã hóa chuẩn `utf8mb4_unicode_ci` hiển thị chuẩn tiếng Việt có dấu.
- Khóa ngoại `ON DELETE CASCADE` đảm bảo khi xóa báo cáo khoa sẽ tự động làm sạch các ca chuyển viện liên quan.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
hospital-report-system/
├── database/
│   ├── schema.sql                   # Khởi tạo CSDL & cấu trúc bảng (utf8mb4)
│   └── seed.sql                     # Khởi tạo 12 tài khoản người dùng
│
├── server/                          # Backend Node.js Express API
│   ├── .env                         # File biến môi trường
│   ├── .env.example                 # File mẫu cấu hình biến môi trường
│   ├── server.js                    # File khởi chạy backend server
│   └── src/
│       ├── app.js                   # Cấu hình Express app & Middleware
│       ├── config/db.js             # Kết nối MySQL Pool (utf8mb4)
│       ├── controllers/             # Logic xử lý nghiệp vụ
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
    ├── index.html                   # Entry Point HTML & Favicon
    ├── vite.config.js               # Cấu hình Vite & API Proxy
    ├── public/
    │   ├── logo.png                 # Logo Trung Tâm Y Tế Khu Vực Bình Long
    │   └── favicon.png              # Favicon trang web
    └── src/
        ├── main.jsx                 # Entry Point React
        ├── App.jsx                  # Điều hướng Router
        ├── index.css                # Bộ thiết kế Design System & CSS Tokens
        ├── contexts/
        │   └── AuthContext.jsx      # Quản lý State Đăng nhập / Đăng xuất
        ├── services/
        │   ├── api.js               # Axios Instance
        │   ├── authService.js
        │   └── reportService.js
        ├── components/
        │   ├── common/ProtectedRoute.jsx
        │   └── forms/
        │       ├── TransferCaseForm.jsx       # Biểu mẫu nhập ca chuyển viện
        │       └── departments/               # 11 Biểu mẫu chuyên môn
        │           ├── NoiForm.jsx            # Form Khoa Nội (Có công thức tự động)
        │           ├── HoiSucCapCuuForm.jsx
        │           ├── ChuanDoanHinhAnhForm.jsx
        │           ├── YHocCoTruyenForm.jsx
        │           ├── NgoaiTongHopForm.jsx
        │           ├── ChanThuongChinhHinhForm.jsx
        │           ├── NhiForm.jsx
        │           ├── NhiemForm.jsx
        │           ├── GayMeHoiSucForm.jsx
        │           ├── SanForm.jsx
        │           ├── XetNghiemForm.jsx
        │           └── index.js
        └── pages/
            ├── LoginPage.jsx        # Trang đăng nhập
            ├── ReportPage.jsx       # Trang nhập báo cáo khoa
            ├── AdminDashboard.jsx    # Trang theo dõi KHNV
            └── PresentationPage.jsx  # Trang trình chiếu giao ban
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy Từ Đầu

### 📋 Yêu Cầu Hệ Thống
- **Node.js**: v16.x trở lên
- **Git**
- **XAMPP** (chứa Apache & MySQL/MariaDB)

---

### Bước 1: Khởi Động Cơ Sở Dữ Liệu (MySQL XAMPP)
1. Mở ứng dụng **XAMPP Control Panel** và nhấn **`Start`** tại mục **MySQL**.
2. Mở trình duyệt truy cập: `http://localhost/phpmyadmin`
3. Chọn tab **SQL** và khởi tạo CSDL bằng cách chạy nội dung 2 file trong thư mục `database/`:
   - Bước 3a: Chạy file `database/schema.sql` (Tạo database `hospital_report` và các bảng `users`, `reports`, `transfer_cases`).
   - Bước 3b: Chạy file `database/seed.sql` (Khởi tạo 12 tài khoản mặc định).

> 💡 *Mẹo: Nếu muốn chạy nhanh qua Command Line / PowerShell:*
> ```powershell
> & "C:\xampp\mysql\bin\mysql.exe" -u root < database/schema.sql
> & "C:\xampp\mysql\bin\mysql.exe" -u root < database/seed.sql
> ```

---

### Bước 2: Cài Đặt & Khởi Chạy Backend Server
1. Mở Terminal tại thư mục `server`:
   ```bash
   cd server
   ```
2. Cài đặt các thư viện Node.js:
   ```bash
   npm install
   ```
3. Khởi tạo file `.env` (Nếu chưa có, tạo file `.env` với nội dung sau):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=hospital_report
   JWT_SECRET=hospital_report_secret_key_2026
   PORT=3001
   ```
4. Chạy Backend Server ở chế độ Development:
   ```bash
   npm run dev
   ```
   > 📡 Server Node.js sẽ lắng nghe tại: `http://localhost:3001`

---

### Bước 3: Cài Đặt & Khởi Chạy Frontend Client
1. Mở thêm một cửa sổ Terminal mới tại thư mục `client`:
   ```bash
   cd client
   ```
2. Cài đặt các thư viện Frontend:
   ```bash
   npm install
   ```
3. Khởi chạy dev server Vite:
   ```bash
   npm run dev
   ```
4. Truy cập ứng dụng trên trình duyệt tại địa chỉ: **`http://localhost:5173`**

---

## 🔌 Danh Sách RESTful API Endpoints

### 🔐 Xác thực người dùng (`/api/auth`)
| Method | Endpoint | Đăng Nhập | Mô Tả |
|:------:|:---------|:---------:|:------|
| `POST` | `/api/auth/login` | Không | Đăng nhập tài khoản, nhận về JWT Token |
| `GET` | `/api/auth/me` | Có | Lấy thông tin tài khoản đang đăng nhập |

### 📋 Báo cáo giao ban (`/api/reports`)
| Method | Endpoint | Quyền Hạn | Mô Tả |
|:------:|:---------|:---------:|:------|
| `POST` | `/api/reports` | Khoa phòng | Tạo mới hoặc cập nhật báo cáo ca trực |
| `GET` | `/api/reports/:departmentCode/:date` | Đã xác thực | Lấy chi tiết báo cáo của khoa theo ngày |
| `DELETE`| `/api/reports/:departmentCode/:date` | Admin (KHNV)| Xóa báo cáo khoa và các ca chuyển viện |

### 📊 Quản trị KHNV (`/api/admin`)
| Method | Endpoint | Quyền Hạn | Mô Tả |
|:------:|:---------|:---------:|:------|
| `GET` | `/api/admin/departments/:date` | Admin (KHNV)| Lấy danh sách trạng thái nộp báo cáo của 11 khoa |
| `GET` | `/api/admin/presentation/:date` | Đã xác thực | Lấy toàn bộ dữ liệu báo cáo & ca chuyển viện phục vụ trình chiếu |

---

## ❓ Xử Lý Lỗi Thường Gặp (Troubleshooting)

### 1. Lỗi XAMPP MySQL không bấm được nút `Start` hoặc bị ngắt đột ngột
- **Nguyên nhân**: Cổng `3306` đã bị chiếm dụng bởi tiến trình `mysqld.exe` khởi chạy ngầm trước đó.
- **Khắc phục**: Mở PowerShell với quyền Admin và chạy lệnh ngắt tiến trình ngầm:
  ```powershell
  taskkill /F /IM mysqld.exe
  ```
  Sau đó mở lại XAMPP Control Panel và nhấn **`Start`** lại MySQL.

### 2. Tiếng Việt bị lỗi hiển thị dấu (`?` hoặc ký tự lạ)
- **Nguyên nhân**: CSDL hoặc kết nối chưa khớp mã hóa `utf8mb4`.
- **Khắc phục**: File `server/src/config/db.js` đã được thiết lập `charset: 'utf8mb4'`. Đảm bảo database và các bảng được tạo với `DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`.

### 3. Không đăng nhập được tài khoản
- Đảm bảo bạn đã nạp file `database/seed.sql` vào MySQL.
- Mật khẩu mặc định của tất cả các tài khoản là `123`.

---

## 📜 Giấy Phép & Bản Quyền (License)

Dự án được thiết kế và phát triển chuyên biệt cho **Trung Tâm Y Tế Khu Vực Bình Long**.
Mọi quyền sở hữu mã nguồn thuộc về đơn vị phát triển.
