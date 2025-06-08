import React from 'react';
import { Star } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryHelpers';

const ProductCard = ({ product, showDescription = true, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-orange-100">
      {/* Product Image */}
      <div className="h-48 bg-orange-50 flex items-center justify-center text-6xl">
        {getCategoryIcon(product.categoria_nombre)}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-slate-800">
          {product.nombre}
        </h3>
        
        {showDescription && (
          <p className="text-slate-600 text-sm mb-3">
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
            ({product.calificacion_promedio})
          </span>
        </div>
        
        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-orange-600">
            ${product.precio}
          </span>
          <button 
            onClick={handleAddToCart}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>
        
        {/* Stock and Brand */}
        <p className="text-sm text-slate-500 mt-2">
          Stock: {product.stock} unidades
        </p>
        {product.marca && (
          <p className="text-xs text-slate-400 mt-1">
            Marca: {product.marca}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;