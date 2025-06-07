# 🔨 Ferretería Kiam - E-commerce Completo

> Sistema completo de e-commerce especializado en productos de ferretería y construcción desarrollado con tecnologías modernas y **sistema de usuarios integrado**.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-purple.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Características Principales

- 🛍️ **E-commerce completo** con carrito de compras funcional
- 👤 **Sistema de usuarios** con registro, login y logout
- 🔐 **Autenticación JWT** con sesiones persistentes
- 🔍 **Búsqueda inteligente** with debounce y filtros avanzados  
- 📱 **Diseño responsive** optimizado para móviles y desktop
- 🎨 **UI profesional** inspirada en la marca Truper
- ⚡ **Performance optimizado** con carga asíncrona de datos
- 🗄️ **Base de datos robusta** con MySQL y relaciones normalizadas
- 🔒 **Seguridad avanzada** con encriptación bcrypt y tokens JWT
- 📊 **Gestión de inventario** en tiempo real

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Tailwind CSS** - Framework CSS utilitario para diseño rápido
- **Axios** - Cliente HTTP para comunicación con la API
- **Lucide React** - Librería moderna de iconos
- **JWT Authentication** - Gestión de autenticación del lado cliente
- **LocalStorage** - Persistencia de sesiones de usuario

### Backend  
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web minimalista y flexible
- **MySQL2** - Driver nativo de MySQL para Node.js
- **JWT (jsonwebtoken)** - Sistema de autenticación con tokens
- **bcryptjs** - Encriptación segura de contraseñas
- **CORS** - Configuración de políticas de origen cruzado

### Base de Datos
- **MySQL 8.0** - Sistema de gestión de base de datos relacional
- **phpMyAdmin** - Interfaz web para administración de MySQL
- **XAMPP** - Solución completa para desarrollo local

## 📦 Instalación Rápida

