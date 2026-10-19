import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Zone } from '../../../zones/domain/index.js';
import { GetZonesUseCase } from '../../../zones/application/index.js';
import { defaultZoneRepository } from '../../../zones/infrastructure/http/index.js';
import type { Order, CreateOrderInput } from '../../domain/index.js';
import { CreateOrderUseCase, GetOrdersUseCase } from '../../application/index.js';
import { defaultOrderGateway } from '../../infrastructure/http/index.js';

export function useOrders(
  orderGateway = defaultOrderGateway,
  zoneRepository = defaultZoneRepository,
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState<boolean>(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getZonesUseCase = useMemo(() => new GetZonesUseCase(zoneRepository), [zoneRepository]);
  const createOrderUseCase = useMemo(() => new CreateOrderUseCase(orderGateway), [orderGateway]);
  const getOrdersUseCase = useMemo(() => new GetOrdersUseCase(orderGateway), [orderGateway]);

  const loadZones = useCallback(async () => {
    setIsLoadingZones(true);
    try {
      const data = await getZonesUseCase.execute();
      setZones(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las zonas para pedidos';
      setError(message);
    } finally {
      setIsLoadingZones(false);
    }
  }, [getZonesUseCase]);

  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const data = await getOrdersUseCase.execute();
      setOrders(data);
    } catch {
      // Si el endpoint de pedidos aún no está implementado o falla, mantenemos lista previa
    } finally {
      setIsLoadingOrders(false);
    }
  }, [getOrdersUseCase]);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const createdOrder = await createOrderUseCase.execute(input);

        // Asociar nombre de la zona localmente para visualización inmediata si existe
        const matchedZone = zones.find((z) => z.id === createdOrder.zoneId);
        const enrichedOrder: Order = {
          ...createdOrder,
          zoneName: matchedZone ? matchedZone.name : createdOrder.zoneName,
        };

        setOrders((prev) => [enrichedOrder, ...prev.filter((o) => o.id !== enrichedOrder.id)]);
        setSuccessMessage(`Pedido para "${enrichedOrder.deliveryAddress}" creado exitosamente.`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al registrar el pedido';
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createOrderUseCase, zones],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    void loadZones();
    void loadOrders();
  }, [loadZones, loadOrders]);

  return {
    orders,
    zones,
    isLoadingZones,
    isLoadingOrders,
    isSubmitting,
    error,
    successMessage,
    loadZones,
    loadOrders,
    createOrder,
    clearFeedback,
  };
}
