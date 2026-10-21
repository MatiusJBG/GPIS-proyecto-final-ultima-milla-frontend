import type { GetZonesUseCase } from './getZonesUseCase.js';
import type { CreateZoneUseCase } from './createZoneUseCase.js';

export interface ZoneUseCases {
  getZones: Pick<GetZonesUseCase, 'execute'>;
  registerZone: Pick<CreateZoneUseCase, 'execute'>;
}
