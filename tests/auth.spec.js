import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Authentication & Access Control', () => {

  test('Hiển thị giao diện trang đăng nhập đúng chuẩn thương hiệu TTYT Bình Long', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Hệ Thống Báo Cáo Giao Ban');
    await expect(page.locator('h2')).toContainText('TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG');
    await expect(page.locator('input[placeholder*="Khnv"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');
    await expect(page.locator('body')).toContainText('Phiên bản');
  });

  test('Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'user_khong_ton_tai');
    await page.fill('input[placeholder*="mật khẩu"]', 'pass_sai_123');
    await page.click('button[type="submit"]');

    // Chờ thông báo lỗi xuất hiện
    await expect(page.locator('.glass-card, body')).toContainText(/thất bại|không chính xác|⚠️|Invalid/i, { timeout: 10000 });
  });

  test('Đăng nhập thành công với tài khoản Khoa Nội (noi.bvbl) và chuyển hướng vào /report', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[placeholder*="mật khẩu"]', '123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Khoa Nội');
  });

  test('Đăng nhập thành công với tài khoản Quản trị KHNV (Khnv) và chuyển hướng vào /admin', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText('KHNV');
  });

  test('Đăng xuất thành công và quay trở lại màn hình đăng nhập', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    const logoutBtn = page.locator('button:has-text("Đăng xuất")');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
  });

});
