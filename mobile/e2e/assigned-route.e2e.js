const courierId = process.env.MOBILE_DEMO_COURIER_ID;
const apiUrl = process.env.MOBILE_COURIERS_API_URL || 'http://10.0.2.2:3012';

if (!courierId) {
  throw new Error('MOBILE_DEMO_COURIER_ID debe identificar un repartidor fixture con ruta asignada.');
}

describe('Ruta asignada del repartidor', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true, delete: true});
  });

  it('consulta y muestra las paradas ordenadas desde la API de Couriers', async () => {
    await element(by.id('api-url-input')).replaceText(apiUrl);
    await element(by.id('courier-id-input')).replaceText(courierId);
    await element(by.id('load-route-button')).tap();

    await expect(element(by.id('assigned-route-result'))).toBeVisible();
    await expect(element(by.id('route-stops-heading'))).toBeVisible();
  });
});
