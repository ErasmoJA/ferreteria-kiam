import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';

const Header = ({ 
  currentPage, 
  setCurrentPage, 
  user, 
  onLogout, 
  onOpenAuth, 
  cartTotal, 
  cartItemCount 
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
            {/* Carrito */}
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-slate-600 hover:text-orange-700 transition-colors cursor-pointer" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="font-medium text-slate-800">${cartTotal}</span>
            
            {/* Usuario o botones de auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-slate-700 hover:text-orange-700 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="hidden md:block">Hola, {user.nombre}</span>
                </button>
                
                {/* Menú desplegable de usuario */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-orange-100 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-slate-600 border-b border-orange-100">
                        {user.email}
                      </div>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 transition-colors"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // Aquí podrías agregar navegación a perfil
                        }}
                      >
                        Mi Perfil
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
            {!user && (
              <button 
                onClick={handleAuthClick}
                className="block w-full text-left py-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;