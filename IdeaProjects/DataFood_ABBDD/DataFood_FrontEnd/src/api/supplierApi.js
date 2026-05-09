import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getSuppliers    = ()           => api.get('/suppliers');
export const getSupplier     = (id)         => api.get(`/suppliers/${id}`);
export const createSupplier  = (data)       => api.post('/suppliers', data);
export const updateSupplier  = (id, data)   => api.put(`/suppliers/${id}`, data);
export const toggleSupplier  = (id)         => api.patch(`/suppliers/${id}/toggle-status`);