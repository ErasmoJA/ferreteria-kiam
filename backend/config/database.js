const mysql = require('mysql2');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // XAMPP por defecto no tiene contraseña
  database: process.env.DB_NAME || 'ferreteria_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisificar el pool para usar async/await
const promisePool = pool.promise();

// Función para probar la conexión
async function testConnection() {
  try {
    const [rows] = await promisePool.execute('SELECT 1 as test');
    console.log('✅ Conexión a MySQL exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// Función para obtener información de la base de datos
async function getDatabaseInfo() {
  try {
    const [tables] = await promisePool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    const [productCount] = await promisePool.execute(`
      SELECT COUNT(*) as count FROM productos WHERE activo = 1
    `);
    
    const [categoryCount] = await promisePool.execute(`
      SELECT COUNT(*) as count FROM categorias WHERE activo = 1
    `);
    
    return {
      tablas: tables.map(t => t.TABLE_NAME),
      productos: productCount[0].count,
      categorias: categoryCount[0].count
    };
  } catch (error) {
    console.error('Error obteniendo info de DB:', error);
    return null;
  }
}

// Función helper para ejecutar queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await promisePool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error ejecutando query:', error);
    return { success: false, error: error.message };
  }
}

// Función helper para transacciones
async function executeTransaction(queries) {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('Error en transacción:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

module.exports = {
  pool: promisePool,
  testConnection,
  getDatabaseInfo,
  executeQuery,
  executeTransaction,
  dbConfig
};