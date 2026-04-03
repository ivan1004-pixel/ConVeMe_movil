# ConVeMe Mobile - React Native (Expo)

Migración del ERP ConVeMe de React Web a React Native con Expo Router.

## Estructura del Proyecto

```
conveme-mobile/
├── app/                          # Expo Router (navegacion basada en archivos)
│   ├── _layout.tsx               # Layout raiz (Stack)
│   ├── index.tsx                 # Redirige a cortes-admin
│   └── (tabs)/
│       ├── _layout.tsx           # Layout de pestanas
│       └── cortes-admin.tsx      # Pantalla principal (CortesAdmin migrada)
├── api/
│   └── convemeApi.ts             # Configuracion Axios (CAMBIAR IP!)
├── components/
│   ├── inventario/
│   │   ├── ModalAsignacion.tsx   # Modal de asignacion de mercancia
│   │   └── ModalCorte.tsx        # Modal de conciliacion/corte
│   └── ui/
│       ├── ActionModal.tsx       # Modal genérico de acciones (eliminar/exito)
│       └── ModalAutorizacion.tsx # Modal de autorizacion con contrasena
├── constants/
│   └── Colors.ts                 # Paleta de colores de la marca
├── services/
│   ├── asignacion.service.ts     # Servicios GraphQL de asignaciones
│   └── corte.service.ts          # Servicios GraphQL de cortes
├── app.json                      # Configuracion de Expo
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Instalacion

```bash
# 1. Navega a la carpeta del proyecto
cd conveme-mobile

# 2. Instala dependencias
npx expo install

# 3. IMPORTANTE: Configura tu IP local en api/convemeApi.ts
#    Cambia 'http://192.168.1.XX:3006/graphql' por tu IP real
#    Ejemplo: 'http://192.168.1.100:3006/graphql'

# 4. Inicia el servidor de desarrollo
npx expo start

# 5. Escanea el QR con Expo Go (Android) o la camara (iOS)
```

## Configuracion de Red (IMPORTANTE)

Abre `api/convemeApi.ts` y cambia la IP placeholder:

```typescript
// ANTES (placeholder):
const API_BASE_URL = 'http://192.168.1.XX:3006/graphql';

// DESPUES (tu IP real):
const API_BASE_URL = 'http://192.168.1.100:3006/graphql';
```

Para obtener tu IP local:
- **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` (busca IPv4 Address)
- **Linux**: `hostname -I`

## Reglas de Migracion Aplicadas

| Web (React) | Mobile (React Native) |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<TouchableOpacity>` |
| `.map()` en listas | `<FlatList>` |
| `framer-motion` | Eliminado (Animated API nativa donde aplica) |
| `lucide-react` | `lucide-react-native` |
| CSS / Tailwind | `StyleSheet.create()` |
| `localStorage` | `AsyncStorage` |
| Modales con portal | `<Modal transparent={true}>` |

## Paleta de Colores

| Color | Hex | Uso |
|---|---|---|
| Fondo Morado Claro | `#f8f5ff` | Background principal |
| Azul Marino | `#1a0060` | Textos principales, bordes |
| Verde Exito | `#06d6a0` | Acciones positivas, precios |
| Morado Acento | `#cc55ff` | Acentos, vendedor |
| Rojo Peligro | `#ff5050` | Alertas, eliminar |
| Amarillo Acento | `#ffe144` | Highlights, resumen |

## Pantallas Migradas

- [x] CortesAdmin (pantalla principal con tabs Cortes/Asignaciones)
- [x] ModalAsignacion (entrega de mercancia a vendedores)
- [x] ModalCorte (conciliacion de inventario y efectivo)
- [x] ActionModal (confirmacion de eliminacion y exitos)
- [x] ModalAutorizacion (autorizacion con contrasena para diferencias)

## Proximas Pantallas a Migrar

- [ ] Login
- [ ] Inventario
- [ ] Catalogos
- [ ] DashboardHome
- [ ] POS
- [ ] Profile
