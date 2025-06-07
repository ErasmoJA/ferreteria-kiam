-- =============================================
-- FERRETERÍA KIAM - ESQUEMA DE BASE DE DATOS
-- =============================================
-- Este archivo contiene la estructura completa de la base de datos
-- para el e-commerce de Ferretería Kiam
-- 
-- Instrucciones de instalación:
-- 1. Crear base de datos 'ferreteria_db' en phpMyAdmin
-- 2. Importar este archivo SQL
-- 3. ¡Listo para usar!
-- =============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria_db;

-- =============================================
-- TABLA: categorias
-- =============================================
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: productos
-- =============================================
DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2) NULL,
    categoria_id INT NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE,
    sku VARCHAR(50) UNIQUE,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    peso DECIMAL(8,3),
    dimensiones VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    garantia_meses INT DEFAULT 0,
    imagen_principal VARCHAR(255),
    imagenes_adicionales JSON,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0,
    total_resenas INT DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_categoria (categoria_id),
    INDEX idx_precio (precio),
    INDEX idx_stock (stock),
    INDEX idx_destacado (destacado),
    INDEX idx_activo (activo)
);

-- =============================================
-- TABLA: usuarios
-- =============================================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    tipo_usuario ENUM('cliente', 'admin', 'empleado') DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    UNIQUE KEY idx_email (email),
    INDEX idx_tipo_usuario (tipo_usuario)
);

-- =============================================
-- TABLA: direcciones
-- =============================================
DROP TABLE IF EXISTS direcciones;
CREATE TABLE direcciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('casa', 'trabajo', 'otro') DEFAULT 'casa',
    nombre_completo VARCHAR(200) NOT NULL,
    calle VARCHAR(200) NOT NULL,
    numero_exterior VARCHAR(20),
    numero_interior VARCHAR(20),
    colonia VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    telefono VARCHAR(20),
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
);

-- =============================================
-- TABLA: carritos
-- =============================================
DROP TABLE IF EXISTS carritos;
CREATE TABLE carritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    sesion_id VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_sesion (sesion_id)
);

-- =============================================
-- TABLA: carrito_items
-- =============================================
DROP TABLE IF EXISTS carrito_items;
CREATE TABLE carrito_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY idx_carrito_producto (carrito_id, producto_id),
    INDEX idx_producto (producto_id)
);

-- =============================================
-- TABLA: pedidos
-- =============================================
DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'paypal') NOT NULL,
    estado_pago ENUM('pendiente', 'pagado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
    direccion_envio JSON NOT NULL,
    notas TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada_entrega DATE,
    fecha_entrega TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_numero_pedido (numero_pedido),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pedido (fecha_pedido)
);

-- =============================================
-- TABLA: pedido_items
-- =============================================
DROP TABLE IF EXISTS pedido_items;
CREATE TABLE pedido_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_pedido (pedido_id),
    INDEX idx_producto (producto_id)
);

-- =============================================
-- TABLA: resenas
-- =============================================
DROP TABLE IF EXISTS resenas;
CREATE TABLE resenas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    pedido_id INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(200),
    comentario TEXT,
    verificada BOOLEAN DEFAULT FALSE,
    util_si INT DEFAULT 0,
    util_no INT DEFAULT 0,
    fecha_resena TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    UNIQUE KEY idx_usuario_producto_pedido (usuario_id, producto_id, pedido_id),
    INDEX idx_producto (producto_id),
    INDEX idx_calificacion (calificacion)
);

-- =============================================
-- TABLA: inventario_movimientos
-- =============================================
DROP TABLE IF EXISTS inventario_movimientos;
CREATE TABLE inventario_movimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    motivo VARCHAR(200),
    referencia VARCHAR(100),
    usuario_id INT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_producto (producto_id),
    INDEX idx_fecha (fecha_movimiento)
);

