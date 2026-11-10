export interface AssignedRouteStop {
  readonly orderId: string;
  readonly position: number;
  readonly deliveryAddress: string;
  readonly deliveryTime: string | null;
  readonly status: string;
}

export interface AssignedRoute {
  readonly routeId: string;
  readonly zoneId: string;
  readonly serviceDate: string;
  readonly status: string;
  readonly stops: readonly AssignedRouteStop[];
}
