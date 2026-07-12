import API from './api';

export const getAssets = async () => {
  const res = await API.get('/assets');
  return res.data;
};
