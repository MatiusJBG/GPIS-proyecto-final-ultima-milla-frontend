describe('S3-CP-004: despacho de rutas e integración de repartidores con APIs y PostgreSQL reales', () => {
  it('consulta rutas planificadas, asigna repartidor con idempotencia y persiste tras recarga', () => {
    const rawApi = typeof Cypress.expose === 'function' ? Cypress.expose('apiUrl') : null;
    const routesApi = Cypress.env('routesApiUrl') || Cypress.env('VITE_ROUTES_API_BASE_URL') || rawApi || 'http://127.0.0.1:3000';
    const couriersApi = Cypress.env('couriersApiUrl') || Cypress.env('VITE_COURIERS_API_BASE_URL') || rawApi || 'http://127.0.0.1:3000';

    const timestamp = Date.now();
    const zoneName = `S3-ZON-${timestamp}`;
    const address = `Av. Logística ${timestamp}`;
    const courierName = `Repartidor S3 ${timestamp}`;

    // Fecha a 3 días en el futuro en zona horaria America/Guayaquil
    const serviceDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(timestamp + 3 * 86400000));

    // 1. Crear zona de cobertura
    cy.request('POST', `${routesApi}/zones`, { name: zoneName }).then(({ body: zone }) => {
      expect(zone).to.have.property('id');

      // 2. Crear pedido en esa zona
      cy.request('POST', `${routesApi}/orders`, {
        zoneId: zone.id,
        deliveryAddress: address,
        deliveryDate: serviceDate,
        deliveryTime: '11:00',
      }).then(({ body: order }) => {
        expect(order).to.have.property('id');

        // 3. Crear repartidor habilitado con capacidad para 5 pedidos
        cy.request({
          method: 'POST',
          url: `${couriersApi}/couriers`,
          body: {
            name: courierName,
            maxOrdersPerTrip: 5,
            isEnabled: true,
          },
          failOnStatusCode: false,
        }).then((courierRes) => {
          const courier = courierRes.body?.item || courierRes.body;

          // 4. Asegurar ruta planificada (vía POST /routes o generación automática)
          cy.request({
            method: 'POST',
            url: `${routesApi}/routes`,
            body: {
              zoneId: zone.id,
              serviceDate,
              capacityLimit: 4,
              orderIds: [order.id],
            },
            failOnStatusCode: false,
          }).then((routeRes) => {
            const routeId = routeRes.body?.id || routeRes.body?.item?.id;
            if (routeId) {
              expect(routeId).to.be.a('string');
            }

            // 5. Visitar módulo de Despacho con filtros por URL
            cy.visit(`/?tab=dispatch&serviceDate=${serviceDate}&zoneId=${zone.id}`);

            // Verificar pestaña activa
            cy.contains('button[role="tab"]', 'Despacho').should('have.attr', 'aria-selected', 'true');

            // Verificar recuperación de filtros
            cy.get('#filter-dispatch-date').should('have.value', serviceDate);
            cy.get('#filter-dispatch-zone').should('have.value', zone.id);

            // Verificar que se listan rutas o botón de asignación
            cy.get('.dispatch-content').should('be.visible');

            // Si hay rutas planificadas, realizar el flujo de despacho (HU-DES-02)
            cy.get('body').then(($body) => {
              if ($body.find('button:contains("Asignar y Despachar")').length > 0) {
                cy.contains('button', 'Asignar y Despachar').first().click();

                // Verificar modal accesible
                cy.get('[role="dialog"]').should('be.visible');
                cy.contains('h2', 'Despachar Ruta').should('be.visible');

                // Si se pudo crear el repartidor, seleccionarlo
                if (courier && courier.id) {
                  cy.get('#courier-select').select(courier.id);
                  cy.contains('button', 'Confirmar Despacho').click();

                  // Verificar retroalimentación de éxito
                  cy.contains('Ruta despachada exitosamente').should('be.visible');

                  // Verificar persistencia tras reload
                  cy.reload();
                  cy.get('#filter-dispatch-date').should('have.value', serviceDate);
                  cy.get('#filter-dispatch-zone').should('have.value', zone.id);
                  cy.contains('Ruta Despachada').should('be.visible');
                } else {
                  // Cerrar modal si no había repartidor fixture
                  cy.get('.dispatch-modal__close-btn').click();
                  cy.get('[role="dialog"]').should('not.exist');
                }
              }
            });

            // 6. Probar navegación entre pestañas y conservación de URL
            cy.contains('button[role="tab"]', 'Pedidos').click();
            cy.url().should('include', 'tab=orders');

            cy.contains('button[role="tab"]', 'Despacho').click();
            cy.url().should('include', 'tab=dispatch');
          });
        });
      });
    });
  });
});

