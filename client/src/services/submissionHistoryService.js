import api from './api';

const submissionHistoryService = {
  /**
   * Lấy lịch sử nộp Báo Cáo Giao Ban 12 Khoa Phòng
   * @param {Object} params - { date, startDate, endDate, departmentCode, searchTerm, status }
   */
  getShiftReportHistory: async (params = {}) => {
    const res = await api.get('/admin/submission-history/shift-reports', { params });
    return res.data;
  },

  /**
   * Lấy lịch sử nộp Bản Ghi Biểu Mẫu Tùy Chỉnh (Custom Forms)
   * @param {Object} params - { date, startDate, endDate, formCode, formId, username, departmentCode, searchTerm }
   */
  getCustomFormsHistory: async (params = {}) => {
    const res = await api.get('/admin/submission-history/custom-forms', { params });
    return res.data;
  }
};

export default submissionHistoryService;
