const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const DEPARTMENT_NAMES = {
  personal: 'Tài khoản cá nhân',
  lck: 'Khoa Liên Chuyên Khoa',
  xn: 'Khoa Xét nghiệm',
  cdha: 'Khoa Chẩn đoán hình ảnh',
  hscc_tnt: 'Khoa Hồi sức cấp cứu - Thận nhân tạo',
  noi: 'Khoa Nội',
  nhi: 'Khoa Nhi',
  nhiem: 'Khoa Nhiễm',
  san: 'Khoa Sản',
  yhct_phcn: 'Khoa Y học cổ truyền - Phục hồi chức năng',
  ngoai_th: 'Khoa Ngoại tổng hợp',
  ctch: 'Khoa Chấn thương chỉnh hình',
  gmhs: 'Khoa Gây mê Hồi sức',
  admin: 'Phòng Kế Hoạch Nghiệp Vụ'
};

// Helper to generate complex random temporary password
const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Public Registration
const register = async (req, res, next) => {
  try {
    const { full_name, username, password, department_code } = req.body;

    if (!full_name || !username || !password || !department_code) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ: Họ tên, Tên đăng nhập, Mật khẩu và Khoa phòng.'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Tên đăng nhập phải có ít nhất 3 ký tự.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự.'
      });
    }

    // Check collision in both users (core 13) and system_users
    const [existingCore] = await pool.execute(
      'SELECT id FROM users WHERE LOWER(username) = ?',
      [cleanUsername]
    );
    if (existingCore.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Tên đăng nhập này đã được sử dụng trong hệ thống. Vui lòng chọn tên khác.'
      });
    }

    const [existingSys] = await pool.execute(
      'SELECT id FROM system_users WHERE LOWER(username) = ?',
      [cleanUsername]
    );
    if (existingSys.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Tên đăng nhập này đã được đăng ký. Vui lòng chọn tên khác hoặc yêu cầu cấp lại mật khẩu.'
      });
    }

    const deptName = DEPARTMENT_NAMES[department_code] || department_code;
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO system_users (username, password_hash, full_name, role, department_code, department_name, status, must_change_password)
       VALUES (?, ?, ?, 'staff', ?, ?, 'pending', 0)`,
      [cleanUsername, passwordHash, full_name.trim(), department_code, deptName]
    );

    res.json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Hồ sơ của bạn đang chờ Quản trị viên (Admin) phê duyệt trước khi có thể đăng nhập.',
      data: {
        id: result.insertId,
        username: cleanUsername,
        full_name: full_name.trim(),
        department_name: deptName,
        status: 'pending'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Public Password Reset Request
const requestPasswordReset = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên đăng nhập cần cấp lại mật khẩu.'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check system_users
    const [sysUsers] = await pool.execute(
      'SELECT id, full_name, username, department_name FROM system_users WHERE LOWER(username) = ?',
      [cleanUsername]
    );

    if (sysUsers.length > 0) {
      await pool.execute(
        'UPDATE system_users SET reset_requested = 1, reset_requested_at = NOW() WHERE id = ?',
        [sysUsers[0].id]
      );

      return res.json({
        success: true,
        message: `Yêu cầu cấp lại mật khẩu cho tài khoản "${cleanUsername}" đã được gửi tới Ban Quản Trị. Vui lòng liên hệ Admin để nhận mật khẩu tạm thời.`
      });
    }

    // If core user
    const [coreUsers] = await pool.execute(
      'SELECT id, username FROM users WHERE LOWER(username) = ?',
      [cleanUsername]
    );

    if (coreUsers.length > 0) {
      return res.json({
        success: true,
        message: `Yêu cầu đã được ghi nhận. Với tài khoản cốt lõi "${cleanUsername}", vui lòng liên hệ trực tiếp Ban Quản Trị phòng KHNV để được hỗ trợ.`
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy tài khoản với tên đăng nhập này trong hệ thống.'
    });
  } catch (error) {
    next(error);
  }
};

// Change Password (Mandatory or Voluntary)
const changePassword = async (req, res, next) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const targetUsername = username || req.user?.username;

    if (!targetUsername || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ: Tên đăng nhập, Mật khẩu hiện tại và Mật khẩu mới.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
      });
    }

    const cleanUsername = String(targetUsername).trim().toLowerCase();

    // 1. Check system_users
    const [sysUsers] = await pool.execute(
      'SELECT * FROM system_users WHERE LOWER(username) = ?',
      [cleanUsername]
    );

    if (sysUsers.length > 0) {
      const user = sysUsers[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Mật khẩu hiện tại (hoặc mật khẩu tạm) không chính xác.'
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.execute(
        'UPDATE system_users SET password_hash = ?, must_change_password = 0, reset_requested = 0, reset_requested_at = NULL WHERE id = ?',
        [newHash, user.id]
      );

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          departmentCode: user.department_code,
          role: user.role
        },
        process.env.JWT_SECRET || 'hospital_report_secret_key_2026',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            departmentCode: user.department_code,
            departmentName: user.department_name,
            role: user.role
          }
        }
      });
    }

    // 2. Check core users
    const [coreUsers] = await pool.execute(
      'SELECT * FROM users WHERE LOWER(username) = ?',
      [cleanUsername]
    );

    if (coreUsers.length > 0) {
      const user = coreUsers[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Mật khẩu hiện tại không chính xác.'
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHash, user.id]
      );

      return res.json({
        success: true,
        message: 'Đổi mật khẩu thành công!'
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy tài khoản trong hệ thống.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all system users
const getAllSystemUsers = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, full_name, role, department_code, department_name, status, must_change_password, reset_requested, reset_requested_at, last_login_at, created_at, updated_at
       FROM system_users
       ORDER BY reset_requested DESC, (status = 'pending') DESC, created_at DESC`
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve user
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute(
      `UPDATE system_users SET status = 'active' WHERE id = ?`,
      [id]
    );
    res.json({
      success: true,
      message: 'Đã phê duyệt tài khoản thành công! Nhân viên hiện có thể đăng nhập.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject user
const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute(
      `UPDATE system_users SET status = 'rejected' WHERE id = ?`,
      [id]
    );
    res.json({
      success: true,
      message: 'Đã từ chối phê duyệt tài khoản.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle suspend / activate status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.execute(
      `UPDATE system_users SET status = ? WHERE id = ?`,
      [status, id]
    );
    res.json({
      success: true,
      message: `Đã cập nhật trạng thái tài khoản thành "${status}".`
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reset password with complex random temporary password
const adminResetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [users] = await pool.execute('SELECT * FROM system_users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản.' });
    }

    const user = users[0];
    const tempPassword = generateRandomPassword(10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await pool.execute(
      `UPDATE system_users
       SET password_hash = ?, must_change_password = 1, reset_requested = 0, reset_requested_at = NULL
       WHERE id = ?`,
      [passwordHash, id]
    );

    res.json({
      success: true,
      message: 'Đã cấp lại mật khẩu tạm thời thành công!',
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        temporaryPassword: tempPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete system user
const deleteSystemUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM system_users WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Đã xóa tài khoản thành công.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  requestPasswordReset,
  changePassword,
  getAllSystemUsers,
  approveUser,
  rejectUser,
  toggleUserStatus,
  adminResetPassword,
  deleteSystemUser
};
