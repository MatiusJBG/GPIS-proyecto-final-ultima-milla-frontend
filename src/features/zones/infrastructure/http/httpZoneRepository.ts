import { defaultHttpClient, type HttpClient } from '../../../../shared/infrastructure/http/index.js';
import type { Zone, CreateZoneInput, ZoneRepository } from '../../domain/index.js';

interface ZonesResponseWrapper {
  data?: Zone[];
  zones?: Zone[];
}

export class HttpZoneRepository implements ZoneRepository {
  constructor(private readonly httpClient: HttpClient = defaultHttpClient) {}

  public async getAll(): Promise<Zone[]> {
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
