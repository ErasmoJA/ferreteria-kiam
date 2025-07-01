const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${timestamp} | ${req.method} ${req.path}`);
  next();
});

// Importar configuración de base de datos
const { testConnection, getDatabaseInfo } = require('./config/database');

// Importar rutas
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Ferretería Kiam - MySQL Workbench',
    version: '3.0.0',
    status: 'Funcionando',
    database: 'MySQL Workbench',
    timestamp: new Date().toISOString()
  });
});

// Test básico de API
app.get('/api/test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    res.json({ 
      message: 'API funcionando correctamente',
      database_connection: isConnected ? 'Conectada' : 'Error',
      mysql_workbench: true,
      timestamp: new Date().toISOString(),
      status: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error en la API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test detallado de base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('🧪 Ejecutando test completo de MySQL Workbench...');
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      const dbInfo = await getDatabaseInfo();
      
      res.json({
        success: true,
        message: 'Conexión a MySQL Workbench exitosa',
        connection_type: 'MySQL Workbench',
        database_info: dbInfo,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error conectando a MySQL Workbench',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Error en db-test:', error);
    res.status(500).json({
      success: false,
      message: 'Error en prueba de base de datos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    available_endpoints: [
      'GET /',
      'GET /api/test',
      'GET /api/db-test'
    ],
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error('💥 Error del servidor:', err.stack);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
    timestamp: new Date().toISOString()
  });
});

// Función para inicializar la aplicación
async function initializeServer() {
  try {
    console.log('🔄 Inicializando servidor...');
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ MySQL Workbench conectado exitosamente');
      
      try {
        const dbInfo = await getDatabaseInfo();
        console.log('📊 Información de la base de datos:');
        console.log(`   📁 BD: ${dbInfo.database?.database_name || 'ferreteria_db'}`);
        console.log(`   📊 Productos: ${dbInfo.estadisticas?.productos || 0}`);
        console.log(`   📂 Categorías: ${dbInfo.estadisticas?.categorias || 0}`);
        console.log(`   👥 Usuarios: ${dbInfo.estadisticas?.usuarios || 0}`);
      } catch (error) {
        console.warn('⚠️ No se pudo obtener información detallada de la BD');
      }
    } else {
      console.error('❌ No se pudo conectar a MySQL Workbench');
    }
    
    app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log('🏪 FERRETERÍA KIAM - SERVIDOR INICIADO');
      console.log('🚀 ===================================');
      console.log(`📡 Backend: http://localhost:${PORT}`);
      console.log(`🗄️ MySQL Workbench: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log('🚀 ===================================');
      console.log('🧪 URLs de prueba:');
      console.log(`   📡 API Test: http://localhost:${PORT}/api/test`);
      console.log(`   🗄️ DB Test: http://localhost:${PORT}/api/db-test`);
      console.log('🚀 ===================================\n');
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
}

// Iniciar aplicación
initializeServer();