import { useCallback, useEffect, useRef, useState } from 'react';
import type { Courier, Route, RouteFilters } from '../../domain/index.js';
import type { DispatchUseCases } from '../../application/index.js';

export interface UseDispatchOptions {
  useCases: DispatchUseCases;
  initialServiceDate?: string;
  initialZoneId?: string;
}

export function useDispatch({ useCases, initialServiceDate, initialZoneId }: UseDispatchOptions) {
  const [serviceDate, setServiceDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDate = params.get('serviceDate') ?? params.get('deliveryDate');
      if (urlDate) return urlDate;
    }
    return initialServiceDate ?? '';
  });

  const [zoneId, setZoneId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlZone = params.get('zoneId');
      if (urlZone) return urlZone;
    }
    return initialZoneId ?? '';
  });

  const [routes, setRoutes] = useState<Route[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [loadingCouriers, setLoadingCouriers] = useState<boolean>(false);
  const [dispatching, setDispatching] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requestVersionRef = useRef<number>(0);

  const updateUrlParams = useCallback((newDate: string, newZone: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (newDate) {
      url.searchParams.set('serviceDate', newDate);
    } else {
      url.searchParams.delete('serviceDate');
      url.searchParams.delete('deliveryDate');
    }
    if (newZone) {
      url.searchParams.set('zoneId', newZone);
    } else {
      url.searchParams.delete('zoneId');
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      window.history.replaceState({}, '', url);
    }
  }, []);

  const loadRoutes = useCallback(async () => {
    const currentVersion = ++requestVersionRef.current;
    setLoadingRoutes(true);
    setError(null);
    setConflict(null);

    try {
      const filters: RouteFilters = {
        ...(serviceDate ? { serviceDate } : {}),
        ...(zoneId ? { zoneId } : {}),
      };

      const items = await useCases.getRoutes.execute(filters);
      if (currentVersion === requestVersionRef.current) {
        setRoutes(items);
      }
    } catch (err) {
      if (currentVersion === requestVersionRef.current) {
        const message = err instanceof Error ? err.message : 'No se pudieron consultar las rutas de despacho.';
        setError(message);
        setRoutes([]);
      }
    } finally {
      if (currentVersion === requestVersionRef.current) {
        setLoadingRoutes(false);
      }
    }
  }, [useCases.getRoutes, serviceDate, zoneId]);

  const loadCouriers = useCallback(async () => {
    setLoadingCouriers(true);
    try {
      const items = await useCases.getCouriers.execute({ isEnabled: true });
      setCouriers(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron consultar los repartidores disponibles.';
      setError(message);
    } finally {
      setLoadingCouriers(false);
    }
  }, [useCases.getCouriers]);

  useEffect(() => {
    loadRoutes();
    updateUrlParams(serviceDate, zoneId);
  }, [loadRoutes, serviceDate, zoneId, updateUrlParams]);

  useEffect(() => {
    loadCouriers();
  }, [loadCouriers]);

  const executeDispatch = useCallback(
    async (routeId: string, courierId: string) => {
      setDispatching(true);
      setError(null);
      setConflict(null);
      setSuccessMessage(null);

      try {
        const result = await useCases.dispatchRoute.execute({ routeId, courierId });
        setSuccessMessage(`Ruta despachada exitosamente al repartidor.`);
        setSelectedRoute(null);

        // Actualizar la lista local con la ruta despachada
        setRoutes((prev) =>
          prev.map((r) => (r.id === result.route.id ? { ...result.route, courierId: result.route.courierId ?? courierId } : r)),
        );

        // Recargar para sincronizar nombres y estado canónico
        await loadRoutes();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado al despachar la ruta.';
        if (message.includes('Conflicto') || message.includes('conflicto') || message.includes('ya tiene una ruta')) {
          setConflict(message);
        } else {
          setError(message);
        }
        return false;
      } finally {
        setDispatching(false);
      }
    },
    [useCases.dispatchRoute, loadRoutes],
  );

  return {
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
    clearNotifications: () => {
      setError(null);
      setConflict(null);
      setSuccessMessage(null);
    },
    loadRoutes,
    loadCouriers,
    executeDispatch,
  };
}
