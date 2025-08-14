const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu React
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SERVIR ARCHIVOS ESTÁTICOS (IMÁGENES)
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Importar rutas
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload'); // ← NUEVA RUTA

// Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes); // ← NUEVA RUTA

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API de Ferretería funcionando correctamente!',
    timestamp: new Date().toISOString(),
    status: 'OK',
    features: {
      uploads: true,
      static_files: true
    }
  });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Ferretería Kiam',
    version: '3.0.0',
    status: 'Servidor funcionando',
    endpoints: {
      test: '/api/test',
      uploads: '/api/upload/product-image',
      static_files: '/uploads'
    }
  });
});

// Test de conexión a base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    const { testConnection, getDatabaseInfo } = require('./config/database');
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      const dbInfo = await getDatabaseInfo();
      res.json({
        success: true,
        message: 'Conexión a base de datos exitosa',
        database: dbInfo
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error conectando a la base de datos'
      });
    }
  } catch (error) {
    console.error('Error en db-test:', error);
    res.status(500).json({
      success: false,
      message: 'Error en prueba de base de datos',
      error: error.message
    });
  }
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/test',
      'GET /api/db-test',
      'POST /api/upload/product-image',
      'GET /uploads/products/:filename'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Frontend en http://localhost:3000`);
  console.log(`📁 Documentación de API en http://localhost:${PORT}/`);
  console.log(`🧪 Prueba la API en http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Prueba la DB en http://localhost:${PORT}/api/db-test`);
  console.log(`📸 Uploads habilitados en http://localhost:${PORT}/uploads`);
});