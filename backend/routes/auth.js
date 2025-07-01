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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ferreteria_secret_key_super_secure_2024');
    
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

    // Validaciones básicas
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
      process.env.JWT_SECRET || 'ferreteria_secret_key_super_secure_2024',
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
      process.env.JWT_SECRET || 'ferreteria_secret_key_super_secure_2024',
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

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(`
      SELECT 
        u.id, u.nombre, u.apellidos, u.email, u.telefono, 
        u.fecha_nacimiento, u.tipo_usuario, u.fecha_registro,
        u.ultimo_acceso
      FROM usuarios u
      WHERE u.id = ? AND u.activo = 1
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