import API from './api';

export const getMaintenanceRequests = async (assetId, status) => {
  const params = {};
  if (assetId) params.assetId = assetId;
  if (status) params.status = status;
  
  const res = await API.get('/maintenance', { params });
  return res.data;
};

export const raiseRequest = async (assetId, description, priority) => {
  const res = await API.post('/maintenance', { assetId, description, priority });
  return res.data;
};

export const updateRequestStatus = async (id, status, technicianId) => {
  const res = await API.put(`/maintenance/${id}/status`, { status, technicianId });
  return res.data;
};

export default { getMaintenanceRequests, raiseRequest, updateRequestStatus };
