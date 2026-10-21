import { useState } from 'react';
import { composeZoneUseCases, composeOrderUseCases } from './compose-use-cases.js';
import { ZoneManagementView } from '../features/zones/index.js';
import { OrderManagementView } from '../features/orders/index.js';

import { FetchHttpClient } from '../shared/infrastructure/http/httpClient.js';
import { HttpZoneRepository } from '../features/zones/infrastructure/http/httpZoneRepository.js';
import { HttpOrderGateway } from '../features/orders/infrastructure/http/httpOrderGateway.js';

const httpClient = new FetchHttpClient();
const zoneRepository = new HttpZoneRepository(httpClient);
const orderGateway = new HttpOrderGateway(httpClient);

const zoneUseCases = composeZoneUseCases(zoneRepository);
const orderUseCases = composeOrderUseCases(orderGateway, zoneRepository);

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
          Pedidos (HU-PED-01)
        </button>
      </nav>

      {activeTab === 'zones' && <ZoneManagementView useCases={zoneUseCases} />}
      {activeTab === 'orders' && <OrderManagementView useCases={orderUseCases} />}
    </main>
  );
}
