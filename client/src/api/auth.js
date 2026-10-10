import apiClient, { USE_MOCKS } from './client.js';
import { MOCK_USERS } from '../mocks/mockData.js';

export const register = async (userData) => {
  if (USE_MOCKS) {
    const mockUser = {
      _id: 'usr_' + Date.now(),
      ...userData,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    };
    return { token: 'mock_jwt_token_' + Date.now(), user: mockUser };
  }
  return await apiClient.post('/auth/register', userData);
};

export const login = async (credentials) => {
  if (USE_MOCKS) {
    const user = MOCK_USERS.find(u => u.email === credentials.email) || {
      _id: 'usr_mock_' + Date.now(),
      name: credentials.email.split('@')[0],
      email: credentials.email,
      role: credentials.email.includes('worker') ? 'worker' : 'customer',
      phone: '9848012345',
      language: 'en'
    };
    return { token: 'mock_jwt_token_demo', user };
  }
  return await apiClient.post('/auth/login', credentials);
};

export const getMe = async () => {
  if (USE_MOCKS) {
    const storedUser = localStorage.getItem('kaamconnect_user');
    return storedUser ? JSON.parse(storedUser) : MOCK_USERS[0];
  }
  return await apiClient.get('/auth/me');
};

export const updateMe = async (data) => {
  if (USE_MOCKS) {
    return { ...MOCK_USERS[0], ...data };
  }
  return await apiClient.patch('/auth/me', data);
};
