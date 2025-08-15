// frontend/src/components/POSInterface.js
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Scan, Plus, Minus, Trash2, Check, Search } from 'lucide-react';

const POSInterface = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
  try {
    setLoading(true);
    
    // Detectar si estamos en localhost o en la red
    const currentHost = window.location.hostname;
    let apiURL;
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      apiURL = 'http://localhost:5000/api/products?limit=100';
    } else {
      apiURL = 'http://192.168.100.5:5000/api/products?limit=100';
    }
    
    console.log('🔍 Conectando a:', apiURL);
    const response = await fetch(apiURL);
    const data = await response.json();
    
    if (data.success) {
      setProducts(data.data);
      console.log('✅ Productos cargados exitosamente');
    }
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    
    // Fallback: intentar con localhost si falla la IP de red
    try {
      console.log('🔄 Intentando fallback con localhost...');
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        console.log('✅ Productos cargados con fallback');
      }
    } catch (fallbackError) {
      console.error('❌ Error también en fallback:', fallbackError);
      // Productos de ejemplo como último recurso
      setProducts([
        { id: 1, nombre: 'Martillo 16oz', precio: 250, stock: 15, codigo: '123456789' },
        { id: 2, nombre: 'Destornillador Phillips', precio: 85, stock: 32, codigo: '987654321' },
        { id: 3, nombre: 'Pintura Blanca 4L', precio: 380, stock: 25, codigo: '456789123' },
        { id: 4, nombre: 'Taladro 600W', precio: 1850, stock: 8, codigo: '789123456' }
      ]);
      console.log('⚠️ Usando productos de ejemplo (modo offline)');
    }
  } finally {
    setLoading(false);
  }
    };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.cantidad < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        alert('⚠️ Stock insuficiente');
      }
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, cantidad: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleScan = () => {
    const product = products.find(p => 
      p.codigo === scannedCode || 
      p.nombre.toLowerCase().includes(scannedCode.toLowerCase())
    );
    
    if (product) {
      addToCart(product);
      setScannedCode('');
      alert(`✅ ${product.nombre} agregado al carrito`);
    } else {
      alert('❌ Producto no encontrado');
    }
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('⚠️ El carrito está vacío');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Aquí simularemos el proceso de venta
      // En una implementación real, harías:
      // 1. POST a /api/sales para registrar la venta
      // 2. PUT a /api/products/:id para actualizar stock
      
      const total = getTotal();
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular actualización de stock
      cart.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
          products[productIndex].stock -= item.cantidad;
        }
      });
      
      alert(`✅ Venta procesada exitosamente!\nTotal: $${total.toFixed(2)}\nGracias por su compra.`);
      setCart([]);
      
    } catch (error) {
      alert('❌ Error procesando la venta');
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.16; // IVA 16%
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de limpiar el carrito?')) {
      setCart([]);
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.marca && product.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.codigo && product.codigo.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-orange-600 text-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                🏪 Punto de Venta
              </h1>
              <p className="text-orange-100">Ferretería Kiam - Sistema POS</p>
            </div>
            <div className="text-right">
              <div className="text-orange-100">PC Mostrador</div>
              <div className="text-2xl font-bold">🟢 En Línea</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel de Búsqueda y Productos */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Búsqueda y Escáner */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Productos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Escáner/código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Barras o SKU
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Escanear código..."
                    />
                    <button
                      onClick={handleScan}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 flex items-center"
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Buscar
                    </button>
                  </div>
                </div>
                
                {/* Búsqueda por nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Búsqueda por Nombre
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Martillo, destornillador, pintura..."
                  />
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                📦 Productos Disponibles ({filteredProducts.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando productos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.slice(0, 20).map(product => (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {product.nombre}
                          </h3>
                          {product.marca && (
                            <p className="text-xs text-gray-500">{product.marca}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          ${product.precio}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-sm px-2 py-1 rounded ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {product.stock}
                        </span>
                        
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {product.stock === 0 ? 'Agotado' : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel del Carrito */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" />
              Carrito de Compras
              <span className="ml-2 bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                {cart.length}
              </span>
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🛒</div>
                <p className="text-gray-500">Carrito vacío</p>
                <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
              </div>
            ) : (
              <>
                {/* Items del carrito */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.nombre}</div>
                        <div className="text-xs text-gray-500">
                          ${item.precio} × {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium bg-white rounded px-2 py-1">
                          {item.cantidad}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2 text-orange-600">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={processSale}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando Venta...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Procesar Venta
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={clearCart}
                    disabled={isProcessing}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Limpiar Carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;