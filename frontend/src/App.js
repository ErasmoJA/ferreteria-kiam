import React, { useState } from 'react';
import './App.css';

// Importar componentes
import Header from './components/Header';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

// Importar hooks personalizados
import { useAuth } from './hooks/useAuth';
import useProducts from './hooks/useProducts';

const FerreteriaApp = () => {
  // Estados de navegación
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    clearFilters
  } = useProducts();

  // Funciones del carrito
  const addToCart = (product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

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

  // Handlers de autenticación
  const handleLoginSuccess = (userData) => {
    handleLogin(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setCart([]); // Limpiar carrito al cerrar sesión
  };

  // Loading state global
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando aplicación...</div>
      </div>
    );
  }

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
    </div>
  );
};

export default FerreteriaApp;