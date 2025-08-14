import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, AlertCircle, Package, Image as ImageIcon, Trash2 } from 'lucide-react';

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
    destacado: false,
    imagen_principal: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estados para manejo de imágenes
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const fileInputRef = useRef(null);

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
        destacado: Boolean(product.destacado),
        imagen_principal: product.imagen_principal || ''
      });
      
      // Si el producto tiene imagen, mostrar preview
      if (product.imagen_principal) {
        setImagePreview(`http://localhost:5000${product.imagen_principal}`);
      }
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
        destacado: false,
        imagen_principal: ''
      });
      setImagePreview(null);
    }
    setErrors({});
    setTouched({});
    setImageFile(null);
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableImages();
    }
  }, [isOpen]);

  const loadAvailableImages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/upload/product-images', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAvailableImages(result.data || []);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleImageFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido.');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    console.log('🔄 Iniciando subida de imagen...');
    setUploadingImage(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);

      console.log('📤 Enviando imagen al servidor...');
      const response = await fetch('http://localhost:5000/api/upload/product-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error('Error subiendo imagen');
      }

      const result = await response.json();
      console.log('✅ Resultado de subida:', result);
      
      if (result.success) {
        console.log('🎉 Imagen subida exitosamente, URL:', result.data.url);
        return result.data.url;
      } else {
        throw new Error(result.error || 'Error subiendo imagen');
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Error subiendo imagen: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const selectImageFromGallery = (imageUrl) => {
    console.log('📷 Seleccionando imagen de galería:', imageUrl);
    setFormData(prev => ({ ...prev, imagen_principal: imageUrl }));
    setImagePreview(`http://localhost:5000${imageUrl}`);
    setShowImageGallery(false);
    setImageFile(null);
  };

  const removeImage = () => {
    console.log('🗑️ Removiendo imagen...');
    setFormData(prev => ({ ...prev, imagen_principal: '' }));
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número mayor a 0';
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }

    if (formData.precio_oferta) {
      const precio = parseFloat(formData.precio);
      const precioOferta = parseFloat(formData.precio_oferta);
      
      if (isNaN(precioOferta) || precioOferta <= 0) {
        newErrors.precio_oferta = 'El precio de oferta debe ser un número mayor a 0';
      } else if (precioOferta >= precio) {
        newErrors.precio_oferta = 'El precio de oferta debe ser menor al precio normal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    if (!validateForm()) return;

    console.log('🚀 Iniciando proceso de guardado...');
    setLoading(true);
    
    try {
      let imageUrl = formData.imagen_principal;

      // Si hay una nueva imagen seleccionada, subirla primero
      if (imageFile) {
        console.log('📸 Nueva imagen detectada, subiendo...');
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('✅ Nueva URL de imagen:', imageUrl);
        } else {
          console.log('❌ No se pudo subir la imagen');
          setLoading(false);
          return; // No continuar si falló la subida
        }
      }

      // Preparar datos del producto
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
        destacado: formData.destacado,
        imagen_principal: imageUrl || null
      };

      console.log('💾 Datos a guardar:', productData);
      console.log('🖼️ URL de imagen final:', imageUrl);

      await onSave(productData);
      
    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert('Error guardando el producto: ' + error.message);
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

  const validCategories = categories?.filter(cat => cat.nombre !== 'all') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECCIÓN DE IMAGEN */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
              Imagen del Producto
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista Previa
                </label>
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Sin imagen seleccionada</p>
                    </div>
                  )}
                </div>
                
                {/* Debug info */}
                {formData.imagen_principal && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>URL guardada:</strong> {formData.imagen_principal}
                  </div>
                )}
              </div>

              {/* Controles de imagen */}
              <div className="space-y-4">
                {/* Subir nueva imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir Nueva Imagen
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {uploadingImage ? 'Subiendo...' : 'Seleccionar Archivo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPEG, PNG, WebP. Máximo 5MB.
                  </p>
                </div>

                {/* Galería de imágenes */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowImageGallery(!showImageGallery)}
                    className="w-full flex items-center justify-center px-4 py-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-purple-700"
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    {showImageGallery ? 'Ocultar Galería' : 'Ver Galería de Imágenes'}
                  </button>
                </div>

                {/* Estado de carga */}
                {uploadingImage && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-700">Subiendo imagen...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Galería de imágenes disponibles */}
            {showImageGallery && (
              <div className="mt-6 border-t border-purple-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Imágenes Disponibles</h4>
                {availableImages.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
                    {availableImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectImageFromGallery(image.url)}
                        className="aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-500 transition-colors"
                      >
                        <img
                          src={`http://localhost:5000${image.url}`}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay imágenes disponibles
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resto del formulario (información básica, precios, etc.) */}
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
              disabled={loading || uploadingImage}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading || uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadingImage ? 'Subiendo...' : 'Guardando...'}
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