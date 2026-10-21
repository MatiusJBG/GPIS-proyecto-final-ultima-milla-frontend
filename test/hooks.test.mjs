import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { act, createElement } from 'react';

let vite;
let dom;
let createRoot;
let useZones;
let useOrders;
let OrderManagementView;
let ZoneManagementView;
const zone = { id: 'a0000000-0000-4000-8000-000000000001', name: 'Centro', createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z' };
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
async function mount(hook, render = () => null) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  let state;
  function Harness() { state = hook(); return render(state); }
  await act(async () => { root.render(createElement(Harness)); });
  return { container, get state() { return state; }, async close() { await act(async () => root.unmount()); container.remove(); } };
}
before(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import('react-dom/client'));
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ useZones } = await vite.ssrLoadModule('/src/features/zones/presentation/hooks/useZones.ts'));
  ({ useOrders } = await vite.ssrLoadModule('/src/features/orders/presentation/hooks/useOrders.ts'));
  ({ OrderManagementView } = await vite.ssrLoadModule('/src/features/orders/presentation/components/OrderManagementView.tsx'));
  ({ ZoneManagementView } = await vite.ssrLoadModule('/src/features/zones/presentation/components/ZoneManagementView.tsx'));
});

test('closing query feedback never turns a failed zones query into an empty success', async () => {
  let fail = true;
  const repository = { getAll: async () => { if (fail) throw new Error('API no disponible'); return []; } };
  const view = await mount(() => null, () => createElement(ZoneManagementView, { repository }));
  try {
    assert.match(view.container.textContent, /API no disponible/);
    const close = view.container.querySelector('.ui-alert__close');
    if (close) await act(async () => { close.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
    assert.doesNotMatch(view.container.textContent, /No hay zonas registradas/);
    assert.match(view.container.textContent, /API no disponible/);
    fail = false;
    await act(async () => {
      view.container.querySelector('[aria-label="Refrescar lista de zonas"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });
    assert.match(view.container.textContent, /No hay zonas registradas/);
  } finally { await view.close(); }
});

test('query failures render feedback without claiming that no orders exist', async () => {
  const orderGateway = { getAll: async () => { throw new Error('API fuera de servicio'); } };
  const zoneRepository = { getAll: async () => [zone] };
  const view = await mount(() => null, () => createElement(OrderManagementView, { orderGateway, zoneRepository }));
  try {
    assert.match(view.container.textContent, /API fuera de servicio/);
    assert.doesNotMatch(view.container.textContent, /No hay pedidos registrados/);
  } finally { await view.close(); }
});

test('filters reach the order query and clearing them reloads the unfiltered list', async () => {
  const calls = [];
  const orderGateway = { getAll: async filters => { calls.push(filters); return []; } };
  const zoneRepository = { getAll: async () => [zone] };
  const view = await mount(() => useOrders(orderGateway, zoneRepository));
  try {
    const filters = { deliveryDate: '2099-10-20', zoneId: zone.id };
    await act(async () => { view.state.setFilters(filters); });
    assert.deepEqual(calls.at(-1), filters);
    await act(async () => { view.state.setFilters({}); });
    assert.deepEqual(calls.at(-1), {});
  } finally { await view.close(); }
});
after(async () => { await vite?.close(); dom?.window.close(); });

test('orders query errors reach presentation and a successful retry clears them', async () => {
  let fail = true;
  const orderGateway = { getAll: async () => { if (fail) throw new Error('API fuera de servicio'); return []; } };
  const zoneRepository = { getAll: async () => [zone] };
  const view = await mount(() => useOrders(orderGateway, zoneRepository));
  try {
    assert.match(view.state.error ?? '', /API fuera de servicio/);
    fail = false;
    await act(async () => { await view.state.loadOrders(); });
    assert.equal(view.state.error, null);
  } finally { await view.close(); }
});
test('a stale zones request cannot overwrite a newer refresh', async () => {
  const first = deferred();
  let calls = 0;
  const repository = { getAll: () => ++calls === 1 ? first.promise : Promise.resolve([zone]) };
  const view = await mount(() => useZones(repository));
  try {
    await act(async () => { await view.state.loadZones(); });
    await act(async () => { first.resolve([]); await first.promise; });
    assert.deepEqual(view.state.zones, [zone]);
    assert.equal(view.state.isLoading, false);
  } finally { await view.close(); }
});
test('an in flight zones query cannot erase a successful registration', async () => {
  const first = deferred();
  const repository = { getAll: () => first.promise, create: async () => zone };
  const view = await mount(() => useZones(repository));
  try {
    await act(async () => { assert.equal(await view.state.createZone('Centro'), true); });
    await act(async () => { first.resolve([]); await first.promise; });
    assert.deepEqual(view.state.zones, [zone]);
  } finally { await view.close(); }
});
