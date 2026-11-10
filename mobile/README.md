# Última Milla · Aplicación móvil

Aplicación React Native Android para que un repartidor consulte su ruta asignada y sus paradas. Es una aplicación separada de la web ubicada en la raíz del repositorio; conserva su propio `package.json` y lockfile.

La guía de reproducción, entorno y prueba Detox está en [docs/sprint-03/matias/REPRODUCCION_MOVIL.md](../docs/sprint-03/matias/REPRODUCCION_MOVIL.md).

```powershell
npm ci
npm run typecheck
npm run lint
npm start
```

No se incluyen pruebas unitarias. La prueba automatizada es de sistema móvil con Detox y requiere una API Couriers S2 y PostgreSQL reales.
