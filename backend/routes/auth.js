// ==========================================
// ARCHIVO: backend/routes/auth.js - VERSIÓN CORREGIDA
// Fix para el error "Cannot read properties of undefined (reading 'length')"
// ==========================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool } = require('../config/database');

// Middleware para verificar JWT
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ferreteria_secret_key');
    
    // Verificar que el usuario aún existe y está activo
    const [users] = await pool.execute(`
      SELECT id, nombre, apellidos, email, tipo_usuario, activo
      FROM usuarios 
      WHERE id = ? AND activo = 1
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no válido'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

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

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      telefono, 
      fecha_nacimiento,
      tipo_usuario = 'cliente'
    } = req.body;

    console.log('📝 Datos recibidos para registro:', { 
      nombre, apellidos, email, tipo_usuario, telefono, fecha_nacimiento 
    });

    // Validaciones básicas con mejor manejo de errores
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nombre es requerido y debe ser un texto válido'
      });
    }

    if (!apellidos || typeof apellidos !== 'string' || apellidos.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Apellidos son requeridos y deben ser un texto válido'
      });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido y debe ser un texto válido'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña es requerida y debe tener al menos 6 caracteres'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Verificar que el email no esté registrado
    const [existingUsers] = await pool.execute(`
      SELECT id FROM usuarios WHERE email = ?
    `, [email.toLowerCase().trim()]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Limpiar y preparar datos
    const cleanedData = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      telefono: telefono && telefono.trim() ? telefono.trim() : null,
      fecha_nacimiento: fecha_nacimiento && fecha_nacimiento.trim() ? fecha_nacimiento.trim() : null,
      tipo_usuario: tipo_usuario || 'cliente'
    };

    console.log('💾 Datos limpios para insertar:', cleanedData);

    // Crear usuario
    const [result] = await pool.execute(`
      INSERT INTO usuarios (
        nombre, apellidos, email, password_hash, telefono, fecha_nacimiento, tipo_usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      cleanedData.nombre,
      cleanedData.apellidos,
      cleanedData.email,
      cleanedData.password_hash,
      cleanedData.telefono,
      cleanedData.fecha_nacimiento,
      cleanedData.tipo_usuario
    ]);

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: result.insertId,
        email: cleanedData.email,
        tipo_usuario: cleanedData.tipo_usuario
      },
      process.env.JWT_SECRET || 'ferreteria_secret_key',
      { expiresIn: '7d' }
    );

    console.log('✅ Usuario creado exitosamente con ID:', result.insertId);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.insertId,
          nombre: cleanedData.nombre,
          apellidos: cleanedData.apellidos,
          email: cleanedData.email,
          tipo_usuario: cleanedData.tipo_usuario
        },
        token,
        message: 'Usuario registrado exitosamente'
      }
    });

  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const [users] = await pool.execute(`
      SELECT 
        id, nombre, apellidos, email, password_hash, tipo_usuario, activo,
        DATE(ultimo_acceso) as ultimo_acceso_fecha
      FROM usuarios 
      WHERE email = ?
    `, [email.toLowerCase()]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacta al administrador'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await pool.execute(`
      UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?
    `, [user.id]);

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        tipo_usuario: user.tipo_usuario
      },
      process.env.JWT_SECRET || 'ferreteria_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          ultimo_acceso: user.ultimo_acceso_fecha
        },
        token,
        message: 'Inicio de sesión exitoso'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE GESTIÓN DE USUARIOS (ADMIN)
// ==========================================

// GET /api/auth/users - Obtener todos los usuarios (solo admin)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, tipo_usuario, activo, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        u.id, u.nombre, u.apellidos, u.email, u.telefono,
        u.fecha_nacimiento, u.tipo_usuario, u.activo, 
        u.fecha_registro, u.ultimo_acceso,
        COUNT(DISTINCT p.id) as total_pedidos
      FROM usuarios u
      LEFT JOIN pedidos p ON u.id = p.usuario_id
      WHERE 1=1
    `;
    
    const queryParams = [];

    // Filtros
    if (tipo_usuario && tipo_usuario !== 'all') {
      query += ` AND u.tipo_usuario = ?`;
      queryParams.push(tipo_usuario);
    }

    if (activo !== undefined && activo !== 'all') {
      query += ` AND u.activo = ?`;
      queryParams.push(activo === 'true' ? 1 : 0);
    }

    if (search) {
      query += ` AND (u.nombre LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY u.id ORDER BY u.fecha_registro DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [users] = await pool.execute(query, queryParams);

    // Contar total
    let countQuery = `SELECT COUNT(*) as total FROM usuarios u WHERE 1=1`;
    const countParams = [];

    if (tipo_usuario && tipo_usuario !== 'all') {
      countQuery += ` AND u.tipo_usuario = ?`;
      countParams.push(tipo_usuario);
    }

    if (activo !== undefined && activo !== 'all') {
      countQuery += ` AND u.activo = ?`;
      countParams.push(activo === 'true' ? 1 : 0);
    }

    if (search) {
      countQuery += ` AND (u.nombre LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo usuarios',
      message: error.message
    });
  }
});

