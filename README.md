# 🏥 Hệ Thống Báo Cáo Giao Ban Trực Tuyến — TTYT Khu Vực Bình Long

<div align="center">

![Trung Tâm Y Tế Khu Vực Bình Long](client/public/hospital.jpg)

<br/>

![Logo TTYT Bình Long](client/public/logo.png)

### **HỆ THỐNG QUẢN LÝ, TỔNG HỢP VÀ TRÌNH CHIẾU BÁO CÁO GIAO BAN Y TẾ CHUYÊN NGHIỆP**

*Ứng dụng Web toàn diện hỗ trợ 11 Khoa/Phòng chuyên môn & Phòng Kế Hoạch Nghiệp Vụ (KHNV) Trung Tâm Y Tế Khu Vực Bình Long.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://hospital-report-system.vercel.app/)
[![Author](https://img.shields.io/badge/Author-Nguyen%20Vu%20Nhat%20Nam%20(2004)-0F2C59?style=for-the-badge&logo=github)](https://github.com/UIBreaker/Hospital-Report-System)
[![Version](https://img.shields.io/badge/Version-1.0.0-10B981?style=for-the-badge)](https://hospital-report-system.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 1. 🌟 Hero / Giới thiệu

**Hệ Thống Báo Cáo Giao Ban Bệnh Viện** là giải pháp phần mềm chuyển đổi số y tế hiện đại, thay thế hoàn toàn phương thức báo cáo giao ban truyền thống bằng giấy tờ và file bảng tính rời rạc. 

Phần mềm được thiết kế chuẩn nhận diện thương hiệu y tế **TTYT Khu Vực Bình Long**, cung cấp quy trình nhập liệu nhanh chóng cho các bác sĩ trực thuộc **11 khoa phòng**, đồng thời trang bị **Trợ lý Y Tế AI**, **cơ chế tự động sinh dữ liệu mẫu (`lorem`)**, **quản lý ca bệnh chuyển viện đa tầng**, và **chế độ trình chiếu giao ban toàn màn hình (Presentation Mode)** với khả năng phóng to chữ phục vụ họp giao ban Ban Giám Đốc.

---

## 2. 🛡️ Badges

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x%20%2F%20Aiven-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secure%20Token-black?style=flat-square&logo=jsonwebtokens)
![Responsive](https://img.shields.io/badge/Mobile-Optimized-brightgreen?style=flat-square)
![Uptime](https://img.shields.io/badge/Vercel%20Serverless-100%25-success?style=flat-square)

</div>

---

## 3. 🖥️ Demo / Preview

| Trang Đăng Nhập & AI Assistant | Quản Trị KHNV (Admin Dashboard) |
| :---: | :---: |
| Trợ lý AI cấp tài khoản, điền tự động | Thống kê 11 khoa, chỉnh sửa & xóa báo cáo |
| **Trình Chiếu Giao Ban (Presentation)** | **Ca Bệnh Chuyển Viện Cấp Cứu** |
| Slide độ phân giải cao, hỗ trợ máy chiếu | Phân tích chi tiết chẩn đoán & diễn biến ca |

> 🌐 **Trải nghiệm trực tiếp:** [https://hospital-report-system.vercel.app/](https://hospital-report-system.vercel.app/)

---

## 4. 📖 Tổng quan dự án

* **Mục tiêu:** Tự động hóa quy trình tổng hợp số liệu giao ban hàng ngày từ 11 khoa/phòng, loại bỏ tình trạng sai sót số học và chậm trễ báo cáo.
* **Đối tượng sử dụng:** 
  * Bác sĩ trực & Điều dưỡng trưởng tại 11 khoa lâm sàng & cận lâm sàng.
  * Phòng Kế Hoạch Nghiệp Vụ (KHNV).
  * Ban Giám Đốc điều hành phiên họp giao ban buổi sáng.
* **Bộ nhận diện thương hiệu (Brand Identity):**
  * 🔵 **Navy Blue (`#0F2C59`)**: Uy tín, chuyên môn y khoa vững vàng.
  * 🔴 **Medical Red (`#D32F2F`)**: Tinh thần khẩn trương cấp cứu & chữ thập đỏ.
  * 🟢 **Botanical Green (`#2E7D32`)**: Mầm sống, phục hồi và sức khỏe người bệnh.

---

## 5. ⚡ Tính năng nổi bật

### 5.1. 🔐 Đăng nhập phân quyền thông minh
* Tách biệt tài khoản khoa phòng và tài khoản Quản trị (**`Khnv`**).
* Mã hóa mật khẩu một chiều bằng thuật toán **Bcrypt** chuẩn công nghiệp.
* Quản lý phiên làm việc thông qua **JSON Web Token (JWT)** với thời hạn 24 giờ.

### 5.2. 🤖 Trợ lý Y Tế AI (AI Assistant)
* Tích hợp chatbot thông minh ở góc dưới bên phải màn hình.
* Tự động nhận diện khoa phòng và cung cấp tài khoản đăng nhập tương ứng.
* Tích hợp nút bấm **"Điền Tự Động Vào Ô Đăng Nhập"** giúp bác sĩ đăng nhập chỉ bằng 1 cú nhấp.
* Cung cấp bộ câu hỏi hướng dẫn sử dụng, giới thiệu phần mềm và tác giả **Nguyễn Vũ Nhật Nam (2004)**.

### 5.3. 📋 Biểu mẫu nhập liệu động cho 11 Khoa Chuyên Môn
* **Quy trình 2 bước khoa học:**
  * *Bước 1:* Khai báo thông tin hành chính (Ngày trực mặc định hôm qua, Tên Bác sĩ trực chính, Phòng, Ca trực).
  * *Bước 2:* Nạp biểu mẫu số liệu chuyên biệt theo từng khoa.
* **Hỗ trợ 11 khoa phòng đặc thù:**
  1. **Khoa Nội**: Tự động tính toán công thức `Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa`.
  2. **Hồi sức cấp cứu – Thận nhân tạo (HSCC - TNT)**.
  3. **Chẩn đoán hình ảnh (CĐHA)**: X-Quang, CT-Scanner, Siêu âm, Điện tim.
  4. **Y học cổ truyền – Phục hồi chức năng (YHCT - PHCN)**.
  5. **Ngoại tổng hợp**: Đại phẫu, trung phẫu, tiểu phẫu, hậu phẫu.
  6. **Chấn thương chỉnh hình (CTCH)**.
  7. **Khoa Nhi**.
  8. **Khoa Nhiễm**.
  9. **Gây mê Hồi sức (GMHS)**: Phẫu thuật, gây tê, gây mê, gây mê nghỉnh.
  10. **Khoa Sản**: Sanh thường, sanh hút, mổ lấy thai, chờ sanh.
  11. **Khoa Xét nghiệm**: Sinh hóa, huyết học, đông máu, nước tiểu, miễn dịch.

### 5.4. 📝 Phím tắt sinh dữ liệu mẫu (`lorem + Enter`)
* Gõ chữ `lorem` và nhấn `Enter` trong bất kỳ ô nhập liệu nào để sinh đoạn văn bản mẫu (Dummy text).
* Hỗ trợ số lượng từ tùy chỉnh: `lorem10`, `lorem25` + `Enter`.

### 5.5. 🚑 Quản lý Ca Bệnh Chuyển Viện Đa Tầng
* Thêm/xóa không giới hạn số lượng ca chuyển viện trong ca trực.
* Khai báo chi tiết: Họ tên, tuổi, địa chỉ, giờ vào viện, lý do, cận lâm sàng, chẩn đoán, xử trí ban đầu và diễn biến lúc chuyển viện.

### 5.6. 📊 Bảng Theo Dõi Quản Trị (KHNV Dashboard)
* Xem trạng thái nộp báo cáo thời gian thực của toàn bộ 11 khoa.
* Xem chi tiết nội dung báo cáo, chỉnh sửa số liệu và chức năng xóa báo cáo (reset về Chưa nộp).
* Điều hướng trực tiếp đến phiên trình chiếu giao ban.

### 5.7. 📽️ Trình Chiếu Giao Ban Đỉnh Cao (Presentation Mode)
* Mở trình chiếu ngay trong cùng tab, không mở tab mới gây rối trình duyệt.
* Tự động dựng slide tổng hợp: Trang bìa, Slide từng khoa, Slide từng ca chuyển viện cấp cứu.
* **Hỗ trợ người mắt kém / Máy chiếu phòng họp:**
  * Cỡ chữ siêu lớn (`2.8rem` tiêu đề, `2.4rem` số liệu in đậm).
  * Công cụ điều chỉnh tỷ lệ chữ **`Phóng to (120% – 160%)`** và **`Thu nhỏ`** tích hợp ở thanh dưới.
  * Phím tắt điều khiển: Mũi tên `←` / `→`, phím `Space`, phím `F` (Toàn màn hình), phím `Esc` (Thoát).

### 5.8. 📱 Tối ưu hóa 100% Giao diện Di động (Mobile-First Responsive)
* Tự động co giãn 1 cột trên điện thoại thông minh và máy tính bảng.
* Khắc phục hoàn toàn lỗi tự zoom trên iOS Safari với font chuẩn `16px`.
* Hỗ trợ bảng dữ liệu cuộn ngang mượt mà.

---

## 6. 💻 Công nghệ sử dụng

| Tầng (Layer) | Công nghệ / Thư viện | Mục đích |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Hooks, Context API) | Xây dựng giao diện Single Page Application (SPA) |
| | Vite 5.x | Công cụ build và bundling siêu tốc |
| | React Router DOM v6 | Định tuyến trang và quản lý Route Guards |
| | Vanilla CSS3 (Design Tokens) | Hệ thống màu sắc y tế, Glassmorphism, Micro-animations |
| | React Icons (FontAwesome) | Hệ thống icon y tế và điều hướng |
| | Axios | Xử lý HTTP requests kết nối RESTful API |
| **Backend** | Node.js (v18+) & Express.js | Máy chủ RESTful API & Middleware xử lý nghiệp vụ |
| | JSON Web Token (JWT) | Tạo và xác thực mã phiên đăng nhập bảo mật |
| | Bcrypt.js | Mã hóa mật khẩu bảo mật |
| | Dotenv & CORS | Quản lý biến môi trường và chính sách bảo mật mạng |
| **Database** | MySQL 8.x / MariaDB (utf8mb4) | Lưu trữ cơ sở dữ liệu quan hệ, tiếng Việt có dấu |
| | Aiven Cloud MySQL | Đám mây CSDL trực tuyến phục vụ production |
| **Deployment** | Vercel Platform | Triển khai Serverless Functions và Frontend tĩnh |

---

## 7. 🏗️ Kiến trúc hệ thống

```mermaid
graph TD
    A[Bác sĩ / Khoa phòng] -->|Nhập báo cáo & Ca chuyển viện| B(Frontend React SPA)
    K[Phòng KHNV / Admin] -->|Quản trị & Trình chiếu slide| B
    
    B -->|RESTful API Calls + JWT Bearer| C[Backend Express API / Serverless]
    
    C -->|Auth Middleware| D{Kiểm tra JWT Token}
    D -->|Hợp lệ| E[Controllers: Report / Admin / Auth]
    D -->|Không hợp lệ| F[Trả mã lỗi 401 Unauthorized]
    
    E -->|Connection Pool with SSL| G[(MySQL Database: Local / Aiven Cloud)]
    
    G -->|CASCADE Truncation & UTF8MB4| E
    E -->|JSON Response| B
```

---

## 8. 📂 Cấu trúc thư mục

```
hospital-report-system/
├── api/                             # Serverless Entry point cho Vercel
│   └── index.js
├── database/
│   ├── schema.sql                   # Khởi tạo bảng CSDL & Khóa ngoại CASCADE
│   └── seed.sql                     # Khởi tạo 11 tài khoản khoa & 1 tài khoản KHNV
├── server/                          # Backend Node.js Express API
│   ├── .env.example                 # Mẫu cấu hình môi trường
│   ├── server.js                    # Local Dev Server Listener
│   └── src/
│       ├── app.js                   # Cấu hình Express App, Routes & Health check
│       ├── config/db.js             # Kết nối MySQL Pool (Hỗ trợ SSL Aiven & Local)
│       ├── controllers/
│       │   ├── authController.js    # Xác thực, cấp token JWT, đổi mật khẩu Khnv
│       │   ├── reportController.js  # CRUD Báo cáo khoa & ca chuyển viện
│       │   └── adminController.js   # Tổng hợp dữ liệu & Trình chiếu giao ban
│       ├── middleware/
│       │   ├── auth.js              # Middleware xác thực JWT & Role Admin
│       │   └── errorHandler.js      # Xử lý lỗi toàn cục
│       └── routes/
│           ├── authRoutes.js        # /api/auth
│           ├── reportRoutes.js      # /api/reports
│           └── adminRoutes.js       # /api/admin
├── client/                          # Frontend React + Vite
│   ├── index.html                   # HTML Entry & Favicon y tế
│   ├── vite.config.js               # Cấu hình Proxy & Build
│   ├── public/
│   │   ├── logo.png                 # Logo TTYT Khu Vực Bình Long
│   │   └── favicon.png
│   └── src/
│       ├── main.jsx                 # Entry React & Khởi tạo phím tắt lorem
│       ├── App.jsx                  # React Router & AuthProvider
│       ├── index.css                # Bộ CSS Design System & Mobile Media Queries
│       ├── contexts/
│       │   └── AuthContext.jsx      # Quản lý State Đăng nhập & Quyền hạn
│       ├── services/
│       │   ├── api.js               # Axios instance cấu hình baseURL /api
│       │   ├── authService.js
│       │   └── reportService.js
│       ├── utils/
│       │   └── loremHelper.js       # Bộ sinh văn bản giả tự động trên phím Enter
│       ├── components/
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── AIAssistant.jsx  # Widget Trợ lý Y Tế AI góc phải
│       │   └── forms/
│       │       ├── TransferCaseForm.jsx
│       │       └── departments/     # 11 Biểu mẫu khoa phòng chuyên sâu
│       │           ├── NoiForm.jsx
│       │           ├── HoiSucCapCuuForm.jsx
│       │           ├── ChuanDoanHinhAnhForm.jsx
│       │           ├── YHocCoTruyenForm.jsx
│       │           ├── NgoaiTongHopForm.jsx
│       │           ├── ChanThuongChinhHinhForm.jsx
│       │           ├── NhiForm.jsx
│       │           ├── NhiemForm.jsx
│       │           ├── GayMeHoiSucForm.jsx
│       │           ├── SanForm.jsx
│       │           └── XetNghiemForm.jsx
│       └── pages/
│           ├── LoginPage.jsx        # Đăng nhập + Badge Version 1.0
│           ├── ReportPage.jsx       # Nhập báo cáo ca trực
│           ├── AdminDashboard.jsx   # Quản trị & Điều phối KHNV
│           └── PresentationPage.jsx # Trình chiếu giao ban toàn màn hình
├── vercel.json                      # Cấu hình Serverless Routing & Rewrite Vercel
└── README.md                        # Tài liệu hướng dẫn dự án chi tiết
```

---

## 9. ⚙️ Yêu cầu hệ thống

* **Node.js**: Phiên bản `v18.x` hoặc `v20.x` LTS trở lên.
* **NPM**: Phiên bản `v9.x` trở lên.
* **Hệ quản trị CSDL**: MySQL `8.0+` hoặc MariaDB `10.4+` (qua XAMPP hoặc Cloud Aiven/TiDB).
* **Trình duyệt**: Google Chrome, Microsoft Edge, Mozilla Firefox, Safari (phiên bản hiện đại).

---

## 10. 📥 Cài đặt

### Bước 1: Clone mã nguồn từ GitHub
```bash
git clone https://github.com/UIBreaker/Hospital-Report-System.git
cd Hospital-Report-System
```

### Bước 2: Cài đặt Dependencies cho Backend
```bash
cd server
npm install
cd ..
```

### Bước 3: Cài đặt Dependencies cho Frontend
```bash
cd client
npm install
cd ..
```

---

## 11. 🔧 Cấu hình Environment

Tạo file `.env` tại thư mục `server/` với nội dung:

```env
# Port chạy Backend Server nội bộ
PORT=3001

# Cấu hình CSDL MySQL cục bộ (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_report

# (Tùy chọn) Cấu hình Cloud Database URL
# DATABASE_URL=mysql://user:password@host:port/database?ssl-mode=REQUIRED

# Mã bí mật ký JWT Token
JWT_SECRET=hospital_report_jwt_secret_key_2026
```

---

## 12. 🚀 Chạy dự án (Local Development)

### 12.1. Khởi tạo Cơ Sở Dữ Liệu
1. Mở **XAMPP Control Panel** và bật dịch vụ **MySQL**.
2. Mở Command Prompt hoặc Terminal chạy lệnh:
```bash
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

### 12.2. Khởi chạy Backend Server
```bash
cd server
npm run dev
```
> 📡 *Server hoạt động tại:* `http://localhost:3001`

### 12.3. Khởi chạy Frontend Client
Mở một cửa sổ Terminal mới:
```bash
cd client
npm run dev
```
> 💻 *Giao diện người dùng tại:* `http://localhost:5173`

---

## 13. 🔑 Danh sách tài khoản Demo

| STT | Khoa Phòng / Đơn Vị | Tên Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :---: | :--- | :---: | :---: | :---: |
| 1 | **Khoa Nội** | **`noi.bvbl`** | `123` | Bác sĩ trực |
| 2 | **Hồi sức cấp cứu – Thận nhân tạo** | **`hscctnt.bvbl`** | `123` | Bác sĩ trực |
| 3 | **Chẩn đoán hình ảnh** | **`cdha.bvbl`** | `123` | Bác sĩ trực |
| 4 | **Y học cổ truyền – PHCN** | **`yhctphcn.bvbl`** | `123` | Bác sĩ trực |
| 5 | **Ngoại tổng hợp** | **`nth.bvbl`** | `123` | Bác sĩ trực |
| 6 | **Chấn thương chỉnh hình** | **`ctch.bvbl`** | `123` | Bác sĩ trực |
| 7 | **Khoa Nhi** | **`nhi.bvbl`** | `123` | Bác sĩ trực |
| 8 | **Khoa Nhiễm** | **`nhiem.bvbl`** | `123` | Bác sĩ trực |
| 9 | **Gây mê Hồi sức** | **`gmhs.bvbl`** | `123` | Bác sĩ trực |
| 10 | **Khoa Sản** | **`san.bvbl`** | `123` | Bác sĩ trực |
| 11 | **Khoa Xét nghiệm** | **`xn.bvbl`** | `123` | Bác sĩ trực |
| 👑 | **Phòng Kế Hoạch Nghiệp Vụ (KHNV)** | **`Khnv`** | **`Khnv@2026`** | **Quản trị viên (Admin)** |

---

## 14. 📡 API Documentation

### 14.1. Xác thực (`/api/auth`)
* `POST /api/auth/login`: Nhận `username`, `password`, trả về JWT Token và thông tin phân quyền.
* `GET /api/auth/me`: Kiểm tra tính hợp lệ của Token hiện tại.

### 14.2. Báo cáo giao ban (`/api/reports`)
* `POST /api/reports`: Lưu hoặc cập nhật báo cáo ca trực và danh sách ca chuyển viện.
* `GET /api/reports/:departmentCode/:date`: Lấy chi tiết báo cáo của khoa theo ngày.
* `DELETE /api/reports/:departmentCode/:date`: (Admin) Xóa báo cáo khoa và các ca chuyển viện liên quan.

### 14.3. Quản trị KHNV (`/api/admin`)
* `GET /api/admin/departments/:date`: Lấy trạng thái nộp báo cáo của 11 khoa phòng theo ngày.
* `GET /api/admin/presentation/:date`: Lấy toàn bộ số liệu tổng hợp phục vụ trình chiếu slide.

---

## 15. 🗄️ Database Schema

### Bảng `users` (Tài khoản người dùng)
* `id` (INT, PK, Auto Increment)
* `username` (VARCHAR(50), UNIQUE)
* `password_hash` (VARCHAR(255))
* `department_code` (VARCHAR(50))
* `department_name` (VARCHAR(100))
* `role` (ENUM('admin', 'department'))

### Bảng `reports` (Báo cáo ca trực)
* `id` (INT, PK, Auto Increment)
* `department_code` (VARCHAR(50))
* `report_date` (DATE)
* `doctor_name` (VARCHAR(100))
* `room` (VARCHAR(50))
* `shift_time` (VARCHAR(50))
* `report_data` (JSON)
* `created_at`, `updated_at` (TIMESTAMP)

### Bảng `transfer_cases` (Bệnh chuyển viện)
* `id` (INT, PK, Auto Increment)
* `report_id` (INT, FK references `reports(id)` ON DELETE CASCADE)
* `patient_name` (VARCHAR(255))
* `admission_time` (VARCHAR(100))
* `reason` (TEXT)
* `clinical_tests` (TEXT)
* `diagnosis` (TEXT)
* `initial_treatment` (TEXT)
* `progress_notes` (TEXT)

---

## 16. 🧪 Testing

### Kiểm thử Frontend Build
```bash
cd client
npm run build
```
*(Kết quả build đảm bảo không có lỗi cú pháp hoặc cảnh báo thư viện).*

### Kiểm thử Health Check Endpoint
```bash
curl http://localhost:3001/api
# Trả về: { "status": "online", "message": "Hospital Report System API is running smoothly." }
```

---

## 17. ☁️ Deployment (Vercel + Cloud MySQL)

Dự án được cấu hình sẵn sàng triển khai trên **Vercel** thông qua file `vercel.json`:
1. Kết nối kho lưu trữ GitHub `UIBreaker/Hospital-Report-System` với Vercel.
2. Thiết lập các biến môi trường trên Vercel:
   * `DATABASE_URL`: Đường dẫn kết nối MySQL Cloud (ví dụ: Aiven MySQL).
   * `JWT_SECRET`: Khóa bí mật ký token.
3. Vercel tự động build Frontend bằng Vite và khởi tạo Backend thông qua Serverless Functions (`api/index.js`).

---

## 18. ⚡ Performance Optimizations

* **Vite Bundle Optimization:** Phân tách nhỏ các bundle chunks, nén Gzip giảm kích thước tải ban đầu xuống dưới `120 kB`.
* **Database Connection Pooling:** Tái sử dụng kết nối MySQL, ngăn ngừa tình trạng cạn kiệt tài nguyên trong giờ cao điểm nộp báo cáo.
* **CSS Hardware Acceleration:** Sử dụng CSS variables và transitions thân thiện GPU, mang lại hiệu ứng chuyển cảnh mượt mà 60 FPS.

---

## 19. 🔒 Security & Privacy

* **Password Security:** Mật khẩu được băm bằng thuật toán `bcryptjs` với salt round = 10.
* **SQL Injection Prevention:** 100% các câu truy vấn cơ sở dữ liệu sử dụng Prepared Statements (`pool.execute`).
* **Route Protection:** Bảo vệ route 2 tầng (Client ProtectedRoute & Server JWT Verification).
* **Secret Scanning & Sanitization:** Tự động loại bỏ thông tin nhạy cảm khỏi mã nguồn công khai.

---

## 20. 🗺️ Roadmap phát triển tương lai

- [x] Phiên bản 1.0: Hoàn thiện 11 biểu mẫu khoa, ca chuyển viện, trình chiếu slide và Trợ lý AI.
- [ ] Phiên bản 1.1: Xuất báo cáo giao ban thành file **PDF** và file **Excel (.xlsx)** theo mẫu chuẩn Bộ Y Tế.
- [ ] Phiên bản 1.2: Biểu đồ trực quan hóa dữ liệu khám chữa bệnh theo tuần/tháng/quý.

---

## 21. 🤝 Contributing

Mọi đóng góp nhằm hoàn thiện hệ thống y tế đều được hoan nghênh:
1. Fork dự án trên GitHub.
2. Tạo nhánh tính năng mới (`git checkout -b feature/TinhNangMoi`).
3. Commit các thay đổi (`git commit -m 'feat: them tinh nang moi'`).
4. Push lên nhánh (`git push origin feature/TinhNangMoi`).
5. Mở một **Pull Request** để được duyệt và merge.

---

## 22. 📝 Changelog

### Phiên bản 1.0.0 (Tháng 08/2026)
* 🚀 Ra mắt chính thức hệ thống báo cáo giao ban trực tuyến cho TTYT Khu Vực Bình Long.
* 🚑 Hoàn thiện biểu mẫu 11 khoa phòng và hệ thống quản lý ca bệnh chuyển viện.
* 📺 Tích hợp Trình chiếu giao ban toàn màn hình với bộ phóng to chữ chuyên dụng.
* 🤖 Ra mắt Trợ lý Y Tế AI hỗ trợ cấp tài khoản và tra cứu nghiệp vụ.
* 📱 Tối ưu hóa giao diện di động và phím tắt thông minh `lorem + Enter`.
* 🔑 Nâng cấp tài khoản Quản trị viên sang `Khnv` / `Khnv@2026`.

---

## 23. 📄 License

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại file [LICENSE](LICENSE).

---

## 24. 👨‍💻 Author & Contact

* **Tác giả & Nhà phát triển chính:** **Nguyễn Vũ Nhật Nam** (Sinh năm 2004)
* **GitHub:** [@UIBreaker](https://github.com/UIBreaker)
* **Dự án Repository:** [https://github.com/UIBreaker/Hospital-Report-System](https://github.com/UIBreaker/Hospital-Report-System)
* **Đơn vị ứng dụng:** **Trung Tâm Y Tế Khu Vực Bình Long**

---

<div align="center">
  <sub>© 2026 Trung Tâm Y Tế Khu Vực Bình Long. Được xây dựng với niềm tự hào và tâm huyết y đức bởi Nguyễn Vũ Nhật Nam.</sub>
</div>
