import type { Route, RouteFilters, RouteGateway } from '../domain/index.js';

export class GetRoutesUseCase {
  constructor(private readonly gateway: RouteGateway) {}

  async execute(filters?: RouteFilters): Promise<Route[]> {
    return this.gateway.getRoutes(filters);
  }
}

