import React from 'react';
import { Search, Loader } from 'lucide-react';
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
  loadProducts
}) => {
  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange('all');
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Todos los Productos</h1>
      
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
                  {category.nombre === 'all' ? 'Todas' : getCategoryDisplayName(category.nombre)}
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
              <option value="name">Nombre</option>
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
              <option value="all">Todos</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No se encontraron productos con los filtros aplicados.
              </p>
              <button
                onClick={clearFilters}
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
};

export default ProductsPage;