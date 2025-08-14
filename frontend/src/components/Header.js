import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react';

const Header = ({ 
  currentPage, 
  setCurrentPage, 
  user, 
  onLogout, 
  onOpenAuth, 
  cartTotal, 
  cartItemCount,
  onOpenCart, // ← NUEVO PROP
  isAdmin,
  onAdminToggle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsUserMenuOpen(false);
  };

  const handleAuthClick = () => {
    onOpenAuth();
    setIsMenuOpen(false);
  };

  const handleAdminClick = () => {
    onAdminToggle();
    setIsUserMenuOpen(false);
  };

  // ==========================================
  // NUEVA FUNCIÓN PARA ABRIR CARRITO
  // ==========================================
  const handleCartClick = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    onOpenCart();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleNavigation('home')}
            >
              <img src="/logo.png" alt="Ferretería Kiam" className="w-25 h-12 mr-3" />
              <span className="text-xl font-bold text-orange-700">Ferretería Kiam</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => handleNavigation('home')}
              className={`font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-orange-700' 
                  : 'text-slate-600 hover:text-orange-700'
              }`}
            >
              Inicio
            </button>
            <button 
              onClick={() => handleNavigation('products')}
              className={`font-medium transition-colors ${
                currentPage === 'products' 
                  ? 'text-orange-700' 
                  : 'text-slate-600 hover:text-orange-700'
              }`}
            >
              Productos
            </button>
          </nav>
          
          {/* Cart and User Section */}
          <div className="flex items-center space-x-4">
            {/* ========================================== */}
            {/* CARRITO MEJORADO */}
            {/* ========================================== */}
            <div className="flex items-center space-x-3">
              {/* Botón del carrito */}
              <button
                onClick={handleCartClick}
                className="relative p-2 text-slate-600 hover:text-orange-700 transition-colors rounded-lg hover:bg-orange-50"
                title={user ? "Abrir carrito" : "Inicia sesión para ver tu carrito"}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
              
              {/* Total del carrito */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500">Total</span>
                <span className="font-bold text-orange-600">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Botón de Admin (solo si es admin) */}
            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center"
                title="Panel de Administración"
              >
                <Settings className="h-4 w-4 mr-1" />
                <span className="hidden lg:block">Admin</span>
              </button>
            )}
            
            {/* Usuario o botones de auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-slate-700 hover:text-orange-700 transition-colors p-2 rounded-lg hover:bg-orange-50"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.nombre.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">
                    {user.nombre}
                  </span>
                </button>
                
                {/* Menú desplegable de usuario */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-orange-100 z-50">
                    <div className="py-2">
                      {/* Info del usuario */}
                      <div className="px-4 py-3 text-sm text-slate-600 border-b border-orange-100 bg-orange-50">
                        <div className="font-medium text-gray-900">{user.nombre} {user.apellidos}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        {isAdmin && (
                          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                            <Settings className="w-3 h-3 mr-1" />
                            {user.tipo_usuario}
                          </div>
                        )}
                      </div>
                      
                      {/* Enlaces del menú */}
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 transition-colors flex items-center"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // Aquí podrías agregar navegación a perfil
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </button>
                      
                      {/* Carrito en el menú móvil */}
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 transition-colors flex items-center md:hidden"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleCartClick();
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mi Carrito ({cartItemCount})
                        <span className="ml-auto text-orange-600 font-medium">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </button>
                      
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 transition-colors"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // Aquí podrías agregar navegación a pedidos
                        }}
                      >
                        Mis Pedidos
                      </button>
                      
                      {/* Panel Admin */}
                      {isAdmin && (
                        <>
                          <hr className="border-orange-100" />
                          <button 
                            onClick={handleAdminClick}
                            className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Panel Admin
                          </button>
                        </>
                      )}
                      
                      {/* Logout */}
                      <hr className="border-orange-100" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Iniciar Sesión
              </button>
            )}
            
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
              onClick={() => handleNavigation('home')}
              className="block w-full text-left py-2 text-slate-600 hover:text-orange-700"
            >
              Inicio
            </button>
            <button 
              onClick={() => handleNavigation('products')}
              className="block w-full text-left py-2 text-slate-600 hover:text-orange-700"
            >
              Productos
            </button>
            
            {/* Carrito en menú móvil */}
            {user && (
              <button 
                onClick={() => {
                  handleCartClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-600 hover:text-orange-700 flex justify-between items-center"
              >
                <span>Mi Carrito</span>
                <span className="text-orange-600 font-medium">
                  ({cartItemCount}) ${cartTotal.toFixed(2)}
                </span>
              </button>
            )}
            
            {!user && (
              <button 
                onClick={handleAuthClick}
                className="block w-full text-left py-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Iniciar Sesión
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => {
                  handleAdminClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Panel Admin
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;