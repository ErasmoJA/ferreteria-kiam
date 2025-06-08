import React, { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle, Package } from 'lucide-react';

const ProductForm = ({ product, isOpen, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_oferta: '',
    categoria_id: '',
    stock: '',
    stock_minimo: '5',
    marca: '',
    modelo: '',
    peso: '',
    dimensiones: '',
    garantia_meses: '0',
    destacado: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio?.toString() || '',
        precio_oferta: product.precio_oferta?.toString() || '',
        categoria_id: product.categoria_id?.toString() || '',
        stock: product.stock?.toString() || '',
        stock_minimo: product.stock_minimo?.toString() || '5',
        marca: product.marca || '',
        modelo: product.modelo || '',
        peso: product.peso?.toString() || '',
        dimensiones: product.dimensiones || '',
        garantia_meses: product.garantia_meses?.toString() || '0',
        destacado: Boolean(product.destacado)
      });
    } else {
      // Reset form for new product
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        precio_oferta: '',
        categoria_id: '',
        stock: '0',
        stock_minimo: '5',
        marca: '',
        modelo: '',
        peso: '',
        dimensiones: '',
        garantia_meses: '0',
        destacado: false
      });
    }
    setErrors({});
    setTouched({});
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nombre requerido
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Precio requerido y válido
    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número mayor a 0';
    }

    // Categoría requerida
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }

    // Validar precio oferta (opcional pero debe ser menor al precio normal)
    if (formData.precio_oferta) {
      const precio = parseFloat(formData.precio);
      const precioOferta = parseFloat(formData.precio_oferta);
      
      if (isNaN(precioOferta) || precioOferta <= 0) {
        newErrors.precio_oferta = 'El precio de oferta debe ser un número mayor a 0';
      } else if (precioOferta >= precio) {
        newErrors.precio_oferta = 'El precio de oferta debe ser menor al precio normal';
      }
    }

    // Validar stock
    if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'El stock debe ser un número mayor o igual a 0';
    }

    // Validar stock mínimo
    if (formData.stock_minimo && (isNaN(formData.stock_minimo) || parseInt(formData.stock_minimo) < 0)) {
      newErrors.stock_minimo = 'El stock mínimo debe ser un número mayor o igual a 0';
    }

    // Validar peso (opcional)
    if (formData.peso && (isNaN(formData.peso) || parseFloat(formData.peso) <= 0)) {
      newErrors.peso = 'El peso debe ser un número mayor a 0';
    }

    // Validar garantía
    if (formData.garantia_meses && (isNaN(formData.garantia_meses) || parseInt(formData.garantia_meses) < 0)) {
      newErrors.garantia_meses = 'La garantía debe ser un número mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert string numbers to actual numbers and clean up data
      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        precio_oferta: formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
        categoria_id: parseInt(formData.categoria_id),
        stock: parseInt(formData.stock || 0),
        stock_minimo: parseInt(formData.stock_minimo || 5),
        marca: formData.marca.trim() || null,
        modelo: formData.modelo.trim() || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        dimensiones: formData.dimensiones.trim() || null,
        garantia_meses: parseInt(formData.garantia_meses || 0),
        destacado: formData.destacado
      };

      await onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
      // El error se maneja en el componente padre
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : '';
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors";
    const errorClass = "border-red-500 focus:ring-red-500 focus:border-red-500";
    const normalClass = "border-gray-300";
    
    return `${baseClass} ${getFieldError(fieldName) ? errorClass : normalClass}`;
  };

  if (!isOpen) return null;

  // Filter out 'all' category
  const validCategories = categories?.filter(cat => cat.nombre !== 'all') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={getInputClassName('nombre')}
                  placeholder="Ej: Martillo de Carpintero 16oz"
                />
                {getFieldError('nombre') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('nombre')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  className={getInputClassName('categoria_id')}
                >
                  <option value="">Seleccionar categoría</option>
                  {validCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nombre.charAt(0).toUpperCase() + category.nombre.slice(1)}
                    </option>
                  ))}
                </select>
                {getFieldError('categoria_id') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('categoria_id')}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className={getInputClassName('descripcion')}
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>

          {/* Precios y stock */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios e Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`${getInputClassName('precio')} pl-8`}
                    placeholder="0.00"
                  />
                </div>
                {getFieldError('precio') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('precio')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Oferta
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="precio_oferta"
                    value={formData.precio_oferta}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`${getInputClassName('precio_oferta')} pl-8`}
                    placeholder="0.00"
                  />
                </div>
                {getFieldError('precio_oferta') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('precio_oferta')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={getInputClassName('stock')}
                  placeholder="0"
                />
                {getFieldError('stock') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('stock')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleInputChange}
                  min="0"
                  className={getInputClassName('stock_minimo')}
                  placeholder="5"
                />
                {getFieldError('stock_minimo') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('stock_minimo')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  className={getInputClassName('marca')}
                  placeholder="Ej: Stanley, DeWalt, Truper"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  className={getInputClassName('modelo')}
                  placeholder="Ej: ST16OZ, DW235G"
                />
              </div>
            </div>

            {/* Características físicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={getInputClassName('peso')}
                  placeholder="0.00"
                />
                {getFieldError('peso') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('peso')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensiones
                </label>
                <input
                  type="text"
                  name="dimensiones"
                  value={formData.dimensiones}
                  onChange={handleInputChange}
                  className={getInputClassName('dimensiones')}
                  placeholder="Ej: 30x15x8 cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garantía (meses)
                </label>
                <input
                  type="number"
                  name="garantia_meses"
                  value={formData.garantia_meses}
                  onChange={handleInputChange}
                  min="0"
                  className={getInputClassName('garantia_meses')}
                  placeholder="0"
                />
                {getFieldError('garantia_meses') && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getFieldError('garantia_meses')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Opciones especiales */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opciones Especiales</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Producto Destacado
                <span className="block text-xs text-gray-500">
                  Los productos destacados aparecen en la página principal
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
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
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {product ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;