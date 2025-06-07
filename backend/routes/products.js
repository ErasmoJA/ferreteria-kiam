const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/products - Obtener todos los productos con filtros
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

    const queryParams = [];

    // Filtros
    if (category && category !== 'all') {
      query += ` AND c.nombre = ?`;
      queryParams.push(category);
    }

    if (search) {
      query += ` AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (minPrice) {
      query += ` AND p.precio >= ?`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ` AND p.precio <= ?`;
      queryParams.push(parseFloat(maxPrice));
    }

    if (featured === 'true') {
      query += ` AND p.destacado = 1`;
    }

    // Ordenamiento
    const allowedSortFields = ['nombre', 'precio', 'calificacion_promedio', 'fecha_creacion'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'nombre';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY p.${sortField} ${sortOrder}`;

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.execute(query, queryParams);

    // Contar total de productos para paginación
    let countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND c.activo = 1
    `;

    const countParams = [];
    if (category && category !== 'all') {
      countQuery += ` AND c.nombre = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (minPrice) {
      countQuery += ` AND p.precio >= ?`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countQuery += ` AND p.precio <= ?`;
      countParams.push(parseFloat(maxPrice));
    }

    const [countResult] = await pool.execute(countQuery, countParams);
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
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos',
      message: error.message
    });
  }
});

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
      WHERE p.id = ? AND p.activo = 1
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Obtener reseñas del producto
    const [reviews] = await pool.execute(`
      SELECT 
        r.id,
        r.calificacion,
        r.titulo,
        r.comentario,
        r.fecha_resena,
        u.nombre,
        u.apellidos
      FROM resenas r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.producto_id = ?
      ORDER BY r.fecha_resena DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: {
        ...products[0],
        resenas: reviews
      }
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
      WHERE c.nombre = ? AND p.activo = 1 AND c.activo = 1
      ORDER BY p.destacado DESC, p.calificacion_promedio DESC
      LIMIT ?
    `, [categoryName, parseInt(limit)]);

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
        c.nombre as categoria_nombre,
        MATCH(p.nombre, p.descripcion) AGAINST(? IN BOOLEAN MODE) as relevancia
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE (
        MATCH(p.nombre, p.descripcion) AGAINST(? IN BOOLEAN MODE)
        OR p.nombre LIKE ?
        OR p.descripcion LIKE ?
        OR p.marca LIKE ?
      )
      AND p.activo = 1 AND c.activo = 1
      ORDER BY relevancia DESC, p.calificacion_promedio DESC
      LIMIT ?
    `, [term, term, `%${term}%`, `%${term}%`, `%${term}%`, parseInt(limit)]);

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

// POST /api/products - Crear nuevo producto (solo admin)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria_id,
      stock = 0,
      marca,
      modelo,
      peso,
      dimensiones
    } = req.body;

    // Validaciones básicas
    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, precio y categoría son requeridos'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO productos (
        nombre, descripcion, precio, categoria_id, stock, marca, modelo, peso, dimensiones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nombre, descripcion, precio, categoria_id, stock, marca, modelo, peso, dimensiones]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
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

module.exports = router;