# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Hệ Thống Báo Cáo Giao Ban — Authentication & Access Control >> Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi
- Location: tests\auth.spec.js:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div:has-text("⚠️")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div:has-text("⚠️")').first()

```

```yaml
- img "Logo TTYT Bình Long"
- heading "TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG" [level=2]
- heading "Hệ Thống Báo Cáo Giao Ban" [level=1]
- paragraph: Đăng nhập tài khoản khoa phòng hoặc quản trị
- text: Tên đăng nhập
- img
- 'textbox "VD: Khnv hoặc noi.bvbl"'
- text: Mật khẩu
- img
- textbox "Nhập mật khẩu"
- button:
  - img
- button "Đăng Nhập" [disabled]
- img
- text: Phiên bản
- strong: "1.0"
- text: TTYT Bình Long © 2026 Trung Tâm Y Tế Khu Vực Bình Long.
- button "Trợ Lý Y Tế AI":
  - img
  - text: Trợ Lý Y Tế AI
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hệ Thống Báo Cáo Giao Ban — Authentication & Access Control', () => {
  4  | 
  5  |   test('Hiển thị giao diện trang đăng nhập đúng chuẩn thương hiệu TTYT Bình Long', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     // Kiểm tra logo và tiêu đề
  9  |     await expect(page.locator('h1')).toContainText('Hệ Thống Báo Cáo Giao Ban');
  10 |     await expect(page.locator('h2')).toContainText('TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG');
  11 |     
  12 |     // Kiểm tra các trường nhập liệu
  13 |     await expect(page.locator('input[placeholder*="Khnv"]')).toBeVisible();
  14 |     await expect(page.locator('input[placeholder*="mật khẩu"]')).toBeVisible();
  15 |     await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');
  16 | 
  17 |     // Kiểm tra huy hiệu phiên bản 1.0
  18 |     await expect(page.locator('body')).toContainText('Phiên bản 1.0');
  19 |   });
  20 | 
  21 |   test('Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi', async ({ page }) => {
  22 |     await page.goto('/');
  23 |     await page.fill('input[placeholder*="Khnv"]', 'taikhoan_khong_ton_tai');
  24 |     await page.fill('input[placeholder*="mật khẩu"]', 'sai_mat_khau_123');
  25 |     await page.click('button[type="submit"]');
  26 | 
  27 |     // Kiểm tra thông báo cảnh báo lỗi
  28 |     const errorBox = page.locator('div:has-text("⚠️")').first();
> 29 |     await expect(errorBox).toBeVisible({ timeout: 5000 });
     |                            ^ Error: expect(locator).toBeVisible() failed
  30 |   });
  31 | 
  32 |   test('Đăng nhập thành công với tài khoản Khoa Nội (noi.bvbl) và chuyển hướng vào /report', async ({ page }) => {
  33 |     await page.goto('/');
  34 |     await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
  35 |     await page.fill('input[placeholder*="mật khẩu"]', '123');
  36 |     await page.click('button[type="submit"]');
  37 | 
  38 |     // Đợi chuyển trang
  39 |     await expect(page).toHaveURL(/.*\/report/, { timeout: 10000 });
  40 |     await expect(page.locator('body')).toContainText('Khoa Nội');
  41 |   });
  42 | 
  43 |   test('Đăng nhập thành công với tài khoản Quản trị KHNV (Khnv) và chuyển hướng vào /admin', async ({ page }) => {
  44 |     await page.goto('/');
  45 |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  46 |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  47 |     await page.click('button[type="submit"]');
  48 | 
  49 |     // Đợi chuyển hướng đến Admin Dashboard
  50 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
  51 |     await expect(page.locator('body')).toContainText('Báo Cáo Giao Ban');
  52 |   });
  53 | 
  54 |   test('Đăng xuất thành công và quay trở lại màn hình đăng nhập', async ({ page }) => {
  55 |     await page.goto('/');
  56 |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  57 |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  58 |     await page.click('button[type="submit"]');
  59 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
  60 | 
  61 |     // Bấm nút Đăng xuất
  62 |     const logoutBtn = page.locator('button:has-text("Đăng xuất")');
  63 |     await expect(logoutBtn).toBeVisible();
  64 |     await logoutBtn.click();
  65 | 
  66 |     // Xác nhận đã quay về /login hoặc /
  67 |     await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 5000 });
  68 |     await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');
  69 |   });
  70 | 
  71 | });
  72 | 
```