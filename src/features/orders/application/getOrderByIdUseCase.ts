import type { Order, OrderGateway } from '../domain/index.js';

export class GetOrderByIdUseCase {
  constructor(private readonly gateway: OrderGateway) {}
  execute(id: string): Promise<Order | null> { return this.gateway.getById(id); }
}
