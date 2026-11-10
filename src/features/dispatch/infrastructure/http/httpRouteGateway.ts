import type { HttpClient } from '../../../../shared/infrastructure/http/index.js';
import { HttpError } from '../../../../shared/infrastructure/http/httpClient.js';
import type { Route, RouteFilters, RouteGateway } from '../../domain/index.js';
import { normalizeRoute, readItemEnvelope, readItemsEnvelope } from './response.js';

export class HttpRouteGateway implements RouteGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getRoutes(filters: RouteFilters = {}): Promise<Route[]> {
    const query = new URLSearchParams();
    if (filters.serviceDate) query.set('serviceDate', filters.serviceDate);
    if (filters.zoneId) query.set('zoneId', filters.zoneId);
    if (filters.status) query.set('status', filters.status);

    const queryString = query.size > 0 ? `?${query.toString()}` : '';
    const payload = await this.httpClient.get<unknown>(`/routes${queryString}`);
    return readItemsEnvelope(payload, normalizeRoute);
  }

  async getRouteById(id: string): Promise<Route | null> {
    try {
      const payload = await this.httpClient.get<unknown>(`/routes/${encodeURIComponent(id)}`);
      return readItemEnvelope(payload, normalizeRoute);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async dispatchRoute(routeId: string, courierId: string, idempotencyKey: string): Promise<Route> {
    try {
      const payload = await this.httpClient.post<unknown>(
        `/routes/${encodeURIComponent(routeId)}/dispatch`,
        { courierId },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        },
      );
      return readItemEnvelope(payload, normalizeRoute);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 409) {
          throw new Error(
            'Conflicto al despachar la ruta: el repartidor ya tiene una ruta asignada o la ruta ya fue despachada previamente.',
            { cause: error },
          );
        }
        if (error.status === 404) {
          throw new Error('La ruta o el repartidor seleccionado no existe en el sistema.', { cause: error });
        }
        if (error.status === 400) {
          throw new Error(`Datos de despacho no válidos: ${error.message}`, { cause: error });
        }
      }
      throw error;
    }
  }
}

