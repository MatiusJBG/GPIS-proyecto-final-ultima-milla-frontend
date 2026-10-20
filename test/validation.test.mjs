import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let vite;
let validateOrder;
let validateZoneName;
const input = { zoneId: 'a0000000-0000-4000-8000-000000000001', deliveryAddress: 'A', deliveryDate: '2099-10-20', deliveryTime: '14:30' };
before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ validateOrder } = await vite.ssrLoadModule('/src/features/orders/domain/order.ts'));
  ({ validateZoneName } = await vite.ssrLoadModule('/src/features/zones/domain/zone.ts'));
});
after(async () => { await vite?.close(); });
test('client accepts nonempty text allowed by the API without invented length limits', () => {
  assert.equal(validateZoneName('A').isValid, true);
  assert.equal(validateZoneName('A'.repeat(60)).isValid, true);
  assert.equal(validateOrder(input).isValid, true);
  assert.equal(validateOrder({ ...input, deliveryAddress: 'A'.repeat(160) }).isValid, true);
});
for (const deliveryDate of ['2026-02-30', '2025-02-29', '0000-01-01', '2026-13-01']) {
  test(`rejects impossible calendar date ${deliveryDate}`, () => {
    assert.equal(validateOrder({ ...input, deliveryAddress: 'Av. Principal 123', deliveryDate }).isValid, false);
  });
}
test('accepts leap day and rejects empty inputs, malformed UUID and invalid time', () => {
  assert.equal(validateOrder({ ...input, deliveryDate: '2028-02-29' }).isValid, true);
  assert.equal(validateOrder({ ...input, zoneId: 'not-a-uuid' }).isValid, false);
  assert.equal(validateOrder({ ...input, deliveryTime: '24:00' }).isValid, false);
  assert.equal(validateOrder({ ...input, deliveryAddress: ' ' }).isValid, false);
  assert.equal(validateZoneName(' ').isValid, false);
});
