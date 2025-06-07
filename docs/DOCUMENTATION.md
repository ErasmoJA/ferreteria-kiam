🔨 Ferretería Kiam - Documentación del Proyecto
📋 Índice
Descripción General
Tecnologías Utilizadas
Arquitectura del Sistema
Instalación y Configuración
Estructura del Proyecto
Base de Datos
API Endpoints
Frontend
Características Principales
Guía de Desarrollo
Deployment
Troubleshooting

📖 Descripción General
Ferretería Kiam es una aplicación web completa de e-commerce especializada en productos de ferretería y construcción. El proyecto incluye un sistema completo de gestión de productos, carrito de compras, búsqueda avanzada y administración de inventario.
Características Principales
🛍️ E-commerce completo con carrito de compras
🔍 Búsqueda inteligente con debounce y filtros avanzados
📱 Diseño responsive que funciona en móviles y desktop
🎨 Diseño profesional inspirado en la marca Truper
⚡ Performance optimizado con carga asíncrona de datos
🗄️ Base de datos robusta con MySQL
🔗 API RESTful completa

🛠️ Tecnologías Utilizadas
Frontend
React 18 - Biblioteca de JavaScript para interfaces de usuario
Tailwind CSS - Framework de CSS utilitario
Axios - Cliente HTTP para llamadas a la API
Lucide React - Librería de iconos moderna
JavaScript ES6+ - Funcionalidades modernas de JavaScript
Backend
Node.js - Entorno de ejecución de JavaScript
Express.js - Framework web para Node.js
MySQL2 - Driver de MySQL para Node.js
CORS - Middleware para permitir solicitudes cross-origin
dotenv - Gestión de variables de entorno
bcryptjs - Encriptación de contraseñas
jsonwebtoken - Autenticación JWT
Base de Datos
MySQL 8.0 - Sistema de gestión de base de datos relacional
XAMPP - Entorno de desarrollo local
Herramientas de Desarrollo
Visual Studio Code - Editor de código
npm - Gestor de paquetes
Git - Control de versiones

🏗️ Arquitectura del Sistema
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   FRONTEND      │    │    BACKEND      │    │   BASE DE       │
│   (React)       │◄──►│   (Node.js)     │◄──►│   DATOS         │
│   Port: 3000    │    │   Port: 5000    │    │   (MySQL)       │
│                 │    │                 │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Flujo de Datos
Usuario interactúa con la interfaz React
Frontend envía peticiones HTTP al backend
Backend procesa las peticiones y consulta la base de datos
MySQL devuelve los datos solicitados
Backend formatea y envía la respuesta al frontend
Frontend actualiza la interfaz con los nuevos datos

⚙️ Instalación y Configuración
Prerrequisitos
Node.js 14 o superior
XAMPP (para MySQL)
Git
Editor de código (recomendado: VS Code)
Paso 1: Clonar el Proyecto
git clone [URL_DEL_REPOSITORIO]
cd ferreteria-kiam

Paso 2: Configurar la Base de Datos
Iniciar XAMPP y activar MySQL
Acceder a phpMyAdmin: http://localhost/phpmyadmin
Crear base de datos ferreteria_db
Ejecutar el script SQL proporcionado
Paso 3: Configurar el Backend
cd ferreteria-backend
npm install

Crear archivo .env:
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ferreteria_db
DB_PORT=3306
JWT_SECRET=ferreteria_secret_key_super_secure_2024
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000

Iniciar servidor backend:
npm start

Paso 4: Configurar el Frontend
cd ferreteria-web
npm install
npm start

Paso 5: Verificar Funcionamiento
Frontend: http://localhost:3000
Backend: http://localhost:5000
API Test: http://localhost:5000/api/test

📁 Estructura del Proyecto
ferreteria-kiam/
├── ferreteria-backend/
│   ├── config/
│   │   └── database.js          # Configuración de MySQL
│   ├── routes/
│   │   ├── products.js          # Rutas de productos
│   │   ├── categories.js        # Rutas de categorías
│   │   └── auth.js              # Rutas de autenticación
│   ├── .env                     # Variables de entorno
│   ├── server.js                # Servidor principal
│   └── package.json             # Dependencias del backend
│
├── ferreteria-web/
│   ├── public/
│   │   ├── logo.png             # Logo de la empresa
│   │   └── index.html
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js           # Servicios de API
│   │   ├── App.js               # Componente principal
│   │   └── index.js             # Punto de entrada
│   └── package.json             # Dependencias del frontend
│
└── database/
    └── schema.sql               # Esquema de base de datos


