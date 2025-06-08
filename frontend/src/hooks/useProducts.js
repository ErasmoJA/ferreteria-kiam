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

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, priceRange, debouncedSearchTerm]);

  const loadProducts = async () => {
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

      const response = await productService.getProducts(filters);
      
      if (response.success) {
        setProducts(response.data);
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
  };

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

    // Estado computado
    hasFiltersApplied: selectedCategory !== 'all' || searchTerm || priceRange !== 'all',
    isSearching: searchTerm !== debouncedSearchTerm
  };
};

export default useProducts;