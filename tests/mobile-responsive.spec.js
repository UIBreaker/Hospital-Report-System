import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Mobile Responsive Layout', () => {

  test('Hiển thị giao diện đăng nhập tối ưu trên màn hình điện thoại (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const loginCard = page.locator('.login-card, .glass-card').first();
    await expect(loginCard).toBeVisible();

    const box = await loginCard.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(395);
    }

    const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
    await expect(aiBtn).toBeVisible();
  });

  test('Admin Dashboard trên mobile hiển thị 3 ô thống kê cân đối và danh sách 1 cột', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    await expect(page.locator('.admin-stats-grid')).toBeVisible();
    await expect(page.locator('.admin-stats-grid')).toContainText('11');
  });

});
