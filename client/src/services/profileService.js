import api from './api';

const profileService = {
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },

  updateAvatar: async (avatarUrl) => {
    const res = await api.post('/auth/profile/avatar', { avatar_url: avatarUrl });
    return res.data;
  },

  updateSignature: async (signatureUrl) => {
    const res = await api.post('/auth/profile/signature', { signature_url: signatureUrl });
    return res.data;
  }
};

export default profileService;
