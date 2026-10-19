import { validateZoneName, type Zone, type CreateZoneInput, type ZoneRepository } from '../domain/index.js';

export class CreateZoneUseCase {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  public async execute(input: CreateZoneInput): Promise<Zone> {
    const validation = validateZoneName(input.name);

    if (!validation.isValid) {
      throw new Error(validation.error || 'Nombre de zona inválido');
    }

    const sanitizedInput: CreateZoneInput = {
      name: input.name.trim(),
    };

    return this.zoneRepository.create(sanitizedInput);
  }
}
