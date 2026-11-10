import {
  validateDispatchInput,
  type DispatchInput,
  type DispatchResult,
  type RouteGateway,
} from '../domain/index.js';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export class DispatchRouteUseCase {
  constructor(private readonly gateway: RouteGateway) {}

  async execute(input: DispatchInput): Promise<DispatchResult> {
    const validation = validateDispatchInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] ?? 'Datos de despacho inválidos.';
      throw new Error(firstError);
    }

    const idempotencyKey = input.idempotencyKey && input.idempotencyKey.trim() !== ''
      ? input.idempotencyKey.trim()
      : generateUuid();

    const route = await this.gateway.dispatchRoute(input.routeId, input.courierId, idempotencyKey);

    return {
      route,
      idempotencyKey,
    };
  }
}

