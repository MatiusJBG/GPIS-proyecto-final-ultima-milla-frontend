import type { Route, RouteStatus, RouteStop } from '../../domain/route.js';
import type { Courier } from '../../domain/courier.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

const VALID_ROUTE_STATUSES = new Set<RouteStatus>([
  'planificada',
  'asignada',
  'en_curso',
  'completada',
  'cancelada',
]);

export function normalizeStop(raw: unknown): RouteStop {
  if (!isRecord(raw)) throw new Error('Parada con formato incompatible.');

  const orderId = String(raw.orderId ?? raw.order_id ?? '');
  if (!isUuid(orderId)) throw new Error('El orderId de la parada no es un UUID válido.');

  const position = Number(raw.position ?? 0);
  const deliveryAddress = String(raw.deliveryAddress ?? raw.delivery_address ?? '');
  const rawTime = raw.deliveryTime ?? raw.delivery_time;
  const deliveryTime = typeof rawTime === 'string' ? rawTime : null;
  const status = String(raw.status ?? 'pendiente');

  return {
    orderId,
    position,
    deliveryAddress,
    deliveryTime,
    status,
  };
}

export function normalizeRoute(raw: unknown): Route {
  if (!isRecord(raw)) throw new Error('Ruta con formato incompatible.');

  const id = String(raw.id ?? raw.routeId ?? raw.route_id ?? '');
  if (!isUuid(id)) throw new Error('El identificador de la ruta no es un UUID válido.');

  const zoneId = String(raw.zoneId ?? raw.zone_id ?? '');
  if (!isUuid(zoneId)) throw new Error('El zoneId de la ruta no es un UUID válido.');

  const rawDate = String(raw.serviceDate ?? raw.service_date ?? '');
  const serviceDate = rawDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
    throw new Error('La fecha de servicio de la ruta debe tener formato AAAA-MM-DD.');
  }

  const rawCapacity = Number(raw.capacityLimit ?? raw.capacity_limit ?? raw.capacity ?? 4);
  const capacityLimit = Number.isFinite(rawCapacity) && rawCapacity > 0 ? rawCapacity : 4;

  const rawCourierId = raw.courierId ?? raw.courier_id;
  const courierId = typeof rawCourierId === 'string' && isUuid(rawCourierId) ? rawCourierId : null;

  const rawStatus = String(raw.status ?? 'planificada') as RouteStatus;
  const status: RouteStatus = VALID_ROUTE_STATUSES.has(rawStatus) ? rawStatus : 'planificada';

  const rawStops = Array.isArray(raw.stops) ? raw.stops : [];
  const stops = rawStops.map(normalizeStop).sort((a, b) => a.position - b.position);

  const zoneName = typeof raw.zoneName === 'string' ? raw.zoneName : undefined;
  const courierName = typeof raw.courierName === 'string' ? raw.courierName : undefined;
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : undefined;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined;

  return {
    id,
    zoneId,
    serviceDate,
    capacityLimit,
    courierId,
    status,
    stops,
    zoneName,
    courierName,
    createdAt,
    updatedAt,
  };
}

export function normalizeCourier(raw: unknown): Courier {
  if (!isRecord(raw)) throw new Error('Repartidor con formato incompatible.');

  const id = String(raw.id ?? raw.courierId ?? raw.courier_id ?? '');
  if (!isUuid(id)) throw new Error('El identificador del repartidor no es un UUID válido.');

  const name = String(raw.name ?? raw.nombre ?? '').trim();
  if (!name) throw new Error('El nombre del repartidor no puede estar vacío.');

  const rawMax = Number(raw.maxOrdersPerTrip ?? raw.max_orders_per_trip ?? raw.capacity ?? 4);
  const maxOrdersPerTrip = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 4;

  const isEnabled = raw.isEnabled !== undefined
    ? Boolean(raw.isEnabled)
    : raw.is_enabled !== undefined
      ? Boolean(raw.is_enabled)
      : true;

  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : undefined;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined;

  return {
    id,
    name,
    maxOrdersPerTrip,
    isEnabled,
    createdAt,
    updatedAt,
  };
}

export function readItemEnvelope<T>(payload: unknown, parser: (raw: unknown) => T): T {
  if (isRecord(payload) && 'item' in payload && payload.item !== undefined) {
    return parser(payload.item);
  }
  return parser(payload);
}

export function readItemsEnvelope<T>(payload: unknown, parser: (raw: unknown) => T): T[] {
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items.map(parser);
  }
  if (Array.isArray(payload)) {
    return payload.map(parser);
  }
  throw new Error('La respuesta del servidor no contiene una colección válida.');
}

