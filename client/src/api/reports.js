import apiClient, { USE_MOCKS } from './client.js';

export const createReport = async (reportData) => {
  if (USE_MOCKS) {
    return {
      _id: 'rep_' + Date.now(),
      ...reportData,
      status: 'open',
      createdAt: new Date().toISOString()
    };
  }
  return await apiClient.post('/reports', reportData);
};
