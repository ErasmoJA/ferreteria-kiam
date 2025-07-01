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
    const [time] = await connection.execute('SELECT NOW() as current_time');
    console.log(`🕒 Hora del servidor: ${time[0].current_time}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error en conexión básica:', error.message);
    console.error('💡 Posibles soluciones:');
    console.error('   1. Verificar que MySQL Server esté ejecutándose');
    console.error('   2. Confirmar usuario y contraseña en MySQL Workbench');
    console.error('   3. Revisar puerto (por defecto 3306)');
    console.error('   4. Verificar que el usuario existe:');
    console.error('      SELECT user, host FROM mysql.user WHERE user = "ferreteria_user";');
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
      'SHOW DATABASES LIKE ?', ['ferreteria_db']
    );

    if (databases.length > 0) {
      console.log('✅ Base de datos "ferreteria_db" existe');
    } else {
      console.log('❌ Base de datos "ferreteria_db" NO existe');
      console.log('💡 Crea la base de datos con:');
      console.log('   CREATE DATABASE ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
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
    
    if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.error('💡 El usuario no tiene permisos en la base de datos.');
      console.error('   Ejecuta en MySQL Workbench:');
      console.error('   GRANT ALL PRIVILEGES ON ferreteria_db.* TO "ferreteria_user"@"%";');
      console.error('   FLUSH PRIVILEGES;');
    }
    return;
  }

  // Test 4: Verificar datos de ejemplo (solo si hay tablas)
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

      if (products[0].count === 0) {
        console.log('⚠️ No hay productos. ¿Importaste los datos de ejemplo?');
      }
    } catch (error) {
      console.log('⚠️ Las tablas aún no existen. Necesitas importar el schema.sql');
      console.log('💡 En MySQL Workbench:');
      console.log('   1. Server → Data Import');
      console.log('   2. Import from Self-Contained File');
      console.log('   3. Seleccionar tu archivo schema.sql');
      console.log('   4. Target Schema: ferreteria_db');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  }

  // Test 5: Verificar permisos del usuario
  console.log('\n🧪 Test 5: Verificando permisos...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ferreteria_user',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'ferreteria_db'
    });

    const [grants] = await connection.execute('SHOW GRANTS');
    console.log('✅ Permisos del usuario:');
    grants.forEach(grant => {
      console.log(`   - ${Object.values(grant)[0]}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Error verificando permisos:', error.message);
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