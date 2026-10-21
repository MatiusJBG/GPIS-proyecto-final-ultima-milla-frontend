import { useState, type SubmitEvent, type FC } from 'react';
import type { Zone } from '../../../zones/domain/index.js';
import {
  validateOrder,
  type CreateOrderInput,
  type OrderValidationErrors,
} from '../../domain/index.js';
import { Button, TextInput, Select, Alert } from '../../../../shared/ui/index.js';

export interface OrderFormProps {
  zones: Zone[];
  isLoadingZones: boolean;
  onSubmit: (input: CreateOrderInput) => Promise<boolean>;
  isSubmitting?: boolean | undefined;
}

const initialFormState: CreateOrderInput = {
  zoneId: '',
  deliveryAddress: '',
  deliveryDate: '',
  deliveryTime: '',
};

export const OrderForm: FC<OrderFormProps> = ({
  zones,
  isLoadingZones,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateOrderInput>(initialFormState);
  const [errors, setErrors] = useState<OrderValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CreateOrderInput, boolean>>>({});

  const hasNoZones = !isLoadingZones && zones.length === 0;

  const validateField = (field: keyof CreateOrderInput, value: string) => {
    const updated = { ...formData, [field]: value };
    const validation = validateOrder(updated);
    setErrors((prev) => ({
      ...prev,
      [field]: validation.errors[field],
    }));
  };

  const handleChange = (field: keyof CreateOrderInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof CreateOrderInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      zoneId: true,
      deliveryAddress: true,
      deliveryDate: true,
      deliveryTime: true,
    });

    const validation = validateOrder(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const success = await onSubmit(formData);

    if (success) {
      setFormData(initialFormState);
      setTouched({});
    }
  };

  const zoneOptions = zones.map((z) => ({
    value: z.id,
    label: z.name,
  }));

  return (
    <form className="orders-form" onSubmit={handleSubmit} noValidate>
      {hasNoZones && (
        <Alert type="warning" title="Sin zonas registradas">
          Debes registrar al menos una zona de distribución en la pestaña &quot;Zonas de Entrega&quot;
          antes de poder generar pedidos.
        </Alert>
      )}

      <Select
        id="order-zone-select"
        label="Zona de Cobertura"
        placeholder={isLoadingZones ? 'Cargando zonas...' : 'Selecciona una zona...'}
        options={zoneOptions}
        value={formData.zoneId}
        onChange={(e) => handleChange('zoneId', e.target.value)}
        onBlur={() => handleBlur('zoneId')}
        error={touched.zoneId ? errors.zoneId : undefined}
        helperText="Selecciona la zona correspondiente a la ruta de entrega."
        isRequired
        disabled={isSubmitting || isLoadingZones || hasNoZones}
      />

      <TextInput
        id="order-address-input"
        label="Dirección de Entrega"
        placeholder="Ej. Calle 10 de Agosto N24-102 y Orellana"
        value={formData.deliveryAddress}
        onChange={(e) => handleChange('deliveryAddress', e.target.value)}
        onBlur={() => handleBlur('deliveryAddress')}
        error={touched.deliveryAddress ? errors.deliveryAddress : undefined}
        helperText="Ingresa la dirección detallada de destino."
        isRequired
        disabled={isSubmitting || hasNoZones}
        autoComplete="street-address"
      />

      <div className="orders-form__row">
        <TextInput
          id="order-date-input"
          type="date"
          label="Fecha de Entrega"
          value={formData.deliveryDate}
          onChange={(e) => handleChange('deliveryDate', e.target.value)}
          onBlur={() => handleBlur('deliveryDate')}
          error={touched.deliveryDate ? errors.deliveryDate : undefined}
          isRequired
          disabled={isSubmitting || hasNoZones}
        />

        <TextInput
          id="order-time-input"
          type="time"
          label="Hora de Entrega"
          value={formData.deliveryTime}
          onChange={(e) => handleChange('deliveryTime', e.target.value)}
          onBlur={() => handleBlur('deliveryTime')}
          error={touched.deliveryTime ? errors.deliveryTime : undefined}
          isRequired
          disabled={isSubmitting || hasNoZones}
        />
      </div>

      <div className="orders-form__actions">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting || hasNoZones}
        >
          {isSubmitting ? 'Registrando...' : 'Crear Pedido'}
        </Button>
      </div>
    </form>
  );
};
