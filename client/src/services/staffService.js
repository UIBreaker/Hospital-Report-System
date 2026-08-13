import api from './api';

export const staffService = {
  // Lấy nhân sự theo khoa của tài khoản đăng nhập (hoặc theo mã khoa nếu là admin)
  getStaffByDepartment: async (departmentCode) => {
    const response = await api.get('/staff-by-department', {
      params: departmentCode ? { department: departmentCode } : {}
    });
    return response.data;
  },

  // Lấy toàn bộ nhân sự (có hỗ trợ filter ?department=..., ?position=..., ?search=...)
  getAllStaff: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  // Thêm mới nhân viên
  createStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  // Cập nhật nhân viên
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },

  // Xóa nhân viên
  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  }
};

export default staffService;