### Prerrequisitos
- [Node.js 14+](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/) (para MySQL)
- [Git](https://git-scm.com/)

### 1. Clonar repositorio
```bash
git clone https://github.com/ErasmoJA/ferreteria-kiam.git
cd ferreteria-kiam
```

### 2. Configurar base de datos
1. **Iniciar XAMPP** y activar MySQL
2. **Abrir phpMyAdmin:** `http://localhost/phpmyadmin`
3. **Crear base de datos:** `ferreteria_db` 
4. **Importar esquema:** Ir a "Importar" → Seleccionar `database/schema.sql` → "Continuar"

### 3. Configurar backend
```bash
cd backend
npm install
```

Crear archivo `.env` con:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ferreteria_db
DB_PORT=3306
JWT_SECRET=ferreteria_secret_key_super_secure_2024
FRONTEND_URL=http://localhost:3000
```

Iniciar servidor:
```bash
npm start
```

### 4. Configurar frontend
```bash
cd frontend
npm install
npm start
```

### 5. ¡Listo! 🎉
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Prueba de API:** http://localhost:5000/api/test

## 🌟 Demo y Screenshots

### Página Principal
![Homepage](assets/screenshots/homepage.png)

### Sistema de Usuarios
![Auth System](assets/screenshots/auth-modal.png)

### Catálogo de Productos  
![Products](assets/screenshots/products.png)

### Usuario Logueado
![User Logged](assets/screenshots/user-header.png)

## 📖 Documentación Completa

Para información detallada sobre:
- 🏗️ Arquitectura del sistema
- 🔗 API Endpoints (incluyendo autenticación)
- 🗄️ Esquema de base de datos  
- 👨‍💻 Guía de desarrollo
- 🚀 Deployment en producción

Consulta la [**documentación completa**](docs/DOCUMENTATION.md)

## 🎯 Funcionalidades Implementadas

### Para Usuarios Finales
- [x] **Registro de cuenta** con validación de formularios
- [x] **Inicio de sesión** con email y contraseña
- [x] **Sesiones persistentes** que se mantienen al refrescar
- [x] **Logout seguro** con limpieza de datos
- [x] **Navegación intuitiva** por categorías
- [x] **Búsqueda de productos** en tiempo real
- [x] **Filtros avanzados** (precio, categoría, calificación)
- [x] **Carrito de compras** persistente durante la sesión
- [x] **Vista detallada** de productos con especificaciones
- [x] **Diseño responsive** para móviles y tablets
- [x] **Indicadores de stock** en tiempo real

### Para Desarrolladores
- [x] **API RESTful completa** y documentada
- [x] **Sistema de autenticación JWT** robusto
- [x] **Encriptación de contraseñas** con bcrypt
- [x] **Base de datos normalizada** con relaciones
- [x] **Validación de datos** en backend y frontend
- [x] **Manejo robusto de errores** con mensajes específicos
- [x] **Código limpio** y bien documentado
- [x] **Estructura modular** y escalable
- [x] **Gestión de estado** avanzada en React

## 🔐 Sistema de Autenticación

### Características de Seguridad
- **JWT Tokens** - Autenticación stateless y escalable
- **bcrypt Hashing** - Encriptación segura de contraseñas (10 rounds)
- **Validación de entrada** - Sanitización y validación de datos
- **Persistencia segura** - Tokens almacenados en localStorage
- **Logout completo** - Limpieza de tokens y estado

### Flujo de Usuario
1. **Registro** → Validación → Hash de contraseña → Token JWT
2. **Login** → Verificación → Token JWT → Estado de usuario
3. **Sesión** → Verificación automática → Persistencia
4. **Logout** → Limpieza de tokens → Estado limpio

## 🚀 API Endpoints de Autenticación

```bash
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Inicio de sesión  
GET  /api/auth/profile      # Perfil del usuario (requiere token)
POST /api/auth/logout       # Cerrar sesión
PUT  /api/auth/profile      # Actualizar perfil (requiere token)
```

## 🗄️ Estructura de Base de Datos

### Tabla: usuarios
```sql
- id (PRIMARY KEY)
- nombre (VARCHAR)
- apellidos (VARCHAR) 
- email (UNIQUE)
- password_hash (VARCHAR)
- telefono (VARCHAR)
- tipo_usuario (ENUM: cliente, admin, empleado)
- fecha_registro (TIMESTAMP)
- activo (BOOLEAN)
```

## 🚀 Roadmap - Próximas Funcionalidades

### Corto Plazo (v2.0)
- [x] **Sistema de usuarios completo** ✅
- [ ] **Carrito persistente por usuario** - Guardar carrito en DB
- [ ] **Perfil de usuario editable** - Cambiar datos personales
- [ ] **Direcciones de envío** - Gestionar múltiples direcciones

### Mediano Plazo (v3.0)  
- [ ] **Proceso de checkout completo** - Formularios de pedido
- [ ] **Historial de pedidos** - Ver compras anteriores
- [ ] **Sistema de reseñas** - Calificar productos
- [ ] **Panel de administración** - Gestión de productos e inventario

### Largo Plazo (v4.0)
- [ ] **Integración con pasarelas de pago** (Stripe, PayPal)
- [ ] **Notificaciones push** - Alertas de nuevos productos
- [ ] **App móvil** con React Native
- [ ] **Análiticas y reportes** avanzados

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | 3,500+ |
| **Componentes React** | 5 principales |
| **Endpoints API** | 20+ |
| **Tablas de base de datos** | 10 |
| **Productos de ejemplo** | 12 |
| **Categorías** | 6 |
| **Sistema de usuarios** | ✅ Completo |
| **Autenticación JWT** | ✅ Implementada |

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQL Queries    ┌─────────────────┐
│                 │    (Axios)      │                 │    (MySQL2)       │                 │
│   FRONTEND      │◄───────────────►│    BACKEND      │◄─────────────────►│   BASE DE       │
│   (React)       │   JSON + JWT    │   (Node.js)     │   Result Sets     │   DATOS         │
│   Port: 3000    │                 │   Port: 5000    │                   │   (MySQL)       │
│                 │                 │                 │                   │   Port: 3306    │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
        │                                   │                                       │
        │                                   │                                       │
   Tailwind CSS                       Express Routes                         Normalized Schema
   JWT Client                         JWT Middleware                        usuarios Table
   AuthModal                          bcrypt Security                       Encrypted Passwords
   State Management                   CORS Config                          Foreign Keys
```

## 🧪 Testing del Sistema

### Probar Autenticación
```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellidos":"User","email":"test@test.com","password":"123456"}'

# 2. Iniciar sesión
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 3. Obtener perfil (reemplazar TOKEN)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🤝 Contribuir al Proyecto

¡Las contribuciones son bienvenidas! Aquí tienes cómo puedes ayudar:

### 1. Fork del Proyecto
```bash
git clone https://github.com/TU_USUARIO/ferreteria-kiam.git
```

### 2. Crear Rama de Funcionalidad
```bash
git checkout -b feature/nueva-funcionalidad
```

### 3. Hacer Cambios y Commit
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad increíble"
```

### 4. Push y Pull Request
```bash
git push origin feature/nueva-funcionalidad
```

## 🐛 Reporte de Issues

### Para Bugs de Autenticación
```markdown
## Bug en Sistema de Usuarios
**Pasos para reproducir:**
1. Ir a registro/login
2. Completar formulario
3. Observar comportamiento

**Comportamiento esperado:** ...
**Comportamiento actual:** ...
**Token JWT:** [incluir si relevante]
```

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Contacto y Soporte

### Ferretería Kiam
- 🌐 **Website:** [ferreteriaKiam.com](https://ferreteriaKiam.com) (próximamente)
- 📞 **Teléfono:** [(871) 752-22092](tel:+528717522092)
- 📧 **Email:** [kiamferreteria@gmail.com](mailto:kiamferreteria@gmail.com)
- 📍 **Dirección:** San Federico #201, Boulevard San Antonio CP. 35015, Gómez Palacio, Durango, México

### Desarrollador
- 🐙 **GitHub:** [ErasmoJA](https://github.com/ErasmoJA)
- 📧 **Email:** [erasmo.juarez.ag@gmail.com](mailto:erasmo.juarez.ag@gmail.com)

## 🙏 Agradecimientos

- **Truper** - Por la inspiración en el diseño y paleta de colores
- **React Team** - Por la increíble biblioteca de UI
- **Tailwind CSS** - Por hacer que el CSS sea divertido otra vez
- **Node.js Community** - Por las herramientas robustas de backend
- **JWT.io** - Por el estándar de autenticación segura
- **MySQL** - Por la base de datos confiable y escalable

## ⭐ ¿Te Gustó el Proyecto?

Si este proyecto te fue útil o te gustó, ¡considera darle una estrella! ⭐

También puedes:
- 🍴 **Fork** el proyecto para tus propias modificaciones
- 🐛 **Reportar bugs** o sugerir mejoras
- 💡 **Contribuir** con nuevas funcionalidades
- 📢 **Compartir** el proyecto con otros desarrolladores

---

**¡Gracias por visitar Ferretería Kiam!** 🔨

*Hecho con ❤️ y mucho ☕ en México*

**Últimas actualizaciones:**
- ✅ Sistema de autenticación JWT implementado
- ✅ Registro y login de usuarios funcional  
- ✅ Sesiones persistentes integradas
- ✅ Modal de autenticación responsive
- ✅ Seguridad con bcrypt y validaciones