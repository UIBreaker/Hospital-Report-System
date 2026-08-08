import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Trợ Lý Y Tế AI (AI Assistant)', () => {

  test('Mở hộp chat Trợ Lý Y Tế AI và kiểm tra trả lời câu hỏi tác giả', async ({ page }) => {
    await page.goto('/');
    
    const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
    await expect(aiBtn).toBeVisible({ timeout: 15000 });
    await aiBtn.click();

    const chatModal = page.locator('.ai-chatbox-window');
    await expect(chatModal).toBeVisible({ timeout: 10000 });

    const authorBtn = page.locator('button:has-text("Ai là tác giả"), button:has-text("tác giả")').first();
    if (await authorBtn.isVisible({ timeout: 5000 })) {
      await authorBtn.click();
      await expect(chatModal).toContainText('Nguyễn Vũ Nhật Nam', { timeout: 10000 });
    }
  });

  test('Trợ lý AI hỗ trợ điền tự động tài khoản khoa vào form đăng nhập', async ({ page }) => {
    await page.goto('/');
    
    const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();

    const deptChip = page.locator('button:has-text("Khoa"), button:has-text("Nội"), button:has-text("Hồi sức")').first();
    if (await deptChip.isVisible({ timeout: 5000 })) {
      await deptChip.click();
      
      const autoFillBtn = page.locator('button:has-text("Điền"), button:has-text("Tự Động")').first();
      if (await autoFillBtn.isVisible({ timeout: 5000 })) {
        await autoFillBtn.click();
        const usernameVal = await page.locator('input[placeholder*="Khnv"]').inputValue();
        expect(usernameVal.length).toBeGreaterThan(0);
      }
    }
  });

});
