import {
  defaultHttpClient,
  HttpError,
  type HttpClient,
} from '../../../../shared/infrastructure/http/index.js';
import type { Zone, CreateZoneInput, ZoneRepository } from '../../domain/index.js';

interface ZonesResponseWrapper {
  data?: Zone[];
  zones?: Zone[];
}

export class HttpZoneRepository implements ZoneRepository {
  constructor(private readonly httpClient: HttpClient = defaultHttpClient) {}

  public async getAll(): Promise<Zone[]> {
    try {
      const response = await this.httpClient.get<Zone[] | ZonesResponseWrapper>('/zones');

      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      if (response && Array.isArray(response.zones)) {
        return response.zones;
      }

      return [];
    } catch (error) {
      // Manejo resiliente: si la ruta no existe en el backend (404), retornamos lista vacía sin romper la UI
      if (error instanceof HttpError && error.status === 404) {
        return [];
      }

      throw error;
    }
  }

  public async create(input: CreateZoneInput): Promise<Zone> {
    const payload = {
      name: input.name,
    };

    const response = await this.httpClient.post<Zone | { data: Zone }>('/zones', payload);

    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return response.data;
    }

    return response as Zone;
  }
}

export const defaultZoneRepository = new HttpZoneRepository();
