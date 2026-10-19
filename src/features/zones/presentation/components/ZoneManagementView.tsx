import type { FC } from 'react';
import { useZones } from '../hooks/useZones.js';
import { ZoneForm } from './ZoneForm.js';
import { ZoneList } from './ZoneList.js';
import { Alert, Button, Card } from '../../../../shared/ui/index.js';
import '../styles/zones.css';

export const ZoneManagementView: FC = () => {
  const {
    zones,
    isLoading,
    isCreating,
    error,
    successMessage,
    loadZones,
    createZone,
    clearFeedback,
  } = useZones();

  return (
    <section className="zones-layout" aria-labelledby="zones-view-title">
      <header className="zones-header">
        <div className="zones-header__title-group">
          <h2 id="zones-view-title">Gestión de Zonas de Distribución</h2>
          <p>Define y consulta las áreas geográficas operativas para la última milla.</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          onClick={() => void loadZones()}
          aria-label="Refrescar lista de zonas"
        >
          {isLoading ? 'Actualizando...' : '↻ Actualizar'}
        </Button>
      </header>

      {error && (
        <Alert type="error" title="Atención" onClose={clearFeedback}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" title="Operación Exitosa" onClose={clearFeedback}>
          {successMessage}
        </Alert>
      )}

      <div className="zones-grid">
        <Card variant="elevated" className="zones-form-card">
          <h3 className="zones-form-card__title">Registrar Nueva Zona</h3>
          <ZoneForm onSubmit={createZone} isSubmitting={isCreating} />
        </Card>

        <Card variant="elevated" className="zones-list-card">
          <div className="zones-list-card__header">
            <h3 className="zones-list-card__title">Zonas Operativas</h3>
            <span className="zones-badge-count">
              {zones.length} {zones.length === 1 ? 'zona' : 'zonas'}
            </span>
          </div>

          <ZoneList zones={zones} isLoading={isLoading} />
        </Card>
      </div>
    </section>
  );
};
