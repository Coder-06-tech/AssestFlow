import API from './api';

export const getAllocations = async () => {
  const res = await API.get('/allocations');
  return res.data;
};

export const createAllocation = async (allocationData) => {
  const res = await API.post('/allocations', allocationData);
  return res.data;
};

export const returnAllocation = async (id, returnData) => {
  const res = await API.post(`/allocations/${id}/return`, returnData);
  return res.data;
};

export const getActivityLogs = async () => {
  const res = await API.get('/allocations/activity');
  return res.data;
};
