export interface Zone {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneInput {
  name: string;
}

export interface ZoneValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Regla de negocio para Zonas:
 * Una zona válida requiere un nombre no vacío (rechazar espacios vacíos o cadenas vacías).
 */
export function validateZoneName(name: string): ZoneValidationResult {
  if (typeof name !== 'string') {
    return {
      isValid: false,
      error: 'El nombre de la zona debe ser un texto.',
    };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El nombre de la zona no puede estar vacío ni contener solo espacios.',
    };
  }

  return { isValid: true };
}
