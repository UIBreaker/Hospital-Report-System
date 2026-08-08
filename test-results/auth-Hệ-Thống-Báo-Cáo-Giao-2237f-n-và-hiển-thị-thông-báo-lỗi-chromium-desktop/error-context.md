# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Hệ Thống Báo Cáo Giao Ban — Authentication & Access Control >> Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi
- Location: tests\auth.spec.js:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div:has-text("⚠️"), div:has-text("thất bại"), div:has-text("chính xác")').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('div:has-text("⚠️"), div:has-text("thất bại"), div:has-text("chính xác")').first()

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
- button "Trợ Lý Y Tế AI Hỏi đáp & Lấy tài khoản khoa":
  - img
  - text: Trợ Lý Y Tế AI Hỏi đáp & Lấy tài khoản khoa
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
  8  |     await expect(page.locator('h1')).toContainText('Hệ Thống Báo Cáo Giao Ban');
  9  |     await expect(page.locator('h2')).toContainText('TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG');
  10 |     await expect(page.locator('input[placeholder*="Khnv"]')).toBeVisible();
  11 |     await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');
  12 |     await expect(page.locator('body')).toContainText('Phiên bản');
  13 |   });
  14 | 
  15 |   test('Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi', async ({ page }) => {
  16 |     await page.goto('/');
  17 |     await page.fill('input[placeholder*="Khnv"]', 'user_khong_ton_tai');
  18 |     await page.fill('input[placeholder*="mật khẩu"]', 'pass_sai_123');
  19 |     await page.click('button[type="submit"]');
  20 | 
  21 |     const errorMsg = page.locator('div:has-text("⚠️"), div:has-text("thất bại"), div:has-text("chính xác")').first();
> 22 |     await expect(errorMsg).toBeVisible({ timeout: 8000 });
     |                            ^ Error: expect(locator).toBeVisible() failed
  23 |   });
  24 | 
  25 |   test('Đăng nhập thành công với tài khoản Khoa Nội (noi.bvbl) và chuyển hướng vào /report', async ({ page }) => {
  26 |     await page.goto('/');
  27 |     await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
  28 |     await page.fill('input[placeholder*="mật khẩu"]', '123');
  29 |     await page.click('button[type="submit"]');
  30 | 
  31 |     await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });
  32 |     await expect(page.locator('body')).toContainText('Khoa Nội');
  33 |   });
  34 | 
  35 |   test('Đăng nhập thành công với tài khoản Quản trị KHNV (Khnv) và chuyển hướng vào /admin', async ({ page }) => {
  36 |     await page.goto('/');
  37 |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  38 |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  39 |     await page.click('button[type="submit"]');
  40 | 
  41 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
  42 |     await expect(page.locator('body')).toContainText('KHNV');
  43 |   });
  44 | 
  45 |   test('Đăng xuất thành công và quay trở lại màn hình đăng nhập', async ({ page }) => {
  46 |     await page.goto('/');
  47 |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  48 |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  49 |     await page.click('button[type="submit"]');
  50 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
  51 | 
  52 |     const logoutBtn = page.locator('button:has-text("Đăng xuất")');
  53 |     await expect(logoutBtn).toBeVisible();
  54 |     await logoutBtn.click();
  55 | 
  56 |     await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
  57 |   });
  58 | 
  59 | });
  60 | 
```