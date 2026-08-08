import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — 11 Khoa Dynamic Forms & Ca Chuyển Viện', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập tài khoản Khoa Nội
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[placeholder*="mật khẩu"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 10000 });
  });

  test('Hiển thị thông tin hành chính ca trực và nạp biểu mẫu Khoa Nội', async ({ page }) => {
    // Kiểm tra thông tin hành chính
    await expect(page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    
    // Kiểm tra các trường số liệu của Khoa Nội
    await expect(page.locator('body')).toContainText('Bệnh Cũ');
    await expect(page.locator('body')).toContainText('Bệnh Mới');
  });

  test('Tự động tính toán công thức Hiện còn = (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa', async ({ page }) => {
    // Điền bác sĩ trực
    const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]');
    await doctorInput.fill('BS. Nguyễn Văn A');

    // Tìm các ô số liệu
    const numInputs = page.locator('input[type="number"]');
    const count = await numInputs.count();
    
    if (count >= 4) {
      await numInputs.nth(0).fill('20'); // Bệnh cũ
      await numInputs.nth(1).fill('10'); // Bệnh mới
      await numInputs.nth(2).fill('2');  // Xuất viện
      await numInputs.nth(3).fill('1');  // Chuyển khoa

      // Kích hoạt tính toán
      await numInputs.nth(3).dispatchEvent('change');
      
      // Hiện còn phải là: 20 + 10 - 2 - 1 = 27
      await expect(page.locator('body')).toContainText('27');
    }
  });

  test('Thêm mới và Xóa ca bệnh chuyển viện cấp cứu linh hoạt', async ({ page }) => {
    const addTransferBtn = page.locator('button:has-text("Thêm Ca Chuyển Viện")');
    await expect(addTransferBtn).toBeVisible();
    
    // Bấm thêm ca chuyển viện
    await addTransferBtn.click();
    
    // Kiểm tra ô nhập thông tin bệnh nhân xuất hiện
    const patientNameInput = page.locator('input[placeholder*="Họ tên"]').first();
    await expect(patientNameInput).toBeVisible();
    await patientNameInput.fill('Bệnh nhân Trần Thị B - 54 tuổi');

    // Bấm xóa ca chuyển viện
    const deleteCaseBtn = page.locator('button[title*="Xóa"], button:has-text("Xóa ca")').first();
    if (await deleteCaseBtn.isVisible()) {
      await deleteCaseBtn.click();
    }
  });

});
