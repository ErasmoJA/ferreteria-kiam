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

// POST /api/categories - Crear nueva categoría (solo admin)
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido'
      });
    }

    // Verificar que no existe una categoría con el mismo nombre
    const [existing] = await pool.execute(`
      SELECT id FROM categorias WHERE nombre = ?
    `, [nombre]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO categorias (nombre, descripcion, imagen)
      VALUES (?, ?, ?)
    `, [nombre, descripcion, imagen]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nombre,
        descripcion,
        imagen,
        message: 'Categoría creada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando categoría',
      message: error.message
    });
  }
});

// PUT /api/categories/:id - Actualizar categoría (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen, activo } = req.body;

    // Verificar que la categoría existe
    const [existing] = await pool.execute(`
      SELECT id FROM categorias WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    // Verificar nombre único (excluyendo la categoría actual)
    if (nombre) {
      const [nameCheck] = await pool.execute(`
        SELECT id FROM categorias WHERE nombre = ? AND id != ?
      `, [nombre, id]);

      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    const [result] = await pool.execute(`
      UPDATE categorias 
      SET 
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        imagen = COALESCE(?, imagen),
        activo = COALESCE(?, activo)
      WHERE id = ?
    `, [nombre, descripcion, imagen, activo, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se pudo actualizar la categoría'
      });
    }

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        message: 'Categoría actualizada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando categoría',
      message: error.message
    });
  }
});

// DELETE /api/categories/:id - Eliminar categoría (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no hay productos en esta categoría
    const [productsCheck] = await pool.execute(`
      SELECT COUNT(*) as count FROM productos WHERE categoria_id = ? AND activo = 1
    `, [id]);

    if (productsCheck[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una categoría que tiene productos activos'
      });
    }

    const [result] = await pool.execute(`
      UPDATE categorias SET activo = 0 WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        message: 'Categoría eliminada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando categoría',
      message: error.message
    });
  }
});

module.exports = router;