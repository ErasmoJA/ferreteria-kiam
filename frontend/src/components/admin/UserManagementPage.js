import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Plus, Search, Shield, Users, Crown, 
  UserCheck, UserX, Mail, Phone, Calendar, AlertTriangle, 
  CheckCircle, X, Lock, Key, RefreshCw
} from 'lucide-react';

// Modal para editar/crear usuarios
const UserModal = ({ user, isOpen, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    tipo_usuario: 'cliente',
    activo: true,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
        tipo_usuario: user.tipo_usuario || 'cliente',
        activo: user.activo !== undefined ? user.activo : true,
        password: ''
      });
    } else {
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        tipo_usuario: 'cliente',
        activo: true,
        password: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const newErrors = {};
      if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
      if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';
      if (!formData.email.trim()) newErrors.email = 'Email requerido';
      if (!user && !formData.password) newErrors.password = 'Contraseña requerida para nuevo usuario';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await onSave(formData);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const canChangeRole = (targetRole) => {
    if (targetRole === 'super_admin') return currentUser.tipo_usuario === 'super_admin';
    if (targetRole === 'admin') return ['super_admin'].includes(currentUser.tipo_usuario);
    if (targetRole === 'manager') return ['super_admin', 'admin'].includes(currentUser.tipo_usuario);
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Información Personal */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del usuario"
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.apellidos ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Apellidos del usuario"
                />
                {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="usuario@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(871) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seguridad */}
          {!user && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Seguridad</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contraseña del usuario (mínimo 6 caracteres)"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Permisos y Rol */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Permisos y Rol</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario
                </label>
                <select
                  value={formData.tipo_usuario}
                  onChange={(e) => setFormData({...formData, tipo_usuario: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cliente">👤 Cliente</option>
                  <option 
                    value="empleado" 
                    disabled={!canChangeRole('empleado')}
                  >
                    👷 Empleado
                  </option>
                  <option 
                    value="manager" 
                    disabled={!canChangeRole('manager')}
                  >
                    👔 Manager
                  </option>
                  <option 
                    value="admin" 
                    disabled={!canChangeRole('admin')}
                  >
                    🔧 Administrador
                  </option>
                  {currentUser.tipo_usuario === 'super_admin' && (
                    <option value="super_admin">
                      👑 Super Admin
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Cuenta
                </label>
                <select
                  value={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={true}>✅ Activo</option>
                  <option value={false}>❌ Inactivo</option>
                </select>
              </div>
            </div>

            {/* Descripción de permisos */}
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Permisos del rol seleccionado:</h4>
              <div className="text-sm text-gray-600">
                {formData.tipo_usuario === 'cliente' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Navegar productos y categorías</li>
                    <li>Realizar compras</li>
                    <li>Ver historial de pedidos</li>
                  </ul>
                )}
                {formData.tipo_usuario === 'empleado' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Permisos de cliente +</li>
                    <li>Ver inventario de productos</li>
                    <li>Asistir a clientes</li>
                  </ul>
                )}
                {formData.tipo_usuario === 'manager' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Permisos de empleado +</li>
                    <li>Gestionar productos</li>
                    <li>Ver reportes de ventas</li>
                    <li>Gestionar empleados</li>
                  </ul>
                )}
                {formData.tipo_usuario === 'admin' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Permisos de manager +</li>
                    <li>Acceso completo al panel admin</li>
                    <li>Gestionar usuarios (excepto admins)</li>
                    <li>Configurar sistema</li>
                  </ul>
                )}
                {formData.tipo_usuario === 'super_admin' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>🚨 <strong>Acceso total al sistema</strong></li>
                    <li>Crear/editar otros administradores</li>
                    <li>Acceso a configuraciones críticas</li>
                    <li>Gestión de backups y seguridad</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {user ? 'Actualizar Usuario' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para cambiar contraseña
const PasswordModal = ({ user, isOpen, onClose, onSave }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await onSave(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2 text-red-600" />
            Cambiar Contraseña
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Usuario:</strong> {user.nombre} {user.apellidos} ({user.email})
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Repetir contraseña"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cambiando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal de gestión de usuarios
const UserManagementPage = ({ currentUser, onUserUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('tipo_usuario', filterRole);
      if (filterStatus !== 'all') params.append('activo', filterStatus);

      const response = await fetch(`http://localhost:5000/api/auth/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando usuarios');
      
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error cargando usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

  const handleSaveUser = async (userData) => {
    try {
      console.log('🔍 Datos del usuario a guardar:', userData); // DEBUG
      
      const token = localStorage.getItem('authToken');
      
      let response;
      if (editingUser) {
        console.log('🔄 Actualizando usuario ID:', editingUser.id); // DEBUG
        response = await fetch(`http://localhost:5000/api/auth/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      } else {
        console.log('🆕 Creando nuevo usuario'); // DEBUG
        response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }
      
      console.log('📡 Response status:', response.status); // DEBUG
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error response:', errorData); // DEBUG
        throw new Error(errorData);
      }
      
      const result = await response.json();
      console.log('✅ Resultado del servidor:', result); // DEBUG
      
      if (result.success) {
        await loadUsers();
        setShowUserModal(false);
        setEditingUser(null);
        alert(editingUser ? '✅ Usuario actualizado exitosamente' : '✅ Usuario creado exitosamente');
        
        if (editingUser && editingUser.id === currentUser.id) {
          onUserUpdate && onUserUpdate(result.data);
        }
      } else {
        throw new Error(result.error || 'Error guardando usuario');
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser.id) {
      alert('❌ No puedes eliminar tu propia cuenta');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?`)) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error eliminando usuario');
        
        const result = await response.json();
        if (result.success) {
          loadUsers();
          alert('✅ Usuario eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('❌ Error eliminando usuario: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (userId === currentUser.id) {
      alert('❌ No puedes desactivar tu propia cuenta');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: !currentStatus })
      });
      
      if (!response.ok) throw new Error('Error cambiando estado');
      
      const result = await response.json();
      if (result.success) {
        loadUsers();
        alert(`✅ Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('❌ Error cambiando estado: ' + error.message);
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/auth/users/${passwordUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nueva_password: newPassword })
      });
      
      if (!response.ok) throw new Error('Error cambiando contraseña');
      
      const result = await response.json();
      if (result.success) {
        alert('✅ Contraseña cambiada exitosamente');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      'cliente': '👤',
      'empleado': '👷',
      'manager': '👔', 
      'admin': '🔧',
      'super_admin': '👑'
    };
    return icons[role?.toLowerCase()] || '👤';
  };

  const getRoleColor = (role) => {
    const colors = {
      'cliente': 'bg-gray-100 text-gray-800',
      'empleado': 'bg-blue-100 text-blue-800',
      'manager': 'bg-green-100 text-green-800',
      'admin': 'bg-purple-100 text-purple-800',
      'super_admin': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.tipo_usuario === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.activo) ||
                         (filterStatus === 'inactive' && !user.activo);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.activo).length,
    inactive: users.filter(u => !u.activo).length,
    clientes: users.filter(u => u.tipo_usuario === 'cliente').length,
    empleados: users.filter(u => u.tipo_usuario === 'empleado').length,
    managers: users.filter(u => u.tipo_usuario === 'manager').length,
    admins: users.filter(u => ['admin', 'super_admin'].includes(u.tipo_usuario)).length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Usuario
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Usuario
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre, email..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Rol
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="cliente">👤 Clientes</option>
                <option value="empleado">👷 Empleados</option>
                <option value="manager">👔 Managers</option>
                <option value="admin">🔧 Administradores</option>
                <option value="super_admin">👑 Super Admins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">✅ Activos</option>
                <option value="inactive">❌ Inactivos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando usuarios...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.nombre.charAt(0)}{user.apellidos.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.nombre} {user.apellidos}
                            {user.id === currentUser.id && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.telefono && (
                        <div className="text-sm text-gray-500">{user.telefono}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.tipo_usuario)}`}>
                        <span className="mr-1">{getRoleIcon(user.tipo_usuario)}</span>
                        {user.tipo_usuario}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.activo)}
                        disabled={user.id === currentUser.id}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          user.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${user.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {user.activo ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPasswordUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.nombre} ${user.apellidos}`)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando un nuevo usuario'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <UserModal
        user={editingUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        currentUser={currentUser}
      />

      <PasswordModal
        user={passwordUser}
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordUser(null);
        }}
        onSave={handleChangePassword}
      />
    </div>
  );
};

export default UserManagementPage;