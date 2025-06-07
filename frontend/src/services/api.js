import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No response received:', error.request);
    } else {
      // Error en la configuración de la petición
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// =============================================
// SERVICIOS DE PRODUCTOS
// =============================================

export const productService = {
  // Obtener todos los productos con filtros
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.order) {
        params.append('order', filters.order);
      }
      if (filters.featured) {
        params.append('featured', filters.featured);
      }
      if (filters.limit) {
        params.append('limit', filters.limit);
      }
      if (filters.page) {
        params.append('page', filters.page);
      }

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo producto: ${error.message}`);
    }
  },

  // Obtener productos destacados
  getFeaturedProducts: async (limit = 4) => {
    try {
      const response = await api.get(`/products?featured=true&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo productos destacados: ${error.message}`);
    }
  },

  // Buscar productos
  searchProducts: async (searchTerm, limit = 20) => {
    try {
      const response = await api.get(`/products/search/${encodeURIComponent(searchTerm)}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryName, limit = 12) => {
    try {
      const response = await api.get(`/products/category/${encodeURIComponent(categoryName)}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo productos por categoría: ${error.message}`);
    }
  }
};

// =============================================
// SERVICIOS DE CATEGORÍAS
// =============================================

export const categoryService = {
  // Obtener todas las categorías
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo categorías: ${error.message}`);
    }
  },

  // Obtener categoría por ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo categoría: ${error.message}`);
    }
  },

  // Obtener categoría por nombre
  getCategoryByName: async (name) => {
    try {
      const response = await api.get(`/categories/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo categoría por nombre: ${error.message}`);
    }
  },

  // Obtener productos de una categoría
  getCategoryProducts: async (categoryId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.page) params.append('page', options.page);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.order) params.append('order', options.order);

      const response = await api.get(`/categories/${categoryId}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo productos de categoría: ${error.message}`);
    }
  }
};

// =============================================
// SERVICIOS DE AUTENTICACIÓN (para futuro uso)
// =============================================

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success && response.data.data.token) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.data.token);
        // Configurar header de autorización
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`);
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  },

  // Obtener perfil
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo perfil: ${error.message}`);
    }
  }
};

// =============================================
// UTILIDADES
// =============================================

// Configurar token de autenticación al iniciar la app
export const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Función para probar la conexión con el backend
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw new Error(`Error de conexión: ${error.message}`);
  }
};

// Función para probar la conexión con la base de datos
export const testDatabase = async () => {
  try {
    const response = await api.get('/db-test');
    return response.data;
  } catch (error) {
    throw new Error(`Error de base de datos: ${error.message}`);
  }
};

export default api;