# 🔨 Ferretería Kiam - E-commerce Completo

> Sistema completo de e-commerce especializado en productos de ferretería y construcción desarrollado con tecnologías modernas.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Características Principales

- 🛍️ **E-commerce completo** con carrito de compras funcional
- 🔍 **Búsqueda inteligente** con debounce y filtros avanzados  
- 📱 **Diseño responsive** optimizado para móviles y desktop
- 🎨 **UI profesional** inspirada en la marca Truper
- ⚡ **Performance optimizado** con carga asíncrona de datos
- 🗄️ **Base de datos robusta** con MySQL y relaciones normalizadas
- 🔐 **Autenticación JWT** preparada para sistema de usuarios
- 📊 **Panel de administración** ready para gestión de inventario

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Tailwind CSS** - Framework CSS utilitario para diseño rápido
- **Axios** - Cliente HTTP para comunicación con la API
- **Lucide React** - Librería moderna de iconos
- **JavaScript ES6+** - Sintaxis moderna de JavaScript

### Backend  
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web minimalista y flexible
- **MySQL2** - Driver nativo de MySQL para Node.js
- **JWT** - Sistema de autenticación con tokens
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
git clone https://github.com/TU_USUARIO/ferreteria-kiam.git
cd ferreteria-kiam
```

### 2. Configurar base de datos
1. **Iniciar XAMPP** y activar MySQL
2. **Abrir phpMyAdmin:** `http://localhost/phpmyadmin`
3. **Crear base de datos:** `ferreteria_db` 
4. **Importar esquema:** Ir a "Importar" → Seleccionar `database/schema.sql` → "Continuar"

### 3. Configurar backend
```bash
cd ferreteria-backend
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
cd ferreteria-web
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

### Catálogo de Productos  
![Products](assets/screenshots/products.png)

### Búsqueda y Filtros
![Search](assets/screenshots/search.png)

### Carrito de Compras
![Cart](assets/screenshots/cart.png)

## 📖 Documentación Completa

Para información detallada sobre:
- 🏗️ Arquitectura del sistema
- 🔗 API Endpoints
- 🗄️ Esquema de base de datos  
- 👨‍💻 Guía de desarrollo
- 🚀 Deployment en producción

Consulta la [**documentación completa**](docs/DOCUMENTATION.md)

## 🎯 Funcionalidades Implementadas

### Para Usuarios Finales
- [x] Navegación intuitiva por categorías
- [x] Búsqueda de productos en tiempo real
- [x] Filtros avanzados (precio, categoría, calificación)
- [x] Carrito de compras persistente durante la sesión
- [x] Vista detallada de productos con especificaciones
- [x] Diseño responsive para móviles y tablets
- [x] Indicadores de stock en tiempo real

### Para Desarrolladores
- [x] API RESTful completa y documentada
- [x] Base de datos normalizada con relaciones
- [x] Sistema de autenticación JWT preparado
- [x] Validación de datos en backend y frontend
- [x] Manejo robusto de errores
- [x] Código limpio y bien documentado
- [x] Estructura modular y escalable

## 🚀 Roadmap - Próximas Funcionalidades

### Corto Plazo (v2.0)
- [ ] **Sistema de usuarios completo** (registro, login, perfiles)
- [ ] **Proceso de checkout** con formularios de envío
- [ ] **Gestión de pedidos** con estados y tracking
- [ ] **Panel de administración** para gestión de productos

### Mediano Plazo (v3.0)  
- [ ] **Integración con pasarelas de pago** (Stripe, PayPal)
- [ ] **Sistema de reseñas y calificaciones** de usuarios
- [ ] **Notificaciones en tiempo real** con WebSockets
- [ ] **Sistema de descuentos y cupones**

### Largo Plazo (v4.0)
- [ ] **App móvil** con React Native
- [ ] **Análiticas y reportes** avanzados
- [ ] **Integración con ERP** para gestión de inventario
- [ ] **Chatbot de atención al cliente**

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | 2,000+ |
| **Componentes React** | 4 principales |
| **Endpoints API** | 15+ |
| **Tablas de base de datos** | 8 |
| **Productos de ejemplo** | 12 |
| **Categorías** | 6 |
| **Tiempo de desarrollo** | 2 semanas |

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQL Queries    ┌─────────────────┐
│                 │    (Axios)      │                 │    (MySQL2)       │                 │
│   FRONTEND      │◄───────────────►│    BACKEND      │◄─────────────────►│   BASE DE       │
│   (React)       │   JSON Data     │   (Node.js)     │   Result Sets     │   DATOS         │
│   Port: 3000    │                 │   Port: 5000    │                   │   (MySQL)       │
│                 │                 │                 │                   │   Port: 3306    │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
        │                                   │                                       │
        │                                   │                                       │
   Tailwind CSS                       Express Routes                         Normalized Schema
   Lucide Icons                       JWT Auth                              Indexed Tables
   Axios Requests                     CORS Config                          Foreign Keys
```

## 🤝 Contribuir al Proyecto

¡Las contribuciones son bienvenidas! Aquí tienes cómo puedes ayudar:

### 1. Fork del Proyecto
```bash
# Hacer fork desde GitHub, luego:
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
# Luego crear Pull Request en GitHub
```

### Guidelines de Contribución
- 📝 Seguir el estilo de código existente
- ✅ Agregar tests para nuevas funcionalidades  
- 📚 Actualizar documentación cuando sea necesario
- 🐛 Reportar bugs con detalles de reproducción

## 🐛 Reporte de Issues

¿Encontraste un bug? ¡Ayúdanos a mejorarlo!

**Template para reportar bugs:**
```markdown
## Descripción del Bug
Descripción clara del problema...

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'  
3. Scrollear hasta '...'
4. Ver error

## Comportamiento Esperado
Lo que debería pasar...

## Screenshots
Si aplica, agregar screenshots...

## Entorno
- OS: [ej. Windows 10]
- Browser: [ej. Chrome 90]
- Node.js: [ej. v16.14.0]
```

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 Ferretería Kiam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 📞 Contacto y Soporte

### Ferretería Kiam
- 🌐 **Website:** [ferreteriaKiam.com](https://ferreteriaKiam.com) (próximamente)
- 📞 **Teléfono:** [(871) 752-22092](tel:+528717522092)
- 📧 **Email:** [kiamferreteria@gmail.com](mailto:kiamferreteria@gmail.com)
- 📍 **Dirección:** San Federico #201, Boulevard San Antonio CP. 35015, Gómez Palacio, Durango, México

### Desarrollador
- 💼 **LinkedIn:** [Erasmo Juarez Aguilar](https://www.linkedin.com/in/erasmo-juarez-473278316/)
- 🐙 **GitHub:** [ErasmoJA](https://github.com/ErasmoJA)
- 📧 **Email:** [erasmo.juarez.ag@gmail.com](mailto:erasmo.juarez.ag@gmail.com)

## 🙏 Agradecimientos

- **Truper** - Por la inspiración en el diseño y paleta de colores
- **React Team** - Por la increíble biblioteca de UI
- **Tailwind CSS** - Por hacer que el CSS sea divertido otra vez
- **Node.js Community** - Por las herramientas robustas de backend
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
