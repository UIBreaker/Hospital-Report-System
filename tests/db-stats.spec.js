import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Quản Lý & Thống Kê Database', () => {

  test('Admin Khnv: Chuyển tab Quản Lý Database và xem thống kê dung lượng', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[type="password"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    // Kiểm tra nút Tab Quản Lý Database
    const dbTabBtn = page.locator('button:has-text("Quản Lý Database")');
    await expect(dbTabBtn).toBeVisible({ timeout: 5000 });
    await dbTabBtn.click();

    // Xác nhận đã vào giao diện Quản lý Database
    await expect(page.locator('body')).toContainText('Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu');
    await expect(page.locator('body')).toContainText('Tổng dung lượng đã dùng');
    await expect(page.locator('body')).toContainText('bảng dữ liệu');
  });

  test('Admin Khnv: Thao tác nút Làm Mới Dữ Liệu trên tab Database', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[type="password"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    await page.locator('button:has-text("Quản Lý Database")').click();
    
    // Nút làm mới dữ liệu
    const refreshBtn = page.locator('button:has-text("Làm Mới Dữ Liệu")');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();

    // Kiểm tra thông tin thời gian cập nhật xuất hiện
    await expect(page.locator('body')).toContainText('Cập nhật:');
  });

  test('Khoa thường (noi.bvbl) không thấy tab Quản Lý Database', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });

    // Đảm bảo không có nút Quản Lý Database trên giao diện khoa
    const dbTabBtn = page.locator('button:has-text("Quản Lý Database")');
    await expect(dbTabBtn).not.toBeVisible();
  });

});
