import API from './api';

export const getAssets = async () => {
  const res = await API.get('/assets');
  return res.data;
};

export const createAsset = async (assetData) => {
  const res = await API.post('/assets', assetData);
  return res.data;
};

export const getCategories = async () => {
  const res = await API.get('/org/categories');
  return res.data;
};

export const getDepartments = async () => {
  const res = await API.get('/org/departments');
  return res.data;
};

export const getEmployees = async () => {
  const res = await API.get('/org/employees');
  return res.data;
};
