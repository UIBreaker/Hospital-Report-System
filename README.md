# 🏥 Hệ Thống Báo Cáo Giao Ban Trực Tuyến — TTYT Khu Vực Bình Long

<div align="center">

![Trung Tâm Y Tế Khu Vực Bình Long](client/public/hospital.jpg)

<br/>

![Logo TTYT Bình Long](client/public/logo.png)

### **HỆ THỐNG QUẢN LÝ, TỔNG HỢP VÀ TRÌNH CHIẾU BÁO CÁO GIAO BAN Y TẾ CHUYÊN NGHIỆP**

*Ứng dụng Web toàn diện hỗ trợ 12 Khoa/Phòng chuyên môn & Phòng Kế Hoạch Nghiệp Vụ (KHNV) Trung Tâm Y Tế Khu Vực Bình Long.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://hospital-report-system.vercel.app/)
[![Author](https://img.shields.io/badge/Author-Nguyen%20Vu%20Nhat%20Nam%20(2004)-0F2C59?style=for-the-badge&logo=github)](https://github.com/UIBreaker/Hospital-Report-System)
[![Version](https://img.shields.io/badge/Version-1.5.0-10B981?style=for-the-badge)](https://hospital-report-system.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 1. 🌟 Hero / Giới thiệu

**Hệ Thống Báo Cáo Giao Ban Bệnh Viện** là giải pháp phần mềm chuyển đổi số y tế hiện đại, thay thế hoàn toàn phương thức báo cáo giao ban truyền thống bằng giấy tờ và file bảng tính rời rạc. 

Phần mềm được thiết kế chuẩn nhận diện thương hiệu y tế **TTYT Khu Vực Bình Long**, cung cấp quy trình nhập liệu nhanh chóng cho các bác sĩ trực thuộc **12 khoa phòng**, đồng thời trang bị **Trợ lý Y Tế AI**, **cơ chế tự động sinh dữ liệu mẫu (`lorem`)**, **quản lý ca bệnh chuyển viện đa tầng**, **quản lý dung lượng cơ sở dữ liệu thời gian thực**, và **chế độ trình chiếu giao ban toàn màn hình (Presentation Mode)** với khả năng phóng to chữ phục vụ họp giao ban Ban Giám Đốc.

---

## 2. 🛡️ Badges

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x%20%2F%20Aiven-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secure%20Token-black?style=flat-square&logo=jsonwebtokens)
![Responsive](https://img.shields.io/badge/Mobile-Optimized-brightgreen?style=flat-square)
![Uptime](https://img.shields.io/badge/Vercel%20Serverless-100%25-success?style=flat-square)

</div>

---

## 3. 🖥️ Demo / Preview

| Trang Đăng Nhập & AI Assistant | Quản Trị KHNV (Admin Dashboard) |
| :---: | :---: |
| Trợ lý AI cấp tài khoản, điền tự động | Thống kê 11 khoa, chỉnh sửa & xóa báo cáo |
| **Trình Chiếu Giao Ban (Presentation)** | **Quản Lý & Giám Sát Database** |
| Slide độ phân giải cao, hỗ trợ máy chiếu | Theo dõi dung lượng MB/KB & bảng dữ liệu |

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

## 5. ⚡ Tính năng nổi bật toàn diện

### 5.1. 🔐 Đăng nhập phân quyền thông minh (Role-Based Access Control)
* Tách biệt tài khoản khoa phòng (`department`) và tài khoản Quản trị (**`Khnv`**).
* Mã hóa mật khẩu một chiều bằng thuật toán **Bcrypt** chuẩn công nghiệp.
* Quản lý phiên làm việc thông qua **JSON Web Token (JWT)** với thời hạn 24 giờ.
* Tự động chuyển hướng đúng trang tương ứng sau khi đăng nhập thành công.

### 5.2. 🤖 Trợ lý Y Tế AI (AI Assistant Chatbot)
* Tích hợp chatbot thông minh ở góc dưới bên phải màn hình.
* Tự động nhận diện khoa phòng và cung cấp tài khoản đăng nhập tương ứng.
* Tích hợp nút bấm **"Điền Tự Động Vào Ô Đăng Nhập"** giúp bác sĩ đăng nhập chỉ bằng 1 cú nhấp.
* Hướng dẫn giải đáp thắc mắc về các phím tắt, chức năng nhập liệu, kiểm thử Playwright UI Mode.
* Cung cấp bộ câu hỏi hướng dẫn sử dụng và giới thiệu tác giả phát triển **Nguyễn Vũ Nhật Nam (2004)**.

### 5.3. 📋 Biểu mẫu nhập liệu động cho 11 Khoa Chuyên Môn
* **Quy trình 2 bước khoa học:**
  * *Bước 1:* Khai báo thông tin hành chính (Ngày báo cáo kèm lưu ý chọn đúng ngày, Tên Bác sĩ trực chính, Phòng/Buồng trực, Thời gian trực).
  * *Bước 2:* Nạp biểu mẫu số liệu chuyên biệt theo từng khoa.
* **Hỗ trợ 11 khoa phòng đặc thù:**
  1. **Khoa Nội**: Tự động tính toán công thức `Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa`.
  2. **Hồi sức cấp cứu – Thận nhân tạo (HSCC - TNT)**: Bảng HSCC, Bảng Thận nhân tạo, Bảng Phòng khám 21.
  3. **Chẩn đoán hình ảnh (CĐHA)**: X-Quang, CT-Scanner, Siêu âm, Điện tim (trong giờ & ngoài giờ).
  4. **Y học cổ truyền – Phục hồi chức năng (YHCT - PHCN)**: Nội trú, Ngoại trú, Kê toa, Châm cứu, Vật lý trị liệu.
  5. **Ngoại tổng hợp**: Đại phẫu, trung phẫu, tiểu phẫu, khám cấp cứu, hậu phẫu.
  6. **Chấn thương chỉnh hình (CTCH)**: Phẫu thuật kết hợp xương, bó bột, khám chuyên khoa.
  7. **Khoa Nhi**: Khám nhi phòng khám, cấp cứu nhi, sốt xuất huyết, tay chân miệng.
  8. **Khoa Nhiễm**: Truyền nhiễm, theo dõi dịch bệnh, khám cách ly.
  9. **Gây mê Hồi sức (GMHS)**: Phẫu thuật cấp cứu, mổ phiên, gây tê, gây mê toàn thân.
  10. **Khoa Sản**: Sanh thường, sanh hút, mổ lấy thai, hậu sản, theo dõi tim thai.
  11. **Khoa Xét nghiệm**: Sinh hóa, huyết học, đông máu, nước tiểu, miễn dịch (trong giờ & thêm giờ).

### 5.4. ⚡ Tự động tính toán công thức số liệu thông minh
* Tự động áp dụng công thức y tế chuẩn:
  $$\text{Hiện còn} = (\text{Bệnh cũ} + \text{Bệnh mới}) - \text{Xuất viện} - \text{Chuyển khoa}$$
* Cập nhật tức thì (Real-time calculation) khi bác sĩ gõ số, giảm thiểu 100% sai sót tính nhẩm.

### 5.5. 📝 Phím tắt sinh dữ liệu mẫu (`lorem + Enter`)
* Gõ chữ `lorem` và nhấn `Enter` trong bất kỳ ô nhập liệu văn bản nào để tự động sinh đoạn văn bản mẫu chuẩn y tế.
* Hỗ trợ số lượng từ linh hoạt (`lorem10`, `lorem25` + `Enter`) giúp kiểm thử và nhập liệu mẫu siêu tốc.

### 5.6. 🚑 Quản lý Ca Bệnh Chuyển Viện Đa Tầng
* Thêm/xóa không giới hạn số lượng ca chuyển viện cấp cứu trong ca trực.
* Khai báo đầy đủ 7 trường thông tin quan trọng: Họ tên bệnh nhân, Tuổi, Địa chỉ, Giờ vào viện, Lý do vào viện, Cận lâm sàng/XN, Chẩn đoán, Xử trí ban đầu và Diễn biến lúc chuyển viện.

### 5.7. 📊 Bảng Theo Dõi Quản Trị (KHNV Dashboard)
* Xem trạng thái nộp báo cáo thời gian thực của toàn bộ 11 khoa (Đã nộp / Chưa nộp).
* Bộ 3 thẻ thống kê trực quan: Tổng số khoa (11), Số khoa đã nộp, Số khoa chưa nộp.
* Xem chi tiết nội dung báo cáo từng khoa, chỉnh sửa số liệu trực tiếp và chức năng xóa báo cáo (reset về trạng thái Chưa nộp).
* Bộ lọc ngày báo cáo linh hoạt.

### 5.8. 🗄️ Quản Lý & Giám Sát Dung Lượng Cơ Sở Dữ Liệu (Database Stats & Health Monitoring)
* Tích hợp tab **"Quản Lý Database"** trực tiếp trong trang quản trị KHNV.
* Theo dõi dung lượng thực tế của CSDL MySQL (Data size, Index size, Total size tính bằng MB & KB).
* Thanh tiến trình dung lượng (Storage Progress Bar) so sánh với hạn mức lưu trữ (1024 MB).
* Bảng chi tiết danh sách tất cả các bảng dữ liệu (`users`, `reports`, `transfer_cases`) cùng số lượng bản ghi (rows) và mô tả chức năng.
* Nút "Làm Mới Dữ Liệu" (Live Refresh) gọi API tức thì với hiệu ứng loading spinner.
* Phân quyền nghiêm ngặt: Chỉ tài khoản Admin `Khnv` mới có quyền truy cập.

### 5.9. 📽️ Trình Chiếu Giao Ban Đỉnh Cao (Presentation Mode)
* Mở trình chiếu ngay trong cùng tab, không mở tab mới gây rối trình duyệt.
* Tự động dựng slide tổng hợp: Trang bìa, Slide từng khoa phòng, Slide từng ca bệnh chuyển viện cấp cứu.
* **Hỗ trợ người mắt kém / Máy chiếu phòng họp lớn:**
  * Cỡ chữ siêu lớn (`2.8rem` tiêu đề, `2.4rem` số liệu in đậm).
  * Công cụ điều chỉnh tỷ lệ chữ **`Phóng to (120% – 160%)`** và **`Thu nhỏ`** tích hợp ở thanh điều khiển.
  * Phím tắt điều khiển: Mũi tên `←` / `→`, phím `Space`, phím `F` (Toàn màn hình), phím `Esc` (Thoát).

### 5.10. 📱 Tối ưu hóa 100% Giao diện Di động (Mobile-First Responsive)
* Tự động co giãn 1 cột trên điện thoại thông minh và máy tính bảng (iPhone, Samsung, iPad).
* Khắc phục hoàn toàn lỗi tự zoom trên iOS Safari với font chuẩn `16px`.
* Hỗ trợ bảng dữ liệu cuộn ngang mượt mà, không bị vỡ bố cục.

### 5.11. 🚀 Khởi Động Nhanh 1-Click & Chạy Ngầm (Desktop Launcher)
* File `PhanMemBaoCao.vbs`: Khởi chạy ngầm toàn bộ dịch vụ Node.js và MySQL mà không hiện cửa sổ đen (CMD), tự động mở trình duyệt web.
* File `TatPhanMem.bat`: Tự động quét và tắt sạch các tiến trình khi kết thúc ca làm việc.

### 5.12. 🧪 Hệ Thống Kiểm Thử Tự Động Toàn Diện (Playwright E2E Testing Suite)
* Hơn **65+ bài kiểm thử tự động** đạt tỷ lệ **100% Passed**.
* Kiểm thử đa thiết bị song song: Desktop Chromium, Google Pixel 7 (Android), Apple iPhone 14 (iOS).
* Hỗ trợ Playwright UI Mode (quan sát từng click chuột và dòng thời gian), Headed mode, Mobile mode và HTML reports.
* Kiểm thử bảo mật chuyên sâu (Deep Testing): Chống SQL/XSS Injection, Route Guarding, kiểm thử phím Tab điều hướng, kiểm thử máy chiếu 4K, kiểm thử biểu mẫu 11 khoa phòng.

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
| **Testing** | Playwright Test | Kiểm thử tự động E2E đa nền tảng và thiết bị |
| **Deployment** | Vercel Platform | Triển khai Serverless Functions và Frontend tĩnh |

---

## 7. 🏗️ Kiến trúc hệ thống

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + Vite)"]
        A[Bác Sĩ Trực Khoa] -->|Đăng nhập| B[Report Page]
        B -->|Bước 1| C[Thông tin Hành chính]
        C -->|Bước 2| D[11 Dynamic Forms]
        D -->|Khai báo| E[Ca Bệnh Chuyển Viện]
        
        F[Phòng KHNV / Admin] -->|Đăng nhập Khnv| G[Admin Dashboard]
        G -->|Tab 1| H[Báo Cáo Giao Ban]
        G -->|Tab 2| I[Quản Lý Database Stats]
        G -->|Trình chiếu| J[Presentation Mode 4K]
        
        K[Trợ Lý Y Tế AI] -->|Hỗ trợ trực tuyến| A
    end

    subgraph Server["Backend Server (Node.js / Express)"]
        L[Auth Middleware JWT]
        M[Report Controller]
        N[Admin Controller]
        O[Database Stats Controller]
    end

    subgraph Database["MySQL Database (Aiven Cloud / Local)"]
        P[(users Table)]
        Q[(reports Table - JSON)]
        R[(transfer_cases Table)]
    end

    Client -->|RESTful API / JSON| Server
    Server -->|Connection Pool| Database
```

---

## 8. 📁 Cấu trúc thư mục

```
hospital-report-system/
├── client/                           # React Frontend (Vite)
│   ├── public/                       # Logo, ảnh bệnh viện, favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # AIAssistant, ProtectedRoute...
│   │   │   └── forms/departments/    # 11 biểu mẫu khoa phòng
│   │   ├── contexts/                 # AuthContext
│   │   ├── pages/                    # LoginPage, ReportPage, AdminDashboard, PresentationPage
│   │   ├── services/                 # api.js, authService.js, reportService.js
│   │   ├── App.jsx, index.css, main.jsx
│   ├── package.json, vite.config.js
│
├── server/                           # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/db.js              # MySQL pool kết nối Cloud & Local
│   │   ├── controllers/              # authController, reportController, adminController
│   │   ├── middleware/               # auth.js (JWT verify + adminOnly)
│   │   ├── routes/                   # authRoutes, reportRoutes, adminRoutes
│   │   └── app.js                    # Express app setup
│   ├── check-size.js                 # Script tiện ích kiểm tra dung lượng DB qua terminal
│   ├── server.js, package.json, .env
│
├── database/                         # Cơ sở dữ liệu
│   ├── schema.sql                    # Khởi tạo DB & 3 bảng
│   └── seed.sql                      # Dữ liệu mẫu 11 khoa + Admin Khnv
│
├── tests/                            # Bộ kiểm thử tự động Playwright E2E
│   ├── all-accounts.spec.js          # Kiểm thử toàn bộ 12 tài khoản & 10 nhóm chức năng
│   ├── db-stats.spec.js              # Kiểm thử tab Quản lý Database
│   ├── deep-testing.spec.js          # Kiểm thử bảo mật, SQL injection & biên dữ liệu
│   ├── auth.spec.js                  # Kiểm thử xác thực & phân quyền
│   ├── report-form.spec.js           # Kiểm thử biểu mẫu khoa & ca chuyển viện
│   ├── admin-dashboard.spec.js       # Kiểm thử Dashboard & Trình chiếu giao ban
│   ├── ai-assistant.spec.js          # Kiểm thử Trợ lý AI
│   ├── mobile-responsive.spec.js     # Kiểm thử giao diện di động
│   └── lorem-generator.spec.js       # Kiểm thử phím tắt lorem
│
├── playwright.config.js              # Cấu hình Playwright Test Runner
├── PhanMemBaoCao.vbs                 # File khởi động 1-click chạy ngầm
├── TatPhanMem.bat                    # File tắt sạch phần mềm
├── vercel.json                       # Cấu hình triển khai Vercel Serverless
└── README.md                         # Tài liệu dự án chuyên nghiệp
```

---

## 9. 📋 Yêu cầu hệ thống

* **Node.js**: Phiên bản `v18.x` hoặc `v20.x` trở lên.
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

### Bước 4: Cài đặt Playwright Testing (Tùy chọn cho kiểm thử)
```bash
npm install
npx playwright install chromium
```

---

## 11. 🔧 Cấu hình Environment

Tạo file `.env` tại thư mục `server/` với nội dung:

```env
# Port chạy Backend Server nội bộ
PORT=3001

# Cấu hình CSDL MySQL cục bộ (XAMPP)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_report

# (Tùy chọn) Cấu hình Cloud Database URL (ví dụ: Aiven MySQL)
# DATABASE_URL=mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED

# Mã bí mật ký JWT Token
JWT_SECRET=hospital_report_secret_key_2026
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
* `GET /api/admin/database-stats`: Lấy thống kê dung lượng CSDL (MB/KB), số lượng bản ghi và danh sách bảng chi tiết từ `information_schema.TABLES`.

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

## 16. 🧪 Testing (Playwright E2E & Deep Testing)

Dự án được trang bị hệ thống kiểm thử tự động toàn diện **Playwright Test** với hơn **65+ bài test** chạy song song trên nhiều trình duyệt và thiết bị:

### 16.1. Các lệnh kiểm thử chính:

* **Chạy kiểm thử toàn bộ 12 tài khoản:**
  ```bash
  npm run test:all
  ```

* **Chạy kiểm thử sâu (Bảo mật, SQL Injection, Phím Tab, Máy chiếu 4K):**
  ```bash
  npm run test:deep
  ```

* **Chạy kiểm thử riêng tab Quản lý Database:**
  ```bash
  npm run test:db
  ```

* **Mở bảng điều khiển Playwright UI Mode (Xem chi tiết từng click chuột & Timeline):**
  ```bash
  npm run test:ui
  ```

* **Mở trực tiếp trình duyệt Chrome tự động thao tác:**
  ```bash
  npm run test:headed
  ```

* **Chạy kiểm thử trên thiết bị Di động (Mobile Viewport):**
  ```bash
  npm run test:mobile
  ```

* **Xem báo cáo HTML Report chi tiết:**
  ```bash
  npm run test:report
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

* **Vite Bundle Optimization:** Phân tách nhỏ các bundle chunks, nén Gzip giảm kích thước tải ban đầu xuống dưới `125 kB`.
* **Database Connection Pooling:** Tái sử dụng kết nối MySQL, ngăn ngừa tình trạng cạn kiệt tài nguyên trong giờ cao điểm nộp báo cáo.
* **JSON Compression Storage:** Lưu trữ dữ liệu biểu mẫu dưới dạng JSON nén giúp mỗi bản ghi chỉ chiếm `2 - 5 KB`.
* **CSS Hardware Acceleration:** Sử dụng CSS variables và transitions thân thiện GPU, mang lại hiệu ứng chuyển cảnh mượt mà 60 FPS.

---

## 19. 🔒 Security & Privacy

* **Password Security:** Mật khẩu được băm bằng thuật toán `bcryptjs` với salt round = 10.
* **SQL Injection Prevention:** 100% các câu truy vấn cơ sở dữ liệu sử dụng Prepared Statements (`pool.execute` / `pool.query`).
* **Route Protection:** Bảo vệ route 2 tầng (Client ProtectedRoute & Server JWT Verification).
* **Secret Scanning & Sanitization:** Tự động loại bỏ thông tin nhạy cảm khỏi mã nguồn công khai, tuân thủ GitHub Push Protection.

---

## 20. 🗺️ Roadmap phát triển tương lai

- [x] **Phiên bản 1.0.0:** 11 biểu mẫu khoa phòng, ca chuyển viện, Trình chiếu slide và Trợ lý AI.
- [x] **Phiên bản 1.1.0:** Tối ưu hóa 100% Mobile Responsive, Công cụ phóng to chữ Zoom và phím tắt `lorem + Enter`.
- [x] **Phiên bản 1.2.0:** Bộ kiểm thử tự động Playwright E2E 65+ tests, kiểm thử bảo mật & phím Tab.
- [x] **Phiên bản 1.3.0:** Module Quản Lý & Giám Sát Dung Lượng Database thời gian thực (MB/KB) và công cụ `check-size.js`.
- [x] **Phiên bản 1.4.0:** Động cơ Trình Chiếu Giao Ban 2.0 (Presentation Engine 2.0) với Personnel Banners, Note Cards, và Bảng kỹ thuật chuyên khoa.
- [x] **Phiên bản 1.5.0 (Hiện tại):** Bổ sung **Khoa Liên Chuyên Khoa (Khoa thứ 12)** (`lck.bvbl` / `123`), sắp xếp chuẩn 12 khoa giao ban, khắc phục triệt để lỗi kẹt cuộn slide, tách trang chuyển viện độc lập và đổi màu đỏ cảnh báo tử vong.
- [ ] **Phiên bản 2.0.0:** Xuất báo cáo giao ban thành file **PDF** và file **Excel (.xlsx)** theo mẫu chuẩn Bộ Y Tế.
- [ ] **Phiên bản 2.1.0:** Biểu đồ trực quan hóa dữ liệu khám chữa bệnh theo tuần/tháng/quý.

---

## 21. 🤝 Contributing

Mọi đóng góp nhằm hoàn thiện hệ thống y tế đều được hoan nghênh:
1. Fork dự án trên GitHub.
2. Tạo nhánh tính năng mới (`git checkout -b feature/TinhNangMoi`).
3. Commit các thay đổi (`git commit -m 'feat: them tinh nang moi'`).
4. Push lên nhánh (`git push origin feature/TinhNangMoi`).
5. Mở một **Pull Request** để được duyệt và merge.

---

## 22. 📝 Changelog & Quy Chuẩn Đánh Số Phiên Bản (SemVer)

### 📌 Quy tắc đánh số phiên bản (`MAJOR.MINOR.PATCH` — Ví dụ: `1.5.0`):
* **Số thứ nhất (`X.0.0` - Major):** Bước nhảy vọt, thay đổi toàn bộ kiến trúc, cơ chế hoạt động hoặc thiết kế giao diện phần mềm.
* **Số thứ hai (`X.Y.0` - Minor):** Bổ sung thêm tính năng mới hoặc nghiệp vụ phụ sau đợt cập nhật lớn.
* **Số thứ ba (`X.Y.Z` - Patch):** Bản vá lỗi nhỏ, tinh chỉnh giao diện, sửa lỗi hiển thị và hotfix phát sinh.
* **Ý nghĩa số `0`:**
  * Số 0 thứ nhất (`X.0.0`): Bản mới tinh vừa ra mắt, sạch sẽ, chưa qua chỉnh sửa nhỏ lẻ.
  * Số 0 thứ hai (`X.Y.0`): Chưa có lỗi nhỏ nào cần phải vá sau khi phát hành tính năng mới.

---

### Phiên bản 1.5.0 (Tháng 08/2026) — *Phiên bản hiện tại*
* 🏥 **Thêm mới Khoa Liên Chuyên Khoa (Khoa thứ 12):**
  * Cấp tài khoản đăng nhập chuyên dụng: **`lck.bvbl`** / Mật khẩu: **`123`**.
  * Xây dựng biểu mẫu nhập liệu chuyên môn đầy đủ 4 chuyên khoa: **Tai Mũi Họng (TMH)**, **Mắt**, **Răng Hàm Mặt + Nội (RHM+Nội)**, **Da Liễu**, **Nhập viện**, **Chuyển viện** và khối **Tổng 4CK** (tự động tính tổng kèm chuyển đổi tính thủ công).
  * Tích hợp ca chuyển viện động (`TransferCaseForm`) và ghi chú thêm giờ ca trực.
* 🔢 **Chuẩn hóa Thứ tự Trình chiếu & Giám sát 12 Khoa:**
  * Sắp xếp đồng bộ từ máy chủ Backend (`adminController.js`) đến Bảng điều khiển KHNV (`AdminDashboard.jsx`) và Trình chiếu Giao ban (`PresentationPage.jsx`) theo đúng 12 khoa:
    1. Liên chuyên khoa (`lck`)
    2. Xét nghiệm (`xn`)
    3. Chẩn đoán hình ảnh (`cdha`)
    4. Hồi sức cấp cứu – Thận nhân tạo (`hscc_tnt`)
    5. Khoa Nội (`noi`)
    6. Khoa Nhi (`nhi`)
    7. Khoa Nhiễm (`nhiem`)
    8. Khoa Sản (`san`)
    9. Y học cổ truyền – PHCN (`yhct_phcn`)
    10. Ngoại tổng hợp (`ngoai_th`)
    11. Chấn thương chỉnh hình (`ctch`)
    12. Gây mê hồi sức (`gmhs`)
* 🔄 **Khắc phục lỗi thanh cuộn khi trình chiếu (Auto-Scroll Reset):**
  * Tự động đưa vị trí cuộn về đầu trang (`scrollTop = 0`) ngay khi chuyển sang slide mới, ngăn chặn hiện tượng slide bị kẹt ở chân trang cũ.
* 🚑 **Tách độc lập Slide Bệnh nhân Chuyển viện:**
  * Mỗi ca bệnh chuyển viện được chia thành 2 slide rõ ràng:
    * **Phần 1 (Tiếp nhận & Xử trí):** Họ tên, tuổi, địa chỉ, giờ vào, lý do, cận lâm sàng, chẩn đoán, xử trí ban đầu.
    * **Phần 2 (Diễn biến & Tình trạng chuyển viện):** Banner thông tin tóm tắt và Khung diễn biến/hội chẩn chiếm toàn màn hình với cỡ chữ lớn và định dạng nhiều dòng sắc nét.
* 🚨 **Tối ưu màu sắc cảnh báo Tử vong (Mortality Alert):**
  * Đổi màu nền đỏ hồng (`#FEE2E2`), viền đỏ (`#DC2626`) và chữ đỏ đậm (`#DC2626`) cho tất cả các chỉ số tử vong trong Form nhập liệu, Quản trị viên và Slide giao ban.
* 🏷️ Nâng cấp toàn diện lên **`v1.5.0`** theo quy chuẩn Semantic Versioning.

### Phiên bản 1.4.0 (Tháng 08/2026)
* 📺 **Nâng cấp Động cơ Trình Chiếu Giao Ban 2.0 (Presentation Engine 2.0):**
  * Tách biệt hoàn toàn chỉ số định lượng (KPI Metric Cards) và văn bản thông tin/ghi chú dài.
  * Tích hợp **Khung Nhân Sự Ca Trực (Personnel Banner)** chuyên nghiệp cho Khoa Gây Mê Hồi Sức, Nhiễm, Chẩn Đoán Hình Ảnh.
  * Tích hợp **Khung Ghi Chú & Diễn Biến Thêm Giờ (Rich Note Card)** toàn chiều rộng (`Full Width`) với tông màu hổ phách trang nhã.
  * Bảng **Thống Kê Kỹ Thuật Chẩn Đoán Hình Ảnh** độ phân giải cao, hỗ trợ máy chiếu phòng họp Ban Giám Đốc.
* 🛠️ Khắc phục triệt để lỗi hiển thị `[object Object]` ở Modal Quản trị & Slide trình chiếu.
* 🗂️ Bố cục lưới cân xứng, hoàn hảo cho cả 11 khoa lâm sàng và cận lâm sàng.

### Phiên bản 1.3.0 (Tháng 08/2026)
* 🗄️ Ra mắt Tab **Quản Lý & Giám Sát Dung Lượng Database** thời gian thực trong trang quản trị KHNV.
* 📊 Thống kê dung lượng thực tế của CSDL MySQL (Data, Index, Total size MB/KB) và thanh tiến trình hạn mức 1024 MB.
* 📡 Cung cấp API `GET /api/admin/database-stats` và công cụ Terminal `server/check-size.js`.
* 🧪 Bổ sung bộ test Playwright chuyên sâu cho Database stats (`tests/db-stats.spec.js`).

### Phiên bản 1.2.0 (Tháng 08/2026)
* 🧪 Trang bị hệ thống kiểm thử tự động toàn diện **Playwright E2E Testing Suite** với hơn **65+ bài test** (100% Passed).
* 🛡️ Thêm bộ kiểm thử bảo mật chuyên sâu (**Deep Testing**): Chống SQL Injection, XSS Injection, Route Guarding, kiểm thử phím Tab điều hướng, kiểm thử màn hình máy chiếu 4K.
* 🖥️ Hỗ trợ Playwright UI Mode trực quan với timeline từng click chuột.

### Phiên bản 1.1.0 (Tháng 08/2026)
* 📱 Tối ưu hóa 100% giao diện di động (Mobile-First Responsive) không bị tràn ngang hay xung đột widget.
* 🔍 Tích hợp bộ công cụ phóng to chữ chuyên dụng **Zoom (120% – 160%)** trên slide trình chiếu.
* 📝 Ra mắt phím tắt thông minh **`lorem + Enter`** sinh dữ liệu mẫu y tế tức thì.
* 🖼️ Bổ sung ảnh thực tế bệnh viện làm OpenGraph Social Preview Banner.

### Phiên bản 1.0.0 (Tháng 08/2026)
* 🚀 Ra mắt chính thức hệ thống báo cáo giao ban trực tuyến cho TTYT Khu Vực Bình Long.
* 🚑 Hoàn thiện biểu mẫu 11 khoa phòng và hệ thống quản lý ca bệnh chuyển viện đa tầng.
* 🤖 Ra mắt Trợ lý Y Tế AI hỗ trợ cấp tài khoản khoa phòng và hướng dẫn nghiệp vụ.
* 🔑 Thiết lập tài khoản Quản trị viên `Khnv` / `Khnv@2026`.

---

## 23. 📄 License

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại file [LICENSE](LICENSE).

---

## 24. 👨‍💻 Author & Contact

* **Tác giả & Nhà phát triển chính:** **Nguyễn Vũ Nhật Nam** (Sinh năm 2004)
* **Chức danh chuyên môn:** Kỹ sư / Lập trình viên Frontend & Fullstack
* **Đơn vị công tác:** **Phòng Kế hoạch - Nghiệp vụ (KHNV) – Trung Tâm Y Tế Khu Vực Bình Long**
* **Đơn vị phát triển phần mềm:** **Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long**
* **GitHub Profile:** [@UIBreaker](https://github.com/UIBreaker)
* **Kho mã nguồn GitHub:** [https://github.com/UIBreaker/Hospital-Report-System](https://github.com/UIBreaker/Hospital-Report-System)
* **Sứ mệnh:** Chuyển đổi số toàn diện quy trình báo cáo giao ban, tối ưu hóa thời gian bàn giao ca trực và nâng cao chất lượng khám chữa bệnh tại TTYT Khu Vực Bình Long.

---

<div align="center">
  <sub>© 2026 Trung Tâm Y Tế Khu Vực Bình Long. Được xây dựng với niềm tự hào và tâm huyết y đức bởi Kỹ sư Nguyễn Vũ Nhật Nam (Phòng KHNV).</sub>
</div>
