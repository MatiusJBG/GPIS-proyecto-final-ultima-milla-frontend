import type { HttpClient } from '../../../../shared/infrastructure/http/index.js';
import type { Zone, ZoneRepository, CreateZoneInput } from '../../../zones/domain/index.js';

export class HttpOrderZoneCatalog implements ZoneRepository {
  constructor(private readonly client: HttpClient) {}

  async getAll(): Promise<Zone[]> {
    const result = await this.client.get<unknown>('/zones');
    if (!result || typeof result !== 'object' || !('items' in result) || !Array.isArray(result.items)) {
      throw new Error('La respuesta de zonas no cumple el contrato de la API.');
    }
    return result.items as Zone[];
  }

  async create(input: CreateZoneInput): Promise<Zone> {
    return this.client.post<Zone>('/zones', input);
  }
}
