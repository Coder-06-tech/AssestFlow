import API from './api';

// Fetch all notifications for the authenticated user
export const getNotifications = async () => {
  const res = await API.get('/notifications');
  return res.data;
};

// Mark all notifications as read for the user
export const markAllAsRead = async () => {
  const res = await API.put('/notifications/read-all');
  return res.data;
};

// Toggle read/unread state of a single notification
export const toggleNotificationRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/toggle`);
  return res.data;
};
