import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

// ── SUPPLIES (Insumos) ──
export const getSupplies        = ()           => api.get('/supplies');
export const getSupply          = (id)         => api.get(`/supplies/${id}`);
export const createSupply       = (data)       => api.post('/supplies', data);
export const updateSupply       = (id, data)   => api.put(`/supplies/${id}`, data);
export const decreaseStock      = (id, qty)    => api.patch(`/supplies/${id}/decrease`, { quantity: qty });

// ── CATEGORIES ──
export const getSupplyCategories = ()          => api.get('/supply-categories');

// ── PURCHASES (Compras) ──
export const getPurchases        = (params)    => api.get('/purchases', { params });
export const getPurchase         = (id)        => api.get(`/purchases/${id}`);
export const createPurchase      = (data)      => api.post('/purchases', data);
export const updatePurchase      = (id, data)  => api.put(`/purchases/${id}`, data);
export const deletePurchase      = (id)        => api.delete(`/purchases/${id}`);