import React from 'react';
import { Search, Loader, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { getCategoryDisplayName } from '../utils/categoryHelpers';

const ProductsPage = ({
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  categories,
  loading,
  error,
  products,
  addToCart,
  loadProducts,
  // Nuevas props para paginación
  totalProducts,
  showingCount,
  hasMoreProducts,
  loadMoreProducts
}) => {
  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange('all');
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header con información de resultados */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Todos los Productos</h1>
        
        {/* Información de resultados */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="text-slate-600 mb-2 sm:mb-0">
            {loading ? (
              <span>Cargando productos...</span>
            ) : (
              <span>
                Mostrando {showingCount} de {totalProducts} productos
                {selectedCategory !== 'all' && (
                  <span className="font-medium"> en {getCategoryDisplayName(selectedCategory)}</span>
                )}
                {searchTerm && (
                  <span className="font-medium"> que contienen "{searchTerm}"</span>
                )}
              </span>
            )}
          </div>
          
          {/* Botón para limpiar filtros */}
          {(selectedCategory !== 'all' || searchTerm || priceRange !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium underline"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Categoría
            </label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.nombre}>
                  {category.nombre === 'all' ? 'Todas las categorías' : getCategoryDisplayName(category.nombre)}
                  {category.total_productos > 0 && category.nombre !== 'all' && (
                    ` (${category.total_productos})`
                  )}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Ordenar por
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="name">Nombre (A-Z)</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Calificado</option>
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Rango de Precio
            </label>
            <select 
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los precios</option>
              <option value="low">Hasta $100</option>
              <option value="medium">$100 - $500</option>
              <option value="high">Más de $500</option>
            </select>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Buscar
            </label>
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
          {/* Filtros activos - Tags */}
          {(selectedCategory !== 'all' || searchTerm || priceRange !== 'all') && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Filtros activos:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    Categoría: {getCategoryDisplayName(selectedCategory)}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-2 hover:text-orange-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Búsqueda: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Precio: {priceRange === 'low' ? 'Hasta $100' : priceRange === 'medium' ? '$100-$500' : 'Más de $500'}
                    <button
                      onClick={() => setPriceRange('all')}
                      className="ml-2 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          
          {/* Botón cargar más (si hay más productos) */}
          {hasMoreProducts && !loading && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreProducts}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center mx-auto"
              >
                <ChevronDown className="w-5 h-5 mr-2" />
                Cargar más productos
              </button>
            </div>
          )}
          
          {/* Mensaje sin resultados */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-slate-500 mb-6">
                {selectedCategory !== 'all' || searchTerm || priceRange !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay productos disponibles en este momento'
                }
              </p>
              {(selectedCategory !== 'all' || searchTerm || priceRange !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}

          {/* Información de resultados al final */}
          {products.length > 0 && (
            <div className="text-center mt-8 py-4 border-t border-gray-200">
              <p className="text-slate-600">
                Mostrando {showingCount} de {totalProducts} productos
                {!hasMoreProducts && showingCount === totalProducts && (
                  <span className="text-green-600 font-medium"> • Todos los resultados mostrados</span>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;