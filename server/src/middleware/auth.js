const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_report_secret_key_2026';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Access denied. Please log in.' });
  }

  const role = String(req.user.role || '').toLowerCase();
  const dept = String(req.user.departmentCode || req.user.department_code || '').toLowerCase();
  const username = String(req.user.username || '').toLowerCase();

  if (
    role === 'admin' || 
    dept === 'admin' || 
    dept === 'khnv' || 
    username === 'admin' || 
    username === 'khnv' ||
    username === 'khnv.bvbl'
  ) {
    return next();
  }

  // Fallback: check database directly for user's actual role in case token is legacy
  if (req.user.userId) {
    try {
      const pool = require('../config/db');
      const [rows] = await pool.execute('SELECT role, department_code, username FROM users WHERE id = ?', [req.user.userId]);
      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        const dbRole = String(dbUser.role || '').toLowerCase();
        const dbDept = String(dbUser.department_code || '').toLowerCase();
        const dbUsername = String(dbUser.username || '').toLowerCase();
        if (dbRole === 'admin' || dbDept === 'admin' || dbDept === 'khnv' || dbUsername === 'admin' || dbUsername === 'khnv') {
          req.user.role = 'admin';
          return next();
        }
      }
    } catch (e) {
      console.warn('adminOnly DB fallback check error:', e.message);
    }
  }

  res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
};

module.exports = { auth, adminOnly };
