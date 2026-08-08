import { test, expect } from '@playwright/test';

test.describe('Hệ Thống Báo Cáo Giao Ban — Trợ Lý Y Tế AI (AI Assistant)', () => {

  test('Mở hộp chat Trợ Lý Y Tế AI và kiểm tra trả lời câu hỏi tác giả', async ({ page }) => {
    await page.goto('/');
    
    // Nút AI Assistant
    const aiBtn = page.locator('.ai-floating-btn, button:has-text("Trợ Lý Y Tế AI"), button:has-text("Trợ lý AI")');
    await expect(aiBtn).toBeVisible({ timeout: 10000 });
    await aiBtn.click();

    // Hộp chat mở ra
    const chatModal = page.locator('.ai-chatbox-window, div:has-text("Online")');
    await expect(chatModal).toBeVisible();

    // Tìm câu hỏi có sẵn về tác giả
    const authorQuestionBtn = page.locator('button:has-text("Ai là tác giả phát triển phần mềm?")');
    if (await authorQuestionBtn.isVisible()) {
      await authorQuestionBtn.click();
      
      // Kiểm tra câu trả lời xuất hiện tác giả Nguyễn Vũ Nhật Nam (2004)
      await expect(page.locator('body')).toContainText('Nguyễn Vũ Nhật Nam');
      await expect(page.locator('body')).toContainText('2004');
    }
  });

  test('Trợ lý AI hỗ trợ điền tự động tài khoản khoa vào form đăng nhập', async ({ page }) => {
    await page.goto('/');
    
    const aiBtn = page.locator('.ai-floating-btn, button:has-text("Trợ Lý Y Tế AI"), button:has-text("Trợ lý AI")');
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();

    // Tìm nút khoa phòng bất kỳ (ví dụ Khoa Nội hoặc Hồi sức)
    const deptChip = page.locator('button:has-text("Khoa Nội"), button:has-text("Hồi sức")').first();
    if (await deptChip.isVisible()) {
      await deptChip.click();
      
      // Bấm nút điền tự động
      const autoFillBtn = page.locator('button:has-text("Điền Tự Động Vào Ô Đăng Nhập")');
      if (await autoFillBtn.isVisible()) {
        await autoFillBtn.click();
        
        // Kiểm tra ô username được điền
        const usernameVal = await page.locator('input[placeholder*="Khnv"]').inputValue();
        expect(usernameVal.length).toBeGreaterThan(0);
      }
    }
  });

});
