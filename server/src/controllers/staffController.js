const pool = require('../config/db');

// 1. Lấy toàn bộ danh sách nhân sự (Hỗ trợ tìm kiếm, lọc theo khoa / chức danh)
const getAllStaff = async (req, res, next) => {
  try {
    const { department, position, search } = req.query;
    let query = 'SELECT * FROM staff_members WHERE 1=1';
    const params = [];

    if (department && department !== 'all') {
      query += ' AND department = ?';
      params.push(department);
    }

    if (position && position !== 'all') {
      query += ' AND position = ?';
      params.push(position);
    }

    if (search && search.trim()) {
      query += ' AND (full_name LIKE ? OR certificate LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY department, position DESC, full_name ASC';

    const [staff] = await pool.query(query, params);
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

// 2. Lọc danh sách nhân sự theo khoa của tài khoản đăng nhập
const getStaffByDepartment = async (req, res, next) => {
  try {
    // Nếu là admin và có truyền query ?department= thì ưu tiên lấy theo query, ngược lại lấy theo user.departmentCode
    const departmentCode = (req.user.role === 'admin' && req.query.department)
      ? req.query.department
      : req.user.departmentCode;

    if (!departmentCode) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin khoa phòng' });
    }

    const [staff] = await pool.query(
      'SELECT id, full_name, position, department, certificate, gender FROM staff_members WHERE department = ? ORDER BY position DESC, full_name ASC',
      [departmentCode]
    );

    // Phân loại sẵn bác sĩ và điều dưỡng để frontend dễ sử dụng
    const doctors = staff.filter(s => s.position === 'Bác sĩ' || s.position.toLowerCase().includes('bác sĩ'));
    const nurses = staff.filter(s => s.position !== 'Bác sĩ' && !s.position.toLowerCase().includes('bác sĩ'));

    res.json({
      success: true,
      department: departmentCode,
      total: staff.length,
      doctors,
      nurses,
      allStaff: staff
    });
  } catch (error) {
    next(error);
  }
};

// 3. Thêm mới nhân viên (Dành cho Admin/KHNV)
const createStaff = async (req, res, next) => {
  try {
    const { full_name, position, department, certificate, gender } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, error: 'Họ tên nhân sự không được để trống' });
    }

    if (!department) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn khoa phòng làm việc' });
    }

    const [result] = await pool.query(
      `INSERT INTO staff_members (full_name, position, department, certificate, gender)
       VALUES (?, ?, ?, ?, ?)`,
      [
        full_name.trim(),
        position || 'Bác sĩ',
        department,
        certificate ? certificate.trim() : null,
        gender || 'Nam'
      ]
    );

    const [newStaff] = await pool.query('SELECT * FROM staff_members WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Thêm nhân sự mới thành công',
      data: newStaff[0]
    });
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật thông tin nhân viên
const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, position, department, certificate, gender } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, error: 'Họ tên nhân sự không được để trống' });
    }

    await pool.query(
      `UPDATE staff_members 
       SET full_name = ?, position = ?, department = ?, certificate = ?, gender = ?
       WHERE id = ?`,
      [
        full_name.trim(),
        position || 'Bác sĩ',
        department,
        certificate ? certificate.trim() : null,
        gender || 'Nam',
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM staff_members WHERE id = ?', [id]);
    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy nhân sự' });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhân sự thành công',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa nhân viên theo ID (Dành cho Admin)
const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, full_name FROM staff_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy nhân sự để xóa' });
    }

    await pool.query('DELETE FROM staff_members WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Đã xóa nhân sự "${existing[0].full_name}" thành công`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStaff,
  getStaffByDepartment,
  createStaff,
  updateStaff,
  deleteStaff
};
