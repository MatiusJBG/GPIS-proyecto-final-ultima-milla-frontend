export interface Courier {
  readonly id: string;
  readonly name: string;
  readonly maxOrdersPerTrip: number;
  readonly isEnabled: boolean;
  readonly createdAt?: string | undefined;
  readonly updatedAt?: string | undefined;
}

export interface CourierFilters {
  readonly isEnabled?: boolean | undefined;
}

