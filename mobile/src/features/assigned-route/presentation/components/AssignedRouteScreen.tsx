import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {AssignedRouteState} from '../hooks/useAssignedRoute';
import {MessageCard} from '../../../../shared/ui/MessageCard';

interface AssignedRouteScreenProps {
  readonly initialApiUrl: string;
  readonly initialCourierId: string;
  readonly state: AssignedRouteState;
  readonly onLoad: (apiUrl: string, courierId: string) => Promise<void>;
}

export function AssignedRouteScreen({
  initialApiUrl,
  initialCourierId,
  state,
  onLoad,
}: AssignedRouteScreenProps) {
  const [apiUrl, setApiUrl] = useState(initialApiUrl);
  const [courierId, setCourierId] = useState(initialCourierId);

  useEffect(() => setApiUrl(initialApiUrl), [initialApiUrl]);
  useEffect(() => setCourierId(initialCourierId), [initialCourierId]);

  const isLoading = state.kind === 'loading';
  const submit = () => {
    onLoad(apiUrl, courierId).catch(() => undefined);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>ÚLTIMA MILLA</Text>
      <Text style={styles.title}>Mi ruta asignada</Text>
      <Text style={styles.copy}>Consulta la ruta y el orden de paradas asignados por el servicio.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>URL del servicio de repartidores</Text>
        <TextInput
          accessibilityLabel="URL del servicio de repartidores"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          onChangeText={setApiUrl}
          placeholder="http://10.0.2.2:3012"
          style={styles.input}
          testID="api-url-input"
          value={apiUrl}
        />
        <Text style={styles.label}>UUID del repartidor de demostración</Text>
        <TextInput
          accessibilityLabel="UUID del repartidor de demostración"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          onChangeText={setCourierId}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          style={styles.input}
          testID="courier-id-input"
          value={courierId}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={submit}
          style={[styles.button, isLoading && styles.buttonDisabled]}
          testID="load-route-button">
          <Text style={styles.buttonText}>{isLoading ? 'Consultando…' : 'Consultar ruta'}</Text>
        </Pressable>
      </View>

      <RouteResult state={state} onRetry={submit} />
    </ScrollView>
  );
}

function RouteResult({state, onRetry}: {readonly state: AssignedRouteState; readonly onRetry: () => void}) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'loading') {
    return <ActivityIndicator accessibilityLabel="Cargando ruta" size="large" testID="route-loading" />;
  }
  if (state.kind === 'empty') {
    return <MessageCard title="Sin ruta activa">No tienes una ruta asignada para este momento.</MessageCard>;
  }
  if (state.kind === 'error') {
    return (
      <View style={styles.resultGap}>
        <MessageCard title="No se pudo consultar la ruta" tone="error">{state.message}</MessageCard>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.secondaryButton} testID="retry-route-button">
          <Text style={styles.secondaryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.resultGap} testID="assigned-route-result">
      <MessageCard title={`Ruta ${state.route.routeId}`}>
        {`Zona ${state.route.zoneId} · ${state.route.serviceDate} · ${state.route.status}`}
      </MessageCard>
      <Text style={styles.sectionTitle} testID="route-stops-heading">Paradas ({state.route.stops.length})</Text>
      {state.route.stops.map(stop => (
        <View key={stop.orderId} style={styles.stop}>
          <Text style={styles.stopTitle}>{`${stop.position}. ${stop.deliveryAddress}`}</Text>
          <Text style={styles.stopMeta}>{`${stop.status}${stop.deliveryTime ? ` · ${stop.deliveryTime}` : ''}`}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {backgroundColor: '#F8FAFC', flexGrow: 1, gap: 16, padding: 24},
  eyebrow: {color: '#2563EB', fontSize: 12, fontWeight: '800', letterSpacing: 1},
  title: {color: '#0F172A', fontSize: 30, fontWeight: '800'},
  copy: {color: '#475569', fontSize: 16, lineHeight: 23},
  form: {gap: 8},
  label: {color: '#172033', fontSize: 14, fontWeight: '700', marginTop: 4},
  input: {backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, color: '#0F172A', padding: 12},
  button: {alignItems: 'center', backgroundColor: '#1D4ED8', borderRadius: 10, marginTop: 8, padding: 14},
  buttonDisabled: {backgroundColor: '#94A3B8'},
  buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  resultGap: {gap: 12},
  sectionTitle: {color: '#172033', fontSize: 18, fontWeight: '800'},
  stop: {backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 10, borderWidth: 1, gap: 4, padding: 14},
  stopTitle: {color: '#172033', fontSize: 16, fontWeight: '700'},
  stopMeta: {color: '#475569', fontSize: 14},
  secondaryButton: {alignItems: 'center', borderColor: '#1D4ED8', borderRadius: 10, borderWidth: 1, padding: 12},
  secondaryButtonText: {color: '#1D4ED8', fontSize: 16, fontWeight: '800'},
});