🗄️ Base de Datos
Esquema Principal
Tabla: productos
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2) NULL,
    categoria_id INT NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    marca VARCHAR(100),
    calificacion_promedio DECIMAL(3,2) DEFAULT 0,
    total_resenas INT DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

Tabla: categorias
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Tabla: usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    tipo_usuario ENUM('cliente', 'admin', 'empleado') DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Datos de Ejemplo
El sistema incluye 12 productos de ejemplo distribuidos en 6 categorías:
Herramientas: Martillo, destornillador, taladro, llave inglesa
Tornillería: Tornillos autorroscantes, clavos
Pinturas: Pintura vinílica, brocha
Plomería: Tubo PVC
Eléctricos: Cinta aislante, interruptor
Construcción: Cemento

🔗 API Endpoints
Productos
GET /api/products
Obtiene lista de productos con filtros opcionales.
Parámetros de consulta:
category - Filtrar por categoría
search - Búsqueda por texto
minPrice - Precio mínimo
maxPrice - Precio máximo
sortBy - Campo de ordenamiento
order - Dirección de ordenamiento (ASC/DESC)
featured - Solo productos destacados
limit - Límite de resultados
page - Página de resultados
Respuesta:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Martillo de Carpintero 16oz",
      "precio": 250.00,
      "categoria_nombre": "herramientas",
      "descripcion": "Martillo profesional...",
      "calificacion_promedio": 4.5,
      "stock": 15,
      "marca": "Stanley"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 12
  }
}

GET /api/products/:id
Obtiene un producto específico por ID.
GET /api/products/search/:term
Búsqueda de productos por término.
Categorías
GET /api/categories
Obtiene todas las categorías con conteo de productos.
Respuesta:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "herramientas",
      "descripcion": "Herramientas manuales y eléctricas",
      "total_productos": 4
    }
  ]
}

GET /api/categories/:id
Obtiene una categoría específica.
GET /api/categories/:id/products
Obtiene productos de una categoría específica.
Autenticación
POST /api/auth/register
Registra un nuevo usuario.
POST /api/auth/login
Inicia sesión de usuario.
GET /api/auth/profile
Obtiene perfil del usuario autenticado.

⚛️ Frontend
Componentes Principales
FerreteriaApp
Componente principal que maneja:
Estado global de la aplicación
Navegación entre páginas
Gestión del carrito de compras
Comunicación con la API
HomePage
Hero section con call-to-action
Productos destacados
Grid de categorías
ProductsPage
Filtros avanzados (categoría, precio, búsqueda)
Grid de productos
Paginación y ordenamiento
Estados de carga y error
ProductCard
Tarjeta individual de producto
Información completa del producto
Botón de agregar al carrito
Sistema de calificaciones
Servicios API
productService
// Obtener productos con filtros
const products = await productService.getProducts({
  category: 'herramientas',
  search: 'martillo',
  sortBy: 'precio',
  order: 'ASC'
});

// Obtener productos destacados
const featured = await productService.getFeaturedProducts(4);

categoryService
// Obtener todas las categorías
const categories = await categoryService.getCategories();

// Obtener productos de una categoría
const categoryProducts = await categoryService.getCategoryProducts(1);

Estados y Hooks
Estados Principales
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [cart, setCart] = useState([]);

Debounce para Búsqueda
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 800);
  return () => clearTimeout(timeoutId);
}, [searchTerm]);


✨ Características Principales
1. Búsqueda Inteligente
Debounce de 800ms para evitar búsquedas excesivas
Búsqueda en tiempo real sin recargar la página
Filtros combinables (categoría + precio + texto)
2. Gestión de Productos
Vista de cuadrícula responsive
Información completa (precio, stock, calificaciones)
Productos destacados en homepage
Navegación por categorías
3. Carrito de Compras
Agregar productos con un click
Contador visual de productos
Total actualizado en tiempo real
Persistencia durante la sesión
4. UI/UX Optimizada
Diseño responsive para todos los dispositivos
Estados de carga con spinners
Manejo de errores con mensajes claros
Paleta de colores profesional (estilo Truper)
5. Performance
Lazy loading de productos
Optimización de consultas en backend
Cache de categorías
Debounce en búsquedas

👨‍💻 Guía de Desarrollo
Agregar Nuevos Productos
Insertar en base de datos:
INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock, marca) 
VALUES ('Nuevo Producto', 'Descripción...', 99.99, 1, 20, 'Marca');

