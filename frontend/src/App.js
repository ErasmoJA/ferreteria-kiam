import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import './App.css';

// Importar componentes principales
import Header from './components/Header';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ShoppingCart from './components/ShoppingCart';
import POSInterface from './components/POSInterface';

// Importar hooks personalizados
import { useAuth } from './hooks/useAuth';
import useProducts from './hooks/useProducts';

const FerreteriaApp = () => {
  
  // ==========================================
  // 🔥 TODOS LOS HOOKS DEBEN IR PRIMERO (ANTES DE CUALQUIER RETURN)
  // ==========================================
  
  // Estados de navegación
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Estados del carrito
  const [cart, setCart] = useState([]);

  // Hook de autenticación
  const {
    user,
    isLoading: authLoading,
    handleLogin,
    handleLogout
  } = useAuth();

  // Hook de productos
  const {
    products,
    categories,
    loading: productsLoading,
    error: productsError,
    searchTerm,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    priceRange,
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setPriceRange,
    loadProducts,
    loadFeaturedProducts,
    clearFilters,
    totalProducts,
    showingCount,
    hasMoreProducts,
    loadMoreProducts
  } = useProducts();

  // ==========================================
  // EFFECTS (TAMBIÉN DEBEN IR ANTES DE RETURNS)
  // ==========================================

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart && user) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Solo cargar si el carrito pertenece al usuario actual
        if (parsedCart.userId === user.id) {
          setCart(parsedCart.items || []);
        }
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('shopping_cart');
      }
    }
  }, [user]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (user && cart.length >= 0) {
      const cartData = {
        userId: user.id,
        items: cart,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('shopping_cart', JSON.stringify(cartData));
    }
  }, [cart, user]);

  // ==========================================
  // DETECTAR MODO POS (DESPUÉS DE TODOS LOS HOOKS)
  // ==========================================
  
  const urlParams = new URLSearchParams(window.location.search);
  const isPOSMode = urlParams.get('mode') === 'pos';

  // ==========================================
  // FUNCIONES DEL CARRITO
  // ==========================================

  const addToCart = (product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Verificar stock disponible
    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantityInCart >= product.stock) {
      alert(`⚠️ No hay más stock disponible para ${product.nombre}`);
      return;
    }

    if (existingItem) {
      // Incrementar cantidad
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Agregar nuevo producto
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    console.log(`✅ ${product.nombre} agregado al carrito`);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const subtotal = item.precio * item.quantity;
      const tax = subtotal * 0.16; // 16% IVA
      return total + subtotal + tax;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user && ['admin', 'manager', 'super_admin'].includes(user.tipo_usuario);
  };

  // Handlers de autenticación
  const handleLoginSuccess = (userData) => {
    handleLogin(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setCart([]); // Limpiar carrito al cerrar sesión
    setShowAdminPanel(false); // Salir del panel admin
    localStorage.removeItem('shopping_cart'); // Limpiar carrito guardado
  };

  const handleAdminToggle = () => {
    if (isAdmin()) {
      setShowAdminPanel(!showAdminPanel);
    }
  };

  // ==========================================
  // RENDERIZADO CONDICIONAL (DESPUÉS DE TODOS LOS HOOKS)
  // ==========================================

  // 🔥 MODO POS (AHORA AL FINAL, DESPUÉS DE TODOS LOS HOOKS)
  if (isPOSMode) {
    return <POSInterface />;
  }

  // Loading state global
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando aplicación...</div>
        </div>
      </div>
    );
  }

  // Si está en modo admin y es administrador, mostrar panel admin
  if (showAdminPanel && isAdmin()) {
    return (
      <AdminPanel 
        user={user}
        onLogout={handleLogoutClick}
        onBackToStore={() => setShowAdminPanel(false)}
      />
    );
  }

  // Interfaz normal de la tienda
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogoutClick}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        cartTotal={getCartTotal()}
        cartItemCount={getCartItemCount()}
        onOpenCart={() => setShowCart(true)}
        isAdmin={isAdmin()}
        onAdminToggle={handleAdminToggle}
      />

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <HomePage 
            categories={categories}
            setSelectedCategory={setSelectedCategory}
            setCurrentPage={setCurrentPage}
            loadFeaturedProducts={loadFeaturedProducts}
            addToCart={addToCart}
          />
        )}
        
        {currentPage === 'products' && (
          <ProductsPage 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            debouncedSearchTerm={debouncedSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            categories={categories}
            loading={productsLoading}
            error={productsError}
            products={products}
            addToCart={addToCart}
            loadProducts={loadProducts}
            totalProducts={totalProducts}
            showingCount={showingCount}
            hasMoreProducts={hasMoreProducts}
            loadMoreProducts={loadMoreProducts}
          />
        )}
      </main>

      {/* Footer */}
      <Footer totalProducts={products.length} />

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLoginSuccess}
      />

      {/* Carrito de Compras */}
      <ShoppingCart 
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />

      {/* Indicador de carrito flotante */}
      {cart.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors z-40 lg:hidden"
        >
          <ShoppingBag className="w-6 h-6" />
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getCartItemCount()}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default FerreteriaApp;