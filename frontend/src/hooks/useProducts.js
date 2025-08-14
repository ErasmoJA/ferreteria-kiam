import { useState, useEffect, useMemo } from 'react';
import { productService, categoryService } from '../services/api';

const useProducts = () => {
  // Estados para datos del backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Cargar productos cuando cambian los filtros (resetear página)
  useEffect(() => {
    setCurrentPage(1); // Resetear a página 1 cuando cambian filtros
    loadProducts(1); // Cargar desde página 1
  }, [selectedCategory, sortBy, priceRange, debouncedSearchTerm]);

  // Cargar productos cuando cambia la página (sin resetear filtros)
  useEffect(() => {
    if (currentPage > 1) {
      loadProducts(currentPage);
    }
  }, [currentPage]);

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      if (debouncedSearchTerm) {
        filters.search = debouncedSearchTerm;
      }
      
      // Configurar ordenamiento
      if (sortBy === 'price-low') {
        filters.sortBy = 'precio';
        filters.order = 'ASC';
      } else if (sortBy === 'price-high') {
        filters.sortBy = 'precio';
        filters.order = 'DESC';
      } else if (sortBy === 'rating') {
        filters.sortBy = 'calificacion_promedio';
        filters.order = 'DESC';
      } else {
        filters.sortBy = 'nombre';
        filters.order = 'ASC';
      }

      // Configurar rango de precios
      if (priceRange === 'low') {
        filters.maxPrice = 100;
      } else if (priceRange === 'medium') {
        filters.minPrice = 100;
        filters.maxPrice = 500;
      } else if (priceRange === 'high') {
        filters.minPrice = 500;
      }

      // ==========================================
      // CONFIGURACIÓN DINÁMICA DE LÍMITE
      // ==========================================
      
      // Si hay filtros activos, cargar más productos para mostrar todos los resultados
      let limit = 12; // Por defecto
      
      if (selectedCategory !== 'all' || debouncedSearchTerm || priceRange !== 'all') {
        // Si hay filtros, usar un límite más alto para mostrar más resultados
        limit = 100; // Aumentar a 100 productos cuando hay filtros
      }

      filters.limit = limit;
      filters.page = page;

      console.log('🔍 Cargando productos con filtros:', filters);

      const response = await productService.getProducts(filters);
      
      if (response.success) {
        if (page === 1) {
          // Si es página 1, reemplazar productos
          setProducts(response.data);
        } else {
          // Si es página siguiente, agregar productos (para paginación futura)
          setProducts(prev => [...prev, ...response.data]);
        }

        // Actualizar información de paginación
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalProducts(response.pagination.totalProducts || response.data.length);
          setCurrentPage(response.pagination.currentPage || page);
        } else {
          // Fallback si no hay paginación en la respuesta
          setTotalPages(1);
          setTotalProducts(response.data.length);
          setCurrentPage(1);
        }

        console.log(`✅ Cargados ${response.data.length} productos`, {
          page,
          total: response.pagination?.totalProducts || response.data.length,
          hasFilters: selectedCategory !== 'all' || debouncedSearchTerm || priceRange !== 'all'
        });
      } else {
        setError('Error cargando productos');
      }
    } catch (err) {
      setError('Error conectando con el servidor: ' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      
      if (response.success) {
        setCategories([
          { id: 'all', nombre: 'all', total_productos: 0 },
          ...response.data
        ]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts(4);
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error loading featured products:', err);
      return [];
    }
  };

  // Función para cargar más productos (paginación infinita - opcional)
  const loadMoreProducts = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Productos filtrados (para filtros adicionales del lado cliente si son necesarios)
  const filteredProducts = useMemo(() => {
    return [...products];
  }, [products]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange('all');
    setSortBy('name');
    setCurrentPage(1);
  };

  // Información sobre filtros activos
  const hasFiltersApplied = selectedCategory !== 'all' || searchTerm || priceRange !== 'all';
  const isSearching = searchTerm !== debouncedSearchTerm;

  return {
    // Estados de datos
    products: filteredProducts,
    categories,
    loading,
    error,

    // Estados de filtros
    searchTerm,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    priceRange,

    // Estados de paginación
    currentPage,
    totalPages,
    totalProducts,

    // Funciones de filtros
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setPriceRange,
    clearFilters,

    // Funciones de carga
    loadProducts,
    loadCategories,
    loadFeaturedProducts,
    loadMoreProducts,

    // Estado computado
    hasFiltersApplied,
    isSearching,
    hasMoreProducts: currentPage < totalPages,
    showingCount: products.length
  };
};

export default useProducts;