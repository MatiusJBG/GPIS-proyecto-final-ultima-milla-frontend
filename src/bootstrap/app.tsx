import { useState } from 'react';
import { ZoneManagementView } from '../features/zones/index.js';
import { Card } from '../shared/ui/index.js';

type ActiveTab = 'zones' | 'orders';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('zones');

  return (
    <main className="app-shell">
      <header className="app-hero">
        <p className="app-eyebrow">Gestión de Logística</p>
        <h1>Última Milla</h1>
        <p className="app-description">
          Panel de administración para la gestión de zonas de cobertura geográfica y asignación
          de pedidos de distribución.
        </p>
      </header>

      <nav className="app-nav" aria-label="Navegación principal del sistema">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'zones'}
          className={`app-nav__tab ${activeTab === 'zones' ? 'app-nav__tab--active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          Zonas de Entrega
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          className={`app-nav__tab ${activeTab === 'orders' ? 'app-nav__tab--active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Pedidos (Próximamente)
        </button>
      </nav>

      {activeTab === 'zones' && <ZoneManagementView />}

      {activeTab === 'orders' && (
        <Card variant="outlined">
          <h3>Módulo de Pedidos</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            El módulo de pedidos se conectará con las zonas configuradas en el siguiente paso del Sprint 01.
          </p>
        </Card>
      )}
    </main>
  );
}
