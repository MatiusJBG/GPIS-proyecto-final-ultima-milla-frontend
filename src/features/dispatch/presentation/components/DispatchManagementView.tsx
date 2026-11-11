import { useEffect, useState, type FC } from 'react';
import type { DispatchUseCases } from '../../application/index.js';
import type { Zone, ZoneRepository } from '../../../zones/domain/index.js';
import { useDispatch } from '../hooks/useDispatch.js';
import { RouteList } from './RouteList.js';
import { DispatchModal } from './DispatchModal.js';
import { Alert, Button, Select, TextInput, type SelectOption } from '../../../../shared/ui/index.js';
import '../styles/dispatch.css';

export interface DispatchManagementViewProps {
  useCases: DispatchUseCases;
  zoneCatalog?: ZoneRepository | undefined;
}

export const DispatchManagementView: FC<DispatchManagementViewProps> = ({
  useCases,
  zoneCatalog,
}) => {
  const {
    routes,
    couriers,
    serviceDate,
    setServiceDate,
    zoneId,
    setZoneId,
    selectedRoute,
    setSelectedRoute,
    loadingRoutes,
    loadingCouriers,
    dispatching,
    error,
    conflict,
    successMessage,
    clearNotifications,
    loadRoutes,
    executeDispatch,
  } = useDispatch({ useCases });

  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState<boolean>(false);

  useEffect(() => {
    if (!zoneCatalog) return;
    let isMounted = true;
    setLoadingZones(true);
    zoneCatalog
      .getAll()
      .then((items) => {
        if (isMounted) setZones(items);
      })
      .catch(() => {
        // En caso de fallo en el catálogo de zonas, la vista sigue operativa con el ID directo
      })
      .finally(() => {
        if (isMounted) setLoadingZones(false);
      });
    return () => {
      isMounted = false;
    };
  }, [zoneCatalog]);

  const zoneOptions: SelectOption[] = [
    { value: '', label: '-- Todas las zonas --' },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ];

  // Enriquecer rutas con los nombres de zona obtenidos del catálogo
  const enrichedRoutes = routes.map((r) => {
    if (r.zoneName) return r;
    const match = zones.find((z) => z.id === r.zoneId);
    return match ? { ...r, zoneName: match.name } : r;
  });

  return (
    <section className="dispatch-view" aria-label="Módulo de Despacho de Rutas">
      <header className="dispatch-header">
        <h2 className="dispatch-header__title">Despacho de Rutas (HU-DES-01 / HU-DES-02)</h2>
        <p className="dispatch-header__subtitle">
          Consulta de rutas planificadas por fecha de servicio y asignación idempotente de repartidores para la distribución.
        </p>
      </header>

      {/* Notificaciones y estados accesibles */}
      {successMessage && (
        <Alert type="success" onClose={clearNotifications}>
          {successMessage}
        </Alert>
      )}

      {conflict && (
        <Alert type="error" title="Conflicto de Despacho (409)" onClose={clearNotifications}>
          {conflict}
        </Alert>
      )}

      {error && !conflict && (
        <Alert type="error" title="Error en el servicio" onClose={clearNotifications}>
          {error}
        </Alert>
      )}

      {/* Barra de filtros */}
      <form
        className="dispatch-filters"
        onSubmit={(e) => {
          e.preventDefault();
          loadRoutes();
        }}
      >
        <div className="dispatch-filters__field">
          <TextInput
            id="filter-dispatch-date"
            type="date"
            label="Fecha de Servicio"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
          />
        </div>

        <div className="dispatch-filters__field">
          <Select
            id="filter-dispatch-zone"
            label="Zona Geográfica"
            options={zoneOptions}
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            disabled={loadingZones}
          />
        </div>

        <div className="dispatch-filters__actions">
          <Button type="submit" variant="primary" isLoading={loadingRoutes}>
            Buscar Rutas
          </Button>
          {(serviceDate || zoneId) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setServiceDate('');
                setZoneId('');
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </form>

      {/* Lista de rutas */}
      <div className="dispatch-content">
        <RouteList
          routes={enrichedRoutes}
          couriers={couriers}
          isLoading={loadingRoutes}
          onSelectRouteForDispatch={(route) => setSelectedRoute(route)}
        />
      </div>

      {/* Modal de Despacho */}
      <DispatchModal
        isOpen={selectedRoute !== null}
        route={selectedRoute}
        couriers={couriers}
        isLoadingCouriers={loadingCouriers}
        isDispatching={dispatching}
        onClose={() => setSelectedRoute(null)}
        onConfirm={executeDispatch}
      />
    </section>
  );
};