Los productos aparecerán automáticamente en la interfaz.
Crear Nueva Categoría
Insertar en base de datos:
INSERT INTO categorias (nombre, descripcion) 
VALUES ('nueva_categoria', 'Descripción de la categoría');

Agregar ícono en getCategoryIcon():
const icons = {
  'nueva_categoria': '🆕',
  // ... otros iconos
};

Agregar nombre display en getCategoryDisplayName():
const names = {
  'nueva_categoria': 'Nueva Categoría',
  // ... otros nombres
};

Modificar Estilos
Los estilos utilizan Tailwind CSS. Para modificar colores:
// Cambiar color principal
className="bg-orange-600 hover:bg-orange-700"

// Cambiar gradiente del hero
className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700"

Agregar Nuevos Endpoints
Crear ruta en el backend:
// routes/products.js
router.get('/new-endpoint', async (req, res) => {
  // Lógica del endpoint
});

Agregar servicio en frontend:
// services/api.js
export const productService = {
  newFunction: async () => {
    const response = await api.get('/products/new-endpoint');
    return response.data;
  }
};


🚀 Deployment
Preparación para Producción
Backend
Variables de entorno:
NODE_ENV=production
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password_segura
JWT_SECRET=jwt_secret_muy_seguro

Optimizaciones:
Habilitar compresión gzip
Configurar rate limiting
Implementar logs de seguridad
Frontend
Build de producción:
npm run build

Configurar variables:
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-api.com/api' 
  : 'http://localhost:5000/api';

Hostinger Deployment
Configuración MySQL
Crear base de datos en panel de Hostinger
Importar esquema SQL
Configurar usuario y permisos
Backend Deployment
Subir archivos a carpeta public_html/api
Configurar variables de entorno
Instalar dependencias: npm install --production
Frontend Deployment
Generar build: npm run build
Subir contenido de build/ a public_html
Configurar redirects para SPA

🔧 Troubleshooting
Problemas Comunes
Error de Conexión a Base de Datos
Error: ER_ACCESS_DENIED_ERROR

Solución:
Verificar credenciales en .env
Confirmar que MySQL esté ejecutándose
Comprobar permisos de usuario
CORS Error
Access to XMLHttpRequest has been blocked by CORS policy

Solución:
Verificar configuración de CORS en backend
Confirmar que FRONTEND_URL esté correcta
Productos No Cargan
Verificar:
Backend ejecutándose en puerto 5000
Base de datos con datos de ejemplo
Consola del navegador para errores de red
Búsqueda No Funciona
Verificar:
Estado de debouncedSearchTerm
Conexión a API
Parámetros de filtros en backend
Logs Útiles
Backend Debug
console.log('Filters received:', filters);
console.log('Database query:', query);
console.log('Results count:', results.length);

Frontend Debug
console.log('Search term:', searchTerm);
console.log('Debounced term:', debouncedSearchTerm);
console.log('API Response:', response);


📊 Métricas del Proyecto
Estadísticas Técnicas
Líneas de código: ~2000+
Componentes React: 4 principales
Endpoints API: 15+
Tablas de base de datos: 8
Dependencias: 20+
Funcionalidades Implementadas
✅ Sistema de productos completo
✅ Búsqueda y filtrado avanzado
✅ Carrito de compras funcional
✅ Diseño responsive
✅ API RESTful completa
✅ Base de datos relacional
✅ Manejo de errores
✅ Optimización de performance
Funcionalidades Futuras
🔲 Sistema de usuarios y autenticación
🔲 Proceso de checkout y pagos
🔲 Panel de administración
🔲 Sistema de reseñas
🔲 Notificaciones push
🔲 Integración con sistemas de pago
🔲 Análiticas y reportes

👥 Información del Proyecto
Desarrollador: Erasmo Juarez Aguilar, Luis Javier Espino
 Empresa: Ferretería Kiam
 Fecha de Desarrollo: 2024
 Versión: 1.0.0
 Licencia: MIT
Contacto
Email: kiamferreteria@gmail.com
Teléfono: (871) 752-22092
Dirección: San Federico #201, Boulevard San Antonio CP. 35015, Gómez Palacio, Durango, México

📝 Notas Finales
Este proyecto demuestra la implementación completa de una aplicación web moderna usando tecnologías actuales del mercado. La arquitectura es escalable y permite agregar nuevas funcionalidades fácilmente.
El código está estructurado siguiendo mejores prácticas de desarrollo web, con separación clara de responsabilidades entre frontend, backend y base de datos.
¡Gracias por revisar este proyecto! 🚀 