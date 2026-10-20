import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncList<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const version = useRef(0);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    const request = ++version.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await load();
      if (mounted.current && request === version.current) setItems(data);
    } catch (failure) {
      if (mounted.current && request === version.current) {
        setError(failure instanceof Error ? failure.message : 'No se pudo recuperar el listado.');
      }
    } finally {
      if (mounted.current && request === version.current) setIsLoading(false);
    }
  }, [load]);

  const updateItems = useCallback((update: (previous: T[]) => T[]) => {
    // A query started before a successful write cannot replace the newer state.
    ++version.current;
    setIsLoading(false);
    setItems(update);
  }, []);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => { mounted.current = false; ++version.current; };
  }, [refresh]);

  return { items, isLoading, error, refresh, updateItems, clearError };
}
