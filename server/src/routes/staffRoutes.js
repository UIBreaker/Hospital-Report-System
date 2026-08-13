const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getAllStaff,
  getStaffByDepartment,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

// Lấy nhân sự theo khoa của user đang đăng nhập (hoặc theo query ?department= nếu là admin)
router.get('/by-department', auth, getStaffByDepartment);

// Lấy toàn bộ danh sách nhân sự (Có thể lọc theo ?department=, ?position=, ?search=)
router.get('/', auth, getAllStaff);

// Thêm mới nhân sự (Chỉ Admin)
router.post('/', auth, adminOnly, createStaff);

// Cập nhật nhân sự (Chỉ Admin)
router.put('/:id', auth, adminOnly, updateStaff);

// Xóa nhân sự (Chỉ Admin)
router.delete('/:id', auth, adminOnly, deleteStaff);

module.exports = router;
