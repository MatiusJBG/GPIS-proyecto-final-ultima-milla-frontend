export type RouteStatus = 'planificada' | 'asignada' | 'en_curso' | 'completada' | 'cancelada';

export interface RouteStop {
  readonly orderId: string;
  readonly position: number;
  readonly deliveryAddress: string;
  readonly deliveryTime: string | null;
  readonly status: string;
}

export interface Route {
  readonly id: string;
  readonly zoneId: string;
  readonly serviceDate: string; // Formato YYYY-MM-DD
  readonly capacityLimit: number;
  readonly courierId: string | null;
  readonly status: RouteStatus;
  readonly stops: readonly RouteStop[];
  readonly zoneName?: string | undefined;
  readonly courierName?: string | undefined;
  readonly createdAt?: string | undefined;
  readonly updatedAt?: string | undefined;
}

export interface RouteFilters {
  readonly serviceDate?: string | undefined;
  readonly zoneId?: string | undefined;
  readonly status?: RouteStatus | undefined;
}