// PUT /api/auth/users/:id - Actualizar usuario (solo admin) - VERSIÓN CORREGIDA
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, apellidos, email, telefono, fecha_nacimiento, 
      tipo_usuario, activo 
    } = req.body;

    console.log('🔄 Actualizando usuario ID:', id);
    console.log('📝 Datos recibidos:', { nombre, apellidos, email, telefono, fecha_nacimiento, tipo_usuario, activo });

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    // Verificar que el usuario existe
    const [existingUser] = await pool.execute(`
      SELECT id, email, tipo_usuario FROM usuarios WHERE id = ?
    `, [parseInt(id)]);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const currentUser = existingUser[0];

    // Verificar permisos para cambiar roles
    if (tipo_usuario && tipo_usuario !== currentUser.tipo_usuario) {
      const userRole = req.user.tipo_usuario;
      
      // Solo super_admin puede crear otros super_admin
      if (tipo_usuario === 'super_admin' && userRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Solo super admin puede asignar rol de super admin'
        });
      }
      
      // Solo super_admin puede crear admin
      if (tipo_usuario === 'admin' && userRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Solo super admin puede asignar rol de administrador'
        });
      }
    }

    // Verificar email único (si se está cambiando) - CON VALIDACIÓN MEJORADA
    if (email && typeof email === 'string' && email.trim() !== currentUser.email) {
      const emailToCheck = email.toLowerCase().trim();
      const [emailCheck] = await pool.execute(`
        SELECT id FROM usuarios WHERE email = ? AND id != ?
      `, [emailToCheck, parseInt(id)]);

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Preparar datos para actualización - CON VALIDACIONES MEJORADAS
    const updateData = {};
    const updateFields = [];
    const updateValues = [];

    if (nombre && typeof nombre === 'string' && nombre.trim().length > 0) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre.trim());
    }

    if (apellidos && typeof apellidos === 'string' && apellidos.trim().length > 0) {
      updateFields.push('apellidos = ?');
      updateValues.push(apellidos.trim());
    }

    if (email && typeof email === 'string' && email.trim().length > 0) {
      updateFields.push('email = ?');
      updateValues.push(email.toLowerCase().trim());
    }

    // Telefono puede ser null o string
    if (telefono !== undefined) {
      updateFields.push('telefono = ?');
      updateValues.push(telefono && telefono.trim() ? telefono.trim() : null);
    }

    // Fecha de nacimiento puede ser null o string
    if (fecha_nacimiento !== undefined) {
      updateFields.push('fecha_nacimiento = ?');
      updateValues.push(fecha_nacimiento && fecha_nacimiento.trim() ? fecha_nacimiento.trim() : null);
    }

    if (tipo_usuario && typeof tipo_usuario === 'string') {
      updateFields.push('tipo_usuario = ?');
      updateValues.push(tipo_usuario);
    }

    if (activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(Boolean(activo));
    }

    // Verificar que hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos válidos para actualizar'
      });
    }

    // Construir y ejecutar query de actualización
    const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(parseInt(id));

    console.log('🔍 Query a ejecutar:', updateQuery);
    console.log('🔍 Valores:', updateValues);

    const [result] = await pool.execute(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se pudo actualizar el usuario'
      });
    }

    // Obtener usuario actualizado
    const [updatedUser] = await pool.execute(`
      SELECT id, nombre, apellidos, email, telefono, fecha_nacimiento,
             tipo_usuario, activo, fecha_registro, ultimo_acceso
      FROM usuarios WHERE id = ?
    `, [parseInt(id)]);

    console.log('✅ Usuario actualizado exitosamente:', updatedUser[0]);

    res.json({
      success: true,
      data: updatedUser[0],
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando usuario',
      message: error.message
    });
  }
});

