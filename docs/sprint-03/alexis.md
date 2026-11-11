# Sprint 03 · Alexis López · Submódulo de Despacho (Dispatch)

## 1. Alcance Implementado

En este Sprint se desarrolló el submódulo web de **Despacho (Dispatch)**, dando cobertura integral a las historias de usuario **HU-DES-01** y **HU-DES-02**:

- **HU-DES-01 (Consulta de Rutas para Despacho):**
  - Panel visual de despacho con filtros sincronizados por fecha de servicio (`serviceDate`) y zona geográfica (`zoneId`), preservados bidireccionalmente en la URL (`/?tab=dispatch&serviceDate=...&zoneId=...`).
  - Listado de rutas con indicación clara de estado (`planificada`, `asignada`, `en_curso`, etc.), capacidad ocupada vs. límite, repartidor asignado y desglose secuencial de paradas de entrega con dirección y hora.
  - Manejo integral de estados de carga (`Spinner`), vacío (`EmptyState`) y error controlado (`Alert`).

- **HU-DES-02 (Asignación Idempotente a Repartidores):**
  - Diálogo modal accesible (`DispatchModal`) para asignar un repartidor activo a una ruta planificada.
  - Consulta en tiempo real de repartidores habilitados (`GET /couriers?isEnabled=true`) con validación de capacidad del vehículo respecto al número de paradas.
  - Envío de clave de idempotencia UUID v4 en la cabecera `Idempotency-Key` para evitar dobles asignaciones o estados inconsistentes por reintentos de red.
  - Manejo adecuado de conflictos `409` (`DATA_CONFLICT`) cuando el repartidor ya cuenta con una ruta activa o la ruta ya fue previamente despachada.
  - Actualización reactiva de la interfaz y persistencia confirmada tras recarga de página.

---

## 2. Clean Architecture y Estructura del Código

El desarrollo se limitó estrictamente a los archivos asignados para Alexis López, sin tocar el backend, la aplicación móvil de Matías (`mobile/**`), componentes compartidos globales (`shared/ui/**`), `package.json` ni lockfiles:

- `src/features/dispatch/domain`: Entidades puras (`Route`, `RouteStop`, `Courier`), tipos de estado, reglas de validación (`validateDispatchInput`) y puertos (`RouteGateway`, `CourierGateway`).
- `src/features/dispatch/application`: Casos de uso `GetRoutesUseCase`, `GetCouriersUseCase` y `DispatchRouteUseCase` (con generación de UUID para idempotencia).
- `src/features/dispatch/infrastructure/http`: Adaptadores `HttpRouteGateway` y `HttpCourierGateway`, consumiendo las APIs congeladas de Sprint 2 mediante el cliente HTTP canónico (`FetchHttpClient`) y validación rigurosa de respuestas (`response.ts`).
- `src/features/dispatch/presentation`: Vistas y componentes React (`DispatchManagementView`, `RouteList`, `DispatchModal`), hook `useDispatch` y estilos CSS modulares.
- `src/bootstrap`: Composición limpia en `compose-use-cases.ts` y cableado de navegación con pestaña "Despacho" en `app.tsx`.

---

## 3. Verificaciones de Calidad

| Verificación | Resultado | Detalle |
|---|---|---|
| `npm run typecheck` | **Aprobado (exit 0)** | TypeScript compila sin errores en modo estricto. |
| `npm run build` | **Aprobado (exit 0)** | Vite empaqueta 90 módulos para producción sin advertencias. |
| S3-CP-004 (Cypress) | **Diseñado y preparado** | Caso E2E completo en `cypress/e2e/sprint03-dispatch.cy.js` contra APIs y DB reales. |
| Orquestador de Sistema | **Implementado** | `scripts/sprint03/dispatch-system.mjs` con validación de entorno y dependencias congeladas. |

---

## 4. Instrucciones de Reproducción (S3-CP-004)

### 4.1. Requisitos
- Node.js >= 24.11.0, npm >= 11.
- PostgreSQL con el esquema y paquete DB verificado (`DATABASE_PACKAGE_DIR`).
- APIs del backend S2 de Routes y Couriers levantadas.

### 4.2. Ejecución Local

1. Comprobar tipado y empaquetado:
```powershell
npm run typecheck
npm run build
```

2. Ejecutar la prueba de sistema orquestada:
```powershell
$env:DATABASE_PACKAGE_DIR = 'C:\ruta\al\paquete-db'
$env:VITE_ROUTES_API_BASE_URL = 'http://127.0.0.1:3000'
$env:VITE_COURIERS_API_BASE_URL = 'http://127.0.0.1:3000'
node scripts/sprint03/dispatch-system.mjs
```

El script verifica los artefactos requeridos, inicia el servidor frontend y lanza la suite de Cypress para validar el flujo E2E contra la base de datos real.

