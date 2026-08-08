import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Lorem Shortcut Generator', () => {

  test('Gõ lorem + Enter trong ô nhập liệu tự động sinh đoạn văn bản mẫu', async ({ page }) => {
    // Đăng nhập vào trang nhập báo cáo
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[placeholder*="mật khẩu"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/report/, { timeout: 10000 });

    // Tìm một ô input hoặc textarea ghi chú
    const textInput = page.locator('textarea, input[type="text"]').last();
    if (await textInput.isVisible()) {
      await textInput.click();
      await textInput.fill('lorem');
      await textInput.press('Enter');

      // Giá trị phải được sinh ra nhiều hơn 5 ký tự
      const val = await textInput.inputValue();
      expect(val.length).toBeGreaterThan(5);
    }
  });

});
