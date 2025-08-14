import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import ProductCard from './ProductCard';
import { getCategoryIcon, getCategoryDisplayName } from '../utils/categoryHelpers';

const HomePage = ({ 
  categories, 
  setSelectedCategory, 
  setCurrentPage, 
  loadFeaturedProducts,
  addToCart 
}) => {
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
  }, [loadFeaturedProducts]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentPage('products');
  };

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white py-20" 
        style={{
          background: 'linear-gradient(135deg, #CD8B47 0%, #8B4513 50%, #2F3A42 100%)'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Ferretería Kiam</h1>
          <p className="text-xl mb-8 text-orange-100">
            Todo lo que necesitas para tus proyectos de construcción
          </p>
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
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">
          Productos Destacados
        </h2>
        {loadingFeatured ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin h-8 w-8 text-orange-600" />
            <span className="ml-2 text-slate-600">Cargando productos los destacados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showDescription={false}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">
            Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.filter(cat => cat.nombre !== 'all').map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.nombre)}
                className="bg-orange-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-orange-100 border border-orange-100 text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.nombre)}
                </div>
                <h3 className="font-semibold text-slate-800 group-hover:text-orange-700">
                  {getCategoryDisplayName(category.nombre)}
                </h3>
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

export default HomePage;