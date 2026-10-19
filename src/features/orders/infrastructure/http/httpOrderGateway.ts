import {
  defaultHttpClient,
  type HttpClient,
} from '../../../../shared/infrastructure/http/index.js';
import type { Order, CreateOrderInput, OrderGateway } from '../../domain/index.js';

interface OrdersResponseWrapper {
  data?: Order[];
  orders?: Order[];
}

export class HttpOrderGateway implements OrderGateway {
  constructor(private readonly httpClient: HttpClient = defaultHttpClient) {}

  public async create(input: CreateOrderInput): Promise<Order> {
    const payload = {
      zoneId: input.zoneId,
      deliveryAddress: input.deliveryAddress,
      deliveryDate: input.deliveryDate,
      deliveryTime: input.deliveryTime,
    };

    const response = await this.httpClient.post<Order | { data: Order }>('/orders', payload);

    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return response.data;
    }

    return response as Order;
  }

  public async getAll(): Promise<Order[]> {
    try {
      const response = await this.httpClient.get<Order[] | OrdersResponseWrapper>('/orders');

      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      if (response && Array.isArray(response.orders)) {
        return response.orders;
      }

      return [];
    } catch {
      // Si el backend aún no expone GET /orders, retornamos un array vacío de forma resiliente
      return [];
    }
  }
}

export const defaultOrderGateway = new HttpOrderGateway();
