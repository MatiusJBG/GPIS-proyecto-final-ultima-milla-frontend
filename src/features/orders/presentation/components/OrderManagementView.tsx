import { useCallback, useEffect, useState, type FC, type SubmitEvent } from 'react';
import type { Order, OrderFilters } from '../../domain/index.js';
import type { OrderUseCases } from '../../application/orderUseCases.js';
import { useOrders } from '../hooks/useOrders.js';
import { OrderForm } from './OrderForm.js';
import { OrderList } from './OrderList.js';
import { Alert, Button, Card } from '../../../../shared/ui/index.js';
import '../styles/orders.css';

export const OrderManagementView: FC<{ useCases: OrderUseCases }> = ({ useCases }) => {
  const readLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return { deliveryDate: params.get('deliveryDate') || '', zoneId: params.get('zoneId') || '', orderId: params.get('orderId') || '' };
  };
  const [location, setLocation] = useState(readLocation);
  const [draftFilters, setDraftFilters] = useState(() => readLocation());
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailState, setDetailState] = useState<'loading' | 'found' | 'missing' | 'error'>('loading');
  const focusDetail = useCallback((element: HTMLHeadingElement | null) => { element?.focus(); }, []);
  const {
    orders,
    zones,
    isLoadingZones,
    isLoadingOrders,
    isSubmitting,
    error,
    ordersError,
    setFilters,
    successMessage,
    loadZones,
    loadOrders,
    createOrder,
    clearFeedback,
  } = useOrders(useCases, { deliveryDate: location.deliveryDate, zoneId: location.zoneId });

  const navigate = (next: { deliveryDate: string; zoneId: string; orderId: string }) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'orders');
    for (const key of ['deliveryDate', 'zoneId', 'orderId'] as const) {
      if (next[key]) url.searchParams.set(key, next[key]);
      else url.searchParams.delete(key);
    }
    window.history.pushState({}, '', url);
    setLocation(next);
  };

  useEffect(() => {
    const restore = () => {
      const next = readLocation();
      setLocation(next);
      setDraftFilters(next);
      setFilters({ deliveryDate: next.deliveryDate, zoneId: next.zoneId });
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [setFilters]);

  useEffect(() => {
    if (!location.orderId) return;
    let current = true;
    setDetail(null);
    setDetailState('loading');
    void useCases.getOrderById.execute(location.orderId).then(order => {
      if (!current) return;
      setDetail(order);
      setDetailState(order ? 'found' : 'missing');
    }).catch(() => { if (current) setDetailState('error'); });
    return () => { current = false; };
  }, [location.orderId, useCases.getOrderById]);

  const applyFilters = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected: OrderFilters = {};
    if (draftFilters.deliveryDate) selected.deliveryDate = draftFilters.deliveryDate;
    if (draftFilters.zoneId) selected.zoneId = draftFilters.zoneId;
    setFilters(selected);
    navigate({ ...location, deliveryDate: draftFilters.deliveryDate, zoneId: draftFilters.zoneId });
  };

  const handleRefresh = () => {
    void loadZones();
    void loadOrders();
  };

  const isRefreshing = isLoadingZones || isLoadingOrders;

  return (
    <section className="orders-layout" aria-labelledby="orders-view-title">
      <header className="orders-header">
        <div className="orders-header__title-group">
          <h2 id="orders-view-title">Gestión de Pedidos de Entrega (HU-PED-01)</h2>
          <p>Registra y programa nuevos pedidos de última milla asignándolos a sus zonas de cobertura.</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isRefreshing}
          onClick={handleRefresh}
          aria-label="Refrescar zonas y pedidos"
        >
          {isRefreshing ? 'Actualizando...' : '↻ Actualizar'}
        </Button>
      </header>

      {error && (
        <Alert type="error" title="Atención" onClose={clearFeedback}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" title="Pedido Registrado" onClose={clearFeedback}>
          {successMessage}
        </Alert>
      )}

      {location.orderId ? (
        <Card variant="elevated">
          <Button type="button" variant="secondary" onClick={() => navigate({ ...location, orderId: '' })}>Volver al listado</Button>
          <h3 tabIndex={-1} ref={focusDetail}>Detalle del pedido</h3>
          {detailState === 'loading' && <p role="status">Cargando detalle...</p>}
          {detailState === 'missing' && <p role="status">Pedido no encontrado.</p>}
          {detailState === 'error' && <Alert type="error" title="Error">No se pudo consultar el pedido.</Alert>}
          {detailState === 'found' && detail && detail.id === location.orderId && <dl>
            <dt>ID</dt><dd>{detail.id}</dd>
            <dt>Dirección de entrega</dt><dd>{detail.deliveryAddress}</dd>
            <dt>Zona</dt><dd>{zones.find(zone => zone.id === detail.zoneId)?.name || detail.zoneId}</dd>
            <dt>Fecha de entrega</dt><dd>{detail.deliveryDate}</dd>
            <dt>Hora de entrega</dt><dd>{detail.deliveryTime}</dd>
            <dt>Estado</dt><dd>{detail.status}</dd>
            <dt>Creado (UTC)</dt><dd>{detail.createdAt}</dd>
            <dt>Actualizado (UTC)</dt><dd>{detail.updatedAt}</dd>
          </dl>}
        </Card>
      ) : <div className="orders-grid">
        <Card variant="elevated" className="orders-form-card">
          <h3 className="orders-form-card__title">Programar Nuevo Pedido</h3>
          <OrderForm
            zones={zones}
            isLoadingZones={isLoadingZones}
            onSubmit={createOrder}
            isSubmitting={isSubmitting}
          />
        </Card>

        <Card variant="elevated" className="orders-list-card">
          <div className="orders-list-card__header">
            <h3 className="orders-list-card__title">Pedidos Programados</h3>
            <span className="orders-badge-count">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          <form onSubmit={applyFilters} aria-label="Filtrar pedidos">
            <label htmlFor="filter-date">Fecha de entrega</label>
            <input id="filter-date" type="date" value={draftFilters.deliveryDate}
              onChange={event => setDraftFilters(previous => ({ ...previous, deliveryDate: event.target.value }))} />
            <label htmlFor="filter-zone">Zona</label>
            <select id="filter-zone" value={draftFilters.zoneId}
              onChange={event => setDraftFilters(previous => ({ ...previous, zoneId: event.target.value }))}>
              <option value="">Todas las zonas</option>
              {zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
            </select>
            <Button type="submit" disabled={isLoadingOrders}>Filtrar</Button>
            <Button type="button" variant="secondary" onClick={() => {
              setDraftFilters({ ...location, deliveryDate: '', zoneId: '' }); setFilters({});
              navigate({ ...location, deliveryDate: '', zoneId: '' });
            }}>Limpiar filtros</Button>
          </form>
          {!ordersError && <OrderList orders={orders} isLoading={isLoadingOrders} onSelect={orderId => navigate({ ...location, orderId })} />}
        </Card>
      </div>}
    </section>
  );
};
