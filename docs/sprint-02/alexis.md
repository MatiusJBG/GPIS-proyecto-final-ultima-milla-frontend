# Sprint 02 — Consulta de detalle de pedidos

La pestaña Pedidos permite filtrar por fecha y zona, abrir el detalle y regresar conservando la consulta. La URL conserva `tab`, `deliveryDate`, `zoneId` y `orderId`, por lo que admite recarga y navegación del navegador. El detalle consulta el pedido por ID y distingue ausencia de error; la zona se obtiene del catálogo existente.

## Reproducción

Usar Node 24.11–24.x, npm 11, Docker Linux y el backend en `c8b191a1827d7ca3f38cbe324f858db8cb3d04c8`, con el paquete de base de datos original. Configurar `BACKEND_DIR`, `BACKEND_COMMIT`, `DATABASE_PACKAGE_DIR` y `E2E_REPORT_DIR=reports/sprint02/alexis`, sin versionar rutas ni secretos. Ejecutar `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build` y `npm run test:e2e:system`. El caso S2-CP-004 está en `cypress/e2e/sprint02-order-detail.cy.js`; usa la API real sin respuestas simuladas.

## Evidencia

- S2-CP-004: **Aprobado** el 03/11/2026 con Cypress 16.2.0, Electron, Node 24.19.0, Docker Linux, PostgreSQL aislado y backend `c8b191a1827d7ca3f38cbe324f858db8cb3d04c8`. Frontend: base `bd1ccfde90ac661957ab602118aa1b6c77746368` con los cambios S2 presentes sin commit durante la ejecución. Datos: zona y pedido creados por la API, fecha futura, hora 14:30 y UUID inexistente. Se esperaba y obtuvo el detalle correcto, conservación de fecha, estado y filtros tras recarga y navegación atrás/adelante, ausencia explícita y error sin datos anteriores. Resultado: 1 caso S2 aprobado; las 2 pruebas heredadas también aprobaron. El paquete SQL pasó sus verificaciones de integridad y concurrencia. Reportes locales: `reports/sprint02/alexis/acceptance.json`, `cypress-results.json` y los XML de Cypress (directorio ignorado por Git). Defectos detectados: ninguno en esta ejecución.
- S2-CP-008: **Aprobado localmente** con `npm run typecheck` y `npm run lint` (ESLint sin advertencias), Node 24.19.0 y npm 11.17.0. Base `bd1ccfde90ac661957ab602118aa1b6c77746368`, cambios S2 aún sin commit al ejecutar. Resultado esperado y obtenido: ambos comandos terminan con código 0. `npm run build` también terminó correctamente y las 39 pruebas heredadas de `npm test` pasaron. Reporte: salida local de los comandos; sin defectos detectados por estas comprobaciones. No se atribuye aprobación de CI remoto ni revisión humana.

`npm ci` informó 14 vulnerabilidades moderadas en las dependencias del frontend. El ejecutable de Cypress disponible fue verificado y usado para la prueba; no se alteró el lockfile ni se aplicaron actualizaciones fuera del alcance.
