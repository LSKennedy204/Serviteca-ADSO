# Trazabilidad de Requisitos — Serviteca PRO

Proyecto Formativo · Tecnólogo ADSO · SENA
Caso de estudio: Serviteca ADSO

---

## Requisitos Funcionales

| ID  | Requisito                                                      | Archivo / Componente                                                                   |
|-----|----------------------------------------------------------------|----------------------------------------------------------------------------------------|
| RF01 | Autenticación con usuario y contraseña                        | `server/routes.ts` → POST /api/auth/login · `src/pages/Login.tsx`                     |
| RF02 | Sesión persistente al recargar la página                      | `src/context/AuthContext.tsx` → `verificarSesion()` + `localStorage`                  |
| RF03 | Cierre de sesión con confirmación                             | `src/components/Sidebar.tsx` → `ModalConfirm` + `cerrarSesion()` en AuthContext       |
| RF04 | Redirección al login si el token expira (401)                 | `src/services/api.ts` → bloque `if (res.status === 401)`                               |
| RF05 | Panel de inicio con totales de clientes, carros y servicios   | `src/pages/Dashboard.tsx` · `server/routes.ts` → GET /api/dashboard                   |
| RF06 | Conteo de servicios por tipo en el panel                      | `src/pages/Dashboard.tsx` → sección `porTipo` · `server/routes.ts` → GROUP BY         |
| RF07 | Últimos 5 servicios en el panel                               | `src/pages/Dashboard.tsx` → tabla `ultimosServicios` · `server/routes.ts` → LIMIT 5   |
| RF08 | Accesos rápidos en el panel                                   | `src/pages/Dashboard.tsx` → componente `AccesoRapido`                                  |
| RF09 | Registrar cliente con validación completa                     | `src/pages/clientes/AgregarCliente.tsx` · `server/routes.ts` → POST /api/clientes      |
| RF10 | Consultar cliente por identificación                          | `src/pages/clientes/ConsultarCliente.tsx` · `server/routes.ts` → GET /api/clientes/:id |
| RF11 | Listar clientes con filtro en tiempo real                     | `src/pages/clientes/ListarClientes.tsx` → `useMemo` sobre `clientes`                   |
| RF12 | Registrar carro con placa normalizada                         | `src/pages/carros/AgregarCarro.tsx` · `server/routes.ts` → POST /api/carros            |
| RF13 | Consultar carro por placa                                     | `src/pages/carros/ConsultarCarro.tsx` · `server/routes.ts` → GET /api/carros/:placa    |
| RF14 | Listar carros con filtro y botón Historial                    | `src/pages/carros/ListarCarros.tsx` → `navigate('/servicios/consultar', { state })`    |
| RF15 | Registrar servicio con validación de carro y cliente          | `src/pages/servicios/AgregarServicio.tsx` · `server/routes.ts` → POST /api/servicios   |
| RF16 | Autocompletar datos del carro al escribir la placa            | `src/pages/servicios/AgregarServicio.tsx` → `buscarCarro()` con debounce 500ms          |
| RF17 | Autocompletar datos del cliente al escribir la identificación | `src/pages/servicios/AgregarServicio.tsx` → `buscarCliente()` con debounce 500ms        |
| RF18 | Conservar fecha y tipo al guardar servicio; limpiar placa e id| `src/pages/servicios/AgregarServicio.tsx` → bloque tras `res.ok`                       |
| RF19 | Consultar historial de servicios por placa                    | `src/pages/servicios/ConsultarServicio.tsx` · `server/routes.ts` → GET /servicios/carro|
| RF20 | Listar servicios con filtro de texto y por tipo               | `src/pages/servicios/ListarServicios.tsx` → `useMemo` con dos filtros combinados        |
| RF21 | Historial de más reciente a más antiguo                       | `server/routes.ts` → ORDER BY fecha DESC, creado_en DESC, id DESC                      |
| RF22 | Botón Historial en listado de carros                          | `src/pages/carros/ListarCarros.tsx` → `navigate` con `state: { placa }`                |
| RF23 | Manual de ayuda en secciones desplegables                     | `src/pages/ayuda/Ayuda.tsx` → componente `Seccion` con `useState(abierta)`             |
| RF24 | Mensaje cuando no hay registros o el filtro no coincide       | `ListarClientes.tsx`, `ListarCarros.tsx`, `ListarServicios.tsx` → bloques condicionales |
| RF25 | Contador "Mostrando X de Y" en listados                       | `ListarClientes.tsx`, `ListarCarros.tsx`, `ListarServicios.tsx`                         |
| RF26 | Acceso desde cliente → registrar servicio                     | `src/pages/clientes/ConsultarCliente.tsx` → `navigate('/servicios/agregar', { state })` |
| RF27 | Acceso desde carro → ver servicios y registrar servicio       | `src/pages/carros/ConsultarCarro.tsx` → botones con `navigate`                         |
| RF28 | Datos iniciales: admin, 3 clientes, 3 carros, 4 servicios     | `server/db.ts` → función `seedData()`                                                  |
| RF29 | Navegación con migas de pan en cada módulo                    | `src/components/Breadcrumb.tsx` · todos los módulos usan `<Breadcrumb migas={[...]} />`|
| RF30 | Botón Regresar en cada módulo                                 | Todos los formularios y consultas → `<Link to="..."><ArrowLeft /></Link>`               |

---

## Requisitos No Funcionales

