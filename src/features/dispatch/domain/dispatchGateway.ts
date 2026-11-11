import type { Route, RouteFilters } from './route.js';
import type { Courier, CourierFilters } from './courier.js';

export interface RouteGateway {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  getRouteById(id: string): Promise<Route | null>;
  dispatchRoute(routeId: string, courierId: string, idempotencyKey: string): Promise<Route>;
}

export interface CourierGateway {
  getCouriers(filters?: CourierFilters): Promise<Courier[]>;
  getCourierById(id: string): Promise<Courier | null>;
}

