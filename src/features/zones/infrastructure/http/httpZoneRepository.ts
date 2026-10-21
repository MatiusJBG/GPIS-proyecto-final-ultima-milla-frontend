import { defaultHttpClient, type HttpClient } from '../../../../shared/infrastructure/http/index.js';
import { hasMetadata, isRecord, readItem, readItems } from '../../../../shared/infrastructure/http/response.js';
import type { Zone, CreateZoneInput, ZoneRepository } from '../../domain/index.js';

function isZone(value: unknown): value is Zone {
  return isRecord(value) && hasMetadata(value) && typeof value.name === 'string' && value.name.trim().length > 0;
}

export class HttpZoneRepository implements ZoneRepository {
  constructor(private readonly httpClient: HttpClient = defaultHttpClient) {}

  async getAll(): Promise<Zone[]> {
    return readItems(await this.httpClient.get<unknown>('/zones'), isZone);
  }

  async create(input: CreateZoneInput): Promise<Zone> {
    return readItem(await this.httpClient.post<unknown>('/zones', { name: input.name }), isZone);
  }
}

export const defaultZoneRepository = new HttpZoneRepository();