| ID   | Requisito                                                                   | Archivo / Componente                                                                              |
|------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| RNF01 | Contraseñas con PBKDF2-SHA512, 210 000 iteraciones, salt aleatorio         | `server/db.ts` → `hashPassword()`, `pbkdf2Sync(..., 210_000, 64, 'sha512')`                      |
| RNF02 | Comparación de contraseñas con `timingSafeEqual`                           | `server/db.ts` → `verifyPassword()` → `timingSafeEqual(derived, stored)`                         |
| RNF03 | Token de sesión: 32 bytes aleatorios, guardado como hash SHA-256            | `server/db.ts` → `generateToken()` + `hashToken()` · `server/routes.ts` → INSERT en sesiones     |
| RNF04 | Sesiones expiran en 24 horas                                                | `server/routes.ts` → `expiraEn24h()` + validación en `autenticar()`                              |
| RNF05 | Todas las rutas protegidas requieren Bearer token válido                    | `server/routes.ts` → middleware `autenticar()` aplicado a todas las rutas excepto /health y login |
| RNF06 | Mensaje de login genérico (no revela qué falló)                             | `server/routes.ts` → `const MENSAJE_ERROR = 'Usuario o contraseña incorrectos.'`                 |
| RNF07 | Consultas SQL siempre parametrizadas                                        | `server/routes.ts` y `server/db.ts` → todos los `db.run(sql, params)` con `?`                    |
| RNF08 | Errores 500 sin detalles internos                                           | `server/routes.ts` → todos los catch: `res.status(500).json({ error: 'Error interno...' })`      |
| RNF09 | Normalización de datos: trim, correo lowercase, placa uppercase sin espacios| `server/routes.ts` → bloques de normalización en POST /clientes, POST /carros, POST /servicios   |
| RNF10 | Persistencia atómica de la BD (escribe temporal → renombra)                 | `server/db.ts` → `persistDb()` → `writeFileSync(DB_TMP) + renameSync(DB_TMP, DB_PATH)`           |
| RNF11 | PRAGMA foreign_keys = ON                                                    | `server/db.ts` → `initDb()` → `db.run('PRAGMA foreign_keys = ON;')`                             |
| RNF12 | Diseño dark mode, mobile-first, responsive                                  | `src/index.css` (variables CSS) · todos los componentes con Tailwind CSS 4                        |
| RNF13 | Botones táctiles mínimo 44px                                                | Todos los botones usan `min-h-[44px]` en su className                                             |
| RNF14 | Sidebar colapsible en escritorio, overlay en móvil                          | `src/components/Sidebar.tsx` → estados `colapsado` y `movil`                                     |
| RNF15 | Submenús se cierran al elegir opción o clic afuera                          | `src/components/Sidebar.tsx` → `useEffect` en `location.pathname` + `mousedown` handler          |
| RNF16 | Opción activa resaltada en amarillo en el menú                              | `src/components/Sidebar.tsx` → condicional `esActiva()` / `tieneSubActiva()`                     |
| RNF17 | Mensajes de feedback: éxito, error, advertencia, info                       | `src/components/AlertMessage.tsx` → tipo `TipoAlerta` + colores por tipo                         |
| RNF18 | Modal de confirmación para cerrar sesión                                    | `src/components/ModalConfirm.tsx` · `src/components/Sidebar.tsx`                                 |
| RNF19 | Estados de carga en botones ("Guardando...", "Consultando...", etc.)        | `Login.tsx`, `AgregarCliente.tsx`, `AgregarCarro.tsx`, `AgregarServicio.tsx`, consultas           |
| RNF20 | Fechas almacenadas como AAAA-MM-DD, mostradas como DD/MM/AAAA               | `server/db.ts` · `Dashboard.tsx`, `ListarServicios.tsx`, `ConsultarServicio.tsx` → `fechaDDMMAAAA`|
| RNF21 | Campos obligatorios marcados con asterisco (*)                              | Todos los formularios → `<span className="text-yellow-400">*</span>`                             |
| RNF22 | Focus visible accesible (outline amarillo)                                  | `src/index.css` → `:focus-visible { outline: 2px solid #FACC15; }`                              |
| RNF23 | Separación frontend/backend en un solo servidor                              | `server.ts` → `ViteExpress.listen(app, PORT, ...)` + `app.use('/api', router)`                   |
| RNF24 | Placa: formato 3L+3N, normalizada en tiempo real en el frontend             | `server/routes.ts` → `RE_PLACA` · `AgregarCarro.tsx`, `ConsultarCarro.tsx` → `onChange`          |
| RNF25 | Celular: exactamente 10 dígitos                                             | `server/routes.ts` → `RE_CELULAR = /^\d{10}$/` · `AgregarCliente.tsx` → `maxLength={10}`        |
| RNF26 | Verificación de unicidad: identificación (clientes) y placa (carros)        | `server/routes.ts` → `queryOne('SELECT id FROM ... WHERE ... = ?')` antes de cada INSERT         |
| RNF27 | Verificación de existencia de FK antes de insertar servicio                 | `server/routes.ts` → POST /api/servicios: verifica carro y cliente por separado                   |
| RNF28 | Listados ordenados del más reciente al más antiguo                          | `server/routes.ts` → todas las consultas con `ORDER BY creado_en DESC, id DESC`                  |

---

*Documento generado automáticamente como parte de la Fase 5 del proyecto Serviteca PRO.*
