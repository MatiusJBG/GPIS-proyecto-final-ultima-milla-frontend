import type { Order, OrderGateway } from '../domain/index.js';

export class GetOrdersUseCase {
  constructor(private readonly orderGateway: OrderGateway) {}

  public execute(): Promise<Order[]> {
    return this.orderGateway.getAll();
  }
}
