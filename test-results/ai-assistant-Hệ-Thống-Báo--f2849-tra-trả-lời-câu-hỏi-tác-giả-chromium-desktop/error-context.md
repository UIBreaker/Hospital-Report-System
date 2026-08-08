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

Locator: locator('.ai-chatbox-window')
Timeout: 10000ms
- Expected substring  - 1
+ Received string     + 7

- Nguyễn Vũ Nhật Nam
+ Trợ Lý Y Tế AI OnlineTTYT Khu Vực Bình Long • Hỗ trợ trực tuyến👋 Xin chào quý Bác sĩ và Cán bộ y tế! Tôi là Trợ Lý AI của Hệ Thống Báo Cáo Giao Ban – TTYT Khu Vực Bình Long.Vừa xong💡 Bạn đang công tác tại Khoa/Phòng nào? Hãy chọn khoa bên dưới để tôi hướng dẫn và cấp tài khoản đăng nhập nhé! (Lưu ý: Trừ tài khoản Admin)🏥 Khoa Nội🏥 Hồi sức cấp cứu – Thận nhân tạo🏥 Chẩn đoán hình ảnh🏥 Y học cổ truyền – PHCN🏥 Ngoại tổng hợp🏥 Chấn thương chỉnh hình🏥 Khoa Nhi🏥 Khoa Nhiễm🏥 Gây mê Hồi sức🏥 Khoa Sản🏥 Khoa Xét nghiệmVừa xongAi là người phát triển phần mềm này?11:55 PM👨‍💻 TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM:
+
+ ✨ Họ và tên: NGUYỄN VŨ NHẬT NAM
+ 📅 Năm sinh: 2004
+ 🏥 Đơn vị phát triển: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long.
+
+ 🎯 Phần mềm được lập trình tối ưu hóa giúp các khoa phòng nhập báo cáo nhanh chóng, tự động hóa tổng hợp số liệu giao ban và hỗ trợ trình chiếu slide chuyên nghiệp cho Ban Giám Đốc!11:55 PM👨‍💻 Ai là tác giả phát triển phần mềm?🔑 Cấp tài khoản cho khoa của tôi📝 Hướng dẫn phím tắt "lorem + Enter"🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện📺 Hướng dẫn Trình Chiếu Giao Ban🛡️ Tài khoản Quản trị viên (Admin)

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('.ai-chatbox-window')
    23 × locator resolved to <div class="ai-chatbox-window">…</div>
       - unexpected value "Trợ Lý Y Tế AI OnlineTTYT Khu Vực Bình Long • Hỗ trợ trực tuyến👋 Xin chào quý Bác sĩ và Cán bộ y tế! Tôi là Trợ Lý AI của Hệ Thống Báo Cáo Giao Ban – TTYT Khu Vực Bình Long.Vừa xong💡 Bạn đang công tác tại Khoa/Phòng nào? Hãy chọn khoa bên dưới để tôi hướng dẫn và cấp tài khoản đăng nhập nhé! (Lưu ý: Trừ tài khoản Admin)🏥 Khoa Nội🏥 Hồi sức cấp cứu – Thận nhân tạo🏥 Chẩn đoán hình ảnh🏥 Y học cổ truyền – PHCN🏥 Ngoại tổng hợp🏥 Chấn thương chỉnh hình🏥 Khoa Nhi🏥 Khoa Nhiễm🏥 Gây mê Hồi sức🏥 Khoa Sản🏥 Khoa Xét nghiệmVừa xongAi là người phát triển phần mềm này?11:55 PM👨‍💻 TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM:

✨ Họ và tên: NGUYỄN VŨ NHẬT NAM
📅 Năm sinh: 2004
🏥 Đơn vị phát triển: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long.

🎯 Phần mềm được lập trình tối ưu hóa giúp các khoa phòng nhập báo cáo nhanh chóng, tự động hóa tổng hợp số liệu giao ban và hỗ trợ trình chiếu slide chuyên nghiệp cho Ban Giám Đốc!11:55 PM👨‍💻 Ai là tác giả phát triển phần mềm?🔑 Cấp tài khoản cho khoa của tôi📝 Hướng dẫn phím tắt "lorem + Enter"🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện📺 Hướng dẫn Trình Chiếu Giao Ban🛡️ Tài khoản Quản trị viên (Admin)"

