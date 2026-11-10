# Sprint 3 · Matías · Aplicación Android de consulta de ruta

## Alcance implementado

La aplicación nativa está en `mobile/` y es independiente de la aplicación React web ubicada en la raíz. Consulta únicamente `GET /couriers/{id}/route`; muestra ruta, paradas ordenadas, carga, falta de ruta y error controlado. No crea pedidos, reasigna rutas, cambia estados, usa GPS/mapas, almacena secretos ni reemplaza la autorización del backend.

La estructura respeta Clean Architecture:

- `mobile/src/features/assigned-route/domain`: modelo y puerto.
- `mobile/src/features/assigned-route/application`: caso de uso y validación de UUID de borde.
- `mobile/src/features/assigned-route/infrastructure/http`: adaptador HTTP y validación del contrato recibido.
- `mobile/src/features/assigned-route/presentation`: pantalla y estado de consulta.
- `mobile/src/bootstrap`: composición de las dependencias.

## Versiones fijadas

| Componente | Versión |
|---|---|
| React Native | 0.84.1 |
| React | 19.2.3 |
| Detox | 20.51.4 |
| Node | >= 22.11.0 |

La versión de React Native elegida está dentro del rango oficialmente compatible de Detox (0.77–0.84). La máquina de desarrollo debe tener Android Studio, SDK Android, `adb`, un AVD y JDK 17 configurados. JDK superiores pueden requerir compatibilidad adicional del Gradle.

## Preparación de la API real

Antes de la prueba, recibir la revisión S2 de Couriers, su contrato y el paquete PostgreSQL autorizado. Preparar en un entorno aislado un repartidor fixture con una ruta asignada; no usar datos de desarrollo. Arrancar la API Couriers por HTTP y registrar su SHA.

Desde un emulador Android, `localhost` no representa al equipo anfitrión. Para el emulador oficial usar `http://10.0.2.2:3012` o configurar redirección ADB equivalente. El tráfico HTTP de esa dirección solo se habilita en el manifiesto de depuración y pruebas.

## Comandos

Desde `frontend/mobile`:

```powershell
npm ci
npm run typecheck
npm run lint
npm run build:android:test
```

Para ejecutar el caso de sistema S3-CP-005, definir los datos reales y ejecutar desde la raíz del repositorio frontend:

```powershell
$env:BACKEND_COURIERS_DIR = 'C:\ruta\backend-couriers-s2'
$env:BACKEND_COURIERS_COMMIT = 'SHA-completo-de-couriers-s2'
$env:DATABASE_PACKAGE_DIR = 'C:\ruta\paquete-db'
$env:MOBILE_COURIERS_API_URL = 'http://10.0.2.2:3012'
$env:MOBILE_DEMO_COURIER_ID = 'uuid-del-repartidor-fixture'
$env:DETOX_AVD_NAME = 'nombre-del-avd-instalado'
node scripts/sprint03/mobile-system.mjs
```

El runner verifica los artefactos/commit recibidos y lanza Detox; la API Couriers y PostgreSQL deben estar levantados por el harness S2 autorizado antes de ejecutarlo. No fabrica datos, migraciones ni mocks.

## Evidencia y estado actual

No existe una prueba unitaria en el proyecto móvil. El único caso automatizado creado es `mobile/e2e/assigned-route.e2e.js`, correspondiente a la prueba de sistema móvil contra API/DB reales.

Registrar para cada ejecución: SHA frontend, SHA Couriers, hash del paquete DB, entorno/AVD, repartidor fixture, resultado esperado/obtenido y evidencia. Si falta Android SDK, AVD, API o datos reales, S3-CP-005 queda **Bloqueado**, no aprobado.
