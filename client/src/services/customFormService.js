import api from './api';

const customFormService = {
  getAllForms: async () => {
    const response = await api.get('/custom-forms');
    return response.data;
  },
  getFormByCode: async (code) => {
    const response = await api.get(`/custom-forms/${code}`);
    return response.data;
  },
  createForm: async (data) => {
    const response = await api.post('/custom-forms', data);
    return response.data;
  },
  updateForm: async (id, data) => {
    const response = await api.put(`/custom-forms/${id}`, data);
    return response.data;
  },
  deleteForm: async (id) => {
    const response = await api.delete(`/custom-forms/${id}`);
    return response.data;
  },
  submitFormData: async (code, payload) => {
    const response = await api.post(`/custom-forms/${code}/submit`, payload);
    return response.data;
  },
  getFormSubmissions: async (code, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/custom-forms/${code}/submissions${query ? `?${query}` : ''}`);
    return response.data;
  },
  getTrackerData: async (code, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/custom-forms/${code}/tracker${query ? `?${query}` : ''}`);
    return response.data;
  }
};

export default customFormService;
