import type {AssignedRoute} from './assignedRoute';

export interface AssignedRouteGateway {
  getAssignedRoute(courierId: string): Promise<AssignedRoute | null>;
}
