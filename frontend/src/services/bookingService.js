import API from './api';

export const getBookings = async (resourceName, userId) => {
  const params = {};
  if (resourceName) params.resourceName = resourceName;
  if (userId) params.userId = userId;
  
  const res = await API.get('/bookings', { params });
  return res.data;
};

export const createBooking = async (resourceName, date, startTime, endTime) => {
  const res = await API.post('/bookings', { resourceName, date, startTime, endTime });
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await API.put(`/bookings/${id}/status`, { status });
  return res.data;
};
