import { useState, type FC, type SubmitEvent } from 'react';
import type { OrderGateway, OrderFilters } from '../../domain/index.js';
import type { ZoneRepository } from '../../../zones/domain/index.js';
import { useOrders } from '../hooks/useOrders.js';
import { OrderForm } from './OrderForm.js';
import { OrderList } from './OrderList.js';
import { Alert, Button, Card } from '../../../../shared/ui/index.js';
import '../styles/orders.css';

export const OrderManagementView: FC<{ orderGateway: OrderGateway; zoneRepository: ZoneRepository }> = ({ orderGateway, zoneRepository }) => {
  const [draftFilters, setDraftFilters] = useState({ deliveryDate: '', zoneId: '' });
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
  } = useOrders(orderGateway, zoneRepository);

  const applyFilters = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected: OrderFilters = {};
    if (draftFilters.deliveryDate) selected.deliveryDate = draftFilters.deliveryDate;
    if (draftFilters.zoneId) selected.zoneId = draftFilters.zoneId;
    setFilters(selected);
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

      <div className="orders-grid">
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
              setDraftFilters({ deliveryDate: '', zoneId: '' }); setFilters({});
            }}>Limpiar filtros</Button>
          </form>
          {!ordersError && <OrderList orders={orders} isLoading={isLoadingOrders} />}
        </Card>
      </div>
    </section>
  );
};
