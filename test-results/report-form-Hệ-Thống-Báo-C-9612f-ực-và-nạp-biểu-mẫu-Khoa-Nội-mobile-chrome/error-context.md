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
+     TRUNG TÂM Y TẾ KHU VỰC BÌNH LONGKhoa Nội Đăng xuấtThông Tin Hành Chính Ca TrựcNgày báo cáo (Mặc định: Ngày hôm qua)Tên Bác sĩ trực chính *Phòng / Buồng trực (Không bắt buộc)Thời gian trực (Không bắt buộc)Tiếp tục nhập báo cáo Phiên bản 1.0Trợ Lý Y Tế AIHỏi đáp & Lấy tài khoản khoa
+   
+
+

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('body')
    14 × locator resolved to <body>…</body>
       - unexpected value "
    TRUNG TÂM Y TẾ KHU VỰC BÌNH LONGKhoa Nội Đăng xuấtThông Tin Hành Chính Ca TrựcNgày báo cáo (Mặc định: Ngày hôm qua)Tên Bác sĩ trực chính *Phòng / Buồng trực (Không bắt buộc)Thời gian trực (Không bắt buộc)Tiếp tục nhập báo cáo Phiên bản 1.0Trợ Lý Y Tế AIHỏi đáp & Lấy tài khoản khoa
  

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
- heading "Thông Tin Hành Chính Ca Trực" [level=3]:
  - img
  - text: Thông Tin Hành Chính Ca Trực
- text: "Ngày báo cáo (Mặc định: Ngày hôm qua)"
- img
- textbox: 2026-08-07
- text: Tên Bác sĩ trực chính *
- img
- textbox "Nhập họ tên Bác sĩ trực..."
- text: Phòng / Buồng trực (Không bắt buộc)
- 'textbox "VD: Phòng cấp cứu"'
- text: Thời gian trực (Không bắt buộc)
- 'textbox "VD: 07h00 - 07h00"'
- button "Tiếp tục nhập báo cáo" [disabled]:
  - text: Tiếp tục nhập báo cáo
  - img
- img
- text: Phiên bản
- strong: "1.0"
- button "Trợ Lý Y Tế AI":
  - img
  - text: Trợ Lý Y Tế AI
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
  11 |     await expect(page).toHaveURL(/.*\/report/, { timeout: 10000 });
  12 |   });
  13 | 
  14 |   test('Hiển thị thông tin hành chính ca trực và nạp biểu mẫu Khoa Nội', async ({ page }) => {
  15 |     // Kiểm tra thông tin hành chính
  16 |     await expect(page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]')).toBeVisible();
  17 |     await expect(page.locator('input[type="date"]')).toBeVisible();
  18 |     
  19 |     // Kiểm tra các trường số liệu của Khoa Nội
> 20 |     await expect(page.locator('body')).toContainText('Bệnh Cũ');
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  21 |     await expect(page.locator('body')).toContainText('Bệnh Mới');
  22 |   });
  23 | 
  24 |   test('Tự động tính toán công thức Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa', async ({ page }) => {
  25 |     // Điền bác sĩ trực
  26 |     const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]');
  27 |     await doctorInput.fill('BS. Nguyễn Văn A');
  28 | 
  29 |     // Tìm các ô số liệu
  30 |     const numInputs = page.locator('input[type="number"]');
  31 |     const count = await numInputs.count();
  32 |     
  33 |     if (count >= 4) {
  34 |       await numInputs.nth(0).fill('20'); // Bệnh cũ
  35 |       await numInputs.nth(1).fill('10'); // Bệnh mới
  36 |       await numInputs.nth(2).fill('2');  // Xuất viện
  37 |       await numInputs.nth(3).fill('1');  // Chuyển khoa
  38 | 
  39 |       // Kích hoạt tính toán
  40 |       await numInputs.nth(3).dispatchEvent('change');
  41 |       
  42 |       // Hiện còn phải là: 20 + 10 - 2 - 1 = 27
  43 |       await expect(page.locator('body')).toContainText('27');
  44 |     }
  45 |   });
  46 | 
  47 |   test('Thêm mới và Xóa ca bệnh chuyển viện cấp cứu linh hoạt', async ({ page }) => {
  48 |     const addTransferBtn = page.locator('button:has-text("Thêm Ca Chuyển Viện")');
  49 |     await expect(addTransferBtn).toBeVisible();
  50 |     
  51 |     // Bấm thêm ca chuyển viện
  52 |     await addTransferBtn.click();
  53 |     
  54 |     // Kiểm tra ô nhập thông tin bệnh nhân xuất hiện
  55 |     const patientNameInput = page.locator('input[placeholder*="Họ tên"]').first();
  56 |     await expect(patientNameInput).toBeVisible();
  57 |     await patientNameInput.fill('Bệnh nhân Trần Thị B - 54 tuổi');
  58 | 
  59 |     // Bấm xóa ca chuyển viện
  60 |     const deleteCaseBtn = page.locator('button[title*="Xóa"], button:has-text("Xóa ca")').first();
  61 |     if (await deleteCaseBtn.isVisible()) {
  62 |       await deleteCaseBtn.click();
  63 |     }
  64 |   });
  65 | 
  66 | });
  67 | 
```