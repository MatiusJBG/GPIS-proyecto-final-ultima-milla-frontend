import { useCallback, useMemo, useState } from 'react';
import type { ZoneRepository } from '../../domain/index.js';
import { GetZonesUseCase, CreateZoneUseCase } from '../../application/index.js';
import { useAsyncList } from '../../../../shared/ui/hooks/useAsyncList.js';

export function useZones(repository: ZoneRepository) {
  const [isCreating, setIsCreating] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const getZones = useMemo(() => new GetZonesUseCase(repository), [repository]);
  const registerZone = useMemo(() => new CreateZoneUseCase(repository), [repository]);
  const load = useCallback(() => getZones.execute(), [getZones]);
  const { items: zones, isLoading, error: loadError, refresh: loadZones, updateItems, clearError } = useAsyncList(load);

  const createZone = useCallback(async (name: string): Promise<boolean> => {
    setIsCreating(true);
    setWriteError(null);
    setSuccessMessage(null);
    try {
      const newZone = await registerZone.execute({ name });
      updateItems(previous => [newZone, ...previous.filter(zone => zone.id !== newZone.id)]);
      setSuccessMessage(`Zona "${newZone.name}" creada exitosamente.`);
      return true;
    } catch (failure) {
      setWriteError(failure instanceof Error ? failure.message : 'Error al crear la zona');
      return false;
    } finally { setIsCreating(false); }
  }, [registerZone, updateItems]);

  const clearFeedback = useCallback(() => {
    setWriteError(null);
    setSuccessMessage(null);
    clearError();
  }, [clearError]);

  return { zones, isLoading, isCreating, error: writeError ?? loadError, loadError, successMessage, loadZones, createZone, clearFeedback };
}