-- =============================================
-- INSERTAR DATOS DE EJEMPLO
-- =============================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('herramientas', 'Herramientas manuales y eléctricas para construcción y reparación'),
('tornilleria', 'Tornillos, clavos, tuercas y elementos de sujeción'),
('pinturas', 'Pinturas, barnices, brochas y accesorios para pintura'),
('plomeria', 'Tuberías, conexiones, válvulas y accesorios de plomería'),
('electricos', 'Material eléctrico, cables, interruptores y componentes'),
('construccion', 'Materiales de construcción, cemento, arena y agregados');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock, marca, calificacion_promedio, total_resenas, destacado) VALUES
('Martillo de Carpintero 16oz', 'Martillo profesional con mango de madera ergonómico, ideal para trabajos de carpintería y construcción general', 250.00, 1, 15, 'Stanley', 4.5, 12, TRUE),
('Destornillador Phillips #2', 'Destornillador de punta phillips con mango ergonómico antideslizante, perfecto para tornillos de tamaño mediano', 85.00, 1, 32, 'Klein Tools', 4.8, 8, FALSE),
('Tornillos Autorroscantes 6x1" (100pz)', 'Caja con 100 tornillos autorroscantes galvanizados de 6x1 pulgada, ideales para madera y materiales blandos', 120.00, 2, 50, 'Hilti', 4.3, 15, FALSE),
('Taladro Eléctrico 600W', 'Taladro eléctrico profesional de 600W con brocas incluidas, estuche y cable de 3 metros', 1850.00, 1, 8, 'Black & Decker', 4.7, 22, TRUE),
('Pintura Vinílica Blanca 4L', 'Pintura vinílica lavable para interiores, acabado mate, cobertura de hasta 40m² por galón', 380.00, 3, 25, 'Comex', 4.4, 18, FALSE),
('Brocha 3 pulgadas', 'Brocha profesional de 3 pulgadas con cerdas naturales de alta calidad para acabados perfectos', 95.00, 3, 40, 'Purdy', 4.2, 6, FALSE),
('Tubo PVC 4" x 6m', 'Tubo PVC sanitario de 4 pulgadas por 6 metros, ideal para sistemas de drenaje y desagüe', 320.00, 4, 18, 'Pavco', 4.6, 9, FALSE),
('Llave Inglesa 12"', 'Llave inglesa ajustable de 12 pulgadas con acabado cromado y mandíbulas templadas', 180.00, 1, 22, 'Truper', 4.5, 11, FALSE),
('Clavos 2.5" (1kg)', 'Kilogramo de clavos de 2.5 pulgadas para construcción general, acabado galvanizado', 65.00, 2, 35, 'Clavos Nacionales', 4.1, 7, FALSE),
('Cinta Aislante Negra', 'Rollo de cinta aislante eléctrica de 20 metros, resistente a la humedad y temperaturas extremas', 45.00, 5, 60, '3M', 4.3, 13, FALSE),
('Interruptor Simple', 'Interruptor simple para instalación eléctrica residencial, 15A 120V, color blanco', 25.00, 5, 45, 'Volteck', 4.4, 5, FALSE),
('Cemento Gris 50kg', 'Saco de cemento gris Portland de 50 kilogramos, ideal para construcción y obras civiles', 280.00, 6, 12, 'Cruz Azul', 4.8, 25, TRUE);