```

```yaml
- img
- text: Trợ Lý Y Tế AI Online TTYT Khu Vực Bình Long • Hỗ trợ trực tuyến
- button:
  - img
- text: "👋 Xin chào quý Bác sĩ và Cán bộ y tế! Tôi là Trợ Lý AI của Hệ Thống Báo Cáo Giao Ban – TTYT Khu Vực Bình Long. Vừa xong 💡 Bạn đang công tác tại Khoa/Phòng nào? Hãy chọn khoa bên dưới để tôi hướng dẫn và cấp tài khoản đăng nhập nhé! (Lưu ý: Trừ tài khoản Admin)"
- button "🏥 Khoa Nội"
- button "🏥 Hồi sức cấp cứu – Thận nhân tạo"
- button "🏥 Chẩn đoán hình ảnh"
- button "🏥 Y học cổ truyền – PHCN"
- button "🏥 Ngoại tổng hợp"
- button "🏥 Chấn thương chỉnh hình"
- button "🏥 Khoa Nhi"
- button "🏥 Khoa Nhiễm"
- button "🏥 Gây mê Hồi sức"
- button "🏥 Khoa Sản"
- button "🏥 Khoa Xét nghiệm"
- text: "Vừa xong Ai là người phát triển phần mềm này? 11:55 PM 👨‍💻 TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM: ✨ Họ và tên: NGUYỄN VŨ NHẬT NAM 📅 Năm sinh: 2004 🏥 Đơn vị phát triển: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long. 🎯 Phần mềm được lập trình tối ưu hóa giúp các khoa phòng nhập báo cáo nhanh chóng, tự động hóa tổng hợp số liệu giao ban và hỗ trợ trình chiếu slide chuyên nghiệp cho Ban Giám Đốc! 11:55 PM"
- button "👨‍💻 Ai là tác giả phát triển phần mềm?"
- button "🔑 Cấp tài khoản cho khoa của tôi"
- button "📝 Hướng dẫn phím tắt \"lorem + Enter\""
- button "🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện"
- button "📺 Hướng dẫn Trình Chiếu Giao Ban"
- button "🛡️ Tài khoản Quản trị viên (Admin)"
- textbox "Nhập câu hỏi hoặc tên khoa phòng..."
- button [disabled]:
  - img
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
  12 |     const chatModal = page.locator('.ai-chatbox-window');
  13 |     await expect(chatModal).toBeVisible({ timeout: 10000 });
  14 | 
  15 |     const authorBtn = page.locator('button:has-text("Ai là tác giả"), button:has-text("tác giả")').first();
  16 |     if (await authorBtn.isVisible({ timeout: 5000 })) {
  17 |       await authorBtn.click();
> 18 |       await expect(chatModal).toContainText('Nguyễn Vũ Nhật Nam', { timeout: 10000 });
     |                               ^ Error: expect(locator).toContainText(expected) failed
  19 |     }
  20 |   });
  21 | 
  22 |   test('Trợ lý AI hỗ trợ điền tự động tài khoản khoa vào form đăng nhập', async ({ page }) => {
  23 |     await page.goto('/');
  24 |     
  25 |     const aiBtn = page.locator('.ai-floating-btn, button:has-text("AI")').first();
  26 |     await expect(aiBtn).toBeVisible();
  27 |     await aiBtn.click();
  28 | 
  29 |     const deptChip = page.locator('button:has-text("Khoa"), button:has-text("Nội"), button:has-text("Hồi sức")').first();
  30 |     if (await deptChip.isVisible({ timeout: 5000 })) {
  31 |       await deptChip.click();
  32 |       
  33 |       const autoFillBtn = page.locator('button:has-text("Điền"), button:has-text("Tự Động")').first();
  34 |       if (await autoFillBtn.isVisible({ timeout: 5000 })) {
  35 |         await autoFillBtn.click();
  36 |         const usernameVal = await page.locator('input[placeholder*="Khnv"]').inputValue();
  37 |         expect(usernameVal.length).toBeGreaterThan(0);
  38 |       }
  39 |     }
  40 |   });
  41 | 
  42 | });
  43 | 
```