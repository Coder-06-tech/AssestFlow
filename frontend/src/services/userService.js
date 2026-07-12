import API from './api';

export const getUsers = async () => {
  const res = await API.get('/users');
  return res.data;
};

export const seedDatabase = async () => {
  const res = await API.post('/seed');
  return res.data;
};
