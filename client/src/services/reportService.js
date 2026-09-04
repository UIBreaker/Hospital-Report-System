import api from './api';

const reportService = {
  createOrUpdateReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  saveReport: async (data) => {
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
  getAllReportsByDate: async (date) => {
    const response = await api.get(`/admin/presentation/${date}`);
    return response.data;
  },
  getPresentationData: async (date) => {
    const response = await api.get(`/admin/presentation/${date}`);
    return response.data;
  },
  getHospitalAnalytics: async (range = 'day', date = '') => {
    const response = await api.get('/admin/analytics/stats', {
      params: { range, date }
    });
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
  getReportsPayloadSize: async (date) => {
    const response = await api.get(`/admin/reports-payload-size?date=${date}`);
    return response.data;
  },
  exportHospitalReportExcel: async (date) => {
    const response = await api.get(`/admin/export-reports?date=${date}`, {
      responseType: 'blob',
    });
    return response;
  },
  toggleReportLock: async (departmentCode, date, isLocked) => {
    const response = await api.put(`/admin/reports/${departmentCode}/${date}/toggle-lock`, { isLocked });
    return response.data;
  },
  toggleLockReport: async (departmentCode, date, isLocked) => {
    const response = await api.put(`/admin/reports/${departmentCode}/${date}/toggle-lock`, { isLocked });
    return response.data;
  },
  toggleLockAllReports: async (date, isLocked) => {
    const response = await api.put(`/admin/reports/toggle-lock-all/${date}`, { isLocked });
    return response.data;
  },
  toggleLockAll: async (date, isLocked) => {
    const response = await api.put(`/admin/reports/toggle-lock-all/${date}`, { isLocked });
    return response.data;
  },
  checkTargetDate: async (departmentCode, targetDate) => {
    const response = await api.get('/admin/reports/check-target-date', {
      params: { departmentCode, targetDate }
    });
    return response.data;
  },
  moveReportDate: async ({ departmentCode, fromDate, toDate }) => {
    const response = await api.post('/admin/reports/move-date', {
      departmentCode,
      fromDate,
      toDate
    });
    return response.data;
  }
};

export default reportService;
