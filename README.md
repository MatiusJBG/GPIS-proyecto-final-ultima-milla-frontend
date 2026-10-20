# Web de logística de última milla

Aplicación React independiente del repositorio API. `src/bootstrap` monta la interfaz y construye los gateways que reciben las vistas. `shared/infrastructure/http` es el único cliente HTTP; `shared/ui` aloja los componentes y tokens compartidos.

## Versiones fijadas

- Node.js 24.11.0 (`.nvmrc`) y npm 11.
- React y React DOM 19.3.0.
- Vite 8.3.4 con `@vitejs/plugin-react` 6.1.1.
- TypeScript 6.0.3.

El `package-lock.json` de este repositorio fija sus dependencias, separado del lockfile del backend.

## Estructura

```text
src/
  bootstrap/                     entrada React y composition root
  shared/ui/                     componentes y tokens únicos
  shared/infrastructure/http/    cliente HTTP único
  features/zones/{domain,application,infrastructure/http,presentation}/
  features/orders/               las mismas capas para pedidos
```

`index.html` y Vite apuntan a `src/bootstrap/main.tsx`. No hay componentes de demostración de Vite ni llamadas HTTP desde la UI.

## Comandos

```powershell
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

La aplicación de desarrollo usa `127.0.0.1:5173` y la vista previa `127.0.0.1:4173`; ambas requieren el puerto libre. Vite carga `VITE_API_BASE_URL` desde `.env`, con valor de ejemplo `http://127.0.0.1:3000`. Nunca pongas credenciales en variables `VITE_*`.

## Revisión y pruebas

```powershell
npm ci
npm run lint
npm test
npm run typecheck
npm run build
```

La suite usa HTTP local real para los adaptadores y DOM simulado para React. Comprueba el contrato canónico `{ items }`, fallos 404/500/503, respuestas inválidas, carreras de recarga, filtros, validación de calendario y timeout HTTP. No sustituye la prueba de sistema con persistencia. Las peticiones tienen un límite de espera de 15 s; una escritura sin confirmación exige consultar antes de reintentar. No se reintentan altas automáticamente.

El contrato consumido y su commit/hash están en [docs/contracts](docs/contracts/README.md). Los gateways se construyen en bootstrap; las vistas reciben puertos tipados. No requieren migración de datos estos cambios de cliente.

### CP-015 con Cypress y persistencia real

Preparar una base aislada mediante el manual de DB y arrancar la API con el rol `logistica_app` contra esa base. Configurar `WEB_ORIGIN=http://127.0.0.1:5173` en backend y `VITE_API_BASE_URL=http://127.0.0.1:3000` en frontend. Arrancar `npm run dev` en ambos repositorios. La API debe exponer `/zones` y `/orders`; `/health` por sí solo no confirma DB.

En otra terminal frontend:

```powershell
npx cypress install
$env:E2E_API_URL='http://127.0.0.1:3000'
npm run test:e2e
```

Cypress registra datos con prefijo E2E en la base de pruebas elegida, sin limpiar datos de desarrollo. Ejecuta altas de zona/pedido, recarga, lectura persistida, filtros y validación de nombre vacío. `E2E_API_URL` debe coincidir con `VITE_API_BASE_URL`. Los interceptores observan solicitudes; no simulan respuestas. CI omite descargar el binario de Cypress porque su job actual ejecuta regresiones HTTP/DOM. El recorrido real se ejecuta por separado cuando API/PostgreSQL estén activos.

### Sonar y pre-merge

`sonar-project.properties` define fuentes y pruebas frontend. El servidor/scanner debe configurarse externamente y el token nunca se incorpora a variables `VITE_*`. Guardar resultado, puerta de calidad y SHA analizado de ambos repositorios. No existe evidencia nueva de Sonar ni de Cypress en esta revisión. Consultar el [informe](docs/reviews/2026-10-20.md).
