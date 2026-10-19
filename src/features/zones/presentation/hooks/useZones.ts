import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Zone } from '../../domain/index.js';
import { GetZonesUseCase, CreateZoneUseCase } from '../../application/index.js';
import { defaultZoneRepository } from '../../infrastructure/http/index.js';

export function useZones(repository = defaultZoneRepository) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getZonesUseCase = useMemo(() => new GetZonesUseCase(repository), [repository]);
  const createZoneUseCase = useMemo(() => new CreateZoneUseCase(repository), [repository]);

  const loadZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getZonesUseCase.execute();
      setZones(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al cargar las zonas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getZonesUseCase]);

  const createZone = useCallback(
    async (name: string): Promise<boolean> => {
      setIsCreating(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const newZone = await createZoneUseCase.execute({ name });
        setZones((prev) => [newZone, ...prev.filter((z) => z.id !== newZone.id)]);
        setSuccessMessage(`Zona "${newZone.name}" creada exitosamente.`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear la zona';
        setError(message);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [createZoneUseCase],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  return {
    zones,
    isLoading,
    isCreating,
    error,
    successMessage,
    loadZones,
    createZone,
    clearFeedback,
  };
}
