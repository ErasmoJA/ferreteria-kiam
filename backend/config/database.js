const mysql = require('mysql2');
require('dotenv').config();

// Configuración para MySQL Workbench (solo opciones válidas)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'ferreteria_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'ferreteria_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  ssl: false,
  multipleStatements: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false
};

// Crear pool de conexiones con configuraciones válidas
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisificar el pool
const promisePool = pool.promise();

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('🔄 Conectando a MySQL Workbench...');
    console.log(`📍 Servidor: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
    console.log(`🗄️ Base de datos: ${dbConfig.database}`);
    
    const [rows] = await promisePool.execute(
      'SELECT 1 as test, NOW() as `current_time`, VERSION() as mysql_version'
    );
    
    console.log('✅ Conexión exitosa a MySQL Workbench');
    console.log(`🕒 Hora del servidor: ${rows[0].current_time}`);
    console.log(`🔢 Versión MySQL: ${rows[0].mysql_version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL Workbench:', error.message);
    console.error('🔍 Verifica que:');
    console.error('   - MySQL Server esté ejecutándose');
    console.error('   - Las credenciales sean correctas');
    console.error('   - La base de datos "ferreteria_db" exista');
    console.error('   - El usuario "ferreteria_user" tenga permisos');
    
    return false;
  }
}

// Función para obtener información de la BD
async function getDatabaseInfo() {
  try {
    const [dbInfo] = await promisePool.execute(`
      SELECT 
        SCHEMA_NAME as database_name,
        DEFAULT_CHARACTER_SET_NAME as charset,
        DEFAULT_COLLATION_NAME as collation
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = ?
    `, [dbConfig.database]);

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
    
    // Contar registros principales
    const [productCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM productos WHERE activo = 1'
    );
    
    const [categoryCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM categorias WHERE activo = 1'
    );

    const [userCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM usuarios WHERE activo = 1'
    );
    
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
    console.error('Error obteniendo info de BD:', error);
    return null;
  }
}

// Helper para ejecutar queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await promisePool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('❌ Error ejecutando query:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
}

// Helper para transacciones
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

// Manejo de eventos del pool
pool.on('connection', (connection) => {
  console.log('🔗 Nueva conexión establecida:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('❌ Error en el pool de conexiones:', err.message);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconectando automáticamente...');
  }
});

// Función para cerrar conexiones
async function closeConnections() {
  try {
    await pool.end();
    console.log('🔌 Conexiones cerradas correctamente');
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
  closeConnections,
  dbConfig
};