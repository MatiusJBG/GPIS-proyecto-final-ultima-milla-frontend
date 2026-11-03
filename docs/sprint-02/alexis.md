# Sprint 02 — Consulta detallada de pedidos

La pestaña Pedidos permite filtrar por fecha y zona, abrir un detalle y volver conservando la consulta. La URL conserva la pestaña, los filtros y el pedido seleccionado para recuperar la vista al recargar y navegar. El detalle distingue carga, ausencia y error, y obtiene el nombre de zona del catálogo.

## Pruebas

- **S2-CP-004: aprobado**, 03/11/2026. Se ejecutó `cypress/e2e/sprint02-order-detail.cy.js` con Cypress 16.2.0, Electron, Node 24.19.0, Docker Linux, PostgreSQL aislado y backend `c8b191a1827d7ca3f38cbe324f858db8cb3d04c8`. La base frontend fue `83bf08d8fb6ecdfa067f4525299c0f8fd7424f91`, con los cambios de esta entrega sin commit. El caso creó una zona y pedido por API y comprobó el detalle, recarga, filtros, historial, UUID inexistente y error. Resultado: 1 caso aprobado; el paquete SQL también aprobó sus pruebas de integridad y concurrencia. Reportes locales: `reports/sprint02/clean/`. Sin defectos detectados en la ejecución final.
- **S2-CP-008: aprobado localmente** sobre los cambios de esta entrega. TypeScript y ESLint finalizaron sin errores; la compilación también pasó. Se ejecutó ESLint con la configuración existente de la revisión corregida, disponible temporalmente, pues `develop` no incluye un script de lint. Sin aprobación implícita de CI remoto ni revisión humana.

Para reproducir S2-CP-004 se necesita Node 24.11–24.x, npm 11, Cypress 16.2.0, Docker Linux, el backend indicado y el paquete DB original verificado. La ejecución usó temporalmente el harness de la revisión corregida del frontend y el harness PostgreSQL del backend, sin incluir su configuración ni dependencias en esta entrega. La base actual de `develop` no incorpora los comandos `lint` ni `test:e2e:system`; deben estar disponibles en el entorno de pruebas para repetirlos. No versionar rutas personales, reportes locales ni secretos.
