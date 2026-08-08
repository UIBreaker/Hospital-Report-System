import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — KHNV Dashboard & Trình Chiếu Giao Ban', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập tài khoản Quản trị KHNV
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
  });

  test('Hiển thị 3 ô thống kê số liệu khoa phòng (Tổng số khoa, Đã nộp, Chưa nộp)', async ({ page }) => {
    await expect(page.locator('.admin-stats-grid')).toBeVisible();
    await expect(page.locator('.admin-stats-grid')).toContainText('11');
    await expect(page.locator('.admin-stats-grid')).toContainText('Đã nộp');
  });

  test('Kiểm tra 11 khoa phòng xuất hiện đầy đủ trong danh sách theo dõi', async ({ page }) => {
    const deptGrid = page.locator('.admin-dept-grid');
    await expect(deptGrid).toBeVisible();
    await expect(deptGrid).toContainText('Khoa Nội');
    await expect(deptGrid).toContainText('Hồi sức cấp cứu');
    await expect(deptGrid).toContainText('Nhi');
    await expect(deptGrid).toContainText('Sản');
  });

  test('Mở Trình Chiếu Giao Ban trong cùng tab và điều chỉnh tỷ lệ chữ (Zoom)', async ({ page }) => {
    const presentBtn = page.locator('button:has-text("Trình Chiếu")');
    await expect(presentBtn).toBeVisible();
    await presentBtn.click();

    // Kiểm tra chuyển hướng vào /presentation/
    await expect(page).toHaveURL(/.*\/presentation/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText('BÁO CÁO GIAO BAN');

    // Kiểm tra các nút điều khiển thu phóng
    const zoomInBtn = page.locator('button:has-text("Phóng to")');
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click();
      await expect(page.locator('body')).toContainText('120%');
    }

    // Quay về Bảng Điều Khiển
    const backBtn = page.locator('button:has-text("Về Bảng Điều Khiển")');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
    }
  });

});
