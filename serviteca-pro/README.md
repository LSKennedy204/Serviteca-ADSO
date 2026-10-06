# Serviteca PRO

Sistema de administración para servitecas. Reemplaza cuadernos y hojas sueltas por una base de datos con acceso por usuario y contraseña.

**Proyecto Formativo — Tecnólogo en Análisis y Desarrollo de Software (SENA)**
Caso de estudio: *Serviteca ADSO*

---

## Instalación

### Requisitos previos

- Node.js 20 o superior ([descargar aquí](https://nodejs.org))
- npm (incluido con Node.js)

### Pasos

```bash
# 1. Entrar a la carpeta del proyecto
cd serviteca-pro

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## Usuario de prueba

| Campo      | Valor        |
|------------|--------------|
| Usuario    | `admin`      |
| Contraseña | `admin123`   |
| Nombre     | Administrador |
| Rol        | ADMIN        |

> La pantalla de Login incluye un botón **"Autocompletar"** que rellena las credenciales automáticamente.

---

## Scripts disponibles

| Script          | Descripción                                                  |
|-----------------|--------------------------------------------------------------|
| `npm run dev`   | Inicia el servidor en modo desarrollo (puerto 3000)          |
| `npm run build` | Compila el frontend para producción                          |
| `npm run lint`  | Verifica tipos con TypeScript (frontend + servidor)          |

---

## Estructura del proyecto

```
serviteca-pro/
├── data/                          # Base de datos SQLite (se crea automáticamente)
│   └── serviteca.sqlite
├── docs/
│   └── trazabilidad.md            # Tabla de trazabilidad de requisitos
├── public/
│   └── logo.svg                   # Logo SVG de la aplicación
├── server/
│   ├── db.ts                      # SQLite en memoria, criptografía, helpers de consulta
│   └── routes.ts                  # Todas las rutas de la API REST
├── src/
│   ├── components/
│   │   ├── AlertMessage.tsx        # Alerta con tipos: exito/error/advertencia/info
│   │   ├── Breadcrumb.tsx          # Migas de pan
│   │   ├── Layout.tsx              # Layout con Sidebar + área de contenido
│   │   ├── ModalConfirm.tsx        # Modal de confirmación genérico
│   │   └── Sidebar.tsx             # Barra lateral colapsible + menú móvil
│   ├── context/
│   │   └── AuthContext.tsx         # Contexto global de autenticación
│   ├── pages/
│   │   ├── Login.tsx               # Pantalla de inicio de sesión
│   │   ├── Dashboard.tsx           # Panel de inicio con totales y accesos rápidos
│   │   ├── clientes/
│   │   │   ├── AgregarCliente.tsx
│   │   │   ├── ConsultarCliente.tsx
│   │   │   └── ListarClientes.tsx
│   │   ├── carros/
│   │   │   ├── AgregarCarro.tsx
│   │   │   ├── ConsultarCarro.tsx
│   │   │   └── ListarCarros.tsx
│   │   ├── servicios/
│   │   │   ├── AgregarServicio.tsx
│   │   │   ├── ConsultarServicio.tsx
│   │   │   └── ListarServicios.tsx
│   │   └── ayuda/
│   │       └── Ayuda.tsx           # Manual de usuario en secciones desplegables
│   ├── services/
│   │   └── api.ts                  # Cliente HTTP centralizado con Bearer token
│   ├── types/
│   │   └── index.ts                # Tipos TypeScript compartidos
│   ├── App.tsx                     # Router y rutas protegidas
│   ├── main.tsx                    # Punto de entrada React
│   └── index.css                   # Estilos globales + variables de color
├── server.ts                       # Servidor Express + Vite middleware
├── vite.config.ts
├── tsconfig.json                   # Configuración TypeScript para el frontend
├── tsconfig.server.json            # Configuración TypeScript para el servidor
└── package.json
```

---

## Endpoints de la API

| Método | Ruta                          | Descripción                              | Auth |
|--------|-------------------------------|------------------------------------------|------|
| GET    | /api/health                   | Estado del servidor                      | No   |
| POST   | /api/auth/login               | Iniciar sesión                           | No   |
| POST   | /api/auth/logout              | Cerrar sesión                            | Sí   |
| GET    | /api/auth/verify              | Verificar token activo                   | Sí   |
| GET    | /api/dashboard                | Totales, por tipo y últimos 5 servicios  | Sí   |
| GET    | /api/clientes                 | Listar todos los clientes                | Sí   |
| POST   | /api/clientes                 | Crear cliente                            | Sí   |
| GET    | /api/clientes/:identificacion | Buscar cliente por identificación        | Sí   |
| GET    | /api/carros                   | Listar todos los carros                  | Sí   |
| POST   | /api/carros                   | Crear carro                              | Sí   |
| GET    | /api/carros/:placa            | Buscar carro por placa                   | Sí   |
| GET    | /api/servicios                | Listar todos los servicios (enriquecido) | Sí   |
| POST   | /api/servicios                | Crear servicio                           | Sí   |
| GET    | /api/servicios/carro/:placa   | Historial de servicios de un carro       | Sí   |

---

## Casos de prueba verificados

| # | Caso                                          | Resultado esperado                                     |
|---|-----------------------------------------------|--------------------------------------------------------|
| 1 | Login con admin / admin123                    | 200 OK, token devuelto                                 |
| 2 | Login con contraseña incorrecta               | 401 "Usuario o contraseña incorrectos."               |
| 3 | Login con campos vacíos                       | 400 "Complete todos los campos."                       |
| 4 | Registrar cliente con id 1001234567 (existe)  | 409 "Ya existe un cliente registrado..."               |
| 5 | Registrar cliente con correo "juan@"          | 400 "El correo electrónico no tiene formato válido."   |
| 6 | Consultar cliente id 999999                   | 404 "El cliente... no se encuentra registrado."        |
| 7 | Registrar carro con placa "abc 999"           | Se normaliza a ABC999, 201 OK                          |
| 8 | Registrar carro con placa ABC123 (existe)     | 409 "Ya existe un carro registrado con esta placa."    |
| 9 | Registrar servicio con placa ZZZ000           | 404 "El carro ingresado no está registrado."           |
|10 | Registrar servicio con cliente 999999         | 404 "El cliente ingresado no está registrado."         |
|11 | Consultar historial de ABC123                 | 200 OK con 2 servicios                                 |
|12 | Consultar historial de carro sin servicios    | 200 OK, servicios: []                                  |
|13 | Filtrar listado por "toyota"                  | Muestra solo carros Toyota                             |
|14 | Filtrar listado por "Lavado"                  | Muestra solo servicios de tipo Lavado                  |
|15 | GET /api/clientes sin token                   | 401 "Token requerido."                                 |
|16 | Salir confirmando                             | Token eliminado, redirige a /login                     |
|17 | Salir cancelando                              | Modal se cierra, sesión intacta                        |
|18 | Reiniciar servidor                            | Datos persisten en data/serviteca.sqlite               |

---

## Supuestos

1. **Un solo rol activo**: La tabla `usuarios` tiene campo `rol`, pero la aplicación no implementa restricciones por rol en la interfaz. Todos los usuarios autenticados tienen acceso completo.
2. **Sin edición ni eliminación**: Por alcance del proyecto, los registros no se pueden modificar ni borrar desde la interfaz.
3. **Zona horaria**: Las fechas se manejan en hora local del servidor con `datetime('now','localtime')` en SQLite.
4. **Celular**: Se valida exactamente 10 dígitos numéricos (formato colombiano).
5. **Placa**: Se valida el formato 3 letras + 3 números (ej: ABC123). Se normaliza automáticamente a mayúsculas y sin espacios tanto en el frontend (mientras se escribe) como en el servidor (antes de validar).
6. **Puerto**: El servidor usa el puerto 3000 por defecto. Se puede cambiar con la variable de entorno `PORT`.
7. **Base de datos**: Se crea automáticamente en `data/serviteca.sqlite` la primera vez. Si se elimina, se vuelve a crear con los datos iniciales en el próximo arranque.
8. **Sesiones**: Los tokens expiran a las 24 horas. No hay renovación automática.
9. **Un servidor**: Frontend y API corren en el mismo proceso Node.js en el puerto 3000 (Vite en modo middleware).
10. **Autocompletado en Servicios**: La búsqueda de carro y cliente es en tiempo real con un debounce de 500 ms para evitar peticiones excesivas.
