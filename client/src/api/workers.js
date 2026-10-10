import apiClient, { USE_MOCKS } from './client.js';
import { MOCK_WORKERS } from '../mocks/mockData.js';

export const listWorkers = async (params = {}) => {
  if (USE_MOCKS) {
    let list = [...MOCK_WORKERS];
    if (params.profession) {
      list = list.filter(w => w.professions.includes(params.profession));
    }
    return { items: list, page: 1, limit: 10, total: list.length };
  }
  return await apiClient.get('/workers', { params });
};

export const getWorkerById = async (id) => {
  if (USE_MOCKS) {
    const worker = MOCK_WORKERS.find(w => w._id === id || w.user?._id === id) || MOCK_WORKERS[0];
    return worker;
  }
  return await apiClient.get(`/workers/${id}`);
};

export const getWorkerReviews = async (id, params = {}) => {
  if (USE_MOCKS) {
    return {
      items: [
        {
          _id: 'rev_1',
          rating: 5,
          comment: 'Outstanding electrical work! Very punctual and clean finishing in Subedari.',
          customer: { name: 'Vikram R.' },
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          _id: 'rev_2',
          rating: 5,
          comment: 'Fair pricing and completed 3 room wiring on time. Recommended!',
          customer: { name: 'Kavitha P.' },
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
        }
      ],
      total: 2
    };
  }
  return await apiClient.get(`/workers/${id}/reviews`, { params });
};

export const getWorkerProfileMe = async () => {
  if (USE_MOCKS) {
    return MOCK_WORKERS[0];
  }
  return await apiClient.get('/workers/me');
};

export const updateWorkerProfileMe = async (data) => {
  if (USE_MOCKS) {
    return { ...MOCK_WORKERS[0], ...data };
  }
  return await apiClient.put('/workers/me', data);
};

export const addPortfolioItem = async (item) => {
  if (USE_MOCKS) {
    return { ...item, _id: 'port_' + Date.now() };
  }
  return await apiClient.post('/workers/me/portfolio', item);
};

export const deletePortfolioItem = async (itemId) => {
  if (USE_MOCKS) {
    return { success: true };
  }
  return await apiClient.delete(`/workers/me/portfolio/${itemId}`);
};

export const updateAvailability = async (availabilityData) => {
  if (USE_MOCKS) {
    return availabilityData;
  }
  return await apiClient.patch('/workers/me/availability', availabilityData);
};
