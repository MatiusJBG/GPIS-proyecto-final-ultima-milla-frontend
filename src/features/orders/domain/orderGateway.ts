import type { Order, CreateOrderInput, OrderFilters } from './order.js';

export interface OrderGateway {
  create(input: CreateOrderInput): Promise<Order>;
  getAll(filters?: OrderFilters): Promise<Order[]>;
}
