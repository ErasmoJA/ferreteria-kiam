const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/products - VERSIÓN FINAL SIN ERRORES DE PARÁMETROS
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sortBy = 'nombre', 
      order = 'ASC', 
      page = 1, 
      limit = 12,
      featured 
    } = req.query;

    console.log('🔍 Query params received:', req.query);

    // Construir consulta base simple
    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_oferta,
        p.stock,
        p.calificacion_promedio,
        p.total_resenas,
        p.destacado,
        p.marca,
        p.imagen_principal,
        c.nombre as categoria_nombre,
        c.id as categoria_id
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND c.activo = 1
    `;

    // ESTRATEGIA: Construir consulta con filtros pero sin parámetros problemáticos
    
    // Filtro por categoría (usando valores directos en lugar de parámetros)
    if (category && category !== 'all' && typeof category === 'string' && category.trim().length > 0) {
      // Escape manual para seguridad
      const safeCategoryName = category.replace(/[^a-zA-Z0-9_]/g, '');
      query += ` AND c.nombre = '${safeCategoryName}'`;
    }

    // Filtro por búsqueda (usando LIKE directo)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const safeSearchTerm = search.replace(/['"\\]/g, ''); // Remover caracteres peligrosos
      query += ` AND (p.nombre LIKE '%${safeSearchTerm}%' OR p.descripcion LIKE '%${safeSearchTerm}%' OR p.marca LIKE '%${safeSearchTerm}%')`;
    }

    // Filtros de precio (con validación)
    if (minPrice && !isNaN(parseFloat(minPrice)) && parseFloat(minPrice) > 0) {
      query += ` AND p.precio >= ${parseFloat(minPrice)}`;
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice)) && parseFloat(maxPrice) > 0) {
      query += ` AND p.precio <= ${parseFloat(maxPrice)}`;
    }

    // Filtro por destacado
    if (featured === 'true') {
      query += ` AND p.destacado = 1`;
    }

    // Ordenamiento (con validación estricta)
    const allowedSortFields = ['nombre', 'precio', 'calificacion_promedio'];
    const validSortField = allowedSortFields.includes(sortBy) ? sortBy : 'nombre';
    const validOrder = (order && order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
    
    query += ` ORDER BY p.${validSortField} ${validOrder}`;

    // Paginación (con validación)
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 12));
    const offset = (pageNum - 1) * limitNum;
    
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('📝 Final query:', query);

    // Ejecutar consulta SIN parámetros (todo embebido en la consulta)
    const [products] = await pool.execute(query);

    // Consulta de conteo simple
    let countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND c.activo = 1
    `;

    // Aplicar los mismos filtros para el conteo
    if (category && category !== 'all' && typeof category === 'string' && category.trim().length > 0) {
      const safeCategoryName = category.replace(/[^a-zA-Z0-9_]/g, '');
      countQuery += ` AND c.nombre = '${safeCategoryName}'`;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const safeSearchTerm = search.replace(/['"\\]/g, '');
      countQuery += ` AND (p.nombre LIKE '%${safeSearchTerm}%' OR p.descripcion LIKE '%${safeSearchTerm}%' OR p.marca LIKE '%${safeSearchTerm}%')`;
    }

    if (minPrice && !isNaN(parseFloat(minPrice)) && parseFloat(minPrice) > 0) {
      countQuery += ` AND p.precio >= ${parseFloat(minPrice)}`;
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice)) && parseFloat(maxPrice) > 0) {
      countQuery += ` AND p.precio <= ${parseFloat(maxPrice)}`;
    }

    if (featured === 'true') {
      countQuery += ` AND p.destacado = 1`;
    }

    const [countResult] = await pool.execute(countQuery);
    const total = countResult[0].total;

    console.log('✅ Query successful, products found:', products.length);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        hasNext: offset + products.length < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos',
      message: error.message,
      code: error.code
    });
  }
});

// GET /api/products/simple - Mantener para pruebas
router.get('/simple', async (req, res) => {
  try {
    console.log('🧪 Testing simple products endpoint...');
    
    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.stock,
        c.nombre as categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
      LIMIT 5
    `);
    
    console.log('✅ Simple query successful, products found:', products.length);
    
    res.json({
      success: true,
      data: products,
      message: 'Simple endpoint working'
    });
    
  } catch (error) {
    console.error('❌ Simple endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que id sea un número
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    const productId = parseInt(id);
    
    // Usar query directa sin parámetros para evitar el error
    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_oferta,
        p.stock,
        p.stock_minimo,
        p.calificacion_promedio,
        p.total_resenas,
        p.destacado,
        p.marca,
        p.modelo,
        p.peso,
        p.dimensiones,
        p.garantia_meses,
        p.imagen_principal,
        p.imagenes_adicionales,
        c.nombre as categoria_nombre,
        c.id as categoria_id
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ${productId} AND p.activo = 1
    `);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo producto',
      message: error.message
    });
  }
});

// GET /api/products/category/:categoryName - Productos por categoría
router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { limit = 12 } = req.query;

    // Validar parámetros
    if (!categoryName || typeof categoryName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Nombre de categoría inválido'
      });
    }

    const safeCategoryName = categoryName.replace(/[^a-zA-Z0-9_]/g, '');
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));

    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_oferta,
        p.stock,
        p.calificacion_promedio,
        p.total_resenas,
        p.destacado,
        p.marca,
        p.imagen_principal,
        c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE c.nombre = '${safeCategoryName}' AND p.activo = 1 AND c.activo = 1
      ORDER BY p.destacado DESC, p.calificacion_promedio DESC
      LIMIT ${limitNum}
    `);

    res.json({
      success: true,
      data: products,
      category: categoryName
    });

  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos por categoría',
      message: error.message
    });
  }
});

// GET /api/products/search/:term - Búsqueda de productos
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 20 } = req.query;

    // Validar parámetros
    if (!term || typeof term !== 'string' || term.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const safeSearchTerm = term.replace(/['"\\]/g, '').trim();

    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_oferta,
        p.stock,
        p.calificacion_promedio,
        p.total_resenas,
        p.marca,
        p.imagen_principal,
        c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE (
        p.nombre LIKE '%${safeSearchTerm}%'
        OR p.descripcion LIKE '%${safeSearchTerm}%'
        OR p.marca LIKE '%${safeSearchTerm}%'
      )
      AND p.activo = 1 AND c.activo = 1
      ORDER BY p.calificacion_promedio DESC
      LIMIT ${limitNum}
    `);

    res.json({
      success: true,
      data: products,
      searchTerm: term,
      resultsCount: products.length
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda',
      message: error.message
    });
  }
});

module.exports = router;