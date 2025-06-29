// Script para verificar la conexión a MySQL Server
// Ejecutar con: node test-mysql.js

require('dotenv').config();
const { testConnection, getDatabaseInfo, executeQuery } = require('./config/database');

async function runTests() {
  console.log('🧪 ===================================');
  console.log('🔍 VERIFICACIÓN DE MYSQL SERVER');
  console.log('🧪 ===================================\n');

  // Test 1: Conexión básica
  console.log('📡 Test 1: Conexión a MySQL Server...');
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('❌ Falló la conexión. Verifica:');
    console.error('   - MySQL Server está ejecutándose');
    console.error('   - Contraseña correcta en .env (1234)');
    console.error('   - Base de datos "ferreteria_db" existe');
    return;
  }

  // Test 2: Información de la base de datos
  console.log('\n📊 Test 2: Información de la base de datos...');
  try {
    const dbInfo = await getDatabaseInfo();
    
    if (dbInfo) {
      console.log('✅ Información obtenida exitosamente:');
      console.log(`   📁 Base de datos: ${dbInfo.database?.database_name || 'ferreteria_db'}`);
      console.log(`   📊 Productos: ${dbInfo.estadisticas?.productos || 0}`);
      console.log(`   📂 Categorías: ${dbInfo.estadisticas?.categorias || 0}`);
      console.log(`   👥 Usuarios: ${dbInfo.estadisticas?.usuarios || 0}`);
      console.log(`   📋 Total de tablas: ${dbInfo.tablas?.length || 0}`);
      
      if (dbInfo.tablas && dbInfo.tablas.length > 0) {
        console.log('   📋 Tablas encontradas:');
        dbInfo.tablas.forEach(tabla => {
          console.log(`      - ${tabla.nombre} (${tabla.filas} filas, ${tabla.tamaño})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo información de BD:', error.message);
  }

  // Test 3: Query de prueba
  console.log('\n🔍 Test 3: Ejecutando query de prueba...');
  try {
    const result = await executeQuery('SELECT COUNT(*) as total FROM productos WHERE activo = 1');
    
    if (result.success) {
      console.log(`✅ Query ejecutada exitosamente: ${result.data[0].total} productos activos`);
    } else {
      console.error('❌ Error en query:', result.error);
    }
  } catch (error) {
    console.error('❌ Error ejecutando query:', error.message);
  }

  // Test 4: Verificar tablas principales
  console.log('\n📋 Test 4: Verificando estructura de tablas...');
  const tablesToCheck = ['productos', 'categorias', 'usuarios'];
  
  for (const table of tablesToCheck) {
    try {
      const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
      if (result.success) {
        console.log(`✅ Tabla '${table}': ${result.data[0].count} registros`);
      } else {
        console.error(`❌ Error en tabla '${table}':`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error verificando tabla '${table}':`, error.message);
    }
  }

  // Test 5: Verificar usuario admin
  console.log('\n👤 Test 5: Verificando usuario administrador...');
  try {
    const result = await executeQuery(
      'SELECT nombre, email, tipo_usuario FROM usuarios WHERE tipo_usuario IN ("admin", "super_admin") LIMIT 1'
    );
    
    if (result.success && result.data.length > 0) {
      const admin = result.data[0];
      console.log(`✅ Usuario admin encontrado: ${admin.nombre} (${admin.email}) - Rol: ${admin.tipo_usuario}`);
    } else {
      console.warn('⚠️ No se encontró usuario administrador');
    }
  } catch (error) {
    console.error('❌ Error verificando admin:', error.message);
  }

  console.log('\n✅ ===================================');
  console.log('✅ VERIFICACIÓN COMPLETADA');
  console.log('✅ ===================================');
  console.log('🚀 Ya puedes ejecutar: npm start');
  
  process.exit(0);
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error ejecutando tests:', error);
  process.exit(1);
});