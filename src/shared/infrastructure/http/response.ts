export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function hasMetadata(value: Record<string, unknown>): boolean {
  return isUuid(value.id) && [value.createdAt, value.updatedAt].every(
    date => typeof date === 'string' && /^\d{4}-\d\d-\d\dT/.test(date) && date.endsWith('Z') && Number.isFinite(Date.parse(date)),
  );
}

export function readItem<T>(value: unknown, isItem: (item: unknown) => item is T): T {
  if (!isItem(value)) throw new Error('La respuesta del servidor no cumple el contrato de la API.');
  return value;
}

export function readItems<T>(value: unknown, isItem: (item: unknown) => item is T): T[] {
  if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(isItem)) {
    throw new Error('La respuesta del servidor no cumple el contrato de la API.');
  }
  return value.items;
}
