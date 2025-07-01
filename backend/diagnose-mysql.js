// Script de diagnóstico simplificado para MySQL Workbench
require('dotenv').config();
const mysql = require('mysql2/promise');

async function diagnoseConnection() {
  console.log('🔍 ===================================');
  console.log('🔍 DIAGNÓSTICO SIMPLIFICADO');
  console.log('🔍 ===================================\n');

  // Mostrar configuración actual
  console.log('📋 Configuración actual:');
  console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || '3306'}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'ferreteria_user'}`);
  console.log(`   Contraseña: ${'*'.repeat((process.env.DB_PASSWORD || '1234').length)}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'ferreteria_db'}\n`);

  // Test 1: Conexión básica sin base de datos específica
  console.log('🧪 Test 1: Conexión básica a MySQL Server...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ferreteria_user',
      password: process.env.DB_PASSWORD || '1234'
    });

    console.log('✅ Conexión básica exitosa');
    
    // Verificar versión de MySQL
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 Versión MySQL: ${version[0].version}`);
    
    // Verificar hora actual
    const [time] = await connection.execute('SELECT NOW() as `current_time`');
    console.log(`🕒 Hora del servidor: ${time[0].current_time}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error en conexión básica:', error.message);
    return;
  }

  // Test 2: Verificar si la base de datos existe
  console.log('\n🧪 Test 2: Verificando base de datos...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ferreteria_user',
      password: process.env.DB_PASSWORD || '1234'
    });

    const [databases] = await connection.execute(
      "SHOW DATABASES LIKE 'ferreteria_db'"
    );

    if (databases.length > 0) {
      console.log('✅ Base de datos "ferreteria_db" existe');
    } else {
      console.log('❌ Base de datos "ferreteria_db" NO existe');
      await connection.end();
      return;
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error.message);
    return;
  }

  // Test 3: Conexión completa con base de datos
  console.log('\n🧪 Test 3: Conexión completa...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ferreteria_user',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'ferreteria_db'
    });

    console.log('✅ Conexión completa exitosa');
    
    // Verificar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📋 Lista de tablas:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('⚠️ No se encontraron tablas. ¿Importaste el schema.sql?');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error en conexión completa:', error.message);
    return;
  }

  // Test 4: Verificar datos
  console.log('\n🧪 Test 4: Verificando datos...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ferreteria_user',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'ferreteria_db'
    });

    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM productos');
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categorias');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');

      console.log(`📦 Productos: ${products[0].count}`);
      console.log(`📂 Categorías: ${categories[0].count}`);
      console.log(`👥 Usuarios: ${users[0].count}`);
    } catch (error) {
      console.log('⚠️ Las tablas aún no existen. Necesitas importar el schema.sql');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  }

  console.log('\n✅ ===================================');
  console.log('✅ DIAGNÓSTICO COMPLETADO');
  console.log('✅ ===================================');
  console.log('🚀 Si todo está bien, ya puedes usar: npm run dev');
  console.log('✅ ===================================\n');
}

// Ejecutar diagnóstico
diagnoseConnection().catch(error => {
  console.error('❌ Error en diagnóstico:', error);
  process.exit(1);
});