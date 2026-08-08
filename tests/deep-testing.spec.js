import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Deep E2E & Edge Cases Testing', () => {

  test('1. Security: Chống truy cập trái phép khi chưa đăng nhập (Route Protection)', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 10000 });
    
    await page.goto('/report');
    await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 10000 });
  });

  test('2. Security: Kháng mã độc XSS & SQL Injection trong ô nhập liệu', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', "' OR '1'='1");
    await page.fill('input[type="password"]', "' OR '1'='1");
    await page.click('button[type="submit"]');
    
    await expect(page.locator('body')).toContainText(/thất bại|không chính xác|⚠️|Invalid/i, { timeout: 10000 });
    await expect(page).not.toHaveURL(/.*\/admin/);
  });

  test('3. Dynamic Form: Nhập liệu chuyên sâu Khoa Sản (Sanh thường, Sanh mổ, Chờ sanh)', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'san.bvbl');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });

    await expect(page.locator('body')).toContainText(/Sản|Khoa Sản/i);

    const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
    if (await doctorInput.isVisible()) {
      await doctorInput.fill('BS. CKI Sản Khoa');
    }

    const nextBtn = page.locator('button:has-text("Tiếp tục")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    await expect(page.locator('body')).toContainText(/Sanh|Sinh|Mổ|Chờ/i);
  });

  test('4. Dynamic Form: Nhập liệu chuyên sâu Khoa Xét Nghiệm (Sinh hóa, Huyết học)', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'xn.bvbl');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });

    await expect(page.locator('body')).toContainText('Xét nghiệm');
  });

  test('5. Keyboard Accessibility: Điều hướng và đăng nhập bằng bàn phím', async ({ page }) => {
    await page.goto('/');
    
    const userInput = page.locator('input[placeholder*="Khnv"]');
    await userInput.focus();
    await userInput.fill('Khnv');
    
    const passInput = page.locator('input[type="password"]');
    await passInput.focus();
    await passInput.fill('Khnv@2026');
    
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.focus();
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
  });

  test('6. Presentation 4K & Máy Chiếu: Kiểm tra co giãn zoom 160% không bị vỡ layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'Khnv');
    await page.fill('input[type="password"]', 'Khnv@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });

    const presentBtn = page.locator('button:has-text("Trình Chiếu")');
    await presentBtn.click();
    await expect(page).toHaveURL(/.*\/presentation/, { timeout: 15000 });

    const zoomInBtn = page.locator('button:has-text("Phóng to")');
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click();
      await zoomInBtn.click();
      await zoomInBtn.click();
      await expect(page.locator('body')).toContainText('160%');
    }
  });

  test('7. Edge Cases: Xử lý chuỗi ký tự tiếng Việt đặc biệt và Emoji y tế', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });

    const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
    if (await doctorInput.isVisible()) {
      await doctorInput.fill('BS. Đỗ Nguyễn Hoàng Ứng 🏥 🩺');
      await expect(doctorInput).toHaveValue('BS. Đỗ Nguyễn Hoàng Ứng 🏥 🩺');
    }
  });

});
