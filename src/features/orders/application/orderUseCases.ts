import type { GetZonesUseCase } from '../../zones/application/getZonesUseCase.js';
import type { GetOrdersUseCase } from './getOrdersUseCase.js';
import type { CreateOrderUseCase } from './createOrderUseCase.js';
import type { GetOrderByIdUseCase } from './getOrderByIdUseCase.js';

export interface OrderUseCases {
  getZones: Pick<GetZonesUseCase, 'execute'>;
  getOrders: Pick<GetOrdersUseCase, 'execute'>;
  getOrderById: Pick<GetOrderByIdUseCase, 'execute'>;
  registerOrder: Pick<CreateOrderUseCase, 'execute'>;
}
