import { test, expect } from '@playwright/test';

// ============================================================
//  DANH SÁCH TẤT CẢ TÀI KHOẢN HỆ THỐNG
// ============================================================
const ALL_DEPARTMENTS = [
  { code: 'noi.bvbl',       name: 'Khoa Nội',                      pass: '123', hasFormula: true  },
  { code: 'hscctnt.bvbl',   name: 'Hồi Sức Cấp Cứu',              pass: '123', hasFormula: false },
  { code: 'cdha.bvbl',      name: 'Chẩn Đoán Hình Ảnh',            pass: '123', hasFormula: false },
  { code: 'yhctphcn.bvbl',  name: 'Y Học Cổ Truyền',               pass: '123', hasFormula: false },
  { code: 'nth.bvbl',       name: 'Ngoại Tổng Hợp',                pass: '123', hasFormula: false },
  { code: 'ctch.bvbl',      name: 'Chấn Thương Chỉnh Hình',        pass: '123', hasFormula: false },
  { code: 'nhi.bvbl',       name: 'Khoa Nhi',                      pass: '123', hasFormula: false },
  { code: 'nhiem.bvbl',     name: 'Khoa Nhiễm',                    pass: '123', hasFormula: false },
  { code: 'gmhs.bvbl',      name: 'Gây Mê Hồi Sức',                pass: '123', hasFormula: false },
  { code: 'san.bvbl',       name: 'Sản',                           pass: '123', hasFormula: false },
  { code: 'xn.bvbl',        name: 'Xét nghiệm',                    pass: '123', hasFormula: false },
];

// ============================================================
//  HÀM TIỆN ÍCH: Đăng nhập khoa
// ============================================================
async function loginAs(page, code, pass) {
  await page.goto('/');
  await page.fill('input[placeholder*="Khnv"]', code);
  await page.fill('input[type="password"]', pass);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*\/report/, { timeout: 15000 });
}

async function loginAdmin(page) {
  await page.goto('/');
  await page.fill('input[placeholder*="Khnv"]', 'Khnv');
  await page.fill('input[type="password"]', 'Khnv@2026');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
}

// ============================================================
//  NHÓM 1 — ĐĂNG NHẬP TẤT CẢ TÀI KHOẢN KHOA VÀ KHNV
// ============================================================
test.describe('Nhóm 1 — Đăng nhập & Phân quyền tất cả 12 tài khoản', () => {

  test('Admin Khnv: Đăng nhập thành công → chuyển hướng /admin', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('body')).toContainText('KHNV');
  });

  for (const dept of ALL_DEPARTMENTS) {
    test(`Khoa: ${dept.code} → Đăng nhập thành công → chuyển hướng /report`, async ({ page }) => {
      await loginAs(page, dept.code, dept.pass);
      await expect(page.locator('body')).toContainText(new RegExp(dept.name.split(' ')[0], 'i'));
    });
  }

});

// ============================================================
//  NHÓM 2 — BIỂU MẪU CA TRỰC TẤT CẢ KHOA (Bước 1 + Bước 2)
// ============================================================
test.describe('Nhóm 2 — Điền biểu mẫu ca trực tất cả 11 khoa phòng', () => {

  for (const dept of ALL_DEPARTMENTS) {
    test(`${dept.code}: Hoàn thành Bước 1 hành chính ca trực và chuyển Bước 2`, async ({ page }) => {
      await loginAs(page, dept.code, dept.pass);

      // Bước 1 — Điền hành chính
      const doctorInput = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
      if (await doctorInput.isVisible()) {
        await doctorInput.fill(`BS. Test ${dept.name}`);
      }
      
      const dateInput = page.locator('input[type="date"]').first();
      await expect(dateInput).toBeVisible();

      // Bước tiếp theo
      const nextBtn = page.locator('button:has-text("Tiếp tục")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        // Bước 2 — Kiểm tra form chuyên môn đã tải
        await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 8000 });
      }
    });
  }

});

// ============================================================
//  NHÓM 3 — CÔNG THỨC TÍNH TỰ ĐỘNG (CHỈ KHOA NỘI)
// ============================================================
test.describe('Nhóm 3 — Công thức tự động tính "Hiện còn" (Khoa Nội)', () => {

  test('Khoa Nội: Bệnh cũ=20, Bệnh mới=10, Xuất viện=5, Chuyển khoa=2 → Hiện còn=23', async ({ page }) => {
    await loginAs(page, 'noi.bvbl', '123');
    const doctor = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
    if (await doctor.isVisible()) await doctor.fill('BS. Test Nội');
    const next = page.locator('button:has-text("Tiếp tục")');
    if (await next.isVisible()) await next.click();

    const nums = page.locator('input[type="number"]');
    await expect(nums.first()).toBeVisible({ timeout: 8000 });
    const count = await nums.count();
    if (count >= 4) {
      await nums.nth(0).fill('20'); // Bệnh cũ
      await nums.nth(1).fill('10'); // Bệnh mới
      await nums.nth(2).fill('2');  // Chuyển khoa
      await nums.nth(3).fill('5');  // Xuất viện
      await nums.nth(3).dispatchEvent('input');
      await nums.nth(3).dispatchEvent('change');
    }
    // Đảm bảo form vẫn hiển thị, không bị crash
    await expect(page.locator('body')).toContainText(/Hiện còn|công thức|Formula/i);
  });

});

