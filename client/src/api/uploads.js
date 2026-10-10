import apiClient, { USE_MOCKS } from './client.js';

export const uploadFiles = async (formData) => {
  if (USE_MOCKS) {
    return {
      files: [
        {
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
          type: 'image'
        }
      ]
    };
  }
  return await apiClient.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
