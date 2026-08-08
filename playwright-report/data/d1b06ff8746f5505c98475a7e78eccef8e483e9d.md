# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-assistant.spec.js >> Hệ Thống Báo Cáo Giao Ban — Trợ Lý Y Tế AI (AI Assistant) >> Mở hộp chat Trợ Lý Y Tế AI và kiểm tra trả lời câu hỏi tác giả
- Location: tests\ai-assistant.spec.js:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.ai-chatbox-window, div:has-text("Online")')
Expected: visible
Error: strict mode violation: locator('.ai-chatbox-window, div:has-text("Online")') resolved to 7 elements:
    1) <div id="root">…</div> aka locator('#root')
    2) <div class="login-wrapper">…</div> aka locator('div').nth(1)
    3) <div class="ai-chatbox-window">…</div> aka getByText('Trợ Lý Y Tế AI OnlineTTYT Khu Vực Bình Long • Hỗ trợ trực tuyến👋 Xin chào quý')
    4) <div>…</div> aka locator('div').filter({ hasText: 'Trợ Lý Y Tế AI OnlineTTYT Khu' }).nth(3)
    5) <div>…</div> aka locator('div').filter({ hasText: 'Trợ Lý Y Tế AI OnlineTTYT Khu' }).nth(4)
    6) <div>…</div> aka getByText('Trợ Lý Y Tế AI OnlineTTYT Khu')
    7) <div>…</div> aka getByText('Trợ Lý Y Tế AI Online')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.ai-chatbox-window, div:has-text("Online")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img "Logo TTYT Bình Long" [ref=e7]
      - heading "TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG" [level=2] [ref=e8]
      - heading "Hệ Thống Báo Cáo Giao Ban" [level=1] [ref=e9]
      - paragraph [ref=e10]: Đăng nhập tài khoản khoa phòng hoặc quản trị
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Tên đăng nhập
        - 'textbox "VD: Khnv hoặc noi.bvbl" [ref=e17]'
      - generic [ref=e18]:
        - generic [ref=e19]: Mật khẩu
        - generic [ref=e20]:
          - textbox "Nhập mật khẩu" [ref=e23]
          - button [ref=e24] [cursor=pointer]
      - button "Đăng Nhập" [disabled] [ref=e27] [cursor=pointer]
    - generic [ref=e28]:
      - generic [ref=e29]:
        - text: Phiên bản
        - strong [ref=e32]: "1.0"
      - generic [ref=e33]: TTYT Bình Long
  - generic [ref=e34]: © 2026 Trung Tâm Y Tế Khu Vực Bình Long.
  - generic [ref=e35]:
    - generic [ref=e36]:
      - generic [ref=e41]:
        - generic [ref=e42]:
          - text: Trợ Lý Y Tế AI
          - generic [ref=e43]: Online
        - generic [ref=e44]: TTYT Khu Vực Bình Long • Hỗ trợ trực tuyến
      - button [ref=e45] [cursor=pointer]
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]: 👋 Xin chào quý Bác sĩ và Cán bộ y tế! Tôi là Trợ Lý AI của Hệ Thống Báo Cáo Giao Ban – TTYT Khu Vực Bình Long.
        - generic [ref=e51]: Vừa xong
      - generic [ref=e52]:
        - generic [ref=e53]: "💡 Bạn đang công tác tại Khoa/Phòng nào? Hãy chọn khoa bên dưới để tôi hướng dẫn và cấp tài khoản đăng nhập nhé! (Lưu ý: Trừ tài khoản Admin)"
        - generic [ref=e54]:
          - button "🏥 Khoa Nội" [ref=e55] [cursor=pointer]
          - button "🏥 Hồi sức cấp cứu – Thận nhân tạo" [ref=e56] [cursor=pointer]
          - button "🏥 Chẩn đoán hình ảnh" [ref=e57] [cursor=pointer]
          - button "🏥 Y học cổ truyền – PHCN" [ref=e58] [cursor=pointer]
          - button "🏥 Ngoại tổng hợp" [ref=e59] [cursor=pointer]
          - button "🏥 Chấn thương chỉnh hình" [ref=e60] [cursor=pointer]
          - button "🏥 Khoa Nhi" [ref=e61] [cursor=pointer]
          - button "🏥 Khoa Nhiễm" [ref=e62] [cursor=pointer]
          - button "🏥 Gây mê Hồi sức" [ref=e63] [cursor=pointer]
          - button "🏥 Khoa Sản" [ref=e64] [cursor=pointer]
          - button "🏥 Khoa Xét nghiệm" [ref=e65] [cursor=pointer]
        - generic [ref=e66]: Vừa xong
    - generic [ref=e67]:
      - button "👨‍💻 Ai là tác giả phát triển phần mềm?" [ref=e68] [cursor=pointer]
      - button "🔑 Cấp tài khoản cho khoa của tôi" [ref=e69] [cursor=pointer]
      - button "📝 Hướng dẫn phím tắt \"lorem + Enter\"" [ref=e70] [cursor=pointer]
      - button "🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện" [ref=e71] [cursor=pointer]
      - button "📺 Hướng dẫn Trình Chiếu Giao Ban" [ref=e72] [cursor=pointer]
      - button "🛡️ Tài khoản Quản trị viên (Admin)" [ref=e73] [cursor=pointer]
    - generic [ref=e74]:
      - textbox "Nhập câu hỏi hoặc tên khoa phòng..." [ref=e75]
      - button [disabled] [ref=e76]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hệ Thống Báo Cáo Giao Ban — Trợ Lý Y Tế AI (AI Assistant)', () => {
  4  | 
  5  |   test('Mở hộp chat Trợ Lý Y Tế AI và kiểm tra trả lời câu hỏi tác giả', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     // Nút AI Assistant
  9  |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("Trợ Lý Y Tế AI"), button:has-text("Trợ lý AI")');
  10 |     await expect(aiBtn).toBeVisible({ timeout: 10000 });
  11 |     await aiBtn.click();
  12 | 
  13 |     // Hộp chat mở ra
  14 |     const chatModal = page.locator('.ai-chatbox-window, div:has-text("Online")');
> 15 |     await expect(chatModal).toBeVisible();
     |                             ^ Error: expect(locator).toBeVisible() failed
  16 | 
  17 |     // Tìm câu hỏi có sẵn về tác giả
  18 |     const authorQuestionBtn = page.locator('button:has-text("Ai là tác giả phát triển phần mềm?")');
  19 |     if (await authorQuestionBtn.isVisible()) {
  20 |       await authorQuestionBtn.click();
  21 |       
  22 |       // Kiểm tra câu trả lời xuất hiện tác giả Nguyễn Vũ Nhật Nam (2004)
  23 |       await expect(page.locator('body')).toContainText('Nguyễn Vũ Nhật Nam');
  24 |       await expect(page.locator('body')).toContainText('2004');
  25 |     }
  26 |   });
  27 | 
  28 |   test('Trợ lý AI hỗ trợ điền tự động tài khoản khoa vào form đăng nhập', async ({ page }) => {
  29 |     await page.goto('/');
  30 |     
  31 |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("Trợ Lý Y Tế AI"), button:has-text("Trợ lý AI")');
  32 |     await expect(aiBtn).toBeVisible();
  33 |     await aiBtn.click();
  34 | 
  35 |     // Tìm nút khoa phòng bất kỳ (ví dụ Khoa Nội hoặc Hồi sức)
  36 |     const deptChip = page.locator('button:has-text("Khoa Nội"), button:has-text("Hồi sức")').first();
  37 |     if (await deptChip.isVisible()) {
  38 |       await deptChip.click();
  39 |       
  40 |       // Bấm nút điền tự động
  41 |       const autoFillBtn = page.locator('button:has-text("Điền Tự Động Vào Ô Đăng Nhập")');
  42 |       if (await autoFillBtn.isVisible()) {
  43 |         await autoFillBtn.click();
  44 |         
  45 |         // Kiểm tra ô username được điền
  46 |         const usernameVal = await page.locator('input[placeholder*="Khnv"]').inputValue();
  47 |         expect(usernameVal.length).toBeGreaterThan(0);
  48 |       }
  49 |     }
  50 |   });
  51 | 
  52 | });
  53 | 
```