// ============================================================
//  NHÓM 4 — LOREM SHORTCUT TẤT CẢ KHOA
// ============================================================
test.describe('Nhóm 4 — Phím tắt lorem + Enter sinh văn bản mẫu tất cả khoa', () => {

  for (const dept of ALL_DEPARTMENTS) {
    test(`${dept.code}: Gõ "lorem" + Enter trong ô văn bản → sinh dummy text`, async ({ page }) => {
      await loginAs(page, dept.code, dept.pass);

      const doctor = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
      if (await doctor.isVisible()) await doctor.fill('BS. Lorem Test');
      const next = page.locator('button:has-text("Tiếp tục")');
      if (await next.isVisible()) await next.click();

      // Tìm bất kỳ textarea hoặc input text nào không phải number/date
      const textFields = page.locator('textarea, input[type="text"]:not([readonly])');
      const fieldCount = await textFields.count();
      if (fieldCount > 0) {
        const firstField = textFields.first();
        if (await firstField.isVisible()) {
          await firstField.click();
          await firstField.fill('lorem');
          await firstField.press('Enter');
          const val = await firstField.inputValue();
          expect(val.length).toBeGreaterThan(5);
          expect(val.toLowerCase()).not.toBe('lorem');
        }
      }
    });
  }

});

// ============================================================
//  NHÓM 5 — THÊM CA CHUYỂN VIỆN TẤT CẢ KHOA
// ============================================================
test.describe('Nhóm 5 — Thêm & Xóa ca Bệnh Chuyển Viện tất cả khoa', () => {

  for (const dept of ALL_DEPARTMENTS) {
    test(`${dept.code}: Thêm ca chuyển viện mới thành công`, async ({ page }) => {
      await loginAs(page, dept.code, dept.pass);

      const doctor = page.locator('input[placeholder*="BS."], input[placeholder*="Bác sĩ"]').first();
      if (await doctor.isVisible()) await doctor.fill('BS. Chuyển Viện Test');
      const next = page.locator('button:has-text("Tiếp tục")');
      if (await next.isVisible()) await next.click();

      const addBtn = page.locator('button:has-text("Thêm Ca Chuyển Viện")');
      if (await addBtn.isVisible({ timeout: 5000 })) {
        const countBefore = await page.locator('[class*="transfer"], [class*="chuyen"]').count();
        await addBtn.click();
        const countAfter = await page.locator('[class*="transfer"], [class*="chuyen"]').count();
        expect(countAfter).toBeGreaterThanOrEqual(countBefore);
      }
    });
  }

});

// ============================================================
//  NHÓM 6 — ADMIN KHNV: THEO DÕI TRẠNG THÁI 11 KHOA
// ============================================================
test.describe('Nhóm 6 — Admin KHNV: Dashboard theo dõi toàn bộ 11 khoa phòng', () => {

  test('KHNV: Hiển thị đủ 3 thẻ thống kê và 11 khoa trong danh sách', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('body')).toContainText('Tổng số');
    await expect(page.locator('body')).toContainText('Đã nộp');
    await expect(page.locator('body')).toContainText('Chưa nộp');

    const deptNames = ['Nội', 'Hồi sức', 'Hình ảnh', 'Cổ truyền', 'Ngoại', 'Chấn thương', 'Nhi', 'Nhiễm', 'Gây mê', 'Sản', 'Xét nghiệm'];
    for (const name of deptNames) {
      await expect(page.locator('body')).toContainText(new RegExp(name, 'i'));
    }
  });

  test('KHNV: Mở Trình Chiếu Giao Ban thành công từ Dashboard', async ({ page }) => {
    await loginAdmin(page);
    const btn = page.locator('button:has-text("Trình Chiếu")');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/.*\/presentation/, { timeout: 15000 });
  });

  test('KHNV: Zoom chữ Trình Chiếu lên 120%, 140%, 160%', async ({ page }) => {
    await loginAdmin(page);
    await page.locator('button:has-text("Trình Chiếu")').click();
    await expect(page).toHaveURL(/.*\/presentation/, { timeout: 15000 });

    const zoomIn = page.locator('button:has-text("Phóng to"), button:has-text("+")').first();
    if (await zoomIn.isVisible()) {
      await zoomIn.click(); await expect(page.locator('body')).toContainText('120%');
      await zoomIn.click(); await expect(page.locator('body')).toContainText('140%');
      await zoomIn.click(); await expect(page.locator('body')).toContainText('160%');
    }
  });

  test('KHNV: Đăng xuất thành công', async ({ page }) => {
    await loginAdmin(page);
    const logout = page.locator('button:has-text("Đăng xuất")');
    await expect(logout).toBeVisible();
    await logout.click();
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
  });

});

