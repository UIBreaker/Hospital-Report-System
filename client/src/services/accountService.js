import api from './api';

const accountService = {
  // Lấy danh sách toàn bộ tài khoản
  getAllAccounts: async () => {
    const response = await api.get('/admin/accounts');
    return response.data;
  },

  // Đổi mật khẩu cho một tài khoản
  updatePassword: async (userId, newPassword) => {
    const response = await api.put(`/admin/accounts/${userId}/password`, { newPassword });
    return response.data;
  },

  // Đặt lại mật khẩu về mặc định (123 hoặc tùy chỉnh)
  resetPassword: async (userId, defaultPassword = '123') => {
    const response = await api.post(`/admin/accounts/${userId}/reset-password`, { defaultPassword });
    return response.data;
  },

  // Cập nhật thông tin tài khoản (username, tên khoa, mã khoa, vai trò, mật khẩu)
  updateAccount: async (userId, data) => {
    const response = await api.put(`/admin/accounts/${userId}`, data);
    return response.data;
  },

  // Thêm tài khoản mới
  createAccount: async (data) => {
    const response = await api.post('/admin/accounts', data);
    return response.data;
  }
};

export default accountService;
