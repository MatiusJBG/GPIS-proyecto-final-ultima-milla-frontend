import type {AssignedRoute, AssignedRouteStop} from '../../domain/assignedRoute';
import type {AssignedRouteGateway} from '../../domain/assignedRouteGateway';

const REQUEST_TIMEOUT_MS = 10_000;

export class AssignedRouteRequestError extends Error {
  constructor(
    readonly code: 'COURIER_NOT_FOUND' | 'NETWORK' | 'INVALID_RESPONSE' | 'SERVER',
    message: string,
  ) {
    super(message);
    this.name = 'AssignedRouteRequestError';
  }
}

export class HttpAssignedRouteGateway implements AssignedRouteGateway {
  constructor(private readonly baseUrl: string) {}

  async getAssignedRoute(courierId: string): Promise<AssignedRoute | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(
        `${this.baseUrl}/couriers/${encodeURIComponent(courierId)}/route`,
        {headers: {Accept: 'application/json'}, signal: controller.signal},
      );
      if (response.status === 404) {
        throw new AssignedRouteRequestError('COURIER_NOT_FOUND', 'El repartidor no existe o no está disponible para la demostración.');
      }
      if (!response.ok) {
        throw new AssignedRouteRequestError('SERVER', 'No fue posible consultar la ruta. Inténtalo nuevamente.');
      }
      return parseEnvelope(await readJson(response));
    } catch (error) {
      if (error instanceof AssignedRouteRequestError) {
        throw error;
      }
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'La consulta excedió el tiempo de espera. Verifica la conexión y reintenta.'
        : 'No se pudo conectar con el servicio de repartidores.';
      throw new AssignedRouteRequestError('NETWORK', message);
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AssignedRouteRequestError('INVALID_RESPONSE', 'El servicio respondió con un formato no reconocido.');
  }
}

function parseEnvelope(payload: unknown): AssignedRoute | null {
  if (!isRecord(payload) || !('item' in payload)) throw invalidResponse();
  if (payload.item === null) return null;
  if (!isRecord(payload.item)) throw invalidResponse();
  const route = payload.item;
  const stops = route.stops;
  if (!Array.isArray(stops)) throw invalidResponse();
  const parsedStops: AssignedRouteStop[] = stops.map(parseStop);
  return {
    routeId: requiredString(route, 'routeId'),
    zoneId: requiredString(route, 'zoneId'),
    serviceDate: requiredString(route, 'serviceDate'),
    status: requiredString(route, 'status'),
    stops: parsedStops.sort((left, right) => left.position - right.position),
  };
}

function parseStop(stop: unknown): AssignedRouteStop {
  if (!isRecord(stop) || typeof stop.position !== 'number' || !Number.isInteger(stop.position)) throw invalidResponse();
  const deliveryTime = stop.deliveryTime;
  if (deliveryTime !== null && typeof deliveryTime !== 'string') throw invalidResponse();
  return {
    orderId: requiredString(stop, 'orderId'),
    position: stop.position,
    deliveryAddress: requiredString(stop, 'deliveryAddress'),
    deliveryTime,
    status: requiredString(stop, 'status'),
  };
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') throw invalidResponse();
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function invalidResponse(): AssignedRouteRequestError {
  return new AssignedRouteRequestError('INVALID_RESPONSE', 'El servicio respondió con un formato no reconocido.');
}
