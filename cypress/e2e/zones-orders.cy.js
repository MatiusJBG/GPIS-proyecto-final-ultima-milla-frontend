describe('CP-015: zonas y pedidos contra API y PostgreSQL reales', () => {
  it('registra, recarga y filtra un pedido persistido', () => {
    const zoneName = `E2E-${Date.now()}`;
    const address = `Entrega ${zoneName}`;
    // A future local day avoids time-zone boundaries and the SQL past-date rule.
    const tomorrow = new Date(Date.now() + 2 * 86_400_000);
    const calendar = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' });
    const deliveryDate = calendar.format(tomorrow);
    const otherDate = calendar.format(new Date(tomorrow.getTime() + 86_400_000));
    const apiUrl = Cypress.expose('apiUrl');
    cy.request(`${apiUrl}/health`).its('body.status').should('eq', 'ok');
    cy.intercept('POST', `${apiUrl}/zones`).as('createZone');
    cy.intercept('POST', `${apiUrl}/orders`).as('createOrder');
    cy.visit('/');
    cy.get('#zone-name-input').type(zoneName);
    cy.contains('button', 'Crear Zona').click();
    cy.wait('@createZone').its('response.statusCode').should('eq', 201);
    cy.reload();
    cy.contains(zoneName).should('be.visible');
    cy.contains('button', 'Pedidos (HU-PED-01)').click();
    cy.get('#order-zone-select').select(zoneName);
    cy.get('#order-address-input').type(address);
    cy.get('#order-date-input').type(deliveryDate);
    cy.get('#order-time-input').type('14:30');
    cy.contains('button', 'Crear Pedido').click();
    cy.wait('@createOrder').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      expect(response.body.status).to.eq('pendiente');
      cy.task('recordAcceptance', { case: 'CP-015', zoneName, address, deliveryDate, deliveryTime: '14:30', orderId: response.body.id, zoneId: response.body.zoneId, expectedStatus: 'pendiente', actualStatus: response.body.status });
      cy.request(`${apiUrl}/orders/${response.body.id}`).its('body.deliveryAddress').should('eq', address);
    });
    cy.reload();
    cy.contains('button', 'Pedidos (HU-PED-01)').click();
    cy.get('table').contains(address).should('be.visible');
    cy.get('#filter-zone').select(zoneName);
    cy.get('#filter-date').type(deliveryDate);
    cy.contains('button', /^Filtrar$/).click();
    cy.get('table').contains(address).should('be.visible');
    cy.get('#filter-date').clear().type(otherDate);
    cy.contains('button', /^Filtrar$/).click();
    cy.contains('No hay pedidos registrados').should('be.visible');
    cy.contains('button', 'Limpiar filtros').click();
    cy.get('table').contains(address).should('be.visible');
  });

  it('muestra el error de validación de una zona vacía', () => {
    cy.visit('/');
    cy.contains('button', 'Crear Zona').click();
    cy.contains('El nombre de la zona no puede estar vacío').should('be.visible');
  });
});