// PUT /api/auth/users/:id/status - Cambiar estado de usuario
router.put('/users/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    // Validar entrada
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    if (activo === undefined || activo === null) {
      return res.status(400).json({
        success: false,
        error: 'Estado activo es requerido'
      });
    }

    // No permitir que un admin se desactive a sí mismo
    if (parseInt(id) === req.user.id && !activo) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    const [result] = await pool.execute(`
      UPDATE usuarios SET activo = ? WHERE id = ?
    `, [Boolean(activo), parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        activo: Boolean(activo),
        message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
      }
    });

  } catch (error) {
    console.error('Error actualizando status:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando status',
      message: error.message
    });
  }
});

// DELETE /api/auth/users/:id - Eliminar usuario (soft delete)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    // No permitir que un admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Verificar que el usuario existe
    const [userCheck] = await pool.execute(`
      SELECT id, nombre, apellidos, tipo_usuario FROM usuarios WHERE id = ?
    `, [parseInt(id)]);

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const targetUser = userCheck[0];

    // Verificar permisos para eliminar según rol
    const userRole = req.user.tipo_usuario;
    if (targetUser.tipo_usuario === 'super_admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo super admin puede eliminar otros super admins'
      });
    }

    if (targetUser.tipo_usuario === 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo super admin puede eliminar administradores'
      });
    }

    // Soft delete (marcar como inactivo)
    const [result] = await pool.execute(`
      UPDATE usuarios SET activo = 0 WHERE id = ?
    `, [parseInt(id)]);

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        nombre: `${targetUser.nombre} ${targetUser.apellidos}`,
        message: 'Usuario eliminado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando usuario',
      message: error.message
    });
  }
});

// POST /api/auth/users/:id/reset-password - Resetear contraseña (admin)
router.post('/users/:id/reset-password', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_password } = req.body;

    // Validaciones
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    if (!nueva_password || typeof nueva_password !== 'string' || nueva_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar que el usuario existe
    const [userCheck] = await pool.execute(`
      SELECT id, nombre FROM usuarios WHERE id = ?
    `, [parseInt(id)]);

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nueva_password, saltRounds);

    // Actualizar contraseña
    await pool.execute(`
      UPDATE usuarios SET password_hash = ? WHERE id = ?
    `, [hashedPassword, parseInt(id)]);

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        message: 'Contraseña actualizada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error reseteando contraseña',
      message: error.message
    });
  }
});

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(`
      SELECT 
        u.id, u.nombre, u.apellidos, u.email, u.telefono, 
        u.fecha_nacimiento, u.tipo_usuario, u.fecha_registro,
        COUNT(DISTINCT p.id) as total_pedidos,
        COUNT(DISTINCT d.id) as total_direcciones
      FROM usuarios u
      LEFT JOIN pedidos p ON u.id = p.usuario_id
      LEFT JOIN direcciones d ON u.id = d.usuario_id
      WHERE u.id = ? AND u.activo = 1
      GROUP BY u.id
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo perfil',
      message: error.message
    });
  }
});

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellidos, telefono, fecha_nacimiento } = req.body;

    const [result] = await pool.execute(`
      UPDATE usuarios 
      SET 
        nombre = COALESCE(?, nombre),
        apellidos = COALESCE(?, apellidos),
        telefono = COALESCE(?, telefono),
        fecha_nacimiento = COALESCE(?, fecha_nacimiento)
      WHERE id = ?
    `, [nombre, apellidos, telefono, fecha_nacimiento, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Perfil actualizado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando perfil',
      message: error.message
    });
  }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener contraseña actual
    const [users] = await pool.execute(`
      SELECT password_hash FROM usuarios WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await pool.execute(`
      UPDATE usuarios SET password_hash = ? WHERE id = ?
    `, [hashedNewPassword, userId]);

    res.json({
      success: true,
      data: {
        message: 'Contraseña actualizada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error cambiando contraseña',
      message: error.message
    });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Sesión cerrada exitosamente'
    }
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin = verifyAdmin;