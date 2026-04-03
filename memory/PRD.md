# ConVeMe Mobile - PRD (Product Requirements Document)

## Problema Original
Migrar el frontend web del ERP "ConVeMe" (NoManches Mx) de React/TypeScript a React Native (Expo) con TypeScript y Expo Router. Ademas, blindar el backend NestJS para soportar 100k+ registros.

## Arquitectura
- **Framework**: React Native con Expo SDK 52
- **Navegacion**: Expo Router v4 (file-based routing) + @react-navigation/drawer
- **HTTP Client**: Axios (peticiones GraphQL al backend NestJS)
- **Storage**: expo-secure-store (token seguro)
- **Iconos**: lucide-react-native
- **Backend**: NestJS con GraphQL en puerto 3006

## Core Requirements (Estaticos)
1. Preservar logica de negocio intacta (useState, useEffect, debounce 500ms)
2. Servicios Axios/GraphQL identicos (queries y mutations sin cambios)
3. UI: div->View, p/span->Text, input->TextInput, button->TouchableOpacity
4. FlatList para listas (no .map())
5. Modal nativo de React Native
6. StyleSheet.create() (sin CSS/Tailwind)
7. Paleta: #f8f5ff, #1a0060, #06d6a0, #cc55ff, #ff5050
8. Borders 16-24px + sombras elevation/shadow Neo-Brutalista
9. Framer-motion eliminado
10. BaseURL configurable para IP local

## Lo Implementado

### FASE 1 - Blindaje del Backend (Enero 2026)
- **23 services** corregidos con take: 50 + order DESC
- **15 services** con buscador search (QueryBuilder + LIKE)
- **14 resolvers** actualizados con @Args('search', nullable)
- Cambios backwards-compatible

### FASE 2 - Proyecto Expo Inicializado (Enero 2026)
- Estructura Expo Router completa con file-based routing
- expo-secure-store para tokens (reemplazo de localStorage)
- @react-navigation/drawer para sidebar/drawer
- api/convemeApi.ts con Axios + SecureStore + IP placeholder

### FASE 3 Paso 1 - Auth & Routing (Enero 2026)
- Login.tsx migrado con interfaz identica a la web (Neo-Brutalista)
- AuthContext con SecureStore (guardarSesion, cerrarSesion)
- useAuth hook (iniciarSesion con manejo de errores)
- auth.service.ts (login mutation GraphQL identica)
- Rutas protegidas: index.tsx redirige segun estado de sesion
- DashboardLayout con Drawer custom que replica el sidebar web:
  - Menu items filtrados por rol (Admin/Vendedor/Produccion)
  - Secciones agrupadas (General, Ventas, Logistica, Admin, Vendedor)
  - Badge de rol con iconos y colores por tipo
  - Boton de cerrar sesion
- TopBar.tsx con hamburger menu + breadcrumb + chip de rol
- 11 pantallas del drawer creadas (cortes-admin migrada completa, resto placeholder)

### Pantallas Completamente Migradas
- [x] Login
- [x] CortesAdmin (con tabs Cortes/Asignaciones)
- [x] ModalAsignacion (entrega de mercancia)
- [x] ModalCorte (conciliacion inventario + financiera)
- [x] ActionModal (confirmacion/eliminar/exito)
- [x] ModalAutorizacion (autorizacion con contrasena)
- [x] Dashboard (basico con bienvenida por rol)

## Backlog Priorizado

### P0 - Fase 3 Paso 2 (Dashboard con metricas) - COMPLETADO
- [x] DashboardHome con grid de cards por rol (Admin 7 / Vendedor 3 / Produccion 2)
- [x] UserGreeting con animaciones Animated (avatar + badge amarillo)
- [x] Info strip (Hoy/Actividad + Rol)
- [x] Vinculacion automatica vendedor->usuario via SecureStore
- [x] Navegacion desde cards al modulo correspondiente

### P1 - Fase 3 Paso 3 (Operaciones - YA HECHO)
- [x] CortesAdmin y ModalAsignacion (completados)

