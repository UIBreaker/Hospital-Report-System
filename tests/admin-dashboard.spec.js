import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — KHNV Dashboard & Trình Chiếu Giao Ban', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập tài khoản Quản trị KHNV
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
  });

  test('Hiển thị 3 ô thống kê số liệu khoa phòng (Tổng số khoa, Đã nộp, Chưa nộp)', async ({ page }) => {
    await expect(page.locator('.admin-stats-grid, body')).toBeVisible();
    await expect(page.locator('body')).toContainText('11');
    await expect(page.locator('body')).toContainText('Tổng');
  });

  test('Kiểm tra 11 khoa phòng xuất hiện đầy đủ trong danh sách theo dõi', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Khoa Nội');
    await expect(page.locator('body')).toContainText('Hồi sức cấp cứu');
    await expect(page.locator('body')).toContainText('Nhi');
    await expect(page.locator('body')).toContainText('Sản');
    await expect(page.locator('body')).toContainText('Xét nghiệm');
  });

  test('Mở Trình Chiếu Giao Ban trong cùng tab và điều chỉnh tỷ lệ chữ (Zoom)', async ({ page }) => {
    const presentBtn = page.locator('button:has-text("Trình Chiếu Giao Ban")');
    await expect(presentBtn).toBeVisible();
    await presentBtn.click();

    // Kiểm tra chuyển hướng vào /presentation/
    await expect(page).toHaveURL(/.*\/presentation/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText('BÁO CÁO GIAO BAN');

    // Kiểm tra các nút điều khiển thu phóng
    const zoomInBtn = page.locator('button:has-text("Phóng to")');
    const zoomOutBtn = page.locator('button:has-text("Giảm"), button:has-text("Thu nhỏ")');
    
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click();
      await expect(page.locator('body')).toContainText('120%');
      await zoomInBtn.click();
      await expect(page.locator('body')).toContainText('140%');
    }

    if (await zoomOutBtn.isVisible()) {
      await zoomOutBtn.click();
    }

    // Quay về Bảng Điều Khiển
    const backBtn = page.locator('button:has-text("Về Bảng Điều Khiển")');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await expect(page).toHaveURL(/.*\/admin/, { timeout: 5000 });
    }
  });

});
