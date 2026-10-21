import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { act, createElement, useMemo } from 'react';

let vite;
let dom;
let createRoot;
let useZones;
let useOrders;
let OrderManagementView;
let ZoneManagementView;
let App;
let Alert;
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
  let zoneModule, orderModule, zoneView, orderView;
  ({ useZones: zoneModule } = await vite.ssrLoadModule('/src/features/zones/presentation/hooks/useZones.ts'));
  ({ useOrders: orderModule } = await vite.ssrLoadModule('/src/features/orders/presentation/hooks/useOrders.ts'));
  ({ OrderManagementView: orderView } = await vite.ssrLoadModule('/src/features/orders/presentation/components/OrderManagementView.tsx'));
  ({ ZoneManagementView: zoneView } = await vite.ssrLoadModule('/src/features/zones/presentation/components/ZoneManagementView.tsx'));
  ({ App } = await vite.ssrLoadModule('/src/bootstrap/app.tsx'));
  ({ Alert } = await vite.ssrLoadModule('/src/shared/ui/Alert/Alert.tsx'));
  const { composeZoneUseCases, composeOrderUseCases } = await vite.ssrLoadModule('/src/bootstrap/compose-use-cases.ts');
  useZones = repository => zoneModule(useMemo(() => composeZoneUseCases(repository), [repository]));
  useOrders = (gateway, repository) => orderModule(useMemo(() => composeOrderUseCases(gateway, repository), [gateway, repository]));
  ZoneManagementView = ({ repository }) => createElement(zoneView, { useCases: useMemo(() => composeZoneUseCases(repository), [repository]) });
  OrderManagementView = ({ orderGateway, zoneRepository }) => createElement(orderView, { useCases: useMemo(() => composeOrderUseCases(orderGateway, zoneRepository), [orderGateway, zoneRepository]) });

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

const orderInput = { zoneId: zone.id, deliveryAddress: 'Entrega Centro', deliveryDate: '2099-10-20', deliveryTime: '14:30' };
const persistedOrder = { ...orderInput, id: 'b0000000-0000-4000-8000-000000000001', status: 'pendiente', createdAt: zone.createdAt, updatedAt: zone.updatedAt };

test('successful order registration preserves active filters and does not duplicate the new item', async () => {
  const gateway = { getAll: async () => [], create: async () => persistedOrder };
  const repository = { getAll: async () => [zone] };
  const view = await mount(() => useOrders(gateway, repository));
  try {
    await act(async () => { view.state.setFilters({ zoneId: zone.id, deliveryDate: orderInput.deliveryDate }); });
    await act(async () => { assert.equal(await view.state.createOrder(orderInput), true); });
    assert.equal(view.state.orders[0].zoneName, zone.name);
    await act(async () => { assert.equal(await view.state.createOrder(orderInput), true); });
    assert.equal(view.state.orders.length, 1);
    await act(async () => { view.state.clearFeedback(); });
    assert.equal(view.state.successMessage, null);
    await act(async () => { view.state.setFilters({ deliveryDate: '2099-10-21' }); });
    await act(async () => { assert.equal(await view.state.createOrder(orderInput), true); });
    assert.equal(view.state.orders.length, 0);
  } finally { await view.close(); }
});

test('an unconfirmed order write keeps the existing list and never reports success', async () => {
  const gateway = { getAll: async () => [persistedOrder], create: async () => { throw new Error('Consulta el listado antes de volver a registrar'); } };
  const repository = { getAll: async () => [zone] };
  const view = await mount(() => useOrders(gateway, repository));
  try {
    await act(async () => { assert.equal(await view.state.createOrder(orderInput), false); });
    assert.equal(view.state.orders.length, 1);
    assert.equal(view.state.successMessage, null);
    assert.equal(view.state.isSubmitting, false);
    assert.match(view.state.error, /Consulta el listado/);
  } finally { await view.close(); }
});

test('bootstrap connects both navigation screens to the configured HTTP adapters', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    return new globalThis.Response(JSON.stringify({ items: String(url).endsWith('/zones') ? [zone] : [] }), { headers: { 'content-type': 'application/json' } });
  };
  let view;
  try {
    view = await mount(() => null, () => createElement(App));
    assert.match(view.container.querySelector('table').textContent, /Centro/);
    const orders = [...view.container.querySelectorAll('[role="tab"]')].find(button => button.textContent.includes('Pedidos'));
    await act(async () => { orders.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
    assert.equal(orders.getAttribute('aria-selected'), 'true');
    assert.match(view.container.textContent, /No hay pedidos registrados/);
    assert.ok(calls.some(url => url.endsWith('/zones')));
    assert.ok(calls.some(url => url.endsWith('/orders')));
  } finally { await view?.close(); globalThis.fetch = originalFetch; }
});

test('zones screen announces a pending query and then renders the persisted zone', async () => {
  const pending = deferred();
  const repository = { getAll: () => pending.promise };
  const view = await mount(() => null, () => createElement(ZoneManagementView, { repository }));
  try {
    assert.match(view.container.querySelector('output').textContent, /Cargando|Obteniendo/);
    assert.doesNotMatch(view.container.textContent, /No hay zonas registradas/);
    await act(async () => { pending.resolve([zone]); await pending.promise; });
    assert.match(view.container.querySelector('table').textContent, /Centro/);
  } finally { await view.close(); }
});

test('success feedback uses a live output and its close action is accessible', async () => {
  let closed = false;
  const view = await mount(() => null, () => createElement(Alert, { type: 'success', title: 'Registro confirmado', onClose: () => { closed = true; } }, 'Pedido guardado'));
  try {
    assert.match(view.container.querySelector('output[aria-live="polite"]').textContent, /Pedido guardado/);
    await act(async () => { view.container.querySelector('[aria-label="Cerrar notificación"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
    assert.equal(closed, true);
  } finally { await view.close(); }
});

test('an empty order form displays required-field errors without persisting an order', async () => {
  let writes = 0;
  const orderGateway = { getAll: async () => [], create: async () => { ++writes; return persistedOrder; } };
  const zoneRepository = { getAll: async () => [zone] };
  const view = await mount(() => null, () => createElement(OrderManagementView, { orderGateway, zoneRepository }));
  try {
    await act(async () => { view.container.querySelector('.orders-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); });
    assert.equal(writes, 0);
    assert.ok(view.container.querySelectorAll('[aria-invalid="true"]').length >= 3);
    assert.match(view.container.textContent, /dirección|Dirección/);
  } finally { await view.close(); }
});
