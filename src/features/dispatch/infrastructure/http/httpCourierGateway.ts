import type { HttpClient } from '../../../../shared/infrastructure/http/index.js';
import { HttpError } from '../../../../shared/infrastructure/http/httpClient.js';
import type { Courier, CourierFilters, CourierGateway } from '../../domain/index.js';
import { normalizeCourier, readItemEnvelope, readItemsEnvelope } from './response.js';

export class HttpCourierGateway implements CourierGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getCouriers(filters: CourierFilters = {}): Promise<Courier[]> {
    const query = new URLSearchParams();
    if (filters.isEnabled !== undefined) {
      query.set('isEnabled', String(filters.isEnabled));
    }

    const queryString = query.size > 0 ? `?${query.toString()}` : '';
    const payload = await this.httpClient.get<unknown>(`/couriers${queryString}`);
    const couriers = readItemsEnvelope(payload, normalizeCourier);

    if (filters.isEnabled !== undefined) {
      return couriers.filter((courier) => courier.isEnabled === filters.isEnabled);
    }

    return couriers;
  }

  async getCourierById(id: string): Promise<Courier | null> {
    try {
      const payload = await this.httpClient.get<unknown>(`/couriers/${encodeURIComponent(id)}`);
      return readItemEnvelope(payload, normalizeCourier);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

