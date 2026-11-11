import type { GetRoutesUseCase } from './getRoutesUseCase.js';
import type { GetCouriersUseCase } from './getCouriersUseCase.js';
import type { DispatchRouteUseCase } from './dispatchRouteUseCase.js';

export interface DispatchUseCases {
  readonly getRoutes: GetRoutesUseCase;
  readonly getCouriers: GetCouriersUseCase;
  readonly dispatchRoute: DispatchRouteUseCase;
}

