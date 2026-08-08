# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-responsive.spec.js >> Hệ Thống Báo Cáo Giao Ban — Mobile Responsive Layout >> Admin Dashboard trên mobile hiển thị 3 ô thống kê cân đối và danh sách 1 cột
- Location: tests\mobile-responsive.spec.js:24:7

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
  - button "Trợ Lý Y Tế AI" [ref=e44] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hệ Thống Báo Cáo Giao Ban — Mobile Responsive Layout', () => {
  4  | 
  5  |   test('Hiển thị giao diện đăng nhập tối ưu trên màn hình điện thoại (390px)', async ({ page }) => {
  6  |     // Đặt viewport chuẩn smartphone
  7  |     await page.setViewportSize({ width: 390, height: 844 });
  8  |     await page.goto('/');
  9  | 
  10 |     // Kiểm tra card đăng nhập không bị tràn ngang
  11 |     const loginCard = page.locator('.login-card, .glass-card').first();
  12 |     await expect(loginCard).toBeVisible();
  13 | 
  14 |     const box = await loginCard.boundingBox();
  15 |     if (box) {
  16 |       expect(box.width).toBeLessThanOrEqual(390);
  17 |     }
  18 | 
  19 |     // Nút Trợ lý AI ở mobile hiển thị gọn gàng
  20 |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
  21 |     await expect(aiBtn).toBeVisible();
  22 |   });
  23 | 
  24 |   test('Admin Dashboard trên mobile hiển thị 3 ô thống kê cân đối và danh sách 1 cột', async ({ page }) => {
  25 |     await page.setViewportSize({ width: 390, height: 844 });
  26 |     await page.goto('/');
  27 |     await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  28 |     await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
  29 |     await page.click('button[type="submit"]');
  30 |     await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
  31 | 
  32 |     // Kiểm tra các ô thống kê không bị rớt dòng đơn chữ
> 33 |     await expect(page.locator('.admin-stats-grid, body')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  34 |     await expect(page.locator('body')).toContainText('11');
  35 |   });
  36 | 
  37 | });
  38 | 
```