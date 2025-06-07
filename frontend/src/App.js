import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Star, Filter, Loader } from 'lucide-react';

// Importación del servicio API
import { productService, categoryService } from './services/api';

const FerreteriaApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Estados para datos del backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapeo de categorías con íconos
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'herramientas': '🔨',
      'tornilleria': '🔩',
      'pinturas': '🎨',
      'plomeria': '🚿',
      'electricos': '⚡',
      'construccion': '🏗️'
    };
    return icons[categoryName] || '📦';
  };

  const getCategoryDisplayName = (categoryName) => {
    const names = {
      'herramientas': 'Herramientas',
      'tornilleria': 'Tornillería',
      'pinturas': 'Pinturas',
      'plomeria': 'Plomería',
      'electricos': 'Eléctricos',
      'construccion': 'Construcción'
    };
    return names[categoryName] || categoryName;
  };

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

  // Cargar productos cuando cambian los filtros (usando debouncedSearchTerm)
  useEffect(() => {
    if (currentPage === 'products') {
      loadProducts();
    }
  }, [currentPage, selectedCategory, sortBy, priceRange, debouncedSearchTerm]);

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

      // Usar el servicio real
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
      // Usar el servicio real
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
      // Usar el servicio real
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Aplicar filtros locales adicionales si es necesario
    // (la mayoría de filtros ya se manejan en el backend)

    return filtered;
  }, [products]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const ProductCard = ({ product, showDescription = true }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-orange-100">
      <div className="h-48 bg-orange-50 flex items-center justify-center text-6xl">
        {getCategoryIcon(product.categoria_nombre)}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-slate-800">{product.nombre}</h3>
        {showDescription && (
          <p className="text-slate-600 text-sm mb-3">{product.descripcion}</p>
        )}
        <div className="flex items-center mb-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.calificacion_promedio) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="ml-2 text-sm text-slate-600">({product.calificacion_promedio})</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-orange-600">${product.precio}</span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">Stock: {product.stock} unidades</p>
        {product.marca && (
          <p className="text-xs text-slate-400 mt-1">Marca: {product.marca}</p>
        )}
      </div>
    </div>
  );

  const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    useEffect(() => {
      const loadFeatured = async () => {
        setLoadingFeatured(true);
        const featured = await loadFeaturedProducts();
        setFeaturedProducts(featured);
        setLoadingFeatured(false);
      };
      loadFeatured();
    }, []);

    return (
      <div>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white py-20" style={{
          background: 'linear-gradient(135deg, #CD8B47 0%, #8B4513 50%, #2F3A42 100%)'
        }}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Ferretería Kiam</h1>
            <p className="text-xl mb-8 text-orange-100">Todo lo que necesitas para tus proyectos de construcción</p>
            <button 
              onClick={() => setCurrentPage('products')}
              className="bg-white text-orange-700 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
            >
              Ver Productos
            </button>
          </div>
        </div>

        {/* Featured Products */}
        <div className="container mx-auto px-4 py-16" style={{ backgroundColor: '#F5F1E8' }}>
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Productos Destacados</h2>
          {loadingFeatured ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-orange-600" />
              <span className="ml-2 text-slate-600">Cargando productos destacados...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} showDescription={false} />
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.filter(cat => cat.nombre !== 'all').map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.nombre);
                    setCurrentPage('products');
                  }}
                  className="bg-orange-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-orange-100 border border-orange-100 text-center group"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category.nombre)}
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-orange-700">{getCategoryDisplayName(category.nombre)}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {category.total_productos} productos
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductsPage = () => (
    <div className="container mx-auto px-4 py-8 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Todos los Productos</h1>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Categoría</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.nombre}>
                  {category.nombre === 'all' ? 'Todas' : getCategoryDisplayName(category.nombre)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Ordenar por</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="name">Nombre</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Calificado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Rango de Precio</label>
            <select 
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos</option>
              <option value="low">Hasta $100</option>
              <option value="medium">$100 - $500</option>
              <option value="high">Más de $500</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-2.5">
                  <Loader className="animate-spin h-5 w-5 text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin h-8 w-8 text-orange-600" />
          <span className="ml-2 text-slate-600">Cargando productos...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-orange-700 font-medium">Error:</div>
            <div className="ml-2 text-orange-800">{error}</div>
          </div>
          <button
            onClick={loadProducts}
            className="mt-2 text-orange-700 hover:text-orange-900 underline text-sm"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No se encontraron productos con los filtros aplicados.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setPriceRange('all');
                }}
                className="mt-4 text-orange-600 hover:text-orange-800 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setCurrentPage('home')}
                >
                <img src="/logo.png" alt="Ferretería Kiam" className="w-25 h-12 mr-3" />
                <span className="text-xl font-bold text-orange-700">Ferretería Kiam</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`font-medium transition-colors ${currentPage === 'home' ? 'text-orange-700' : 'text-slate-600 hover:text-orange-700'}`}
              >
                Inicio
              </button>
              <button 
                onClick={() => setCurrentPage('products')}
                className={`font-medium transition-colors ${currentPage === 'products' ? 'text-orange-700' : 'text-slate-600 hover:text-orange-700'}`}
              >
                Productos
              </button>
            </nav>
            
            {/* Cart */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-slate-600 hover:text-orange-700 transition-colors" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </div>
              <span className="font-medium text-slate-800">${getCartTotal()}</span>
              
              {/* Connection Status */}
              <div className="hidden lg:flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-slate-500">Conectado</span>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-slate-600 hover:text-orange-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-orange-200">
              <button 
                onClick={() => {
                  setCurrentPage('home');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-600 hover:text-orange-700"
              >
                Inicio
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('products');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-600 hover:text-orange-700"
              >
                Productos
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'products' && <ProductsPage />}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2F3A42' }} className="text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Ferretería Kiam</h3>
              <p style={{ color: '#B0A58C' }}>
                Tu ferretería de confianza desde 2000. Calidad y servicio garantizado.
              </p>
              <div className="mt-4 text-sm" style={{ color: '#9CA3AF' }}>
                <p>✅ Datos en tiempo real</p>
                <p>✅ Inventario actualizado</p>
                <p>✅ Conectado con MySQL</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Contacto</h3>
              <p style={{ color: '#B0A58C' }}>📞 (871) 752-22092</p>
              <p style={{ color: '#B0A58C' }}>📧 kiamferreteria@gmail.com</p>
              <p style={{ color: '#B0A58C' }}>📍 San Federico #201, Boulevard San Antonio CP. 35015, Gómez Palacio, Durango, México</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Horarios</h3>
              <p style={{ color: '#B0A58C' }}>Lunes a Viernes: 9:00AM - 8:00PM</p>
              <p style={{ color: '#B0A58C' }}>Sábados: 9:00AM - 8:00pm</p>
              <p style={{ color: '#B0A58C' }}>Domingos: 10:00AM - 3:00PM</p>
            </div>
          </div>
          <div className="border-t border-slate-600 mt-8 pt-8 text-center" style={{ color: '#9CA3AF' }}>
            <p>&copy; 2024 Ferretería Kiam. Todos los derechos reservados.</p>
            <p className="text-xs mt-2">Versión con backend conectado - {products.length} productos cargados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FerreteriaApp;