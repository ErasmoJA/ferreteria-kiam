import React, { useState } from 'react';
import { Star, ImageIcon } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryHelpers';

const ProductCard = ({ product, showDescription = true, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Determinar qué mostrar en la imagen
  const renderProductImage = () => {
    // Si hay imagen principal y no ha habido error, mostrar imagen
    if (product.imagen_principal && !imageError) {
      return (
        <div className="relative w-full h-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-orange-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          )}
          <img
            src={`http://localhost:5000${product.imagen_principal}`}
            alt={product.nombre}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
    }

    // Fallback: mostrar ícono de categoría
    return (
      <div className="w-full h-full bg-orange-50 flex items-center justify-center text-6xl">
        {getCategoryIcon(product.categoria_nombre)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-orange-100 group">
      {/* Product Image */}
      <div className="h-48 relative overflow-hidden">
        {renderProductImage()}
        
        {/* Overlay de producto destacado */}
        {product.destacado && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            ⭐ Destacado
          </div>
        )}

        {/* Overlay de oferta */}
        {product.precio_oferta && product.precio_oferta < product.precio && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            🔥 Oferta
          </div>
        )}

        {/* Overlay de stock bajo */}
        {product.stock <= product.stock_minimo && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            ⚠️ Stock bajo
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-slate-800 line-clamp-2 group-hover:text-orange-700 transition-colors">
          {product.nombre}
        </h3>
        
        {showDescription && (
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {product.descripcion}
          </p>
        )}
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(product.calificacion_promedio) 
                    ? 'fill-current' 
                    : ''
                }`} 
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-slate-600">
            ({product.calificacion_promedio}) {product.total_resenas} reseñas
          </span>
        </div>
        
        {/* Price Section */}
        <div className="mb-3">
          {product.precio_oferta && product.precio_oferta < product.precio ? (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-red-600">
                ${product.precio_oferta}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ${product.precio}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                {Math.round(((product.precio - product.precio_oferta) / product.precio) * 100)}% OFF
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-orange-600">
              ${product.precio}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-md transform hover:-translate-y-1'
            }`}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </button>
          
          {/* Stock indicator */}
          <div className="text-right">
            <span className={`text-sm ${
              product.stock === 0 
                ? 'text-red-600 font-medium' 
                : product.stock <= product.stock_minimo
                ? 'text-orange-600'
                : 'text-green-600'
            }`}>
              {product.stock === 0 
                ? 'Sin stock' 
                : `${product.stock} disponibles`
              }
            </span>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-slate-500">
            {product.marca && (
              <span className="font-medium">
                {product.marca}
              </span>
            )}
            <span className="capitalize">
              {product.categoria_nombre}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;