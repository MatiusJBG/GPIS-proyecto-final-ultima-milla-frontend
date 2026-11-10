# Contrato de Consumo · Submódulo de Despacho (Sprint 3)

**Responsable:** Alexis López  
**Historias de Usuario:** HU-DES-01 (Consulta de rutas para despacho) y HU-DES-02 (Asignación idempotente de repartidor)  
**Entorno y Protocolo:** HTTP/REST JSON, UTF-8  

---

## 1. Alcance y Fronteras Arquitectónicas

El submódulo web de Despacho (`src/features/dispatch/**`) implementa de forma aislada la gestión de rutas y asignación a repartidores para el Sprint 3.

### Regla Estricta de No Consumo de Endpoints S3 Ajenos
En cumplimiento de las directivas de integración del proyecto, el frontend de Despacho **NO consume ningún endpoint en desarrollo del Sprint 3 de otros compañeros**:
- ❌ No consume `route-moves` (movimiento de pedidos entre rutas).
- ❌ No consume `late-order-placements` (inserción de pedidos tardíos).
- ❌ No consume `delivery-status-changes` (cambio de estado de entregas individuales).
- ❌ No consume `route-completions` (finalización/cierre de rutas).

El módulo opera **exclusivamente** sobre los contratos y servicios congelados del **Sprint 2**:
- **API Routes (S2):** mediante la variable de entorno `VITE_ROUTES_API_BASE_URL` (con fallback a `VITE_API_BASE_URL`).
- **API Couriers (S2):** mediante la variable de entorno `VITE_COURIERS_API_BASE_URL` (con fallback a `VITE_API_BASE_URL`).

---

## 2. API Routes (Sprint 2)

### 2.1. Listar rutas (`GET /routes`)
Permite consultar las rutas programadas filtradas por fecha de servicio, zona o estado.

- **Query Parameters:**
  - `serviceDate` (string, opcional): Fecha en formato `YYYY-MM-DD` (América/Guayaquil).
  - `zoneId` (UUID, opcional): Identificador de la zona geográfica.
  - `status` (string, opcional): Estado de la ruta (`planificada`, `asignada`, `en_curso`, `completada`, `cancelada`).
- **Respuesta Canónica (200 OK):**
```json
{
  "items": [
    {
      "id": "71000000-0000-4000-8000-000000000001",
      "zoneId": "10000000-0000-4000-8000-000000000001",
      "serviceDate": "2026-11-13",
      "capacityLimit": 4,
      "courierId": null,
      "status": "planificada",
      "stops": [
        {
          "orderId": "91000000-0000-4000-8000-000000000001",
          "position": 1,
          "deliveryAddress": "Av. 9 de Octubre 123",
          "deliveryTime": "11:00",
          "status": "pendiente"
        }
      ]
    }
  ]
}
```

### 2.2. Detalle de ruta (`GET /routes/{id}`)
- **Parámetros de Ruta:** `id` (UUID).
- **Respuestas:**
  - `200 OK`: Devuelve el sobre `{ item: Route }` o el objeto `Route`.
  - `404 Not Found`: Si la ruta no existe (el cliente HTTP retorna `null`).

### 2.3. Despachar / Asignar repartidor (`POST /routes/{id}/dispatch`)
Permite asignar un repartidor activo a una ruta planificada con garantía de idempotencia.

- **Headers Requeridos:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Idempotency-Key: <UUID-v4>`: Identificador único generado por el cliente web para asegurar que peticiones repetidas o fallos de conexión no originen doble despacho.
- **Cuerpo de Solicitud:**
```json
{
  "courierId": "81000000-0000-4000-8000-000000000001"
}
```
- **Respuestas:**
  - `200 OK` / `201 Created`: Ruta despachada con éxito. El estado cambia a `asignada` y `courierId` queda fijado.
  - `400 Bad Request`: `VALIDATION_ERROR` si los identificadores son inválidos o la cantidad de pedidos de la ruta supera `maxOrdersPerTrip` del repartidor.
  - `404 Not Found`: Si la ruta o el repartidor no existen.
  - `409 Conflict`: `DATA_CONFLICT` si la ruta ya está asignada, o si el repartidor ya posee otra salida activa (`asignada` o `en_curso`), en concordancia con el índice `routes_one_active_courier_idx` de la base de datos.
  - `500 Internal Error` / `503 Service Unavailable`: Errores de transporte o base de datos.

---

## 3. API Couriers (Sprint 2)

### 3.1. Listar repartidores (`GET /couriers`)
Permite obtener los repartidores disponibles en el sistema para presentarlos en el selector de despacho.

- **Query Parameters:**
  - `isEnabled` (boolean, opcional): `true` para filtrar únicamente repartidores habilitados.
- **Respuesta Canónica (200 OK):**
```json
{
  "items": [
    {
      "id": "81000000-0000-4000-8000-000000000001",
      "name": "Carlos Mendoza",
      "maxOrdersPerTrip": 5,
      "isEnabled": true
    }
  ]
}
```

---

## 4. Manejo de Claves de Idempotencia (UUID)

1. **Generación:** En `DispatchRouteUseCase`, si el llamador no provee una clave explícita, se genera un UUID v4 mediante `crypto.randomUUID()` en el navegador.
2. **Propagación:** El adaptador `HttpRouteGateway` inyecta la clave en la cabecera HTTP `Idempotency-Key`.
3. **Consistencia:** Si se reintenta el despacho con los mismos parámetros y la misma clave, el backend responde con el resultado previo sin alterar el estado del sistema. Si se cambian los parámetros bajo la misma clave, el backend responderá con conflicto `409`.

