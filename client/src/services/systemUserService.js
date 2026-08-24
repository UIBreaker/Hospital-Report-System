import api from './api';

const systemUserService = {
  getAllSystemUsers: async () => {
    const response = await api.get('/admin/system-users');
    return response.data;
  },
  approveUser: async (id) => {
    const response = await api.put(`/admin/system-users/${id}/approve`);
    return response.data;
  },
  rejectUser: async (id) => {
    const response = await api.put(`/admin/system-users/${id}/reject`);
    return response.data;
  },
  toggleUserStatus: async (id, status) => {
    const response = await api.put(`/admin/system-users/${id}/status`, { status });
    return response.data;
  },
  adminResetPassword: async (id) => {
    const response = await api.post(`/admin/system-users/${id}/reset-password`);
    return response.data;
  },
  deleteSystemUser: async (id) => {
    const response = await api.delete(`/admin/system-users/${id}`);
    return response.data;
  }
};

export default systemUserService;
