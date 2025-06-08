import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Productos
  getProducts: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await api.get(`/admin/products?${params}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Usuarios
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  updateUserRole: async (userId, nuevo_rol) => {
    const response = await api.put(`/admin/users/${userId}/role`, { nuevo_rol });
    return response.data;
  },

  updateUserStatus: async (userId, activo) => {
    const response = await api.put(`/admin/users/${userId}/status`, { activo });
    return response.data;
  }
};