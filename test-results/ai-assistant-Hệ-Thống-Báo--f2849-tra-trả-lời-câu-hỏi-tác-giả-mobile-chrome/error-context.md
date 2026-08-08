# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-assistant.spec.js >> Hệ Thống Báo Cáo Giao Ban — Trợ Lý Y Tế AI (AI Assistant) >> Mở hộp chat Trợ Lý Y Tế AI và kiểm tra trả lời câu hỏi tác giả
- Location: tests\ai-assistant.spec.js:5:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.ai-chatbox-window, body')
Expected substring: "Nguyễn Vũ Nhật Nam"
Error: strict mode violation: locator('.ai-chatbox-window, body') resolved to 2 elements:
    1) <body>…</body> aka locator('body')
    2) <div class="ai-chatbox-window">…</div> aka getByText('Trợ Lý Y Tế AI OnlineTTYT Khu Vực Bình Long • Hỗ trợ trực tuyến👋 Xin chào quý')

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.ai-chatbox-window, body')

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
        - generic [ref=e68]: Ai là người phát triển phần mềm này?
        - generic [ref=e69]: 11:53 PM
      - generic [ref=e70]:
        - generic [ref=e71]: "👨‍💻 TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM: ✨ Họ và tên: NGUYỄN VŨ NHẬT NAM 📅 Năm sinh: 2004 🏥 Đơn vị phát triển: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long. 🎯 Phần mềm được lập trình tối ưu hóa giúp các khoa phòng nhập báo cáo nhanh chóng, tự động hóa tổng hợp số liệu giao ban và hỗ trợ trình chiếu slide chuyên nghiệp cho Ban Giám Đốc!"
        - generic [ref=e72]: 11:53 PM
    - generic [ref=e73]:
      - button "👨‍💻 Ai là tác giả phát triển phần mềm?" [active] [ref=e74] [cursor=pointer]
      - button "🔑 Cấp tài khoản cho khoa của tôi" [ref=e75] [cursor=pointer]
      - button "📝 Hướng dẫn phím tắt \"lorem + Enter\"" [ref=e76] [cursor=pointer]
      - button "🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện" [ref=e77] [cursor=pointer]
      - button "📺 Hướng dẫn Trình Chiếu Giao Ban" [ref=e78] [cursor=pointer]
      - button "🛡️ Tài khoản Quản trị viên (Admin)" [ref=e79] [cursor=pointer]
    - generic [ref=e80]:
      - textbox "Nhập câu hỏi hoặc tên khoa phòng..." [ref=e81]
      - button [disabled] [ref=e82]
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
  8  |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
  9  |     await expect(aiBtn).toBeVisible({ timeout: 15000 });
  10 |     await aiBtn.click();
  11 | 
  12 |     // Tìm câu hỏi có sẵn về tác giả
  13 |     const authorBtn = page.locator('button:has-text("tác giả")').first();
  14 |     if (await authorBtn.isVisible({ timeout: 5000 })) {
  15 |       await authorBtn.click();
> 16 |       await expect(page.locator('.ai-chatbox-window, body')).toContainText('Nguyễn Vũ Nhật Nam');
     |                                                              ^ Error: expect(locator).toContainText(expected) failed
  17 |     }
  18 |   });
  19 | 
  20 |   test('Trợ lý AI hỗ trợ điền tự động tài khoản khoa vào form đăng nhập', async ({ page }) => {
  21 |     await page.goto('/');
  22 |     
  23 |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
  24 |     await expect(aiBtn).toBeVisible();
  25 |     await aiBtn.click();
  26 | 
  27 |     const deptChip = page.locator('button:has-text("Khoa"), button:has-text("Nội"), button:has-text("Hồi sức")').first();
  28 |     if (await deptChip.isVisible({ timeout: 5000 })) {
  29 |       await deptChip.click();
  30 |       
  31 |       const autoFillBtn = page.locator('button:has-text("Điền"), button:has-text("Tự Động")').first();
  32 |       if (await autoFillBtn.isVisible({ timeout: 5000 })) {
  33 |         await autoFillBtn.click();
  34 |         const usernameVal = await page.locator('input[placeholder*="Khnv"]').inputValue();
  35 |         expect(usernameVal.length).toBeGreaterThan(0);
  36 |       }
  37 |     }
  38 |   });
  39 | 
  40 | });
  41 | 
```