# Web de logística de última milla

Aplicación React independiente del repositorio API. `src/bootstrap` monta la interfaz y será el composition root para inyectar gateways. `shared/infrastructure/http` será el único cliente HTTP; `shared/ui` alojará los componentes y tokens compartidos.

## Versiones fijadas

- Node.js 24.11.0 (`.nvmrc`) y npm 11.
- React y React DOM 19.3.0.
- Vite 8.3.2 con `@vitejs/plugin-react` 6.1.1.
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

La aplicación de desarrollo usa `127.0.0.1:5173` y la vista previa `127.0.0.1:4173`; ambas requieren el puerto libre. Vite carga `VITE_API_BASE_URL` desde `.env`, con valor de ejemplo `http://localhost:3000`. Nunca pongas credenciales en variables `VITE_*`.