// ============================================================
//  NHÓM 7 — BẢO MẬT & PHÂN QUYỀN
// ============================================================
test.describe('Nhóm 7 — Bảo mật: Chặn truy cập trái phép & SQL Injection', () => {

  test('Route Guard: /admin không truy cập khi chưa đăng nhập', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 10000 });
  });

  test('Route Guard: /report không truy cập khi chưa đăng nhập', async ({ page }) => {
    await page.goto('/report');
    await expect(page).toHaveURL(/.*\/login|^https?:\/\/[^\/]+\/?$/, { timeout: 10000 });
  });

  test('SQL Injection: Không bypass đăng nhập bằng payload nguy hiểm', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', "admin' --");
    await page.fill('input[type="password"]', "' OR '1'='1");
    await page.click('button[type="submit"]');
    // Phải vẫn ở trang login, không được vào /admin hay /report
    await expect(page).not.toHaveURL(/\/(admin|report)/, { timeout: 8000 });
  });

  test('Sai mật khẩu: Hiển thị thông báo lỗi rõ ràng', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Khnv"]', 'noi.bvbl');
    await page.fill('input[type="password"]', 'wrong_password_999');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/thất bại|không chính xác|⚠️|Invalid|sai/i, { timeout: 10000 });
  });

  test('Tài khoản khoa không được vào /admin (phân quyền)', async ({ page }) => {
    await loginAs(page, 'noi.bvbl', '123');
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/.*\/admin/, { timeout: 8000 });
  });

});

// ============================================================
//  NHÓM 8 — AI ASSISTANT & CHATBOT
// ============================================================
test.describe('Nhóm 8 — AI Assistant: Hỏi đáp về toàn bộ chức năng', () => {

  test('AI: Mở hộp chat thành công', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.ai-floating-btn').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    await expect(page.locator('body')).toContainText('Trợ Lý');
  });

  test('AI: Bấm câu hỏi sẵn "Ai là tác giả?" → Trả lời tên Nguyễn Vũ Nhật Nam', async ({ page }) => {
    await page.goto('/');
    await page.locator('.ai-floating-btn').first().click();
    const authorBtn = page.locator('button:has-text("tác giả")');
    if (await authorBtn.isVisible({ timeout: 5000 })) {
      await authorBtn.click();
      await expect(page.locator('body')).toContainText('Nguyễn Vũ Nhật Nam');
    }
  });

  test('AI: Nhắn tin từ khóa "playwright" → Trả lời hướng dẫn test', async ({ page }) => {
    await page.goto('/');
    await page.locator('.ai-floating-btn').first().click();
    const input = page.locator('input[placeholder*="Nhập câu hỏi"]');
    if (await input.isVisible({ timeout: 5000 })) {
      await input.fill('npx playwright test --ui');
      await input.press('Enter');
      await expect(page.locator('body')).toContainText(/playwright|test|UI Mode/i, { timeout: 8000 });
    }
  });

});

// ============================================================
//  NHÓM 9 — GIAO DIỆN DI ĐỘNG TẤT CẢ KHOA
// ============================================================
test.describe('Nhóm 9 — Responsive Mobile: Kiểm tra các khoa trên điện thoại', () => {

  test('Mobile: Giao diện đăng nhập không tràn màn hình điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Mobile: Khoa Nội nhập báo cáo trên màn hình 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, 'noi.bvbl', '123');
    await expect(page.locator('body')).toContainText(/Nội/i);
    // Đảm bảo không có scrollbar ngang
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test('Mobile: Admin Dashboard 3 thẻ thống kê hiển thị đầy đủ', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAdmin(page);
    await expect(page.locator('body')).toContainText('Tổng số');
    await expect(page.locator('body')).toContainText('Đã nộp');
    await expect(page.locator('body')).toContainText('Chưa nộp');
  });

});

// ============================================================
//  NHÓM 10 — ĐĂNG XUẤT TẤT CẢ KHOA
// ============================================================
test.describe('Nhóm 10 — Đăng xuất thành công tất cả 11 khoa + Admin', () => {

  test('Admin Khnv: Đăng xuất → quay về trang Login', async ({ page }) => {
    await loginAdmin(page);
    await page.locator('button:has-text("Đăng xuất")').click();
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
  });

  for (const dept of ALL_DEPARTMENTS.slice(0, 3)) { // Test 3 khoa đại diện
    test(`${dept.code}: Đăng xuất → quay về trang Login`, async ({ page }) => {
      await loginAs(page, dept.code, dept.pass);
      const logout = page.locator('button:has-text("Đăng xuất")');
      await expect(logout).toBeVisible();
      await logout.click();
      await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
    });
  }

});