-- Insertar usuario administrador de ejemplo
INSERT INTO usuarios (nombre, apellidos, email, password_hash, tipo_usuario, email_verificado) VALUES
('Admin', 'Sistema', 'admin@ferreteriaKiam.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);

-- =============================================
-- VISTAS ÚTILES PARA CONSULTAS
-- =============================================

-- Vista de productos con información de categoría
CREATE OR REPLACE VIEW vista_productos AS
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
    p.activo,
    c.nombre as categoria_nombre,
    p.marca,
    p.fecha_creacion
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = TRUE AND c.activo = TRUE;

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW productos_stock_bajo AS
SELECT 
    p.id,
    p.nombre,
    p.stock,
    p.stock_minimo,
    c.nombre as categoria,
    p.marca
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock <= p.stock_minimo AND p.activo = TRUE;

-- =============================================
-- PROCEDIMIENTOS ALMACENADOS
-- =============================================

DELIMITER //

-- Procedimiento para actualizar stock de productos
CREATE PROCEDURE ActualizarStock(
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_tipo VARCHAR(10),
    IN p_motivo VARCHAR(200),
    IN p_usuario_id INT
)
BEGIN
    DECLARE stock_actual INT;
    DECLARE nuevo_stock INT;
    
    -- Obtener stock actual
    SELECT stock INTO stock_actual FROM productos WHERE id = p_producto_id;
    
    -- Calcular nuevo stock
    IF p_tipo = 'entrada' THEN
        SET nuevo_stock = stock_actual + p_cantidad;
    ELSE
        SET nuevo_stock = stock_actual - p_cantidad;
    END IF;
    
    -- Verificar que el stock no sea negativo
    IF nuevo_stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
    
    -- Actualizar stock del producto
    UPDATE productos SET stock = nuevo_stock WHERE id = p_producto_id;
    
    -- Registrar movimiento en historial
    INSERT INTO inventario_movimientos 
    (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario_id)
    VALUES 
    (p_producto_id, p_tipo, p_cantidad, stock_actual, nuevo_stock, p_motivo, p_usuario_id);
END //

-- Procedimiento para actualizar calificación promedio de productos
CREATE PROCEDURE ActualizarCalificacionProducto(IN p_producto_id INT)
BEGIN
    DECLARE promedio DECIMAL(3,2);
    DECLARE total INT;
    
    -- Calcular promedio y total de reseñas
    SELECT AVG(calificacion), COUNT(*) 
    INTO promedio, total
    FROM resenas 
    WHERE producto_id = p_producto_id;
    
    -- Actualizar producto con nueva información
    UPDATE productos 
    SET calificacion_promedio = IFNULL(promedio, 0),
        total_resenas = IFNULL(total, 0)
    WHERE id = p_producto_id;
END //

DELIMITER ;

-- =============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para búsquedas de texto (requiere MyISAM o InnoDB con ft_min_word_len configurado)
-- CREATE FULLTEXT INDEX idx_productos_busqueda ON productos(nombre, descripcion);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_productos_precio_stock ON productos(precio, stock);
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(fecha_pedido, estado);
CREATE INDEX idx_usuarios_email_activo ON usuarios(email, activo);

-- =============================================
-- CONFIGURACIONES FINALES
-- =============================================

-- Habilitar el registro de eventos para auditoría
-- SET GLOBAL log_bin_trust_function_creators = 1;

-- =============================================
-- VERIFICACIÓN DE INSTALACIÓN
-- =============================================

-- Mostrar resumen de instalación
SELECT 
    'Instalación completada exitosamente' AS estado,
    (SELECT COUNT(*) FROM categorias) AS total_categorias,
    (SELECT COUNT(*) FROM productos) AS total_productos,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    NOW() AS fecha_instalacion;

-- =============================================
-- NOTAS IMPORTANTES
-- =============================================

/*
INSTRUCCIONES POST-INSTALACIÓN:

1. SEGURIDAD:
   - Cambiar la contraseña del usuario admin
   - Configurar contraseñas seguras para la base de datos
   - Configurar backups automáticos

2. CONFIGURACIÓN:
   - Ajustar variables de entorno en el backend
   - Configurar CORS para producción
   - Optimizar configuración de MySQL para producción

3. DATOS:
   - Los productos de ejemplo están listos para usar
   - Puedes agregar más productos a través de la API
   - El usuario admin por defecto es: admin@ferreteriaKiam.com

4. MANTENIMIENTO:
   - Monitorear productos con stock bajo usando la vista 'productos_stock_bajo'
   - Usar los procedimientos almacenados para operaciones de stock
   - Revisar logs de inventario_movimientos regularmente

Para soporte técnico: kiamferreteria@gmail.com
*/