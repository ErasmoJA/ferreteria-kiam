const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging con timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📡 ${timestamp} | ${method} ${url} | IP: ${ip}`);
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

// Ruta de prueba básica
app.get('/api/test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    res.json({ 
      message: 'API de Ferretería Kiam funcionando correctamente!',
      timestamp: new Date().toISOString(),
      status: 'OK',
      database_connection: isConnected ? 'Conectada' : 'Error de conexión',
      environment: process.env.NODE_ENV || 'development',
      mysql_server: 'MySQL Server (no XAMPP)',
      version: '3.0.0'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error en la API',
      timestamp: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    });
  }
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Ferretería Kiam',
    version: '3.0.0',
    status: 'Servidor funcionando con MySQL Server',
    database: 'MySQL Server (migrado desde XAMPP)',
    endpoints: {
      test: '/api/test',
      database_test: '/api/db-test',
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      admin: '/api/admin'
    },
    documentation: 'Ver README.md para más información'
  });
});

// Test de conexión a base de datos con información detallada
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('🧪 Ejecutando test de base de datos...');
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      const dbInfo = await getDatabaseInfo();
      
      res.json({
        success: true,
        message: 'Conexión a MySQL Server exitosa',
        timestamp: new Date().toISOString(),
        connection_type: 'MySQL Server (no XAMPP)',
        database_info: dbInfo,
        server_info: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error conectando a MySQL Server',
        timestamp: new Date().toISOString(),
        troubleshooting: [
          'Verifica que MySQL Server esté ejecutándose',
          'Confirma las credenciales en el archivo .env',
          'Asegúrate de que la base de datos "ferreteria_db" existe',
          'Revisa que el puerto 3306 esté disponible'
        ]
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

// Nueva ruta para verificar el estado de la base de datos
app.get('/api/db-status', async (req, res) => {
  try {
    const { getConnectionStatus } = require('./config/database');
    const status = await getConnectionStatus();
    
    res.json({
      success: true,
      message: 'Estado de MySQL Server',
      timestamp: new Date().toISOString(),
      connection_status: status || 'No disponible'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado de la base de datos',
      error: error.message
    });
  }
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('💥 Error en el servidor:', err.stack);
  
  res.status(err.status || 500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    available_endpoints: [
      'GET /',
      'GET /api/test',
      'GET /api/db-test',
      'GET /api/db-status',
      'GET /api/products',
      'GET /api/categories',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Función para inicializar la conexión a la base de datos
async function initializeDatabase() {
  console.log('🔄 Inicializando conexión a MySQL Server...');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Base de datos inicializada correctamente');
    
    // Mostrar información de la base de datos al iniciar
    try {
      const dbInfo = await getDatabaseInfo();
      console.log('📊 Información de la base de datos:');
      console.log(`   📁 Base de datos: ${dbInfo.database?.database_name || 'ferreteria_db'}`);
      console.log(`   📊 Productos: ${dbInfo.estadisticas?.productos || 0}`);
      console.log(`   📂 Categorías: ${dbInfo.estadisticas?.categorias || 0}`);
      console.log(`   👥 Usuarios: ${dbInfo.estadisticas?.usuarios || 0}`);
      console.log(`   📋 Tablas: ${dbInfo.tablas?.length || 0}`);
    } catch (error) {
      console.warn('⚠️ No se pudo obtener información detallada de la BD');
    }
  } else {
    console.error('❌ No se pudo conectar a MySQL Server');
    console.error('🔧 Verifica la configuración en el archivo .env');
  }
  
  return isConnected;
}

// Iniciar servidor
async function startServer() {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log('🏪 FERRETERÍA KIAM - SERVIDOR INICIADO');
      console.log('🚀 ===================================');
      console.log(`📡 Servidor Backend: http://localhost:${PORT}`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🗄️ Base de datos: MySQL Server (Puerto 3306)`);
      console.log(`📋 Documentación API: http://localhost:${PORT}/`);
      console.log('🚀 ===================================');
      console.log('🧪 URLs de prueba:');
      console.log(`   📡 Test API: http://localhost:${PORT}/api/test`);
      console.log(`   🗄️ Test DB: http://localhost:${PORT}/api/db-test`);
      console.log(`   📊 DB Status: http://localhost:${PORT}/api/db-status`);
      console.log('🚀 ===================================\n');
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error.message);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer();