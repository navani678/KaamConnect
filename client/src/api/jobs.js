import apiClient, { USE_MOCKS } from './client.js';
import { MOCK_JOBS, MOCK_WORKERS } from '../mocks/mockData.js';

export const createJob = async (jobData) => {
  if (USE_MOCKS) {
    const newJob = {
      _id: 'job_' + Date.now(),
      ...jobData,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    return newJob;
  }
  return await apiClient.post('/jobs', jobData);
};

export const getMyJobs = async (params = {}) => {
  if (USE_MOCKS) {
    return { items: MOCK_JOBS, page: 1, limit: 10, total: MOCK_JOBS.length };
  }
  return await apiClient.get('/jobs/mine', { params });
};

export const getJobById = async (id) => {
  if (USE_MOCKS) {
    const job = MOCK_JOBS.find(j => j._id === id) || MOCK_JOBS[0];
    return job;
  }
  return await apiClient.get(`/jobs/${id}`);
};

export const updateJob = async (id, data) => {
  if (USE_MOCKS) {
    return { ...MOCK_JOBS[0], ...data };
  }
  return await apiClient.patch(`/jobs/${id}`, data);
};

export const getJobMatches = async (id, params = {}) => {
  if (USE_MOCKS) {
    return {
      items: MOCK_WORKERS,
      total: MOCK_WORKERS.length,
      job: MOCK_JOBS[0]
    };
  }
  return await apiClient.get(`/jobs/${id}/matches`, { params });
};
