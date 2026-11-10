import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {GetAssignedRouteUseCase} from '../features/assigned-route/application/getAssignedRouteUseCase';
import {HttpAssignedRouteGateway} from '../features/assigned-route/infrastructure/http/HttpAssignedRouteGateway';
import {AssignedRouteScreen} from '../features/assigned-route/presentation/components/AssignedRouteScreen';
import {useAssignedRoute} from '../features/assigned-route/presentation/hooks/useAssignedRoute';

const STORAGE_KEY = '@gpis-ultima-milla/mobile-route-config';
const DEFAULT_API_URL = 'http://10.0.2.2:3012';

interface DemoConfiguration {
  readonly apiUrl: string;
  readonly courierId: string;
}

export function AssignedRouteApp() {
  const [configuration, setConfiguration] = useState<DemoConfiguration>({apiUrl: DEFAULT_API_URL, courierId: ''});
  const {load, state} = useAssignedRoute();

  useEffect(() => {
    restoreConfiguration(setConfiguration).catch(() => undefined);
  }, []);

  const handleLoad = useCallback(async (apiUrl: string, courierId: string) => {
    const nextConfiguration = {apiUrl: apiUrl.trim(), courierId: courierId.trim()};
    setConfiguration(nextConfiguration);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfiguration));
    const gateway = new HttpAssignedRouteGateway(normalizeApiUrl(nextConfiguration.apiUrl));
    await load(new GetAssignedRouteUseCase(gateway), nextConfiguration.courierId);
  }, [load]);

  return (
    <SafeAreaProvider>
      <AssignedRouteScreen
        initialApiUrl={configuration.apiUrl}
        initialCourierId={configuration.courierId}
        onLoad={handleLoad}
        state={state}
      />
    </SafeAreaProvider>
  );
}

async function restoreConfiguration(setConfiguration: (value: DemoConfiguration) => void) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === null) return;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (isDemoConfiguration(parsed)) setConfiguration(parsed);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

function normalizeApiUrl(value: string): string {
  return value.trim().replace(/\/$/, '') || DEFAULT_API_URL;
}

function isDemoConfiguration(value: unknown): value is DemoConfiguration {
  return typeof value === 'object' && value !== null
    && typeof (value as DemoConfiguration).apiUrl === 'string'
    && typeof (value as DemoConfiguration).courierId === 'string';
}
