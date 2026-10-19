import type { Zone, CreateZoneInput } from './zone.js';

export interface ZoneRepository {
  getAll(): Promise<Zone[]>;
  create(input: CreateZoneInput): Promise<Zone>;
}
