import type { FC } from 'react';
import type { Zone } from '../../domain/index.js';
import { EmptyState, Spinner } from '../../../../shared/ui/index.js';

export interface ZoneListProps {
  zones: Zone[];
  isLoading: boolean;
}

function formatDate(isoDateString?: string): string {
  if (!isoDateString) return '—';
  try {
    const date = new Date(isoDateString);
    if (Number.isNaN(date.getTime())) return isoDateString;
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export const ZoneList: FC<ZoneListProps> = ({ zones, isLoading }) => {
  if (isLoading && zones.length === 0) {
    return (
      <output className="zones-loading-container">
        <Spinner size="lg" label="Cargando listado de zonas..." />
        <p>Obteniendo zonas disponibles...</p>
      </output>
    );
  }

  if (zones.length === 0) {
    return (
      <EmptyState
        title="No hay zonas registradas"
        description="Aún no se han configurado áreas de cobertura. Utiliza el formulario para añadir la primera zona de entrega."
      />
    );
  }

  return (
    <div className="zones-table-wrapper">
      <table className="zones-table" aria-label="Listado de zonas de entrega">
        <thead>
          <tr>
            <th scope="col">Nombre de Zona</th>
            <th scope="col">Identificador</th>
            <th scope="col">Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <td className="zones-table__name">{zone.name}</td>
              <td className="zones-table__id">
                <code>{zone.id}</code>
              </td>
              <td className="zones-table__date">{formatDate(zone.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
