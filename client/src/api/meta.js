import apiClient, { USE_MOCKS } from './client.js';
import { MOCK_PROFESSIONS } from '../mocks/mockData.js';

export const getProfessions = async () => {
  if (USE_MOCKS) {
    return MOCK_PROFESSIONS;
  }
  return await apiClient.get('/meta/professions');
};

export const getHealth = async () => {
  return await apiClient.get('/health');
};
