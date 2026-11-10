describe('S2-CP-004: detalle de pedido con API y PostgreSQL reales', () => {
  it('recupera filtros y detalle, vuelve al listado y muestra ausencia', () => {
    const api = Cypress.expose('apiUrl');
    const name = `S2-${Date.now()}`;
    const address = `Entrega ${name}`;
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() + 3 * 86400000));
    cy.request('POST', `${api}/zones`, { name }).then(({ body: zone }) => {
      cy.request('POST', `${api}/orders`, { zoneId: zone.id, deliveryAddress: address, deliveryDate: date, deliveryTime: '14:30' }).then(({ body: order }) => {
        cy.visit(`/?tab=orders&deliveryDate=${date}&zoneId=${zone.id}`);
        cy.contains('tr', address).contains('button', 'Ver detalle').click();
        cy.contains('Detalle del pedido').should('be.visible');
        cy.get('dl').should('contain', order.id).and('contain', address).and('contain', date).and('contain', '14:30').and('contain', order.status).and('contain', name);
        cy.reload();
        cy.get('dl').should('contain', order.id).and('contain', address);
        cy.contains('button', 'Volver al listado').click();
        cy.get('#filter-date').should('have.value', date);
        cy.get('#filter-zone').should('have.value', zone.id);
        cy.contains('tr', address).should('be.visible');
        cy.go('back');
        cy.get('dl').should('contain', order.id).and('contain', address);
        cy.go('forward');
        cy.get('#filter-date').should('have.value', date);
        cy.get('#filter-zone').should('have.value', zone.id);
        cy.visit(`/?tab=orders&deliveryDate=${date}&zoneId=${zone.id}&orderId=00000000-0000-4000-8000-000000000000`);
        cy.contains('Pedido no encontrado').should('be.visible');
        cy.get('dl').should('not.exist');
        cy.contains('button', 'Volver al listado').click();
        cy.get('#filter-date').should('have.value', date);
        cy.get('#filter-zone').should('have.value', zone.id);
        cy.visit(`/?tab=orders&deliveryDate=${date}&zoneId=${zone.id}&orderId=invalido`);
        cy.contains('No se pudo consultar el pedido').should('be.visible');
        cy.get('dl').should('not.exist');
      });
    });
  });
});
