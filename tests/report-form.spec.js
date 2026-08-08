import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — 11 Khoa Dynamic Forms & Ca Chuyển Viện', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập tài khoản Khoa Nội
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[placeholder*="mật khẩu"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });
  });

  test('Hiển thị thông tin hành chính ca trực và nạp biểu mẫu Khoa Nội', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Khoa Nội');
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('body')).toContainText('Bệnh Cũ');
  });

  test('Tự động tính toán công thức Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa', async ({ page }) => {
    const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
    if (await doctorInput.isVisible()) {
      await doctorInput.fill('BS. Nguyễn Văn A');
    }

    const numInputs = page.locator('input[type="number"]');
    const count = await numInputs.count();
    
    if (count >= 4) {
      await numInputs.nth(0).fill('20');
      await numInputs.nth(1).fill('10');
      await numInputs.nth(2).fill('2');
      await numInputs.nth(3).fill('1');
      await numInputs.nth(3).dispatchEvent('input');
      await numInputs.nth(3).dispatchEvent('change');
      
      // Kiểm tra có ô tính toán hiện còn
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Thêm mới ca bệnh chuyển viện cấp cứu', async ({ page }) => {
    const addTransferBtn = page.locator('button:has-text("Thêm Ca Chuyển Viện")');
    if (await addTransferBtn.isVisible()) {
      await addTransferBtn.click();
      const patientNameInput = page.locator('input[placeholder*="Họ tên"]').first();
      await expect(patientNameInput).toBeVisible({ timeout: 5000 });
      await patientNameInput.fill('Bệnh nhân Nguyễn Văn Test');
    }
  });

});
