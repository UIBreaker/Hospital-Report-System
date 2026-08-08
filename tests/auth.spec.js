import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Authentication & Access Control', () => {

  test('Hiển thị giao diện trang đăng nhập đúng chuẩn thương hiệu TTYT Bình Long', async ({ page }) => {
    await page.goto('/');
    
    // Kiểm tra logo và tiêu đề
    await expect(page.locator('h1')).toContainText('Hệ Thống Báo Cáo Giao Ban');
    await expect(page.locator('h2')).toContainText('TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG');
    
    // Kiểm tra các trường nhập liệu
    await expect(page.locator('input[placeholder*="Khnv"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="mật khẩu"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');

    // Kiểm tra huy hiệu phiên bản 1.0
    await expect(page.locator('body')).toContainText('Phiên bản 1.0');
  });

  test('Đăng nhập thất bại khi nhập sai thông tin và hiển thị thông báo lỗi', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'taikhoan_khong_ton_tai');
    await page.fill('input[placeholder*="mật khẩu"]', 'sai_mat_khau_123');
    await page.click('button[type="submit"]');

    // Kiểm tra thông báo cảnh báo lỗi
    const errorBox = page.locator('div:has-text("⚠️")').first();
    await expect(errorBox).toBeVisible({ timeout: 5000 });
  });

  test('Đăng nhập thành công với tài khoản Khoa Nội (noi.bvbl) và chuyển hướng vào /report', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[placeholder*="mật khẩu"]', '123');
    await page.click('button[type="submit"]');

    // Đợi chuyển trang
    await expect(page).toHaveURL(/.*\/report/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText('Khoa Nội');
  });

  test('Đăng nhập thành công với tài khoản Quản trị KHNV (Khnv) và chuyển hướng vào /admin', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');

    // Đợi chuyển hướng đến Admin Dashboard
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText('Báo Cáo Giao Ban');
  });

  test('Đăng xuất thành công và quay trở lại màn hình đăng nhập', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[placeholder*="mật khẩu"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });

    // Bấm nút Đăng xuất
    const logoutBtn = page.locator('button:has-text("Đăng xuất")');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Xác nhận đã quay về /login hoặc /
    await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toContainText('Đăng Nhập');
  });

});