### P1 - Fase 3 Paso 4 (Inventario y Catalogos) - COMPLETADO
- [x] Inventario.tsx (Productos, Categorias, Tamanos con FlatList + CRUD + ActionModal)
- [x] Catalogos.tsx (Escuelas, Empleados, Vendedores, Cuentas Bancarias, Eventos con FlatList + CRUD + ActionModal)
- [x] 5 Modales de Catalogos: ModalEscuela, ModalVendedor, ModalCuentaBancaria, ModalEvento, ModalEmpleado
- [x] 3 Modales de Inventario: ModalCategoria, ModalProducto, ModalTamano
- [x] Servicios GraphQL para todas las entidades

### P1 - Fase 3 Paso 5 (Pedidos y POS) - COMPLETADO
- [x] PedidosAdmin.tsx (lista de pedidos con FlatList, search, estados, finanzas Total/Anticipo/Restante, acciones Entregar/Cancelar/Eliminar)
- [x] POS.tsx (flujo completo: Setup con seleccion de Vendedor/Cliente/Promo -> Catalogo de productos -> Carrito con qty + totales -> Cobro)
- [x] ModalCliente.tsx (crear cliente rapido desde POS)
- [x] ModalPromocion.tsx (crear promocion desde POS)
- [x] ModalHistorialVentas.tsx (ver, editar metodo de pago, eliminar ventas)
- [x] Servicios: pedido.service.ts, cliente.service.ts, promocion.service.ts, venta.service.ts

### P2 - Fase 3 Paso 6 (Pantallas Restantes) - COMPLETADO
- [x] CrearUsuario (tabs Acceso/Empleados/Vendedores, rol picker, CRUD)
- [x] MisPedidos (vendedor: lista + crear pedido con carrito)
- [x] MisFinanzas (vendedor: historial cortes, comisiones, adeudos)
- [x] Perfil (hero card, info personal, edicion admin)
- [x] Produccion (ordenes + insumos, CRUD, finalizar lote)

