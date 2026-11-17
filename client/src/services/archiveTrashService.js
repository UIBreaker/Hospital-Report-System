import api from './api';

const archiveTrashService = {
  getTrash: async () => (await api.get('/admin/data-archive/trash')).data,
  moveToTrash: async date => (await api.post(`/admin/data-archive/trash/${date}`)).data,
  restoreFromTrash: async date => (await api.delete(`/admin/data-archive/trash/${date}`)).data,
  previewDelete: async dates => (await api.post('/admin/data-archive/trash/preview-delete', { dates })).data,
  deleteSelected: async (dates, digest, confirmation) =>
    (await api.post('/admin/data-archive/trash/delete-selected', { dates, digest, confirmation })).data
};

export default archiveTrashService;
