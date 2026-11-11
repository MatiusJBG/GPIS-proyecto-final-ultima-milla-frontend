import { useEffect, useState, type FC, type FormEvent } from 'react';
import type { Courier, Route } from '../../domain/index.js';
import { Button, Select, Alert, type SelectOption } from '../../../../shared/ui/index.js';

export interface DispatchModalProps {
  isOpen: boolean;
  route: Route | null;
  couriers: Courier[];
  isLoadingCouriers: boolean;
  isDispatching: boolean;
  onClose: () => void;
  onConfirm: (routeId: string, courierId: string) => Promise<boolean>;
}

export const DispatchModal: FC<DispatchModalProps> = ({
  isOpen,
  route,
  couriers,
  isLoadingCouriers,
  isDispatching,
  onClose,
  onConfirm,
}) => {
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCourierId('');
    setValidationError(null);
  }, [isOpen, route]);

  if (!isOpen || !route) return null;

  const totalStops = route.stops.length;

  const options: SelectOption[] = couriers.map((c) => ({
    value: c.id,
    label: `${c.name} (Capacidad: ${c.maxOrdersPerTrip} pedidos)${!c.isEnabled ? ' [No disponible]' : ''}`,
    disabled: !c.isEnabled,
  }));

  const selectedCourier = couriers.find((c) => c.id === selectedCourierId);
  const exceedsCapacity = selectedCourier ? totalStops > selectedCourier.maxOrdersPerTrip : false;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourierId) {
      setValidationError('Debes seleccionar un repartidor disponible.');
      return;
    }
    if (exceedsCapacity) {
      setValidationError(
        `La ruta contiene ${totalStops} pedidos, lo cual excede la capacidad máxima del repartidor (${selectedCourier?.maxOrdersPerTrip}).`,
      );
      return;
    }

    setValidationError(null);
    const success = await onConfirm(route.id, selectedCourierId);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="dispatch-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-modal-title"
    >
      <div className="dispatch-modal">
        <header className="dispatch-modal__header">
          <h2 id="dispatch-modal-title" className="dispatch-modal__title">
            Despachar Ruta
          </h2>
          <button
            type="button"
            className="dispatch-modal__close-btn"
            onClick={onClose}
            disabled={isDispatching}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="dispatch-modal__body">
            <div className="dispatch-modal__route-summary">
              <p>
                <strong>ID de Ruta:</strong> {route.id}
              </p>
              <p>
                <strong>Fecha de Servicio:</strong> {route.serviceDate}
              </p>
              <p>
                <strong>Zona:</strong> {route.zoneName ?? route.zoneId}
              </p>
              <p>
                <strong>Pedidos / Paradas a entregar:</strong> {totalStops}
              </p>
            </div>

            {validationError && (
              <Alert type="error" onClose={() => setValidationError(null)}>
                {validationError}
              </Alert>
            )}

            {exceedsCapacity && (
              <Alert type="warning">
                Atención: la ruta tiene {totalStops} pedidos y supera el límite de {selectedCourier?.maxOrdersPerTrip} de este repartidor.
              </Alert>
            )}

            <Select
              id="courier-select"
              label="Seleccionar Repartidor"
              isRequired
              placeholder={isLoadingCouriers ? 'Cargando repartidores...' : '-- Seleccione un repartidor --'}
              options={options}
              value={selectedCourierId}
              onChange={(e) => {
                setSelectedCourierId(e.target.value);
                setValidationError(null);
              }}
              disabled={isLoadingCouriers || isDispatching}
              helperText="Solo se muestran repartidores habilitados para el despacho."
            />
          </div>

          <footer className="dispatch-modal__footer">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDispatching}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isDispatching}
              disabled={!selectedCourierId || isLoadingCouriers}
            >
              Confirmar Despacho
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};

