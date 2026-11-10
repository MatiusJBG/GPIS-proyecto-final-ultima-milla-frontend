import type { Route } from './route.js';

export interface DispatchInput {
  readonly routeId: string;
  readonly courierId: string;
  readonly idempotencyKey?: string | undefined;
}

export interface DispatchValidationErrors {
  readonly routeId?: string | undefined;
  readonly courierId?: string | undefined;
  readonly idempotencyKey?: string | undefined;
}

export interface DispatchValidationResult {
  readonly isValid: boolean;
  readonly errors: DispatchValidationErrors;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateDispatchInput(input: DispatchInput): DispatchValidationResult {
  const errors: Record<string, string> = {};

  const cleanRouteId = input.routeId ? input.routeId.trim() : '';
  if (!cleanRouteId) {
    errors.routeId = 'El identificador de ruta es obligatorio.';
  } else if (!UUID_REGEX.test(cleanRouteId)) {
    errors.routeId = 'El identificador de ruta debe ser un UUID válido.';
  }

  const cleanCourierId = input.courierId ? input.courierId.trim() : '';
  if (!cleanCourierId) {
    errors.courierId = 'Debes seleccionar un repartidor para el despacho.';
  } else if (!UUID_REGEX.test(cleanCourierId)) {
    errors.courierId = 'El identificador del repartidor debe ser un UUID válido.';
  }

  if (input.idempotencyKey !== undefined) {
    const cleanKey = input.idempotencyKey.trim();
    if (!cleanKey) {
      errors.idempotencyKey = 'La clave de idempotencia no puede estar vacía.';
    } else if (!UUID_REGEX.test(cleanKey)) {
      errors.idempotencyKey = 'La clave de idempotencia debe ser un UUID válido.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface DispatchResult {
  readonly route: Route;
  readonly idempotencyKey: string;
}

