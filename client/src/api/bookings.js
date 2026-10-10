import apiClient, { USE_MOCKS } from './client.js';
import { MOCK_BOOKINGS } from '../mocks/mockData.js';

export const createBooking = async (bookingData) => {
  if (USE_MOCKS) {
    const newBk = {
      _id: 'bk_' + Date.now(),
      ...bookingData,
      status: 'pending',
      negotiation: [
        {
          by: 'customer',
          price: bookingData.proposedPrice,
          message: bookingData.message || 'Initial booking request',
          at: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    return newBk;
  }
  return await apiClient.post('/bookings', bookingData);
};

export const getMyBookings = async (params = {}) => {
  if (USE_MOCKS) {
    return { items: MOCK_BOOKINGS, page: 1, limit: 10, total: MOCK_BOOKINGS.length };
  }
  return await apiClient.get('/bookings/mine', { params });
};

export const getBookingById = async (id) => {
  if (USE_MOCKS) {
    return MOCK_BOOKINGS.find(b => b._id === id) || MOCK_BOOKINGS[0];
  }
  return await apiClient.get(`/bookings/${id}`);
};

export const acceptBooking = async (id) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'accepted' };
  }
  return await apiClient.post(`/bookings/${id}/accept`);
};

export const rejectBooking = async (id, reason) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'rejected', rejectionReason: reason };
  }
  return await apiClient.post(`/bookings/${id}/reject`, { reason });
};

export const counterBooking = async (id, data) => {
  if (USE_MOCKS) {
    return {
      ...MOCK_BOOKINGS[0],
      status: 'countered',
      negotiation: [
        ...MOCK_BOOKINGS[0].negotiation,
        { by: 'worker', price: data.price, message: data.message, at: new Date().toISOString() }
      ]
    };
  }
  return await apiClient.post(`/bookings/${id}/counter`, data);
};

export const confirmCounter = async (id) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'accepted' };
  }
  return await apiClient.post(`/bookings/${id}/confirm-counter`);
};

export const declineCounter = async (id, reason) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'rejected', rejectionReason: reason };
  }
  return await apiClient.post(`/bookings/${id}/decline-counter`, { reason });
};

export const cancelBooking = async (id, reason) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'cancelled', rejectionReason: reason };
  }
  return await apiClient.post(`/bookings/${id}/cancel`, { reason });
};

export const completeBooking = async (id) => {
  if (USE_MOCKS) {
    return { ...MOCK_BOOKINGS[0], status: 'completed', completedAt: new Date().toISOString() };
  }
  return await apiClient.post(`/bookings/${id}/complete`);
};
