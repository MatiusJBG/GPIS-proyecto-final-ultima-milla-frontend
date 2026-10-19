import type { Zone, ZoneRepository } from '../domain/index.js';

export class GetZonesUseCase {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  public execute(): Promise<Zone[]> {
    return this.zoneRepository.getAll();
  }
}
