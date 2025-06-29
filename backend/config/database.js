const mysql = require('mysql2');

// Configuración de la base de datos para MySQL Server
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'ferreteria_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: process.env.DB_TIMEZONE || '+00:00',
  
  // Configuraciones válidas para MySQL2
  ssl: false,
  multipleStatements: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false
};

// Crear pool de conexiones optimizado para MySQL Server
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

// Promisificar el pool para usar async/await
const promisePool = pool.promise();

// Función para probar la conexión con MySQL Server
async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a MySQL Server...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
    console.log(`🗄️ Base de datos: ${dbConfig.database}`);
    
    const [rows] = await promisePool.execute('SELECT 1 as test, NOW() as current_time, VERSION() as mysql_version');
    
    console.log('✅ Conexión a MySQL Server exitosa');
    console.log(`🕒 Hora del servidor: ${rows[0].current_time}`);
    console.log(`🔢 Versión MySQL: ${rows[0].mysql_version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL Server:', error.message);
    console.error('🔍 Verifica que:');
    console.error('   - MySQL Server esté ejecutándose');
    console.error('   - Las credenciales sean correctas');
    console.error('   - La base de datos "ferreteria_db" exista');
    console.error('   - El puerto 3306 esté disponible');
    
    return false;
  }
}

// Función para obtener información detallada de la base de datos
async function getDatabaseInfo() {
  try {
    // Información básica de la base de datos
    const [dbInfo] = await promisePool.execute(`
      SELECT 
        SCHEMA_NAME as database_name,
        DEFAULT_CHARACTER_SET_NAME as charset,
        DEFAULT_COLLATION_NAME as collation
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = ?
    `, [dbConfig.database]);

    // Obtener tablas
    const [tables] = await promisePool.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        CREATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    // Contar productos y categorías
    const [productCount] = await promisePool.execute(`
      SELECT COUNT(*) as count FROM productos WHERE activo = 1
    `);
    
    const [categoryCount] = await promisePool.execute(`
      SELECT COUNT(*) as count FROM categorias WHERE activo = 1
    `);

    // Contar usuarios
    const [userCount] = await promisePool.execute(`
      SELECT COUNT(*) as count FROM usuarios WHERE activo = 1
    `);
    
    return {
      database: dbInfo[0] || {},
      tablas: tables.map(t => ({
        nombre: t.TABLE_NAME,
        filas: t.TABLE_ROWS,
        tamaño: `${Math.round((t.DATA_LENGTH + t.INDEX_LENGTH) / 1024)} KB`,
        creada: t.CREATE_TIME
      })),
      estadisticas: {
        productos: productCount[0].count,
        categorias: categoryCount[0].count,
        usuarios: userCount[0].count
      }
    };
  } catch (error) {
    console.error('Error obteniendo info de DB:', error);
    return null;
  }
}

// Función helper para ejecutar queries con manejo de errores mejorado
async function executeQuery(query, params = []) {
  try {
    const [rows] = await promisePool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('❌ Error ejecutando query:', error.message);
    console.error('📝 Query:', query);
    console.error('🔢 Params:', params);
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    };
  }
}

// Función helper para transacciones con rollback automático
async function executeTransaction(queries) {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    console.log('🔄 Iniciando transacción...');
    
    const results = [];
    for (let i = 0; i < queries.length; i++) {
      const { query, params } = queries[i];
      console.log(`📝 Ejecutando query ${i + 1}/${queries.length}`);
      
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    console.log('✅ Transacción completada exitosamente');
    
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en transacción, rollback ejecutado:', error.message);
    
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  } finally {
    connection.release();
  }
}

// Función para monitorear el estado de la conexión
async function getConnectionStatus() {
  try {
    const [status] = await promisePool.execute(`
      SHOW STATUS WHERE Variable_name IN (
        'Connections', 'Threads_connected', 'Threads_running', 'Uptime'
      )
    `);
    
    const connectionInfo = {};
    status.forEach(row => {
      connectionInfo[row.Variable_name] = row.Value;
    });
    
    return connectionInfo;
  } catch (error) {
    console.error('Error obteniendo estado de conexión:', error);
    return null;
  }
}

// Manejo de eventos de conexión
pool.on('connection', (connection) => {
  console.log('🔗 Nueva conexión establecida:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('❌ Error en el pool de conexiones:', err.message);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconectando automáticamente...');
  }
});

// Función para cerrar todas las conexiones al finalizar la aplicación
async function closeConnections() {
  try {
    await pool.end();
    console.log('🔌 Conexiones a MySQL Server cerradas correctamente');
  } catch (error) {
    console.error('❌ Error cerrando conexiones:', error.message);
  }
}

// Manejo de señales para cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando aplicación...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminando aplicación...');
  await closeConnections();
  process.exit(0);
});

module.exports = {
  pool: promisePool,
  testConnection,
  getDatabaseInfo,
  executeQuery,
  executeTransaction,
  getConnectionStatus,
  closeConnections,
  dbConfig
};