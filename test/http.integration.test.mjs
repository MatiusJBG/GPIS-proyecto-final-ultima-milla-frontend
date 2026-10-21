import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer as createHttpServer } from 'node:http';
import { URL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'vite';

let vite;
let server;
let client;
let HttpError;
let FetchHttpClient;
let baseUrl;
let zones;
let orders;
let reply;
let received;
const zone = { id: 'a0000000-0000-4000-8000-000000000001', name: 'Centro', createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z' };
const order = { id: 'b0000000-0000-4000-8000-000000000001', zoneId: zone.id, deliveryAddress: 'A', deliveryDate: '2099-10-20', deliveryTime: '14:30', status: 'pendiente', createdAt: zone.createdAt, updatedAt: zone.updatedAt };

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  server = createHttpServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    received = { url: request.url, method: request.method, contentType: request.headers['content-type'], body: body ? JSON.parse(body) : undefined };
    const current = reply;
    if (current.flushHeaders) {
      response.writeHead(current.status ?? 200, { 'Content-Type': 'application/json' });
      response.flushHeaders();
    }
    if (current.delay) await delay(current.delay);
    if (!current.flushHeaders) response.writeHead(current.status ?? 200, { 'Content-Type': current.type ?? 'application/json' });
    response.end(typeof current.body === 'string' ? current.body : JSON.stringify(current.body));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const http = await vite.ssrLoadModule('/src/shared/infrastructure/http/httpClient.ts');
  HttpError = http.HttpError;
  FetchHttpClient = http.FetchHttpClient;
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  client = new FetchHttpClient(baseUrl);
  const { HttpZoneRepository } = await vite.ssrLoadModule('/src/features/zones/infrastructure/http/httpZoneRepository.ts');
  const { HttpOrderGateway } = await vite.ssrLoadModule('/src/features/orders/infrastructure/http/httpOrderGateway.ts');
  zones = new HttpZoneRepository(client);
  orders = new HttpOrderGateway(client);
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await vite?.close();
});

test('GET /zones consumes the canonical items envelope', async () => {
  reply = { body: { items: [zone] } };
  assert.deepEqual(await zones.getAll(), [zone]);
});
test('GET /orders consumes the canonical items envelope', async () => {
  reply = { body: { items: [order] } };
  assert.deepEqual(await orders.getAll(), [order]);
});
test('valid empty lists stay empty', async () => {
  reply = { body: { items: [] } };
  assert.deepEqual(await zones.getAll(), []);
  assert.deepEqual(await orders.getAll(), []);
});
for (const body of [{ data: [] }, { items: null }, { items: [{}] }, null]) {
  test(`incompatible list payload fails explicitly: ${JSON.stringify(body)}`, async () => {
    reply = { body };
    await assert.rejects(zones.getAll(), /contrato/i);
    await assert.rejects(orders.getAll(), /contrato/i);
  });
}
for (const status of [404, 500, 503]) {
  test(`HTTP ${status} is never interpreted as an empty list`, async () => {
    reply = { status, body: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Servicio no disponible' } };
    const isExpected = error => error instanceof HttpError && error.status === status && error.message === 'Servicio no disponible';
    await assert.rejects(zones.getAll(), isExpected);
    await assert.rejects(orders.getAll(), isExpected);
  });
}
test('non JSON error preserves its HTTP status and body', async () => {
  reply = { status: 502, type: 'text/plain', body: 'Gateway unavailable' };
  await assert.rejects(client.get('/orders'), error => error instanceof HttpError && error.status === 502 && error.details === 'Gateway unavailable');
});
test('invalid JSON error preserves its HTTP status and body', async () => {
  reply = { status: 503, body: '{broken' };
  await assert.rejects(client.get('/orders'), error => error instanceof HttpError && error.status === 503 && error.details === '{broken');
});
test('POST sends JSON and only the registration fields', async () => {
  reply = { status: 201, body: order };
  assert.deepEqual(await orders.create({ ...order, status: 'entregado' }), order);
  assert.equal(received.contentType, 'application/json');
  assert.deepEqual(received.body, { zoneId: order.zoneId, deliveryAddress: 'A', deliveryDate: order.deliveryDate, deliveryTime: order.deliveryTime });
});
test('invalid creation response fails at the HTTP boundary', async () => {
  reply = { status: 201, body: { id: 'invalid' } };
  await assert.rejects(zones.create({ name: 'Centro' }), /contrato/i);
  await assert.rejects(orders.create(order), /contrato/i);
});
test('query filters use the API parameter names', async () => {
  reply = { body: { items: [] } };
  await orders.getAll({ deliveryDate: '2099-10-20', zoneId: zone.id });
  const url = new URL(received.url, 'http://localhost');
  assert.equal(url.searchParams.get('deliveryDate'), '2099-10-20');
  assert.equal(url.searchParams.get('zoneId'), zone.id);
});

test('slow requests time out instead of leaving the UI loading indefinitely', async () => {
  reply = { delay: 150, body: { items: [] } };
  const bounded = new FetchHttpClient(baseUrl, 20);
  await assert.rejects(bounded.get('/zones'), error => error instanceof HttpError && error.statusText === 'TimeoutError');
});

test('a timed out write reports an unknown outcome and is not retried', async () => {
  reply = { delay: 150, status: 201, body: order };
  let requests = 0;
  const listener = () => { ++requests; };
  server.on('request', listener);
  try {
    const bounded = new FetchHttpClient(baseUrl, 20);
    await assert.rejects(bounded.post('/orders', order), /confirmación.*listado/i);
    assert.equal(requests, 1);
  } finally { server.off('request', listener); }
});

for (const status of [201, 503]) {
  test(`timeout reading the POST body after HTTP ${status} preserves the unknown outcome warning`, async () => {
    reply = { flushHeaders: true, delay: 200, status, body: order };
    let requests = 0;
    const listener = () => { ++requests; };
    server.on('request', listener);
    try {
      const bounded = new FetchHttpClient(baseUrl, 60);
      await assert.rejects(bounded.post('/orders', order), error => error instanceof HttpError && error.statusText === 'TimeoutError' && /confirmación.*listado/i.test(error.message));
      assert.equal(requests, 1);
    } finally { server.off('request', listener); }
  });
}
