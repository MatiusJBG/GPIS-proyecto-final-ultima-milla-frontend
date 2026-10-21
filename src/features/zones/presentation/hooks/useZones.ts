import { useCallback, useState } from 'react';
import type { ZoneUseCases } from '../../application/zoneUseCases.js';
import { useAsyncList } from '../../../../shared/ui/hooks/useAsyncList.js';

export function useZones({ getZones, registerZone }: ZoneUseCases) {
  const [isCreating, setIsCreating] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const load = useCallback(() => getZones.execute(), [getZones]);
  const { items: zones, isLoading, error: loadError, refresh: loadZones, updateItems } = useAsyncList(load);

  const createZone = useCallback(async (name: string): Promise<boolean> => {
    setIsCreating(true);
    setWriteError(null);
    setSuccessMessage(null);
    try {
      const newZone = await registerZone.execute({ name });
      updateItems(previous => [newZone, ...previous.filter(zone => zone.id !== newZone.id)]);
      setSuccessMessage(`Zona "${newZone.name}" creada exitosamente.`);
      return true;
    } catch (error_) {
      setWriteError(error_ instanceof Error ? error_.message : 'Error al crear la zona');
      return false;
    } finally { setIsCreating(false); }
  }, [registerZone, updateItems]);

  const clearFeedback = useCallback(() => {
    setWriteError(null);
    setSuccessMessage(null);
  }, []);

  return { zones, isLoading, isCreating, error: writeError ?? loadError, loadError, successMessage, loadZones, createZone, clearFeedback };
}
