import {
  validateOrder,
  type Order,
  type CreateOrderInput,
  type OrderGateway,
} from '../domain/index.js';

export class CreateOrderUseCase {
  constructor(private readonly orderGateway: OrderGateway) {}

  public async execute(input: CreateOrderInput): Promise<Order> {
    const validation = validateOrder(input);

    if (!validation.isValid) {
      const firstErrorMessage =
        Object.values(validation.errors).find(Boolean) || 'Datos de pedido inválidos';
      throw new Error(firstErrorMessage);
    }

    const sanitizedInput: CreateOrderInput = {
      zoneId: input.zoneId.trim(),
      deliveryAddress: input.deliveryAddress.trim(),
      deliveryDate: input.deliveryDate.trim(),
      deliveryTime: input.deliveryTime.trim(),
    };

    return this.orderGateway.create(sanitizedInput);
  }
}