## Estructura de Archivos
```
conveme-mobile/
├── app/
│   ├── _layout.tsx               # Root (AuthProvider + Stack)
│   ├── index.tsx                 # Redirect segun auth
│   ├── login.tsx                 # Pantalla de login
│   └── (dashboard)/
│       ├── _layout.tsx           # Drawer custom
│       ├── dashboard.tsx         # Inicio
│       ├── cortes-admin.tsx      # Operaciones (MIGRADO)
│       ├── inventario.tsx        # Placeholder
│       ├── catalogos.tsx         # Placeholder
│       ├── produccion.tsx        # Placeholder
│       ├── pedidos-admin.tsx     # Placeholder
│       ├── pos.tsx               # Placeholder
│       ├── crear-usuario.tsx     # Placeholder
│       ├── mis-pedidos.tsx       # Placeholder
│       ├── mis-finanzas.tsx      # Placeholder
│       └── perfil.tsx            # Placeholder
├── api/convemeApi.ts
├── components/
│   ├── inventario/
│   │   ├── ModalAsignacion.tsx
│   │   └── ModalCorte.tsx
│   └── ui/
│       ├── ActionModal.tsx
│       ├── ModalAutorizacion.tsx
│       ├── PlaceholderScreen.tsx
│       └── TopBar.tsx
├── constants/Colors.ts
├── context/AuthContext.tsx
├── hooks/useAuth.ts
├── interfaces/auth.interface.ts
├── services/
│   ├── auth.service.ts
│   ├── asignacion.service.ts
│   └── corte.service.ts
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

### Bugs corregidos (Feb 2026)
- [x] ModalAutorizacion.tsx: Reemplazado `AsyncStorage` (no instalado) por `expo-secure-store`
- [x] perfil.tsx: Corregidos 7 errores TS de tipo implicito `any` en callbacks EditField
- [x] Compilacion TypeScript limpia (`tsc --noEmit` = 0 errores)

### P2 - Widget Resumen Diario (Feb 2026) - COMPLETADO
- [x] DailyResumen.tsx: Widget con 3 metricas en tiempo real
  - Ventas del dia (monto + cantidad)
  - Cortes pendientes (con diferencia > 0)
  - Merma total (piezas reportadas, solo Admin)
- [x] Integrado en Dashboard ListHeaderComponent (Admin y Vendedor)
- [x] Boton refresh para actualizar datos on-demand
- [x] Estilos Neo-Brutalista con indicadores de alerta por color

### P2 - Notificaciones Push (Feb 2026) - COMPLETADO
- [x] expo-notifications + expo-device instalados y configurados
- [x] notification.service.ts: registrarPushToken, notificacionLocal, enviarPushAUsuario
- [x] NotificationContext.tsx: Provider con listeners foreground + tap
- [x] Notificacion al asignar mercancia a vendedor (ModalAsignacion)
- [x] Notificacion al entregar pedido (PedidosAdmin)
- [x] Notificacion al cancelar pedido (PedidosAdmin)
- [x] Canal Android personalizado (color #cc55ff, vibracion)
- [x] app.json configurado con plugin expo-notifications
- NOTA: Para push cross-device, el backend NestJS necesita:
  - Mutation: guardarPushToken(usuario_id, token)
  - Query: getPushTokenByUsuarioId(usuario_id)
  - Servicio que llame a Expo Push API al crear asignaciones/aprobar pedidos

## Proximas Tareas
1. Backend: Implementar almacenamiento de push tokens para notificaciones cross-device
2. Testing E2E en dispositivo fisico

## Como Ejecutar en tu Maquina

### Requisitos
- Node.js >= 18
- Yarn
- Expo CLI: `npm install -g expo-cli`
- Dispositivo fisico con Expo Go o emulador Android/iOS

### Pasos
```bash
cd conveme-mobile
yarn install
npx expo start
```
Escanea el QR con Expo Go (Android) o camara (iOS).

### Configurar IP del Backend
Edita `api/convemeApi.ts` y cambia el placeholder de IP por la IP local de tu maquina:
```
baseURL: 'http://TU_IP_LOCAL:3006/graphql'
```
Asegurate de que el backend NestJS este corriendo en el puerto 3006.

## Estructura Actualizada
```
conveme-mobile/
├── app/
│   ├── _layout.tsx               # Root (AuthProvider + Stack)
│   ├── index.tsx                 # Redirect segun auth
│   ├── login.tsx                 # Login Neo-Brutalista
│   └── (dashboard)/
│       ├── _layout.tsx           # Drawer custom con menu por rol
│       ├── dashboard.tsx         # Dashboard + DailyResumen widget
│       ├── cortes-admin.tsx      # Cortes + Asignaciones
│       ├── inventario.tsx        # Productos, Categorias, Tamanos
│       ├── catalogos.tsx         # Escuelas, Empleados, Vendedores, etc.
│       ├── produccion.tsx        # Ordenes + Insumos
│       ├── pedidos-admin.tsx     # Gestion pedidos admin
│       ├── pos.tsx               # Punto de Venta completo
│       ├── crear-usuario.tsx     # Control de accesos
│       ├── mis-pedidos.tsx       # Solicitudes vendedor
│       ├── mis-finanzas.tsx      # Historial financiero vendedor
│       └── perfil.tsx            # Datos personales + edicion
├── api/convemeApi.ts
├── components/
│   ├── catalogos/ (5 modales)
│   ├── inventario/ (5 modales)
│   ├── pos/ (3 modales)
│   ├── produccion/ (2 modales)
│   └── ui/
│       ├── ActionModal.tsx
│       ├── DailyResumen.tsx      # Widget resumen diario
│       ├── ModalAutorizacion.tsx
│       ├── PlaceholderScreen.tsx
│       ├── TopBar.tsx
│       └── UserGreeting.tsx
├── constants/Colors.ts
├── context/AuthContext.tsx
├── hooks/ (useAuth, useUser)
├── interfaces/auth.interface.ts
├── services/ (18 servicios GraphQL)
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```
