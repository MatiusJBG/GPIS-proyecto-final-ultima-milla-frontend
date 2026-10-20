import { useCallback, useMemo, useState } from 'react';
import type { ZoneRepository } from '../../../zones/domain/index.js';
import { GetZonesUseCase } from '../../../zones/application/index.js';
import type { OrderGateway, CreateOrderInput, OrderFilters } from '../../domain/index.js';
import { CreateOrderUseCase, GetOrdersUseCase } from '../../application/index.js';
import { useAsyncList } from '../../../../shared/ui/hooks/useAsyncList.js';

export function useOrders(orderGateway: OrderGateway, zoneRepository: ZoneRepository) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({});
  const getZones = useMemo(() => new GetZonesUseCase(zoneRepository), [zoneRepository]);
  const registerOrder = useMemo(() => new CreateOrderUseCase(orderGateway), [orderGateway]);
  const getOrders = useMemo(() => new GetOrdersUseCase(orderGateway), [orderGateway]);
  const fetchZones = useCallback(() => getZones.execute(), [getZones]);
  const fetchOrders = useCallback(() => getOrders.execute(filters), [getOrders, filters]);
  const zoneList = useAsyncList(fetchZones);
  const orderList = useAsyncList(fetchOrders);
  const { items: zones } = zoneList;
  const { updateItems } = orderList;

  const createOrder = useCallback(async (input: CreateOrderInput): Promise<boolean> => {
    setIsSubmitting(true);
    setWriteError(null);
    setSuccessMessage(null);
    try {
      const created = await registerOrder.execute(input);
      const enriched = { ...created, zoneName: zones.find(zone => zone.id === created.zoneId)?.name };
      updateItems(previous => {
        if ((filters.zoneId && created.zoneId !== filters.zoneId) ||
            (filters.deliveryDate && created.deliveryDate !== filters.deliveryDate)) return previous;
        return [enriched, ...previous.filter(order => order.id !== created.id)];
      });
      setSuccessMessage(`Pedido para "${created.deliveryAddress}" creado exitosamente.`);
      return true;
    } catch (failure) {
      setWriteError(failure instanceof Error ? failure.message : 'Error al registrar el pedido');
      return false;
    } finally { setIsSubmitting(false); }
  }, [registerOrder, zones, filters, updateItems]);

  const clearFeedback = useCallback(() => {
    setWriteError(null);
    setSuccessMessage(null);
  }, []);

  return {
    orders: orderList.items, zones, filters, setFilters,
    isLoadingZones: zoneList.isLoading, isLoadingOrders: orderList.isLoading, isSubmitting,
    error: writeError ?? zoneList.error ?? orderList.error, ordersError: orderList.error,
    successMessage, loadZones: zoneList.refresh, loadOrders: orderList.refresh, createOrder, clearFeedback,
  };
}
