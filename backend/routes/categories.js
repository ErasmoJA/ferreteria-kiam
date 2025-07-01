const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        c.imagen,
        COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre, c.descripcion, c.imagen
      ORDER BY c.nombre ASC
    `);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías',
      message: error.message
    });
  }
});

// GET /api/categories/:id - Obtener una categoría específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(`
      SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        c.imagen,
        COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1
      WHERE c.id = ? AND c.activo = 1
      GROUP BY c.id, c.nombre, c.descripcion, c.imagen
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });

  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categoría',
      message: error.message
    });
  }
});

// GET /api/categories/name/:name - Obtener categoría por nombre
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const [categories] = await pool.execute(`
      SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        c.imagen,
        COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1
      WHERE c.nombre = ? AND c.activo = 1
      GROUP BY c.id, c.nombre, c.descripcion, c.imagen
    `, [name]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });

  } catch (error) {
    console.error('Error obteniendo categoría por nombre:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categoría por nombre',
      message: error.message
    });
  }
});

// GET /api/categories/:id/products - Obtener productos de una categoría
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 12, page = 1, sortBy = 'nombre', order = 'ASC' } = req.query;

    // Verificar que la categoría existe
    const [categoryCheck] = await pool.execute(`
      SELECT id, nombre FROM categorias WHERE id = ? AND activo = 1
    `, [id]);

    if (categoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Validar campo de ordenamiento
    const allowedSortFields = ['nombre', 'precio', 'calificacion_promedio', 'fecha_creacion'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'nombre';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

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
        p.imagen_principal
      FROM productos p
      WHERE p.categoria_id = ? AND p.activo = 1
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

    // Contar total de productos
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE categoria_id = ? AND activo = 1
    `, [id]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        category: categoryCheck[0],
        products: products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: offset + products.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos de categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos de categoría',
      message: error.message
    });
  }
});

module.exports = router;