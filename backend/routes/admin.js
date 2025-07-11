const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

// Middleware para verificar permisos de administrador
const verifyAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'manager', 'super_admin'].includes(req.user.tipo_usuario)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware para verificar token + admin
router.use(verifyToken);
router.use(verifyAdmin);

// =============================================
// DASHBOARD - ESTADÍSTICAS GENERALES
// =============================================

// GET /api/admin/dashboard/stats - Estadísticas del dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Obtener estadísticas principales
    const [productStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_productos,
        COUNT(CASE WHEN destacado = 1 THEN 1 END) as productos_destacados,
        COUNT(CASE WHEN stock <= stock_minimo THEN 1 END) as productos_bajo_stock
      FROM productos 
      WHERE activo = 1
    `);

    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes,
        COUNT(CASE WHEN tipo_usuario IN ('admin', 'super_admin') THEN 1 END) as administradores,
        COUNT(CASE WHEN DATE(fecha_registro) = CURDATE() THEN 1 END) as usuarios_hoy
      FROM usuarios 
      WHERE activo = 1
    `);

    const [categoryStats] = await pool.execute(`
      SELECT 
        c.nombre as categoria,
        COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre
      ORDER BY total_productos DESC
    `);

    // Productos más populares (por calificación y reseñas)
    const [topProducts] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.marca,
        p.precio,
        p.stock,
        p.calificacion_promedio,
        p.total_resenas,
        c.nombre as categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
      ORDER BY (p.calificacion_promedio * p.total_resenas) DESC
      LIMIT 10
    `);

    // Productos con stock bajo
    const [lowStockProducts] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.stock,
        p.stock_minimo,
        c.nombre as categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.stock <= p.stock_minimo
      ORDER BY p.stock ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        products: productStats[0],
        users: userStats[0],
        categories: categoryStats,
        topProducts: topProducts,
        lowStockProducts: lowStockProducts,
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas del dashboard',
      message: error.message
    });
  }
});

// =============================================
// GESTIÓN DE PRODUCTOS
// =============================================

// GET /api/admin/products - Listar productos para administración
router.get('/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      status = 'all',
      sortBy = 'fecha_creacion',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Filtros
    if (search) {
      whereClause += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== 'all') {
      whereClause += ' AND c.nombre = ?';
      queryParams.push(category);
    }

    if (status === 'active') {
      whereClause += ' AND p.activo = 1';
    } else if (status === 'inactive') {
      whereClause += ' AND p.activo = 0';
    }

    // Query principal
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_oferta,
        p.stock,
        p.stock_minimo,
        p.marca,
        p.modelo,
        p.calificacion_promedio,
        p.total_resenas,
        p.destacado,
        p.activo,
        p.fecha_creacion,
        c.nombre as categoria_nombre,
        c.id as categoria_id
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.execute(query, queryParams);

    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ${whereClause}
    `;

    const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: offset + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos para admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos',
      message: error.message
    });
  }
});

// POST /api/admin/products - Crear nuevo producto
router.post('/products', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      precio_oferta,
      categoria_id,
      stock = 0,
      stock_minimo = 5,
      marca,
      modelo,
      peso,
      dimensiones,
      garantia_meses = 0,
      destacado = false
    } = req.body;

    // Validaciones
    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, precio y categoría son requeridos'
      });
    }

    if (precio <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser mayor a 0'
      });
    }

    // Verificar que la categoría existe
    const [categoryCheck] = await pool.execute(`
      SELECT id FROM categorias WHERE id = ? AND activo = 1
    `, [categoria_id]);

    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La categoría especificada no existe'
      });
    }

    // Crear producto
    const [result] = await pool.execute(`
      INSERT INTO productos (
        nombre, descripcion, precio, precio_oferta, categoria_id, 
        stock, stock_minimo, marca, modelo, peso, dimensiones, 
        garantia_meses, destacado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre, descripcion, precio, precio_oferta, categoria_id,
      stock, stock_minimo, marca, modelo, peso, dimensiones,
      garantia_meses, destacado
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nombre,
        precio,
        message: 'Producto creado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando producto',
      message: error.message
    });
  }
});

// PUT /api/admin/products/:id - Actualizar producto
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    console.log('📝 Actualizando producto ID:', id);
    console.log('📦 Datos recibidos:', productData);

    // Verificar que el producto existe
    const [productCheck] = await pool.execute(`
      SELECT id FROM productos WHERE id = ?
    `, [id]);

    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Mapeo de campos y sus tipos
    const fieldMapping = {
      nombre: { type: 'string' },
      descripcion: { type: 'string' },
      precio: { type: 'decimal' },
      precio_oferta: { type: 'decimal', nullable: true },
      categoria_id: { type: 'int' },
      stock: { type: 'int' },
      stock_minimo: { type: 'int' },
      marca: { type: 'string', nullable: true },
      modelo: { type: 'string', nullable: true },
      peso: { type: 'decimal', nullable: true },
      dimensiones: { type: 'string', nullable: true },
      garantia_meses: { type: 'int' },
      destacado: { type: 'boolean' },
      activo: { type: 'boolean' }
    };

    // Construir la actualización dinámicamente
    const updates = [];
    const values = [];

    for (const [field, config] of Object.entries(fieldMapping)) {
      if (field in productData) {
        let value = productData[field];

        // Convertir según el tipo
        if (value === null || value === '') {
          if (config.nullable) {
            updates.push(`${field} = ?`);
            values.push(null);
          } else if (value !== null) {
            updates.push(`${field} = ?`);
            values.push(convertValue(value, config.type));
          }
        } else if (value !== undefined) {
          updates.push(`${field} = ?`);
          values.push(convertValue(value, config.type));
        }
      }
    }

    // Función helper para convertir valores
    function convertValue(value, type) {
      switch (type) {
        case 'int':
          return parseInt(value) || 0;
        case 'decimal':
          return parseFloat(value) || 0;
        case 'boolean':
          return value === true || value === 1 || value === '1' ? 1 : 0;
        case 'string':
        default:
          return String(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar ID al final
    values.push(id);

    const query = `UPDATE productos SET ${updates.join(', ')} WHERE id = ?`;
    
    console.log('🔍 Query:', query);
    console.log('🔍 Values:', values);

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se pudo actualizar el producto'
      });
    }

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        message: 'Producto actualizado exitosamente'
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando producto',
      message: error.message
    });
  }
});

// DELETE /api/admin/products/:id - Eliminar producto (soft delete)
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe
    const [productCheck] = await pool.execute(`
      SELECT id, nombre FROM productos WHERE id = ?
    `, [id]);

    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Soft delete (marcar como inactivo)
    const [result] = await pool.execute(`
      UPDATE productos SET activo = 0 WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        nombre: productCheck[0].nombre,
        message: 'Producto eliminado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando producto',
      message: error.message
    });
  }
});

module.exports = router;