import type { FC } from 'react';
import type { Order } from '../../domain/index.js';
import { EmptyState, Spinner } from '../../../../shared/ui/index.js';

export interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
}

function formatDisplayDate(dateStr: string, timeStr: string): string {
  if (!dateStr) return '—';
  return `${dateStr} a las ${timeStr || '00:00'}`;
}

export const OrderList: FC<OrderListProps> = ({ orders, isLoading }) => {
  if (isLoading && orders.length === 0) {
    return (
      <div className="orders-loading-container" role="status">
        <Spinner size="lg" label="Cargando pedidos..." />
        <p>Consultando pedidos registrados...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No hay pedidos registrados"
        description="Aún no se han programado entregas. Completa el formulario para registrar un nuevo pedido en el sistema."
      />
    );
  }

  return (
    <div className="orders-table-wrapper">
      <table className="orders-table" aria-label="Listado de pedidos registrados">
        <thead>
          <tr>
            <th scope="col">Dirección</th>
            <th scope="col">Zona</th>
            <th scope="col">Programación</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusClass = `orders-status-badge--${order.status.toLowerCase().replace(/\s+/g, '_')}`;

            return (
              <tr key={order.id}>
                <td>
                  <span className="orders-table__address">{order.deliveryAddress}</span>
                  <span className="orders-table__id">ID: {order.id}</span>
                </td>
                <td>{order.zoneName || order.zoneId}</td>
                <td>{formatDisplayDate(order.deliveryDate, order.deliveryTime)}</td>
                <td>
                  <span className={`orders-status-badge ${statusClass}`}>
                    {order.status || 'pendiente'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
