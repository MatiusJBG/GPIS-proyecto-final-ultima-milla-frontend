import type {AssignedRoute} from '../domain/assignedRoute';
import type {AssignedRouteGateway} from '../domain/assignedRouteGateway';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidCourierIdError extends Error {
  constructor() {
    super('Ingresa un UUID válido del repartidor para consultar su ruta.');
    this.name = 'InvalidCourierIdError';
  }
}

export class GetAssignedRouteUseCase {
  constructor(private readonly gateway: AssignedRouteGateway) {}

  async execute(courierId: string): Promise<AssignedRoute | null> {
    const normalizedCourierId = courierId.trim();
    if (!UUID_PATTERN.test(normalizedCourierId)) {
      throw new InvalidCourierIdError();
    }
    return this.gateway.getAssignedRoute(normalizedCourierId);
  }
}
