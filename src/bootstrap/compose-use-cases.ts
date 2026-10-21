import { CreateZoneUseCase, GetZonesUseCase } from '../features/zones/application/index.js';
import { CreateOrderUseCase, GetOrdersUseCase } from '../features/orders/application/index.js';
import type { ZoneRepository } from '../features/zones/domain/index.js';
import type { OrderGateway } from '../features/orders/domain/index.js';
import type { ZoneUseCases } from '../features/zones/application/zoneUseCases.js';
import type { OrderUseCases } from '../features/orders/application/orderUseCases.js';

export function composeZoneUseCases(repository: ZoneRepository): ZoneUseCases {
  return { getZones: new GetZonesUseCase(repository), registerZone: new CreateZoneUseCase(repository) };
}
export function composeOrderUseCases(gateway: OrderGateway, repository: ZoneRepository): OrderUseCases {
  return { getZones: new GetZonesUseCase(repository), getOrders: new GetOrdersUseCase(gateway), registerOrder: new CreateOrderUseCase(gateway) };
}
