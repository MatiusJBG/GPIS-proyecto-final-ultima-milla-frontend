import type { FC } from 'react';
import type { Courier, Route } from '../../domain/index.js';
import { Button, EmptyState, Spinner } from '../../../../shared/ui/index.js';

export interface RouteListProps {
  routes: Route[];
  couriers: Courier[];
  isLoading: boolean;
  onSelectRouteForDispatch: (route: Route) => void;
}

export const RouteList: FC<RouteListProps> = ({
  routes,
  couriers,
  isLoading,
  onSelectRouteForDispatch,
}) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner size="lg" label="Cargando rutas de despacho..." />
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <EmptyState
        title="No se encontraron rutas"
        description="No hay rutas planificadas ni generadas para la fecha y zona seleccionadas. Ajusta los filtros o genera rutas en el sistema."
      />
    );
  }

  const getCourierName = (courierId: string | null, routeName?: string) => {
    if (routeName) return routeName;
    if (!courierId) return null;
    const found = couriers.find((c) => c.id === courierId);
    return found ? found.name : courierId;
  };

  return (
    <div className="dispatch-routes-grid" data-testid="dispatch-routes-grid">
      {routes.map((route) => {
        const assignedCourier = getCourierName(route.courierId, route.courierName);
        const canDispatch = route.status === 'planificada' || !route.courierId;

        return (
          <article key={route.id} className="route-card" data-testid={`route-card-${route.id}`}>
            <header className="route-card__header">
              <div>
                <h3 className="route-card__title">
                  {route.zoneName ? `Zona ${route.zoneName}` : `Ruta ${route.id.slice(0, 8)}`}
                </h3>
                <div className="route-card__meta">
                  <span>
                    <strong>Fecha:</strong> {route.serviceDate}
                  </span>
                  <span>
                    <strong>Capacidad:</strong> {route.stops.length} / {route.capacityLimit} pedidos
                  </span>
                </div>
              </div>
              <span className={`route-badge route-badge--${route.status}`}>
                {route.status}
              </span>
            </header>

            <div className="route-card__body">
              {assignedCourier ? (
                <div className="route-card__courier-info">
                  <span aria-hidden="true">👤</span>
                  <span>
                    Repartidor asignado: <strong>{assignedCourier}</strong>
                  </span>
                </div>
              ) : (
                <div className="route-card__courier-info">
                  <span aria-hidden="true">⏳</span>
                  <span>Pendiente de asignación de repartidor</span>
                </div>
              )}

              <div className="route-card__stops-section">
                <h4 className="route-card__stops-title">
                  Paradas de entrega ({route.stops.length})
                </h4>
                {route.stops.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Sin paradas asignadas actualmente.
                  </p>
                ) : (
                  <ul className="route-card__stops-list">
                    {route.stops.map((stop) => (
                      <li key={stop.orderId} className="route-stop-item">
                        <span className="route-stop-item__position">#{stop.position}</span>
                        <span className="route-stop-item__address" title={stop.deliveryAddress}>
                          {stop.deliveryAddress}
                        </span>
                        {stop.deliveryTime && (
                          <span className="route-stop-item__time">{stop.deliveryTime}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <footer className="route-card__footer">
              {canDispatch ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectRouteForDispatch(route)}
                >
                  Asignar y Despachar
                </Button>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Ruta Despachada
                </span>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
};

