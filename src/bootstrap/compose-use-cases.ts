import { GetZonesUseCase } from '../features/zones/application/index.js';
import { CreateOrderUseCase, GetOrdersUseCase, GetOrderByIdUseCase } from '../features/orders/application/index.js';
import {
  GetRoutesUseCase,
  GetCouriersUseCase,
  DispatchRouteUseCase,
  type DispatchUseCases,
} from '../features/dispatch/application/index.js';
import type { ZoneRepository } from '../features/zones/domain/index.js';
import type { OrderGateway } from '../features/orders/domain/index.js';
import type { OrderUseCases } from '../features/orders/application/orderUseCases.js';
import type { RouteGateway, CourierGateway } from '../features/dispatch/domain/index.js';

export function composeOrderUseCases(gateway: OrderGateway, repository: ZoneRepository): OrderUseCases {
  return {
    getZones: new GetZonesUseCase(repository),
    getOrders: new GetOrdersUseCase(gateway),
    getOrderById: new GetOrderByIdUseCase(gateway),
    registerOrder: new CreateOrderUseCase(gateway),
  };
}

export function composeDispatchUseCases(routeGateway: RouteGateway, courierGateway: CourierGateway): DispatchUseCases {
  return {
    getRoutes: new GetRoutesUseCase(routeGateway),
    getCouriers: new GetCouriersUseCase(courierGateway),
    dispatchRoute: new DispatchRouteUseCase(routeGateway),
  };
}
