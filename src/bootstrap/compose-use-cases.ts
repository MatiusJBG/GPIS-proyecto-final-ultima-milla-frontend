import { GetZonesUseCase } from '../features/zones/application/index.js';
import { CreateOrderUseCase, GetOrdersUseCase, GetOrderByIdUseCase } from '../features/orders/application/index.js';
import type { ZoneRepository } from '../features/zones/domain/index.js';
import type { OrderGateway } from '../features/orders/domain/index.js';
import type { OrderUseCases } from '../features/orders/application/orderUseCases.js';

export function composeOrderUseCases(gateway: OrderGateway, repository: ZoneRepository): OrderUseCases {
  return { getZones: new GetZonesUseCase(repository), getOrders: new GetOrdersUseCase(gateway), getOrderById: new GetOrderByIdUseCase(gateway), registerOrder: new CreateOrderUseCase(gateway) };
}
