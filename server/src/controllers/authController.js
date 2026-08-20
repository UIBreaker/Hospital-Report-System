const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const KHNV_NEW_HASH = '$2b$10$mRZNcXHD3MUb0dJ0HTLfrOQnxZO2zvGbky1aCzGn/Tmw4LuBxAjSi'; // Khnv@2026

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const cleanUsername = String(username).trim();
    const isKhnvAdminAttempt = ['khnv', 'admin'].includes(cleanUsername.toLowerCase());

    // Search by exact username or case-insensitive
    let [users] = await pool.execute(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR username = ?',
      [cleanUsername, cleanUsername]
    );

    // If attempting admin/khnv and not found with exact name, find admin role
    if (users.length === 0 && isKhnvAdminAttempt) {
      [users] = await pool.execute("SELECT * FROM users WHERE role = 'admin' OR username IN ('admin', 'khnv', 'Khnv')");
    }

    // Auto-create lck.bvbl if not exists in DB yet
    if (users.length === 0 && cleanUsername.toLowerCase() === 'lck.bvbl') {
      try {
        const DEFAULT_PASS_HASH = '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa'; // 123
        await pool.execute(
          "INSERT INTO users (username, password_hash, department_code, department_name, role) VALUES ('lck.bvbl', ?, 'lck', 'Khoa Liên Chuyên Khoa', 'department')",
          [DEFAULT_PASS_HASH]
        );
        [users] = await pool.execute("SELECT * FROM users WHERE username = 'lck.bvbl'");
      } catch (insertErr) {
        console.warn('Auto-create lck.bvbl note:', insertErr.message);
      }
    }

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const user = users[0];

    // Check password matching: bcrypt compare or direct check for Khnv@2026
    let isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch && isKhnvAdminAttempt) {
      // Support Khnv@2026 or old 123
      if (password === 'Khnv@2026' || password === '123') {
        isMatch = true;
        // Asynchronously update db to the new Khnv username and Khnv@2026 hash
        try {
          await pool.execute(
            "UPDATE users SET username = 'Khnv', password_hash = ?, department_name = 'Phòng Kế Hoạch Nghiệp Vụ' WHERE id = ? OR role = 'admin'",
            [KHNV_NEW_HASH, user.id]
          );
        } catch (dbUpdateErr) {
          console.warn('Could not auto-update admin credentials in DB:', dbUpdateErr.message);
        }
      }
    }
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const userRole = (user.role || (['admin', 'khnv'].includes(String(user.username || '').toLowerCase()) || String(user.department_code || '').toLowerCase() === 'admin' ? 'admin' : 'department')).toLowerCase();

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        departmentCode: user.department_code, 
        role: userRole 
      },
      process.env.JWT_SECRET || 'hospital_report_secret_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          departmentCode: user.department_code,
          departmentName: user.department_name,
          role: userRole
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, department_code, department_name, role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
