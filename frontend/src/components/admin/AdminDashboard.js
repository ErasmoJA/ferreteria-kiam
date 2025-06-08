import React, { useState, useEffect } from 'react';
import { 
  Package, Users, DollarSign, AlertTriangle, 
  TrendingUp, ShoppingCart, Star, Activity 
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color, onClick, loading }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-full p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {change && (
                <p className="text-sm text-gray-600 mt-1">{change}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductRow = ({ product, index }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center flex-1">
      <span className="text-sm font-medium text-gray-500 w-6 flex-shrink-0">
        {index + 1}.
      </span>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {product.nombre}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {product.marca} • {product.categoria}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2 flex-shrink-0">
      <div className="flex items-center">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-sm text-gray-600 ml-1">
          {product.calificacion_promedio}
        </span>
      </div>
      <span className="text-sm font-semibold text-green-600">
        ${product.precio}
      </span>
    </div>
  </div>
);

const LowStockRow = ({ product }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {product.nombre}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {product.categoria}
      </p>
    </div>
    <div className="text-right flex-shrink-0">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        product.stock === 0 
          ? 'bg-red-100 text-red-800' 
          : product.stock <= product.stock_minimo
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-orange-100 text-orange-800'
      }`}>
        {product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}
      </span>
      <p className="text-xs text-gray-500 mt-1">
        Mín: {product.stock_minimo}
      </p>
    </div>
  </div>
);

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    products: { total_productos: 0, productos_bajo_stock: 0, productos_destacados: 0 },
    users: { total_usuarios: 0, usuarios_hoy: 0, clientes: 0, administradores: 0 },
    categories: [],
    topProducts: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Error cargando datos');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={loadDashboardData}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema • Última actualización: {new Date().toLocaleTimeString()}
        </p>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Productos"
          value={loading ? "..." : stats.products.total_productos}
          change={loading ? "..." : `${stats.products.productos_destacados} destacados`}
          icon={Package}
          color="blue"
          onClick={() => onNavigate('products')}
          loading={loading}
        />
        <StatCard
          title="Usuarios Registrados"
          value={loading ? "..." : stats.users.total_usuarios}
          change={loading ? "..." : `+${stats.users.usuarios_hoy} hoy`}
          icon={Users}
          color="green"
          onClick={() => onNavigate('users')}
          loading={loading}
        />
        <StatCard
          title="Ventas del Mes"
          value="$45,230"
          change="+12% vs mes anterior"
          icon={DollarSign}
          color="purple"
          onClick={() => onNavigate('reports')}
          loading={false}
        />
        <StatCard
          title="Stock Bajo"
          value={loading ? "..." : stats.products.productos_bajo_stock}
          change="Requieren atención"
          icon={AlertTriangle}
          color="red"
          onClick={() => onNavigate('products')}
          loading={loading}
        />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-500" />
            Estadísticas de Usuarios
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clientes</span>
                <span className="text-sm font-medium">{stats.users.clientes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Administradores</span>
                <span className="text-sm font-medium">{stats.users.administradores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Registros hoy</span>
                <span className="text-sm font-medium text-green-600">+{stats.users.usuarios_hoy}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Productos por Categoría
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.categories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">{category.categoria}</span>
                  <span className="text-sm font-medium">{category.total_productos}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('products')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">Agregar Producto</div>
              <div className="text-xs text-gray-500">Crear nuevo producto</div>
            </button>
            <button
              onClick={() => onNavigate('users')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">Gestionar Usuarios</div>
              <div className="text-xs text-gray-500">Ver y editar usuarios</div>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">Ver Reportes</div>
              <div className="text-xs text-gray-500">Estadísticas detalladas</div>
            </button>
          </div>
        </div>
      </div>

      {/* Secciones de listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productos más populares */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🔥 Productos Más Populares
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3">
                  <div className="flex items-center flex-1">
                    <div className="w-6 h-4 bg-gray-200 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats.topProducts.length > 0 ? (
            <div className="space-y-1">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <ProductRow key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay datos de productos disponibles
            </p>
          )}
        </div>

        {/* Productos con stock bajo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              ⚠️ Stock Bajo
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Gestionar
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats.lowStockProducts.length > 0 ? (
            <div className="space-y-1">
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <LowStockRow key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm text-gray-500">
                Todos los productos tienen stock suficiente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;