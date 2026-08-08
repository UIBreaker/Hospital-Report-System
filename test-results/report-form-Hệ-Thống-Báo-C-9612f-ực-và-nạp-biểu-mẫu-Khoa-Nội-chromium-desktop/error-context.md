# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: report-form.spec.js >> Hệ Thống Báo Cáo Giao Ban — 11 Khoa Dynamic Forms & Ca Chuyển Viện >> Hiển thị thông tin hành chính ca trực và nạp biểu mẫu Khoa Nội
- Location: tests\report-form.spec.js:14:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('body')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 5

- Bệnh Cũ
+
+     TRUNG TÂM Y TẾ KHU VỰC BÌNH LONGKhoa Nội Đăng xuất📅 Ngày báo cáo: 2026-08-07👨‍⚕️ Bác sĩ trực: BS. Nguyễn Văn A✏️ Sửa thông tin ca trực🏥 BẢNG DỮ LIỆU CHUYÊN MÔN - KHOA NỘIBệnh cũBệnh mớiChuyển khoaXuất việnHiện còn (Tự động tính toán)Formula: (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa = 0Chuyển viện (Số ca)BỆNH CHUYỂN VIỆN  Thêm Ca Chuyển ViệnNhấn «+ Thêm Ca Chuyển Viện» để nhập thông tin chi tiết từng ca bệnh chuyển viện. Gửi Báo Cáo Giao BanPhiên bản 1.0Trợ Lý Y Tế AIHỏi đáp & Lấy tài khoản khoa
+   
+
+

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('body')
    14 × locator resolved to <body>…</body>
       - unexpected value "
    TRUNG TÂM Y TẾ KHU VỰC BÌNH LONGKhoa Nội Đăng xuất📅 Ngày báo cáo: 2026-08-07👨‍⚕️ Bác sĩ trực: BS. Nguyễn Văn A✏️ Sửa thông tin ca trực🏥 BẢNG DỮ LIỆU CHUYÊN MÔN - KHOA NỘIBệnh cũBệnh mớiChuyển khoaXuất việnHiện còn (Tự động tính toán)Formula: (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa = 0Chuyển viện (Số ca)BỆNH CHUYỂN VIỆN  Thêm Ca Chuyển ViệnNhấn «+ Thêm Ca Chuyển Viện» để nhập thông tin chi tiết từng ca bệnh chuyển viện. Gửi Báo Cáo Giao BanPhiên bản 1.0Trợ Lý Y Tế AIHỏi đáp & Lấy tài khoản khoa
  

"

```

```yaml
- banner:
  - img "Logo TTYT Bình Long"
  - heading "TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG" [level=4]
  - heading "Khoa Nội" [level=2]
  - button "Đăng xuất":
    - img
    - text: Đăng xuất
- text: 📅
- strong: "Ngày báo cáo:"
- text: 2026-08-07 👨‍⚕️
- strong: "Bác sĩ trực:"
- text: BS. Nguyễn Văn A
- button "✏️ Sửa thông tin ca trực"
- heading "🏥 BẢNG DỮ LIỆU CHUYÊN MÔN - KHOA NỘI" [level=3]
- text: Bệnh cũ
- 'spinbutton "VD: 44"'
- text: Bệnh mới
- 'spinbutton "VD: 14"'
- text: Chuyển khoa
- 'spinbutton "VD: 0"'
- text: Xuất viện
- 'spinbutton "VD: 9"'
- text: Hiện còn (Tự động tính toán)
- 'spinbutton "VD: 49"': "0"
- text: "Formula: (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa = 0 Chuyển viện (Số ca)"
- 'spinbutton "VD: 0"'
- heading "BỆNH CHUYỂN VIỆN" [level=3]:
  - img
  - text: BỆNH CHUYỂN VIỆN
- button "Thêm Ca Chuyển Viện":
  - img
  - text: Thêm Ca Chuyển Viện
- img
- paragraph:
  - text: Nhấn
  - strong: «+ Thêm Ca Chuyển Viện»
  - text: để nhập thông tin chi tiết từng ca bệnh chuyển viện.
- button "Gửi Báo Cáo Giao Ban":
  - img
  - text: Gửi Báo Cáo Giao Ban
- img
- text: Phiên bản
- strong: "1.0"
- button "Trợ Lý Y Tế AI Hỏi đáp & Lấy tài khoản khoa":
  - img
  - text: Trợ Lý Y Tế AI Hỏi đáp & Lấy tài khoản khoa
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hệ Thống Báo Cáo Giao Ban — 11 Khoa Dynamic Forms & Ca Chuyển Viện', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Đăng nhập tài khoản Khoa Nội
  7  |     await page.goto('/');
  8  |     await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
  9  |     await page.fill('input[placeholder*="mật khẩu"]', '123');
  10 |     await page.click('button[type="submit"]');
  11 |     await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });
  12 |   });
  13 | 
  14 |   test('Hiển thị thông tin hành chính ca trực và nạp biểu mẫu Khoa Nội', async ({ page }) => {
  15 |     await expect(page.locator('body')).toContainText('Khoa Nội');
  16 |     await expect(page.locator('input[type="date"]')).toBeVisible();
  17 | 
  18 |     // Điền bác sĩ trực và bấm tiếp tục sang Bước 2
  19 |     const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
  20 |     await doctorInput.fill('BS. Nguyễn Văn A');
  21 |     
  22 |     const nextBtn = page.locator('button:has-text("Tiếp tục")');
  23 |     if (await nextBtn.isVisible()) {
  24 |       await nextBtn.click();
  25 |     }
  26 | 
  27 |     // Xác nhận Bước 2 đã tải xong
> 28 |     await expect(page.locator('body')).toContainText('Bệnh Cũ');
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  29 |   });
  30 | 
  31 |   test('Tự động tính toán công thức Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa', async ({ page }) => {
  32 |     const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
  33 |     if (await doctorInput.isVisible()) {
  34 |       await doctorInput.fill('BS. Nguyễn Văn A');
  35 |     }
  36 | 
  37 |     const nextBtn = page.locator('button:has-text("Tiếp tục")');
  38 |     if (await nextBtn.isVisible()) {
  39 |       await nextBtn.click();
  40 |     }
  41 | 
  42 |     const numInputs = page.locator('input[type="number"]');
  43 |     const count = await numInputs.count();
  44 |     
  45 |     if (count >= 4) {
  46 |       await numInputs.nth(0).fill('20');
  47 |       await numInputs.nth(1).fill('10');
  48 |       await numInputs.nth(2).fill('2');
  49 |       await numInputs.nth(3).fill('1');
  50 |       await numInputs.nth(3).dispatchEvent('input');
  51 |       await numInputs.nth(3).dispatchEvent('change');
  52 |       
  53 |       // Kiểm tra có ô tính toán hiện còn
  54 |       await expect(page.locator('body')).toBeVisible();
  55 |     }
  56 |   });
  57 | 
  58 |   test('Thêm mới ca bệnh chuyển viện cấp cứu', async ({ page }) => {
  59 |     const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
  60 |     if (await doctorInput.isVisible()) {
  61 |       await doctorInput.fill('BS. Nguyễn Văn A');
  62 |     }
  63 | 
  64 |     const nextBtn = page.locator('button:has-text("Tiếp tục")');
  65 |     if (await nextBtn.isVisible()) {
  66 |       await nextBtn.click();
  67 |     }
  68 | 
  69 |     const addTransferBtn = page.locator('button:has-text("Thêm Ca Chuyển Viện")');
  70 |     if (await addTransferBtn.isVisible()) {
  71 |       await addTransferBtn.click();
  72 |       const patientNameInput = page.locator('input[placeholder*="Họ tên"]').first();
  73 |       await expect(patientNameInput).toBeVisible({ timeout: 5000 });
  74 |       await patientNameInput.fill('Bệnh nhân Nguyễn Văn Test');
  75 |     }
  76 |   });
  77 | 
  78 | });
  79 | 
```