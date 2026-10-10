import apiClient, { USE_MOCKS } from './client.js';

export const createReview = async (reviewData) => {
  if (USE_MOCKS) {
    return {
      _id: 'rev_' + Date.now(),
      ...reviewData,
      createdAt: new Date().toISOString()
    };
  }
  return await apiClient.post('/reviews', reviewData);
};
