# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-dashboard.spec.js >> Hệ Thống Báo Cáo Giao Ban — KHNV Dashboard & Trình Chiếu Giao Ban >> Hiển thị 3 ô thống kê số liệu khoa phòng (Tổng số khoa, Đã nộp, Chưa nộp)
- Location: tests\admin-dashboard.spec.js:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.admin-stats-grid, body')
Expected: visible
Error: strict mode violation: locator('.admin-stats-grid, body') resolved to 2 elements:
    1) <body>…</body> aka locator('body')
    2) <div class="admin-stats-grid">…</div> aka getByText('0Tổng số khoa0Đã nộp0Chưa nộp')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.admin-stats-grid, body')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img "Logo TTYT Bình Long" [ref=e6]
      - generic [ref=e7]:
        - heading "TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG" [level=4] [ref=e8]
        - heading "KHNV — Theo Dõi Báo Cáo Giao Ban" [level=2] [ref=e9]
    - generic [ref=e10]:
      - textbox [ref=e14]: 2026-08-07
      - button "Làm mới dữ liệu" [ref=e15] [cursor=pointer]
      - button "Trình Chiếu Giao Ban" [ref=e18] [cursor=pointer]
      - button "Đăng xuất" [ref=e21] [cursor=pointer]
  - generic [ref=e24]:
    - generic [ref=e25]:
      - generic [ref=e26]: "0"
      - generic [ref=e27]: Tổng số khoa
    - generic [ref=e28]:
      - generic [ref=e29]: "0"
      - generic [ref=e30]: Đã nộp
    - generic [ref=e31]:
      - generic [ref=e32]: "0"
      - generic [ref=e33]: Chưa nộp
  - paragraph [ref=e37]: Đang tải dữ liệu báo cáo...
  - generic [ref=e41]:
    - text: Phiên bản
    - strong [ref=e42]: "1.0"
  - button "Trợ Lý Y Tế AI Hỏi đáp & Lấy tài khoản khoa" [ref=e44] [cursor=pointer]:
    - generic [ref=e48]:
      - generic [ref=e49]: Trợ Lý Y Tế AI
      - generic [ref=e50]: Hỏi đáp & Lấy tài khoản khoa
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hệ Thống Báo Cáo Giao Ban — KHNV Dashboard & Trình Chiếu Giao Ban', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Đăng nhập tài khoản Quản trị KHNV
  7  |     await page.goto('/');
  8  |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  9  |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  10 |     await page.click('button[type="submit"]');
  11 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
  12 |   });
  13 | 
  14 |   test('Hiển thị 3 ô thống kê số liệu khoa phòng (Tổng số khoa, Đã nộp, Chưa nộp)', async ({ page }) => {
> 15 |     await expect(page.locator('.admin-stats-grid, body')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  16 |     await expect(page.locator('body')).toContainText('11');
  17 |     await expect(page.locator('body')).toContainText('Tổng');
  18 |   });
  19 | 
  20 |   test('Kiểm tra 11 khoa phòng xuất hiện đầy đủ trong danh sách theo dõi', async ({ page }) => {
  21 |     await expect(page.locator('body')).toContainText('Khoa Nội');
  22 |     await expect(page.locator('body')).toContainText('Hồi sức cấp cứu');
  23 |     await expect(page.locator('body')).toContainText('Nhi');
  24 |     await expect(page.locator('body')).toContainText('Sản');
  25 |     await expect(page.locator('body')).toContainText('Xét nghiệm');
  26 |   });
  27 | 
  28 |   test('Mở Trình Chiếu Giao Ban trong cùng tab và điều chỉnh tỷ lệ chữ (Zoom)', async ({ page }) => {
  29 |     const presentBtn = page.locator('button:has-text("Trình Chiếu Giao Ban")');
  30 |     await expect(presentBtn).toBeVisible();
  31 |     await presentBtn.click();
  32 | 
  33 |     // Kiểm tra chuyển hướng vào /presentation/
  34 |     await expect(page).toHaveURL(/.*\/presentation/, { timeout: 10000 });
  35 |     await expect(page.locator('body')).toContainText('BÁO CÁO GIAO BAN');
  36 | 
  37 |     // Kiểm tra các nút điều khiển thu phóng
  38 |     const zoomInBtn = page.locator('button:has-text("Phóng to")');
  39 |     const zoomOutBtn = page.locator('button:has-text("Giảm"), button:has-text("Thu nhỏ")');
  40 |     
  41 |     if (await zoomInBtn.isVisible()) {
  42 |       await zoomInBtn.click();
  43 |       await expect(page.locator('body')).toContainText('120%');
  44 |       await zoomInBtn.click();
  45 |       await expect(page.locator('body')).toContainText('140%');
  46 |     }
  47 | 
  48 |     if (await zoomOutBtn.isVisible()) {
  49 |       await zoomOutBtn.click();
  50 |     }
  51 | 
  52 |     // Quay về Bảng Điều Khiển
  53 |     const backBtn = page.locator('button:has-text("Về Bảng Điều Khiển")');
  54 |     if (await backBtn.isVisible()) {
  55 |       await backBtn.click();
  56 |       await expect(page).toHaveURL(/.*\/admin/, { timeout: 5000 });
  57 |     }
  58 |   });
  59 | 
  60 | });
  61 | 
```