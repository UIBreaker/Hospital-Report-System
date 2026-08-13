import api from './api';

const reportService = {
  createOrUpdateReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  getReport: async (departmentCode, date) => {
    const response = await api.get(`/reports/${departmentCode}/${date}`);
    return response.data;
  },
  getReportsByDate: async (date) => {
    const response = await api.get(`/admin/departments/${date}`);
    return response.data;
  },
  getPresentationData: async (date) => {
    const response = await api.get(`/admin/presentation/${date}`);
    return response.data;
  },
  getDepartmentStatus: async (date) => {
    const response = await api.get(`/admin/departments/${date}`);
    return response.data;
  },
  deleteReport: async (departmentCode, date) => {
    const response = await api.delete(`/reports/${departmentCode}/${date}`);
    return response.data;
  },
  getDatabaseStats: async () => {
    const response = await api.get('/admin/database-stats');
    return response.data;
  },
  exportHospitalReportExcel: async (date) => {
    const response = await api.get(`/admin/export-reports?date=${date}`, {
      responseType: 'blob',
    });
    return response;
  }
};

export default reportService;
