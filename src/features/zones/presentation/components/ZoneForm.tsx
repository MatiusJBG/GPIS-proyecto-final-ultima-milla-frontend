import { useState, type FormEvent, type FC } from 'react';
import { validateZoneName } from '../../domain/index.js';
import { Button, TextInput } from '../../../../shared/ui/index.js';

export interface ZoneFormProps {
  onSubmit: (name: string) => Promise<boolean>;
  isSubmitting?: boolean | undefined;
}

export const ZoneForm: FC<ZoneFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (touched) {
      const validation = validateZoneName(value);
      setValidationError(validation.isValid ? undefined : validation.error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    const validation = validateZoneName(name);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(undefined);
    const success = await onSubmit(name);

    if (success) {
      setName('');
      setTouched(false);
    }
  };

  return (
    <form className="zones-form" onSubmit={handleSubmit} noValidate>
      <TextInput
        id="zone-name-input"
        label="Nombre de la Zona"
        placeholder="Ej. Centro, Norte, Sur"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        onBlur={() => {
          setTouched(true);
          const validation = validateZoneName(name);
          setValidationError(validation.isValid ? undefined : validation.error);
        }}
        error={validationError}
        helperText="Ingresa un nombre representativo para el área de distribución."
        isRequired
        disabled={isSubmitting}
        autoComplete="off"
      />

      <div className="zones-form__actions">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Crear Zona'}
        </Button>
      </div>
    </form>
  );
};
