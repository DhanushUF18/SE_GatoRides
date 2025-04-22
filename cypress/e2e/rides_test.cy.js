describe('Rides Component', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        token: 'fake-token',
        id: '1',
        name: 'Test User'
      }));
    });

    // Intercept API calls
    cy.intercept('POST', 'http://localhost:5001/user/rides', {
      statusCode: 200,
      body: {
        rides_offered: [{
          id: 1,
          pickup: { address: 'College Station' },
          dropoff: { address: 'Houston' },
          date: '2025-04-20T10:00:00',
          seats: 3,
          price: 25,
          status: 'active'
        }],
        rides_taken: [{
          id: 2,
          pickup: { address: 'Houston' },
          dropoff: { address: 'Austin' },
          date: '2025-04-21T15:00:00',
          driver_name: 'John Doe',
          price: 30,
          status: 'active'
        }]
      }
    }).as('getRides');

    cy.intercept('POST', 'http://localhost:5001/user/cancel-ride*', {
      statusCode: 200
    }).as('cancelRide');

    cy.intercept('POST', 'http://localhost:5001/user/cancel-booking*', {
      statusCode: 200
    }).as('cancelBooking');

    // Visit the rides page
    cy.visit('http://localhost:3000/rides');
  });

  it('displays rides offered and taken', () => {
    cy.wait('@getRides');
    
    // Check rides offered section
    cy.contains('h3', 'Rides Offered').should('be.visible');
    cy.contains('College Station').should('be.visible');
    cy.contains('Houston').should('be.visible');
    cy.contains('$25').should('be.visible');
    
    // Check rides taken section
    cy.contains('h3', 'Rides Taken').should('be.visible');
    cy.contains('Austin').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('$30').should('be.visible');
  });

  it('can cancel a ride as driver', () => {
    cy.wait('@getRides');
    
    // Find and click the cancel button in rides offered section
    cy.contains('tr', 'College Station')
      .find('button')
      .contains('Cancel Ride')
      .click();

    // Verify API call was made
    cy.wait('@cancelRide');
    cy.wait('@getRides');
    
    // Verify success alert
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Ride cancelled successfully!');
    });
  });

  it('can cancel a booking as passenger', () => {
    cy.wait('@getRides');
    
    // Find and click the cancel button in rides taken section
    cy.contains('tr', 'Austin')
      .find('button')
      .contains('Cancel')
      .click();

    // Verify API call was made
    cy.wait('@cancelBooking');
    
    // Verify success alert
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Booking cancelled successfully!');
    });
  });

  it('handles API errors gracefully', () => {
    // Override the rides API to return an error
    cy.intercept('POST', 'http://localhost:5001/user/rides', {
      forceNetworkError: true
    }).as('getRidesError');

    cy.visit('http://localhost:3000/rides');
    
    // Add a small delay to ensure the error state is set
    cy.wait(1000);
    
    // First, check if the error section exists
    cy.get('.bottom-section').should('exist');
    
    // Then check for the error message with more flexible matching
    cy.get('.error')
      .should('exist')
      .and('contain', 'Failed to fetch rides');
  });
});