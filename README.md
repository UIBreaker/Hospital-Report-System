<div align="center">

<img src="client/public/hospital.jpg" alt="Trung Tâm Y Tế Khu Vực Bình Long" width="100%" style="max-height: 420px; object-fit: cover; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.25);" />

<br/><br/>

<img src="client/public/logo.png" alt="Logo TTYT Bình Long" width="100px" height="100px" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));" />

# 🏥 HỆ THỐNG QUẢN LÝ, TỔNG HỢP & TRÌNH CHIẾU BÁO CÁO GIAO BAN Y TẾ TOÀN VIỆN
### **TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG — SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI**

<p align="center">
  <em>Giải pháp chuyển đổi số y tế toàn diện thay thế hoàn toàn báo cáo sổ sách truyền thống, phục vụ công tác giao ban chuyên môn hàng ngày cho 12 Khoa/Phòng & Phòng Kế Hoạch - Nghiệp Vụ.</em>
</p>

[![Version](https://img.shields.io/badge/Version-2.2.2-10B981?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/UIBreaker/Hospital-Report-System)
[![Author](https://img.shields.io/badge/Author-Nguyen%20Vu%20Nhat%20Nam-0F2C59?style=for-the-badge&logo=github&logoColor=white)](https://github.com/UIBreaker)
[![Zalo Support](https://img.shields.io/badge/Zalo-0916.337.266-0284C7?style=for-the-badge&logo=zalo&logoColor=white)](https://zalo.me/0916337266)
[![License](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge)](LICENSE)

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%2F%2024.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4%20Serverless-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Aiven Cloud](https://img.shields.io/badge/Aiven-Cloud%20Database%20SSL-FF3554?style=flat-square&logo=aiven&logoColor=white)](https://aiven.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Medical%20CDN-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![ExcelJS](https://img.shields.io/badge/ExcelJS-4.4.x-107C41?style=flat-square&logo=microsoftexcel&logoColor=white)](https://github.com/exceljs/exceljs)
[![html2pdf](https://img.shields.io/badge/html2pdf.js-0.10.x-DC2626?style=flat-square&logo=adobeacrobatreader&logoColor=white)](https://ekoopmans.github.io/html2pdf.js/)
[![Vercel](https://img.shields.io/badge/Vercel-Edge%20Serverless-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---



## 1. 🌟 Giới Thiệu & Bối Cảnh Hệ Thống

Tại các bệnh viện và trung tâm y tế, công tác **Giao ban chuyên môn ca trực sáng (07:30 - 08:30)** là hoạt động mang tính sống còn để đánh giá tình hình cấp cứu, tiếp nhận bệnh nhân, theo dõi diễn biến chuyển biến nặng, phẫu thuật khẩn cấp và tử vong trong 24 giờ qua.

**Hệ Thống Quản Lý Báo Cáo Giao Ban Trực Tuyến** được phát triển nhằm giải quyết triệt để các tồn đọng của quy trình thủ công:
* ❌ **Thực trạng cũ:** Báo cáo bằng sổ viết tay hoặc nhập Excel rời rạc, tốn 45-60 phút tổng hợp, dễ sai sót số liệu, không thể đính kèm ảnh cận lâm sàng (X-quang, CT Scanner, siêu âm), không có cơ chế khóa sổ chống sửa số liệu hồi cứu.
* ✅ **Giải pháp mới:** 12 Khoa phòng nhập liệu trực tiếp trên biểu mẫu điện tử chuyên khoa; hệ thống tự động tổng hợp số liệu toàn viện theo thời gian thực (Real-time); hỗ trợ chế độ **Trình chiếu hội trường thông minh**, **Xuất file Excel 3 Sheet** chuẩn định dạng Bộ Y Tế và **In/Xuất PDF chuẩn A4** chỉ với 1 cú click.

---

## 2. 🛡️ Nền Tảng Công Nghệ (Tech Stack)

### **Frontend Client**
* **React 18.3 & Vite 6 (Rolldown Engine):** Tối ưu hóa thời gian biên dịch Bundle (<800ms) và Hot Module Replacement (HMR).
* **Code Splitting & Lazy Loading (`React.lazy` + `Suspense`):** Tách nhỏ mã nguồn trang quản trị thành các chunk độc lập (`ReportsTab`, `StaffTab`, `DatabaseTab`, `AccountsTab`), giảm 65% dung lượng nạp ban đầu.
* **React Router v6:** Điều hướng Single Page Application (SPA) mượt mà với Route Guards bảo vệ phân quyền Admin/Department.
* **ExcelJS Client Engine:** Tạo và định dạng trực tiếp file Excel 3 Sheet chuyên nghiệp trên trình duyệt mà không gây tải cho CPU máy chủ.
* **html2pdf.js & jsPDF Engine:** Bộ xuất bản in A4 y tế chuẩn tỷ lệ phân trang thông minh, chống tràn viền và chống cắt đứt dòng chữ.
* **React Icons:** Bộ biểu tượng vector thương hiệu sắc nét (`react-icons/fa`, `react-icons/si`).

### **Backend RESTful API**
* **Node.js 20+ & Express.js 5:** Khung kiến trúc API tách lớp chuẩn mực (Controller - Service - Model - Middleware).
* **MySQL2 Connection Pool:** Quản lý kết nối cơ sở dữ liệu hiệu năng cao với cấu hình SSL đám mây.
* **JSON Web Token (JWT) & Bcrypt:** Xác thực phân quyền đa tầng, mã hóa mật khẩu một chiều với salt rounds = 10, hỗ trợ kiểm tra dự phòng CSDL chống lỗi token cũ.
* **Multer & Cloudinary SDK:** Xử lý nén và tải lên hình ảnh y khoa độ phân giải cao lên Cloud CDN với đường truyền bảo mật HTTPS.

### **Cơ Sở Dữ Liệu & Hạ Tầng Máy Chủ**
* **MySQL 8.4 Serverless (Aiven Cloud Managed DB / TiDB Cloud):** CSDL quan hệ chuẩn hóa mức 3NF, ràng buộc khóa ngoại `ON DELETE CASCADE`, chỉ mục Index tối ưu tốc độ truy vấn <10ms.
* **Vercel Serverless Edge & On-Premise VM:** Tương thích cả hạ tầng đám mây không máy chủ và máy chủ vật lý nội bộ bệnh viện.

---

## 3. ⚡ Tính Năng Kỹ Thuật Nổi Bật

```mermaid
graph TD
    A[Hệ Thống Giao Ban Toàn Viện] --> B[12 Khoa Phòng Chuyên Môn]
    A --> C[Phòng Kế Hoạch Nghiệp Vụ - Admin]
    
    B --> B1[Biểu mẫu động chuyên khoa & Tự động tính toán]
    B --> B2[Quản lý 4 nhóm ca bệnh & Upload ảnh Cloudinary]
    B --> B3[In phiếu giao ban khoa phòng chuẩn A4]
    
    C --> C1[Ma trận theo dõi 12 khoa & Khóa sổ 08:30]
    C --> C2[Trình chiếu giao ban hội trường Auto-Scale Font]
    C --> C3[Xuất Excel 3 Sheet chuẩn BYT & PDF toàn viện]
    C --> C4[Giám sát CSDL vật lý & Đo lường dung lượng byte theo ngày]
    C --> C5[Quản lý 185+ nhân sự & Phân quyền tài khoản]
```

### 1. Biểu Mẫu Nhập Liệu Chuyên Khoa Tự Động Hóa
* Cung cấp 12 biểu mẫu đặc thù cho từng khối (Khoa Khám bệnh, HSCC - Thận nhân tạo, Sản, Nhi, Ngoại TH, CTCH, Mắt, TMH, RHM, YHCT, GMHS, Xét nghiệm, CĐHA).
* Tự động tính toán số liệu: `Hiện còn = Bệnh cũ + Nhập viện - Xuất viện - Chuyển viện - Chuyển khoa` với cơ chế nhận diện can thiệp thủ công (Manual override).

### 2. Quản Lý 4 Nhóm Ca Bệnh Lâm Sàng Kèm Ảnh Y Khoa HD
* Quản lý chuyên sâu: **Ca Chuyển Viện**, **Ca Phẫu Thuật Mổ**, **Ca Tử Vong**, **Ca Bệnh Nặng Cần Theo Dõi**.
* Tích hợp upload nhiều hình ảnh chụp X-quang, CT Scanner, siêu âm, vết thương qua Cloudinary CDN kèm bộ xem ảnh phóng to toàn màn hình (Image Lightbox Modal).

### 3. Trình Chiếu Giao Ban Hội Trường (Presentation Engine)
* **Permanent Canvas Architecture:** Cố định khung slide nền trắng, hiệu ứng chuyển cảnh Zero-Shift Micro-Fade (`140ms`), chống hoàn toàn hiện tượng chớp nháy màn hình máy chiếu.
* **Auto-Scaling Typography:** Tự động đo độ dài văn bản chuyên môn (`contentLength`) để co giãn cỡ chữ thông minh từ `0.76rem` đến `1.65rem`, đảm bảo toàn bộ hội trường nhìn rõ mọi chi tiết ca bệnh.

### 4. Cơ Chế Khóa Sổ Toàn Viện Chống Sửa Số Liệu Hồi Cứu (`is_locked`)
* Sau mốc **08:30 sáng**, toàn bộ báo cáo tự động chuyển sang trạng thái Khóa Sổ. Khoa phòng chỉ có thể xem, không thể thay đổi dữ liệu đã chốt.
* Quản trị viên (Admin/Ban Giám Đốc) có đặc quyền tối cao: **Mở khóa từng khoa** hoặc **Mở khóa toàn viện** linh hoạt khi cần bổ sung số liệu.

### 5. Xuất File Excel 3 Sheet & In Ấn PDF Y Tế Chuẩn A4
* **ExcelJS Multi-Sheet:** Xuất file `.xlsx` gồm 3 Sheet: `Tổng Hợp Toàn Viện`, `Chi Tiết 12 Khoa Phòng`, `Danh Sách Ca Bệnh` với màu sắc nhận diện, căn lề và kẻ viền chuẩn mực.
* **In / Tải PDF A4:** Tạo tài liệu A4 hoàn chỉnh có quốc hiệu, tiêu ngữ, chữ ký Bác sĩ - Điều dưỡng trưởng tua trực.

### 6. Giám Sát Dung Lượng CSDL & Đo Lường Byte Dữ Liệu Theo Ngày
* Bảng điều khiển phân tích chi tiết dung lượng ổ đĩa vật lý Cloud Aiven (Used / Free / Total 1.0 GB).
* Đo lường chính xác dung lượng văn bản (Text KB) và hình ảnh (Image KB) phát sinh theo từng ngày của 12 khoa.

---

## 👨‍💻 Tác Giả & Hỗ Trợ Kỹ Thuật

* **Tác giả phát triển:** **Nguyễn Vũ Nhật Nam** (Full-Stack Engineer / UI-UX Architect)
* **Tổ chức:** Phòng Kế Hoạch - Nghiệp Vụ, **Trung Tâm Y Tế Khu Vực Bình Long**
* **GitHub Repository:** [https://github.com/UIBreaker/Hospital-Report-System](https://github.com/UIBreaker/Hospital-Report-System)
* **Kênh hỗ trợ kỹ thuật trực tiếp (Hotline / Zalo):** [**0916.337.266**](https://zalo.me/0916337266)

---

<div align="center">
  <b>&copy; 2026 Trung Tâm Y Tế Khu Vực Bình Long — Sở Y Tế Thành Phố Đồng Nai. All rights reserved.</b>
</div>
