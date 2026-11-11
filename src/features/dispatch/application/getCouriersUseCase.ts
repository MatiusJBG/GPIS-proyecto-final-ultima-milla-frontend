import type { Courier, CourierFilters, CourierGateway } from '../domain/index.js';

export class GetCouriersUseCase {
  constructor(private readonly gateway: CourierGateway) {}

  async execute(filters?: CourierFilters): Promise<Courier[]> {
    return this.gateway.getCouriers(filters);
  }
}

