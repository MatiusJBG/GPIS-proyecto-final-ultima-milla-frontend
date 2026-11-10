# Validación local · Sprint 3 · Matías

**Fecha:** 09/11/2026

| Verificación | Resultado | Evidencia |
|---|---|---|
| `npm run typecheck` | Aprobado | TypeScript terminó con código 0. |
| `npm run lint` | Aprobado | ESLint terminó con código 0, sin errores ni avisos. |
| `npm run build:android:test` | Bloqueado | Gradle configuró React Native/Detox, pero no encontró `ANDROID_HOME` ni `android/local.properties`; no generó APK. |
| S3-CP-005 · Detox | Bloqueado | Sin SDK Android/ADB/AVD y sin API Couriers S2/PostgreSQL real disponible para la ejecución. |

No hay pruebas unitarias en la aplicación. La prueba automatizada incluida es `mobile/e2e/assigned-route.e2e.js` y solo puede ejecutarse mediante Detox contra el backend S2 y la base de datos reales.

## Acción necesaria para desbloquear

1. Instalar Android Studio con SDK Android y crear un AVD.
2. Configurar `ANDROID_HOME` y agregar `platform-tools` y `emulator` al `Path`.
3. Usar JDK 17 para la construcción Android, o validar explícitamente una combinación de Gradle compatible con otro JDK.
4. Recibir la API Couriers S2, sus SHA/fixtures y PostgreSQL real; ejecutar el runner documentado con esas revisiones.
