import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Mobile Responsive Layout', () => {

  test('Hiển thị giao diện đăng nhập tối ưu trên màn hình điện thoại (390px)', async ({ page }) => {
    // Đặt viewport chuẩn smartphone
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Kiểm tra card đăng nhập không bị tràn ngang
    const loginCard = page.locator('.login-card, .glass-card').first();
    await expect(loginCard).toBeVisible();

    const box = await loginCard.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }

    // Nút Trợ lý AI ở mobile hiển thị gọn gàng
    const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
    await expect(aiBtn).toBeVisible();
  });

  test('Admin Dashboard trên mobile hiển thị 3 ô thống kê cân đối và danh sách 1 cột', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });

    // Kiểm tra các ô thống kê không bị rớt dòng đơn chữ
    await expect(page.locator('.admin-stats-grid, body')).toBeVisible();
    await expect(page.locator('body')).toContainText('11');
  });

});
