import api from './api';

// Products
export const adminGetProducts = (params) => api.get('/products', { params: { ...params, limit: 50 } });
export const adminCreateProduct = (data) => api.post('/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);

// Orders
export const adminGetOrders = () => api.get('/orders');
export const adminUpdateOrderStatus = (id, status, trackingNumber) =>
  api.put(`/orders/${id}/status`, { status, trackingNumber });

// Stats (derived from existing endpoints)
export const adminGetStats = async () => {
  const [products, orders] = await Promise.all([
    api.get('/products', { params: { limit: 1 } }),
    api.get('/orders'),
  ]);
  const orderList = orders.data;
  const revenue = orderList
    .filter(o => o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalProducts: products.data.total,
    totalOrders: orderList.length,
    revenue,
    pendingOrders: orderList.filter(o => o.status === 'pending').length,
  };
};