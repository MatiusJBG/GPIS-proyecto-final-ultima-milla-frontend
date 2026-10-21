import { defaultHttpClient, type HttpClient } from '../../../../shared/infrastructure/http/index.js';
import { hasMetadata, isRecord, isUuid, readItem, readItems } from '../../../../shared/infrastructure/http/response.js';
import { validateOrder, type Order, type CreateOrderInput, type OrderFilters, type OrderGateway } from '../../domain/index.js';

const statuses = new Set(['pendiente', 'asignado_a_ruta', 'recogido', 'en_camino', 'entregado']);
function isOrder(value: unknown): value is Order {
  return isRecord(value) && hasMetadata(value) && isUuid(value.zoneId) &&
    typeof value.deliveryAddress === 'string' && typeof value.deliveryDate === 'string' &&
    typeof value.deliveryTime === 'string' && typeof value.status === 'string' && statuses.has(value.status) &&
    validateOrder({ zoneId: value.zoneId, deliveryAddress: value.deliveryAddress, deliveryDate: value.deliveryDate, deliveryTime: value.deliveryTime }).isValid;
}

export class HttpOrderGateway implements OrderGateway {
  constructor(private readonly httpClient: HttpClient = defaultHttpClient) {}

  async create(input: CreateOrderInput): Promise<Order> {
    const { zoneId, deliveryAddress, deliveryDate, deliveryTime } = input;
    return readItem(await this.httpClient.post<unknown>('/orders', { zoneId, deliveryAddress, deliveryDate, deliveryTime }), isOrder);
  }

  async getAll(filters: OrderFilters = {}): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filters.zoneId) query.set('zoneId', filters.zoneId);
    if (filters.deliveryDate) query.set('deliveryDate', filters.deliveryDate);
    const suffix = query.size ? `?${query}` : '';
    return readItems(await this.httpClient.get<unknown>(`/orders${suffix}`), isOrder);
  }
}

export const defaultOrderGateway = new HttpOrderGateway();
