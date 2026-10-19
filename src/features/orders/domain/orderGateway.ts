import type { Order, CreateOrderInput } from './order.js';

export interface OrderGateway {
  create(input: CreateOrderInput): Promise<Order>;
  getAll(): Promise<Order[]>;
}
