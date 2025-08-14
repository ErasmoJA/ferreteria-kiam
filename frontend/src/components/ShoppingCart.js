import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryHelpers';

const ShoppingCart = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16; // 16% IVA
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(productId);
    } else {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Aquí implementarías la lógica de checkout
    setTimeout(() => {
      alert('¡Pedido procesado exitosamente! (Demo)');
      onClearCart();
      setIsCheckingOut(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center">
            <ShoppingBag className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Mi Carrito ({cart.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-500 mb-6">
                Agrega algunos productos para comenzar
              </p>
              <button
                onClick={onClose}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {getCategoryIcon(item.categoria_nombre)}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {item.marca && `${item.marca} • `}
                        {item.categoria_nombre}
                      </p>
                      
                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-lg font-bold text-orange-600">
                          ${item.precio}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">c/u</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          Subtotal: ${(item.precio * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= item.stock && (
                        <div className="mt-2">
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            ⚠️ Stock máximo alcanzado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="w-full text-red-600 hover:text-red-800 py-2 text-sm font-medium transition-colors"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>

              {/* Total */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceder al Pago
                  </>
                )}
              </button>

              {/* Continue Shopping */}
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;