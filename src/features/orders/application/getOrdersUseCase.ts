import type { Order, OrderGateway, OrderFilters } from '../domain/index.js';

export class GetOrdersUseCase {
  constructor(private readonly orderGateway: OrderGateway) {}

  public execute(filters?: OrderFilters): Promise<Order[]> {
    return this.orderGateway.getAll(filters);
  }
}
