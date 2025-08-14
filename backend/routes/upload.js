// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('./auth');

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

// ==========================================
// RUTAS DE SUBIDA DE IMÁGENES
// ==========================================

// POST /api/upload/product-image - Subir imagen de producto
router.post('/product-image', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha subido ningún archivo'
      });
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    console.log('✅ Imagen subida exitosamente:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size
      },
      message: 'Imagen subida exitosamente'
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/upload/product-image/:filename - Eliminar imagen
router.delete('/product-image/:filename', verifyToken, verifyAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado'
      });
    }

    // Eliminar archivo
    fs.unlinkSync(filePath);

    console.log('🗑️ Imagen eliminada:', filename);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando imagen',
      message: error.message
    });
  }
});

// GET /api/upload/product-images - Listar imágenes disponibles
router.get('/product-images', verifyToken, verifyAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/products/${file}`,
          size: stats.size,
          created: stats.birthtime
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error listando imágenes:', error);
    res.status(500).json({
      success: false,
      error: 'Error listando imágenes',
      message: error.message
    });
  }
});

// Middleware de manejo de errores para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Error subiendo archivo',
    message: error.message
  });
});

module.exports = router;