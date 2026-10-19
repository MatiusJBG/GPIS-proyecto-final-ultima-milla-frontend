export type OrderStatus = 'pendiente' | 'en_camino' | 'entregado' | 'cancelado' | string;

export interface Order {
  id: string;
  zoneId: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  zoneName?: string | undefined;
}

export interface CreateOrderInput {
  zoneId: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
}

export interface OrderValidationErrors {
  zoneId?: string | undefined;
  deliveryAddress?: string | undefined;
  deliveryDate?: string | undefined;
  deliveryTime?: string | undefined;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: OrderValidationErrors;
}

/**
 * Reglas de negocio para Pedidos:
 * - zoneId: obligatorio y no vacío.
 * - deliveryAddress: obligatoria, no vacía tras trim, mínimo 5 caracteres.
 * - deliveryDate: formato YYYY-MM-DD y fecha válida.
 * - deliveryTime: formato HH:mm (00:00 - 23:59).
 * - Nota: El cliente web NO define 'status', 'id' ni 'createdAt' (responsabilidad del backend).
 */
export function validateOrder(input: CreateOrderInput): OrderValidationResult {
  const errors: OrderValidationErrors = {};

  const trimmedZoneId = input.zoneId ? input.zoneId.trim() : '';
  if (!trimmedZoneId) {
    errors.zoneId = 'Debes seleccionar una zona de cobertura obligatoriamente.';
  }

  const trimmedAddress = input.deliveryAddress ? input.deliveryAddress.trim() : '';
  if (!trimmedAddress) {
    errors.deliveryAddress = 'La dirección de entrega no puede estar vacía.';
  } else if (trimmedAddress.length < 5) {
    errors.deliveryAddress = 'La dirección de entrega debe ser descriptiva (mínimo 5 caracteres).';
  } else if (trimmedAddress.length > 150) {
    errors.deliveryAddress = 'La dirección de entrega no puede exceder 150 caracteres.';
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!input.deliveryDate || !datePattern.test(input.deliveryDate)) {
    errors.deliveryDate = 'La fecha de entrega debe tener un formato válido (AAAA-MM-DD).';
  } else {
    const parsedDate = new Date(`${input.deliveryDate}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      errors.deliveryDate = 'La fecha ingresada no es una fecha válida en el calendario.';
    }
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!input.deliveryTime || !timePattern.test(input.deliveryTime)) {
    errors.deliveryTime = 'La hora de entrega debe tener un formato válido de 24 horas (HH:mm).';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
  };
}
