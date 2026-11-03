import { useEffect, useState } from 'react';
import { ZoneManagementView } from '../features/zones/index.js';
import { OrderManagementView } from '../features/orders/index.js';
import { FetchHttpClient } from '../shared/infrastructure/http/httpClient.js';
import { HttpOrderGateway } from '../features/orders/infrastructure/http/httpOrderGateway.js';
import { HttpOrderZoneCatalog } from '../features/orders/infrastructure/http/httpOrderZoneCatalog.js';
import { composeOrderUseCases } from './compose-use-cases.js';

const httpClient = new FetchHttpClient();
const orderUseCases = composeOrderUseCases(new HttpOrderGateway(httpClient), new HttpOrderZoneCatalog(httpClient));

type ActiveTab = 'zones' | 'orders';

export function App() {
  const readTab = (): ActiveTab => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'orders' || params.has('orderId') ? 'orders' : 'zones';
  };
  const [activeTab, setActiveTab] = useState<ActiveTab>(readTab);
  useEffect(() => {
    const restore = () => setActiveTab(readTab());
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const selectTab = (tab: ActiveTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    if (tab === 'zones') url.searchParams.delete('orderId');
    if (url.protocol === 'http:' || url.protocol === 'https:') window.history.pushState({}, '', url);
    setActiveTab(tab);
  };

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
          onClick={() => selectTab('zones')}
        >
          Zonas de Entrega
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          className={`app-nav__tab ${activeTab === 'orders' ? 'app-nav__tab--active' : ''}`}
          onClick={() => selectTab('orders')}
        >
          Pedidos (HU-PED-01)
        </button>
      </nav>

      {activeTab === 'zones' && <ZoneManagementView />}
      {activeTab === 'orders' && <OrderManagementView useCases={orderUseCases} />}
    </main>
  );
}
