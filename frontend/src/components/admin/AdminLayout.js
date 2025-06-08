import React, { useState } from 'react';
import { 
  BarChart3, Package, Users, Settings, LogOut, 
  Menu, X, Home, ShoppingCart, FileText, Store 
} from 'lucide-react';

const AdminLayout = ({ children, currentPage, onPageChange, onLogout, onBackToStore, adminUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: BarChart3, 
      label: 'Dashboard', 
      roles: ['admin', 'manager', 'super_admin'] 
    },
    { 
      id: 'products', 
      icon: Package, 
      label: 'Productos', 
      roles: ['admin', 'manager', 'employee', 'super_admin'] 
    },
    { 
      id: 'users', 
      icon: Users, 
      label: 'Usuarios', 
      roles: ['admin', 'super_admin'] 
    },
    { 
      id: 'orders', 
      icon: ShoppingCart, 
      label: 'Pedidos', 
      roles: ['admin', 'manager', 'super_admin'] 
    },
    { 
      id: 'reports', 
      icon: FileText, 
      label: 'Reportes', 
      roles: ['admin', 'manager', 'super_admin'] 
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Configuración', 
      roles: ['admin', 'super_admin'] 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(adminUser?.tipo_usuario)
  );

  const handleMenuClick = (itemId) => {
    onPageChange(itemId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-slate-900">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-orange-500 mr-2" />
            <h1 className="text-xl font-bold text-white">Panel Admin</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                currentPage === item.id
                  ? 'bg-orange-600 text-white border-r-4 border-orange-400'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
          
          {/* Separator */}
          <div className="border-t border-slate-700 my-4 mx-6"></div>
          
          {/* Back to Store */}
          <button
            onClick={onBackToStore}
            className="w-full flex items-center px-6 py-3 text-left text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Store className="w-5 h-5 mr-3" />
            Volver a la Tienda
          </button>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminUser?.nombre} {adminUser?.apellidos}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser?.email}</p>
              <p className="text-xs text-orange-400 font-medium capitalize">{adminUser?.tipo_usuario}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded hover:bg-slate-700 transition-colors ml-2 flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Panel de Administración
            </h2>
            <button
              onClick={onBackToStore}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              title="Volver a la tienda"
            >
              <Store className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;